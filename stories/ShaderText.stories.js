import './shader-text.css';
import {
  createShowcase,
  createGlSolo,
  createCssSolo,
} from './shader-text.js';

export default {
  title: 'Studies/Shader Type',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    text: { control: 'text' },
    shader: {
      control: 'select',
      options: ['wave', 'caustic', 'glitch'],
    },
  },
  args: {
    text: 'SHADERS',
    shader: 'wave',
  },
};

export const Showcase = {
  name: 'Showcase',
  render: (args) => createShowcase(args),
};

export const Wave = {
  name: 'WebGL · Wave',
  args: { text: 'WAVE', shader: 'wave' },
  render: (args) => createGlSolo(args),
};

export const Caustic = {
  name: 'WebGL · Caustic',
  args: { text: 'CAUSTIC', shader: 'caustic' },
  render: (args) => createGlSolo(args),
};

export const Glitch = {
  name: 'WebGL · Glitch',
  args: { text: 'GLITCH', shader: 'glitch' },
  render: (args) => createGlSolo(args),
};

export const FlowFill = {
  name: 'Flow fill',
  args: { text: 'FLOW' },
  render: (args) => createCssSolo({ text: args.text, variant: 'flow' }),
};

export const SvgWarp = {
  name: 'SVG warp',
  args: { text: 'WARP' },
  render: (args) => createCssSolo({ text: args.text, variant: 'warp' }),
};

export const Melt = {
  name: 'Melt',
  args: { text: 'MELT' },
  render: (args) => createCssSolo({ text: args.text, variant: 'melt' }),
};

export const Chromatic = {
  name: 'Chromatic',
  args: { text: 'RGB' },
  render: (args) => createCssSolo({ text: args.text, variant: 'chroma' }),
};

export const GrainMask = {
  name: 'Grain mask',
  args: { text: 'NOISE' },
  render: (args) => createCssSolo({ text: args.text, variant: 'grain' }),
};

export const StaggeredGlyphs = {
  name: 'Staggered glyphs',
  args: { text: 'TYPE' },
  render: (args) => createCssSolo({ text: args.text, variant: 'stagger' }),
};
