import { getScrollTrip } from '../scrolls-registry.js';

export default {
  title: 'Scrolls/2024',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
};

export const CostaRica = {
  name: 'Costa Rica',
  parameters: {
    docs: {
      description: {
        story:
          'Standalone horizontal Costa Rica photo scroll with a black scrim cutout — content in the window stays full brightness as frames move left and right.',
      },
    },
  },
  render: () => getScrollTrip('costa-rica').mount(),
};

/** Export id avoids a leading digit; `name` is what the sidebar shows. */
export const ThirtyThree = {
  name: '33',
  parameters: {
    docs: {
      description: {
        story:
          'Standalone horizontal 33 photo scroll with a black scrim cutout — content in the window stays full brightness as frames move left and right.',
      },
    },
  },
  render: () => getScrollTrip('33').mount(),
};
