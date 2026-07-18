import './scrolls-home.css';
import { getScrollTripsByYear } from './scrolls-registry.js';

const DESIGN_W = 3842;
const DESIGN_H = 2160;

// Centered layout: scale + fade each link on click.
const LINK_EXIT_MS = 200;
const LINK_EXIT_EASING = 'linear';
const LINK_EXIT_SCALE = 0.875;

// Left layout: whole nav slides left and fades out.
const LIST_EXIT_MS = 420;
const LIST_EXIT_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Scrolls title / home screen — destination list in the centered frame
 * (`layout: 'centered'`) or in the left gutter outside the frame
 * (`layout: 'left'`).
 *
 * Clicking a city never performs a real navigation. Instead it dispatches a
 * bubbling `scrolls:navigate` custom event (`detail.destination`) so a host
 * shell (see `scrolls-app.js`) can animate to the destination in place. When
 * rendered standalone (no host listening), the click is simply a no-op.
 *
 * @param {{ embedded?: boolean, layout?: 'centered' | 'left', animateIn?: boolean }} [options]
 * @returns {HTMLElement}
 */
export function createScrollsHome({
  embedded = false,
  layout = 'centered',
  animateIn = false,
} = {}) {
  const root = document.createElement('div');
  root.className = 'scrolls-home';
  if (embedded) root.classList.add('is-embedded');
  root.classList.add(layout === 'left' ? 'is-layout-left' : 'is-layout-centered');
  root.dataset.layout = layout;
  root.setAttribute('aria-label', 'Scrolls home');

  const yearGroups = getScrollTripsByYear();
  const listHtml = yearGroups
    .map(
      ({ year, trips }, index) => `
            ${
              index > 0
                ? `<p class="scrolls-home__sep" aria-hidden="true">·</p>`
                : ''
            }
            <div class="scrolls-home__section">
              <p class="scrolls-home__year">${year}</p>
              ${trips
                .map(
                  (trip) =>
                    `<a class="scrolls-home__city" href="#" data-destination="${trip.id}">${trip.title}</a>`
                )
                .join('\n              ')}
            </div>`
    )
    .join('\n            ');

  // Left layout: nav sits beside the frame on the canvas. Centered: nav inside frame.
  const listBlock = `<div class="scrolls-home__list" data-scrolls-home-list>${listHtml}</div>`;
  const frameInner = layout === 'left' ? '' : listBlock;

  root.innerHTML = `
    <div class="scrolls-home__stage">
      <div class="scrolls-home__canvas" data-scrolls-home-canvas>
        <div class="scrolls-home__edge scrolls-home__edge--left" aria-hidden="true"></div>
        <div class="scrolls-home__edge scrolls-home__edge--right" aria-hidden="true"></div>
        ${layout === 'left' ? listBlock : ''}
        <div class="scrolls-home__frame">
          ${frameInner}
        </div>
      </div>
    </div>
  `;

  const listEl = root.querySelector('[data-scrolls-home-list]');
  const cityLinks = root.querySelectorAll('[data-destination]');

  /** @type {HTMLElement | null} */
  let navHost = null;

  // Embedded left-home: lift the list onto the app stage so it paints above
  // the scrim (canvas content sits under it). Back navigation passes
  // `animateIn` so the nav slides in from the left.
  if (embedded && layout === 'left' && listEl) {
    requestAnimationFrame(() => {
      const app = root.closest('.scrolls-app');
      navHost = app?.querySelector('[data-scrolls-app-nav]') || null;
      if (!navHost) return;

      if (animateIn) {
        listEl.classList.add('is-entering');
        navHost.replaceChildren(listEl);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            listEl.classList.remove('is-entering');
          });
        });
      } else {
        navHost.replaceChildren(listEl);
      }
    });
  }

  function onCityClick(event) {
    event.preventDefault();
    const destination = event.currentTarget.getAttribute('data-destination');
    if (!destination) return;
    playExit();
    root.dispatchEvent(
      new CustomEvent('scrolls:navigate', {
        detail: { destination },
        bubbles: true,
      })
    );
  }

  cityLinks.forEach((link) => link.addEventListener('click', onCityClick));

  function playExit() {
    if (layout === 'left') {
      playListSlideExit();
    } else {
      playLinksScaleExit();
    }
  }

  function playLinksScaleExit() {
    cityLinks.forEach((link) => {
      link.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: `scale(${LINK_EXIT_SCALE})`, opacity: 0 },
        ],
        { duration: LINK_EXIT_MS, easing: LINK_EXIT_EASING, fill: 'forwards' }
      );
    });
  }

  function playListSlideExit() {
    if (!listEl) return;
    listEl.classList.add('is-exiting');
    // Stage-hosted list slides via CSS transition on `.is-exiting`.
    // Standalone (in-canvas) left layout still uses WAAPI.
    if (!listEl.closest('[data-scrolls-app-nav]')) {
      listEl.animate(
        [
          { transform: 'translateY(-50%) translateX(0)', opacity: 1 },
          { transform: 'translateY(-50%) translateX(-120%)', opacity: 0 },
        ],
        { duration: LIST_EXIT_MS, easing: LIST_EXIT_EASING, fill: 'forwards' }
      );
    }
  }

  function fitStage() {
    const width = root.clientWidth || window.innerWidth;
    const height = root.clientHeight || window.innerHeight;
    const scale = Math.min(width / DESIGN_W, height / DESIGN_H);
    root.style.setProperty('--stage-scale', String(scale));
    if (!embedded) {
      root.style.setProperty('--app-stage-scale', String(scale));
    }
  }

  const resizeObserver = new ResizeObserver(fitStage);
  resizeObserver.observe(root);
  fitStage();

  root._scrollsHomeDispose = () => {
    resizeObserver.disconnect();
    cityLinks.forEach((link) => link.removeEventListener('click', onCityClick));
    if (navHost && listEl && listEl.parentElement === navHost) {
      listEl.remove();
    }
    navHost?.replaceChildren();
  };

  return root;
}
