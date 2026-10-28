import { expect, userEvent, waitFor } from 'storybook/test';
import './gallery-template.css';
import './material-showcase.css';
import { CATEGORIES, FAMILIES } from './material-catalog/index.js';
import { createMaterialShowcase } from './material-showcase.js';

export default {
  title: 'Foundations/Material Showcase',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every Material Web component (including labs), laid out the shadcn/ui way: a Gallery masonry, an Index of categories and families, and the cards grouped by category. Each family has its own page under Components.',
      },
    },
  },
  render: (args) => createMaterialShowcase(args),
  argTypes: {
    view: { control: 'inline-radio', options: ['gallery', 'index', 'categories'] },
  },
};

/** The default story: Gallery, Index and Categories live behind its top nav. */
export const MaterialExplorer = {
  name: 'Material Explorer',
  args: { view: 'gallery' },
};

// Interaction tests: hidden from the sidebar ('!dev') but still run by the test runner.

export const SwitchesViews = {
  name: 'Tabs switch views',
  tags: ['!dev'],
  args: { view: 'gallery' },
  play: async ({ canvas, canvasElement }) => {
    const indexTab = canvas.getByRole('tab', { name: 'Index' });
    await userEvent.click(indexTab);
    await waitFor(() => expect(indexTab).toHaveAttribute('aria-selected', 'true'));
    const links = canvasElement.querySelectorAll('.gal__index a[data-item]');
    await expect(links.length).toBe(FAMILIES.length);
    await expect(links[0].getAttribute('href')).toContain('foundations-material-showcase-components--');

    const categoriesTab = canvas.getByRole('tab', { name: 'Categories' });
    await userEvent.click(categoriesTab);
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.gal__section').length).toBe(CATEGORIES.length),
    );
    await expect(canvasElement.querySelectorAll('.gal__item').length).toBe(FAMILIES.length);
  },
};

export const OpensAlertDialog = {
  name: 'Alert dialog opens',
  tags: ['!dev'],
  args: { view: 'gallery' },
  play: async ({ canvas, canvasElement }) => {
    const dialog = canvasElement.querySelector('[data-dialog="alert"]');
    dialog.quick = true; // skip open/close animations so the test doesn't depend on timing
    await userEvent.click(canvas.getByText('Alert Dialog'));
    await waitFor(() => expect(dialog.open).toBe(true));
    await userEvent.click(canvas.getByText('Cancel', { selector: '[data-close]' }));
    await waitFor(() => expect(dialog.open).toBe(false));
  },
};

export const SendsChatMessage = {
  name: 'Chat sends and resets',
  tags: ['!dev'],
  args: { view: 'gallery' },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvasElement.querySelector('[data-action="send"]'));
    const log = canvas.getByRole('log', { name: 'Conversation' });
    await waitFor(() => expect(log.querySelector('.msc__bubble')).toBeTruthy());
    await expect(log.querySelector('.msc__bubble').textContent).toContain('scroll behavior');

    await userEvent.click(canvasElement.querySelector('[data-action="reset-chat"]'));
    await expect(log.querySelector('.msc__bubble')).toBeNull();
    await expect(canvasElement.querySelector('.msc__chat-empty').hidden).toBe(false);
  },
};

export const SelectsNavItem = {
  name: 'Nav item selection',
  tags: ['!dev'],
  args: { view: 'gallery' },
  play: async ({ canvas }) => {
    const reports = canvas.getByText('Reports').closest('md-list-item');
    await userEvent.click(reports);
    await waitFor(() => expect(reports).toHaveAttribute('data-current'));
    const goals = canvas.getByText('Goals').closest('md-list-item');
    await userEvent.click(goals);
    await waitFor(() => expect(goals).toHaveAttribute('data-current'));
    await expect(reports).not.toHaveAttribute('data-current');
  },
};
