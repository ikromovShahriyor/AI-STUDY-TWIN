"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { 
  Sparkles, 
  Bot, 
  Mic, 
  HelpCircle, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  BookOpen, 
  Code, 
  Calculator, 
  Globe, 
  Award,
  ChevronRight
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [demoInput, setDemoInput] = useState("");
  const [demoAnswer, setDemoAnswer] = useState<string | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoAsk = (samplePrompt?: string) => {
    const q = samplePrompt || demoInput;
    if (!q.trim()) return;
    setIsDemoLoading(true);
    setDemoAnswer(null);

    setTimeout(() => {
      if (q.toLowerCase().includes("oop") || q.toLowerCase().includes("dasturlash")) {
        setDemoAnswer("💡 OOP (Obyektga yo'naltirilgan dasturlash) dasturni real hayotdagi obyektlar kabi modellashtirishdir. Asosiy ustunlar: Enkapsulyatsiya (himoya), Merosxo'rlik (qayta foydalanish), Polimorfizm (ko'p shakllilik) va Abstraksiya (muhimini ajratish).");
      } else if (q.toLowerCase().includes("tenglama") || q.toLowerCase().includes("matematika")) {
        setDemoAnswer("📐 Matematik masalani yechishda avval berilgan parametrlar ajratiladi. Masalan, 2x + 10 = 30 bo'lsa: 2x = 20 => x = 10. AI Study Twin orqali har bir qadamni tekshirib borishingiz mumkin!");
      } else {
        setDemoAnswer(`✨ AI Study Twin tahlili: "${q}" bo'yicha tushuncha juda muhim. Siz uchun darslikdan eng zarur qoidalarni ajratib, 3 ta amaliy misol va mini-test tayyorlab bera olaman!`);
      }
      setIsDemoLoading(false);
    }, 900);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section style={{
        position: "relative",
        padding: "80px 0 60px",
        overflow: "hidden",
        background: "var(--gradient-glow)"
      }}>
        <div className="container-custom" style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "var(--radius-full)",
            background: "rgba(139, 92, 246, 0.12)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            color: "var(--accent-purple)",
            fontSize: "13px",
            fontWeight: "700",
            marginBottom: "24px",
            backdropFilter: "blur(10px)"
          }}>
            <Sparkles size={16} />
            <span>{t.landing.heroBadge}</span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: "800",
            lineHeight: 1.15,
            marginBottom: "20px",
            letterSpacing: "-1.5px"
          }}>
            {t.landing.heroTitle}{" "}
            <span className="gradient-text">{t.landing.heroHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            maxWidth: "720px",
            margin: "0 auto 36px",
            fontSize: "18px",
            lineHeight: 1.6,
            color: "var(--text-secondary)"
          }}>
            {t.landing.heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "50px" }}>
            <Link
              href={isAuthenticated ? "/dashboard" : "/auth/register"}
              className="btn-primary"
              style={{ padding: "14px 32px", fontSize: "16px" }}
            >
              <span>{t.landing.startFree}</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/tests"
              className="btn-secondary"
              style={{ padding: "14px 28px", fontSize: "16px" }}
            >
              <Zap size={18} color="var(--accent-amber)" />
              <span>Diagnostik Test topshirish</span>
            </Link>
          </div>

          {/* Live Interactive AI Demo Widget */}
          <div
            className="glass-panel"
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              padding: "24px",
              textAlign: "left",
              border: "1px solid var(--border-glass-glow)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  boxShadow: "0 0 10px #10b981"
                }} />
                <span style={{ fontSize: "14px", fontWeight: "700" }}>AI Study Twin — Jonli Repetitor Namunasi</span>
              </div>
              <span className="badge badge-purple">Gemini / GPT / Fallback AI</span>
            </div>

            {/* Demo Sample Queries */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
              <button
                onClick={() => {
                  setDemoInput("OOP nima va uning asosiy prinsiplari?");
                  handleDemoAsk("OOP nima va uning asosiy prinsiplari?");
                }}
                className="badge badge-cyan"
                style={{ cursor: "pointer", border: "1px solid rgba(6, 182, 212, 0.3)" }}
              >
                💻 OOP prinsiplari
              </button>
              <button
                onClick={() => {
                  setDemoInput("Kvadrat tenglamani yechish formulasi");
                  handleDemoAsk("Kvadrat tenglamani yechish formulasi");
                }}
                className="badge badge-amber"
                style={{ cursor: "pointer", border: "1px solid rgba(245, 158, 11, 0.3)" }}
              >
                📐 Kvadrat tenglama
              </button>
              <button
                onClick={() => {
                  setDemoInput("Present Perfect qachon ishlatiladi?");
                  handleDemoAsk("Present Perfect qachon ishlatiladi?");
                }}
                className="badge badge-emerald"
                style={{ cursor: "pointer", border: "1px solid rgba(16, 185, 129, 0.3)" }}
              >
                🇬🇧 English Tenses
              </button>
            </div>

            {/* Input Bar */}
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDemoAsk()}
                placeholder="Istalgan mavzu yoki savolni yozing..."
                className="input-field"
              />
              <button
                onClick={() => handleDemoAsk()}
                disabled={isDemoLoading}
                className="btn-primary"
                style={{ padding: "0 20px" }}
              >
                {isDemoLoading ? (
                  <Sparkles size={18} className="animate-spin" />
                ) : (
                  <Bot size={18} />
                )}
              </button>
            </div>

            {/* Response Area */}
            {demoAnswer && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-glass)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "var(--text-primary)"
                }}
              >
                {demoAnswer}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section style={{ borderTop: "1px solid var(--border-glass)", borderBottom: "1px solid var(--border-glass)", backgroundColor: "var(--bg-secondary)", padding: "28px 0" }}>
        <div className="container-custom">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
            textAlign: "center"
          }}>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-purple)" }}>10,000+</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>{t.landing.statsStudents}</div>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-cyan)" }}>250,000+</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>{t.landing.statsTests}</div>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-emerald)" }}>99.4%</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>{t.landing.statsSatisfaction}</div>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--accent-amber)" }}>24/7</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>AI Repetitor doim yoningizda</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: "80px 0" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "12px" }}>
              {t.landing.featuresTitle}
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-muted)" }}>
              {t.landing.featuresSubtitle}
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px"
          }}>
            {/* Feature 1 */}
            <div className="glass-panel" style={{ padding: "30px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "rgba(139, 92, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-purple)",
                marginBottom: "20px"
              }}>
                <Bot size={26} />
              </div>
              <h3 style={{ fontSize: "19px", fontWeight: "700", marginBottom: "10px" }}>{t.landing.feat1Title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{t.landing.feat1Desc}</p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel" style={{ padding: "30px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "rgba(6, 182, 212, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-cyan)",
                marginBottom: "20px"
              }}>
                <Mic size={26} />
              </div>
              <h3 style={{ fontSize: "19px", fontWeight: "700", marginBottom: "10px" }}>{t.landing.feat2Title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{t.landing.feat2Desc}</p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel" style={{ padding: "30px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "rgba(245, 158, 11, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-amber)",
                marginBottom: "20px"
              }}>
                <HelpCircle size={26} />
              </div>
              <h3 style={{ fontSize: "19px", fontWeight: "700", marginBottom: "10px" }}>{t.landing.feat3Title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{t.landing.feat3Desc}</p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel" style={{ padding: "30px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-emerald)",
                marginBottom: "20px"
              }}>
                <Flame size={26} />
              </div>
              <h3 style={{ fontSize: "19px", fontWeight: "700", marginBottom: "10px" }}>{t.landing.feat4Title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{t.landing.feat4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Showcase */}
      <section style={{ padding: "60px 0", backgroundColor: "var(--bg-secondary)" }}>
        <div className="container-custom">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "30px", fontWeight: "800", marginBottom: "10px" }}>
              Fanlar Bo'yicha Chuqurlashtirilgan O'rganish
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
              Har bir fan uchun saralangan testlar, mavzulashtirilgan topshiriqlar va AI repetitor
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px"
          }}>
            <div className="glass-panel glass-panel-interactive" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #3b82f6, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Calculator size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: "700", fontSize: "16px" }}>Matematika</h4>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Algebra & Geometriya</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Chiziqli va kvadrat tenglamalar, Viyet formulasi, hosilalar va mantiqiy masalalar.
              </p>
              <Link href="/tests" style={{ color: "var(--accent-cyan)", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                <span>Testlarni yechish</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="glass-panel glass-panel-interactive" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Code size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: "700", fontSize: "16px" }}>Dasturlash & IT</h4>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>C#, Python, Web & OOP</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Algoritmlar, ma'lumotlar tuzilmalari, Clean Architecture va asinxron dasturlash.
              </p>
              <Link href="/tests" style={{ color: "var(--accent-purple)", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                <span>Testlarni yechish</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="glass-panel glass-panel-interactive" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Globe size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: "700", fontSize: "16px" }}>Ingliz tili</h4>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Grammar & IELTS</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Zamonlar sistemasi, Conditionals va akademik lug'at boyligi mashg'ulotlari.
              </p>
              <Link href="/tests" style={{ color: "var(--accent-emerald)", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                <span>Testlarni yechish</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="glass-panel glass-panel-interactive" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Zap size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: "700", fontSize: "16px" }}>Fizika</h4>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Mexanika & Elektr</span>
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Nyuton qonunlari, energiyaning saqlanishi va Om qonuni amaliy tahlillari.
              </p>
              <Link href="/tests" style={{ color: "var(--accent-amber)", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
                <span>Testlarni yechish</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ padding: "70px 0", textAlign: "center" }}>
        <div className="container-custom">
          <div
            className="glass-panel"
            style={{
              padding: "50px 30px",
              background: "var(--gradient-card)",
              border: "1px solid var(--border-glass-glow)"
            }}
          >
            <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "16px" }}>
              {t.landing.ctaTitle}
            </h2>
            <p style={{ maxWidth: "600px", margin: "0 auto 30px", color: "var(--text-secondary)", fontSize: "16px" }}>
              {t.landing.ctaSubtitle}
            </p>
            <Link
              href="/auth/register"
              className="btn-primary"
              style={{ padding: "14px 36px", fontSize: "16px" }}
            >
              <span>Hoziroq Ro'yxatdan O'ting</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
