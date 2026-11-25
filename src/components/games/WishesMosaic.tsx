import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Heart,
  Send,
  Sparkles,
  Star,
} from 'lucide-react';
import { Language, WishItem } from '../../types/game';
import { useSettings } from '../../context/SettingsContext';
import { soundEffects } from '../../services/contentService';
import { AvatarDisplay } from '../common/AvatarDisplay';

interface PlayerWishInputProps {
  onSubmitWish: (text: string) => void;
  submittedWish?: string;
}

interface HostMosaic70Props {
  wishes: WishItem[];
  momName: string;
}

const INPUT_COPY: Record<
  Language,
  {
    quickIdeasLabel: string;
    quickIdeas: string[];
    yourBlessing: string;
  }
> = {
  he: {
    quickIdeasLabel: 'רעיונות מהירים להוספה:',
    quickIdeas: ['אוהבים אותך ❤️', 'בריאות ואושר 🌟', 'עד 120! 🎂', 'חיבוק גדול 🤗'],
    yourBlessing: 'הברכה שלך:',
  },
  ru: {
    quickIdeasLabel: 'Быстрые фразы:',
    quickIdeas: ['Любим тебя ❤️', 'Здоровья и счастья 🌟', 'До 120 лет! 🎂', 'Крепко обнимаем 🤗'],
    yourBlessing: 'Ваше пожелание:',
  },
  en: {
    quickIdeasLabel: 'Quick ideas to add:',
    quickIdeas: ['Love you! ❤️', 'Health & Joy 🌟', 'To 120! 🎂', 'Big Hugs 🤗'],
    yourBlessing: 'Your blessing:',
  },
};

const MOSAIC_COPY: Record<
  Language,
  {
    headerPrefix: string;
    headerSuffix: string;
    waitingTitle: string;
    waitingSubtitle: string;
    spotlightLabel: string;
    allBlessings: string;
  }
> = {
  he: {
    headerPrefix: 'פסיפס הברכות לכבוד גיל 70 של',
    headerSuffix: '🎂',
    waitingTitle: 'פסיפס ה-70 מחכה לברכות שלכם!',
    waitingSubtitle: 'שלחו איחול מהטלפון והוא יופיע כאן מיד ✨',
    spotlightLabel: 'ברכה נבחרת',
    allBlessings: 'ענן הברכות המשפחתי',
  },
  ru: {
    headerPrefix: 'Праздничная мозаика 70-летия:',
    headerSuffix: '🎂',
    waitingTitle: 'Мозаика «70» ждёт ваших пожеланий!',
    waitingSubtitle: 'Отправьте тёплое поздравление с телефона ✨',
    spotlightLabel: 'В центре внимания',
    allBlessings: 'Семейное облако пожеланий',
  },
  en: {
    headerPrefix: '70th Birthday Wish Mosaic for',
    headerSuffix: '🎂',
    waitingTitle: 'The 70 Mosaic awaits your blessings!',
    waitingSubtitle: 'Send a warm wish from your phone to light up the 70 ✨',
    spotlightLabel: 'Wish Spotlight',
    allBlessings: 'Family Blessing Cloud',
  },
};

export const PlayerWishInput: React.FC<PlayerWishInputProps> = ({
  onSubmitWish,
  submittedWish,
}) => {
  const { lang, dir, isMuted, t } = useSettings();
  const copy = INPUT_COPY[lang];
  const [draft, setDraft] = useState('');
  const [localSubmitted, setLocalSubmitted] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const effectiveSubmitted = submittedWish?.trim() || localSubmitted;

  const handleAppendChip = (chip: string) => {
    setDraft((prev) => {
      const next = prev.trim().length > 0 ? `${prev.trim()} ${chip}` : chip;
      return next.slice(0, 120);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draft.trim();
    if (!cleaned) return;
    soundEffects.playSuccess(isMuted);
    setLocalSubmitted(cleaned);
    setIsEditing(false);
    onSubmitWish(cleaned);
  };

  if (effectiveSubmitted && !isEditing) {
    return (
      <div
        dir={dir}
        className="w-full max-w-lg mx-auto rounded-3xl bg-gradient-to-br from-rose-50 via-amber-50 to-pink-50 border-2 border-amber-300 p-6 sm:p-8 text-center shadow-xl space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg">
          <Heart className="w-8 h-8 fill-current animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-rose-800">{t('wishesSubmittedTitle')}</h2>
        <p className="text-base text-slate-700">{t('wishesSubmittedDesc')}</p>

        <div className="rounded-2xl bg-white border-2 border-rose-200 p-4 shadow-inner">
          <p className="text-xs font-extrabold uppercase tracking-wider text-rose-500 mb-1">
            {copy.yourBlessing}
          </p>
          <p className="text-xl font-bold text-slate-800 break-words">
            “{effectiveSubmitted}”
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              soundEffects.playTick(isMuted);
              setDraft(effectiveSubmitted);
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-rose-50 border-2 border-rose-200 text-rose-700 font-bold text-sm shadow-sm transition-colors touch-manipulation"
          >
            <Edit3 className="w-4 h-4" />
            <span>{t('editWishBtn')}</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>70</span>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <form
      dir={dir}
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto rounded-3xl bg-white/95 backdrop-blur border-2 border-rose-200 p-5 sm:p-6 shadow-xl space-y-4"
    >
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow mb-1">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-rose-800">{t('wishesTitle')}</h2>
        <p className="text-sm sm:text-base text-slate-600">{t('wishesSubtitle')}</p>
      </div>

      <div className="space-y-1.5">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 120))}
          placeholder={t('wishesPlaceholder')}
          rows={3}
          maxLength={120}
          className="w-full rounded-2xl border-2 border-amber-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 p-4 text-lg font-medium text-slate-800 bg-amber-50/30 outline-none resize-none transition-all"
        />
        <div className="flex justify-end text-xs font-bold text-slate-400">
          {draft.length}/120
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-extrabold text-slate-500">{copy.quickIdeasLabel}</p>
        <div className="flex flex-wrap gap-2">
          {copy.quickIdeas.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => handleAppendChip(idea)}
              className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-sm font-bold transition-colors touch-manipulation active:scale-95"
            >
              + {idea}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={draft.trim().length === 0}
        className="w-full min-h-[58px] rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-45 disabled:cursor-not-allowed text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] touch-manipulation"
      >
        <Send className="w-5 h-5" />
        <span>{t('wishesSubmitBtn')}</span>
      </button>
    </form>
  );
};

// 15 cols x 9 rows bitmap forming bold "7" (cols 0..6) and "0" (cols 8..14)
const MOSAIC_70_BITMAP: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1],
  [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
  [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
  [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
  [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
];

const TILE_COLORS = [
  'from-rose-500 to-pink-500 border-rose-300',
  'from-amber-400 to-orange-500 border-amber-200',
  'from-fuchsia-500 to-purple-500 border-fuchsia-300',
  'from-sky-500 to-indigo-500 border-sky-300',
  'from-emerald-500 to-teal-500 border-emerald-300',
  'from-pink-500 to-rose-500 border-pink-300',
];

const CLOUD_CARD_COLORS = [
  'bg-rose-50 border-rose-300 text-rose-950',
  'bg-amber-50 border-amber-300 text-amber-950',
  'bg-sky-50 border-sky-300 text-sky-950',
  'bg-emerald-50 border-emerald-300 text-emerald-950',
  'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-950',
  'bg-violet-50 border-violet-300 text-violet-950',
];

const DECORATIVE_EMOJIS = ['🎂', '❤️', '✨', '💐', '🥂', '🌟', '🎉', '70'];

function getShortSnippet(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return '';
  if (words[0].length > 9) return `${words[0].slice(0, 8)}…`;
  return words.slice(0, 2).join(' ').slice(0, 12);
}

export const HostMosaic70: React.FC<HostMosaic70Props> = ({ wishes, momName }) => {
  const { lang, dir, t } = useSettings();
  const copy = MOSAIC_COPY[lang];

  const [selectedWishIndex, setSelectedWishIndex] = useState(0);
  const [autoCycle, setAutoCycle] = useState(true);
  const prevWishesLenRef = useRef(wishes.length);

  useEffect(() => {
    if (wishes.length > prevWishesLenRef.current) {
      setSelectedWishIndex(wishes.length - 1);
      setAutoCycle(true);
    }
    prevWishesLenRef.current = wishes.length;
  }, [wishes.length]);

  useEffect(() => {
    if (wishes.length <= 1 || !autoCycle) return;
    const timer = window.setInterval(() => {
      setSelectedWishIndex((prev) => (prev + 1) % wishes.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [wishes.length, autoCycle]);

  const safeActiveIndex =
    wishes.length > 0 ? selectedWishIndex % wishes.length : 0;
  const activeWish = wishes.length > 0 ? wishes[safeActiveIndex] : null;

  const activeCoordinates = useMemo(() => {
    const coords: Array<{ row: number; col: number; index: number }> = [];
    let index = 0;
    for (let r = 0; r < MOSAIC_70_BITMAP.length; r++) {
      for (let c = 0; c < MOSAIC_70_BITMAP[r].length; c++) {
        if (MOSAIC_70_BITMAP[r][c] === 1) {
          coords.push({ row: r, col: c, index });
          index++;
        }
      }
    }
    return coords;
  }, []);

  // Spread wishes across the 72 active cells of the "70" shape
  const cellWishAssignments = useMemo(() => {
    const assignments = new Map<number, { wish: WishItem; wishIdx: number }>();
    if (wishes.length === 0) return assignments;

    const totalCells = activeCoordinates.length;
    if (wishes.length >= totalCells) {
      for (let i = 0; i < totalCells; i++) {
        assignments.set(i, { wish: wishes[i], wishIdx: i });
      }
      return assignments;
    }

    // Spread wishes cleanly at evenly spaced indices across the "7" and "0"
    const repeats = wishes.length <= 6 ? 3 : wishes.length <= 14 ? 2 : 1;
    const totalSlotsNeeded = Math.min(totalCells, wishes.length * repeats);
    const step = totalCells / totalSlotsNeeded;

    for (let slot = 0; slot < totalSlotsNeeded; slot++) {
      const cellIdx = Math.min(totalCells - 1, Math.floor(slot * step));
      const wishIdx = slot % wishes.length;
      if (!assignments.has(cellIdx)) {
        assignments.set(cellIdx, { wish: wishes[wishIdx], wishIdx });
      }
    }
    return assignments;
  }, [wishes, activeCoordinates.length]);

  // Quick coordinate lookup: `${r}-${c}` -> active cell index
  const coordIndexLookup = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of activeCoordinates) {
      map.set(`${item.row}-${item.col}`, item.index);
    }
    return map;
  }, [activeCoordinates]);

  const handleSelectWish = (idx: number) => {
    setSelectedWishIndex(idx);
    setAutoCycle(false);
  };

  return (
    <div dir={dir} className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200 text-rose-900 font-extrabold text-sm shadow-sm">
          <Star className="w-4 h-4 text-rose-600 fill-rose-500" />
          <span>
            {wishes.length} {t('wishesCount')}
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-rose-600 via-amber-500 to-fuchsia-600 bg-clip-text text-transparent">
          {copy.headerPrefix} {momName} {copy.headerSuffix}
        </h2>
      </div>

      {/* Big "70" Interactive Mosaic Frame (Explicitly LTR so 7 is always left of 0) */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 sm:p-7 shadow-2xl border-4 border-amber-300/80 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

        <div
          dir="ltr"
          className="relative grid gap-1 sm:gap-1.5 mx-auto max-w-4xl"
          style={{
            gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
          }}
        >
          {MOSAIC_70_BITMAP.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              if (cell === 0) {
                return <div key={`${r}-${c}`} className="aspect-square" />;
              }

              const activeIdx = coordIndexLookup.get(`${r}-${c}`) ?? 0;
              const assigned = cellWishAssignments.get(activeIdx);
              const colorClass = TILE_COLORS[(r + c) % TILE_COLORS.length];

              if (assigned) {
                const isSpotlighted = assigned.wishIdx === safeActiveIndex;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleSelectWish(assigned.wishIdx)}
                    title={`${assigned.wish.playerName}: ${assigned.wish.text}`}
                    className={`aspect-square rounded-lg sm:rounded-xl bg-gradient-to-br ${colorClass} border text-white flex flex-col items-center justify-center p-0.5 overflow-hidden shadow-md transition-all duration-300 hover:scale-110 hover:z-20 cursor-pointer ${
                      isSpotlighted
                        ? 'ring-2 sm:ring-4 ring-yellow-300 scale-110 z-10 shadow-yellow-300/40 shadow-lg'
                        : 'opacity-95'
                    }`}
                  >
                    <AvatarDisplay
                      avatar={assigned.wish.avatar}
                      className="w-5 h-5 sm:w-7 sm:h-7 shrink-0 drop-shadow-sm"
                    />
                    <span className="hidden md:block text-[9px] font-extrabold leading-tight truncate max-w-full px-0.5 mt-0.5 text-white/95">
                      {getShortSnippet(assigned.wish.text)}
                    </span>
                  </button>
                );
              }

              const decor = DECORATIVE_EMOJIS[activeIdx % DECORATIVE_EMOJIS.length];
              return (
                <div
                  key={`${r}-${c}`}
                  className={`aspect-square rounded-lg sm:rounded-xl bg-gradient-to-br ${colorClass} border opacity-85 flex items-center justify-center shadow-sm transition-transform hover:scale-105`}
                >
                  <span className="text-xs sm:text-base font-black text-white drop-shadow">
                    {decor}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Spotlight Wish Banner */}
        <div className="mt-6 max-w-2xl mx-auto">
          {activeWish ? (
            <div className="rounded-2xl bg-white/95 backdrop-blur border-2 border-amber-300 p-4 sm:p-5 shadow-xl flex items-center justify-between gap-3">
              {wishes.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    handleSelectWish(
                      (safeActiveIndex - 1 + wishes.length) % wishes.length
                    )
                  }
                  aria-label="Previous wish"
                  className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 transition-colors"
                >
                  {dir === 'rtl' ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
              )}

              <div className="flex-1 text-center space-y-1.5 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{copy.spotlightLabel}</span>
                </div>
                <p className="text-lg sm:text-2xl font-black text-slate-800 break-words leading-snug">
                  “{activeWish.text}”
                </p>
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-rose-600">
                  <AvatarDisplay avatar={activeWish.avatar} className="w-5 h-5 shrink-0" />
                  <span>{activeWish.playerName}</span>
                </div>
              </div>

              {wishes.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    handleSelectWish((safeActiveIndex + 1) % wishes.length)
                  }
                  aria-label="Next wish"
                  className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 transition-colors"
                >
                  {dir === 'rtl' ? (
                    <ChevronLeft className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4 text-center text-white">
              <p className="text-lg font-extrabold text-amber-200">
                {copy.waitingTitle}
              </p>
              <p className="text-sm text-indigo-100 mt-0.5">
                {copy.waitingSubtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Word Cloud / All Family Wishes */}
      {wishes.length > 0 && (
        <div className="rounded-3xl bg-white/95 border-2 border-amber-200 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-center gap-2 text-rose-700 font-extrabold text-lg">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            <span>{copy.allBlessings}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {wishes.map((wish, idx) => {
              const cardTheme = CLOUD_CARD_COLORS[idx % CLOUD_CARD_COLORS.length];
              const isSelected = idx === safeActiveIndex;
              const sizeClass =
                idx % 3 === 0
                  ? 'text-base sm:text-lg px-4 py-3'
                  : 'text-sm sm:text-base px-3.5 py-2.5';

              return (
                <button
                  key={`${wish.playerId}-${idx}`}
                  type="button"
                  onClick={() => handleSelectWish(idx)}
                  className={`rounded-2xl border-2 text-start transition-all duration-200 hover:scale-105 cursor-pointer max-w-xs ${cardTheme} ${sizeClass} ${
                    isSelected
                      ? 'ring-4 ring-amber-400 shadow-lg scale-105'
                      : 'shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <AvatarDisplay
                      avatar={wish.avatar}
                      className="w-7 h-7 shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="font-bold leading-snug break-words">
                        “{wish.text}”
                      </p>
                      <p className="text-xs font-extrabold opacity-75 mt-1">
                        — {wish.playerName}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
