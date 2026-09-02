"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, User, Mail, Lock, BookOpen, Target, AlertCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gradeLevel, setGradeLevel] = useState("10-sinf");
  const [targetExam, setTargetExam] = useState("IT & Dasturlash");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await register(fullName, email, password, gradeLevel, targetExam);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 70px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      background: "var(--gradient-glow)"
    }}>
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "36px 30px",
          borderRadius: "var(--radius-xl)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "var(--gradient-brand)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            marginBottom: "16px",
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
          }}>
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "6px" }}>
            {t.auth.registerTitle}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            {t.auth.registerSubtitle}
          </p>
        </div>

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "var(--accent-rose)",
            fontSize: "13px",
            marginBottom: "20px"
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
              {t.auth.fullName} *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Azizbek Ikromov"
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
              <User size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
              {t.auth.email} *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="azizbek@example.com"
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
              {t.auth.password} *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                {t.auth.gradeLevel}
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="input-field"
                style={{ cursor: "pointer" }}
              >
                <option value="9-sinf">9-sinf</option>
                <option value="10-sinf">10-sinf</option>
                <option value="11-sinf">11-sinf</option>
                <option value="1-kurs Talaba">1-kurs Talaba</option>
                <option value="Mustaqil o'rganuvchi">Mustaqil o'rganuvchi</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                {t.auth.targetExam}
              </label>
              <input
                type="text"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                placeholder="IELTS, DTM, SAT..."
                className="input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", marginTop: "8px" }}
          >
            {isLoading ? (
              <span>{t.common.loading}</span>
            ) : (
              <>
                <span>{t.auth.registerTitle}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid var(--border-glass)",
          textAlign: "center",
          fontSize: "14px",
          color: "var(--text-muted)"
        }}>
          {t.auth.haveAccount}{" "}
          <Link href="/auth/login" style={{ color: "var(--accent-purple)", fontWeight: "700", textDecoration: "none" }}>
            {t.common.login}
          </Link>
        </div>
      </div>
    </div>
  );
}
