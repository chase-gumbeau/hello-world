import { create } from 'storybook/theming/create';

// Jade on warm charcoal (dark) / deep jade on warm paper (light).
// Values match the --md-sys-color-* tokens in ../material-theme.css.
const shared = {
  brandTitle: 'Studies',
  fontBase: 'Lato, system-ui, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  appBorderRadius: 12,
  inputBorderRadius: 8,
};

export const lightTheme = create({
  base: 'light',
  ...shared,

  colorPrimary: '#006c4f',
  colorSecondary: '#006c4f',

  appBg: '#f5f0eb',
  appContentBg: '#faf6f2',
  appPreviewBg: '#faf6f2',
  appBorderColor: '#cdc6bf',

  textColor: '#1d1a18',
  textInverseColor: '#faf6f2',
  textMutedColor: '#4a4540',

  barTextColor: '#4a4540',
  barHoverColor: '#006c4f',
  barSelectedColor: '#006c4f',
  barBg: '#faf6f2',

  buttonBg: '#efeae5',
  buttonBorder: '#cdc6bf',
  booleanBg: '#e3ded8',
  booleanSelectedBg: '#faf6f2',

  inputBg: '#faf6f2',
  inputBorder: '#7b756f',
  inputTextColor: '#1d1a18',
});

export const darkTheme = create({
  base: 'dark',
  ...shared,

  colorPrimary: '#3ee0a4',
  colorSecondary: '#3ee0a4',

  appBg: '#1c1918',
  appContentBg: '#161312',
  appPreviewBg: '#161312',
  appBorderColor: '#3a3533',

  textColor: '#e8e1de',
  textInverseColor: '#161312',
  textMutedColor: '#b8afab',

  barTextColor: '#b8afab',
  barHoverColor: '#3ee0a4',
  barSelectedColor: '#3ee0a4',
  barBg: '#211d1c',

  buttonBg: '#2b2725',
  buttonBorder: '#4a4340',
  booleanBg: '#36312f',
  booleanSelectedBg: '#161312',

  inputBg: '#211d1c',
  inputBorder: '#988f8b',
  inputTextColor: '#e8e1de',
});
