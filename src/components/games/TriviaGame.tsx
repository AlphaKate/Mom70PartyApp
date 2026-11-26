import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Lightbulb,
  Pause,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Language, TriviaQuestion } from '../../types/game';
import { useSettings } from '../../context/SettingsContext';
import { soundEffects } from '../../services/contentService';

interface TriviaGameProps {
  question: TriviaQuestion;
  questionIndex: number;
  totalQuestions: number;
  isPaused: boolean;
  revealAnswer: boolean;
  selectedAnswer?: number;
  onAnswer: (answerIndex: number, timeMs: number) => void;
}

const QUESTION_DURATION_MS = 20000;

const COPY: Record<
  Language,
  {
    secondsLeft: string;
    timesUp: string;
    correctAnswer: string;
    greatJob: string;
    niceTry: string;
  }
> = {
  he: {
    secondsLeft: 'שניות',
    timesUp: 'נגמר הזמן — עדיין אפשר לבחור!',
    correctAnswer: 'תשובה נכונה!',
    greatJob: 'כל הכבוד! צדקתם!',
    niceTry: 'כמעט! בפעם הבאה!',
  },
  ru: {
    secondsLeft: 'сек',
    timesUp: 'Время вышло — но можно ответить!',
    correctAnswer: 'Правильный ответ!',
    greatJob: 'Молодец! Точно в цель!',
    niceTry: 'Почти! Повезёт в следующем вопросе!',
  },
  en: {
    secondsLeft: 's',
    timesUp: "Time's up — you can still tap an answer!",
    correctAnswer: 'Correct answer!',
    greatJob: 'Awesome! You got it right!',
    niceTry: 'Good try! Next one is yours!',
  },
};

const OPTION_STYLES = [
  {
    base: 'bg-rose-500 hover:bg-rose-600 border-rose-700 text-white',
    badge: 'bg-rose-700/80 text-white',
    letter: 'A',
    symbol: '●',
  },
  {
    base: 'bg-sky-500 hover:bg-sky-600 border-sky-700 text-white',
    badge: 'bg-sky-700/80 text-white',
    letter: 'B',
    symbol: '◆',
  },
  {
    base: 'bg-amber-500 hover:bg-amber-600 border-amber-700 text-white',
    badge: 'bg-amber-700/80 text-white',
    letter: 'C',
    symbol: '▲',
  },
  {
    base: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white',
    badge: 'bg-emerald-700/80 text-white',
    letter: 'D',
    symbol: '■',
  },
];

export const TriviaGame: React.FC<TriviaGameProps> = ({
  question,
  questionIndex,
  totalQuestions,
  isPaused,
  revealAnswer,
  selectedAnswer,
  onAnswer,
}) => {
  const { lang, dir, isMuted, t } = useSettings();
  const copy = COPY[lang];

  const [elapsedMs, setElapsedMs] = useState(0);
  const [optimisticAnswer, setOptimisticAnswer] = useState<number | undefined>(undefined);
  const elapsedRef = useRef(0);
  const lastTickTimestampRef = useRef<number | null>(null);
  const lastSoundSecondRef = useRef<number | null>(null);
  const revealedKeyRef = useRef<string | null>(null);

  const questionKey = `${question.id}::${questionIndex}`;

  // Reset only when question identity or index changes
  useEffect(() => {
    elapsedRef.current = 0;
    lastTickTimestampRef.current = Date.now();
    lastSoundSecondRef.current = null;
    revealedKeyRef.current = null;
    setElapsedMs(0);
    setOptimisticAnswer(undefined);
  }, [questionKey]);

  const effectiveSelectedAnswer =
    selectedAnswer !== undefined ? selectedAnswer : optimisticAnswer;
  const hasAnswered = effectiveSelectedAnswer !== undefined;
  const isTimerActive = !isPaused && !revealAnswer && !hasAnswered;

  useEffect(() => {
    if (!isTimerActive) {
      lastTickTimestampRef.current = null;
      return;
    }

    lastTickTimestampRef.current = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const last = lastTickTimestampRef.current ?? now;
      const delta = Math.max(0, now - last);
      lastTickTimestampRef.current = now;

      const nextElapsed = Math.min(QUESTION_DURATION_MS + 60000, elapsedRef.current + delta);
      elapsedRef.current = nextElapsed;
      setElapsedMs(nextElapsed);

      const remainingSec = Math.ceil(
        Math.max(0, QUESTION_DURATION_MS - nextElapsed) / 1000
      );
      if (
        remainingSec >= 1 &&
        remainingSec <= 5 &&
        lastSoundSecondRef.current !== remainingSec
      ) {
        lastSoundSecondRef.current = remainingSec;
        soundEffects.playTick(isMuted);
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [isTimerActive, isMuted]);

  // Play celebration chime once on reveal if player answered correctly
  useEffect(() => {
    if (revealAnswer && revealedKeyRef.current !== questionKey) {
      revealedKeyRef.current = questionKey;
      if (effectiveSelectedAnswer !== undefined && effectiveSelectedAnswer === question.correctIndex) {
        soundEffects.playSuccess(isMuted);
      }
    }
  }, [revealAnswer, questionKey, effectiveSelectedAnswer, question.correctIndex, isMuted]);

  const remainingMs = Math.max(0, QUESTION_DURATION_MS - elapsedMs);
  const remainingPercent = Math.max(
    0,
    Math.min(100, (remainingMs / QUESTION_DURATION_MS) * 100)
  );
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  const barColor =
    remainingPercent > 50
      ? 'bg-emerald-500'
      : remainingPercent > 25
      ? 'bg-amber-500'
      : 'bg-rose-500';

  const options = question.options[lang] ?? question.options.en ?? [];
  const isButtonsDisabled = isPaused || revealAnswer || hasAnswered;

  const handleSelect = (idx: number) => {
    if (isButtonsDisabled) return;
    setOptimisticAnswer(idx);
    soundEffects.playFlip(isMuted);
    onAnswer(idx, Math.max(250, Math.round(elapsedRef.current)));
  };

  return (
    <div dir={dir} className="relative w-full max-w-2xl mx-auto select-none space-y-4">
      {/* Question Header & Countdown */}
      <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border-2 border-sky-200 dark:border-slate-700 p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 font-extrabold text-sm">
            {t('triviaQuestionLabel')} {questionIndex + 1} {t('ofTotal')}{' '}
            {Math.max(1, totalQuestions)}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-extrabold text-sm transition-all ${
              hasAnswered
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/60'
                : remainingSeconds <= 5 && !revealAnswer
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-200 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            {hasAnswered ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('triviaAnswerLockedBadge')}</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                {remainingSeconds}
                {copy.secondsLeft}
              </>
            )}
          </span>
        </div>

        {/* Countdown Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${hasAnswered ? 'bg-emerald-500' : barColor} transition-all duration-150 rounded-full`}
            style={{ width: `${hasAnswered ? 100 : remainingPercent}%` }}
          />
        </div>

        {remainingSeconds === 0 && !hasAnswered && !revealAnswer && (
          <p className="text-xs font-bold text-rose-600 dark:text-rose-300 text-center">
            {copy.timesUp}
          </p>
        )}

        {question.imageUrl && (
          <div className="pt-1">
            <img
              src={question.imageUrl}
              alt=""
              className="w-full max-h-52 object-contain rounded-2xl mx-auto bg-amber-50/50 dark:bg-slate-800 border border-amber-100 dark:border-slate-700"
            />
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white text-center leading-snug pt-1">
          {question.question[lang]}
        </h2>
      </div>

      {/* Answer Buttons Grid */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((optionText, idx) => {
            const palette = OPTION_STYLES[idx % OPTION_STYLES.length];
            const isSelected = effectiveSelectedAnswer === idx;
            const isCorrect = idx === question.correctIndex;

            let cardClasses = `${palette.base} border-b-4 shadow-md`;

            if (revealAnswer) {
              if (isCorrect) {
                cardClasses =
                  'bg-emerald-500 border-b-4 border-emerald-700 text-white ring-4 ring-emerald-300 shadow-xl scale-[1.01]';
              } else if (isSelected) {
                cardClasses =
                  'bg-rose-600 border-b-4 border-rose-800 text-white ring-4 ring-rose-300 opacity-90';
              } else {
                cardClasses =
                  'bg-slate-200 dark:bg-slate-800/60 border-b-4 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-60';
              }
            } else if (hasAnswered) {
              if (isSelected) {
                cardClasses = `${palette.base} border-b-4 ring-4 ring-emerald-400 border-emerald-600 shadow-2xl scale-[1.02]`;
              } else {
                cardClasses = `${palette.base} border-b-4 opacity-40 saturate-50`;
              }
            } else if (!isPaused) {
              cardClasses += ' active:translate-y-0.5 active:scale-[0.98]';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isButtonsDisabled}
                onClick={() => handleSelect(idx)}
                className={`w-full min-h-[76px] p-4 rounded-2xl flex items-center justify-between gap-3 text-start font-bold text-lg transition-all duration-200 touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 ${cardClasses}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-base ${
                      revealAnswer && !isCorrect && !isSelected
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        : palette.badge
                    }`}
                  >
                    {palette.symbol}
                  </span>
                  <span className="leading-snug break-words">{optionText}</span>
                </div>

                {revealAnswer && isCorrect && (
                  <CheckCircle2 className="w-7 h-7 shrink-0 text-white" />
                )}
                {revealAnswer && isSelected && !isCorrect && (
                  <XCircle className="w-7 h-7 shrink-0 text-white" />
                )}
                {!revealAnswer && isSelected && (
                  <span className="px-2.5 py-1 rounded-full bg-white dark:bg-white text-emerald-800 dark:text-emerald-900 text-xs font-black shadow-md flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('yourSelectedAnswer')}</span>
                  </span>
                )}
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

      {/* Locked-in Waiting Banner */}
      {hasAnswered && !revealAnswer && (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-emerald-300 dark:border-emerald-500/60 p-4 sm:p-5 text-center space-y-3 shadow-md">
          <div className="flex items-center justify-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="font-black text-emerald-900 dark:text-emerald-300 text-base sm:text-lg">
              {t('triviaAnswerSubmittedTitle')}
            </span>
          </div>

          {effectiveSelectedAnswer !== undefined && options[effectiveSelectedAnswer] && (
            <div className="max-w-md mx-auto rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-slate-700 p-3 shadow-sm flex items-center gap-3 text-start">
              <span
                className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm ${
                  OPTION_STYLES[effectiveSelectedAnswer % OPTION_STYLES.length].badge
                }`}
              >
                {OPTION_STYLES[effectiveSelectedAnswer % OPTION_STYLES.length].symbol}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  {t('yourSelectedAnswer')}
                </p>
                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                  {options[effectiveSelectedAnswer]}
                </p>
              </div>
            </div>
          )}

          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
            {t('triviaWaitingReveal')}
          </p>
        </div>
      )}

      {/* Reveal Result & Fun Fact */}
      {revealAnswer && (
        <div
          className={`rounded-3xl border-2 p-4 sm:p-5 shadow-lg space-y-2.5 ${
            effectiveSelectedAnswer === question.correctIndex
              ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-500/60'
              : 'bg-amber-50 dark:bg-slate-800/95 border-amber-300 dark:border-amber-500/60'
          }`}
        >
          <div className="flex items-center gap-2 font-extrabold text-lg">
            {effectiveSelectedAnswer === question.correctIndex ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-emerald-800 dark:text-emerald-200">{copy.greatJob}</span>
              </>
            ) : effectiveSelectedAnswer !== undefined ? (
              <>
                <XCircle className="w-6 h-6 text-rose-500 dark:text-rose-400 shrink-0" />
                <span className="text-rose-800 dark:text-rose-200">{copy.niceTry}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-300 shrink-0" />
                <span className="text-amber-900 dark:text-amber-200">{copy.correctAnswer}</span>
              </>
            )}
          </div>

          {question.funFact?.[lang] && (
            <div className="flex items-start gap-2.5 pt-2 border-t border-amber-200/80 dark:border-slate-700">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  {t('triviaFunFact')}
                </p>
                <p className="text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                  {question.funFact[lang]}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
