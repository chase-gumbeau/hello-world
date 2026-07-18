import { createScrollsApp } from '../scrolls-app.js';
import { SCROLL_TRIPS } from '../scrolls-registry.js';

export default {
  title: 'Scrolls',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
};

export const Home = {
  name: 'Home',
  parameters: {
    docs: {
      description: {
        story:
          'Title / home screen rendered inside the Scrolls app shell. Clicking a destination animates in place — content pushes left while the destination slides up from beneath the stable centered white frame/scrim — instead of navigating to another Storybook story. Destinations are listed newest year first.',
      },
    },
  },
  render: () => createScrollsApp(),
};

const tripStories = Object.fromEntries(
  SCROLL_TRIPS.map((trip) => [
    trip.storyId,
    {
      name: trip.storyName,
      parameters: {
        docs: {
          description: {
            story: `Standalone horizontal ${trip.title} photo scroll with a black scrim cutout — content in the window stays full brightness as frames move left and right.`,
          },
        },
      },
      render: () => trip.mount(),
    },
  ])
);

export const _2025Summer = tripStories._2025Summer;
export const _2025MexicoCity = tripStories._2025MexicoCity;
export const _2024CostaRica = tripStories._2024CostaRica;
export const _2024ThirtyThree = tripStories._2024ThirtyThree;
