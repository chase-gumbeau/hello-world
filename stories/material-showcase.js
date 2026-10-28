/**
 * Material Showcase — every Material Web component, laid out the shadcn/ui way.
 *
 * Built on the gallery template (./gallery-template.js): this file supplies the
 * catalog in ./material-catalog, the copy, and the shadcn homepage compositions
 * mixed into the Gallery view. createFamilyPage() renders the per-family story
 * pages.
 */

import { createGallery, createGalleryPage } from './gallery-template.js';
import { CATEGORIES, FAMILIES } from './material-catalog/index.js';

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
    <md-outlined-card class="gal__card msc__controls" data-card="controls">
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
    <md-outlined-card class="gal__card msc__nav">
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
    <md-outlined-card class="gal__card">
      <h2 class="gal__card-title">Savings Targets</h2>
      <p class="gal__card-sub">Active milestones for 2024 across your portfolio. Monitor how close you are to each savings goal.</p>
      ${goals}
      <p class="msc__warn"><md-icon>error</md-icon>You have not met your targets for this year.</p>
    </md-outlined-card>`;
}

function qrCard() {
  return `
    <md-outlined-card class="gal__card msc__qr">
      <div class="msc__qr-code" role="img" aria-label="QR code to link your device">${qrSvg()}</div>
      <h2 class="gal__card-title">Scan to connect your mobile device</h2>
      <p class="gal__card-sub">Open the Ledger mobile app and scan this code to link your device.</p>
    </md-outlined-card>`;
}

function chatCard() {
  return `
    <md-outlined-card class="gal__card msc__chat" data-card="chat">
      <div class="msc__chat-head">
        <div>
          <h2 class="gal__card-title">New Chat</h2>
          <p class="gal__card-sub">How can I help you today?</p>
        </div>
        <md-outlined-icon-button aria-label="Reset chat" data-action="reset-chat"><md-icon>refresh</md-icon></md-outlined-icon-button>
      </div>
      <div class="msc__chat-body" role="log" aria-label="Conversation">
        <div class="msc__chat-empty">
          <div class="msc__chat-empty-icon"><md-icon>forum</md-icon></div>
          <h3 class="gal__card-title">Morning, Chase!</h3>
          <p class="gal__card-sub">What are we working on today? Press send to start a new conversation</p>
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
    <md-outlined-card class="gal__card">
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

/** The shadcn homepage compositions, as masonry items. */
const COMPOSITIONS = [
  controlsCard,
  chatCard,
  savingsCard,
  () => `<div class="msc__nav-grid">${NAV_GROUPS.map(navCard).join('')}</div>`,
  qrCard,
  settingsCard,
];

/** @type {import('./gallery-template.js').GalleryConfig} */
const MATERIAL_GALLERY = {
  name: 'Material Showcase',
  className: 'm3-scope',
  noun: { one: 'family', many: 'families' },
  categories: CATEGORIES,
  items: FAMILIES.map((f) => ({ ...f, badge: f.labs ? 'Labs' : undefined })),
  // Relative to iframe.html, so they work under the /studies/ Pages base too.
  itemHref: (id) => `./?path=/story/foundations-material-showcase-components--${id}`,
  viewHref: (view) => `./?path=/story/foundations-material-showcase--material-explorer&args=view:${view}`,
  docsLabel: 'Material 3 guidelines',
  hero: {
    gallery: {
      title: 'The Foundation for your Design System',
      body: 'Every Material Web component, built on Material 3 tokens. Open any card to learn its variants, attributes and markup.',
      actions: [
        { label: 'Browse the index', view: 'index' },
        { label: 'View by category', view: 'categories' },
      ],
    },
    index: {
      title: 'Index',
      body: 'Every Material Web component by category. Each family opens its own page with live variants and copyable markup.',
    },
    categories: {
      title: 'Categories',
      body: 'The same cards, grouped the way the Material 3 guidelines group them.',
    },
  },
  compositions: COMPOSITIONS,
  wireGallery: wireCompositions,
};

/**
 * @param {object} [opts]
 * @param {'gallery'|'index'|'categories'} [opts.view]
 */
export const createMaterialShowcase = (opts) => createGallery(MATERIAL_GALLERY, opts);

/** The story page for one component family. */
export const createFamilyPage = (familyId) => createGalleryPage(MATERIAL_GALLERY, familyId);
