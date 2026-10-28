import './communication.css';

export default [
  {
    id: 'badges',
    title: 'Badges',
    category: 'communication',
    labs: true,
    summary:
      'Badges show a notification dot or a short count on top of an icon, such as unread messages. Leave value empty for a small dot, or set it for a large badge with a number.',
    docs: 'https://m3.material.io/components/badges/overview',
    components: [
      { tag: 'md-badge', summary: 'A small dot or a count, positioned on its nearest positioned ancestor.' },
    ],
    variants: [
      {
        label: 'On an icon',
        html: `<div class="mcat-communication-row">
  <span class="mcat-communication-anchor">
    <md-icon>mail</md-icon>
    <md-badge value="3"></md-badge>
  </span>
  <span class="mcat-communication-anchor">
    <md-icon>notifications</md-icon>
    <md-badge></md-badge>
  </span>
  <span class="mcat-communication-anchor">
    <md-icon>chat</md-icon>
    <md-badge value="999+"></md-badge>
  </span>
</div>`,
        note: 'md-badge places itself at the top-right of the nearest positioned ancestor, so wrap the icon in an element with position: relative.',
      },
      {
        label: 'Small and large',
        html: `<div class="mcat-communication-row">
  <span class="mcat-communication-anchor mcat-communication-slot">
    <md-badge></md-badge>
  </span>
  <span class="mcat-communication-anchor mcat-communication-slot">
    <md-badge value="8"></md-badge>
  </span>
  <span class="mcat-communication-anchor mcat-communication-slot">
    <md-badge value="42"></md-badge>
  </span>
</div>`,
        note: 'With no value the badge is a 6px dot that only signals "something new"; any value switches to the large badge with a label.',
      },
      {
        label: 'On an icon button',
        html: `<span class="mcat-communication-anchor">
  <md-icon-button aria-label="Notifications, 5 new">
    <md-icon>notifications</md-icon>
  </md-icon-button>
  <md-badge value="5"></md-badge>
</span>`,
        note: 'A badge is not announced by screen readers, so include the count in the control’s aria-label.',
      },
    ],
    gallery: [0, 1],
  },
  {
    id: 'progress-indicators',
    title: 'Progress indicators',
    category: 'communication',
    summary:
      'Progress indicators show the status of an ongoing process such as loading or saving. Use a determinate value when progress is measurable and indeterminate when it is not.',
    docs: 'https://m3.material.io/components/progress-indicators/overview',
    components: [
      { tag: 'md-linear-progress', summary: 'A horizontal bar, with optional buffer, for page or section loading.' },
      { tag: 'md-circular-progress', summary: 'A compact spinner or ring for loading inside a component.' },
    ],
    variants: [
      {
        label: 'Linear',
        html: `<div class="mcat-communication-stack">
  <md-linear-progress value="0.6" aria-label="Upload progress"></md-linear-progress>
  <md-linear-progress indeterminate aria-label="Loading"></md-linear-progress>
</div>`,
        note: 'value runs from 0 to max (default 1); indeterminate animates continuously when the duration is unknown.',
      },
      {
        label: 'Circular',
        html: `<div class="mcat-communication-row">
  <md-circular-progress value="0.75" aria-label="Download progress"></md-circular-progress>
  <md-circular-progress indeterminate aria-label="Loading"></md-circular-progress>
</div>`,
        note: 'Use the circular indicator in compact spaces such as inside a card or next to a button label.',
      },
      {
        label: 'Buffer',
        html: `<div class="mcat-communication-stack">
  <md-linear-progress value="0.3" buffer="0.7" aria-label="Video buffering"></md-linear-progress>
</div>`,
        note: 'buffer shows a second, lighter track ahead of value, useful for streaming media that loads ahead of playback.',
      },
      {
        label: 'Four color',
        html: `<div class="mcat-communication-row">
  <md-circular-progress indeterminate four-color aria-label="Loading"></md-circular-progress>
  <div class="mcat-communication-grow">
    <md-linear-progress indeterminate four-color aria-label="Loading"></md-linear-progress>
  </div>
</div>`,
        note: 'four-color cycles the indeterminate animation through primary, secondary and tertiary color roles.',
      },
      {
        label: 'Custom max',
        html: `<div class="mcat-communication-stack">
  <md-linear-progress value="3" max="5" aria-label="Step 3 of 5"></md-linear-progress>
</div>`,
        note: 'Set max to measure in your own units, such as steps completed, instead of a 0 to 1 fraction.',
      },
    ],
    gallery: [0, 1],
  },
];
