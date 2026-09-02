"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { SubjectDto, TestDto } from "@/lib/types";
import {
  HelpCircle,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  ChevronRight,
  Filter,
  Sparkles
} from "lucide-react";

export default function TestsPage() {
  const { t } = useTranslation();
  const [tests, setTests] = useState<TestDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [onlyDiagnostic, setOnlyDiagnostic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, subsRes] = await Promise.all([
          apiFetch<TestDto[]>("/test"),
          apiFetch<SubjectDto[]>("/subject"),
        ]);
        setTests(testsRes);
        setSubjects(subsRes);
      } catch {
        // Fallback test list
        setTests([
          {
            id: "t_cs_diag",
            subjectId: "1",
            subjectName: "Dasturlash & IT",
            subjectIcon: "Code",
            subjectColor: "from-violet-600 to-indigo-600",
            title: "Dasturlash bo'yicha Diagnostik Test",
            description: "OOP, ma'lumotlar tuzilmalari va C# asoslari bo'yicha 5 ta test savoli",
            difficulty: 2,
            durationMinutes: 10,
            totalQuestions: 5,
            passingScore: 60,
            isDiagnostic: true,
            xpReward: 75,
            questions: []
          },
          {
            id: "t_math_diag",
            subjectId: "2",
            subjectName: "Matematika",
            subjectIcon: "Calculator",
            subjectColor: "from-blue-600 to-cyan-500",
            title: "Matematika bo'yicha Diagnostik Test",
            description: "Algebra, chiziqli va kvadrat tenglamalar, hosilalar tahlili",
            difficulty: 1,
            durationMinutes: 10,
            totalQuestions: 3,
            passingScore: 60,
            isDiagnostic: true,
            xpReward: 60,
            questions: []
          },
          {
            id: "t_eng_diag",
            subjectId: "3",
            subjectName: "Ingliz tili",
            subjectIcon: "Globe",
            subjectColor: "from-emerald-500 to-teal-600",
            title: "Grammar & Vocabulary Mini-Quiz",
            description: "Present Perfect vs Past Simple va akademik lug'at boyligi",
            difficulty: 2,
            durationMinutes: 8,
            totalQuestions: 4,
            passingScore: 60,
            isDiagnostic: false,
            xpReward: 50,
            questions: []
          },
        ]);
        setSubjects([
          { id: "1", nameUz: "Dasturlash & IT", nameEn: "Programming", nameRu: "IT", code: "CS", description: "", icon: "Code", gradientColor: "", orderIndex: 1, totalTopicsCount: 4, totalTestsCount: 1 },
          { id: "2", nameUz: "Matematika", nameEn: "Math", nameRu: "Математика", code: "MATH", description: "", icon: "Calculator", gradientColor: "", orderIndex: 2, totalTopicsCount: 4, totalTestsCount: 1 },
          { id: "3", nameUz: "Ingliz tili", nameEn: "English", nameRu: "Английский", code: "ENG", description: "", icon: "Globe", gradientColor: "", orderIndex: 3, totalTopicsCount: 3, totalTestsCount: 1 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTests = tests.filter(test => {
    if (selectedSubject !== "all" && test.subjectId !== selectedSubject) return false;
    if (onlyDiagnostic && !test.isDiagnostic) return false;
    return true;
  });

  const getDifficultyBadge = (diff: number) => {
    switch (diff) {
      case 1:
        return <span className="badge badge-emerald">Oson</span>;
      case 2:
        return <span className="badge badge-amber">O'rta</span>;
      case 3:
        return <span className="badge badge-purple">Qiyin</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "30px 20px" }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-purple)", fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>
            <HelpCircle size={18} />
            <span>AI TEST & ASSESSMENT HUB</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            {t.tests.title}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            {t.tests.subtitle}
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "24px"
        }}>
          {/* Subject Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setSelectedSubject("all")}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: "13px",
                fontWeight: "600",
                border: "1px solid var(--border-glass)",
                background: selectedSubject === "all" ? "var(--gradient-brand)" : "var(--bg-tertiary)",
                color: selectedSubject === "all" ? "#fff" : "var(--text-secondary)",
                cursor: "pointer"
              }}
            >
              {t.tests.allSubjects}
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "1px solid var(--border-glass)",
                  background: selectedSubject === sub.id ? "var(--gradient-brand)" : "var(--bg-tertiary)",
                  color: selectedSubject === sub.id ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer"
                }}
              >
                {sub.nameUz}
              </button>
            ))}
          </div>

          {/* Diagnostic Only Checkbox Toggle */}
          <button
            onClick={() => setOnlyDiagnostic(!onlyDiagnostic)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "var(--radius-md)",
              background: onlyDiagnostic ? "rgba(139, 92, 246, 0.2)" : "var(--bg-tertiary)",
              border: onlyDiagnostic ? "1px solid var(--accent-purple)" : "1px solid var(--border-glass)",
              color: onlyDiagnostic ? "var(--accent-purple)" : "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <Sparkles size={16} />
            <span>{t.tests.diagnosticOnly}</span>
          </button>
        </div>

        {/* Tests Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px"
        }}>
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="glass-panel glass-panel-interactive"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                {/* Header tags */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
                    {test.subjectName}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {test.isDiagnostic && (
                      <span className="badge badge-purple">Diagnostika</span>
                    )}
                    {getDifficultyBadge(test.difficulty)}
                  </div>
                </div>

                <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "8px" }}>
                  {test.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "20px" }}>
                  {test.description}
                </p>
              </div>

              <div>
                {/* Meta details */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  padding: "12px 0",
                  borderTop: "1px solid var(--border-glass)",
                  borderBottom: "1px solid var(--border-glass)",
                  marginBottom: "16px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={14} color="var(--accent-purple)" />
                    <span>{test.durationMinutes} {t.common.minutes}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <HelpCircle size={14} color="var(--accent-cyan)" />
                    <span>{test.totalQuestions} savol</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Zap size={14} color="var(--accent-amber)" />
                    <span>+{test.xpReward} XP</span>
                  </div>
                </div>

                {/* Start Button */}
                <Link
                  href={`/tests/${test.id}`}
                  className="btn-primary"
                  style={{ width: "100%", padding: "10px 16px", fontSize: "14px" }}
                >
                  <span>{t.tests.startTest}</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
