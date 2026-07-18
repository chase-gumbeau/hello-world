import { getScrollTrip } from '../scrolls-registry.js';

export default {
  title: 'Projects/Scrolls/2023',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
};

export const Guanajuato = {
  name: 'Guanajuato',
  parameters: {
    docs: {
      description: {
        story:
          'Standalone horizontal Guanajuato photo scroll with a black scrim cutout — content in the window stays full brightness as frames move left and right.',
      },
    },
  },
  render: () => getScrollTrip('guanajuato').mount(),
};
