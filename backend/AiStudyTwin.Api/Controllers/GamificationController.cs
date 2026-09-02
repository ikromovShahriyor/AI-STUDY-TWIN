using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiStudyTwin.Api.Controllers;

[Authorize]
public class GamificationController : BaseApiController
{
    private readonly GamificationService _gamificationService;

    public GamificationController(GamificationService gamificationService)
    {
        _gamificationService = gamificationService;
    }

    [HttpGet("achievements")]
    public async Task<ActionResult<List<AchievementDto>>> GetAchievements(CancellationToken cancellationToken)
    {
        var list = await _gamificationService.GetAchievementsAsync(CurrentStudentProfileId, cancellationToken);
        return Ok(list);
    }

    [HttpGet("challenges")]
    public async Task<ActionResult<List<DailyChallengeDto>>> GetDailyChallenges(CancellationToken cancellationToken)
    {
        var list = await _gamificationService.GetDailyChallengesAsync(CurrentStudentProfileId, cancellationToken);
        return Ok(list);
    }

    [HttpPost("challenges/{id}/claim")]
    public async Task<ActionResult<int>> ClaimChallenge(Guid id, CancellationToken cancellationToken)
    {
        var xp = await _gamificationService.ClaimChallengeRewardAsync(CurrentStudentProfileId, id, cancellationToken);
        return Ok(new { claimedXp = xp });
    }

    [HttpGet("leaderboard")]
    public async Task<ActionResult<List<LeaderboardUserDto>>> GetLeaderboard(CancellationToken cancellationToken)
    {
        var list = await _gamificationService.GetLeaderboardAsync(cancellationToken);
        return Ok(list);
    }
}
