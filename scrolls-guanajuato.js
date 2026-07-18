import bodyHtml from './assets/scrolls-guanajuato/generated-body.html?raw';
import './assets/scrolls-guanajuato/generated.css';
import { createScrollExperience } from './scrolls-shell.js';

const FRAME_COUNT = 20;

/**
 * Build the 2023 Guanajuato scrolls experience.
 *
 * @param {{ embedded?: boolean }} [options] When `embedded` is true, this
 *   component's own border/scrim/edge chrome is hidden so a parent shell
 *   can act as the single stable "window".
 * @returns {HTMLElement}
 */
export function createGuanajuatoScrolls({ embedded = false } = {}) {
  return createScrollExperience({
    id: 'guanajuato',
    bodyHtml,
    frameCount: FRAME_COUNT,
    embedded,
  });
}

/** Alias used by Storybook stories. */
export const createScrollsGuanajuato = createGuanajuatoScrolls;
