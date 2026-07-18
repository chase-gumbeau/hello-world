import { createScrollsApp } from '../scrolls-app.js';

export default {
  title: 'Scrolls',
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
          'Title / home screen rendered inside the Scrolls app shell. Clicking a destination animates in place — content pushes left while the destination slides up from beneath the stable centered white frame/scrim — instead of navigating to another Storybook story. Destinations are listed newest year first.',
      },
    },
  },
  render: () => createScrollsApp(),
};
