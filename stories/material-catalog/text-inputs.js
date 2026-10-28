import './text-inputs.css';

export default [
  {
    id: 'text-fields',
    title: 'Text fields',
    category: 'text-inputs',
    summary:
      'Text fields let people enter and edit text in forms and dialogs. Filled fields have more emphasis; outlined fields suit forms with many fields.',
    docs: 'https://m3.material.io/components/text-fields/overview',
    components: [
      { tag: 'md-filled-text-field', summary: 'A text field on a filled container, for higher emphasis.' },
      { tag: 'md-outlined-text-field', summary: 'A text field with an outline, for lower emphasis.' },
    ],
    variants: [
      {
        label: 'Filled',
        note: 'label floats above the value once the field is focused or has text.',
        html: `<div class="mcat-text-inputs-stack">
  <md-filled-text-field label="First name" value="Ada"></md-filled-text-field>
</div>`,
      },
      {
        label: 'Outlined',
        note: 'supporting-text adds a persistent hint below the field.',
        html: `<div class="mcat-text-inputs-stack">
  <md-outlined-text-field label="Email" type="email" supporting-text="We never share your email"></md-outlined-text-field>
</div>`,
      },
      {
        label: 'With icons',
        note: 'Put an md-icon in slot="leading-icon" or slot="trailing-icon"; leading icons describe the field.',
        html: `<div class="mcat-text-inputs-stack">
  <md-outlined-text-field label="Search" type="search">
    <md-icon slot="leading-icon">search</md-icon>
  </md-outlined-text-field>
  <md-filled-text-field label="Event date" value="Oct 31">
    <md-icon slot="trailing-icon">event</md-icon>
  </md-filled-text-field>
</div>`,
      },
      {
        label: 'Prefix and suffix',
        note: 'prefix-text and suffix-text show fixed units or symbols that are not part of the value.',
        html: `<div class="mcat-text-inputs-stack">
  <md-outlined-text-field label="Price" type="number" prefix-text="$" value="25"></md-outlined-text-field>
  <md-filled-text-field label="Weight" type="number" suffix-text="kg" value="12"></md-filled-text-field>
</div>`,
      },
      {
        label: 'Error',
        note: 'error turns the field red and error-text replaces the supporting text with what went wrong.',
        html: `<div class="mcat-text-inputs-stack">
  <md-filled-text-field
    label="Username"
    value="ad"
    error
    error-text="Use at least 3 characters"></md-filled-text-field>
</div>`,
      },
      {
        label: 'Character counter',
        note: 'maxlength limits input and shows a live count under the field.',
        html: `<div class="mcat-text-inputs-stack">
  <md-outlined-text-field label="Display name" maxlength="20" value="Ada L."></md-outlined-text-field>
</div>`,
      },
      {
        label: 'Textarea',
        note: 'type="textarea" makes a multi-line field; rows sets its initial height.',
        html: `<div class="mcat-text-inputs-stack">
  <md-outlined-text-field label="Comments" type="textarea" rows="3"></md-outlined-text-field>
</div>`,
      },
      {
        label: 'Password',
        note: 'type="password" masks the value; pair it with a trailing icon button if people need to reveal it.',
        html: `<div class="mcat-text-inputs-stack">
  <md-filled-text-field label="Password" type="password" value="secret123"></md-filled-text-field>
</div>`,
      },
      {
        label: 'Disabled',
        note: 'disabled shows the value but blocks editing and focus.',
        html: `<div class="mcat-text-inputs-stack">
  <md-filled-text-field label="Account ID" value="A-1024" disabled></md-filled-text-field>
  <md-outlined-text-field label="Account ID" value="A-1024" disabled></md-outlined-text-field>
</div>`,
      },
    ],
    gallery: [0, 1],
  },

  {
    id: 'fields',
    title: 'Fields',
    category: 'text-inputs',
    summary:
      'Fields are the low-level filled and outlined containers that text fields and selects are built from. Use them only to wrap custom controls in matching Material chrome.',
    docs: 'https://m3.material.io/components/text-fields/overview',
    components: [
      { tag: 'md-filled-field', summary: 'A filled container with label, supporting text and states for custom content.' },
      { tag: 'md-outlined-field', summary: 'An outlined container with label, supporting text and states for custom content.' },
    ],
    variants: [
      {
        label: 'Filled and outlined',
        note: 'Most apps should use text fields or selects instead; fields have no input of their own, so you set populated yourself when there is content.',
        html: `<div class="mcat-text-inputs-stack">
  <md-filled-field label="Color" populated>
    <div class="mcat-text-inputs-value">Ocean blue</div>
  </md-filled-field>
  <md-outlined-field label="Color" populated>
    <div class="mcat-text-inputs-value">Ocean blue</div>
  </md-outlined-field>
</div>`,
      },
      {
        label: 'Empty vs populated',
        note: 'Without populated the label sits inside the container like a placeholder; with it the label floats.',
        html: `<div class="mcat-text-inputs-stack">
  <md-outlined-field label="Assignee"></md-outlined-field>
  <md-outlined-field label="Assignee" populated>
    <div class="mcat-text-inputs-value">Ada Lovelace</div>
  </md-outlined-field>
</div>`,
      },
      {
        label: 'Focused',
        note: 'focused draws the active indicator; your custom control must toggle it on focus and blur.',
        html: `<div class="mcat-text-inputs-stack">
  <md-filled-field label="Tag" populated focused>
    <div class="mcat-text-inputs-value">design-system</div>
  </md-filled-field>
</div>`,
      },
      {
        label: 'Supporting text and error',
        note: 'supporting-text adds a hint; error with error-text swaps it for an error message.',
        html: `<div class="mcat-text-inputs-stack">
  <md-outlined-field label="Team" populated supporting-text="Who owns this work">
    <div class="mcat-text-inputs-value">Platform</div>
  </md-outlined-field>
  <md-filled-field label="Team" populated error error-text="Team is no longer active">
    <div class="mcat-text-inputs-value">Legacy</div>
  </md-filled-field>
</div>`,
      },
      {
        label: 'Disabled',
        note: 'disabled dims the container, label and content together.',
        html: `<div class="mcat-text-inputs-stack">
  <md-outlined-field label="Owner" populated disabled>
    <div class="mcat-text-inputs-value">Ada Lovelace</div>
  </md-outlined-field>
</div>`,
      },
    ],
    gallery: [0, 1],
  },
];
