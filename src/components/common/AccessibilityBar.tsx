import React from 'react';
import { Globe, Moon, Settings as SettingsIcon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { FontScale, Language } from '../../types/game';
import { soundEffects } from '../../services/contentService';
import { APP_VERSION } from '../../constants/version';
import { SettingsModal } from './SettingsModal';

interface AccessibilityBarProps {
  compact?: boolean;
  className?: string;
}

const LANGUAGES: Array<{ code: Language; labelKey: 'langHe' | 'langRu' | 'langEn' }> = [
  { code: 'he', labelKey: 'langHe' },
  { code: 'ru', labelKey: 'langRu' },
  { code: 'en', labelKey: 'langEn' },
];

const FONT_SCALES: Array<{ scale: FontScale; labelKey: 'fontSmall' | 'fontNormal' | 'fontLarge' | 'fontHuge' }> = [
  { scale: 'small', labelKey: 'fontSmall' },
  { scale: 'normal', labelKey: 'fontNormal' },
  { scale: 'large', labelKey: 'fontLarge' },
  { scale: 'huge', labelKey: 'fontHuge' },
];

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  compact = false,
  className = '',
}) => {
  const {
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
    openSettings,
    t,
  } = useSettings();

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEffects.playFlip(false);
    }
  };

  const handleToggleTheme = () => {
    soundEffects.playTick(isMuted);
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <>
      <div
        dir={dir}
        className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-rose-200/90 dark:border-slate-700 shadow-sm ${
          compact ? 'px-2 py-1.5' : 'px-3.5 py-2'
        } ${className}`}
      >
        {/* Language Selector & Version Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            dir="ltr"
            data-testid="app-version"
            title={`${t('versionLabel')} ${APP_VERSION}`}
            aria-label={`${t('versionLabel')} ${APP_VERSION}`}
            className={`inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-extrabold text-slate-600 dark:text-slate-300 select-all ${
              compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
            }`}
          >
            v{APP_VERSION}
          </span>

          <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label={t('languageLabel')}>
            <Globe className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
            <div className="inline-flex rounded-xl bg-rose-50/90 dark:bg-slate-800 p-0.5 border border-rose-100 dark:border-slate-700">
              {LANGUAGES.map(({ code, labelKey }) => {
                const active = lang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={active}
                    className={`rounded-lg font-bold transition-all touch-manipulation ${
                      compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm'
                    } ${
                      active
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t(labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls: Font Size, Day/Night, Sound, and Settings Screen Icon */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Font Scaling Buttons */}
          <div
            className="inline-flex items-center rounded-xl bg-amber-50/90 dark:bg-slate-800 p-0.5 border border-amber-200/80 dark:border-slate-700"
            role="group"
            aria-label={t('fontSizeLabel')}
            title={t('fontSizeLabel')}
          >
            {FONT_SCALES.map(({ scale, labelKey }) => {
              const active = fontScale === scale;
              return (
                <button
                  key={scale}
                  type="button"
                  onClick={() => setFontScale(scale)}
                  aria-pressed={active}
                  className={`rounded-lg font-extrabold transition-all touch-manipulation ${
                    compact ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm'
                  } ${
                    active
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-amber-900 dark:text-amber-300 hover:bg-white/80 dark:hover:bg-slate-700'
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>

          {/* Quick Day / Night Mode Toggle */}
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={t('themeLabel')}
            title={`${t('themeLabel')}: ${isDarkMode ? t('themeDark') : t('themeLight')}`}
            className={`inline-flex items-center justify-center rounded-xl font-bold border transition-all touch-manipulation ${
              compact ? 'w-8 h-8' : 'w-9 h-9'
            } ${
              isDarkMode
                ? 'bg-indigo-950 border-indigo-700 text-amber-300 hover:bg-indigo-900 shadow-sm'
                : 'bg-amber-100/80 border-amber-300 text-amber-800 hover:bg-amber-200'
            }`}
          >
            {isDarkMode ? (
              <Moon className="w-4 h-4 text-amber-300" aria-hidden="true" />
            ) : (
              <Sun className="w-4 h-4 text-amber-600" aria-hidden="true" />
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            aria-pressed={isMuted}
            aria-label={isMuted ? t('unmuteSound') : t('muteSound')}
            title={isMuted ? t('unmuteSound') : t('muteSound')}
            className={`inline-flex items-center gap-1.5 rounded-xl font-bold border transition-all touch-manipulation ${
              compact ? 'px-2 py-1.5 text-xs' : 'px-2.5 py-1.5 text-xs sm:text-sm'
            } ${
              isMuted
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/70'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            {!compact && (
              <span className="hidden md:inline">
                {isMuted ? t('soundOff') : t('soundOn')}
              </span>
            )}
          </button>

          {/* Settings Screen Icon Button */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playTick(isMuted);
              openSettings();
            }}
            aria-label={t('settingsTitle')}
            title={t('settingsTitle')}
            className={`inline-flex items-center gap-1.5 rounded-xl font-black border transition-all touch-manipulation bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-sm active:scale-95 ${
              compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{t('settingsBtn')}</span>
          </button>
        </div>
      </div>

      {/* Full Settings Modal */}
      <SettingsModal />
    </>
  );
};
