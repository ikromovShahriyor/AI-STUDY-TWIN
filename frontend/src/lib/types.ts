export type UserRole = 1 | 2 | 3; // 1: Student, 2: Teacher, 3: Admin
export type KnowledgeLevel = 1 | 2 | 3 | 4; // 1: Beginner, 2: Elementary, 3: Intermediate, 4: Advanced
export type StudyTaskStatus = 1 | 2 | 3 | 4; // 1: Pending, 2: InProgress, 3: Completed, 4: Skipped
export type DifficultyLevel = 1 | 2 | 3; // 1: Easy, 2: Medium, 3: Hard
export type QuestionType = 1 | 2 | 3 | 4;
export type MessageSender = 1 | 2 | 3; // 1: User, 2: Assistant, 3: System
export type ChallengeType = 1 | 2 | 3 | 4; // 1: Tasks, 2: Test, 3: Minutes, 4: Chat
export type BadgeTier = 1 | 2 | 3 | 4 | 5; // 1: Bronze, 2: Silver, 3: Gold, 4: Platinum, 5: Diamond

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  studentProfileId?: string;
}

export interface StudentProfileDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  gradeLevel?: string;
  knowledgeLevel: KnowledgeLevel;
  targetExam: string;
  dailyStudyGoalMinutes: number;
  currentStreak: number;
  bestStreak: number;
  totalXp: number;
  level: number;
  avatarUrl?: string;
  bio?: string;
  preferredLanguage: string;
  nextLevelXp: number;
  currentLevelBaseXp: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface SubjectDto {
  id: string;
  nameUz: string;
  nameEn: string;
  nameRu: string;
  code: string;
  description: string;
  icon: string;
  gradientColor: string;
  orderIndex: number;
  totalTopicsCount: number;
  totalTestsCount: number;
}

export interface TopicDto {
  id: string;
  subjectId: string;
  titleUz: string;
  titleEn: string;
  titleRu: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  orderIndex: number;
}

export interface StudyPlanDto {
  id: string;
  studentProfileId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  goalSummary?: string;
  aiRecommendation?: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  tasks: StudyTaskDto[];
}

export interface StudyTaskDto {
  id: string;
  studyPlanId: string;
  topicId?: string;
  topicTitle?: string;
  subjectName?: string;
  subjectColor?: string;
  title: string;
  description: string;
  taskDate: string;
  status: StudyTaskStatus;
  durationMinutes: number;
  xpReward: number;
  completedAt?: string;
}

export interface TestDto {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  subjectColor: string;
  topicId?: string;
  topicTitle?: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  isDiagnostic: boolean;
  xpReward: number;
  questions: QuestionDto[];
}

export interface QuestionDto {
  id: string;
  testId: string;
  questionText: string;
  codeSnippet?: string;
  points: number;
  questionType: QuestionType;
  orderIndex: number;
  answers: AnswerOptionDto[];
}

export interface AnswerOptionDto {
  id: string;
  questionId: string;
  answerText: string;
  orderIndex: number;
}

export interface SubmitTestRequest {
  testId: string;
  timeSpentSeconds: number;
  answers: {
    questionId: string;
    selectedAnswerId?: string;
  }[];
}

export interface TestResultDto {
  id: string;
  testId: string;
  testTitle: string;
  subjectName: string;
  score: number;
  totalPossibleScore: number;
  percentage: number;
  timeSpentSeconds: number;
  passed: boolean;
  xpEarned: number;
  completedAt: string;
  aiFeedback?: string;
  weakAreas: string[];
  strongAreas: string[];
  answers: DetailedAnswerResultDto[];
}

export interface DetailedAnswerResultDto {
  questionId: string;
  questionText: string;
  codeSnippet?: string;
  explanation: string;
  selectedAnswerId?: string;
  selectedAnswerText?: string;
  correctAnswerId: string;
  correctAnswerText: string;
  isCorrect: boolean;
  points: number;
}

export interface ConversationDto {
  id: string;
  studentProfileId: string;
  subjectId?: string;
  subjectName?: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  messageCount: number;
  lastMessageSnippet?: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  sources?: WebSearchSourceDto[];
  audioUrl?: string;
  createdAt: string;
}

export interface WebSearchSourceDto {
  title: string;
  snippet: string;
  url: string;
}

export interface DashboardStatsDto {
  totalStudyMinutes: number;
  totalCompletedTasks: number;
  totalTestsTaken: number;
  currentStreak: number;
  bestStreak: number;
  totalXp: number;
  level: number;
  averageScorePercentage: number;
  todayCompletedTasks: number;
  todayTotalTasks: number;
  subjectProgresses: SubjectProgressDto[];
  todayTasks: StudyTaskDto[];
  recentTests: RecentTestResultSnippetDto[];
  aiStudyAdvice?: string;
}

export interface SubjectProgressDto {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  icon: string;
  gradientColor: string;
  masteryPercentage: number;
  totalTestsTaken: number;
  totalTasksCompleted: number;
  totalMinutesStudied: number;
  lastStudiedAt?: string;
}

export interface RecentTestResultSnippetDto {
  testResultId: string;
  testTitle: string;
  subjectName: string;
  percentage: number;
  score: number;
  totalPossibleScore: number;
  passed: boolean;
  completedAt: string;
}

export interface AchievementDto {
  id: string;
  titleUz: string;
  titleEn: string;
  titleRu: string;
  descriptionUz: string;
  descriptionEn: string;
  descriptionRu: string;
  icon: string;
  requiredXp: number;
  category: string;
  tier: BadgeTier;
  xpBonus: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface DailyChallengeDto {
  id: string;
  titleUz: string;
  titleEn: string;
  titleRu: string;
  descriptionUz: string;
  descriptionEn: string;
  descriptionRu: string;
  xpReward: number;
  challengeType: ChallengeType;
  targetCount: number;
  currentCount: number;
  icon: string;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface LeaderboardUserDto {
  rank: number;
  studentProfileId: string;
  fullName: string;
  avatarUrl?: string;
  totalXp: number;
  level: number;
  currentStreak: number;
}

export interface AiAnalysisDto {
  id: string;
  studentProfileId: string;
  overallLevel: KnowledgeLevel;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextLessons: NextLessonRecommendationDto[];
  summary: string;
  analyzedAt: string;
}

export interface NextLessonRecommendationDto {
  subjectName: string;
  topicTitle: string;
  reason: string;
  priority: number;
  estimatedMinutes: number;
}

export interface ErrorExplanationDto {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  aiDetailedAnalysis: string;
  improvementSteps: string[];
}
