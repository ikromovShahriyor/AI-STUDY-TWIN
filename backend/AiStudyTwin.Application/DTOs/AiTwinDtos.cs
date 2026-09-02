using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Application.DTOs;

public record AiAnalysisDto(
    Guid Id,
    Guid StudentProfileId,
    KnowledgeLevel OverallLevel,
    List<string> Strengths,
    List<string> Weaknesses,
    List<string> Recommendations,
    List<NextLessonRecommendationDto> NextLessons,
    string Summary,
    DateTime AnalyzedAt
);

public record NextLessonRecommendationDto(
    string SubjectName,
    string TopicTitle,
    string Reason,
    int Priority, // 1 (highest) to 5
    int EstimatedMinutes
);

public record ExplainErrorRequest(
    Guid TestResultId,
    Guid QuestionId,
    string Language = "uz"
);

public record ErrorExplanationDto(
    Guid QuestionId,
    string QuestionText,
    string StudentAnswer,
    string CorrectAnswer,
    string Explanation,
    string AiDetailedAnalysis,
    List<string> ImprovementSteps
);

public record AssessKnowledgeLevelRequest(
    Guid? SubjectId,
    List<AnswerSubmissionItem> DiagnosticAnswers,
    string Language = "uz"
);
