const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const docAssetsDir = path.resolve(__dirname, '..', 'doc_assets');
const outputPdf = path.resolve(__dirname, '..', 'Mom_7.0_Project_Summary.pdf');
const outputHtml = path.resolve(__dirname, '..', 'Mom_7.0_Project_Summary.html');

function toBase64(filename) {
  const filePath = path.join(docAssetsDir, filename);
  if (!fs.existsSync(filePath)) return '';
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

const landingImg = toBase64('landing.png');
const hostImg = toBase64('host.png');
const splitImg = toBase64('split.png');
const playerImg = toBase64('player.png');

const htmlContent = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Mom 7.0 - סיכום פרויקט ואפליקציה</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      background-color: #0f172a;
      color: #334155;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      height: 297mm;
      padding: 14mm 16mm;
      background: #ffffff;
      page-break-after: always;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    /* Header styling */
    .header {
      background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #db2777 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .header-title-box h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge-icon {
      background: white;
      color: #7c3aed;
      padding: 2px 10px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 900;
    }
    .header-subtitle {
      font-size: 13px;
      color: #f3e8ff;
      margin-top: 3px;
    }
    .header-meta {
      text-align: left;
      font-size: 11px;
      color: #ede9fe;
      line-height: 1.4;
    }

    /* Badges Bar */
    .badges-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .badge {
      font-size: 10.5px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #334155;
    }
    .badge-primary {
      background: #f3e8ff;
      border-color: #d8b4fe;
      color: #6b21a8;
    }
    .badge-pink {
      background: #fdf2f8;
      border-color: #fbcfe8;
      color: #9d174d;
    }
    .badge-green {
      background: #ecfdf5;
      border-color: #a7f3d0;
      color: #065f46;
    }

    /* Card styling */
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 10px;
    }
    .card-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #1e1b4b;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .card-desc {
      font-size: 11.5px;
      color: #475569;
      line-height: 1.5;
    }

    /* Highlights grid */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    .highlight-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-right: 4px solid #7c3aed;
      border-radius: 8px;
      padding: 8px 10px;
    }
    .highlight-box.pink-border {
      border-right-color: #db2777;
    }
    .highlight-box.green-border {
      border-right-color: #059669;
    }
    .highlight-box.amber-border {
      border-right-color: #d97706;
    }
    .highlight-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .highlight-text {
      font-size: 10.5px;
      color: #64748b;
      line-height: 1.4;
    }

    /* Screenshots showcase */
    .screenshots-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 4px;
      margin-bottom: 8px;
    }
    .screenshot-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }
    .screenshot-header {
      background: #f1f5f9;
      padding: 5px 10px;
      font-size: 10.5px;
      font-weight: 700;
      color: #475569;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
    }
    .screenshot-img {
      width: 100%;
      height: 165px;
      object-fit: cover;
      display: block;
    }

    /* Mini Games List */
    .game-item {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      margin-bottom: 6px;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .game-icon {
      font-size: 18px;
      line-height: 1;
      padding-top: 2px;
    }
    .game-info h4 {
      font-size: 12px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 2px;
    }
    .game-info p {
      font-size: 10.5px;
      color: #475569;
      line-height: 1.35;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94a3b8;
    }
    .footer-links a {
      color: #7c3aed;
      text-decoration: none;
      font-weight: 600;
      margin-right: 8px;
    }

    .split-layout {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 12px;
      align-items: start;
    }
  </style>
</head>
<body>

  <!-- ==================== עמוד 1 ==================== -->
  <div class="page">
    <div>
      <!-- Header -->
      <div class="header">
        <div class="header-title-box">
          <h1>
            <span>Mom 7.0</span>
            <span class="badge-icon">7.0</span>
            <span>🎂</span>
          </h1>
          <div class="header-subtitle">אפליקציית מסיבה תחרותית, אינטראקטיבית ורב-לשונית ליום הולדת 70</div>
        </div>
        <div class="header-meta">
          <div><strong>סטטוס:</strong> הושלם ופרוס ב-Live</div>
          <div><strong>גרסה:</strong> 7.0 Production</div>
          <div><strong>תאריך:</strong> נובמבר 2026</div>
        </div>
      </div>

      <!-- Badges Bar -->
      <div class="badges-bar">
        <span class="badge badge-primary">🔒 Zero Cloud Storage</span>
        <span class="badge badge-pink">⚡ WebRTC P2P Direct Data</span>
        <span class="badge badge-green">🌐 עברית (RTL) | רוסית (LTR) | אנגלית (LTR)</span>
        <span class="badge">♿ נגישות והגדלת גופן אישית</span>
        <span class="badge badge-primary">🎵 אינטגרציית Spotify מובנית</span>
      </div>

      <!-- Executive Overview -->
      <div class="card">
        <div class="card-title">🌟 חזון האפליקציה וסקירה כללית</div>
        <div class="card-desc">
          <strong>Mom 7.0</strong> היא פלטפורמת משחק חגיגית שפותחה במיוחד לרגל יום הולדת 70 של אמא. האפליקציה מחברת את כל המשפחה – מילדים ועד מבוגרים – לחוויה משותפת, מצחיקה ומרגשת. המערכת מבוססת על <strong>מסך מרכזי (Smart TV)</strong> המציג מרוץ התקדמות חי, לוח תוצאות ופודיום מנצחים, ועל <strong>טלפונים ניידים</strong> של האורחים המשמשים כשלטי משחק אינטראקטיביים בהצטרפות מיידית בסריקת קוד QR.
        </div>
      </div>

      <!-- Core Architecture Highlights -->
      <div class="grid-2">
        <div class="highlight-box">
          <div class="highlight-title">🔒 אפס אחסון ענן ופרטיות מוחלטת</div>
          <div class="highlight-text">
            שום תמונה או מידע משפחתי אינם נשמרים בשרתי ענן חיצוניים או במסדי נתונים. כל התמונות והזיכרונות נטענים ישירות מתיקיית Google Drive פרטית, והטריוויה מ-Google Sheets.
          </div>
        </div>

        <div class="highlight-box pink-border">
          <div class="highlight-title">⚡ תקשורת P2P ישירה וזמן אמת</div>
          <div class="highlight-text">
            מנוע PeerJS WebRTC מסנכרן בזמן אמת פעולות, תשובות, ניקוד ואירועים ישירות בין המארח לשחקנים ללא תלות בשרתים מתווכים, עם מנגנון גיבוי מקומי לבדיקות.
          </div>
        </div>

        <div class="highlight-box green-border">
          <div class="highlight-title">🌐 שפה וכיווניות עצמאית לכל צופה</div>
          <div class="highlight-text">
            כל אורח בוחר את שפת הממשק הנוחה לו (עברית, רוסית או אנגלית) עם התאמת כיוון (RTL/LTR) וגודל גופן אישי, מבלי להשפיע על מסך הטלוויזיה או על שאר המשתתפים.
          </div>
        </div>

        <div class="highlight-box amber-border">
          <div class="highlight-title">👑 שליטה ובקרה מלאה למנחה</div>
          <div class="highlight-text">
            קצב המשחק נשלט ידנית על ידי המנחה המרכזי כדי לאפשר שיחה, צחוק וסיפורי נוסטלגיה משפחתיים בין שאלה לשאלה, לצד מוזיקת רקע מפנקת מנגן Spotify מובנה.
          </div>
        </div>
      </div>

      <!-- Screenshots Showcase (Page 1) -->
      <div class="screenshots-row">
        <div class="screenshot-card">
          <div class="screenshot-header">
            <span>🖥️ מסך פתיחה ומיתוג "Mom 7.0"</span>
            <span>Landing Mode</span>
          </div>
          <img class="screenshot-img" src="${landingImg}" alt="מסך פתיחה" />
        </div>
        <div class="screenshot-card">
          <div class="screenshot-header">
            <span>📺 מסך המארח (טלוויזיה) - לובי ו-QR</span>
            <span>Host Dashboard</span>
          </div>
          <img class="screenshot-img" src="${hostImg}" alt="מסך המארח" />
        </div>
      </div>
    </div>

    <!-- Footer Page 1 -->
    <div class="footer">
      <div>Mom 7.0 Party Game App &copy; 2026 | עמוד 1 מתוך 2</div>
      <div class="footer-links">
        <span>עקרונות: פרטיות מלאה, רישוי קוד פתוח MIT, סנכרון P2P</span>
      </div>
    </div>
  </div>

  <!-- ==================== עמוד 2 ==================== -->
  <div class="page">
    <div>
      <!-- Header Page 2 -->
      <div class="header" style="margin-bottom: 10px; padding: 12px 18px;">
        <div class="header-title-box">
          <h2 style="font-size: 20px;">
            <span>ארסנל 5 המשחקים וממשק המשתתפים</span>
            <span class="badge-icon">🎮</span>
          </h2>
          <div class="header-subtitle">חוויית משחק מגוונת המשלבת נוסטלגיה, צחוק ותחרות הוגנת</div>
        </div>
        <div class="header-meta">
          <div><strong>Live URL:</strong> alphakate.github.io/Mom70PartyApp</div>
          <div><strong>GitHub:</strong> AlphaKate/Mom70PartyApp</div>
        </div>
      </div>

      <!-- Content Split Layout -->
      <div class="split-layout">
        <!-- 5 Games List -->
        <div>
          <div class="card-title" style="margin-bottom: 8px;">🎯 חמשת המשחקים המובנים באפליקציה</div>

          <div class="game-item">
            <div class="game-icon">🃏</div>
            <div class="game-info">
              <h4>1. משחק הזיכרון (Memory Game)</h4>
              <p>קלפי משחק אלגנטיים עם גב ממותג "גירסא 7.0" (או בשפה הנבחרת). חשיפת זוגות של תמונות משפחתיות היסטוריות מ-Google Drive, עם מרוץ התקדמות חי על המסך המרכזי.</p>
            </div>
          </div>

          <div class="game-item">
            <div class="game-icon">🧩</div>
            <div class="game-info">
              <h4>2. פאזל תמונות מסתורי (Mystery Photo Puzzle)</h4>
              <p>תמונה משפחתית מרגשת הנחתכת בזמן אמת ל-9 אריחים (3x3). השחקנים פותרים את הפאזל בהחלקה במסכי המגע שלהם, כאשר הטלוויזיה מציגה מי מוביל במרוץ.</p>
            </div>
          </div>

          <div class="game-item">
            <div class="game-icon">❓</div>
            <div class="game-info">
              <h4>3. טריוויה משפחתית (Trivia Challenge)</h4>
              <p>שאלות משעשעות על תחנות חייה, הרגליה ורגעיה המצחיקים של אמא. נטען ישירות מ-Google Sheets או מתוכן ברירת מחדל, עם טיימר ומערכת ניקוד מהירות.</p>
            </div>
          </div>

          <div class="game-item">
            <div class="game-icon">💬</div>
            <div class="game-info">
              <h4>4. "מה אמא הייתה אומרת?" (Quotes Game)</h4>
              <p>זיהוי משפטי מחץ, פתגמים וביטויים מפורסמים של אמא בסיטואציות שונות. שאלות אמריקאיות מצחיקות שמייצרות גלי צחוק ונוסטלגיה משפחתית.</p>
            </div>
          </div>

          <div class="game-item">
            <div class="game-icon">💖</div>
            <div class="game-info">
              <h4>5. פסיפס הברכות החגיגי ופודיום 1-2-3</h4>
              <p>כל משתתף מקליד ברכה אישית מהנייד. הברכות מרכיבות פסיפס זוהר ומרהיב בצורת המספר "70" על גבי הטלוויזיה, בליווי הכתרת המנצחים, קונפטי וסאונד חגיגי.</p>
            </div>
          </div>
        </div>

        <!-- Screenshots Showcase (Page 2) -->
        <div>
          <div class="card-title" style="margin-bottom: 8px;">📱 תצוגה מקדימה ומצב הדגמה</div>

          <!-- Split demo screen -->
          <div class="screenshot-card" style="margin-bottom: 10px;">
            <div class="screenshot-header">
              <span>🔄 מצב הדגמה במסך מפוצל (Split Demo)</span>
            </div>
            <img class="screenshot-img" style="height: 140px;" src="${splitImg}" alt="מסך מפוצל" />
          </div>

          <!-- Player screen -->
          <div class="screenshot-card">
            <div class="screenshot-header">
              <span>📱 ממשק שחקן במובייל (Player Client)</span>
            </div>
            <img class="screenshot-img" style="height: 140px;" src="${playerImg}" alt="מסך שחקן" />
          </div>
        </div>
      </div>

      <!-- Technical Summary & Deployment Card -->
      <div class="card" style="margin-top: 10px; margin-bottom: 0;">
        <div class="card-title">🚀 פריסה, קישורים וטכנולוגיות</div>
        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 10px; font-size: 11px; line-height: 1.5; color: #334155;">
          <div>
            <div>🌐 <strong>כתובת האפליקציה הציבורית:</strong> <a href="https://alphakate.github.io/Mom70PartyApp/" style="color: #7c3aed; font-weight: 700;">https://alphakate.github.io/Mom70PartyApp/</a></div>
            <div>📂 <strong>מאגר הקוד ב-GitHub:</strong> <a href="https://github.com/AlphaKate/Mom70PartyApp" style="color: #7c3aed; font-weight: 700;">https://github.com/AlphaKate/Mom70PartyApp</a></div>
            <div>🔄 <strong>תהליך פריסה:</strong> GitHub Actions CI/CD אוטומטי מבוסס ענף main.</div>
          </div>
          <div>
            <div>💻 <strong>Frontend:</strong> React 18, TypeScript, Tailwind CSS, Vite 6</div>
            <div>📡 <strong>P2P & Media:</strong> WebRTC (PeerJS), Web Audio API, Google Drive</div>
            <div>📜 <strong>רישוי:</strong> MIT Permissive Open Source License</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Page 2 -->
    <div class="footer">
      <div>Mom 7.0 Party Game App &copy; 2026 | עמוד 2 מתוך 2</div>
      <div class="footer-links">
        <a href="https://alphakate.github.io/Mom70PartyApp/">פתח אפליקציה ב-GitHub Pages</a>
        <a href="https://github.com/AlphaKate/Mom70PartyApp">צפה בקוד ב-GitHub</a>
      </div>
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync(outputHtml, htmlContent, 'utf8');
console.log(`Saved HTML to ${outputHtml} (${fs.statSync(outputHtml).size} bytes)`);

const chromeExe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tempProfile = path.join(process.env.TEMP || 'C:\\TEMP', 'chrome_pdf_' + Date.now());

console.log('Generating PDF via headless Chrome...');
try {
  execFileSync(chromeExe, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--user-data-dir=${tempProfile}`,
    `--print-to-pdf=${outputPdf}`,
    `file:///${outputHtml.replace(/\\\\/g, '/')}`,
  ]);

  if (fs.existsSync(outputPdf)) {
    console.log(`Successfully generated PDF: ${outputPdf} (${fs.statSync(outputPdf).size} bytes)`);
  } else {
    console.error('PDF file was not created.');
  }
} catch (err) {
  console.error('Failed generating PDF:', err.message);
}
