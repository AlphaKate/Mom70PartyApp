import React from 'react';
import { Globe, Volume2, VolumeX } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { FontScale, Language } from '../../types/game';
import { soundEffects } from '../../services/contentService';

interface AccessibilityBarProps {
  compact?: boolean;
  className?: string;
}

const LANGUAGES: Array<{ code: Language; labelKey: 'langHe' | 'langRu' | 'langEn' }> = [
  { code: 'he', labelKey: 'langHe' },
  { code: 'ru', labelKey: 'langRu' },
  { code: 'en', labelKey: 'langEn' },
];

const FONT_SCALES: Array<{ scale: FontScale; labelKey: 'fontNormal' | 'fontLarge' | 'fontHuge' }> = [
  { scale: 'normal', labelKey: 'fontNormal' },
  { scale: 'large', labelKey: 'fontLarge' },
  { scale: 'huge', labelKey: 'fontHuge' },
];

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  compact = false,
  className = '',
}) => {
  const { lang, setLang, dir, fontScale, setFontScale, isMuted, setIsMuted, t } = useSettings();

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEffects.playFlip(false);
    }
  };

  return (
    <div
      dir={dir}
      className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-200/90 shadow-sm ${
        compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
      } ${className}`}
    >
      {/* Language Selector */}
      <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label={t('languageLabel')}>
        <Globe className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
        <div className="inline-flex rounded-xl bg-rose-50/90 p-0.5 border border-rose-100">
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
                    : 'text-slate-700 hover:text-rose-700 hover:bg-white/70'
                }`}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Scaling & Sound Mute */}
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className="inline-flex items-center rounded-xl bg-amber-50/90 p-0.5 border border-amber-200/80"
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
                  compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm'
                } ${
                  active
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-amber-900 hover:bg-white/80'
                }`}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleToggleMute}
          aria-pressed={isMuted}
          aria-label={isMuted ? t('unmuteSound') : t('muteSound')}
          title={isMuted ? t('unmuteSound') : t('muteSound')}
          className={`inline-flex items-center gap-1.5 rounded-xl font-bold border transition-all touch-manipulation ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
          } ${
            isMuted
              ? 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          {!compact && (
            <span className="hidden sm:inline">
              {isMuted ? t('soundOff') : t('soundOn')}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
