/**
 * Material Showcase — every Material Web component, laid out the shadcn/ui way.
 *
 * A centered top nav switches between three views of the catalog in
 * ./material-catalog: Gallery (one masonry of cards, with the shadcn homepage
 * compositions mixed in), Index (categories → families in three columns, each
 * linking to its story page) and Categories (the cards grouped under headings).
 * createFamilyPage() renders those per-family story pages.
 */

import { CATEGORIES, FAMILIES, familiesIn, familyById } from './material-catalog/index.js';

const VIEWS = [
  { id: 'gallery', label: 'Gallery' },
  { id: 'index', label: 'Index' },
  { id: 'categories', label: 'Categories' },
];

// Relative to iframe.html, so they work under the /studies/ Pages base too.
const familyHref = (id) => `./?path=/story/foundations-material-showcase-components--${id}`;
const viewHref = (view) =>
  `./?path=/story/foundations-material-showcase--material-explorer&args=view:${view}`;

let uidCounter = 0;
const uid = () => `m${(++uidCounter).toString(36)}`;

const escapeHtml = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

/** Strip blank edge lines and the common leading indent. */
function dedent(str) {
  const lines = str.replace(/^\s*\n|\n\s*$/g, '').split('\n');
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(indent)).join('\n');
}

/** Live markup: every `{id}` in one variant gets the same fresh, document-unique id. */
const liveHtml = (html) => {
  const id = uid();
  return html.replaceAll('{id}', id);
};

/** Code sample: `{id}` placeholders read as plain ids. */
const codeHtml = (html) => dedent(html.replaceAll('-{id}', '').replaceAll('{id}', 'example'));

const labsTag = (family) => (family.labs ? '<span class="msc__labs">Labs</span>' : '');

/** Wires `data-open="<id>"` triggers: dialogs show(), menus toggle open, drawers toggle opened. */
function wireOpeners(root) {
  const targetOf = (trigger) => root.querySelector(`#${CSS.escape(trigger.dataset.open)}`);
  // An open md-menu closes itself as soon as its anchor is pressed, so by the
  // time `click` fires it already reads closed. Remember its state at press time.
  const openAtPress = new WeakMap();
  root.addEventListener(
    'pointerdown',
    (e) => {
      const trigger = e.target.closest('[data-open]');
      const target = trigger && targetOf(trigger);
      if (target && 'open' in target) openAtPress.set(trigger, target.open);
    },
    true,
  );
  root.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open]');
    if (!trigger || !root.contains(trigger)) return;
    const target = targetOf(trigger);
    if (!target) return;
    if (target.localName === 'md-dialog') target.show();
    else if ('opened' in target) target.opened = !target.opened;
    else if ('open' in target) {
      const wasOpen = openAtPress.get(trigger) ?? target.open;
      openAtPress.delete(trigger);
      target.open = !wasOpen;
    }
  });
}

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      ['analytics', 'Analytics'],
      ['swap_horiz', 'Transactions'],
      ['monitoring', 'Investments'],
      ['account_balance', 'Accounts'],
      ['pie_chart', 'Spending'],
    ],
    current: 'Analytics',
  },
  {
    label: 'Planning',
    items: [
      ['description', 'Documents'],
      ['savings', 'Budget'],
      ['bar_chart', 'Reports'],
      ['flag', 'Goals'],
      ['calendar_month', 'Calendar'],
    ],
  },
  {
    label: 'Support',
    items: [
      ['help', 'Help Center'],
      ['menu_book', 'Docs'],
      ['chat', 'Contact Us'],
      ['monitor_heart', 'Status'],
      ['public', 'Community'],
    ],
  },
  {
    label: 'Account',
    items: [
      ['person', 'Profile'],
      ['credit_card', 'Billing'],
      ['notifications', 'Notifications'],
      ['shield', 'Security'],
      ['palette', 'Appearance'],
    ],
    current: 'Billing',
  },
];

const GOALS = [
  { kicker: 'Retirement', target: 420000, saved: 273000, tone: 'primary' },
  { kicker: 'Real estate', target: 85000, saved: 27200, tone: 'tertiary' },
];

const SETTINGS = [
  ['tune', 'Change transfer limit', 'Adjust how much you can send from your balance.'],
  ['event', 'Scheduled transfers', 'Set up a transfer to send at a later date.'],
  ['autorenew', 'Recurring card payments', 'Manage your repeated card transactions.'],
];

const DRAFT =
  "I'm building a chat for our app and the scroll behavior is driving me nuts. Every time the AI streams a reply, the whole thread jumps around.";

const usd = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** Decorative QR-style pattern: three finder squares plus seeded noise. */
function qrSvg(size = 25, seed = 42) {
  let s = seed;
  const rand = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const finder = (x, y) =>
    `<rect x="${x}" y="${y}" width="7" height="7"/>` +
    `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/>` +
    `<rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  const inFinder = (x, y) =>
    (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
  let cells = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inFinder(x, y) && rand() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" fill="#1d1b20" aria-hidden="true">
    ${finder(0, 0)}${finder(size - 7, 0)}${finder(0, size - 7)}${cells}
  </svg>`;
}

function controlsCard() {
  return `
    <md-outlined-card class="msc__card msc__controls" data-card="controls">
      <div class="msc__row">
        <md-filled-button trailing-icon>Button<md-icon slot="icon">arrow_forward</md-icon></md-filled-button>
        <md-filled-tonal-button>Secondary</md-filled-tonal-button>
        <md-outlined-button>Outline</md-outlined-button>
      </div>
      <md-outlined-text-field label="Name">
        <md-icon slot="trailing-icon">search</md-icon>
      </md-outlined-text-field>
      <md-filled-text-field label="Message" type="textarea" rows="2"></md-filled-text-field>
      <div class="msc__row msc__row--between">
        <md-chip-set>
          <md-filter-chip label="Badge" selected></md-filter-chip>
          <md-filter-chip label="Secondary"></md-filter-chip>
        </md-chip-set>
        <div class="msc__toggles">
          <md-radio name="msc-radio" aria-label="Option A" checked></md-radio>
          <md-radio name="msc-radio" aria-label="Option B"></md-radio>
          <md-checkbox aria-label="Accept" checked></md-checkbox>
          <md-switch aria-label="Notifications" selected icons></md-switch>
        </div>
      </div>
      <div class="msc__row msc__row--between">
        <md-outlined-button data-action="open-dialog">Alert Dialog</md-outlined-button>
        <div class="msc__split">
          <md-filled-tonal-button>Button Group</md-filled-tonal-button>
          <md-filled-tonal-icon-button aria-label="More options"><md-icon>expand_less</md-icon></md-filled-tonal-icon-button>
        </div>
      </div>
      <md-dialog data-dialog="alert">
        <div slot="headline">Are you absolutely sure?</div>
        <md-icon slot="icon">delete_outline</md-icon>
        <div slot="content">
          This action cannot be undone. This will permanently delete your account and remove your data from our servers.
        </div>
        <div slot="actions">
          <md-text-button data-close="cancel">Cancel</md-text-button>
          <md-filled-button data-close="confirm">Continue</md-filled-button>
        </div>
      </md-dialog>
    </md-outlined-card>`;
}

function navCard({ label, items, current }) {
  const list = items
    .map(
      ([icon, text]) => `
        <md-list-item type="button"${text === current ? ' data-current aria-current="page"' : ''}>
          <md-icon slot="start">${icon}</md-icon>${text}
        </md-list-item>`,
    )
    .join('');
  return `
    <md-outlined-card class="msc__card msc__nav">
      <nav aria-label="${label}">
        <p class="msc__nav-label">${label}</p>
        <md-list>${list}</md-list>
      </nav>
    </md-outlined-card>`;
}

function savingsCard() {
  const goals = GOALS.map(
    ({ kicker, target, saved, tone }) => {
      const pct = Math.round((saved / target) * 100);
      return `
        <md-filled-card class="msc__goal msc__goal--${tone}">
          <p class="msc__goal-kicker">${kicker}</p>
          <p class="msc__goal-amount">${usd(target)}</p>
          <md-linear-progress value="${saved / target}" aria-label="${kicker} progress"></md-linear-progress>
          <div class="msc__goal-meta"><span>${pct}% achieved</span><strong>${usd(saved)}</strong></div>
        </md-filled-card>`;
    },
  ).join('');
  return `
    <md-outlined-card class="msc__card">
      <h2 class="msc__card-title">Savings Targets</h2>
      <p class="msc__card-sub">Active milestones for 2024 across your portfolio. Monitor how close you are to each savings goal.</p>
      ${goals}
      <p class="msc__warn"><md-icon>error</md-icon>You have not met your targets for this year.</p>
    </md-outlined-card>`;
}

function qrCard() {
  return `
    <md-outlined-card class="msc__card msc__qr">
      <div class="msc__qr-code" role="img" aria-label="QR code to link your device">${qrSvg()}</div>
      <h2 class="msc__card-title">Scan to connect your mobile device</h2>
      <p class="msc__card-sub">Open the Ledger mobile app and scan this code to link your device.</p>
    </md-outlined-card>`;
}

function chatCard() {
  return `
    <md-outlined-card class="msc__card msc__chat" data-card="chat">
      <div class="msc__chat-head">
        <div>
          <h2 class="msc__card-title">New Chat</h2>
          <p class="msc__card-sub">How can I help you today?</p>
        </div>
        <md-outlined-icon-button aria-label="Reset chat" data-action="reset-chat"><md-icon>refresh</md-icon></md-outlined-icon-button>
      </div>
      <div class="msc__chat-body" role="log" aria-label="Conversation">
        <div class="msc__chat-empty">
          <div class="msc__chat-empty-icon"><md-icon>forum</md-icon></div>
          <h3 class="msc__card-title">Morning, Chase!</h3>
          <p class="msc__card-sub">What are we working on today? Press send to start a new conversation</p>
        </div>
      </div>
      <div class="msc__composer">
        <md-filled-text-field type="textarea" rows="2" aria-label="Message" value="${DRAFT}"></md-filled-text-field>
        <div class="msc__composer-actions">
          <md-icon-button aria-label="Add attachment"><md-icon>add</md-icon></md-icon-button>
          <md-filled-icon-button aria-label="Send" data-action="send"><md-icon>arrow_upward</md-icon></md-filled-icon-button>
        </div>
      </div>
    </md-outlined-card>`;
}

function settingsCard() {
  const items = SETTINGS.map(
    ([icon, title, sub]) => `
      <md-list-item type="button">
        <md-icon slot="start">${icon}</md-icon>
        <div slot="headline">${title}</div>
        <div slot="supporting-text">${sub}</div>
        <md-icon slot="end">chevron_right</md-icon>
      </md-list-item>`,
  ).join('');
  return `
    <md-outlined-card class="msc__card">
      <nav aria-label="Breadcrumb">
        <ol class="msc__crumbs">
          <li>Home <md-icon aria-hidden="true">chevron_right</md-icon></li>
          <li>Account options <md-icon aria-hidden="true">chevron_right</md-icon></li>
          <li aria-current="page">Payments</li>
        </ol>
      </nav>
      <md-list class="msc__settings">${items}</md-list>
    </md-outlined-card>`;
}

function wireChat(root) {
  const body = root.querySelector('.msc__chat-body');
  const empty = body.querySelector('.msc__chat-empty');
  const field = root.querySelector('.msc__composer md-filled-text-field');

  root.querySelector('[data-action="send"]').addEventListener('click', () => {
    const text = field.value.trim();
    if (!text) return;
    empty.hidden = true;
    const bubble = document.createElement('div');
    bubble.className = 'msc__bubble';
    bubble.textContent = text;
    body.append(bubble);
    field.value = '';
  });

  root.querySelector('[data-action="reset-chat"]').addEventListener('click', () => {
    body.querySelectorAll('.msc__bubble').forEach((b) => b.remove());
    empty.hidden = false;
    field.value = DRAFT;
  });
}

function wireNav(root) {
  root.querySelectorAll('.msc__nav md-list').forEach((list) => {
    list.addEventListener('click', (e) => {
      const item = e.target.closest('md-list-item');
      if (!item) return;
      list.querySelectorAll('[data-current]').forEach((el) => {
        el.removeAttribute('data-current');
        el.ariaCurrent = null;
      });
      item.setAttribute('data-current', '');
      item.ariaCurrent = 'page';
    });
  });
}

function wireCompositions(root) {
  const dialog = root.querySelector('[data-dialog="alert"]');
  root.querySelector('[data-action="open-dialog"]').addEventListener('click', () => dialog.show());
  dialog.querySelectorAll('[data-close]').forEach((btn) =>
    btn.addEventListener('click', () => dialog.close(btn.dataset.close)),
  );
  wireChat(root);
  wireNav(root);
}

/* ---------- Catalog cards ---------- */

function demoHtml(variant) {
  return `
    <div class="msc__demo">
      <p class="msc__demo-label">${variant.label}</p>
      <div class="msc__demo-body">${liveHtml(variant.html)}</div>
    </div>`;
}

/** One family as a shadcn-style card: title linking to its story page, then live previews. */
function familyCard(family) {
  const picks = (family.gallery ?? [0, 1]).map((i) => family.variants[i]).filter(Boolean);
  return `
    <md-outlined-card class="msc__card msc__family" data-family="${family.id}">
      <header class="msc__family-head">
        <a class="msc__family-title" href="${familyHref(family.id)}" target="_top">${family.title}</a>
        ${labsTag(family)}
        <md-icon class="msc__family-go" aria-hidden="true">arrow_outward</md-icon>
      </header>
      ${picks.map(demoHtml).join('')}
    </md-outlined-card>`;
}

/** The shadcn homepage compositions, as masonry items. */
const COMPOSITIONS = [
  controlsCard,
  chatCard,
  savingsCard,
  () => `<div class="msc__nav-grid">${NAV_GROUPS.map(navCard).join('')}</div>`,
  qrCard,
  settingsCard,
];

/* ---------- Views ---------- */

function heroHtml(view) {
  const counts = `${FAMILIES.length} families · ${CATEGORIES.length} categories`;
  if (view === 'index') {
    return `
      <header class="msc__hero msc__hero--compact">
        <h1>Index</h1>
        <p>Every Material Web component by category. Each family opens its own page with live variants and copyable markup.</p>
      </header>`;
  }
  if (view === 'categories') {
    return `
      <header class="msc__hero msc__hero--compact">
        <h1>Categories</h1>
        <p>The same cards, grouped the way the Material 3 guidelines group them.</p>
        <nav class="msc__jump" aria-label="Jump to category">
          ${CATEGORIES.map((c) => `<md-assist-chip label="${c.title}" href="#cat-${c.id}"></md-assist-chip>`).join('')}
        </nav>
      </header>`;
  }
  return `
    <header class="msc__hero">
      <md-assist-chip label="${counts}" data-view="index">
        <md-icon slot="icon">arrow_forward</md-icon>
      </md-assist-chip>
      <h1>The Foundation for your Design System</h1>
      <p>Every Material Web component, built on Material 3 tokens. Open any card to learn its variants, attributes and markup.</p>
      <div class="msc__hero-actions">
        <md-filled-button data-view="index">Browse the index</md-filled-button>
        <md-filled-tonal-button data-view="categories">View by category</md-filled-tonal-button>
      </div>
    </header>`;
}

function galleryHtml() {
  // Interleave a composition after every few family cards so the masonry mixes
  // single-component demos with real layouts, like the shadcn homepage.
  const items = [];
  const comps = [...COMPOSITIONS];
  FAMILIES.forEach((family, i) => {
    if (i % 4 === 0 && comps.length) items.push(comps.shift()());
    items.push(familyCard(family));
  });
  items.push(...comps.map((c) => c()));
  return `<div class="msc__masonry">${items.join('')}</div>`;
}

function indexHtml() {
  const groups = CATEGORIES.map((cat) => {
    const families = familiesIn(cat.id)
      .map(
        (f) => `
          <li>
            <a href="${familyHref(f.id)}" target="_top" data-family="${f.id}">${f.title}</a>${labsTag(f)}
            <ul class="msc__index-tags">
              ${f.components.map((c) => `<li><code>${escapeHtml(c.tag)}</code></li>`).join('')}
            </ul>
          </li>`,
      )
      .join('');
    return `
      <section class="msc__index-group" aria-labelledby="idx-${cat.id}">
        <h2 id="idx-${cat.id}">${cat.title}</h2>
        <p>${cat.summary}</p>
        <ul class="msc__index-list">${families}</ul>
      </section>`;
  });
  return `<div class="msc__index">${groups.join('')}</div>`;
}

function categoriesHtml() {
  return CATEGORIES.map(
    (cat) => `
      <section class="msc__section" id="cat-${cat.id}" aria-labelledby="sec-${cat.id}">
        <header class="msc__section-head">
          <h2 id="sec-${cat.id}">${cat.title}</h2>
          <p>${cat.summary}</p>
        </header>
        <div class="msc__masonry">${familiesIn(cat.id).map(familyCard).join('')}</div>
      </section>`,
  ).join('');
}

function renderView(root, view) {
  const panel = root.querySelector('.msc__panel');
  const body = view === 'index' ? indexHtml() : view === 'categories' ? categoriesHtml() : galleryHtml();
  panel.innerHTML = heroHtml(view) + body;
  panel.setAttribute('aria-labelledby', `tab-${view}`);
  root.querySelectorAll('.msc__tab').forEach((tab) => {
    const on = tab.dataset.view === view;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
  });
  if (view === 'gallery') wireCompositions(panel);
}

/**
 * @param {object} [opts]
 * @param {'gallery'|'index'|'categories'} [opts.view]
 */
export function createMaterialShowcase({ view = 'gallery' } = {}) {
  const root = document.createElement('main');
  root.className = 'msc m3-scope';
  root.innerHTML = `
    <header class="msc__top">
      <div class="msc__tabs" role="tablist" aria-label="Showcase views">
        ${VIEWS.map(
          (v) => `
            <button class="msc__tab" role="tab" id="tab-${v.id}" data-view="${v.id}" aria-controls="msc-panel">
              <md-ripple></md-ripple><md-focus-ring></md-focus-ring>${v.label}
            </button>`,
        ).join('')}
      </div>
    </header>
    <div class="msc__panel" id="msc-panel" role="tabpanel"></div>`;

  const tabs = [...root.querySelectorAll('.msc__tab')];
  root.querySelector('.msc__tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabs.indexOf(document.activeElement);
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    renderView(root, next.dataset.view);
  });

  // Tabs and in-page shortcuts (hero buttons, the count chip) share data-view.
  root.addEventListener('click', (e) => {
    const target = e.target.closest('[data-view]');
    if (!target || target.closest('.msc__family')) return;
    e.preventDefault();
    renderView(root, target.dataset.view);
    root.scrollIntoView({ block: 'start' });
  });

  wireOpeners(root);
  renderView(root, VIEWS.some((v) => v.id === view) ? view : 'gallery');
  return root;
}

/* ---------- Family story pages ---------- */

/** A learning page for one family: its elements, then every variant with live preview and markup. */
export function createFamilyPage(familyId) {
  const family = familyById.get(familyId);
  const root = document.createElement('main');
  root.className = 'msc msc--page m3-scope';
  if (!family) {
    root.textContent = `Unknown component family: ${familyId}`;
    return root;
  }

  const category = CATEGORIES.find((c) => c.id === family.category);
  const i = FAMILIES.indexOf(family);
  const prev = FAMILIES[i - 1];
  const next = FAMILIES[i + 1];
  const pager = (f, dir) =>
    f
      ? `<a class="msc__pager-link msc__pager-link--${dir}" href="${familyHref(f.id)}" target="_top">
           <span>${dir === 'prev' ? 'Previous' : 'Next'}</span>${f.title}
         </a>`
      : '<span></span>';

  const components = family.components
    .map((c) => `<tr><td><code>${escapeHtml(c.tag)}</code></td><td>${c.summary}</td></tr>`)
    .join('');

  const variants = family.variants
    .map(
      (v) => `
        <section class="msc__variant">
          <h2>${v.label}</h2>
          <div class="msc__variant-preview">${liveHtml(v.html)}</div>
          ${v.note ? `<p class="msc__variant-note">${v.note}</p>` : ''}
          <pre class="msc__code"><code>${escapeHtml(codeHtml(v.html))}</code></pre>
        </section>`,
    )
    .join('');

  root.innerHTML = `
    <article class="msc__page">
      <nav class="msc__page-crumbs" aria-label="Breadcrumb">
        <a href="${viewHref('index')}" target="_top">Material Showcase</a>
        <md-icon aria-hidden="true">chevron_right</md-icon>
        <a href="${viewHref('categories')}" target="_top">${category?.title ?? family.category}</a>
      </nav>
      <header class="msc__page-head">
        <h1>${family.title} ${labsTag(family)}</h1>
        <p>${family.summary}</p>
        <md-text-button href="${family.docs}" target="_blank">
          Material 3 guidelines<md-icon slot="icon">open_in_new</md-icon>
        </md-text-button>
      </header>
      <table class="msc__api">
        <thead><tr><th scope="col">Element</th><th scope="col">Purpose</th></tr></thead>
        <tbody>${components}</tbody>
      </table>
      ${variants}
      <nav class="msc__pager" aria-label="Other families">${pager(prev, 'prev')}${pager(next, 'next')}</nav>
    </article>`;

  wireOpeners(root);
  return root;
}
