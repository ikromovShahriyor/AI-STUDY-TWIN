"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { AchievementDto, DailyChallengeDto, LeaderboardUserDto } from "@/lib/types";
import {
  Trophy,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  Crown,
  Medal,
  Star
} from "lucide-react";

export default function GamificationPage() {
  const { t } = useTranslation();
  const { profile, refreshProfile } = useAuth();

  const [achievements, setAchievements] = useState<AchievementDto[]>([]);
  const [challenges, setChallenges] = useState<DailyChallengeDto[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [achRes, chRes, leadRes] = await Promise.all([
        apiFetch<AchievementDto[]>("/gamification/achievements"),
        apiFetch<DailyChallengeDto[]>("/gamification/challenges"),
        apiFetch<LeaderboardUserDto[]>("/gamification/leaderboard"),
      ]);
      setAchievements(achRes);
      setChallenges(chRes);
      setLeaderboard(leadRes);
    } catch {
      // Fallback
      setAchievements([
        { id: "1", titleUz: "Birinchi Qadam", titleEn: "First Step", titleRu: "Первый шаг", descriptionUz: "AI Study Twin ga muvaffaqiyatli a'zo bo'ldingiz", descriptionEn: "", descriptionRu: "", icon: "Sparkles", requiredXp: 0, category: "Starter", tier: 1, xpBonus: 50, isUnlocked: true, unlockedAt: new Date().toISOString() },
        { id: "2", titleUz: "Bilim Izlovchi", titleEn: "Knowledge Seeker", titleRu: "Искатель знаний", descriptionUz: "Birinchi o'quv topshirig'ini yakunladingiz", descriptionEn: "", descriptionRu: "", icon: "BookOpen", requiredXp: 100, category: "Study", tier: 1, xpBonus: 75, isUnlocked: true, unlockedAt: new Date().toISOString() },
        { id: "3", titleUz: "Test Ustasi", titleEn: "Quiz Master", titleRu: "Мастер тестов", descriptionUz: "Testdan 80% dan yuqori ball to'pladingiz", descriptionEn: "", descriptionRu: "", icon: "Award", requiredXp: 250, category: "Test", tier: 2, xpBonus: 100, isUnlocked: true },
        { id: "4", titleUz: "Streak Qahramoni", titleEn: "Streak Hero", titleRu: "Герой серии", descriptionUz: "Ketma-ket 7 kun faol o'qish", descriptionEn: "", descriptionRu: "", icon: "Flame", requiredXp: 500, category: "Streak", tier: 3, xpBonus: 200, isUnlocked: false },
        { id: "5", titleUz: "AI Tadqiqotchi", titleEn: "AI Explorer", titleRu: "Исследователь ИИ", descriptionUz: "AI repetitor bilan 10 martadan ortiq muloqot qildingiz", descriptionEn: "", descriptionRu: "", icon: "Bot", requiredXp: 300, category: "AI", tier: 2, xpBonus: 120, isUnlocked: false },
      ]);

      setChallenges([
        { id: "c1", titleUz: "Kunlik Darslar", titleEn: "Daily Lessons", titleRu: "Уроки", descriptionUz: "Bugun 2 ta vazifani bajaring", descriptionEn: "", descriptionRu: "", xpReward: 40, challengeType: 1, targetCount: 2, currentCount: 2, icon: "CheckCircle", isCompleted: true, isClaimed: false },
        { id: "c2", titleUz: "Test Sinovi", titleEn: "Quiz Challenge", titleRu: "Тест", descriptionUz: "Istalgan fan bo'yicha 1 ta test topshiring", descriptionEn: "", descriptionRu: "", xpReward: 50, challengeType: 2, targetCount: 1, currentCount: 1, icon: "HelpCircle", isCompleted: true, isClaimed: true },
        { id: "c3", titleUz: "AI bilan Savol-Javob", titleEn: "Ask AI Tutor", titleRu: "Вопрос ИИ", descriptionUz: "AI o'qituvchidan 3 ta savol so'rang", descriptionEn: "", descriptionRu: "", xpReward: 30, challengeType: 4, targetCount: 3, currentCount: 1, icon: "MessageSquare", isCompleted: false, isClaimed: false },
      ]);

      setLeaderboard([
        { rank: 1, studentProfileId: "p1", fullName: "Azizbek Ikromov", avatarUrl: "", totalXp: 480, level: 3, currentStreak: 5 },
        { rank: 2, studentProfileId: "p2", fullName: "Malika Karimova", avatarUrl: "", totalXp: 420, level: 3, currentStreak: 8 },
        { rank: 3, studentProfileId: "p3", fullName: "Jasur Rahimov", avatarUrl: "", totalXp: 350, level: 2, currentStreak: 4 },
        { rank: 4, studentProfileId: "p4", fullName: "Shahnoza Aliyeva", avatarUrl: "", totalXp: 290, level: 2, currentStreak: 3 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  const handleClaimReward = async (challengeId: string) => {
    try {
      await apiFetch(`/gamification/challenges/${challengeId}/claim`, { method: "POST" });
      confetti({ particleCount: 80, spread: 70 });
      await fetchData();
      await refreshProfile();
    } catch {
      // Local fallback claim
      setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, isClaimed: true } : c));
      confetti({ particleCount: 80, spread: 70 });
    }
  };

  const level = profile?.level || 1;
  const currentXp = profile?.totalXp || 100;
  const nextLevelXp = level * 200;
  const currentLevelBaseXp = (level - 1) * 200;
  const progressPercent = Math.min(100, Math.max(10, Math.round(((currentXp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp || 1)) * 100)));

  return (
    <div style={{ padding: "30px 20px" }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-amber)", fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>
            <Trophy size={18} />
            <span>GAMIFICATION & XP REWARDS</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            {t.gamification.title}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            {t.gamification.subtitle}
          </p>
        </div>

        {/* Level Progression Banner */}
        <div
          className="glass-panel"
          style={{
            padding: "30px",
            marginBottom: "30px",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(139, 92, 246, 0.15) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.3)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)"
              }}>
                <Crown size={28} />
              </div>
              <div>
                <span className="badge badge-amber" style={{ marginBottom: "4px" }}>
                  Hozirgi Daraja
                </span>
                <h2 style={{ fontSize: "24px", fontWeight: "800" }}>
                  Daraja {level} — Bilimdon O'quvchi
                </h2>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--accent-amber)" }}>
                {currentXp} XP
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Keyingi darajagacha: {nextLevelXp - currentXp} XP
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div style={{ width: "100%", height: "10px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "5px", overflow: "hidden", marginBottom: "10px" }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #f59e0b, #8b5cf6)",
                borderRadius: "5px",
                transition: "width 0.6s ease"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
            <span>Lvl {level} ({currentLevelBaseXp} XP)</span>
            <span>Lvl {level + 1} ({nextLevelXp} XP)</span>
          </div>
        </div>

        {/* 2 Columns: Daily Challenges + Leaderboard */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          marginBottom: "30px"
        }}>
          {/* Daily Quests */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-amber)" }}>
                <Zap size={20} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{t.gamification.dailyChallenges}</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {challenges.map((ch) => (
                <div
                  key={ch.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    background: ch.isCompleted ? "rgba(16, 185, 129, 0.08)" : "var(--bg-tertiary)",
                    border: ch.isCompleted ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-glass)"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "2px" }}>
                      {ch.titleUz}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                      {ch.descriptionUz}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent-amber)" }}>
                      Progress: {ch.currentCount} / {ch.targetCount} • +{ch.xpReward} XP
                    </div>
                  </div>

                  <div>
                    {ch.isClaimed ? (
                      <span className="badge badge-emerald">
                        ✓ Olingan
                      </span>
                    ) : ch.isCompleted ? (
                      <button
                        onClick={() => handleClaimReward(ch.id)}
                        className="btn-primary"
                        style={{ padding: "6px 14px", fontSize: "12px", background: "linear-gradient(135deg, #10b981, #059669)" }}
                      >
                        Mukofotni Olish
                      </button>
                    ) : (
                      <span className="badge badge-purple">
                        {ch.currentCount}/{ch.targetCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
                <Trophy size={20} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{t.gamification.leaderboard}</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {leaderboard.map((user) => {
                const isTop1 = user.rank === 1;
                const isTop2 = user.rank === 2;
                const isTop3 = user.rank === 3;

                return (
                  <div
                    key={user.rank}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      background: isTop1 ? "rgba(245, 158, 11, 0.12)" : "var(--bg-tertiary)",
                      border: isTop1 ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid var(--border-glass)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        backgroundColor: isTop1 ? "#f59e0b" : isTop2 ? "#94a3b8" : isTop3 ? "#d97706" : "rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "800",
                        fontSize: "12px"
                      }}>
                        {user.rank}
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "700" }}>{user.fullName}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Daraja {user.level}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#f59e0b", fontSize: "12px", fontWeight: "700" }}>
                        <Flame size={14} fill="#f59e0b" />
                        <span>{user.currentStreak}k</span>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--accent-purple)" }}>
                        {user.totalXp} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Badges & Achievements Grid */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
            {t.gamification.achievements}
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px"
          }}>
            {achievements.map((ach) => (
              <div
                key={ach.id}
                style={{
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                  background: ach.isUnlocked ? "var(--bg-tertiary)" : "rgba(0, 0, 0, 0.2)",
                  border: ach.isUnlocked ? "1px solid var(--border-glass-glow)" : "1px solid var(--border-glass)",
                  opacity: ach.isUnlocked ? 1 : 0.6,
                  textAlign: "center"
                }}
              >
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: ach.isUnlocked ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  color: ach.isUnlocked ? "var(--accent-purple)" : "var(--text-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px"
                }}>
                  {ach.isUnlocked ? <Award size={26} /> : <Lock size={22} />}
                </div>

                <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>
                  {ach.titleUz}
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  {ach.descriptionUz}
                </p>
                <span className="badge badge-amber">+{ach.xpBonus} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
