import './gallery-template.css';
import './story-galleries.css';
import { createGallery } from './gallery-template.js';
import { ALL_GALLERY } from './story-galleries.js';

export default {
  title: 'Gallery',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every study and project in one gallery, newest first, each card previewing it and opening it. Categories group them under Studies and Projects. Built on the gallery template; the items are listed in `story-gallery-items.mjs`.',
      },
    },
  },
  render: (args) => createGallery(ALL_GALLERY, args),
  argTypes: {
    view: { control: 'inline-radio', options: ['gallery', 'index', 'categories'] },
  },
};

// The only story, named like its title, so the sidebar shows it as a single entry.
export const Gallery = {
  args: { view: 'gallery' },
};
