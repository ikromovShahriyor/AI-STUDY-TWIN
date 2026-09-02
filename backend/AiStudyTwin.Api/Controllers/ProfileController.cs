using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiStudyTwin.Api.Controllers;

[Authorize]
public class ProfileController : BaseApiController
{
    private readonly ProfileService _profileService;

    public ProfileController(ProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<ActionResult<StudentProfileDto>> GetProfile(CancellationToken cancellationToken)
    {
        var profile = await _profileService.GetProfileByUserIdAsync(CurrentUserId, cancellationToken);
        return Ok(profile);
    }

    [HttpPut]
    public async Task<ActionResult<StudentProfileDto>> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var profile = await _profileService.UpdateProfileAsync(CurrentUserId, request, cancellationToken);
        return Ok(profile);
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        await _profileService.ChangePasswordAsync(CurrentUserId, request, cancellationToken);
        return Ok(new { message = "Parol muvaffaqiyatli yangilandi." });
    }
}
