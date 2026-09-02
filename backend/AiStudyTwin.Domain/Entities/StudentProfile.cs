using AiStudyTwin.Domain.Common;
using AiStudyTwin.Domain.Enums;

namespace AiStudyTwin.Domain.Entities;

public class StudentProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string? GradeLevel { get; set; }
    public KnowledgeLevel KnowledgeLevel { get; set; } = KnowledgeLevel.Beginner;
    public string TargetExam { get; set; } = "General Knowledge";
    public int DailyStudyGoalMinutes { get; set; } = 45;
    public int CurrentStreak { get; set; } = 1;
    public int BestStreak { get; set; } = 1;
    public DateTime LastActivityDate { get; set; } = DateTime.UtcNow;
    public int TotalXp { get; set; } = 50;
    public int Level { get; set; } = 1;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string PreferredLanguage { get; set; } = "uz"; // uz, en, ru

    public ICollection<StudyPlan> StudyPlans { get; set; } = new List<StudyPlan>();
    public ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
    public ICollection<Progress> ProgressList { get; set; } = new List<Progress>();
    public ICollection<StudentAchievement> Achievements { get; set; } = new List<StudentAchievement>();
    public ICollection<StudentDailyChallenge> DailyChallenges { get; set; } = new List<StudentDailyChallenge>();
    public ICollection<ChatConversation> ChatConversations { get; set; } = new List<ChatConversation>();
    public ICollection<VoiceRecord> VoiceRecords { get; set; } = new List<VoiceRecord>();
    public ICollection<AiAnalysis> AiAnalyses { get; set; } = new List<AiAnalysis>();
}
