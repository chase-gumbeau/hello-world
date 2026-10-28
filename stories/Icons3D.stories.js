import './icons-3d.css';
import { ICONS, ICON_KEYS, createShowcase, createSolo } from './icons-3d.js';
import { PARACHUTE_DEFAULTS, createParachuteHero, createParachuteSolo } from './parachute-3d.js';

export default {
  title: 'Studies/3D/3D Icons',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    icon: { control: 'select', options: ICON_KEYS },
    color: { control: 'color' },
    depth: { control: { type: 'range', min: 4, max: 32, step: 1 } },
  },
  args: {
    icon: 'heart',
    color: ICONS.heart.color,
    depth: 18,
  },
};

export const Showcase = {
  name: 'Showcase',
  argTypes: {
    icon: { table: { disable: true } },
    color: { table: { disable: true } },
    depth: { table: { disable: true } },
  },
  render: () => createShowcase({ hero: (tilt) => createParachuteHero(tilt) }),
};

export const Parachute = {
  name: 'Parachute',
  argTypes: {
    icon: { table: { disable: true } },
    color: { table: { disable: true } },
    depth: { table: { disable: true } },
    canopy: { control: 'color' },
    canopyAlt: { control: 'color' },
    basket: { control: 'color' },
  },
  args: { ...PARACHUTE_DEFAULTS },
  render: ({ canopy, canopyAlt, basket }) => createParachuteSolo({ canopy, canopyAlt, basket }),
};

export const Extruded = {
  name: 'Extruded layers',
  render: (args) => createSolo({ technique: 'extrude', ...args }),
};

export const Clay = {
  name: 'Clay',
  argTypes: { depth: { table: { disable: true } } },
  render: (args) => createSolo({ technique: 'clay', ...args }),
};

export const Glass = {
  name: 'Layered glass',
  argTypes: { depth: { table: { disable: true } } },
  render: (args) => createSolo({ technique: 'glass', ...args }),
};

export const Raymarched = {
  name: 'Raymarched SDF',
  render: (args) => createSolo({ technique: 'ray', ...args }),
};
