import './tidbyt-display.css';
import { createTidbytDisplay } from './tidbyt-display.js';
import sigil from '../tidbyt/sigil/sigil-32.png';

/**
 * The two panels inside the inner ring, either side of the bright center column
 * (image columns 10–21), in 32x32 image coordinates.
 */
const flankingPanels = (x, y) => {
  const inInnerRing = Math.hypot(x - 15.5, y - 15.5) <= 11;
  return inInnerRing && (x <= 9 || x >= 22);
};

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
  },
};

export const Centered = {
  args: { twinkle: true },
  render: ({ twinkle }) => {
    const stage = document.createElement('div');
    stage.className = 'tidbyt-stage';
    stage.append(createTidbytDisplay(sigil, { twinkle: twinkle ? flankingPanels : undefined }));
    return stage;
  },
};
