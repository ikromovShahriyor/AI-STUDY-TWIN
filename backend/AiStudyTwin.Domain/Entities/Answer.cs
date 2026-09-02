using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class Answer : BaseEntity
{
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    public string AnswerText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    public int OrderIndex { get; set; } = 0;
}
