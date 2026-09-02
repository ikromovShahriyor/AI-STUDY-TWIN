"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { DashboardStatsDto, StudyTaskDto, StudyTaskStatus } from "@/lib/types";
import {
  Sparkles,
  Flame,
  Zap,
  CheckCircle,
  Clock,
  Award,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Bot,
  CalendarCheck,
  Play,
  RotateCcw
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { profile, refreshProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await apiFetch<DashboardStatsDto>("/progress/dashboard");
      setStats(data);
    } catch {
      // Offline fallback state
      if (profile) {
        setStats({
          totalStudyMinutes: 320,
          totalCompletedTasks: 12,
          totalTestsTaken: 6,
          currentStreak: profile.currentStreak || 5,
          bestStreak: profile.bestStreak || 12,
          totalXp: profile.totalXp || 480,
          level: profile.level || 3,
          averageScorePercentage: 78.5,
          todayCompletedTasks: 1,
          todayTotalTasks: 3,
          subjectProgresses: [
            { subjectId: "1", subjectName: "Dasturlash & IT", subjectCode: "CS", icon: "Code", gradientColor: "from-violet-600 to-indigo-600", masteryPercentage: 78, totalTestsTaken: 4, totalTasksCompleted: 8, totalMinutesStudied: 240 },
            { subjectId: "2", subjectName: "Matematika", subjectCode: "MATH", icon: "Calculator", gradientColor: "from-blue-600 to-cyan-500", masteryPercentage: 65, totalTestsTaken: 3, totalTasksCompleted: 5, totalMinutesStudied: 150 },
            { subjectId: "3", subjectName: "Ingliz tili", subjectCode: "ENG", icon: "Globe", gradientColor: "from-emerald-500 to-teal-600", masteryPercentage: 82, totalTestsTaken: 5, totalTasksCompleted: 10, totalMinutesStudied: 300 },
          ],
          todayTasks: [
            { id: "t1", studyPlanId: "p1", title: "OOP tamoyillari: Enkapsulyatsiya va Abstraksiya", description: "Asosiy tushunchalar va C# da sinf yaratish", taskDate: new Date().toISOString(), status: 2 as StudyTaskStatus, durationMinutes: 30, xpReward: 25, subjectName: "Dasturlash & IT" },
            { id: "t2", studyPlanId: "p1", title: "Chiziqli tenglamalar amaliy mashg'uloti", description: "5 ta misol yechish va tekshirish", taskDate: new Date().toISOString(), status: 1 as StudyTaskStatus, durationMinutes: 30, xpReward: 20, subjectName: "Matematika" },
          ],
          recentTests: [
            { testResultId: "r1", testTitle: "Dasturlash Diagnostik Test", subjectName: "Dasturlash & IT", percentage: 80, score: 80, totalPossibleScore: 100, passed: true, completedAt: new Date().toISOString() },
            { testResultId: "r2", testTitle: "Algebra & Tenglamalar", subjectName: "Matematika", percentage: 70, score: 70, totalPossibleScore: 100, passed: true, completedAt: new Date().toISOString() }
          ],
          aiStudyAdvice: "Bugun dasturlash bo'yicha amaliy topshiriqlarni yakunlang. O'rganish tezligingiz juda yaxshi!"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const toggleTaskStatus = async (taskId: string, currentStatus: StudyTaskStatus) => {
    const nextStatus = currentStatus === 3 ? 1 : 3;
    try {
      await apiFetch(`/studyplan/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      await fetchStats();
      await refreshProfile();
    } catch {
      // update locally
      if (stats) {
        setStats({
          ...stats,
          todayTasks: stats.todayTasks.map(t => t.id === taskId ? { ...t, status: nextStatus as StudyTaskStatus } : t),
          todayCompletedTasks: nextStatus === 3 ? stats.todayCompletedTasks + 1 : Math.max(0, stats.todayCompletedTasks - 1)
        });
      }
    }
  };

  return (
    <div style={{ padding: "30px 20px" }}>
      <div className="container-custom">
        {/* Top Greeting Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "30px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
              <span>Boshqaruv Paneli</span>
              <span>•</span>
              <span style={{ color: "var(--accent-cyan)" }}>AI Study Twin v1.0</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              {t.dashboard.welcome}, <span className="gradient-text">{profile?.fullName || "O'quvchi"}</span>! 👋
            </h1>
          </div>

          {/* Quick Streak & Level Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="glass-panel" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "var(--radius-full)" }}>
              <Flame size={20} color="#f59e0b" fill="#f59e0b" className="animate-bounce" />
              <div>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#f59e0b" }}>
                  {stats?.currentStreak || profile?.currentStreak || 1} Kunlik Streak
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Doimiylik seriyasi</div>
              </div>
            </div>

            <div className="glass-panel" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "var(--radius-full)" }}>
              <Zap size={20} color="var(--accent-purple)" fill="var(--accent-purple)" />
              <div>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--accent-purple)" }}>
                  {stats?.totalXp || profile?.totalXp || 100} XP
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Daraja {stats?.level || profile?.level || 1}</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Advisor Banner */}
        <div
          className="glass-panel"
          style={{
            padding: "20px 24px",
            marginBottom: "30px",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
            border: "1px solid var(--border-glass-glow)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)"
            }}>
              <Bot size={24} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-purple)" }}>
                {t.dashboard.aiAdviceTitle}
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "500", marginTop: "2px" }}>
                {stats?.aiStudyAdvice || "Kunlik darslarni ketma-ketlikda bajaring, savollaringiz bo'lsa AI Chat'dan so'rang."}
              </div>
            </div>
          </div>
          <Link href="/chat" className="btn-primary" style={{ padding: "8px 18px", fontSize: "13px" }}>
            <Sparkles size={16} />
            <span>AI Repetitordan So'rash</span>
          </Link>
        </div>

        {/* 4 Stats Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          {/* Card 1: Today Tasks */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>Bugungi Vazifalar</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
                <CalendarCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
              {stats?.todayCompletedTasks || 0} / {stats?.todayTotalTasks || 0}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {stats?.todayTotalTasks && stats.todayTotalTasks > 0
                ? `${Math.round(((stats.todayCompletedTasks || 0) / stats.todayTotalTasks) * 100)}% bajarildi`
                : "Vazifalar to'liq yakunlandi"}
            </div>
          </div>

          {/* Card 2: Study Minutes */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>O'qish Vaqti</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
              {stats?.totalStudyMinutes || 0} daqiqa
            </div>
            <div style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: "600" }}>
              Maqsad: {profile?.dailyStudyGoalMinutes || 45} daq/kun
            </div>
          </div>

          {/* Card 3: Tests Solved */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>Yechilgan Testlar</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-emerald)" }}>
                <Award size={18} />
              </div>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
              {stats?.totalTestsTaken || 0} ta
            </div>
            <div style={{ fontSize: "12px", color: "var(--accent-emerald)", fontWeight: "600" }}>
              O'rtacha aniqlik: {stats?.averageScorePercentage || 75}%
            </div>
          </div>

          {/* Card 4: Total XP */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>To'plangan XP</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-amber)" }}>
                <Zap size={18} />
              </div>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
              {stats?.totalXp || profile?.totalXp || 100} XP
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Daraja {stats?.level || profile?.level || 1}
            </div>
          </div>
        </div>

        {/* Main Content Grid: Today's Tasks + Subject Mastery */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          marginBottom: "30px"
        }}>
          {/* Today Tasks Interactive List */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{t.dashboard.todayTasks}</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t.dashboard.todayTasksDesc}</span>
              </div>
              <Link href="/study-plan" style={{ fontSize: "13px", color: "var(--accent-purple)", fontWeight: "600", textDecoration: "none" }}>
                Rejani ko'rish
              </Link>
            </div>

            {stats?.todayTasks && stats.todayTasks.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {stats.todayTasks.map((task) => {
                  const isCompleted = task.status === 3;
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 16px",
                        borderRadius: "var(--radius-md)",
                        background: isCompleted ? "rgba(16, 185, 129, 0.08)" : "var(--bg-tertiary)",
                        border: isCompleted ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-glass)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "6px",
                          border: isCompleted ? "none" : "2px solid var(--border-glass-glow)",
                          backgroundColor: isCompleted ? "var(--accent-emerald)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff"
                        }}>
                          {isCompleted && <CheckCircle size={16} />}
                        </div>
                        <div>
                          <div style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: isCompleted ? "var(--text-muted)" : "var(--text-primary)",
                            textDecoration: isCompleted ? "line-through" : "none"
                          }}>
                            {task.title}
                          </div>
                          <div style={{ display: "flex", gap: "8px", fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {task.subjectName && <span>{task.subjectName}</span>}
                            <span>•</span>
                            <span>{task.durationMinutes} daqiqa</span>
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-purple">+{task.xpReward} XP</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                <CheckCircle size={36} color="var(--accent-emerald)" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontSize: "14px", fontWeight: "600" }}>{t.dashboard.noTasksToday}</div>
                <Link href="/study-plan" className="btn-secondary" style={{ marginTop: "14px", padding: "8px 16px", fontSize: "13px" }}>
                  Yangi reja tuzish
                </Link>
              </div>
            )}
          </div>

          {/* Subject Mastery Breakdown */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{t.dashboard.subjectMastery}</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Bilim darajasi va o'zlashtirish foizi</span>
              </div>
              <Link href="/ai-twin" style={{ fontSize: "13px", color: "var(--accent-cyan)", fontWeight: "600", textDecoration: "none" }}>
                AI Tahlil
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {stats?.subjectProgresses && stats.subjectProgresses.map((sub) => (
                <div key={sub.subjectId}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                    <span>{sub.subjectName}</span>
                    <span style={{ color: "var(--accent-purple)", fontWeight: "700" }}>{sub.masteryPercentage}%</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${sub.masteryPercentage}%`,
                        height: "100%",
                        background: "var(--gradient-brand)",
                        borderRadius: "4px",
                        transition: "width 0.6s ease"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action buttons */}
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-glass)", display: "flex", gap: "10px" }}>
              <Link href="/tests" className="btn-secondary" style={{ flex: 1, padding: "10px", fontSize: "13px", textAlign: "center" }}>
                <HelpCircle size={16} />
                <span>Test yechish</span>
              </Link>
              <Link href="/chat" className="btn-primary" style={{ flex: 1, padding: "10px", fontSize: "13px", textAlign: "center" }}>
                <Bot size={16} />
                <span>AI Repetitor</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Tests Result Grid */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{t.dashboard.recentTests}</h3>
            <Link href="/tests" style={{ fontSize: "13px", color: "var(--accent-purple)", fontWeight: "600", textDecoration: "none" }}>
              {t.dashboard.viewAllTests}
            </Link>
          </div>

          {stats?.recentTests && stats.recentTests.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px"
            }}>
              {stats.recentTests.map((test) => (
                <div
                  key={test.testResultId}
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-glass)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
                      {test.subjectName}
                    </span>
                    <span className={`badge ${test.passed ? "badge-emerald" : "badge-amber"}`}>
                      {test.percentage}%
                    </span>
                  </div>
                  <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "8px" }}>{test.testTitle}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                    <span>Ball: {test.score} / {test.totalPossibleScore}</span>
                    <Link href={`/tests`} style={{ color: "var(--accent-purple)", fontWeight: "600", textDecoration: "none" }}>
                      Ko'rish →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: "14px" }}>
              Hali birorta test topshirilmagan.
              <Link href="/tests" className="btn-primary" style={{ display: "inline-flex", marginTop: "12px" }}>
                Birinchi testni boshlash
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
