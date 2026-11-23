import {
  GameContent,
  MemoryPair,
  PuzzleItem,
  TriviaQuestion,
} from '../types/game';

const DEFAULT_SPOTIFY_ID = '37i9dQZF1DXdPec7aLTmlC';
const DEFAULT_SPOTIFY_URL = `https://open.spotify.com/playlist/${DEFAULT_SPOTIFY_ID}`;
const DEFAULT_SPOTIFY_EMBED = `https://open.spotify.com/embed/playlist/${DEFAULT_SPOTIFY_ID}?utm_source=generator`;

function svgToDataUri(svgContent: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent.trim())}`;
}

function makeCardSvg(bgFrom: string, bgTo: string, accent: string, innerSvg: string): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bgFrom}" />
          <stop offset="100%" stop-color="${bgTo}" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" rx="28" fill="url(#g)" />
      <rect x="12" y="12" width="216" height="216" rx="22" fill="none" stroke="${accent}" stroke-width="5" stroke-dasharray="10 6" opacity="0.55" />
      ${innerSvg}
    </svg>
  `);
}

// 12 inline SVG card illustrations forming 6 harmonious pairs for MemoryGame
const SVG_CROWN = makeCardSvg(
  '#fff1f2',
  '#ffe4e6',
  '#f43f5e',
  `
  <path d="M48 156 L58 84 L96 118 L120 70 L144 118 L182 84 L192 156 Z" fill="#fbbf24" stroke="#b45309" stroke-width="5" stroke-linejoin="round"/>
  <rect x="48" y="156" width="144" height="20" rx="8" fill="#f59e0b" stroke="#b45309" stroke-width="4"/>
  <circle cx="58" cy="78" r="9" fill="#fb7185"/>
  <circle cx="120" cy="64" r="11" fill="#f43f5e"/>
  <circle cx="182" cy="78" r="9" fill="#fb7185"/>
  <text x="120" y="143" text-anchor="middle" font-size="34" font-weight="bold" font-family="Arial,sans-serif" fill="#78350f">70</text>
  `
);

const SVG_CAKE = makeCardSvg(
  '#fff1f2',
  '#ffe4e6',
  '#f43f5e',
  `
  <rect x="64" y="132" width="112" height="52" rx="12" fill="#fda4af" stroke="#be123c" stroke-width="4"/>
  <rect x="82" y="96" width="76" height="38" rx="10" fill="#fecdd3" stroke="#be123c" stroke-width="4"/>
  <path d="M64 146 Q80 158 96 146 Q112 158 128 146 Q144 158 160 146 L176 146" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
  <rect x="103" y="66" width="10" height="30" rx="3" fill="#fbbf24"/>
  <rect x="127" y="66" width="10" height="30" rx="3" fill="#38bdf8"/>
  <path d="M108 52 Q114 60 108 66 Q102 60 108 52 Z" fill="#f97316"/>
  <path d="M132 52 Q138 60 132 66 Q126 60 132 52 Z" fill="#f97316"/>
  <rect x="50" y="184" width="140" height="10" rx="5" fill="#fb7185"/>
  `
);

const SVG_COFFEE = makeCardSvg(
  '#fef3c7',
  '#fde68a',
  '#d97706',
  `
  <path d="M70 104 H158 V154 C158 176 140 190 114 190 C88 190 70 176 70 154 Z" fill="#ffffff" stroke="#92400e" stroke-width="5"/>
  <path d="M158 116 H174 C186 116 190 130 190 138 C190 148 184 160 172 160 H158" fill="none" stroke="#92400e" stroke-width="6"/>
  <ellipse cx="114" cy="104" rx="44" ry="11" fill="#78350f"/>
  <path d="M96 82 Q88 68 98 56" fill="none" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
  <path d="M118 80 Q110 64 120 50" fill="none" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
  <path d="M140 82 Q132 68 142 56" fill="none" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
  `
);

const SVG_PASTRY = makeCardSvg(
  '#fef3c7',
  '#fde68a',
  '#d97706',
  `
  <ellipse cx="120" cy="150" rx="68" ry="30" fill="#f59e0b" stroke="#92400e" stroke-width="5"/>
  <path d="M62 145 Q84 98 120 96 Q156 98 178 145" fill="#fbbf24" stroke="#92400e" stroke-width="5"/>
  <path d="M92 104 Q102 135 96 174" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
  <path d="M148 104 Q138 135 144 174" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
  <circle cx="120" cy="84" r="11" fill="#e11d48"/>
  `
);

const SVG_SUN = makeCardSvg(
  '#e0f2fe',
  '#bae6fd',
  '#0284c7',
  `
  <circle cx="120" cy="106" r="38" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
  <line x1="120" y1="44" x2="120" y2="58" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
  <line x1="120" y1="154" x2="120" y2="168" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
  <line x1="58" y1="106" x2="72" y2="106" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
  <line x1="168" y1="106" x2="182" y2="106" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
  <path d="M40 180 Q80 162 120 180 Q160 198 200 180 L200 208 L40 208 Z" fill="#0ea5e9"/>
  `
);

const SVG_SUITCASE = makeCardSvg(
  '#e0f2fe',
  '#bae6fd',
  '#0284c7',
  `
  <path d="M96 82 V64 C96 58 100 54 106 54 H134 C140 54 144 58 144 64 V82" fill="none" stroke="#0369a1" stroke-width="7"/>
  <rect x="56" y="82" width="128" height="96" rx="16" fill="#38bdf8" stroke="#0369a1" stroke-width="5"/>
  <line x1="88" y1="82" x2="88" y2="178" stroke="#fbbf24" stroke-width="9"/>
  <line x1="152" y1="82" x2="152" y2="178" stroke="#fbbf24" stroke-width="9"/>
  <circle cx="120" cy="130" r="14" fill="#fef08a"/>
  `
);

const SVG_FLOWERS = makeCardSvg(
  '#dcfce7',
  '#bbf7d0',
  '#16a34a',
  `
  <line x1="120" y1="115" x2="120" y2="188" stroke="#15803d" stroke-width="7" stroke-linecap="round"/>
  <path d="M120 154 Q90 144 86 124 Q108 124 120 148" fill="#22c55e"/>
  <path d="M120 146 Q150 136 154 116 Q132 116 120 140" fill="#22c55e"/>
  <circle cx="120" cy="72" r="18" fill="#f43f5e"/>
  <circle cx="96" cy="92" r="18" fill="#fb7185"/>
  <circle cx="144" cy="92" r="18" fill="#fb7185"/>
  <circle cx="104" cy="116" r="18" fill="#fda4af"/>
  <circle cx="136" cy="116" r="18" fill="#fda4af"/>
  <circle cx="120" cy="96" r="16" fill="#facc15"/>
  `
);

const SVG_HEART = makeCardSvg(
  '#dcfce7',
  '#bbf7d0',
  '#16a34a',
  `
  <path d="M120 184 C120 184 52 138 52 92 C52 66 72 52 94 52 C108 52 116 60 120 68 C124 60 132 52 146 52 C168 52 188 66 188 92 C188 138 120 184 120 184 Z" fill="#e11d48" stroke="#9f1239" stroke-width="5"/>
  <circle cx="92" cy="84" r="9" fill="#fda4af" opacity="0.7"/>
  `
);

const SVG_MUSIC = makeCardSvg(
  '#f3e8ff',
  '#e9d5ff',
  '#9333ea',
  `
  <circle cx="120" cy="120" r="62" fill="#3b0764" stroke="#a855f7" stroke-width="5"/>
  <circle cx="120" cy="120" r="24" fill="#f472b6"/>
  <circle cx="120" cy="120" r="7" fill="#ffffff"/>
  <path d="M138 56 V112 M138 56 L168 48 V100" fill="none" stroke="#facc15" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  `
);

const SVG_STAR = makeCardSvg(
  '#f3e8ff',
  '#e9d5ff',
  '#9333ea',
  `
  <polygon points="120,46 142,94 194,100 155,136 166,188 120,162 74,188 85,136 46,100 98,94" fill="#fbbf24" stroke="#b45309" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="106" cy="112" r="5" fill="#78350f"/>
  <circle cx="134" cy="112" r="5" fill="#78350f"/>
  <path d="M106 132 Q120 144 134 132" fill="none" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
  `
);

const SVG_ALBUM = makeCardSvg(
  '#ffedd5',
  '#fed7aa',
  '#ea580c',
  `
  <rect x="64" y="54" width="116" height="134" rx="12" fill="#fb923c" stroke="#9a3412" stroke-width="5"/>
  <rect x="54" y="54" width="22" height="134" rx="6" fill="#c2410c"/>
  <rect x="92" y="82" width="68" height="54" rx="8" fill="#fff7ed" stroke="#9a3412" stroke-width="3"/>
  <circle cx="114" cy="103" r="9" fill="#f43f5e"/>
  <circle cx="138" cy="103" r="9" fill="#0ea5e9"/>
  <path d="M100 128 Q126 112 152 128" fill="#22c55e"/>
  `
);

const SVG_GIFT = makeCardSvg(
  '#ffedd5',
  '#fed7aa',
  '#ea580c',
  `
  <rect x="62" y="102" width="116" height="84" rx="10" fill="#fb7185" stroke="#be123c" stroke-width="5"/>
  <rect x="54" y="80" width="132" height="28" rx="8" fill="#f43f5e" stroke="#be123c" stroke-width="5"/>
  <rect x="108" y="80" width="24" height="106" fill="#fde047"/>
  <path d="M120 80 C96 52 72 62 84 80 C94 86 120 80 120 80 Z" fill="#facc15" stroke="#b45309" stroke-width="4"/>
  <path d="M120 80 C144 52 168 62 156 80 C146 86 120 80 120 80 Z" fill="#facc15" stroke="#b45309" stroke-width="4"/>
  `
);

// 2 square 400x400 illustrations with distinct features per tile for 3x3 PuzzleGame slicing
const PUZZLE_CAKE_SVG = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fde68a"/>
        <stop offset="55%" stop-color="#fbcfe8"/>
        <stop offset="100%" stop-color="#e0e7ff"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#sky)"/>
    <!-- Festive bunting across top -->
    <path d="M0 32 Q200 72 400 32" fill="none" stroke="#be185d" stroke-width="4"/>
    <polygon points="24,36 62,42 40,86" fill="#ef4444"/>
    <polygon points="88,46 128,50 106,96" fill="#3b82f6"/>
    <polygon points="154,53 196,55 174,102" fill="#10b981"/>
    <polygon points="212,55 254,53 234,102" fill="#f59e0b"/>
    <polygon points="278,50 318,46 298,96" fill="#8b5cf6"/>
    <polygon points="342,42 380,36 362,86" fill="#ec4899"/>
    <!-- Left & Right Balloons -->
    <ellipse cx="64" cy="170" rx="34" ry="44" fill="#f43f5e" stroke="#9f1239" stroke-width="4"/>
    <path d="M64 214 Q52 250 68 286" fill="none" stroke="#9f1239" stroke-width="3"/>
    <ellipse cx="336" cy="166" rx="34" ry="44" fill="#0ea5e9" stroke="#0369a1" stroke-width="4"/>
    <path d="M336 210 Q348 248 330 286" fill="none" stroke="#0369a1" stroke-width="3"/>
    <ellipse cx="96" cy="118" rx="26" ry="32" fill="#fbbf24" stroke="#b45309" stroke-width="3"/>
    <ellipse cx="304" cy="116" rx="26" ry="32" fill="#a855f7" stroke="#6b21a8" stroke-width="3"/>
    <!-- Big 70 Cake in center -->
    <rect x="92" y="254" width="216" height="86" rx="18" fill="#fb7185" stroke="#be123c" stroke-width="5"/>
    <rect x="122" y="186" width="156" height="72" rx="14" fill="#fda4af" stroke="#be123c" stroke-width="5"/>
    <path d="M92 276 Q116 296 140 276 Q164 296 188 276 Q212 296 236 276 Q260 296 284 276 L308 276" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>
    <rect x="70" y="340" width="260" height="22" rx="11" fill="#f59e0b" stroke="#92400e" stroke-width="4"/>
    <!-- Candles 7 and 0 -->
    <rect x="174" y="138" width="14" height="48" rx="4" fill="#38bdf8" stroke="#0369a1" stroke-width="3"/>
    <rect x="212" y="138" width="14" height="48" rx="4" fill="#34d399" stroke="#047857" stroke-width="3"/>
    <path d="M181 114 Q190 128 181 138 Q172 128 181 114 Z" fill="#f97316"/>
    <path d="M219 114 Q228 128 219 138 Q210 128 219 114 Z" fill="#f97316"/>
    <text x="200" y="240" text-anchor="middle" font-size="48" font-weight="bold" font-family="Arial,sans-serif" fill="#881337">70</text>
    <!-- Bottom grass & gifts -->
    <rect x="28" y="316" width="54" height="54" rx="8" fill="#22c55e" stroke="#15803d" stroke-width="4"/>
    <rect x="49" y="316" width="12" height="54" fill="#fde047"/>
    <rect x="318" y="316" width="54" height="54" rx="8" fill="#8b5cf6" stroke="#5b21b6" stroke-width="4"/>
    <rect x="339" y="316" width="12" height="54" fill="#f472b6"/>
  </svg>
`);

const PUZZLE_TREE_SVG = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="meadowSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7dd3fc"/>
        <stop offset="70%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#fef9c3"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#meadowSky)"/>
    <!-- Sun top-left, Rainbow top-right -->
    <circle cx="64" cy="64" r="38" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>
    <path d="M220 120 A130 130 0 0 1 395 120" fill="none" stroke="#ef4444" stroke-width="10"/>
    <path d="M234 120 A116 116 0 0 1 384 120" fill="none" stroke="#f59e0b" stroke-width="10"/>
    <path d="M248 120 A102 102 0 0 1 372 120" fill="none" stroke="#22c55e" stroke-width="10"/>
    <path d="M262 120 A88 88 0 0 1 360 120" fill="none" stroke="#3b82f6" stroke-width="10"/>
    <!-- Rolling green hill -->
    <path d="M0 320 Q200 280 400 320 L400 400 L0 400 Z" fill="#4ade80" stroke="#16a34a" stroke-width="4"/>
    <!-- Tree trunk & roots -->
    <path d="M172 336 C178 270 180 220 170 180 H230 C220 220 222 270 228 336 Z" fill="#92400e" stroke="#451a03" stroke-width="5"/>
    <!-- Lush canopy -->
    <circle cx="200" cy="145" r="88" fill="#22c55e" stroke="#15803d" stroke-width="5"/>
    <circle cx="132" cy="166" r="56" fill="#16a34a" stroke="#15803d" stroke-width="4"/>
    <circle cx="268" cy="166" r="56" fill="#16a34a" stroke="#15803d" stroke-width="4"/>
    <circle cx="200" cy="92" r="54" fill="#4ade80"/>
    <!-- Golden hearts in tree -->
    <path d="M148 158 C148 158 124 140 124 124 C124 114 134 108 142 114 C146 117 148 121 148 121 C148 121 150 117 154 114 C162 108 172 114 172 124 C172 140 148 158 148 158 Z" fill="#f43f5e"/>
    <path d="M254 156 C254 156 230 138 230 122 C230 112 240 106 248 112 C252 115 254 119 254 119 C254 119 256 115 260 112 C268 106 278 112 278 122 C278 138 254 156 254 156 Z" fill="#fbbf24"/>
    <path d="M200 116 C200 116 176 98 176 82 C176 72 186 66 194 72 C198 75 200 79 200 79 C200 79 202 75 206 72 C214 66 224 72 224 82 C224 98 200 116 200 116 Z" fill="#ec4899"/>
    <text x="200" y="206" text-anchor="middle" font-size="38" font-weight="bold" font-family="Arial,sans-serif" fill="#fef08a">70</text>
    <!-- Flowers at bottom -->
    <circle cx="54" cy="346" r="14" fill="#f43f5e"/>
    <circle cx="54" cy="346" r="6" fill="#fde047"/>
    <circle cx="116" cy="356" r="14" fill="#8b5cf6"/>
    <circle cx="116" cy="356" r="6" fill="#fde047"/>
    <circle cx="294" cy="352" r="14" fill="#ec4899"/>
    <circle cx="294" cy="352" r="6" fill="#fde047"/>
    <circle cx="348" cy="342" r="14" fill="#3b82f6"/>
    <circle cx="348" cy="342" r="6" fill="#fde047"/>
  </svg>
`);

export const DEFAULT_GAME_CONTENT: GameContent = {
  momName: {
    he: 'אמא היקרה',
    ru: 'Дорогая мама',
    en: 'Dear Mom',
  },
  driveFolderUrl: '',
  sheetsUrl: '',
  spotifyUrl: DEFAULT_SPOTIFY_URL,
  memoryPairs: [
    {
      id: 'pair-1',
      imageA: SVG_CROWN,
      labelA: { he: 'מלכת יום ההולדת 70', ru: 'Королева юбилея 70', en: '70th Birthday Crown' },
      imageB: SVG_CAKE,
      labelB: { he: 'עוגת החגיגה', ru: 'Праздничный торт', en: 'Celebration Cake' },
    },
    {
      id: 'pair-2',
      imageA: SVG_COFFEE,
      labelA: { he: 'קפה של בוקר', ru: 'Утренний кофе', en: 'Morning Coffee' },
      imageB: SVG_PASTRY,
      labelB: { he: 'מאפה חם מהמטבח', ru: 'Свежая выпечка', en: 'Homemade Pastry' },
    },
    {
      id: 'pair-3',
      imageA: SVG_SUN,
      labelA: { he: 'שמש וים', ru: 'Солнце и море', en: 'Sun & Sea' },
      imageB: SVG_SUITCASE,
      labelB: { he: 'טיול משפחתי', ru: 'Семейное путешествие', en: 'Family Trip' },
    },
    {
      id: 'pair-4',
      imageA: SVG_FLOWERS,
      labelA: { he: 'זר פרחים רענן', ru: 'Букет цветов', en: 'Flower Bouquet' },
      imageB: SVG_HEART,
      labelB: { he: 'לב אוהב', ru: 'Любящее сердце', en: 'Loving Heart' },
    },
    {
      id: 'pair-5',
      imageA: SVG_MUSIC,
      labelA: { he: 'השירים האהובים', ru: 'Любимая музыка', en: 'Favorite Songs' },
      imageB: SVG_STAR,
      labelB: { he: 'הכוכבת שלנו', ru: 'Наша звезда', en: 'Our Shining Star' },
    },
    {
      id: 'pair-6',
      imageA: SVG_ALBUM,
      labelA: { he: 'אלבום זיכרונות', ru: 'Семейный альбом', en: 'Memory Album' },
      imageB: SVG_GIFT,
      labelB: { he: 'מתנה באהבה', ru: 'Подарок с любовью', en: 'Gift of Love' },
    },
  ],
  puzzles: [
    {
      id: 'puzzle-1',
      imageUrl: PUZZLE_CAKE_SVG,
      title: {
        he: 'מסיבת ה-70 הגדולה',
        ru: 'Большой праздник 70-летия',
        en: 'The Grand 70th Cake Party',
      },
      story: {
        he: '70 שנים של רגעים מתוקים, חגיגות משפחתיות ונרות שמאירים לכולנו את הדרך!',
        ru: '70 лет сладких мгновений, семейных застолий и огоньков, согревающих всех нас!',
        en: '70 years of sweet milestones, family gatherings, and candles lighting up every room!',
      },
      gridSize: 3,
    },
    {
      id: 'puzzle-2',
      imageUrl: PUZZLE_TREE_SVG,
      title: {
        he: 'עץ המשפחה והאהבה',
        ru: 'Семейное дерево любви',
        en: 'The Family Tree of Love',
      },
      story: {
        he: 'בזכות השורשים החזקים שנטעת, המשפחה כולה פורחת בשמחה ובאהבה.',
        ru: 'Благодаря твоей заботе и крепким корням вся наша семья цветёт в любви и радости.',
        en: 'Thanks to the warm roots you planted, our entire family blooms with joy and love.',
      },
      gridSize: 3,
    },
  ],
  triviaQuestions: [
    {
      id: 't-1',
      category: 'trivia',
      question: {
        he: 'איך אמא אוהבת לפתוח כל בוקר לפני שמתחיל היום?',
        ru: 'С чего мама больше всего любит начинать каждое утро?',
        en: 'How does Mom love to start every single morning?',
      },
      options: {
        he: ['קפה חם ושקט בגינה או במרפסת', 'ריצת מרתון ב-5 בבוקר', 'סידור ארונות מיידי', 'משחק שחמט תחרותי'],
        ru: ['Чашка тёплого кофе в тишине', 'Марафон в 5 утра', 'Генеральная уборка шкафа', 'Турнир по шахматам'],
        en: ['A warm coffee in quiet morning peace', 'A 5 AM marathon run', 'Reorganizing every closet', 'Speed chess tournament'],
      },
      correctIndex: 0,
      funFact: {
        he: 'לפני הקפה של הבוקר — כדאי לתת לאמא עוד 5 דקות של שקט!',
        ru: 'Пока мама не допила утренний кофе — лучше не задавать сложных вопросов!',
        en: 'Nothing really starts in the house until Mom finishes that first peaceful cup of coffee!',
      },
    },
    {
      id: 't-2',
      category: 'trivia',
      question: {
        he: 'מה תמיד קורה כשנכנסים אל אמא הביתה?',
        ru: 'Что всегда происходит, как только гости заходят к маме домой?',
        en: 'What ALWAYS happens the moment you walk into Mom’s house?',
      },
      options: {
        he: ['ממלאים שאלון כניסה', 'תוך שתי דקות יש אוכל חם ותה על השולחן', 'מכבים את כל האורות', 'מודדים דופק בכניסה'],
        ru: ['Выдают анкету гостя', 'Через 2 минуты на столе уже угощения и чай', 'Выключают весь свет', 'Проверяют пароль на входе'],
        en: ['You sign a guest waiver', 'Snacks, fruit, and tea appear within two minutes', 'Everyone stays strictly silent', 'Phones are locked in a safe'],
      },
      correctIndex: 1,
      funFact: {
        he: 'אי אפשר לצאת מאמא בלי לטעום לפחות שלושה דברים טעימים וקופסה לדרך.',
        ru: 'Уйти от мамы голодным и без контейнера с собой — физически невозможно!',
        en: 'Leaving Mom’s house without eating three courses AND taking leftovers is impossible!',
      },
    },
    {
      id: 't-3',
      category: 'trivia',
      question: {
        he: 'מה הדבר שאמא הכי גאה בו בכל 70 השנים האחרונות?',
        ru: 'Чем мама гордится больше всего за все 70 лет?',
        en: 'What is Mom proudest of across all 70 wonderful years?',
      },
      options: {
        he: ['אוסף בולים סודי', 'המשפחה, הילדים והנכדים המדהימים', 'שיא עולם בפתרון תשבצים', 'ציון 100 במבחן בתיכון'],
        ru: ['Тайной коллекцией марок', 'Своей любимой семьёй, детьми и внуками', 'Мировым рекордом по сканвордам', 'Школьной оценкой по физике'],
        en: ['A secret stamp collection', 'Her loving family, kids, and grandkids', 'A world record in crossword puzzles', 'A high school math trophy'],
      },
      correctIndex: 1,
      funFact: {
        he: 'כל שיחה עם אמא תמיד מגיעה בסוף לסיפור מתוק על המשפחה.',
        ru: 'Любой разговор с мамой всегда сводится к тёплым историям о близких.',
        en: 'Every conversation with Mom eventually circles back to a sweet story about the family.',
      },
    },
    {
      id: 't-4',
      category: 'trivia',
      question: {
        he: 'איזה שיר או מוזיקה מיד מעלים לאמא חיוך וגורמים לה לזוז?',
        ru: 'Какая музыка мгновенно поднимает маме настроение?',
        en: 'What kind of music instantly brings a smile to Mom’s face?',
      },
      options: {
        he: ['רוק כבד בעוצמה מלאה', 'קלאסיקות שמחות ושירים משפחתיים של פעם', 'מוזיקת מעליות בלבד', 'רעש של רכבת'],
        ru: ['Тяжёлый металл на полной громкости', 'Душевные ретро-хиты и семейные мелодии', 'Только музыка из лифта', 'Звуки стройки'],
        en: ['Heavy metal at max volume', 'Classic feel-good songs & timeless family favorites', 'Elevator muzak only', 'Traffic soundtracks'],
      },
      correctIndex: 1,
      funFact: {
        he: 'כשהשיר הנכון מתנגן, אמא תמיד הראשונה להצטרף לפזמון!',
        ru: 'Стоит зазвучать любимой мелодии — мама первой начинает подпевать!',
        en: 'As soon as a classic favorite comes on, Mom knows every lyric by heart!',
      },
    },
    {
      id: 't-5',
      category: 'trivia',
      question: {
        he: 'איזה סופר-פאוור סודי יש לאמא שאין לאף אחד אחר?',
        ru: 'Какой секретной суперсилой обладает мама?',
        en: 'What secret superpower does Mom have that nobody else can match?',
      },
      options: {
        he: ['למצוא תוך שנייה כל חפץ ש"הלך לאיבוד"', 'להיות בלתי נראית', 'לקרוא קוד בינארי בחושך', 'לעוף מעל בניינים'],
        ru: ['Находить за секунду любую «потерянную» вещь', 'Становиться невидимой', 'Читать двоичный код в темноте', 'Летать над крышами'],
        en: ['Finding any "lost" item in three seconds flat', 'Turning invisible', 'Reading binary code in the dark', 'Leaping tall buildings'],
      },
      correctIndex: 0,
      funFact: {
        he: 'אף אחד בבית לא מוצא כלום — עד שאמא נכנסת לחדר ומצביעה ישר על המקום.',
        ru: 'Никто не может ничего найти, пока не зайдёт мама и не покажет пальцем!',
        en: 'Nobody else can find the keys or glasses until Mom walks in and points right at them.',
      },
    },
    {
      id: 't-6',
      category: 'trivia',
      question: {
        he: 'מה אמא הכי תאהב לקבל ליום הולדתה ה-70?',
        ru: 'Какой подарок на 70-летие порадует маму больше всего?',
        en: 'What gift will make Mom’s 70th birthday truly unforgettable?',
      },
      options: {
        he: ['הוראות מס ל-2027', 'כל המשפחה ביחד, חיבוקים, צחוק ותמונות משותפות', 'שקט מוחלט לשבוע', 'מחשבון כיס אפור'],
        ru: ['Инструкцию к налоговой декларации', 'Всю семью рядом, объятия, смех и общие фото', 'Неделю полной тишины', 'Серый калькулятор'],
        en: ['A 400-page tax manual', 'The whole family together with hugs, laughter & photos', 'Total silence for a week', 'A beige pocket calculator'],
      },
      correctIndex: 1,
      funFact: {
        he: 'אין מתנה שווה יותר מהרגע הזה שבו כולנו חוגגים יחד!',
        ru: 'Главный подарок для мамы — когда вся семья собирается за одним столом!',
        en: 'Nothing beats having everyone together in one room laughing and celebrating!',
      },
    },
  ],
  quoteQuestions: [
    {
      id: 'q-1',
      category: 'quotes',
      question: {
        he: 'מישהו יוצא מהבית בערב קריר בלי סוודר. מה אמא הייתה אומרת?',
        ru: 'Кто-то выходит вечером из дома без кофты. Что скажет мама?',
        en: 'Someone steps outside on a cool evening without a jacket. What would Mom say?',
      },
      options: {
        he: ['"תיקח סוודר, אחר כך יהיה קר ותגיד שלא אמרתי!"', '"נהדר, רוח פרצים זה בריא לעצמות!"', '"תשאיר גם את הנעליים בבית!"', '"תעדכן אותי ב-Slack כשתגיע."'],
        ru: ['«Возьми кофту! Потом замёрзнешь и вспомнишь мои слова!»', '«Отлично, сквозняк полезен для здоровья!»', '«Можешь и ботинки дома оставить!»', '«Пришли отчёт в Slack, как дойдёшь.»'],
        en: ['"Take a sweater! You’ll get cold later and remember I told you!"', '"Great idea, freezing winds build character!"', '"Leave your shoes behind too!"', '"Ping me on Slack when you arrive."'],
      },
      correctIndex: 0,
      funFact: {
        he: 'וגם אם חם 28 מעלות בחוץ — סוודר בתיק אף פעם לא מזיק.',
        ru: 'Даже если на улице +28, лёгкая кофта в сумке по мнению мамы обязательна!',
        en: 'Even if it’s 80°F outside, bringing a light cardigan just in case is non-negotiable.',
      },
    },
    {
      id: 'q-2',
      category: 'quotes',
      question: {
        he: 'אורח אומר בנימוס: "אני ממש שבע, תודה!" — מה התגובה המיידית של אמא?',
        ru: 'Гость вежливо говорит: «Спасибо, я уже наелся!» Что мгновенно отвечает мама?',
        en: 'A guest politely says, "I’m completely full, thank you!" How does Mom immediately respond?',
      },
      options: {
        he: ['"מה פתאום שבע?! לא נגעת בכלום! קח עוד חתיכה קטנה!"', '"מצוין, אני מפנה הכול עכשיו!"', '"אז אין קינוח בכלל היום."', '"יופי, חסכת לי לשטוף צלחת."'],
        ru: ['«Какой наелся?! Ты же почти ничего не ел! Положи ещё кусочек!»', '«Отлично, убираю всё со стола!»', '«Тогда десерта сегодня не будет.»', '«Вот и славно, посуды меньше мыть.»'],
        en: ['"Full?! You barely touched your plate! Have just one more spoonful!"', '"Perfect, clearing everything away now!"', '"No dessert for anyone then!"', '"Awesome, less dishwashing for me."'],
      },
      correctIndex: 0,
      funFact: {
        he: 'אצל אמא הצלחת תמיד מתמלאת מחדש לפני שמספיקים לסיים את המשפט.',
        ru: 'У мамы добавка появляется на тарелке быстрее, чем вы успеваете договорить!',
        en: 'At Mom’s table, a second helping lands on your plate before you finish saying no.',
      },
    },
    {
      id: 'q-3',
      category: 'quotes',
      question: {
        he: 'כל המשפחה נעמדת לתמונה קבוצתית. מה המשפט הקבוע של אמא?',
        ru: 'Вся семья собирается для общего фото. Какую фразу скажет мама?',
        en: 'Everyone lines up for a family photo. What is Mom’s signature line?',
      },
      options: {
        he: ['"חכו רגע! תתקרבו, תסדרו את החולצה, תצלמו עוד אחת ליתר ביטחון!"', '"אל תחייכו, תשמרו על ארשת רצינית!"', '"בואו נצלם רק את הקיר מאחור."', '"תמונה אחת מטושטשת לגמרי מספיקה."'],
        ru: ['«Подождите! Станьте поближе, улыбнитесь — давайте ещё дубль на всякий случай!»', '«Не улыбайтесь, лица посерьёзнее!»', '«Сфотографируйте лучше стену.»', '«Хватит и одного размытого кадра.»'],
        en: ['"Wait! Squeeze closer, fix your collar, let’s take three more just in case!"', '"Nobody smile, look super serious!"', '"Actually, just photograph the wall."', '"One blurry shot is totally fine."'],
      },
      correctIndex: 0,
      funFact: {
        he: 'בזכות ה"עוד אחת ליתר ביטחון" יש לנו אלפי תמונות נהדרות היום!',
        ru: 'Именно благодаря «ещё одному кадру на всякий случай» у нас сегодня столько прекрасных фото!',
        en: 'Thanks to those "just one more" shots, we have our favorite family memories today!',
      },
    },
    {
      id: 'q-4',
      category: 'quotes',
      question: {
        he: 'מתקשרים לאמא אחרי נסיעה ארוכה ושוכחים לסמס. מה הדבר הראשון שהיא אומרת?',
        ru: 'Вы приехали после долгой дороги и забыли сразу написать. Что скажет мама?',
        en: 'You arrive home after a long drive and forget to text right away. What does Mom say?',
      },
      options: {
        he: ['"כבר דאגתי! מה הבעיה לשלוח הודעה קטנה של \'הגעתי\'?!"', '"איזה כיף ששכחת, ככה ישנתי יותר טוב."', '"בכלל לא שמתי לב שיצאת."', '"שלח לי פקס מחר בבוקר."'],
        ru: ['«Я же волновалась! Трудно написать короткое „Я дома“?!»', '«Замечательно, что не написал, я и не заметила.»', '«А ты куда-то уезжал?»', '«Пришли телеграмму на следующей неделе.»'],
        en: ['"I was worried sick! How hard is it to text \'Made it safe\'?!"', '"Glad you forgot, I didn’t even notice."', '"Wait, did you go somewhere?"', '"Send me a fax next Tuesday."'],
      },
      correctIndex: 0,
      funFact: {
        he: 'דאגה של אמא היא פשוט השם השני של אהבה אינסופית.',
        ru: 'Мамина тревога — это просто другой язык её огромной любви.',
        en: 'Mom worrying is simply her love language in action.',
      },
    },
    {
      id: 'q-5',
      category: 'quotes',
      question: {
        he: 'כששואלים את אמא מה היא רוצה שנביא לארוחת החג, מה היא עונה תמיד?',
        ru: 'Когда у мамы спрашивают, что принести к праздничному столу, что она отвечает?',
        en: 'When you ask Mom what to bring to a holiday dinner, what is her classic answer?',
      },
      options: {
        he: ['"כלום, רק תבואו! הכול כבר מוכן... טוב, אולי תביאו רק את עצמכם בזמן."', '"רשימה של 17 מנות גורמה בבקשה."', '"תביאו שולחן אוכל מהבית."', '"רק מגבונים וקרח."'],
        ru: ['«Ничего не надо, просто приходите! Всё уже готово — главное, не опаздывайте.»', '«Принесите 17 сложных блюд по списку.»', '«Захватите с собой обеденный стол.»', '«Только лёд и салфетки.»'],
        en: ['"Nothing at all, just bring yourselves! Everything’s ready... just arrive on time!"', '"Please bring 17 gourmet dishes."', '"Bring your own dining table."', '"Just ice cubes and napkins."'],
      },
      correctIndex: 0,
      funFact: {
        he: 'כשהיא אומרת "לא הכנתי כלום מיוחד" — השולחן עמוס ב-12 סלטים ושתי עוגות!',
        ru: 'Когда мама говорит «я ничего особенного не готовила» — на столе уже 12 блюд и два торта!',
        en: 'When Mom says "I barely cooked anything," expect a twelve-course feast!',
      },
    },
  ],
};

export function normalizeSpotifyEmbedUrl(url?: string): string {
  const trimmed = (url ?? '').trim();
  if (!trimmed) {
    return DEFAULT_SPOTIFY_EMBED;
  }

  // Handle spotify:playlist:ID or spotify:album:ID URI format
  const uriMatch = trimmed.match(/^spotify:(playlist|album|track|artist|show|episode):([a-zA-Z0-9]+)$/i);
  if (uriMatch) {
    const [, kind, id] = uriMatch;
    return `https://open.spotify.com/embed/${kind.toLowerCase()}/${id}?utm_source=generator`;
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname.includes('spotify.com')) {
      return DEFAULT_SPOTIFY_EMBED;
    }

    // Strip locale segments like /intl-he/ or /intl-en/ and optional /embed/
    const parts = parsed.pathname
      .split('/')
      .filter(Boolean)
      .filter((part) => !part.startsWith('intl-'));

    if (parts[0] === 'embed') {
      parts.shift();
    }

    if (parts.length >= 2) {
      const kind = parts[0].toLowerCase();
      const id = parts[1];
      const allowedKinds = new Set(['playlist', 'album', 'track', 'artist', 'show', 'episode']);
      if (allowedKinds.has(kind) && id) {
        return `https://open.spotify.com/embed/${kind}/${id}?utm_source=generator`;
      }
    }
  } catch {
    return DEFAULT_SPOTIFY_EMBED;
  }

  return DEFAULT_SPOTIFY_EMBED;
}

export function extractGoogleSheetId(url: string): { sheetId: string; gid?: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;

  const gidMatch = trimmed.match(/[?&#]gid=(\d+)/);
  return {
    sheetId: idMatch[1],
    gid: gidMatch?.[1],
  };
}

export function extractDriveFolderId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  if (folderMatch) return folderMatch[1];
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  return idMatch?.[1] ?? null;
}

export function normalizeDriveImageUrl(url?: string): string {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return '';

  // Convert Google Drive share links into direct embeddable image thumbnails
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (fileMatch) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1200`;
  }

  const openIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([a-zA-Z0-9-_]+)/);
  if (openIdMatch) {
    return `https://drive.google.com/thumbnail?id=${openIdMatch[1]}&sz=w1200`;
  }

  return trimmed;
}

function parseCsv(csvText: string): string[][] {
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i += 1) {
    const ch = cleanText[i];
    const next = cleanText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\r' && next === '\n') {
      row.push(cell.trim());
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      cell = '';
      i += 1;
    } else if (ch === '\n' || ch === '\r') {
      row.push(cell.trim());
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((c) => c.length > 0)) rows.push(row);
  }

  return rows;
}

function splitOptions(raw: string): string[] {
  if (!raw) return [];
  const delimiter = raw.includes('|') ? '|' : ';';
  return raw
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}

function fillLangRecord(he?: string, ru?: string, en?: string): Record<'he' | 'ru' | 'en', string> {
  const fallback = he || ru || en || '';
  return {
    he: he || fallback,
    ru: ru || fallback,
    en: en || fallback,
  };
}

function parseSheetRowsIntoContent(
  rows: string[][],
  base: GameContent
): GameContent {
  if (rows.length < 2) return base;

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const getCell = (record: string[], ...keys: string[]): string => {
    for (const key of keys) {
      const idx = headers.indexOf(key);
      if (idx !== -1 && record[idx]) {
        return record[idx].trim();
      }
    }
    return '';
  };

  const parsedTrivia: TriviaQuestion[] = [];
  const parsedQuotes: TriviaQuestion[] = [];
  const parsedMemory: MemoryPair[] = [];
  const parsedPuzzles: PuzzleItem[] = [];
  let momName = base.momName;

  rows.slice(1).forEach((record, idx) => {
    const rawCat = getCell(record, 'category', 'type', 'game').toLowerCase();

    if (rawCat === 'config' || rawCat === 'mom') {
      const nameHe = getCell(record, 'mom_name_he', 'question_he', 'he');
      const nameRu = getCell(record, 'mom_name_ru', 'question_ru', 'ru');
      const nameEn = getCell(record, 'mom_name_en', 'question_en', 'en');
      if (nameHe || nameRu || nameEn) {
        momName = fillLangRecord(nameHe, nameRu, nameEn);
      }
      return;
    }

    if (rawCat === 'memory') {
      const imageA = normalizeDriveImageUrl(getCell(record, 'image_a', 'image_url', 'imagea'));
      const imageB = normalizeDriveImageUrl(getCell(record, 'image_b', 'imageb')) || imageA;
      if (!imageA) return;
      const labelA = fillLangRecord(
        getCell(record, 'label_a_he', 'question_he'),
        getCell(record, 'label_a_ru', 'question_ru'),
        getCell(record, 'label_a_en', 'question_en')
      );
      const labelB = fillLangRecord(
        getCell(record, 'label_b_he', 'funfact_he') || labelA.he,
        getCell(record, 'label_b_ru', 'funfact_ru') || labelA.ru,
        getCell(record, 'label_b_en', 'funfact_en') || labelA.en
      );
      parsedMemory.push({
        id: `sheet-mem-${idx + 1}`,
        imageA,
        labelA,
        imageB,
        labelB,
      });
      return;
    }

    if (rawCat === 'puzzle') {
      const imageUrl = normalizeDriveImageUrl(getCell(record, 'image_url', 'image'));
      if (!imageUrl) return;
      const gridRaw = Number.parseInt(getCell(record, 'grid_size', 'grid') || '3', 10);
      const gridSize = Number.isFinite(gridRaw) && gridRaw >= 2 && gridRaw <= 5 ? gridRaw : 3;
      parsedPuzzles.push({
        id: `sheet-puz-${idx + 1}`,
        imageUrl,
        title: fillLangRecord(
          getCell(record, 'title_he', 'question_he'),
          getCell(record, 'title_ru', 'question_ru'),
          getCell(record, 'title_en', 'question_en')
        ),
        story: fillLangRecord(
          getCell(record, 'story_he', 'funfact_he'),
          getCell(record, 'story_ru', 'funfact_ru'),
          getCell(record, 'story_en', 'funfact_en')
        ),
        gridSize,
      });
      return;
    }

    const qHe = getCell(record, 'question_he', 'he');
    const qRu = getCell(record, 'question_ru', 'ru');
    const qEn = getCell(record, 'question_en', 'en');
    if (!qHe && !qRu && !qEn) return;

    const collectOptions = (langSuffix: 'he' | 'ru' | 'en'): string[] => {
      const pipeOpts = splitOptions(getCell(record, `options_${langSuffix}`));
      if (pipeOpts.length >= 2) return pipeOpts;
      return [
        getCell(record, `opt1_${langSuffix}`, `option1_${langSuffix}`),
        getCell(record, `opt2_${langSuffix}`, `option2_${langSuffix}`),
        getCell(record, `opt3_${langSuffix}`, `option3_${langSuffix}`),
        getCell(record, `opt4_${langSuffix}`, `option4_${langSuffix}`),
      ].filter(Boolean);
    };

    const optsHe = collectOptions('he');
    const optsRu = collectOptions('ru');
    const optsEn = collectOptions('en');
    const fallbackOpts = optsHe.length >= 2 ? optsHe : optsEn.length >= 2 ? optsEn : optsRu;
    if (fallbackOpts.length < 2) return;

    const rawIndex = Number.parseInt(getCell(record, 'correct_index', 'correct', 'answer') || '0', 10);
    const maxIdx = fallbackOpts.length - 1;
    const correctIndex = Number.isFinite(rawIndex)
      ? Math.max(0, Math.min(maxIdx, rawIndex))
      : 0;

    const funHe = getCell(record, 'funfact_he', 'fun_fact_he');
    const funRu = getCell(record, 'funfact_ru', 'fun_fact_ru');
    const funEn = getCell(record, 'funfact_en', 'fun_fact_en');
    const imageUrl = normalizeDriveImageUrl(getCell(record, 'image_url', 'image'));

    const isQuotes = rawCat === 'quotes' || rawCat === 'quote';
    const item: TriviaQuestion = {
      id: `sheet-${isQuotes ? 'q' : 't'}-${idx + 1}`,
      category: isQuotes ? 'quotes' : 'trivia',
      question: fillLangRecord(qHe, qRu, qEn),
      options: {
        he: optsHe.length >= 2 ? optsHe : fallbackOpts,
        ru: optsRu.length >= 2 ? optsRu : fallbackOpts,
        en: optsEn.length >= 2 ? optsEn : fallbackOpts,
      },
      correctIndex,
      ...(imageUrl ? { imageUrl } : {}),
      ...(funHe || funRu || funEn ? { funFact: fillLangRecord(funHe, funRu, funEn) } : {}),
    };

    if (isQuotes) {
      parsedQuotes.push(item);
    } else {
      parsedTrivia.push(item);
    }
  });

  return {
    ...base,
    momName,
    memoryPairs: parsedMemory.length > 0 ? parsedMemory : base.memoryPairs,
    puzzles: parsedPuzzles.length > 0 ? parsedPuzzles : base.puzzles,
    triviaQuestions: parsedTrivia.length > 0 ? parsedTrivia : base.triviaQuestions,
    quoteQuestions: parsedQuotes.length > 0 ? parsedQuotes : base.quoteQuestions,
  };
}

export async function loadContentFromGoogleDrive(
  driveFolderUrl: string,
  sheetsUrl?: string,
  spotifyUrl?: string
): Promise<GameContent> {
  const cleanDriveUrl = driveFolderUrl.trim();
  const cleanSheetsUrl = (sheetsUrl ?? '').trim();
  const cleanSpotifyUrl = (spotifyUrl ?? '').trim() || DEFAULT_GAME_CONTENT.spotifyUrl;

  // Validate folder URL structure (direct folder listing in browser without OAuth is restricted by CORS,
  // so Drive image links are resolved directly from the Sheet or merged cleanly with built-in content).
  extractDriveFolderId(cleanDriveUrl);

  let content: GameContent = {
    ...DEFAULT_GAME_CONTENT,
    driveFolderUrl: cleanDriveUrl,
    sheetsUrl: cleanSheetsUrl,
    spotifyUrl: cleanSpotifyUrl,
  };

  if (cleanSheetsUrl) {
    const sheetMeta = extractGoogleSheetId(cleanSheetsUrl);
    if (sheetMeta) {
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetMeta.sheetId}/export?format=csv${
        sheetMeta.gid ? `&gid=${sheetMeta.gid}` : ''
      }`;
      try {
        const response = await fetch(exportUrl, { mode: 'cors' });
        if (response.ok) {
          const csvText = await response.text();
          const rows = parseCsv(csvText);
          content = parseSheetRowsIntoContent(rows, content);
        }
      } catch {
        // Offline, private sheet, or CORS fallback: retain built-in DEFAULT_GAME_CONTENT cleanly
      }
    }
  }

  return content;
}

// Web Audio API sound effects (zero external audio files required)
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }

  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {
      // Ignore autoplay restriction errors before user gesture
    });
  }

  return sharedAudioCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType,
  gainPeak: number
): void {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const soundEffects = {
  playTick(muted = false): void {
    if (muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    playTone(ctx, 880, 0, 0.06, 'triangle', 0.12);
  },

  playFlip(muted = false): void {
    if (muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  },

  playSuccess(muted = false): void {
    if (muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      playTone(ctx, freq, idx * 0.075, 0.18, 'triangle', 0.16);
    });
  },

  playApplause(muted = false): void {
    if (muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Synthesize rhythmic bursts of band-passed white noise to evoke warm applause
    const bufferSize = Math.floor(ctx.sampleRate * 1.1);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      const env = Math.sin((Math.PI * i) / bufferSize);
      const flutter = 0.65 + 0.35 * Math.sin(i * 0.0035);
      data[i] = (Math.random() * 2 - 1) * env * flutter;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    playTone(ctx, 523.25, 0.05, 0.35, 'sine', 0.1);
    playTone(ctx, 659.25, 0.12, 0.35, 'sine', 0.1);
  },

  playFanfare(muted = false): void {
    if (muted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const melody: Array<[number, number, number]> = [
      [523.25, 0.0, 0.16],
      [523.25, 0.16, 0.16],
      [659.25, 0.32, 0.18],
      [783.99, 0.5, 0.24],
      [659.25, 0.74, 0.14],
      [1046.5, 0.88, 0.55],
    ];
    melody.forEach(([freq, offset, dur]) => {
      playTone(ctx, freq, offset, dur, 'triangle', 0.18);
    });
    // Warm final chord
    playTone(ctx, 523.25, 0.88, 0.55, 'sine', 0.12);
    playTone(ctx, 783.99, 0.88, 0.55, 'sine', 0.12);
  },
};
