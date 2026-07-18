/**
 * Foundations — Material 3 tonal surface hierarchy from material-theme.css.
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
  title: 'Foundations/Surface',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

/** Material 3 tonal surface ladder — focused foundation reference */
export const Hierarchy = {
  name: 'Hierarchy',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope m3-bg';
    el.style.padding = '32px';
    el.innerHTML = `
      <h1 class="md-typescale-headline-medium" style="margin:0 0 8px;">Surface hierarchy</h1>
      <p class="md-typescale-body-medium" style="margin:0 0 24px;color:var(--md-sys-color-on-surface-variant);max-width:640px;">
        Material 3 builds depth with tonal surface containers instead of heavy shadows.
        Nest lower → higher containers to create calm separation.
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

/** Nested containers — how surfaces stack in a real layout */
export const Nested = {
  name: 'Nested',
  render: () => {
    const el = document.createElement('div');
    el.className = 'm3-scope m3-bg';
    el.style.minHeight = '100vh';
    el.style.padding = '32px';
    el.innerHTML = `
      <h1 class="md-typescale-headline-medium" style="margin:0 0 8px;">Nested surfaces</h1>
      <p class="md-typescale-body-medium" style="margin:0 0 24px;color:var(--md-sys-color-on-surface-variant);max-width:560px;">
        Stack containers from low → high so content feels lifted without elevation shadows.
      </p>
      <div class="m3-surface-container-low" style="border-radius:28px;padding:24px;max-width:640px;">
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
