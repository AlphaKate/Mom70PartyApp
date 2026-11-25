import { GamePhase, Player } from '../types/game';

export const STAGE_SEQUENCE: GamePhase[] = [
  'LOBBY',
  'MEMORY',
  'PUZZLE',
  'TRIVIA',
  'QUOTES',
  'WISHES',
  'FINALE',
];

export const MAX_PLAYER_NAME_LENGTH = 15;
export const MEMORY_SPEED_BONUS_WINDOW_SEC = 60;
export const MEMORY_SPEED_BONUS_MAX = 200;
export const PUZZLE_SPEED_BONUS_WINDOW_SEC = 60;
export const PUZZLE_SPEED_BONUS_MAX = 250;
export const TRIVIA_SPEED_BONUS_WINDOW_MS = 25000;
export const TRIVIA_BASE_POINTS = 100;

/**
 * Generates a readable 4-character room code starting with "70",
 * avoiding ambiguous characters (0, O, 1, I).
 */
export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 2; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `70${suffix}`;
}

/**
 * Normalizes user-supplied room codes to uppercase alphanumeric/dash/underscore.
 * Falls back to a freshly generated room code if empty.
 */
export function normalizeRoomCode(code?: string): string {
  const cleaned = (code ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
  return cleaned || generateRoomCode();
}

export interface PlayerNameValidation {
  valid: boolean;
  cleaned: string;
  reason?: 'empty' | 'too_long' | 'invalid_chars';
}

// Disallow HTML brackets, braces, backticks, backslashes, and control characters
const ILLEGAL_NAME_CHARS = /[<>{}`\\\x00-\x1F\x7F]/;

/**
 * Validates and trims a player nickname per REQ-PLY-001 (1..15 chars, no illegal chars).
 */
export function validatePlayerName(rawName: string): PlayerNameValidation {
  const cleaned = rawName.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return { valid: false, cleaned: '', reason: 'empty' };
  }
  if (cleaned.length > MAX_PLAYER_NAME_LENGTH) {
    return { valid: false, cleaned, reason: 'too_long' };
  }
  if (ILLEGAL_NAME_CHARS.test(cleaned)) {
    return { valid: false, cleaned, reason: 'invalid_chars' };
  }
  return { valid: true, cleaned };
}

/**
 * Calculates fastest-finger speed bonus for Trivia / Quotes (0..100 pts within 25s).
 */
export function calcTriviaSpeedBonus(timeMs: number): number {
  const clamped = Math.min(TRIVIA_SPEED_BONUS_WINDOW_MS, Math.max(0, timeMs));
  return Math.max(0, Math.round((TRIVIA_SPEED_BONUS_WINDOW_MS - clamped) / 250));
}

/**
 * Calculates total earned points for a Trivia / Quotes answer.
 */
export function calcTriviaPoints(isCorrect: boolean, timeMs: number): number {
  if (!isCorrect) return 0;
  return TRIVIA_BASE_POINTS + calcTriviaSpeedBonus(timeMs);
}

/**
 * Calculates Memory Game speed bonus (up to +200 pts within 60s window).
 */
export function calcMemorySpeedBonus(elapsedSeconds: number): number {
  const clamped = Math.min(MEMORY_SPEED_BONUS_WINDOW_SEC, Math.max(0, elapsedSeconds));
  return Math.max(
    0,
    Math.round(
      (MEMORY_SPEED_BONUS_WINDOW_SEC - clamped) *
        (MEMORY_SPEED_BONUS_MAX / MEMORY_SPEED_BONUS_WINDOW_SEC)
    )
  );
}

/**
 * Calculates Puzzle Game speed bonus (up to +250 pts within 60s window).
 */
export function calcPuzzleSpeedBonus(elapsedSeconds: number): number {
  const clamped = Math.min(PUZZLE_SPEED_BONUS_WINDOW_SEC, Math.max(0, elapsedSeconds));
  return Math.max(
    0,
    Math.round(
      (PUZZLE_SPEED_BONUS_WINDOW_SEC - clamped) *
        (PUZZLE_SPEED_BONUS_MAX / PUZZLE_SPEED_BONUS_WINDOW_SEC)
    )
  );
}

/**
 * Returns arrival medal bonus points based on 1-indexed completion order in a round.
 * 1st (Gold): +100, 2nd (Silver): +60, 3rd (Bronze): +30, 4th+: 0.
 */
export function getArrivalMedalBonus(finishRank: number): number {
  if (finishRank === 1) return 100;
  if (finishRank === 2) return 60;
  if (finishRank === 3) return 30;
  return 0;
}

/**
 * Sorts players for live Memory / Puzzle race display:
 * 1. Completed players in strict arrival order (finishRank 1, 2, 3...)
 * 2. In-progress players by highest progress %
 * 3. Tie-breaker by cumulative score, then alphabetically by name.
 */
export function sortRacePlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const rankA = a.finishRank ?? Number.POSITIVE_INFINITY;
    const rankB = b.finishRank ?? Number.POSITIVE_INFINITY;
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    if (b.progress !== a.progress) {
      return b.progress - a.progress;
    }
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Sorts players for overall Leaderboard & Finale Podium.
 */
export function sortLeaderboard(players: Player[]): Player[] {
  return [...players].sort(
    (a, b) => b.score - a.score || b.progress - a.progress || a.name.localeCompare(b.name)
  );
}
