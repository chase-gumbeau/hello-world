
/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/html-vite",
  // Screenshots for the Studies and Projects gallery cards (npm run previews; CI
  // writes them into the build on deploy).
  "staticDirs": [{ "from": "../story-previews", "to": "/story-previews" }],
  "features": {
    "sidebarOnboardingChecklist": false,
    "menuOnboardingChecklist": false
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    // GitHub Pages project site: https://chase-gumbeau.github.io/studies/
    const base = process.env.STORYBOOK_BASE || '/';
    return mergeConfig(config, {
      base,
      // Generated scroll CSS uses Figma-style tokens like --border-radius/300,
      // which lightningcss cannot minify.
      build: {
        cssMinify: false,
      },
    });
  },
};
export default config;