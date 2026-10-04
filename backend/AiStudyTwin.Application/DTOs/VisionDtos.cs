namespace AiStudyTwin.Application.DTOs;

public record VisionAnalyzeResponse(
    bool Success,
    string ExtractedContent,
    string Answer,
    string DetectedSubject,
    double? Confidence,
    Guid ConversationId,
    MessageDto Message,
    string? ImageUrl
);

public record VisionHistoryDto(
    Guid Id,
    Guid StudentProfileId,
    Guid? ConversationId,
    string? SubjectName,
    string ImageUrl,
    string? Question,
    string AIResponse,
    string? ExtractedContent,
    string? DetectedSubject,
    DateTime CreatedAt
);
