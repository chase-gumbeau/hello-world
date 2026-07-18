import bodyHtml from './assets/scrolls-33/generated-body.html?raw';
import './assets/scrolls-33/generated.css';
import { createScrollExperience } from './scrolls-shell.js';

const FRAME_COUNT = 10;

/**
 * Build the 2024 "33" scrolls experience.
 *
 * @param {{ embedded?: boolean }} [options] When `embedded` is true, this
 *   component's own border/scrim/edge chrome is hidden so a parent shell
 *   (see `scrolls-app.js`) can act as the single stable "window".
 * @returns {HTMLElement}
 */
export function createScrolls33({ embedded = false } = {}) {
  return createScrollExperience({
    id: '33',
    bodyHtml,
    frameCount: FRAME_COUNT,
    embedded,
  });
}

/** Alias used by Storybook stories. */
export const createScrollsThirtyThree = createScrolls33;
