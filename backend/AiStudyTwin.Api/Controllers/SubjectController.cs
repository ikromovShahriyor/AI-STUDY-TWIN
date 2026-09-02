using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Api.Controllers;

public class SubjectController : BaseApiController
{
    private readonly IAppDbContext _db;

    public SubjectController(IAppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<SubjectDto>>> GetSubjects(CancellationToken cancellationToken)
    {
        var subjects = await _db.Subjects
            .Include(s => s.Topics)
            .Include(s => s.Tests)
            .Where(s => s.IsActive)
            .OrderBy(s => s.OrderIndex)
            .ToListAsync(cancellationToken);

        var dtos = subjects.Select(s => new SubjectDto(
            s.Id,
            s.NameUz,
            s.NameEn,
            s.NameRu,
            s.Code,
            s.Description,
            s.Icon,
            s.GradientColor,
            s.OrderIndex,
            s.Topics.Count,
            s.Tests.Count
        )).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id}/topics")]
    public async Task<ActionResult<List<TopicDto>>> GetTopicsBySubject(Guid id, CancellationToken cancellationToken)
    {
        var topics = await _db.Topics
            .Where(t => t.SubjectId == id)
            .OrderBy(t => t.OrderIndex)
            .ToListAsync(cancellationToken);

        var dtos = topics.Select(t => new TopicDto(
            t.Id,
            t.SubjectId,
            t.TitleUz,
            t.TitleEn,
            t.TitleRu,
            t.Description,
            t.Difficulty,
            t.EstimatedMinutes,
            t.OrderIndex
        )).ToList();

        return Ok(dtos);
    }
}
