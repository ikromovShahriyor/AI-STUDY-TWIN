"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation, Language } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Flame, 
  User, 
  LogOut, 
  ChevronDown
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
  ];

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      backgroundColor: "var(--bg-glass)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-glass)",
      width: "100%"
    }}>
      <div
        className="container-custom"
        style={{
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          width: "100%"
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
            whiteSpace: "nowrap"
          }}
        >
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "var(--gradient-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)",
            color: "#ffffff",
            flexShrink: 0
          }}>
            <Sparkles size={20} />
          </div>
          <div style={{ whiteSpace: "nowrap" }}>
            <div style={{ fontWeight: "800", fontSize: "17px", letterSpacing: "-0.5px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
              AI STUDY <span className="gradient-text">TWIN</span>
            </div>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Personal AI Tutor
            </div>
          </div>
        </Link>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Language Selector */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="btn-icon"
              style={{ width: "auto", padding: "0 10px", gap: "4px", fontSize: "12px", fontWeight: "600", height: "36px" }}
              aria-label="Select Language"
            >
              <span>{languages.find(l => l.code === language)?.flag}</span>
              <span style={{ textTransform: "uppercase" }}>{language}</span>
              <ChevronDown size={13} />
            </button>

            {langMenuOpen && (
              <div 
                className="glass-panel"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "44px",
                  width: "150px",
                  padding: "6px",
                  zIndex: 60,
                  borderRadius: "var(--radius-md)"
                }}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: language === l.code ? "rgba(139, 92, 246, 0.15)" : "transparent",
                      color: language === l.code ? "var(--accent-purple)" : "var(--text-primary)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: language === l.code ? "700" : "500",
                      textAlign: "left"
                    }}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            style={{ width: "36px", height: "36px" }}
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Auth State */}
          {isAuthenticated && profile ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-glass)",
                  padding: "4px 10px 4px 4px",
                  borderRadius: "var(--radius-full)",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  height: "36px"
                }}
              >
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--gradient-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "13px"
                }}>
                  {profile.fullName ? profile.fullName[0].toUpperCase() : "U"}
                </div>
                <div style={{ textAlign: "left", display: "none" }} className="md:block">
                  <div style={{ fontSize: "12px", fontWeight: "700", lineHeight: 1.2 }}>
                    {profile.fullName.split(" ")[0]}
                  </div>
                </div>
                {/* Streak Badge */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#f59e0b",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "11px",
                  fontWeight: "700"
                }}>
                  <Flame size={12} fill="#f59e0b" />
                  <span>{profile.currentStreak}</span>
                </div>
              </button>

              {userMenuOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "48px",
                    width: "190px",
                    padding: "8px",
                    zIndex: 60,
                    borderRadius: "var(--radius-md)"
                  }}
                >
                  <div style={{ padding: "6px 10px", borderBottom: "1px solid var(--border-glass)", marginBottom: "4px" }}>
                    <div style={{ fontWeight: "700", fontSize: "13px" }}>{profile.fullName}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{profile.email}</div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 10px",
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      fontSize: "13px",
                      borderRadius: "var(--radius-sm)"
                    }}
                  >
                    <Sparkles size={15} color="var(--accent-purple)" />
                    <span>{t.nav.dashboard}</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 10px",
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      fontSize: "13px",
                      borderRadius: "var(--radius-sm)"
                    }}
                  >
                    <User size={15} />
                    <span>{t.nav.profile}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 10px",
                      color: "var(--accent-rose)",
                      background: "transparent",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: "13px",
                      textAlign: "left"
                    }}
                  >
                    <LogOut size={15} />
                    <span>{t.common.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Link href="/auth/login" className="btn-secondary" style={{ padding: "6px 12px", fontSize: "13px", height: "36px" }}>
                {t.common.login}
              </Link>
              <Link href="/auth/register" className="btn-primary" style={{ padding: "6px 14px", fontSize: "13px", height: "36px" }}>
                {t.common.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
