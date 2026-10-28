/**
 * Works out when each Studies and Projects gallery item last changed, so the
 * galleries can list the most recently updated first. Writes stories/story-updates.json
 * ({ itemId: ISO date }).
 *
 * An item's date is its files' latest commit (stories/story-gallery-items.mjs lists
 * them as git pathspecs). Files with uncommitted changes count from when they were
 * last saved, so work in progress sorts to the top.
 *
 * Runs before `npm run storybook`, `npm run build-storybook` and `npm test`. Needs the
 * full git history (CI checks out with fetch-depth: 0).
 */
import { execFileSync } from 'node:child_process';
import { statSync, writeFileSync } from 'node:fs';
import { ALL_ITEMS } from '../stories/story-gallery-items.mjs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

const updates = {};
for (const { id, files } of ALL_ITEMS) {
  const specs = files.map((pattern) => `:(glob)${pattern}`);
  let latest = git('log', '-1', '--format=%cI', '--', ...specs);

  // Uncommitted edits (and new files) count from their last save.
  const pending = git('status', '--porcelain', '--untracked-files=all', '--', ...specs)
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).split(' -> ').pop());
  for (const file of pending) {
    try {
      const saved = statSync(file).mtime.toISOString();
      if (!latest || saved > new Date(latest).toISOString()) latest = saved;
    } catch {
      // Deleted files have no save time; their commit date stands.
    }
  }

  updates[id] = latest ? new Date(latest).toISOString() : null;
}

writeFileSync('stories/story-updates.json', `${JSON.stringify(updates, null, 2)}\n`);
console.log(`story-updates.json: ${Object.keys(updates).length} items`);
