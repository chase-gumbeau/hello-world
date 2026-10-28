import './gallery-template.css';
import './gallery-template-example.css';
import { EXAMPLE_GALLERY } from './gallery-template-example.js';
import { createGalleryPage } from './gallery-template.js';

/**
 * One page per item in the example gallery. The gallery's itemHref links here by
 * story id, so each export name must kebab-case to its item id (StatTiles → stat-tiles).
 */
export default {
  title: 'Studies/Surfaces/Gallery Template/Items',
  parameters: {
    layout: 'fullscreen',
  },
};

const page = (id) => () => createGalleryPage(EXAMPLE_GALLERY, id);

// Containers
export const Cards = { render: page('cards') };
export const Sheets = { render: page('sheets') };

// Feedback
export const Callouts = { render: page('callouts') };
export const StatTiles = { name: 'Stat tiles', render: page('stat-tiles') };
export const EmptyStates = { name: 'Empty states', render: page('empty-states') };
