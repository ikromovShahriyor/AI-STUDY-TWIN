using System.Text.Json;
using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Domain.Entities;
using AiStudyTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Application.Services;

public class StudyPlanService
{
    private readonly IAppDbContext _db;
    private readonly IAiProviderService _aiProvider;

    public StudyPlanService(IAppDbContext db, IAiProviderService aiProvider)
    {
        _db = db;
        _aiProvider = aiProvider;
    }

    public async Task<StudyPlanDto?> GetActivePlanAsync(Guid studentProfileId, CancellationToken cancellationToken = default)
    {
        var plan = await _db.StudyPlans
            .Include(p => p.Tasks)
                .ThenInclude(t => t.Topic)
                    .ThenInclude(tp => tp!.Subject)
            .Where(p => p.StudentProfileId == studentProfileId && p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (plan == null) return null;

        return MapToDto(plan);
    }

    public async Task<StudyPlanDto> CreateManualPlanAsync(Guid studentProfileId, CreateStudyPlanRequest request, CancellationToken cancellationToken = default)
    {
        var activePlans = await _db.StudyPlans
            .Where(p => p.StudentProfileId == studentProfileId && p.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var p in activePlans) p.IsActive = false;

        var plan = new StudyPlan
        {
            StudentProfileId = studentProfileId,
            Title = request.Title,
            Description = request.Description,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(request.DurationDays),
            IsActive = true,
            GoalSummary = request.GoalSummary
        };

        _db.StudyPlans.Add(plan);
        await _db.SaveChangesAsync(cancellationToken);

        return MapToDto(plan);
    }

    public async Task<StudyPlanDto> GenerateAiPlanAsync(Guid studentProfileId, GenerateAiPlanRequest request, CancellationToken cancellationToken = default)
    {
        var profile = await _db.StudentProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == studentProfileId, cancellationToken);

        if (profile == null) throw new NotFoundException("Talaba profili", studentProfileId);

        var subjects = await _db.Subjects
            .Include(s => s.Topics)
            .Where(s => request.SubjectIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        var subjectNames = subjects.Select(s => s.NameUz).ToList();
        if (!subjectNames.Any())
        {
            var allSubjects = await _db.Subjects.Take(3).ToListAsync(cancellationToken);
            subjectNames = allSubjects.Select(s => s.NameUz).ToList();
        }

        // Deactivate existing active plans
        var existingActive = await _db.StudyPlans
            .Where(p => p.StudentProfileId == studentProfileId && p.IsActive)
            .ToListAsync(cancellationToken);
        foreach (var ex in existingActive) ex.IsActive = false;

        // Ask AI for plan
        var planJson = await _aiProvider.GeneratePersonalizedPlanJsonAsync(
            request.Goal,
            profile.KnowledgeLevel.ToString(),
            subjectNames,
            request.DailyMinutes,
            request.Language,
            cancellationToken);

        var plan = new StudyPlan
        {
            StudentProfileId = studentProfileId,
            Title = $"AI Shaxsiy Reja: {request.Goal}",
            Description = $"{request.DurationDays} kunlik intensiv o'quv rejasi",
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(request.DurationDays),
            IsActive = true,
            GoalSummary = request.Goal,
            AiRecommendation = "Kunlik darslarni ketma-ketlikda bajaring, har bir vazifadan so'ng test orqali bilimlarni mustahkamlang."
        };

        _db.StudyPlans.Add(plan);

        // Generate tasks per day from available topics
        var availableTopics = subjects.SelectMany(s => s.Topics).ToList();
        if (!availableTopics.Any())
        {
            availableTopics = await _db.Topics.Include(t => t.Subject).Take(10).ToListAsync(cancellationToken);
        }

        int topicIdx = 0;
        for (int day = 0; day < request.DurationDays; day++)
        {
            var taskDate = DateTime.UtcNow.Date.AddDays(day);
            int tasksForToday = 2; // 2 tasks per day
            for (int k = 0; k < tasksForToday; k++)
            {
                var topic = availableTopics.Count > 0 ? availableTopics[topicIdx % availableTopics.Count] : null;
                topicIdx++;

                var task = new StudyTask
                {
                    StudyPlan = plan,
                    TopicId = topic?.Id,
                    Title = topic != null ? $"{topic.TitleUz} bo'yicha dars va amaliyot" : $"Mavzu {k + 1}: Asosiy tushunchalar",
                    Description = topic?.Description ?? "Mavzuni o'rganing va savollarga javob bering",
                    TaskDate = taskDate,
                    Status = StudyTaskStatus.Pending,
                    DurationMinutes = request.DailyMinutes / tasksForToday,
                    XpReward = 25
                };
                plan.Tasks.Add(task);
            }
        }

        await _db.SaveChangesAsync(cancellationToken);

        return await GetActivePlanAsync(studentProfileId, cancellationToken)
            ?? MapToDto(plan);
    }

    public async Task<StudyTaskDto> UpdateTaskStatusAsync(Guid taskId, Guid studentProfileId, StudyTaskStatus status, CancellationToken cancellationToken = default)
    {
        var task = await _db.StudyTasks
            .Include(t => t.StudyPlan)
            .Include(t => t.Topic)
                .ThenInclude(tp => tp!.Subject)
            .FirstOrDefaultAsync(t => t.Id == taskId && t.StudyPlan.StudentProfileId == studentProfileId, cancellationToken);

        if (task == null) throw new NotFoundException("O'quv vazifasi", taskId);

        var prevStatus = task.Status;
        task.Status = status;
        if (status == StudyTaskStatus.Completed)
        {
            task.CompletedAt = DateTime.UtcNow;

            // Award XP to profile if newly completed
            if (prevStatus != StudyTaskStatus.Completed)
            {
                var profile = await _db.StudentProfiles.FindAsync(new object[] { studentProfileId }, cancellationToken);
                if (profile != null)
                {
                    profile.TotalXp += task.XpReward;
                    profile.Level = (profile.TotalXp / 200) + 1;
                    profile.LastActivityDate = DateTime.UtcNow;

                    // Update challenge progress
                    var todayChallenge = await _db.StudentDailyChallenges
                        .Include(c => c.DailyChallenge)
                        .FirstOrDefaultAsync(c => c.StudentProfileId == studentProfileId && c.Date == DateTime.UtcNow.Date && c.DailyChallenge.ChallengeType == ChallengeType.CompleteTasks, cancellationToken);

                    if (todayChallenge != null && !todayChallenge.IsCompleted)
                    {
                        todayChallenge.CurrentCount++;
                        if (todayChallenge.CurrentCount >= todayChallenge.DailyChallenge.TargetCount)
                        {
                            todayChallenge.IsCompleted = true;
                            todayChallenge.CompletedAt = DateTime.UtcNow;
                        }
                    }
                }
            }
        }

        task.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return new StudyTaskDto(
            task.Id,
            task.StudyPlanId,
            task.TopicId,
            task.Topic?.TitleUz,
            task.Topic?.Subject?.NameUz,
            task.Topic?.Subject?.GradientColor,
            task.Title,
            task.Description,
            task.TaskDate,
            task.Status,
            task.DurationMinutes,
            task.XpReward,
            task.CompletedAt
        );
    }

    public async Task<StudyTaskDto> AddCustomTaskAsync(Guid studentProfileId, CreateCustomTaskRequest request, CancellationToken cancellationToken = default)
    {
        var plan = await _db.StudyPlans.FirstOrDefaultAsync(p => p.Id == request.StudyPlanId && p.StudentProfileId == studentProfileId, cancellationToken);
        if (plan == null) throw new NotFoundException("O'quv reja", request.StudyPlanId);

        var task = new StudyTask
        {
            StudyPlanId = request.StudyPlanId,
            TopicId = request.TopicId,
            Title = request.Title,
            Description = request.Description,
            TaskDate = request.TaskDate.Date,
            Status = StudyTaskStatus.Pending,
            DurationMinutes = request.DurationMinutes,
            XpReward = request.XpReward
        };

        _db.StudyTasks.Add(task);
        await _db.SaveChangesAsync(cancellationToken);

        return new StudyTaskDto(
            task.Id,
            task.StudyPlanId,
            task.TopicId,
            null,
            null,
            null,
            task.Title,
            task.Description,
            task.TaskDate,
            task.Status,
            task.DurationMinutes,
            task.XpReward,
            task.CompletedAt
        );
    }

    private static StudyPlanDto MapToDto(StudyPlan plan)
    {
        var tasksDto = plan.Tasks
            .OrderBy(t => t.TaskDate)
            .ThenBy(t => t.CreatedAt)
            .Select(t => new StudyTaskDto(
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

        int total = tasksDto.Count;
        int completed = tasksDto.Count(t => t.Status == StudyTaskStatus.Completed);
        int percentage = total > 0 ? (int)Math.Round((double)completed / total * 100) : 0;

        return new StudyPlanDto(
            plan.Id,
            plan.StudentProfileId,
            plan.Title,
            plan.Description,
            plan.StartDate,
            plan.EndDate,
            plan.IsActive,
            plan.GoalSummary,
            plan.AiRecommendation,
            total,
            completed,
            percentage,
            tasksDto
        );
    }
}
