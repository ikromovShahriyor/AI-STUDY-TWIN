using AiStudyTwin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<StudentProfile> StudentProfiles { get; }
    DbSet<Subject> Subjects { get; }
    DbSet<Topic> Topics { get; }
    DbSet<StudyPlan> StudyPlans { get; }
    DbSet<StudyTask> StudyTasks { get; }
    DbSet<Test> Tests { get; }
    DbSet<Question> Questions { get; }
    DbSet<Answer> Answers { get; }
    DbSet<TestResult> TestResults { get; }
    DbSet<TestAnswerSubmission> TestAnswerSubmissions { get; }
    DbSet<Progress> Progresses { get; }
    DbSet<Achievement> Achievements { get; }
    DbSet<StudentAchievement> StudentAchievements { get; }
    DbSet<DailyChallenge> DailyChallenges { get; }
    DbSet<StudentDailyChallenge> StudentDailyChallenges { get; }
    DbSet<ChatConversation> ChatConversations { get; }
    DbSet<ChatMessage> ChatMessages { get; }
    DbSet<VoiceRecord> VoiceRecords { get; }
    DbSet<AiAnalysis> AiAnalyses { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
