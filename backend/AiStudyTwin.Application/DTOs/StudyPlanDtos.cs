using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Application.DTOs;

public record StudyPlanDto(
    Guid Id,
    Guid StudentProfileId,
    string Title,
    string Description,
    DateTime StartDate,
    DateTime EndDate,
    bool IsActive,
    string? GoalSummary,
    string? AiRecommendation,
    int TotalTasks,
    int CompletedTasks,
    int ProgressPercentage,
    List<StudyTaskDto> Tasks
);

public record StudyTaskDto(
    Guid Id,
    Guid StudyPlanId,
    Guid? TopicId,
    string? TopicTitle,
    string? SubjectName,
    string? SubjectColor,
    string Title,
    string Description,
    DateTime TaskDate,
    StudyTaskStatus Status,
    int DurationMinutes,
    int XpReward,
    DateTime? CompletedAt
);

public record CreateStudyPlanRequest(
    string Title,
    string Description,
    int DurationDays = 7,
    string? GoalSummary = null
);

public record UpdateTaskStatusRequest(
    StudyTaskStatus Status
);

public record CreateCustomTaskRequest(
    Guid StudyPlanId,
    Guid? TopicId,
    string Title,
    string Description,
    DateTime TaskDate,
    int DurationMinutes,
    int XpReward = 20
);

public record GenerateAiPlanRequest(
    string Goal,
    List<Guid> SubjectIds,
    int DurationDays = 7,
    int DailyMinutes = 60,
    string Language = "uz"
);
