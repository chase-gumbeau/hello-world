function section(title, contentHtml) {
  return `
    <section style="margin-bottom: 32px;">
      <h3 class="md-typescale-title-medium" style="margin: 0 0 12px;">${title}</h3>
      ${contentHtml}
    </section>
  `;
}

function row(html) {
  return `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">${html}</div>`;
}

export default {
  title: 'Material/Catalog',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export const Buttons = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.innerHTML = section(
      'Buttons',
      row(`
        <md-filled-button>Filled</md-filled-button>
        <md-filled-tonal-button>Tonal</md-filled-tonal-button>
        <md-elevated-button>Elevated</md-elevated-button>
        <md-outlined-button>Outlined</md-outlined-button>
        <md-text-button>Text</md-text-button>
      `),
    );
    return el;
  },
};

export const IconButtons = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.innerHTML = section(
      'Icon buttons',
      row(`
        <md-icon-button aria-label="Favorite"><md-icon>favorite</md-icon></md-icon-button>
        <md-filled-icon-button aria-label="Add"><md-icon>add</md-icon></md-filled-icon-button>
        <md-filled-tonal-icon-button aria-label="Edit"><md-icon>edit</md-icon></md-filled-tonal-icon-button>
        <md-outlined-icon-button aria-label="Settings"><md-icon>settings</md-icon></md-outlined-icon-button>
      `),
    );
    return el;
  },
};

export const Fabs = {
  name: 'FABs',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.innerHTML = section(
      'Floating action buttons',
      row(`
        <md-fab aria-label="Add"><md-icon slot="icon">add</md-icon></md-fab>
        <md-fab variant="primary" aria-label="Edit"><md-icon slot="icon">edit</md-icon></md-fab>
        <md-fab variant="secondary" aria-label="Share"><md-icon slot="icon">share</md-icon></md-fab>
        <md-fab variant="tertiary" size="large" aria-label="Compose"><md-icon slot="icon">edit</md-icon></md-fab>
        <md-branded-fab label="Compose"><md-icon slot="icon">edit</md-icon></md-branded-fab>
      `),
    );
    return el;
  },
};

export const Chips = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.innerHTML = `
      ${section(
        'Assist chips',
        `<md-chip-set>
          <md-assist-chip label="Assist"><md-icon slot="icon">event</md-icon></md-assist-chip>
          <md-assist-chip label="Elevated" elevated></md-assist-chip>
        </md-chip-set>`,
      )}
      ${section(
        'Filter chips',
        `<md-chip-set>
          <md-filter-chip label="HTML"></md-filter-chip>
          <md-filter-chip label="CSS" selected></md-filter-chip>
          <md-filter-chip label="Material" selected></md-filter-chip>
        </md-chip-set>`,
      )}
      ${section(
        'Input chips',
        `<md-chip-set>
          <md-input-chip label="Alex"></md-input-chip>
          <md-input-chip label="Sam"></md-input-chip>
        </md-chip-set>`,
      )}
      ${section(
        'Suggestion chips',
        `<md-chip-set>
          <md-suggestion-chip label="Schedule"></md-suggestion-chip>
          <md-suggestion-chip label="Mark as done"></md-suggestion-chip>
        </md-chip-set>`,
      )}
    `;
    return el;
  },
};

export const FormControls = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.style.display = 'grid';
    el.style.gap = '20px';
    el.style.maxWidth = '420px';
    el.innerHTML = `
      <md-filled-text-field label="Filled text field" value="Hello"></md-filled-text-field>
      <md-outlined-text-field label="Outlined text field" placeholder="Type here"></md-outlined-text-field>
      <md-filled-select label="Filled select">
        <md-select-option value="a"><div slot="headline">Option A</div></md-select-option>
        <md-select-option value="b" selected><div slot="headline">Option B</div></md-select-option>
        <md-select-option value="c"><div slot="headline">Option C</div></md-select-option>
      </md-filled-select>
      <md-outlined-select label="Outlined select">
        <md-select-option value="1"><div slot="headline">One</div></md-select-option>
        <md-select-option value="2" selected><div slot="headline">Two</div></md-select-option>
      </md-outlined-select>
      <md-slider min="0" max="100" value="40" labeled></md-slider>
      <label style="display:flex;align-items:center;gap:8px;">
        <md-checkbox checked></md-checkbox>
        Checkbox
      </label>
      <div style="display:flex;gap:16px;align-items:center;">
        <label style="display:flex;align-items:center;gap:8px;"><md-radio name="r" value="1" checked></md-radio> One</label>
        <label style="display:flex;align-items:center;gap:8px;"><md-radio name="r" value="2"></md-radio> Two</label>
        <label style="display:flex;align-items:center;gap:8px;"><md-radio name="r" value="3"></md-radio> Three</label>
      </div>
      <label style="display:flex;align-items:center;gap:8px;">
        <md-switch selected></md-switch>
        Switch
      </label>
    `;
    return el;
  },
};

export const Progress = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.style.display = 'grid';
    el.style.gap = '24px';
    el.style.maxWidth = '360px';
    el.innerHTML = `
      <md-linear-progress value="0.4"></md-linear-progress>
      <md-linear-progress indeterminate></md-linear-progress>
      <div style="display:flex;gap:16px;">
        <md-circular-progress value="0.65"></md-circular-progress>
        <md-circular-progress indeterminate></md-circular-progress>
      </div>
    `;
    return el;
  },
};

export const Tabs = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.innerHTML = `
      ${section(
        'Primary tabs',
        `<md-tabs>
          <md-primary-tab>Tab 1</md-primary-tab>
          <md-primary-tab selected>Tab 2</md-primary-tab>
          <md-primary-tab>Tab 3</md-primary-tab>
        </md-tabs>`,
      )}
      ${section(
        'Secondary tabs',
        `<md-tabs>
          <md-secondary-tab selected>Overview</md-secondary-tab>
          <md-secondary-tab>Details</md-secondary-tab>
          <md-secondary-tab>Activity</md-secondary-tab>
        </md-tabs>`,
      )}
    `;
    return el;
  },
};

export const ListsMenus = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.style.display = 'grid';
    el.style.gap = '24px';
    el.style.maxWidth = '360px';
    el.innerHTML = `
      <md-list style="border:1px solid var(--md-sys-color-outline-variant);border-radius:12px;">
        <md-list-item>
          <md-icon slot="start">inbox</md-icon>
          <div slot="headline">Inbox</div>
          <div slot="supporting-text">3 unread messages</div>
        </md-list-item>
        <md-divider></md-divider>
        <md-list-item>
          <md-icon slot="start">send</md-icon>
          <div slot="headline">Sent</div>
        </md-list-item>
        <md-list-item>
          <md-icon slot="start">drafts</md-icon>
          <div slot="headline">Drafts</div>
          <md-icon slot="end">chevron_right</md-icon>
        </md-list-item>
      </md-list>
      <div>
        <md-filled-button id="menu-anchor">Open menu</md-filled-button>
        <md-menu id="demo-menu" anchor="menu-anchor">
          <md-menu-item><div slot="headline">Cut</div></md-menu-item>
          <md-menu-item><div slot="headline">Copy</div></md-menu-item>
          <md-menu-item><div slot="headline">Paste</div></md-menu-item>
        </md-menu>
      </div>
    `;
    const button = el.querySelector('#menu-anchor');
    const menu = el.querySelector('#demo-menu');
    button?.addEventListener('click', () => {
      menu.open = !menu.open;
    });
    return el;
  },
};

export const Dialog = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.innerHTML = `
      <md-filled-button id="open-catalog-dialog">Open dialog</md-filled-button>
      <md-dialog id="catalog-dialog">
        <div slot="headline">Confirm</div>
        <form slot="content" id="catalog-dialog-form" method="dialog">
          This is a Material dialog with actions.
        </form>
        <div slot="actions">
          <md-text-button form="catalog-dialog-form" value="cancel">Cancel</md-text-button>
          <md-text-button form="catalog-dialog-form" value="ok">OK</md-text-button>
        </div>
      </md-dialog>
    `;
    const dialog = el.querySelector('#catalog-dialog');
    el.querySelector('#open-catalog-dialog')?.addEventListener('click', () => dialog.show());
    return el;
  },
};

export const LabsCards = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.style.display = 'grid';
    el.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    el.style.gap = '16px';
    el.innerHTML = `
      <md-elevated-card style="padding:16px;">
        <div class="md-typescale-title-medium">Elevated card</div>
        <p class="md-typescale-body-medium" style="margin:8px 0 0;color:var(--md-sys-color-on-surface-variant);">
          Labs elevated card for content grouping.
        </p>
      </md-elevated-card>
      <md-filled-card style="padding:16px;">
        <div class="md-typescale-title-medium">Filled card</div>
        <p class="md-typescale-body-medium" style="margin:8px 0 0;color:var(--md-sys-color-on-surface-variant);">
          Labs filled card on surface-container tone.
        </p>
      </md-filled-card>
      <md-outlined-card style="padding:16px;">
        <div class="md-typescale-title-medium">Outlined card</div>
        <p class="md-typescale-body-medium" style="margin:8px 0 0;color:var(--md-sys-color-on-surface-variant);">
          Labs outlined card with border emphasis.
        </p>
      </md-outlined-card>
    `;
    return el;
  },
};

export const LabsNavigation = {
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.style.display = 'grid';
    el.style.gap = '32px';
    el.innerHTML = `
      ${section(
        'Navigation bar (mobile)',
        `<md-navigation-bar activeIndex="0" style="width:100%;max-width:420px;">
          <md-navigation-tab label="Home"><md-icon slot="active-icon">home</md-icon><md-icon slot="inactive-icon">home</md-icon></md-navigation-tab>
          <md-navigation-tab label="Browse"><md-icon slot="active-icon">search</md-icon><md-icon slot="inactive-icon">search</md-icon></md-navigation-tab>
          <md-navigation-tab label="Profile"><md-icon slot="active-icon">person</md-icon><md-icon slot="inactive-icon">person</md-icon></md-navigation-tab>
        </md-navigation-bar>`,
      )}
      ${section(
        'Segmented buttons',
        `<md-outlined-segmented-button-set>
          <md-outlined-segmented-button selected>Day</md-outlined-segmented-button>
          <md-outlined-segmented-button>Week</md-outlined-segmented-button>
          <md-outlined-segmented-button>Month</md-outlined-segmented-button>
        </md-outlined-segmented-button-set>`,
      )}
      ${section(
        'Badge',
        row(`
          <span style="position:relative;display:inline-flex;">
            <md-icon-button aria-label="Notifications"><md-icon>notifications</md-icon></md-icon-button>
            <md-badge value="3" style="position:absolute;top:4px;right:4px;"></md-badge>
          </span>
        `),
      )}
    `;
    return el;
  },
};

export const AllComponents = {
  name: 'All components',
  render: () => {
    const wrap = document.createElement('div');
    wrap.className = 'm3-scope m3-bg';
    wrap.style.padding = '24px';
    wrap.style.display = 'grid';
    wrap.style.gap = '8px';

    const parts = [
      Buttons.render(),
      IconButtons.render(),
      Fabs.render(),
      Chips.render(),
      FormControls.render(),
      Progress.render(),
      Tabs.render(),
      ListsMenus.render(),
      Dialog.render(),
      LabsCards.render(),
      LabsNavigation.render(),
    ];
    for (const part of parts) {
      wrap.append(part);
    }
    return wrap;
  },
};
