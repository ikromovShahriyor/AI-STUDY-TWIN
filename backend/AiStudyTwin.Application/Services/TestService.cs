using System.Text.Json;
using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Domain.Entities;
using AiStudyTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Application.Services;

public class TestService
{
    private readonly IAppDbContext _db;
    private readonly IAiProviderService _aiProvider;

    public TestService(IAppDbContext db, IAiProviderService aiProvider)
    {
        _db = db;
        _aiProvider = aiProvider;
    }

    public async Task<List<TestDto>> GetTestsAsync(Guid? subjectId = null, bool? isDiagnostic = null, CancellationToken cancellationToken = default)
    {
        var query = _db.Tests
            .Include(t => t.Subject)
            .Include(t => t.Topic)
            .Include(t => t.Questions)
                .ThenInclude(q => q.Answers)
            .AsQueryable();

        if (subjectId.HasValue) query = query.Where(t => t.SubjectId == subjectId.Value);
        if (isDiagnostic.HasValue) query = query.Where(t => t.IsDiagnostic == isDiagnostic.Value);

        var tests = await query.OrderBy(t => t.Title).ToListAsync(cancellationToken);

        return tests.Select(MapToTestDto).ToList();
    }

    public async Task<TestDto> GetTestByIdAsync(Guid testId, CancellationToken cancellationToken = default)
    {
        var test = await _db.Tests
            .Include(t => t.Subject)
            .Include(t => t.Topic)
            .Include(t => t.Questions)
                .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(t => t.Id == testId, cancellationToken);

        if (test == null) throw new NotFoundException("Test", testId);

        return MapToTestDto(test);
    }

    public async Task<TestResultDto> SubmitTestAsync(Guid studentProfileId, SubmitTestRequest request, CancellationToken cancellationToken = default)
    {
        var test = await _db.Tests
            .Include(t => t.Subject)
            .Include(t => t.Questions)
                .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(t => t.Id == request.TestId, cancellationToken);

        if (test == null) throw new NotFoundException("Test", request.TestId);

        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(p => p.Id == studentProfileId, cancellationToken);
        if (profile == null) throw new NotFoundException("Talaba", studentProfileId);

        int totalPossibleScore = test.Questions.Sum(q => q.Points);
        int earnedScore = 0;
        var weakAreas = new List<string>();
        var strongAreas = new List<string>();
        var submissions = new List<TestAnswerSubmission>();
        var detailedResults = new List<DetailedAnswerResultDto>();

        foreach (var q in test.Questions)
        {
            var userSub = request.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
            var correctAnswer = q.Answers.FirstOrDefault(a => a.IsCorrect);
            var selectedAnswer = userSub?.SelectedAnswerId.HasValue == true
                ? q.Answers.FirstOrDefault(a => a.Id == userSub.SelectedAnswerId.Value)
                : null;

            bool isCorrect = selectedAnswer != null && selectedAnswer.IsCorrect;
            if (isCorrect)
            {
                earnedScore += q.Points;
                strongAreas.Add(q.QuestionText);
            }
            else
            {
                weakAreas.Add(q.QuestionText);
            }

            var submission = new TestAnswerSubmission
            {
                QuestionId = q.Id,
                SelectedAnswerId = selectedAnswer?.Id,
                IsCorrect = isCorrect
            };
            submissions.Add(submission);

            detailedResults.Add(new DetailedAnswerResultDto(
                q.Id,
                q.QuestionText,
                q.CodeSnippet,
                q.Explanation,
                selectedAnswer?.Id,
                selectedAnswer?.AnswerText,
                correctAnswer?.Id ?? Guid.Empty,
                correctAnswer?.AnswerText ?? "Noma'lum",
                isCorrect,
                isCorrect ? q.Points : 0
            ));
        }

        double percentage = totalPossibleScore > 0 ? Math.Round((double)earnedScore / totalPossibleScore * 100, 1) : 0;
        bool passed = percentage >= test.PassingScore;
        int xpEarned = passed ? test.XpReward + (int)(percentage / 2) : 20;

        // Formulate AI feedback
        string aiFeedback = passed
            ? $"Ajoyib natija! Siz {percentage}% to'pladingiz va ushbu mavzuni yaxshi o'zlashtirgansiz."
            : $"Natija {percentage}%. Qayta ko'rib chiqish tavsiya etiladi. Xatolar tahlilini ko'ring.";

        var testResult = new TestResult
        {
            StudentProfileId = studentProfileId,
            TestId = test.Id,
            Score = earnedScore,
            TotalPossibleScore = totalPossibleScore,
            Percentage = percentage,
            TimeSpentSeconds = request.TimeSpentSeconds,
            Passed = passed,
            XpEarned = xpEarned,
            CompletedAt = DateTime.UtcNow,
            AiFeedback = aiFeedback,
            WeakAreasJson = JsonSerializer.Serialize(weakAreas.Take(3)),
            StrongAreasJson = JsonSerializer.Serialize(strongAreas.Take(3)),
            Submissions = submissions
        };

        _db.TestResults.Add(testResult);

        // Update student XP, level, activity
        profile.TotalXp += xpEarned;
        profile.Level = (profile.TotalXp / 200) + 1;
        profile.LastActivityDate = DateTime.UtcNow;

        // If diagnostic test, update student knowledge level
        if (test.IsDiagnostic)
        {
            if (percentage >= 85) profile.KnowledgeLevel = KnowledgeLevel.Advanced;
            else if (percentage >= 65) profile.KnowledgeLevel = KnowledgeLevel.Intermediate;
            else if (percentage >= 40) profile.KnowledgeLevel = KnowledgeLevel.Elementary;
            else profile.KnowledgeLevel = KnowledgeLevel.Beginner;
        }

        // Update progress on subject
        var progress = await _db.Progresses.FirstOrDefaultAsync(p => p.StudentProfileId == studentProfileId && p.SubjectId == test.SubjectId, cancellationToken);
        if (progress == null)
        {
            progress = new Progress
            {
                StudentProfileId = studentProfileId,
                SubjectId = test.SubjectId,
                MasteryPercentage = percentage,
                TotalTestsTaken = 1,
                TotalTasksCompleted = 0,
                TotalMinutesStudied = Math.Max(5, request.TimeSpentSeconds / 60),
                LastStudiedAt = DateTime.UtcNow
            };
            _db.Progresses.Add(progress);
        }
        else
        {
            progress.TotalTestsTaken++;
            progress.MasteryPercentage = Math.Round((progress.MasteryPercentage * 0.6) + (percentage * 0.4), 1);
            progress.TotalMinutesStudied += Math.Max(1, request.TimeSpentSeconds / 60);
            progress.LastStudiedAt = DateTime.UtcNow;
        }

        // Update challenge progress
        var testChallenge = await _db.StudentDailyChallenges
            .Include(c => c.DailyChallenge)
            .FirstOrDefaultAsync(c => c.StudentProfileId == studentProfileId && c.Date == DateTime.UtcNow.Date && c.DailyChallenge.ChallengeType == ChallengeType.TakeTest, cancellationToken);

        if (testChallenge != null && !testChallenge.IsCompleted)
        {
            testChallenge.CurrentCount++;
            if (testChallenge.CurrentCount >= testChallenge.DailyChallenge.TargetCount)
            {
                testChallenge.IsCompleted = true;
                testChallenge.CompletedAt = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync(cancellationToken);

        return new TestResultDto(
            testResult.Id,
            test.Id,
            test.Title,
            test.Subject.NameUz,
            earnedScore,
            totalPossibleScore,
            percentage,
            request.TimeSpentSeconds,
            passed,
            xpEarned,
            testResult.CompletedAt,
            aiFeedback,
            weakAreas,
            strongAreas,
            detailedResults
        );
    }

    public async Task<TestResultDto> GetResultByIdAsync(Guid resultId, CancellationToken cancellationToken = default)
    {
        var result = await _db.TestResults
            .Include(r => r.Test)
                .ThenInclude(t => t.Subject)
            .Include(r => r.Submissions)
                .ThenInclude(s => s.Question)
                    .ThenInclude(q => q.Answers)
            .Include(r => r.Submissions)
                .ThenInclude(s => s.SelectedAnswer)
            .FirstOrDefaultAsync(r => r.Id == resultId, cancellationToken);

        if (result == null) throw new NotFoundException("Test natijasi", resultId);

        var detailedResults = result.Submissions.Select(s =>
        {
            var correct = s.Question.Answers.FirstOrDefault(a => a.IsCorrect);
            return new DetailedAnswerResultDto(
                s.QuestionId,
                s.Question.QuestionText,
                s.Question.CodeSnippet,
                s.Question.Explanation,
                s.SelectedAnswerId,
                s.SelectedAnswer?.AnswerText,
                correct?.Id ?? Guid.Empty,
                correct?.AnswerText ?? "Noma'lum",
                s.IsCorrect,
                s.IsCorrect ? s.Question.Points : 0
            );
        }).ToList();

        var weakAreas = !string.IsNullOrEmpty(result.WeakAreasJson)
            ? JsonSerializer.Deserialize<List<string>>(result.WeakAreasJson) ?? new List<string>()
            : new List<string>();

        var strongAreas = !string.IsNullOrEmpty(result.StrongAreasJson)
            ? JsonSerializer.Deserialize<List<string>>(result.StrongAreasJson) ?? new List<string>()
            : new List<string>();

        return new TestResultDto(
            result.Id,
            result.TestId,
            result.Test.Title,
            result.Test.Subject.NameUz,
            result.Score,
            result.TotalPossibleScore,
            result.Percentage,
            result.TimeSpentSeconds,
            result.Passed,
            result.XpEarned,
            result.CompletedAt,
            result.AiFeedback,
            weakAreas,
            strongAreas,
            detailedResults
        );
    }

    private static TestDto MapToTestDto(Test test)
    {
        var questionsDto = test.Questions
            .OrderBy(q => q.OrderIndex)
            .Select(q => new QuestionDto(
                q.Id,
                q.TestId,
                q.QuestionText,
                q.CodeSnippet,
                q.Points,
                q.QuestionType,
                q.OrderIndex,
                q.Answers.OrderBy(a => a.OrderIndex).Select(a => new AnswerOptionDto(a.Id, a.QuestionId, a.AnswerText, a.OrderIndex)).ToList()
            )).ToList();

        return new TestDto(
            test.Id,
            test.SubjectId,
            test.Subject.NameUz,
            test.Subject.Icon,
            test.Subject.GradientColor,
            test.TopicId,
            test.Topic?.TitleUz,
            test.Title,
            test.Description,
            test.Difficulty,
            test.DurationMinutes,
            test.TotalQuestions,
            test.PassingScore,
            test.IsDiagnostic,
            test.XpReward,
            questionsDto
        );
    }
}
