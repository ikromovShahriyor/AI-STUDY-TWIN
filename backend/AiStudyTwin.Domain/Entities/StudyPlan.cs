using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class StudyPlan : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime EndDate { get; set; } = DateTime.UtcNow.AddDays(7);
    public bool IsActive { get; set; } = true;
    public string? GoalSummary { get; set; }
    public string? AiRecommendation { get; set; }

    public ICollection<StudyTask> Tasks { get; set; } = new List<StudyTask>();
}
