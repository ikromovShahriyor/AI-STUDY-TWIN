"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  HelpCircle,
  CalendarCheck,
  Trophy,
  User,
  Zap,
  Flame
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { profile } = useAuth();

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/ai-twin", label: t.nav.aiTwin, icon: Bot, badge: "AI" },
    { href: "/chat", label: t.nav.chat, icon: MessageSquare, badge: "Voice" },
    { href: "/tests", label: t.nav.tests, icon: HelpCircle },
    { href: "/study-plan", label: t.nav.studyPlan, icon: CalendarCheck },
    { href: "/gamification", label: t.nav.gamification, icon: Trophy },
    { href: "/profile", label: t.nav.profile, icon: User },
  ];

  return (
    <aside
      style={{
        position: "fixed",
        top: "70px",
        left: 0,
        bottom: 0,
        width: "260px",
        backgroundColor: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-glass)",
        display: "none",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 16px",
        zIndex: 40,
      }}
      className="lg:flex"
    >
      {/* Navigation List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ padding: "0 12px 8px", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Platforma
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                background: isActive ? "var(--gradient-brand)" : "transparent",
                boxShadow: isActive ? "0 4px 16px rgba(139, 92, 246, 0.35)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Icon size={19} color={isActive ? "#ffffff" : "var(--accent-purple)"} />
                <span>{item.label}</span>
              </div>
              {item.badge && !isActive && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: item.badge === "Voice" ? "rgba(6, 182, 212, 0.2)" : "rgba(139, 92, 246, 0.2)",
                    color: item.badge === "Voice" ? "var(--accent-cyan)" : "var(--accent-purple)",
                    textTransform: "uppercase",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Profile & XP Status Widget */}
      {profile && (
        <div
          className="glass-panel"
          style={{
            padding: "14px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-glass)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap size={16} color="var(--accent-amber)" fill="var(--accent-amber)" />
              <span style={{ fontSize: "13px", fontWeight: "700" }}>Daraja {profile.level}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent-amber)", fontSize: "12px", fontWeight: "700" }}>
              <Flame size={14} fill="#f59e0b" />
              <span>{profile.currentStreak} kun</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(10, ((profile.totalXp - profile.currentLevelBaseXp) / (profile.nextLevelXp - profile.currentLevelBaseXp || 1)) * 100))}%`,
                height: "100%",
                background: "var(--gradient-brand)",
                borderRadius: "3px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
            <span>{profile.totalXp} XP</span>
            <span>{profile.nextLevelXp} XP</span>
          </div>
        </div>
      )}
    </aside>
  );
};
