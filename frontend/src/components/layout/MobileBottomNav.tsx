"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  HelpCircle,
  CalendarCheck,
  User,
  Mic
} from "lucide-react";

export const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const isChat = pathname === "/chat";

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "68px",
        backgroundColor: "var(--bg-glass)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border-glass)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 8px",
        zIndex: 50,
      }}
      className="lg:hidden"
    >
      {/* Dashboard */}
      <Link
        href="/dashboard"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: pathname === "/dashboard" ? "var(--accent-purple)" : "var(--text-muted)",
          textDecoration: "none",
          fontSize: "11px",
          fontWeight: pathname === "/dashboard" ? "700" : "500",
        }}
      >
        <LayoutDashboard size={20} />
        <span>Asosiy</span>
      </Link>

      {/* AI Twin */}
      <Link
        href="/ai-twin"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: pathname === "/ai-twin" ? "var(--accent-purple)" : "var(--text-muted)",
          textDecoration: "none",
          fontSize: "11px",
          fontWeight: pathname === "/ai-twin" ? "700" : "500",
        }}
      >
        <Bot size={20} />
        <span>AI Twin</span>
      </Link>

      {/* Center Floating AI Chat & Voice Mic Button */}
      <Link
        href="/chat"
        style={{
          position: "relative",
          top: "-14px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--gradient-brand)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          boxShadow: isChat ? "0 0 25px rgba(139, 92, 246, 0.8)" : "0 8px 20px rgba(139, 92, 246, 0.4)",
          textDecoration: "none",
          transition: "transform 0.2s ease",
        }}
        className={isChat ? "mic-recording-pulse" : ""}
      >
        <Mic size={26} />
      </Link>

      {/* Tests */}
      <Link
        href="/tests"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: pathname.startsWith("/tests") ? "var(--accent-purple)" : "var(--text-muted)",
          textDecoration: "none",
          fontSize: "11px",
          fontWeight: pathname.startsWith("/tests") ? "700" : "500",
        }}
      >
        <HelpCircle size={20} />
        <span>Testlar</span>
      </Link>

      {/* Study Plan */}
      <Link
        href="/study-plan"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: pathname === "/study-plan" ? "var(--accent-purple)" : "var(--text-muted)",
          textDecoration: "none",
          fontSize: "11px",
          fontWeight: pathname === "/study-plan" ? "700" : "500",
        }}
      >
        <CalendarCheck size={20} />
        <span>Reja</span>
      </Link>
    </nav>
  );
};
