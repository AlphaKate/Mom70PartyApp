import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  Pause,
  Quote,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Language, TriviaQuestion } from '../../types/game';
import { useSettings } from '../../context/SettingsContext';
import { soundEffects } from '../../services/contentService';

interface QuotesGameProps {
  question: TriviaQuestion;
  questionIndex: number;
  totalQuestions: number;
  isPaused: boolean;
  revealAnswer: boolean;
  selectedAnswer?: number;
  onAnswer: (answerIndex: number, timeMs: number) => void;
}

const QUESTION_DURATION_MS = 25000;

const COPY: Record<
  Language,
  {
    scenario: string;
    nailedIt: string;
    notQuite: string;
    momClassic: string;
    secondsLeft: string;
  }
> = {
  he: {
    scenario: 'סיטואציה',
    nailedIt: 'בול! אתם מכירים את אמא בעל פה!',
    notQuite: 'חחח כמעט! אבל הנה מה שאמא הייתה אומרת:',
    momClassic: 'משפט של אמא!',
    secondsLeft: 'שנ׳',
  },
  ru: {
    scenario: 'Ситуация',
    nailedIt: 'В точку! Вы знаете маму идеально!',
    notQuite: 'Почти угадали! А вот что сказала бы мама:',
    momClassic: 'Фирменная фраза мамы!',
    secondsLeft: 'с',
  },
  en: {
    scenario: 'Scenario',
    nailedIt: 'Spot on! You know Mom by heart!',
    notQuite: 'Close! Here is what Mom would really say:',
    momClassic: "Mom's Classic Quote!",
    secondsLeft: 's',
  },
};

const QUOTE_CARD_THEMES = [
  'border-fuchsia-300 bg-fuchsia-50/90 hover:bg-fuchsia-100 text-fuchsia-950',
  'border-violet-300 bg-violet-50/90 hover:bg-violet-100 text-violet-950',
  'border-rose-300 bg-rose-50/90 hover:bg-rose-100 text-rose-950',
  'border-amber-300 bg-amber-50/90 hover:bg-amber-100 text-amber-950',
];

export const QuotesGame: React.FC<QuotesGameProps> = ({
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
  const elapsedRef = useRef(0);
  const lastTickTimestampRef = useRef<number | null>(null);
  const lastSoundSecondRef = useRef<number | null>(null);
  const revealedKeyRef = useRef<string | null>(null);

  const questionKey = `${question.id}::${questionIndex}`;

  useEffect(() => {
    elapsedRef.current = 0;
    lastTickTimestampRef.current = Date.now();
    lastSoundSecondRef.current = null;
    revealedKeyRef.current = null;
    setElapsedMs(0);
  }, [questionKey]);

  const hasAnswered = selectedAnswer !== undefined;
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

  useEffect(() => {
    if (revealAnswer && revealedKeyRef.current !== questionKey) {
      revealedKeyRef.current = questionKey;
      if (selectedAnswer !== undefined && selectedAnswer === question.correctIndex) {
        soundEffects.playSuccess(isMuted);
      }
    }
  }, [revealAnswer, questionKey, selectedAnswer, question.correctIndex, isMuted]);

  const remainingMs = Math.max(0, QUESTION_DURATION_MS - elapsedMs);
  const remainingPercent = Math.max(
    0,
    Math.min(100, (remainingMs / QUESTION_DURATION_MS) * 100)
  );
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  const options = question.options[lang] ?? question.options.en ?? [];
  const isButtonsDisabled = isPaused || revealAnswer || hasAnswered;

  const handleSelect = (idx: number) => {
    if (isButtonsDisabled) return;
    soundEffects.playFlip(isMuted);
    onAnswer(idx, Math.max(250, Math.round(elapsedRef.current)));
  };

  return (
    <div dir={dir} className="relative w-full max-w-2xl mx-auto select-none space-y-5">
      {/* Speech Bubble Scenario Card */}
      <div className="relative">
        <div className="rounded-3xl bg-gradient-to-br from-rose-50 via-white to-fuchsia-50 border-2 border-fuchsia-300 p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-fuchsia-600 text-white font-extrabold text-sm shadow-sm">
              <MessageCircle className="w-4 h-4" />
              {t('quotesTitle')}
            </span>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-fuchsia-100 text-fuchsia-900 font-bold text-sm">
                {copy.scenario} {questionIndex + 1} {t('ofTotal')}{' '}
                {Math.max(1, totalQuestions)}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-sm ${
                  remainingSeconds <= 5 && !hasAnswered && !revealAnswer
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {remainingSeconds}
                {copy.secondsLeft}
              </span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-fuchsia-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fuchsia-500 via-rose-400 to-amber-400 transition-all duration-150 rounded-full"
              style={{ width: `${remainingPercent}%` }}
            />
          </div>

          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt=""
              className="w-full max-h-44 object-contain rounded-2xl mx-auto bg-white/80 border border-fuchsia-100"
            />
          )}

          <div className="relative py-2 px-3 sm:px-6 text-center">
            <Quote className="w-7 h-7 text-fuchsia-300 mx-auto mb-1 opacity-80" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
              {question.question[lang]}
            </h2>
          </div>
        </div>

        {/* Speech Bubble Pointer Tail */}
        <div className="flex justify-center -mt-1">
          <div className="w-6 h-6 bg-white border-r-2 border-b-2 border-fuchsia-300 rotate-45 shadow-sm" />
        </div>
      </div>

      {/* Quote Option Cards */}
      <div className="relative space-y-3">
        {options.map((quoteText, idx) => {
          const baseTheme = QUOTE_CARD_THEMES[idx % QUOTE_CARD_THEMES.length];
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === question.correctIndex;

          let cardClass = `${baseTheme} border-2 shadow-md`;

          if (revealAnswer) {
            if (isCorrect) {
              cardClass =
                'bg-emerald-500 border-2 border-emerald-700 text-white ring-4 ring-emerald-300 shadow-xl scale-[1.01]';
            } else if (isSelected) {
              cardClass =
                'bg-rose-500 border-2 border-rose-700 text-white ring-4 ring-rose-300 opacity-90';
            } else {
              cardClass =
                'bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-55';
            }
          } else if (hasAnswered) {
            if (isSelected) {
              cardClass =
                'bg-fuchsia-600 border-2 border-fuchsia-800 text-white ring-4 ring-fuchsia-300 shadow-xl scale-[1.01]';
            } else {
              cardClass = `${baseTheme} border-2 opacity-45`;
            }
          } else if (!isPaused) {
            cardClass += ' active:scale-[0.98]';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isButtonsDisabled}
              onClick={() => handleSelect(idx)}
              className={`w-full min-h-[72px] px-5 py-4 rounded-2xl flex items-center justify-between gap-3 text-start transition-all duration-200 touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 ${cardClass}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`mt-0.5 w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-black text-sm ${
                    revealAnswer && isCorrect
                      ? 'bg-white text-emerald-600'
                      : revealAnswer && isSelected && !isCorrect
                      ? 'bg-white text-rose-600'
                      : !revealAnswer && isSelected
                      ? 'bg-white text-fuchsia-700'
                      : 'bg-white/90 text-fuchsia-700 shadow-sm'
                  }`}
                >
                  “”
                </span>
                <span className="text-lg font-bold leading-snug break-words">
                  “{quoteText}”
                </span>
              </div>

              {revealAnswer && isCorrect && (
                <div className="flex items-center gap-1.5 shrink-0 bg-white/20 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="hidden sm:inline text-xs font-extrabold">
                    {copy.momClassic}
                  </span>
                </div>
              )}
              {revealAnswer && isSelected && !isCorrect && (
                <XCircle className="w-6 h-6 shrink-0" />
              )}
              {!revealAnswer && isSelected && (
                <CheckCircle2 className="w-6 h-6 shrink-0" />
              )}
            </button>
          );
        })}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-20 rounded-3xl bg-slate-900/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <Pause className="w-14 h-14 text-amber-300 mb-3 animate-pulse" />
            <h3 className="text-2xl font-extrabold mb-1">{t('pausedBannerTitle')}</h3>
            <p className="text-base text-slate-200 max-w-sm">{t('pausedBannerDesc')}</p>
          </div>
        )}
      </div>

      {/* Waiting Banner */}
      {hasAnswered && !revealAnswer && (
        <div className="rounded-2xl bg-fuchsia-50 border-2 border-fuchsia-200 p-4 text-center space-y-1">
          <p className="font-extrabold text-fuchsia-900 text-base flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-500" />
            {t('quotesAnswerLocked')}
          </p>
          <p className="text-sm text-fuchsia-700">{t('quotesWaitingReveal')}</p>
        </div>
      )}

      {/* Reveal Result & Family Story */}
      {revealAnswer && (
        <div
          className={`rounded-3xl border-2 p-5 shadow-lg space-y-2.5 ${
            selectedAnswer === question.correctIndex
              ? 'bg-emerald-50 border-emerald-300'
              : 'bg-rose-50 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-extrabold text-lg">
            {selectedAnswer === question.correctIndex ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span className="text-emerald-800">{copy.nailedIt}</span>
              </>
            ) : selectedAnswer !== undefined ? (
              <>
                <Heart className="w-6 h-6 text-rose-500 shrink-0" />
                <span className="text-rose-800">{copy.notQuite}</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-6 h-6 text-fuchsia-600 shrink-0" />
                <span className="text-fuchsia-900">{t('quotesMomSays')}</span>
              </>
            )}
          </div>

          {question.funFact?.[lang] && (
            <div className="pt-2 border-t border-rose-200/70">
              <p className="text-xs font-extrabold uppercase tracking-wider text-fuchsia-700 mb-0.5">
                {t('quotesFunFact')}
              </p>
              <p className="text-base font-medium text-slate-800 leading-relaxed">
                {question.funFact[lang]}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
