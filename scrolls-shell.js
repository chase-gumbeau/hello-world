import './scrolls.css';
import { mountScrolls } from './scrolls-mount.js';
import { mountFrameGlow } from './scrolls-frame-glow.js';

const SHELL_CHROME = `
  <div class="scrim" aria-hidden="true">
    <div class="scrim-hole"></div>
  </div>
  <div class="edge-fade edge-fade--left" aria-hidden="true"></div>
  <div class="edge-fade edge-fade--right" aria-hidden="true"></div>
  <div class="window-frame" aria-hidden="true"></div>
`;

/** Remove duplicated shell markup from imported Figma body HTML. */
export function stripScrollShell(html) {
  return html
    .replace(
      /\s*<div class="scrim" aria-hidden="true">\s*<div class="scrim-hole"><\/div>\s*<\/div>\s*/g,
      '\n'
    )
    .replace(/\s*<div class="edge-fade edge-fade--left" aria-hidden="true"><\/div>\s*/g, '\n')
    .replace(/\s*<div class="edge-fade edge-fade--right" aria-hidden="true"><\/div>\s*/g, '\n')
    .replace(/\s*<div class="window-frame" aria-hidden="true"><\/div>\s*/g, '\n');
}

/** Inject shared shell chrome as stage-level siblings after the canvas wrapper. */
function injectScrollShell(html) {
  return html.replace(
    /(<div\b[^>]*\bclass="[^"]*\bcanvas\b[^"]*"[^>]*>[\s\S]*<\/div>)(\s*)$/,
    (_, canvasBlock, trailing) => `${canvasBlock}${SHELL_CHROME}${trailing}`
  );
}

function rewriteAssetPaths(html) {
  const assetBase = import.meta.env.BASE_URL || '/';
  return html.replaceAll('./assets/', `${assetBase}assets/`);
}

/**
 * Build a horizontal scroll trip inside the shared stage/scrim/frame shell.
 *
 * @param {{ id?: string, bodyHtml: string, frameCount: number, embedded?: boolean }} options
 * @returns {HTMLElement}
 */
export function createScrollExperience({ id, bodyHtml, frameCount, embedded = false } = {}) {
  const root = document.createElement('div');
  root.className = 'scrolls-root';
  if (id) root.dataset.scrollId = id;
  if (embedded) root.classList.add('is-embedded');

  let content = stripScrollShell(bodyHtml);
  content = rewriteAssetPaths(content);
  if (!embedded) {
    content = injectScrollShell(content);
  }

  root.innerHTML = `
    <div class="stage" data-scrolls-stage>
      ${content}
    </div>
  `;

  mountScrolls(root, { frameCount });
  if (!embedded) {
    const stage = root.querySelector('[data-scrolls-stage]');
    const frame = root.querySelector('.window-frame');
    const glow = mountFrameGlow(stage || root, frame);
    frame?.classList.add('is-destination');
    const prevDispose = root._scrollsDispose;
    root._scrollsDispose = () => {
      glow.dispose();
      prevDispose?.();
    };
  }
  return root;
}
