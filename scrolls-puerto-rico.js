import bodyHtml from './assets/scrolls-puerto-rico/generated-body.html?raw';
import './assets/scrolls-puerto-rico/generated.css';
import { createScrollExperience } from './scrolls-shell.js';

const FRAME_COUNT = 20;

/**
 * Build the 2025 Puerto Rico scrolls experience.
 *
 * @param {{ embedded?: boolean }} [options] When `embedded` is true, this
 *   component's own border/scrim/edge chrome is hidden so a parent shell
 *   can act as the single stable "window".
 * @returns {HTMLElement}
 */
export function createPuertoRicoScrolls({ embedded = false } = {}) {
  return createScrollExperience({
    id: 'puerto-rico',
    bodyHtml,
    frameCount: FRAME_COUNT,
    embedded,
  });
}

/** Alias used by Storybook stories. */
export const createScrollsPuertoRico = createPuertoRicoScrolls;
