/**
 * Captures a screenshot of every story a Studies or Projects gallery card previews
 * (stories/story-gallery-items.mjs), for the cards to show instead of running each
 * story live.
 *
 * Usage:
 *   node scripts/capture-story-previews.mjs [storybook url] [out dir]
 * Defaults to the dev server (http://localhost:6006/) and story-previews/, which
 * Storybook serves locally. CI runs it against the built site on deploy, writing into
 * storybook-static/story-previews/ (see .github/workflows/deploy-pages.yml).
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { PREVIEW_STORIES } from '../stories/story-gallery-items.mjs';

const base = new URL(process.argv[2] ?? 'http://localhost:6006/');
const out = path.resolve(process.argv[3] ?? 'story-previews');
// Cards are 16:10; this is wide enough to stay sharp at the card's size.
const VIEWPORT = { width: 1280, height: 800 };
// Time for fonts, images and opening animations to settle before the shot.
const SETTLE_MS = 1500;

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, colorScheme: 'dark' });
let failed = 0;

for (const story of PREVIEW_STORIES) {
  const url = new URL(`iframe.html?id=${story}&viewMode=story`, base);
  try {
    await page.goto(url.href, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForSelector('#storybook-root > *', { timeout: 30_000 });
    await page.waitForTimeout(SETTLE_MS);
    await page.screenshot({ path: path.join(out, `${story}.jpg`), type: 'jpeg', quality: 80 });
    console.log(`✓ ${story}`);
  } catch (error) {
    failed++;
    console.error(`✗ ${story}: ${error.message.split('\n')[0]}`);
  }
}

await browser.close();
console.log(`${PREVIEW_STORIES.length - failed} of ${PREVIEW_STORIES.length} previews written to ${out}`);
// A missing preview isn't fatal (the card shows the live story), so only fail when
// nothing could be captured at all.
if (failed === PREVIEW_STORIES.length) process.exit(1);
