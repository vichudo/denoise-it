'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { LanguageCode } from '@/lib/constants';

const STORAGE_KEY = 'denoise-output-lang';

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === 'undefined') return 'en';
    return (localStorage.getItem(STORAGE_KEY) ?? 'en') as LanguageCode;
  });

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useOutputLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useOutputLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
