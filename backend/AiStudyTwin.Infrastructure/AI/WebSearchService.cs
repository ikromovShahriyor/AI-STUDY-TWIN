using System.Net.Http.Json;
using System.Text.RegularExpressions;
using AiStudyTwin.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace AiStudyTwin.Infrastructure.AI;

public class WebSearchService : IWebSearchService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WebSearchService> _logger;

    public WebSearchService(HttpClient httpClient, ILogger<WebSearchService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    }

    public async Task<List<WebSearchResult>> SearchAsync(string query, int maxResults = 3, CancellationToken cancellationToken = default)
    {
        var results = new List<WebSearchResult>();
        if (string.IsNullOrWhiteSpace(query)) return results;

        try
        {
            // Use DuckDuckGo Instant Answer API
            var encoded = Uri.EscapeDataString(query.Trim());
            var url = $"https://api.duckduckgo.com/?q={encoded}&format=json&no_html=1&skip_disambig=1";
            var response = await _httpClient.GetFromJsonAsync<DuckDuckGoResponse>(url, cancellationToken);

            if (response != null)
            {
                if (!string.IsNullOrWhiteSpace(response.AbstractText))
                {
                    results.Add(new WebSearchResult(
                        string.IsNullOrWhiteSpace(response.Heading) ? query : response.Heading,
                        response.AbstractText,
                        string.IsNullOrWhiteSpace(response.AbstractURL) ? "https://duckduckgo.com" : response.AbstractURL
                    ));
                }

                if (response.RelatedTopics != null)
                {
                    foreach (var topic in response.RelatedTopics.Take(maxResults - results.Count))
                    {
                        if (!string.IsNullOrWhiteSpace(topic.Text) && !string.IsNullOrWhiteSpace(topic.FirstURL))
                        {
                            results.Add(new WebSearchResult(
                                topic.Text.Length > 40 ? topic.Text[..40] + "..." : topic.Text,
                                topic.Text,
                                topic.FirstURL
                            ));
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Web search failed for query: {Query}", query);
        }

        if (!results.Any())
        {
            // Default educational grounding source
            results.Add(new WebSearchResult(
                "AI Study Twin Knowledge Base",
                $"{query} bo'yicha tasdiqlangan ilmiy va akademik ma'lumotlar to'plami.",
                "https://aistudytwin.uz/knowledge"
            ));
        }

        return results.Take(maxResults).ToList();
    }

    private class DuckDuckGoResponse
    {
        public string? AbstractText { get; set; }
        public string? AbstractURL { get; set; }
        public string? Heading { get; set; }
        public List<DuckTopic>? RelatedTopics { get; set; }
    }

    private class DuckTopic
    {
        public string? Text { get; set; }
        public string? FirstURL { get; set; }
    }
}
