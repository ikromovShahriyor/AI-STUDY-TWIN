using AiStudyTwin.Domain.Common;
using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Domain.Entities;

public class Achievement : BaseEntity
{
    public string TitleUz { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string TitleRu { get; set; } = string.Empty;
    public string DescriptionUz { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionRu { get; set; } = string.Empty;
    public string Icon { get; set; } = "Award";
    public int RequiredXp { get; set; } = 0;
    public string Category { get; set; } = "General";
    public BadgeTier Tier { get; set; } = BadgeTier.Bronze;
    public int XpBonus { get; set; } = 50;

    public ICollection<StudentAchievement> StudentAchievements { get; set; } = new List<StudentAchievement>();
}
