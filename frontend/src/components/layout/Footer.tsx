"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Sparkles, Heart, Shield, Cpu } from "lucide-react";

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer style={{
      borderTop: "1px solid var(--border-glass)",
      backgroundColor: "var(--bg-secondary)",
      padding: "40px 0 30px",
      marginTop: "auto"
    }}>
      <div className="container-custom">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "30px",
          marginBottom: "30px"
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "var(--gradient-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff"
              }}>
                <Sparkles size={18} />
              </div>
              <span style={{ fontWeight: "800", fontSize: "17px", color: "var(--text-primary)" }}>
                AI STUDY <span className="gradient-text">TWIN</span>
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {t.common.tagline}. Zamonaviy sun'iy intellekt repetitori har bir o'quvchi uchun 24/7 xizmatda.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>Asosiy</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <Link href="/dashboard" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Dashboard</Link>
              <Link href="/ai-twin" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>AI Knowledge Twin</Link>
              <Link href="/chat" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>AI Ovozli Repetitor</Link>
              <Link href="/tests" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Testlar va Sinovlar</Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>Texnologiyalar</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Cpu size={14} color="var(--accent-purple)" /> ASP.NET Core .NET 10 & PostgreSQL</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Sparkles size={14} color="var(--accent-cyan)" /> Next.js 15 & Multi-LLM Engine</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Shield size={14} color="var(--accent-emerald)" /> JWT & Strict Role Security</span>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid var(--border-glass)",
          paddingTop: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          fontSize: "12px",
          color: "var(--text-muted)"
        }}>
          <div>
            © {new Date().getFullYear()} AI STUDY TWIN. Barcha huquqlar himoyalangan.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            Made with <Heart size={14} color="var(--accent-rose)" fill="var(--accent-rose)" /> for next-gen students
          </div>
        </div>
      </div>
    </footer>
  );
};
