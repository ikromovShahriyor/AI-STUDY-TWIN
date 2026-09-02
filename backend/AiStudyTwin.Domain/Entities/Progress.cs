using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class Progress : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public double MasteryPercentage { get; set; } = 0.0;
    public int TotalTestsTaken { get; set; } = 0;
    public int TotalTasksCompleted { get; set; } = 0;
    public int TotalMinutesStudied { get; set; } = 0;
    public DateTime? LastStudiedAt { get; set; }
}
