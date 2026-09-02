using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiStudyTwin.Api.Controllers;

[Authorize]
public class TestController : BaseApiController
{
    private readonly TestService _testService;

    public TestController(TestService testService)
    {
        _testService = testService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TestDto>>> GetTests([FromQuery] Guid? subjectId, [FromQuery] bool? isDiagnostic, CancellationToken cancellationToken)
    {
        var tests = await _testService.GetTestsAsync(subjectId, isDiagnostic, cancellationToken);
        return Ok(tests);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TestDto>> GetTestById(Guid id, CancellationToken cancellationToken)
    {
        var test = await _testService.GetTestByIdAsync(id, cancellationToken);
        return Ok(test);
    }

    [HttpPost("submit")]
    public async Task<ActionResult<TestResultDto>> SubmitTest([FromBody] SubmitTestRequest request, CancellationToken cancellationToken)
    {
        var result = await _testService.SubmitTestAsync(CurrentStudentProfileId, request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("results/{resultId}")]
    public async Task<ActionResult<TestResultDto>> GetResultById(Guid resultId, CancellationToken cancellationToken)
    {
        var result = await _testService.GetResultByIdAsync(resultId, cancellationToken);
        return Ok(result);
    }
}
