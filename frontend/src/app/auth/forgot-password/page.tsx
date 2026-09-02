"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { Sparkles, Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi.");
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
            Parolni Tiklash
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Emailingizni kiriting, biz sizga tiklash ko'rsatmalarini yuboramiz
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "var(--accent-emerald)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px"
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Ko'rsatma yuborildi!</h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.5 }}>
              Agar ushbu email bilan ro'yxatdan o'tilgan bo'lsa, parolni tiklash kodi pochta orqali yuborildi.
            </p>
            <Link href="/auth/login" className="btn-primary" style={{ width: "100%" }}>
              Kirish sahifasiga qaytish
            </Link>
          </div>
        ) : (
          <>
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

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ width: "100%", padding: "14px" }}
              >
                {isLoading ? <span>{t.common.loading}</span> : <span>Tiklash kodini yuborish</span>}
              </button>
            </form>

            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "14px", textDecoration: "none" }}>
                <ArrowLeft size={16} />
                <span>Kirish sahifasiga qaytish</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
