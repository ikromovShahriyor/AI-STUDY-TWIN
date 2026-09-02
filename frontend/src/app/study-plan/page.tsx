"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { StudyPlanDto, StudyTaskDto, StudyTaskStatus, SubjectDto } from "@/lib/types";
import {
  CalendarCheck,
  Sparkles,
  Bot,
  Plus,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  AlertCircle
} from "lucide-react";

export default function StudyPlanPage() {
  const { t, language } = useTranslation();
  const { profile, refreshProfile } = useAuth();

  const [plan, setPlan] = useState<StudyPlanDto | null>(null);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Plan Generator Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [goalText, setGoalText] = useState("1 oyda OOP, C# va Matematika asoslarini to'liq o'zlashtirish");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [durationDays, setDurationDays] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPlanAndSubjects = async () => {
    try {
      const [planRes, subsRes] = await Promise.all([
        apiFetch<StudyPlanDto>("/studyplan/active"),
        apiFetch<SubjectDto[]>("/subject"),
      ]);
      setPlan(planRes);
      setSubjects(subsRes);
      if (subsRes.length > 0) {
        setSelectedSubjectIds(subsRes.map(s => s.id));
      }
    } catch {
      // Fallback
      setPlan({
        id: "p1",
        studentProfileId: profile?.id || "p1",
        title: "AI Shaxsiy Reja: Dasturlash va Matematika",
        description: "7 kunlik intensiv o'quv va amaliyot dasturi",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        isActive: true,
        goalSummary: "OOP tamoyillari va kvadrat tenglamalarni chuqur o'zlashtirish",
        aiRecommendation: "Dasturlash darslaridagi kod misollarini albatta yozib ko'ring.",
        totalTasks: 4,
        completedTasks: 1,
        progressPercentage: 25,
        tasks: [
          { id: "t1", studyPlanId: "p1", title: "OOP tamoyillari: Enkapsulyatsiya va Abstraksiya", description: "Asosiy tushunchalar va C# da sinf yaratish", taskDate: new Date().toISOString(), status: 3 as StudyTaskStatus, durationMinutes: 30, xpReward: 25, subjectName: "Dasturlash & IT" },
          { id: "t2", studyPlanId: "p1", title: "Chiziqli tenglamalar amaliy mashg'uloti", description: "5 ta misol yechish va tekshirish", taskDate: new Date().toISOString(), status: 2 as StudyTaskStatus, durationMinutes: 30, xpReward: 20, subjectName: "Matematika" },
          { id: "t3", studyPlanId: "p1", title: "Merosxo'rlik va Polimorfizm amaliyoti", description: "Interfeyslar va virtual metodlar", taskDate: new Date(Date.now() + 86400000).toISOString(), status: 1 as StudyTaskStatus, durationMinutes: 40, xpReward: 30, subjectName: "Dasturlash & IT" },
          { id: "t4", studyPlanId: "p1", title: "Kvadrat tenglamalar va Viyet teoremasi", description: "Nazariya va 4 ta masala", taskDate: new Date(Date.now() + 86400000).toISOString(), status: 1 as StudyTaskStatus, durationMinutes: 30, xpReward: 20, subjectName: "Matematika" },
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanAndSubjects();
  }, [profile]);

  const handleUpdateStatus = async (taskId: string, newStatus: StudyTaskStatus) => {
    try {
      await apiFetch(`/studyplan/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchPlanAndSubjects();
      await refreshProfile();

      if (newStatus === 3) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      }
    } catch {
      if (plan) {
        setPlan({
          ...plan,
          tasks: plan.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        });
      }
    }
  };

  const handleGenerateAiPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const generated = await apiFetch<StudyPlanDto>("/studyplan/generate-ai", {
        method: "POST",
        body: JSON.stringify({
          goal: goalText,
          subjectIds: selectedSubjectIds,
          durationDays,
          dailyMinutes,
          language
        })
      });
      setPlan(generated);
      setIsAiModalOpen(false);
      confetti({ particleCount: 100, spread: 80 });
      await refreshProfile();
    } catch (err: any) {
      alert("Reja generatsiya qilishda xatolik: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: "30px 20px" }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "30px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-purple)", fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>
              <CalendarCheck size={18} />
              <span>AI STUDY PLANNER</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              {t.studyPlan.title}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
              {t.studyPlan.subtitle}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="btn-primary"
              style={{ padding: "10px 20px", fontSize: "14px" }}
            >
              <Sparkles size={16} />
              <span>{t.studyPlan.createAiPlan}</span>
            </button>
          </div>
        </div>

        {/* Active Plan Overview Card */}
        {plan && (
          <div
            className="glass-panel"
            style={{
              padding: "28px",
              marginBottom: "30px",
              background: "linear-gradient(135deg, rgba(22, 33, 58, 0.9) 0%, rgba(13, 19, 34, 0.95) 100%)",
              border: "1px solid var(--border-glass-glow)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
              <div>
                <span className="badge badge-purple" style={{ marginBottom: "8px" }}>
                  Faol O'quv Rejasi
                </span>
                <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "6px" }}>
                  {plan.title}
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  {plan.description}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-cyan)" }}>
                  {plan.progressPercentage}%
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {plan.completedTasks} / {plan.totalTasks} vazifa bajarildi
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: "100%", height: "8px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "4px", overflow: "hidden", marginBottom: "20px" }}>
              <div
                style={{
                  width: `${plan.progressPercentage}%`,
                  height: "100%",
                  background: "var(--gradient-brand)",
                  borderRadius: "4px",
                  transition: "width 0.6s ease"
                }}
              />
            </div>

            {plan.aiRecommendation && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "var(--radius-md)", background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.25)", fontSize: "13px" }}>
                <Bot size={18} color="var(--accent-purple)" />
                <span><strong>AI Tavsiyasi:</strong> {plan.aiRecommendation}</span>
              </div>
            )}
          </div>
        )}

        {/* Task Schedule Timeline */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
            Rejalashtirilgan Darslar va Vazifalar
          </h3>

          {plan?.tasks && plan.tasks.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {plan.tasks.map((task) => {
                const isCompleted = task.status === 3;
                const isInProgress = task.status === 2;

                return (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "14px",
                      padding: "16px 20px",
                      borderRadius: "var(--radius-md)",
                      background: isCompleted ? "rgba(16, 185, 129, 0.06)" : isInProgress ? "rgba(139, 92, 246, 0.08)" : "var(--bg-tertiary)",
                      border: isCompleted ? "1px solid rgba(16, 185, 129, 0.3)" : isInProgress ? "1px solid var(--accent-purple)" : "1px solid var(--border-glass)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: isCompleted ? "rgba(16, 185, 129, 0.2)" : "rgba(139, 92, 246, 0.15)",
                        color: isCompleted ? "var(--accent-emerald)" : "var(--accent-purple)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <CalendarCheck size={18} />
                      </div>
                      <div>
                        <div style={{
                          fontSize: "15px",
                          fontWeight: "700",
                          color: isCompleted ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: isCompleted ? "line-through" : "none"
                        }}>
                          {task.title}
                        </div>
                        <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                          {task.subjectName && <span style={{ color: "var(--accent-cyan)", fontWeight: "600" }}>{task.subjectName}</span>}
                          <span>•</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {task.durationMinutes} daqiqa</span>
                          <span>•</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent-amber)" }}><Zap size={12} /> +{task.xpReward} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Dropdown Selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, Number(e.target.value) as StudyTaskStatus)}
                        className="input-field"
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          width: "auto",
                          cursor: "pointer",
                          backgroundColor: isCompleted ? "rgba(16, 185, 129, 0.15)" : "var(--bg-secondary)",
                          color: isCompleted ? "var(--accent-emerald)" : "var(--text-primary)"
                        }}
                      >
                        <option value={1}>{t.studyPlan.statusPending}</option>
                        <option value={2}>{t.studyPlan.statusInProgress}</option>
                        <option value={3}>{t.studyPlan.statusCompleted} ✓</option>
                        <option value={4}>{t.studyPlan.statusSkipped}</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              <CalendarCheck size={40} color="var(--accent-purple)" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "15px", fontWeight: "600" }}>Hozircha rejadagi vazifalar mavjud emas.</p>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="btn-primary"
                style={{ marginTop: "16px" }}
              >
                <Sparkles size={16} />
                <span>AI bilan Reja Yaratish</span>
              </button>
            </div>
          )}
        </div>

        {/* Generate AI Plan Modal */}
        {isAiModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 100
            }}
          >
            <div
              className="glass-panel"
              style={{
                width: "100%",
                maxWidth: "540px",
                padding: "32px",
                borderRadius: "var(--radius-xl)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <Sparkles size={18} />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800" }}>{t.studyPlan.createAiPlan}</h3>
                </div>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "18px" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleGenerateAiPlan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                    {t.studyPlan.goalInput}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    className="input-field"
                    style={{ resize: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                      Davomiylik (kun)
                    </label>
                    <select
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="input-field"
                    >
                      <option value={7}>7 kun (1 hafta)</option>
                      <option value={14}>14 kun (2 hafta)</option>
                      <option value={30}>30 kun (1 oy)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                      {t.studyPlan.dailyMinutes}
                    </label>
                    <select
                      value={dailyMinutes}
                      onChange={(e) => setDailyMinutes(Number(e.target.value))}
                      className="input-field"
                    >
                      <option value={30}>30 daqiqa</option>
                      <option value={45}>45 daqiqa</option>
                      <option value={60}>60 daqiqa</option>
                      <option value={90}>90 daqiqa</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(false)}
                    className="btn-secondary"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="btn-primary"
                  >
                    {isGenerating ? <span>Generatsiya qilinmoqda...</span> : <span>Rejani Generatsiya Qilish</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
