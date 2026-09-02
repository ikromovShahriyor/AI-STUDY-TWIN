using AiStudyTwin.Domain.Common;
using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Domain.Entities;

public class Question : BaseEntity
{
    public Guid TestId { get; set; }
    public Test Test { get; set; } = null!;

    public string QuestionText { get; set; } = string.Empty;
    public string? CodeSnippet { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public int Points { get; set; } = 10;
    public QuestionType QuestionType { get; set; } = QuestionType.SingleChoice;
    public int OrderIndex { get; set; } = 0;

    public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    public ICollection<TestAnswerSubmission> Submissions { get; set; } = new List<TestAnswerSubmission>();
}
