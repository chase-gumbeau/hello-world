// Renders an image onto a 64x32 LED matrix, centered, like the Tidbyt / Pixlet preview.
const COLS = 64;
const ROWS = 32;
const PITCH = 10;

/**
 * @param {string} src  Image URL, drawn at native LED resolution.
 * @param {object} [opts]
 * @param {number} [opts.size]  Width and height of the image in LEDs.
 * @param {(x: number, y: number) => boolean} [opts.twinkle]  LEDs to twinkle, in
 *   image coordinates (0..size-1). Omit for a still display.
 */
export function createTidbytDisplay(src, { size = 32, twinkle } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'tidbyt-display';

  const canvas = document.createElement('canvas');
  canvas.width = COLS * PITCH;
  canvas.height = ROWS * PITCH;
  wrap.append(canvas);
  const ctx = canvas.getContext('2d');

  const left = (COLS - size) / 2;
  const top = (ROWS - size) / 2;

  /** Paints every LED; `glow(i)` scales the brightness of LED i. */
  const paint = (pixels, glow) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = y * COLS + x;
        const a = pixels[i * 4 + 3] / 255;
        const k = a * glow(i);
        ctx.fillStyle = a
          ? `rgb(${pixels[i * 4] * k} ${pixels[i * 4 + 1] * k} ${pixels[i * 4 + 2] * k})`
          : '#0c0c0c';
        ctx.beginPath();
        ctx.arc(x * PITCH + PITCH / 2, y * PITCH + PITCH / 2, PITCH * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const img = new Image();
  img.onload = () => {
    // Draw the source at native LED resolution, centered in the 64x32 frame.
    const frame = document.createElement('canvas');
    frame.width = COLS;
    frame.height = ROWS;
    const fctx = frame.getContext('2d');
    fctx.imageSmoothingEnabled = false;
    fctx.drawImage(img, left, top, size, size);
    const pixels = fctx.getImageData(0, 0, COLS, ROWS).data;

    if (!twinkle) {
      paint(pixels, () => 1);
      return;
    }

    // Each twinkling LED gets its own speed and phase so they never pulse in step.
    const stars = new Map();
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (twinkle(x, y)) {
          stars.set((y + top) * COLS + x + left, {
            speed: 1.2 + Math.random() * 2.2,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    const tick = (now) => {
      if (!wrap.isConnected) return; // story unmounted
      const t = now / 1000;
      paint(pixels, (i) => {
        const star = stars.get(i);
        if (!star) return 1;
        // Mostly a gentle dip, with a brief brighter peak: s³ keeps peaks short.
        const s = 0.5 + 0.5 * Math.sin(t * star.speed + star.phase);
        return Math.min(1.35, 0.7 + 0.65 * s ** 3);
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  img.src = src;

  return wrap;
}
