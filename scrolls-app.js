import './scrolls-app.css';
import { createScrollsHome } from './scrolls-home.js';
import { SCROLL_DESTINATIONS, getScrollTrip, SCROLL_TRIPS } from './scrolls-registry.js';
import { mountFrameGlow } from './scrolls-frame-glow.js';
import { extractPaletteFromImage, tripAssetUrl } from './scrolls-palette.js';
import { applyStageVars } from './scrolls-stage-scale.js';

const TRANSITION_MS = 650;
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** Left-home hover: design-px per second while auto-scrolling the peek strip. */
const PEEK_SCROLL_SPEED = 360;

/** Factories for every destination the shell knows how to mount. */
function buildDestinations(homeLayout = 'centered') {
  return {
    home: ({ animateIn = false } = {}) =>
      createScrollsHome({ embedded: true, layout: homeLayout, animateIn }),
    ...Object.fromEntries(
      Object.entries(SCROLL_DESTINATIONS).map(([id, mount]) => [
        id,
        () => mount({ embedded: true }),
      ])
    ),
  };
}

/**
 * App shell that owns the single, stable centered frame/scrim "window" and
 * animates destinations underneath it — no Storybook `?path=` navigation.
 *
 * On `scrolls:navigate` (dispatched by e.g. `createScrollsHome()`'s city
 * links), the outgoing content pushes left + fades while the incoming
 * content slides up from beneath the scrim, fading in as it settles —
 * the frame border itself never moves.
 *
 * @param {{ homeLayout?: 'centered' | 'left' }} [options]
 * @returns {HTMLElement}
 */
export function createScrollsApp({ homeLayout = 'centered' } = {}) {
  const DESTINATIONS = buildDestinations(homeLayout);
  const root = document.createElement('div');
  root.className = 'scrolls-app';
  if (homeLayout === 'left') root.classList.add('is-home-left');
  root.setAttribute('aria-label', 'Scrolls');

  root.innerHTML = `
    <div class="scrolls-app__stage">
      <div class="scrolls-app__canvas" data-scrolls-app-canvas>
        <div class="scrolls-app__layers" data-scrolls-app-layers></div>
        <div class="scrolls-app__peek" data-scrolls-app-peek aria-hidden="true"></div>
      </div>
      <div class="scrolls-app__edge scrolls-app__edge--left" aria-hidden="true"></div>
      <div class="scrolls-app__edge scrolls-app__edge--right" aria-hidden="true"></div>
      <div class="scrolls-app__scrim" aria-hidden="true">
        <div class="scrolls-app__scrim-hole"></div>
      </div>
      <div class="scrolls-app__nav" data-scrolls-app-nav></div>
      <div class="scrolls-app__frame" aria-hidden="true"></div>
      <button
        class="scrolls-app__back"
        type="button"
        data-scrolls-app-back
        aria-label="Back to Scrolls home"
        hidden
      ><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span></button>
      <button
        class="scrolls-app__grayscale"
        type="button"
        data-scrolls-app-grayscale
        aria-pressed="false"
        aria-label="Turn on grayscale filter"
      ><span class="material-symbols-outlined" aria-hidden="true">filter_b_and_w</span></button>
    </div>
  `;

  const layers = root.querySelector('[data-scrolls-app-layers]');
  const backButton = root.querySelector('[data-scrolls-app-back]');
  const grayscaleButton = root.querySelector('[data-scrolls-app-grayscale]');
  const stage = root.querySelector('.scrolls-app__stage');
  const frame = root.querySelector('.scrolls-app__frame');
  const peekEl = root.querySelector('[data-scrolls-app-peek]');
  const glow = mountFrameGlow(stage || root, frame);

  /** @type {string | null} */
  let peekDestination = null;
  /** @type {number} */
  let peekToken = 0;
  /** @type {Map<string, HTMLElement>} */
  const peekCache = new Map();
  /** @type {number} */
  let peekScrollRaf = 0;
  /** @type {number} */
  let peekScrollLast = 0;

  function stopPeekScroll() {
    if (peekScrollRaf) {
      cancelAnimationFrame(peekScrollRaf);
      peekScrollRaf = 0;
    }
  }

  /**
   * Slowly advance the peek strip from the start to the end of the trip
   * while the destination title stays hovered.
   * @param {HTMLElement} tripRoot
   */
  function startPeekScroll(tripRoot) {
    stopPeekScroll();
    tripRoot.scrolls?.set(0, true);
    peekScrollLast = performance.now();

    function tick(now) {
      const api = tripRoot.scrolls;
      if (!api) {
        peekScrollRaf = 0;
        return;
      }
      const dt = Math.min(0.05, (now - peekScrollLast) / 1000);
      peekScrollLast = now;
      const { scrollX, max } = api.get();
      const next = Math.max(max, scrollX - PEEK_SCROLL_SPEED * dt);
      api.set(next, true);
      if (next > max + 0.5) {
        peekScrollRaf = requestAnimationFrame(tick);
      } else {
        peekScrollRaf = 0;
      }
    }

    peekScrollRaf = requestAnimationFrame(tick);
  }

  function showPeekComposition(destinationId) {
    if (homeLayout !== 'left' || !peekEl) return;
    const factory = DESTINATIONS[destinationId];
    if (!factory) {
      hidePeekComposition();
      return;
    }

    let tripRoot = peekCache.get(destinationId);
    if (!tripRoot) {
      tripRoot = factory();
      tripRoot.classList.add('is-peek');
      peekCache.set(destinationId, tripRoot);
    }

    if (peekEl.firstElementChild !== tripRoot) {
      peekEl.replaceChildren(tripRoot);
    }
    peekEl.classList.add('is-visible');
    peekEl.setAttribute('aria-hidden', 'false');
    startPeekScroll(tripRoot);
  }

  function hidePeekComposition() {
    stopPeekScroll();
    peekEl?.classList.remove('is-visible');
    peekEl?.setAttribute('aria-hidden', 'true');
  }

  async function peekTrip(destinationId) {
    const trip = getScrollTrip(destinationId);
    if (!trip) {
      glow.setPalette(null);
      hidePeekComposition();
      return;
    }
    const token = ++peekToken;
    peekDestination = destinationId;
    showPeekComposition(destinationId);

    if (!trip.heroImage) {
      glow.setPalette(null);
      return;
    }
    try {
      const colors = await extractPaletteFromImage(tripAssetUrl(trip.heroImage));
      if (token !== peekToken || peekDestination !== destinationId) return;
      glow.setPalette(colors);
    } catch {
      if (token === peekToken) glow.setPalette(null);
    }
  }

  function clearPeek() {
    peekDestination = null;
    peekToken += 1;
    glow.setPalette(null);
    hidePeekComposition();
  }

  function onDestinationEnter(event) {
    if (current?.key !== 'home') return;
    const link = event.target.closest?.('[data-destination]');
    if (!link || !root.contains(link)) return;
    const id = link.getAttribute('data-destination');
    if (!id || id === peekDestination) return;
    peekTrip(id);
  }

  function onDestinationLeave(event) {
    if (current?.key !== 'home') return;
    const link = event.target.closest?.('[data-destination]');
    if (!link) return;
    const next = event.relatedTarget?.closest?.('[data-destination]');
    if (next && root.contains(next)) return;
    clearPeek();
  }

  /** @type {{ key: string, el: HTMLElement } | null} */
  let current = null;
  let animating = false;

  function fitStage() {
    // --app-stage-scale survives nested home overwriting --stage-scale when embedded.
    applyStageVars(root, { setAppScale: true });
  }

  const resizeObserver = new ResizeObserver(fitStage);
  resizeObserver.observe(root);
  fitStage();

  function mountLayer(key, { animateIn = false } = {}) {
    const factory = DESTINATIONS[key];
    if (!factory) return null;
    const layerEl = document.createElement('div');
    layerEl.className = 'scrolls-app__layer';
    layerEl.dataset.key = key;
    layerEl.appendChild(
      key === 'home' ? factory({ animateIn }) : factory()
    );
    return layerEl;
  }

  /**
   * @param {string} key
   * @param {{ direction?: 'forward' | 'back' }} [opts]
   */
  function navigate(key, { direction = 'forward' } = {}) {
    if (animating || !DESTINATIONS[key]) return;
    if (current && current.key === key) return;

    clearPeek();

    const nextLayer = mountLayer(key, {
      animateIn: key === 'home' && direction === 'back',
    });
    if (!nextLayer) return;

    animating = true;
    frame.classList.toggle('is-destination', key !== 'home');

    const prevLayer = current ? current.el : null;
    // Forward: incoming slides in from the right, outgoing exits left.
    // Back: mirrored — incoming slides in from the left, outgoing exits right.
    const enterFromX = direction === 'forward' ? '100%' : '-100%';
    const exitToX = direction === 'forward' ? '-100%' : '100%';

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
          { transform: `translate3d(${enterFromX}, 0, 0)`, opacity: 0 },
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
      grayscaleButton.hidden = key === 'home';
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

  let isGrayscale = false;

  function onGrayscaleClick() {
    isGrayscale = !isGrayscale;
    root.classList.toggle('is-grayscale', isGrayscale);
    grayscaleButton.setAttribute('aria-pressed', String(isGrayscale));
    grayscaleButton.setAttribute(
      'aria-label',
      isGrayscale ? 'Turn off grayscale filter' : 'Turn on grayscale filter'
    );
  }

  layers.addEventListener('scrolls:navigate', onNavigateEvent);
  backButton.addEventListener('click', onBackClick);
  grayscaleButton.addEventListener('click', onGrayscaleClick);
  root.addEventListener('pointerover', onDestinationEnter);
  root.addEventListener('pointerout', onDestinationLeave);

  const initialLayer = mountLayer('home');
  layers.appendChild(initialLayer);
  current = { key: 'home', el: initialLayer };
  backButton.hidden = true;
  grayscaleButton.hidden = true;

  // Warm palette cache so hover peeks feel instant
  for (const trip of SCROLL_TRIPS) {
    if (trip.heroImage) {
      extractPaletteFromImage(tripAssetUrl(trip.heroImage));
    }
  }

  root._scrollsAppDispose = () => {
    stopPeekScroll();
    glow.dispose();
    resizeObserver.disconnect();
    layers.removeEventListener('scrolls:navigate', onNavigateEvent);
    backButton.removeEventListener('click', onBackClick);
    grayscaleButton.removeEventListener('click', onGrayscaleClick);
    root.removeEventListener('pointerover', onDestinationEnter);
    root.removeEventListener('pointerout', onDestinationLeave);
    hidePeekComposition();
    for (const tripRoot of peekCache.values()) {
      tripRoot._scrollsDispose?.();
    }
    peekCache.clear();
    peekEl?.replaceChildren();
  };

  return root;
}
