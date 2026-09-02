"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const isAuthPage = pathname.startsWith("/auth");
  const isLanding = pathname === "/";
  const showSidebar = isAuthenticated && !isAuthPage && !isLanding;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 70px)" }}>
        {showSidebar && <Sidebar />}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            marginLeft: showSidebar ? "260px" : 0,
            paddingBottom: showSidebar ? "80px" : 0,
            transition: "margin-left 0.25s ease"
          }}
          className={showSidebar ? "app-main-with-sidebar" : ""}
        >
          {children}
        </main>
      </div>
      {showSidebar && <MobileBottomNav />}
    </div>
  );
};
