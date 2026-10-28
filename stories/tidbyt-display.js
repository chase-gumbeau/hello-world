// Renders an image onto a 64x32 LED matrix, centered, like the Tidbyt / Pixlet preview.
const COLS = 64;
const ROWS = 32;
// Canvas pixels per LED: enough to stay sharp when the display fills a wide frame.
const PITCH = 24;

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
// How far the area sinks as it recedes (and rises from as it returns), in image units.
const RECEDE_DROP = 1.6;
// Share of the recede, nearest rest, over which it crossfades into the image at rest.
// The moving area is resampled, so without this it would snap into place at the end.
const RECEDE_SETTLE = 0.15;

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

// Color changes, in seconds, and the shape of their fronts. Distances are shares
// of the image's radius.
const COLOR_CHANGE = 5;
const COLOR_HOLD = 8; // pause between changes when cycling
const CRACK_WAVES = 5; // waves of cracks the red infection sends in
const CRACKS_PER_WAVE = 8;
const CRACK_WAVE_GAP = 0.11; // share of the change between waves
const CRACK_CRAWL = 0.5; // share of the change one crack takes to reach the center
const CRACK_SWELL = 0.15; // how fast a crack thickens once it's in, so veins merge
const SPARKLE_LEAN = 0.35; // how much green sparkles center-first rather than at random
const SPARKLE_TURN = 0.06; // share of the change one LED takes to turn green
const SPARKLE_FLASH = 0.035; // how long its flash lasts, as a share of the change
const SPARKLE_BOOST = 1.3; // how bright the flash gets

/** The sigil in red: each LED's green becomes its red, keeping brightness and highlights. */
const toRed = (r, g, b) => [g, r * 0.5 + b * 0.15, r * 0.4 + b * 0.2];

/**
 * Random cracks for one change to red, in staggered waves: when each sets out,
 * where on the rim it starts, how fast it goes and where it forks.
 */
const makeCracks = () =>
  Array.from({ length: CRACK_WAVES * CRACKS_PER_WAVE }, (_, n) => {
    const wave = Math.floor(n / CRACKS_PER_WAVE);
    const k = n % CRACKS_PER_WAVE;
    return {
      start: wave * CRACK_WAVE_GAP + Math.random() * 0.06,
      // Each wave sets out from fresh points between the last wave's cracks.
      angle: ((k + wave * 0.38 + Math.random() * 0.5) / CRACKS_PER_WAVE) * Math.PI * 2,
      speed: 0.85 + Math.random() * 0.4,
      seed: Math.random() * 100,
      fork: 0.4 + Math.random() * 0.4, // radius where it splits
      forkTurn: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.5),
    };
  });

/** Smallest difference between two angles. */
const angleGap = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

/** A crack's angle at radius d: a slow wander plus jagged kinks. */
const crackPath = (crack, d) =>
  crack.angle +
  (noise(d * 3.5 + crack.seed, crack.seed) - 0.5) * 1.0 +
  (noise(d * 14 + crack.seed, crack.seed * 0.7) - 0.5) * 0.3;

/**
 * How much an LED at (d, angle) lies on a crack whose tip has reached radius `tip`,
 * `age` (share of the change) after it set out.
 */
function onCrack(d, angle, pathAngle, tip, age) {
  if (d < tip) return 0;
  // About one LED wide at the tip, opening behind it, and swelling with age.
  const width = 0.05 + 0.08 * (d - tip) + CRACK_SWELL * Math.max(0, age - CRACK_CRAWL * 0.5);
  const off = angleGap(angle, pathAngle) * Math.max(d, 0.05);
  return smoothstep((width - off) / 0.03);
}

/**
 * How red an LED is mid-change, and how much the change brightens it.
 * `d` and `angle` place the LED around the image center; `p` is the change's
 * progress; `luck` is the LED's own random number, for when it sparkles.
 */
function colorAt(change, d, angle, p, t, luck) {
  if (change.to === 'red') {
    // Outside in, like an infection: wave after wave of glowing cracks crawls toward
    // the center, forking as it goes and swelling until the veins merge.
    let red = 0;
    let fresh = 0; // how much of that is a young crack, which glows
    for (const c of change.cracks) {
      const age = p - c.start;
      if (age <= 0) continue;
      const tip = 1.2 - (age / CRACK_CRAWL) * 1.4 * c.speed;
      let on = onCrack(d, angle, crackPath(c, d), tip, age);
      if (d < c.fork) {
        const branch = crackPath(c, c.fork) + c.forkTurn * (c.fork - d) * 1.6;
        on = Math.max(on, onCrack(d, angle, branch, tip + 0.06, age));
      }
      red = Math.max(red, on);
      fresh = Math.max(fresh, on * clamp01(1 - age / CRACK_CRAWL));
      if (red >= 1) break;
    }
    // Any last specks take the color as the final cracks close in.
    red = Math.max(red, smoothstep((p - 0.88) / 0.12));
    return { red, boost: 1 + 0.45 * fresh };
  }
  // Sparkle: each LED turns green at its own moment, flashing bright as it does.
  // Moments lean slightly center-first, so the green still emerges from the middle.
  const moment = luck * (1 - SPARKLE_LEAN) + Math.min(d, 1) * SPARKLE_LEAN;
  const since = p * (1 + SPARKLE_TURN * 2) - SPARKLE_TURN - moment * (1 - SPARKLE_TURN);
  const green = smoothstep(since / SPARKLE_TURN + 0.5);
  const flash = Math.exp(-((since / SPARKLE_FLASH) ** 2));
  // Already-green LEDs keep glinting faintly until the change is done.
  const glint = since > 0 ? 0.25 * (1 - p) * Math.max(0, Math.sin(t * 9 + luck * 40)) ** 8 : 0;
  return { red: 1 - green, boost: 1 + SPARKLE_BOOST * flash + glint };
}

const smoothstep = (v) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};

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
 * @param {'green'|'red'|'cycle'} [opts.color]  'green' is the image as drawn. 'cycle'
 *   starts green, then alternates: hold COLOR_HOLD seconds, change, and repeat.
 * @returns {HTMLElement & {setColor: (color: 'green'|'red'|'cycle') => void}}  The
 *   display. setColor() animates to a new color over COLOR_CHANGE seconds: red
 *   crawls in from the outside toward the center in cracks; green sparkles back in,
 *   LED by LED, leaning center-first. 'cycle' starts alternating from the current
 *   color.
 */
export function createTidbytDisplay(
  src,
  { size = 32, twinkle, hiRes: hiResSrc, zoom = 1, recede, flow, color = 'green' } = {},
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
   * toward `anchor` (image coordinates), which stays where it was at `scale` unless
   * `shift` (image units) moves it.
   */
  const sample = (img, scale, k = 1, anchor = [size / 2, size / 2], shift = [0, 0]) => {
    const unit = scale * k; // LEDs per image unit
    const [ax, ay] = anchor;
    const left = (ax + shift[0] - size / 2) * scale + COLS / 2 - ax * unit;
    const top = (ay + shift[1] - size / 2) * scale + ROWS / 2 - ay * unit;
    fctx.clearRect(0, 0, COLS, ROWS);
    // Native-size art stays crisp; anything resampled needs smoothing.
    fctx.imageSmoothingEnabled = img.naturalWidth > size || k !== 1;
    fctx.imageSmoothingQuality = 'high';
    fctx.drawImage(img, left, top, size * unit, size * unit);
    return fctx.getImageData(0, 0, COLS, ROWS).data;
  };

  /**
   * Paints every LED. `light(i)` gives LED i's brightness scale and how red it is
   * (0 = the image's own color, 1 = fully red).
   */
  const paint = (pixels, light) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = y * COLS + x;
        const a = pixels[i * 4 + 3] / 255;
        let rgb = '#0c0c0c';
        if (a) {
          const { glow, red } = light(i);
          const k = a * glow;
          let [r, g, b] = [pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]];
          if (red > 0) {
            const [rr, rg, rb] = toRed(r, g, b);
            [r, g, b] = [r + (rr - r) * red, g + (rg - g) * red, b + (rb - b) * red];
          }
          rgb = `rgb(${r * k} ${g * k} ${b * k})`;
        }
        ctx.fillStyle = rgb;
        ctx.beginPath();
        ctx.arc(x * PITCH + PITCH / 2, y * PITCH + PITCH / 2, PITCH * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Each LED gets its own twinkle speed and phase so they never pulse in step,
  // its own point in the dissolve so the receding area breaks up as a scatter, and
  // its own moment to sparkle green.
  const leds = Array.from({ length: COLS * ROWS }, () => ({
    speed: 1.2 + Math.random() * 2.2,
    phase: Math.random() * Math.PI * 2,
    dissolve: Math.random(),
    luck: Math.random(),
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

  /**
   * `pixels` with the recede area moved back and dissolved `depth` of the way. It
   * sinks as it goes and rises as it returns.
   */
  const receded = (pixels, img, scale, depth) => {
    if (depth <= 0) return pixels;
    const { area, center } = recede;
    const k = 1 - (1 - RECEDE_MIN_SCALE) * depth;
    const drop = RECEDE_DROP * depth;
    const far = sample(img, scale, k, center, [0, drop]);
    const settle = smoothstep(depth / RECEDE_SETTLE);
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
      const sy = center[1] + (y - center[1] - drop) / k;
      const visible = area(sx, sy)
        ? clamp01((leds[i].dissolve - depth * (1 + DISSOLVE_SOFTNESS) + DISSOLVE_SOFTNESS) / DISSOLVE_SOFTNESS)
        : 0;
      const f = fill.get(Math.floor(i / COLS)) * 4;
      for (let c = 0; c < 3; c++) {
        const moved = pixels[f + c] + (far[i * 4 + c] - pixels[f + c]) * visible;
        out[i * 4 + c] = pixels[i * 4 + c] + (moved - pixels[i * 4 + c]) * settle;
      }
      out[i * 4 + 3] = 255;
    }
    return out;
  };

  // The current color, the change in progress toward it (if any), and whether to
  // keep alternating, timed from when the color last settled.
  let current = color === 'red' ? 'red' : 'green';
  let change = null; // { to, start, cracks } with start in seconds
  let cycling = color === 'cycle';
  let settledAt = performance.now() / 1000;

  /** How red LED i is at time t, and any brightening from the change. */
  const tint = (i, scale, t) => {
    if (!change) return { red: current === 'red' ? 1 : 0, boost: 1 };
    const p = clamp01((t - change.start) / COLOR_CHANGE);
    const [x, y] = toImage(i, scale);
    const d = Math.hypot(x - size / 2, y - size / 2) / (size / 2);
    return colorAt(change, d, Math.atan2(y - size / 2, x - size / 2), p, t, leds[i].luck);
  };

  let draw = null; // set once the images load
  let running = false;
  const looping = Boolean(twinkle || recede || flow || zoom === 'cycle');

  const changeTo = (next, t) => {
    current = next;
    change = { to: next, start: t, cracks: makeCracks() };
  };

  const tick = (now) => {
    if (!wrap.isConnected) {
      running = false; // story unmounted
      return;
    }
    const t = now / 1000;
    if (change && t - change.start >= COLOR_CHANGE) {
      change = null;
      settledAt = t;
    }
    if (cycling && !change && t - settledAt >= COLOR_HOLD) {
      changeTo(current === 'red' ? 'green' : 'red', t);
    }
    draw(t);
    if (looping || change || cycling) requestAnimationFrame(tick);
    else running = false;
  };

  const start = () => {
    if (draw && !running) {
      running = true;
      requestAnimationFrame(tick);
    }
  };

  wrap.setColor = (next) => {
    const t = performance.now() / 1000;
    if (next === 'cycle') {
      if (!cycling) {
        cycling = true;
        if (!change) settledAt = t; // hold, then start alternating
      }
    } else {
      cycling = false;
      if (next !== current) changeTo(next, t);
    }
    start();
  };

  const needsHiRes = (zoom !== 1 || recede) && hiResSrc;
  Promise.all([loadImage(src), needsHiRes && loadImage(hiResSrc)]).then(([img, hiRes]) => {
    const cycle = hiRes && zoom === 'cycle';
    const fixedScale = hiRes && !cycle ? zoom : 1;
    // Full-size art stays the crisp native image; zoomed art comes from hiRes.
    const source = fixedScale === 1 && !cycle ? img : hiRes;
    const still = cycle ? null : sample(source, fixedScale);

    draw = (t) => {
      const scale = cycle ? zoomAt(t) : fixedScale;
      const base = still ?? sample(hiRes, scale);
      const pixels = recede ? receded(base, hiRes ?? img, scale, recedeAt(t)) : base;
      paint(pixels, (i) => {
        const { red, boost } = tint(i, scale, t);
        let glow = boost;
        if (flow) {
          const [x, y] = toImage(i, scale);
          if (flow(x, y)) glow *= flowAt(x, y, t);
        }
        if (twinkle && twinkles(i, scale)) {
          // Mostly a gentle dip, with a brief brighter peak: s³ keeps peaks short.
          const s = 0.5 + 0.5 * Math.sin(t * leds[i].speed + leds[i].phase);
          glow *= Math.min(1.35, 0.7 + 0.65 * s ** 3);
        }
        return { glow, red };
      });
    };
    draw(performance.now() / 1000);
    start();
  });

  return wrap;
}
