using AiStudyTwin.Domain.Entities;

namespace AiStudyTwin.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? UserEmail { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
}
