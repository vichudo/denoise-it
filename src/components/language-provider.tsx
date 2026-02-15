"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { LanguageCode } from "@/lib/constants";
import type { TranslationKey } from "@/i18n";
import { getDictionary, UI_LOCALES } from "@/i18n";

const STORAGE_KEY = "denoise-output-lang";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (
    key: TranslationKey | (string & Record<never, never>),
    vars?: Record<string, string | number>,
  ) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setLanguageState(stored as LanguageCode);
  }, []);

  // Sync <html lang> attribute
  useEffect(() => {
    document.documentElement.lang = UI_LOCALES.has(language) ? language : "en";
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const dict = useMemo(() => getDictionary(language), [language]);

  const t = useCallback(
    (
      key: TranslationKey | (string & Record<never, never>),
      vars?: Record<string, string | number>,
    ) => {
      let str = (dict as Record<string, string>)[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [dict],
  );

  return (
    <LanguageContext value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return ctx;
}

/** @deprecated Use useTranslation() instead */
export function useOutputLanguage() {
  return useTranslation();
}
