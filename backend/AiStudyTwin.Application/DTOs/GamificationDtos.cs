using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Application.DTOs;

public record AchievementDto(
    Guid Id,
    string TitleUz,
    string TitleEn,
    string TitleRu,
    string DescriptionUz,
    string DescriptionEn,
    string DescriptionRu,
    string Icon,
    int RequiredXp,
    string Category,
    BadgeTier Tier,
    int XpBonus,
    bool IsUnlocked,
    DateTime? UnlockedAt
);

public record DailyChallengeDto(
    Guid Id,
    string TitleUz,
    string TitleEn,
    string TitleRu,
    string DescriptionUz,
    string DescriptionEn,
    string DescriptionRu,
    int XpReward,
    ChallengeType ChallengeType,
    int TargetCount,
    int CurrentCount,
    string Icon,
    bool IsCompleted,
    bool IsClaimed
);

public record LeaderboardUserDto(
    int Rank,
    Guid StudentProfileId,
    string FullName,
    string? AvatarUrl,
    int TotalXp,
    int Level,
    int CurrentStreak
);
