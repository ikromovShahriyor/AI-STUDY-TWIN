using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiStudyTwin.Api.Controllers;

[Authorize]
public class VoiceController : BaseApiController
{
    private readonly VoiceService _voiceService;

    public VoiceController(VoiceService voiceService)
    {
        _voiceService = voiceService;
    }

    [HttpPost("transcribe")]
    public async Task<ActionResult<TranscribeAudioResponse>> Transcribe(IFormFile file, [FromQuery] string language = "uz", CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Audio fayl taqdim etilmadi.");
        }

        using var stream = file.OpenReadStream();
        var result = await _voiceService.TranscribeAsync(stream, file.FileName, language, cancellationToken);
        return Ok(result);
    }

    [HttpPost("voice-chat")]
    public async Task<ActionResult<VoiceChatResponse>> VoiceChat(
        IFormFile? file,
        [FromForm] string? text,
        [FromForm] Guid? conversationId,
        [FromForm] Guid? subjectId,
        [FromForm] string language = "uz",
        CancellationToken cancellationToken = default)
    {
        Stream stream;
        string fileName = "audio.wav";

        if (file != null && file.Length > 0)
        {
            stream = file.OpenReadStream();
            fileName = file.FileName;
        }
        else
        {
            stream = new MemoryStream();
        }

        var response = await _voiceService.ProcessVoiceMessageAsync(
            CurrentStudentProfileId,
            stream,
            fileName,
            conversationId,
            subjectId,
            language,
            cancellationToken
        );

        return Ok(response);
    }

    [HttpPost("synthesize")]
    public async Task<IActionResult> Synthesize([FromBody] SynthesizeSpeechRequest request, CancellationToken cancellationToken)
    {
        var audioBytes = await _voiceService.SynthesizeAsync(request.Text, request.Language, cancellationToken);
        if (audioBytes.Length == 0)
        {
            return Ok(new { useWebSpeech = true });
        }

        return File(audioBytes, "audio/mpeg", "speech.mp3");
    }
}
