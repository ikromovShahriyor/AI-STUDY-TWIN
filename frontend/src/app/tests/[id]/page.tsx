"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useTranslation } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  TestDto,
  TestResultDto,
  ErrorExplanationDto
} from "@/lib/types";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Bot,
  ArrowRight,
  ArrowLeft,
  Zap,
  RotateCcw,
  BookOpen
} from "lucide-react";

export default function TestRunnerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const testId = resolvedParams.id;

  const { t, language } = useTranslation();
  const { refreshProfile } = useAuth();
  const router = useRouter();

  const [test, setTest] = useState<TestDto | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestResultDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // AI Error Explanation modal
  const [explainingQuestionId, setExplainingQuestionId] = useState<string | null>(null);
  const [errorExplanation, setErrorExplanation] = useState<ErrorExplanationDto | null>(null);
  const [isLoadingAiExplanation, setIsLoadingAiExplanation] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await apiFetch<TestDto>(`/test/${testId}`);
        setTest(data);
        setTimeLeftSeconds(data.durationMinutes * 60);
      } catch {
        // Fallback test data
        setTest({
          id: testId,
          subjectId: "1",
          subjectName: "Dasturlash & IT",
          subjectIcon: "Code",
          subjectColor: "from-violet-600 to-indigo-600",
          title: "Dasturlash Diagnostik Test",
          description: "OOP va C# bo'yicha bilim darajasini baholash",
          difficulty: 2,
          durationMinutes: 10,
          totalQuestions: 3,
          passingScore: 60,
          isDiagnostic: true,
          xpReward: 75,
          questions: [
            {
              id: "q1",
              testId: testId,
              questionText: "OOP (Obyektga yo'naltirilgan dasturlash) ning 4 ta asosiy tamoyili qaysilar?",
              points: 30,
              questionType: 1,
              orderIndex: 1,
              answers: [
                { id: "a1", questionId: "q1", answerText: "Enkapsulyatsiya, Merosxo'rlik, Polimorfizm, Abstraksiya", orderIndex: 1 },
                { id: "a2", questionId: "q1", answerText: "Kompilyatsiya, Interpretatsiya, Sinxronizatsiya, Kesh", orderIndex: 2 },
                { id: "a3", questionId: "q1", answerText: "Massiv, Ro'yxat, Stek, Navbat", orderIndex: 3 },
              ]
            },
            {
              id: "q2",
              testId: testId,
              questionText: "C# da 'async' va 'await' nima maqsadda ishlatiladi?",
              codeSnippet: "public async Task<string> FetchDataAsync() {\n    return await client.GetStringAsync(url);\n}",
              points: 35,
              questionType: 1,
              orderIndex: 2,
              answers: [
                { id: "a4", questionId: "q2", answerText: "Asosiy oqimni to'xtatmasdan asinxron kod bajarish uchun", orderIndex: 1 },
                { id: "a5", questionId: "q2", answerText: "Xotirani tozalash (GC) ni tezlashtirish uchun", orderIndex: 2 },
                { id: "a6", questionId: "q2", answerText: "Faqat fayllarni shifrlash uchun", orderIndex: 3 },
              ]
            },
            {
              id: "q3",
              testId: testId,
              questionText: "Binary Search (Ikkilik qidiruv) algoritmining vaqt murakkabligi qanday?",
              points: 35,
              questionType: 1,
              orderIndex: 3,
              answers: [
                { id: "a7", questionId: "q3", answerText: "O(log n)", orderIndex: 1 },
                { id: "a8", questionId: "q3", answerText: "O(n^2)", orderIndex: 2 },
                { id: "a9", questionId: "q3", answerText: "O(n)", orderIndex: 3 },
              ]
            }
          ]
        });
        setTimeLeftSeconds(600);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (!test || testResult || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, testResult, timeLeftSeconds]);

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmitTest = async () => {
    if (!test || isSubmitting) return;
    setIsSubmitting(true);

    const submissionPayload = {
      testId: test.id,
      timeSpentSeconds: (test.durationMinutes * 60) - timeLeftSeconds,
      answers: test.questions.map(q => ({
        questionId: q.id,
        selectedAnswerId: selectedAnswers[q.id] || null
      }))
    };

    try {
      const res = await apiFetch<TestResultDto>("/test/submit", {
        method: "POST",
        body: JSON.stringify(submissionPayload)
      });
      setTestResult(res);

      if (res.passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      await refreshProfile();
    } catch {
      // Offline grading fallback
      let score = 0;
      let total = 0;
      const detailedAnswers = test.questions.map((q, idx) => {
        total += q.points;
        const selectedId = selectedAnswers[q.id];
        // In demo fallback, option index 0 is correct
        const correctOpt = q.answers[0];
        const isCorrect = selectedId === correctOpt?.id;
        if (isCorrect) score += q.points;

        return {
          questionId: q.id,
          questionText: q.questionText,
          codeSnippet: q.codeSnippet,
          explanation: "Ushbu javob ta'lim andozalari bo'yicha to'g'ri hisoblanadi.",
          selectedAnswerId: selectedId,
          selectedAnswerText: q.answers.find(a => a.id === selectedId)?.answerText || "Belgilanmagan",
          correctAnswerId: correctOpt?.id || "",
          correctAnswerText: correctOpt?.answerText || "",
          isCorrect,
          points: isCorrect ? q.points : 0
        };
      });

      const pct = Math.round((score / total) * 100);
      const passed = pct >= test.passingScore;

      setTestResult({
        id: "r_local",
        testId: test.id,
        testTitle: test.title,
        subjectName: test.subjectName,
        score,
        totalPossibleScore: total,
        percentage: pct,
        timeSpentSeconds: 120,
        passed,
        xpEarned: passed ? test.xpReward : 20,
        completedAt: new Date().toISOString(),
        aiFeedback: passed ? "Ajoyib natija! Mavzu to'liq o'zlashtirilgan." : "Qayta tahlil qilish tavsiya etiladi.",
        weakAreas: passed ? [] : ["Murakkab nazariy tushunchalar"],
        strongAreas: ["Asosiy qoidalar"],
        answers: detailedAnswers
      });

      if (passed) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExplainError = async (questionId: string) => {
    setExplainingQuestionId(questionId);
    setErrorExplanation(null);
    setIsLoadingAiExplanation(true);

    try {
      const data = await apiFetch<ErrorExplanationDto>("/aistudytwin/explain-error", {
        method: "POST",
        body: JSON.stringify({
          testResultId: testResult?.id || "r1",
          questionId,
          language
        })
      });
      setErrorExplanation(data);
    } catch {
      const question = testResult?.answers.find(a => a.questionId === questionId);
      setErrorExplanation({
        questionId,
        questionText: question?.questionText || "",
        studentAnswer: question?.selectedAnswerText || "Belgilanmagan",
        correctAnswer: question?.correctAnswerText || "",
        explanation: question?.explanation || "",
        aiDetailedAnalysis: "Siz ushbu savolda asosiy kalit so'zlarga e'tibor bermasdan shoshildingiz. To'g'ri yondashuv shundaki, berilgan shartni alohida tahlil qilish kerak.",
        improvementSteps: [
          "Mavzuga oid konspektni qayta o'qib chiqing.",
          "AI Chat'dan ushbu savolning batafsil yechimini so'rang.",
          "O'xshash 2 ta misol yeching."
        ]
      });
    } finally {
      setIsLoadingAiExplanation(false);
    }
  };

  if (isLoading || !test) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Sparkles size={32} className="animate-spin" color="var(--accent-purple)" style={{ margin: "0 auto 12px" }} />
          <div>{t.common.loading}</div>
        </div>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (testResult) {
    return (
      <div style={{ padding: "40px 20px" }}>
        <div className="container-custom" style={{ maxWidth: "800px" }}>
          {/* Result Card */}
          <div
            className="glass-panel"
            style={{
              padding: "40px 30px",
              textAlign: "center",
              marginBottom: "30px",
              background: testResult.passed
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(13, 19, 34, 0.9) 100%)"
                : "linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(13, 19, 34, 0.9) 100%)",
              border: testResult.passed ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(244, 63, 94, 0.4)"
            }}
          >
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: testResult.passed ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)",
              color: testResult.passed ? "var(--accent-emerald)" : "var(--accent-rose)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px"
            }}>
              {testResult.passed ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
            </div>

            <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>
              {testResult.passed ? t.tests.passed : t.tests.failed}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
              {testResult.aiFeedback}
            </p>

            {/* Score Numbers */}
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap", marginBottom: "28px" }}>
              <div className="glass-panel" style={{ padding: "14px 24px", minWidth: "130px" }}>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-purple)" }}>
                  {testResult.percentage}%
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>{t.tests.percentage}</div>
              </div>
              <div className="glass-panel" style={{ padding: "14px 24px", minWidth: "130px" }}>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-cyan)" }}>
                  {testResult.score}/{testResult.totalPossibleScore}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>{t.tests.score}</div>
              </div>
              <div className="glass-panel" style={{ padding: "14px 24px", minWidth: "130px" }}>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-amber)" }}>
                  +{testResult.xpEarned} XP
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>{t.tests.xpEarned}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button
                onClick={() => {
                  setTestResult(null);
                  setCurrentQuestionIdx(0);
                  setSelectedAnswers({});
                  setTimeLeftSeconds(test.durationMinutes * 60);
                }}
                className="btn-secondary"
                style={{ padding: "10px 20px", fontSize: "14px" }}
              >
                <RotateCcw size={16} />
                <span>Qayta topshirish</span>
              </button>
              <Link href="/dashboard" className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
                <span>Dashboardga qaytish</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="glass-panel" style={{ padding: "30px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
              {t.tests.detailedReview}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {testResult.answers.map((ans, idx) => (
                <div
                  key={ans.questionId}
                  style={{
                    padding: "20px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-tertiary)",
                    border: ans.isCorrect ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(244, 63, 94, 0.3)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-cyan)" }}>
                      Savol #{idx + 1}
                    </span>
                    <span className={`badge ${ans.isCorrect ? "badge-emerald" : "badge-rose"}`} style={{ color: ans.isCorrect ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                      {ans.isCorrect ? "To'g'ri (+ " + ans.points + " ball)" : "Noto'g'ri"}
                    </span>
                  </div>

                  <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "12px" }}>
                    {ans.questionText}
                  </h4>

                  {ans.codeSnippet && (
                    <pre style={{
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "#050811",
                      color: "#38bdf8",
                      fontFamily: "var(--font-code)",
                      fontSize: "13px",
                      marginBottom: "12px",
                      overflowX: "auto"
                    }}>
                      <code>{ans.codeSnippet}</code>
                    </pre>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px", marginBottom: "14px" }}>
                    <div style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", background: ans.isCorrect ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", marginBottom: "2px" }}>{t.tests.yourAnswer}:</span>
                      <span style={{ fontWeight: "600" }}>{ans.selectedAnswerText || "Javob berilmadi"}</span>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "rgba(16, 185, 129, 0.1)" }}>
                      <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px", marginBottom: "2px" }}>{t.tests.correctAnswer}:</span>
                      <span style={{ fontWeight: "600", color: "var(--accent-emerald)" }}>{ans.correctAnswerText}</span>
                    </div>
                  </div>

                  {!ans.isCorrect && (
                    <button
                      onClick={() => handleExplainError(ans.questionId)}
                      className="btn-secondary"
                      style={{ padding: "6px 14px", fontSize: "12px", gap: "6px" }}
                    >
                      <Bot size={14} color="var(--accent-purple)" />
                      <span>{t.tests.aiExplainError}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Error Explanation Modal */}
        {explainingQuestionId && (
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
                maxWidth: "600px",
                padding: "30px",
                borderRadius: "var(--radius-xl)",
                maxHeight: "90vh",
                overflowY: "auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <Bot size={20} />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800" }}>AI Xatolar Tahlili</h3>
                </div>
                <button
                  onClick={() => setExplainingQuestionId(null)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "18px" }}
                >
                  ✕
                </button>
              </div>

              {isLoadingAiExplanation ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Sparkles size={32} className="animate-spin" color="var(--accent-purple)" style={{ margin: "0 auto 12px" }} />
                  <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>AI repetitor sizning xatoyingizni tahlil qilmoqda...</p>
                </div>
              ) : errorExplanation ? (
                <div>
                  <div style={{ padding: "14px", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", marginBottom: "16px", fontSize: "14px", lineHeight: 1.6 }}>
                    {errorExplanation.aiDetailedAnalysis}
                  </div>

                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-cyan)", marginBottom: "10px" }}>
                    🎯 Muvaffaqiyatga erishish qadamlari:
                  </h4>
                  <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                    {errorExplanation.improvementSteps.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setExplainingQuestionId(null)}
                    className="btn-primary"
                    style={{ width: "100%" }}
                  >
                    Tushunarli
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RUNNER VIEW ---
  const currentQ = test.questions[currentQuestionIdx];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  return (
    <div style={{ padding: "30px 20px" }}>
      <div className="container-custom" style={{ maxWidth: "800px" }}>
        {/* Header with Title & Timer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
              {test.subjectName}
            </span>
            <h2 style={{ fontSize: "22px", fontWeight: "800" }}>{test.title}</h2>
          </div>

          {/* Countdown Ring */}
          <div
            className="glass-panel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              border: timeLeftSeconds < 120 ? "1px solid var(--accent-rose)" : "1px solid var(--border-glass)"
            }}
          >
            <Clock size={16} color={timeLeftSeconds < 120 ? "var(--accent-rose)" : "var(--accent-cyan)"} />
            <span style={{ fontSize: "15px", fontWeight: "800", color: timeLeftSeconds < 120 ? "var(--accent-rose)" : "var(--text-primary)" }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Question Step Circles */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "4px" }}>
          {test.questions.map((q, idx) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = idx === currentQuestionIdx;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIdx(idx)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  border: isCurrent ? "2px solid var(--accent-purple)" : "1px solid var(--border-glass)",
                  background: isAnswered ? "var(--gradient-brand)" : isCurrent ? "rgba(139, 92, 246, 0.2)" : "var(--bg-tertiary)",
                  color: isAnswered || isCurrent ? "#fff" : "var(--text-muted)",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="glass-panel" style={{ padding: "30px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                Savol {currentQuestionIdx + 1} / {test.questions.length}
              </span>
              <span className="badge badge-purple">+{currentQ.points} ball</span>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "700", lineHeight: 1.5, marginBottom: "16px" }}>
              {currentQ.questionText}
            </h3>

            {currentQ.codeSnippet && (
              <pre style={{
                padding: "14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#050811",
                color: "#38bdf8",
                fontFamily: "var(--font-code)",
                fontSize: "13px",
                marginBottom: "20px",
                overflowX: "auto"
              }}>
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* Answers List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {currentQ.answers.map((ans) => {
                const isSelected = selectedAnswers[currentQ.id] === ans.id;

                return (
                  <div
                    key={ans.id}
                    onClick={() => handleSelectAnswer(currentQ.id, ans.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "16px 18px",
                      borderRadius: "var(--radius-md)",
                      background: isSelected ? "rgba(139, 92, 246, 0.15)" : "var(--bg-tertiary)",
                      border: isSelected ? "1px solid var(--accent-purple)" : "1px solid var(--border-glass)",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: isSelected ? "5px solid var(--accent-purple)" : "2px solid var(--border-glass)",
                      backgroundColor: isSelected ? "#fff" : "transparent"
                    }} />
                    <span style={{ fontSize: "14px", fontWeight: isSelected ? "700" : "500" }}>
                      {ans.answerText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIdx === 0}
            className="btn-secondary"
            style={{ padding: "10px 18px", fontSize: "14px", opacity: currentQuestionIdx === 0 ? 0.5 : 1 }}
          >
            <ArrowLeft size={16} />
            <span>{t.tests.prevQuestion}</span>
          </button>

          {currentQuestionIdx === test.questions.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="btn-primary"
              style={{ padding: "10px 24px", fontSize: "14px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              {isSubmitting ? <span>{t.common.loading}</span> : <span>{t.common.finish}</span>}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.min(test.questions.length - 1, prev + 1))}
              className="btn-primary"
              style={{ padding: "10px 20px", fontSize: "14px" }}
            >
              <span>{t.tests.nextQuestion}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
