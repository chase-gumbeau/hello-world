/**
 * Canonical Material 3 surface roles and common layout shells.
 * Use these to explore elevation / container hierarchy for app layouts.
 */

function swatch(tokenClass, label, note = '') {
  return `
    <div class="${tokenClass}" style="border-radius:16px;padding:16px;min-height:96px;display:flex;flex-direction:column;justify-content:space-between;outline:1px solid color-mix(in srgb, var(--md-sys-color-outline) 24%, transparent);">
      <div>
        <div class="md-typescale-title-small">${label}</div>
        ${note ? `<div class="md-typescale-body-small" style="opacity:0.8;margin-top:4px;">${note}</div>` : ''}
      </div>
      <code class="md-typescale-label-small" style="opacity:0.7;">.${tokenClass}</code>
    </div>
  `;
}

export default {
  title: 'Material/Surfaces',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

/** Material 3 tonal surface ladder — the canonical container hierarchy */
export const SurfaceHierarchy = {
  name: 'Surface hierarchy',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope m3-bg';
    el.style.padding = '32px';
    el.innerHTML = `
      <h1 class="md-typescale-headline-medium" style="margin:0 0 8px;">Surface hierarchy</h1>
      <p class="md-typescale-body-medium" style="margin:0 0 24px;color:var(--md-sys-color-on-surface-variant);max-width:640px;">
        Material 3 uses tonal surface containers instead of heavy shadows.
        Nest lower → higher containers to create depth.
      </p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
        ${swatch('m3-bg', 'Background', 'App canvas')}
        ${swatch('m3-surface', 'Surface', 'Default sheets')}
        ${swatch('m3-surface-dim', 'Surface dim', 'Recessed areas')}
        ${swatch('m3-surface-bright', 'Surface bright', 'Emphasis')}
        ${swatch('m3-surface-container-lowest', 'Container lowest', 'Cards / sheets')}
        ${swatch('m3-surface-container-low', 'Container low', 'Nav / side panes')}
        ${swatch('m3-surface-container', 'Container', 'Default grouping')}
        ${swatch('m3-surface-container-high', 'Container high', 'Menus / chips')}
        ${swatch('m3-surface-container-highest', 'Container highest', 'Strongest lift')}
      </div>
    `;
    return el;
  },
};

/** Color roles that sit on surfaces */
export const ColorRoles = {
  name: 'Color roles',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope m3-bg';
    el.style.padding = '32px';
    el.innerHTML = `
      <h1 class="md-typescale-headline-medium" style="margin:0 0 8px;">Color roles</h1>
      <p class="md-typescale-body-medium" style="margin:0 0 24px;color:var(--md-sys-color-on-surface-variant);">
        Accent containers for branding, state, and emphasis on top of surfaces.
      </p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
        ${swatch('m3-primary', 'Primary')}
        ${swatch('m3-primary-container', 'Primary container')}
        ${swatch('m3-secondary-container', 'Secondary container')}
        ${swatch('m3-tertiary-container', 'Tertiary container')}
        ${swatch('m3-error-container', 'Error container')}
      </div>
    `;
    return el;
  },
};

/** Nested surfaces — how M3 recommends stacking containers */
export const NestedSurfaces = {
  name: 'Nested surfaces',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope m3-bg';
    el.style.minHeight = '100vh';
    el.style.padding = '32px';
    el.innerHTML = `
      <h1 class="md-typescale-headline-medium" style="margin:0 0 16px;">Nested surfaces</h1>
      <div class="m3-surface-container-low" style="border-radius:28px;padding:24px;max-width:720px;">
        <div class="md-typescale-title-medium" style="margin-bottom:12px;">surface-container-low</div>
        <div class="m3-surface-container" style="border-radius:20px;padding:20px;">
          <div class="md-typescale-title-small" style="margin-bottom:12px;">surface-container</div>
          <div class="m3-surface-container-highest" style="border-radius:16px;padding:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <div>
              <div class="md-typescale-title-small">surface-container-highest</div>
              <div class="md-typescale-body-small" style="color:var(--md-sys-color-on-surface-variant);">
                Content sits on the highest local surface.
              </div>
            </div>
            <md-filled-tonal-button>Action</md-filled-tonal-button>
          </div>
        </div>
      </div>
    `;
    return el;
  },
};

/** Desktop app shell: rail/drawer + top bar + content */
export const AppShellDesktop = {
  name: 'App shell (desktop)',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.style.display = 'grid';
    el.style.gridTemplateColumns = '280px 1fr';
    el.style.minHeight = '100vh';
    el.style.background = 'var(--md-sys-color-background)';

    el.innerHTML = `
      <aside class="m3-surface-container-low" style="padding:16px 12px;display:flex;flex-direction:column;gap:8px;">
        <div class="md-typescale-title-large" style="padding:12px 16px;">GitNewb</div>
        <md-list style="--md-list-container-color: transparent;">
          <md-list-item type="button">
            <md-icon slot="start">home</md-icon>
            <div slot="headline">Home</div>
          </md-list-item>
          <md-list-item type="button">
            <md-icon slot="start">dashboard</md-icon>
            <div slot="headline">Surfaces</div>
          </md-list-item>
          <md-list-item type="button">
            <md-icon slot="start">widgets</md-icon>
            <div slot="headline">Components</div>
          </md-list-item>
          <md-list-item type="button">
            <md-icon slot="start">settings</md-icon>
            <div slot="headline">Settings</div>
          </md-list-item>
        </md-list>
      </aside>
      <div style="display:flex;flex-direction:column;min-width:0;">
        <header class="m3-surface" style="display:flex;align-items:center;gap:8px;padding:8px 16px;border-bottom:1px solid var(--md-sys-color-outline-variant);">
          <div class="md-typescale-title-large" style="flex:1;">Explore layout</div>
          <md-icon-button aria-label="Search"><md-icon>search</md-icon></md-icon-button>
          <md-icon-button aria-label="Account"><md-icon>account_circle</md-icon></md-icon-button>
        </header>
        <main style="padding:24px;display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));align-content:start;">
          <md-elevated-card style="padding:20px;">
            <div class="md-typescale-title-medium">Elevated card</div>
            <p class="md-typescale-body-medium" style="color:var(--md-sys-color-on-surface-variant);">
              Primary content on the app canvas.
            </p>
            <md-filled-button style="margin-top:12px;">Open</md-filled-button>
          </md-elevated-card>
          <md-filled-card style="padding:20px;">
            <div class="md-typescale-title-medium">Filled card</div>
            <p class="md-typescale-body-medium" style="color:var(--md-sys-color-on-surface-variant);">
              Secondary grouping without elevation.
            </p>
          </md-filled-card>
          <md-outlined-card style="padding:20px;">
            <div class="md-typescale-title-medium">Outlined card</div>
            <p class="md-typescale-body-medium" style="color:var(--md-sys-color-on-surface-variant);">
              Quiet outline for dense layouts.
            </p>
          </md-outlined-card>
          <div class="m3-surface-container" style="border-radius:16px;padding:20px;grid-column:1 / -1;">
            <div class="md-typescale-title-medium" style="margin-bottom:12px;">Form on surface-container</div>
            <div style="display:grid;gap:12px;max-width:420px;">
              <md-outlined-text-field label="Project name" value="GitNewb"></md-outlined-text-field>
              <md-outlined-select label="Surface role">
                <md-select-option value="low" selected><div slot="headline">Container low</div></md-select-option>
                <md-select-option value="mid"><div slot="headline">Container</div></md-select-option>
                <md-select-option value="high"><div slot="headline">Container high</div></md-select-option>
              </md-outlined-select>
              <div style="display:flex;gap:8px;">
                <md-filled-button>Save</md-filled-button>
                <md-outlined-button>Cancel</md-outlined-button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
    return el;
  },
};

/** Mobile shell: top app bar + content + bottom nav */
export const AppShellMobile = {
  name: 'App shell (mobile)',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.style.maxWidth = '390px';
    el.style.margin = '0 auto';
    el.style.minHeight = '100vh';
    el.style.display = 'grid';
    el.style.gridTemplateRows = 'auto 1fr auto';
    el.style.background = 'var(--md-sys-color-background)';
    el.style.boxShadow = '0 0 0 1px var(--md-sys-color-outline-variant)';

    el.innerHTML = `
      <header class="m3-surface-container" style="display:flex;align-items:center;padding:8px 4px 8px 8px;gap:4px;">
        <md-icon-button aria-label="Menu"><md-icon>menu</md-icon></md-icon-button>
        <div class="md-typescale-title-large" style="flex:1;">GitNewb</div>
        <md-icon-button aria-label="More"><md-icon>more_vert</md-icon></md-icon-button>
      </header>
      <main style="padding:16px;overflow:auto;display:grid;gap:12px;align-content:start;">
        <div class="m3-primary-container" style="border-radius:16px;padding:20px;">
          <div class="md-typescale-title-medium">Hero surface</div>
          <p class="md-typescale-body-medium" style="margin:8px 0 0;">
            Primary container for featured content.
          </p>
        </div>
        <md-filled-card style="padding:16px;">
          <div class="md-typescale-title-small">Today</div>
          <p class="md-typescale-body-medium" style="color:var(--md-sys-color-on-surface-variant);margin:8px 0 0;">
            Filled card content on the mobile canvas.
          </p>
        </md-filled-card>
        <md-outlined-card style="padding:16px;">
          <div class="md-typescale-title-small">Tips</div>
          <p class="md-typescale-body-medium" style="color:var(--md-sys-color-on-surface-variant);margin:8px 0 0;">
            Outlined card for secondary info.
          </p>
        </md-outlined-card>
      </main>
      <md-navigation-bar activeIndex="0">
        <md-navigation-tab label="Home">
          <md-icon slot="active-icon">home</md-icon>
          <md-icon slot="inactive-icon">home</md-icon>
        </md-navigation-tab>
        <md-navigation-tab label="Search">
          <md-icon slot="active-icon">search</md-icon>
          <md-icon slot="inactive-icon">search</md-icon>
        </md-navigation-tab>
        <md-navigation-tab label="Profile">
          <md-icon slot="active-icon">person</md-icon>
          <md-icon slot="inactive-icon">person</md-icon>
        </md-navigation-tab>
      </md-navigation-bar>
      <md-fab aria-label="Add" style="position:fixed;right:calc(50% - 195px + 24px);bottom:88px;">
        <md-icon slot="icon">add</md-icon>
      </md-fab>
    `;
    return el;
  },
};

/** List-detail / supporting pane layout */
export const ListDetail = {
  name: 'List + detail',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.style.display = 'grid';
    el.style.gridTemplateColumns = 'minmax(260px, 360px) 1fr';
    el.style.minHeight = '100vh';
    el.style.background = 'var(--md-sys-color-background)';

    el.innerHTML = `
      <aside class="m3-surface-container-low" style="border-right:1px solid var(--md-sys-color-outline-variant);display:flex;flex-direction:column;">
        <div style="padding:16px 16px 8px;" class="md-typescale-title-large">Inbox</div>
        <md-list style="flex:1;">
          <md-list-item type="button">
            <div slot="headline">Welcome to Material</div>
            <div slot="supporting-text">Surface roles and layout shells</div>
          </md-list-item>
          <md-list-item type="button">
            <div slot="headline">Explore cards</div>
            <div slot="supporting-text">Elevated, filled, outlined</div>
          </md-list-item>
          <md-list-item type="button">
            <div slot="headline">Navigation patterns</div>
            <div slot="supporting-text">Drawer, bar, tabs</div>
          </md-list-item>
        </md-list>
      </aside>
      <section class="m3-surface" style="padding:32px;display:flex;flex-direction:column;gap:16px;">
        <div class="md-typescale-headline-small">Welcome to Material</div>
        <p class="md-typescale-body-large" style="color:var(--md-sys-color-on-surface-variant);max-width:560px;margin:0;">
          Detail panes usually sit on <strong>surface</strong>, while the list pane uses
          <strong>surface-container-low</strong> so the reading area feels lifted.
        </p>
        <div class="m3-surface-container" style="border-radius:16px;padding:16px;max-width:560px;">
          <div class="md-typescale-title-small" style="margin-bottom:8px;">Actions</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <md-assist-chip label="Archive"><md-icon slot="icon">archive</md-icon></md-assist-chip>
            <md-assist-chip label="Reply"><md-icon slot="icon">reply</md-icon></md-assist-chip>
            <md-filter-chip label="Starred" selected></md-filter-chip>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <md-filled-button>Reply</md-filled-button>
          <md-outlined-button>Forward</md-outlined-button>
        </div>
      </section>
    `;
    return el;
  },
};

/** Card gallery on a dim canvas — useful for comparing card types */
export const CardGallery = {
  name: 'Card gallery',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope m3-surface-dim';
    el.style.minHeight = '100vh';
    el.style.padding = '32px';
    el.innerHTML = `
      <h1 class="md-typescale-headline-medium" style="margin:0 0 8px;">Card gallery</h1>
      <p class="md-typescale-body-medium" style="margin:0 0 24px;color:var(--md-sys-color-on-surface-variant);">
        Cards on surface-dim — compare elevated, filled, and outlined labs cards.
      </p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">
        <md-elevated-card style="padding:20px;">
          <div class="md-typescale-title-medium">Elevated</div>
          <p class="md-typescale-body-medium" style="color:var(--md-sys-color-on-surface-variant);">
            Shadow + surface-container-lowest feel.
          </p>
          <md-text-button style="margin-top:8px;">Learn more</md-text-button>
        </md-elevated-card>
        <md-filled-card style="padding:20px;">
          <div class="md-typescale-title-medium">Filled</div>
          <p class="md-typescale-body-medium" style="color:var(--md-sys-color-on-surface-variant);">
            Tonal fill, no elevation required.
          </p>
          <md-text-button style="margin-top:8px;">Learn more</md-text-button>
        </md-filled-card>
        <md-outlined-card style="padding:20px;">
          <div class="md-typescale-title-medium">Outlined</div>
          <p class="md-typescale-body-medium" style="color:var(--md-sys-color-on-surface-variant);">
            Border-only separation from the canvas.
          </p>
          <md-text-button style="margin-top:8px;">Learn more</md-text-button>
        </md-outlined-card>
      </div>
    `;
    return el;
  },
};
