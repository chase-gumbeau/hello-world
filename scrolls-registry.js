import { createScrolls } from './scrolls.js';
import { createCostaRicaScrolls } from './scrolls-costa-rica.js';
import { createMexicoCityScrolls } from './scrolls-mexico-city.js';
import { createScrolls33 } from './scrolls-33.js';

/**
 * Registry of scroll trips. Home, Storybook, and the app shell all read from here.
 *
 * Storybook sidebar groups trips by year via `stories/Scrolls{year}.stories.js`
 * (`title: 'Scrolls/2025'`, etc.). `storyExport` is the CSF named export in that
 * year file; story ids become e.g. `scrolls-2025--mexico-city`.
 *
 * @typedef {Object} ScrollTrip
 * @property {string} id Destination key used by home links and in-app navigation.
 * @property {number} year
 * @property {string} title Display name on the home screen / Storybook story.
 * @property {number} frames Horizontal frame count for mountScrolls.
 * @property {string} storyExport Named export in the year Storybook file.
 * @property {string} [heroImage] First-frame image path for home border peek palette.
 * @property {(options?: { embedded?: boolean }) => HTMLElement} mount
 * @property {boolean} [hideFromHome] When true, the trip keeps its own
 *   Storybook story and in-app destination but is omitted from the home
 *   screen's destination list (e.g. superseded by a newer trip for the
 *   same year).
 */

/** @type {ScrollTrip[]} */
export const SCROLL_TRIPS = [
  {
    id: 'summer',
    year: 2025,
    title: 'Summer',
    frames: 20,
    storyExport: 'Summer',
    heroImage: 'assets/scrolls/imgImage154.png',
    mount: (options) => createScrolls(options),
  },
  {
    id: 'mexico-city',
    year: 2025,
    title: 'Mexico City',
    frames: 20,
    storyExport: 'MexicoCity',
    heroImage: 'assets/scrolls-mexico-city/imgImage73.png',
    mount: (options) => createMexicoCityScrolls(options),
  },
  {
    id: 'costa-rica',
    year: 2024,
    title: 'Costa Rica',
    frames: 10,
    storyExport: 'CostaRica',
    heroImage: 'assets/scrolls-costa-rica/imgImage23.png',
    mount: (options) => createCostaRicaScrolls(options),
  },
  {
    id: '33',
    year: 2024,
    title: '33',
    frames: 10,
    storyExport: 'ThirtyThree',
    heroImage: 'assets/scrolls-33/img01-bg-strip.jpg',
    mount: (options) => createScrolls33(options),
  },
];

/** Trips grouped by year for the home screen (newest year first). */
export function getScrollTripsByYear() {
  const byYear = new Map();
  for (const trip of SCROLL_TRIPS) {
    if (trip.hideFromHome) continue;
    if (!byYear.has(trip.year)) byYear.set(trip.year, []);
    byYear.get(trip.year).push(trip);
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, trips]) => ({
      year,
      trips: [...trips].sort((a, b) => a.title.localeCompare(b.title)),
    }));
}

/** @param {string} id */
export function getScrollTrip(id) {
  return SCROLL_TRIPS.find((trip) => trip.id === id);
}

/** Factories for trip destinations (excludes home). */
export const SCROLL_DESTINATIONS = Object.fromEntries(
  SCROLL_TRIPS.map((trip) => [trip.id, (options) => trip.mount(options)])
);
