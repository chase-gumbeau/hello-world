import { expect, userEvent, waitFor } from 'storybook/test';
import './material-showcase.css';
import { createMaterialShowcase } from './material-showcase.js';

export default {
  title: 'Foundations/Material Showcase',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The shadcn/ui homepage component grid (ui.shadcn.com), rebuilt with Material 3 via Material Web.',
      },
    },
  },
  render: (args) => createMaterialShowcase(args),
  argTypes: {
    scheme: { control: 'inline-radio', options: ['light', 'dark'] },
  },
};

export const Light = {
  args: { scheme: 'light' },
};

export const Dark = {
  args: { scheme: 'dark' },
};

export const OpensAlertDialog = {
  name: 'Alert dialog opens',
  args: { scheme: 'light' },
  play: async ({ canvas, canvasElement }) => {
    const dialog = canvasElement.querySelector('md-dialog');
    dialog.quick = true; // skip open/close animations so the test doesn't depend on timing
    await userEvent.click(canvas.getByText('Alert Dialog'));
    await waitFor(() => expect(dialog.open).toBe(true));
    await userEvent.click(canvas.getByText('Cancel'));
    await waitFor(() => expect(dialog.open).toBe(false));
  },
};

export const SendsChatMessage = {
  name: 'Chat sends and resets',
  args: { scheme: 'light' },
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
  args: { scheme: 'light' },
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
