using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiStudyTwin.Api.Controllers;

[Authorize]
[Route("api/ai/vision")]
[Route("api/vision")]
public class VisionController : BaseApiController
{
    private readonly ChatService _chatService;

    public VisionController(ChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost("analyze")]
    public async Task<ActionResult<VisionAnalyzeResponse>> Analyze(
        IFormFile image,
        [FromForm] string? question,
        [FromForm] Guid? conversationId,
        [FromForm] Guid? subjectId,
        [FromForm] string language = "uz",
        CancellationToken cancellationToken = default)
    {
        if (image == null || image.Length == 0)
        {
            return BadRequest(new { message = "Rasm fayli taqdim etilmadi." });
        }

        using var stream = image.OpenReadStream();
        var result = await _chatService.ProcessVisionMessageAsync(
            CurrentStudentProfileId,
            stream,
            image.FileName,
            image.ContentType,
            question,
            conversationId,
            subjectId,
            language,
            cancellationToken
        );

        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<VisionHistoryDto>>> GetHistory(CancellationToken cancellationToken)
    {
        var history = await _chatService.GetVisionHistoryAsync(CurrentStudentProfileId, cancellationToken);
        return Ok(history);
    }
}
