/**
 * Gallery template — a catalog laid out the shadcn/ui way, driven by one config.
 *
 * A centered top nav switches between three views of the catalog: Gallery (one
 * masonry of item cards, with optional compositions mixed in), Index (categories
 * → items in three columns, each linking to its story page) and Categories (the
 * cards grouped under headings). createGalleryPage() renders those per-item
 * story pages.
 *
 * To make a new gallery: define a GalleryConfig, render createGallery(config)
 * from one story, and give each item a story that renders
 * createGalleryPage(config, id). The Material Explorer (material-showcase.js)
 * and Foundations/Surface/Gallery Template (GalleryTemplate.stories.js) are the
 * two worked examples.
 *
 * @typedef {object} Variant
 * @property {string} label  Short name shown above the preview ("Disabled", "With icons").
 * @property {string} html   Markup for the live preview; also shown as the code sample.
 *   Write `{id}` wherever a document-unique id is needed (`id="menu-{id}"`,
 *   `data-open="menu-{id}"`): the shell replaces it per render, and strips
 *   `-{id}` in the code sample.
 *   A click on any element with `data-open="<element id>"` is wired by the shell:
 *   md-dialog → show(); elements with an `open` property (md-menu) → toggle `open`;
 *   elements with an `opened` property (navigation drawers) → toggle `opened`.
 * @property {string} [note]  One sentence of guidance shown under the preview on the
 *   item page.
 *
 * @typedef {object} Item
 * @property {string} id  kebab-case; must equal the kebab-cased export name of its
 *   story (CommonButtons → common-buttons), since itemHref() links by story id.
 * @property {string} title
 * @property {string} category  One of the config's category ids.
 * @property {string} summary  One or two sentences: what it is and when to use it.
 * @property {string} [badge]  Small pill after the title ("Labs", "Beta").
 * @property {string} [docs]  External guidelines URL, linked from the item page.
 * @property {{tag: string, summary: string}[]} [components]  Elements the item
 *   covers, listed on Index and in the item page's table.
 * @property {Variant[]} variants  Ordered from most to least common.
 * @property {number[]} [gallery]  Indices of the variants shown on Gallery and
 *   Categories cards. Defaults to [0, 1].
 *
 * @typedef {object} HeroCopy
 * @property {string} title
 * @property {string} body
 *
 * @typedef {object} GalleryConfig
 * @property {string} name  Gallery name: tablist label and first breadcrumb.
 * @property {string} [className]  Extra root classes, e.g. 'm3-scope'.
 * @property {{id: string, title: string, summary: string}[]} categories
 * @property {Item[]} items  In display order.
 * @property {(id: string) => string} itemHref  Story URL for an item page,
 *   relative to iframe.html (`./?path=/story/...`).
 * @property {(view: string) => string} viewHref  Story URL for the gallery on a view.
 * @property {{one: string, many: string}} [noun]  What an item is called
 *   ("family"/"families"). Defaults to item/items.
 * @property {{gallery: HeroCopy & {actions?: {label: string, view: string}[]},
 *   index?: HeroCopy, categories: HeroCopy}} hero  Copy above each view.
 *   Gallery actions jump to another view; the first is filled, the rest tonal.
 *   Leave out `index` for an Index view with no heading.
 * @property {string} [docsLabel]  Label for the item page's docs link.
 * @property {(() => string)[]} [compositions]  Extra masonry cards for the
 *   Gallery view, interleaved one per `compositionEvery` items.
 * @property {number} [compositionEvery]  Defaults to 4.
 * @property {(panel: HTMLElement) => void} [wireGallery]  Runs after each Gallery
 *   render, to wire up the compositions.
 */

const VIEWS = [
  { id: 'gallery', label: 'Gallery' },
  { id: 'index', label: 'Index' },
  { id: 'categories', label: 'Categories' },
];

let uidCounter = 0;
const uid = () => `g${(++uidCounter).toString(36)}`;

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

const badgeTag = (item) => (item.badge ? `<span class="gal__badge">${item.badge}</span>` : '');

const itemsIn = (config, categoryId) => config.items.filter((i) => i.category === categoryId);

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

/* ---------- Item cards ---------- */

function demoHtml(variant) {
  return `
    <div class="gal__demo">
      <p class="gal__demo-label">${variant.label}</p>
      <div class="gal__demo-body">${liveHtml(variant.html)}</div>
    </div>`;
}

/** One item as a shadcn-style card: title linking to its story page, then live previews. */
function itemCard(config, item) {
  const picks = (item.gallery ?? [0, 1]).map((i) => item.variants[i]).filter(Boolean);
  return `
    <md-outlined-card class="gal__card gal__item" data-item="${item.id}">
      <header class="gal__item-head">
        <a class="gal__item-title" href="${config.itemHref(item.id)}" target="_top">${item.title}</a>
        ${badgeTag(item)}
        <md-icon class="gal__item-go" aria-hidden="true">arrow_outward</md-icon>
      </header>
      ${picks.map(demoHtml).join('')}
    </md-outlined-card>`;
}

/* ---------- Views ---------- */

function heroHtml(config, view) {
  const { hero, items, categories } = config;
  const noun = config.noun ?? { one: 'item', many: 'items' };
  if (view === 'index') {
    if (!hero.index) return '';
    return `
      <header class="gal__hero gal__hero--compact">
        <h1>${hero.index.title}</h1>
        <p>${hero.index.body}</p>
      </header>`;
  }
  if (view === 'categories') {
    return `
      <header class="gal__hero gal__hero--compact">
        <h1>${hero.categories.title}</h1>
        <p>${hero.categories.body}</p>
        <nav class="gal__jump" aria-label="Jump to category">
          ${categories.map((c) => `<md-assist-chip label="${c.title}" href="#cat-${c.id}"></md-assist-chip>`).join('')}
        </nav>
      </header>`;
  }
  const counts = `${items.length} ${noun.many} · ${categories.length} categories`;
  const actions = (hero.gallery.actions ?? [])
    .map(({ label, view: to }, i) => {
      const tag = i === 0 ? 'md-filled-button' : 'md-filled-tonal-button';
      return `<${tag} data-view="${to}">${label}</${tag}>`;
    })
    .join('');
  return `
    <header class="gal__hero">
      <md-assist-chip label="${counts}" data-view="index">
        <md-icon slot="icon">arrow_forward</md-icon>
      </md-assist-chip>
      <h1>${hero.gallery.title}</h1>
      <p>${hero.gallery.body}</p>
      ${actions ? `<div class="gal__hero-actions">${actions}</div>` : ''}
    </header>`;
}

function galleryHtml(config) {
  // Interleave a composition after every few item cards so the masonry mixes
  // single-item demos with real layouts, like the shadcn homepage.
  const every = config.compositionEvery ?? 4;
  const items = [];
  const comps = [...(config.compositions ?? [])];
  config.items.forEach((item, i) => {
    if (i % every === 0 && comps.length) items.push(comps.shift()());
    items.push(itemCard(config, item));
  });
  items.push(...comps.map((c) => c()));
  return `<div class="gal__masonry">${items.join('')}</div>`;
}

function indexHtml(config) {
  const groups = config.categories.map((cat) => {
    const items = itemsIn(config, cat.id)
      .map(
        (item) => `
          <li>
            <a href="${config.itemHref(item.id)}" target="_top" data-item="${item.id}">${item.title}</a>${badgeTag(item)}
            ${
              item.components?.length
                ? `<ul class="gal__index-tags">
                    ${item.components.map((c) => `<li><code>${escapeHtml(c.tag)}</code></li>`).join('')}
                  </ul>`
                : ''
            }
          </li>`,
      )
      .join('');
    return `
      <section class="gal__index-group" aria-labelledby="idx-${cat.id}">
        <h2 id="idx-${cat.id}">${cat.title}</h2>
        <p>${cat.summary}</p>
        <ul class="gal__index-list">${items}</ul>
      </section>`;
  });
  return `<div class="gal__index">${groups.join('')}</div>`;
}

function categoriesHtml(config) {
  return config.categories
    .map(
      (cat) => `
        <section class="gal__section" id="cat-${cat.id}" aria-labelledby="sec-${cat.id}">
          <header class="gal__section-head">
            <h2 id="sec-${cat.id}">${cat.title}</h2>
            <p>${cat.summary}</p>
          </header>
          <div class="gal__masonry">${itemsIn(config, cat.id).map((i) => itemCard(config, i)).join('')}</div>
        </section>`,
    )
    .join('');
}

function renderView(config, root, view) {
  const panel = root.querySelector('.gal__panel');
  const body =
    view === 'index' ? indexHtml(config) : view === 'categories' ? categoriesHtml(config) : galleryHtml(config);
  panel.innerHTML = heroHtml(config, view) + body;
  panel.setAttribute('aria-labelledby', `tab-${view}`);
  root.querySelectorAll('.gal__tab').forEach((tab) => {
    const on = tab.dataset.view === view;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
  });
  if (view === 'gallery') config.wireGallery?.(panel);
}

/**
 * @param {GalleryConfig} config
 * @param {object} [opts]
 * @param {'gallery'|'index'|'categories'} [opts.view]
 */
export function createGallery(config, { view = 'gallery' } = {}) {
  const root = document.createElement('main');
  root.className = ['gal', config.className].filter(Boolean).join(' ');
  root.innerHTML = `
    <header class="gal__top">
      <div class="gal__tabs" role="tablist" aria-label="${config.name} views">
        ${VIEWS.map(
          (v) => `
            <button class="gal__tab" role="tab" id="tab-${v.id}" data-view="${v.id}" aria-controls="gal-panel">
              <md-ripple></md-ripple><md-focus-ring></md-focus-ring>${v.label}
            </button>`,
        ).join('')}
      </div>
    </header>
    <div class="gal__panel" id="gal-panel" role="tabpanel"></div>`;

  const tabs = [...root.querySelectorAll('.gal__tab')];
  root.querySelector('.gal__tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabs.indexOf(document.activeElement);
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    renderView(config, root, next.dataset.view);
  });

  // Tabs and in-page shortcuts (hero buttons, the count chip) share data-view.
  root.addEventListener('click', (e) => {
    const target = e.target.closest('[data-view]');
    if (!target || target.closest('.gal__item')) return;
    e.preventDefault();
    renderView(config, root, target.dataset.view);
    root.scrollIntoView({ block: 'start' });
  });

  wireOpeners(root);
  renderView(config, root, VIEWS.some((v) => v.id === view) ? view : 'gallery');
  return root;
}

/* ---------- Item story pages ---------- */

/**
 * A learning page for one item: its elements, then every variant with live preview and markup.
 * @param {GalleryConfig} config
 * @param {string} itemId
 */
export function createGalleryPage(config, itemId) {
  const { items } = config;
  const item = items.find((i) => i.id === itemId);
  const root = document.createElement('main');
  root.className = ['gal', 'gal--page', config.className].filter(Boolean).join(' ');
  if (!item) {
    root.textContent = `Unknown ${config.noun?.one ?? 'item'}: ${itemId}`;
    return root;
  }

  const category = config.categories.find((c) => c.id === item.category);
  const i = items.indexOf(item);
  const prev = items[i - 1];
  const next = items[i + 1];
  const pager = (other, dir) =>
    other
      ? `<a class="gal__pager-link gal__pager-link--${dir}" href="${config.itemHref(other.id)}" target="_top">
           <span>${dir === 'prev' ? 'Previous' : 'Next'}</span>${other.title}
         </a>`
      : '<span></span>';

  const components = item.components?.length
    ? `<table class="gal__api">
        <thead><tr><th scope="col">Element</th><th scope="col">Purpose</th></tr></thead>
        <tbody>
          ${item.components.map((c) => `<tr><td><code>${escapeHtml(c.tag)}</code></td><td>${c.summary}</td></tr>`).join('')}
        </tbody>
      </table>`
    : '';

  const docs = item.docs
    ? `<md-text-button href="${item.docs}" target="_blank">
        ${config.docsLabel ?? 'Guidelines'}<md-icon slot="icon">open_in_new</md-icon>
      </md-text-button>`
    : '';

  const variants = item.variants
    .map(
      (v) => `
        <section class="gal__variant">
          <h2>${v.label}</h2>
          <div class="gal__variant-preview">${liveHtml(v.html)}</div>
          ${v.note ? `<p class="gal__variant-note">${v.note}</p>` : ''}
          <pre class="gal__code"><code>${escapeHtml(codeHtml(v.html))}</code></pre>
        </section>`,
    )
    .join('');

  root.innerHTML = `
    <article class="gal__page">
      <nav class="gal__page-crumbs" aria-label="Breadcrumb">
        <a href="${config.viewHref('index')}" target="_top">${config.name}</a>
        <md-icon aria-hidden="true">chevron_right</md-icon>
        <a href="${config.viewHref('categories')}" target="_top">${category?.title ?? item.category}</a>
      </nav>
      <header class="gal__page-head">
        <h1>${item.title} ${badgeTag(item)}</h1>
        <p>${item.summary}</p>
        ${docs}
      </header>
      ${components}
      ${variants}
      <nav class="gal__pager" aria-label="Other ${config.noun?.many ?? 'items'}">${pager(prev, 'prev')}${pager(next, 'next')}</nav>
    </article>`;

  wireOpeners(root);
  return root;
}
