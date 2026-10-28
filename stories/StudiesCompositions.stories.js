import { createStubSection } from './stub-section.js';

export default {
  title: 'Studies/Compositions',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Overview = {
  name: 'Overview',
  render: () =>
    createStubSection(
      'Compositions',
      'Stub — components combined into real layouts and flows will live here.',
    ),
};
