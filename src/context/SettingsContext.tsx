import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppTheme, FontScale, Language } from '../types/game';
import { translate, TranslationKey } from '../i18n/translations';

export type SettingsScope = 'host' | 'player' | 'app';

export interface SettingsContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isDarkMode: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  scope: SettingsScope;
}

export interface SettingsProviderProps {
  children: React.ReactNode;
  defaultLang?: Language;
  scope?: SettingsScope;
  applyToDocument?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const FONT_SIZE_MAP: Record<FontScale, string> = {
  small: '14px',
  normal: '16px',
  large: '19px',
  huge: '22px',
};

const ZOOM_MAP: Record<FontScale, string> = {
  small: '0.875',
  normal: '1',
  large: '1.1875',
  huge: '1.375',
};

const LEGACY_STORAGE_KEYS = {
  lang: 'mom70_lang',
  fontScale: 'mom70_font_scale',
  muted: 'mom70_muted',
  theme: 'mom70_theme',
} as const;

function getScopedKey(scope: SettingsScope, key: 'lang' | 'fontScale' | 'muted' | 'theme'): string {
  const suffix = key === 'fontScale' ? 'font_scale' : key;
  return `mom70_${scope}_${suffix}`;
}

function readStoredLang(scope: SettingsScope, fallback: Language): Language {
  try {
    const scopedVal = window.localStorage.getItem(getScopedKey(scope, 'lang'));
    if (scopedVal === 'he' || scopedVal === 'ru' || scopedVal === 'en') {
      return scopedVal;
    }
    const legacyVal = window.localStorage.getItem(LEGACY_STORAGE_KEYS.lang);
    if (legacyVal === 'he' || legacyVal === 'ru' || legacyVal === 'en') {
      return legacyVal;
    }
  } catch {
    // Ignore storage errors in private/restricted browsers
  }
  return fallback;
}

function readStoredFontScale(scope: SettingsScope, fallback: FontScale): FontScale {
  try {
    const scopedVal = window.localStorage.getItem(getScopedKey(scope, 'fontScale'));
    if (scopedVal === 'small' || scopedVal === 'normal' || scopedVal === 'large' || scopedVal === 'huge') {
      return scopedVal;
    }
    const legacyVal = window.localStorage.getItem(LEGACY_STORAGE_KEYS.fontScale);
    if (legacyVal === 'small' || legacyVal === 'normal' || legacyVal === 'large' || legacyVal === 'huge') {
      return legacyVal;
    }
  } catch {
    // Ignore storage errors
  }
  return fallback;
}

function readStoredTheme(scope: SettingsScope, fallback: AppTheme): AppTheme {
  try {
    const scopedVal = window.localStorage.getItem(getScopedKey(scope, 'theme')) as AppTheme | null;
    if (scopedVal === 'light' || scopedVal === 'dark' || scopedVal === 'auto') {
      return scopedVal;
    }
    const legacyVal = window.localStorage.getItem(LEGACY_STORAGE_KEYS.theme) as AppTheme | null;
    if (legacyVal === 'light' || legacyVal === 'dark' || legacyVal === 'auto') {
      return legacyVal;
    }
  } catch {
    // Ignore storage errors
  }
  return fallback;
}

function readStoredMuted(scope: SettingsScope, fallback: boolean): boolean {
  try {
    const scopedVal = window.localStorage.getItem(getScopedKey(scope, 'muted'));
    if (scopedVal === 'true') return true;
    if (scopedVal === 'false') return false;
    const legacyVal = window.localStorage.getItem(LEGACY_STORAGE_KEYS.muted);
    if (legacyVal === 'true') return true;
    if (legacyVal === 'false') return false;
  } catch {
    // Ignore storage errors
  }
  return fallback;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  defaultLang = 'he',
  scope = 'app',
  applyToDocument = true,
  className = '',
  style,
}) => {
  const [lang, setLangState] = useState<Language>(() => readStoredLang(scope, defaultLang));
  const [fontScale, setFontScaleState] = useState<FontScale>(() => readStoredFontScale(scope, 'normal'));
  const [theme, setThemeState] = useState<AppTheme>(() => readStoredTheme(scope, 'light'));
  const [isMuted, setIsMutedState] = useState<boolean>(() => readStoredMuted(scope, false));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isDarkMode = theme === 'dark' || (theme === 'auto' && systemPrefersDark);

  // Sync state if scope or defaultLang changes dynamically
  useEffect(() => {
    setLangState(readStoredLang(scope, defaultLang));
    setFontScaleState(readStoredFontScale(scope, 'normal'));
    setThemeState(readStoredTheme(scope, 'light'));
    setIsMutedState(readStoredMuted(scope, false));
  }, [scope, defaultLang]);

  const dir: 'rtl' | 'ltr' = lang === 'he' ? 'rtl' : 'ltr';

  const setLang = useCallback(
    (nextLang: Language) => {
      setLangState(nextLang);
      try {
        window.localStorage.setItem(getScopedKey(scope, 'lang'), nextLang);
        if (scope === 'app') {
          window.localStorage.setItem(LEGACY_STORAGE_KEYS.lang, nextLang);
        }
      } catch {
        // Ignore storage errors
      }
    },
    [scope]
  );

  const setFontScale = useCallback(
    (nextScale: FontScale) => {
      setFontScaleState(nextScale);
      try {
        window.localStorage.setItem(getScopedKey(scope, 'fontScale'), nextScale);
        if (scope === 'app') {
          window.localStorage.setItem(LEGACY_STORAGE_KEYS.fontScale, nextScale);
        }
      } catch {
        // Ignore storage errors
      }
    },
    [scope]
  );

  const setTheme = useCallback(
    (nextTheme: AppTheme) => {
      setThemeState(nextTheme);
      try {
        window.localStorage.setItem(getScopedKey(scope, 'theme'), nextTheme);
        if (scope === 'app') {
          window.localStorage.setItem(LEGACY_STORAGE_KEYS.theme, nextTheme);
        }
      } catch {
        // Ignore storage errors
      }
    },
    [scope]
  );

  const setIsMuted = useCallback(
    (muted: boolean) => {
      setIsMutedState(muted);
      try {
        window.localStorage.setItem(getScopedKey(scope, 'muted'), String(muted));
        if (scope === 'app') {
          window.localStorage.setItem(LEGACY_STORAGE_KEYS.muted, String(muted));
        }
      } catch {
        // Ignore storage errors
      }
    },
    [scope]
  );

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const initialDocRef = useRef<{ dir: string; lang: string; fontSize: string } | null>(null);

  useEffect(() => {
    if (!applyToDocument || typeof document === 'undefined') return;

    if (!initialDocRef.current) {
      initialDocRef.current = {
        dir: document.documentElement.dir,
        lang: document.documentElement.lang,
        fontSize: document.documentElement.style.fontSize,
      };
    }

    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.documentElement.style.fontSize = FONT_SIZE_MAP[fontScale];
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [applyToDocument, dir, lang, fontScale, isDarkMode]);

  useEffect(() => {
    return () => {
      if (applyToDocument && initialDocRef.current && typeof document !== 'undefined') {
        document.documentElement.dir = initialDocRef.current.dir;
        document.documentElement.lang = initialDocRef.current.lang;
        document.documentElement.style.fontSize = initialDocRef.current.fontSize;
      }
    };
  }, [applyToDocument]);

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
      theme,
      setTheme,
      isDarkMode,
      isMuted,
      setIsMuted,
      isSettingsOpen,
      setIsSettingsOpen,
      openSettings,
      closeSettings,
      t,
      scope,
    }),
    [
      lang,
      setLang,
      dir,
      fontScale,
      setFontScale,
      theme,
      setTheme,
      isDarkMode,
      isMuted,
      setIsMuted,
      isSettingsOpen,
      setIsSettingsOpen,
      openSettings,
      closeSettings,
      t,
      scope,
    ]
  );

  if (!applyToDocument) {
    return (
      <SettingsContext.Provider value={value}>
        <div
          dir={dir}
          lang={lang}
          className={`settings-scope-container settings-scope-${scope} ${isDarkMode ? 'dark' : ''} w-full ${className}`.trim()}
          style={{
            zoom: ZOOM_MAP[fontScale],
            fontSize: FONT_SIZE_MAP[fontScale],
            ...style,
          }}
        >
          {children}
        </div>
      </SettingsContext.Provider>
    );
  }

  return (
    <SettingsContext.Provider value={value}>
      {className ? (
        <div className={className} style={style}>
          {children}
        </div>
      ) : (
        children
      )}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
