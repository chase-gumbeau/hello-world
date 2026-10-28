import './material-showcase.css';
import { createFamilyPage } from './material-showcase.js';

/**
 * One page per component family in ./material-catalog. The showcase Index links
 * here by story id, so each export name must kebab-case to its family id
 * (CommonButtons → common-buttons).
 */
export default {
  title: 'Foundations/Material Showcase/Components',
  parameters: {
    layout: 'fullscreen',
  },
};

const page = (id) => () => createFamilyPage(id);

// Actions
export const CommonButtons = { name: 'Common buttons', render: page('common-buttons') };
export const FloatingActionButtons = { name: 'Floating action buttons', render: page('floating-action-buttons') };
export const IconButtons = { name: 'Icon buttons', render: page('icon-buttons') };
export const SegmentedButtons = { name: 'Segmented buttons', render: page('segmented-buttons') };

// Communication
export const Badges = { name: 'Badges', render: page('badges') };
export const ProgressIndicators = { name: 'Progress indicators', render: page('progress-indicators') };

// Containment
export const Cards = { name: 'Cards', render: page('cards') };
export const Dialogs = { name: 'Dialogs', render: page('dialogs') };
export const Dividers = { name: 'Dividers', render: page('dividers') };
export const Lists = { name: 'Lists', render: page('lists') };

// Navigation
export const NavigationBar = { name: 'Navigation bar', render: page('navigation-bar') };
export const NavigationDrawer = { name: 'Navigation drawer', render: page('navigation-drawer') };
export const Tabs = { name: 'Tabs', render: page('tabs') };
export const Menus = { name: 'Menus', render: page('menus') };

// Selection
export const Checkbox = { name: 'Checkbox', render: page('checkbox') };
export const Chips = { name: 'Chips', render: page('chips') };
export const RadioButtons = { name: 'Radio buttons', render: page('radio-buttons') };
export const Select = { name: 'Select', render: page('select') };
export const Sliders = { name: 'Sliders', render: page('sliders') };
export const Switch = { name: 'Switch', render: page('switch') };

// Text inputs
export const TextFields = { name: 'Text fields', render: page('text-fields') };
export const Fields = { name: 'Fields', render: page('fields') };

// Foundations
export const Icons = { name: 'Icons', render: page('icons') };
export const RippleAndFocus = { name: 'Ripple & focus ring', render: page('ripple-and-focus') };
export const Elevation = { name: 'Elevation', render: page('elevation') };
export const TypeScale = { name: 'Type scale', render: page('type-scale') };
