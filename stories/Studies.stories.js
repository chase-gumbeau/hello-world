import './gallery-template.css';
import './story-galleries.css';
import { createGallery } from './gallery-template.js';
import { STUDIES_GALLERY } from './story-galleries.js';

export default {
  title: 'Studies',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every study, each card previewing it live and opening it. Built on the gallery template; the studies are listed in `story-galleries.js`.',
      },
    },
  },
  render: (args) => createGallery(STUDIES_GALLERY, args),
  argTypes: {
    view: { control: 'inline-radio', options: ['gallery', 'index', 'categories'] },
  },
};

export const Gallery = {
  args: { view: 'gallery' },
};
