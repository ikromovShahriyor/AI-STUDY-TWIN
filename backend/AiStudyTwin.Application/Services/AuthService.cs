using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Domain.Entities;
using AiStudyTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Application.Services;

public class AuthService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        IAppDbContext db,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ValidationException("Email/Password", "Email va parol kiritilishi shart.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var exists = await _db.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken);
        if (exists)
        {
            throw new AppException("Ushbu email bilan ro'yxatdan o'tilgan foydalanuvchi mavjud.", 409);
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = UserRole.Student,
            IsActive = true
        };

        var studentProfile = new StudentProfile
        {
            User = user,
            GradeLevel = request.GradeLevel,
            TargetExam = string.IsNullOrWhiteSpace(request.TargetExam) ? "General Knowledge" : request.TargetExam,
            PreferredLanguage = string.IsNullOrWhiteSpace(request.PreferredLanguage) ? "uz" : request.PreferredLanguage,
            KnowledgeLevel = KnowledgeLevel.Beginner,
            DailyStudyGoalMinutes = 45,
            CurrentStreak = 1,
            BestStreak = 1,
            TotalXp = 100, // Welcome bonus XP
            Level = 1
        };

        user.StudentProfile = studentProfile;

        // Auto-assign starter achievements and challenges
        var welcomeAchievement = await _db.Achievements.FirstOrDefaultAsync(a => a.Category == "Starter" || a.RequiredXp == 0, cancellationToken);
        if (welcomeAchievement != null)
        {
            studentProfile.Achievements.Add(new StudentAchievement
            {
                Achievement = welcomeAchievement,
                UnlockedAt = DateTime.UtcNow
            });
        }

        // Generate tokens
        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(14);

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtTokenService.GenerateAccessToken(user);

        return new AuthResponse(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddHours(2),
            new UserDto(user.Id, user.FullName, user.Email, user.Role, studentProfile.Id)
        );
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Email yoki parol noto'g'ri.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedException("Foydalanuvchi hisobi faol emas.");
        }

        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(14);
        await _db.SaveChangesAsync(cancellationToken);

        var accessToken = _jwtTokenService.GenerateAccessToken(user);

        return new AuthResponse(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddHours(2),
            new UserDto(user.Id, user.FullName, user.Email, user.Role, user.StudentProfile?.Id)
        );
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken, cancellationToken);

        if (user == null || user.RefreshTokenExpiry == null || user.RefreshTokenExpiry < DateTime.UtcNow)
        {
            throw new UnauthorizedException("Refresh token yaroqsiz yoki muddati o'tgan.");
        }

        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(14);
        await _db.SaveChangesAsync(cancellationToken);

        var newAccessToken = _jwtTokenService.GenerateAccessToken(user);

        return new AuthResponse(
            newAccessToken,
            newRefreshToken,
            DateTime.UtcNow.AddHours(2),
            new UserDto(user.Id, user.FullName, user.Email, user.Role, user.StudentProfile?.Id)
        );
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users
            .Include(u => u.StudentProfile)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("Foydalanuvchi", userId);
        }

        return new UserDto(user.Id, user.FullName, user.Email, user.Role, user.StudentProfile?.Id);
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);
        if (user == null)
        {
            return; // Security best practice: do not leak email existence
        }

        user.PasswordResetToken = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
        user.PasswordResetExpiry = DateTime.UtcNow.AddHours(1);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);
        if (user == null || user.PasswordResetToken != request.Token || user.PasswordResetExpiry < DateTime.UtcNow)
        {
            throw new AppException("Parolni tiklash kodi noto'g'ri yoki muddati tugagan.", 400);
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetExpiry = null;
        await _db.SaveChangesAsync(cancellationToken);
    }
}
