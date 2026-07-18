import bodyHtml from './assets/scrolls-mexico-city/generated-body.html?raw';
import './assets/scrolls-mexico-city/generated.css';
import { createScrollExperience } from './scrolls-shell.js';

const FRAME_COUNT = 20;

/**
 * Build the 2025 Mexico City scrolls experience.
 *
 * @param {{ embedded?: boolean }} [options] When `embedded` is true, this
 *   component's own border/scrim/edge chrome is hidden so a parent shell
 *   (see `scrolls-app.js`) can act as the single stable "window".
 * @returns {HTMLElement}
 */
export function createMexicoCityScrolls({ embedded = false } = {}) {
  return createScrollExperience({
    id: 'mexico-city',
    bodyHtml,
    frameCount: FRAME_COUNT,
    embedded,
  });
}

/** Alias used by Storybook stories. */
export const createScrollsMexicoCity = createMexicoCityScrolls;
