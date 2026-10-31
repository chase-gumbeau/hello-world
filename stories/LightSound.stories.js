import './light-sound.css';
import { LIGHT_SOUND_DEFAULTS, MAPPINGS, PATHS, createLightSound, createLightSoundPaths } from './light-sound.js';

export default {
  title: 'Studies/Sound/Light and Sound',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An image played as music. A lens of light travels a scanning path across the image, and the colours under it become a chord: hue sets the note (on the circle of fifths, so colour harmony lines up with musical harmony), lightness the octave and colourfulness the volume. Stars ring as overtones. Press Play to start the sound, or load or drop your own image.',
      },
    },
  },
  argTypes: {
    path: { control: 'inline-radio', options: PATHS.map((p) => p.id) },
    mapping: { control: 'inline-radio', options: MAPPINGS.map((m) => m.id) },
    tempo: { control: { type: 'range', min: 40, max: 180, step: 1 } },
    lens: {
      control: { type: 'range', min: 2, max: 8, step: 0.5 },
      description: 'Lens radius, in cells of a 48-cell grid.',
    },
    volume: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    src: { table: { disable: true } },
    title: { table: { disable: true } },
  },
  args: { ...LIGHT_SOUND_DEFAULTS },
};

export const CrabNebula = {
  name: 'Crab Nebula',
  render: (args) => createLightSound(args),
};

export const Paths = {
  name: 'Paths',
  render: (args) => createLightSoundPaths(args),
};
