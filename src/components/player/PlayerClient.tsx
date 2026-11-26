import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Crown,
  Heart,
  Home,
  Medal,
  Pause,
  Sparkles,
  Trophy,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { soundEffects } from '../../services/contentService';
import { PlayerConnectionStatus, PlayerP2PClient } from '../../services/p2pService';
import { GameState, Player, WishItem } from '../../types/game';
import { AccessibilityBar } from '../common/AccessibilityBar';
import { AvatarDisplay } from '../common/AvatarDisplay';
import {
  AVATAR_CATEGORIES,
  AvatarCategoryKey,
  DEFAULT_AVATAR,
  getAvatarDisplayName,
} from '../../constants/avatars';
import {
  MemoryGame,
  PlayerWishInput,
  PuzzleGame,
  QuotesGame,
  TriviaGame,
  WishSubmissionPayload,
} from '../games';
import { addPlayerWish, MAX_PLAYER_NAME_LENGTH, validatePlayerName } from '../../services/gameLogic';

function getSessionStorageKey(compact: boolean): string {
  return compact ? 'mom70_player_session_demo' : 'mom70_player_session';
}

interface SavedPlayerSession {
  id: string;
  name: string;
  avatar: string;
  roomCode: string;
}

function readSavedSession(storageKey: string): SavedPlayerSession | null {
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.id === 'string' &&
      typeof parsed.name === 'string' &&
      typeof parsed.roomCode === 'string'
    ) {
      return parsed;
    }
  } catch {}
  return null;
}

export interface PlayerClientProps {
  initialRoomCode?: string;
  compact?: boolean;
  onBackHome?: () => void;
}

function readRoomFromUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = new URLSearchParams(window.location.search).get('room') ?? '';
    return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  } catch {
    return '';
  }
}

export const PlayerClient: React.FC<PlayerClientProps> = ({
  initialRoomCode,
  compact = false,
  onBackHome,
}) => {
  const { lang, dir, isMuted, t } = useSettings();
  const sessionKey = getSessionStorageKey(compact);

  const [savedSession] = useState<SavedPlayerSession | null>(() => readSavedSession(sessionKey));
  const explicitRoom = (initialRoomCode || readRoomFromUrl())
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
  const canRestoreSession = Boolean(
    savedSession?.name &&
      savedSession?.roomCode &&
      (!explicitRoom || savedSession.roomCode === explicitRoom)
  );

  const [playerId] = useState(
    () =>
      (canRestoreSession ? savedSession?.id : undefined) ||
      `player-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  );
  const [roomCode, setRoomCode] = useState<string>(() => {
    const seeded = (explicitRoom || savedSession?.roomCode || '').trim().toUpperCase();
    return seeded.replace(/[^A-Z0-9_-]/g, '');
  });
  const [nickname, setNickname] = useState(() => savedSession?.name || '');
  const [avatarCategory, setAvatarCategory] = useState<AvatarCategoryKey>('fairies');
  const [avatar, setAvatar] = useState(() => savedSession?.avatar || DEFAULT_AVATAR);
  const [isChangingLobbyAvatar, setIsChangingLobbyAvatar] = useState(false);
  const [formErrorKey, setFormErrorKey] = useState<'invalidRoomOrName' | 'invalidPlayerName' | null>(
    null
  );

  const [hasJoined, setHasJoined] = useState(() => canRestoreSession);
  const [activeRoomCode, setActiveRoomCode] = useState(() =>
    canRestoreSession && savedSession ? savedSession.roomCode : ''
  );
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connStatus, setConnStatus] = useState<PlayerConnectionStatus>('connecting');
  const [localAnswers, setLocalAnswers] = useState<Record<string, number>>({});
  const [localWishes, setLocalWishes] = useState<WishItem[]>([]);

  const clientRef = useRef<PlayerP2PClient | null>(null);
  const joinedIdentityRef = useRef<{ id: string; name: string; avatar: string }>({
    id: playerId,
    name: canRestoreSession && savedSession ? savedSession.name : '',
    avatar: canRestoreSession && savedSession ? savedSession.avatar : DEFAULT_AVATAR,
  });
  const finalePoppedRef = useRef(false);

  const currentCategoryObj = useMemo(
    () => AVATAR_CATEGORIES.find((c) => c.key === avatarCategory) ?? AVATAR_CATEGORIES[0],
    [avatarCategory]
  );

  const handleUpdateLobbyAvatar = (newEmoji: string) => {
    soundEffects.playTick(isMuted);
    setAvatar(newEmoji);
    joinedIdentityRef.current.avatar = newEmoji;
    try {
      const current = readSavedSession(sessionKey);
      if (current) {
        window.sessionStorage.setItem(sessionKey, JSON.stringify({ ...current, avatar: newEmoji }));
      }
    } catch {}
    clientRef.current?.send({
      type: 'PLAYER_JOIN',
      payload: {
        id: playerId,
        name: joinedIdentityRef.current.name,
        avatar: newEmoji,
      },
    });
  };

  useEffect(() => {
    if (initialRoomCode && !hasJoined) {
      setRoomCode(initialRoomCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ''));
    }
  }, [initialRoomCode, hasJoined]);

  const handleStateUpdate = useCallback((nextState: GameState) => {
    setGameState(nextState);
  }, []);

  const handleConnectionChange = useCallback(
    (_connected: boolean, status?: PlayerConnectionStatus) => {
      if (status) {
        setConnStatus(status);
      }
    },
    []
  );

  useEffect(() => {
    if (!hasJoined || !activeRoomCode) return;

    const client = new PlayerP2PClient(
      activeRoomCode,
      playerId,
      handleStateUpdate,
      handleConnectionChange
    );
    clientRef.current = client;

    client.send({
      type: 'PLAYER_JOIN',
      payload: joinedIdentityRef.current,
    });

    return () => {
      client.destroy();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
    };
  }, [hasJoined, activeRoomCode, playerId, handleStateUpdate, handleConnectionChange]);

  // Ensure host receives PLAYER_JOIN if player entered before Host opened Lobby or reconnects
  const isRegisteredOnHost = Boolean(gameState?.players[playerId]);
  useEffect(() => {
    if (!hasJoined || isRegisteredOnHost) return;

    const interval = window.setInterval(() => {
      clientRef.current?.send({
        type: 'PLAYER_JOIN',
        payload: joinedIdentityRef.current,
      });
    }, 1500);

    return () => window.clearInterval(interval);
  }, [hasJoined, isRegisteredOnHost]);

  // Subtle celebratory confetti on mobile when reaching FINALE
  useEffect(() => {
    if (gameState?.phase === 'FINALE' && !finalePoppedRef.current) {
      finalePoppedRef.current = true;
      try {
        confetti({ particleCount: 65, spread: 70, origin: { y: 0.65 } });
      } catch {
        // Ignore
      }
    } else if (gameState?.phase !== 'FINALE') {
      finalePoppedRef.current = false;
    }
  }, [gameState?.phase]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedRoom = roomCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const nameCheck = validatePlayerName(nickname);
    if (!cleanedRoom || nameCheck.reason === 'empty') {
      setFormErrorKey('invalidRoomOrName');
      return;
    }
    if (!nameCheck.valid) {
      setFormErrorKey('invalidPlayerName');
      return;
    }

    const cleanedName = nameCheck.cleaned;
    setFormErrorKey(null);
    soundEffects.playSuccess(isMuted);
    joinedIdentityRef.current = {
      id: playerId,
      name: cleanedName,
      avatar,
    };
    try {
      const sessionObj: SavedPlayerSession = {
        id: playerId,
        name: cleanedName,
        avatar,
        roomCode: cleanedRoom,
      };
      window.sessionStorage.setItem(sessionKey, JSON.stringify(sessionObj));
    } catch {}
    setRoomCode(cleanedRoom);
    setActiveRoomCode(cleanedRoom);
    setHasJoined(true);
  };

  const handleProgress = useCallback(
    (progressPercent: number, scoreDelta: number, completed: boolean) => {
      clientRef.current?.send({
        type: 'PLAYER_PROGRESS',
        payload: {
          playerId,
          progress: progressPercent,
          scoreDelta,
          completed,
        },
      });
    },
    [playerId]
  );

  const roundKey = gameState
    ? `${gameState.phase}:${gameState.currentQuestionIndex}:${gameState.roundStartTime}`
    : '';
  const questionKey = gameState
    ? `${gameState.phase}:${gameState.currentQuestionIndex}`
    : '';

  const handleAnswer = useCallback(
    (answerIndex: number, timeMs: number) => {
      if (!gameState) return;
      setLocalAnswers((prev) => ({
        ...prev,
        [roundKey]: answerIndex,
        [questionKey]: answerIndex,
      }));
      clientRef.current?.send({
        type: 'PLAYER_ANSWER',
        payload: {
          playerId,
          questionIndex: gameState.currentQuestionIndex,
          answerIndex,
          timeMs,
        },
      });
    },
    [gameState, roundKey, questionKey, playerId]
  );

  const handleSubmitWish = useCallback(
    (submission: WishSubmissionPayload) => {
      const cleaned = submission.text.trim();
      if (!cleaned) return;
      const wishPayload: WishItem = {
        id:
          submission.id ||
          `${playerId}-w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        playerId,
        playerName: joinedIdentityRef.current.name,
        avatar: joinedIdentityRef.current.avatar,
        text: cleaned,
        selfieDataUrl: submission.selfieDataUrl,
        createdAt: Date.now(),
      };
      setLocalWishes((prev) => addPlayerWish(prev, wishPayload).wishes);
      clientRef.current?.send({
        type: 'PLAYER_WISH',
        payload: wishPayload,
      });
    },
    [playerId]
  );

  const mySubmittedWishes = useMemo<WishItem[]>(() => {
    const hostWishes = (gameState?.wishes ?? []).filter((w) => w.playerId === playerId);
    if (hostWishes.length === 0) return localWishes;
    // Merge any optimistic local wishes that have not yet echoed back from Host
    const merged = [...hostWishes];
    for (const lw of localWishes) {
      if (lw.id && !merged.some((hw) => hw.id === lw.id)) {
        merged.push(lw);
      }
    }
    return merged;
  }, [gameState?.wishes, localWishes, playerId]);

  const playersList = useMemo<Player[]>(
    () => (gameState ? Object.values(gameState.players) : []),
    [gameState]
  );

  const sortedStandings = useMemo(
    () =>
      [...playersList].sort(
        (a, b) => b.score - a.score || b.progress - a.progress || a.name.localeCompare(b.name)
      ),
    [playersList]
  );

  const myPlayer = gameState?.players[playerId];
  const myRank = useMemo(() => {
    const idx = sortedStandings.findIndex((p) => p.id === playerId);
    return idx >= 0 ? idx + 1 : null;
  }, [sortedStandings, playerId]);

  const activePuzzle = useMemo(() => {
    if (!gameState || gameState.content.puzzles.length === 0) return undefined;
    return gameState.content.puzzles[
      gameState.currentQuestionIndex % gameState.content.puzzles.length
    ];
  }, [gameState]);

  const activeQuestion = useMemo(() => {
    if (!gameState) return undefined;
    const pool =
      gameState.phase === 'QUOTES'
        ? gameState.content.quoteQuestions
        : gameState.content.triviaQuestions;
    return pool[gameState.currentQuestionIndex];
  }, [gameState]);

  const activePoolLength = useMemo(() => {
    if (!gameState) return 0;
    return gameState.phase === 'QUOTES'
      ? gameState.content.quoteQuestions.length
      : gameState.content.triviaQuestions.length;
  }, [gameState]);

  const selectedAnswer =
    (roundKey && localAnswers[roundKey] !== undefined)
      ? localAnswers[roundKey]
      : (questionKey && localAnswers[questionKey] !== undefined)
      ? localAnswers[questionKey]
      : myPlayer?.lastAnswerIndex;

  const handleBackHome = () => {
    try {
      window.sessionStorage.removeItem(sessionKey);
    } catch {}
    onBackHome?.();
  };

  // ONBOARDING VIEW
  if (!hasJoined) {
    return (
      <div dir={dir} className="w-full max-w-lg mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {onBackHome && (
            <button
              type="button"
              onClick={handleBackHome}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 hover:bg-white border border-rose-200 text-rose-700 font-bold text-sm shadow-sm"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>{t('backToHome')}</span>
            </button>
          )}
          <AccessibilityBar compact={compact} className="flex-1" />
        </div>

        <form
          onSubmit={handleJoinSubmit}
          className="rounded-3xl bg-white/95 backdrop-blur border-2 border-rose-200 shadow-xl p-5 sm:p-7 space-y-5"
        >
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              {t('birthdayBadge')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-rose-900">
              {t('playerJoinTitle')}
            </h1>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-extrabold text-slate-800">
              {t('roomCodeInputLabel')}
            </label>
            <input
              type="text"
              dir="ltr"
              value={roomCode}
              onChange={(e) => {
                setFormErrorKey(null);
                setRoomCode(e.target.value.toUpperCase());
              }}
              placeholder={t('roomCodePlaceholder')}
              maxLength={8}
              className="w-full rounded-2xl border-2 border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 px-4 py-3 text-center text-2xl font-black tracking-[0.2em] uppercase bg-rose-50/40 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-extrabold text-slate-800">
              {t('playerNameLabel')}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setFormErrorKey(null);
                setNickname(e.target.value);
              }}
              placeholder={t('playerNamePlaceholder')}
              maxLength={MAX_PLAYER_NAME_LENGTH}
              className="w-full rounded-2xl border-2 border-amber-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 px-4 py-3 text-lg font-bold bg-white outline-none transition-all"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-extrabold text-slate-800">
                {t('chooseAvatarLabel')}
              </label>
              <span className="text-xs font-bold text-rose-600">
                {currentCategoryObj.labels[lang] || currentCategoryObj.labels.he}
              </span>
            </div>

            {/* Category tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-amber-100/70 rounded-2xl">
              {AVATAR_CATEGORIES.map((cat) => {
                const isCatActive = avatarCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      soundEffects.playTick(isMuted);
                      setAvatarCategory(cat.key);
                    }}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl font-black text-xs transition-all touch-manipulation ${
                      isCatActive
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md scale-[1.02]'
                        : 'text-slate-700 hover:bg-white/80 bg-white/40'
                    }`}
                  >
                    <AvatarDisplay avatar={cat.icon} className="w-5 h-5 shrink-0" />
                    <span className="truncate">{cat.labels[lang] || cat.labels.he}</span>
                  </button>
                );
              })}
            </div>

            {/* Avatars in active category */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {currentCategoryObj.avatars.map((item) => {
                const isSelected = avatar === item.id;
                const displayName = item.names[lang] || item.names.he;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={displayName}
                    onClick={() => {
                      soundEffects.playTick(isMuted);
                      setAvatar(item.id);
                    }}
                    aria-pressed={isSelected}
                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all touch-manipulation min-h-[92px] ${
                      isSelected
                        ? 'bg-gradient-to-br from-rose-100 via-pink-50 to-amber-100 border-rose-500 ring-4 ring-rose-300/50 scale-105 shadow-md z-10'
                        : 'bg-white hover:bg-rose-50/70 border-slate-200 shadow-sm'
                    }`}
                  >
                    <AvatarDisplay
                      avatar={item.id}
                      className="w-12 h-12 shrink-0 drop-shadow-sm transition-transform group-hover:scale-105"
                    />
                    <span className="text-[11px] font-black text-slate-800 line-clamp-2 max-w-full mt-1.5 px-0.5 leading-tight text-center">
                      {displayName}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected avatar indicator */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm">
              <span className="font-bold text-slate-600">{t('selectedAvatarLabel')}</span>
              <span className="font-black text-rose-700 flex items-center gap-2">
                <AvatarDisplay avatar={avatar} className="w-8 h-8 shrink-0 drop-shadow-sm" />
                <span className="text-sm font-black">{getAvatarDisplayName(avatar, lang)}</span>
              </span>
            </div>
          </div>

          {formErrorKey && (
            <p className="rounded-xl bg-rose-50 border border-rose-300 px-3 py-2 text-sm font-bold text-rose-700 text-center">
              {t(formErrorKey)}
            </p>
          )}

          <button
            type="submit"
            className="w-full min-h-[58px] rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xl shadow-lg transition-all active:scale-[0.98]"
          >
            {t('joinPartyBtn')}
          </button>
        </form>
      </div>
    );
  }

  // JOINED GAMEPLAY VIEW
  const connectionText =
    connStatus === 'connected'
      ? t('onlineMode')
      : connStatus === 'local-only'
      ? t('localMode')
      : connStatus === 'reconnecting'
      ? t('reconnecting')
      : t('connecting');

  return (
    <div dir={dir} className="w-full max-w-2xl mx-auto space-y-4">
      {/* Top Accessibility & Back Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {onBackHome && (
          <button
            type="button"
            onClick={handleBackHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-rose-200 text-rose-700 font-bold text-xs sm:text-sm shadow-sm"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>{t('backToHome')}</span>
          </button>
        )}
        <AccessibilityBar compact className="flex-1" />
      </div>

      {/* Player Status Strip */}
      <div className="rounded-2xl bg-white/95 backdrop-blur border-2 border-rose-200 shadow-sm px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <AvatarDisplay avatar={joinedIdentityRef.current.avatar} className="w-8 h-8 shrink-0 drop-shadow-sm" />
          <div className="min-w-0">
            <p className="font-black text-slate-900 truncate">{joinedIdentityRef.current.name}</p>
            <p className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600">
              {connStatus === 'connected' || connStatus === 'local-only' ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              )}
              <span>
                #{activeRoomCode} • {connectionText}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1 rounded-xl bg-amber-100 border border-amber-200 text-center">
            <p className="text-[10px] font-extrabold text-amber-800 uppercase">{t('yourScore')}</p>
            <p className="text-sm font-black text-rose-700">
              {myPlayer?.score ?? 0} {t('scoreUnit')}
            </p>
          </div>
          {myRank !== null && (
            <div className="px-3 py-1 rounded-xl bg-rose-100 border border-rose-200 text-center">
              <p className="text-[10px] font-extrabold text-rose-700 uppercase">{t('yourRank')}</p>
              <p className="text-sm font-black text-rose-900">#{myRank}</p>
            </div>
          )}
        </div>
      </div>

      {/* WAITING FOR HOST (SETUP / LOBBY / INITIAL CONNECT) */}
      {(!gameState || gameState.phase === 'SETUP' || gameState.phase === 'LOBBY') && (
        <div className="rounded-3xl bg-white/95 backdrop-blur border-2 border-amber-200 shadow-xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-100 to-amber-100 border-2 border-rose-200 flex items-center justify-center mx-auto shadow-md animate-float-gentle p-2">
            <AvatarDisplay avatar={joinedIdentityRef.current.avatar} className="w-14 h-14 drop-shadow-md" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
              {t('youJoinedAs')}
            </p>
            <h2 className="text-2xl font-black text-slate-900">{joinedIdentityRef.current.name}</h2>
            <p className="text-xs font-bold text-rose-600">
              {getAvatarDisplayName(joinedIdentityRef.current.avatar, lang)}
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsChangingLobbyAvatar(!isChangingLobbyAvatar)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black transition-colors"
            >
              <span>🎨</span>
              <span>{t('changeAvatarBtn')}</span>
            </button>
          </div>

          {isChangingLobbyAvatar && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-start space-y-2.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-white/70 rounded-2xl">
                {AVATAR_CATEGORIES.map((cat) => {
                  const isCatActive = avatarCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        soundEffects.playTick(isMuted);
                        setAvatarCategory(cat.key);
                      }}
                      className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl font-black text-xs transition-all touch-manipulation ${
                        isCatActive
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                          : 'text-slate-700 hover:bg-white bg-slate-100/60'
                      }`}
                    >
                      <AvatarDisplay avatar={cat.icon} className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cat.labels[lang] || cat.labels.he}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentCategoryObj.avatars.map((item) => {
                  const isSelected = joinedIdentityRef.current.avatar === item.id;
                  const displayName = item.names[lang] || item.names.he;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={displayName}
                      onClick={() => handleUpdateLobbyAvatar(item.id)}
                      aria-pressed={isSelected}
                      className={`relative flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all touch-manipulation min-h-[76px] ${
                        isSelected
                          ? 'bg-gradient-to-br from-rose-100 to-amber-100 border-rose-500 ring-2 ring-rose-400/50 scale-105 shadow-md'
                          : 'bg-white hover:bg-rose-50/70 border-slate-200'
                      }`}
                    >
                      <AvatarDisplay avatar={item.id} className="w-10 h-10 shrink-0 drop-shadow-sm" />
                      <span className="text-[10px] font-black text-slate-800 line-clamp-2 max-w-full mt-1 px-0.5 leading-tight text-center">
                        {displayName}
                      </span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black shadow border border-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2">
            <p className="font-extrabold text-amber-900">
              {gameState ? t('waitingForHost') : t('connecting')}
            </p>
            {gameState && (
              <p className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600">
                <Users className="w-4 h-4 text-rose-500" aria-hidden="true" />
                <span>
                  {t('playersConnected')}: {playersList.length}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* MEMORY GAME */}
      {gameState?.phase === 'MEMORY' && (
        <MemoryGame
          key={gameState.roundStartTime}
          pairs={gameState.content.memoryPairs}
          isPaused={gameState.isPaused}
          roundStartTime={gameState.roundStartTime}
          finishRank={myPlayer?.finishRank}
          onProgress={handleProgress}
        />
      )}

      {/* PUZZLE GAME */}
      {gameState?.phase === 'PUZZLE' && activePuzzle && (
        <PuzzleGame
          key={`${activePuzzle.id}-${gameState.roundStartTime}`}
          puzzle={activePuzzle}
          isPaused={gameState.isPaused}
          roundStartTime={gameState.roundStartTime}
          finishRank={myPlayer?.finishRank}
          onProgress={handleProgress}
        />
      )}

      {/* TRIVIA GAME */}
      {gameState?.phase === 'TRIVIA' && activeQuestion && (
        <TriviaGame
          question={activeQuestion}
          questionIndex={gameState.currentQuestionIndex}
          totalQuestions={activePoolLength}
          isPaused={gameState.isPaused}
          revealAnswer={gameState.revealAnswer}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
        />
      )}

      {/* QUOTES GAME */}
      {gameState?.phase === 'QUOTES' && activeQuestion && (
        <QuotesGame
          question={activeQuestion}
          questionIndex={gameState.currentQuestionIndex}
          totalQuestions={activePoolLength}
          isPaused={gameState.isPaused}
          revealAnswer={gameState.revealAnswer}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
        />
      )}

      {/* WISHES PHASE */}
      {gameState?.phase === 'WISHES' && (
        <div className="space-y-3">
          {gameState.isPaused && (
            <div className="rounded-2xl bg-amber-100 border-2 border-amber-400 px-4 py-3 flex items-center gap-2.5 text-amber-950 font-bold text-sm">
              <Pause className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t('pausedBannerTitle')}</span>
            </div>
          )}
          <PlayerWishInput
            onSubmitWish={handleSubmitWish}
            submittedWishes={mySubmittedWishes}
          />
        </div>
      )}

      {/* FINALE PHASE */}
      {gameState?.phase === 'FINALE' && (
        <div className="rounded-3xl bg-white/95 backdrop-blur border-2 border-amber-300 shadow-xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-yellow-200 to-rose-200 border-4 border-amber-400 flex items-center justify-center mx-auto shadow-lg">
            {myRank === 1 ? (
              <Crown className="w-10 h-10 text-amber-700" aria-hidden="true" />
            ) : myRank === 2 ? (
              <Medal className="w-10 h-10 text-slate-600" aria-hidden="true" />
            ) : myRank === 3 ? (
              <Award className="w-10 h-10 text-orange-600" aria-hidden="true" />
            ) : (
              <Trophy className="w-10 h-10 text-rose-600" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black">
              <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              {gameState.content.momName[lang] || gameState.content.momName.en}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-rose-900">
              {t('happy70Banner')}
            </h2>
            <p className="text-sm text-slate-600">{t('finaleSubtitle')}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-3">
              <p className="text-xs font-extrabold text-amber-800">{t('yourRank')}</p>
              <p className="text-3xl font-black text-amber-900">#{myRank ?? 1}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 border-2 border-rose-200 p-3">
              <p className="text-xs font-extrabold text-rose-700">{t('yourScore')}</p>
              <p className="text-3xl font-black text-rose-900">{myPlayer?.score ?? 0}</p>
            </div>
          </div>

          {mySubmittedWishes.length > 0 && (
            <div className="space-y-2 text-start">
              {mySubmittedWishes.map((w, idx) => (
                <div
                  key={w.id ?? idx}
                  className="flex items-center gap-3 rounded-2xl bg-rose-50/70 border border-rose-200 p-3 text-sm text-slate-800 font-bold"
                >
                  {w.selfieDataUrl && (
                    <img
                      src={w.selfieDataUrl}
                      alt=""
                      className="w-11 h-11 rounded-xl object-cover border-2 border-amber-300 shrink-0"
                    />
                  )}
                  <span className="break-words">“{w.text}”</span>
                </div>
              ))}
            </div>
          )}

          {sortedStandings.length > 0 && (
            <div className="text-start space-y-2 pt-2 border-t border-amber-200">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                {t('podiumTitle')}
              </p>
              {sortedStandings.slice(0, 3).map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 border ${
                    p.id === playerId
                      ? 'bg-rose-50 border-rose-300 font-black'
                      : 'bg-slate-50 border-slate-200 font-bold'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="shrink-0">#{idx + 1}</span>
                    <AvatarDisplay avatar={p.avatar} className="w-6 h-6 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate leading-tight">{p.name}</span>
                      <span className="block text-[11px] font-bold text-rose-600 dark:text-rose-300 truncate leading-tight">
                        {getAvatarDisplayName(p.avatar, lang)}
                      </span>
                    </span>
                  </span>
                  <span className="text-rose-700 shrink-0">
                    {p.score} {t('scoreUnit')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
