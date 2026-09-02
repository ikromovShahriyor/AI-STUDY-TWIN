using AiStudyTwin.Domain.Common;
using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Domain.Entities;

public class StudyTask : BaseEntity
{
    public Guid StudyPlanId { get; set; }
    public StudyPlan StudyPlan { get; set; } = null!;

    public Guid? TopicId { get; set; }
    public Topic? Topic { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime TaskDate { get; set; } = DateTime.UtcNow.Date;
    public StudyTaskStatus Status { get; set; } = StudyTaskStatus.Pending;
    public int DurationMinutes { get; set; } = 30;
    public int XpReward { get; set; } = 20;
    public DateTime? CompletedAt { get; set; }
}
