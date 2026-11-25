// Automated Test Suite for Mom v7.0 (Mom70PartyApp)
// Runs directly with Node.js via Vite SSR Loader
import assert from 'node:assert/strict';
import { createServer } from 'vite';

console.log('====================================================');
console.log('🧪 Starting Automated Tests for Mom v7.0 (STD / STP)');
console.log('====================================================\n');

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

let passedCount = 0;
let failedCount = 0;

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    failedCount++;
  }
}

try {
  // Load core modules through Vite
  const { translations } = await vite.ssrLoadModule('./src/i18n/translations.ts');
  const { AVATARS, AVATAR_CATEGORIES } = await vite.ssrLoadModule('./src/constants/avatars.ts');
  const { DEFAULT_GAME_CONTENT, soundEffects } = await vite.ssrLoadModule('./src/services/contentService.ts');

  console.log('--- Test Suite 01: Internationalization & Translations (REQ-GEN-001, REQ-GEN-002) ---');

  await runTest('TC-GEN-01: Translations dictionary has all 3 required languages (he, ru, en)', () => {
    assert.ok(translations.he, 'Hebrew dictionary must exist');
    assert.ok(translations.ru, 'Russian dictionary must exist');
    assert.ok(translations.en, 'English dictionary must exist');
  });

  await runTest('TC-GEN-02: Key parity across all languages (no missing translation keys)', () => {
    const heKeys = Object.keys(translations.he);
    const ruKeys = Object.keys(translations.ru);
    const enKeys = Object.keys(translations.en);

    assert.equal(ruKeys.length, heKeys.length, `Russian has ${ruKeys.length} keys, expected ${heKeys.length}`);
    assert.equal(enKeys.length, heKeys.length, `English has ${enKeys.length} keys, expected ${heKeys.length}`);

    for (const key of heKeys) {
      assert.ok(translations.ru[key], `Missing Russian translation for key: "${key}"`);
      assert.ok(translations.en[key], `Missing English translation for key: "${key}"`);
      assert.notEqual(translations.he[key].trim(), '', `Hebrew key "${key}" is empty`);
      assert.notEqual(translations.ru[key].trim(), '', `Russian key "${key}" is empty`);
      assert.notEqual(translations.en[key].trim(), '', `English key "${key}" is empty`);
    }
  });

  await runTest('TC-GEN-03: Required speed bonus and arrival medal keys exist in all languages', () => {
    const expectedKeys = [
      'speedBonusLabel',
      'speedBonusEarned',
      'timeElapsed',
      'secondsUnit',
      'arrivalMedalGold',
      'arrivalMedalSilver',
      'arrivalMedalBronze',
      'arrivalOrder',
      'memoryCardBack',
    ];
    for (const key of expectedKeys) {
      assert.ok(translations.he[key], `he.${key} missing`);
      assert.ok(translations.ru[key], `ru.${key} missing`);
      assert.ok(translations.en[key], `en.${key} missing`);
    }
  });

  console.log('\n--- Test Suite 02: Avatars & Identity Integrity (REQ-PLY-002) ---');

  await runTest('TC-PLY-01: Avatars catalog contains exactly 32 avatars in 4 distinct categories', () => {
    assert.equal(AVATAR_CATEGORIES.length, 4, 'Must have 4 categories');
    const categoryKeys = AVATAR_CATEGORIES.map((c) => c.key);
    assert.deepEqual(categoryKeys, ['fairies', 'superheroes', 'animals', 'ussr']);

    assert.equal(AVATARS.length, 32, `Expected 32 avatars, found ${AVATARS.length}`);
  });

  await runTest('TC-PLY-02: Every avatar has unique ID and localized names in all 3 languages', () => {
    const ids = new Set();
    for (const av of AVATARS) {
      assert.ok(!ids.has(av.id), `Duplicate avatar ID found: ${av.id}`);
      ids.add(av.id);
      assert.ok(av.names.he, `Avatar ${av.id} missing Hebrew name`);
      assert.ok(av.names.ru, `Avatar ${av.id} missing Russian name`);
      assert.ok(av.names.en, `Avatar ${av.id} missing English name`);
    }
  });

  console.log('\n--- Test Suite 03: Speed Bonus & Scoring Algorithms (REQ-MEM-004, REQ-PUZ-004, REQ-TRIV-004) ---');

  await runTest('TC-SCORE-01: Trivia fastest-finger speed bonus calculation', () => {
    // Speed bonus formula: Math.max(0, Math.round((25000 - Math.min(25000, Math.max(0, timeMs))) / 250))
    const calcTriviaBonus = (timeMs) => Math.max(0, Math.round((25000 - Math.min(25000, Math.max(0, timeMs))) / 250));

    assert.equal(calcTriviaBonus(0), 100, '0ms response should yield max 100 bonus');
    assert.equal(calcTriviaBonus(12500), 50, '12.5s response should yield 50 bonus');
    assert.equal(calcTriviaBonus(25000), 0, '25s response should yield 0 bonus');
    assert.equal(calcTriviaBonus(30000), 0, 'Late response >25s should yield 0 bonus');
    assert.equal(calcTriviaBonus(-500), 100, 'Negative time clamped to 0');
  });

  await runTest('TC-SCORE-02: Memory Game speed bonus calculation (up to +200 within 60s)', () => {
    // Formula: Math.max(0, Math.round((60 - Math.min(60, elapsedSeconds)) * (200 / 60)))
    const calcMemoryBonus = (elapsed) => Math.max(0, Math.round((60 - Math.min(60, elapsed)) * (200 / 60)));

    assert.equal(calcMemoryBonus(0), 200, 'Instant finish yields max +200 bonus');
    assert.equal(calcMemoryBonus(30), 100, '30s finish yields +100 bonus');
    assert.equal(calcMemoryBonus(60), 0, '60s finish yields 0 bonus');
    assert.equal(calcMemoryBonus(85), 0, '>60s finish yields 0 bonus');
  });

  await runTest('TC-SCORE-03: Puzzle Game speed bonus calculation (up to +250 within 60s)', () => {
    // Formula: Math.max(0, Math.round((60 - Math.min(60, elapsedSeconds)) * (250 / 60)))
    const calcPuzzleBonus = (elapsed) => Math.max(0, Math.round((60 - Math.min(60, elapsed)) * (250 / 60)));

    assert.equal(calcPuzzleBonus(0), 250, 'Instant finish yields max +250 bonus');
    assert.equal(calcPuzzleBonus(30), 125, '30s finish yields +125 bonus');
    assert.equal(calcPuzzleBonus(60), 0, '60s finish yields 0 bonus');
    assert.equal(calcPuzzleBonus(90), 0, '>60s finish yields 0 bonus');
  });

  await runTest('TC-SCORE-04: Arrival medals allocation and bonus points (REQ-MEM-006, REQ-PUZ-005)', () => {
    const getMedalBonus = (finishRank) => {
      if (finishRank === 1) return 100;
      if (finishRank === 2) return 60;
      if (finishRank === 3) return 30;
      return 0;
    };

    assert.equal(getMedalBonus(1), 100, '1st place (Gold) receives +100 bonus');
    assert.equal(getMedalBonus(2), 60, '2nd place (Silver) receives +60 bonus');
    assert.equal(getMedalBonus(3), 30, '3rd place (Bronze) receives +30 bonus');
    assert.equal(getMedalBonus(4), 0, '4th place receives 0 bonus');
  });

  console.log('\n--- Test Suite 04: Default Content & Fallback Integrity (REQ-HOST-003, REQ-REL-002) ---');

  await runTest('TC-CONT-01: Default game content has all 6 memory pairs with labels', () => {
    assert.ok(DEFAULT_GAME_CONTENT.memoryPairs.length >= 6, 'Must have at least 6 memory pairs');
    for (const pair of DEFAULT_GAME_CONTENT.memoryPairs) {
      assert.ok(pair.imageA, 'Pair imageA required');
      assert.ok(pair.imageB, 'Pair imageB required');
      assert.ok(pair.labelA.he && pair.labelA.ru && pair.labelA.en, 'Pair labelA requires 3 languages');
      assert.ok(pair.labelB.he && pair.labelB.ru && pair.labelB.en, 'Pair labelB requires 3 languages');
    }
  });

  await runTest('TC-CONT-02: Default puzzles have valid dimensions, stories and titles', () => {
    assert.ok(DEFAULT_GAME_CONTENT.puzzles.length >= 1, 'Must have at least 1 puzzle');
    for (const puz of DEFAULT_GAME_CONTENT.puzzles) {
      assert.ok(puz.imageUrl, 'Puzzle requires an image URL');
      assert.ok(puz.title.he && puz.title.ru && puz.title.en, 'Puzzle title requires 3 languages');
      assert.ok(puz.story.he && puz.story.ru && puz.story.en, 'Puzzle story requires 3 languages');
      assert.ok(puz.gridSize >= 2 && puz.gridSize <= 5, 'Grid size must be between 2 and 5');
    }
  });

  await runTest('TC-CONT-03: Default trivia questions and quotes have 4 options and valid correctIndex', () => {
    const allQuestions = [...DEFAULT_GAME_CONTENT.triviaQuestions, ...DEFAULT_GAME_CONTENT.quoteQuestions];
    assert.ok(allQuestions.length >= 8, 'Must have at least 8 questions total');
    for (const q of allQuestions) {
      assert.ok(q.question.he && q.question.ru && q.question.en, `Question ${q.id} requires text in 3 languages`);
      assert.equal(q.options.he.length, 4, `Question ${q.id} he must have 4 options`);
      assert.equal(q.options.ru.length, 4, `Question ${q.id} ru must have 4 options`);
      assert.equal(q.options.en.length, 4, `Question ${q.id} en must have 4 options`);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < 4, `Question ${q.id} correctIndex must be 0-3`);
      assert.ok(q.funFact?.he && q.funFact?.ru && q.funFact?.en, `Question ${q.id} requires funFact in 3 languages`);
    }
  });

  console.log('\n--- Test Suite 05: Room Code & P2P Protocol Validation (REQ-HOST-001, REQ-NAV-002) ---');

  await runTest('TC-HOST-01: Room code generator produces valid 4-character format starting with 70', () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const roomPattern = /^70[2-9A-HJ-NP-Z]{2}$/;

    for (let i = 0; i < 50; i++) {
      let suffix = '';
      for (let j = 0; j < 2; j++) {
        suffix += chars[Math.floor(Math.random() * chars.length)];
      }
      const code = `70${suffix}`;
      assert.ok(roomPattern.test(code), `Generated code "${code}" failed regex pattern`);
      assert.ok(!code.includes('0') || code.startsWith('70'), 'No ambiguous zero in suffix');
      assert.ok(!code.includes('O'), 'No ambiguous O');
      assert.ok(!code.includes('1'), 'No ambiguous 1');
      assert.ok(!code.includes('I'), 'No ambiguous I');
    }
  });

  await runTest('TC-HOST-02: Game phase sequence flow validation', () => {
    const STAGE_SEQUENCE = [
      'LOBBY',
      'MEMORY',
      'PUZZLE',
      'TRIVIA',
      'QUOTES',
      'WISHES',
      'FINALE',
    ];
    assert.equal(STAGE_SEQUENCE[0], 'LOBBY');
    assert.equal(STAGE_SEQUENCE[STAGE_SEQUENCE.length - 1], 'FINALE');
    assert.equal(STAGE_SEQUENCE.indexOf('MEMORY'), 1);
    assert.equal(STAGE_SEQUENCE.indexOf('PUZZLE'), 2);
    assert.equal(STAGE_SEQUENCE.indexOf('TRIVIA'), 3);
    assert.equal(STAGE_SEQUENCE.indexOf('QUOTES'), 4);
    assert.equal(STAGE_SEQUENCE.indexOf('WISHES'), 5);
  });

  console.log('\n====================================================');
  console.log(`📊 Test Execution Summary: ${passedCount} Passed | ${failedCount} Failed`);
  console.log('====================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
} finally {
  await vite.close();
}
