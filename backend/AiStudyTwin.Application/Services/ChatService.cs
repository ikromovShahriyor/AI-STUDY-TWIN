using System.Text.Json;
using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Domain.Entities;
using AiStudyTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;
namespace AiStudyTwin.Application.Services;

public class ChatService
{
    private const int HistoryLimit = 15;
    private readonly IAppDbContext _db;
    private readonly IAiProviderService _aiProvider;
    private readonly IWebSearchService _webSearch;

    public ChatService(
        IAppDbContext db,
        IAiProviderService aiProvider,
        IWebSearchService webSearch)
    {
        _db = db;
        _aiProvider = aiProvider;
        _webSearch = webSearch;
    }

    public async Task<List<ConversationDto>> GetConversationsAsync(Guid studentProfileId, CancellationToken cancellationToken = default)
    {
        var conversations = await _db.ChatConversations
            .Include(c => c.Subject)
            .Include(c => c.Messages)
            .Where(c => c.StudentProfileId == studentProfileId)
            .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
            .ToListAsync(cancellationToken);

        return conversations.Select(c =>
        {
            var lastMsg = c.Messages.OrderByDescending(m => m.CreatedAt).FirstOrDefault();
            return new ConversationDto(
                c.Id,
                c.StudentProfileId,
                c.SubjectId,
                c.Subject?.NameUz,
                c.Title,
                c.CreatedAt,
                c.UpdatedAt,
                c.Messages.Count,
                lastMsg?.Content != null && lastMsg.Content.Length > 60 ? lastMsg.Content[..60] + "..." : lastMsg?.Content
            );
        }).ToList();
    }

    public async Task<ConversationDto> CreateConversationAsync(Guid studentProfileId, CreateConversationRequest request, CancellationToken cancellationToken = default)
    {
        var conv = new ChatConversation
        {
            StudentProfileId = studentProfileId,
            SubjectId = request.SubjectId,
            Title = string.IsNullOrWhiteSpace(request.Title) ? "Yangi suhbat" : request.Title
        };

        _db.ChatConversations.Add(conv);
        await _db.SaveChangesAsync(cancellationToken);

        return new ConversationDto(
            conv.Id,
            conv.StudentProfileId,
            conv.SubjectId,
            null,
            conv.Title,
            conv.CreatedAt,
            conv.UpdatedAt,
            0,
            null
        );
    }

    public async Task<List<MessageDto>> GetMessagesAsync(Guid conversationId, Guid studentProfileId, CancellationToken cancellationToken = default)
    {
        var conv = await _db.ChatConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.StudentProfileId == studentProfileId, cancellationToken);

        if (conv == null) throw new NotFoundException("Suhbat", conversationId);

        return conv.Messages
            .OrderBy(m => m.CreatedAt)
            .Select(MapToMessageDto)
            .ToList();
    }

    public async Task<MessageDto> SendMessageAsync(Guid studentProfileId, SendMessageRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            throw new ValidationException("Content", "Xabar matni bo'sh bo'lishi mumkin emas.");

        ChatConversation? conversation;

        if (request.ConversationId.HasValue)
        {
            conversation = await _db.ChatConversations
                .Include(c => c.Subject)
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == request.ConversationId.Value && c.StudentProfileId == studentProfileId, cancellationToken);

            if (conversation == null) throw new NotFoundException("Suhbat", request.ConversationId.Value);
        }
        else
        {
            // Create new conversation
            string title = request.Content.Length > 35 ? request.Content[..35] + "..." : request.Content;
            conversation = new ChatConversation
            {
                StudentProfileId = studentProfileId,
                SubjectId = request.SubjectId,
                Title = title
            };
            _db.ChatConversations.Add(conversation);
            await _db.SaveChangesAsync(cancellationToken);
        }

        // 1. Collect prior conversation history (excluding the new prompt to avoid consecutive duplicates)
        var priorHistory = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .TakeLast(HistoryLimit)
            .Select(m => new AiChatMessage(m.Sender == MessageSender.User ? "user" : "assistant", m.Content))
            .ToList();

        // 2. Add current user message to DB conversation
        var userMsg = new ChatMessage
        {
            ConversationId = conversation.Id,
            Sender = MessageSender.User,
            Content = request.Content.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        _db.ChatMessages.Add(userMsg);

        // 3. Prepare professional pedagogical system prompt
        var profile = await _db.StudentProfiles.FindAsync(new object[] { studentProfileId }, cancellationToken);
        var subjectContext = conversation.Subject?.NameUz;

        var defaultPrompt = "Sen AI Study Twin platformasining aqlli AI o'qituvchisisan.\n\n" +
            "Sening vazifang o'quvchilarga savollariga qarab individual va foydali javob berishdir.\n\n" +
            "Har bir foydalanuvchi savolini alohida tahlil qil.\n\n" +
            "Bir xil universal javobni hamma savolga qaytarma.\n\n" +
            "Agar foydalanuvchi dasturlash haqida so'rasa, dasturlash bo'yicha javob ber.\n\n" +
            "Agar matematika haqida so'rasa, matematika bo'yicha javob ber.\n\n" +
            "Agar tarix haqida so'rasa, tarix bo'yicha javob ber.\n\n" +
            "Murakkab mavzularni sodda va tushunarli qilib izohla.\n\n" +
            "Kerak bo'lsa misollar keltir.\n\n" +
            "Oldingi conversation history'ni hisobga ol.\n\n" +
            "Foydalanuvchi qaysi tilda yozsa, imkon qadar o'sha tilda javob ber.\n\n" +
            "Uzbek, English va Russian tillarini qo'llab-quvvatla.\n\n" +
            "Bilmaysan deb taxmin qilinadigan ma'lumotni to'qib chiqarmagin.\n\n" +
            "[JAVOB FORMATI VA CHIROYLI KO'RINISH]:\n" +
            "- Javoblaringni toza, ravon va ko'zni charchatmaydigan qilib yoz.\n" +
            "- Ortiqcha yulduzchalar (*, **), ketma-ket chiziqchalar (---) yoki xunuk aralash belgilarni ishlatma.\n" +
            "- Ro'yxatlar tuzayotganda 1., 2., 3. kabi tartib raqamlari yoki mos emojilardan (masalan: 🔹, 📌, ✅) foydalan.\n" +
            "- Matn strukturasini aniq, lo'nda va chiroyli paragraflar bilan taqdim et.";

        string systemInstruction = $"{defaultPrompt}\n\n" +
            $"[KONTEKST]:\n" +
            $"O'quvchi darajasi: {profile?.KnowledgeLevel ?? KnowledgeLevel.Beginner}.\n" +
            $"Foydalanuvchi tanlagan fan/mavzu: {subjectContext ?? "Umumiy ta'lim va o'quv fanlari"}.\n" +
            $"Foydalanuvchi interfeys tili: {request.Language} (uz/en/ru).";

        // 4. Generate response from AI Provider
        var aiRes = await _aiProvider.GenerateChatResponseAsync(
            request.Content.Trim(),
            systemInstruction,
            priorHistory,
            subjectContext,
            request.Language,
            cancellationToken
        );

        string? sourcesJson = aiRes.Sources != null && aiRes.Sources.Any()
            ? JsonSerializer.Serialize(aiRes.Sources)
            : null;

        var assistantMsg = new ChatMessage
        {
            ConversationId = conversation.Id,
            Sender = MessageSender.Assistant,
            Content = aiRes.Content,
            SourcesJson = sourcesJson,
            CreatedAt = DateTime.UtcNow
        };
        _db.ChatMessages.Add(assistantMsg);
        conversation.UpdatedAt = DateTime.UtcNow;

        // 5. Update daily mission for chat activity
        var chatChallenge = await _db.StudentDailyChallenges
            .Include(c => c.DailyChallenge)
            .FirstOrDefaultAsync(c => c.StudentProfileId == studentProfileId && c.Date == DateTime.UtcNow.Date && c.DailyChallenge.ChallengeType == ChallengeType.ChatWithAi, cancellationToken);

        if (chatChallenge != null && !chatChallenge.IsCompleted)
        {
            chatChallenge.CurrentCount++;
            if (chatChallenge.CurrentCount >= chatChallenge.DailyChallenge.TargetCount)
            {
                chatChallenge.IsCompleted = true;
                chatChallenge.CompletedAt = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync(cancellationToken);

        return MapToMessageDto(assistantMsg);
    }

    public async Task DeleteConversationAsync(Guid conversationId, Guid studentProfileId, CancellationToken cancellationToken = default)
    {
        var conv = await _db.ChatConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.StudentProfileId == studentProfileId, cancellationToken);

        if (conv != null)
        {
            _db.ChatMessages.RemoveRange(conv.Messages);
            _db.ChatConversations.Remove(conv);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    private static MessageDto MapToMessageDto(ChatMessage m)
    {
        List<WebSearchSourceDto>? sources = null;
        if (!string.IsNullOrEmpty(m.SourcesJson))
        {
            try
            {
                var rawSources = JsonSerializer.Deserialize<List<WebSearchResult>>(m.SourcesJson);
                sources = rawSources?.Select(s => new WebSearchSourceDto(s.Title, s.Snippet, s.Url)).ToList();
            }
            catch { }
        }

        return new MessageDto(
            m.Id,
            m.ConversationId,
            m.Sender,
            m.Content,
            sources,
            m.AudioUrl,
            m.CreatedAt
        );
    }
}
