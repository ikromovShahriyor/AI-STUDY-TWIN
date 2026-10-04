using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class VisionInteraction : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid? ConversationId { get; set; }
    public ChatConversation? Conversation { get; set; }

    public Guid? SubjectId { get; set; }
    public Subject? Subject { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
    public string? StoragePath { get; set; }
    public string? Question { get; set; }
    public string AIResponse { get; set; } = string.Empty;
    public string? ExtractedContent { get; set; }
    public string? DetectedSubject { get; set; }
    public double? Confidence { get; set; }
}
