import './atom-logo.css';
import { ATOM_DEFAULTS, createAtomSizes, createAtomSolo } from './atom-logo.js';

export default {
  title: 'Studies/Atom Logo',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    ink: { control: 'color' },
    electron: { control: 'color' },
    background: { control: 'color' },
    orbits: { control: { type: 'range', min: 1, max: 6, step: 1 } },
    strokeWidth: { control: { type: 'range', min: 1, max: 8, step: 0.5 } },
    speed: { control: { type: 'range', min: 0, max: 4, step: 0.1 } },
    tilt: { control: { type: 'range', min: 0, max: 85, step: 1 } },
    trail: { control: 'boolean' },
    simpleNucleus: { control: 'boolean' },
  },
  args: { ...ATOM_DEFAULTS },
};

export const Animated = {
  name: 'Animated',
  render: (args) => createAtomSolo(args),
};

export const Night = {
  name: 'Night',
  args: { ink: '#e9e4dc', electron: '#7cc4ff', background: '#14161b' },
  render: (args) => createAtomSolo(args),
};

export const Sizes = {
  name: 'Sizes',
  render: (args) => createAtomSizes(args),
};
