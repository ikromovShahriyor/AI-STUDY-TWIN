using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiStudyTwin.Api.Controllers;

[Authorize]
public class AiStudyTwinController : BaseApiController
{
    private readonly AiStudyTwinEngineService _engineService;

    public AiStudyTwinController(AiStudyTwinEngineService engineService)
    {
        _engineService = engineService;
    }

    [HttpGet("analysis")]
    public async Task<ActionResult<AiAnalysisDto>> GetAnalysis(CancellationToken cancellationToken)
    {
        var analysis = await _engineService.GetOrGenerateAnalysisAsync(CurrentStudentProfileId, cancellationToken);
        return Ok(analysis);
    }

    [HttpPost("explain-error")]
    public async Task<ActionResult<ErrorExplanationDto>> ExplainError([FromBody] ExplainErrorRequest request, CancellationToken cancellationToken)
    {
        var explanation = await _engineService.ExplainErrorAsync(CurrentStudentProfileId, request, cancellationToken);
        return Ok(explanation);
    }
}
