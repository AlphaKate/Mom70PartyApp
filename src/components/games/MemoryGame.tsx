import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ImageOff, Pause, Sparkles, Trophy } from 'lucide-react';
import { Language, MemoryPair } from '../../types/game';
import { useSettings } from '../../context/SettingsContext';
import { soundEffects } from '../../services/contentService';

interface MemoryGameProps {
  pairs: MemoryPair[];
  isPaused: boolean;
  onProgress: (progressPercent: number, scoreDelta: number, completed: boolean) => void;
}

interface DeckCard {
  uid: string;
  pairId: string;
  side: 'A' | 'B';
}

const COPY: Record<
  Language,
  {
    subtitle: string;
    completedSubtitle: string;
    noCards: string;
    cardBackLabel: string;
  }
> = {
  he: {
    subtitle: 'הפכו זוגות קלפים ומצאו את הזיכרונות המתאימים',
    completedSubtitle: 'המשיכו לעודד את כולם עד שהמארח יעבור לשלב הבא',
    noCards: 'ממתינים לקלפי המשחק...',
    cardBackLabel: 'קלף זיכרון הפוך',
  },
  ru: {
    subtitle: 'Открывайте карточки и находите подходящие воспоминания',
    completedSubtitle: 'Подождите, пока ведущий перейдёт к следующему раунду',
    noCards: 'Загрузка карточек игры...',
    cardBackLabel: 'Закрытая карточка памяти',
  },
  en: {
    subtitle: 'Tap two cards to match pairs of memories',
    completedSubtitle: 'Wait for the host to start the next round',
    noCards: 'Waiting for memory cards...',
    cardBackLabel: 'Face-down memory card',
  },
};

function buildShuffledDeck(pairs: MemoryPair[]): DeckCard[] {
  const deck: DeckCard[] = [];
  for (const pair of pairs) {
    deck.push({ uid: `${pair.id}::A`, pairId: pair.id, side: 'A' });
    deck.push({ uid: `${pair.id}::B`, pairId: pair.id, side: 'B' });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  pairs,
  isPaused,
  onProgress,
}) => {
  const { lang, dir, isMuted, t } = useSettings();
  const copy = COPY[lang];

  const pairsKey = useMemo(() => pairs.map((p) => p.id).join('|'), [pairs]);
  const pairsRef = useRef<MemoryPair[]>(pairs);
  pairsRef.current = pairs;

  const pairMap = useMemo(() => {
    const map = new Map<string, MemoryPair>();
    for (const pair of pairs) {
      map.set(pair.id, pair);
    }
    return map;
  }, [pairs]);

  const [deck, setDeck] = useState<DeckCard[]>(() => buildShuffledDeck(pairs));
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [lastMatchedText, setLastMatchedText] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const mismatchTimerRef = useRef<number | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const prevPairsKeyRef = useRef<string>(pairsKey);

  useEffect(() => {
    if (prevPairsKeyRef.current !== pairsKey) {
      prevPairsKeyRef.current = pairsKey;
      if (mismatchTimerRef.current !== null) {
        window.clearTimeout(mismatchTimerRef.current);
        mismatchTimerRef.current = null;
      }
      if (bannerTimerRef.current !== null) {
        window.clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = null;
      }
      setDeck(buildShuffledDeck(pairsRef.current));
      setFlippedUids([]);
      setMatchedPairIds([]);
      setMoves(0);
      setIsChecking(false);
      setLastMatchedText(null);
    }
  }, [pairsKey]);

  useEffect(() => {
    return () => {
      if (mismatchTimerRef.current !== null) {
        window.clearTimeout(mismatchTimerRef.current);
      }
      if (bannerTimerRef.current !== null) {
        window.clearTimeout(bannerTimerRef.current);
      }
    };
  }, []);

  const totalPairs = pairs.length;
  const matchedCount = matchedPairIds.length;
  const progressPercent = totalPairs > 0 ? Math.round((matchedCount / totalPairs) * 100) : 0;
  const isCompleted = totalPairs > 0 && matchedCount >= totalPairs;

  const handleCardClick = (card: DeckCard) => {
    if (isPaused || isChecking || isCompleted) return;
    if (matchedPairIds.includes(card.pairId)) return;
    if (flippedUids.includes(card.uid)) return;

    if (flippedUids.length === 0) {
      soundEffects.playFlip(isMuted);
      setFlippedUids([card.uid]);
      return;
    }

    if (flippedUids.length === 1) {
      const firstUid = flippedUids[0];
      const firstCard = deck.find((c) => c.uid === firstUid);
      setMoves((prev) => prev + 1);

      if (firstCard && firstCard.pairId === card.pairId) {
        const nextMatched = [...matchedPairIds, card.pairId];
        const nextCount = nextMatched.length;
        const nextPercent = totalPairs > 0 ? Math.round((nextCount / totalPairs) * 100) : 100;
        const completed = totalPairs > 0 && nextCount >= totalPairs;
        const scoreDelta = 100 + (completed ? 150 : 0);

        setMatchedPairIds(nextMatched);
        setFlippedUids([]);

        const matchedPair = pairMap.get(card.pairId);
        if (matchedPair) {
          setLastMatchedText(
            `${matchedPair.labelA[lang]} • ${matchedPair.labelB[lang]}`
          );
          if (bannerTimerRef.current !== null) {
            window.clearTimeout(bannerTimerRef.current);
          }
          bannerTimerRef.current = window.setTimeout(() => {
            setLastMatchedText(null);
          }, 2200);
        }

        if (completed) {
          soundEffects.playSuccess(isMuted);
          window.setTimeout(() => soundEffects.playApplause(isMuted), 220);
        } else {
          soundEffects.playSuccess(isMuted);
        }

        onProgress(nextPercent, scoreDelta, completed);
      } else {
        soundEffects.playFlip(isMuted);
        setFlippedUids([firstUid, card.uid]);
        setIsChecking(true);

        if (mismatchTimerRef.current !== null) {
          window.clearTimeout(mismatchTimerRef.current);
        }
        mismatchTimerRef.current = window.setTimeout(() => {
          setFlippedUids([]);
          setIsChecking(false);
          mismatchTimerRef.current = null;
        }, 900);
      }
    }
  };

  if (totalPairs === 0) {
    return (
      <div
        dir={dir}
        className="w-full max-w-xl mx-auto rounded-3xl bg-white/90 border-2 border-amber-200 p-8 text-center shadow-lg"
      >
        <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-pulse" />
        <p className="text-lg font-bold text-slate-700">{copy.noCards}</p>
      </div>
    );
  }

  const gridColsClass =
    deck.length <= 8
      ? 'grid-cols-2 sm:grid-cols-4'
      : 'grid-cols-3 sm:grid-cols-4';

  return (
    <div dir={dir} className="relative w-full max-w-3xl mx-auto select-none space-y-4">
      {/* Header & Progress */}
      <div className="rounded-3xl bg-white/95 backdrop-blur border-2 border-rose-200 p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-xl font-extrabold text-rose-700">{t('memoryTitle')}</h2>
            <p className="text-sm text-slate-600">{copy.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
              <Check className="w-4 h-4" />
              {t('memoryPairsFound')}: {matchedCount}/{totalPairs}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-sm">
              {t('memoryMoves')}: {moves}
            </span>
          </div>
        </div>

        <div className="w-full h-3.5 bg-rose-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Match toast */}
      {lastMatchedText && !isCompleted && (
        <div className="rounded-2xl bg-emerald-500 text-white px-4 py-2.5 shadow-lg flex items-center justify-center gap-2 font-bold text-base animate-bounce">
          <Sparkles className="w-5 h-5 shrink-0" />
          <span>
            {t('memoryMatched')} {lastMatchedText}
          </span>
        </div>
      )}

      {/* Completion Banner */}
      {isCompleted && (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 text-white p-5 shadow-xl text-center space-y-1.5">
          <Trophy className="w-10 h-10 mx-auto text-yellow-200" />
          <h3 className="text-2xl font-extrabold">{t('memoryCompleted')}</h3>
          <p className="text-sm sm:text-base text-white/95 font-medium">
            {copy.completedSubtitle}
          </p>
        </div>
      )}

      {/* Card Grid */}
      <div className="relative">
        <div className={`grid ${gridColsClass} gap-2.5 sm:gap-3.5`}>
          {deck.map((card) => {
            const pair = pairMap.get(card.pairId);
            const isMatched = matchedPairIds.includes(card.pairId);
            const isFlipped = flippedUids.includes(card.uid) || isMatched;
            const imageUrl = pair
              ? card.side === 'A'
                ? pair.imageA
                : pair.imageB
              : '';
            const label = pair
              ? card.side === 'A'
                ? pair.labelA[lang]
                : pair.labelB[lang]
              : '';
            const imgFailed = Boolean(failedImages[card.uid]);

            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => handleCardClick(card)}
                disabled={isPaused || isChecking || isFlipped}
                aria-label={isFlipped ? label : copy.cardBackLabel}
                aria-pressed={isFlipped}
                style={{ perspective: '1000px' }}
                className="group relative w-full aspect-[3/4] min-h-[112px] touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 rounded-2xl"
              >
                <div
                  className="relative w-full h-full rounded-2xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.45s cubic-bezier(0.4, 0.2, 0.2, 1)',
                  }}
                >
                  {/* Card Back (Face-Down) */}
                  <div
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 border-4 border-white shadow-md group-hover:shadow-xl group-active:scale-95 transition-transform flex flex-col items-center justify-center p-2 text-white"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 shadow-inner">
                      <span className="text-xl sm:text-2xl font-black tracking-tight">70</span>
                    </div>
                    <Sparkles className="w-4 h-4 mt-1.5 text-amber-100 opacity-90" />
                  </div>

                  {/* Card Front (Face-Up) */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                    className={`absolute inset-0 rounded-2xl bg-white overflow-hidden flex flex-col shadow-md border-4 transition-colors ${
                      isMatched
                        ? 'border-emerald-500 ring-4 ring-emerald-200'
                        : 'border-amber-400'
                    }`}
                  >
                    <div className="relative flex-1 min-h-0 bg-amber-50/70 overflow-hidden flex items-center justify-center p-1">
                      {imageUrl && !imgFailed ? (
                        <img
                          src={imageUrl}
                          alt={label}
                          draggable={false}
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [card.uid]: true }))
                          }
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-amber-600 p-2">
                          <ImageOff className="w-7 h-7 mb-1 opacity-70" />
                          <span className="text-xs font-bold text-center">{label}</span>
                        </div>
                      )}

                      {isMatched && (
                        <span className="absolute top-1.5 end-1.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div
                      className={`px-2 py-1.5 text-center border-t ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-white border-slate-100 text-slate-800'
                      }`}
                    >
                      <span className="block text-xs sm:text-sm font-bold leading-tight break-words line-clamp-2">
                        {label}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-20 rounded-3xl bg-slate-900/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <Pause className="w-14 h-14 text-amber-300 mb-3 animate-pulse" />
            <h3 className="text-2xl font-extrabold mb-1">{t('pausedBannerTitle')}</h3>
            <p className="text-base text-slate-200 max-w-sm">{t('pausedBannerDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
