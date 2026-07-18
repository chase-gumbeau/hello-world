import bodyHtml from './assets/scrolls-costa-rica/generated-body.html?raw';
import './assets/scrolls-costa-rica/generated.css';
import { createScrollExperience } from './scrolls-shell.js';

const FRAME_COUNT = 10;

/**
 * Build the 2024 Costa Rica scrolls experience.
 *
 * @param {{ embedded?: boolean }} [options] When `embedded` is true, this
 *   component's own border/scrim/edge chrome is hidden so a parent shell
 *   can act as the single stable "window".
 * @returns {HTMLElement}
 */
export function createCostaRicaScrolls({ embedded = false } = {}) {
  return createScrollExperience({
    id: 'costa-rica',
    bodyHtml,
    frameCount: FRAME_COUNT,
    embedded,
  });
}

/** Alias used by Storybook stories. */
export const createScrollsCostaRica = createCostaRicaScrolls;
