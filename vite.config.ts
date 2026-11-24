import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function driveProxyPlugin(): Plugin {
  const handler = async (req: any, res: any) => {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      const folderId = url.searchParams.get('id');
      if (!folderId) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing folder id parameter' }));
        return;
      }

      async function fetchDriveHtml(id: string): Promise<string> {
        try {
          const fetchUrl = `https://drive.google.com/embeddedfolderview?id=${id}#grid`;
          const response = await fetch(fetchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });
          if (!response.ok) return '';
          return await response.text();
        } catch {
          return '';
        }
      }

      function parseDriveHtml(html: string, currentFolderId: string) {
        const seenImages = new Set<string>();
        const seenFolders = new Set<string>();
        const imageUrls: string[] = [];
        const subfolderIds: string[] = [];

        const folderRegex = /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]{15,})/g;
        for (const match of html.matchAll(folderRegex)) {
          const fId = match[1];
          if (fId && fId !== currentFolderId && !seenFolders.has(fId)) {
            seenFolders.add(fId);
            subfolderIds.push(fId);
          }
        }

        const fileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{15,})/g;
        for (const match of html.matchAll(fileRegex)) {
          const fileId = match[1];
          if (fileId && fileId !== currentFolderId && !seenFolders.has(fileId)) {
            const imgUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
            if (!seenImages.has(imgUrl)) {
              seenImages.add(imgUrl);
              imageUrls.push(imgUrl);
            }
          }
        }

        const entryBlockRegex = /<div class="flip-entry"[^>]*id="entry-([a-zA-Z0-9_-]{15,})"[^>]*>([\s\S]*?)<\/div><\/div><\/div>/g;
        for (const match of html.matchAll(entryBlockRegex)) {
          const entryId = match[1];
          const blockContent = match[2];
          if (entryId === currentFolderId) continue;

          const isFolder = /drive-sprite-folder|aria-label="Folder"|\/folders\//i.test(blockContent);
          if (isFolder) {
            if (!seenFolders.has(entryId)) {
              seenFolders.add(entryId);
              subfolderIds.push(entryId);
            }
          } else {
            if (!seenFolders.has(entryId)) {
              const imgUrl = `https://drive.google.com/thumbnail?id=${entryId}&sz=w1200`;
              if (!seenImages.has(imgUrl)) {
                seenImages.add(imgUrl);
                imageUrls.push(imgUrl);
              }
            }
          }
        }

        return { imageUrls, subfolderIds };
      }

      const rootHtml = await fetchDriveHtml(folderId);
      const rootParsed = parseDriveHtml(rootHtml, folderId);
      const allImages = [...rootParsed.imageUrls];

      // Recursively inspect up to 5 subfolders (e.g. 'photos', 'תמונות', etc.)
      for (const subId of rootParsed.subfolderIds.slice(0, 5)) {
        const subHtml = await fetchDriveHtml(subId);
        const subParsed = parseDriveHtml(subHtml, subId);
        for (const img of subParsed.imageUrls) {
          if (!allImages.includes(img)) {
            allImages.push(img);
          }
        }
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({ success: true, folderId, images: allImages }));
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({ error: err?.message || 'Proxy error' }));
    }
  };

  return {
    name: 'drive-folder-proxy',
    configureServer(server) {
      server.middlewares.use('/api/drive-folder', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/drive-folder', handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), driveProxyPlugin()],
  base: './',
  resolve: {
    alias: {
      peerjs: path.resolve(__dirname, 'src/vendor/peerjs.ts'),
      'qrcode.react': path.resolve(__dirname, 'src/vendor/qrcode-react.tsx'),
    },
  },
});
