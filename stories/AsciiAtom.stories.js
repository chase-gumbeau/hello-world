import './ascii-atom.css';
import { ATOM_DEFAULTS, createAsciiAtomSizes, createAsciiAtomSolo } from './ascii-atom.js';

export default {
  title: 'Studies/Motion/ASCII Atom',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    ink: { control: 'color' },
    electron: { control: 'color' },
    background: { control: 'color' },
    orbits: { control: { type: 'range', min: 1, max: 6, step: 1 } },
    cols: {
      control: { type: 'range', min: 24, max: 120, step: 4 },
      description: 'Characters across; the grid stays square.',
    },
    speed: { control: { type: 'range', min: 0, max: 4, step: 0.1 } },
    tilt: { control: { type: 'range', min: 0, max: 85, step: 1 } },
    trail: { control: 'boolean' },
    simpleNucleus: { control: 'boolean' },
  },
  args: { ...ATOM_DEFAULTS },
};

export const Animated = {
  name: 'Animated',
  render: (args) => createAsciiAtomSolo(args),
};

export const Night = {
  name: 'Night',
  args: { ink: '#e9e4dc', electron: '#7cc4ff', background: '#14161b' },
  render: (args) => createAsciiAtomSolo(args),
};

export const Sizes = {
  name: 'Sizes',
  render: (args) => createAsciiAtomSizes(args),
};
