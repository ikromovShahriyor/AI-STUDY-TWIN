"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { AiAnalysisDto, KnowledgeLevel } from "@/lib/types";
import {
  Sparkles,
  Bot,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Zap,
  Target,
  RefreshCw
} from "lucide-react";

export default function AiTwinPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [analysis, setAnalysis] = useState<AiAnalysisDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalysis = async () => {
    try {
      const data = await apiFetch<AiAnalysisDto>("/aistudytwin/analysis");
      setAnalysis(data);
    } catch {
      // High-quality mock fallback
      setAnalysis({
        id: "a1",
        studentProfileId: profile?.id || "p1",
        overallLevel: (profile?.knowledgeLevel || 3) as KnowledgeLevel,
        strengths: [
          "Dasturlash & IT: OOP tamoyillari va sinflar bilan ishlash (78% o'zlashtirish)",
          "Ingliz tili: Grammatika va akademik leksika (82% o'zlashtirish)",
          "Muntazam o'rganish va kunlik 5 kunlik faol streak",
        ],
        weaknesses: [
          "Matematika: Hosilalar va murakkab trigonometrik ifodalar (65%)",
          "Dasturlash: Asinxron dasturlash va ko'p oqimli topshiriqlar",
          "Tezkor test yechish va vaqtni boshqarish ko'nikmasi",
        ],
        recommendations: [
          "Kuniga 30-45 daqiqa vaqt ajratib, o'quv rejangizdagi dasturlash va matematika vazifalarini bajaring.",
          "Matematika bo'yicha har bir formulani AI Chat'dan vizual va sodda misollar bilan tushuntirishni so'rang.",
          "Har hafta kamida 2 ta diagnostik test topshirib, o'zgarishlarni tahlil qiling.",
        ],
        nextLessons: [
          { subjectName: "Matematika", topicTitle: "Hosilalar va ularning amaliy tatbiqi", reason: "Ushbu mavzuni mustahkamlash umumiy aniqligingizni +15% ga oshiradi", priority: 1, estimatedMinutes: 45 },
          { subjectName: "Dasturlash & IT", topicTitle: "Asinxron dasturlash va Task / async-await", reason: "Backend va yuqori darajadagi dasturlash uchun zarur", priority: 2, estimatedMinutes: 50 },
          { subjectName: "Ingliz tili", topicTitle: "Academic Vocabulary for IELTS & TOEFL", reason: "IELTS 7.0+ darajasiga yetish uchun leksikani kengaytirish", priority: 3, estimatedMinutes: 35 },
        ],
        summary: "Sizning o'rganish dinamikangiz ijobiy. Dasturlash va ingliz tili bo'yicha kuchli poydevor shakllangan. Matematikadan murakkab mavzularga e'tibor qaratish tavsiya etiladi.",
        analyzedAt: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [profile]);

  const levelNames: Record<KnowledgeLevel, { name: string; color: string; desc: string }> = {
    1: { name: "Beginner (Boshlang'ich)", color: "var(--accent-cyan)", desc: "Asosiy tushunchalar va darsliklar bilan tanishish bosqichi" },
    2: { name: "Elementary (Oddiy)", color: "var(--accent-blue)", desc: "Standart misollarni yechish va qoidalarni qo'llash" },
    3: { name: "Intermediate (O'rta)", color: "var(--accent-purple)", desc: "Murakkab amaliy loyihalar va chuqur tushunchalar" },
    4: { name: "Advanced (Yuqori)", color: "var(--accent-emerald)", desc: "Professional darajadagi bilim va mustaqil yechimlar" },
  };

  const currentLevelInfo = levelNames[analysis?.overallLevel || 3];

  return (
    <div style={{ padding: "30px 20px" }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "30px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-purple)", fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>
              <Bot size={18} />
              <span>AI STUDY TWIN ENGINE</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              {t.aiTwin.title}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
              {t.aiTwin.subtitle}
            </p>
          </div>

          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchAnalysis();
            }}
            disabled={isRefreshing}
            className="btn-secondary"
            style={{ padding: "10px 18px", fontSize: "14px" }}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span>Qayta Tahlil Qilish</span>
          </button>
        </div>

        {/* Knowledge Level Hero Gauge */}
        <div
          className="glass-panel"
          style={{
            padding: "36px",
            marginBottom: "30px",
            background: "linear-gradient(135deg, rgba(22, 33, 58, 0.9) 0%, rgba(13, 19, 34, 0.95) 100%)",
            border: "1px solid var(--border-glass-glow)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px", alignItems: "center" }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: "12px" }}>
                AI Diagnostik Xulosasi
              </span>
              <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "10px", color: currentLevelInfo.color }}>
                {currentLevelInfo.name}
              </h2>
              <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
                {analysis?.summary || currentLevelInfo.desc}
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <Link href="/chat" className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
                  <Bot size={16} />
                  <span>AI bilan dars qilish</span>
                </Link>
                <Link href="/tests" className="btn-secondary" style={{ padding: "10px 20px", fontSize: "14px" }}>
                  <Zap size={16} color="var(--accent-amber)" />
                  <span>Darajani oshirish</span>
                </Link>
              </div>
            </div>

            {/* Visual Level Progress Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {([1, 2, 3, 4] as KnowledgeLevel[]).map((lvl) => {
                const info = levelNames[lvl];
                const isActive = (analysis?.overallLevel || 3) >= lvl;
                const isCurrent = (analysis?.overallLevel || 3) === lvl;

                return (
                  <div
                    key={lvl}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      background: isCurrent ? "rgba(139, 92, 246, 0.18)" : "var(--bg-tertiary)",
                      border: isCurrent ? "1px solid var(--accent-purple)" : "1px solid var(--border-glass)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: isActive ? info.color : "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "12px"
                    }}>
                      {lvl}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}>
                        {info.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{info.desc}</div>
                    </div>
                    {isCurrent && (
                      <span className="badge badge-purple" style={{ fontSize: "10px" }}>
                        Hozirgi
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses 2-Column Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          marginBottom: "30px"
        }}>
          {/* Strengths */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-emerald)" }}>
                <CheckCircle2 size={20} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{t.aiTwin.strengths}</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {analysis?.strengths.map((str, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-tertiary)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    fontSize: "13px",
                    lineHeight: 1.5
                  }}
                >
                  <span style={{ color: "var(--accent-emerald)", fontWeight: "700" }}>✓</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(244, 63, 94, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-rose)" }}>
                <AlertCircle size={20} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{t.aiTwin.weaknesses}</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {analysis?.weaknesses.map((wk, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-tertiary)",
                    border: "1px solid rgba(244, 63, 94, 0.2)",
                    fontSize: "13px",
                    lineHeight: 1.5
                  }}
                >
                  <span style={{ color: "var(--accent-rose)", fontWeight: "700" }}>!</span>
                  <span>{wk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-panel" style={{ padding: "24px", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{t.aiTwin.recommendations}</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {analysis?.recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-glass)",
                  fontSize: "13px",
                  lineHeight: 1.6
                }}
              >
                <div style={{ fontWeight: "700", color: "var(--accent-cyan)", marginBottom: "6px" }}>
                  💡 Tavsiya #{idx + 1}
                </div>
                <div>{rec}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Next Lessons */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{t.aiTwin.nextLessons}</h3>
            <span className="badge badge-cyan">AI Prioritet asosida</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {analysis?.nextLessons.map((lesson, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                  padding: "16px 20px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-glass)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: lesson.priority === 1 ? "rgba(244, 63, 94, 0.15)" : "rgba(139, 92, 246, 0.15)",
                    color: lesson.priority === 1 ? "var(--accent-rose)" : "var(--accent-purple)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "14px"
                  }}>
                    #{lesson.priority}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
                        {lesson.subjectName}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>• {lesson.estimatedMinutes} daqiqa</span>
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: "700" }}>{lesson.topicTitle}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{lesson.reason}</div>
                  </div>
                </div>

                <Link
                  href="/chat"
                  className="btn-primary"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  <span>{t.aiTwin.startLesson}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
