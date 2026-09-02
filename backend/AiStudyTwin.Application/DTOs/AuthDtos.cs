using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Application.DTOs;

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string? GradeLevel,
    string? TargetExam,
    string PreferredLanguage = "uz"
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record UserDto(
    Guid Id,
    string FullName,
    string Email,
    UserRole Role,
    Guid? StudentProfileId
);

public record RefreshTokenRequest(
    string AccessToken,
    string RefreshToken
);

public record ForgotPasswordRequest(
    string Email
);

public record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword
);
