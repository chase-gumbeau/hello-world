import './scrolls-home.css';
import { getScrollTripsByYear } from './scrolls-registry.js';

const DESIGN_W = 3842;
const DESIGN_H = 2160;

// Link exit-on-click: scaled down by 0.125 (→ 0.875) and faded out, 200ms
// linear, fired the instant a city is clicked so it runs concurrently with
// the host shell's slide transition (see `scrolls-app.js` `navigate()`).
const LINK_EXIT_MS = 200;
const LINK_EXIT_EASING = 'linear';
const LINK_EXIT_SCALE = 0.875;

/**
 * Scrolls title / home screen — destination list inside the centered frame.
 *
 * Clicking a city never performs a real navigation. Instead it dispatches a
 * bubbling `scrolls:navigate` custom event (`detail.destination`) so a host
 * shell (see `scrolls-app.js`) can animate to the destination in place. When
 * rendered standalone (no host listening), the click is simply a no-op.
 *
 * @param {{ embedded?: boolean }} [options] When `embedded` is true, the
 *   home screen's own border/scrim chrome is hidden so a parent shell's
 *   frame can act as the single stable "window" during transitions.
 * @returns {HTMLElement}
 */
export function createScrollsHome({ embedded = false } = {}) {
  const root = document.createElement('div');
  root.className = 'scrolls-home';
  if (embedded) root.classList.add('is-embedded');
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

  root.innerHTML = `
    <div class="scrolls-home__stage">
      <div class="scrolls-home__canvas" data-scrolls-home-canvas>
        <div class="scrolls-home__edge scrolls-home__edge--left" aria-hidden="true"></div>
        <div class="scrolls-home__edge scrolls-home__edge--right" aria-hidden="true"></div>
        <div class="scrolls-home__frame">
          <div class="scrolls-home__list">
            ${listHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  function onCityClick(event) {
    event.preventDefault();
    const destination = event.currentTarget.getAttribute('data-destination');
    if (!destination) return;
    playLinksExit();
    root.dispatchEvent(
      new CustomEvent('scrolls:navigate', {
        detail: { destination },
        bubbles: true,
      })
    );
  }

  const cityLinks = root.querySelectorAll('[data-destination]');
  cityLinks.forEach((link) => link.addEventListener('click', onCityClick));

  /** Exit animation for every destination link, run once any city is clicked. */
  function playLinksExit() {
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
  };

  return root;
}
