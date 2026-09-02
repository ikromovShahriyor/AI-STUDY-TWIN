using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class ChatConversation : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public Guid? SubjectId { get; set; }
    public Subject? Subject { get; set; }

    public string Title { get; set; } = "Yangi suhbat";

    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
