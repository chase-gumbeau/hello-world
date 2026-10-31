/**
 * Checks the Storybook PlayStation app (stories/tidbyt-psn.js) against Pixlet: renders
 * tidbyt/psn/playstation.star with the sample profile and compares every frame, LED
 * for LED, with the story's.
 *
 *   node scripts/check_tidbyt_psn.mjs [profile.json]   (default: tidbyt/psn/sample.json)
 *
 * Needs pixlet on PATH (or PIXLET) and python3 with Pillow to read the WebP.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseBdf } from '../stories/tidbyt-games.js';
import { createPsn } from '../stories/tidbyt-psn.js';

const sample = readFileSync(process.argv[2] ?? 'tidbyt/psn/sample.json', 'utf8');
const dir = mkdtempSync(path.join(tmpdir(), 'tidbyt-psn-'));
const webp = path.join(dir, 'psn.webp');
const raw = path.join(dir, 'psn.rgba');

execFileSync(process.env.PIXLET ?? 'pixlet', [
  'render', 'tidbyt/psn/playstation.star', `sample=${sample}`, '-o', webp, '--max_duration', '600000',
]);
execFileSync('python3', ['-c', `
import sys
from PIL import Image
im = Image.open(sys.argv[1])
with open(sys.argv[2], 'wb') as out:
    for i in range(im.n_frames):
        im.seek(i)
        out.write(im.convert('RGBA').tobytes())
`, webp, raw]);

const pixlet = readFileSync(raw);
const font = (name) => parseBdf(readFileSync(`tidbyt/games/fonts/${name}.bdf`, 'utf8'));
const psn = createPsn(JSON.parse(sample), { tb8: font('tb-8'), tomThumb: font('tom-thumb') });

const size = 64 * 32 * 4;
// Unlit LEDs as Pixlet writes them: opaque black (the story leaves them clear).
const leds = (buf) => {
  const out = new Uint8Array(64 * 32 * 3);
  for (let i = 0; i < 64 * 32; i++) if (buf[i * 4 + 3]) out.set(buf.subarray(i * 4, i * 4 + 3), i * 3);
  return out;
};
// Pixlet's WebP merges repeated frames into one shown longer, so merge ours too.
const ours = [];
for (let f = 0; f < psn.frames; f++) {
  const frame = leds(psn.frame(f));
  if (!ours.length || Buffer.compare(ours[ours.length - 1], frame)) ours.push(frame);
}
const theirs = [];
for (let f = 0; f < pixlet.length / size; f++) theirs.push(leds(pixlet.subarray(f * size, (f + 1) * size)));

if (theirs.length !== ours.length) {
  console.error(`Pixlet renders ${theirs.length} distinct frames, the story ${ours.length}`);
  process.exit(1);
}
let bad = 0;
ours.forEach((frame, f) => {
  for (let i = 0; i < 64 * 32; i++) {
    const a = frame.subarray(i * 3, i * 3 + 3).join();
    const b = theirs[f].subarray(i * 3, i * 3 + 3).join();
    if (a !== b) {
      if (bad < 5) console.error(`frame ${f}, LED (${i % 64}, ${Math.floor(i / 64)}): story ${a}, Pixlet ${b}`);
      bad++;
    }
  }
});
if (bad) {
  console.error(`${bad} LEDs differ`);
  process.exit(1);
}
console.log(`${psn.frames} frames match Pixlet`);
