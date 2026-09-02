using AiStudyTwin.Application.Interfaces;
using AiStudyTwin.Domain.Entities;
using AiStudyTwin.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AiStudyTwin.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        if (await context.Subjects.AnyAsync())
        {
            return; // DB already seeded
        }

        // 1. Seed Subjects and Topics
        var math = new Subject
        {
            NameUz = "Matematika",
            NameEn = "Mathematics",
            NameRu = "Математика",
            Code = "MATH",
            Description = "Algebra, geometriya, funksiyalar va matematik mantiq asoslari",
            Icon = "Calculator",
            GradientColor = "from-blue-600 to-cyan-500",
            OrderIndex = 1,
            Topics = new List<Topic>
            {
                new() { TitleUz = "Chiziqli tenglamalar va tengsizliklar", TitleEn = "Linear Equations & Inequalities", TitleRu = "Линейные уравнения", EstimatedMinutes = 35, Difficulty = DifficultyLevel.Easy, OrderIndex = 1 },
                new() { TitleUz = "Kvadrat tenglamalar va Viyet teoremasi", TitleEn = "Quadratic Equations & Vieta's Theorem", TitleRu = "Квадратные уравнения", EstimatedMinutes = 40, Difficulty = DifficultyLevel.Easy, OrderIndex = 2 },
                new() { TitleUz = "Trigonometrik ayniyatlar va formulalar", TitleEn = "Trigonometric Identities", TitleRu = "Тригонометрические формулы", EstimatedMinutes = 45, Difficulty = DifficultyLevel.Medium, OrderIndex = 3 },
                new() { TitleUz = "Hosilalar va ularning amaliy tatbiqi", TitleEn = "Derivatives & Applications", TitleRu = "Производные и их применение", EstimatedMinutes = 50, Difficulty = DifficultyLevel.Hard, OrderIndex = 4 }
            }
        };

        var it = new Subject
        {
            NameUz = "Dasturlash & IT",
            NameEn = "Programming & IT",
            NameRu = "Программирование и IT",
            Code = "CS",
            Description = "Algoritmlar, C# .NET, Web texnologiyalar va sun'iy intellekt",
            Icon = "Code",
            GradientColor = "from-violet-600 to-indigo-600",
            OrderIndex = 2,
            Topics = new List<Topic>
            {
                new() { TitleUz = "Obyektga yo'naltirilgan dasturlash (OOP) tamoyillari", TitleEn = "Object-Oriented Programming (OOP)", TitleRu = "Принципы ООП", EstimatedMinutes = 45, Difficulty = DifficultyLevel.Easy, OrderIndex = 1 },
                new() { TitleUz = "Ma'lumotlar tuzilmalari: Massivlar, Ro'yxatlar, Daraxtlar", TitleEn = "Data Structures: Arrays, Lists, Trees", TitleRu = "Структуры данных", EstimatedMinutes = 50, Difficulty = DifficultyLevel.Medium, OrderIndex = 2 },
                new() { TitleUz = "Asinxron dasturlash va Task / async-await", TitleEn = "Asynchronous Programming & async-await", TitleRu = "Асинхронное программирование", EstimatedMinutes = 45, Difficulty = DifficultyLevel.Medium, OrderIndex = 3 },
                new() { TitleUz = "Clean Architecture va REST API loyihalash", TitleEn = "Clean Architecture & REST API Design", TitleRu = "Чистая архитектура и REST API", EstimatedMinutes = 60, Difficulty = DifficultyLevel.Hard, OrderIndex = 4 }
            }
        };

        var english = new Subject
        {
            NameUz = "Ingliz tili",
            NameEn = "English Language",
            NameRu = "Английский язык",
            Code = "ENG",
            Description = "Grammatika, IELTS tayyorgarligi, so'z boyligi va muloqot ko'nikmalari",
            Icon = "Globe",
            GradientColor = "from-emerald-500 to-teal-600",
            OrderIndex = 3,
            Topics = new List<Topic>
            {
                new() { TitleUz = "Tense System: Present Perfect vs Past Simple", TitleEn = "Tense System: Present Perfect vs Past Simple", TitleRu = "Система времен: Present Perfect vs Past Simple", EstimatedMinutes = 30, Difficulty = DifficultyLevel.Easy, OrderIndex = 1 },
                new() { TitleUz = "Conditionals: Real and Unreal Hypotheses", TitleEn = "Conditionals (0, 1, 2, 3 & Mixed)", TitleRu = "Условные предложения", EstimatedMinutes = 40, Difficulty = DifficultyLevel.Medium, OrderIndex = 2 },
                new() { TitleUz = "Academic Vocabulary for IELTS & TOEFL", TitleEn = "Academic Vocabulary for IELTS", TitleRu = "Академический словарь для IELTS", EstimatedMinutes = 35, Difficulty = DifficultyLevel.Medium, OrderIndex = 3 }
            }
        };

        var physics = new Subject
        {
            NameUz = "Fizika",
            NameEn = "Physics",
            NameRu = "Физика",
            Code = "PHYS",
            Description = "Klassik mexanika, termodinamika va elektromagnit hodisalar",
            Icon = "Zap",
            GradientColor = "from-amber-500 to-orange-600",
            OrderIndex = 4,
            Topics = new List<Topic>
            {
                new() { TitleUz = "Nyuton qonunlari va harakat dinamikasi", TitleEn = "Newton's Laws of Motion", TitleRu = "Законы Ньютона", EstimatedMinutes = 35, Difficulty = DifficultyLevel.Easy, OrderIndex = 1 },
                new() { TitleUz = "Energiya va impulsning saqlanish qonuni", TitleEn = "Conservation of Energy & Momentum", TitleRu = "Закон сохранения энергии", EstimatedMinutes = 40, Difficulty = DifficultyLevel.Medium, OrderIndex = 2 },
                new() { TitleUz = "Om qonuni va elektr zanjirlari", TitleEn = "Ohm's Law & Electric Circuits", TitleRu = "Закон Ома и электрические цепи", EstimatedMinutes = 40, Difficulty = DifficultyLevel.Medium, OrderIndex = 3 }
            }
        };

        context.Subjects.AddRange(math, it, english, physics);
        await context.SaveChangesAsync();

        // 2. Seed Diagnostic Tests and Questions
        var itDiagnostic = new Test
        {
            SubjectId = it.Id,
            Title = "Dasturlash bo'yicha Diagnostik Test",
            Description = "Bilim darajangizni aniqlash uchun 5 ta qiziqarli savol",
            Difficulty = DifficultyLevel.Medium,
            DurationMinutes = 10,
            TotalQuestions = 5,
            PassingScore = 60,
            IsDiagnostic = true,
            XpReward = 75,
            Questions = new List<Question>
            {
                new()
                {
                    QuestionText = "OOP (Obyektga yo'naltirilgan dasturlash) ning 4 ta asosiy tamoyili qaysilar?",
                    Points = 20,
                    Explanation = "OOP tamoyillari: Enkapsulyatsiya, Merosxo'rlik (Inheritance), Polimorfizm va Abstraksiya.",
                    QuestionType = QuestionType.SingleChoice,
                    OrderIndex = 1,
                    Answers = new List<Answer>
                    {
                        new() { AnswerText = "Enkapsulyatsiya, Merosxo'rlik, Polimorfizm, Abstraksiya", IsCorrect = true, OrderIndex = 1 },
                        new() { AnswerText = "Kompilyatsiya, Interpretatsiya, Sinxronizatsiya, Kesh", IsCorrect = false, OrderIndex = 2 },
                        new() { AnswerText = "Massiv, Ro'yxat, Stek, Navbat", IsCorrect = false, OrderIndex = 3 },
                        new() { AnswerText = "Frontend, Backend, Database, DevOps", IsCorrect = false, OrderIndex = 4 }
                    }
                },
                new()
                {
                    QuestionText = "C# da 'async' va 'await' kalit so'zlari nima uchun ishlatiladi?",
                    CodeSnippet = "public async Task<string> FetchDataAsync() {\n    return await httpClient.GetStringAsync(url);\n}",
                    Points = 20,
                    Explanation = "'async' va 'await' bloklanmagan (non-blocking) asinxron operatsiyalarni bajarish va UI yoki asosiy ipni muzlatib qo'ymaslik uchun xizmat qiladi.",
                    QuestionType = QuestionType.SingleChoice,
                    OrderIndex = 2,
                    Answers = new List<Answer>
                    {
                        new() { AnswerText = "Asosiy oqimni (thread) to'xtatmasdan asinxron kod bajarish uchun", IsCorrect = true, OrderIndex = 1 },
                        new() { AnswerText = "Xotirani tozalash (Garbage Collector) ni tezlashtirish uchun", IsCorrect = false, OrderIndex = 2 },
                        new() { AnswerText = "Faqat ma'lumotlar bazasiga ulanish uchun", IsCorrect = false, OrderIndex = 3 },
                        new() { AnswerText = "Kod hajmini qisqartirish uchun", IsCorrect = false, OrderIndex = 4 }
                    }
                },
                new()
                {
                    QuestionText = "REST API da ma'lumotni qisman yangilash uchun qaysi HTTP metodi tavsiya etiladi?",
                    Points = 20,
                    Explanation = "To'liq yangilash uchun PUT, qisman (faqat o'zgargan maydonlarni) yangilash uchun PATCH metodi qo'llaniladi.",
                    QuestionType = QuestionType.SingleChoice,
                    OrderIndex = 3,
                    Answers = new List<Answer>
                    {
                        new() { AnswerText = "PATCH", IsCorrect = true, OrderIndex = 1 },
                        new() { AnswerText = "GET", IsCorrect = false, OrderIndex = 2 },
                        new() { AnswerText = "DELETE", IsCorrect = false, OrderIndex = 3 },
                        new() { AnswerText = "POST", IsCorrect = false, OrderIndex = 4 }
                    }
                },
                new()
                {
                    QuestionText = "Massivdan elementni qidirishda 'Binary Search' (Ikkilik qidiruv) ning vaqt murakkabligi qanday?",
                    Points = 20,
                    Explanation = "Binary Search saralangan massivda har bir qadamda qidiruv sohasini 2 barobar qisqartiradi, shuning uchun O(log n).",
                    QuestionType = QuestionType.SingleChoice,
                    OrderIndex = 4,
                    Answers = new List<Answer>
                    {
                        new() { AnswerText = "O(log n)", IsCorrect = true, OrderIndex = 1 },
                        new() { AnswerText = "O(n^2)", IsCorrect = false, OrderIndex = 2 },
                        new() { AnswerText = "O(n)", IsCorrect = false, OrderIndex = 3 },
                        new() { AnswerText = "O(1)", IsCorrect = false, OrderIndex = 4 }
                    }
                },
                new()
                {
                    QuestionText = "PostgreSQL da birlamchi kalit (Primary Key) ning asosiy vazifasi nima?",
                    Points = 20,
                    Explanation = "Primary Key jadvalning har bir qatorini yagona (unikal) qilib aniqlaydi va null qiymat qabul qilmaydi.",
                    QuestionType = QuestionType.SingleChoice,
                    OrderIndex = 5,
                    Answers = new List<Answer>
                    {
                        new() { AnswerText = "Har bir qatorni unikal (yagona) identifikatsiyalash", IsCorrect = true, OrderIndex = 1 },
                        new() { AnswerText = "Faqat matnlarni shifrlash", IsCorrect = false, OrderIndex = 2 },
                        new() { AnswerText = "Jadvalni avtomatik o'chirish", IsCorrect = false, OrderIndex = 3 },
                        new() { AnswerText = "Faqat sonli qiymatlarni hisoblash", IsCorrect = false, OrderIndex = 4 }
                    }
                }
            }
        };

        var mathDiagnostic = new Test
        {
            SubjectId = math.Id,
            Title = "Matematika bo'yicha Diagnostik Test",
            Description = "Algebra va mantiq bo'yicha boshlang'ich bilim darajasini baholash",
            Difficulty = DifficultyLevel.Easy,
            DurationMinutes = 10,
            TotalQuestions = 3,
            PassingScore = 60,
            IsDiagnostic = true,
            XpReward = 60,
            Questions = new List<Question>
            {
                new()
                {
                    QuestionText = "2x + 8 = 20 tenglamadan x ning qiymatini toping.",
                    Points = 30,
                    Explanation = "2x = 20 - 8 => 2x = 12 => x = 6",
                    QuestionType = QuestionType.SingleChoice,
                    OrderIndex = 1,
                    Answers = new List<Answer>
                    {
                        new() { AnswerText = "6", IsCorrect = true, OrderIndex = 1 },
                        new() { AnswerText = "4", IsCorrect = false, OrderIndex = 2 },
                        new() { AnswerText = "8", IsCorrect = false, OrderIndex = 3 },
                        new() { AnswerText = "12", IsCorrect = false, OrderIndex = 4 }
                    }
                },
                new()
                {
                    QuestionText = "x^2 - 5x + 6 = 0 kvadrat tenglama ildizlarini toping.",
                    Points = 35,
                    Explanation = "Viyet teoremasiga ko'ra: x1 + x2 = 5, x1 * x2 = 6. Ildizlar: 2 va 3.",
                    QuestionType = QuestionType.SingleChoice,
                    OrderIndex = 2,
                    Answers = new List<Answer>
                    {
                        new() { AnswerText = "x1 = 2, x2 = 3", IsCorrect = true, OrderIndex = 1 },
                        new() { AnswerText = "x1 = -2, x2 = -3", IsCorrect = false, OrderIndex = 2 },
                        new() { AnswerText = "x1 = 1, x2 = 6", IsCorrect = false, OrderIndex = 3 },
                        new() { AnswerText = "x1 = 0, x2 = 5", IsCorrect = false, OrderIndex = 4 }
                    }
                },
                new()
                {
                    QuestionText = "f(x) = x^3 funksiyaning x bo'yicha hosilasi nima bo'ladi?",
                    Points = 35,
                    Explanation = "(x^n)' = n * x^(n-1) qoidasiga ko'ra: (x^3)' = 3x^2.",
                    QuestionType = QuestionType.SingleChoice,
                    OrderIndex = 3,
                    Answers = new List<Answer>
                    {
                        new() { AnswerText = "3x^2", IsCorrect = true, OrderIndex = 1 },
                        new() { AnswerText = "x^2", IsCorrect = false, OrderIndex = 2 },
                        new() { AnswerText = "3x", IsCorrect = false, OrderIndex = 3 },
                        new() { AnswerText = "x^4 / 4", IsCorrect = false, OrderIndex = 4 }
                    }
                }
            }
        };

        context.Tests.AddRange(itDiagnostic, mathDiagnostic);

        // 3. Seed Achievements
        var achievements = new List<Achievement>
        {
            new()
            {
                TitleUz = "Birinchi Qadam",
                TitleEn = "First Step",
                TitleRu = "Первый шаг",
                DescriptionUz = "AI Study Twin ga muvaffaqiyatli a'zo bo'ldingiz",
                DescriptionEn = "Successfully joined AI Study Twin platform",
                DescriptionRu = "Успешно присоединились к AI Study Twin",
                Icon = "Sparkles",
                RequiredXp = 0,
                Category = "Starter",
                Tier = BadgeTier.Bronze,
                XpBonus = 50
            },
            new()
            {
                TitleUz = "Bilim Izlovchi",
                TitleEn = "Knowledge Seeker",
                TitleRu = "Искатель знаний",
                DescriptionUz = "Birinchi o'quv topshirig'ini yakunladingiz",
                DescriptionEn = "Completed your first study task",
                DescriptionRu = "Завершили свое первое учебное задание",
                Icon = "BookOpen",
                RequiredXp = 100,
                Category = "Study",
                Tier = BadgeTier.Bronze,
                XpBonus = 75
            },
            new()
            {
                TitleUz = "Test Ustasi",
                TitleEn = "Quiz Master",
                TitleRu = "Мастер тестов",
                DescriptionUz = "Testdan 80% dan yuqori ball to'pladingiz",
                DescriptionEn = "Scored over 80% on a quiz",
                DescriptionRu = "Набрали более 80% в тесте",
                Icon = "Award",
                RequiredXp = 250,
                Category = "Test",
                Tier = BadgeTier.Silver,
                XpBonus = 100
            },
            new()
            {
                TitleUz = "Streak Qahramoni",
                TitleEn = "Streak Hero",
                TitleRu = "Герой серии",
                DescriptionUz = "Ketma-ket 7 kun faol o'qish",
                DescriptionEn = "7 days study streak achieved",
                DescriptionRu = "Серия занятий 7 дней подряд",
                Icon = "Flame",
                RequiredXp = 500,
                Category = "Streak",
                Tier = BadgeTier.Gold,
                XpBonus = 200
            },
            new()
            {
                TitleUz = "AI Tadqiqotchi",
                TitleEn = "AI Explorer",
                TitleRu = "Исследователь ИИ",
                DescriptionUz = "AI repetitor bilan 10 martadan ortiq muloqot qildingiz",
                DescriptionEn = "Interacted with AI tutor over 10 times",
                DescriptionRu = "Общались с ИИ-репетитором более 10 раз",
                Icon = "Bot",
                RequiredXp = 300,
                Category = "AI",
                Tier = BadgeTier.Silver,
                XpBonus = 120
            }
        };
        context.Achievements.AddRange(achievements);

        // 4. Seed Daily Challenges
        var challenges = new List<DailyChallenge>
        {
            new()
            {
                TitleUz = "Kunlik Darslar",
                TitleEn = "Daily Lessons",
                TitleRu = "Ежедневные уроки",
                DescriptionUz = "Bugun o'quv rejangizdagi 2 ta vazifani bajaring",
                DescriptionEn = "Complete 2 tasks from your daily study plan",
                DescriptionRu = "Выполните 2 задания из учебного плана",
                XpReward = 40,
                ChallengeType = ChallengeType.CompleteTasks,
                TargetCount = 2,
                Icon = "CheckCircle"
            },
            new()
            {
                TitleUz = "Test Sinovi",
                TitleEn = "Quiz Challenge",
                TitleRu = "Тестовое испытание",
                DescriptionUz = "Istalgan fan bo'yicha 1 ta test topshiring",
                DescriptionEn = "Take 1 test in any subject",
                DescriptionRu = "Пройдите 1 тест по любому предмету",
                XpReward = 50,
                ChallengeType = ChallengeType.TakeTest,
                TargetCount = 1,
                Icon = "HelpCircle"
            },
            new()
            {
                TitleUz = "AI bilan Savol-Javob",
                TitleEn = "Ask AI Tutor",
                TitleRu = "Вопрос-ответ с ИИ",
                DescriptionUz = "AI o'qituvchidan 3 ta savolga javob oling",
                DescriptionEn = "Ask AI tutor 3 academic questions",
                DescriptionRu = "Задайте ИИ 3 учебных вопроса",
                XpReward = 30,
                ChallengeType = ChallengeType.ChatWithAi,
                TargetCount = 3,
                Icon = "MessageSquare"
            }
        };
        context.DailyChallenges.AddRange(challenges);

        // 5. Seed Demo Users
        var demoUser = new User
        {
            FullName = "Azizbek Ikromov",
            Email = "student@aistudytwin.uz",
            PasswordHash = passwordHasher.HashPassword("Password123!"),
            Role = UserRole.Student,
            IsActive = true
        };

        var demoProfile = new StudentProfile
        {
            User = demoUser,
            GradeLevel = "11-sinf / 1-kurs",
            KnowledgeLevel = KnowledgeLevel.Intermediate,
            TargetExam = "IT & IELTS Tayyorgarlik",
            DailyStudyGoalMinutes = 60,
            CurrentStreak = 5,
            BestStreak = 12,
            TotalXp = 480,
            Level = 3,
            Bio = "Sun'iy intellekt va dasturlashga qiziquvchi faol o'quvchi.",
            PreferredLanguage = "uz",
            LastActivityDate = DateTime.UtcNow
        };

        demoUser.StudentProfile = demoProfile;

        // Add progress for demo profile
        demoProfile.ProgressList.Add(new Progress
        {
            SubjectId = it.Id,
            MasteryPercentage = 78,
            TotalTestsTaken = 4,
            TotalTasksCompleted = 8,
            TotalMinutesStudied = 240,
            LastStudiedAt = DateTime.UtcNow.AddHours(-2)
        });

        demoProfile.ProgressList.Add(new Progress
        {
            SubjectId = math.Id,
            MasteryPercentage = 65,
            TotalTestsTaken = 3,
            TotalTasksCompleted = 5,
            TotalMinutesStudied = 150,
            LastStudiedAt = DateTime.UtcNow.AddDays(-1)
        });

        demoProfile.ProgressList.Add(new Progress
        {
            SubjectId = english.Id,
            MasteryPercentage = 82,
            TotalTestsTaken = 5,
            TotalTasksCompleted = 10,
            TotalMinutesStudied = 300,
            LastStudiedAt = DateTime.UtcNow.AddHours(-5)
        });

        // Add starter achievement to demo user
        demoProfile.Achievements.Add(new StudentAchievement
        {
            Achievement = achievements[0],
            UnlockedAt = DateTime.UtcNow.AddDays(-5)
        });
        demoProfile.Achievements.Add(new StudentAchievement
        {
            Achievement = achievements[1],
            UnlockedAt = DateTime.UtcNow.AddDays(-3)
        });

        // Add active study plan for demo user
        var demoPlan = new StudyPlan
        {
            StudentProfile = demoProfile,
            Title = "AI Shaxsiy Reja: Dasturlash va Matematika",
            Description = "7 kunlik intensiv o'quv va amaliyot dasturi",
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddDays(7),
            IsActive = true,
            GoalSummary = "OOP tamoyillari va kvadrat tenglamalarni chuqur o'zlashtirish",
            AiRecommendation = "Dasturlash darslaridagi kod misollarini albatta yozib ko'ring."
        };

        var topic1 = it.Topics.First();
        var topic2 = math.Topics.First();

        demoPlan.Tasks.Add(new StudyTask
        {
            Topic = topic1,
            Title = "OOP tamoyillari: Enkapsulyatsiya va Abstraksiya",
            Description = "Asosiy tushunchalar va C# da sinf yaratish",
            TaskDate = DateTime.UtcNow.Date,
            Status = StudyTaskStatus.InProgress,
            DurationMinutes = 30,
            XpReward = 25
        });

        demoPlan.Tasks.Add(new StudyTask
        {
            Topic = topic2,
            Title = "Chiziqli tenglamalar amaliy mashg'uloti",
            Description = "5 ta misol yechish va tekshirish",
            TaskDate = DateTime.UtcNow.Date,
            Status = StudyTaskStatus.Pending,
            DurationMinutes = 30,
            XpReward = 20
        });

        demoPlan.Tasks.Add(new StudyTask
        {
            Topic = topic1,
            Title = "Merosxo'rlik va Polimorfizm amaliyoti",
            Description = "Interfeyslar va virtual metodlar",
            TaskDate = DateTime.UtcNow.Date.AddDays(1),
            Status = StudyTaskStatus.Pending,
            DurationMinutes = 40,
            XpReward = 30
        });

        demoProfile.StudyPlans.Add(demoPlan);

        // Add sample chat conversation
        var demoConv = new ChatConversation
        {
            StudentProfile = demoProfile,
            SubjectId = it.Id,
            Title = "OOP va C# haqida savol-javob"
        };
        demoConv.Messages.Add(new ChatMessage
        {
            Sender = MessageSender.User,
            Content = "Salom! Polimorfizm nima va u real dasturlashda nega kerak?",
            CreatedAt = DateTime.UtcNow.AddMinutes(-10)
        });
        demoConv.Messages.Add(new ChatMessage
        {
            Sender = MessageSender.Assistant,
            Content = "Salom, Azizbek! **Polimorfizm** — bu bitta interfeys yoki metod nomiga ega bo'lib, turli obyektlarda turlicha xatti-harakat qilish imkoniyatidir.\n\n### Asosiy turlari:\n1. **Statik (Compile-time) polimorfizm**: Metodlarni ortiqcha yuklash (*Method Overloading*).\n2. **Dinamik (Runtime) polimorfizm**: Metodlarni qayta yozish (*Method Overriding* `override` kalit so'zi bilan).\n\n💡 **Real misol:** Tasavvur qiling, `Shape` (Shakl) degan sinfda `Draw()` metodi bor. `Circle` va `Square` sinflari `Shape`dan meros oladi va o'zining `Draw()` metodini o'ziga xos tarzda chizadi.",
            CreatedAt = DateTime.UtcNow.AddMinutes(-9)
        });
        demoProfile.ChatConversations.Add(demoConv);

        context.Users.Add(demoUser);
        await context.SaveChangesAsync();
    }
}
