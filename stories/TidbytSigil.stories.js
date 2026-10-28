import './tidbyt-display.css';
import { createTidbytDisplay, polyline, traceOrder, ZOOM_MAX } from './tidbyt-display.js';
import sigil from '../tidbyt/sigil/sigil-32.png';
import sigilSource from '../tidbyt/sigil/sigil-source.png';
import vision from '../tidbyt/vision/vision-32.png';
import visionSource from '../tidbyt/vision/vision-source.png';
import visionEye from '../tidbyt/vision/vision.json';

/**
 * The two panels inside the inner ring, either side of the bright center column
 * (image columns 10–21), in 32x32 image coordinates.
 */
const flankingPanels = (x, y) => {
  const inInnerRing = Math.hypot(x - 15.5, y - 15.5) <= 11;
  return inInnerRing && (x <= 9 || x >= 22);
};

/**
 * The hand in the center column: an oval from the fingertips (y ≈ 11.5) to the
 * wrist (y ≈ 23.5), clear of the glyphs below, and clipped to the column's bright
 * interior (x ≈ 12–20.5) so it never spills into the dark gaps beside it. It
 * recedes toward the middle of the palm.
 */
const HAND_CENTER = [16.3, 17.5];
const hand = (x, y) => {
  const inOval = ((x - HAND_CENTER[0]) / 5.2) ** 2 + ((y - HAND_CENTER[1]) / 6.3) ** 2 <= 1;
  return inOval && x >= 11.9 && x <= 20.6;
};

/**
 * The center column's bright interior, below the eye: where energy rises.
 * Same sides as the hand's clip (x ≈ 12–20.5), from y ≈ 9 to the column's foot.
 */
const centerColumn = (x, y) => x >= 11.9 && x <= 20.6 && y >= 9 && y <= 27.5;

const radius = (x, y) => Math.hypot(x - 15.5, y - 15.5);
const TAU = Math.PI * 2;

/** A point at `r` and a clockwise turn `a` (0–1, from straight up) around (cx, cy). */
const polar = (cx, cy, r, a) => [cx + r * Math.sin(a * TAU), cy - r * Math.cos(a * TAU)];

/**
 * The stroke through the left panel's glyph, traced from Chase's drawing: up from the
 * base beside the column, around a figure-eight with a hook at the top, then down the
 * outer side. The right panel's stroke is its mirror across the column (x = 16).
 */
const PANEL_STROKE = [
  [10.2, 24.3], [10.2, 19.9], [9.9, 16.5], [9.3, 15.6], [7.5, 15.2], // up to the crossing
  [5.0, 13.4], [5.2, 12.0], [6.3, 10.5], [5.2, 12.0], // up-left, out to the hook and back
  [6.4, 12.8], [8.1, 12.7], [10.5, 13.4], [9.3, 14.7], [7.5, 15.3], // around the top loop
  [5.3, 16.5], [4.6, 17.8], [4.6, 20.3], // down the outer side
];
const panelStroke = (mirror) =>
  polyline(mirror ? PANEL_STROKE.map(([x, y]) => [32 - x, y]) : PANEL_STROKE, 1.5);

/** One of three strands braiding up the column from its base through the eye. */
const strand = (phase) => ({
  // Swings wide enough, with its width, to reach the column's edges (x ≈ 10.5–21.5).
  at: (s) => [16 + 3.7 * Math.sin(TAU * (1.5 * s + phase)), 27.5 - 23 * s],
  width: 1.9,
});

/**
 * The path purple travels, in image coordinates. Each stage sends heads along real
 * curves that recolor what they pass over. It opens on two fronts at once: the glyph
 * strokes in the two panels beside the column (the rest of each panel follows as the
 * stroke finishes), and, in parallel, a slow crawl braiding up the column from its
 * base through the eye. Last, heads run around the two outer circles from the top
 * (the outer clockwise, the inner the other way). Stages overlap so one flows into
 * the next.
 */
const PURPLE_PATH = [
  {
    // The panels out to the column's edges, so the gaps beside it go with them.
    area: (x, y) => radius(x, y) <= 11.6 && (x < 10.5 || x > 21.5),
    order: traceOrder([panelStroke(false), panelStroke(true)]),
    from: 0,
    to: 0.5,
  },
  {
    area: (x, y) => x >= 10.5 && x <= 21.5 && y >= 4.5 && radius(x, y) <= 11.6,
    // Anything the strands miss (the column's very edges) rises just behind them.
    order: (() => {
      const strands = traceOrder([strand(0), strand(1 / 3), strand(2 / 3)]);
      return (x, y) => Math.min(strands(x, y), (27.5 - y) / 23 + 0.06);
    })(),
    // Starts with the panel strokes and takes longer, so it reads as a crawl.
    from: 0,
    to: 0.7,
  },
  {
    area: (x, y) => radius(x, y) > 11.6,
    order: traceOrder([
      { at: (s) => polar(15.5, 15.5, 14.8, s), width: 1.8 },
      { at: (s) => polar(15.5, 15.5, 12.6, -s), width: 1.2 },
    ]),
    from: 0.45,
    to: 1,
  },
];

/** Vision's purple path: opening out from the pupil across the whole eye. */
const VISION_PURPLE_PATH = [
  {
    area: () => true,
    order: (x, y) => clamp01(Math.hypot(x - 16, (y - 15) * 1.6) / 15),
    from: 0,
    to: 1,
  },
];

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

/**
 * Each mode's artwork and the effects that belong to it. Seal is the Ultrahand seal
 * with its column, hand and panels. Vision, built by scripts/build_vision_art.py, is
 * the eye from the top of the seal's column on its own, blinking now and then.
 */
const artFor = (mode, { twinkle, hand: moveHand, energy }) => {
  if (mode === 'vision') {
    // The eye blinks now and then; where it sits comes from the art's build.
    return { src: vision, hiRes: visionSource, blink: visionEye, purplePath: VISION_PURPLE_PATH };
  }
  return {
    src: sigil,
    hiRes: sigilSource,
    twinkle: twinkle ? flankingPanels : undefined,
    recede: moveHand ? { area: hand, center: HAND_CENTER } : undefined,
    flow: energy ? centerColumn : undefined,
    purplePath: PURPLE_PATH,
  };
};

/** The display on screen, its key (story and the seal's effects), its mode, and the seal's effects. */
let mounted = null;

export default {
  title: 'Projects/Tidbyt/Ultrahand Sigil',
  parameters: {
    layout: 'fullscreen',
    // An LED-matrix art piece drawn on a canvas: nothing for a11y checks to act on.
    a11y: { test: 'off' },
  },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['seal', 'vision'],
      description:
        "Seal is the Ultrahand seal; Vision is the blinking eye from the seal's column on its own. Switching morphs between them in organic blotches that open from the center.",
    },
    twinkle: {
      control: 'boolean',
      description: 'Twinkle the panels either side of the center column.',
      if: { arg: 'mode', eq: 'seal' },
    },
    hand: {
      control: 'boolean',
      description: 'Move the hand back as it dissolves, then move it in as it reappears, on a loop.',
      if: { arg: 'mode', eq: 'seal' },
    },
    energy: {
      control: 'boolean',
      description: 'Smoke-like energy rising from bottom to top through the center column.',
      if: { arg: 'mode', eq: 'seal' },
    },
    color: {
      control: 'inline-radio',
      options: ['cycle', 'green', 'red', 'purple'],
      description:
        'Red crawls in from the outside toward the center in cracks; green rings out from the center in cymatic pulses, each leaving it greener; purple travels the glyph strokes in the side panels while crawling up the column, then traces the two outer circles. Each change takes 5s; cycle goes green → red → purple, holding each 8s.',
    },
  },
  args: {
    mode: 'seal',
    twinkle: true,
    hand: false,
    energy: false,
    color: 'cycle',
  },
  render: (args, { id }) => {
    const { color, mode } = args;
    // Storybook leaves the seal-only args out while their controls are hidden (in
    // Vision), so remember the seal's last settings to keep them across a switch.
    const sealFx =
      mode === 'seal'
        ? { twinkle: args.twinkle, hand: args.hand, energy: args.energy }
        : (mounted?.sealFx ?? { twinkle: true, hand: false, energy: false });
    // When only the color or mode changed, hand back the live display so it can
    // animate the change; Storybook keeps an element it already shows instead of
    // remounting it.
    const key = JSON.stringify([id, sealFx]);
    if (mounted?.key === key && mounted.stage.isConnected) {
      if (mode !== mounted.mode) mounted.display.setArt(artFor(mode, sealFx));
      mounted.display.setColor(color);
      mounted.mode = mode;
      return mounted.stage;
    }

    const { src, ...art } = artFor(mode, sealFx);
    const stage = document.createElement('div');
    stage.className = 'tidbyt-stage';
    // Always zoomed so the art's edge meets both ends of the board.
    const display = createTidbytDisplay(src, { ...art, zoom: ZOOM_MAX, color });
    stage.append(display);
    mounted = { key, stage, display, mode, sealFx };
    return stage;
  },
};

// One story per mode, to see each on its own. The mode control still switches (and
// morphs) between them.

export const Seal = {
  args: { mode: 'seal', hand: true, energy: true },
};

export const Vision = {
  args: { mode: 'vision' },
};
