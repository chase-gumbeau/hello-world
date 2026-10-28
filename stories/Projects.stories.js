import './gallery-template.css';
import './story-galleries.css';
import { createGallery } from './gallery-template.js';
import { PROJECTS_GALLERY } from './story-galleries.js';

export default {
  title: 'Projects',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every project, each card previewing it live and opening it. Built on the gallery template; the projects are listed in `story-galleries.js`.',
      },
    },
  },
  render: (args) => createGallery(PROJECTS_GALLERY, args),
  argTypes: {
    view: { control: 'inline-radio', options: ['gallery', 'index', 'categories'] },
  },
};

export const Gallery = {
  args: { view: 'gallery' },
};
