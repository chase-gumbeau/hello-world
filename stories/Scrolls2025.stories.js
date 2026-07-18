import { getScrollTrip } from '../scrolls-registry.js';

export default {
  title: 'Projects/Scrolls/2025',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
};

export const MexicoCity = {
  name: 'Mexico City',
  parameters: {
    docs: {
      description: {
        story:
          'Standalone horizontal Mexico City photo scroll with a black scrim cutout — content in the window stays full brightness as frames move left and right.',
      },
    },
  },
  render: () => getScrollTrip('mexico-city').mount(),
};

export const Summer = {
  name: 'Summer',
  parameters: {
    docs: {
      description: {
        story:
          'Standalone horizontal Summer photo scroll with a black scrim cutout — content in the window stays full brightness as frames move left and right.',
      },
    },
  },
  render: () => getScrollTrip('summer').mount(),
};

export const PuertoRico = {
  name: 'Puerto Rico',
  parameters: {
    docs: {
      description: {
        story:
          'Standalone horizontal Puerto Rico photo scroll with a black scrim cutout — content in the window stays full brightness as frames move left and right.',
      },
    },
  },
  render: () => getScrollTrip('puerto-rico').mount(),
};
