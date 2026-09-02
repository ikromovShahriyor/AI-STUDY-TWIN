using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace AiStudyTwin.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId
    {
        get
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(idClaim, out var guid) ? guid : Guid.Empty;
        }
    }

    protected Guid CurrentStudentProfileId
    {
        get
        {
            var idClaim = User.FindFirst("StudentProfileId")?.Value;
            return Guid.TryParse(idClaim, out var guid) ? guid : Guid.Empty;
        }
    }
}
