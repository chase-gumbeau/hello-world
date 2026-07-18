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

const TIME_OF_DAY = ['morning', 'noon', 'evening'];

/** Representative left % for each band (0–33 / 33–66 / 66–100). */
const TOD_POSITION = {
  morning: 16,
  noon: 50,
  evening: 83,
};

/**
 * Timeline day window (hours). Maps scrub t∈[0,1] across the day.
 * Density is a calm sum of gaussian bumps at real event times.
 */
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 22;

/** Soft activity bumps — amplitude relative, sigma in hours. */
const DENSITY_EVENTS = [
  { hour: 14.0, amplitude: 0.22, sigma: 1.05 }, // refund (afternoon, soft)
  { hour: 15.2167, amplitude: 0.42, sigma: 0.9 }, // UPS ~3:13 PM
  { hour: 17.5, amplitude: 1, sigma: 1.2 }, // gym 5:30 PM
];

const PATH_SAMPLES = 64;

/**
 * Wash keyframes along scrub t ∈ [0, 1].
 * Morning: orange, center outside top-left (< half visible)
 * Noon: blue, top center
 * Evening: purple, bottom right
 */
const WASH_STOPS = [
  { t: 0, x: -4, y: -6, rx: 150, ry: 120, r: 224, g: 120, b: 48, a: 0.3 },
  { t: 0.5, x: 50, y: -8, rx: 160, ry: 110, r: 74, g: 136, b: 200, a: 0.26 },
  { t: 1, x: 104, y: 104, rx: 140, ry: 120, r: 133, g: 88, b: 184, a: 0.3 },
];

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a, b, u) {
  return a + (b - a) * u;
}

function washAt(t) {
  const progress = clamp(t, 0, 1);
  let i = 0;
  while (i < WASH_STOPS.length - 2 && progress > WASH_STOPS[i + 1].t) i += 1;
  const from = WASH_STOPS[i];
  const to = WASH_STOPS[i + 1];
  const span = to.t - from.t || 1;
  const u = (progress - from.t) / span;
  return {
    x: lerp(from.x, to.x, u),
    y: lerp(from.y, to.y, u),
    rx: lerp(from.rx, to.rx, u),
    ry: lerp(from.ry, to.ry, u),
    r: lerp(from.r, to.r, u),
    g: lerp(from.g, to.g, u),
    b: lerp(from.b, to.b, u),
    a: lerp(from.a, to.a, u),
  };
}

function timeOfDayFromPercent(percent) {
  if (percent < 100 / 3) return 'morning';
  if (percent < 200 / 3) return 'noon';
  return 'evening';
}

function applyTimeOfDayClass(page, tod) {
  TIME_OF_DAY.forEach((name) => {
    page.classList.toggle(`morning-brief--${name}`, name === tod);
  });
  page.dataset.timeOfDay = tod;
}

function applyWashFromProgress(page, t, { scrubbing = false } = {}) {
  const wash = washAt(t);
  page.style.setProperty('--mb-wash-x', `${wash.x.toFixed(2)}%`);
  page.style.setProperty('--mb-wash-y', `${wash.y.toFixed(2)}%`);
  page.style.setProperty('--mb-wash-rx', `${wash.rx.toFixed(2)}%`);
  page.style.setProperty('--mb-wash-ry', `${wash.ry.toFixed(2)}%`);
  page.style.setProperty('--mb-wash-r', wash.r.toFixed(1));
  page.style.setProperty('--mb-wash-g', wash.g.toFixed(1));
  page.style.setProperty('--mb-wash-b', wash.b.toFixed(1));
  page.style.setProperty('--mb-wash-a', wash.a.toFixed(3));
  page.classList.toggle('is-scrubbing', scrubbing);
}

function hourToT(hour) {
  return (hour - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR);
}

/** Raw density at scrub t ∈ [0, 1] — sum of gaussian bumps. */
function densityAt(t) {
  const daySpan = DAY_END_HOUR - DAY_START_HOUR;
  let sum = 0;
  for (const event of DENSITY_EVENTS) {
    const center = hourToT(event.hour);
    const sigma = event.sigma / daySpan;
    const x = t - center;
    sum += event.amplitude * Math.exp(-(x * x) / (2 * sigma * sigma));
  }
  return sum;
}

const DENSITY_PEAK = (() => {
  let peak = 0;
  for (let i = 0; i <= PATH_SAMPLES; i += 1) {
    peak = Math.max(peak, densityAt(i / PATH_SAMPLES));
  }
  return peak || 1;
})();

/** Normalized 0–1 rise used for path Y and thumb placement. */
function densityNorm(t) {
  return Math.pow(densityAt(clamp(t, 0, 1)) / DENSITY_PEAK, 0.88);
}

/**
 * Sample density into pixel points (baseline low, peaks rise).
 * pad keeps stroke + thumb inside the track.
 */
function densityPoints(width, height) {
  const padX = 1;
  const padY = 6;
  const baseline = height - padY;
  const maxRise = Math.max(8, height - padY * 2);
  const pts = [];
  for (let i = 0; i <= PATH_SAMPLES; i += 1) {
    const t = i / PATH_SAMPLES;
    const rise = densityNorm(t);
    pts.push({
      x: padX + t * (width - padX * 2),
      y: baseline - rise * maxRise,
    });
  }
  return pts;
}

/** Centripetal Catmull–Rom → cubic Bézier path (smooth, no zigzags). */
function catmullRomPath(points) {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/**
 * Y on the density curve at horizontal percent (same function as the SVG path).
 * Returns fraction of timeline height from the top (0–1).
 */
function pathYFraction(percent, height) {
  if (height <= 0) return 0.5;
  const padY = 6;
  const baseline = height - padY;
  const maxRise = Math.max(8, height - padY * 2);
  const y = baseline - densityNorm(percent / 100) * maxRise;
  return y / height;
}

function bindTimelineScrubber(page, initialTod) {
  const timeline = page.querySelector('.morning-brief__timeline');
  const pathEl = page.querySelector('.morning-brief__timeline-path');
  const thumb = page.querySelector('.morning-brief__timeline-dot');
  if (!timeline || !pathEl || !thumb) return;

  let percent = TOD_POSITION[initialTod] ?? TOD_POSITION.morning;
  let dragging = false;

  const layoutPath = () => {
    const width = timeline.clientWidth;
    const height = timeline.clientHeight;
    if (width <= 0 || height <= 0) return;
    const svg = pathEl.ownerSVGElement;
    if (svg) svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    pathEl.setAttribute('d', catmullRomPath(densityPoints(width, height)));
  };

  const placeThumb = () => {
    const height = timeline.clientHeight;
    const yFrac = pathYFraction(percent, height);
    thumb.style.left = `${percent}%`;
    thumb.style.top = `${(yFrac * 100).toFixed(3)}%`;
  };

  const setFromPercent = (next, { scrubbing = false, announce = false } = {}) => {
    percent = clamp(next, 0, 100);
    const t = percent / 100;
    placeThumb();
    applyWashFromProgress(page, t, { scrubbing });
    const tod = timeOfDayFromPercent(percent);
    applyTimeOfDayClass(page, tod);
    thumb.setAttribute('aria-valuenow', String(Math.round(percent)));
    thumb.setAttribute('aria-valuetext', tod);
    if (announce) timeline.setAttribute('data-tod', tod);
  };

  const percentFromClientX = (clientX) => {
    const rect = timeline.getBoundingClientRect();
    if (rect.width <= 0) return percent;
    return ((clientX - rect.left) / rect.width) * 100;
  };

  const onPointerMove = (event) => {
    if (!dragging) return;
    setFromPercent(percentFromClientX(event.clientX), { scrubbing: true });
  };

  const endDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    thumb.classList.remove('is-dragging');
    page.classList.remove('is-scrubbing');
    try {
      thumb.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  };

  const startDrag = (event) => {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    dragging = true;
    thumb.classList.add('is-dragging');
    page.classList.add('is-scrubbing');
    thumb.setPointerCapture(event.pointerId);
    setFromPercent(percentFromClientX(event.clientX), { scrubbing: true });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  };

  timeline.addEventListener('pointerdown', (event) => {
    if (event.target === thumb) return;
    startDrag(event);
  });
  thumb.addEventListener('pointerdown', startDrag);

  thumb.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 10 : 5;
    let next = percent;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = percent - step;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = percent + step;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 100;
    else return;
    event.preventDefault();
    setFromPercent(next, { scrubbing: false, announce: true });
  });

  const resizeObserver = new ResizeObserver(() => {
    layoutPath();
    placeThumb();
  });
  resizeObserver.observe(timeline);

  layoutPath();
  setFromPercent(percent, { scrubbing: false });
}

function createMorningBrief({ timeOfDay = 'morning' } = {}) {
  const tod = TIME_OF_DAY.includes(timeOfDay) ? timeOfDay : 'morning';
  const noiseId = `morning-brief-noise-${Math.random().toString(36).slice(2, 9)}`;
  const page = document.createElement('main');
  page.className = `morning-brief morning-brief--${tod} m3-scope`;
  page.setAttribute('aria-label', 'Morning brief');
  page.dataset.timeOfDay = tod;

  page.innerHTML = `
    <svg class="morning-brief__grain" aria-hidden="true" focusable="false">
      <defs>
        <filter id="${noiseId}" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.25" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#${noiseId})"/>
    </svg>
    <div class="morning-brief__inner">
      <p class="morning-brief__date md-typescale-label-large">Friday · July 17 2026</p>

      <h1 class="morning-brief__headline">
        The whole day is yours, Chase — nothing on the calendar until the gym at 5:30.
      </h1>

      <div class="morning-brief__visual">
        <div class="morning-brief__sky" aria-hidden="true">
          ${sunSvg}
          ${birdsSvg}
        </div>
        <div class="morning-brief__timeline">
          <svg
            class="morning-brief__timeline-svg"
            aria-hidden="true"
            focusable="false"
            preserveAspectRatio="none"
          >
            <path class="morning-brief__timeline-path" fill="none" vector-effect="non-scaling-stroke"/>
          </svg>
          <button
            type="button"
            class="morning-brief__timeline-dot"
            role="slider"
            aria-label="Time of day"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="${TOD_POSITION[tod]}"
            aria-valuetext="${tod}"
            style="left: ${TOD_POSITION[tod]}%"
          ></button>
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

  bindTimelineScrubber(page, tod);
  return page;
}

export default {
  title: 'GitNewb/Morning Brief',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    timeOfDay: {
      control: { type: 'select' },
      options: TIME_OF_DAY,
      description:
        'Starting ambient wash. Drag the timeline dot for a continuous orange→blue→purple morph; Controls snap to morning / noon / evening.',
    },
  },
  args: {
    timeOfDay: 'morning',
  },
  render: (args) => createMorningBrief(args),
};

export const Page = {
  name: 'Reference 1',
};

export const Concept1 = {
  name: 'Concept 1',
};
