export type Language = 'he' | 'ru' | 'en';

export type FontScale = 'small' | 'normal' | 'large' | 'huge';
export type AppTheme = 'light' | 'dark' | 'auto';

export type GamePhase =
  | 'SETUP'
  | 'LOBBY'
  | 'MEMORY'
  | 'PUZZLE'
  | 'TRIVIA'
  | 'QUOTES'
  | 'WISHES'
  | 'FINALE';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  progress: number;
  completedCurrentGame: boolean;
  lastAnswerIndex?: number;
  lastAnswerCorrect?: boolean;
  wish?: string;
  connected: boolean;
  finishRank?: number;
}

export interface MemoryPair {
  id: string;
  imageA: string;
  labelA: Record<Language, string>;
  imageB: string;
  labelB: Record<Language, string>;
}

export interface PuzzleItem {
  id: string;
  imageUrl: string;
  title: Record<Language, string>;
  story: Record<Language, string>;
  gridSize: number;
}

export interface TriviaQuestion {
  id: string;
  category: 'trivia' | 'quotes';
  question: Record<Language, string>;
  options: Record<Language, string[]>;
  correctIndex: number;
  imageUrl?: string;
  funFact?: Record<Language, string>;
}

export interface GameContent {
  momName: Record<Language, string>;
  driveFolderUrl: string;
  sheetsUrl?: string;
  spotifyUrl: string;
  memoryPairs: MemoryPair[];
  puzzles: PuzzleItem[];
  triviaQuestions: TriviaQuestion[];
  quoteQuestions: TriviaQuestion[];
}

export interface WishItem {
  playerId: string;
  playerName: string;
  avatar: string;
  text: string;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  isPaused: boolean;
  currentQuestionIndex: number;
  revealAnswer: boolean;
  roundStartTime: number;
  players: Record<string, Player>;
  wishes: WishItem[];
  content: GameContent;
}

export type P2PMessage =
  | { type: 'PLAYER_JOIN'; payload: { id: string; name: string; avatar: string } }
  | { type: 'GAME_STATE_UPDATE'; payload: GameState }
  | {
      type: 'PLAYER_PROGRESS';
      payload: { playerId: string; progress: number; scoreDelta: number; completed: boolean };
    }
  | {
      type: 'PLAYER_ANSWER';
      payload: { playerId: string; questionIndex: number; answerIndex: number; timeMs: number };
    }
  | { type: 'PLAYER_WISH'; payload: WishItem }
  | { type: 'PING'; payload: { timestamp: number } };
