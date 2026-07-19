import { createScrollsApp } from '../scrolls-app.js';

export default {
  title: 'Projects/Scrolls',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
};

export const Home = {
  name: 'Home',
  parameters: {
    docs: {
      description: {
        story:
          'Title / home screen rendered inside the Scrolls app shell with centered nav in the frame. Clicking a destination animates in place under the stable centered white frame/scrim.',
      },
    },
  },
  render: () => createScrollsApp({ homeLayout: 'centered' }),
};

export const HomeLeft = {
  name: 'Home Left',
  parameters: {
    docs: {
      description: {
        story:
          'Alternate home: destination list sits left of the frame, left-aligned. On click the nav slides left and disappears while the trip enters under the stable window.',
      },
    },
  },
  render: () => createScrollsApp({ homeLayout: 'left' }),
};
