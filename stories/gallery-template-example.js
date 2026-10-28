/**
 * Gallery template example — the smallest useful GalleryConfig, as a starting
 * point for new galleries. Copy this file, swap the categories, items and copy,
 * and add a story per item (see GalleryTemplateItems.stories.js).
 */

/** @type {import('./gallery-template.js').GalleryConfig['categories']} */
const CATEGORIES = [
  { id: 'containers', title: 'Containers', summary: 'Surfaces that hold and group content.' },
  { id: 'feedback', title: 'Feedback', summary: 'Surfaces that report status or a lack of content.' },
];

/** @type {import('./gallery-template.js').Item[]} */
const ITEMS = [
  {
    id: 'cards',
    title: 'Cards',
    category: 'containers',
    summary: 'A card groups one subject: a title, a line of supporting text and an optional action.',
    components: [{ tag: 'md-outlined-card', summary: 'Low-emphasis container with a border.' }],
    variants: [
      {
        label: 'Basic',
        html: `<md-outlined-card class="gex-card">
  <h3>Weekly digest</h3>
  <p>Five new studies were added this week.</p>
</md-outlined-card>`,
        note: 'Keep one subject per card; split it when the card needs two headings.',
      },
      {
        label: 'With action',
        html: `<md-outlined-card class="gex-card">
  <h3>Storage almost full</h3>
  <p>You have used 92% of your space.</p>
  <md-text-button>Manage storage</md-text-button>
</md-outlined-card>`,
      },
    ],
  },
  {
    id: 'sheets',
    title: 'Sheets',
    category: 'containers',
    summary: 'A sheet is a large, flat surface that holds a whole section of a page.',
    variants: [
      {
        label: 'Tonal',
        html: `<div class="gex-sheet">
  <h3>Account</h3>
  <p>Name, email and sign-in methods.</p>
</div>`,
      },
    ],
  },
  {
    id: 'callouts',
    title: 'Callouts',
    category: 'feedback',
    summary: 'A callout puts one important sentence in front of the reader, inline with the content.',
    badge: 'New',
    variants: [
      {
        label: 'Info',
        html: `<p class="gex-callout">
  <md-icon>info</md-icon>
  Changes are saved automatically.
</p>`,
      },
      {
        label: 'Warning',
        html: `<p class="gex-callout gex-callout--warn">
  <md-icon>warning</md-icon>
  This link expires in 24 hours.
</p>`,
        note: 'Reserve the warning tone for things the reader can still act on.',
      },
    ],
  },
  {
    id: 'stat-tiles',
    title: 'Stat tiles',
    category: 'feedback',
    summary: 'A stat tile shows one number with its label and how it changed.',
    variants: [
      {
        label: 'With change',
        html: `<div class="gex-stat">
  <span class="gex-stat__label">Active users</span>
  <strong class="gex-stat__value">12,480</strong>
  <span class="gex-stat__delta">+4.2% this week</span>
</div>`,
      },
    ],
  },
  {
    id: 'empty-states',
    title: 'Empty states',
    category: 'feedback',
    summary: 'An empty state explains why a surface has no content and offers the next step.',
    variants: [
      {
        label: 'With action',
        html: `<div class="gex-empty">
  <md-icon>inbox</md-icon>
  <h3>No messages yet</h3>
  <p>New messages will show up here.</p>
  <md-filled-tonal-button>Start a conversation</md-filled-tonal-button>
</div>`,
      },
    ],
  },
];

/** A composition: a real layout built from the items, mixed into the Gallery view. */
const overviewCard = () => `
  <md-outlined-card class="gal__card">
    <h2 class="gal__card-title">This week</h2>
    <p class="gal__card-sub">Cards, stat tiles and a callout, composed.</p>
    <div class="gex-stat-row">
      <div class="gex-stat"><span class="gex-stat__label">Studies</span><strong class="gex-stat__value">31</strong></div>
      <div class="gex-stat"><span class="gex-stat__label">Stories</span><strong class="gex-stat__value">118</strong></div>
    </div>
    <p class="gex-callout"><md-icon>info</md-icon>Three studies are still drafts.</p>
  </md-outlined-card>`;

/** @type {import('./gallery-template.js').GalleryConfig} */
export const EXAMPLE_GALLERY = {
  name: 'Gallery Template',
  className: 'm3-scope',
  noun: { one: 'surface', many: 'surfaces' },
  categories: CATEGORIES,
  items: ITEMS,
  // Relative to iframe.html, so they work under the /studies/ Pages base too.
  itemHref: (id) => `./?path=/story/foundations-surface-gallery-template-items--${id}`,
  viewHref: (view) => `./?path=/story/foundations-surface-gallery-template--gallery&args=view:${view}`,
  hero: {
    gallery: {
      title: 'A template for galleries',
      body: 'Define categories, items and variants in one config; the template builds the Gallery, Index, Categories and a page per item.',
      actions: [
        { label: 'Browse the index', view: 'index' },
        { label: 'View by category', view: 'categories' },
      ],
    },
    categories: {
      title: 'Categories',
      body: 'The same cards, grouped under their category.',
    },
  },
  compositions: [overviewCard],
};
