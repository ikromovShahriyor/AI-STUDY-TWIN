using AiStudyTwin.Domain.Common;
using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Domain.Entities;

public class DailyChallenge : BaseEntity
{
    public string TitleUz { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string TitleRu { get; set; } = string.Empty;
    public string DescriptionUz { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionRu { get; set; } = string.Empty;
    public int XpReward { get; set; } = 30;
    public ChallengeType ChallengeType { get; set; } = ChallengeType.CompleteTasks;
    public int TargetCount { get; set; } = 3;
    public string Icon { get; set; } = "Zap";

    public ICollection<StudentDailyChallenge> StudentChallenges { get; set; } = new List<StudentDailyChallenge>();
}
