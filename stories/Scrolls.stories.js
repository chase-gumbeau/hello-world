import { createScrollsApp } from '../scrolls-app.js';

export default {
  title: 'Projects/Scrolls',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
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
