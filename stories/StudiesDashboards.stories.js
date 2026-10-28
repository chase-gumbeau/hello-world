import { createStubSection } from './stub-section.js';

export default {
  title: 'Studies/Surfaces/Dashboards',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Overview = {
  name: 'Overview',
  render: () =>
    createStubSection(
      'Dashboards',
      'Stub — data-dense layouts, KPI tiles and chart studies will live here.',
    ),
};
