import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FontScale, Language } from '../types/game';
import { translate, TranslationKey } from '../i18n/translations';

export interface SettingsContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const FONT_SIZE_MAP: Record<FontScale, string> = {
  normal: '16px',
  large: '19px',
  huge: '22px',
};

const STORAGE_KEYS = {
  lang: 'mom70_lang',
  fontScale: 'mom70_font_scale',
  muted: 'mom70_muted',
} as const;

function readStoredLang(fallback: Language): Language {
  try {
    const val = window.localStorage.getItem(STORAGE_KEYS.lang);
    if (val === 'he' || val === 'ru' || val === 'en') {
      return val;
    }
  } catch {
    // Ignore storage errors in private/restricted browsers
  }
  return fallback;
}

function readStoredFontScale(fallback: FontScale): FontScale {
  try {
    const val = window.localStorage.getItem(STORAGE_KEYS.fontScale);
    if (val === 'normal' || val === 'large' || val === 'huge') {
      return val;
    }
  } catch {
    // Ignore storage errors
  }
  return fallback;
}

function readStoredMuted(fallback: boolean): boolean {
  try {
    const val = window.localStorage.getItem(STORAGE_KEYS.muted);
    if (val === 'true') return true;
    if (val === 'false') return false;
  } catch {
    // Ignore storage errors
  }
  return fallback;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{
  children: React.ReactNode;
  defaultLang?: Language;
}> = ({ children, defaultLang = 'he' }) => {
  const [lang, setLangState] = useState<Language>(() => readStoredLang(defaultLang));
  const [fontScale, setFontScaleState] = useState<FontScale>(() => readStoredFontScale('normal'));
  const [isMuted, setIsMutedState] = useState<boolean>(() => readStoredMuted(false));

  const dir: 'rtl' | 'ltr' = lang === 'he' ? 'rtl' : 'ltr';

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    try {
      window.localStorage.setItem(STORAGE_KEYS.lang, nextLang);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setFontScale = useCallback((nextScale: FontScale) => {
    setFontScaleState(nextScale);
    try {
      window.localStorage.setItem(STORAGE_KEYS.fontScale, nextScale);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setIsMuted = useCallback((muted: boolean) => {
    setIsMutedState(muted);
    try {
      window.localStorage.setItem(STORAGE_KEYS.muted, String(muted));
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
      document.documentElement.style.fontSize = FONT_SIZE_MAP[fontScale];
    }
  }, [dir, lang, fontScale]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang]
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      lang,
      setLang,
      dir,
      fontScale,
      setFontScale,
      isMuted,
      setIsMuted,
      t,
    }),
    [lang, setLang, dir, fontScale, setFontScale, isMuted, setIsMuted, t]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
