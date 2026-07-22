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
          [
            'Overview',
            'Animation mesh gradient',
            'Shader Type',
          ],
          'Projects',
          [
            'Morning Brief',
            'Work Brief',
            [
              'Page',
              'Clinician',
              'Supplier CSR',
              'Supplier Manager',
              'Patient',
              'Payor',
              'Catalog',
              'Ops / CS',
            ],
            'Solari Board',
            'Scrolls',
            ['Home', 'Home Left', '2025', '2024', '2023'],
          ],
          '*',
        ],
      },
    },
  },
};

export default preview;
