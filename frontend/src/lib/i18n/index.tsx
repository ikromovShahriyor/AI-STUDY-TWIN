"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { uz } from "./uz";
import { en } from "./en";
import { ru } from "./ru";

export type Language = "uz" | "en" | "ru";

const translations = { uz, en, ru };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof uz;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "uz",
  setLanguage: () => {},
  t: uz,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("ai_study_twin_lang") as Language;
    if (saved && ["uz", "en", "ru"].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("ai_study_twin_lang", lang);
  };

  const t = translations[language] || uz;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
