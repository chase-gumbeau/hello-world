/**
 * Story galleries — galleries of this Storybook's own work, built on the gallery
 * template (./gallery-template.js). Each card previews a story and opens it; the
 * items are listed in ./story-gallery-items.mjs, and shown most recently updated
 * first. Studies and Projects each have one, as the first story in their section,
 * and the top-level Gallery shows both together.
 *
 * A card shows a screenshot of its story from story-previews/ (captured by
 * scripts/capture-story-previews.mjs, in CI on deploy or locally with
 * `npm run previews`), and falls back to the live story when there isn't one.
 */

import { PROJECTS, STUDIES } from './story-gallery-items.mjs';

// When each item last changed, from scripts/story-updates.mjs (run before Storybook,
// its build and the tests). Optional: without it, items keep their listed order.
const updates =
  Object.values(import.meta.glob('./story-updates.json', { eager: true, import: 'default' }))[0] ?? {};

/** Most recently updated first. */
const newestFirst = (a, b) => (updates[b.id] ?? '').localeCompare(updates[a.id] ?? '');

/**
 * A gallery whose items are stories here.
 * @param {object} opts
 * @param {string} opts.name  The gallery's name (and the section it opens).
 * @param {string} opts.galleryStory  The gallery's own story id, for its view links.
 * @param {{one: string, many: string}} opts.noun  What an item is called.
 * @param {{id: string, title: string, summary: string}[]} opts.categories
 * @param {{id: string, title: string, category: string, summary: string, story: string}[]} opts.items
 *   Each item's card previews `story` (a story id) and links to it.
 * @returns {import('./gallery-template.js').GalleryConfig}
 */
function storyGallery({ name, galleryStory, noun, categories, items }) {
  const storyById = new Map(items.map((item) => [item.id, item.story]));
  return {
    name,
    className: 'm3-scope',
    noun,
    categories,
    items: [...items].sort(newestFirst).map((item) => ({
      ...item,
      variants: [{ html: preview(item) }],
      gallery: [0],
    })),
    // Cards and the Index open the story itself (relative to iframe.html, so they
    // work under the /studies/ Pages base too).
    itemHref: (id) => `./?path=/story/${storyById.get(id)}`,
    viewHref: (view) => `./?path=/story/${galleryStory}&args=view:${view}`,
  };
}

/**
 * A story in a card: its screenshot, or (when there isn't one) the live story, laid
 * out at 4x and scaled down (story-galleries.css). Paths are relative to iframe.html,
 * so they work under the /studies/ Pages base too.
 */
const preview = ({ title, story }) => {
  const live = `<iframe src="./iframe.html?id=${story}&viewMode=story" title="${title} preview" tabindex="-1"></iframe>`;
  // Inline, as the card is built from markup: swap in the live story if the image fails.
  const fallback = `this.parentElement.innerHTML = this.dataset.live`;
  return `<div class="sg-preview">
  <img src="./story-previews/${story}.jpg" alt="" data-live="${live.replaceAll('"', '&quot;')}" onerror="${fallback}">
</div>`;
};

export const STUDIES_GALLERY = storyGallery(STUDIES);

export const PROJECTS_GALLERY = storyGallery(PROJECTS);

/**
 * Everything in one gallery: every study and project, newest first. Its categories are
 * each section's own, grouped under Studies and Projects (ids prefixed to keep them
 * apart), so the Categories view reads Studies › 3D, Projects › Displays and so on.
 */
const grouped = ({ name, categories, items }) => {
  const prefix = name.toLowerCase();
  return {
    categories: categories.map((cat) => ({ ...cat, id: `${prefix}-${cat.id}`, group: name })),
    items: items.map((item) => ({ ...item, category: `${prefix}-${item.category}` })),
  };
};
const allStudies = grouped(STUDIES);
const allProjects = grouped(PROJECTS);

export const ALL_GALLERY = storyGallery({
  name: 'Gallery',
  galleryStory: 'gallery--gallery',
  noun: { one: 'piece', many: 'pieces' },
  categories: [...allStudies.categories, ...allProjects.categories],
  items: [...allStudies.items, ...allProjects.items],
});
