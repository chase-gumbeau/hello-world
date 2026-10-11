import { expect, userEvent, waitFor } from 'storybook/test';
import './design-os-files.css';
import { createDesignOsFiles } from './design-os-files.js';

/**
 * Design OS File Manager — the same Design OS map as the pixel Mini World, as a
 * Windows 3.1 desktop. Drive C: is the Design OS; stages are directories.
 */
export default {
  title: 'Projects/Design OS File Manager',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '720px' },
      description: {
        component:
          'The Design OS map projected onto a Windows 3.1 file system. Each loop stage is a directory (1FRAME … 7LEARN) holding one file per dimension: OBJECTS.CRD (Cardfile), KEYS.INI, TOOLS.GRP (Program Manager), AGENT.BAT (runs in an MS-DOS Prompt), DECISION.TXT, and NOTION.WRI (Write). The 25 gaps are G??.TXT quest files — read-only when they depend on the Oct 9 session — and blueprints are *.PLN. Landmarks are directories too: KEYS, CAPTURE, SORTING (with an empty EXAMPLE route), PANTRY, and CANOPY. WORLD.BMP opens the pixel world in Paintbrush. Double-click to open; File › Search finds G*.TXT across the drive.',
      },
    },
  },
  argTypes: {
    path: { control: 'text', description: 'Directory File Manager opens in, e.g. C:\\3TEST.' },
    open: { control: 'text', description: 'File to open on load, e.g. C:\\README.TXT. Empty for none.' },
    search: { control: 'text', description: 'Run File › Search for this pattern on load, e.g. G*.TXT.' },
    desktop: { control: 'color', description: 'Desktop color.' },
  },
  args: {
    path: 'C:\\',
    open: 'C:\\README.TXT',
    search: '',
    desktop: '#008080',
  },
  render: (args) => createDesignOsFiles({ ...args, open: args.open || null, search: args.search || null }),
};

export const Desktop = {};

export const StageFolder = {
  name: 'Stage folder — 3TEST',
  args: { path: 'C:\\3TEST', open: 'C:\\3TEST\\OBJECTS.CRD' },
};

export const QuestSearch = {
  name: 'Quest search — G*.TXT',
  args: { open: '', search: 'G*.TXT' },
};

export const ToolsGroup = {
  name: 'Program Manager — 2EXPLORE tools',
  args: { path: 'C:\\2EXPLORE', open: 'C:\\2EXPLORE\\TOOLS.GRP' },
};

export const EmptyExampleRoute = {
  name: 'Sorting — the empty EXAMPLE route',
  args: { path: 'C:\\SORTING\\EXAMPLE', open: '' },
};

export const WorldBitmap = {
  name: 'Paintbrush — WORLD.BMP',
  args: { open: 'C:\\WORLD.BMP' },
};

/** Opens 4DECIDE from the tree, then its Cardfile, then checks a read-only quest. */
export const BrowseTheDrive = {
  name: 'Browse the drive (interaction)',
  args: { open: '' },
  play: async ({ canvas }) => {
    const decide = await canvas.findByRole('treeitem', { name: /4decide/ });
    await userEvent.click(decide);
    const objects = await canvas.findByRole('option', { name: /objects\.crd/ });
    await userEvent.dblClick(objects);
    await waitFor(() => expect(canvas.getByRole('region', { name: 'Cardfile - OBJECTS.CRD' })).toBeVisible());
    await expect(canvas.getByText('7 Cards')).toBeVisible();

    await userEvent.click(canvas.getByRole('option', { name: /g11\.txt/ }));
    await expect(canvas.getByText(/Selected 1 file\(s\)/)).toBeVisible();
    await userEvent.dblClick(canvas.getByRole('option', { name: /g11\.txt/ }));
    await waitFor(() => expect(canvas.getByRole('region', { name: /Notepad - G11\.TXT \[Read Only\]/ })).toBeVisible());
  },
};
