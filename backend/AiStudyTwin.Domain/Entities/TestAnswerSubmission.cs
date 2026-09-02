using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class TestAnswerSubmission : BaseEntity
{
    public Guid TestResultId { get; set; }
    public TestResult TestResult { get; set; } = null!;

    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    public Guid? SelectedAnswerId { get; set; }
    public Answer? SelectedAnswer { get; set; }

    public bool IsCorrect { get; set; }
}
