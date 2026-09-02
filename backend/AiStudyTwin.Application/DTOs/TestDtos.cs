using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Application.DTOs;

public record TestDto(
    Guid Id,
    Guid SubjectId,
    string SubjectName,
    string SubjectIcon,
    string SubjectColor,
    Guid? TopicId,
    string? TopicTitle,
    string Title,
    string Description,
    DifficultyLevel Difficulty,
    int DurationMinutes,
    int TotalQuestions,
    int PassingScore,
    bool IsDiagnostic,
    int XpReward,
    List<QuestionDto> Questions
);

public record QuestionDto(
    Guid Id,
    Guid TestId,
    string QuestionText,
    string? CodeSnippet,
    int Points,
    QuestionType QuestionType,
    int OrderIndex,
    List<AnswerOptionDto> Answers
);

public record AnswerOptionDto(
    Guid Id,
    Guid QuestionId,
    string AnswerText,
    int OrderIndex
);

public record SubmitTestRequest(
    Guid TestId,
    int TimeSpentSeconds,
    List<AnswerSubmissionItem> Answers
);

public record AnswerSubmissionItem(
    Guid QuestionId,
    Guid? SelectedAnswerId
);

public record TestResultDto(
    Guid Id,
    Guid TestId,
    string TestTitle,
    string SubjectName,
    int Score,
    int TotalPossibleScore,
    double Percentage,
    int TimeSpentSeconds,
    bool Passed,
    int XpEarned,
    DateTime CompletedAt,
    string? AiFeedback,
    List<string> WeakAreas,
    List<string> StrongAreas,
    List<DetailedAnswerResultDto> Answers
);

public record DetailedAnswerResultDto(
    Guid QuestionId,
    string QuestionText,
    string? CodeSnippet,
    string Explanation,
    Guid? SelectedAnswerId,
    string? SelectedAnswerText,
    Guid CorrectAnswerId,
    string CorrectAnswerText,
    bool IsCorrect,
    int Points
);

public record DiagnosticAssessmentRequest(
    List<Guid> SubjectIds,
    string PreferredLanguage = "uz"
);
