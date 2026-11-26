/**
 * Client-side image compression utilities (zero cloud storage, memory-safe).
 * Keeps game photos crisp while shrinking 4–10MB smartphone photos down to ~20–35KB
 * so 10–12 photos never crash browser memory or WebRTC DataChannels.
 */

export const MAX_GAME_PHOTO_DATA_URL_LENGTH = 48000;

function renderScaledJpeg(
  img: HTMLImageElement,
  maxDimension: number,
  quality: number
): string {
  const srcW = img.naturalWidth || img.width || 1;
  const srcH = img.naturalHeight || img.height || 1;
  const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));
  const targetW = Math.max(1, Math.round(srcW * scale));
  const targetH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Compresses a single uploaded image File into a lightweight JPEG Data URL
 * preserving aspect ratio and releasing object URLs immediately.
 */
export async function compressGamePhotoFile(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to decode uploaded image'));
      image.src = objectUrl;
    });

    let dataUrl = renderScaledJpeg(img, 640, 0.72);
    if (dataUrl.length > MAX_GAME_PHOTO_DATA_URL_LENGTH) {
      dataUrl = renderScaledJpeg(img, 480, 0.6);
    }
    if (dataUrl.length > MAX_GAME_PHOTO_DATA_URL_LENGTH) {
      dataUrl = renderScaledJpeg(img, 360, 0.48);
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Compresses multiple image files sequentially (one at a time) so browser RAM
 * never spikes when uploading 10–12 high-resolution photos at once.
 */
export async function compressGamePhotoFilesSequentially(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const results: string[] = [];
  const total = files.length;

  for (let i = 0; i < total; i += 1) {
    try {
      const compressed = await compressGamePhotoFile(files[i]);
      if (compressed) {
        results.push(compressed);
      }
    } catch {
      // Skip unreadable/corrupted files cleanly without crashing the batch
    }
    onProgress?.(i + 1, total);
    // Yield briefly so the browser can paint progress & run GC between heavy images
    await new Promise((r) => setTimeout(r, 0));
  }

  return results;
}
