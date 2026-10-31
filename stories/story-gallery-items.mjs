/**
 * What the Studies and Projects galleries show: their sections and items, each item
 * with the story its card previews and opens, and the files it's made of (git
 * pathspecs, read by scripts/story-updates.mjs to find when it last changed). Plain
 * data, so both Storybook (story-galleries.js) and the scripts can read it.
 */

export const STUDIES = {
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
      files: ['stories/Icons3D.stories.js', 'stories/icons-3d.*', 'stories/parachute-3d.js'],
      title: '3D Icons',
      category: '3d',
      summary: 'One icon set in five 3D treatments.',
      story: 'studies-3d-3d-icons--showcase',
    },
    {
      id: 'color',
      files: ['stories/StudiesColor.stories.js'],
      title: 'Color',
      category: 'color',
      summary: 'A placeholder for color studies to come.',
      story: 'studies-color--overview',
    },
    {
      id: 'compositions',
      files: ['stories/StudiesCompositions.stories.js'],
      title: 'Compositions',
      category: 'compositions',
      summary: 'A placeholder for compositions to come.',
      story: 'studies-compositions--overview',
    },
    {
      id: 'animation-mesh-gradient',
      files: ['stories/Android17Button.stories.js', 'stories/android-17-button.*'],
      title: 'Animation mesh gradient',
      category: 'motion',
      summary: 'Buttons lit by moving mesh gradients.',
      story: 'studies-motion-animation-mesh-gradient--showcase',
    },
    {
      id: 'ascii-sigil',
      files: ['stories/AsciiSigil.stories.js', 'stories/ascii-sigil.*'],
      title: 'ASCII Sigil',
      category: 'motion',
      summary: 'The Ultrahand seal in shimmering ASCII characters.',
      story: 'studies-motion-ascii-sigil--animated',
    },
    {
      id: 'ascii-atom',
      files: ['stories/AsciiAtom.stories.js', 'stories/ascii-atom.*'],
      title: 'ASCII Atom',
      category: 'motion',
      summary: 'The atom logo in characters: orbits draw on, electrons trail as they spin.',
      story: 'studies-motion-ascii-atom--animated',
    },
    {
      id: 'morning-brief',
      files: ['stories/MorningBrief.stories.js', 'stories/morning-brief.*'],
      title: 'Morning Brief',
      category: 'surfaces',
      summary: 'A calm start-of-day summary page.',
      story: 'studies-surfaces-morning-brief--page',
    },
    {
      id: 'work-brief',
      files: ['stories/WorkBrief.stories.js'],
      title: 'Work Brief',
      category: 'surfaces',
      summary: 'A brief for each persona, from clinician to payor.',
      story: 'studies-surfaces-work-brief--page',
    },
    {
      id: 'typography',
      files: ['stories/StudiesTypography.stories.js'],
      title: 'Typography',
      category: 'typography',
      summary: 'A placeholder for type studies to come.',
      story: 'studies-typography--overview',
    },
    {
      id: 'maplestory-world',
      files: ['stories/DesignOsWorld.stories.js', 'stories/design-os-world*'],
      title: 'MapleStory world',
      category: 'worlds',
      summary: 'A small world with landmarks and a quest log.',
      // The still version keeps the gallery from running a whole scene in a card.
      story: 'studies-worlds-maplestory-world--still-life',
    },
  ],
};

export const PROJECTS = {
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
      files: ['stories/SolariBoard.stories.js', 'stories/solari-board.*'],
      title: 'Solari Board',
      category: 'displays',
      summary: 'A split-flap departures board that flips to any message.',
      story: 'projects-solari-board--hello-world',
    },
    {
      id: 'ultrahand-sigil',
      files: ['stories/TidbytSigil.stories.js', 'stories/tidbyt-display.*', 'tidbyt/**'],
      title: 'Ultrahand Sigil',
      category: 'displays',
      summary: 'A Tidbyt LED display with a living seal, an eye that blinks, and color changes.',
      story: 'projects-tidbyt-ultrahand-sigil--seal',
    },
    {
      id: 'upcoming-games',
      files: ['stories/TidbytGames.stories.js', 'stories/tidbyt-games.js', 'tidbyt/games/**'],
      title: 'Upcoming Games',
      category: 'displays',
      summary: 'A Tidbyt ticker of the PS5 and Switch 2 games coming out in the next 30 days.',
      story: 'projects-tidbyt-upcoming-games--next-thirty-days',
    },
    {
      id: 'playstation',
      files: ['stories/TidbytPsn.stories.js', 'stories/tidbyt-psn.js', 'tidbyt/psn/**'],
      title: 'PlayStation',
      category: 'displays',
      summary: 'A Tidbyt app showing the game you played last and the latest trophy you earned.',
      story: 'projects-tidbyt-playstation--last-played-and-trophy',
    },
    {
      id: 'scrolls',
      files: ['stories/Scrolls*.stories.js', 'scrolls*', 'assets/scrolls*/**'],
      title: 'Scrolls',
      category: 'photography',
      summary: 'Horizontal photo scrolls of trips, grouped by year.',
      story: 'projects-scrolls--home-left',
    },
    {
      id: 'windows-file-manager',
      files: ['stories/DesignOsFiles.stories.js', 'stories/design-os-files.*'],
      title: 'Windows file manager',
      category: 'interfaces',
      summary: 'A retro Windows desktop, with a drive to browse and programs to open.',
      story: 'projects-windows-file-manager--desktop',
    },
  ],
};

/** Every item in either gallery. */
export const ALL_ITEMS = [...STUDIES.items, ...PROJECTS.items];

/** Every story a gallery card previews, for capturing their screenshots. */
export const PREVIEW_STORIES = ALL_ITEMS.map((item) => item.story);
