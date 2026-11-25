import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Check, Eye, EyeOff, Hash, Pause, Sparkles, Timer, Trophy, Zap } from 'lucide-react';
import { Language, PuzzleItem } from '../../types/game';
import { useSettings } from '../../context/SettingsContext';
import { getDriveImageEndpoints, soundEffects } from '../../services/contentService';

interface PuzzleGameProps {
  puzzle: PuzzleItem;
  isPaused: boolean;
  roundStartTime?: number;
  onProgress: (progressPercent: number, scoreDelta: number, completed: boolean) => void;
}

const COPY: Record<
  Language,
  {
    subtitle: string;
    moves: string;
    peekPhoto: string;
    hidePhoto: string;
    showNumbers: string;
    solvedTitle: string;
    tapHint: string;
    tapSecondHint: string;
  }
> = {
  he: {
    subtitle: 'הקישו על שני חלקים כדי להחליף ביניהם ולהרכיב את התמונה',
    moves: 'החלפות',
    peekPhoto: 'הצצה לתמונה',
    hidePhoto: 'הסתר הצצה',
    showNumbers: 'מספרים',
    solvedTitle: 'מושלם! הפאזל הורכב בהצלחה!',
    tapHint: 'בחרו אריח ראשון להחלפה',
    tapSecondHint: 'עכשיו הקישו על אריח שני כדי להחליף',
  },
  ru: {
    subtitle: 'Нажмите на два фрагмента, чтобы поменять их местами',
    moves: 'Ходы',
    peekPhoto: 'Подсказка фото',
    hidePhoto: 'Скрыть фото',
    showNumbers: 'Номера',
    solvedTitle: 'Отлично! Пазл полностью собран!',
    tapHint: 'Выберите первый фрагмент',
    tapSecondHint: 'Теперь нажмите на второй, чтобы поменять местами',
  },
  en: {
    subtitle: 'Tap any two tiles to swap them and complete the photo',
    moves: 'Swaps',
    peekPhoto: 'Peek Photo',
    hidePhoto: 'Hide Photo',
    showNumbers: 'Numbers',
    solvedTitle: 'Wonderful! Puzzle Solved!',
    tapHint: 'Tap a tile to select it',
    tapSecondHint: 'Now tap another tile to swap',
  },
};

function createShuffledBoard(totalTiles: number): number[] {
  const solved = Array.from({ length: totalTiles }, (_, idx) => idx);
  if (totalTiles <= 1) return solved;

  const board = [...solved];
  const minDisplaced = Math.max(2, Math.ceil(totalTiles * 0.6));

  for (let attempt = 0; attempt < 15; attempt++) {
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
    const displaced = board.filter((tileId, slotIdx) => tileId !== slotIdx).length;
    if (displaced >= minDisplaced) {
      return board;
    }
  }

  // Fallback guaranteed swap if random attempts stayed too close to solved
  if (board.every((tileId, slotIdx) => tileId === slotIdx)) {
    [board[0], board[board.length - 1]] = [board[board.length - 1], board[0]];
  }
  return board;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({
  puzzle,
  isPaused,
  roundStartTime,
  onProgress,
}) => {
  const { lang, dir, isMuted, t } = useSettings();
  const copy = COPY[lang];

  const gridSize = Math.max(2, Math.min(5, puzzle.gridSize || 3));
  const totalTiles = gridSize * gridSize;
  const puzzleKey = `${puzzle.id}:${gridSize}`;

  const [board, setBoard] = useState<number[]>(() => createShuffledBoard(totalTiles));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [bestCorrectCount, setBestCorrectCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [endpointIdx, setEndpointIdx] = useState(0);

  const [startTime] = useState<number>(() => roundStartTime || Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
  const [finalBonusEarned, setFinalBonusEarned] = useState<number | null>(null);

  const prevKeyRef = useRef<string>(puzzleKey);

  useEffect(() => {
    setEndpointIdx(0);
  }, [puzzle.imageUrl]);

  useEffect(() => {
    if (prevKeyRef.current !== puzzleKey) {
      prevKeyRef.current = puzzleKey;
      setBoard(createShuffledBoard(totalTiles));
      setSelectedSlot(null);
      setMoves(0);
      setBestCorrectCount(0);
      setShowPreview(false);
    }
  }, [puzzleKey, totalTiles]);

  const correctCount = useMemo(
    () => board.filter((tileId, slotIdx) => tileId === slotIdx).length,
    [board]
  );
  const progressPercent = totalTiles > 0 ? Math.round((correctCount / totalTiles) * 100) : 100;
  const isSolved = totalTiles > 0 && correctCount === totalTiles;

  useEffect(() => {
    if (isSolved || isPaused) return;
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isSolved, isPaused]);

  const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
  // 60-second speed bonus window: up to +250 points
  const currentSpeedBonus = Math.max(0, Math.round((60 - Math.min(60, elapsedSeconds)) * (250 / 60)));

  const imageEndpoints = useMemo(
    () => getDriveImageEndpoints(puzzle.imageUrl),
    [puzzle.imageUrl]
  );
  const activeImageUrl = imageEndpoints[endpointIdx] ?? puzzle.imageUrl;

  const handleImageError = () => {
    setEndpointIdx((prev) => (prev < imageEndpoints.length - 1 ? prev + 1 : prev));
  };

  const handleTileTap = (slotIndex: number) => {
    if (isPaused || isSolved) return;

    if (selectedSlot === null) {
      soundEffects.playFlip(isMuted);
      setSelectedSlot(slotIndex);
      return;
    }

    if (selectedSlot === slotIndex) {
      setSelectedSlot(null);
      return;
    }

    const nextBoard = [...board];
    [nextBoard[selectedSlot], nextBoard[slotIndex]] = [
      nextBoard[slotIndex],
      nextBoard[selectedSlot],
    ];

    const nextCorrectCount = nextBoard.filter((tileId, idx) => tileId === idx).length;
    const nextProgress = Math.round((nextCorrectCount / totalTiles) * 100);
    const completed = nextCorrectCount === totalTiles;

    const earnedSpeedBonus = Math.max(0, Math.round((60 - Math.min(60, elapsedSeconds)) * (250 / 60)));
    let scoreDelta = 0;
    if (nextCorrectCount > bestCorrectCount) {
      const gainedTiles = nextCorrectCount - bestCorrectCount;
      scoreDelta = gainedTiles * 25 + (completed ? (200 + earnedSpeedBonus) : 0);
      setBestCorrectCount(nextCorrectCount);
    } else if (completed) {
      scoreDelta = 200 + earnedSpeedBonus;
    }

    if (completed) {
      setFinalBonusEarned(earnedSpeedBonus);
    }

    setBoard(nextBoard);
    setSelectedSlot(null);
    setMoves((prev) => prev + 1);

    if (completed) {
      soundEffects.playSuccess(isMuted);
      window.setTimeout(() => soundEffects.playApplause(isMuted), 200);
    } else if (nextCorrectCount > correctCount) {
      soundEffects.playSuccess(isMuted);
    } else {
      soundEffects.playFlip(isMuted);
    }

    onProgress(nextProgress, scoreDelta, completed);
  };

  return (
    <div dir={dir} className="relative w-full max-w-2xl mx-auto select-none space-y-4">
      {/* Header & Progress Bar */}
      <div className="rounded-3xl bg-white/95 backdrop-blur border-2 border-amber-200 p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h2 className="text-xl font-extrabold text-amber-800">
              {puzzle.title[lang]}
            </h2>
            <p className="text-sm text-slate-600">{copy.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 font-bold text-sm">
              <Timer className="w-4 h-4 text-slate-500" />
              {elapsedSeconds} {t('secondsUnit')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-sm">
              <Zap className="w-4 h-4 text-amber-600" />
              +{currentSpeedBonus}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
              <Check className="w-4 h-4" />
              {t('puzzleTilesCorrect')}: {correctCount}/{totalTiles}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100 text-orange-900 font-bold text-sm">
              {copy.moves}: {moves}
            </span>
          </div>
        </div>

        <div className="w-full h-3.5 bg-amber-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-600">
            {isSolved
              ? copy.solvedTitle
              : selectedSlot !== null
              ? copy.tapSecondHint
              : copy.tapHint}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNumbers((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors touch-manipulation ${
                showNumbers
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Hash className="w-4 h-4" />
              {copy.showNumbers}
            </button>
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-colors touch-manipulation ${
                showPreview
                  ? 'bg-rose-500 text-white border-rose-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {showPreview ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showPreview ? copy.hidePhoto : copy.peekPhoto}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden preloader to advance Google Drive image endpoints on error */}
      <img
        src={activeImageUrl}
        referrerPolicy="no-referrer"
        alt=""
        onError={handleImageError}
        className="hidden"
      />

      {/* Reference Preview Drawer */}
      {showPreview && !isSolved && (
        <div className="rounded-3xl bg-white p-3 border-2 border-rose-300 shadow-lg max-w-xs mx-auto">
          <img
            src={activeImageUrl}
            referrerPolicy="no-referrer"
            alt={puzzle.title[lang]}
            onError={handleImageError}
            className="w-full aspect-square object-cover rounded-2xl"
          />
        </div>
      )}

      {/* Puzzle Grid (Explicitly LTR so image columns never flip in RTL Hebrew) */}
      <div className="relative">
        <div
          dir="ltr"
          className={`w-full max-w-[440px] mx-auto aspect-square rounded-3xl p-2 sm:p-2.5 shadow-xl border-4 transition-all duration-500 ${
            isSolved
              ? 'bg-emerald-500 border-emerald-400'
              : 'bg-white/95 border-amber-300'
          }`}
        >
          <div
            className="grid w-full h-full rounded-2xl overflow-hidden transition-all duration-500"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
              gap: isSolved ? '0px' : '5px',
            }}
          >
            {board.map((tileId, slotIndex) => {
              const origRow = Math.floor(tileId / gridSize);
              const origCol = tileId % gridSize;
              const isCorrect = tileId === slotIndex;
              const isSelected = selectedSlot === slotIndex;

              return (
                <button
                  key={slotIndex}
                  type="button"
                  onClick={() => handleTileTap(slotIndex)}
                  disabled={isPaused || isSolved}
                  aria-label={`Tile ${tileId + 1} at position ${slotIndex + 1}`}
                  className={`relative w-full h-full overflow-hidden touch-manipulation transition-all duration-200 focus:outline-none ${
                    isSolved
                      ? 'border-0 rounded-none'
                      : isSelected
                      ? 'rounded-xl border-4 border-amber-400 ring-4 ring-amber-300/80 scale-95 z-10 shadow-lg'
                      : isCorrect
                      ? 'rounded-xl border-4 border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]'
                      : 'rounded-xl border-2 border-slate-200 hover:border-amber-300 active:scale-95'
                  }`}
                >
                  <img
                    src={activeImageUrl}
                    referrerPolicy="no-referrer"
                    alt=""
                    draggable={false}
                    className="absolute object-cover pointer-events-none select-none"
                    style={{
                      width: `${gridSize * 100}%`,
                      height: `${gridSize * 100}%`,
                      maxWidth: 'none',
                      left: `${-origCol * 100}%`,
                      top: `${-origRow * 100}%`,
                    }}
                  />
                  {isCorrect && !isSolved && (
                    <span className="absolute top-1 right-1 z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                  {showNumbers && !isSolved && (
                    <span className="absolute bottom-1 left-1 z-10 px-1.5 py-0.5 rounded-md bg-slate-900/75 text-white text-xs font-extrabold">
                      {tileId + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
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

      {/* Solved Story Reveal */}
      {isSolved && (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50 border-2 border-emerald-400 p-5 shadow-xl space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-xl">
              <Trophy className="w-7 h-7 text-amber-500 shrink-0" />
              <span>{t('puzzleCompleted')}</span>
            </div>
            {finalBonusEarned !== null && finalBonusEarned > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white font-black text-sm shadow">
                <Zap className="w-4 h-4 fill-white" />
                {t('speedBonusEarned', { bonus: finalBonusEarned })}
              </span>
            )}
          </div>
          <div className="flex items-start gap-2.5 pt-1 border-t border-emerald-200/80">
            <BookOpen className="w-5 h-5 text-rose-500 shrink-0 mt-1" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-0.5">
                {t('puzzleStoryTitle')}
              </p>
              <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
                {puzzle.story[lang]}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      )}
    </div>
  );
};
