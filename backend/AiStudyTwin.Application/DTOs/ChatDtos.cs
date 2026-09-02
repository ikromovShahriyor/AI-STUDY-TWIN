using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Application.DTOs;

public record ConversationDto(
    Guid Id,
    Guid StudentProfileId,
    Guid? SubjectId,
    string? SubjectName,
    string Title,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    int MessageCount,
    string? LastMessageSnippet
);

public record MessageDto(
    Guid Id,
    Guid ConversationId,
    MessageSender Sender,
    string Content,
    List<WebSearchSourceDto>? Sources,
    string? AudioUrl,
    DateTime CreatedAt
);

public record WebSearchSourceDto(
    string Title,
    string Snippet,
    string Url
);

public record SendMessageRequest(
    Guid? ConversationId,
    Guid? SubjectId,
    string Content,
    string Language = "uz"
);

public record CreateConversationRequest(
    Guid? SubjectId,
    string? Title
);
