import './scrolls-app.css';
import { createScrollsHome } from './scrolls-home.js';
import { SCROLL_DESTINATIONS } from './scrolls-registry.js';

const DESIGN_W = 3842;
const DESIGN_H = 2160;
const TRANSITION_MS = 650;
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Factories for every destination the shell knows how to mount. */
const DESTINATIONS = {
  home: () => createScrollsHome({ embedded: true }),
  ...Object.fromEntries(
    Object.entries(SCROLL_DESTINATIONS).map(([id, mount]) => [
      id,
      () => mount({ embedded: true }),
    ])
  ),
};

/**
 * App shell that owns the single, stable centered frame/scrim "window" and
 * animates destinations underneath it — no Storybook `?path=` navigation.
 *
 * On `scrolls:navigate` (dispatched by e.g. `createScrollsHome()`'s city
 * links), the outgoing content pushes left + fades while the incoming
 * content slides up from beneath the scrim, fading in as it settles —
 * the frame border itself never moves.
 *
 * @returns {HTMLElement}
 */
export function createScrollsApp() {
  const root = document.createElement('div');
  root.className = 'scrolls-app';
  root.setAttribute('aria-label', 'Scrolls');

  root.innerHTML = `
    <div class="scrolls-app__stage">
      <div class="scrolls-app__canvas" data-scrolls-app-canvas>
        <div class="scrolls-app__layers" data-scrolls-app-layers></div>
      </div>
      <div class="scrolls-app__edge scrolls-app__edge--left" aria-hidden="true"></div>
      <div class="scrolls-app__edge scrolls-app__edge--right" aria-hidden="true"></div>
      <div class="scrolls-app__scrim" aria-hidden="true">
        <div class="scrolls-app__scrim-hole"></div>
      </div>
      <div class="scrolls-app__frame" aria-hidden="true"></div>
      <button
        class="scrolls-app__back"
        type="button"
        data-scrolls-app-back
        aria-label="Back to Scrolls home"
        hidden
      >Back</button>
    </div>
  `;

  const layers = root.querySelector('[data-scrolls-app-layers]');
  const backButton = root.querySelector('[data-scrolls-app-back]');

  /** @type {{ key: string, el: HTMLElement } | null} */
  let current = null;
  let animating = false;

  function fitStage() {
    const width = root.clientWidth || window.innerWidth;
    const height = root.clientHeight || window.innerHeight;
    const scale = Math.min(width / DESIGN_W, height / DESIGN_H);
    root.style.setProperty('--stage-scale', String(scale));
    // Survives nested home overwriting --stage-scale when embedded.
    root.style.setProperty('--app-stage-scale', String(scale));
  }

  const resizeObserver = new ResizeObserver(fitStage);
  resizeObserver.observe(root);
  fitStage();

  function mountLayer(key) {
    const factory = DESTINATIONS[key];
    if (!factory) return null;
    const layerEl = document.createElement('div');
    layerEl.className = 'scrolls-app__layer';
    layerEl.dataset.key = key;
    layerEl.appendChild(factory());
    return layerEl;
  }

  /**
   * @param {string} key
   * @param {{ direction?: 'forward' | 'back' }} [opts]
   */
  function navigate(key, { direction = 'forward' } = {}) {
    if (animating || !DESTINATIONS[key]) return;
    if (current && current.key === key) return;

    const nextLayer = mountLayer(key);
    if (!nextLayer) return;

    animating = true;

    const prevLayer = current ? current.el : null;
    const enterFromY = direction === 'forward' ? '7%' : '-7%';
    const exitToX = direction === 'forward' ? '-4%' : '4%';

    nextLayer.style.opacity = '0';
    layers.appendChild(nextLayer);

    const finished = [];

    if (prevLayer) {
      finished.push(
        prevLayer.animate(
          [
            { transform: 'translate3d(0, 0, 0)', opacity: 1 },
            { transform: `translate3d(${exitToX}, 0, 0)`, opacity: 0 },
          ],
          { duration: TRANSITION_MS, easing: EASING, fill: 'forwards' }
        ).finished
      );
    }

    finished.push(
      nextLayer.animate(
        [
          { transform: `translate3d(0, ${enterFromY}, 0)`, opacity: 0 },
          { transform: 'translate3d(0, 0, 0)', opacity: 1 },
        ],
        { duration: TRANSITION_MS, easing: EASING, fill: 'forwards' }
      ).finished
    );

    Promise.all(finished).then(() => {
      if (prevLayer) {
        prevLayer.firstElementChild?._scrollsHomeDispose?.();
        prevLayer.remove();
      }
      current = { key, el: nextLayer };
      backButton.hidden = key === 'home';
      animating = false;
    });
  }

  function onNavigateEvent(event) {
    const destination = event.detail && event.detail.destination;
    if (destination) navigate(destination, { direction: 'forward' });
  }

  function onBackClick() {
    navigate('home', { direction: 'back' });
  }

  layers.addEventListener('scrolls:navigate', onNavigateEvent);
  backButton.addEventListener('click', onBackClick);

  const initialLayer = mountLayer('home');
  layers.appendChild(initialLayer);
  current = { key: 'home', el: initialLayer };
  backButton.hidden = true;

  root._scrollsAppDispose = () => {
    resizeObserver.disconnect();
    layers.removeEventListener('scrolls:navigate', onNavigateEvent);
    backButton.removeEventListener('click', onBackClick);
  };

  return root;
}
