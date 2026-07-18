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
          ['Morning Brief', 'Solari Board', 'Scrolls', ['Home', '2025', '2024', '2023']],
          '*',
        ],
      },
    },
  },
};

export default preview;
