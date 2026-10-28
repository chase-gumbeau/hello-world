import './foundations.css';

export default [
  {
    id: 'icons',
    title: 'Icons',
    category: 'foundations',
    summary:
      'md-icon renders a Material Symbols glyph from its ligature name, sized and colored to match the surrounding text. Components read icons from md-icon children, so this is the building block for every icon slot.',
    docs: 'https://m3.material.io/styles/icons/overview',
    components: [
      { tag: 'md-icon', summary: 'A font icon whose text content is the Material Symbols ligature name.' },
    ],
    variants: [
      {
        label: 'Ligature names',
        html: `<div class="mcat-foundations-row">
  <md-icon>home</md-icon>
  <md-icon>search</md-icon>
  <md-icon>favorite</md-icon>
  <md-icon>settings</md-icon>
  <md-icon>delete</md-icon>
  <md-icon>cloud_upload</md-icon>
</div>`,
        note: 'The text inside md-icon is the symbol name in snake_case, as listed on the Material Symbols site.',
      },
      {
        label: 'Sizes',
        html: `<div class="mcat-foundations-row">
  <md-icon style="--md-icon-size: 20px">star</md-icon>
  <md-icon>star</md-icon>
  <md-icon style="--md-icon-size: 40px">star</md-icon>
  <md-icon style="--md-icon-size: 48px">star</md-icon>
</div>`,
        note: '--md-icon-size sets the glyph size (24px by default); prefer 20, 24, 40 or 48px so the optical size stays crisp.',
      },
      {
        label: 'Filled',
        html: `<div class="mcat-foundations-row">
  <md-icon>favorite</md-icon>
  <md-icon style="font-variation-settings: 'FILL' 1">favorite</md-icon>
  <md-icon>bookmark</md-icon>
  <md-icon style="font-variation-settings: 'FILL' 1">bookmark</md-icon>
</div>`,
        note: "Material Symbols is a variable font, so font-variation-settings: 'FILL' 1 switches to the filled style, often used for a selected state.",
      },
      {
        label: 'Color',
        html: `<div class="mcat-foundations-row">
  <md-icon class="mcat-foundations-primary">check_circle</md-icon>
  <md-icon class="mcat-foundations-error">error</md-icon>
  <md-icon class="mcat-foundations-muted">info</md-icon>
</div>`,
        note: 'md-icon uses currentColor, so color it with a color-role token on the icon or any ancestor.',
      },
    ],
    gallery: [0, 2],
  },
  {
    id: 'ripple-and-focus',
    title: 'Ripple & focus ring',
    category: 'foundations',
    summary:
      'md-ripple and md-focus-ring add the Material pressed, hover and keyboard-focus states to any custom surface. Every interactive Material component already uses them internally.',
    docs: 'https://m3.material.io/foundations/interaction/states/overview',
    components: [
      { tag: 'md-ripple', summary: 'Hover and press state layer with the expanding ripple effect.' },
      { tag: 'md-focus-ring', summary: 'Keyboard focus indicator that appears on :focus-visible.' },
    ],
    variants: [
      {
        label: 'Custom surface',
        html: `<div class="mcat-foundations-row">
  <div class="mcat-foundations-tile" tabindex="0" role="button">
    <md-ripple></md-ripple>
    <md-focus-ring></md-focus-ring>
    Click or Tab here
  </div>
</div>`,
        note: 'Both attach to their parent element, so the parent must be focusable and position: relative; the ripple fills it and the ring outlines it.',
      },
      {
        label: 'Inward focus ring',
        html: `<div class="mcat-foundations-row">
  <div class="mcat-foundations-tile" tabindex="0" role="button">
    <md-ripple></md-ripple>
    <md-focus-ring inward></md-focus-ring>
    Inward ring
  </div>
</div>`,
        note: 'inward draws the ring inside the edges, for surfaces clipped by overflow or packed tightly against neighbors.',
      },
      {
        label: 'Ripple only',
        html: `<div class="mcat-foundations-row">
  <div class="mcat-foundations-tile mcat-foundations-tile-round" tabindex="0" role="button" aria-label="Ripple demo">
    <md-ripple></md-ripple>
    <md-icon>touch_app</md-icon>
  </div>
</div>`,
        note: 'The ripple inherits its parent’s border-radius, so a round parent gives a round state layer.',
      },
    ],
    gallery: [0, 1],
  },
  {
    id: 'elevation',
    title: 'Elevation',
    category: 'foundations',
    summary:
      'md-elevation draws the Material shadow for a surface at one of six levels. Use higher levels for surfaces that sit above others, like menus and dialogs.',
    docs: 'https://m3.material.io/styles/elevation/overview',
    components: [
      { tag: 'md-elevation', summary: 'Shadow layer for its parent, set with --md-elevation-level 0 to 5.' },
    ],
    variants: [
      {
        label: 'Levels 0–5',
        html: `<div class="mcat-foundations-row mcat-foundations-gap">
  <div class="mcat-foundations-box" style="--md-elevation-level: 0">
    <md-elevation></md-elevation>
    0
  </div>
  <div class="mcat-foundations-box" style="--md-elevation-level: 1">
    <md-elevation></md-elevation>
    1
  </div>
  <div class="mcat-foundations-box" style="--md-elevation-level: 2">
    <md-elevation></md-elevation>
    2
  </div>
  <div class="mcat-foundations-box" style="--md-elevation-level: 3">
    <md-elevation></md-elevation>
    3
  </div>
  <div class="mcat-foundations-box" style="--md-elevation-level: 4">
    <md-elevation></md-elevation>
    4
  </div>
  <div class="mcat-foundations-box" style="--md-elevation-level: 5">
    <md-elevation></md-elevation>
    5
  </div>
</div>`,
        note: 'md-elevation fills its parent, so give the parent position: relative and a border-radius; the shadow follows that shape.',
      },
      {
        label: 'Interactive lift',
        html: `<div class="mcat-foundations-row mcat-foundations-gap">
  <div class="mcat-foundations-box mcat-foundations-lift" tabindex="0">
    <md-elevation></md-elevation>
    Hover me
  </div>
</div>`,
        note: 'The level is a CSS custom property, so it can change on :hover or :focus and md-elevation animates the shadow between levels.',
      },
    ],
    gallery: [0, 1],
  },
  {
    id: 'type-scale',
    title: 'Type scale',
    category: 'foundations',
    summary:
      'The Material type scale has five roles (display, headline, title, body, label) in three sizes each. Apply them with the md-typescale-* classes, which read the --md-sys-typescale-* tokens.',
    docs: 'https://m3.material.io/styles/typography/type-scale-tokens',
    components: [
      {
        tag: '.md-typescale-*',
        summary: 'Utility classes from @material/web/typography, adopted on the document, such as md-typescale-title-medium.',
      },
    ],
    variants: [
      {
        label: 'Headline & title',
        html: `<div class="mcat-foundations-stack">
  <p class="md-typescale-headline-large">Headline large</p>
  <p class="md-typescale-headline-medium">Headline medium</p>
  <p class="md-typescale-headline-small">Headline small</p>
  <p class="md-typescale-title-large">Title large</p>
  <p class="md-typescale-title-medium">Title medium</p>
  <p class="md-typescale-title-small">Title small</p>
</div>`,
        note: 'Headlines suit short, high-emphasis text on small screens; titles label medium-emphasis regions such as card or dialog headers.',
      },
      {
        label: 'Body & label',
        html: `<div class="mcat-foundations-stack">
  <p class="md-typescale-body-large">Body large for long-form reading.</p>
  <p class="md-typescale-body-medium">Body medium, the default for most text.</p>
  <p class="md-typescale-body-small">Body small for captions and fine print.</p>
  <p class="md-typescale-label-large">Label large</p>
  <p class="md-typescale-label-medium">Label medium</p>
  <p class="md-typescale-label-small">Label small</p>
</div>`,
        note: 'Body styles are for running text; label styles are for text inside components, like buttons, chips and tabs.',
      },
      {
        label: 'Display',
        html: `<div class="mcat-foundations-stack">
  <p class="md-typescale-display-large">Aa 57</p>
  <p class="md-typescale-display-medium">Aa 45</p>
  <p class="md-typescale-display-small">Aa 36</p>
</div>`,
        note: 'Display is the largest role, reserved for short numerals or hero text on large screens.',
      },
    ],
    gallery: [0, 1],
  },
];
