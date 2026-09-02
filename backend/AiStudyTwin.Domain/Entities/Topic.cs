using AiStudyTwin.Domain.Common;
using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Domain.Entities;

public class Topic : BaseEntity
{
    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public string TitleUz { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string TitleRu { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DifficultyLevel Difficulty { get; set; } = DifficultyLevel.Easy;
    public int EstimatedMinutes { get; set; } = 30;
    public int OrderIndex { get; set; } = 0;

    public ICollection<StudyTask> Tasks { get; set; } = new List<StudyTask>();
    public ICollection<Test> Tests { get; set; } = new List<Test>();
}
