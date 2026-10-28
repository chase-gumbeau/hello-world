import './tidbyt-display.css';
import { createTidbytDisplay, traceOrder, ZOOM_MAX } from './tidbyt-display.js';
import sigil from '../tidbyt/sigil/sigil-32.png';
import sigilSource from '../tidbyt/sigil/sigil-source.png';

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
 * A spiral out from a panel's center, about 2¾ turns, tight enough for its trail to
 * cover the panel. `mirror` flips it for the right panel so the two turn opposite ways.
 */
const spiral = (cx, mirror) => ({
  at: (s) => {
    const [x, y] = polar(cx, 16, 0.5 + 8.5 * s, 2.75 * s);
    return [mirror ? 2 * cx - x : x, y];
  },
  width: 1.7,
});

/** One of three strands braiding up the column from its base through the eye. */
const strand = (phase) => ({
  // Swings wide enough, with its width, to reach the column's edges (x ≈ 10.5–21.5).
  at: (s) => [16 + 3.7 * Math.sin(TAU * (1.5 * s + phase)), 27.5 - 23 * s],
  width: 1.9,
});

/**
 * The path purple travels, in image coordinates. Each stage sends heads along real
 * curves that recolor what they pass over: first spiraling out through the two curled
 * panels beside the column, then running around the two outer circles from the top
 * (the outer clockwise, the inner the other way), and last braiding up the column
 * from its base through the eye. Stages overlap so one flows into the next.
 */
const PURPLE_PATH = [
  {
    // The panels out to the column's edges, so the gaps beside it go with them.
    area: (x, y) => radius(x, y) <= 11.6 && (x < 10.5 || x > 21.5),
    order: traceOrder([spiral(6, false), spiral(25, true)]),
    from: 0,
    to: 0.42,
  },
  {
    area: (x, y) => x >= 10.5 && x <= 21.5 && y >= 4.5 && radius(x, y) <= 11.6,
    // Anything the strands miss (the column's very edges) rises just behind them.
    order: (() => {
      const strands = traceOrder([strand(0), strand(1 / 3), strand(2 / 3)]);
      return (x, y) => Math.min(strands(x, y), (27.5 - y) / 23 + 0.06);
    })(),
    from: 0.62,
    to: 1,
  },
  {
    area: (x, y) => radius(x, y) > 11.6,
    order: traceOrder([
      { at: (s) => polar(15.5, 15.5, 14.8, s), width: 1.8 },
      { at: (s) => polar(15.5, 15.5, 12.6, -s), width: 1.2 },
    ]),
    from: 0.32,
    to: 0.72,
  },
];

/** The display on screen, and the settings (all but color) it was built with. */
let mounted = null;

export default {
  title: 'Projects/Tidbyt/Ultrahand Sigil',
  parameters: {
    layout: 'fullscreen',
    // An LED-matrix art piece drawn on a canvas: nothing for a11y checks to act on.
    a11y: { test: 'off' },
  },
  argTypes: {
    twinkle: {
      control: 'boolean',
      description: 'Twinkle the panels either side of the center column.',
    },
    zoom: {
      control: 'boolean',
      description: 'Slowly zoom in, pause, then zoom back out, on a loop.',
    },
    size: {
      control: 'inline-radio',
      options: ['start', 'zoomed'],
      description: 'Fixed size while zoom is off: the starting size or the zoomed-in size.',
      if: { arg: 'zoom', truthy: false },
    },
    hand: {
      control: 'boolean',
      description: 'Move the hand back as it dissolves, then move it in as it reappears, on a loop.',
    },
    energy: {
      control: 'boolean',
      description: 'Smoke-like energy rising from bottom to top through the center column.',
    },
    color: {
      control: 'inline-radio',
      options: ['cycle', 'green', 'red', 'purple'],
      description:
        'Red crawls in from the outside toward the center in cracks; green sparkles back in, LED by LED, from the center outward; purple spirals through the side panels, traces the two outer circles, then rises up the column. Each change takes 5s; cycle goes green → red → purple, holding each 8s.',
    },
  },
  args: { twinkle: true, zoom: false, size: 'start', hand: false, energy: false, color: 'cycle' },
  render: (args, { id }) => {
    const { color, ...settings } = args;
    // When only the color changed, hand back the live display so it can animate the
    // change; Storybook keeps an element it already shows instead of remounting it.
    const key = JSON.stringify([id, settings]);
    if (mounted?.key === key && mounted.stage.isConnected) {
      mounted.display.setColor(color);
      return mounted.stage;
    }

    const { twinkle, zoom, size, hand: moveHand, energy } = settings;
    const stage = document.createElement('div');
    stage.className = 'tidbyt-stage';
    const display = createTidbytDisplay(sigil, {
      twinkle: twinkle ? flankingPanels : undefined,
      hiRes: sigilSource,
      zoom: zoom ? 'cycle' : size === 'zoomed' ? ZOOM_MAX : 1,
      recede: moveHand ? { area: hand, center: HAND_CENTER } : undefined,
      flow: energy ? centerColumn : undefined,
      color,
      purplePath: PURPLE_PATH,
    });
    stage.append(display);
    mounted = { key, stage, display };
    return stage;
  },
};

export const UltrahandZoomed = {
  args: {
    size: 'zoomed',
    hand: true,
    energy: true
  },
};

export const Centered = {};
