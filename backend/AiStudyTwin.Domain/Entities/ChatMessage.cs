using AiStudyTwin.Domain.Common;
using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Domain.Entities;

public class ChatMessage : BaseEntity
{
    public Guid ConversationId { get; set; }
    public ChatConversation Conversation { get; set; } = null!;

    public MessageSender Sender { get; set; } = MessageSender.User;
    public string Content { get; set; } = string.Empty;
    public string? SourcesJson { get; set; }
    public string? AudioUrl { get; set; }
}
