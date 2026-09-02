namespace AiStudyTwin.Application.DTOs;

public record DashboardStatsDto(
    int TotalStudyMinutes,
    int TotalCompletedTasks,
    int TotalTestsTaken,
    int CurrentStreak,
    int BestStreak,
    int TotalXp,
    int Level,
    double AverageScorePercentage,
    int TodayCompletedTasks,
    int TodayTotalTasks,
    List<SubjectProgressDto> SubjectProgresses,
    List<StudyTaskDto> TodayTasks,
    List<RecentTestResultSnippetDto> RecentTests,
    string? AiStudyAdvice
);

public record SubjectProgressDto(
    Guid SubjectId,
    string SubjectName,
    string SubjectCode,
    string Icon,
    string GradientColor,
    double MasteryPercentage,
    int TotalTestsTaken,
    int TotalTasksCompleted,
    int TotalMinutesStudied,
    DateTime? LastStudiedAt
);

public record RecentTestResultSnippetDto(
    Guid TestResultId,
    string TestTitle,
    string SubjectName,
    double Percentage,
    int Score,
    int TotalPossibleScore,
    bool Passed,
    DateTime CompletedAt
);

public record StreakHistoryDto(
    int CurrentStreak,
    int BestStreak,
    List<DateTime> ActiveDates
);
