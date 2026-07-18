/**
 * Foundations — layout primitives for exploring spacing, columns, and page shells.
 */

function spacer(size, label) {
  return `
    <div style="display:flex;align-items:center;gap:12px;">
      <div
        style="
          width:${size}px;
          height:${size}px;
          border-radius:8px;
          background:var(--md-sys-color-primary-container);
          color:var(--md-sys-color-on-primary-container);
          flex-shrink:0;
        "
        aria-hidden="true"
      ></div>
      <div>
        <div class="md-typescale-title-small">${label}</div>
        <code class="md-typescale-label-small" style="opacity:0.7;">${size}px</code>
      </div>
    </div>
  `;
}

export default {
  title: 'Foundations/Layout',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

/** Material-ish spacing scale — calm reference for padding and gaps */
export const Spacing = {
  name: 'Spacing',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope m3-bg';
    el.style.padding = '32px';
    el.innerHTML = `
      <h1 class="md-typescale-headline-medium" style="margin:0 0 8px;">Spacing</h1>
      <p class="md-typescale-body-medium" style="margin:0 0 24px;color:var(--md-sys-color-on-surface-variant);max-width:560px;">
        A compact Material-style spacing ladder for padding, gaps, and insets.
        Prefer these steps over one-off pixel values.
      </p>
      <div class="m3-surface-container-low" style="border-radius:20px;padding:24px;display:grid;gap:16px;max-width:420px;">
        ${spacer(4, 'Tight')}
        ${spacer(8, 'Compact')}
        ${spacer(12, 'Default gap')}
        ${spacer(16, 'Comfortable')}
        ${spacer(24, 'Section')}
        ${spacer(32, 'Page inset')}
        ${spacer(48, 'Hero / large')}
      </div>
    `;
    return el;
  },
};

/** Responsive column grids for content regions */
export const Columns = {
  name: 'Columns',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope m3-bg';
    el.style.padding = '32px';
    el.innerHTML = `
      <h1 class="md-typescale-headline-medium" style="margin:0 0 8px;">Columns</h1>
      <p class="md-typescale-body-medium" style="margin:0 0 24px;color:var(--md-sys-color-on-surface-variant);max-width:640px;">
        Auto-fit column grids for cards and content blocks. Resize the canvas to see reflow.
      </p>

      <div class="md-typescale-title-small" style="margin:0 0 12px;">2-up · min 280px</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:28px;">
        <div class="m3-surface-container" style="border-radius:16px;padding:20px;min-height:88px;">
          <div class="md-typescale-title-small">Column A</div>
          <p class="md-typescale-body-small" style="margin:8px 0 0;color:var(--md-sys-color-on-surface-variant);">
            Primary content region.
          </p>
        </div>
        <div class="m3-surface-container" style="border-radius:16px;padding:20px;min-height:88px;">
          <div class="md-typescale-title-small">Column B</div>
          <p class="md-typescale-body-small" style="margin:8px 0 0;color:var(--md-sys-color-on-surface-variant);">
            Supporting content region.
          </p>
        </div>
      </div>

      <div class="md-typescale-title-small" style="margin:0 0 12px;">3-up · min 200px</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
        ${[1, 2, 3].map(
          (n) => `
          <div class="m3-surface-container-high" style="border-radius:12px;padding:16px;">
            <div class="md-typescale-label-large">Cell ${n}</div>
          </div>
        `,
        ).join('')}
      </div>
    `;
    return el;
  },
};

/** Simple page shell: rail + top bar + content */
export const PageShell = {
  name: 'Page shell',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope';
    el.style.display = 'grid';
    el.style.gridTemplateColumns = '72px 1fr';
    el.style.minHeight = '100vh';
    el.style.background = 'var(--md-sys-color-background)';

    el.innerHTML = `
      <aside class="m3-surface-container-low" style="display:flex;flex-direction:column;align-items:center;padding:12px 8px;gap:8px;border-right:1px solid var(--md-sys-color-outline-variant);">
        <md-icon-button aria-label="Home"><md-icon>home</md-icon></md-icon-button>
        <md-icon-button aria-label="Explore"><md-icon>explore</md-icon></md-icon-button>
        <md-icon-button aria-label="Settings"><md-icon>settings</md-icon></md-icon-button>
      </aside>
      <div style="display:flex;flex-direction:column;min-width:0;">
        <header class="m3-surface" style="display:flex;align-items:center;gap:8px;padding:8px 20px;border-bottom:1px solid var(--md-sys-color-outline-variant);">
          <div class="md-typescale-title-large" style="flex:1;">Page shell</div>
          <md-icon-button aria-label="Search"><md-icon>search</md-icon></md-icon-button>
        </header>
        <main style="padding:24px;display:grid;gap:16px;grid-template-columns:minmax(0,1fr) minmax(220px,320px);align-content:start;">
          <div class="m3-surface-container" style="border-radius:16px;padding:24px;">
            <div class="md-typescale-title-medium" style="margin-bottom:8px;">Main</div>
            <p class="md-typescale-body-medium" style="margin:0;color:var(--md-sys-color-on-surface-variant);max-width:480px;">
              Primary content sits in a fluid column. Use 24px page insets and 16px gaps between regions.
            </p>
          </div>
          <aside class="m3-surface-container-low" style="border-radius:16px;padding:20px;">
            <div class="md-typescale-title-small" style="margin-bottom:8px;">Aside</div>
            <p class="md-typescale-body-small" style="margin:0;color:var(--md-sys-color-on-surface-variant);">
              Narrow supporting pane · ~220–320px.
            </p>
          </aside>
        </main>
      </div>
    `;
    return el;
  },
};
