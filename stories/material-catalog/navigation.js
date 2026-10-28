import './navigation.css';

/** Template tag: strips the shared leading indentation so samples read cleanly. */
const markup = (strings, ...values) => {
  const lines = String.raw({ raw: strings }, ...values)
    .replace(/^\n/, '')
    .replace(/\s+$/, '')
    .split('\n');
  const indent = Math.min(
    ...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length),
  );
  return lines.map((l) => l.slice(indent)).join('\n');
};

export default [
  {
    id: 'navigation-bar',
    title: 'Navigation bar',
    category: 'navigation',
    labs: true,
    summary:
      'A navigation bar sits at the bottom of compact screens and switches between three to five top-level destinations.',
    docs: 'https://m3.material.io/components/navigation-bar/overview',
    components: [
      { tag: 'md-navigation-bar', summary: 'Bottom bar that tracks the active destination (labs).' },
      { tag: 'md-navigation-tab', summary: 'One destination in the bar, with an icon, label and optional badge (labs).' },
    ],
    variants: [
      {
        label: 'Bottom bar',
        note: 'active-index picks the selected tab; give each tab an active-icon (filled) and an inactive-icon (outlined).',
        html: markup`
          <div class="mcat-navigation-phone">
            <div class="mcat-navigation-screen">Home</div>
            <md-navigation-bar active-index="0">
              <md-navigation-tab label="Home">
                <md-icon slot="active-icon" class="mcat-navigation-filled">home</md-icon>
                <md-icon slot="inactive-icon">home</md-icon>
              </md-navigation-tab>
              <md-navigation-tab label="Explore">
                <md-icon slot="active-icon" class="mcat-navigation-filled">explore</md-icon>
                <md-icon slot="inactive-icon">explore</md-icon>
              </md-navigation-tab>
              <md-navigation-tab label="Saved">
                <md-icon slot="active-icon" class="mcat-navigation-filled">bookmark</md-icon>
                <md-icon slot="inactive-icon">bookmark</md-icon>
              </md-navigation-tab>
            </md-navigation-bar>
          </div>`,
      },
      {
        label: 'With badges',
        note: 'show-badge turns on a badge; badge-value puts a count in it, and leaving it empty shows a small dot.',
        html: markup`
          <div class="mcat-navigation-phone">
            <div class="mcat-navigation-screen">Mail</div>
            <md-navigation-bar active-index="0">
              <md-navigation-tab label="Mail" show-badge badge-value="3">
                <md-icon slot="active-icon" class="mcat-navigation-filled">mail</md-icon>
                <md-icon slot="inactive-icon">mail</md-icon>
              </md-navigation-tab>
              <md-navigation-tab label="Chat" show-badge>
                <md-icon slot="active-icon" class="mcat-navigation-filled">chat_bubble</md-icon>
                <md-icon slot="inactive-icon">chat_bubble</md-icon>
              </md-navigation-tab>
              <md-navigation-tab label="Meet">
                <md-icon slot="active-icon" class="mcat-navigation-filled">videocam</md-icon>
                <md-icon slot="inactive-icon">videocam</md-icon>
              </md-navigation-tab>
            </md-navigation-bar>
          </div>`,
      },
      {
        label: 'Hide inactive labels',
        note: 'hide-inactive-labels shows only the active tab label, which keeps four or five destinations calm.',
        html: markup`
          <div class="mcat-navigation-phone">
            <div class="mcat-navigation-screen">Music</div>
            <md-navigation-bar active-index="1" hide-inactive-labels>
              <md-navigation-tab label="Home">
                <md-icon slot="active-icon" class="mcat-navigation-filled">home</md-icon>
                <md-icon slot="inactive-icon">home</md-icon>
              </md-navigation-tab>
              <md-navigation-tab label="Music">
                <md-icon slot="active-icon" class="mcat-navigation-filled">music_note</md-icon>
                <md-icon slot="inactive-icon">music_note</md-icon>
              </md-navigation-tab>
              <md-navigation-tab label="Podcasts">
                <md-icon slot="active-icon" class="mcat-navigation-filled">podcasts</md-icon>
                <md-icon slot="inactive-icon">podcasts</md-icon>
              </md-navigation-tab>
              <md-navigation-tab label="Library">
                <md-icon slot="active-icon" class="mcat-navigation-filled">library_music</md-icon>
                <md-icon slot="inactive-icon">library_music</md-icon>
              </md-navigation-tab>
            </md-navigation-bar>
          </div>`,
      },
    ],
  },

  {
    id: 'navigation-drawer',
    title: 'Navigation drawer',
    category: 'navigation',
    labs: true,
    summary:
      'A navigation drawer lists destinations in a side panel. Use the standard drawer beside content on large screens and the modal drawer over content on small ones.',
    docs: 'https://m3.material.io/components/navigation-drawer/overview',
    components: [
      { tag: 'md-navigation-drawer', summary: 'Standard drawer that sits beside content and pushes it over when opened (labs).' },
      { tag: 'md-navigation-drawer-modal', summary: 'Modal drawer that slides over content with a scrim; Escape or a scrim click closes it (labs).' },
    ],
    variants: [
      {
        label: 'Standard',
        note: 'opened shows the drawer; it lays out beside the content, so place it in a row with the main area.',
        html: markup`
          <div class="mcat-navigation-frame">
            <md-navigation-drawer opened>
              <div class="mcat-navigation-drawer-content">
                <span class="md-typescale-title-small mcat-navigation-drawer-title">Mail</span>
                <md-list>
                  <md-list-item type="button" class="mcat-navigation-active">
                    <md-icon slot="start">inbox</md-icon>
                    <div slot="headline">Inbox</div>
                    <div slot="end">24</div>
                  </md-list-item>
                  <md-list-item type="button">
                    <md-icon slot="start">send</md-icon>
                    <div slot="headline">Sent</div>
                  </md-list-item>
                  <md-list-item type="button">
                    <md-icon slot="start">drafts</md-icon>
                    <div slot="headline">Drafts</div>
                  </md-list-item>
                </md-list>
              </div>
            </md-navigation-drawer>
            <div class="mcat-navigation-main">Inbox</div>
          </div>`,
      },
      {
        label: 'Modal',
        note: 'A data-open trigger toggles opened; the close button inside uses the same data-open, and Escape or a scrim click also closes it.',
        html: markup`
          <div class="mcat-navigation-frame mcat-navigation-frame-modal">
            <div class="mcat-navigation-main">
              <md-icon-button data-open="drawer-{id}" aria-label="Open navigation">
                <md-icon>menu</md-icon>
              </md-icon-button>
              <span>Inbox</span>
            </div>
            <md-navigation-drawer-modal id="drawer-{id}">
              <div class="mcat-navigation-drawer-content">
                <div class="mcat-navigation-drawer-header">
                  <span class="md-typescale-title-small">Mail</span>
                  <md-icon-button data-open="drawer-{id}" aria-label="Close navigation">
                    <md-icon>close</md-icon>
                  </md-icon-button>
                </div>
                <md-list>
                  <md-list-item type="button" class="mcat-navigation-active">
                    <md-icon slot="start">inbox</md-icon>
                    <div slot="headline">Inbox</div>
                  </md-list-item>
                  <md-list-item type="button">
                    <md-icon slot="start">star</md-icon>
                    <div slot="headline">Starred</div>
                  </md-list-item>
                  <md-list-item type="button">
                    <md-icon slot="start">send</md-icon>
                    <div slot="headline">Sent</div>
                  </md-list-item>
                </md-list>
              </div>
            </md-navigation-drawer-modal>
          </div>`,
      },
    ],
  },

  {
    id: 'tabs',
    title: 'Tabs',
    category: 'navigation',
    summary:
      'Tabs organize related content into views at the same level. Primary tabs sit under the top app bar; secondary tabs subdivide content within a view.',
    docs: 'https://m3.material.io/components/tabs/overview',
    components: [
      { tag: 'md-tabs', summary: 'Container that manages which tab is active and keyboard navigation.' },
      { tag: 'md-primary-tab', summary: 'Top-level tab with an optional icon and a short indicator under the content.' },
      { tag: 'md-secondary-tab', summary: 'Lower-level tab with a full-width indicator, for sub-sections.' },
    ],
    variants: [
      {
        label: 'Primary with icons',
        note: 'slot="icon" adds an icon stacked above the label; active marks the selected tab.',
        html: markup`
          <md-tabs aria-label="Travel" class="mcat-navigation-tabs">
            <md-primary-tab active>
              <md-icon slot="icon">flight</md-icon>
              Flights
            </md-primary-tab>
            <md-primary-tab>
              <md-icon slot="icon">luggage</md-icon>
              Trips
            </md-primary-tab>
            <md-primary-tab>
              <md-icon slot="icon">hotel</md-icon>
              Hotels
            </md-primary-tab>
          </md-tabs>`,
      },
      {
        label: 'Secondary',
        note: 'Use secondary tabs for a second level of navigation inside a primary view.',
        html: markup`
          <md-tabs aria-label="Product details" class="mcat-navigation-tabs">
            <md-secondary-tab active>Overview</md-secondary-tab>
            <md-secondary-tab>Specs</md-secondary-tab>
            <md-secondary-tab>Reviews</md-secondary-tab>
          </md-tabs>`,
      },
      {
        label: 'Inline icons',
        note: 'inline-icon puts the icon beside the label instead of above it, for a shorter tab bar.',
        html: markup`
          <md-tabs aria-label="Media" class="mcat-navigation-tabs">
            <md-primary-tab inline-icon active>
              <md-icon slot="icon">photo</md-icon>
              Photos
            </md-primary-tab>
            <md-primary-tab inline-icon>
              <md-icon slot="icon">movie</md-icon>
              Videos
            </md-primary-tab>
          </md-tabs>`,
      },
      {
        label: 'Text only',
        note: 'Labels alone work well when tab names are short and clear.',
        html: markup`
          <md-tabs aria-label="Account" class="mcat-navigation-tabs">
            <md-primary-tab active>Profile</md-primary-tab>
            <md-primary-tab>Security</md-primary-tab>
            <md-primary-tab>Billing</md-primary-tab>
          </md-tabs>`,
      },
    ],
  },

  {
    id: 'menus',
    title: 'Menus',
    category: 'navigation',
    summary:
      'Menus show a temporary list of choices anchored to the control that opened them. Use them for actions or options that do not need to be visible all the time.',
    docs: 'https://m3.material.io/components/menus/overview',
    components: [
      { tag: 'md-menu', summary: 'Popup list anchored to an element by id; open toggles it.' },
      { tag: 'md-menu-item', summary: 'One choice in a menu, with a headline and optional start/end icons.' },
      { tag: 'md-sub-menu', summary: 'Pairs a menu item with a nested menu that opens beside it.' },
    ],
    variants: [
      {
        label: 'Basic',
        note: 'anchor names the id of the opening button; positioning="popover" renders the menu in the top layer so containers never clip it.',
        html: markup`
          <span class="mcat-navigation-anchor">
            <md-outlined-button id="menu-anchor-{id}" data-open="menu-{id}" trailing-icon>
              Sort by
              <md-icon slot="icon">arrow_drop_down</md-icon>
            </md-outlined-button>
            <md-menu id="menu-{id}" anchor="menu-anchor-{id}" positioning="popover">
              <md-menu-item>
                <div slot="headline">Newest first</div>
              </md-menu-item>
              <md-menu-item>
                <div slot="headline">Oldest first</div>
              </md-menu-item>
              <md-menu-item>
                <div slot="headline">Name</div>
              </md-menu-item>
            </md-menu>
          </span>`,
      },
      {
        label: 'Icons and disabled',
        note: 'slot="start" and slot="end" add icons or shortcuts; disabled keeps an unavailable action visible but inert.',
        html: markup`
          <span class="mcat-navigation-anchor">
            <md-icon-button id="menu-anchor-{id}" data-open="menu-{id}" aria-label="More options">
              <md-icon>more_vert</md-icon>
            </md-icon-button>
            <md-menu id="menu-{id}" anchor="menu-anchor-{id}" positioning="popover">
              <md-menu-item>
                <md-icon slot="start">edit</md-icon>
                <div slot="headline">Rename</div>
              </md-menu-item>
              <md-menu-item>
                <md-icon slot="start">content_copy</md-icon>
                <div slot="headline">Duplicate</div>
                <span slot="end">⌘D</span>
              </md-menu-item>
              <md-menu-item disabled>
                <md-icon slot="start">archive</md-icon>
                <div slot="headline">Archive</div>
              </md-menu-item>
            </md-menu>
          </span>`,
      },
      {
        label: 'With a submenu',
        note: 'md-sub-menu pairs a menu item in slot="item" with a nested md-menu in slot="menu" that opens on hover or arrow key.',
        html: markup`
          <span class="mcat-navigation-anchor">
            <md-outlined-button id="menu-anchor-{id}" data-open="menu-{id}">File</md-outlined-button>
            <md-menu id="menu-{id}" anchor="menu-anchor-{id}" positioning="popover">
              <md-menu-item>
                <div slot="headline">New file</div>
              </md-menu-item>
              <md-sub-menu>
                <md-menu-item slot="item">
                  <div slot="headline">Export as</div>
                  <md-icon slot="end">arrow_right</md-icon>
                </md-menu-item>
                <md-menu slot="menu" positioning="popover">
                  <md-menu-item>
                    <div slot="headline">PDF</div>
                  </md-menu-item>
                  <md-menu-item>
                    <div slot="headline">PNG</div>
                  </md-menu-item>
                  <md-menu-item>
                    <div slot="headline">SVG</div>
                  </md-menu-item>
                </md-menu>
              </md-sub-menu>
              <md-menu-item>
                <div slot="headline">Print</div>
              </md-menu-item>
            </md-menu>
          </span>`,
      },
    ],
  },
];
