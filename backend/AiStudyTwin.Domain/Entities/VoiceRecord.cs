using AiStudyTwin.Domain.Common;

namespace AiStudyTwin.Domain.Entities;

public class VoiceRecord : BaseEntity
{
    public Guid StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public string? AudioPath { get; set; }
    public string TranscribedText { get; set; } = string.Empty;
    public string? AiResponseText { get; set; }
    public string Language { get; set; } = "uz"; // uz, en, ru
    public long DurationMs { get; set; }
}
