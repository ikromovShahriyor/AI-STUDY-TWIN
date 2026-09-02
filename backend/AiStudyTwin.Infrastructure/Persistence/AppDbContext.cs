using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<StudyPlan> StudyPlans => Set<StudyPlan>();
    public DbSet<StudyTask> StudyTasks => Set<StudyTask>();
    public DbSet<Test> Tests => Set<Test>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<TestResult> TestResults => Set<TestResult>();
    public DbSet<TestAnswerSubmission> TestAnswerSubmissions => Set<TestAnswerSubmission>();
    public DbSet<Progress> Progresses => Set<Progress>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<StudentAchievement> StudentAchievements => Set<StudentAchievement>();
    public DbSet<DailyChallenge> DailyChallenges => Set<DailyChallenge>();
    public DbSet<StudentDailyChallenge> StudentDailyChallenges => Set<StudentDailyChallenge>();
    public DbSet<ChatConversation> ChatConversations => Set<ChatConversation>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<VoiceRecord> VoiceRecords => Set<VoiceRecord>();
    public DbSet<AiAnalysis> AiAnalyses => Set<AiAnalysis>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User & StudentProfile
        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.HasIndex(u => u.Email).IsUnique();
            b.Property(u => u.Email).IsRequired().HasMaxLength(256);
            b.Property(u => u.FullName).IsRequired().HasMaxLength(150);
            b.HasOne(u => u.StudentProfile)
                .WithOne(p => p.User)
                .HasForeignKey<StudentProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Subject & Topics
        modelBuilder.Entity<Subject>(b =>
        {
            b.HasKey(s => s.Id);
            b.HasIndex(s => s.Code).IsUnique();
            b.HasMany(s => s.Topics)
                .WithOne(t => t.Subject)
                .HasForeignKey(t => t.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Tests, Questions, Answers
        modelBuilder.Entity<Test>(b =>
        {
            b.HasKey(t => t.Id);
            b.HasOne(t => t.Subject)
                .WithMany(s => s.Tests)
                .HasForeignKey(t => t.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(t => t.Topic)
                .WithMany(tp => tp.Tests)
                .HasForeignKey(t => t.TopicId)
                .OnDelete(DeleteBehavior.SetNull);
            b.HasMany(t => t.Questions)
                .WithOne(q => q.Test)
                .HasForeignKey(q => q.TestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Question>(b =>
        {
            b.HasKey(q => q.Id);
            b.HasMany(q => q.Answers)
                .WithOne(a => a.Question)
                .HasForeignKey(a => a.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TestResult & Submissions
        modelBuilder.Entity<TestResult>(b =>
        {
            b.HasKey(r => r.Id);
            b.HasOne(r => r.StudentProfile)
                .WithMany(p => p.TestResults)
                .HasForeignKey(r => r.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(r => r.Test)
                .WithMany(t => t.TestResults)
                .HasForeignKey(r => r.TestId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasMany(r => r.Submissions)
                .WithOne(s => s.TestResult)
                .HasForeignKey(s => s.TestResultId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // StudyPlan & Tasks
        modelBuilder.Entity<StudyPlan>(b =>
        {
            b.HasKey(p => p.Id);
            b.HasOne(p => p.StudentProfile)
                .WithMany(sp => sp.StudyPlans)
                .HasForeignKey(p => p.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasMany(p => p.Tasks)
                .WithOne(t => t.StudyPlan)
                .HasForeignKey(t => t.StudyPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Chat
        modelBuilder.Entity<ChatConversation>(b =>
        {
            b.HasKey(c => c.Id);
            b.HasOne(c => c.StudentProfile)
                .WithMany(sp => sp.ChatConversations)
                .HasForeignKey(c => c.StudentProfileId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasMany(c => c.Messages)
                .WithOne(m => m.Conversation)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Progress
        modelBuilder.Entity<Progress>(b =>
        {
            b.HasKey(p => p.Id);
            b.HasIndex(p => new { p.StudentProfileId, p.SubjectId }).IsUnique();
        });

        // Achievements
        modelBuilder.Entity<StudentAchievement>(b =>
        {
            b.HasKey(sa => sa.Id);
            b.HasIndex(sa => new { sa.StudentProfileId, sa.AchievementId }).IsUnique();
        });

        // Challenges
        modelBuilder.Entity<StudentDailyChallenge>(b =>
        {
            b.HasKey(sc => sc.Id);
            b.HasIndex(sc => new { sc.StudentProfileId, sc.DailyChallengeId, sc.Date });
        });
    }
}
