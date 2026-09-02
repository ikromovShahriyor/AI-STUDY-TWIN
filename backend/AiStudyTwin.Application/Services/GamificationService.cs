using AiStudyTwin.Application.Common.Exceptions;
using AiStudyTwin.Application.DTOs;
using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Application.Services;

public class GamificationService
{
    private readonly IAppDbContext _db;

    public GamificationService(IAppDbContext db)
    {
        _db = db;
    }

    public async Task<List<AchievementDto>> GetAchievementsAsync(Guid studentProfileId, CancellationToken cancellationToken = default)
    {
        var allAchievements = await _db.Achievements.OrderBy(a => a.RequiredXp).ToListAsync(cancellationToken);
        var unlocked = await _db.StudentAchievements
            .Where(sa => sa.StudentProfileId == studentProfileId)
            .ToListAsync(cancellationToken);

        return allAchievements.Select(a =>
        {
            var un = unlocked.FirstOrDefault(u => u.AchievementId == a.Id);
            return new AchievementDto(
                a.Id,
                a.TitleUz,
                a.TitleEn,
                a.TitleRu,
                a.DescriptionUz,
                a.DescriptionEn,
                a.DescriptionRu,
                a.Icon,
                a.RequiredXp,
                a.Category,
                a.Tier,
                a.XpBonus,
                un != null,
                un?.UnlockedAt
            );
        }).ToList();
    }

    public async Task<List<DailyChallengeDto>> GetDailyChallengesAsync(Guid studentProfileId, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var challenges = await _db.DailyChallenges.ToListAsync(cancellationToken);

        var studentChallenges = await _db.StudentDailyChallenges
            .Where(sc => sc.StudentProfileId == studentProfileId && sc.Date == today)
            .ToListAsync(cancellationToken);

        // Ensure each challenge has a student entry for today
        bool needSave = false;
        foreach (var ch in challenges)
        {
            if (!studentChallenges.Any(sc => sc.DailyChallengeId == ch.Id))
            {
                var entry = new StudentDailyChallenge
                {
                    StudentProfileId = studentProfileId,
                    DailyChallengeId = ch.Id,
                    CurrentCount = 0,
                    IsCompleted = false,
                    IsClaimed = false,
                    Date = today
                };
                _db.StudentDailyChallenges.Add(entry);
                studentChallenges.Add(entry);
                needSave = true;
            }
        }

        if (needSave)
        {
            await _db.SaveChangesAsync(cancellationToken);
        }

        return challenges.Select(ch =>
        {
            var sc = studentChallenges.First(s => s.DailyChallengeId == ch.Id);
            return new DailyChallengeDto(
                ch.Id,
                ch.TitleUz,
                ch.TitleEn,
                ch.TitleRu,
                ch.DescriptionUz,
                ch.DescriptionEn,
                ch.DescriptionRu,
                ch.XpReward,
                ch.ChallengeType,
                ch.TargetCount,
                sc.CurrentCount,
                ch.Icon,
                sc.IsCompleted,
                sc.IsClaimed
            );
        }).ToList();
    }

    public async Task<int> ClaimChallengeRewardAsync(Guid studentProfileId, Guid challengeId, CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var sc = await _db.StudentDailyChallenges
            .Include(s => s.DailyChallenge)
            .FirstOrDefaultAsync(s => s.StudentProfileId == studentProfileId && s.DailyChallengeId == challengeId && s.Date == today, cancellationToken);

        if (sc == null) throw new NotFoundException("Kunlik vazifa", challengeId);
        if (!sc.IsCompleted) throw new AppException("Ushbu topshiriq hali to'liq bajarilmagan.", 400);
        if (sc.IsClaimed) throw new AppException("Mukofot allaqachon olingan.", 400);

        sc.IsClaimed = true;

        var profile = await _db.StudentProfiles.FindAsync(new object[] { studentProfileId }, cancellationToken);
        if (profile != null)
        {
            profile.TotalXp += sc.DailyChallenge.XpReward;
            profile.Level = (profile.TotalXp / 200) + 1;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return sc.DailyChallenge.XpReward;
    }

    public async Task<List<LeaderboardUserDto>> GetLeaderboardAsync(CancellationToken cancellationToken = default)
    {
        var topProfiles = await _db.StudentProfiles
            .Include(p => p.User)
            .OrderByDescending(p => p.TotalXp)
            .Take(20)
            .ToListAsync(cancellationToken);

        int rank = 1;
        return topProfiles.Select(p => new LeaderboardUserDto(
            rank++,
            p.Id,
            p.User.FullName,
            p.AvatarUrl,
            p.TotalXp,
            p.Level,
            p.CurrentStreak
        )).ToList();
    }
}
