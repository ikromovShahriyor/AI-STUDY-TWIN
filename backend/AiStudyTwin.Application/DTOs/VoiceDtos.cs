namespace AiStudyTwin.Application.DTOs;

public record TranscribeAudioResponse(
    string TranscribedText,
    string Language,
    long DurationMs
);

public record SynthesizeSpeechRequest(
    string Text,
    string Language = "uz"
);

public record VoiceChatResponse(
    string TranscribedText,
    string AiResponseText,
    List<WebSearchSourceDto>? Sources,
    Guid MessageId,
    Guid ConversationId
);
