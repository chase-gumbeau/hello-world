import { createStubSection } from './stub-section.js';

export default {
  title: 'Studies/Color',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Overview = {
  name: 'Overview',
  render: () =>
    createStubSection(
      'Color',
      'Stub — palettes, scales and contrast explorations will live here.',
    ),
};
