import { expect, userEvent, waitFor } from 'storybook/test';
import './design-os-world.css';
import { createDesignOsWorld } from './design-os-world.js';
import { LANDMARKS, STAGES } from './design-os-world-data.js';

/**
 * Design OS Mini World — the Design OS map (FigJam: loop stages × dimensions) as a
 * pixel-art world. Lands = loop stages, the Canopy tree = the design system,
 * landmarks = cross-cutting lanes, quests = the gap register.
 */
export default {
  title: 'Studies/Worlds/MapleStory world',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '760px' },
      description: {
        component:
          'A single-page pixel world map of the Design OS. Seven lands on a ring road (Frame → Explore → Test → Decide & break down → Ship → Observe → Learn, then back to Frame) circle the Canopy tree. The Keystone, Capture Lighthouse, Sorting Post, and Pantry are the cross-cutting lanes. Click any land or landmark to unfurl its scroll: Objects, Keys, Tools, Agent role, Human decision, Written back to Notion, plus the quests (gaps) and blueprints filed against it. Content source of record: the FigJam “Design OS map — loop stages × dimensions”.',
      },
    },
  },
  argTypes: {
    focus: {
      control: 'select',
      options: ['none', ...STAGES.map((s) => s.id), ...LANDMARKS.map((l) => l.id), 'quests'],
      description: 'Open a land, landmark, or the quest log on load.',
    },
    keys: { control: 'boolean', description: 'Keys spine: IDs travelling the loop road.' },
    capture: { control: 'boolean', description: 'Capture Lighthouse beams to stages 3–7.' },
    agents: { control: 'boolean', description: 'Agents walking the loop (they coach and draft; they never decide).' },
    quests: { control: 'boolean', description: 'Quest counts from the gap register.' },
    blueprints: { control: 'boolean', description: 'Construction sites for skills to build and new ideas.' },
    labels: { control: 'boolean', description: 'Land and landmark names.' },
    animate: { control: 'boolean', description: 'Ambient animation (off = one still frame).' },
  },
  args: {
    focus: 'none',
    keys: true,
    capture: true,
    agents: true,
    quests: true,
    blueprints: true,
    labels: true,
    animate: true,
  },
  render: (args) => createDesignOsWorld(args),
};

export const World = {};

export const UnfurledTest = {
  name: 'Unfurled — 3 · Test',
  args: { focus: 'test' },
};

export const SortingPost = {
  name: 'Landmark — The Sorting Post',
  args: { focus: 'disposition' },
};

export const TheCanopy = {
  name: 'Landmark — The Canopy',
  args: { focus: 'canopy' },
};

export const QuestLog = {
  name: 'Quest log',
  args: { focus: 'quests' },
};

export const StillLife = {
  name: 'Still (no animation)',
  args: { animate: false, agents: false },
};

/** Walks the loop from Frame to Explore through the scroll's nav, then rolls it up. */
export const WalkTheLoop = {
  name: 'Walk the loop (interaction)',
  play: async ({ canvas, canvasElement }) => {
    const frame = await canvas.findByRole('button', { name: /^Land 1 of 7: Frame/ });
    await userEvent.click(frame);
    const dialog = await canvas.findByRole('dialog');
    await waitFor(() => expect(dialog).toHaveTextContent('Problem verified, decision named'));
    await expect(dialog).toHaveTextContent('G1');

    await userEvent.click(await canvas.findByRole('button', { name: /^2 Explore >/ }));
    await waitFor(() => expect(canvas.getByRole('dialog')).toHaveTextContent('Divergent options, shared rough'));

    await userEvent.click(canvas.getByRole('button', { name: 'Roll up the scroll' }));
    await waitFor(() => expect(canvasElement.querySelector('.dos-scroll')).not.toBeVisible());
  },
};
