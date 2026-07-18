import './morning-brief.css';

const sunSvg = `
  <svg class="morning-brief__sun" viewBox="0 0 56 56" aria-hidden="true" focusable="false">
    <circle cx="28" cy="28" r="11" fill="none" stroke="currentColor" stroke-width="1.25"/>
    <g stroke="currentColor" stroke-width="1.25" stroke-linecap="round">
      <line x1="28" y1="4" x2="28" y2="12"/>
      <line x1="28" y1="44" x2="28" y2="52"/>
      <line x1="4" y1="28" x2="12" y2="28"/>
      <line x1="44" y1="28" x2="52" y2="28"/>
      <line x1="10.5" y1="10.5" x2="16.2" y2="16.2"/>
      <line x1="39.8" y1="39.8" x2="45.5" y2="45.5"/>
      <line x1="45.5" y1="10.5" x2="39.8" y2="16.2"/>
      <line x1="16.2" y1="39.8" x2="10.5" y2="45.5"/>
    </g>
  </svg>
`;

const birdsSvg = `
  <div class="morning-brief__birds" aria-hidden="true">
    <svg class="morning-brief__bird" viewBox="0 0 22 12" focusable="false">
      <path d="M1 8 C5 2, 8 2, 11 7 C14 2, 17 2, 21 8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg class="morning-brief__bird" viewBox="0 0 18 10" focusable="false">
      <path d="M1 7 C4 2, 7 2, 9 6 C11 2, 14 2, 17 7" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
`;

function createMorningBrief() {
  const page = document.createElement('main');
  page.className = 'morning-brief m3-scope';
  page.setAttribute('aria-label', 'Morning brief');

  page.innerHTML = `
    <div class="morning-brief__inner">
      <p class="morning-brief__date md-typescale-label-large">Friday · July 17 2026</p>

      <h1 class="morning-brief__headline">
        The whole day is yours, Chase — nothing on the calendar until the gym at 5:30.
      </h1>

      <div class="morning-brief__visual" aria-hidden="true">
        <div class="morning-brief__sky">
          ${sunSvg}
          ${birdsSvg}
        </div>
        <div class="morning-brief__timeline">
          <div class="morning-brief__timeline-line"></div>
          <div class="morning-brief__timeline-dot"></div>
        </div>
      </div>

      <section class="morning-brief__schedule" aria-label="Day schedule">
        <article class="morning-brief__slot">
          <h2 class="morning-brief__slot-time">8 AM – 1 PM</h2>
          <p class="morning-brief__slot-body">
            The calendar is empty here — a long, unbroken stretch for design work.
          </p>
        </article>
        <article class="morning-brief__slot">
          <h2 class="morning-brief__slot-time">1 – 5:30 PM</h2>
          <p class="morning-brief__slot-body">
            Still clear; the afternoon runs straight through to evening.
          </p>
        </article>
        <article class="morning-brief__slot">
          <h2 class="morning-brief__slot-time">5:30 PM ONWARD</h2>
          <p class="morning-brief__slot-body">
            Gym at Los Campeones, the only entry today. Saturday is clear too.
          </p>
        </article>
      </section>

      <md-divider class="morning-brief__rule" role="separator"></md-divider>

      <section class="morning-brief__section" aria-labelledby="needs-attention-heading">
        <h2 id="needs-attention-heading" class="morning-brief__section-title md-typescale-title-medium">
          Needs attention
        </h2>
        <p class="morning-brief__section-body md-typescale-body-medium">
          Nothing needs you this morning — the inbox is newsletters and receipts, and no one is waiting on a reply.
        </p>
      </section>

      <section class="morning-brief__section" aria-labelledby="resolved-heading">
        <h2 id="resolved-heading" class="morning-brief__section-title md-typescale-title-medium">
          Resolved
        </h2>
        <ol class="morning-brief__resolved">
          <li class="morning-brief__resolved-item">
            <span class="morning-brief__resolved-num" aria-hidden="true">1</span>
            <div class="morning-brief__resolved-content">
              <h3 class="morning-brief__resolved-title">
                $136 refund came through from FastGrowingTrees
              </h3>
              <p class="morning-brief__resolved-detail">
                The refund notice
                <a href="#">in your inbox</a>
                Friday afternoon confirms order #9503679586 was refunded in full — $136.00, on your statement within days.
              </p>
            </div>
          </li>
          <li class="morning-brief__resolved-item">
            <span class="morning-brief__resolved-num" aria-hidden="true">2</span>
            <div class="morning-brief__resolved-content">
              <h3 class="morning-brief__resolved-title">
                UPS package delivered Friday at 3:13 PM
              </h3>
              <p class="morning-brief__resolved-detail">
                UPS confirmed
                <a href="#">in your inbox</a>
                that the package from The UPS Store arrived Friday — nothing left to track.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  `;

  return page;
}

export default {
  title: 'GitNewb/Morning Brief',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export const Page = {
  name: 'Page',
  render: () => createMorningBrief(),
};
