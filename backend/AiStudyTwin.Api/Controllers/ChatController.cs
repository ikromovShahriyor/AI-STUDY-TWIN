using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiStudyTwin.Api.Controllers;

[Authorize]
public class ChatController : BaseApiController
{
    private readonly ChatService _chatService;

    public ChatController(ChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet("conversations")]
    public async Task<ActionResult<List<ConversationDto>>> GetConversations(CancellationToken cancellationToken)
    {
        var list = await _chatService.GetConversationsAsync(CurrentStudentProfileId, cancellationToken);
        return Ok(list);
    }

    [HttpPost("conversations")]
    public async Task<ActionResult<ConversationDto>> CreateConversation([FromBody] CreateConversationRequest request, CancellationToken cancellationToken)
    {
        var conv = await _chatService.CreateConversationAsync(CurrentStudentProfileId, request, cancellationToken);
        return Ok(conv);
    }

    [HttpGet("conversations/{id}/messages")]
    public async Task<ActionResult<List<MessageDto>>> GetMessages(Guid id, CancellationToken cancellationToken)
    {
        var messages = await _chatService.GetMessagesAsync(id, CurrentStudentProfileId, cancellationToken);
        return Ok(messages);
    }

    [HttpPost("send")]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] SendMessageRequest request, CancellationToken cancellationToken)
    {
        var msg = await _chatService.SendMessageAsync(CurrentStudentProfileId, request, cancellationToken);
        return Ok(msg);
    }

    [HttpDelete("conversations/{id}")]
    public async Task<IActionResult> DeleteConversation(Guid id, CancellationToken cancellationToken)
    {
        await _chatService.DeleteConversationAsync(id, CurrentStudentProfileId, cancellationToken);
        return NoContent();
    }

    [HttpPost("vision")]
    public async Task<ActionResult<VisionAnalyzeResponse>> SendVisionMessage(
        IFormFile image,
        [FromForm] string? question,
        [FromForm] Guid? conversationId,
        [FromForm] Guid? subjectId,
        [FromForm] string language = "uz",
        CancellationToken cancellationToken = default)
    {
        if (image == null || image.Length == 0)
        {
            return BadRequest(new { message = "Rasm fayli yuklanmadi." });
        }

        using var stream = image.OpenReadStream();
        var response = await _chatService.ProcessVisionMessageAsync(
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

        return Ok(response);
    }

    [HttpGet("vision/history")]
    public async Task<ActionResult<List<VisionHistoryDto>>> GetVisionHistory(CancellationToken cancellationToken)
    {
        var history = await _chatService.GetVisionHistoryAsync(CurrentStudentProfileId, cancellationToken);
        return Ok(history);
    }
}
