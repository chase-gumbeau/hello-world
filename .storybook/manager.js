import { addons } from 'storybook/manager-api';
import { darkTheme, lightTheme } from './theme.js';

const themes = { light: lightTheme, dark: darkTheme };

// Starts in the OS color scheme; the toolbar Theme switcher (see preview.js)
// takes over from there.
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

addons.setConfig({
  theme: prefersDark ? darkTheme : lightTheme,
});

addons.register('studies/theme-sync', (api) => {
  const sync = ({ globals }) => {
    const theme = themes[globals?.theme];
    if (theme) api.setOptions({ theme });
  };

  api.on('setGlobals', sync);
  api.on('globalsUpdated', sync);
});
