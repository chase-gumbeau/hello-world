import bodyHtml from './assets/scrolls/generated-body.html?raw';
import './assets/scrolls/generated.css';
import { createScrollExperience } from './scrolls-shell.js';

const FRAME_COUNT = 20;

/**
 * Build the 2025 Summer scrolls experience and wire drag/wheel/keyboard controls.
 *
 * @param {{ embedded?: boolean }} [options] When `embedded` is true, this
 *   component's own border/scrim/edge chrome is hidden so a parent shell
 *   (see `scrolls-app.js`) can act as the single stable "window".
 * @returns {HTMLElement}
 */
export function createScrolls({ embedded = false } = {}) {
  return createScrollExperience({
    id: 'summer',
    bodyHtml,
    frameCount: FRAME_COUNT,
    embedded,
  });
}

export { mountScrolls } from './scrolls-mount.js';
