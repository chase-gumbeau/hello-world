import '../material-setup.js';
import '../material-theme.css';
import '../style.css';
import './preview-docs-dark.css';
import { addons } from 'storybook/preview-api';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Dark tokens live under :root[data-theme='dark'] in material-theme.css / style.css.
const applyTheme = (theme) => {
  if (theme) document.documentElement.dataset.theme = theme;
};

const initialTheme = prefersDark ? 'dark' : 'light';
applyTheme(initialTheme);

// MDX docs pages render no story, so the decorator below never runs there.
const channel = addons.getChannel();
channel.on('setGlobals', ({ globals }) => applyTheme(globals?.theme));
channel.on('globalsUpdated', ({ globals }) => applyTheme(globals?.theme));

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  initialGlobals: {
    theme: initialTheme,
  },

  globalTypes: {
    theme: {
      description: 'Color scheme for stories',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (story, context) => {
      applyTheme(context.globals.theme);
      return story();
    },
  ],

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
            'Surfaces',
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
            ],
            'Motion',
            '3D Icons',
          ],
          'Projects',
          [
            'Solari Board',
            'Scrolls',
            ['Home Left', '2025', '2024', '2023'],
          ],
          '*',
        ],
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
