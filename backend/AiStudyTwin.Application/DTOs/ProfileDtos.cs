using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Application.DTOs;

public record StudentProfileDto(
    Guid Id,
    Guid UserId,
    string FullName,
    string Email,
    string? GradeLevel,
    KnowledgeLevel KnowledgeLevel,
    string TargetExam,
    int DailyStudyGoalMinutes,
    int CurrentStreak,
    int BestStreak,
    int TotalXp,
    int Level,
    string? AvatarUrl,
    string? Bio,
    string PreferredLanguage,
    int NextLevelXp,
    int CurrentLevelBaseXp
);

public record UpdateProfileRequest(
    string FullName,
    string? GradeLevel,
    string TargetExam,
    int DailyStudyGoalMinutes,
    string? Bio,
    string? AvatarUrl,
    string PreferredLanguage
);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);
