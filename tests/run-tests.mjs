// Comprehensive Automated Test Suite for Mom v7.0 (Mom70PartyApp)
// Tests real production modules directly via Vite SSR Loader + React SSR
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

console.log('====================================================');
console.log('🧪 Starting Comprehensive Automated Tests: Mom v7.0');
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
    console.error(`     Reason: ${err?.stack || err?.message || err}`);
    failedCount++;
  }
}

try {
  // Load REAL production modules via Vite
  const { translations, translate } = await vite.ssrLoadModule('./src/i18n/translations.ts');
  const {
    AVATARS,
    AVATAR_CATEGORIES,
    ALL_AVATAR_IDS,
    DEFAULT_AVATAR,
    getAvatarDisplayName,
  } = await vite.ssrLoadModule('./src/constants/avatars.ts');
  const {
    STAGE_SEQUENCE,
    MAX_PLAYER_NAME_LENGTH,
    MAX_WISHES_PER_PLAYER,
    MAX_SELFIE_DATA_URL_LENGTH,
    generateRoomCode,
    normalizeRoomCode,
    validatePlayerName,
    calcTriviaSpeedBonus,
    calcTriviaPoints,
    calcMemorySpeedBonus,
    calcPuzzleSpeedBonus,
    getArrivalMedalBonus,
    sortRacePlayers,
    sortLeaderboard,
    sanitizeSelfieDataUrl,
    addPlayerWish,
  } = await vite.ssrLoadModule('./src/services/gameLogic.ts');
  const {
    DEFAULT_GAME_CONTENT,
    MAX_MEMORY_PHOTO_PAIRS,
    extractGoogleSheetId,
    extractDriveFileId,
    extractDriveFolderId,
    getDriveImageEndpoints,
    extractDriveImagesFromText,
    parseDriveFolderHtml,
    buildMemoryPairsFromDrivePhotos,
    buildPuzzlesFromDrivePhotos,
  } = await vite.ssrLoadModule('./src/services/contentService.ts');
  const {
    HostP2PManager,
    PlayerP2PClient,
    packGameStateForWire,
    unpackGameStateFromWire,
    splitIntoChunks,
    ChunkReassembler,
  } = await vite.ssrLoadModule('./src/services/p2pService.ts');
  const { QRCodeSVG } = await vite.ssrLoadModule('./src/vendor/qrcode-react.tsx');
  const { MomCelebrationIcon } = await vite.ssrLoadModule('./src/components/common/MomCelebrationIcon.tsx');
  const { APP_VERSION, APP_VERSION_REGEX, isValidAppVersion } = await vite.ssrLoadModule('./src/constants/version.ts');
  const { SettingsProvider } = await vite.ssrLoadModule('./src/context/SettingsContext.tsx');
  const { AccessibilityBar } = await vite.ssrLoadModule('./src/components/common/AccessibilityBar.tsx');

  // =========================================================================
  console.log('--- Suite 01: Internationalization & Branding (REQ-GEN-001, 002, 009) ---');

  await runTest('TC-GEN-01: Translations dictionary has all 3 required languages (he, ru, en)', () => {
    assert.ok(translations.he, 'Hebrew dictionary must exist');
    assert.ok(translations.ru, 'Russian dictionary must exist');
    assert.ok(translations.en, 'English dictionary must exist');
  });

  await runTest('TC-GEN-02: 100% key parity across he, ru, en with no empty strings', () => {
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

  await runTest('TC-GEN-03: translate() interpolation and localized card-back / font glyphs', () => {
    assert.equal(translations.he.memoryCardBack, 'גירסא 7.0');
    assert.equal(translations.ru.memoryCardBack, 'Версия 7.0');
    assert.equal(translations.en.memoryCardBack, 'Version 7.0');
    assert.equal(translations.en.fontSmall, 'A-');
    assert.equal(translations.ru.fontSmall, 'А-');
    assert.equal(translations.he.fontSmall, 'א-');
    assert.ok(translate('he', 'speedBonusEarned', { bonus: 150 }).includes('150'));
    assert.ok(translate('ru', 'speedBonusEarned', { bonus: 150 }).includes('150'));
    assert.ok(translate('en', 'speedBonusEarned', { bonus: 150 }).includes('150'));
    assert.ok(translations.he.editWishBtn && translations.ru.editWishBtn && translations.en.editWishBtn);
    assert.ok(translations.he.invalidPlayerName && translations.ru.invalidPlayerName && translations.en.invalidPlayerName);
  });

  await runTest('TC-GEN-04: MomCelebrationIcon renders pure inline SVG (no external <img> for iOS Safari)', () => {
    const html = renderToStaticMarkup(React.createElement(MomCelebrationIcon, { className: 'w-16 h-16' }));
    assert.ok(html.startsWith('<svg'), 'Must render an inline <svg>');
    assert.ok(!html.includes('<img'), 'Must NOT contain external <img> tags');
    assert.ok(html.includes('70'), 'Must contain celebratory 70');
  });

  await runTest('TC-VER-01: APP_VERSION strictly matches XXX.YYY.ZZZ format (REQ-GEN-010)', () => {
    assert.match(APP_VERSION, APP_VERSION_REGEX, `APP_VERSION "${APP_VERSION}" must match XXX.YYY.ZZZ`);
    assert.equal(isValidAppVersion('001.001.000'), true);
    assert.equal(isValidAppVersion('999.012.005'), true);
    assert.equal(isValidAppVersion('1.0.0'), false);
    assert.equal(isValidAppVersion('001.01.000'), false);
    assert.equal(isValidAppVersion('001.001'), false);
    assert.equal(isValidAppVersion('abc.def.ghi'), false);
  });

  await runTest('TC-VER-02: Top header bar (AccessibilityBar) renders vXXX.YYY.ZZZ visibly in LTR', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        SettingsProvider,
        { applyToDocument: false },
        React.createElement(AccessibilityBar)
      )
    );
    assert.ok(html.includes(`v${APP_VERSION}`), `Top header must render v${APP_VERSION}`);
    assert.ok(html.includes('data-testid="app-version"'), 'Version badge must include data-testid');
    assert.ok(html.includes('dir="ltr"'), 'Version badge must preserve LTR order');
  });

  // =========================================================================
  console.log('\n--- Suite 02: Player Onboarding, Validation & Avatars (REQ-PLY-001, 002) ---');

  await runTest('TC-PLY-01: Avatars catalog contains exactly 32 unique avatars across 4 categories', () => {
    assert.equal(AVATAR_CATEGORIES.length, 4, 'Must have 4 categories');
    assert.deepEqual(
      AVATAR_CATEGORIES.map((c) => c.key),
      ['fairies', 'superheroes', 'animals', 'ussr']
    );
    assert.equal(AVATARS.length, 32, `Expected 32 avatars, found ${AVATARS.length}`);
    assert.equal(ALL_AVATAR_IDS.length, 32);
    assert.ok(ALL_AVATAR_IDS.includes(DEFAULT_AVATAR));
  });

  await runTest('TC-PLY-02: Every avatar has unique ID and translated display names in he, ru, en', () => {
    const ids = new Set();
    for (const av of AVATARS) {
      assert.ok(!ids.has(av.id), `Duplicate avatar ID: ${av.id}`);
      ids.add(av.id);
      assert.ok(getAvatarDisplayName(av.id, 'he').length > 0);
      assert.ok(getAvatarDisplayName(av.id, 'ru').length > 0);
      assert.ok(getAvatarDisplayName(av.id, 'en').length > 0);
    }
  });

  await runTest('TC-PLY-03: validatePlayerName enforces REQ-PLY-001 (1..15 chars, rejects empty/illegal)', () => {
    assert.equal(MAX_PLAYER_NAME_LENGTH, 15);
    assert.deepEqual(validatePlayerName('   '), { valid: false, cleaned: '', reason: 'empty' });
    assert.equal(validatePlayerName('אמא 70').valid, true);
    assert.equal(validatePlayerName('  Katy  ').cleaned, 'Katy');
    assert.equal(validatePlayerName('123456789012345').valid, true);
    assert.equal(validatePlayerName('1234567890123456').valid, false);
    assert.equal(validatePlayerName('1234567890123456').reason, 'too_long');
    assert.equal(validatePlayerName('<script>').valid, false);
    assert.equal(validatePlayerName('<script>').reason, 'invalid_chars');
    assert.equal(validatePlayerName('Мария').valid, true);
  });

  // =========================================================================
  console.log('\n--- Suite 03: Production Scoring, Medals & Race Sorting (REQ-MEM, REQ-PUZ, REQ-TRIV) ---');

  await runTest('TC-SCORE-01: Production calcTriviaSpeedBonus & calcTriviaPoints (REQ-TRIV-004)', () => {
    assert.equal(calcTriviaSpeedBonus(0), 100);
    assert.equal(calcTriviaSpeedBonus(12500), 50);
    assert.equal(calcTriviaSpeedBonus(25000), 0);
    assert.equal(calcTriviaSpeedBonus(40000), 0);
    assert.equal(calcTriviaSpeedBonus(-500), 100);
    assert.equal(calcTriviaPoints(true, 0), 200);
    assert.equal(calcTriviaPoints(true, 12500), 150);
    assert.equal(calcTriviaPoints(true, 25000), 100);
    assert.equal(calcTriviaPoints(false, 0), 0);
  });

  await runTest('TC-SCORE-02: Production calcMemorySpeedBonus (REQ-MEM-004: up to +200 in 60s)', () => {
    assert.equal(calcMemorySpeedBonus(0), 200);
    assert.equal(calcMemorySpeedBonus(30), 100);
    assert.equal(calcMemorySpeedBonus(60), 0);
    assert.equal(calcMemorySpeedBonus(90), 0);
    assert.equal(calcMemorySpeedBonus(-5), 200);
  });

  await runTest('TC-SCORE-03: Production calcPuzzleSpeedBonus (REQ-PUZ-004: up to +250 in 60s)', () => {
    assert.equal(calcPuzzleSpeedBonus(0), 250);
    assert.equal(calcPuzzleSpeedBonus(30), 125);
    assert.equal(calcPuzzleSpeedBonus(60), 0);
    assert.equal(calcPuzzleSpeedBonus(90), 0);
    assert.equal(calcPuzzleSpeedBonus(-5), 250);
  });

  await runTest('TC-SCORE-04: Production getArrivalMedalBonus (REQ-MEM-006, REQ-PUZ-005)', () => {
    assert.equal(getArrivalMedalBonus(1), 100);
    assert.equal(getArrivalMedalBonus(2), 60);
    assert.equal(getArrivalMedalBonus(3), 30);
    assert.equal(getArrivalMedalBonus(4), 0);
    assert.equal(getArrivalMedalBonus(0), 0);
  });

  await runTest('TC-SCORE-05: sortRacePlayers orders 1st/2nd/3rd finishers strictly by arrival rank', () => {
    const players = [
      { id: 'p3', name: 'C', avatar: 'a', score: 900, progress: 100, completedCurrentGame: true, connected: true, finishRank: 2 },
      { id: 'p1', name: 'A', avatar: 'a', score: 400, progress: 100, completedCurrentGame: true, connected: true, finishRank: 1 },
      { id: 'p4', name: 'D', avatar: 'a', score: 1200, progress: 80, completedCurrentGame: false, connected: true },
      { id: 'p2', name: 'B', avatar: 'a', score: 300, progress: 100, completedCurrentGame: true, connected: true, finishRank: 3 },
    ];
    const sorted = sortRacePlayers(players);
    assert.deepEqual(
      sorted.map((p) => p.id),
      ['p1', 'p3', 'p2', 'p4'],
      '1st place finisher must rank above 2nd place even with lower total score'
    );

    const lb = sortLeaderboard(players);
    assert.deepEqual(
      lb.map((p) => p.id),
      ['p4', 'p3', 'p1', 'p2'],
      'Overall leaderboard must rank strictly by cumulative score'
    );
  });

  // =========================================================================
  console.log('\n--- Suite 04: Content, Google Drive & Google Sheets Services (REQ-HOST-003..005) ---');

  await runTest('TC-CONT-01: Default game content has 6+ memory pairs, puzzles, trivia & quotes in 3 languages', () => {
    assert.ok(DEFAULT_GAME_CONTENT.memoryPairs.length >= 6);
    for (const pair of DEFAULT_GAME_CONTENT.memoryPairs) {
      assert.ok(pair.imageA && pair.imageB);
      assert.ok(pair.labelA.he && pair.labelA.ru && pair.labelA.en);
      assert.ok(pair.labelB.he && pair.labelB.ru && pair.labelB.en);
    }
    assert.ok(DEFAULT_GAME_CONTENT.puzzles.length >= 1);
    for (const puz of DEFAULT_GAME_CONTENT.puzzles) {
      assert.ok(puz.imageUrl && puz.gridSize >= 2 && puz.gridSize <= 5);
      assert.ok(puz.title.he && puz.title.ru && puz.title.en);
      assert.ok(puz.story.he && puz.story.ru && puz.story.en);
    }
    const allQ = [...DEFAULT_GAME_CONTENT.triviaQuestions, ...DEFAULT_GAME_CONTENT.quoteQuestions];
    assert.ok(allQ.length >= 8);
    for (const q of allQ) {
      assert.equal(q.options.he.length, 4);
      assert.equal(q.options.ru.length, 4);
      assert.equal(q.options.en.length, 4);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < 4);
      assert.ok(q.funFact?.he && q.funFact?.ru && q.funFact?.en);
    }
  });

  await runTest('TC-CONT-02: Google Drive folder/file extraction, fallback endpoints & recursive HTML parser', () => {
    const folderId = extractDriveFolderId('https://drive.google.com/drive/folders/13ZFl1_mQb3EVbeskmJrRiGd-j1XkIYzN?usp=sharing');
    assert.equal(folderId, '13ZFl1_mQb3EVbeskmJrRiGd-j1XkIYzN');

    const fileId = extractDriveFileId('https://drive.google.com/file/d/1aKHqgjL_7oxAURINdFqNaQdQQMYJbHah/view?usp=drive_link');
    assert.equal(fileId, '1aKHqgjL_7oxAURINdFqNaQdQQMYJbHah');

    const endpoints = getDriveImageEndpoints(fileId);
    assert.equal(endpoints.length, 3, 'Must provide 3 fallback endpoints for Google Drive images');
    assert.ok(endpoints[0].includes('drive.google.com/thumbnail'));
    assert.ok(endpoints[1].includes('lh3.googleusercontent.com'));
    assert.ok(endpoints[2].includes('drive.google.com/uc'));

    // Multi-link paste extraction (CORS bypass path)
    const pasted = extractDriveImagesFromText(
      'https://drive.google.com/file/d/1aaaaaaaaaaaaaaaaaaaaaa/view\nhttps://drive.google.com/file/d/1bbbbbbbbbbbbbbbbbbbbbb/view'
    );
    assert.equal(pasted.length, 2);

    // Subfolder vs file disambiguation in embeddedfolderview HTML
    const mockHtml = `
      <a href="https://drive.google.com/drive/folders/1SubFolderId12345678901234">photos</a>
      <a href="https://drive.google.com/file/d/1ImageFileId12345678901234/view">pic1.jpg</a>
    `;
    const parsed = parseDriveFolderHtml(mockHtml, '1ParentFolderId12345678901');
    assert.deepEqual(parsed.subfolderIds, ['1SubFolderId12345678901234']);
    assert.equal(parsed.imageUrls.length, 1);
    assert.ok(parsed.imageUrls[0].includes('1ImageFileId12345678901234'));

    // Memory pairs & puzzles builder from custom photos
    const pairs = buildMemoryPairsFromDrivePhotos(['data:image/png;base64,AAA', 'data:image/png;base64,BBB']);
    assert.equal(pairs.length, 2);
    const puzzles = buildPuzzlesFromDrivePhotos(['data:image/png;base64,AAA']);
    assert.equal(puzzles.length, 1);
    assert.equal(puzzles[0].gridSize, 3);
  });

  await runTest('TC-CONT-03: Google Sheets ID extractor parses Sheet ID and GID cleanly', () => {
    const sheet = extractGoogleSheetId('https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit#gid=42');
    assert.deepEqual(sheet, { sheetId: '1AbCdEfGhIjKlMnOpQrStUvWxYz', gid: '42' });
    assert.equal(extractGoogleSheetId(''), null);
  });

  // =========================================================================
  console.log('\n--- Suite 05: Room Codes, QR Code SVG & Live P2P Messaging (REQ-HOST-001, 002, 006, 008) ---');

  await runTest('TC-HOST-01: Production generateRoomCode & normalizeRoomCode + STAGE_SEQUENCE', () => {
    const pattern = /^70[2-9A-HJ-NP-Z]{2}$/;
    for (let i = 0; i < 50; i++) {
      const code = generateRoomCode();
      assert.ok(pattern.test(code), `Invalid code: ${code}`);
    }
    assert.equal(normalizeRoomCode(' 70ab! '), '70AB');
    assert.ok(pattern.test(normalizeRoomCode('   ')));
    assert.deepEqual(STAGE_SEQUENCE, ['LOBBY', 'MEMORY', 'PUZZLE', 'TRIVIA', 'QUOTES', 'WISHES', 'FINALE']);
  });

  await runTest('TC-HOST-02: Local QRCodeSVG renders valid ISO/IEC 18004 SVG without external API', () => {
    const svgHtml = renderToStaticMarkup(
      React.createElement(QRCodeSVG, {
        value: 'https://alphakate.github.io/Mom70PartyApp/?room=70AB&v=7.0',
        size: 200,
      })
    );
    assert.ok(svgHtml.startsWith('<svg'), 'QRCodeSVG must render an <svg>');
    assert.ok(svgHtml.includes('viewBox='), 'QR SVG must have viewBox');
    assert.ok(svgHtml.includes('<path') || svgHtml.includes('<rect'), 'QR SVG must draw modules');
  });

  await runTest('TC-P2P-01: HostP2PManager <-> PlayerP2PClient full message round-trip (JOIN, STATE, PROGRESS, ANSWER, WISH)', async () => {
    const hostReceived = [];
    const playerReceivedStates = [];

    const host = new HostP2PManager('70T1', (msg) => {
      hostReceived.push(msg);
    });
    const player = new PlayerP2PClient('70T1', 'player-test-1', (state) => {
      playerReceivedStates.push(state);
    });

    try {
      // 1. Player joins
      player.send({
        type: 'PLAYER_JOIN',
        payload: { id: 'player-test-1', name: 'Katy', avatar: 'fairy_nap' },
      });
      await new Promise((r) => setTimeout(r, 20));
      assert.ok(hostReceived.some((m) => m.type === 'PLAYER_JOIN' && m.payload.name === 'Katy'));

      // 2. Host broadcasts state
      host.broadcast({
        roomCode: '70T1',
        phase: 'MEMORY',
        isPaused: false,
        currentQuestionIndex: 0,
        revealAnswer: false,
        roundStartTime: Date.now(),
        players: {
          'player-test-1': {
            id: 'player-test-1',
            name: 'Katy',
            avatar: 'fairy_nap',
            score: 0,
            progress: 0,
            completedCurrentGame: false,
            connected: true,
          },
        },
        wishes: [],
        content: DEFAULT_GAME_CONTENT,
      });
      await new Promise((r) => setTimeout(r, 20));
      assert.ok(playerReceivedStates.length >= 1, 'Player must receive broadcasted GameState');
      assert.equal(playerReceivedStates[playerReceivedStates.length - 1].phase, 'MEMORY');

      // 3. Player reports progress, answer, and wish
      player.send({
        type: 'PLAYER_PROGRESS',
        payload: { playerId: 'player-test-1', progress: 100, scoreDelta: 450, completed: true },
      });
      player.send({
        type: 'PLAYER_ANSWER',
        payload: { playerId: 'player-test-1', questionIndex: 0, answerIndex: 1, timeMs: 3200 },
      });
      player.send({
        type: 'PLAYER_WISH',
        payload: {
          id: 'w-selfie-1',
          playerId: 'player-test-1',
          playerName: 'Katy',
          avatar: 'fairy_nap',
          text: 'מזל טוב אמא! ❤️',
          selfieDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
      });
      await new Promise((r) => setTimeout(r, 20));

      assert.ok(hostReceived.some((m) => m.type === 'PLAYER_PROGRESS' && m.payload.completed === true));
      assert.ok(hostReceived.some((m) => m.type === 'PLAYER_ANSWER' && m.payload.answerIndex === 1));
      assert.ok(
        hostReceived.some(
          (m) =>
            m.type === 'PLAYER_WISH' &&
            m.payload.text.includes('מזל טוב') &&
            m.payload.selfieDataUrl?.startsWith('data:image/jpeg;base64,')
        )
      );
    } finally {
      player.destroy();
      host.destroy();
    }
  });

  // =========================================================================
  console.log('\n--- Suite 06: Multi-Wish (Up to 5) & Live Selfie Support (REQ-WISH-001..003) ---');

  await runTest('TC-WISH-01: Player can submit up to 5 distinct wishes and 6th is cleanly blocked', () => {
    assert.equal(MAX_WISHES_PER_PLAYER, 5);
    let wishes = [];

    for (let i = 1; i <= 5; i++) {
      const res = addPlayerWish(wishes, {
        id: `p1-w-${i}`,
        playerId: 'p1',
        playerName: 'Katy',
        avatar: 'fairy_nap',
        text: `ברכה מספר ${i}`,
        selfieDataUrl: i % 2 === 1 ? 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' : undefined,
      });
      assert.equal(res.added, true, `Wish #${i} must be accepted`);
      assert.equal(res.countForPlayer, i);
      wishes = res.wishes;
    }

    assert.equal(wishes.length, 5);
    assert.equal(wishes.filter((w) => w.selfieDataUrl).length, 3);

    // 6th wish from same player must be blocked
    const sixth = addPlayerWish(wishes, {
      id: 'p1-w-6',
      playerId: 'p1',
      playerName: 'Katy',
      avatar: 'fairy_nap',
      text: 'ברכה שישית',
    });
    assert.equal(sixth.added, false, '6th wish for the same player must be rejected');
    assert.equal(sixth.wishes.length, 5);

    // Another player can still add wishes independently
    const otherPlayer = addPlayerWish(wishes, {
      id: 'p2-w-1',
      playerId: 'p2',
      playerName: 'Dan',
      avatar: 'hero_hug',
      text: 'מזל טוב!',
    });
    assert.equal(otherPlayer.added, true);
    assert.equal(otherPlayer.wishes.length, 6);
  });

  await runTest('TC-WISH-02: Player can edit an existing wish (text & selfie) even at 5/5 quota', () => {
    let wishes = [];
    for (let i = 1; i <= 5; i++) {
      wishes = addPlayerWish(wishes, {
        id: `p1-w-${i}`,
        playerId: 'p1',
        playerName: 'Katy',
        avatar: 'fairy_nap',
        text: `Wish ${i}`,
      }).wishes;
    }

    const edited = addPlayerWish(wishes, {
      id: 'p1-w-3',
      playerId: 'p1',
      playerName: 'Katy',
      avatar: 'fairy_nap',
      text: 'Updated Wish 3 ❤️',
      selfieDataUrl: 'data:image/jpeg;base64,UPDATED',
    });

    assert.equal(edited.updated, true);
    assert.equal(edited.added, false);
    assert.equal(edited.wishes.length, 5);
    const updatedItem = edited.wishes.find((w) => w.id === 'p1-w-3');
    assert.equal(updatedItem?.text, 'Updated Wish 3 ❤️');
    assert.equal(updatedItem?.selfieDataUrl, 'data:image/jpeg;base64,UPDATED');
  });

  await runTest('TC-WISH-03: sanitizeSelfieDataUrl validates data:image/ prefix and P2P size cap', () => {
    assert.equal(
      sanitizeSelfieDataUrl('data:image/jpeg;base64,abc123'),
      'data:image/jpeg;base64,abc123'
    );
    assert.equal(sanitizeSelfieDataUrl('https://evil.example/img.jpg'), undefined);
    assert.equal(sanitizeSelfieDataUrl('javascript:alert(1)'), undefined);
    const oversized = `data:image/jpeg;base64,${'A'.repeat(MAX_SELFIE_DATA_URL_LENGTH + 10)}`;
    assert.equal(sanitizeSelfieDataUrl(oversized), undefined);
  });

  // =========================================================================
  console.log('\n--- Suite 07: Large Multi-Photo Memory Game (10–12 Photos), Wire Dedup & WebRTC Chunking ---');

  await runTest('TC-MEDIA-01: Memory Game supports 10–12 uploaded photos without truncation at 8', () => {
    assert.equal(MAX_MEMORY_PHOTO_PAIRS, 12);
    const tenPhotos = Array.from({ length: 10 }, (_, i) => `data:image/jpeg;base64,PHOTO_${i}_${'X'.repeat(100)}`);
    const pairs10 = buildMemoryPairsFromDrivePhotos(tenPhotos);
    assert.equal(pairs10.length, 10, 'All 10 photos must become 10 memory pairs (20 cards)');

    const fourteenPhotos = Array.from({ length: 14 }, (_, i) => `data:image/jpeg;base64,PHOTO_${i}`);
    const pairsCapped = buildMemoryPairsFromDrivePhotos(fourteenPhotos);
    assert.equal(pairsCapped.length, 12, 'Must cleanly cap at 12 pairs (24 cards)');
  });

  await runTest('TC-MEDIA-02: Wire packing deduplicates 10 photos (3x reduction) and delta omits content (<2KB)', () => {
    const tenPhotos = Array.from(
      { length: 10 },
      (_, i) => `data:image/jpeg;base64,${String(i).padStart(2, '0')}${'A'.repeat(24000)}`
    );
    const content = {
      ...DEFAULT_GAME_CONTENT,
      memoryPairs: buildMemoryPairsFromDrivePhotos(tenPhotos),
      puzzles: buildPuzzlesFromDrivePhotos(tenPhotos),
    };
    const state = {
      roomCode: '70M1',
      phase: 'MEMORY',
      isPaused: false,
      currentQuestionIndex: 0,
      revealAnswer: false,
      roundStartTime: Date.now(),
      players: {},
      wishes: [],
      content,
    };

    const rawSize = JSON.stringify(state).length;
    const packedFull = packGameStateForWire(state, 1, false);
    const packedFullSize = JSON.stringify(packedFull).length;
    assert.equal(packedFull.mediaTable?.length, 10, '10 photos must be stored only ONCE in mediaTable');
    assert.ok(
      packedFullSize < rawSize * 0.45,
      `Expected >2x dedup reduction (raw=${rawSize}, packed=${packedFullSize})`
    );

    const unpackedFull = unpackGameStateFromWire(packedFull, null, -1);
    assert.equal(unpackedFull.needsFullSync, false);
    assert.equal(unpackedFull.state?.content.memoryPairs[9].imageA, tenPhotos[9]);
    assert.equal(unpackedFull.state?.content.puzzles[9].imageUrl, tenPhotos[9]);

    const packedLite = packGameStateForWire(state, 1, true);
    const liteSize = JSON.stringify(packedLite).length;
    assert.ok(liteSize < 2000, `Expected lightweight delta <2KB, got ${liteSize} bytes`);

    const unpackedLite = unpackGameStateFromWire(packedLite, unpackedFull.state.content, 1);
    assert.equal(unpackedLite.needsFullSync, false);
    assert.equal(unpackedLite.state?.content.memoryPairs.length, 10);

    // Unseen version triggers full sync request
    const missedSync = unpackGameStateFromWire(packedLite, null, -1);
    assert.equal(missedSync.needsFullSync, true);
  });

  await runTest('TC-MEDIA-03: WebRTC chunking splits & reassembles 300KB+ 10-photo payload cleanly', () => {
    const bigPayload = {
      __mom70: true,
      msgId: 'chunk-test',
      sender: 'host',
      data: 'Z'.repeat(300000),
    };
    const chunks = splitIntoChunks(bigPayload, 32768);
    assert.ok(chunks && chunks.length >= 10, '300KB payload must split into >=10 chunks of 32KB');

    const reassembler = new ChunkReassembler();
    let result = null;
    for (const chunk of chunks) {
      result = reassembler.push(chunk);
    }
    assert.deepEqual(result, bigPayload);
  });

  await runTest('TC-MEDIA-04: HostP2PManager <-> PlayerP2PClient syncs 10-photo state + late joiner recovery', async () => {
    const tenPhotos = Array.from(
      { length: 10 },
      (_, i) => `data:image/jpeg;base64,${String(i).padStart(2, '0')}${'B'.repeat(20000)}`
    );
    const content = {
      ...DEFAULT_GAME_CONTENT,
      memoryPairs: buildMemoryPairsFromDrivePhotos(tenPhotos),
      puzzles: buildPuzzlesFromDrivePhotos(tenPhotos),
    };

    const host = new HostP2PManager('70M2', () => {});
    const p1States = [];
    const p2States = [];
    const p1 = new PlayerP2PClient('70M2', 'p1', (s) => p1States.push(s));

    try {
      const baseState = {
        roomCode: '70M2',
        phase: 'MEMORY',
        isPaused: false,
        currentQuestionIndex: 0,
        revealAnswer: false,
        roundStartTime: Date.now(),
        players: {},
        wishes: [],
        content,
      };

      // Broadcast 1: full content (10 photos)
      host.broadcast(baseState);
      // Broadcast 2: lightweight delta (progress update, same content ref)
      host.broadcast({ ...baseState, isPaused: true });
      await new Promise((r) => setTimeout(r, 25));

      assert.ok(p1States.length >= 2);
      assert.equal(p1States[p1States.length - 1].isPaused, true);
      assert.equal(p1States[p1States.length - 1].content.memoryPairs.length, 10);
      assert.equal(p1States[p1States.length - 1].content.memoryPairs[9].imageB, tenPhotos[9]);

      // Late joiner p2 connects AFTER full broadcast and receives full content automatically via PING
      const p2 = new PlayerP2PClient('70M2', 'p2', (s) => p2States.push(s));
      try {
        await new Promise((r) => setTimeout(r, 30));
        assert.ok(p2States.length >= 1, 'Late joiner must receive full 10-photo state via PING');
        assert.equal(p2States[p2States.length - 1].content.memoryPairs.length, 10);
      } finally {
        p2.destroy();
      }
    } finally {
      p1.destroy();
      host.destroy();
    }
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
