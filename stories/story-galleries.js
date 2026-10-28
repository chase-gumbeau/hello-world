/**
 * Story galleries — galleries of this Storybook's own work, built on the gallery
 * template (./gallery-template.js). Each card previews a story live and opens it.
 * Studies and Projects each have one, as the first story in their section.
 */

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
    items: items.map((item) => ({
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

/** A story, shrunk into a card: laid out at 4x, then scaled down (story-galleries.css). */
const preview = ({ title, story }) => `<div class="sg-preview">
  <iframe src="./iframe.html?id=${story}&viewMode=story" title="${title} preview" tabindex="-1"></iframe>
</div>`;

export const STUDIES_GALLERY = storyGallery({
  name: 'Studies',
  galleryStory: 'studies--gallery',
  noun: { one: 'study', many: 'studies' },
  // Sections of Studies, in sidebar order.
  categories: [
    { id: '3d', title: '3D', summary: 'Icons rendered as objects: clay, glass, extrusion and raymarching.' },
    { id: 'color', title: 'Color', summary: 'Palettes, contrast and color systems.' },
    { id: 'compositions', title: 'Compositions', summary: 'Layouts that bring several studies together.' },
    { id: 'motion', title: 'Motion', summary: 'Animated marks and gradients.' },
    { id: 'surfaces', title: 'Surfaces', summary: 'Full pages built for a reader, like daily briefs.' },
    { id: 'typography', title: 'Typography', summary: 'Type scales, pairings and specimens.' },
    { id: 'worlds', title: 'Worlds', summary: 'Explorable scenes and the places in them.' },
  ],
  items: [
    {
      id: '3d-icons',
      title: '3D Icons',
      category: '3d',
      summary: 'One icon set in five 3D treatments.',
      story: 'studies-3d-3d-icons--showcase',
    },
    {
      id: 'color',
      title: 'Color',
      category: 'color',
      summary: 'A placeholder for color studies to come.',
      story: 'studies-color--overview',
    },
    {
      id: 'compositions',
      title: 'Compositions',
      category: 'compositions',
      summary: 'A placeholder for compositions to come.',
      story: 'studies-compositions--overview',
    },
    {
      id: 'animation-mesh-gradient',
      title: 'Animation mesh gradient',
      category: 'motion',
      summary: 'Buttons lit by moving mesh gradients.',
      story: 'studies-motion-animation-mesh-gradient--showcase',
    },
    {
      id: 'atom-logo',
      title: 'Atom Logo',
      category: 'motion',
      summary: 'An animated atom mark, by day and by night.',
      story: 'studies-motion-atom-logo--animated',
    },
    {
      id: 'morning-brief',
      title: 'Morning Brief',
      category: 'surfaces',
      summary: 'A calm start-of-day summary page.',
      story: 'studies-surfaces-morning-brief--page',
    },
    {
      id: 'work-brief',
      title: 'Work Brief',
      category: 'surfaces',
      summary: 'A brief for each persona, from clinician to payor.',
      story: 'studies-surfaces-work-brief--page',
    },
    {
      id: 'typography',
      title: 'Typography',
      category: 'typography',
      summary: 'A placeholder for type studies to come.',
      story: 'studies-typography--overview',
    },
    {
      id: 'maplestory-world',
      title: 'MapleStory world',
      category: 'worlds',
      summary: 'A small world with landmarks and a quest log.',
      // The still version keeps the gallery from running a whole scene in a card.
      story: 'studies-worlds-maplestory-world--still-life',
    },
  ],
});

export const PROJECTS_GALLERY = storyGallery({
  name: 'Projects',
  galleryStory: 'projects--gallery',
  noun: { one: 'project', many: 'projects' },
  categories: [
    { id: 'displays', title: 'Displays', summary: 'Boards and screens that show things off.' },
    { id: 'photography', title: 'Photography', summary: 'Trips told as scrolling photo stories.' },
    { id: 'interfaces', title: 'Interfaces', summary: 'Whole applications, recreated and explored.' },
  ],
  items: [
    {
      id: 'solari-board',
      title: 'Solari Board',
      category: 'displays',
      summary: 'A split-flap departures board that flips to any message.',
      story: 'projects-solari-board--hello-world',
    },
    {
      id: 'ultrahand-sigil',
      title: 'Ultrahand Sigil',
      category: 'displays',
      summary: 'A Tidbyt LED display with a living seal, an eye that blinks, and color changes.',
      story: 'projects-tidbyt-ultrahand-sigil--seal',
    },
    {
      id: 'scrolls',
      title: 'Scrolls',
      category: 'photography',
      summary: 'Horizontal photo scrolls of trips, grouped by year.',
      story: 'projects-scrolls--home-left',
    },
    {
      id: 'windows-file-manager',
      title: 'Windows file manager',
      category: 'interfaces',
      summary: 'A retro Windows desktop, with a drive to browse and programs to open.',
      story: 'projects-windows-file-manager--desktop',
    },
  ],
});
