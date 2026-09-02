using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AiStudyTwin.Infrastructure.AI;

public class AiProviderService : IAiProviderService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly IWebSearchService _webSearch;
    private readonly ILogger<AiProviderService> _logger;

    private static readonly JsonSerializerOptions CamelCaseOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public AiProviderService(
        HttpClient httpClient,
        IConfiguration config,
        IWebSearchService webSearch,
        ILogger<AiProviderService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _webSearch = webSearch;
        _logger = logger;
    }

    public async Task<AiResponse> GenerateChatResponseAsync(
        string prompt,
        string systemInstruction,
        List<AiChatMessage>? conversationHistory = null,
        string? subjectContext = null,
        string language = "uz",
        CancellationToken cancellationToken = default)
    {
        // [STEP 1] User message received & sanitized
        var sanitizedPrompt = prompt?.Trim() ?? string.Empty;
        var promptPreview = sanitizedPrompt.Length > 60 ? sanitizedPrompt[..60] + "..." : sanitizedPrompt;
        _logger.LogInformation("[AI STEP 1] User message received. Length: {Length}, Preview: \"{Preview}\"", sanitizedPrompt.Length, promptPreview);

        if (string.IsNullOrWhiteSpace(sanitizedPrompt))
        {
            throw new ValidationException("Prompt", "Savol matni bo'sh bo'lishi mumkin emas.");
        }

        // [STEP 2] AI service configuration & state inspection
        var provider = _config["Ai:Provider"] ?? _config["AI_PROVIDER"] ?? "Auto";
        var geminiKey = _config["GEMINI_API_KEY"] ?? _config["Ai:GeminiApiKey"] ?? _config["AI_API_KEY"];
        var groqKey = _config["GROQ_API_KEY"] ?? _config["Ai:GroqApiKey"];
        var openAiKey = _config["OPENAI_API_KEY"] ?? _config["Ai:OpenAiApiKey"];
        var openRouterKey = _config["OPENROUTER_API_KEY"] ?? _config["Ai:OpenRouterApiKey"];
        var deepSeekKey = _config["DEEPSEEK_API_KEY"] ?? _config["Ai:DeepSeekApiKey"];

        var historyCount = conversationHistory?.Count ?? 0;
        _logger.LogInformation("[AI STEP 2] AI service invoked. ProviderMode: {Provider}, Subject: {Subject}, Lang: {Language}, HistoryCount: {HistoryCount}",
            provider, subjectContext ?? "General", language, historyCount);

        // Optional Web Search for current events / live news
        List<WebSearchResult>? sources = null;
        bool needsSearch = sanitizedPrompt.Contains("eng so'nggi", StringComparison.OrdinalIgnoreCase) ||
                           sanitizedPrompt.Contains("yangilik", StringComparison.OrdinalIgnoreCase) ||
                           sanitizedPrompt.Contains("latest", StringComparison.OrdinalIgnoreCase) ||
                           sanitizedPrompt.Contains("2026", StringComparison.OrdinalIgnoreCase) ||
                           sanitizedPrompt.Contains("news", StringComparison.OrdinalIgnoreCase);

        if (needsSearch)
        {
            try
            {
                sources = await _webSearch.SearchAsync(sanitizedPrompt, 3, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Web search could not retrieve external sources for prompt.");
            }
        }

        var providerErrors = new List<string>();

        // 1. Try Google Gemini API
        if (!string.IsNullOrWhiteSpace(geminiKey) && (provider.Equals("Gemini", StringComparison.OrdinalIgnoreCase) || provider.Equals("Auto", StringComparison.OrdinalIgnoreCase)))
        {
            try
            {
                var geminiRes = await CallGeminiAsync(geminiKey, sanitizedPrompt, systemInstruction, conversationHistory, cancellationToken);
                if (!string.IsNullOrWhiteSpace(geminiRes))
                {
                    _logger.LogInformation("[AI STEP 6] Dispatched Gemini AI response to client. ResponseLength: {Length}", geminiRes.Length);
                    return new AiResponse(geminiRes, sources);
                }
                providerErrors.Add("Gemini returned an empty response.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gemini API execution failed: {Message}", ex.Message);
                providerErrors.Add($"Gemini error: {ex.Message}");
            }
        }

        // 2. Try Groq API (High Speed Llama 3.3)
        if (!string.IsNullOrWhiteSpace(groqKey) && (provider.Equals("Groq", StringComparison.OrdinalIgnoreCase) || provider.Equals("Auto", StringComparison.OrdinalIgnoreCase)))
        {
            try
            {
                var groqModel = _config["Ai:GroqModel"] ?? "llama-3.3-70b-versatile";
                var groqEndpoint = _config["Ai:GroqEndpoint"] ?? "https://api.groq.com/openai/v1/chat/completions";
                var groqRes = await CallOpenAiCompatibleAsync("Groq", groqKey, groqEndpoint, groqModel, sanitizedPrompt, systemInstruction, conversationHistory, cancellationToken);
                if (!string.IsNullOrWhiteSpace(groqRes))
                {
                    _logger.LogInformation("[AI STEP 6] Dispatched Groq AI response to client. ResponseLength: {Length}", groqRes.Length);
                    return new AiResponse(groqRes, sources);
                }
                providerErrors.Add("Groq returned an empty response.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Groq API execution failed: {Message}", ex.Message);
                providerErrors.Add($"Groq error: {ex.Message}");
            }
        }

        // 3. Try OpenAI API
        if (!string.IsNullOrWhiteSpace(openAiKey) && (provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase) || provider.Equals("Auto", StringComparison.OrdinalIgnoreCase)))
        {
            try
            {
                var openAiModel = _config["Ai:OpenAiModel"] ?? "gpt-4o-mini";
                var openAiEndpoint = _config["Ai:OpenAiEndpoint"] ?? _config["OPENAI_BASE_URL"] ?? "https://api.openai.com/v1/chat/completions";
                var openAiRes = await CallOpenAiCompatibleAsync("OpenAI", openAiKey, openAiEndpoint, openAiModel, sanitizedPrompt, systemInstruction, conversationHistory, cancellationToken);
                if (!string.IsNullOrWhiteSpace(openAiRes))
                {
                    _logger.LogInformation("[AI STEP 6] Dispatched OpenAI response to client. ResponseLength: {Length}", openAiRes.Length);
                    return new AiResponse(openAiRes, sources);
                }
                providerErrors.Add("OpenAI returned an empty response.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OpenAI API execution failed: {Message}", ex.Message);
                providerErrors.Add($"OpenAI error: {ex.Message}");
            }
        }

        // 4. Try OpenRouter API
        if (!string.IsNullOrWhiteSpace(openRouterKey) && (provider.Equals("OpenRouter", StringComparison.OrdinalIgnoreCase) || provider.Equals("Auto", StringComparison.OrdinalIgnoreCase)))
        {
            try
            {
                var routerModel = _config["Ai:OpenRouterModel"] ?? "google/gemini-2.0-flash-001";
                var routerEndpoint = "https://openrouter.ai/api/v1/chat/completions";
                var routerRes = await CallOpenAiCompatibleAsync("OpenRouter", openRouterKey, routerEndpoint, routerModel, sanitizedPrompt, systemInstruction, conversationHistory, cancellationToken);
                if (!string.IsNullOrWhiteSpace(routerRes))
                {
                    _logger.LogInformation("[AI STEP 6] Dispatched OpenRouter AI response to client. ResponseLength: {Length}", routerRes.Length);
                    return new AiResponse(routerRes, sources);
                }
                providerErrors.Add("OpenRouter returned an empty response.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OpenRouter API execution failed: {Message}", ex.Message);
                providerErrors.Add($"OpenRouter error: {ex.Message}");
            }
        }

        // 5. Try DeepSeek API
        if (!string.IsNullOrWhiteSpace(deepSeekKey) && (provider.Equals("DeepSeek", StringComparison.OrdinalIgnoreCase) || provider.Equals("Auto", StringComparison.OrdinalIgnoreCase)))
        {
            try
            {
                var deepSeekModel = _config["Ai:DeepSeekModel"] ?? "deepseek-chat";
                var deepSeekEndpoint = "https://api.deepseek.com/chat/completions";
                var deepSeekRes = await CallOpenAiCompatibleAsync("DeepSeek", deepSeekKey, deepSeekEndpoint, deepSeekModel, sanitizedPrompt, systemInstruction, conversationHistory, cancellationToken);
                if (!string.IsNullOrWhiteSpace(deepSeekRes))
                {
                    _logger.LogInformation("[AI STEP 6] Dispatched DeepSeek AI response to client. ResponseLength: {Length}", deepSeekRes.Length);
                    return new AiResponse(deepSeekRes, sources);
                }
                providerErrors.Add("DeepSeek returned an empty response.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DeepSeek API execution failed: {Message}", ex.Message);
                providerErrors.Add($"DeepSeek error: {ex.Message}");
            }
        }

        // If no API keys are configured at all
        if (string.IsNullOrWhiteSpace(geminiKey) && string.IsNullOrWhiteSpace(groqKey) &&
            string.IsNullOrWhiteSpace(openAiKey) && string.IsNullOrWhiteSpace(openRouterKey) &&
            string.IsNullOrWhiteSpace(deepSeekKey))
        {
            var noKeyMsg = "AI xizmati kalitlari (GEMINI_API_KEY, GROQ_API_KEY yoki OPENAI_API_KEY) sozlanmagan. Iltimos, .env faylida yoki server parametrlarida API kalitini kiriting.";
            _logger.LogError("[AI ERROR] No AI API keys found in environment variables or configuration.");
            throw new AppException(noKeyMsg, 503);
        }

        var aggregatedError = string.Join(" | ", providerErrors);
        _logger.LogError("[AI ERROR] All configured AI providers failed to respond. Errors: {Errors}", aggregatedError);
        throw new AppException($"AI xizmatiga ulanib bo'lmadi. Texnik xatolik: {aggregatedError}", 503);
    }

    public async Task<string> ExplainConceptAsync(string topicTitle, string subjectName, string knowledgeLevel, string language = "uz", CancellationToken cancellationToken = default)
    {
        var prompt = $"Tushuntir: '{topicTitle}' mavzusi. Fan: '{subjectName}'. O'quvchi darajasi: {knowledgeLevel}.";
        var systemInstruction = "Sen AI Study Twin platformasining professional pedagog AI repetitorisan. Mavzuni qiziqarli, bosqichma-bosqich, real hayotiy misollar va vizual tuzilmada tushuntir.";
        var res = await GenerateChatResponseAsync(prompt, systemInstruction, null, subjectName, language, cancellationToken);
        return res.Content;
    }

    public async Task<string> AnalyzeMistakeAsync(string question, string studentAnswer, string correctAnswer, string explanation, string language = "uz", CancellationToken cancellationToken = default)
    {
        var prompt = $"Savol: {question}\nO'quvchining noto'g'ri javobi: {studentAnswer}\nTo'g'ri javob: {correctAnswer}\nIzoh: {explanation}\n\nO'quvchiga qayerda adashganini, nega to'g'ri javob to'g'riligini va buni qanday qilib oson eslab qolish mumkinligini qadamma-qadam tushuntir.";
        var systemInstruction = "Sen xatolarni professional tahlil qiluvchi, o'quvchini ruhlantiruvchi va chuqur pedagogik izoh beruvchi AI repetitorisan.";
        var res = await GenerateChatResponseAsync(prompt, systemInstruction, null, "Xatolar tahlili", language, cancellationToken);
        return res.Content;
    }

    public async Task<string> GeneratePersonalizedPlanJsonAsync(string studentGoal, string knowledgeLevel, List<string> selectedSubjects, int dailyMinutes, string language = "uz", CancellationToken cancellationToken = default)
    {
        var subs = string.Join(", ", selectedSubjects);
        var prompt = $"Maqsad: {studentGoal}\nDaraja: {knowledgeLevel}\nFanlar: {subs}\nKunlik vaqt: {dailyMinutes} daqiqa.\nShaxsiy reja parametrlarini JSON formatida tuz.";
        var systemInstruction = "Sen ta'lim metodisti AI repetitorsan. Javobni faqat toza JSON formatida qaytar.";
        try
        {
            var res = await GenerateChatResponseAsync(prompt, systemInstruction, null, "O'quv rejasi", language, cancellationToken);
            return res.Content;
        }
        catch
        {
            return $"{{\"goal\":\"{studentGoal}\",\"subjects\":\"{subs}\",\"dailyMinutes\":{dailyMinutes}}}";
        }
    }

    private async Task<string?> CallGeminiAsync(
        string apiKey,
        string prompt,
        string systemInstruction,
        List<AiChatMessage>? history,
        CancellationToken cancellationToken)
    {
        var configuredModel = _config["Ai:GeminiModel"] ?? "gemini-3.5-flash";
        var candidateModels = new[] { configuredModel, "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash" }
            .Distinct().ToList();

        var temperature = _config.GetValue<double>("Ai:Temperature", 0.7);
        var maxTokens = _config.GetValue<int>("Ai:MaxOutputTokens", 4096);

        var contents = new List<object>();

        // Build clean alternating conversation turns for Gemini (user / model)
        if (history != null && history.Any())
        {
            string? lastRole = null;
            foreach (var h in history)
            {
                if (string.IsNullOrWhiteSpace(h.Content)) continue;

                var role = h.Role.Equals("user", StringComparison.OrdinalIgnoreCase) ? "user" : "model";

                // Gemini forbids consecutive turns with the exact same role
                if (role == lastRole) continue;

                contents.Add(new
                {
                    role = role,
                    parts = new[] { new { text = h.Content } }
                });
                lastRole = role;
            }

            // Always ensure the final turn before current message was from model if history had user
            if (lastRole == "user")
            {
                contents.Add(new
                {
                    role = "model",
                    parts = new[] { new { text = "Tushundim, davom etamiz." } }
                });
            }

            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = prompt } }
            });
        }
        else
        {
            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = prompt } }
            });
        }

        var requestBody = new
        {
            contents = contents,
            system_instruction = new
            {
                parts = new[] { new { text = systemInstruction } }
            },
            generationConfig = new
            {
                temperature = temperature,
                maxOutputTokens = maxTokens
            }
        };

        var jsonPayload = JsonSerializer.Serialize(requestBody, CamelCaseOptions);

        foreach (var model in candidateModels)
        {
            try
            {
                var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";
                _logger.LogInformation("[AI STEP 3] Sending request to Google Gemini API. Model: {Model}", model);

                using var req = new HttpRequestMessage(HttpMethod.Post, endpoint);
                req.Headers.Add("X-goog-api-key", apiKey);
                req.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(req, cancellationToken);
                _logger.LogInformation("[AI STEP 4] Gemini API returned HTTP status code: {StatusCode} for model {Model}", (int)response.StatusCode, model);

                if (response.IsSuccessStatusCode)
                {
                    var parsed = await ParseGeminiResponseAsync(response, cancellationToken);
                    if (!string.IsNullOrWhiteSpace(parsed))
                    {
                        return parsed;
                    }
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound || (int)response.StatusCode == 503)
                {
                    _logger.LogWarning("Gemini model {Model} returned {StatusCode}. Trying next available model...", model, (int)response.StatusCode);
                    continue;
                }
                else
                {
                    var err = await response.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogWarning("Gemini API error payload: {Error}", err);
                    continue;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed attempt calling Gemini model {Model}", model);
            }
        }

        return null;
    }

    private async Task<string?> ParseGeminiResponseAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(cancellationToken), cancellationToken: cancellationToken);
        var root = doc.RootElement;

        if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
        {
            var firstCand = candidates[0];
            if (firstCand.TryGetProperty("content", out var content) && content.TryGetProperty("parts", out var parts))
            {
                var sb = new StringBuilder();
                foreach (var part in parts.EnumerateArray())
                {
                    if (part.TryGetProperty("text", out var textProp))
                    {
                        sb.Append(textProp.GetString());
                    }
                }

                var fullText = sb.ToString();
                if (!string.IsNullOrWhiteSpace(fullText))
                {
                    // [STEP 5] AI response parsing success
                    _logger.LogInformation("[AI STEP 5] Successfully parsed Gemini AI response. CharacterLength: {Length}", fullText.Length);
                    return fullText;
                }
            }
        }

        return null;
    }

    private async Task<string?> CallOpenAiCompatibleAsync(
        string providerName,
        string apiKey,
        string endpoint,
        string model,
        string prompt,
        string systemInstruction,
        List<AiChatMessage>? history,
        CancellationToken cancellationToken)
    {
        var temperature = _config.GetValue<double>("Ai:Temperature", 0.7);
        var maxTokens = _config.GetValue<int>("Ai:MaxOutputTokens", 4096);

        // [STEP 3] Outbound AI request initiation
        _logger.LogInformation("[AI STEP 3] Sending request to {Provider} API. Model: {Model}, Endpoint: {Endpoint}", providerName, model, endpoint);

        using var req = new HttpRequestMessage(HttpMethod.Post, endpoint);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        if (providerName.Equals("OpenRouter", StringComparison.OrdinalIgnoreCase))
        {
            req.Headers.Add("HTTP-Referer", "https://aistudytwin.uz");
            req.Headers.Add("X-Title", "AI Study Twin");
        }

        var messages = new List<object>
        {
            new { role = "system", content = systemInstruction }
        };

        if (history != null && history.Any())
        {
            foreach (var h in history)
            {
                if (string.IsNullOrWhiteSpace(h.Content)) continue;
                var role = h.Role.Equals("user", StringComparison.OrdinalIgnoreCase) ? "user" : "assistant";
                messages.Add(new { role = role, content = h.Content });
            }
        }

        messages.Add(new { role = "user", content = prompt });

        var payload = new
        {
            model = model,
            messages = messages,
            temperature = temperature,
            max_tokens = maxTokens
        };

        var json = JsonSerializer.Serialize(payload, CamelCaseOptions);
        req.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(req, cancellationToken);

        // [STEP 4] Provider HTTP Status received
        _logger.LogInformation("[AI STEP 4] {Provider} API returned HTTP status code: {StatusCode}", providerName, (int)response.StatusCode);

        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogWarning("{Provider} API error payload: {Error}", providerName, err);
            return null;
        }

        using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(cancellationToken), cancellationToken: cancellationToken);
        var root = doc.RootElement;

        if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var msg) && msg.TryGetProperty("content", out var contentProp))
            {
                var content = contentProp.GetString();
                if (!string.IsNullOrWhiteSpace(content))
                {
                    // [STEP 5] AI response parsing success
                    _logger.LogInformation("[AI STEP 5] Successfully parsed {Provider} AI response. CharacterLength: {Length}", providerName, content.Length);
                    return content;
                }
            }
        }

        return null;
    }
}

