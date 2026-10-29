/**
 * Records the Ultrahand Sigil story as raw 64x32 frames for the Tidbyt, reading
 * each LED's color straight off the story's canvas. The page runs on a fake clock,
 * so every frame lands exactly FRAME_MS apart however slow the capture is.
 *
 * Usage:
 *   node scripts/capture-tidbyt-sigil.mjs [story] [seconds] [out file] [storybook url]
 * Defaults to the Seal story, one whole color cycle (39s), tidbyt/sigil/frames.rgb
 * and the dev server. Then encode with scripts/encode_tidbyt_webp.py.
 */
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const story = process.argv[2] ?? 'seal';
// 'cycle' holds each color 8s and changes over 5s: green → red → purple → green.
const seconds = Number(process.argv[3] ?? 39);
const out = process.argv[4] ?? 'tidbyt/sigil/frames.rgb';
const base = new URL(process.argv[5] ?? 'http://localhost:6006/');

// The Tidbyt shows at most about 20 frames a second.
const FRAME_MS = 50;
const COLS = 64;
const ROWS = 32;
const PITCH = 24; // canvas pixels per LED, as in stories/tidbyt-display.js
// An unlit LED is drawn #0c0c0c so the board reads on screen; on the device it's off.
const UNLIT = 0x0c;

// CHROMIUM lets the capture use a browser other than the one Playwright installed.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await browser.newPage();
await page.clock.install({ time: 0 });
// Hold time still so the story's clock only moves when a frame asks it to.
await page.clock.pauseAt(1);
const url = new URL(`iframe.html?id=projects-tidbyt-ultrahand-sigil--${story}&viewMode=story`, base);
await page.goto(url.href, { waitUntil: 'networkidle' });
await page.waitForSelector('.tidbyt-display canvas');
// Let the art load and draw its first frame before the clock starts counting.
await page.clock.runFor(FRAME_MS);

const count = Math.round((seconds * 1000) / FRAME_MS);
const frames = Buffer.alloc(count * COLS * ROWS * 3);
for (let n = 0; n < count; n++) {
  const leds = await page.evaluate(
    ({ COLS, ROWS, PITCH }) => {
      const canvas = document.querySelector('.tidbyt-display canvas');
      const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      const rgb = [];
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const i = ((y * PITCH + PITCH / 2) * canvas.width + x * PITCH + PITCH / 2) * 4;
          rgb.push(data[i], data[i + 1], data[i + 2]);
        }
      }
      return rgb;
    },
    { COLS, ROWS, PITCH },
  );
  for (let i = 0; i < leds.length; i += 3) {
    const unlit = leds[i] === UNLIT && leds[i + 1] === UNLIT && leds[i + 2] === UNLIT;
    for (let c = 0; c < 3; c++) frames[n * leds.length + i + c] = unlit ? 0 : leds[i + c];
  }
  await page.clock.runFor(FRAME_MS);
}

await browser.close();
await writeFile(out, frames);
console.log(`${count} frames (${seconds}s at ${1000 / FRAME_MS} fps) written to ${out}`);
