using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiStudyTwin.Api.Controllers;

[Authorize]
public class ProgressController : BaseApiController
{
    private readonly ProgressService _progressService;

    public ProgressController(ProgressService progressService)
    {
        _progressService = progressService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats(CancellationToken cancellationToken)
    {
        var stats = await _progressService.GetDashboardStatsAsync(CurrentStudentProfileId, cancellationToken);
        return Ok(stats);
    }
}
