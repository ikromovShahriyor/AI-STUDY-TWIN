using AiStudyTwin.Domain.Common;
using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Domain.Entities;

public class Test : BaseEntity
{
    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public Guid? TopicId { get; set; }
    public Topic? Topic { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Easy;
    public int DurationMinutes { get; set; } = 15;
    public int TotalQuestions { get; set; } = 5;
    public int PassingScore { get; set; } = 60; // percentage
    public bool IsDiagnostic { get; set; } = false;
    public int XpReward { get; set; } = 50;

    public ICollection<Question> Questions { get; set; } = new List<Question>();
    public ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
}
