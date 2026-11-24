import React from 'react';
import {
  Check,
  Globe,
  Laptop,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { AppTheme, FontScale, Language } from '../../types/game';
import { soundEffects } from '../../services/contentService';

const FONT_OPTIONS: Array<{ scale: FontScale; labelKey: 'fontSmallLabel' | 'fontNormalLabel' | 'fontLargeLabel' | 'fontHugeLabel'; sizeText: string }> = [
  { scale: 'small', labelKey: 'fontSmallLabel', sizeText: '14px' },
  { scale: 'normal', labelKey: 'fontNormalLabel', sizeText: '16px' },
  { scale: 'large', labelKey: 'fontLargeLabel', sizeText: '19px' },
  { scale: 'huge', labelKey: 'fontHugeLabel', sizeText: '22px' },
];

const THEME_OPTIONS: Array<{ key: AppTheme; icon: React.FC<{ className?: string }>; labelKey: 'themeLight' | 'themeDark' | 'themeAuto' }> = [
  { key: 'light', icon: Sun, labelKey: 'themeLight' },
  { key: 'dark', icon: Moon, labelKey: 'themeDark' },
  { key: 'auto', icon: Laptop, labelKey: 'themeAuto' },
];

const LANGUAGES: Array<{ code: Language; flag: string; labelKey: 'langHe' | 'langRu' | 'langEn' }> = [
  { code: 'he', flag: '🇮🇱', labelKey: 'langHe' },
  { code: 'ru', flag: '🇷🇺', labelKey: 'langRu' },
  { code: 'en', flag: '🇬🇧', labelKey: 'langEn' },
];

export const SettingsModal: React.FC = () => {
  const {
    lang,
    setLang,
    dir,
    fontScale,
    setFontScale,
    theme,
    setTheme,
    isMuted,
    setIsMuted,
    isSettingsOpen,
    closeSettings,
    t,
  } = useSettings();

  if (!isSettingsOpen) return null;

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={closeSettings}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-slate-700 shadow-2xl p-5 sm:p-7 space-y-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md">
              <SettingsIcon className="w-5 h-5 animate-spin-slow" aria-hidden="true" />
            </div>
            <div>
              <h2 id="settings-dialog-title" className="text-xl sm:text-2xl font-black text-rose-900 dark:text-rose-300">
                {t('settingsTitle')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSettings}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-rose-600 dark:text-slate-400 flex items-center justify-center transition-colors"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Theme Option: Day / Night */}
        <section className="space-y-2.5">
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200">
            {t('themeLabel')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ key, icon: Icon, labelKey }) => {
              const active = theme === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    soundEffects.playTick(isMuted);
                    setTheme(key);
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all touch-manipulation ${
                    active
                      ? 'bg-gradient-to-br from-rose-500 to-amber-500 text-white border-rose-500 shadow-md scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-center">{t(labelKey)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Font Size Option */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-black text-slate-800 dark:text-slate-200">
              {t('fontSizeLabel')}
            </label>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {t(
                fontScale === 'small'
                  ? 'fontSmallLabel'
                  : fontScale === 'normal'
                  ? 'fontNormalLabel'
                  : fontScale === 'large'
                  ? 'fontLargeLabel'
                  : 'fontHugeLabel'
              )}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {FONT_OPTIONS.map(({ scale, labelKey, sizeText }) => {
              const active = fontScale === scale;
              return (
                <button
                  key={scale}
                  type="button"
                  onClick={() => {
                    soundEffects.playTick(isMuted);
                    setFontScale(scale);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 font-black transition-all touch-manipulation ${
                    active
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-base sm:text-lg">
                    {scale === 'small' ? 'א-' : scale === 'normal' ? 'א' : scale === 'large' ? 'א+' : 'א++'}
                  </span>
                  <span className="text-[11px] font-bold mt-0.5">{t(labelKey)}</span>
                  <span className="text-[9px] opacity-70 font-mono">{sizeText}</span>
                </button>
              );
            })}
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 transition-all text-center">
            <p className="font-extrabold text-amber-950 dark:text-amber-200 leading-snug">
              {t('fontPreview')}
            </p>
          </div>
        </section>

        {/* 3. Language Selector */}
        <section className="space-y-2.5">
          <label className="block text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-rose-500" />
            <span>{t('languageLabel')}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(({ code, flag, labelKey }) => {
              const active = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    soundEffects.playTick(isMuted);
                    setLang(code);
                  }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all touch-manipulation ${
                    active
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{flag}</span>
                  <span>{t(labelKey)}</span>
                  {active && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Sound Mute Toggle */}
        <section className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-slate-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-500" />
            )}
            <div>
              <p className="text-sm font-black">{t('soundLabel')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {isMuted ? t('soundOff') : t('soundOn')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (!nextMuted) soundEffects.playFlip(false);
            }}
            className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all touch-manipulation ${
              isMuted
                ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                : 'bg-emerald-500 text-white shadow-md'
            }`}
          >
            {isMuted ? t('unmuteSound') : t('muteSound')}
          </button>
        </section>

        {/* Footer / Close */}
        <button
          type="button"
          onClick={closeSettings}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-base shadow-lg transition-all active:scale-[0.98]"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};
