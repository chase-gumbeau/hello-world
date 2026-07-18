import { createScrolls } from './scrolls.js';
import { createCostaRicaScrolls } from './scrolls-costa-rica.js';
import { createMexicoCityScrolls } from './scrolls-mexico-city.js';
import { createScrolls33 } from './scrolls-33.js';

/**
 * Registry of scroll trips. Home, Storybook, and the app shell all read from here.
 *
 * @typedef {Object} ScrollTrip
 * @property {string} id Destination key used by home links and in-app navigation.
 * @property {number} year
 * @property {string} title Display name on the home screen.
 * @property {number} frames Horizontal frame count for mountScrolls.
 * @property {string} storyId Named export key in stories/Scrolls.stories.js.
 * @property {string} storyName Storybook sidebar label.
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
    // Leading underscore lets the export name start with the year (bare
    // identifiers can't start with a digit) while keeping Storybook's
    // export-key-derived story id year-first: scrolls--2025-summer.
    storyId: '_2025Summer',
    storyName: '2025 Summer',
    mount: (options) => createScrolls(options),
    hideFromHome: true,
  },
  {
    id: 'mexico-city',
    year: 2025,
    title: 'Mexico City',
    frames: 20,
    storyId: '_2025MexicoCity',
    storyName: '2025 Mexico City',
    mount: (options) => createMexicoCityScrolls(options),
  },
  {
    id: 'costa-rica',
    year: 2024,
    title: 'Costa Rica',
    frames: 10,
    storyId: '_2024CostaRica',
    storyName: '2024 Costa Rica',
    mount: (options) => createCostaRicaScrolls(options),
  },
  {
    id: '33',
    year: 2024,
    title: '33',
    frames: 10,
    // Leading underscore lets the export name start with the year (bare
    // identifiers can't start with a digit) while keeping Storybook's
    // export-key-derived story id year-first: scrolls--2024-33.
    storyId: '_2024ThirtyThree',
    storyName: '2024 33',
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
