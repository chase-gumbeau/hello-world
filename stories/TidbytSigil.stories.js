import './tidbyt-display.css';
import { createTidbytDisplay } from './tidbyt-display.js';
import sigil from '../tidbyt/sigil/sigil-32.png';

export default {
  title: 'Projects/Tidbyt/Sigil',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export const Centered = {
  render: () => {
    const stage = document.createElement('div');
    stage.className = 'tidbyt-stage';
    stage.append(createTidbytDisplay(sigil));
    return stage;
  },
};
