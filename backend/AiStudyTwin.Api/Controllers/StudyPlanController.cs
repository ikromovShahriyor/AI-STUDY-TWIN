using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiStudyTwin.Api.Controllers;

[Authorize]
public class StudyPlanController : BaseApiController
{
    private readonly StudyPlanService _planService;

    public StudyPlanController(StudyPlanService planService)
    {
        _planService = planService;
    }

    [HttpGet("active")]
    public async Task<ActionResult<StudyPlanDto>> GetActivePlan(CancellationToken cancellationToken)
    {
        var plan = await _planService.GetActivePlanAsync(CurrentStudentProfileId, cancellationToken);
        return Ok(plan);
    }

    [HttpPost("manual")]
    public async Task<ActionResult<StudyPlanDto>> CreateManualPlan([FromBody] CreateStudyPlanRequest request, CancellationToken cancellationToken)
    {
        var plan = await _planService.CreateManualPlanAsync(CurrentStudentProfileId, request, cancellationToken);
        return Ok(plan);
    }

    [HttpPost("generate-ai")]
    public async Task<ActionResult<StudyPlanDto>> GenerateAiPlan([FromBody] GenerateAiPlanRequest request, CancellationToken cancellationToken)
    {
        var plan = await _planService.GenerateAiPlanAsync(CurrentStudentProfileId, request, cancellationToken);
        return Ok(plan);
    }

    [HttpPatch("tasks/{taskId}/status")]
    public async Task<ActionResult<StudyTaskDto>> UpdateTaskStatus(Guid taskId, [FromBody] UpdateTaskStatusRequest request, CancellationToken cancellationToken)
    {
        var task = await _planService.UpdateTaskStatusAsync(taskId, CurrentStudentProfileId, request.Status, cancellationToken);
        return Ok(task);
    }

    [HttpPost("tasks/custom")]
    public async Task<ActionResult<StudyTaskDto>> AddCustomTask([FromBody] CreateCustomTaskRequest request, CancellationToken cancellationToken)
    {
        var task = await _planService.AddCustomTaskAsync(CurrentStudentProfileId, request, cancellationToken);
        return Ok(task);
    }
}
