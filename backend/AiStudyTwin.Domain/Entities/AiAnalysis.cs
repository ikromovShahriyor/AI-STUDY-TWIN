using AiStudyTwin.Domain.Common;
using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Domain.Entities;

public class AiAnalysis : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public KnowledgeLevel OverallLevel { get; set; } = KnowledgeLevel.Beginner;
    public string StrengthsJson { get; set; } = "[]"; // List of string or objects
    public string WeaknessesJson { get; set; } = "[]";
    public string RecommendationsJson { get; set; } = "[]";
    public string NextLessonsJson { get; set; } = "[]";
    public string Summary { get; set; } = string.Empty;
    public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;
}
