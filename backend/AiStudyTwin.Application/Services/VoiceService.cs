using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Application.Services;

public class VoiceService
{
    private readonly IAppDbContext _db;
    private readonly ISpeechService _speechService;
    private readonly ChatService _chatService;

    public VoiceService(
        IAppDbContext db,
        ISpeechService speechService,
        ChatService chatService)
    {
        _db = db;
        _speechService = speechService;
        _chatService = chatService;
    }

    public async Task<TranscribeAudioResponse> TranscribeAsync(Stream audioStream, string fileName, string language = "uz", CancellationToken cancellationToken = default)
    {
        var text = await _speechService.TranscribeAudioAsync(audioStream, fileName, language, cancellationToken);
        return new TranscribeAudioResponse(text, language, 1000);
    }

    public async Task<byte[]> SynthesizeAsync(string text, string language = "uz", CancellationToken cancellationToken = default)
    {
        return await _speechService.SynthesizeSpeechAsync(text, language, cancellationToken);
    }

    public async Task<VoiceChatResponse> ProcessVoiceMessageAsync(
        Guid studentProfileId,
        Stream audioStream,
        string fileName,
        Guid? conversationId = null,
        Guid? subjectId = null,
        string language = "uz",
        CancellationToken cancellationToken = default)
    {
        // 1. STT: Transcribe audio to text
        var transcribedText = await _speechService.TranscribeAudioAsync(audioStream, fileName, language, cancellationToken);
        if (string.IsNullOrWhiteSpace(transcribedText))
        {
            transcribedText = "Salom, mavzuni tushuntirib bering.";
        }

        // 2. Send message via ChatService
        var messageDto = await _chatService.SendMessageAsync(
            studentProfileId,
            new SendMessageRequest(conversationId, subjectId, transcribedText, language),
            cancellationToken
        );

        // 3. Save voice record
        var voiceRecord = new VoiceRecord
        {
            StudentProfileId = studentProfileId,
            TranscribedText = transcribedText,
            AiResponseText = messageDto.Content,
            Language = language,
            CreatedAt = DateTime.UtcNow
        };
        _db.VoiceRecords.Add(voiceRecord);
        await _db.SaveChangesAsync(cancellationToken);

        return new VoiceChatResponse(
            transcribedText,
            messageDto.Content,
            messageDto.Sources,
            messageDto.Id,
            messageDto.ConversationId
        );
    }
}
