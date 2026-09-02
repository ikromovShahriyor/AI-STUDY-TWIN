using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class StudentAchievement : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid AchievementId { get; set; }
    public Achievement Achievement { get; set; } = null!;

    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;
}
