// Renders an image onto a 64x32 LED matrix, centered, like the Tidbyt / Pixlet preview.
const COLS = 64;
const ROWS = 32;
const PITCH = 10;

// Zoom cycle, in seconds: hold, zoom in, hold, zoom out.
const ZOOM_HOLD_OUT = 2;
const ZOOM_IN = 5;
const ZOOM_HOLD_IN = 2.5;
const ZOOM_OUT = 5;
const ZOOM_PERIOD = ZOOM_HOLD_OUT + ZOOM_IN + ZOOM_HOLD_IN + ZOOM_OUT;
export const ZOOM_MAX = 1.8;

// Recede cycle, in seconds: shown, move back and dissolve, gone, move in and appear.
const RECEDE_HOLD_SHOWN = 2.5;
const RECEDE_OUT = 3;
const RECEDE_HOLD_GONE = 1.5;
const RECEDE_IN = 3;
const RECEDE_PERIOD = RECEDE_HOLD_SHOWN + RECEDE_OUT + RECEDE_HOLD_GONE + RECEDE_IN;
// Smallest size the receding area shrinks to, as a share of its full size.
const RECEDE_MIN_SCALE = 0.35;
// Softness of each LED's dissolve, as a share of the whole dissolve.
const DISSOLVE_SOFTNESS = 0.12;

// Rising energy: how fast the wisps climb (image units per second) and how much
// they brighten and dim the area.
const FLOW_RISE = 2.4;
const FLOW_DEPTH = 0.42;

const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** Smooth 2D value noise in [0, 1]. */
function noise(x, y) {
  const hash = (ix, iy) => {
    const h = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
    return h - Math.floor(h);
  };
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const top = hash(ix, iy) + (hash(ix + 1, iy) - hash(ix, iy)) * ux;
  const bottom = hash(ix, iy + 1) + (hash(ix + 1, iy + 1) - hash(ix, iy + 1)) * ux;
  return top + (bottom - top) * uy;
}

/**
 * Brightness of rising, smoke-like energy at image point (x, y) and time t. Noise
 * stretched tall reads as plumes; two layers climbing at different speeds, with a
 * slow sideways sway, keep it from looking like one pattern sliding up.
 */
function flowAt(x, y, t) {
  const sway = 0.7 * Math.sin(y * 0.35 + t * 0.9);
  const plumes = noise((x + sway) * 0.8, (y + t * FLOW_RISE) * 0.3);
  const wisps = noise((x - sway) * 1.6 + 17, (y + t * FLOW_RISE * 1.7) * 0.6);
  const n = plumes * 0.65 + wisps * 0.35;
  return 1 - FLOW_DEPTH / 2 + FLOW_DEPTH * n ** 1.5 * 1.6;
}

/** Image scale at time t (seconds) in the zoom cycle. */
function zoomAt(t) {
  let p = t % ZOOM_PERIOD;
  if (p < ZOOM_HOLD_OUT) return 1;
  p -= ZOOM_HOLD_OUT;
  if (p < ZOOM_IN) return 1 + (ZOOM_MAX - 1) * easeInOut(p / ZOOM_IN);
  p -= ZOOM_IN;
  if (p < ZOOM_HOLD_IN) return ZOOM_MAX;
  p -= ZOOM_HOLD_IN;
  return ZOOM_MAX - (ZOOM_MAX - 1) * easeInOut(p / ZOOM_OUT);
}

/** How far back the area has receded at time t (seconds): 0 = in place, 1 = gone. */
function recedeAt(t) {
  let p = t % RECEDE_PERIOD;
  if (p < RECEDE_HOLD_SHOWN) return 0;
  p -= RECEDE_HOLD_SHOWN;
  if (p < RECEDE_OUT) return easeInOut(p / RECEDE_OUT);
  p -= RECEDE_OUT;
  if (p < RECEDE_HOLD_GONE) return 1;
  p -= RECEDE_HOLD_GONE;
  return 1 - easeInOut(p / RECEDE_IN);
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * @param {string} src  Image URL, drawn at native LED resolution.
 * @param {object} [opts]
 * @param {number} [opts.size]  Width and height of the image in LEDs.
 * @param {(x: number, y: number) => boolean} [opts.twinkle]  LEDs to twinkle, in
 *   image coordinates (0..size-1). Omit for a still display.
 * @param {string} [opts.hiRes]  Higher-resolution copy of the image, used whenever
 *   the display is zoomed or an area recedes.
 * @param {'cycle'|number} [opts.zoom]  'cycle' slowly zooms in to ZOOM_MAX, holds,
 *   zooms back out and holds, on a loop; a number fixes the scale. Needs `hiRes`
 *   for anything but 1.
 * @param {{area: (x: number, y: number) => boolean, center: [number, number]}} [opts.recede]
 *   Part of the image that moves back toward `center` while dissolving, then moves
 *   back in and reappears, on a loop. Both are in image coordinates (fractional).
 *   Behind it, each row of the area fills with its brightest LED.
 * @param {(x: number, y: number) => boolean} [opts.flow]  Area where smoke-like
 *   energy rises from bottom to top, in image coordinates (fractional).
 */
export function createTidbytDisplay(
  src,
  { size = 32, twinkle, hiRes: hiResSrc, zoom = 1, recede, flow } = {},
) {
  const wrap = document.createElement('div');
  wrap.className = 'tidbyt-display';

  const canvas = document.createElement('canvas');
  canvas.width = COLS * PITCH;
  canvas.height = ROWS * PITCH;
  wrap.append(canvas);
  const ctx = canvas.getContext('2d');

  const frame = document.createElement('canvas');
  frame.width = COLS;
  frame.height = ROWS;
  const fctx = frame.getContext('2d', { willReadFrequently: true });

  /**
   * Draws the image at `scale` (1 = `size` LEDs), centered, and returns its pixels.
   * With `k` and `anchor`, the image is drawn a further `k` times smaller, shrinking
   * toward `anchor` (image coordinates), which stays where it was at `scale`.
   */
  const sample = (img, scale, k = 1, anchor = [size / 2, size / 2]) => {
    const unit = scale * k; // LEDs per image unit
    const [ax, ay] = anchor;
    const left = (ax - size / 2) * scale + COLS / 2 - ax * unit;
    const top = (ay - size / 2) * scale + ROWS / 2 - ay * unit;
    fctx.clearRect(0, 0, COLS, ROWS);
    // Native-size art stays crisp; anything resampled needs smoothing.
    fctx.imageSmoothingEnabled = img.naturalWidth > size || k !== 1;
    fctx.imageSmoothingQuality = 'high';
    fctx.drawImage(img, left, top, size * unit, size * unit);
    return fctx.getImageData(0, 0, COLS, ROWS).data;
  };

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

  // Each LED gets its own twinkle speed and phase so they never pulse in step,
  // and its own point in the dissolve so the receding area breaks up as a scatter.
  const leds = Array.from({ length: COLS * ROWS }, () => ({
    speed: 1.2 + Math.random() * 2.2,
    phase: Math.random() * Math.PI * 2,
    dissolve: Math.random(),
  }));

  /** Maps the center of LED i back into image coordinates through the zoom. */
  const toImage = (i, scale) => [
    ((i % COLS) + 0.5 - COLS / 2) / scale + size / 2,
    (Math.floor(i / COLS) + 0.5 - ROWS / 2) / scale + size / 2,
  ];

  /** Whether LED i shows a twinkling part of the image at this scale. */
  const twinkles = (i, scale) => {
    const [x, y] = toImage(i, scale);
    return twinkle(Math.floor(x), Math.floor(y));
  };

  /** `pixels` with the recede area moved back and dissolved `depth` of the way. */
  const receded = (pixels, img, scale, depth) => {
    if (depth <= 0) return pixels;
    const { area, center } = recede;
    const k = 1 - (1 - RECEDE_MIN_SCALE) * depth;
    const far = sample(img, scale, k, center);
    const out = new Uint8ClampedArray(pixels);

    // The area's LEDs at this scale, and each row's brightest LED as the fill behind it.
    const inArea = [];
    const fill = new Map();
    for (let i = 0; i < COLS * ROWS; i++) {
      const [x, y] = toImage(i, scale);
      if (!area(x, y)) continue;
      inArea.push({ i, x, y });
      const row = Math.floor(i / COLS);
      const best = fill.get(row);
      if (best === undefined || pixels[i * 4 + 1] > pixels[best * 4 + 1]) fill.set(row, i);
    }

    for (const { i, x, y } of inArea) {
      // Where this LED lands in the shrunken area, and how much of it is still there.
      const sx = center[0] + (x - center[0]) / k;
      const sy = center[1] + (y - center[1]) / k;
      const visible = area(sx, sy)
        ? clamp01((leds[i].dissolve - depth * (1 + DISSOLVE_SOFTNESS) + DISSOLVE_SOFTNESS) / DISSOLVE_SOFTNESS)
        : 0;
      const f = fill.get(Math.floor(i / COLS)) * 4;
      for (let c = 0; c < 3; c++) {
        out[i * 4 + c] = pixels[f + c] + (far[i * 4 + c] - pixels[f + c]) * visible;
      }
      out[i * 4 + 3] = 255;
    }
    return out;
  };

  const needsHiRes = (zoom !== 1 || recede) && hiResSrc;
  Promise.all([loadImage(src), needsHiRes && loadImage(hiResSrc)]).then(([img, hiRes]) => {
    const cycle = hiRes && zoom === 'cycle';
    const fixedScale = hiRes && !cycle ? zoom : 1;
    // Full-size art stays the crisp native image; zoomed art comes from hiRes.
    const source = fixedScale === 1 && !cycle ? img : hiRes;
    const still = cycle ? null : sample(source, fixedScale);
    if (!twinkle && !recede && !flow && still) {
      paint(still, () => 1);
      return;
    }

    const tick = (now) => {
      if (!wrap.isConnected) return; // story unmounted
      const t = now / 1000;
      const scale = cycle ? zoomAt(t) : fixedScale;
      const base = still ?? sample(hiRes, scale);
      const pixels = recede ? receded(base, hiRes ?? img, scale, recedeAt(t)) : base;
      paint(pixels, (i) => {
        let glow = 1;
        if (flow) {
          const [x, y] = toImage(i, scale);
          if (flow(x, y)) glow *= flowAt(x, y, t);
        }
        if (twinkle && twinkles(i, scale)) {
          // Mostly a gentle dip, with a brief brighter peak: s³ keeps peaks short.
          const s = 0.5 + 0.5 * Math.sin(t * leds[i].speed + leds[i].phase);
          glow *= Math.min(1.35, 0.7 + 0.65 * s ** 3);
        }
        return glow;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  return wrap;
}
