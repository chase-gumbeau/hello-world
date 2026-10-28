import './actions.css';

// Multicolor brand mark (the one place hard-coded colors are allowed).
const brandLogo = `<svg slot="icon" viewBox="0 0 36 36" aria-hidden="true">
      <path fill="#34A853" d="M16 16v14h4V20z"></path>
      <path fill="#4285F4" d="M30 16H20l-4 4h14z"></path>
      <path fill="#FBBC05" d="M6 16v4h10l4-4z"></path>
      <path fill="#EA4335" d="M20 16V6h-4v14z"></path>
    </svg>`;

export default [
  {
    id: 'common-buttons',
    title: 'Common buttons',
    category: 'actions',
    summary:
      'Buttons let people take an action with a single tap. Pick the style by emphasis: filled for the primary action, tonal or elevated for secondary ones, outlined and text for the least prominent.',
    docs: 'https://m3.material.io/components/buttons/overview',
    components: [
      { tag: 'md-filled-button', summary: 'Highest emphasis; the main action on a screen.' },
      { tag: 'md-filled-tonal-button', summary: 'Medium emphasis with a softer, secondary container.' },
      { tag: 'md-elevated-button', summary: 'Medium emphasis with a shadow, for buttons over busy surfaces.' },
      { tag: 'md-outlined-button', summary: 'Medium-low emphasis; important but not primary actions.' },
      { tag: 'md-text-button', summary: 'Lowest emphasis; inline or dialog actions.' },
    ],
    variants: [
      {
        label: 'Styles',
        html: `<div class="mcat-actions-row">
  <md-filled-button>Filled</md-filled-button>
  <md-filled-tonal-button>Tonal</md-filled-tonal-button>
  <md-elevated-button>Elevated</md-elevated-button>
  <md-outlined-button>Outlined</md-outlined-button>
  <md-text-button>Text</md-text-button>
</div>`,
        note: 'Use one filled button per view for the main action and lower-emphasis styles for everything else.',
      },
      {
        label: 'With icons',
        html: `<div class="mcat-actions-row">
  <md-filled-button>
    <md-icon slot="icon">add</md-icon>
    Create
  </md-filled-button>
  <md-outlined-button trailing-icon>
    Open
    <md-icon slot="icon">open_in_new</md-icon>
  </md-outlined-button>
  <md-text-button>
    <md-icon slot="icon">edit</md-icon>
    Edit
  </md-text-button>
</div>`,
        note: 'Put an md-icon in slot="icon" for a leading icon; add trailing-icon to move it after the label.',
      },
      {
        label: 'Disabled',
        html: `<div class="mcat-actions-row">
  <md-filled-button disabled>Filled</md-filled-button>
  <md-outlined-button disabled>Outlined</md-outlined-button>
  <md-text-button soft-disabled>Soft disabled</md-text-button>
</div>`,
        note: 'disabled removes the button from the tab order; soft-disabled keeps it focusable so a tooltip can explain why it is unavailable.',
      },
      {
        label: 'Link button',
        html: `<div class="mcat-actions-row">
  <md-filled-tonal-button href="https://m3.material.io/components/buttons/overview" target="_blank">
    <md-icon slot="icon">menu_book</md-icon>
    Read the guidelines
  </md-filled-tonal-button>
</div>`,
        note: 'Setting href renders a real anchor inside the button, so it navigates like a link and supports target and download.',
      },
    ],
    gallery: [0, 1],
  },
  {
    id: 'floating-action-buttons',
    title: 'Floating action buttons',
    category: 'actions',
    summary:
      'A floating action button (FAB) holds the single most important action on a screen. It comes in three sizes, an extended form with a label, and a branded version for a product logo.',
    docs: 'https://m3.material.io/components/floating-action-button/overview',
    components: [
      { tag: 'md-fab', summary: 'The primary action of a screen, with an icon and an optional label.' },
      { tag: 'md-branded-fab', summary: 'A FAB for a multicolor brand logo, shown on a surface container.' },
    ],
    variants: [
      {
        label: 'Sizes',
        html: `<div class="mcat-actions-row">
  <md-fab size="small" aria-label="Edit">
    <md-icon slot="icon">edit</md-icon>
  </md-fab>
  <md-fab aria-label="Edit">
    <md-icon slot="icon">edit</md-icon>
  </md-fab>
  <md-fab size="large" aria-label="Edit">
    <md-icon slot="icon">edit</md-icon>
  </md-fab>
</div>`,
        note: 'size is small, medium (the default) or large; use the large FAB when the action deserves extra prominence on big screens.',
      },
      {
        label: 'Extended',
        html: `<div class="mcat-actions-row">
  <md-fab label="Compose">
    <md-icon slot="icon">edit</md-icon>
  </md-fab>
  <md-fab variant="primary" label="New chat"></md-fab>
</div>`,
        note: 'Adding label turns it into an extended FAB; the icon is optional and the label serves as the accessible name.',
      },
      {
        label: 'Color variants',
        html: `<div class="mcat-actions-row">
  <md-fab variant="surface" aria-label="Add">
    <md-icon slot="icon">add</md-icon>
  </md-fab>
  <md-fab variant="primary" aria-label="Add">
    <md-icon slot="icon">add</md-icon>
  </md-fab>
  <md-fab variant="secondary" aria-label="Add">
    <md-icon slot="icon">add</md-icon>
  </md-fab>
  <md-fab variant="tertiary" aria-label="Add">
    <md-icon slot="icon">add</md-icon>
  </md-fab>
</div>`,
        note: 'variant picks the container color role: surface (default), primary, secondary or tertiary.',
      },
      {
        label: 'Lowered',
        html: `<div class="mcat-actions-surface">
  <md-fab lowered aria-label="Add">
    <md-icon slot="icon">add</md-icon>
  </md-fab>
  <md-fab lowered label="Reply">
    <md-icon slot="icon">reply</md-icon>
  </md-fab>
</div>`,
        note: 'lowered reduces the resting elevation, for FABs that sit on a colored or elevated surface.',
      },
      {
        label: 'Branded',
        html: `<div class="mcat-actions-row">
  <md-branded-fab aria-label="Create">
    ${brandLogo}
  </md-branded-fab>
  <md-branded-fab label="Create">
    ${brandLogo}
  </md-branded-fab>
</div>`,
        note: 'md-branded-fab keeps a neutral container so a multicolor logo in slot="icon" stays true to its colors; it supports medium and large sizes only.',
      },
    ],
    gallery: [0, 1],
  },
  {
    id: 'icon-buttons',
    title: 'Icon buttons',
    category: 'actions',
    summary:
      'Icon buttons perform a compact action with a single icon, such as favoriting or opening settings. Four styles cover low to high emphasis, and any of them can act as a toggle.',
    docs: 'https://m3.material.io/components/icon-buttons/overview',
    components: [
      { tag: 'md-icon-button', summary: 'Standard, lowest-emphasis icon button with no container.' },
      { tag: 'md-filled-icon-button', summary: 'Highest emphasis, with a filled primary container.' },
      { tag: 'md-filled-tonal-icon-button', summary: 'Medium emphasis, with a secondary tonal container.' },
      { tag: 'md-outlined-icon-button', summary: 'Medium-low emphasis, with an outline.' },
    ],
    variants: [
      {
        label: 'Styles',
        html: `<div class="mcat-actions-row">
  <md-icon-button aria-label="Settings">
    <md-icon>settings</md-icon>
  </md-icon-button>
  <md-filled-icon-button aria-label="Settings">
    <md-icon>settings</md-icon>
  </md-filled-icon-button>
  <md-filled-tonal-icon-button aria-label="Settings">
    <md-icon>settings</md-icon>
  </md-filled-tonal-icon-button>
  <md-outlined-icon-button aria-label="Settings">
    <md-icon>settings</md-icon>
  </md-outlined-icon-button>
</div>`,
        note: 'Icon-only buttons have no visible text, so always give them an aria-label.',
      },
      {
        label: 'Toggle',
        html: `<div class="mcat-actions-row">
  <md-icon-button toggle aria-label="Add to favorites" aria-label-selected="Remove from favorites">
    <md-icon>favorite_border</md-icon>
    <md-icon slot="selected">favorite</md-icon>
  </md-icon-button>
  <md-filled-icon-button toggle selected aria-label="Bookmark" aria-label-selected="Remove bookmark">
    <md-icon>bookmark_border</md-icon>
    <md-icon slot="selected">bookmark</md-icon>
  </md-filled-icon-button>
  <md-outlined-icon-button toggle aria-label="Mute" aria-label-selected="Unmute">
    <md-icon>volume_up</md-icon>
    <md-icon slot="selected">volume_off</md-icon>
  </md-outlined-icon-button>
</div>`,
        note: 'toggle makes a click flip selected; the icon in slot="selected" shows while selected, and aria-label-selected names that state.',
      },
      {
        label: 'Disabled',
        html: `<div class="mcat-actions-row">
  <md-icon-button disabled aria-label="Delete">
    <md-icon>delete</md-icon>
  </md-icon-button>
  <md-filled-icon-button disabled aria-label="Delete">
    <md-icon>delete</md-icon>
  </md-filled-icon-button>
  <md-filled-tonal-icon-button disabled aria-label="Delete">
    <md-icon>delete</md-icon>
  </md-filled-tonal-icon-button>
  <md-outlined-icon-button disabled aria-label="Delete">
    <md-icon>delete</md-icon>
  </md-outlined-icon-button>
</div>`,
        note: 'disabled dims the button and blocks interaction; use soft-disabled instead if it should stay focusable.',
      },
    ],
    gallery: [0, 1],
  },
  {
    id: 'segmented-buttons',
    title: 'Segmented buttons',
    category: 'actions',
    labs: true,
    summary:
      'Segmented buttons help people pick options, switch views or sort elements from a small set of two to five choices. A set allows one selection by default, or several with multiselect.',
    docs: 'https://m3.material.io/components/segmented-buttons/overview',
    components: [
      { tag: 'md-outlined-segmented-button-set', summary: 'Groups segments and manages single or multiple selection.' },
      { tag: 'md-outlined-segmented-button', summary: 'One option in the set, with a label and optional icon.' },
    ],
    variants: [
      {
        label: 'Single select',
        html: `<md-outlined-segmented-button-set aria-label="Time range">
  <md-outlined-segmented-button label="Day" selected></md-outlined-segmented-button>
  <md-outlined-segmented-button label="Week"></md-outlined-segmented-button>
  <md-outlined-segmented-button label="Month"></md-outlined-segmented-button>
</md-outlined-segmented-button-set>`,
        note: 'Without multiselect, choosing a segment deselects the others, like a radio group.',
      },
      {
        label: 'Multiselect',
        html: `<md-outlined-segmented-button-set multiselect aria-label="Text style">
  <md-outlined-segmented-button label="Bold" selected></md-outlined-segmented-button>
  <md-outlined-segmented-button label="Italic"></md-outlined-segmented-button>
  <md-outlined-segmented-button label="Underline" selected></md-outlined-segmented-button>
</md-outlined-segmented-button-set>`,
        note: 'multiselect lets each segment toggle on and off independently, like a group of checkboxes.',
      },
      {
        label: 'With icons',
        html: `<md-outlined-segmented-button-set aria-label="Travel mode">
  <md-outlined-segmented-button label="Walk" has-icon selected>
    <md-icon slot="icon">directions_walk</md-icon>
  </md-outlined-segmented-button>
  <md-outlined-segmented-button label="Bike" has-icon>
    <md-icon slot="icon">directions_bike</md-icon>
  </md-outlined-segmented-button>
  <md-outlined-segmented-button label="Drive" has-icon>
    <md-icon slot="icon">directions_car</md-icon>
  </md-outlined-segmented-button>
</md-outlined-segmented-button-set>`,
        note: 'Set has-icon and put an md-icon in slot="icon"; the checkmark replaces the icon while a segment is selected.',
      },
      {
        label: 'No checkmark',
        html: `<md-outlined-segmented-button-set aria-label="View">
  <md-outlined-segmented-button label="List" no-checkmark selected></md-outlined-segmented-button>
  <md-outlined-segmented-button label="Grid" no-checkmark></md-outlined-segmented-button>
</md-outlined-segmented-button-set>`,
        note: 'no-checkmark hides the selection check, leaving only the container color to show the selected segment.',
      },
      {
        label: 'Disabled segment',
        html: `<md-outlined-segmented-button-set aria-label="Size">
  <md-outlined-segmented-button label="Small" selected></md-outlined-segmented-button>
  <md-outlined-segmented-button label="Medium"></md-outlined-segmented-button>
  <md-outlined-segmented-button label="Large" disabled></md-outlined-segmented-button>
</md-outlined-segmented-button-set>`,
        note: 'disabled on a single segment marks that option as unavailable while the rest stay usable.',
      },
    ],
    gallery: [0, 2],
  },
];
