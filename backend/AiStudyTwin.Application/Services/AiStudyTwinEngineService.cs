using System.Text.Json;
using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Domain.Entities;
using AiStudyTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Application.Services;

public class AiStudyTwinEngineService
{
    private readonly IAppDbContext _db;
    private readonly IAiProviderService _aiProvider;

    public AiStudyTwinEngineService(IAppDbContext db, IAiProviderService aiProvider)
    {
        _db = db;
        _aiProvider = aiProvider;
    }

    public async Task<AiAnalysisDto> GetOrGenerateAnalysisAsync(Guid studentProfileId, CancellationToken cancellationToken = default)
    {
        var profile = await _db.StudentProfiles
            .Include(p => p.User)
            .Include(p => p.TestResults)
                .ThenInclude(tr => tr.Test)
                    .ThenInclude(t => t.Subject)
            .Include(p => p.ProgressList)
                .ThenInclude(pr => pr.Subject)
            .FirstOrDefaultAsync(p => p.Id == studentProfileId, cancellationToken);

        if (profile == null) throw new NotFoundException("Talaba", studentProfileId);

        var latestAnalysis = await _db.AiAnalyses
            .Where(a => a.StudentProfileId == studentProfileId)
            .OrderByDescending(a => a.AnalyzedAt)
            .FirstOrDefaultAsync(cancellationToken);

        // If analysis is fresh (less than 1 day old), return cached
        if (latestAnalysis != null && latestAnalysis.AnalyzedAt > DateTime.UtcNow.AddHours(-12))
        {
            return MapAnalysisDto(latestAnalysis);
        }

        // Calculate dynamic strengths and weaknesses
        var strengths = new List<string>();
        var weaknesses = new List<string>();
        var recommendations = new List<string>();
        var nextLessons = new List<NextLessonRecommendationDto>();

        foreach (var pr in profile.ProgressList)
        {
            if (pr.MasteryPercentage >= 70)
            {
                strengths.Add($"{pr.Subject.NameUz} ({pr.MasteryPercentage}% o'zlashtirish)");
            }
            else if (pr.MasteryPercentage < 50 && pr.TotalTestsTaken > 0)
            {
                weaknesses.Add($"{pr.Subject.NameUz} ({pr.MasteryPercentage}% - qo'shimcha mashq kerak)");
            }
        }

        if (!strengths.Any())
        {
            strengths.Add("Boshlang'ich qiziqish va muntazam o'rganish ishtiyoqi");
            strengths.Add("Kunlik darslarni rejalashtirish qobiliyati");
        }

        if (!weaknesses.Any())
        {
            weaknesses.Add("Murakkab algoritmik va mantiqiy masalalar");
            weaknesses.Add("Tezkor test yechish ko'nikmasi");
        }

        recommendations.Add("Kuniga 30-45 daqiqa vaqt ajratib, o'quv rejasidagi topshiriqlarni izchil bajaring.");
        recommendations.Add("Har bir o'rganilgan mavzudan so'ng 5 ta savoldan iborat mini-test yeching.");
        recommendations.Add("Tushunarsiz formulalar va algoritmlarni AI Chat orqali vizual tushuntirishni so'rang.");

        // Suggested next lessons from available subjects
        var subjects = await _db.Subjects.Include(s => s.Topics).Take(3).ToListAsync(cancellationToken);
        int priority = 1;
        foreach (var sub in subjects)
        {
            var topic = sub.Topics.FirstOrDefault();
            if (topic != null)
            {
                nextLessons.Add(new NextLessonRecommendationDto(
                    sub.NameUz,
                    topic.TitleUz,
                    $"{sub.NameUz} bo'yicha fundamental bilimlarni mustahkamlash uchun tavsiya etiladi",
                    priority++,
                    topic.EstimatedMinutes
                ));
            }
        }

        string summary = $"Talaba hozirda {profile.KnowledgeLevel} darajasida. Umumiy to'plangan XP: {profile.TotalXp}, faollik: {profile.CurrentStreak} kunlik streak. O'rganish tezligi yaxshi.";

        var newAnalysis = new AiAnalysis
        {
            StudentProfileId = studentProfileId,
            OverallLevel = profile.KnowledgeLevel,
            StrengthsJson = JsonSerializer.Serialize(strengths),
            WeaknessesJson = JsonSerializer.Serialize(weaknesses),
            RecommendationsJson = JsonSerializer.Serialize(recommendations),
            NextLessonsJson = JsonSerializer.Serialize(nextLessons),
            Summary = summary,
            AnalyzedAt = DateTime.UtcNow
        };

        _db.AiAnalyses.Add(newAnalysis);
        await _db.SaveChangesAsync(cancellationToken);

        return MapAnalysisDto(newAnalysis);
    }

    public async Task<ErrorExplanationDto> ExplainErrorAsync(Guid studentProfileId, ExplainErrorRequest request, CancellationToken cancellationToken = default)
    {
        var testResult = await _db.TestResults
            .Include(tr => tr.Submissions)
                .ThenInclude(s => s.Question)
                    .ThenInclude(q => q.Answers)
            .Include(tr => tr.Submissions)
                .ThenInclude(s => s.SelectedAnswer)
            .FirstOrDefaultAsync(tr => tr.Id == request.TestResultId && tr.StudentProfileId == studentProfileId, cancellationToken);

        if (testResult == null) throw new NotFoundException("Test natijasi", request.TestResultId);

        var submission = testResult.Submissions.FirstOrDefault(s => s.QuestionId == request.QuestionId);
        if (submission == null) throw new NotFoundException("Savol javobi", request.QuestionId);

        var question = submission.Question;
        var correctAnswer = question.Answers.FirstOrDefault(a => a.IsCorrect);
        var studentAnswer = submission.SelectedAnswer?.AnswerText ?? "Javob berilmagan";

        // Call AI
        string aiExplanation = await _aiProvider.AnalyzeMistakeAsync(
            question.QuestionText,
            studentAnswer,
            correctAnswer?.AnswerText ?? "Noma'lum",
            question.Explanation,
            request.Language,
            cancellationToken
        );

        var steps = new List<string>
        {
            "Mavzuga oid qoida va formulalarni qayta o'qib chiqing.",
            "Shu turdagi 2-3 ta o'xshash misollarni tahlil qiling.",
            "AI Chat'dan ushbu savolni bosqichma-bosqich yechimini so'rang."
        };

        return new ErrorExplanationDto(
            question.Id,
            question.QuestionText,
            studentAnswer,
            correctAnswer?.AnswerText ?? "Noma'lum",
            question.Explanation,
            aiExplanation,
            steps
        );
    }

    private static AiAnalysisDto MapAnalysisDto(AiAnalysis a)
    {
        var strengths = !string.IsNullOrEmpty(a.StrengthsJson) ? JsonSerializer.Deserialize<List<string>>(a.StrengthsJson) ?? new() : new();
        var weaknesses = !string.IsNullOrEmpty(a.WeaknessesJson) ? JsonSerializer.Deserialize<List<string>>(a.WeaknessesJson) ?? new() : new();
        var recommendations = !string.IsNullOrEmpty(a.RecommendationsJson) ? JsonSerializer.Deserialize<List<string>>(a.RecommendationsJson) ?? new() : new();
        var nextLessons = !string.IsNullOrEmpty(a.NextLessonsJson) ? JsonSerializer.Deserialize<List<NextLessonRecommendationDto>>(a.NextLessonsJson) ?? new() : new();

        return new AiAnalysisDto(
            a.Id,
            a.StudentProfileId,
            a.OverallLevel,
            strengths,
            weaknesses,
            recommendations,
            nextLessons,
            a.Summary,
            a.AnalyzedAt
        );
    }
}
