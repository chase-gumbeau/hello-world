// The Upcoming Games ticker, frame for frame as tidbyt/games/upcoming_games.star
// renders it in Pixlet: same fonts, layout, colors and scroll. Pure, so a script can
// check it against a Pixlet render (scripts/check_tidbyt_games.mjs).
const COLS = 64;
const ROWS = 32;

const HEADER = '#3cf';
const DIVIDER = '#234';
const DATE = '#fb0';
const DAYS = '#a60';
const TITLE = '#fff';
const PLATFORM = '#778';

const GAME_GAP = 8; // between games on the same date
const DATE_GAP = 14; // between dates
const BODY_TOP = 9; // header, a gap, the divider and another gap above the ticker
const BODY_HEIGHT = 22;
const WINDOW_DAYS = 30;
const GAMES_SHOWN = 12; // the app's default "Games to show"

/** How long each LED step of the scroll shows, in ms, as in the app. */
export const FRAME_MS = 40;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Short platform names, in the order they're listed (as PLATFORMS in the app).
const PLATFORMS = [
  ['PlayStation 5', 'PS5'],
  ['PS5', 'PS5'],
  ['PlayStation 4', 'PS4'],
  ['Xbox Series S/X', 'XBOX'],
  ['Xbox', 'XBOX'],
  ['Nintendo Switch 2', 'SW2'],
  ['Switch 2', 'SW2'],
  ['Nintendo Switch', 'SW'],
  ['Switch', 'SW'],
  ['PC', 'PC'],
  ['macOS', 'MAC'],
  ['iOS', 'IOS'],
  ['Android', 'AND'],
];

// The platforms the ticker follows: only games out on at least one show, and only these
// are listed under each title (as WANTED in the app).
const WANTED = ['PS5', 'SW2'];

const shortPlatforms = (names) => {
  const out = [];
  for (const [long, short] of PLATFORMS) {
    if (names.includes(long) && WANTED.includes(short) && !out.includes(short)) out.push(short);
  }
  return out.join(' ');
};

/** '#3cf' or '#33ccff' as [r, g, b]. */
const rgbOf = (hex) => {
  const h = hex.slice(1);
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((k) => parseInt(full.slice(k, k + 2), 16));
};

/**
 * A BDF bitmap font: its ascent, descent, and each glyph's advance, box and rows.
 * @param {string} text  The .bdf file.
 */
export function parseBdf(text) {
  const lines = text.split('\n');
  const font = { ascent: 0, descent: 0, glyphs: new Map() };
  let glyph = null;
  let rows = null;
  for (const raw of lines) {
    const line = raw.trim();
    const [key, ...rest] = line.split(/\s+/);
    if (rows) {
      if (key === 'ENDCHAR') {
        glyph.rows = rows;
        font.glyphs.set(glyph.code, glyph);
        glyph = rows = null;
      } else {
        rows.push(parseInt(key, 16));
      }
      continue;
    }
    if (key === 'FONT_ASCENT') font.ascent = +rest[0];
    else if (key === 'FONT_DESCENT') font.descent = +rest[0];
    else if (key === 'STARTCHAR') glyph = {};
    else if (glyph && key === 'ENCODING') glyph.code = +rest[0];
    else if (glyph && key === 'DWIDTH') glyph.advance = +rest[0];
    else if (glyph && key === 'BBX') [glyph.w, glyph.h, glyph.x, glyph.y] = rest.map(Number);
    else if (glyph && key === 'BITMAP') rows = [];
  }
  return font;
}

/** An RGBA image `w` x `h`, all unlit. */
const image = (w, h) => ({ w, h, data: new Uint8ClampedArray(w * h * 4) });

const textWidth = (font, text) =>
  [...text].reduce((sum, ch) => sum + (font.glyphs.get(ch.codePointAt(0))?.advance ?? 0), 0);

/** Draws `text` with its top-left at (x, y), as Pixlet's render.Text does. */
function drawText(img, font, text, color, x, y) {
  const [r, g, b] = rgbOf(color);
  const baseline = y + font.ascent;
  let dot = x;
  for (const ch of text) {
    const glyph = font.glyphs.get(ch.codePointAt(0));
    if (!glyph) continue;
    const bytes = Math.ceil(glyph.w / 8);
    const top = baseline - glyph.y - glyph.h;
    glyph.rows.forEach((bits, row) => {
      for (let col = 0; col < glyph.w; col++) {
        if (!((bits >> (bytes * 8 - 1 - col)) & 1)) continue;
        const px = dot + glyph.x + col;
        const py = top + row;
        if (px < 0 || py < 0 || px >= img.w || py >= img.h) continue;
        img.data.set([r, g, b, 255], (py * img.w + px) * 4);
      }
    });
    dot += glyph.advance;
  }
  return textWidth(font, text);
}

/** Copies `src` onto `dst` with its top-left at (x, y), clipped to `dst`. */
function blit(dst, src, x, y) {
  for (let sy = 0; sy < src.h; sy++) {
    const dy = y + sy;
    if (dy < 0 || dy >= dst.h) continue;
    for (let sx = 0; sx < src.w; sx++) {
      const dx = x + sx;
      const i = (sy * src.w + sx) * 4;
      if (dx < 0 || dx >= dst.w || !src.data[i + 3]) continue;
      dst.data.set(src.data.subarray(i, i + 4), (dy * dst.w + dx) * 4);
    }
  }
}

const dayNumber = (date) => Date.UTC(...date.split('-').map((v, k) => (k === 1 ? v - 1 : +v))) / 86400000;
const isoOf = (day) => new Date(day * 86400000).toISOString().slice(0, 10);

/**
 * The games out on a WANTED platform from `today` through the next WINDOW_DAYS, at
 * most GAMES_SHOWN of them, each with the title the display shows (its `short` one if
 * it has it).
 * @param {{date: string, title: string, short?: string, platforms: string[]}[]} games
 * @param {string} today  YYYY-MM-DD.
 */
export function upcoming(games, today) {
  const start = today;
  const end = isoOf(dayNumber(today) + WINDOW_DAYS);
  return games
    .filter((g) => g.date >= start && g.date <= end && shortPlatforms(g.platforms))
    .slice(0, GAMES_SHOWN)
    .map((g) => ({ date: g.date, title: g.short ?? g.title, platforms: g.platforms }));
}

/**
 * The ticker for `games` (see upcoming()) as seen on `today`.
 * @param {{tb8: object, tomThumb: object}} fonts  parseBdf() of tb-8 and tom-thumb.
 * @returns {{frames: number, frame: (f: number) => Uint8ClampedArray}}  How many frames
 *   one loop of the scroll takes, and frame f's 64x32 RGBA pixels.
 */
export function createTicker(games, today, { tb8, tomThumb }) {
  // Grouped by date, soonest first, games in a date by title.
  const byDate = new Map();
  for (const game of [...games].sort((a, b) => (a.date + a.title < b.date + b.title ? -1 : 1))) {
    if (!byDate.has(game.date)) byDate.set(game.date, []);
    byDate.get(game.date).push(game);
  }

  // Each date's group drawn once: the date and how far off it is, over each game's
  // title and platforms.
  const groups = [];
  let x = 0;
  for (const [date, dated] of [...byDate].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const [, month, day] = date.split('-').map(Number);
    const days = dayNumber(date) - dayNumber(today);
    const dateText = `${MONTHS[month - 1]} ${day}`;
    const daysText = days <= 0 ? 'TODAY' : `${days}D`;
    const columns = dated.map((g) => {
      const platforms = shortPlatforms(g.platforms);
      return { ...g, platforms, w: Math.max(textWidth(tb8, g.title), textWidth(tomThumb, platforms)) };
    });
    const gamesWidth = columns.reduce((sum, c) => sum + c.w, 0) + GAME_GAP * (columns.length - 1);
    const dateWidth = textWidth(tomThumb, dateText) + 4 + textWidth(tomThumb, daysText);
    const img = image(Math.max(dateWidth, gamesWidth), BODY_HEIGHT);
    drawText(img, tomThumb, daysText, DAYS, drawText(img, tomThumb, dateText, DATE, 0, 0) + 4, 0);
    let cx = 0;
    for (const c of columns) {
      drawText(img, tb8, c.title, TITLE, cx, 7);
      drawText(img, tomThumb, c.platforms, PLATFORM, cx, 16);
      cx += c.w + GAME_GAP;
    }
    groups.push({ img, x });
    x += img.w + DATE_GAP;
  }

  const header = image(COLS, ROWS);
  drawText(header, tomThumb, 'NEXT 30 DAYS', HEADER, 0, 0);
  const count = String(games.length);
  drawText(header, tomThumb, count, DATE, COLS - textWidth(tomThumb, count), 0);
  const [dr, dg, db] = rgbOf(DIVIDER);
  for (let col = 0; col < COLS; col++) header.data.set([dr, dg, db, 255], (7 * COLS + col) * 4);

  if (!groups.length) {
    // Centered in the ticker's place, as the app's Box does.
    const note = 'NOTHING DATED';
    const nx = Math.floor((COLS - textWidth(tomThumb, note)) / 2);
    drawText(header, tomThumb, note, PLATFORM, nx, BODY_TOP + Math.floor((BODY_HEIGHT - tomThumb.ascent - tomThumb.descent) / 2));
    return { frames: 1, frame: () => header.data.slice() };
  }

  // One loop: the strip scrolls left a LED a frame until it has gone, then comes back
  // in from the right.
  const last = groups[groups.length - 1];
  const frames = last.x + last.img.w + COLS;
  return {
    frames,
    frame: (f) => {
      const out = { w: COLS, h: ROWS, data: header.data.slice() };
      for (const { img, x: gx } of groups) {
        let at = gx - (f % frames);
        if (at + img.w <= 0) at += frames;
        if (at < COLS && at + img.w > 0) blit(out, img, at, BODY_TOP);
      }
      return out.data;
    },
  };
}
