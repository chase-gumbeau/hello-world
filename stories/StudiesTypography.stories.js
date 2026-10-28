import { createStubSection } from './stub-section.js';

export default {
  title: 'Studies/Typography',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Overview = {
  name: 'Overview',
  render: () =>
    createStubSection(
      'Typography',
      'Stub — type scales, pairings and specimen studies will live here.',
    ),
};
