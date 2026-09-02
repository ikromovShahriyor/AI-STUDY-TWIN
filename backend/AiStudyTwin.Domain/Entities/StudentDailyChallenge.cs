using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class StudentDailyChallenge : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid DailyChallengeId { get; set; }
    public DailyChallenge DailyChallenge { get; set; } = null!;

    public int CurrentCount { get; set; } = 0;
    public bool IsCompleted { get; set; } = false;
    public bool IsClaimed { get; set; } = false;
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;
    public DateTime? CompletedAt { get; set; }
}
