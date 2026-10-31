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
// Zoomed in, the art's visible edge (98.5% of its width) meets both ends of the board.
export const ZOOM_MAX = 2.03;

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

// Blinks: how long one takes, in seconds, and the wait between them.
const BLINK = 0.75;
const BLINK_GAP = [2.5, 6];
const BLINK_DOUBLE = 0.25; // chance a blink is quickly followed by another
const BLINK_DARK = [0, 0, 0, 0]; // unlit, filling in behind the lid

/** How closed a blink is `u` (0–1) of the way through: quick to close, slower to open. */
const blinkShape = (u) => (u < 0.4 ? smoothstep(u / 0.4) : u < 0.5 ? 1 : 1 - smoothstep((u - 0.5) / 0.5));

// Artwork changes (setArt): how long the morph takes, in seconds, how much it opens
// center-first rather than in random blotches, and the softness of its edge.
const MORPH = 2.6;
const MORPH_LEAN = 0.45;
const MORPH_EDGE = 0.12;
const CRACK_WAVES = 5; // waves of cracks the red infection sends in
const CRACKS_PER_WAVE = 8;
const CRACK_WAVE_GAP = 0.11; // share of the change between waves
const CRACK_CRAWL = 0.5; // share of the change one crack takes to reach the center
const CRACK_SWELL = 0.15; // how fast a crack thickens once it's in, so veins merge
// Green: radial pulses from the center, each leaving what it passes greener.
const PULSE_LEVELS = [0.25, 0.45, 0.65, 0.85, 1]; // how green each pulse leaves things
const PULSE_GAP = 0.15; // share of the change between pulses
const PULSE_SPEED = 2.9; // radius (share of the image's) a pulse covers per whole change
const PULSE_LOBES = 6; // petals in each pulse's cymatic front
const PULSE_EDGE = 0.05; // softness of a pulse's front
const SPARKLE_LEAN = 0.35; // how much a sparkle change leans center-first rather than random
const SPARKLE_TURN = 0.06; // share of the change one LED takes to turn
const SPARKLE_FLASH = 0.035; // how long its flash lasts, as a share of the change
const SPARKLE_BOOST = 1.3; // how bright the flash gets

// Staged paths (purple): softness of each stage's front, and how long its glow lasts,
// both as shares of the stage. Kept tight so a traced path reads as a moving head.
const PATH_EDGE = 0.03;
const PATH_GLOW = 0.04;

/**
 * A curve for traceOrder() through `points` (image coordinates) in order, traveled
 * at an even speed along its length, recoloring `width` either side.
 */
export function polyline(points, width) {
  const lengths = points.slice(1).map((p, k) => Math.hypot(p[0] - points[k][0], p[1] - points[k][1]));
  const total = lengths.reduce((sum, l) => sum + l, 0);
  return {
    width,
    at: (s) => {
      let left = s * total;
      for (let k = 0; k < lengths.length; k++) {
        if (left <= lengths[k] || k === lengths.length - 1) {
          const f = lengths[k] ? Math.min(1, left / lengths[k]) : 0;
          const [a, b] = [points[k], points[k + 1]];
          return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
        }
        left -= lengths[k];
      }
      return points[points.length - 1];
    },
  };
}

/**
 * An `order` for a staged path that follows curves: each point's order is how far
 * along (0–1) a curve's head first passes within that curve's `width` of it, so the
 * color travels along the curves and recolors what they pass over. Points no curve
 * reaches get 1, and fade in quietly as their stage ends.
 * @param {{at: (s: number) => [number, number], width: number}[]} curves  Each curve's
 *   position at s (0–1) in image coordinates, and how far either side it recolors.
 */
export function traceOrder(curves, samples = 400) {
  const points = curves.map((curve) =>
    Array.from({ length: samples + 1 }, (_, k) => curve.at(k / samples)),
  );
  const memo = new Map(); // by point, quantized to a quarter image unit
  return (x, y) => {
    const key = `${Math.round(x * 4)},${Math.round(y * 4)}`;
    let order = memo.get(key);
    if (order === undefined) {
      order = 1;
      curves.forEach(({ width }, c) => {
        const list = points[c];
        for (let k = 0; k < list.length && k / samples < order; k++) {
          if ((list[k][0] - x) ** 2 + (list[k][1] - y) ** 2 <= width ** 2) {
            order = k / samples;
            break;
          }
        }
      });
      memo.set(key, order);
    }
    return order;
  };
}

/**
 * Each color as a recoloring of the green art, keeping brightness and highlights:
 * green is the image as drawn; red and purple move its green into their own hues.
 */
const PALETTE = {
  green: (r, g, b) => [r, g, b],
  red: (r, g, b) => [g, r * 0.5 + b * 0.15, r * 0.4 + b * 0.2],
  purple: (r, g, b) => [g * 0.72 + r * 0.2, r * 0.35 + b * 0.1, g * 0.95 + r * 0.1],
};

// The order 'cycle' visits the colors in.
const CYCLE = ['green', 'red', 'purple'];

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
 * How far along a staged path the LED at image point (x, y) has changed. The first
 * stage whose area holds it decides: within that stage's window of the change, the
 * color spreads in the stage's `order` (0 first, 1 last) behind a glowing front.
 */
function pathAt(stages, x, y, p) {
  for (const stage of stages) {
    if (!stage.area(x, y)) continue;
    const local = clamp01((p - stage.from) / (stage.to - stage.from));
    const order = stage.order(x, y);
    // Points off the path (order 1) fade in quietly over the stage's last stretch.
    if (order >= 1) return { amount: smoothstep((local - 0.7) / 0.3), boost: 1 };
    const ahead = local * (1 + PATH_EDGE) - order;
    return {
      amount: smoothstep(ahead / PATH_EDGE),
      boost: 1 + 0.7 * Math.exp(-((ahead / PATH_GLOW) ** 2)),
    };
  }
  return { amount: 0, boost: 1 };
}

/**
 * How far an LED is from the old color to the new one mid-change, and how much the
 * change brightens it. `d` and `angle` place the LED around the image center, and
 * (x, y) in image coordinates; `p` is the change's progress; `luck` is the LED's own
 * random number, for when it sparkles.
 */
function colorAt(change, { d, angle, x, y }, p, t, luck) {
  if (change.to === 'purple' && change.path) {
    // Along the art's own lines, stage by stage; anything off the path follows at the end.
    const { amount, boost } = pathAt(change.path, x, y, p);
    return { amount: Math.max(amount, smoothstep((p - 0.9) / 0.1)), boost };
  }
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
    return { amount: red, boost: 1 + 0.45 * fresh };
  }
  if (change.to === 'green') {
    // Center out, cymatic: pulse after pulse rings out from the middle, its front
    // breathing in petals that shift each time, and each leaves what it passes
    // greener than the last until everything is green.
    let amount = 0;
    let crest = 0;
    PULSE_LEVELS.forEach((level, k) => {
      const age = p - k * PULSE_GAP;
      if (age <= 0) return;
      const shape = 1 + 0.08 * Math.cos(PULSE_LOBES * angle + k * 0.9) * Math.cos(t * 3 + k);
      const past = age * PULSE_SPEED - d * shape; // how far the front is beyond this LED
      amount = Math.max(amount, level * smoothstep(past / PULSE_EDGE));
      crest = Math.max(crest, Math.exp(-((past / 0.07) ** 2)));
    });
    // A faint standing ripple between pulses, fading out as the change settles.
    const ripple = 0.12 * (1 - p) * Math.cos(d * 24 - t * 8) * amount;
    return { amount, boost: 1 + 0.55 * crest + ripple };
  }
  // Sparkle (a color with no path of its own): each LED turns at its own moment,
  // flashing bright as it does. Moments lean slightly center-first.
  const moment = luck * (1 - SPARKLE_LEAN) + Math.min(d, 1) * SPARKLE_LEAN;
  const since = p * (1 + SPARKLE_TURN * 2) - SPARKLE_TURN - moment * (1 - SPARKLE_TURN);
  const turned = smoothstep(since / SPARKLE_TURN + 0.5);
  const flash = Math.exp(-((since / SPARKLE_FLASH) ** 2));
  // Already-turned LEDs keep glinting faintly until the change is done.
  const glint = since > 0 ? 0.25 * (1 - p) * Math.max(0, Math.sin(t * 9 + luck * 40)) ** 8 : 0;
  return { amount: turned, boost: 1 + SPARKLE_BOOST * flash + glint };
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

/** Lights the LED at column x, row y in `rgb` (any CSS color). */
const drawLed = (ctx, x, y, rgb) => {
  ctx.fillStyle = rgb;
  ctx.beginPath();
  ctx.arc(x * PITCH + PITCH / 2, y * PITCH + PITCH / 2, PITCH * 0.42, 0, Math.PI * 2);
  ctx.fill();
};

/**
 * A bare 64x32 display that shows whole frames as given, LED for LED, for apps drawn
 * frame by frame (like a Pixlet render) rather than from one piece of art.
 * @returns {HTMLElement & {show: (pixels: Uint8ClampedArray) => void}}  The display.
 *   show() lights each LED from a 64x32 RGBA frame; clear pixels stay unlit.
 */
export function createLedDisplay() {
  const wrap = document.createElement('div');
  wrap.className = 'tidbyt-display';
  const canvas = document.createElement('canvas');
  canvas.width = COLS * PITCH;
  canvas.height = ROWS * PITCH;
  wrap.append(canvas);
  const ctx = canvas.getContext('2d');

  wrap.show = (pixels) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < COLS * ROWS; i++) {
      const lit = pixels[i * 4 + 3];
      const rgb = lit ? `rgb(${pixels[i * 4]} ${pixels[i * 4 + 1]} ${pixels[i * 4 + 2]})` : '#0c0c0c';
      drawLed(ctx, i % COLS, Math.floor(i / COLS), rgb);
    }
  };
  return wrap;
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
 * @param {{top: number, upperLid: number, lid: number, left: number, right: number}} [opts.blink]
 *   An eye that blinks now and then, in image coordinates: within the almond from
 *   `left` to `right` that rises from the lower `lid` to `top`, the upper lid (from
 *   `top` down to `upperLid`, lashes and all) slides down over the still eye, melting
 *   into the lower lid so a shut eye shows only the lower lashes, then rises again.
 * @param {'green'|'red'|'purple'|'cycle'} [opts.color]  'green' is the image as
 *   drawn. 'cycle' starts green, then steps through CYCLE: hold COLOR_HOLD seconds,
 *   change, and repeat.
 * @param {{area: (x: number, y: number) => boolean, order: (x: number, y: number) => number,
 *   from: number, to: number}[]} [opts.purplePath]  Stages purple travels through,
 *   in image coordinates: during its window (`from`–`to`, shares of the change) each
 *   stage fills its area in `order` (0 first, 1 last). Without it, purple sparkles in.
 * @returns {HTMLElement & {setColor: (color: 'green'|'red'|'purple'|'cycle') => void,
 *   setArt: (art: {src: string, hiRes?: string, twinkle?, recede?, flow?, purplePath?}) => void}}
 *   The display. setColor() animates to a new color over COLOR_CHANGE seconds: red
 *   crawls in from the outside toward the center in cracks; green rings out from the
 *   center in cymatic pulses, each leaving things greener; purple follows
 *   `purplePath`. 'cycle' starts stepping from the current color. setArt() morphs to
 *   new artwork over MORPH seconds, in organic blotches that open center-first, and
 *   switches to its effects.
 */
export function createTidbytDisplay(
  src,
  { size = 32, twinkle, hiRes: hiResSrc, zoom = 1, recede, flow, blink, color = 'green', purplePath } = {},
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
   * Paints every LED. `light(i)` gives LED i's brightness scale and its color: `amount`
   * of the way from PALETTE color `from` to `to`.
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
          const { glow, from, to, amount } = light(i);
          const k = a * glow;
          const art = [pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]];
          let [r, g, b] = PALETTE[from](...art);
          if (amount > 0) {
            const [tr, tg, tb] = PALETTE[to](...art);
            [r, g, b] = [r + (tr - r) * amount, g + (tg - g) * amount, b + (tb - b) * amount];
          }
          rgb = `rgb(${r * k} ${g * k} ${b * k})`;
        }
        drawLed(ctx, x, y, rgb);
      }
    }
  };

  // Each LED gets its own twinkle speed and phase so they never pulse in step,
  // its own point in the dissolve so the receding area breaks up as a scatter, and
  // its own moment to sparkle in a color with no path of its own.
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
  let current = PALETTE[color] ? color : 'green';
  let change = null; // { from, to, start, cracks, path } with start in seconds
  let cycling = color === 'cycle';
  let settledAt = performance.now() / 1000;

  /** LED i's color at time t (see paint), and any brightening from the change. */
  const tint = (i, scale, t) => {
    if (!change) return { from: current, to: current, amount: 0, boost: 1 };
    const p = clamp01((t - change.start) / COLOR_CHANGE);
    const [x, y] = toImage(i, scale);
    const where = {
      x,
      y,
      d: Math.hypot(x - size / 2, y - size / 2) / (size / 2),
      angle: Math.atan2(y - size / 2, x - size / 2),
    };
    const { amount, boost } = colorAt(change, where, p, t, leds[i].luck);
    return { from: change.from, to: change.to, amount, boost };
  };

  // The next blink's start, in seconds, scheduled at irregular, natural intervals.
  const blinkGap = () => BLINK_GAP[0] + Math.random() * (BLINK_GAP[1] - BLINK_GAP[0]);
  let nextBlink = performance.now() / 1000 + 1 + Math.random() * 2;

  /** How closed the eye is at time t (0 open, 1 shut), moving the schedule along. */
  const blinkAt = (t) => {
    if (t > nextBlink + BLINK) {
      nextBlink = Math.max(nextBlink + BLINK, t) + (Math.random() < BLINK_DOUBLE ? 0.12 : blinkGap());
    }
    return t < nextBlink ? 0 : blinkShape((t - nextBlink) / BLINK);
  };

  /**
   * `pixels` with the eye `shut` of the way closed: the upper lid slides down over the
   * still eye toward the lower lid, the dark above the eye filling in behind it, and
   * melts into the lower lid as it arrives.
   */
  const blinked = (pixels, scale, shut) => {
    if (shut <= 0) return pixels;
    const { top, upperLid, lid, left, right } = blink;
    const drop = (lid - upperLid) * shut; // how far the upper lid has come down
    // Over the second half of its travel the upper lid melts into the dark, so a shut
    // eye shows only the lower lid and its lashes.
    const fade = smoothstep((shut - 0.5) / 0.5);
    const out = new Uint8ClampedArray(pixels);
    const rowOf = (y) => Math.min(ROWS - 1, Math.max(0, Math.round((y - size / 2) * scale + ROWS / 2 - 0.5)));
    for (let i = 0; i < COLS * ROWS; i++) {
      const [x, y] = toImage(i, scale);
      // Only within the eye's almond (the upper half of an oval resting on the lid),
      // and only where the lid now is or has passed.
      const dx = (x - (left + right) / 2) / ((right - left) / 2);
      const dy = (lid - y) / (lid - top + 0.5);
      if (y >= upperLid + drop || dx * dx + dy * dy > 1) continue;
      const fromY = y - drop; // the lid's own pixels, carried down
      const at = (rowOf(fromY) * COLS + (i % COLS)) * 4;
      const lidPixel = fromY < top - 0.5 ? BLINK_DARK : pixels.subarray(at, at + 4);
      for (let c = 0; c < 4; c++) out[i * 4 + c] = lidPixel[c] + (BLINK_DARK[c] - lidPixel[c]) * fade;
    }
    return out;
  };

  // The artwork on screen, and the morph in progress from the previous one (if any).
  let art = null; // { img, hiRes, stills } once loaded
  let morph = null; // { from: art, start } with start in seconds
  let running = false;
  const cycle = zoom === 'cycle' && Boolean(hiResSrc);
  const fixedScale = hiResSrc && !cycle ? zoom : 1;
  const looping = () => Boolean(twinkle || recede || flow || blink || cycle);

  /** An artwork's pixels at `scale`: crisp native art at full size, hiRes when zoomed. */
  const frameOf = (a, scale) => {
    if (cycle) return sample(a.hiRes, scale);
    if (!a.stills.has(scale)) a.stills.set(scale, sample(scale === 1 ? a.img : a.hiRes, scale));
    return a.stills.get(scale);
  };

  /**
   * The old artwork giving way to the new one `p` of the way through a morph: in
   * blotches of noise that lean center-first, behind a softly glowing edge.
   */
  const morphed = (from, to, scale, p) => {
    const out = new Uint8ClampedArray(to);
    const glow = new Float32Array(COLS * ROWS).fill(1);
    for (let i = 0; i < COLS * ROWS; i++) {
      const [x, y] = toImage(i, scale);
      const d = Math.min(1, Math.hypot(x - size / 2, y - size / 2) / (size / 2));
      const due = noise(x * 0.3 + morph.seed, y * 0.3) * (1 - MORPH_LEAN) + d * MORPH_LEAN;
      const ahead = p * (1 + MORPH_EDGE) - due;
      const a = smoothstep(ahead / MORPH_EDGE);
      for (let c = 0; c < 4; c++) out[i * 4 + c] = from[i * 4 + c] + (to[i * 4 + c] - from[i * 4 + c]) * a;
      glow[i] = 1 + 0.6 * Math.exp(-((ahead / 0.05) ** 2));
    }
    return { pixels: out, glow };
  };

  const draw = (t) => {
    const scale = cycle ? zoomAt(t) : fixedScale;
    let base = frameOf(art, scale);
    let edge = null;
    if (morph) {
      ({ pixels: base, glow: edge } = morphed(frameOf(morph.from, scale), base, scale, (t - morph.start) / MORPH));
    }
    let pixels = recede ? receded(base, art.hiRes ?? art.img, scale, recedeAt(t)) : base;
    if (blink) pixels = blinked(pixels, scale, blinkAt(t));
    paint(pixels, (i) => {
      const { from, to, amount, boost } = tint(i, scale, t);
      let glow = boost * (edge ? edge[i] : 1);
      if (flow) {
        const [x, y] = toImage(i, scale);
        if (flow(x, y)) glow *= flowAt(x, y, t);
      }
      if (twinkle && twinkles(i, scale)) {
        // Mostly a gentle dip, with a brief brighter peak: s³ keeps peaks short.
        const s = 0.5 + 0.5 * Math.sin(t * leds[i].speed + leds[i].phase);
        glow *= Math.min(1.35, 0.7 + 0.65 * s ** 3);
      }
      return { glow, from, to, amount };
    });
  };

  const changeTo = (next, t) => {
    change = { from: current, to: next, start: t, cracks: makeCracks(), path: purplePath };
    current = next;
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
    if (morph && t - morph.start >= MORPH) morph = null;
    if (cycling && !change && t - settledAt >= COLOR_HOLD) {
      changeTo(CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length], t);
    }
    draw(t);
    if (looping() || change || morph || cycling) requestAnimationFrame(tick);
    else running = false;
  };

  const start = () => {
    if (art && !running) {
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

  const loadArt = (artSrc, artHiRes) =>
    Promise.all([loadImage(artSrc), artHiRes && loadImage(artHiRes)]).then(([img, hiRes]) => ({
      img,
      hiRes,
      stills: new Map(),
    }));

  // Art changes apply in the order they were asked for.
  let ready = loadArt(src, hiResSrc).then((loaded) => {
    art = loaded;
    draw(performance.now() / 1000);
    start();
  });

  /**
   * Swaps in new artwork, morphing to it over MORPH seconds, along with the effects
   * that belong to it. Options as for createTidbytDisplay; effects left out turn off.
   */
  wrap.setArt = (next) => {
    ready = ready
      .then(() => loadArt(next.src, next.hiRes))
      .then((loaded) => {
        morph = { from: art, start: performance.now() / 1000, seed: Math.random() * 50 };
        art = loaded;
        ({ twinkle, recede, flow, blink, purplePath } = next);
        start();
      });
  };

  return wrap;
}
