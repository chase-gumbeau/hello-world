// The Ultrahand seal (tidbyt/sigil) as animated ASCII: each character cell takes the
// seal's brightness there and draws it with a denser or lighter character, while a
// slow wave ripples out from the center and the bright strokes flicker.

// Characters from lightest to densest.
const RAMP = ' .:-=+*#%@';
// Below this brightness a cell is blank, so the seal's faint background texture drops
// away; above it, brightness stretches across the whole ramp.
const FLOOR = 0.24;
// A character cell's width over its height (0.6em wide at line-height 1.1).
const CELL = 0.6 / 1.1;
const FPS = 24;

/** A stable 0–1 random number for a cell at a moment. */
const hash = (x, y, n) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + n * 74.7) * 43758.5453;
  return h - Math.floor(h);
};

/**
 * @param {string} src  The seal's image (the full-size source keeps its detail).
 * @param {object} [opts]
 * @param {number} [opts.cols]  Characters across; rows follow from the image's shape.
 */
export function createAsciiSigil(src, { cols = 96 } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'ascii-sigil';
  const pre = document.createElement('pre');
  pre.className = 'ascii-sigil__art';
  pre.setAttribute('aria-label', 'The Ultrahand seal drawn in animated ASCII characters');
  pre.style.setProperty('--cols', cols);
  wrap.append(pre);

  const img = new Image();
  img.onload = () => {
    const rows = Math.round(cols * (img.naturalHeight / img.naturalWidth) * CELL);
    pre.style.setProperty('--rows', rows);
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, cols, rows);
    const data = ctx.getImageData(0, 0, cols, rows).data;
    // Each cell's brightness: the seal's green, weighted by how opaque it is.
    const light = Float32Array.from({ length: cols * rows }, (_, i) => (data[i * 4 + 1] / 255) * (data[i * 4 + 3] / 255));

    let last = 0;
    const tick = (now) => {
      if (!wrap.isConnected) return; // story unmounted
      requestAnimationFrame(tick);
      if (now - last < 1000 / FPS) return;
      last = now;
      const t = now / 1000;
      const beat = Math.floor(t * 10); // how often the flicker reshuffles
      let text = '';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const b = (light[y * cols + x] - FLOOR) / (1 - FLOOR);
          if (b <= 0) {
            text += ' ';
            continue;
          }
          // A slow wave out from the center, in true proportions (cells are tall).
          const d = Math.hypot((x - cols / 2) * CELL, y - rows / 2);
          const wave = 0.5 + 0.5 * Math.sin(d * 0.45 - t * 2.4);
          const flicker = (hash(x, y, beat) - 0.5) * 0.18 * b;
          const v = Math.min(1, Math.max(0, b * (0.75 + 0.4 * wave) + flicker));
          text += RAMP[Math.round(v * (RAMP.length - 1))];
        }
        text += '\n';
      }
      pre.textContent = text;
    };
    requestAnimationFrame(tick);
  };
  img.src = src;
  return wrap;
}
