import React from "react";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";
import { AppWrapper } from "@/components/layout/AppWrapper";

export const metadata: Metadata = {
  title: "AI STUDY TWIN - Shaxsiy AI O'qituvchi Platformasi",
  description: "Har bir o'quvchi uchun shaxsiy AI o'qituvchi. Bilim darajasini aniqlash, o'quv reja, AI repetitor, testlar va xatolar tahlili.",
  keywords: ["AI Study Twin", "AI O'qituvchi", "AI Repetitor", "Ta'lim", "Testlar", "O'quv Reja"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" data-theme="dark">
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppWrapper>
                {children}
              </AppWrapper>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
