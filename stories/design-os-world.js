/**
 * Design OS Mini World — a pixel-art world map of the Design OS.
 *
 * Seven loop stages are lands on a ring road around the Canopy tree. Cross-cutting
 * lanes are landmarks, the gap register is a quest log, and skills-to-build are
 * construction sites. Click a land (or its plaque) to unfurl its scroll.
 *
 * Rendering: everything is painted into 384 × 240 art-pixel buffers and scaled up
 * with `image-rendering: pixelated`. Terrain + props are painted once and cached;
 * an FX layer (water, agents, keys, beams, smoke) ticks at 10 fps. Labels and
 * hotspots are real buttons in an HTML overlay so the map stays keyboard reachable.
 */
import {
  BLUEPRINTS,
  DIMENSIONS,
  GAPS,
  LANDMARKS,
  LANDMARK_BY_ID,
  LOOP_CLOSE,
  SOURCES,
  STAGES,
  STAGE_BY_ID,
  WAITING_NOTE,
} from './design-os-world-data.js';

const W = 384;
const H = 240;
const CX = 192;
const CY = 122;
const LAKE = { rx: 70, ry: 44 };
const ISLAND = { x: 192, y: 121, rx: 26, ry: 17 };
const ISLET = { x: 241, y: 134, rx: 7, ry: 5 };
const RING = { rx: 104, ry: 62 };
const LAMP = [241, 117];
const TICK_MS = 100;

const REGION_CANOPY = 7;
const REGION_ISLET = 8;

// ---------------------------------------------------------------------------
// Palette (Endesga 32 plus a few in-betweens)
// ---------------------------------------------------------------------------

const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

const K = {
  ink: rgb('#181425'),
  night: rgb('#262b44'),
  slate: rgb('#3a4466'),
  steel: rgb('#5a6988'),
  stone: rgb('#8b9bb4'),
  mist: rgb('#c0cbdc'),
  white: rgb('#ffffff'),
  deep: rgb('#124e89'),
  sea: rgb('#17619f'),
  mid: rgb('#1e7fc2'),
  shallow: rgb('#2ba3df'),
  foam: rgb('#c6f3ff'),
  sand: rgb('#ead4aa'),
  wetSand: rgb('#e4a672'),
  clay: rgb('#c28569'),
  dirt: rgb('#b86f50'),
  bark: rgb('#733e39'),
  barkDk: rgb('#3e2731'),
  path: rgb('#ecd3a4'),
  pathDk: rgb('#d2a877'),
  leaf: rgb('#63c74d'),
  leafMd: rgb('#3e8948'),
  leafDk: rgb('#265c42'),
  leafDeep: rgb('#193c3e'),
  leafHi: rgb('#9fe06a'),
  gold: rgb('#fee761'),
  amber: rgb('#feae34'),
  orange: rgb('#f77622'),
  rust: rgb('#be4a2f'),
  ember: rgb('#d77643'),
  red: rgb('#e43b44'),
  wine: rgb('#a22633'),
  plum: rgb('#68386c'),
  rose: rgb('#b55088'),
  pink: rgb('#f6757a'),
  peach: rgb('#e8b796'),
  sky: rgb('#2ce8f5'),
  blue: rgb('#0099db'),
  indigo: rgb('#5e6ad2'),
  indigoDk: rgb('#3d449a'),
  violet: rgb('#8a55d0'),
  violetDk: rgb('#5a2f96'),
  sbPink: rgb('#ff4785'),
  sbPinkDk: rgb('#c22e63'),
  soil: rgb('#7a4237'),
  soilLt: rgb('#95553f'),
};

/** Ground palettes per region id (0–6 stages, 7 canopy island, 8 lighthouse islet). */
const GROUND = [
  { base: rgb('#63c74d'), lite: rgb('#7ad35b'), dark: rgb('#52b343') },
  { base: rgb('#3f8f49'), lite: rgb('#4b9e52'), dark: rgb('#347b40') },
  { base: rgb('#7cc24f'), lite: rgb('#92cf5a'), dark: rgb('#69ad47') },
  { base: rgb('#5cbf4c'), lite: rgb('#71cc58'), dark: rgb('#4caa43') },
  { base: rgb('#68c551'), lite: rgb('#7ed15d'), dark: rgb('#56af47') },
  { base: rgb('#5c9c55'), lite: rgb('#6cab5f'), dark: rgb('#4c8849') },
  { base: rgb('#9fb34a'), lite: rgb('#b2c057'), dark: rgb('#889c42') },
  { base: rgb('#63c74d'), lite: rgb('#7ad35b'), dark: rgb('#52b343') },
  { base: rgb('#8b9bb4'), lite: rgb('#c0cbdc'), dark: rgb('#5a6988') },
];

const TREES = {
  green: { hi: K.leafHi, lite: K.leaf, mid: K.leafMd, dark: K.leafDk, outline: K.leafDeep, trunk: K.dirt, trunkDk: K.bark },
  forest: { hi: K.leaf, lite: rgb('#4a9a50'), mid: K.leafMd, dark: K.leafDk, outline: rgb('#142e33'), trunk: K.dirt, trunkDk: K.bark },
  amber: { hi: K.gold, lite: K.amber, mid: K.orange, dark: K.rust, outline: K.barkDk, trunk: K.dirt, trunkDk: K.bark },
  red: { hi: K.pink, lite: K.red, mid: K.wine, dark: K.plum, outline: K.barkDk, trunk: K.dirt, trunkDk: K.bark },
  gold: { hi: rgb('#fff6b8'), lite: K.gold, mid: K.amber, dark: K.ember, outline: K.barkDk, trunk: K.dirt, trunkDk: K.bark },
  canopy: { hi: rgb('#b8f27c'), lite: rgb('#7ad35b'), mid: K.leafMd, dark: K.leafDk, outline: K.leafDeep, trunk: K.dirt, trunkDk: K.bark },
  rock: { hi: K.white, lite: K.mist, mid: K.stone, dark: K.steel, outline: K.night },
};

// ---------------------------------------------------------------------------
// Noise + RNG
// ---------------------------------------------------------------------------

function hash2(x, y, s) {
  let h = (Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(s | 0, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function vnoise(x, y, s) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s);
  const b = hash2(xi + 1, yi, s);
  const c = hash2(xi, yi + 1, s);
  const d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x, y, s) {
  let sum = 0;
  let amp = 0.5;
  let f = 1;
  for (let o = 0; o < 4; o++) {
    sum += amp * vnoise(x * f, y * f, s + o * 101);
    f *= 2;
    amp *= 0.5;
  }
  return sum / 0.9375;
}

function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Pixel buffer + primitives
// ---------------------------------------------------------------------------

class Pix {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }

  idx(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return -1;
    return (y * this.w + x) * 4;
  }

  set(x, y, c, a = 255) {
    const i = this.idx(x, y);
    if (i < 0) return;
    this.d[i] = c[0];
    this.d[i + 1] = c[1];
    this.d[i + 2] = c[2];
    this.d[i + 3] = a;
  }

  mix(x, y, c, t) {
    const i = this.idx(x, y);
    if (i < 0) return;
    const d = this.d;
    d[i] += (c[0] - d[i]) * t;
    d[i + 1] += (c[1] - d[i + 1]) * t;
    d[i + 2] += (c[2] - d[i + 2]) * t;
  }

  shade(x, y, f) {
    const i = this.idx(x, y);
    if (i < 0) return;
    this.d[i] *= f;
    this.d[i + 1] *= f;
    this.d[i + 2] *= f;
  }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }

  clear() {
    this.d.fill(0);
  }
}

function shadowEllipse(p, cx, cy, rx, ry, f = 0.76) {
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (rx * rx + 0.01) + (dy * dy) / (ry * ry + 0.01) <= 1) p.shade(cx + dx, cy + dy, f);
    }
  }
}

/** Fill a mask, then outline it. inside(i, j) → bool; color(i, j) → rgb. */
function paintShape(p, ox, oy, w, h, inside, color, outline) {
  const m = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) m[j * w + i] = inside(i, j) ? 1 : 0;
  const at = (i, j) => i >= 0 && j >= 0 && i < w && j < h && m[j * w + i] === 1;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (m[j * w + i]) p.set(ox + i, oy + j, color(i, j));
  if (!outline) return;
  for (let j = -1; j <= h; j++) {
    for (let i = -1; i <= w; i++) {
      if (at(i, j)) continue;
      if (at(i - 1, j) || at(i + 1, j) || at(i, j - 1) || at(i, j + 1)) p.set(ox + i, oy + j, outline);
    }
  }
}

/** Stamp a string sprite. `.` is transparent. Anchor is bottom-center. */
function stamp(p, x, y, rows, map) {
  const h = rows.length;
  const w = rows[0].length;
  const ox = x - (w >> 1);
  const oy = y - h + 1;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const ch = rows[j][i];
      if (ch !== '.' && map[ch]) p.set(ox + i, oy + j, map[ch]);
    }
  }
}

function blob(p, cx, cy, r, pal, seed, squash = 1) {
  const o = r + 2;
  const size = o * 2 + 1;
  paintShape(
    p,
    cx - o,
    cy - o,
    size,
    size,
    (i, j) => {
      const dx = i - o;
      const dy = (j - o) * squash;
      const ang = Math.atan2(dy, dx);
      const lump = Math.sin(ang * 5 + seed) * 0.55 + Math.sin(ang * 3 + seed * 1.7) * 0.35;
      return Math.sqrt(dx * dx + dy * dy) <= r + lump * Math.min(1.2, r * 0.22) + 0.35;
    },
    (i, j) => {
      const dx = (i - o) / r;
      const dy = ((j - o) * squash) / r;
      const lit = -dx * 0.5 - dy * 0.85 + (hash2(i, j, seed + 7) - 0.5) * 0.32;
      if (lit > 0.72) return pal.hi;
      if (lit > 0.18) return pal.lite;
      if (lit > -0.4) return pal.mid;
      return pal.dark;
    },
    pal.outline,
  );
}

function roundTree(p, x, y, r, pal, seed) {
  shadowEllipse(p, x + 1, y, r + 1, Math.max(1, Math.round(r * 0.4)));
  const th = r <= 2 ? 1 : Math.max(2, Math.round(r * 0.5));
  for (let j = 0; j <= th; j++) {
    p.set(x, y - j, pal.trunkDk);
    if (r > 3) p.set(x - 1, y - j, pal.trunk);
  }
  blob(p, x, y - th - r, r, pal, seed);
}

function pine(p, x, y, h, pal) {
  const half = Math.max(2, Math.round(h * 0.34));
  shadowEllipse(p, x + 1, y, half + 1, 1);
  p.set(x, y, pal.trunkDk);
  const rows = h - 1;
  const tierH = rows / 3;
  const widthAt = (j) => {
    const t = Math.min(2, Math.floor(j / tierH));
    const local = j - t * tierH;
    return Math.min(half, Math.floor((local + 1) * 0.6 + t * 0.8));
  };
  paintShape(
    p,
    x - half,
    y - h,
    half * 2 + 1,
    rows,
    (i, j) => Math.abs(i - half) <= widthAt(j),
    (i, j) => {
      if (j === 0) return pal.hi;
      const nextTier = Math.floor((j + 1) / tierH) !== Math.floor(j / tierH);
      if (nextTier && j < rows - 1) return pal.dark;
      if (i < half) return (i + j) % 3 === 0 ? pal.hi : pal.lite;
      if (i === half) return pal.mid;
      return pal.dark;
    },
    pal.outline,
  );
}

function bush(p, x, y, r, pal, seed) {
  shadowEllipse(p, x + 1, y + 1, r + 1, 1, 0.8);
  blob(p, x, y - r, r, pal, seed, 1.25);
}

function rock(p, x, y, r, seed) {
  shadowEllipse(p, x + 1, y + 1, r + 1, 1, 0.8);
  blob(p, x, y - r + 1, r, TREES.rock, seed, 1.5);
}

function mountain(p, x, y, w, h, seed) {
  shadowEllipse(p, x + 3, y + 1, (w >> 1) + 2, 2, 0.72);
  const half = w / 2;
  const peakOff = (hash2(seed, 1, 9) - 0.5) * 3;
  paintShape(
    p,
    Math.round(x - half),
    y - h + 1,
    w,
    h,
    (i, j) => {
      const jag = hash2(i, j >> 2, seed) > 0.85 ? 1 : 0;
      return Math.abs(i + 0.5 - half - peakOff * (1 - j / h)) <= ((j + 1) / h) * half - jag * (j < h * 0.3 ? 1 : 0);
    },
    (i, j) => {
      const ridge = half + peakOff * (1 - j / h) + Math.sin(j * 0.9 + seed) * 0.8;
      const left = i + 0.5 < ridge;
      const snowLine = h * 0.3 + hash2(i, 3, seed) * 2;
      if (j < snowLine) return left ? K.white : K.mist;
      if (left) return j > h * 0.72 && (i + j) % 2 === 0 ? K.stone : K.mist;
      return j > h * 0.7 ? K.slate : K.steel;
    },
    K.night,
  );
}

function house(p, x, y, o) {
  const w = o.w ?? 14;
  const wall = o.wall ?? 6;
  const roofH = o.roof ?? 6;
  const left = x - (w >> 1);
  const wallTop = y - wall + 1;
  const [wl, wd] = o.walls ?? [K.peach, K.clay];
  const [rl, rm, rd] = o.roofs ?? [K.red, K.wine, K.plum];
  shadowEllipse(p, x + 2, y + 1, (w >> 1) + 2, 2, 0.72);
  paintShape(p, left, wallTop, w, wall, () => true, (i, j) => (i >= w - 2 || j === wall - 1 ? wd : wl), K.ink);
  // windows
  const winY = wallTop + 1;
  const glass = o.lit ? [K.gold, K.amber] : [K.sky, K.blue];
  if (w >= 11 && wall >= 5) {
    for (const wx of [left + 2, left + w - 4]) {
      p.set(wx, winY, glass[0]);
      p.set(wx + 1, winY, glass[0]);
      p.set(wx, winY + 1, glass[1]);
      p.set(wx + 1, winY + 1, glass[1]);
    }
  }
  // door
  if (o.door !== false) {
    const dw = o.doorW ?? 3;
    const dh = Math.min(o.doorH ?? 4, wall - 1);
    const dx = x - (dw >> 1);
    for (let j = 0; j < dh; j++) {
      for (let i = 0; i < dw; i++) {
        const c = o.glow ? (j < dh - 1 ? (i + j) % 2 ? K.amber : K.orange : K.gold) : K.barkDk;
        p.set(dx + i, y - j, c);
      }
    }
    if (!o.glow) p.set(dx + dw - 1, y - (dh >> 1), K.amber);
    if (o.barnX) {
      for (let j = 0; j < dh; j++) {
        p.set(dx + Math.round((j / (dh - 1)) * (dw - 1)), y - j, K.mist);
        p.set(dx + dw - 1 - Math.round((j / (dh - 1)) * (dw - 1)), y - j, K.mist);
      }
    }
  }
  // roof
  const rw = w + 2;
  const slope = o.slope ?? 1;
  const insetAt = (j) => Math.floor((roofH - 1 - j) * slope);
  paintShape(
    p,
    left - 1,
    wallTop - roofH,
    rw,
    roofH,
    (i, j) => i >= insetAt(j) && i < rw - insetAt(j),
    (i, j) => {
      const right = rw - insetAt(j) - 1;
      if (o.stripes) {
        const band = o.stripes[Math.min(o.stripes.length - 1, Math.floor((j / roofH) * o.stripes.length))];
        return i >= right - 1 ? band[1] : band[0];
      }
      if (i >= right - 1) return rd;
      if (j === 0) return rl;
      return ((roofH - 1 - j) >> 1) % 2 ? rl : rm;
    },
    K.ink,
  );
  if (o.chimney) {
    const chx = left + w - 4;
    const chy = wallTop - roofH + 1;
    p.rect(chx, chy - 2, 2, 3, K.stone);
    p.set(chx + 1, chy - 2, K.steel);
    p.set(chx, chy - 3, K.ink);
    p.set(chx + 1, chy - 3, K.ink);
    return [chx, chy - 4];
  }
  return null;
}

function dome(p, x, y, r, o) {
  const glass = o.glass;
  const [cl, cm, cd] = o.cols;
  shadowEllipse(p, x + 2, y + 1, r + 2, 2, 0.72);
  p.rect(x - r - 1, y - 1, r * 2 + 3, 2, K.stone);
  p.rect(x - r - 1, y, r * 2 + 3, 1, K.steel);
  paintShape(
    p,
    x - r,
    y - 1 - r,
    r * 2 + 1,
    r + 1,
    (i, j) => {
      const dx = i - r;
      const dy = j - r;
      return dx * dx + dy * dy <= r * r + r * 0.5;
    },
    (i, j) => {
      const dx = (i - r) / r;
      const dy = (j - r) / r;
      if (glass && (i - j) % 3 === 0) return K.white;
      const lit = -dx * 0.7 - dy * 0.5;
      if (lit > 0.5) return cl;
      if (lit > -0.2) return cm;
      return cd;
    },
    K.ink,
  );
  if (o.slit) {
    for (let j = 1; j <= r; j++) p.set(x + 1, y - 1 - j, K.ink);
    p.set(x + 2, y - r - 1, K.mist);
    p.set(x + 3, y - r - 2, K.mist);
    p.set(x + 4, y - r - 3, K.white);
  }
}

function lighthouse(p, x, y) {
  shadowEllipse(p, x + 2, y + 1, 5, 2, 0.7);
  const hgt = 16;
  for (let j = 0; j < hgt; j++) {
    const half = 3 - Math.floor((j / hgt) * 1.6);
    const band = Math.floor(j / 3) % 2 === 0 ? [K.red, K.wine] : [K.white, K.mist];
    for (let i = -half; i <= half; i++) p.set(x + i, y - j, i >= half - 1 ? band[1] : band[0]);
    p.set(x - half - 1, y - j, K.ink);
    p.set(x + half + 1, y - j, K.ink);
  }
  const top = y - hgt;
  p.rect(x - 3, top, 7, 1, K.ink);
  p.rect(x - 2, top - 3, 5, 3, K.gold);
  p.set(x - 2, top - 3, K.white);
  p.set(x - 3, top - 3, K.ink);
  p.set(x + 3, top - 3, K.ink);
  p.set(x - 3, top - 2, K.ink);
  p.set(x + 3, top - 2, K.ink);
  p.set(x - 3, top - 1, K.ink);
  p.set(x + 3, top - 1, K.ink);
  p.rect(x - 3, top - 4, 7, 1, K.ink);
  p.rect(x - 2, top - 5, 5, 1, K.red);
  p.rect(x - 1, top - 6, 3, 1, K.red);
  p.set(x, top - 7, K.ink);
  p.set(x - 2, top - 5, K.ink);
  p.set(x + 2, top - 5, K.ink);
  p.set(x - 1, top - 6, K.ink);
  p.set(x + 1, top - 6, K.ink);
  // door
  p.set(x, y, K.barkDk);
  p.set(x, y - 1, K.barkDk);
}

function silo(p, x, y) {
  shadowEllipse(p, x + 2, y + 1, 4, 2, 0.72);
  const w = 6;
  const hgt = 13;
  paintShape(
    p,
    x - 3,
    y - hgt + 1,
    w,
    hgt,
    () => true,
    (i, j) => {
      if (j % 4 === 0) return K.stone;
      return i < 2 ? K.white : i < 4 ? K.mist : K.stone;
    },
    K.ink,
  );
  paintShape(
    p,
    x - 3,
    y - hgt - 2,
    w,
    3,
    (i, j) => j > 0 || (i > 0 && i < w - 1),
    (i) => (i < 3 ? K.red : K.wine),
    K.ink,
  );
}

function stall(p, x, y, awning) {
  shadowEllipse(p, x + 1, y + 1, 6, 1, 0.78);
  p.rect(x - 4, y - 2, 9, 3, K.dirt);
  p.rect(x - 4, y, 9, 1, K.bark);
  p.set(x - 5, y - 2, K.ink);
  p.set(x + 5, y - 2, K.ink);
  for (let j = 3; j <= 6; j++) {
    p.set(x - 4, y - j, K.bark);
    p.set(x + 4, y - j, K.bark);
  }
  for (let i = -5; i <= 5; i++) {
    const c = (i + 5) % 4 < 2 ? awning : K.white;
    p.set(x + i, y - 7, c);
    p.set(x + i, y - 8, c);
    if ((i + 5) % 2 === 0) p.set(x + i, y - 6, c);
    p.set(x + i, y - 9, K.ink);
  }
  const goods = [K.red, K.gold, K.leaf, K.orange, K.sky];
  for (let i = -3; i <= 3; i += 2) p.set(x + i, y - 3, goods[(i + 3) % goods.length]);
}

function signpost(p, x, y, board = K.dirt, mark = null) {
  p.set(x, y, K.barkDk);
  p.set(x, y - 1, K.bark);
  p.set(x, y - 2, K.bark);
  paintShape(p, x - 2, y - 5, 5, 3, () => true, (i, j) => (j === 2 ? K.bark : board), K.ink);
  if (mark) p.set(x, y - 4, mark);
}

function flag(p, x, y, col, colDk) {
  for (let j = 0; j < 10; j++) p.set(x, y - j, j === 9 ? K.gold : K.mist);
  p.set(x + 1, y, K.ink);
  for (let j = 0; j < 4; j++) {
    for (let i = 1; i <= 6 - (j === 0 || j === 3 ? 1 : 0); i++) p.set(x + i, y - 8 + j, i > 4 ? colDk : col);
  }
}

function obelisk(p, x, y) {
  shadowEllipse(p, x + 2, y + 1, 5, 2, 0.72);
  p.rect(x - 4, y - 1, 9, 2, K.stone);
  p.rect(x - 4, y, 9, 1, K.steel);
  paintShape(
    p,
    x - 2,
    y - 14,
    5,
    13,
    (i, j) => j > 2 || (j === 2 && i > 0 && i < 4) || (j === 1 && i > 0 && i < 4) || (j === 0 && i === 2),
    (i, j) => (i >= 3 ? K.stone : j < 3 ? K.white : K.mist),
    K.night,
  );
  // key glyph
  p.set(x, y - 9, K.gold);
  p.set(x - 1, y - 8, K.gold);
  p.set(x + 1, y - 8, K.gold);
  p.set(x, y - 7, K.gold);
  p.set(x, y - 6, K.amber);
  p.set(x, y - 5, K.amber);
  p.set(x + 1, y - 5, K.amber);
  p.set(x, y - 4, K.amber);
}

function scaffold(p, x, y) {
  for (let j = 0; j < 4; j++) for (let i = -6; i <= 6; i++) if (hash2(i, j, 77) > 0.35) p.set(x + i, y - j + 1, (i + j) % 2 ? K.clay : K.dirt);
  for (let j = 0; j < 10; j++) {
    p.set(x - 5, y - j, K.bark);
    p.set(x + 5, y - j, K.bark);
  }
  for (let i = -5; i <= 5; i++) {
    p.set(x + i, y - 9, K.dirt);
    p.set(x + i, y - 5, K.dirt);
  }
  for (let k = 0; k < 4; k++) p.set(x - 4 + k * 2, y - 8 + k, K.bark);
  paintShape(p, x - 2, y - 4, 5, 4, () => true, (i, j) => (j === 1 && i > 0 && i < 4 ? K.white : K.blue), K.ink);
  for (let i = -6; i <= 6; i++) p.set(x + i, y + 1, (i + 6) % 4 < 2 ? K.gold : K.ink);
}

function plot(p, x, y, w, h, crop) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      let c = j % 2 ? K.soil : K.soilLt;
      if (i === 0 || j === 0) c = K.bark;
      if (i === w - 1 || j === h - 1) c = K.barkDk;
      p.set(x + i, y + j, c);
    }
  }
  for (let j = 2; j < h - 1; j += 2) {
    for (let i = 2; i < w - 1; i += 2) {
      if (crop === 'wheat') {
        p.set(x + i, y + j, K.amber);
        p.set(x + i, y + j - 1, K.gold);
      } else if (crop === 'sprout') {
        p.set(x + i, y + j, K.leafMd);
        p.set(x + i, y + j - 1, K.leafHi);
      } else if (crop === 'pumpkin') {
        if ((i + j) % 4 === 0) {
          p.set(x + i, y + j, K.orange);
          p.set(x + i + 1, y + j, K.rust);
          p.set(x + i, y + j - 1, K.leaf);
        } else {
          p.set(x + i, y + j, K.leafMd);
        }
      } else if (crop === 'cabbage') {
        p.set(x + i, y + j, K.leaf);
        p.set(x + i + 1, y + j, K.leafMd);
        p.set(x + i, y + j - 1, K.leafHi);
      }
    }
  }
}

function fenceRect(p, x, y, w, h) {
  const post = (px, py) => {
    p.set(px, py, K.bark);
    p.set(px, py - 1, K.dirt);
  };
  for (let i = 0; i <= w; i++) {
    p.set(x + i, y - 1, K.dirt);
    p.set(x + i, y + h - 1, K.dirt);
    if (i % 3 === 0) {
      post(x + i, y);
      post(x + i, y + h);
    }
  }
  for (let j = 0; j <= h; j++) {
    p.set(x, y + j - 1, K.dirt);
    p.set(x + w, y + j - 1, K.dirt);
    if (j % 3 === 0) {
      post(x, y + j);
      post(x + w, y + j);
    }
  }
}

function plaza(p, cx, cy, rx, ry) {
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      const e = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
      if (e > 1) continue;
      const x = cx + dx;
      const y = cy + dy;
      let c = ((x >> 1) + (y >> 1)) % 2 ? K.mist : K.stone;
      if ((x % 4 === 0 && y % 2 === 0) || hash2(x, y, 3) < 0.08) c = K.steel;
      if (e > 0.82) c = K.steel;
      p.set(x, y, c);
    }
  }
}

function fountain(p, x, y) {
  paintShape(p, x - 3, y - 2, 7, 4, (i, j) => !((i === 0 || i === 6) && (j === 0 || j === 3)), (i, j) => (i > 0 && i < 6 && j > 0 && j < 3 ? K.shallow : K.mist), K.night);
  p.set(x, y - 2, K.white);
  p.set(x, y - 3, K.foam);
  p.set(x, y - 4, K.white);
}

function compassRose(p, x, y) {
  plaza(p, x, y, 6, 4);
  for (let i = -5; i <= 5; i++) p.set(x + i, y, K.amber);
  for (let j = -3; j <= 3; j++) p.set(x, y + j, K.amber);
  p.set(x, y - 4, K.red);
  p.set(x, y - 3, K.red);
  p.set(x, y, K.gold);
  p.set(x - 1, y - 1, K.gold);
  p.set(x + 1, y + 1, K.gold);
  p.set(x + 1, y - 1, K.gold);
  p.set(x - 1, y + 1, K.gold);
}

function tent(p, x, y, col, colDk) {
  shadowEllipse(p, x + 1, y + 1, 6, 1, 0.78);
  paintShape(
    p,
    x - 5,
    y - 6,
    11,
    7,
    (i, j) => Math.abs(i - 5) <= j * 0.85 + 0.5,
    (i, j) => {
      if (i === 5 && j > 2) return K.barkDk;
      return i < 5 ? ((i + j) % 4 < 2 ? col : K.white) : colDk;
    },
    K.ink,
  );
  p.set(x, y - 7, K.gold);
}

function library(p, x, y) {
  shadowEllipse(p, x + 2, y + 1, 12, 2, 0.72);
  p.rect(x - 11, y, 23, 1, K.steel);
  p.rect(x - 10, y - 1, 21, 1, K.stone);
  p.rect(x - 9, y - 9, 19, 8, K.peach);
  p.rect(x - 1, y - 5, 3, 4, K.barkDk);
  for (const cx of [-8, -5, 4, 7]) {
    for (let j = 2; j <= 8; j++) {
      p.set(x + cx, y - j, K.white);
      p.set(x + cx + 1, y - j, K.mist);
    }
  }
  p.rect(x - 10, y - 10, 21, 2, K.mist);
  p.rect(x - 10, y - 10, 21, 1, K.white);
  paintShape(
    p,
    x - 11,
    y - 15,
    23,
    5,
    (i, j) => Math.abs(i - 11) <= j * 2.4 + 1.5,
    (i, j) => (j === 4 ? K.wine : i > 11 ? K.wine : K.red),
    K.ink,
  );
  p.set(x, y - 13, K.gold);
  for (let j = 1; j <= 10; j++) {
    p.set(x - 11, y - j, K.ink);
    p.set(x + 11, y - j, K.ink);
  }
}

function watchtower(p, x, y) {
  shadowEllipse(p, x + 2, y + 1, 5, 2, 0.74);
  for (let j = 0; j < 12; j++) {
    p.set(x - 3 + Math.floor(j / 6), y - j, K.bark);
    p.set(x + 3 - Math.floor(j / 6), y - j, K.barkDk);
  }
  for (let k = 0; k < 3; k++) p.set(x - 2 + k * 2, y - 3 - k * 3, K.dirt);
  p.rect(x - 4, y - 13, 9, 2, K.dirt);
  p.rect(x - 4, y - 12, 9, 1, K.bark);
  p.set(x - 4, y - 16, K.bark);
  p.set(x + 4, y - 16, K.bark);
  p.set(x - 4, y - 15, K.bark);
  p.set(x + 4, y - 15, K.bark);
  p.set(x - 4, y - 14, K.bark);
  p.set(x + 4, y - 14, K.bark);
  paintShape(p, x - 5, y - 19, 11, 3, (i, j) => Math.abs(i - 5) <= j * 2 + 1.5, (i) => (i > 5 ? K.wine : K.red), K.ink);
}

function mine(p, x, y) {
  paintShape(p, x - 3, y - 4, 7, 5, (i, j) => j > 1 || (i > 0 && i < 6) || (j === 1 && i > 0 && i < 6), (i, j) => (i === 0 || i === 6 || j === 0 ? K.bark : K.ink), K.barkDk);
  for (let i = 0; i < 9; i++) {
    p.set(x + 4 + i, y, K.stone);
    if (i % 2 === 0) p.set(x + 4 + i, y + 1, K.bark);
  }
  paintShape(p, x + 7, y - 3, 5, 3, () => true, (i, j) => (j === 0 ? K.stone : i > 2 ? K.wine : K.red), K.ink);
}

function crates(p, x, y) {
  for (const [dx, dy] of [
    [-3, 0],
    [1, 0],
    [-1, -3],
  ]) {
    paintShape(p, x + dx, y + dy - 2, 3, 3, () => true, (i, j) => (i === j || i === 2 - j ? K.bark : K.dirt), K.barkDk);
  }
}

function campfire(p, x, y) {
  for (let i = -3; i <= 3; i++) {
    if (Math.abs(i) === 3) continue;
    p.set(x + i, y, K.steel);
  }
  p.set(x - 3, y - 1, K.steel);
  p.set(x + 3, y - 1, K.steel);
  p.set(x - 1, y - 1, K.bark);
  p.set(x, y - 2, K.barkDk);
  p.set(x + 1, y - 1, K.bark);
  for (const [dx, dy] of [
    [-6, 1],
    [6, 1],
    [0, -4],
    [0, 4],
  ]) {
    p.set(x + dx - 1, y + dy, K.bark);
    p.set(x + dx, y + dy, K.dirt);
    p.set(x + dx + 1, y + dy, K.bark);
  }
}

function emptyLot(p, x, y) {
  for (let i = -6; i <= 6; i++) {
    if (i % 2 === 0) {
      p.set(x + i, y - 8, K.bark);
      p.set(x + i, y, K.bark);
    }
  }
  for (let j = -8; j <= 0; j++) {
    if (j % 2 === 0) {
      p.set(x - 6, y + j, K.bark);
      p.set(x + 6, y + j, K.bark);
    }
  }
  signpost(p, x, y - 2, K.peach, K.red);
}

function palm(p, x, y, seed) {
  shadowEllipse(p, x + 2, y + 1, 4, 1, 0.8);
  const lean = hash2(seed, 2, 3) > 0.5 ? 1 : -1;
  let tx = x;
  for (let j = 0; j < 9; j++) {
    if (j % 3 === 2) tx += lean;
    p.set(tx, y - j, j % 2 ? K.clay : K.dirt);
  }
  const top = y - 9;
  const fronds = [
    [-4, 1],
    [-3, 0],
    [-2, -1],
    [-1, -1],
    [0, -1],
    [1, -1],
    [2, -1],
    [3, 0],
    [4, 1],
    [-2, 1],
    [2, 1],
    [-3, 2],
    [3, 2],
    [0, 0],
    [-1, 0],
    [1, 0],
  ];
  for (const [dx, dy] of fronds) p.set(tx + dx, top + dy, Math.abs(dx) > 2 ? K.leafMd : K.leaf);
  p.set(tx - 4, top + 2, K.leafDk);
  p.set(tx + 4, top + 2, K.leafDk);
  p.set(tx, top + 1, K.bark);
}

function canopyTree(p, x, y) {
  shadowEllipse(p, x + 2, y, 20, 6, 0.7);
  // roots
  const roots = [
    [-9, 1],
    [-6, 2],
    [6, 2],
    [10, 1],
    [-3, 3],
    [3, 3],
  ];
  for (const [dx, dy] of roots) {
    const steps = Math.abs(dx);
    for (let s = 0; s <= steps; s++) {
      const rx = x + Math.round((dx * s) / steps);
      const ry = y - 1 + Math.round((dy * s) / steps);
      p.set(rx, ry, s === steps ? K.barkDk : K.bark);
    }
  }
  paintShape(
    p,
    x - 4,
    y - 16,
    8,
    16,
    (i, j) => j > 2 || (i > 0 && i < 7),
    (i, j) => {
      if (i < 2) return K.dirt;
      if (i > 5) return K.barkDk;
      return (j + i) % 5 === 0 ? K.barkDk : K.bark;
    },
    K.ink,
  );
  const pal = TREES.canopy;
  const clumps = [
    [-14, -26, 9, 3],
    [14, -27, 9, 5],
    [0, -36, 10, 1],
    [-9, -38, 8, 7],
    [10, -39, 8, 11],
    [-18, -18, 6, 13],
    [18, -19, 6, 17],
    [-6, -24, 10, 19],
    [7, -23, 10, 23],
    [0, -29, 11, 29],
  ];
  for (const [dx, dy, r, s] of clumps) blob(p, x + dx, y + dy, r, pal, s);
  // fruit / blossoms
  for (let k = 0; k < 14; k++) {
    const fx = x + Math.round((hash2(k, 1, 51) - 0.5) * 40);
    const fy = y - 22 - Math.round(hash2(k, 2, 51) * 22);
    p.set(fx, fy, k % 3 === 0 ? K.pink : K.gold);
  }
}

function boatSprite(p, x, y, sail) {
  for (let i = -4; i <= 4; i++) {
    p.set(x + i, y, K.bark);
    if (Math.abs(i) < 4) p.set(x + i, y + 1, K.barkDk);
  }
  p.set(x - 5, y - 1, K.bark);
  p.set(x + 5, y - 1, K.bark);
  for (let i = -4; i <= 4; i++) p.set(x + i, y - 1, K.dirt);
  for (let j = 2; j <= 8; j++) p.set(x, y - j, K.mist);
  for (let j = 0; j < 5; j++) for (let i = 1; i <= 5 - j; i++) p.set(x + i, y - 3 - j, i === 5 - j ? K.mist : K.white);
  p.set(x + 1, y - 9, sail);
  p.set(x + 2, y - 9, sail);
}

const AGENT_A = ['..y..', '.www.', '.wcw.', '.www.', 'sbbbs', '.b.b.'];
const AGENT_B = ['..y..', '.www.', '.wcw.', '.www.', 'sbbbs', '..b..'];

// ---------------------------------------------------------------------------
// World generation (cached)
// ---------------------------------------------------------------------------

const STAGE_ANG = STAGES.map((s) => Math.atan2((s.anchor[1] - CY) / RING.ry, (s.anchor[0] - CX) / RING.rx));

function angDist(a, b) {
  let d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

function ringPoint(t) {
  const wob = 1 + 0.045 * Math.sin(3 * t + 0.7) + 0.03 * Math.sin(5 * t + 2) + 0.02 * Math.sin(8 * t + 1.3);
  return [CX + Math.cos(t) * RING.rx * wob, CY + Math.sin(t) * RING.ry * wob];
}

function linePts(points, step = 0.35) {
  const out = [];
  const push = (x, y) => {
    const px = Math.round(x);
    const py = Math.round(y);
    const last = out[out.length - 1];
    if (!last || last[0] !== px || last[1] !== py) out.push([px, py]);
  };
  for (let k = 0; k < points.length - 1; k++) {
    const [x0, y0] = points[k];
    const [x1, y1] = points[k + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let i = 0; i <= n; i++) push(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n);
  }
  return out;
}

function bezier(p0, c, p1) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const u = 1 - t;
    pts.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]);
  }
  return linePts(pts);
}

let WORLD = null;

function getWorld() {
  if (!WORLD) WORLD = buildWorld();
  return WORLD;
}

function buildWorld() {
  const N = W * H;
  const p = new Pix(W, H);
  const land = new Uint8Array(N);
  const sand = new Uint8Array(N);
  const region = new Int8Array(N).fill(-1);
  const outerF = new Float32Array(N);
  const innerF = new Float32Array(N);

  // --- fields + regions
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const n = fbm(x / 26, y / 26, 7) - 0.5;
      const dx = (x - CX) / 166;
      const dy = (y - CY) / 100;
      let outer = 1 - Math.sqrt(dx * dx + dy * dy) + n * 0.42;
      for (const s of STAGES) {
        const ax = x - s.anchor[0];
        const ay = y - s.anchor[1];
        outer += 0.14 * Math.exp(-(ax * ax + ay * ay) / 1300);
      }
      const edge = Math.min(x, y, W - 1 - x, H - 1 - y);
      outer = Math.min(outer, edge / 36 - 0.28);
      const lx = (x - CX) / LAKE.rx;
      const ly = (y - CY) / LAKE.ry;
      const lakeWarp = (fbm(x / 40, y / 40, 19) - 0.5) * 0.32;
      const inner = Math.sqrt(lx * lx + ly * ly) - 1 + n * 0.22 + lakeWarp;
      const ix = (x - ISLAND.x) / ISLAND.rx;
      const iy = (y - ISLAND.y) / ISLAND.ry;
      const isl = 1 - Math.sqrt(ix * ix + iy * iy) + n * 0.16;
      const ex = (x - ISLET.x) / ISLET.rx;
      const ey = (y - ISLET.y) / ISLET.ry;
      const islet = 1 - Math.sqrt(ex * ex + ey * ey) + n * 0.1;
      outerF[i] = outer;
      innerF[i] = inner;

      if (outer > 0 && inner > 0) {
        land[i] = 1;
        let a = Math.atan2((y - CY) / RING.ry, (x - CX) / RING.rx);
        a += (fbm(x / 18, y / 18, 333) - 0.5) * 0.55;
        let best = 0;
        let bestD = 9;
        STAGE_ANG.forEach((sa, k) => {
          const d = angDist(a, sa);
          if (d < bestD) {
            bestD = d;
            best = k;
          }
        });
        region[i] = best;
        const thr = best === 4 ? 0.12 : 0.065;
        if (outer < thr || inner < 0.07) sand[i] = outer < thr * 0.4 || inner < 0.025 ? 2 : 1;
      } else if (isl > 0) {
        land[i] = 1;
        region[i] = REGION_CANOPY;
        if (isl < 0.13) sand[i] = isl < 0.05 ? 2 : 1;
      } else if (islet > 0) {
        land[i] = 1;
        region[i] = REGION_ISLET;
      }
    }
  }

  const isLand = (x, y) => x >= 0 && y >= 0 && x < W && y < H && land[y * W + x] === 1;

  // --- base colors
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (land[i]) {
        const r = region[i];
        if (sand[i]) {
          p.set(x, y, sand[i] === 2 && (x + y) % 2 === 0 ? K.wetSand : K.sand);
          if (sand[i] === 1 && hash2(x, y, 41) < 0.03) p.set(x, y, K.peach);
          continue;
        }
        const pal = GROUND[r];
        const g = vnoise(x / 5, y / 5, 21) * 0.6 + vnoise(x / 13, y / 13, 22) * 0.4;
        let col = pal.base;
        if (g > 0.63 || (g > 0.6 && (x + y) % 2 === 0)) col = pal.lite;
        else if (g < 0.35 || (g < 0.38 && (x + y) % 2 === 0)) col = pal.dark;
        p.set(x, y, col);
      } else {
        const outer = outerF[i];
        const inner = innerF[i];
        let col;
        if (inner < 0) {
          // lake
          const v = -inner;
          col = v < 0.1 || (v < 0.14 && (x + y) % 2 === 0) ? K.shallow : K.mid;
        } else {
          const v = outer;
          if (v > -0.05 || (v > -0.07 && (x + y) % 2 === 0)) col = K.shallow;
          else if (v > -0.13 || (v > -0.16 && (x + y) % 2 === 0)) col = K.mid;
          else if (v > -0.24 || (v > -0.27 && (x + y) % 2 === 0)) col = K.sea;
          else col = K.deep;
        }
        p.set(x, y, col);
      }
    }
  }

  // --- region borders (soft hedge between lands)
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const i = y * W + x;
      if (!land[i] || sand[i] || region[i] > 6) continue;
      const r = region[i];
      const rr = region[i + 1];
      const rd = region[i + W];
      if ((rr >= 0 && rr <= 6 && rr !== r && !sand[i + 1]) || (rd >= 0 && rd <= 6 && rd !== r && !sand[i + W])) {
        if ((x + y) % 2 === 0) p.shade(x, y, 0.84);
      }
    }
  }

  // --- ground detail: tufts, flowers, leaves, pebbles
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (!land[i] || sand[i]) continue;
      const r = region[i];
      const h = hash2(x, y, 5);
      if (h < 0.012) {
        p.set(x, y, GROUND[r].dark);
        p.set(x - 1, y, GROUND[r].dark);
        p.set(x, y - 1, GROUND[r].lite);
      } else if ((r === 0 || r === REGION_CANOPY) && h < 0.04) {
        const f = hash2(x, y, 6);
        p.set(x, y, f < 0.33 ? K.gold : f < 0.66 ? K.pink : K.white);
      } else if (r === 6 && h < 0.035) {
        p.set(x, y, hash2(x, y, 6) < 0.5 ? K.amber : K.rust);
      } else if (r === 5 && h < 0.03) {
        p.set(x, y, K.stone);
      } else if (r === 1 && h < 0.03) {
        p.set(x, y, K.leafDk);
      } else if (r === REGION_ISLET && h < 0.2) {
        p.set(x, y, K.steel);
      }
    }
  }

  // --- cliffs + foam
  const foam = [];
  const water = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (land[i]) continue;
      if (isLand(x, y - 1)) {
        const above = (y - 1) * W + x;
        p.set(x, y, sand[above] ? K.clay : K.dirt);
        if (!isLand(x, y + 1) && !sand[above] && y + 1 < H) {
          p.set(x, y + 1, K.bark);
        }
        continue;
      }
      if (isLand(x, y - 2) && !sand[(y - 2) * W + x]) continue;
      if (isLand(x - 1, y) || isLand(x + 1, y) || isLand(x, y + 1) || isLand(x, y - 2)) {
        p.set(x, y, K.foam);
        foam.push(i);
      } else {
        water.push(i);
      }
    }
  }

  // --- roads
  const roadM = new Uint8Array(N); // 2 core, 1 edge
  const roadAxis = new Uint8Array(N); // 1 vertical planks, 2 horizontal planks
  const stampRoad = (pts, axis = 1, r = 1.5) => {
    for (const [px, py] of pts) {
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const x = px + dx;
          const y = py + dy;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          const i = y * W + x;
          const d2 = dx * dx + dy * dy;
          if (d2 <= r * r) {
            roadM[i] = 2;
            roadAxis[i] = axis;
          } else if (d2 <= (r + 1.1) * (r + 1.1) && roadM[i] === 0) {
            roadM[i] = 1;
            roadAxis[i] = axis;
          }
        }
      }
    }
  };

  const ringPts = [];
  for (let k = 0; k <= 2400; k++) ringPts.push(ringPoint((k / 2400) * Math.PI * 2));
  const ringPath = linePts(ringPts, 0.5);
  stampRoad(ringPath, 1);

  const SPUR_END = {
    frame: [62, 90],
    explore: [160, 50],
    test: [292, 54],
    decide: [332, 128],
    ship: [262, 191],
    observe: [160, 199],
    learn: [62, 159],
  };
  STAGES.forEach((s, k) => {
    const a = ringPoint(STAGE_ANG[k]);
    const b = SPUR_END[s.id];
    const c = [(a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.15, (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.15];
    stampRoad(bezier(a, c, b), 1, 1.2);
  });
  // spokes to the Canopy island
  stampRoad(linePts([ringPoint(-Math.PI / 2), [192, 106]]), 1, 1.5);
  stampRoad(linePts([ringPoint(Math.PI / 2), [192, 136]]), 1, 1.5);
  stampRoad(linePts([ringPoint(Math.PI), [170, 122]]), 2, 1.5);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!roadM[i]) continue;
      if (land[i]) {
        if (roadM[i] === 2) p.set(x, y, hash2(x, y, 88) < 0.12 ? K.pathDk : K.path);
        else if (!sand[i]) p.shade(x, y, 0.82);
      } else if (roadM[i] === 2) {
        const v = roadAxis[i] === 1 ? y : x;
        p.set(x, y, v % 3 === 0 ? K.bark : K.dirt);
      } else {
        const v = roadAxis[i] === 1 ? y : x;
        p.set(x, y, v % 3 === 0 ? K.barkDk : K.bark);
      }
    }
  }
  // bridge shadows
  for (let y = H - 2; y >= 0; y--) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!land[i] && roadM[i] && !land[i + W] && !roadM[i + W]) p.shade(x, y + 1, 0.7);
    }
  }

  // --- scene
  const occ = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (roadM[i]) occ[i] = 1;
  const occupy = (x0, y0, x1, y1) => {
    for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) occ[y * W + x] = 1;
  };
  const free = (x0, y0, x1, y1) => {
    for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) if (occ[y * W + x]) return false;
    }
    return true;
  };

  const props = []; // y-sorted draw calls
  const hits = []; // hover tips
  const chimneys = [];
  const add = (y, draw, box, tip, target) => {
    props.push({ y, draw });
    if (box) occupy(box[0] - 1, box[1] - 1, box[0] + box[2] + 1, box[1] + box[3] + 1);
    if (box && tip) hits.push({ box, tip, target });
  };

  // ground features first
  const ground = [];
  const addGround = (draw, box, tip, target) => {
    ground.push(draw);
    if (box) occupy(box[0] - 1, box[1] - 1, box[0] + box[2] + 1, box[1] + box[3] + 1);
    if (box && tip) hits.push({ box, tip, target });
  };

  // FRAME — Compass Meadow
  addGround(() => compassRose(p, 74, 96), [68, 92, 13, 9], 'Compass rose · the decision being informed', 'frame');
  add(82, () => house(p, 60, 82, { w: 16, wall: 7, roof: 6, walls: [K.white, K.mist], roofs: [K.slate, K.night, K.ink], lit: true }), [51, 69, 18, 14], 'Notion intent hall · intent brief, research hub', 'frame');
  add(80, () => tent(p, 84, 80, K.blue, K.slate), [78, 73, 12, 8], 'Research tent · research plan', 'frame');
  add(84, () => flag(p, 43, 84, K.indigo, K.indigoDk), [42, 74, 8, 11], 'Linear project · project spec', 'frame');

  // EXPLORE — Sketchwood
  add(48, () => {
    silo(p, 124, 48);
    house(p, 136, 49, { w: 13, wall: 7, roof: 5, walls: [K.red, K.wine], roofs: [K.peach, K.clay, K.bark], barnX: true, doorW: 5, doorH: 5 });
  }, [118, 31, 27, 19], 'The Pantry · recipes, layouts, canonical screens', 'pantry');
  add(46, () => house(p, 160, 46, {
    w: 14,
    wall: 6,
    roof: 6,
    walls: [K.white, K.mist],
    stripes: [
      [rgb('#f24e1e'), rgb('#b8381a')],
      [rgb('#ff7262'), rgb('#cc5a4e')],
      [rgb('#a259ff'), rgb('#7a3fd0')],
      [rgb('#1abcfe'), rgb('#128cc0')],
      [rgb('#0acf83'), rgb('#079a61')],
    ],
  }), [152, 33, 16, 14], 'Figma studio · explore frames', 'explore');
  add(44, () => house(p, 181, 44, { w: 11, wall: 5, roof: 5, walls: [K.peach, K.clay], roofs: [K.sbPink, K.sbPinkDk, K.wine], slope: 1.2 }), [175, 34, 13, 11], 'Storybook workshop · rough stories', 'explore');
  addGround(() => {
    for (let j = 0; j < 6; j++) for (let i = 0; i < 9; i++) p.set(170 + i, 52 + j, i === 0 || j === 0 || i === 8 || j === 5 ? K.dirt : (i + j) % 3 ? K.sand : K.wetSand);
    p.rect(172, 54, 2, 2, K.red);
    p.rect(175, 55, 2, 2, K.blue);
    p.set(176, 54, K.gold);
  }, [170, 52, 9, 6], 'Playroom sandbox · component checks', 'explore');

  // KEYSTONE
  add(57, () => obelisk(p, 214, 57), [209, 42, 11, 16], 'The Keystone · Story URL + UXAF IDs', 'keystone');

  // TEST — Test Kitchen Farms
  addGround(() => {
    plot(p, 248, 38, 16, 9, 'wheat');
    plot(p, 248, 50, 9, 8, 'pumpkin');
    plot(p, 259, 50, 9, 8, 'sprout');
    plot(p, 266, 38, 9, 9, 'cabbage');
    fenceRect(p, 246, 36, 31, 24);
  }, [246, 35, 32, 26], 'North star prototype + forks', 'test');
  add(56, () => {
    const ch = house(p, 294, 56, { w: 16, wall: 7, roof: 6, walls: [K.peach, K.clay], roofs: [K.orange, K.rust, K.wine], chimney: true, lit: true });
    if (ch) chimneys.push(ch);
  }, [285, 43, 18, 14], 'Test Kitchen · sessions and verdicts', 'test');
  add(70, () => dome(p, 318, 70, 6, { glass: true, cols: [K.foam, K.sky, K.blue] }), [311, 62, 15, 9], 'The Lab · prototype telemetry', 'test');

  // DISPOSITION — the Sorting Post
  add(98, () => {
    house(p, 306, 98, { w: 12, wall: 6, roof: 5, walls: [K.mist, K.stone], roofs: [K.amber, K.ember, K.rust] });
    crates(p, 296, 99);
    signpost(p, 316, 99, K.dirt, K.gold);
  }, [292, 86, 26, 14], 'The Sorting Post · disposition triage', 'disposition');

  // DECIDE — Crossroads Market
  addGround(() => plaza(p, 332, 126, 17, 9), [315, 117, 35, 19], 'Market square · the Bundle', 'decide');
  add(118, () => {
    house(p, 334, 118, { w: 10, wall: 12, roof: 8, walls: [K.mist, K.stone], roofs: [K.indigo, K.indigoDk, K.night], slope: 0.75, lit: true });
    flag(p, 334, 90, K.rose, K.plum);
  }, [328, 88, 13, 31], 'Linear tower · sub-issues and the Bundle', 'decide');
  add(128, () => fountain(p, 332, 128), null);
  add(133, () => stall(p, 319, 133, K.rose), [313, 124, 12, 10], 'Spec stall · Figma spec page', 'decide');
  add(134, () => stall(p, 346, 134, K.indigo), [340, 125, 12, 10], 'Readiness stall · checklist + gap list', 'decide');
  add(144, () => house(p, 350, 146, { w: 11, wall: 5, roof: 4, walls: [K.peach, K.clay], roofs: [K.rose, K.plum, K.night] }), [344, 137, 13, 10], 'Decisions log', 'decide');
  add(112, () => signpost(p, 314, 112, K.dirt, K.rose), null);

  // SHIP — Release Harbor
  add(188, () => {
    const ch = house(p, 262, 188, { w: 15, wall: 7, roof: 5, walls: [K.slate, K.night], roofs: [K.steel, K.slate, K.night], glow: true, doorW: 3, chimney: true });
    if (ch) chimneys.push(ch);
  }, [254, 176, 17, 13], 'GitHub forge · PRs, CI, CODEOWNERS', 'ship');
  add(194, () => crates(p, 277, 195), [273, 190, 8, 6], 'Release crates · commit / release', 'ship');
  add(196, () => {
    flag(p, 292, 196, K.leaf, K.leafMd);
    flag(p, 298, 197, K.gold, K.amber);
  }, [291, 186, 13, 12], 'Release Hub · feature flags', 'ship');
  addGround(() => {
    for (let j = 0; j < 26; j++) {
      for (let i = 0; i < 4; i++) p.set(284 + i, 199 + j, j % 3 === 0 ? K.bark : K.dirt);
      if (j % 6 === 5) {
        p.set(283, 199 + j, K.barkDk);
        p.set(288, 199 + j, K.barkDk);
      }
    }
    for (let i = 0; i < 14; i++) for (let j = 0; j < 3; j++) p.set(279 + i, 224 + j, i % 3 === 0 ? K.bark : K.dirt);
  }, [279, 199, 14, 28], 'Release pier', 'ship');

  // OBSERVE — Watchtower Ridge
  add(219, () => mountain(p, 114, 219, 22, 15, 3), [103, 205, 22, 15], 'Watchtower Ridge', 'observe');
  add(222, () => mountain(p, 134, 222, 28, 20, 5), [120, 203, 28, 20], 'Watchtower Ridge', 'observe');
  add(220, () => {
    mountain(p, 158, 222, 24, 17, 9);
    mine(p, 156, 221);
  }, [146, 205, 26, 18], 'Redshift mine · surface-level events (where they exist)', 'observe');
  add(197, () => dome(p, 164, 197, 6, { cols: [K.violet, rgb('#6b3fb3'), K.violetDk], slit: true }), [157, 186, 16, 12], 'Datadog observatory · RUM', 'observe');
  add(195, () => house(p, 140, 195, { w: 11, wall: 5, roof: 4, walls: [K.peach, K.clay], roofs: [rgb('#509ee3'), rgb('#3b7bb8'), K.slate] }), [134, 186, 13, 10], 'Metabase hut · dashboards', 'observe');
  add(204, () => watchtower(p, 186, 204), [181, 185, 11, 20], 'Watchtower · thresholds and check-ins', 'observe');

  // LEARN — Archive Grove
  add(156, () => library(p, 62, 156), [50, 141, 24, 16], 'Library · insights, patterns, Canopy docs', 'learn');
  add(172, () => emptyLot(p, 84, 172), [77, 163, 15, 10], 'Insights registry (proposed) · does not exist yet', 'gap:G3');
  add(174, () => campfire(p, 42, 174), [35, 169, 14, 10], 'Readout campfire · unlit since June 2024', 'gap:G24');
  add(124, () => {
    for (let j = 0; j < 10; j++) {
      p.set(83, 124 - j, K.wine);
      p.set(93, 124 - j, K.wine);
      p.set(84, 124 - j, K.red);
      p.set(94, 124 - j, K.red);
    }
    p.rect(81, 113, 15, 2, K.red);
    p.rect(81, 115, 15, 1, K.wine);
    p.rect(82, 117, 13, 1, K.red);
    p.set(81, 112, K.ink);
    p.set(95, 112, K.ink);
  }, [80, 111, 17, 14], LOOP_CLOSE, 'frame');

  // CANOPY + CAPTURE
  add(134, () => canopyTree(p, 192, 134), [170, 88, 46, 47], 'The Canopy · the design system', 'canopy');
  add(136, () => lighthouse(p, 241, 136), [236, 112, 11, 25], 'Capture Lighthouse · one primitive, five consumers', 'capture');

  // BLUEPRINTS
  BLUEPRINTS.forEach((b) => {
    const [bx, by] = b.at;
    add(by, () => scaffold(p, bx, by), [bx - 7, by - 10, 15, 12], `Blueprint · ${b.name}`, `bp:${b.id}`);
  });

  // --- scatter vegetation per region
  const rnd = makeRng(20261010);
  const scatter = (regionId, count, place) => {
    let placed = 0;
    for (let tries = 0; tries < count * 12 && placed < count; tries++) {
      const x = Math.floor(rnd() * W);
      const y = Math.floor(rnd() * H);
      const i = y * W + x;
      if (!land[i] || region[i] !== regionId) continue;
      if (place(x, y, i)) placed++;
    }
  };
  const tryTree = (x, y, i, kind, pal, size) => {
    if (sand[i] && kind !== 'palm') return false;
    if (kind === 'palm' && !sand[i]) return false;
    const r = size;
    const box = kind === 'pine' ? [x - r, y - r * 3, x + r, y + 1] : [x - r - 1, y - r * 2 - 2, x + r + 1, y + 1];
    if (!free(box[0], box[1], box[2], box[3])) return false;
    // keep the crown on land
    if (!isLand(x, box[1] + 2) || !isLand(box[0] + 1, y) || !isLand(box[2] - 1, y)) return false;
    occupy(x - Math.max(1, r - 1), y - r, x + Math.max(1, r - 1), y);
    const seed = Math.floor(rnd() * 1000);
    props.push({
      y,
      draw: () => {
        if (kind === 'pine') pine(p, x, y, r * 3, pal);
        else if (kind === 'bush') bush(p, x, y, r, pal, seed);
        else if (kind === 'rock') rock(p, x, y, r, seed);
        else if (kind === 'palm') palm(p, x, y, seed);
        else roundTree(p, x, y, r, pal, seed);
      },
    });
    return true;
  };
  scatter(0, 16, (x, y, i) => tryTree(x, y, i, 'tree', TREES.green, 3 + Math.floor(rnd() * 2)));
  scatter(0, 10, (x, y, i) => tryTree(x, y, i, 'bush', TREES.green, 2));
  scatter(1, 34, (x, y, i) => tryTree(x, y, i, rnd() < 0.55 ? 'pine' : 'tree', TREES.forest, 3 + Math.floor(rnd() * 2)));
  scatter(1, 18, (x, y, i) => tryTree(x, y, i, 'bush', TREES.forest, 2));
  scatter(2, 10, (x, y, i) => tryTree(x, y, i, 'tree', TREES.green, 3));
  scatter(2, 10, (x, y, i) => tryTree(x, y, i, 'bush', TREES.green, 2));
  scatter(3, 10, (x, y, i) => tryTree(x, y, i, 'tree', TREES.green, 3 + Math.floor(rnd() * 2)));
  scatter(3, 6, (x, y, i) => tryTree(x, y, i, 'bush', TREES.green, 2));
  scatter(4, 10, (x, y, i) => tryTree(x, y, i, 'palm', TREES.green, 3));
  scatter(4, 8, (x, y, i) => tryTree(x, y, i, 'tree', TREES.green, 3));
  scatter(5, 12, (x, y, i) => tryTree(x, y, i, 'pine', TREES.forest, 3));
  scatter(5, 12, (x, y, i) => tryTree(x, y, i, 'rock', TREES.rock, 2));
  scatter(6, 22, (x, y, i) => {
    const pick = rnd();
    return tryTree(x, y, i, 'tree', pick < 0.4 ? TREES.amber : pick < 0.7 ? TREES.red : TREES.gold, 3 + Math.floor(rnd() * 2));
  });
  scatter(6, 8, (x, y, i) => tryTree(x, y, i, 'bush', TREES.amber, 2));
  scatter(REGION_CANOPY, 6, (x, y, i) => tryTree(x, y, i, 'bush', TREES.green, 2));
  scatter(REGION_ISLET, 3, (x, y, i) => tryTree(x, y, i, 'rock', TREES.rock, 1));

  // --- lily pads
  for (let k = 0; k < 40; k++) {
    const x = Math.floor(rnd() * W);
    const y = Math.floor(rnd() * H);
    const i = y * W + x;
    if (land[i] || roadM[i] || innerF[i] > -0.12 || occ[i]) continue;
    const ix = (x - ISLAND.x) / ISLAND.rx;
    const iy = (y - ISLAND.y) / ISLAND.ry;
    if (ix * ix + iy * iy < 1.6) continue;
    p.set(x, y, K.leafMd);
    p.set(x + 1, y, K.leaf);
    if (k % 4 === 0) p.set(x + 1, y - 1, K.pink);
  }

  for (const draw of ground) draw();
  props.sort((a, b) => a.y - b.y);
  for (const prop of props) prop.draw();

  // --- region outlines for hover
  const outlines = Array.from({ length: 9 }, () => []);
  const fills = Array.from({ length: 9 }, () => []);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const r = region[i];
      if (r < 0) continue;
      fills[r].push(i);
      const diff = (xx, yy) => xx < 0 || yy < 0 || xx >= W || yy >= H || region[yy * W + xx] !== r;
      if (diff(x - 1, y) || diff(x + 1, y) || diff(x, y - 1) || diff(x, y + 1)) outlines[r].push(i);
    }
  }

  const boats = [
    { x: 300, y: 214, sail: K.red },
    { x: 274, y: 222, sail: K.gold },
    { x: 250, y: 140, sail: K.leaf },
  ];

  return { pix: p, region, land, water, foam, ringPath, hits, chimneys, boats, outlines, fills };
}

/** The painted world (terrain + props) as a plain 384 × 240 canvas. */
export function renderWorldBitmap() {
  const world = getWorld();
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(world.pix.d), W, H), 0, 0);
  return canvas;
}

// ---------------------------------------------------------------------------
// DOM helpers + icons
// ---------------------------------------------------------------------------

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') {
      for (const [prop, val] of Object.entries(v)) {
        if (prop.startsWith('--')) el.style.setProperty(prop, val);
        else el.style[prop] = val;
      }
    }
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

const ICONS = {
  database: {
    rows: ['.ooooooo.', 'oLLLLLLLo', 'oMMMMMMMo', 'oLLLLLLLo', 'oMMMMMMMo', 'oLLLLLLLo', 'oMMMMMMMo', '.ooooooo.'],
    map: { o: '#262b44', L: '#c0cbdc', M: '#8b9bb4' },
  },
  key: {
    rows: ['.ggg.....', 'g...g....', 'g.d.ggggg', 'g...g.g.g', '.ggg..g.g'],
    map: { g: '#feae34', d: '#3e2731' },
  },
  hammer: {
    rows: ['.sssssss.', '.sMMMMMs.', '.sssssss.', '....b....', '....b....', '....b....', '....b....', '...bbb...'],
    map: { s: '#3a4466', M: '#8b9bb4', b: '#733e39' },
  },
  agent: {
    rows: ['....y....', '....o....', '.ooooooo.', '.owwwwwo.', '.owcwcwo.', '.owwwwwo.', '.ooooooo.', '..o...o..'],
    map: { y: '#fee761', o: '#262b44', w: '#c0cbdc', c: '#0099db' },
  },
  diamond: {
    rows: ['....o....', '...oPo...', '..oPpPo..', '.oPpppPo.', 'oPpppppPo', '.oPpppPo.', '..oPpPo..', '...oPo...', '....o....'],
    map: { o: '#3e2731', P: '#b55088', p: '#f6757a' },
  },
  scroll: {
    rows: ['oooooooo.', 'oPPPPPPoo', 'oPllllPPo', 'oPPPPPPPo', 'oPlllllPo', 'oPPPPPPPo', 'oPllllPPo', 'ooooooooo'],
    map: { o: '#3e2731', P: '#ffffff', l: '#8b9bb4' },
  },
  quest: {
    rows: ['.ooooo.', 'oyyyyyo', 'oyyoyyo', 'oyyoyyo', 'oyyoyyo', 'oyyyyyo', 'oyyoyyo', '.ooooo.'],
    map: { o: '#3e2731', y: '#fee761' },
  },
  cone: {
    rows: ['....o....', '...oOo...', '...owo...', '..oOOOo..', '..owwwo..', '.oOOOOOo.', 'ooooooooo'],
    map: { o: '#3e2731', O: '#f77622', w: '#ffffff' },
  },
  home: {
    rows: ['....o....', '...oPo...', '..oPPPo..', '.oPPPPPo.', 'ooPPPPPoo', '.oPPdPPo.', '.oPPdPPo.', '.ooooooo.'],
    map: { o: '#181425', P: '#ead4aa', d: '#733e39' },
  },
  link: {
    rows: ['..ooo....', '.o...o...', '.o...ooo.', '..ooo...o', '....o...o', '.....ooo.'],
    map: { o: '#3e2731' },
  },
};

function pixelIcon(name, size = 18) {
  const { rows, map } = ICONS[name];
  const hgt = rows.length;
  const wid = rows[0].length;
  let rects = '';
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.') rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${map[ch]}"/>`;
    });
  });
  const span = document.createElement('span');
  span.className = 'dos-icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 ${wid} ${hgt}" width="${size}" height="${Math.round((size * hgt) / wid)}" shape-rendering="crispEdges">${rects}</svg>`;
  return span;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

let instanceCount = 0;

const REGION_TARGET = [...STAGES.map((s) => s.id), 'canopy', 'capture'];
const GAPS_BY_STAGE = Object.fromEntries(STAGES.map((s) => [s.id, GAPS.filter((g) => g.stage === s.id)]));

function regionLabel(target) {
  const s = STAGE_BY_ID[target];
  if (s) return `${s.n} · ${s.name} — ${s.land}`;
  const l = LANDMARK_BY_ID[target];
  return l ? `${l.name} — ${l.kind}` : '';
}

/**
 * @param {{
 *   focus?: string | null,
 *   keys?: boolean, capture?: boolean, agents?: boolean, quests?: boolean,
 *   blueprints?: boolean, labels?: boolean, animate?: boolean,
 * }} [options]
 */
export function createDesignOsWorld(options = {}) {
  const opts = {
    focus: null,
    keys: true,
    capture: true,
    agents: true,
    quests: true,
    blueprints: true,
    labels: true,
    animate: true,
    ...options,
  };
  const uid = `dos-${++instanceCount}`;
  const world = getWorld();
  const reduceMotion =
    !opts.animate || (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  const layers = {
    keys: opts.keys,
    capture: opts.capture,
    agents: opts.agents,
    quests: opts.quests,
    blueprints: opts.blueprints,
    labels: opts.labels,
  };

  // --- DOM skeleton
  const terrain = h('canvas', { class: 'dos__canvas', width: W, height: H, 'aria-hidden': 'true' });
  const hoverCanvas = h('canvas', { class: 'dos__canvas', width: W, height: H, 'aria-hidden': 'true' });
  const fxCanvas = h('canvas', { class: 'dos__canvas', width: W, height: H, 'aria-hidden': 'true' });
  const map = h('div', { class: 'dos__map' }, terrain, hoverCanvas, fxCanvas);
  const overlay = h('div', { class: 'dos__overlay' });
  const viewport = h(
    'div',
    {
      class: 'dos__viewport',
      tabindex: '0',
      role: 'application',
      'aria-roledescription': 'map',
      'aria-label':
        'Design OS mini world. Seven lands on a loop: Frame, Explore, Test, Decide and break down, Ship, Observe, Learn. Use Tab to reach each land, arrow keys to pan, plus and minus to zoom.',
    },
    map,
    overlay,
  );
  const tooltip = h('div', { class: 'dos__tooltip', 'aria-hidden': 'true' });
  const hint = h('p', { class: 'dos__hint' }, 'Click a land to unfurl · drag to pan · ⌘/Ctrl + scroll to zoom');

  const root = h('div', { class: 'dos', 'data-reduced-motion': reduceMotion ? 'true' : null }, viewport, tooltip, hint);

  terrain.getContext('2d').putImageData(new ImageData(world.pix.d, W, H), 0, 0);
  const hoverCtx = hoverCanvas.getContext('2d');
  const fxCtx = fxCanvas.getContext('2d');
  const hoverPix = new Pix(W, H);
  const fxPix = new Pix(W, H);

  // --- HUD
  const openCount = GAPS.filter((g) => !g.waiting).length;
  const waitingCount = GAPS.length - openCount;
  const questBtn = h(
    'button',
    { class: 'dos-btn dos-btn--quest', type: 'button', onclick: () => openPanel('quests') },
    pixelIcon('quest', 12),
    h('span', {}, 'Quest log'),
    h('span', { class: 'dos-count' }, String(GAPS.length)),
  );
  const zoomIn = h('button', { class: 'dos-btn dos-btn--icon', type: 'button', 'aria-label': 'Zoom in', onclick: () => zoomBy(1.4) }, '+');
  const zoomOut = h('button', { class: 'dos-btn dos-btn--icon', type: 'button', 'aria-label': 'Zoom out', onclick: () => zoomBy(1 / 1.4) }, '-');
  const zoomReset = h('button', { class: 'dos-btn dos-btn--icon', type: 'button', 'aria-label': 'Show the whole world', onclick: () => resetView() }, pixelIcon('home', 14));
  const hud = h(
    'header',
    { class: 'dos__hud' },
    h(
      'div',
      { class: 'dos-title' },
      h('h1', { class: 'dos-title__name' }, 'Design OS'),
      h('p', { class: 'dos-title__sub' }, 'Mini world'),
      h(
        'p',
        { class: 'dos-title__stats' },
        `${STAGES.length} lands · ${LANDMARKS.length} landmarks · ${openCount} open quests · ${waitingCount} wait on Oct 9`,
      ),
    ),
    h('div', { class: 'dos__hud-actions' }, questBtn, h('div', { class: 'dos-zoom' }, zoomOut, zoomReset, zoomIn)),
  );

  // --- layers
  const LAYER_DEFS = [
    ['keys', 'Keys spine', '#fee761'],
    ['capture', 'Capture light', '#fff6b8'],
    ['agents', 'Agents', '#c0cbdc'],
    ['quests', 'Quests', '#feae34'],
    ['blueprints', 'Blueprints', '#0099db'],
    ['labels', 'Labels', '#ead4aa'],
  ];
  const layerInputs = {};
  const layersPanel = h(
    'fieldset',
    { class: 'dos__layers' },
    h('legend', {}, 'Layers'),
    LAYER_DEFS.map(([key, label, swatch]) => {
      const input = h('input', {
        type: 'checkbox',
        checked: layers[key],
        onchange: (e) => {
          layers[key] = e.target.checked;
          applyLayers();
        },
      });
      layerInputs[key] = input;
      return h('label', { class: 'dos-layer' }, input, h('span', { class: 'dos-layer__box', style: { '--swatch': swatch } }), label);
    }),
  );

  const sources = h(
    'p',
    { class: 'dos__sources' },
    'Source of record: ',
    h('a', { href: SOURCES.figjam, target: '_blank', rel: 'noopener' }, 'FigJam map'),
    ' · ',
    h('a', { href: SOURCES.notion, target: '_blank', rel: 'noopener' }, 'Notion idea log'),
  );

  // --- scroll panel
  const scrollBody = h('div', { class: 'dos-scroll__body', tabindex: '-1' });
  const closeBtn = h('button', { class: 'dos-scroll__close', type: 'button', 'aria-label': 'Roll up the scroll', onclick: () => closePanel() }, '×');
  const scroll = h(
    'aside',
    { class: 'dos-scroll', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': `${uid}-title`, hidden: true },
    h('div', { class: 'dos-scroll__paper' }, closeBtn, scrollBody),
    h('div', { class: 'dos-scroll__rod dos-scroll__rod--top', 'aria-hidden': 'true' }),
    h('div', { class: 'dos-scroll__rod dos-scroll__rod--bottom', 'aria-hidden': 'true' }),
  );

  root.append(hud, layersPanel, sources, scroll);

  // --- overlay markers
  const markers = [];
  const addMarker = (el, x, y, kind, extra = {}) => {
    overlay.append(el);
    markers.push({ el, x, y, kind, ...extra });
  };

  STAGES.forEach((s) => {
    const gaps = GAPS_BY_STAGE[s.id];
    const waiting = gaps.filter((g) => g.waiting).length;
    const btn = h(
      'button',
      {
        class: 'dos-plaque',
        type: 'button',
        style: { '--accent': s.accent },
        'aria-label': `Land ${s.n} of ${STAGES.length}: ${s.name}, ${s.land}. ${gaps.length} ${gaps.length === 1 ? 'quest' : 'quests'}${waiting ? `, ${waiting} ${waiting === 1 ? 'depends' : 'depend'} on Oct 9` : ''}. Unfurl.`,
        onclick: () => openPanel(s.id),
        onpointerenter: () => setHover(s.id),
        onpointerleave: () => setHover(null),
      },
      h('span', { class: 'dos-plaque__n' }, String(s.n)),
      h('span', { class: 'dos-plaque__name' }, s.short),
      h(
        'span',
        { class: 'dos-plaque__q', 'data-layer': 'quests' },
        h('span', { class: 'dos-plaque__open' }, `!${gaps.length - waiting}`),
        waiting ? h('span', { class: 'dos-plaque__wait' }, h('span', { class: 'dos-pip' }), String(waiting)) : null,
      ),
    );
    addMarker(btn, s.label[0], s.label[1], 'plaque', { target: s.id });
  });

  LANDMARKS.forEach((l) => {
    const [bx, by, bw, bh] = LANDMARK_BOXES[l.id];
    const hot = h('button', {
      class: 'dos-hotspot',
      type: 'button',
      tabindex: '-1',
      'aria-hidden': 'true',
      onclick: () => openPanel(l.id),
      onpointerenter: () => setHover(l.id),
      onpointerleave: () => setHover(null),
    });
    addMarker(hot, bx, by, 'hotspot', { w: bw, h: bh, target: l.id });
    const tag = h(
      'button',
      {
        class: 'dos-tag',
        type: 'button',
        'data-layer': 'labels',
        style: { '--accent': l.accent },
        'aria-label': `${l.name}, ${l.kind}. Unfurl.`,
        onclick: () => openPanel(l.id),
        onpointerenter: () => setHover(l.id),
        onpointerleave: () => setHover(null),
      },
      l.name,
    );
    const [tx, ty] = TAG_POS[l.id] ?? [bx + bw / 2, by + bh + 4];
    addMarker(tag, tx, ty, 'tag', { target: l.id });
  });

  const g25 = GAPS.find((g) => g.stage === 'all');
  const allQuest = h(
    'button',
    {
      class: 'dos-quest',
      type: 'button',
      'data-layer': 'quests',
      'aria-label': `${g25.id}, all lands: ${g25.text} Open the quest log.`,
      onclick: () => openPanel('quests', g25.id),
    },
    '!',
  );
  addMarker(allQuest, 172, 136, 'quest');

  BLUEPRINTS.forEach((b) => {
    const btn = h(
      'button',
      {
        class: 'dos-cone',
        type: 'button',
        'data-layer': 'blueprints',
        'aria-label': `Blueprint: ${b.name}. ${b.kind}. Open.`,
        onclick: () => openPanel(b.home, `bp:${b.id}`),
      },
      pixelIcon('cone', 12),
    );
    addMarker(btn, b.at[0] + 7, b.at[1] - 12, 'cone');
  });

  // --- camera
  const view = { w: 1, hgt: 1, fit: 1, pad: { top: 72, bottom: 16, x: 16 } };
  const cam = { x: W / 2, y: H / 2, k: 1 };
  let tween = null;

  function visibleCenter() {
    const panelOpen = !scroll.hidden;
    const narrow = view.w < 720;
    if (panelOpen && narrow) return { x: view.w / 2, y: view.pad.top + (view.hgt * 0.42 - view.pad.top) / 2 + 20 };
    if (panelOpen) {
      const pw = scroll.getBoundingClientRect().width || 420;
      return { x: (view.w - pw - 24) / 2, y: view.pad.top + (view.hgt - view.pad.top - view.pad.bottom) / 2 };
    }
    return { x: view.w / 2, y: view.pad.top + (view.hgt - view.pad.top - view.pad.bottom) / 2 };
  }

  function layout() {
    const r = root.getBoundingClientRect();
    view.w = r.width || 800;
    view.hgt = r.height || 600;
    const narrow = view.w < 720;
    view.pad = narrow ? { top: 96, bottom: 64, x: 8 } : { top: 72, bottom: 24, x: 24 };
    const availW = Math.max(120, view.w - view.pad.x * 2);
    const availH = Math.max(120, view.hgt - view.pad.top - view.pad.bottom);
    view.fit = Math.min(availW / W, availH / H);
    map.style.width = `${W * view.fit}px`;
    map.style.height = `${H * view.fit}px`;
    applyCamera();
  }

  function clampCam() {
    cam.k = Math.min(6, Math.max(1, cam.k));
    cam.x = Math.min(W, Math.max(0, cam.x));
    cam.y = Math.min(H, Math.max(0, cam.y));
  }

  function toScreen(x, y) {
    const vc = visibleCenter();
    const s = view.fit * cam.k;
    return [vc.x + (x - cam.x) * s, vc.y + (y - cam.y) * s];
  }

  function toArt(sx, sy) {
    const vc = visibleCenter();
    const s = view.fit * cam.k;
    return [cam.x + (sx - vc.x) / s, cam.y + (sy - vc.y) / s];
  }

  function applyCamera() {
    const vc = visibleCenter();
    const s = view.fit * cam.k;
    map.style.transform = `translate(${vc.x - cam.x * s}px, ${vc.y - cam.y * s}px) scale(${cam.k})`;
    for (const m of markers) {
      const [sx, sy] = toScreen(m.x, m.y);
      if (m.kind === 'hotspot') {
        m.el.style.transform = `translate(${sx}px, ${sy}px)`;
        m.el.style.width = `${m.w * s}px`;
        m.el.style.height = `${m.h * s}px`;
      } else {
        m.el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
      }
    }
    root.style.setProperty('--dos-zoom', String(cam.k));
  }

  function moveCamera(target, duration = 650) {
    if (reduceMotion || duration === 0) {
      Object.assign(cam, target);
      clampCam();
      applyCamera();
      return;
    }
    const from = { ...cam };
    const start = performance.now();
    tween = { from, target, start, duration };
  }

  function stepTween(now) {
    if (!tween) return;
    const t = Math.min(1, (now - tween.start) / tween.duration);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    for (const key of ['x', 'y', 'k']) {
      if (tween.target[key] != null) cam[key] = tween.from[key] + (tween.target[key] - tween.from[key]) * e;
    }
    clampCam();
    applyCamera();
    if (t >= 1) tween = null;
  }

  function zoomBy(f, sx, sy) {
    hideHint();
    const vc = visibleCenter();
    const px = sx ?? vc.x;
    const py = sy ?? vc.y;
    const [ax, ay] = toArt(px, py);
    const k = Math.min(6, Math.max(1, cam.k * f));
    const s = view.fit * k;
    moveCamera({ k, x: ax - (px - vc.x) / s, y: ay - (py - vc.y) / s }, sx == null ? 280 : 0);
  }

  /** Default zoom: whole world on wide screens; fill most of the height on phones. */
  function homeZoom() {
    if (view.w >= 720) return 1;
    const availH = view.hgt - view.pad.top - view.pad.bottom;
    return Math.min(2.6, Math.max(1.2, (availH * 0.8) / (H * view.fit)));
  }

  function resetView() {
    moveCamera({ x: W / 2, y: H / 2, k: homeZoom() });
  }

  // --- hover + selection outlines
  let hoverTarget = null;
  let selected = null;

  function regionIndexFor(target) {
    return REGION_TARGET.indexOf(target);
  }

  function drawHover() {
    hoverPix.clear();
    const paintRegion = (target, col, fill) => {
      const r = regionIndexFor(target);
      if (r < 0) return;
      if (fill) {
        for (const i of world.fills[r]) {
          const x = i % W;
          const y = (i / W) | 0;
          if ((x + y) % 2 === 0) hoverPix.set(x, y, K.white, 46);
        }
      }
      for (const i of world.outlines[r]) hoverPix.set(i % W, (i / W) | 0, col, 235);
    };
    const selTarget = selected && (STAGE_BY_ID[selected] || selected === 'canopy' || selected === 'capture') ? selected : null;
    if (selTarget) paintRegion(selTarget, rgb((STAGE_BY_ID[selTarget] || LANDMARK_BY_ID[selTarget]).accent), false);
    if (hoverTarget && hoverTarget !== selTarget) paintRegion(hoverTarget, K.white, true);
    hoverCtx.putImageData(new ImageData(hoverPix.d, W, H), 0, 0);
    for (const m of markers) m.el.classList.toggle('is-hover', m.target === hoverTarget);
  }

  function setHover(target) {
    if (target === hoverTarget) return;
    hoverTarget = target;
    drawHover();
  }

  function hitAt(ax, ay) {
    const x = Math.floor(ax);
    const y = Math.floor(ay);
    if (x < 0 || y < 0 || x >= W || y >= H) return null;
    for (let k = world.hits.length - 1; k >= 0; k--) {
      const hit = world.hits[k];
      if (hit.target.startsWith('bp:') && !layers.blueprints) continue;
      const [bx, by, bw, bh] = hit.box;
      if (x >= bx && x < bx + bw && y >= by && y < by + bh) return hit;
    }
    const r = world.region[y * W + x];
    if (r < 0) return null;
    const target = REGION_TARGET[r];
    return { target, tip: regionLabel(target) };
  }

  function targetHome(target) {
    if (target.startsWith('bp:')) return BLUEPRINTS.find((b) => `bp:${b.id}` === target)?.home;
    if (target.startsWith('gap:')) return GAPS.find((g) => `gap:${g.id}` === target)?.stage;
    return target;
  }

  // --- pointer: drag to pan, click to open
  let drag = null;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('button')) return;
    drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false, id: e.pointerId };
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener('pointermove', (e) => {
    const rr = root.getBoundingClientRect();
    const sx = e.clientX - rr.left;
    const sy = e.clientY - rr.top;
    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 4) {
        drag.moved = true;
        tween = null;
        root.classList.add('is-dragging');
        hideHint();
      }
      if (drag.moved) {
        const s = view.fit * cam.k;
        cam.x = drag.cx - dx / s;
        cam.y = drag.cy - dy / s;
        clampCam();
        applyCamera();
        tooltip.classList.remove('is-visible');
        return;
      }
    }
    if (e.target.closest('button')) {
      tooltip.classList.remove('is-visible');
      return;
    }
    const [ax, ay] = toArt(sx, sy);
    const hit = hitAt(ax, ay);
    const home = hit ? targetHome(hit.target) : null;
    setHover(home && regionIndexFor(home) >= 0 ? home : home && LANDMARK_BY_ID[home] ? home : null);
    viewport.style.cursor = hit ? 'pointer' : 'grab';
    if (hit) {
      tooltip.textContent = hit.tip;
      tooltip.style.transform = `translate(${Math.min(sx + 14, view.w - 260)}px, ${sy + 18}px)`;
      tooltip.classList.add('is-visible');
    } else {
      tooltip.classList.remove('is-visible');
    }
  });
  const endDrag = (e) => {
    if (!drag) return;
    const wasMoved = drag.moved;
    drag = null;
    root.classList.remove('is-dragging');
    if (wasMoved || e.type === 'pointercancel') return;
    const rr = root.getBoundingClientRect();
    const [ax, ay] = toArt(e.clientX - rr.left, e.clientY - rr.top);
    const hit = hitAt(ax, ay);
    if (!hit) return;
    if (hit.target.startsWith('bp:')) openPanel(targetHome(hit.target), hit.target);
    else if (hit.target.startsWith('gap:')) openPanel(targetHome(hit.target), hit.target.slice(4));
    else openPanel(hit.target);
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', () => {
    if (!drag) {
      setHover(null);
      tooltip.classList.remove('is-visible');
    }
  });
  viewport.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const rr = root.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        zoomBy(Math.exp(-e.deltaY * 0.01), e.clientX - rr.left, e.clientY - rr.top);
      } else {
        tween = null;
        const s = view.fit * cam.k;
        cam.x += e.deltaX / s;
        cam.y += e.deltaY / s;
        clampCam();
        applyCamera();
      }
    },
    { passive: false },
  );
  viewport.addEventListener('keydown', (e) => {
    if (e.target !== viewport) return;
    const step = 24 / cam.k;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      moveCamera({ x: cam.x + moves[e.key][0], y: cam.y + moves[e.key][1] }, 160);
    } else if (e.key === '+' || e.key === '=') zoomBy(1.4);
    else if (e.key === '-') zoomBy(1 / 1.4);
    else if (e.key === '0') resetView();
  });

  function hideHint() {
    hint.classList.add('is-hidden');
  }

  // --- layers
  function applyLayers() {
    for (const [key, on] of Object.entries(layers)) {
      root.classList.toggle(`hide-${key}`, !on);
      if (layerInputs[key]) layerInputs[key].checked = on;
    }
    if (reduceMotion) drawFx(0);
  }

  // --- panel content
  let lastTrigger = null;

  function stageChip(id) {
    const s = STAGE_BY_ID[id];
    if (!s) return h('span', { class: 'dos-chip' }, 'All lands');
    return h(
      'button',
      { class: 'dos-chip', type: 'button', style: { '--accent': s.accent }, onclick: () => openPanel(s.id) },
      h('span', { class: 'dos-chip__n' }, String(s.n)),
      s.short,
    );
  }

  function landmarkChip(id) {
    const l = LANDMARK_BY_ID[id];
    return h('button', { class: 'dos-chip dos-chip--landmark', type: 'button', style: { '--accent': l.accent }, onclick: () => openPanel(l.id) }, l.name);
  }

  function questCard(g, highlight) {
    return h(
      'li',
      { class: `dos-sticky${g.waiting ? ' dos-sticky--wait' : ''}${highlight ? ' is-highlight' : ''}`, 'data-gap': g.id },
      h(
        'p',
        { class: 'dos-sticky__meta' },
        h('span', { class: 'dos-sticky__id' }, g.id),
        g.main ? h('span', { class: 'dos-sticky__tag dos-sticky__tag--main' }, 'Main quest') : null,
        g.waiting ? h('span', { class: 'dos-sticky__tag' }, h('span', { class: 'dos-pip' }), 'Depends on Oct 9') : null,
      ),
      h('p', { class: 'dos-sticky__text' }, g.text),
    );
  }

  function blueprintCard(b, highlight) {
    return h(
      'li',
      { class: `dos-blueprint${highlight ? ' is-highlight' : ''}`, 'data-bp': b.id },
      h('p', { class: 'dos-blueprint__kind' }, pixelIcon('cone', 12), b.kind),
      h('p', { class: 'dos-blueprint__name' }, b.name),
      h('p', { class: 'dos-blueprint__text' }, b.text),
      b.surfaces ? h('p', { class: 'dos-blueprint__surfaces' }, `Surfaces: ${b.surfaces}`) : null,
    );
  }

  function itemList(items) {
    return h(
      'ul',
      { class: 'dos-list' },
      items.map((t) => {
        const missing = /\((missing|proposed)\)/i.exec(t);
        return h(
          'li',
          { class: missing ? 'is-fog' : null },
          t.replace(/\s*\((missing|proposed)\)/i, ''),
          missing ? h('span', { class: 'dos-fog-tag' }, missing[1].toLowerCase()) : null,
        );
      }),
    );
  }

  function section(title, icon, hint, ...content) {
    return h(
      'section',
      { class: 'dos-section' },
      h('h3', { class: 'dos-section__title' }, icon ? pixelIcon(icon, 16) : null, title),
      hint ? h('p', { class: 'dos-section__hint' }, hint) : null,
      ...content,
    );
  }

  function headerBlock(eyebrow, title, land, sub, accent) {
    return h(
      'header',
      { class: 'dos-scroll__head', style: { '--accent': accent } },
      h('p', { class: 'dos-eyebrow' }, eyebrow),
      h('h2', { class: 'dos-scroll__title', id: `${uid}-title`, tabindex: '-1' }, title),
      land ? h('p', { class: 'dos-scroll__land' }, land) : null,
      sub ? h('p', { class: 'dos-scroll__sub' }, sub) : null,
    );
  }

  function renderStage(s, focusItem) {
    const idx = STAGES.indexOf(s);
    const prev = STAGES[(idx + STAGES.length - 1) % STAGES.length];
    const next = STAGES[(idx + 1) % STAGES.length];
    const gaps = GAPS_BY_STAGE[s.id];
    const bps = BLUEPRINTS.filter((b) => b.home === s.id);
    const capture = LANDMARK_BY_ID.capture.consumers.find(([id]) => id === s.id);
    const roots = LANDMARK_BY_ID.canopy.roots.find(([id]) => id === s.id);
    const disposition = { test: 0, decide: 1, ship: 2 }[s.id];
    const links = [];
    if (capture) links.push(h('li', {}, landmarkChip('capture'), h('span', {}, capture[1])));
    if (roots) links.push(h('li', {}, landmarkChip('canopy'), h('span', {}, roots[1])));
    if (disposition != null) {
      const [name, detail] = LANDMARK_BY_ID.disposition.inputs[disposition];
      links.push(h('li', {}, landmarkChip('disposition'), h('span', {}, `${name}: ${detail}`)));
    }
    if (s.id === 'explore' || s.id === 'learn') links.push(h('li', {}, landmarkChip('pantry'), h('span', {}, 'Recipes, layouts, canonical screens')));
    links.push(h('li', {}, landmarkChip('keystone'), h('span', {}, s.keys[0])));

    return [
      headerBlock(`Land ${s.n} of ${STAGES.length} · Loop stage`, `${s.n} · ${s.name}`, s.land, s.sub, s.accent),
      ...DIMENSIONS.map((d) => section(d.label, d.icon, d.hint, itemList(s[d.key]))),
      gaps.length
        ? section(
            `Quests (${gaps.length})`,
            'quest',
            'Missing or weak elements registered against this stage.',
            h('ul', { class: 'dos-stickies' }, gaps.map((g) => questCard(g, focusItem === g.id))),
          )
        : null,
      bps.length
        ? section('Under construction', 'cone', 'Blueprints from the idea log.', h('ul', { class: 'dos-blueprints' }, bps.map((b) => blueprintCard(b, focusItem === `bp:${b.id}`))))
        : null,
      section('Connections', 'link', null, h('ul', { class: 'dos-links' }, links)),
      h(
        'nav',
        { class: 'dos-scroll__nav', 'aria-label': 'Walk the loop' },
        h('button', { class: 'dos-btn', type: 'button', onclick: () => openPanel(prev.id) }, `< ${prev.n} ${prev.short}`),
        h(
          'button',
          { class: 'dos-btn', type: 'button', onclick: () => openPanel(next.id), title: s.id === 'learn' ? LOOP_CLOSE : null },
          s.id === 'learn' ? `Loop to ${next.n} ${next.short} >` : `${next.n} ${next.short} >`,
        ),
      ),
      s.id === 'learn' ? h('p', { class: 'dos-scroll__loop' }, LOOP_CLOSE) : null,
    ];
  }

  function renderLandmark(l, focusItem) {
    const out = [headerBlock(l.kind, l.name, null, l.sub, l.accent), h('p', { class: 'dos-lede' }, l.lede)];
    if (l.core) out.push(h('div', { class: 'dos-core' }, pixelIcon(l.id === 'keystone' ? 'key' : 'agent', 18), h('p', {}, l.core)));
    if (l.id === 'canopy') {
      out.push(
        section(
          'Roots in each land',
          'link',
          'Where Canopy shows up across the map.',
          h('ul', { class: 'dos-links' }, l.roots.map(([id, text]) => h('li', {}, STAGE_BY_ID[id] ? stageChip(id) : landmarkChip(id), h('span', {}, text)))),
        ),
      );
    }
    if (l.items) out.push(section('Where the keys travel', 'key', null, itemList(l.items)));
    if (l.consumers) {
      out.push(
        section(
          'Five consumers',
          'link',
          'The lighthouse beams reach stages 3–7.',
          h('ul', { class: 'dos-links' }, l.consumers.map(([id, text]) => h('li', {}, stageChip(id), h('span', {}, text)))),
        ),
      );
    }
    if (l.inputs) {
      out.push(
        section('Findings arrive', 'hammer', null, h('ul', { class: 'dos-links' }, l.inputs.map(([name, detail], k) => h('li', {}, stageChip(['test', 'decide', 'ship'][k]), h('span', {}, h('strong', {}, name), ` — ${detail}`))))),
        h('div', { class: 'dos-core dos-core--diamond' }, pixelIcon('diamond', 18), h('p', {}, l.decision)),
        section(
          'Five ways out',
          'scroll',
          null,
          h(
            'ul',
            { class: 'dos-routes' },
            l.outputs.map(([name, text, empty]) =>
              h('li', { class: empty ? 'is-fog' : null }, h('strong', {}, name), ` → ${text}`, empty ? h('span', { class: 'dos-fog-tag' }, 'nothing writes here today') : null),
            ),
          ),
        ),
      );
    }
    if (l.shelves) {
      out.push(
        section(
          'Shelves',
          'database',
          'Repo axis → UXAF layer → index.',
          h(
            'ol',
            { class: 'dos-shelves' },
            l.shelves.map(([file, fileNote, layer, layerNote, db, dbNote]) =>
              h(
                'li',
                {},
                h('span', { class: 'dos-shelf' }, h('strong', {}, file), fileNote ? h('small', {}, fileNote) : null),
                h('span', { class: 'dos-shelf__arrow', 'aria-label': 'is a projection of' }, '→'),
                h('span', { class: 'dos-shelf' }, h('strong', {}, layer), layerNote ? h('small', {}, layerNote) : null),
                h('span', { class: 'dos-shelf__arrow', 'aria-label': 'indexed in' }, '→'),
                h('span', { class: 'dos-shelf' }, h('strong', {}, db), dbNote ? h('small', {}, dbNote) : null),
              ),
            ),
          ),
        ),
      );
    }
    const bps = BLUEPRINTS.filter((b) => b.home === l.id);
    if (bps.length) out.push(section('Under construction', 'cone', 'Blueprints from the idea log.', h('ul', { class: 'dos-blueprints' }, bps.map((b) => blueprintCard(b, focusItem === `bp:${b.id}`)))));
    return out;
  }

  let questFilter = 'all';
  function renderQuests(focusItem) {
    const list = h('div', { class: 'dos-questlog' });
    const draw = () => {
      list.replaceChildren(
        ...[...STAGES.map((s) => s.id), 'all'].map((id) => {
          const gaps = GAPS.filter((g) => g.stage === id && (questFilter === 'all' || (questFilter === 'wait') === !!g.waiting));
          if (!gaps.length) return null;
          return h('section', { class: 'dos-questlog__group' }, h('h3', { class: 'dos-questlog__head' }, stageChip(id), h('span', {}, STAGE_BY_ID[id]?.land ?? 'Every stage')), h('ul', { class: 'dos-stickies' }, gaps.map((g) => questCard(g, focusItem === g.id))));
        }).filter(Boolean),
      );
    };
    const filters = h(
      'div',
      { class: 'dos-filters', role: 'radiogroup', 'aria-label': 'Filter quests' },
      [
        ['all', `All ${GAPS.length}`],
        ['open', `Open ${openCount}`],
        ['wait', `Oct 9 ${waitingCount}`],
      ].map(([key, label]) =>
        h(
          'button',
          {
            class: 'dos-filter',
            type: 'button',
            role: 'radio',
            'aria-checked': String(questFilter === key),
            onclick: (e) => {
              questFilter = key;
              filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b === e.currentTarget)));
              draw();
            },
          },
          label,
        ),
      ),
    );
    draw();
    return [
      headerBlock('Gap register · 25 missing or weak elements', 'Quest log', null, 'Scan for missing elements — each quest sits under the land it belongs to.', '#feae34'),
      h('p', { class: 'dos-legend' }, h('span', { class: 'dos-legend__swatch' }), 'Open', h('span', { class: 'dos-legend__swatch dos-legend__swatch--wait' }), WAITING_NOTE),
      filters,
      list,
    ];
  }

  function openPanel(target, focusItem = null, instant = false) {
    hideHint();
    if (!scroll.contains(document.activeElement)) lastTrigger = document.activeElement;
    selected = target;
    const stage = STAGE_BY_ID[target];
    const landmark = LANDMARK_BY_ID[target];
    let content;
    let focusPoint = null;
    let accent = '#feae34';
    if (stage) {
      content = renderStage(stage, focusItem);
      focusPoint = stage.anchor;
      accent = stage.accent;
    } else if (landmark) {
      content = renderLandmark(landmark, focusItem);
      const [bx, by, bw, bh] = LANDMARK_BOXES[landmark.id];
      focusPoint = [bx + bw / 2, by + bh / 2];
      accent = landmark.accent;
    } else {
      content = renderQuests(focusItem);
    }
    scroll.style.setProperty('--accent', accent);
    scrollBody.replaceChildren(...content.filter(Boolean));
    scrollBody.scrollTop = 0;
    const wasHidden = scroll.hidden;
    scroll.hidden = false;
    scroll.classList.remove('is-rolling');
    scroll.classList.remove('is-unfurling');
    void scroll.offsetWidth;
    if (!reduceMotion && !instant) scroll.classList.add('is-unfurling');
    root.classList.add('has-panel');
    for (const m of markers) m.el.classList.toggle('is-selected', m.target === target);
    drawHover();
    if (focusPoint) {
      const k = view.w < 720 ? Math.max(2.4, homeZoom()) : Math.max(cam.k, 1.7);
      moveCamera({ x: focusPoint[0], y: focusPoint[1], k }, instant ? 0 : 700);
    } else if (wasHidden) {
      applyCamera();
    }
    const focusEl = focusItem && scrollBody.querySelector(`[data-gap="${focusItem}"], [data-bp="${focusItem.replace(/^bp:/, '')}"]`);
    const settle = () => {
      if (focusEl) focusEl.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      if (!instant) scrollBody.querySelector('.dos-scroll__title')?.focus({ preventScroll: true });
    };
    if (reduceMotion || instant) settle();
    else setTimeout(settle, 560);
  }

  function closePanel() {
    if (scroll.hidden) return;
    selected = null;
    root.classList.remove('has-panel');
    for (const m of markers) m.el.classList.remove('is-selected');
    drawHover();
    const finish = () => {
      scroll.hidden = true;
      scroll.classList.remove('is-rolling');
      moveCamera({ k: Math.min(cam.k, view.w < 720 ? homeZoom() : 1.3) }, 500);
      if (lastTrigger && root.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
      else viewport.focus({ preventScroll: true });
    };
    if (reduceMotion) {
      finish();
      return;
    }
    scroll.classList.remove('is-unfurling');
    scroll.classList.add('is-rolling');
    setTimeout(finish, 300);
  }

  const onKey = (e) => {
    if (e.key === 'Escape' && !scroll.hidden && root.contains(document.activeElement)) closePanel();
  };
  document.addEventListener('keydown', onKey);

  // --- FX
  const agents = [0, 0.19, 0.41, 0.6, 0.83].map((f, k) => ({ offset: Math.floor(f * world.ringPath.length), speed: k % 2 ? 1 : 1 }));
  const beamTargets = LANDMARK_BY_ID.capture.consumers.map(([id]) => STAGE_BY_ID[id].anchor);
  const beamLines = beamTargets.map(([tx, ty]) => linePts([LAMP, [tx, ty - 6]], 1));
  const fxRng = makeRng(1);

  function drawFx(frame) {
    const p = fxPix;
    p.clear();
    // water sparkle
    const n = world.water.length;
    let seed = (frame * 2654435761) >>> 0;
    for (let k = 0; k < 70; k++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const i = world.water[seed % n];
      const x = i % W;
      const y = (i / W) | 0;
      p.set(x, y, K.foam, 210);
      if (k % 3 === 0) p.set(x + 1, y, K.foam, 150);
    }
    // foam shimmer
    for (const i of world.foam) {
      const x = i % W;
      const y = (i / W) | 0;
      if ((x + y + (frame >> 1)) % 6 === 0) p.set(x, y, K.white, 255);
    }
    // boats
    world.boats.forEach((b, k) => {
      const bob = ((frame + k * 7) >> 3) % 2;
      boatSprite(p, b.x, b.y + bob, b.sail);
    });
    // chimney smoke
    for (const [cx, cy] of world.chimneys) {
      for (let k = 0; k < 4; k++) {
        const age = (frame + k * 6) % 24;
        if (age > 20) continue;
        const sx = cx + Math.round(Math.sin((age + k) * 0.45) * 1.2 + age * 0.15);
        const sy = cy - Math.round(age * 0.55);
        const col = age < 8 ? K.mist : K.stone;
        const a = Math.max(60, 230 - age * 9);
        p.set(sx, sy, col, a);
        if (age > 4 && age < 14) p.set(sx + 1, sy, col, a);
      }
    }
    // fireflies around the Canopy
    for (let k = 0; k < 10; k++) {
      if ((frame + k * 3) % 12 > 8) continue;
      const ang = frame * 0.04 + k * 0.63;
      const rad = 20 + Math.sin(frame * 0.07 + k) * 6;
      p.set(192 + Math.cos(ang) * rad, 110 + Math.sin(ang) * rad * 0.6, K.gold, 230);
    }
    // keys spine: glints running clockwise around the loop
    if (layers.keys) {
      const len = world.ringPath.length;
      for (let k = 0; k < 12; k++) {
        const head = (frame * 2 + Math.floor((k * len) / 12)) % len;
        [K.white, K.gold, K.amber, K.ember].forEach((col, t) => {
          const [x, y] = world.ringPath[(head - t * 2 + len) % len];
          p.set(x, y, col, 255 - t * 40);
        });
      }
      const pulse = frame % 16 < 8;
      if (pulse) {
        p.set(214, 48, K.white);
        p.set(213, 49, K.white);
        p.set(215, 49, K.white);
      }
    }
    // capture beams
    if (layers.capture) {
      beamLines.forEach((line, b) => {
        line.forEach(([x, y], i) => {
          if (i < 3) return;
          const on = (i - frame + b * 3) % 7;
          if (on === 0) p.set(x, y, K.white, 240);
          else if (on === 1) p.set(x, y, K.gold, 200);
          else if (i % 2 === 0) p.set(x, y, K.gold, 50);
        });
      });
    }
    const [lx, ly] = LAMP;
    const lit = frame % 10 < 6;
    p.set(lx - 1, ly, lit ? K.white : K.gold);
    p.set(lx, ly, lit ? K.white : K.gold);
    p.set(lx + 1, ly, lit ? K.white : K.gold);
    // agents walking the loop
    if (layers.agents) {
      const len = world.ringPath.length;
      agents.forEach((a, k) => {
        const idx = (a.offset + Math.floor(frame * 0.7)) % len;
        const [x, y] = world.ringPath[idx];
        const rows = frame % 4 < 2 ? AGENT_A : AGENT_B;
        shadowEllipse(p, x, y + 1, 2, 0, 1);
        p.set(x - 1, y + 1, K.ink, 90);
        p.set(x, y + 1, K.ink, 90);
        p.set(x + 1, y + 1, K.ink, 90);
        stamp(p, x, y, rows, {
          y: (frame + k) % 6 < 3 ? K.gold : K.amber,
          w: K.mist,
          c: K.blue,
          b: K.steel,
          s: K.slate,
        });
      });
    }
    fxCtx.putImageData(new ImageData(p.d, W, H), 0, 0);
  }

  // --- loop + lifecycle
  let raf = 0;
  let last = 0;
  let frame = 0;
  let mounted = false;
  let ro = null;

  function destroy() {
    cancelAnimationFrame(raf);
    ro?.disconnect();
    document.removeEventListener('keydown', onKey);
  }

  function loop(now) {
    if (!root.isConnected) {
      if (mounted) {
        destroy();
        return;
      }
    } else if (!mounted) {
      mounted = true;
      onMount();
    }
    stepTween(now);
    if (!reduceMotion && now - last >= TICK_MS && !document.hidden) {
      last = now;
      frame++;
      drawFx(frame);
    }
    raf = requestAnimationFrame(loop);
  }

  function onMount() {
    ro = new ResizeObserver(() => layout());
    ro.observe(root);
    layout();
    if (view.w < 720) {
      cam.k = homeZoom();
      applyCamera();
    }
    drawFx(0);
    if (opts.focus && opts.focus !== 'none') openPanel(opts.focus, null, true);
  }

  applyLayers();
  drawHover();
  raf = requestAnimationFrame(loop);
  // rAF pauses in hidden documents; a timer makes sure the first layout still happens.
  const mountPoll = () => {
    if (mounted) return;
    if (root.isConnected) {
      mounted = true;
      onMount();
    } else setTimeout(mountPoll, 30);
  };
  setTimeout(mountPoll, 0);

  return root;
}

/** Art-pixel label positions for landmark tags. */
const TAG_POS = {
  canopy: [192, 84],
  keystone: [214, 63],
  capture: [242, 144],
  disposition: [304, 104],
  pantry: [131, 55],
};

/** Art-pixel hotspot boxes for landmarks: [x, y, w, h]. */
const LANDMARK_BOXES = {
  canopy: [170, 88, 46, 47],
  keystone: [209, 42, 11, 16],
  capture: [236, 110, 11, 27],
  disposition: [292, 86, 26, 14],
  pantry: [118, 31, 27, 19],
};
