import './selection.css';

export default [
  {
    id: 'checkbox',
    title: 'Checkbox',
    category: 'selection',
    summary:
      'Checkboxes let people pick one or more items from a list, or turn a single option on or off. Use them when choices are independent of each other.',
    docs: 'https://m3.material.io/components/checkbox/overview',
    components: [
      { tag: 'md-checkbox', summary: 'A box that toggles between checked, unchecked and indeterminate.' },
    ],
    variants: [
      {
        label: 'Labelled',
        note: 'Wrap the checkbox in a <label> so clicking the text toggles it too; touch-target="wrapper" adds margin so the 48px touch area does not overlap neighbours.',
        html: `<div class="mcat-selection-group">
  <label class="mcat-selection-pair">
    <md-checkbox touch-target="wrapper" checked></md-checkbox>
    Email updates
  </label>
  <label class="mcat-selection-pair">
    <md-checkbox touch-target="wrapper"></md-checkbox>
    Text messages
  </label>
</div>`,
      },
      {
        label: 'States',
        note: 'indeterminate shows a dash for a parent whose children are partly checked; it is visual only and clears when the user clicks.',
        html: `<div class="mcat-selection-row">
  <md-checkbox aria-label="Unchecked"></md-checkbox>
  <md-checkbox aria-label="Checked" checked></md-checkbox>
  <md-checkbox aria-label="Indeterminate" indeterminate></md-checkbox>
</div>`,
      },
      {
        label: 'Disabled',
        note: 'disabled dims the checkbox and removes it from the tab order; it keeps its checked state.',
        html: `<div class="mcat-selection-row">
  <label class="mcat-selection-pair">
    <md-checkbox touch-target="wrapper" disabled></md-checkbox>
    Unavailable
  </label>
  <label class="mcat-selection-pair">
    <md-checkbox touch-target="wrapper" checked disabled></md-checkbox>
    Always on
  </label>
</div>`,
      },
      {
        label: 'With for/id',
        note: 'When the label cannot wrap the control, point <label for> at the checkbox id instead.',
        html: `<div class="mcat-selection-pair">
  <md-checkbox id="terms-{id}" touch-target="wrapper"></md-checkbox>
  <label for="terms-{id}">I accept the terms</label>
</div>`,
      },
    ],
    gallery: [0, 1],
  },

  {
    id: 'chips',
    title: 'Chips',
    category: 'selection',
    summary:
      'Chips are compact elements that suggest actions, filter content, represent entered items or offer replies. Group related chips in a chip set.',
    docs: 'https://m3.material.io/components/chips/overview',
    components: [
      { tag: 'md-chip-set', summary: 'Groups chips and manages arrow-key navigation between them.' },
      { tag: 'md-assist-chip', summary: 'Starts a smart or automated action related to the content.' },
      { tag: 'md-filter-chip', summary: 'Toggles a filter on or off, like a checkbox.' },
      { tag: 'md-input-chip', summary: 'Represents a piece of information the user entered, such as a contact.' },
      { tag: 'md-suggestion-chip', summary: 'Offers a dynamically generated suggestion, such as a reply.' },
    ],
    variants: [
      {
        label: 'Filter chips',
        note: 'selected marks a filter as active and shows a check mark; filter chips behave like checkboxes.',
        html: `<md-chip-set aria-label="Cuisine">
  <md-filter-chip label="Italian" selected></md-filter-chip>
  <md-filter-chip label="Thai"></md-filter-chip>
  <md-filter-chip label="Mexican"></md-filter-chip>
</md-chip-set>`,
      },
      {
        label: 'Assist chips',
        note: 'Put an md-icon in slot="icon" to show what the action does; href (with optional target) turns the chip into a link.',
        html: `<md-chip-set>
  <md-assist-chip label="Add to calendar">
    <md-icon slot="icon">event</md-icon>
  </md-assist-chip>
  <md-assist-chip label="Directions" href="https://m3.material.io/components/chips/overview" target="_blank">
    <md-icon slot="icon">directions</md-icon>
  </md-assist-chip>
</md-chip-set>`,
      },
      {
        label: 'Input chips',
        note: 'avatar renders the icon slot as a round 24px image; remove-only makes the whole chip a remove button.',
        html: `<md-chip-set aria-label="Recipients">
  <md-input-chip label="Ada Lovelace" avatar>
    <span slot="icon" class="mcat-selection-avatar">AL</span>
  </md-input-chip>
  <md-input-chip label="design.pdf">
    <md-icon slot="icon">description</md-icon>
  </md-input-chip>
  <md-input-chip label="Selected" selected></md-input-chip>
  <md-input-chip label="Remove only" remove-only></md-input-chip>
</md-chip-set>`,
      },
      {
        label: 'Suggestion chips',
        note: 'Suggestion chips offer quick replies or next steps generated from context.',
        html: `<md-chip-set>
  <md-suggestion-chip label="Sounds good"></md-suggestion-chip>
  <md-suggestion-chip label="See you then"></md-suggestion-chip>
  <md-suggestion-chip label="Can we move it?"></md-suggestion-chip>
</md-chip-set>`,
      },
      {
        label: 'Elevated',
        note: 'elevated adds a shadow instead of an outline; use it when chips sit on images or busy surfaces.',
        html: `<md-chip-set>
  <md-assist-chip label="Share" elevated>
    <md-icon slot="icon">share</md-icon>
  </md-assist-chip>
  <md-filter-chip label="Open now" elevated selected></md-filter-chip>
  <md-suggestion-chip label="Nearby" elevated></md-suggestion-chip>
</md-chip-set>`,
      },
      {
        label: 'Removable filters',
        note: 'removable adds a trailing remove icon so applied filters can be cleared in one tap.',
        html: `<md-chip-set aria-label="Applied filters">
  <md-filter-chip label="Under $20" removable selected></md-filter-chip>
  <md-filter-chip label="Free shipping" removable selected></md-filter-chip>
</md-chip-set>`,
      },
    ],
    gallery: [0, 1],
  },

  {
    id: 'radio-buttons',
    title: 'Radio buttons',
    category: 'selection',
    summary:
      'Radio buttons let people pick exactly one option from a set. Show all options at once when there are only a few.',
    docs: 'https://m3.material.io/components/radio-button/overview',
    components: [
      { tag: 'md-radio', summary: 'One option in a mutually exclusive group, grouped by name.' },
    ],
    variants: [
      {
        label: 'Group',
        note: 'Radios with the same name form one group; arrow keys move the selection within it.',
        html: `<fieldset class="mcat-selection-group">
  <legend>Size</legend>
  <label class="mcat-selection-pair">
    <md-radio name="size-{id}" value="small" touch-target="wrapper"></md-radio>
    Small
  </label>
  <label class="mcat-selection-pair">
    <md-radio name="size-{id}" value="medium" touch-target="wrapper" checked></md-radio>
    Medium
  </label>
  <label class="mcat-selection-pair">
    <md-radio name="size-{id}" value="large" touch-target="wrapper"></md-radio>
    Large
  </label>
</fieldset>`,
      },
      {
        label: 'Inline',
        note: 'A short horizontal group works for two or three brief options.',
        html: `<div class="mcat-selection-row" role="radiogroup" aria-label="Delivery">
  <label class="mcat-selection-pair">
    <md-radio name="delivery-{id}" value="standard" checked></md-radio>
    Standard
  </label>
  <label class="mcat-selection-pair">
    <md-radio name="delivery-{id}" value="express"></md-radio>
    Express
  </label>
</div>`,
      },
      {
        label: 'Disabled',
        note: 'disabled options stay visible so people can see what exists but is unavailable.',
        html: `<div class="mcat-selection-row" role="radiogroup" aria-label="Plan">
  <label class="mcat-selection-pair">
    <md-radio name="plan-{id}" value="basic" checked></md-radio>
    Basic
  </label>
  <label class="mcat-selection-pair">
    <md-radio name="plan-{id}" value="pro" disabled></md-radio>
    Pro (sold out)
  </label>
  <label class="mcat-selection-pair">
    <md-radio name="plan-{id}" value="legacy" checked disabled></md-radio>
    Legacy
  </label>
</div>`,
      },
    ],
    gallery: [0, 1],
  },

  {
    id: 'select',
    title: 'Select',
    category: 'selection',
    summary:
      'Selects show a menu of options and display the chosen one in a field. Use them for choosing one value from a longer list in forms.',
    docs: 'https://m3.material.io/components/menus/overview',
    components: [
      { tag: 'md-filled-select', summary: 'A select on a filled container, for higher emphasis.' },
      { tag: 'md-outlined-select', summary: 'A select with an outline, for lower emphasis and dense forms.' },
      { tag: 'md-select-option', summary: 'One option in a select menu, with a headline and optional icon.' },
    ],
    variants: [
      {
        label: 'Filled',
        note: 'menu-positioning="popover" renders the menu in the top layer so it is not clipped by overflow containers.',
        html: `<div class="mcat-selection-stack">
  <md-filled-select label="Fruit" menu-positioning="popover">
    <md-select-option value="apple" selected>
      <div slot="headline">Apple</div>
    </md-select-option>
    <md-select-option value="banana">
      <div slot="headline">Banana</div>
    </md-select-option>
    <md-select-option value="cherry">
      <div slot="headline">Cherry</div>
    </md-select-option>
  </md-filled-select>
</div>`,
      },
      {
        label: 'Outlined',
        note: 'supporting-text adds a hint below the field; outlined selects suit forms with many fields.',
        html: `<div class="mcat-selection-stack">
  <md-outlined-select label="Country" menu-positioning="popover" supporting-text="Used for shipping estimates">
    <md-select-option value="ca">
      <div slot="headline">Canada</div>
    </md-select-option>
    <md-select-option value="mx">
      <div slot="headline">Mexico</div>
    </md-select-option>
    <md-select-option value="us" selected>
      <div slot="headline">United States</div>
    </md-select-option>
  </md-outlined-select>
</div>`,
      },
      {
        label: 'Options with icons',
        note: 'Put an md-icon in an option\'s slot="start" to help people scan the list.',
        html: `<div class="mcat-selection-stack">
  <md-outlined-select label="Travel mode" menu-positioning="popover">
    <md-select-option value="drive" selected>
      <md-icon slot="start">directions_car</md-icon>
      <div slot="headline">Drive</div>
    </md-select-option>
    <md-select-option value="transit">
      <md-icon slot="start">directions_transit</md-icon>
      <div slot="headline">Transit</div>
    </md-select-option>
    <md-select-option value="walk">
      <md-icon slot="start">directions_walk</md-icon>
      <div slot="headline">Walk</div>
    </md-select-option>
  </md-outlined-select>
</div>`,
      },
      {
        label: 'Required with error',
        note: 'required adds an asterisk; error with error-text shows the problem in place of supporting text.',
        html: `<div class="mcat-selection-stack">
  <md-filled-select label="Department" menu-positioning="popover" required error error-text="Choose a department">
    <md-select-option value="design">
      <div slot="headline">Design</div>
    </md-select-option>
    <md-select-option value="engineering">
      <div slot="headline">Engineering</div>
    </md-select-option>
  </md-filled-select>
</div>`,
      },
      {
        label: 'Disabled',
        note: 'disabled shows the current value but prevents opening the menu.',
        html: `<div class="mcat-selection-stack">
  <md-outlined-select label="Region" menu-positioning="popover" disabled>
    <md-select-option value="west" selected>
      <div slot="headline">West</div>
    </md-select-option>
  </md-outlined-select>
</div>`,
      },
    ],
    gallery: [0, 1],
  },

  {
    id: 'sliders',
    title: 'Sliders',
    category: 'selection',
    summary:
      'Sliders let people choose a value or a range along a track. Use them for settings like volume or brightness where an approximate value is fine.',
    docs: 'https://m3.material.io/components/sliders/overview',
    components: [
      { tag: 'md-slider', summary: 'A track with one handle, or two handles when range is set.' },
    ],
    variants: [
      {
        label: 'Continuous',
        note: 'Give every slider an aria-label (or a visible label) so screen readers announce what it controls.',
        html: `<div class="mcat-selection-stack">
  <md-slider aria-label="Volume" value="40"></md-slider>
</div>`,
      },
      {
        label: 'Discrete with ticks',
        note: 'step snaps to fixed increments, ticks marks each stop, and labeled shows the value in a bubble while dragging.',
        html: `<div class="mcat-selection-stack">
  <md-slider aria-label="Rating" min="0" max="10" step="1" value="6" ticks labeled></md-slider>
</div>`,
      },
      {
        label: 'Range',
        note: 'range adds a second handle; set value-start and value-end, and aria-label-start / aria-label-end for each handle.',
        html: `<div class="mcat-selection-stack">
  <md-slider
    range
    labeled
    min="0"
    max="100"
    value-start="20"
    value-end="70"
    aria-label-start="Minimum price"
    aria-label-end="Maximum price"></md-slider>
</div>`,
      },
      {
        label: 'Disabled',
        note: 'disabled keeps the value visible but prevents changes.',
        html: `<div class="mcat-selection-stack">
  <md-slider aria-label="Brightness" value="60" disabled></md-slider>
</div>`,
      },
    ],
    gallery: [0, 1],
  },

  {
    id: 'switch',
    title: 'Switch',
    category: 'selection',
    summary:
      'Switches turn a single setting on or off and take effect immediately. Use a checkbox instead when the change is saved later with a form.',
    docs: 'https://m3.material.io/components/switch/overview',
    components: [
      { tag: 'md-switch', summary: 'A toggle for one on/off setting.' },
    ],
    variants: [
      {
        label: 'Labelled',
        note: 'selected turns the switch on; wrap it in a <label> so the setting name is clickable and announced.',
        html: `<div class="mcat-selection-stack">
  <label class="mcat-selection-pair mcat-selection-pair--between">
    Wi-Fi
    <md-switch selected></md-switch>
  </label>
  <label class="mcat-selection-pair mcat-selection-pair--between">
    Bluetooth
    <md-switch></md-switch>
  </label>
</div>`,
      },
      {
        label: 'With icons',
        note: 'icons shows a check when on and an x when off; show-only-selected-icon keeps just the check.',
        html: `<div class="mcat-selection-row">
  <label class="mcat-selection-pair">
    <md-switch icons selected></md-switch>
    Both icons
  </label>
  <label class="mcat-selection-pair">
    <md-switch icons show-only-selected-icon selected></md-switch>
    Selected icon only
  </label>
</div>`,
      },
      {
        label: 'Disabled',
        note: 'disabled shows a setting that cannot change right now, in either state.',
        html: `<div class="mcat-selection-row">
  <label class="mcat-selection-pair">
    <md-switch disabled></md-switch>
    Off
  </label>
  <label class="mcat-selection-pair">
    <md-switch selected disabled></md-switch>
    On
  </label>
</div>`,
      },
    ],
    gallery: [0, 1],
  },
];
