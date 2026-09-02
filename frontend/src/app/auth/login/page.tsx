"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, Mail, Lock, LogIn, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("student@aistudytwin.uz");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Email yoki parol noto'g'ri.");
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
          maxWidth: "440px",
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
            {t.auth.loginTitle}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            {t.auth.loginSubtitle}
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
              {t.auth.email}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                {t.auth.password}
              </label>
              <Link href="/auth/forgot-password" style={{ fontSize: "12px", color: "var(--accent-purple)", textDecoration: "none", fontWeight: "600" }}>
                {t.auth.forgotPassword}
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", marginTop: "6px" }}
          >
            {isLoading ? (
              <span>{t.common.loading}</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>{t.common.login}</span>
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
          {t.auth.noAccount}{" "}
          <Link href="/auth/register" style={{ color: "var(--accent-purple)", fontWeight: "700", textDecoration: "none" }}>
            {t.common.register}
          </Link>
        </div>
      </div>
    </div>
  );
}
