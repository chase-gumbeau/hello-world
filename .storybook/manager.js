import { addons } from 'storybook/manager-api';
import { darkTheme, lightTheme } from './theme.js';

const themes = { light: lightTheme, dark: darkTheme };

// Starts in the OS color scheme; the toolbar Theme switcher (see preview.js)
// takes over from there.
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// manager-head.html keys the dark sidebar glow off this attribute.
const setScheme = (scheme) => {
  document.documentElement.dataset.theme = scheme;
};

setScheme(prefersDark ? 'dark' : 'light');

addons.setConfig({
  theme: prefersDark ? darkTheme : lightTheme,
});

addons.register('studies/theme-sync', (api) => {
  const sync = ({ globals }) => {
    const theme = themes[globals?.theme];
    if (theme) {
      setScheme(globals.theme);
      api.setOptions({ theme });
    }
  };

  api.on('setGlobals', sync);
  api.on('globalsUpdated', sync);
});
