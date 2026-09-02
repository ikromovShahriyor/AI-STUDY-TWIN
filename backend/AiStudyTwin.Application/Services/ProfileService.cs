using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Application.Services;

public class ProfileService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public ProfileService(IAppDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    public async Task<StudentProfileDto> GetProfileByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var profile = await _db.StudentProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile == null)
        {
            throw new NotFoundException("Talaba profili", userId);
        }

        // Calculate level threshold
        int level = profile.Level;
        int nextLevelXp = level * 200;
        int currentLevelBaseXp = (level - 1) * 200;

        return new StudentProfileDto(
            profile.Id,
            profile.UserId,
            profile.User.FullName,
            profile.User.Email,
            profile.GradeLevel,
            profile.KnowledgeLevel,
            profile.TargetExam,
            profile.DailyStudyGoalMinutes,
            profile.CurrentStreak,
            profile.BestStreak,
            profile.TotalXp,
            profile.Level,
            profile.AvatarUrl,
            profile.Bio,
            profile.PreferredLanguage,
            nextLevelXp,
            currentLevelBaseXp
        );
    }

    public async Task<StudentProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var profile = await _db.StudentProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (profile == null)
        {
            throw new NotFoundException("Talaba profili", userId);
        }

        profile.User.FullName = request.FullName.Trim();
        profile.GradeLevel = request.GradeLevel;
        profile.TargetExam = request.TargetExam;
        profile.DailyStudyGoalMinutes = request.DailyStudyGoalMinutes > 0 ? request.DailyStudyGoalMinutes : 45;
        profile.Bio = request.Bio;
        profile.AvatarUrl = request.AvatarUrl;
        profile.PreferredLanguage = request.PreferredLanguage;
        profile.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return await GetProfileByUserIdAsync(userId, cancellationToken);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("Foydalanuvchi", userId);
        }

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new AppException("Hozirgi parol noto'g'ri.", 400);
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
    }
}
