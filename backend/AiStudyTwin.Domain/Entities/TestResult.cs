using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class TestResult : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid TestId { get; set; }
    public Test Test { get; set; } = null!;

    public int Score { get; set; }
    public int TotalPossibleScore { get; set; }
    public double Percentage { get; set; }
    public int TimeSpentSeconds { get; set; }
    public bool Passed { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    public string? AiFeedback { get; set; }
    public string? WeakAreasJson { get; set; }
    public string? StrongAreasJson { get; set; }
    public int XpEarned { get; set; }

    public ICollection<TestAnswerSubmission> Submissions { get; set; } = new List<TestAnswerSubmission>();
}
