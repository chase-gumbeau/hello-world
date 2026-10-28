import { expect, userEvent, waitFor } from 'storybook/test';
import './gallery-template.css';
import './gallery-template-example.css';
import { EXAMPLE_GALLERY } from './gallery-template-example.js';
import { createGallery } from './gallery-template.js';

export default {
  title: 'Foundations/Surface/Gallery Template',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The reusable shell behind the Material Explorer. One `GalleryConfig` (categories, items with variants, hero copy, optional compositions) drives a Gallery masonry, an Index, a Categories view and a page per item. Start a new gallery by copying `gallery-template-example.js`; the config is documented in `gallery-template.js`.',
      },
    },
  },
  render: (args) => createGallery(EXAMPLE_GALLERY, args),
  argTypes: {
    view: { control: 'inline-radio', options: ['gallery', 'index', 'categories'] },
  },
};

export const Gallery = {
  args: { view: 'gallery' },
};

// Interaction test: hidden from the sidebar ('!dev') but still run by the test runner.

export const SwitchesViews = {
  name: 'Tabs switch views',
  tags: ['!dev'],
  args: { view: 'gallery' },
  play: async ({ canvas, canvasElement }) => {
    const { items, categories } = EXAMPLE_GALLERY;
    await expect(canvasElement.querySelectorAll('.gal__item').length).toBe(items.length);

    const indexTab = canvas.getByRole('tab', { name: 'Index' });
    await userEvent.click(indexTab);
    await waitFor(() => expect(indexTab).toHaveAttribute('aria-selected', 'true'));
    const links = canvasElement.querySelectorAll('.gal__index a[data-item]');
    await expect(links.length).toBe(items.length);
    await expect(links[0].getAttribute('href')).toContain('foundations-surface-gallery-template-items--');

    await userEvent.click(canvas.getByRole('tab', { name: 'Categories' }));
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.gal__section').length).toBe(categories.length),
    );
  },
};
