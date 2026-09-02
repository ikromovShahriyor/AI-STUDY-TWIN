namespace AiStudyTwin.Domain.Enums;

public enum UserRole
{
    Student = 1,
    Teacher = 2,
    Admin = 3
}

public enum KnowledgeLevel
{
    Beginner = 1,
    Elementary = 2,
    Intermediate = 3,
    Advanced = 4
}

public enum StudyTaskStatus
{
    Pending = 1,
    InProgress = 2,
    Completed = 3,
    Skipped = 4
}

public enum DifficultyLevel
{
    Easy = 1,
    Medium = 2,
    Hard = 3
}

public enum QuestionType
{
    SingleChoice = 1,
    MultipleChoice = 2,
    CodeEvaluation = 3,
    TrueFalse = 4
}

public enum MessageSender
{
    User = 1,
    Assistant = 2,
    System = 3
}

public enum ChallengeType
{
    CompleteTasks = 1,
    TakeTest = 2,
    StudyMinutes = 3,
    ChatWithAi = 4
}

public enum BadgeTier
{
    Bronze = 1,
    Silver = 2,
    Gold = 3,
    Platinum = 4,
    Diamond = 5
}
