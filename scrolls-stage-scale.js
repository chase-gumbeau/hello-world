/** Shared Scrolls stage / menu scale — keep app shell and standalone home in sync. */

export const DESIGN_W = 3842;
export const DESIGN_H = 2160;
export const FRAME_OUTER_W = 1078;
export const FRAME_OUTER_H = 1918.889;

/** Viewport padding when fitting the phone frame on compact screens. */
const COMPACT_PAD = 24;
/** Prefer frame-fit below this width, or when the viewport is portrait-ish. */
const COMPACT_MAX_WIDTH = 720;

/**
 * @param {number} width
 * @param {number} height
 * @returns {{ scale: number, isCompact: boolean }}
 */
export function computeStageScale(width, height) {
  const artboardScale = Math.min(width / DESIGN_W, height / DESIGN_H);
  const frameScale = Math.min(
    (width - COMPACT_PAD * 2) / FRAME_OUTER_W,
    (height - COMPACT_PAD * 2) / FRAME_OUTER_H
  );
  const isCompact = width < COMPACT_MAX_WIDTH || width / Math.max(height, 1) < 1.05;
  // Compact: fill the viewport with the phone frame so the menu stays readable.
  // Desktop / landscape: fit the full cinematic artboard.
  const scale = isCompact
    ? Math.min(Math.max(frameScale, 0.01), 1)
    : Math.max(artboardScale, 0.01);
  return { scale, isCompact };
}

/**
 * Screen-space menu tokens, set on the app so the stage transform doesn't shrink
 * them. Type holds at a fixed 12px.
 */
export function computeMenuTokens() {
  return {
    citySize: 12,
    stackGap: 8,
  };
}

/**
 * Write `--stage-scale`, menu size vars, and `is-compact` onto `el`.
 * @param {HTMLElement} el
 * @param {{ setAppScale?: boolean, setMenuTokens?: boolean }} [options]
 */
export function applyStageVars(
  el,
  { setAppScale = true, setMenuTokens = true } = {}
) {
  const width = el.clientWidth || window.innerWidth;
  const height = el.clientHeight || window.innerHeight;
  const { scale, isCompact } = computeStageScale(width, height);

  el.style.setProperty('--stage-scale', String(scale));
  if (setAppScale) {
    el.style.setProperty('--app-stage-scale', String(scale));
  }

  if (setMenuTokens) {
    const menu = computeMenuTokens();
    el.style.setProperty('--menu-city-size', `${menu.citySize.toFixed(2)}px`);
    el.style.setProperty('--menu-stack-gap', `${menu.stackGap.toFixed(2)}px`);
  }

  el.classList.toggle('is-compact', isCompact);

  return { scale, isCompact, width, height };
}
