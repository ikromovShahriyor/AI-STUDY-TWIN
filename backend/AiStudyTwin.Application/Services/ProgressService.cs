using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Application.Services;

public class ProgressService
{
    private readonly IAppDbContext _db;

    public ProgressService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(Guid studentProfileId, CancellationToken cancellationToken = default)
    {
        var profile = await _db.StudentProfiles
            .Include(p => p.ProgressList)
                .ThenInclude(pr => pr.Subject)
            .FirstOrDefaultAsync(p => p.Id == studentProfileId, cancellationToken);

        if (profile == null) throw new NotFoundException("Talaba", studentProfileId);

        // Get subjects progress
        var allSubjects = await _db.Subjects.Where(s => s.IsActive).OrderBy(s => s.OrderIndex).ToListAsync(cancellationToken);
        var subjectProgresses = allSubjects.Select(s =>
        {
            var p = profile.ProgressList.FirstOrDefault(pr => pr.SubjectId == s.Id);
            return new SubjectProgressDto(
                s.Id,
                s.NameUz,
                s.Code,
                s.Icon,
                s.GradientColor,
                p?.MasteryPercentage ?? 0,
                p?.TotalTestsTaken ?? 0,
                p?.TotalTasksCompleted ?? 0,
                p?.TotalMinutesStudied ?? 0,
                p?.LastStudiedAt
            );
        }).ToList();

        // Get today's tasks
        var today = DateTime.UtcNow.Date;
        var todayTasksEntities = await _db.StudyTasks
            .Include(t => t.StudyPlan)
            .Include(t => t.Topic)
                .ThenInclude(tp => tp!.Subject)
            .Where(t => t.StudyPlan.StudentProfileId == studentProfileId && t.TaskDate == today)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        var todayTasks = todayTasksEntities.Select(t => new StudyTaskDto(
            t.Id,
            t.StudyPlanId,
            t.TopicId,
            t.Topic?.TitleUz,
            t.Topic?.Subject?.NameUz,
            t.Topic?.Subject?.GradientColor,
            t.Title,
            t.Description,
            t.TaskDate,
            t.Status,
            t.DurationMinutes,
            t.XpReward,
            t.CompletedAt
        )).ToList();

        int todayCompleted = todayTasks.Count(t => t.Status == StudyTaskStatus.Completed);

        // Recent tests
        var recentTestEntities = await _db.TestResults
            .Include(r => r.Test)
                .ThenInclude(t => t.Subject)
            .Where(r => r.StudentProfileId == studentProfileId)
            .OrderByDescending(r => r.CompletedAt)
            .Take(5)
            .ToListAsync(cancellationToken);

        var recentTests = recentTestEntities.Select(r => new RecentTestResultSnippetDto(
            r.Id,
            r.Test.Title,
            r.Test.Subject.NameUz,
            r.Percentage,
            r.Score,
            r.TotalPossibleScore,
            r.Passed,
            r.CompletedAt
        )).ToList();

        int totalMinutes = profile.ProgressList.Sum(p => p.TotalMinutesStudied);
        int totalTasks = profile.ProgressList.Sum(p => p.TotalTasksCompleted) + todayCompleted;
        int totalTests = profile.ProgressList.Sum(p => p.TotalTestsTaken);
        double avgScore = recentTestEntities.Any() ? Math.Round(recentTestEntities.Average(r => r.Percentage), 1) : 0;

        string advice = profile.KnowledgeLevel switch
        {
            KnowledgeLevel.Beginner => "Boshlang'ich darslarni muntazam bajaring va kundalik 30 daqiqa vaqt ajrating.",
            KnowledgeLevel.Elementary => "Yaxshi o'sish! Endi qiyinroq testlarni yechishga urinib ko'ring.",
            KnowledgeLevel.Intermediate => "Ajoyib natijalar! Murakkab loyihalar va amaliy topshiriqlarga e'tibor bering.",
            KnowledgeLevel.Advanced => "Yuqori daraja! O'z bilimlaringizni sinovdan o'tkazishda davom eting.",
            _ => "O'qishda davom eting!"
        };

        return new DashboardStatsDto(
            totalMinutes,
            totalTasks,
            totalTests,
            profile.CurrentStreak,
            profile.BestStreak,
            profile.TotalXp,
            profile.Level,
            avgScore,
            todayCompleted,
            todayTasks.Count,
            subjectProgresses,
            todayTasks,
            recentTests,
            advice
        );
    }
}
