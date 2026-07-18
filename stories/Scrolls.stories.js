import { createScrollsApp } from '../scrolls-app.js';

export default {
  title: 'Projects/Scrolls',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
};

/** @param {{ scrollsHome?: string }} globals */
function homeLayoutFromGlobals(globals = {}) {
  return globals.scrollsHome === 'left' ? 'left' : 'centered';
}

export const Home = {
  name: 'Home',
  parameters: {
    docs: {
      description: {
        story:
          'Title / home screen rendered inside the Scrolls app shell. Use the toolbar **Home** dropdown to flip between Centered (nav in the frame) and Left (nav in the left gutter). Clicking a destination animates in place under the stable centered white frame/scrim.',
      },
    },
  },
  render: (_args, { globals }) =>
    createScrollsApp({ homeLayout: homeLayoutFromGlobals(globals) }),
};

export const HomeLeft = {
  name: 'Home Left',
  parameters: {
    docs: {
      description: {
        story:
          'Alternate home: destination list sits left of the frame, left-aligned. On click the nav slides left and disappears while the trip enters under the stable window. The toolbar **Home** dropdown can still switch layouts.',
      },
    },
  },
  globals: {
    scrollsHome: 'left',
  },
  render: (_args, { globals }) =>
    createScrollsApp({ homeLayout: homeLayoutFromGlobals(globals) }),
};
