import '../material-setup.js';
import '../material-theme.css';
import '../style.css';

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Foundations',
          'Studies',
          'Projects',
          [
            'Morning Brief',
            'Solari Board',
            'Scrolls',
            ['Home', 'Home Left', '2025', '2024', '2023'],
          ],
          '*',
        ],
      },
    },
  },
  globalTypes: {
    scrollsHome: {
      description: 'Scrolls home layout version',
      toolbar: {
        title: 'Home',
        icon: 'sidebar',
        items: [
          { value: 'centered', title: 'Home · Centered' },
          { value: 'left', title: 'Home · Left' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    scrollsHome: 'centered',
  },
};

export default preview;
