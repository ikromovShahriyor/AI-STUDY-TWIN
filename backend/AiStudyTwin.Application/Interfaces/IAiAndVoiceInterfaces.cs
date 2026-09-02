namespace AiStudyTwin.Application.Interfaces;

public record AiChatMessage(string Role, string Content);

public record WebSearchResult(string Title, string Snippet, string Url);

public record AiResponse(string Content, List<WebSearchResult>? Sources = null);

public interface IAiProviderService
{
    Task<AiResponse> GenerateChatResponseAsync(
        string prompt,
        string systemInstruction,
        List<AiChatMessage>? conversationHistory = null,
        string? subjectContext = null,
        string language = "uz",
        CancellationToken cancellationToken = default);

    Task<string> ExplainConceptAsync(
        string topicTitle,
        string subjectName,
        string knowledgeLevel,
        string language = "uz",
        CancellationToken cancellationToken = default);

    Task<string> AnalyzeMistakeAsync(
        string question,
        string studentAnswer,
        string correctAnswer,
        string explanation,
        string language = "uz",
        CancellationToken cancellationToken = default);

    Task<string> GeneratePersonalizedPlanJsonAsync(
        string studentGoal,
        string knowledgeLevel,
        List<string> selectedSubjects,
        int dailyMinutes,
        string language = "uz",
        CancellationToken cancellationToken = default);
}

public interface IWebSearchService
{
    Task<List<WebSearchResult>> SearchAsync(string query, int maxResults = 3, CancellationToken cancellationToken = default);
}

public interface ISpeechService
{
    Task<string> TranscribeAudioAsync(Stream audioStream, string fileName, string language = "uz", CancellationToken cancellationToken = default);
    Task<byte[]> SynthesizeSpeechAsync(string text, string language = "uz", CancellationToken cancellationToken = default);
}
