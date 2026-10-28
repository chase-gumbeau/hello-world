/**
 * Material component catalog — every Material Web component (including labs),
 * grouped the way the Material 3 docs group them: category → family → components.
 *
 * The showcase (../material-showcase.js) renders this data three ways (Gallery,
 * Index, Categories), and ../MaterialComponents.stories.js gives each family its
 * own story page.
 *
 * @typedef {object} Variant
 * @property {string} label  Short name shown above the preview ("Disabled", "With icons").
 * @property {string} html   Markup for the live preview; also shown as the code sample.
 *   Write `{id}` wherever a document-unique id is needed (`id="menu-{id}"`,
 *   `anchor="menu-anchor-{id}"`, `data-open="menu-{id}"`): the shell replaces it
 *   per render, and strips `-{id}` in the code sample.
 *   A click on any element with `data-open="<element id>"` is wired by the shell:
 *   md-dialog → show(); elements with an `open` property (md-menu) → toggle `open`;
 *   elements with an `opened` property (navigation drawers) → toggle `opened`.
 * @property {string} [note]  One sentence of guidance shown under the preview on the
 *   family page (when to use it, or the attribute that makes it work).
 *
 * @typedef {object} Family
 * @property {string} id  kebab-case; must equal the kebab-cased export name in
 *   ../MaterialComponents.stories.js (CommonButtons → common-buttons).
 * @property {string} title
 * @property {string} category  One of the CATEGORIES ids.
 * @property {string} summary  One or two sentences: what it is and when to use it.
 * @property {boolean} [labs]  True for components imported from @material/web/labs.
 * @property {string} docs  m3.material.io guidelines URL for the family.
 * @property {{tag: string, summary: string}[]} components  Every custom element
 *   the family covers, with a one-line purpose.
 * @property {Variant[]} variants  Ordered from most to least common.
 * @property {number[]} [gallery]  Indices of the variants shown on Gallery and
 *   Categories cards. Defaults to [0, 1].
 */

import actions from './actions.js';
import communication from './communication.js';
import containment from './containment.js';
import navigation from './navigation.js';
import selection from './selection.js';
import textInputs from './text-inputs.js';
import foundations from './foundations.js';

export const CATEGORIES = [
  { id: 'actions', title: 'Actions', summary: 'Buttons people press to take an action.' },
  { id: 'communication', title: 'Communication', summary: 'Status, progress and counts.' },
  { id: 'containment', title: 'Containment', summary: 'Surfaces that hold and group content.' },
  { id: 'navigation', title: 'Navigation', summary: 'Moving between destinations and options.' },
  { id: 'selection', title: 'Selection', summary: 'Choosing values, options and states.' },
  { id: 'text-inputs', title: 'Text inputs', summary: 'Entering and editing text.' },
  { id: 'foundations', title: 'Foundations', summary: 'Icons, interaction states, elevation and type.' },
];

/** @type {Family[]} */
export const FAMILIES = [
  ...actions,
  ...communication,
  ...containment,
  ...navigation,
  ...selection,
  ...textInputs,
  ...foundations,
];

export const familyById = new Map(FAMILIES.map((f) => [f.id, f]));

export const familiesIn = (categoryId) => FAMILIES.filter((f) => f.category === categoryId);
