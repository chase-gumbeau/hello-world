// The PlayStation app, frame for frame as tidbyt/psn/playstation.star renders a
// profile in Pixlet without cover art: same fonts, glyphs, layout, colors and scroll.
// Pure, so a script can check it against a Pixlet render (scripts/check_tidbyt_psn.mjs).
import { blit, drawText, image, rgbOf, textWidth } from './tidbyt-games.js';

const COLS = 64;
const ROWS = 32;

/** How long each frame shows, in ms, as in the app. */
export const FRAME_MS = 50;
const SCREEN_FRAMES = 120;
const SCROLL_DELAY = 20;

const ART_BG = '#013';
const GLYPH = '#36c';
const HEAD = '#4af';
const TITLE = '#fff';
const SUB = '#889';
const AGO = '#a60';

export const GRADES = {
  bronze: '#c73',
  silver: '#aab',
  gold: '#fc3',
  platinum: '#9cf',
};

const TEXT_X = 33;
const TEXT_WIDTH = 31;
const LINES_Y = [1, 8, 17, 25];

// 16x16 glyphs centered in the art square, as [x, y, w, h, color] rectangles drawn in
// order; a null color is the glyph's own (as CUP and GAMEPAD in the app).
const CUP = [
  [2, 1, 12, 1], [3, 2, 10, 6], [0, 2, 3, 1], [0, 3, 1, 3], [0, 5, 3, 1], [13, 2, 3, 1],
  [15, 3, 1, 3], [13, 5, 3, 1], [4, 8, 8, 1], [5, 9, 6, 1], [7, 10, 2, 2], [5, 12, 6, 1],
  [4, 13, 8, 2],
];
const GAMEPAD = [
  [2, 5, 12, 6], [1, 7, 2, 5], [13, 7, 2, 5], [4, 7, 1, 3, ART_BG], [3, 8, 3, 1, ART_BG],
  [11, 7, 1, 1, ART_BG], [10, 8, 1, 1, ART_BG], [12, 8, 1, 1, ART_BG], [11, 9, 1, 1, ART_BG],
];

function fill(img, x, y, w, h, color) {
  const px = [...rgbOf(color), 255];
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) img.data.set(px, (j * img.w + i) * 4);
}

function glyph(rects, color) {
  const img = image(32, 32);
  fill(img, 0, 0, 32, 32, ART_BG);
  for (const [x, y, w, h, c] of rects) fill(img, 8 + x, 8 + y, w, h, c ?? color);
  return img;
}

function ago(when, now) {
  const minutes = Math.floor((Date.parse(now) - Date.parse(when)) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 0)}M AGO`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}H AGO`;
  return `${Math.floor(minutes / (24 * 60))}D AGO`;
}

function playTime(minutes) {
  const hours = Math.floor(minutes / 60);
  if (hours >= 10) return `${hours}H`;
  if (hours) return `${hours}H ${minutes % 60}M`;
  return `${minutes}M`;
}

/**
 * A line of text right of the art: still, or, when wider than TEXT_WIDTH, scrolling
 * as Pixlet's Marquee does (wait, scroll out left, come back in from the right).
 */
function line(font, text, color, scrolls) {
  const w = textWidth(font, text);
  if (!scrolls || w <= TEXT_WIDTH) return { frames: 1, offset: () => 0, font, text, color };
  const loop = w + SCROLL_DELAY;
  const end = w + TEXT_WIDTH + SCROLL_DELAY;
  const offset = (f) => {
    if (f <= SCROLL_DELAY) return 0;
    if (f <= loop) return SCROLL_DELAY - f;
    if (f <= end) return end - f;
    return 0;
  };
  return { frames: end, offset, font, text, color };
}

function screen(art, lines) {
  return {
    frames: Math.max(SCREEN_FRAMES, ...lines.map((l) => l.frames)),
    paint: (out, f) => {
      blit(out, art, 0, 0);
      lines.forEach((l, k) => {
        const strip = image(TEXT_WIDTH, l.font.ascent + l.font.descent);
        drawText(strip, l.font, l.text, l.color, l.offset(f), 0);
        blit(out, strip, TEXT_X, LINES_Y[k]);
      });
    },
  };
}

/**
 * The app's screens for `profile` (as tidbyt/psn/sample.json).
 * @param {{tb8: object, tomThumb: object}} fonts  parseBdf() of tb-8 and tom-thumb.
 * @returns {{frames: number, frame: (f: number) => Uint8ClampedArray}}  How many frames
 *   one loop takes, and frame f's 64x32 RGBA pixels.
 */
export function createPsn({ now, played, trophy }, { tb8, tomThumb }) {
  const screens = [];
  if (played) {
    screens.push(screen(glyph(GAMEPAD, GLYPH), [
      line(tomThumb, 'PLAYED', HEAD),
      line(tb8, played.title, TITLE, true),
      line(tomThumb, playTime(played.playMinutes), SUB),
      line(tomThumb, ago(played.playedAt, now), AGO),
    ]));
  }
  if (trophy) {
    const color = GRADES[trophy.grade] ?? GRADES.bronze;
    screens.push(screen(glyph(CUP, color), [
      line(tomThumb, trophy.grade.toUpperCase(), color),
      line(tb8, trophy.name, TITLE, true),
      line(tomThumb, trophy.game, SUB, true),
      line(tomThumb, ago(trophy.earnedAt, now), AGO),
    ]));
  }
  const frames = screens.reduce((sum, s) => sum + s.frames, 0);
  return {
    frames,
    frame: (f) => {
      const out = image(COLS, ROWS);
      let local = f % frames;
      for (const s of screens) {
        if (local < s.frames) {
          s.paint(out, local);
          break;
        }
        local -= s.frames;
      }
      return out.data;
    },
  };
}
