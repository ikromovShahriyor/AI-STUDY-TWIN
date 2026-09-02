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
}
