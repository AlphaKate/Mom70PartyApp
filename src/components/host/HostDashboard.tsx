import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FolderOpen,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Medal,
  Music,
  PartyPopper,
  Pause,
  Play,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
  X,
  XCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AvatarDisplay } from '../common/AvatarDisplay';
import { useSettings } from '../../context/SettingsContext';
import { TranslationKey } from '../../i18n/translations';
import {
  DEFAULT_GAME_CONTENT,
  getDriveImageEndpoints,
  loadContentFromGoogleDrive,
  resolveDrivePhotos,
  soundEffects,
} from '../../services/contentService';
import { HostConnectionStatus, HostP2PManager } from '../../services/p2pService';
import { GamePhase, GameState, Language, P2PMessage, Player } from '../../types/game';
import { AccessibilityBar } from '../common/AccessibilityBar';
import { SpotifyPlayer } from '../common/SpotifyPlayer';
import { HostMosaic70 } from '../games';

export interface HostDashboardProps {
  initialRoomCode?: string;
  compact?: boolean;
  onBackHome?: () => void;
}

const STAGE_SEQUENCE: GamePhase[] = [
  'LOBBY',
  'MEMORY',
  'PUZZLE',
  'TRIVIA',
  'QUOTES',
  'WISHES',
  'FINALE',
];

const PHASE_LABEL_KEYS: Record<GamePhase, TranslationKey> = {
  SETUP: 'phaseSetup',
  LOBBY: 'phaseLobby',
  MEMORY: 'phaseMemory',
  PUZZLE: 'phasePuzzle',
  TRIVIA: 'phaseTrivia',
  QUOTES: 'phaseQuotes',
  WISHES: 'phaseWishes',
  FINALE: 'phaseFinale',
};

const BOT_AVATARS = [
  'fairy_nap',
  'hero_wonder_savta',
  'animal_cat_boss',
  'ussr_mishka_80',
  'fairy_espresso',
  'hero_borscht',
  'animal_doge_party',
  'ussr_gena_accordion',
  'fairy_carb',
  'hero_laundry',
  'animal_fox_schemer',
  'ussr_babushka_pin',
  'fairy_told_you',
  'hero_couch',
  'animal_cake_bear',
  'ussr_wolf_pogodi',
  'fairy_cash',
  'hero_hug',
  'animal_lazy_panda',
  'ussr_cheburashka',
  'fairy_cleaner',
  'hero_uber',
  'animal_drama_llama',
  'ussr_cosmonaut',
];

const BOT_WISHES: Record<Language, string[]> = {
  he: [
    'אמא אהובה, מזל טוב לגיל 70! בריאות, שמחה ואהבה אינסופית ❤️',
    'תודה על החום, הצחוק והלב הענק שלך. עד 120! 🎂',
    'מלכת המשפחה שלנו — מאחלים לך עוד המון הרפתקאות ורגעים מתוקים 🌟',
    'אוהבים אותך הכי בעולם! חיבוקים מכולנו 💐',
  ],
  ru: [
    'Дорогая мама, с 70-летием! Здоровья, радости и тепла ❤️',
    'Спасибо за твою доброту и заботу! До 120 лет! 🎂',
    'Наша любимая королева праздника — пусть каждый день сияет 🌟',
    'Крепко обнимаем и очень любим! 💐',
  ],
  en: [
    'Happy 70th Mom! Wishing you endless health, joy, and love ❤️',
    'Thank you for every warm hug and sweet memory! To 120! 🎂',
    'To our shining queen — may this decade be the brightest yet 🌟',
    'Sending you all our love on your special 70th celebration! 💐',
  ],
};

const OPTION_BADGE_CLASSES = [
  'bg-rose-500 text-white',
  'bg-sky-500 text-white',
  'bg-amber-500 text-white',
  'bg-emerald-500 text-white',
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 2; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `70${suffix}`;
}

function normalizeRoomCode(code?: string): string {
  const cleaned = (code ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
  return cleaned || generateRoomCode();
}

function firePartyConfetti(): void {
  try {
    confetti({
      particleCount: 95,
      spread: 80,
      origin: { y: 0.6 },
    });
    window.setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.7 },
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.7 },
      });
    }, 260);
  } catch {
    // Ignore confetti errors in headless/non-canvas environments
  }
}

const DriveImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const endpoints = useMemo(() => getDriveImageEndpoints(src), [src]);
  const [endpointIdx, setEndpointIdx] = useState(0);

  useEffect(() => {
    setEndpointIdx(0);
  }, [src]);

  const activeSrc = endpoints[endpointIdx] ?? src;
  return (
    <img
      src={activeSrc}
      referrerPolicy="no-referrer"
      alt={alt}
      onError={() => {
        if (endpointIdx < endpoints.length - 1) {
          setEndpointIdx((prev) => prev + 1);
        }
      }}
      className={className}
    />
  );
};

export const HostDashboard: React.FC<HostDashboardProps> = ({
  initialRoomCode,
  compact = false,
  onBackHome,
}) => {
  const { lang, dir, isMuted, t } = useSettings();

  const [gameState, setGameState] = useState<GameState>(() => ({
    roomCode: normalizeRoomCode(initialRoomCode),
    phase: 'SETUP',
    isPaused: false,
    currentQuestionIndex: 0,
    revealAnswer: false,
    roundStartTime: Date.now(),
    players: {},
    wishes: [],
    content: DEFAULT_GAME_CONTENT,
  }));

  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [sheetsUrlInput, setSheetsUrlInput] = useState('');
  const [spotifyUrlInput, setSpotifyUrlInput] = useState('');
  const [customMomName, setCustomMomName] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isPreviewingDrive, setIsPreviewingDrive] = useState(false);
  const [previewDrivePhotos, setPreviewDrivePhotos] = useState<string[]>([]);
  const [drivePreviewChecked, setDrivePreviewChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<HostConnectionStatus>('connecting');
  const [copiedLink, setCopiedLink] = useState(false);
  const [botCounter, setBotCounter] = useState(0);

  const p2pRef = useRef<HostP2PManager | null>(null);
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;
  const langRef = useRef(lang);
  langRef.current = lang;
  const finaleTriggeredRef = useRef(false);

  const handleIncomingMessage = useCallback((msg: P2PMessage) => {
    setGameState((prev) => {
      if (msg.type === 'PLAYER_JOIN') {
        const { id, name, avatar } = msg.payload;
        const existing = prev.players[id];
        if (!existing) {
          soundEffects.playTick(isMutedRef.current);
        }
        const nextPlayer: Player = existing
          ? {
              ...existing,
              name: name || existing.name,
              avatar: avatar || existing.avatar,
              connected: true,
            }
          : {
              id,
              name,
              avatar,
              score: 0,
              progress: 0,
              completedCurrentGame: false,
              connected: true,
            };
        return {
          ...prev,
          players: {
            ...prev.players,
            [id]: nextPlayer,
          },
        };
      }

      if (msg.type === 'PLAYER_PROGRESS') {
        const { playerId, progress, scoreDelta, completed } = msg.payload;
        const existing = prev.players[playerId];
        if (!existing) return prev;

        if (completed && !existing.completedCurrentGame) {
          soundEffects.playSuccess(isMutedRef.current);
        }

        const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
        const safeDelta = Math.max(0, Math.round(scoreDelta));

        return {
          ...prev,
          players: {
            ...prev.players,
            [playerId]: {
              ...existing,
              progress: Math.max(existing.progress, clampedProgress),
              score: existing.score + safeDelta,
              completedCurrentGame: existing.completedCurrentGame || completed,
              connected: true,
            },
          },
        };
      }

      if (msg.type === 'PLAYER_ANSWER') {
        const { playerId, questionIndex, answerIndex, timeMs } = msg.payload;
        const existing = prev.players[playerId];
        if (!existing) return prev;
        if (questionIndex !== prev.currentQuestionIndex || prev.revealAnswer) return prev;
        if (existing.lastAnswerIndex !== undefined) return prev;

        const pool =
          prev.phase === 'QUOTES' ? prev.content.quoteQuestions : prev.content.triviaQuestions;
        const question = pool[prev.currentQuestionIndex];
        const isCorrect = question ? answerIndex === question.correctIndex : false;
        const speedBonus = isCorrect
          ? Math.max(0, Math.round((25000 - Math.min(25000, Math.max(0, timeMs))) / 250))
          : 0;
        const earnedPoints = isCorrect ? 100 + speedBonus : 0;

        soundEffects.playTick(isMutedRef.current);

        return {
          ...prev,
          players: {
            ...prev.players,
            [playerId]: {
              ...existing,
              score: existing.score + earnedPoints,
              lastAnswerIndex: answerIndex,
              lastAnswerCorrect: isCorrect,
              completedCurrentGame: true,
              progress: 100,
              connected: true,
            },
          },
        };
      }

      if (msg.type === 'PLAYER_WISH') {
        const wish = msg.payload;
        const cleanedText = wish.text.trim();
        if (!cleanedText) return prev;

        const existing = prev.players[wish.playerId];
        const alreadyWished = Boolean(existing?.wish);
        const filteredWishes = prev.wishes.filter((w) => w.playerId !== wish.playerId);
        const nextWishes = [
          ...filteredWishes,
          {
            ...wish,
            text: cleanedText,
          },
        ];

        soundEffects.playApplause(isMutedRef.current);

        return {
          ...prev,
          wishes: nextWishes,
          players: existing
            ? {
                ...prev.players,
                [wish.playerId]: {
                  ...existing,
                  wish: cleanedText,
                  score: existing.score + (alreadyWished ? 0 : 100),
                  progress: 100,
                  completedCurrentGame: true,
                  connected: true,
                },
              }
            : prev.players,
        };
      }

      return prev;
    });
  }, []);

  // Initialize HostP2PManager for this roomCode
  useEffect(() => {
    const manager = new HostP2PManager(
      gameState.roomCode,
      handleIncomingMessage,
      setConnectionStatus
    );
    p2pRef.current = manager;
    return () => {
      manager.destroy();
      if (p2pRef.current === manager) {
        p2pRef.current = null;
      }
    };
  }, [gameState.roomCode, handleIncomingMessage]);

  // Broadcast latest GameState whenever it changes
  useEffect(() => {
    p2pRef.current?.broadcast(gameState);
  }, [gameState]);

  // Trigger Finale celebration confetti & fanfare once upon entering FINALE
  useEffect(() => {
    if (gameState.phase === 'FINALE' && !finaleTriggeredRef.current) {
      finaleTriggeredRef.current = true;
      firePartyConfetti();
      soundEffects.playFanfare(isMutedRef.current);
    } else if (gameState.phase !== 'FINALE') {
      finaleTriggeredRef.current = false;
    }
  }, [gameState.phase]);

  // Demo Bot simulation so solo testing & Split-Screen Demo feel lively
  useEffect(() => {
    const activePhase = gameState.phase;
    if (
      gameState.isPaused ||
      (activePhase !== 'MEMORY' &&
        activePhase !== 'PUZZLE' &&
        activePhase !== 'TRIVIA' &&
        activePhase !== 'QUOTES' &&
        activePhase !== 'WISHES')
    ) {
      return;
    }

    const botIds = Object.keys(gameState.players).filter((id) => id.startsWith('bot-'));
    if (botIds.length === 0) return;

    const timer = window.setInterval(() => {
      setGameState((prev) => {
        if (prev.isPaused || prev.phase !== activePhase) return prev;

        const bots = Object.values(prev.players).filter((p) => p.id.startsWith('bot-'));
        if (bots.length === 0) return prev;

        if (prev.phase === 'MEMORY' || prev.phase === 'PUZZLE') {
          const incompleteBots = bots.filter((b) => !b.completedCurrentGame);
          if (incompleteBots.length === 0) return prev;
          const chosen = incompleteBots[Math.floor(Math.random() * incompleteBots.length)];
          const step = 20 + Math.floor(Math.random() * 20);
          const nextProgress = Math.min(100, chosen.progress + step);
          const completed = nextProgress >= 100;
          const scoreDelta = 40 + (completed ? 120 : 0);

          return {
            ...prev,
            players: {
              ...prev.players,
              [chosen.id]: {
                ...chosen,
                progress: nextProgress,
                score: chosen.score + scoreDelta,
                completedCurrentGame: completed,
              },
            },
          };
        }

        if ((prev.phase === 'TRIVIA' || prev.phase === 'QUOTES') && !prev.revealAnswer) {
          const unansweredBots = bots.filter((b) => b.lastAnswerIndex === undefined);
          if (unansweredBots.length === 0) return prev;
          const chosen = unansweredBots[Math.floor(Math.random() * unansweredBots.length)];
          const pool =
            prev.phase === 'QUOTES' ? prev.content.quoteQuestions : prev.content.triviaQuestions;
          const q = pool[prev.currentQuestionIndex];
          if (!q) return prev;

          const optionsCount = (q.options[langRef.current] ?? q.options.en ?? []).length || 4;
          const picksCorrect = Math.random() < 0.72;
          const answerIndex = picksCorrect
            ? q.correctIndex
            : Math.floor(Math.random() * optionsCount);
          const isCorrect = answerIndex === q.correctIndex;
          const bonus = isCorrect ? 100 + Math.floor(Math.random() * 75) : 0;

          return {
            ...prev,
            players: {
              ...prev.players,
              [chosen.id]: {
                ...chosen,
                score: chosen.score + bonus,
                lastAnswerIndex: answerIndex,
                lastAnswerCorrect: isCorrect,
                completedCurrentGame: true,
                progress: 100,
              },
            },
          };
        }

        if (prev.phase === 'WISHES') {
          const unWishedBots = bots.filter((b) => !b.wish);
          if (unWishedBots.length === 0) return prev;
          const chosen = unWishedBots[0];
          const samples = BOT_WISHES[langRef.current] ?? BOT_WISHES.en;
          const text = samples[Math.floor(Math.random() * samples.length)];
          const filteredWishes = prev.wishes.filter((w) => w.playerId !== chosen.id);

          return {
            ...prev,
            wishes: [
              ...filteredWishes,
              {
                playerId: chosen.id,
                playerName: chosen.name,
                avatar: chosen.avatar,
                text,
              },
            ],
            players: {
              ...prev.players,
              [chosen.id]: {
                ...chosen,
                wish: text,
                score: chosen.score + 100,
                progress: 100,
                completedCurrentGame: true,
              },
            },
          };
        }

        return prev;
      });
    }, 1800);

    return () => window.clearInterval(timer);
  }, [gameState.phase, gameState.isPaused, gameState.players]);

  const handlePreviewDrivePhotos = async () => {
    setIsPreviewingDrive(true);
    try {
      const photos = await resolveDrivePhotos(driveUrlInput);
      setPreviewDrivePhotos(photos);
      setDrivePreviewChecked(true);
      if (photos.length > 0) {
        soundEffects.playSuccess(isMuted);
      }
    } finally {
      setIsPreviewingDrive(false);
    }
  };

  const handleLocalFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filePromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            resolve('');
          }
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    });

    const base64List = (await Promise.all(filePromises)).filter(Boolean);
    if (base64List.length > 0) {
      setPreviewDrivePhotos((prev) => Array.from(new Set([...prev, ...base64List])));
      setDrivePreviewChecked(true);
      soundEffects.playSuccess(isMuted);
    }
    e.target.value = '';
  };

  const handleClearPhotos = () => {
    setPreviewDrivePhotos([]);
    setDriveUrlInput('');
    setDrivePreviewChecked(false);
  };

  const handleOpenLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingContent(true);
    try {
      const loaded = await loadContentFromGoogleDrive(
        driveUrlInput,
        sheetsUrlInput,
        spotifyUrlInput,
        previewDrivePhotos
      );
      const trimmedMom = customMomName.trim();
      const finalContent = trimmedMom
        ? {
            ...loaded,
            momName: {
              he: trimmedMom,
              ru: trimmedMom,
              en: trimmedMom,
            },
          }
        : loaded;

      soundEffects.playSuccess(isMuted);
      setGameState((prev) => ({
        ...prev,
        phase: 'LOBBY',
        isPaused: false,
        currentQuestionIndex: 0,
        revealAnswer: false,
        roundStartTime: Date.now(),
        content: finalContent,
      }));
    } finally {
      setIsLoadingContent(false);
    }
  };

  const jumpToPhase = (nextPhase: GamePhase) => {
    soundEffects.playFlip(isMuted);
    setGameState((prev) => {
      const resetPlayers: Record<string, Player> = {};
      for (const [id, p] of Object.entries(prev.players)) {
        resetPlayers[id] = {
          ...p,
          progress: 0,
          completedCurrentGame: false,
          lastAnswerIndex: undefined,
          lastAnswerCorrect: undefined,
        };
      }
      return {
        ...prev,
        phase: nextPhase,
        isPaused: false,
        currentQuestionIndex: 0,
        revealAnswer: false,
        roundStartTime: Date.now(),
        players: resetPlayers,
      };
    });
  };

  const handleNextStage = () => {
    const idx = STAGE_SEQUENCE.indexOf(gameState.phase);
    if (idx === -1) {
      jumpToPhase('LOBBY');
      return;
    }
    const nextIdx = Math.min(STAGE_SEQUENCE.length - 1, idx + 1);
    jumpToPhase(STAGE_SEQUENCE[nextIdx]);
  };

  const handleTogglePause = () => {
    soundEffects.playTick(isMuted);
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const handleQuestionStep = (delta: -1 | 1) => {
    soundEffects.playFlip(isMuted);
    setGameState((prev) => {
      const poolLength =
        prev.phase === 'QUOTES'
          ? prev.content.quoteQuestions.length
          : prev.phase === 'PUZZLE'
          ? prev.content.puzzles.length
          : prev.content.triviaQuestions.length;
      if (poolLength === 0) return prev;

      const nextIndex = Math.max(0, Math.min(poolLength - 1, prev.currentQuestionIndex + delta));
      const resetPlayers: Record<string, Player> = {};
      for (const [id, p] of Object.entries(prev.players)) {
        resetPlayers[id] = {
          ...p,
          progress: 0,
          completedCurrentGame: false,
          lastAnswerIndex: undefined,
          lastAnswerCorrect: undefined,
        };
      }

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        revealAnswer: false,
        roundStartTime: Date.now(),
        players: resetPlayers,
      };
    });
  };

  const handleToggleReveal = () => {
    const nextReveal = !gameState.revealAnswer;
    if (nextReveal) {
      soundEffects.playApplause(isMuted);
    } else {
      soundEffects.playTick(isMuted);
    }
    setGameState((prev) => ({
      ...prev,
      revealAnswer: !prev.revealAnswer,
    }));
  };

  const handleAddDemoBot = () => {
    const nextNum = botCounter + 1;
    setBotCounter(nextNum);
    const botId = `bot-${Date.now()}-${nextNum}`;
    const avatar = BOT_AVATARS[(nextNum - 1) % BOT_AVATARS.length];
    const name = `${t('demoBotPrefix')} ${nextNum}`;
    soundEffects.playTick(isMuted);

    setGameState((prev) => ({
      ...prev,
      players: {
        ...prev.players,
        [botId]: {
          id: botId,
          name,
          avatar,
          score: 0,
          progress: 0,
          completedCurrentGame: false,
          connected: true,
        },
      },
    }));
  };

  const joinUrl = useMemo(() => {
    if (typeof window === 'undefined') return `?room=${gameState.roomCode}&v=7.0`;
    return `${window.location.origin}${window.location.pathname}?room=${gameState.roomCode}&v=7.0`;
  }, [gameState.roomCode]);

  const handleCopyJoinLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  const playersList = useMemo(() => Object.values(gameState.players), [gameState.players]);
  const sortedLeaderboard = useMemo(
    () =>
      [...playersList].sort(
        (a, b) => b.score - a.score || b.progress - a.progress || a.name.localeCompare(b.name)
      ),
    [playersList]
  );

  const racePlayers = useMemo(
    () =>
      [...playersList].sort(
        (a, b) => b.progress - a.progress || b.score - a.score || a.name.localeCompare(b.name)
      ),
    [playersList]
  );

  const momNameDisplay = gameState.content.momName[lang] || gameState.content.momName.en;

  const activeQuestionPool =
    gameState.phase === 'QUOTES'
      ? gameState.content.quoteQuestions
      : gameState.content.triviaQuestions;
  const activeQuestion = activeQuestionPool[gameState.currentQuestionIndex];

  const activePuzzle =
    gameState.content.puzzles.length > 0
      ? gameState.content.puzzles[gameState.currentQuestionIndex % gameState.content.puzzles.length]
      : undefined;

  const answeredPlayersCount = useMemo(
    () => playersList.filter((p) => p.lastAnswerIndex !== undefined).length,
    [playersList]
  );

  const stageIndex = STAGE_SEQUENCE.indexOf(gameState.phase);
  const canGoNextStage = stageIndex >= 0 && stageIndex < STAGE_SEQUENCE.length - 1;

  return (
    <div dir={dir} className="w-full max-w-7xl mx-auto space-y-4">
      {/* Top Bar: Home, Room Status & Accessibility */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {onBackHome && (
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-white border border-rose-200 text-rose-700 font-bold text-sm shadow-sm transition-colors"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>{t('backToHome')}</span>
            </button>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-amber-200 shadow-sm text-xs sm:text-sm font-bold">
            {connectionStatus === 'ready' ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-800">{t('onlineMode')}</span>
              </>
            ) : connectionStatus === 'local-only' ? (
              <>
                <Wifi className="w-4 h-4 text-sky-600" aria-hidden="true" />
                <span className="text-sky-800">{t('localMode')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span className="text-amber-800">{t('connecting')}</span>
              </>
            )}
            <span className="text-slate-300">|</span>
            <span className="text-rose-700 font-black tracking-wider">
              #{gameState.roomCode}
            </span>
          </div>
        </div>

        <AccessibilityBar compact={compact} />
      </div>

      {/* SETUP PHASE */}
      {gameState.phase === 'SETUP' && (
        <div className="rounded-3xl bg-white/95 backdrop-blur border-2 border-rose-200 shadow-xl p-5 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs sm:text-sm font-extrabold shadow-sm">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                {t('birthdayBadge')}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-rose-900">
                {t('setupTitle')}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
                {t('setupSubtitle')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 font-extrabold text-sm shadow-sm transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-amber-600" aria-hidden="true" />
              <span>{t('openGuideBtn')}</span>
            </button>
          </div>

          <form onSubmit={handleOpenLobby} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mom's Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-extrabold text-slate-800">
                  {t('momNameLabel')}
                </label>
                <input
                  type="text"
                  value={customMomName}
                  onChange={(e) => setCustomMomName(e.target.value)}
                  placeholder={DEFAULT_GAME_CONTENT.momName[lang]}
                  className="w-full rounded-2xl border-2 border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 px-4 py-3 text-base bg-white outline-none transition-all"
                />
              </div>

              {/* Spotify Playlist */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                  <Music className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>{t('spotifyUrlLabel')}</span>
                </label>
                <input
                  type="url"
                  dir="ltr"
                  value={spotifyUrlInput}
                  onChange={(e) => setSpotifyUrlInput(e.target.value)}
                  placeholder={t('spotifyUrlPlaceholder')}
                  className="w-full rounded-2xl border-2 border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 px-4 py-3 text-base bg-white outline-none transition-all"
                />
                <p className="text-xs text-slate-500">{t('spotifyUrlHint')}</p>
              </div>
            </div>

            {/* Google Drive Folder or Photo Links */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                  <FolderOpen className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  <span>{t('driveFolderLabel')}</span>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleLocalFilesUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 font-extrabold text-xs sm:text-sm transition-colors"
                  >
                    <Upload className="w-4 h-4 text-purple-600" aria-hidden="true" />
                    <span>{t('uploadLocalPhotosBtn')}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!driveUrlInput.trim() || isPreviewingDrive}
                    onClick={handlePreviewDrivePhotos}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 disabled:opacity-45 border border-sky-300 text-sky-900 font-extrabold text-xs sm:text-sm transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-sky-600" aria-hidden="true" />
                    <span>
                      {isPreviewingDrive
                        ? t('previewingDrivePhotos')
                        : t('previewDrivePhotosBtn')}
                    </span>
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                dir="ltr"
                value={driveUrlInput}
                onChange={(e) => {
                  setDriveUrlInput(e.target.value);
                  if (drivePreviewChecked) {
                    setDrivePreviewChecked(false);
                  }
                }}
                placeholder={t('driveFolderPlaceholder')}
                className="w-full rounded-2xl border-2 border-sky-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 px-4 py-2.5 text-sm sm:text-base bg-white outline-none transition-all resize-y"
              />
              <p className="text-xs text-slate-500">{t('driveFolderHint')}</p>

              {previewDrivePhotos.length > 0 && (
                <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                      <span>{t('drivePhotosLoadedBadge', { count: previewDrivePhotos.length })}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearPhotos}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-0.5 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t('clearPhotosBtn')}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {previewDrivePhotos.slice(0, 12).map((photoUrl, idx) => (
                      <DriveImage
                        key={photoUrl}
                        src={photoUrl}
                        alt={`Drive #${idx + 1}`}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm bg-white"
                      />
                    ))}
                  </div>
                </div>
              )}

              {drivePreviewChecked && previewDrivePhotos.length === 0 && driveUrlInput.trim() && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-amber-900">
                  {t('drivePhotosNotFoundNote')}
                </div>
              )}
            </div>

            {/* Google Sheets Questions */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>{t('sheetsUrlLabel')}</span>
              </label>
              <input
                type="url"
                dir="ltr"
                value={sheetsUrlInput}
                onChange={(e) => setSheetsUrlInput(e.target.value)}
                placeholder={t('sheetsUrlPlaceholder')}
                className="w-full rounded-2xl border-2 border-amber-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 px-4 py-3 text-base bg-white outline-none transition-all"
              />
              <p className="text-xs text-slate-500">{t('sheetsUrlHint')}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{t('demoDataNote')}</span>
              </div>

              <button
                type="submit"
                disabled={isLoadingContent}
                className="w-full sm:w-auto min-w-[240px] min-h-[56px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-60 text-white font-black text-lg shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
              >
                <PartyPopper className="w-5 h-5" aria-hidden="true" />
                <span>{isLoadingContent ? t('loadingContent') : t('openLobbyBtn')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALWAYS-VISIBLE MANUAL HOST PACING CONTROLS (when past SETUP) */}
      {gameState.phase !== 'SETUP' && (
        <div className="rounded-2xl bg-white/95 backdrop-blur border-2 border-rose-200 shadow-md p-3 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs sm:text-sm font-black">
                {t('hostControlsTitle')}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs sm:text-sm font-extrabold">
                {t(PHASE_LABEL_KEYS[gameState.phase])}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                {playersList.length}
              </span>
            </div>

            {/* Pacing Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePause}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm border-2 transition-all ${
                  gameState.isPaused
                    ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white shadow'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                }`}
              >
                {gameState.isPaused ? (
                  <>
                    <Play className="w-4 h-4" aria-hidden="true" />
                    <span>{t('resumeGame')}</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" aria-hidden="true" />
                    <span>{t('pauseGame')}</span>
                  </>
                )}
              </button>

              {(gameState.phase === 'TRIVIA' || gameState.phase === 'QUOTES') && (
                <>
                  <button
                    type="button"
                    disabled={gameState.currentQuestionIndex <= 0}
                    onClick={() => handleQuestionStep(-1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-bold text-xs sm:text-sm transition-colors"
                  >
                    <SkipBack className="w-4 h-4" aria-hidden="true" />
                    <span>{t('prevQuestion')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleReveal}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-sm ${
                      gameState.revealAnswer
                        ? 'bg-slate-700 hover:bg-slate-800 text-white'
                        : 'bg-sky-500 hover:bg-sky-600 text-white'
                    }`}
                  >
                    {gameState.revealAnswer ? (
                      <>
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                        <span>{t('hideAnswer')}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        <span>{t('revealAnswer')}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={gameState.currentQuestionIndex >= activeQuestionPool.length - 1}
                    onClick={() => handleQuestionStep(1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-colors"
                  >
                    <span>{t('nextQuestion')}</span>
                    <SkipForward className="w-4 h-4" aria-hidden="true" />
                  </button>
                </>
              )}

              {gameState.phase === 'PUZZLE' && gameState.content.puzzles.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    handleQuestionStep(
                      gameState.currentQuestionIndex < gameState.content.puzzles.length - 1
                        ? 1
                        : -1
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                  <span>{t('puzzleNext')}</span>
                </button>
              )}

              {canGoNextStage && (
                <button
                  type="button"
                  onClick={handleNextStage}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow transition-all"
                >
                  <span>{t('nextStage')}</span>
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Stage Jumper Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-rose-100">
            <span className="text-xs font-extrabold text-slate-500 me-1">{t('jumpToStage')}</span>
            {STAGE_SEQUENCE.map((stage) => {
              const active = gameState.phase === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => jumpToPhase(stage)}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                    active
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {t(PHASE_LABEL_KEYS[stage])}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PAUSED BANNER */}
      {gameState.phase !== 'SETUP' && gameState.isPaused && (
        <div className="rounded-2xl bg-amber-100 border-2 border-amber-400 px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Pause className="w-6 h-6 text-amber-700 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-black text-amber-950">{t('pausedBannerTitle')}</p>
              <p className="text-sm text-amber-900">{t('pausedBannerDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTogglePause}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow shrink-0"
          >
            {t('resumeGame')}
          </button>
        </div>
      )}

      {/* LOBBY PHASE */}
      {gameState.phase === 'LOBBY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Room PIN & QR Code */}
          <div className="lg:col-span-5 rounded-3xl bg-white/95 backdrop-blur border-2 border-rose-200 shadow-xl p-6 text-center space-y-5">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                {momNameDisplay}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-rose-900">
                {t('lobbyTitle')}
              </h2>
              <p className="text-sm text-slate-600">{t('lobbySubtitle')}</p>
            </div>

            <div className="inline-block rounded-3xl bg-white p-4 border-4 border-amber-300 shadow-md">
              <QRCodeSVG
                value={joinUrl}
                size={compact ? 140 : 196}
                level="M"
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
              <p className="mt-2 text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                {t('scanQrLabel')}
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-200 p-4 space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
                {t('roomCodeLabel')}
              </p>
              <p
                dir="ltr"
                className="text-4xl sm:text-5xl font-black tracking-[0.22em] text-rose-900 select-all"
              >
                {gameState.roomCode}
              </p>
              <button
                type="button"
                onClick={handleCopyJoinLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-xs font-bold text-slate-700 shadow-sm transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span className="text-emerald-700">{t('joinLinkLabel')} ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                    <span>{t('joinLinkLabel')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Connected Players + Actions */}
          <div className="lg:col-span-7 rounded-3xl bg-white/95 backdrop-blur border-2 border-amber-200 shadow-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-rose-500" aria-hidden="true" />
                  <span>
                    {t('playersConnected')} ({playersList.length})
                  </span>
                </h3>

                <button
                  type="button"
                  onClick={handleAddDemoBot}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-extrabold text-sm transition-colors"
                >
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  <span>{t('addDemoBot')}</span>
                </button>
              </div>

              {playersList.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-10 text-center space-y-2">
                  <p className="text-4xl animate-float-gentle">🎈</p>
                  <p className="text-lg font-bold text-slate-600">{t('noPlayersYet')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {playersList.map((player) => (
                    <div
                      key={player.id}
                      className="rounded-2xl bg-gradient-to-br from-white to-rose-50/70 border-2 border-rose-200 p-3 flex items-center gap-2.5 shadow-sm"
                    >
                      <AvatarDisplay
                        avatar={player.avatar}
                        className="w-8 h-8 shrink-0 drop-shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 truncate">{player.name}</p>
                        <p className="text-[11px] font-bold text-emerald-600">
                          {player.id.startsWith('bot-') ? t('botSimulated') : t('connected')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => jumpToPhase('MEMORY')}
              className="w-full min-h-[60px] rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xl shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
              <Play className="w-6 h-6 fill-current" aria-hidden="true" />
              <span>{t('startGameBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* MEMORY & PUZZLE LIVE PROGRESS RACE */}
      {(gameState.phase === 'MEMORY' || gameState.phase === 'PUZZLE') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Progress Race Tracks */}
          <div className="lg:col-span-8 rounded-3xl bg-white/95 backdrop-blur border-2 border-rose-200 shadow-xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-rose-900">
                  {gameState.phase === 'MEMORY' ? t('memoryTitle') : t('puzzleTitle')}
                </h2>
                <p className="text-sm font-bold text-slate-600">{t('liveRace')}</p>
              </div>
              {gameState.phase === 'PUZZLE' && activePuzzle && (
                <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2 shadow-sm">
                  <DriveImage
                    src={activePuzzle.imageUrl}
                    alt={activePuzzle.title[lang] || activePuzzle.title.en}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-300 bg-white"
                  />
                  <span className="text-sm font-extrabold text-amber-900">
                    {activePuzzle.title[lang] || activePuzzle.title.en}
                  </span>
                </div>
              )}
            </div>

            {gameState.phase === 'MEMORY' && gameState.content.memoryPairs.length > 0 && (
              <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-3 space-y-2">
                <p className="text-xs font-extrabold text-rose-800">{t('activePhotosGallery')}</p>
                <div className="flex flex-wrap gap-2">
                  {gameState.content.memoryPairs.map((pair) => (
                    <DriveImage
                      key={pair.id}
                      src={pair.imageA}
                      alt={pair.labelA[lang] || pair.labelA.en}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-white shadow-sm bg-white"
                    />
                  ))}
                </div>
              </div>
            )}

            {gameState.phase === 'PUZZLE' && gameState.content.puzzles.length > 1 && (
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-3 space-y-2">
                <p className="text-xs font-extrabold text-amber-900">{t('activePhotosGallery')}</p>
                <div className="flex flex-wrap gap-2">
                  {gameState.content.puzzles.map((puz, idx) => (
                    <DriveImage
                      key={puz.id}
                      src={puz.imageUrl}
                      alt={puz.title[lang] || puz.title.en}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover bg-white transition-all ${
                        idx === gameState.currentQuestionIndex % gameState.content.puzzles.length
                          ? 'border-2 border-rose-500 ring-2 ring-rose-300 scale-105 shadow-md'
                          : 'border-2 border-white opacity-75'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {racePlayers.length === 0 ? (
              <p className="text-center py-8 text-slate-500 font-bold">{t('noPlayersYet')}</p>
            ) : (
              <div className="space-y-3">
                {racePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="rounded-2xl bg-rose-50/60 border border-rose-200 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <AvatarDisplay
                          avatar={player.avatar}
                          className="w-8 h-8 shrink-0 drop-shadow-sm"
                        />
                        <span className="font-extrabold text-slate-900 truncate">
                          {player.name}
                        </span>
                        {player.completedCurrentGame && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            {t('completedBadge')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black text-rose-700">
                          {player.progress}%
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">
                          {player.score} {t('scoreUnit')}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-4 rounded-full bg-white border border-rose-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          player.completedCurrentGame
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                            : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500'
                        }`}
                        style={{ width: `${Math.max(4, player.progress)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Overall Leaderboard */}
          <div className="lg:col-span-4 rounded-3xl bg-white/95 backdrop-blur border-2 border-amber-200 shadow-xl p-5 space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" aria-hidden="true" />
              <span>{t('liveLeaderboard')}</span>
            </h3>
            <div className="space-y-2">
              {sortedLeaderboard.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-2 rounded-2xl bg-amber-50/70 border border-amber-200 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <AvatarDisplay
                      avatar={player.avatar}
                      className="w-7 h-7 shrink-0 drop-shadow-sm"
                    />
                    <span className="font-extrabold text-slate-900 truncate">{player.name}</span>
                  </div>
                  <span className="font-black text-rose-700 text-sm shrink-0">
                    {player.score} {t('scoreUnit')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRIVIA & QUOTES TV SPECTATOR */}
      {(gameState.phase === 'TRIVIA' || gameState.phase === 'QUOTES') && activeQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Question Display on TV */}
          <div className="lg:col-span-8 rounded-3xl bg-white/95 backdrop-blur border-2 border-sky-200 shadow-xl p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-3.5 py-1 rounded-full bg-sky-100 text-sky-900 font-black text-sm">
                {gameState.phase === 'TRIVIA' ? t('triviaTitle') : t('quotesTitle')} —{' '}
                {t('triviaQuestionLabel')} {gameState.currentQuestionIndex + 1} {t('ofTotal')}{' '}
                {activeQuestionPool.length}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-sm">
                <Users className="w-4 h-4" aria-hidden="true" />
                {t('answeredCount')}: {answeredPlayersCount} {t('ofTotal')} {playersList.length}
              </span>
            </div>

            {activeQuestion.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-sky-200 max-h-60 flex justify-center bg-sky-50">
                <DriveImage
                  src={activeQuestion.imageUrl}
                  alt={activeQuestion.question[lang] || activeQuestion.question.en}
                  className="max-h-60 object-contain"
                />
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              {activeQuestion.question[lang] || activeQuestion.question.en}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(activeQuestion.options[lang] ?? activeQuestion.options.en ?? []).map(
                (optionText, idx) => {
                  const isCorrect = idx === activeQuestion.correctIndex;
                  const votesForOption = playersList.filter(
                    (p) => p.lastAnswerIndex === idx
                  ).length;

                  return (
                    <div
                      key={`${activeQuestion.id}-${idx}`}
                      className={`rounded-2xl border-2 p-4 flex items-center justify-between gap-3 transition-all ${
                        gameState.revealAnswer
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                            : 'bg-slate-50 border-slate-200 opacity-65'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-9 h-9 rounded-xl font-black flex items-center justify-center shrink-0 ${
                            OPTION_BADGE_CLASSES[idx % OPTION_BADGE_CLASSES.length]
                          }`}
                        >
                          {OPTION_LETTERS[idx] ?? idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 text-base sm:text-lg">
                          {optionText}
                        </span>
                      </div>

                      {gameState.revealAnswer && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-xs font-extrabold text-slate-700">
                            {votesForOption}
                          </span>
                          {isCorrect && (
                            <CheckCircle2
                              className="w-6 h-6 text-emerald-600"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            {gameState.revealAnswer &&
              (activeQuestion.funFact?.[lang] ||
                activeQuestion.funFact?.en ||
                activeQuestion.funFact?.he ||
                activeQuestion.funFact?.ru) && (
                <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border-2 border-amber-300 p-4 space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                    {gameState.phase === 'QUOTES' ? t('quotesFunFact') : t('triviaFunFact')}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-800">
                    {activeQuestion.funFact?.[lang] ||
                      activeQuestion.funFact?.en ||
                      activeQuestion.funFact?.he ||
                      activeQuestion.funFact?.ru}
                  </p>
                </div>
              )}

            {!gameState.revealAnswer && playersList.length > 0 && answeredPlayersCount === 0 && (
              <p className="text-sm font-bold text-slate-500 text-center">
                {t('waitingForAnswers')}
              </p>
            )}
          </div>

          {/* Live Individual Leaderboard */}
          <div className="lg:col-span-4 rounded-3xl bg-white/95 backdrop-blur border-2 border-amber-200 shadow-xl p-5 space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" aria-hidden="true" />
              <span>{t('liveLeaderboard')}</span>
            </h3>

            {sortedLeaderboard.length === 0 ? (
              <p className="text-sm font-bold text-slate-500">{t('noPlayersYet')}</p>
            ) : (
              <div className="space-y-2">
                {sortedLeaderboard.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-amber-50/70 border border-amber-200 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <AvatarDisplay
                      avatar={player.avatar}
                      className="w-7 h-7 shrink-0 drop-shadow-sm"
                    />
                      <span className="font-extrabold text-slate-900 truncate">
                        {player.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {gameState.revealAnswer && player.lastAnswerIndex !== undefined && (
                        player.lastAnswerCorrect ? (
                          <CheckCircle2
                            className="w-4 h-4 text-emerald-600"
                            aria-label={t('correctBadge')}
                          />
                        ) : (
                          <XCircle
                            className="w-4 h-4 text-rose-500"
                            aria-label={t('wrongBadge')}
                          />
                        )
                      )}
                      {!gameState.revealAnswer && player.lastAnswerIndex !== undefined && (
                        <Check className="w-4 h-4 text-sky-600" aria-hidden="true" />
                      )}
                      <span className="font-black text-rose-700 text-sm">
                        {player.score} {t('scoreUnit')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WISHES PHASE */}
      {gameState.phase === 'WISHES' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-rose-900">{t('wishesTitle')}</h2>
              <p className="text-sm text-slate-600">{t('wishesSubtitle')}</p>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-rose-900 font-black text-sm">
              {gameState.wishes.length} {t('wishesCount')}
            </span>
          </div>

          <HostMosaic70 wishes={gameState.wishes} momName={momNameDisplay} />
        </div>
      )}

      {/* FINALE PHASE: WINNER PODIUM + CONFETTI + 70 MOSAIC */}
      {gameState.phase === 'FINALE' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 text-white p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-black">
              <Crown className="w-4 h-4" aria-hidden="true" />
              <span>{t('happy70Banner')}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black">{t('finaleTitle')}</h2>
            <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
              {t('finaleSubtitle')}
            </p>
            <button
              type="button"
              onClick={() => {
                firePartyConfetti();
                soundEffects.playFanfare(isMuted);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-rose-700 hover:bg-amber-50 font-black text-base shadow-lg transition-transform active:scale-95"
            >
              <PartyPopper className="w-5 h-5" aria-hidden="true" />
              <span>{t('celebrateBtn')}</span>
            </button>
          </div>

          {/* 1st / 2nd / 3rd Winner Podium */}
          <div className="rounded-3xl bg-white/95 backdrop-blur border-2 border-amber-300 shadow-xl p-6 space-y-6">
            <h3 className="text-2xl font-black text-center text-slate-900 flex items-center justify-center gap-2">
              <Trophy className="w-7 h-7 text-amber-500" aria-hidden="true" />
              <span>{t('podiumTitle')}</span>
            </h3>

            {sortedLeaderboard.length === 0 ? (
              <p className="text-center text-slate-500 font-bold">{t('noPlayersYet')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
                {/* 2nd Place */}
                <div className="order-2 sm:order-1">
                  {sortedLeaderboard[1] && (
                    <div className="rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 p-5 text-center space-y-2 shadow-md sm:min-h-[210px] flex flex-col justify-center">
                      <Medal className="w-8 h-8 text-slate-500 mx-auto" aria-hidden="true" />
                      <span className="text-xs font-black uppercase text-slate-600">
                        {t('place2')}
                      </span>
                      <div className="flex justify-center py-1">
                        <AvatarDisplay avatar={sortedLeaderboard[1].avatar} className="w-16 h-16 drop-shadow-md" />
                      </div>
                      <p className="text-lg font-black text-slate-900 truncate">
                        {sortedLeaderboard[1].name}
                      </p>
                      <p className="text-base font-extrabold text-rose-700">
                        {sortedLeaderboard[1].score} {t('scoreUnit')}
                      </p>
                    </div>
                  )}
                </div>

                {/* 1st Place */}
                <div className="order-1 sm:order-2">
                  {sortedLeaderboard[0] && (
                    <div className="rounded-3xl bg-gradient-to-b from-amber-200 via-yellow-100 to-amber-300 border-4 border-amber-400 p-6 text-center space-y-2 shadow-xl sm:min-h-[250px] flex flex-col justify-center">
                      <Crown className="w-10 h-10 text-amber-700 mx-auto animate-bounce-slow" aria-hidden="true" />
                      <span className="text-sm font-black uppercase text-amber-900">
                        {t('place1')}
                      </span>
                      <div className="flex justify-center py-1">
                        <AvatarDisplay avatar={sortedLeaderboard[0].avatar} className="w-20 h-20 drop-shadow-xl" />
                      </div>
                      <p className="text-2xl font-black text-slate-900 truncate">
                        {sortedLeaderboard[0].name}
                      </p>
                      <p className="text-lg font-black text-rose-700">
                        {sortedLeaderboard[0].score} {t('scoreUnit')}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3rd Place */}
                <div className="order-3">
                  {sortedLeaderboard[2] && (
                    <div className="rounded-3xl bg-gradient-to-b from-orange-100 to-amber-100 border-2 border-orange-300 p-5 text-center space-y-2 shadow-md sm:min-h-[185px] flex flex-col justify-center">
                      <Award className="w-8 h-8 text-orange-600 mx-auto" aria-hidden="true" />
                      <span className="text-xs font-black uppercase text-orange-800">
                        {t('place3')}
                      </span>
                      <div className="flex justify-center py-1">
                        <AvatarDisplay avatar={sortedLeaderboard[2].avatar} className="w-14 h-14 drop-shadow-md" />
                      </div>
                      <p className="text-lg font-black text-slate-900 truncate">
                        {sortedLeaderboard[2].name}
                      </p>
                      <p className="text-base font-extrabold text-rose-700">
                        {sortedLeaderboard[2].score} {t('scoreUnit')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Standings */}
            {sortedLeaderboard.length > 0 && (
              <div className="pt-4 border-t border-amber-200 space-y-3">
                <h4 className="text-base font-black text-slate-800">{t('allParticipants')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {sortedLeaderboard.map((player, idx) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between gap-2 rounded-2xl bg-amber-50/70 border border-amber-200 px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <AvatarDisplay avatar={player.avatar} className="w-7 h-7 shrink-0" />
                        <span className="font-bold text-slate-900 truncate">{player.name}</span>
                      </div>
                      <span className="font-black text-rose-700 text-sm shrink-0">
                        {player.score} {t('scoreUnit')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <HostMosaic70 wishes={gameState.wishes} momName={momNameDisplay} />
        </div>
      )}

      {/* SPOTIFY EMBED PLAYER (keeps playing across LOBBY -> FINALE) */}
      {gameState.phase !== 'SETUP' && (
        <SpotifyPlayer
          spotifyUrl={gameState.content.spotifyUrl}
          defaultExpanded={gameState.phase === 'LOBBY'}
        />
      )}

      {/* DRIVE & SHEETS GUIDE MODAL */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('guideTitle')}
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white border-2 border-rose-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-rose-900">{t('guideTitle')}</h2>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                aria-label={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 space-y-1">
                <p className="font-black text-sky-950">{t('guideStep1Title')}</p>
                <p className="text-sm text-sky-900">{t('guideStep1Desc')}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-1">
                <p className="font-black text-emerald-950">{t('guideStep2Title')}</p>
                <p className="text-sm text-emerald-900">{t('guideStep2Desc')}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-1">
                <p className="font-black text-amber-950">{t('guideStep3Title')}</p>
                <p className="text-sm text-amber-900">{t('guideStep3Desc')}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 space-y-1">
                <p className="font-black text-rose-950">{t('guideStep4Title')}</p>
                <p className="text-sm text-rose-900">{t('guideStep4Desc')}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-100 border border-slate-200 p-3.5 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{t('guidePrivacyNote')}</span>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
