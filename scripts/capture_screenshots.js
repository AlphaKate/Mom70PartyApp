const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const distDir = path.resolve(__dirname, '..', 'dist');
const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(distDir, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading file');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const PORT = 5199;
const chromeExe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tempProfile = path.join(process.env.TEMP || 'C:\\TEMP', 'chrome_ss_profile_' + Date.now());

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Static server running on http://127.0.0.1:${PORT}`);

  const targets = [
    {
      name: 'screenshot_landing.png',
      url: `http://127.0.0.1:${PORT}/?mode=landing`,
      width: 1200,
      height: 750,
      delay: 2000,
    },
    {
      name: 'screenshot_host.png',
      url: `http://127.0.0.1:${PORT}/?mode=host`,
      width: 1200,
      height: 800,
      delay: 2500,
    },
    {
      name: 'screenshot_split.png',
      url: `http://127.0.0.1:${PORT}/?mode=split`,
      width: 1360,
      height: 780,
      delay: 2500,
    },
    {
      name: 'screenshot_player.png',
      url: `http://127.0.0.1:${PORT}/?room=7070`,
      width: 480,
      height: 850,
      delay: 2000,
    },
  ];

  for (const target of targets) {
    const outPath = path.join(screenshotsDir, target.name);
    console.log(`Capturing ${target.name}...`);
    try {
      execFileSync(chromeExe, [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        `--user-data-dir=${tempProfile}`,
        `--window-size=${target.width},${target.height}`,
        `--virtual-time-budget=${target.delay}`,
        `--screenshot=${outPath}`,
        target.url,
      ]);
      console.log(`Saved ${target.name} (${fs.statSync(outPath).size} bytes)`);
    } catch (e) {
      console.error(`Failed ${target.name}:`, e.message);
    }
  }

  server.close(() => {
    console.log('Done capturing screenshots!');
    process.exit(0);
  });
});
