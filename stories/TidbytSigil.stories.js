import './tidbyt-display.css';
import { createTidbytDisplay, ZOOM_MAX } from './tidbyt-display.js';
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

/** The display on screen, and the settings (all but color) it was built with. */
let mounted = null;

export default {
  title: 'Projects/Tidbyt/Ultrahand Sigil',
  parameters: {
    layout: 'fullscreen',
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
      options: ['cycle', 'green', 'red'],
      description:
        'Red crawls in from the outside toward the center in cracks; green sparkles back in, LED by LED, from the center outward. Each change takes 5s; cycle holds each color 8s, then changes.',
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
