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
using AiStudyTwin.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using Xunit;

namespace AiStudyTwin.Tests;

public class VisionAiTests
{
    private static readonly byte[] ValidPngBytes = new byte[]
    {
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG Header
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
    };

    [Fact]
    public async Task FileStorageService_Saves_Valid_Png_And_Returns_Path()
    {
        // Arrange
        var mockLogger = new Mock<ILogger<FileStorageService>>();
        var storage = new FileStorageService(mockLogger.Object);
        using var stream = new MemoryStream(ValidPngBytes);

        // Act
        var (relativeUrl, absolutePath) = await storage.SaveImageAsync(stream, "homework.png", "vision");

        // Assert
        Assert.NotNull(relativeUrl);
        Assert.StartsWith("/uploads/vision/", relativeUrl);
        Assert.EndsWith(".png", relativeUrl);
        Assert.True(File.Exists(absolutePath));

        // Clean up
        await storage.DeleteFileAsync(relativeUrl);
    }

    [Fact]
    public async Task FileStorageService_Rejects_Invalid_Extension()
    {
        // Arrange
        var mockLogger = new Mock<ILogger<FileStorageService>>();
        var storage = new FileStorageService(mockLogger.Object);
        using var stream = new MemoryStream(ValidPngBytes);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            storage.SaveImageAsync(stream, "malicious.exe", "vision"));

        Assert.True(ex.Errors.ContainsKey("Image") && ex.Errors["Image"].Any(e => e.Contains("format", StringComparison.OrdinalIgnoreCase)));
    }

    [Fact]
    public async Task FileStorageService_Rejects_Fake_Image_File()
    {
        // Arrange
        var mockLogger = new Mock<ILogger<FileStorageService>>();
        var storage = new FileStorageService(mockLogger.Object);
        var fakeBytes = Encoding.UTF8.GetBytes("This is plain text disguised as an image.");
        using var stream = new MemoryStream(fakeBytes);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            storage.SaveImageAsync(stream, "fake.jpg", "vision"));

        Assert.True(ex.Errors.ContainsKey("Image") && ex.Errors["Image"].Any(e => e.Contains("haqiqiy rasm formati emas", StringComparison.OrdinalIgnoreCase)));
    }

    [Fact]
    public async Task GeminiVision_Generates_Multimodal_Payload_With_InlineData()
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
                                    new { text = "Bu tenglamani bosqichma-bosqich yechamiz:\n1. 5 ni ayiramiz: 2x = 10\n2. 2 ga bo'lamiz: x = 5\n\nDemak, javob: x = 5.\n\nShunga o'xshash bitta masala yechib ko'rishni xohlaysanmi?" }
                                }
                            }
                        }
                    }
                }), Encoding.UTF8, "application/json")
            });

        var httpClient = new HttpClient(mockHttp.Object);
        var inMemoryConfig = new Dictionary<string, string?>
        {
            { "GEMINI_API_KEY", "test-gemini-vision-key" },
            { "Ai:Provider", "Gemini" }
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemoryConfig).Build();
        var mockSearch = new Mock<IWebSearchService>();
        var mockLogger = new Mock<ILogger<AiProviderService>>();

        var service = new AiProviderService(httpClient, config, mockSearch.Object, mockLogger.Object);

        // Act
        var result = await service.AnalyzeVisionImageAsync(
            imageBytes: ValidPngBytes,
            mimeType: "image/png",
            prompt: "2x + 5 = 15 tenglamani yechib ber",
            systemInstruction: "Sen AI Photo Teacher repetitorisan."
        );

        // Assert
        Assert.NotNull(result);
        Assert.Contains("bosqichma-bosqich", result);
        Assert.Contains("x = 5", result);
        Assert.Contains("Shunga o'xshash bitta masala yechib ko'rishni xohlaysanmi?", result);

        // Verify multimodal inlineData payload was generated
        Assert.Contains("inlineData", capturedJson);
        Assert.Contains("image/png", capturedJson);
        Assert.Contains("tenglamani yechib ber", capturedJson);
    }

    [Fact]
    public async Task ChatService_ProcessVisionMessageAsync_Saves_Image_And_VisionInteraction()
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
            KnowledgeLevel = KnowledgeLevel.Elementary,
            CreatedAt = DateTime.UtcNow
        };
        db.StudentProfiles.Add(studentProfile);
        await db.SaveChangesAsync();

        var mockAiProvider = new Mock<IAiProviderService>();
        string? passedPrompt = null;
        string? passedSystem = null;

        mockAiProvider
            .Setup(p => p.AnalyzeVisionImageAsync(
                It.IsAny<byte[]>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<List<AiChatMessage>?>(),
                It.IsAny<string?>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .Callback<byte[], string, string, string, List<AiChatMessage>?, string?, string, CancellationToken>((bytes, mime, pr, sys, hist, sub, lang, ct) =>
            {
                passedPrompt = pr;
                passedSystem = sys;
            })
            .ReturnsAsync("Ajoyib masala! Bosqichma-bosqich yechamiz:\n1-qadam to'g'ri bajarilgan.\n❌ 3-qadamda ishora xatosi bor.\nTo'g'ri javob: x = 10.");

        var mockSearch = new Mock<IWebSearchService>();
        var mockStorage = new Mock<IFileStorageService>();
        mockStorage
            .Setup(s => s.SaveImageAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(("/uploads/vision/2026/10/test-photo.png", "C:/fake/path/test-photo.png"));

        var chatService = new ChatService(db, mockAiProvider.Object, mockSearch.Object, mockStorage.Object);

        using var imageStream = new MemoryStream(ValidPngBytes);

        // Act
        var response = await chatService.ProcessVisionMessageAsync(
            studentProfileId: studentProfile.Id,
            imageStream: imageStream,
            fileName: "math_homework.png",
            contentType: "image/png",
            question: "Shu masalani tushuntirib ber",
            conversationId: null,
            subjectId: null,
            language: "uz"
        );

        // Assert
        Assert.NotNull(response);
        Assert.True(response.Success);
        Assert.Contains("ishora xatosi", response.Answer);
        Assert.NotNull(response.ImageUrl);
        Assert.Equal("/uploads/vision/2026/10/test-photo.png", response.ImageUrl);

        // Check messages saved in DB
        var conv = await db.ChatConversations.Include(c => c.Messages).FirstOrDefaultAsync(c => c.Id == response.ConversationId);
        Assert.NotNull(conv);
        Assert.Equal(2, conv.Messages.Count);

        var userMsg = conv.Messages.First(m => m.Sender == MessageSender.User);
        Assert.Equal("Shu masalani tushuntirib ber", userMsg.Content);
        Assert.Equal("/uploads/vision/2026/10/test-photo.png", userMsg.ImageUrl);

        var assistantMsg = conv.Messages.First(m => m.Sender == MessageSender.Assistant);
        Assert.Equal(response.Answer, assistantMsg.Content);

        // Check VisionInteraction saved in DB
        var visionRecord = await db.VisionInteractions.FirstOrDefaultAsync(v => v.StudentProfileId == studentProfile.Id);
        Assert.NotNull(visionRecord);
        Assert.Equal("/uploads/vision/2026/10/test-photo.png", visionRecord.ImageUrl);
        Assert.Equal("Shu masalani tushuntirib ber", visionRecord.Question);
        Assert.Equal(response.Answer, visionRecord.AIResponse);
        Assert.NotNull(userMsg.VisionInteractionId);
        Assert.Equal(visionRecord.Id, userMsg.VisionInteractionId);

        // Test Vision History retrieval
        var history = await chatService.GetVisionHistoryAsync(studentProfile.Id);
        Assert.Single(history);
        Assert.Equal(visionRecord.Id, history[0].Id);
    }
}
