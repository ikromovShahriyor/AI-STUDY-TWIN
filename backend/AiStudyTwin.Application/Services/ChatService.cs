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
    private readonly IFileStorageService _fileStorage;

    public ChatService(
        IAppDbContext db,
        IAiProviderService aiProvider,
        IWebSearchService webSearch,
        IFileStorageService? fileStorage = null)
    {
        _db = db;
        _aiProvider = aiProvider;
        _webSearch = webSearch;
        _fileStorage = fileStorage!;
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

    public async Task<VisionAnalyzeResponse> ProcessVisionMessageAsync(
        Guid studentProfileId,
        Stream imageStream,
        string fileName,
        string contentType,
        string? question,
        Guid? conversationId,
        Guid? subjectId,
        string language = "uz",
        CancellationToken cancellationToken = default)
    {
        // 1. Validate stream
        if (imageStream == null || imageStream.Length == 0)
        {
            throw new ValidationException("Image", "Rasm fayli yuborilmadi.");
        }

        // 2. Read stream into byte array for multimodal provider
        using var ms = new MemoryStream();
        await imageStream.CopyToAsync(ms, cancellationToken);
        var imageBytes = ms.ToArray();

        // 3. Save to storage via IFileStorageService
        ms.Position = 0;
        var (relativeUrl, absolutePath) = await _fileStorage.SaveImageAsync(ms, fileName, "vision", cancellationToken);

        // 4. Retrieve or create conversation
        ChatConversation conversation;
        if (conversationId.HasValue)
        {
            conversation = await _db.ChatConversations
                .Include(c => c.Subject)
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == conversationId.Value && c.StudentProfileId == studentProfileId, cancellationToken)
                ?? throw new NotFoundException("Suhbat", conversationId.Value);
        }
        else
        {
            var title = string.IsNullOrWhiteSpace(question)
                ? "📷 Foto dars"
                : (question.Length > 30 ? question[..30] + "..." : question);

            conversation = new ChatConversation
            {
                StudentProfileId = studentProfileId,
                SubjectId = subjectId,
                Title = title
            };
            _db.ChatConversations.Add(conversation);
            await _db.SaveChangesAsync(cancellationToken);
        }

        // 5. Gather prior conversation history
        var priorHistory = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .TakeLast(HistoryLimit)
            .Select(m => new AiChatMessage(m.Sender == MessageSender.User ? "user" : "assistant", m.Content))
            .ToList();

        // 6. Add user message with image attached
        var userContent = string.IsNullOrWhiteSpace(question) ? "📷 [Rasm yuborildi]" : question.Trim();
        var userMsg = new ChatMessage
        {
            ConversationId = conversation.Id,
            Sender = MessageSender.User,
            Content = userContent,
            ImageUrl = relativeUrl,
            CreatedAt = DateTime.UtcNow
        };
        _db.ChatMessages.Add(userMsg);

        // 7. Prepare pedagogical Vision Tutor system instructions
        var profile = await _db.StudentProfiles.FindAsync(new object[] { studentProfileId }, cancellationToken);
        var subjectContext = conversation.Subject?.NameUz;
        var level = profile?.KnowledgeLevel ?? KnowledgeLevel.Beginner;

        var visionSystemPrompt =
            "Sen AI Study Twin platformasining professional AI Photo Teacher va Vision Tutor repetitorisan.\n\n" +
            "Sening vazifang o'quvchi yuborgan rasmni (matematika, formulalar, fizika, kimyo, biologiya, tarix, geografiya, kitob sahifalari, test savollari, diagramma va grafiklar, jadvallar, studentning daftaridagi handwritten yozuvlar va uy vazifalarini) diqqat bilan tushunib, unga dars berishdir.\n\n" +
            "[MUHIM PEDAGOGIK TALABLAR]:\n" +
            "1. FAQAT yakuniy javobni berma! O'quvchiga teacher kabi qadamma-qadam, formulalar va qoidalarni izohlab tushuntir.\n" +
            "2. AGAR O'QUVCHINING O'Z YECHIMI YOKI UY VAZIFASI BO'LSA (Homework Checker):\n" +
            "   - Masalani va student yechimini aniqla;\n" +
            "   - Qaysi qadamlari to'g'ri ekanini tasdiqla;\n" +
            "   - Xatoni aniq ko'rsat (masalan: ❌ '3-qadamda ishora xatosi bor');\n" +
            "   - Xatoning sababini muloyim tushuntir;\n" +
            "   - To'g'ri yechimni ko'rsat.\n" +
            "3. AGAR RASM SIFATI XIRA YOKI O'QIB BO'LMAS BO'LSA:\n" +
            "   - O'quvchiga rasmni yorug'roq joyda yoki aniqroq qilib qayta olishni muloyim tavsiya qil.\n" +
            "4. BILIM DARAJASIGA MOSLASHTIRISH:\n" +
            $"   - O'quvchining bilim darajasi: {level}. Tushuntirish uslubi aynan shunga mos bo'lsin (Beginner uchun soddaroq, Advanced uchun chuqurroq).\n" +
            "5. INTERAKTIV O'QITISH:\n" +
            "   - Tushuntirish oxirida student bilan darsni davom ettirish uchun:\n" +
            "     'Shunga o'xshash bitta masala yechib ko'rishni xohlaysanmi?' deb taklif ber.\n" +
            $"6. Interfeys tili: {language} (uz/en/ru). O'quvchi yozgan yoki tanlagan tilda ravon javob ber.";

        var promptToSend = string.IsNullOrWhiteSpace(question)
            ? "Ushbu rasmni diqqat bilan o'rganib, dars materialini, masalani yoki formulani qadamma-qadam tushuntirib ber."
            : question.Trim();

        // 8. Generate multimodal AI Vision response
        var aiAnswer = await _aiProvider.AnalyzeVisionImageAsync(
            imageBytes,
            contentType,
            promptToSend,
            visionSystemPrompt,
            priorHistory,
            subjectContext,
            language,
            cancellationToken
        );

        // 9. Save assistant response to conversation
        var assistantMsg = new ChatMessage
        {
            ConversationId = conversation.Id,
            Sender = MessageSender.Assistant,
            Content = aiAnswer,
            CreatedAt = DateTime.UtcNow
        };
        _db.ChatMessages.Add(assistantMsg);
        conversation.UpdatedAt = DateTime.UtcNow;

        // 10. Extract summary snippet and detect subject
        var detectedSubject = subjectContext ?? DetectSubjectFromContent(promptToSend + " " + aiAnswer);
        var extractedSnippet = promptToSend.Length > 80 ? promptToSend[..80] + "..." : promptToSend;

        // 11. Record Vision Interaction history in DB
        var visionInteraction = new VisionInteraction
        {
            StudentProfileId = studentProfileId,
            ConversationId = conversation.Id,
            SubjectId = conversation.SubjectId,
            ImageUrl = relativeUrl,
            StoragePath = absolutePath,
            Question = question,
            AIResponse = aiAnswer,
            ExtractedContent = extractedSnippet,
            DetectedSubject = detectedSubject,
            Confidence = 0.95,
            CreatedAt = DateTime.UtcNow
        };
        _db.VisionInteractions.Add(visionInteraction);

        userMsg.VisionInteractionId = visionInteraction.Id;

        // 12. Update daily challenge progress for chat
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

        return new VisionAnalyzeResponse(
            true,
            extractedSnippet,
            aiAnswer,
            detectedSubject,
            0.95,
            conversation.Id,
            MapToMessageDto(assistantMsg),
            relativeUrl
        );
    }

    public async Task<List<VisionHistoryDto>> GetVisionHistoryAsync(Guid studentProfileId, CancellationToken cancellationToken = default)
    {
        var items = await _db.VisionInteractions
            .Include(v => v.Subject)
            .Where(v => v.StudentProfileId == studentProfileId)
            .OrderByDescending(v => v.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);

        return items.Select(v => new VisionHistoryDto(
            v.Id,
            v.StudentProfileId,
            v.ConversationId,
            v.Subject?.NameUz,
            v.ImageUrl,
            v.Question,
            v.AIResponse,
            v.ExtractedContent,
            v.DetectedSubject,
            v.CreatedAt
        )).ToList();
    }

    private static string DetectSubjectFromContent(string text)
    {
        var lower = text.ToLowerInvariant();
        if (lower.Contains("tenglama") || lower.Contains("integral") || lower.Contains("hosila") || lower.Contains("formula") || lower.Contains("ildiz") || lower.Contains("x =") || lower.Contains("+") || lower.Contains("-"))
            return "Matematika";
        if (lower.Contains("tezlik") || lower.Contains("kuch") || lower.Contains("massa") || lower.Contains("nyuton") || lower.Contains("tok") || lower.Contains("energiya"))
            return "Fizika";
        if (lower.Contains("molekula") || lower.Contains("reaksiya") || lower.Contains("atom") || lower.Contains("kislota") || lower.Contains("element"))
            return "Kimyo";
        if (lower.Contains("hujayra") || lower.Contains("dnk") || lower.Contains("organizm") || lower.Contains("o'simlik"))
            return "Biologiya";
        if (lower.Contains("kod") || lower.Contains("funksiya") || lower.Contains("dastur") || lower.Contains("class") || lower.Contains("python") || lower.Contains("javascript"))
            return "Dasturlash & IT";

        return "Umumiy ta'lim";
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
            m.ImageUrl,
            m.CreatedAt
        );
    }
}
