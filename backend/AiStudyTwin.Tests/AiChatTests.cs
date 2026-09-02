using System.Net;
using System.Text;
using System.Text.Json;
using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Application.Services;
using AiStudyTwin.Domain.Entities;
using AiStudyTwin.Domain.Enums;
using AiStudyTwin.Infrastructure.AI;
using AiStudyTwin.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace AiStudyTwin.Tests;

public class AiChatTests
{
    [Fact]
    public async Task Gemini_Generates_Valid_CamelCase_Payload_And_Parses_Response()
    {
        // Arrange
        var mockHttp = new Mock<HttpMessageHandler>();
        string capturedJson = string.Empty;

        mockHttp.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .Callback<HttpRequestMessage, CancellationToken>(async (req, ct) =>
            {
                if (req.Content != null)
                {
                    capturedJson = await req.Content.ReadAsStringAsync(ct);
                }
            })
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(JsonSerializer.Serialize(new
                {
                    candidates = new[]
                    {
                        new
                        {
                            content = new
                            {
                                parts = new[]
                                {
                                    new { text = "Salom! Men sizning AI o'qituvchingizman. Bugun nimani o'rganamiz?" }
                                }
                            }
                        }
                    }
                }), Encoding.UTF8, "application/json")
            });

        var httpClient = new HttpClient(mockHttp.Object);
        var inMemoryConfig = new Dictionary<string, string?>
        {
            { "GEMINI_API_KEY", "test-gemini-key-12345" },
            { "Ai:Provider", "Gemini" },
            { "Ai:GeminiModel", "gemini-2.0-flash" }
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemoryConfig).Build();
        var mockSearch = new Mock<IWebSearchService>();
        var mockLogger = new Mock<ILogger<AiProviderService>>();

        var service = new AiProviderService(httpClient, config, mockSearch.Object, mockLogger.Object);

        // Act
        var response = await service.GenerateChatResponseAsync(
            prompt: "Salom",
            systemInstruction: "Sen AI Study Twin o'qituvchisisan.",
            conversationHistory: new List<AiChatMessage>()
        );

        // Assert
        Assert.NotNull(response);
        Assert.Equal("Salom! Men sizning AI o'qituvchingizman. Bugun nimani o'rganamiz?", response.Content);

        // Verify JSON payload has camelCase properties
        Assert.False(string.IsNullOrEmpty(capturedJson));
        Assert.Contains("\"contents\":", capturedJson);
        Assert.Contains("\"system_instruction\":", capturedJson);
        Assert.Contains("\"generationConfig\":", capturedJson);
        Assert.DoesNotContain("\"Contents\":", capturedJson);
        Assert.DoesNotContain("\"SystemInstruction\":", capturedJson);
    }

    [Fact]
    public async Task OpenAi_Compatible_Sends_Content_Body_And_Parses_Response()
    {
        // Arrange
        var mockHttp = new Mock<HttpMessageHandler>();
        string capturedJson = string.Empty;
        string? authHeader = null;

        mockHttp.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .Callback<HttpRequestMessage, CancellationToken>(async (req, ct) =>
            {
                authHeader = req.Headers.Authorization?.ToString();
                if (req.Content != null)
                {
                    capturedJson = await req.Content.ReadAsStringAsync(ct);
                }
            })
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(JsonSerializer.Serialize(new
                {
                    choices = new[]
                    {
                        new
                        {
                            message = new
                            {
                                role = "assistant",
                                content = "Matematikada integral - bu funksiya grafigi ostidagi yuzani yoki yig'indini hisoblash usulidir."
                            }
                        }
                    }
                }), Encoding.UTF8, "application/json")
            });

        var httpClient = new HttpClient(mockHttp.Object);
        var inMemoryConfig = new Dictionary<string, string?>
        {
            { "GROQ_API_KEY", "gsk_test_groq_key_12345" },
            { "Ai:Provider", "Groq" },
            { "Ai:GroqModel", "llama-3.3-70b-versatile" }
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemoryConfig).Build();
        var mockSearch = new Mock<IWebSearchService>();
        var mockLogger = new Mock<ILogger<AiProviderService>>();

        var service = new AiProviderService(httpClient, config, mockSearch.Object, mockLogger.Object);

        // Act
        var response = await service.GenerateChatResponseAsync(
            prompt: "Matematikada integral nima?",
            systemInstruction: "Sen AI o'qituvchisan.",
            conversationHistory: new List<AiChatMessage>()
        );

        // Assert
        Assert.NotNull(response);
        Assert.Equal("Matematikada integral - bu funksiya grafigi ostidagi yuzani yoki yig'indini hisoblash usulidir.", response.Content);

        // Verify request payload
        Assert.False(string.IsNullOrEmpty(capturedJson));
        Assert.Equal("Bearer gsk_test_groq_key_12345", authHeader);
        Assert.Contains("\"messages\":", capturedJson);
        Assert.Contains("\"model\":\"llama-3.3-70b-versatile\"", capturedJson);
        Assert.Contains("Matematikada integral nima?", capturedJson);
    }

    [Fact]
    public async Task MultiTurn_Conversation_Memory_Preserves_Context()
    {
        // Arrange
        var mockHttp = new Mock<HttpMessageHandler>();
        string capturedJson = string.Empty;

        mockHttp.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .Callback<HttpRequestMessage, CancellationToken>(async (req, ct) =>
            {
                if (req.Content != null)
                {
                    capturedJson = await req.Content.ReadAsStringAsync(ct);
                }
            })
            .ReturnsAsync(new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(JsonSerializer.Serialize(new
                {
                    choices = new[]
                    {
                        new
                        {
                            message = new
                            {
                                role = "assistant",
                                content = "Keling, buni oddiyroq tushuntiraman: integralni mayda bo'lakchalarni birlashtirib umumiy maydonni topish deb tasavvur qiling."
                            }
                        }
                    }
                }), Encoding.UTF8, "application/json")
            });

        var httpClient = new HttpClient(mockHttp.Object);
        var inMemoryConfig = new Dictionary<string, string?>
        {
            { "OPENAI_API_KEY", "sk-test-key-12345" },
            { "Ai:Provider", "OpenAI" }
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemoryConfig).Build();
        var mockSearch = new Mock<IWebSearchService>();
        var mockLogger = new Mock<ILogger<AiProviderService>>();

        var service = new AiProviderService(httpClient, config, mockSearch.Object, mockLogger.Object);

        var history = new List<AiChatMessage>
        {
            new("user", "Matematikada integral nima?"),
            new("assistant", "Integral - funksiyaning boshlang'ich funksiyasini topish amali.")
        };

        // Act
        var response = await service.GenerateChatResponseAsync(
            prompt: "Oddiyroq tushuntir",
            systemInstruction: "Sen AI o'qituvchisan.",
            conversationHistory: history
        );

        // Assert
        Assert.NotNull(response);
        Assert.Contains("oddiyroq tushuntiraman", response.Content);

        // Verify history messages were serialized in request
        Assert.Contains("Matematikada integral nima?", capturedJson);
        Assert.Contains("Oddiyroq tushuntir", capturedJson);
    }

    [Fact]
    public async Task Missing_All_Keys_Throws_AppException_Without_Fake_Response()
    {
        // Arrange
        var httpClient = new HttpClient();
        var inMemoryConfig = new Dictionary<string, string?>();
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemoryConfig).Build();
        var mockSearch = new Mock<IWebSearchService>();
        var mockLogger = new Mock<ILogger<AiProviderService>>();

        var service = new AiProviderService(httpClient, config, mockSearch.Object, mockLogger.Object);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<AppException>(() =>
            service.GenerateChatResponseAsync("Salom", "system prompt"));

        Assert.Equal(503, ex.StatusCode);
        Assert.Contains("AI xizmati kalitlari", ex.Message);
    }

    [Fact]
    public async Task ChatService_EndToEnd_Flow_Integrates_SystemPrompt_And_Persists_Messages()
    {
        // Arrange DB
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new AppDbContext(options);
        var studentProfile = new StudentProfile
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            KnowledgeLevel = KnowledgeLevel.Intermediate,
            CreatedAt = DateTime.UtcNow
        };
        db.StudentProfiles.Add(studentProfile);
        await db.SaveChangesAsync();

        var mockAiProvider = new Mock<IAiProviderService>();
        string? passedSystemInstruction = null;
        List<AiChatMessage>? passedHistory = null;

        mockAiProvider
            .Setup(p => p.GenerateChatResponseAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<List<AiChatMessage>?>(),
                It.IsAny<string?>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .Callback<string, string, List<AiChatMessage>?, string?, string, CancellationToken>((p, sys, hist, sub, lang, ct) =>
            {
                passedSystemInstruction = sys;
                passedHistory = hist;
            })
            .ReturnsAsync(new AiResponse("C# da class - bu obyektlar yaratish uchun shablon yoki chizmadir."));

        var mockSearch = new Mock<IWebSearchService>();
        var chatService = new ChatService(db, mockAiProvider.Object, mockSearch.Object);

        // Act: Send first message
        var msg1 = await chatService.SendMessageAsync(
            studentProfile.Id,
            new SendMessageRequest(null, null, "C# da class nima?", "uz")
        );

        // Assert
        Assert.NotNull(msg1);
        Assert.Equal("C# da class - bu obyektlar yaratish uchun shablon yoki chizmadir.", msg1.Content);
        Assert.NotNull(passedSystemInstruction);
        Assert.Contains("Sen AI Study Twin platformasining aqlli AI o'qituvchisisan", passedSystemInstruction);
        Assert.Contains("Bir xil universal javobni hamma savolga qaytarma", passedSystemInstruction);

        // Verify conversation was created in DB
        var conv = await db.ChatConversations.Include(c => c.Messages).FirstOrDefaultAsync(c => c.Id == msg1.ConversationId);
        Assert.NotNull(conv);
        Assert.Equal(2, conv.Messages.Count); // 1 User + 1 Assistant

        // Act: Send second message in same conversation
        mockAiProvider
            .Setup(p => p.GenerateChatResponseAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<List<AiChatMessage>?>(),
                It.IsAny<string?>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .Callback<string, string, List<AiChatMessage>?, string?, string, CancellationToken>((p, sys, hist, sub, lang, ct) =>
            {
                passedHistory = hist;
            })
            .ReturnsAsync(new AiResponse("Mana C# da class ga misol:\n\n```csharp\npublic class Student {\n    public string Name { get; set; }\n}\n```"));

        var msg2 = await chatService.SendMessageAsync(
            studentProfile.Id,
            new SendMessageRequest(conv.Id, null, "Endi C# savoliga misol ber", "uz")
        );

        // Assert: Multi-turn history is sent to AI
        Assert.NotNull(msg2);
        Assert.NotNull(passedHistory);
        Assert.True(passedHistory.Count >= 2);
        Assert.Equal("C# da class nima?", passedHistory[0].Content);
    }

    [Theory]
    [InlineData("Salom", "uz", "Salom! Men sizning AI Study Twin repetitoringizman. Bugun qaysi mavzuni o'rganamiz?")]
    [InlineData("Matematikada integral nima?", "uz", "Matematikada integral - bu funksiya grafigi ostidagi egri chiziqli trapetsiya yuzasini hisoblash usulidir.")]
    [InlineData("C# da class nima?", "uz", "C# tilida class - bu obyektga yo'naltirilgan dasturlashning asosiy tushunchasi bo'lib, obyektlarning tuzilishi va xatti-harakatlarini belgilovchi andozadir.")]
    [InlineData("O'zbekiston poytaxti qayer?", "uz", "O'zbekiston Respublikasining poytaxti — Toshkent shahri.")]
    [InlineData("Hello, how are you?", "en", "Hello! I am your AI Study Twin tutor, doing great and ready to assist you with your studies!")]
    [InlineData("Привет, объясни что такое AI", "ru", "Искусственный интеллект (AI) — это способность компьютерных систем выполнять задачи, требующие человеческого интеллекта.")]
    public async Task ChatService_Handles_Diverse_Questions_And_Languages_Accurately(string prompt, string lang, string expectedReply)
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var db = new AppDbContext(options);
        var studentProfile = new StudentProfile
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            KnowledgeLevel = KnowledgeLevel.Intermediate,
            CreatedAt = DateTime.UtcNow
        };
        db.StudentProfiles.Add(studentProfile);
        await db.SaveChangesAsync();

        var mockAiProvider = new Mock<IAiProviderService>();
        mockAiProvider
            .Setup(p => p.GenerateChatResponseAsync(
                prompt,
                It.IsAny<string>(),
                It.IsAny<List<AiChatMessage>?>(),
                It.IsAny<string?>(),
                lang,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AiResponse(expectedReply));

        var mockSearch = new Mock<IWebSearchService>();
        var chatService = new ChatService(db, mockAiProvider.Object, mockSearch.Object);

        // Act
        var result = await chatService.SendMessageAsync(
            studentProfile.Id,
            new SendMessageRequest(null, null, prompt, lang)
        );

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedReply, result.Content);
        Assert.NotEqual("default response", result.Content);
    }
}
