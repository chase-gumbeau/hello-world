import './ascii-sigil.css';
import { createAsciiSigil } from './ascii-sigil.js';
import sigilSource from '../tidbyt/sigil/sigil-source.png';

export default {
  title: 'Studies/Motion/ASCII Sigil',
  parameters: {
    layout: 'fullscreen',
    // ASCII art drawn as decoration: nothing for a11y checks to act on.
    a11y: { test: 'off' },
  },
  argTypes: {
    cols: {
      control: { type: 'range', min: 48, max: 160, step: 4 },
      description: 'Characters across. Rows follow from the seal’s shape.',
    },
  },
  args: { cols: 96 },
  render: ({ cols }) => createAsciiSigil(sigilSource, { cols }),
};

export const Animated = {
  args: {
    cols: 160
  }
};
