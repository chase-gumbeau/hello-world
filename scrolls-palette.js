/**
 * Extract a small mesh-friendly palette from an image URL (cached).
 * Samples a downscaled canvas and keeps the most saturated, distinct colors.
 */

const cache = new Map();

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function saturation(r, g, b) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  if (max === min) return 0;
  const l = (max + min) / 2;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

function luminance(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function colorDistance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/**
 * @param {string} url
 * @param {number} [count=5]
 * @returns {Promise<string[]>} hex colors, light→dark-ish order for mesh stops
 */
export function extractPaletteFromImage(url, count = 5) {
  if (cache.has(url)) return cache.get(url);

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      try {
        const size = 48;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(fallbackPalette());
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        /** @type {{ rgb: [number, number, number], score: number }[]} */
        const candidates = [];
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 200) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const sat = saturation(r, g, b);
          const lum = luminance(r, g, b);
          // Prefer colorful mid-tones; keep some lights/darks for mesh depth
          if (lum < 0.06 || lum > 0.94) continue;
          const score = sat * 1.6 + (1 - Math.abs(lum - 0.45)) * 0.5;
          candidates.push({ rgb: [r, g, b], score });
        }

        candidates.sort((a, b) => b.score - a.score);

        /** @type {[number, number, number][]} */
        const picked = [];
        for (const c of candidates) {
          if (picked.every((p) => colorDistance(p, c.rgb) > 48)) {
            picked.push(c.rgb);
          }
          if (picked.length >= count) break;
        }

        while (picked.length < count) {
          const t = picked.length / Math.max(count - 1, 1);
          const v = Math.round(255 * (1 - t * 0.85));
          picked.push([v, v, v]);
        }

        // Sort by luminance so gradient stops feel ordered
        picked.sort((a, b) => luminance(...b) - luminance(...a));
        resolve(picked.map(([r, g, b]) => rgbToHex(r, g, b)));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => resolve(fallbackPalette());
    img.src = url;
  });

  cache.set(url, promise);
  return promise;
}

function fallbackPalette() {
  return ['#ffffff', '#d0d0d0', '#888888', '#3a3a3a', '#000000'];
}

/**
 * Resolve a trip asset path against the app base URL.
 * @param {string} relativePath e.g. assets/scrolls/img.jpg
 */
export function tripAssetUrl(relativePath) {
  const base = import.meta.env.BASE_URL || '/';
  const clean = relativePath.replace(/^\.\//, '');
  return `${base}${clean}`;
}
