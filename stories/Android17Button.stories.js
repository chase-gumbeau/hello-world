import './android-17-button.css';

const WARP_FILTER_SVG = `
  <svg class="a17-study__svg-filters" aria-hidden="true" focusable="false">
    <filter id="a17-warp-filter" x="-40%" y="-40%" width="180%" height="180%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.018 0.08"
        numOctaves="2"
        seed="7"
        result="noise"
      >
        <!-- Slow, eased drift between noise shapes, on a period that never lines up
             with the displacement's, so the ring's warp keeps changing character. -->
        <animate
          attributeName="baseFrequency"
          dur="5.3s"
          values="0.018 0.08;0.034 0.12;0.014 0.06;0.026 0.1;0.018 0.08"
          calcMode="spline"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
          repeatCount="indefinite"
        />
      </feTurbulence>
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale="6"
        xChannelSelector="R"
        yChannelSelector="G"
      >
        <animate
          attributeName="scale"
          dur="3.7s"
          values="3;8;4.5;9.5;3"
          calcMode="spline"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
          repeatCount="indefinite"
        />
      </feDisplacementMap>
    </filter>
  </svg>
`;

/**
 * @param {object} opts
 * @param {string} opts.label
 * @param {'rotate'|'bottom'|'sides'|'edges'|'combo'|'warp'} opts.variant
 * @param {'lg'|'md'} [opts.size]
 */
function createButton({ label, variant, size = 'md' }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  const variantClass = {
    rotate: 'rotate',
    bottom: 'bottom',
    sides: 'sides',
    edges: 'edges',
    combo: 'combo',
    warp: 'warp',
  }[variant] || 'rotate';

  btn.className = `a17-btn a17-btn--${size} a17-btn--${variantClass}`;
  btn.setAttribute('aria-label', label);

  const glow = (name) => `<span class="a17-btn__glow a17-btn__glow--${name}" aria-hidden="true"></span>`;

  // Every variant sits on a drifting mesh of soft color, then adds its own layers.
  const layers = [glow('mesh')];

  if (variant === 'rotate' || variant === 'combo') {
    layers.push(glow('beam-counter'), glow('beam'), glow('beam-sharp'));
  }
  if (variant === 'bottom' || variant === 'combo') {
    layers.push(glow('bottom'), glow('bottom-swell'));
  }
  if (variant === 'sides' || variant === 'combo') {
    layers.push(glow('side-left'), glow('side-right'));
  }
  if (variant === 'edges' || variant === 'combo') {
    layers.push(glow('edge-top'), glow('edge-bottom'));
  }
  if (variant === 'warp') {
    layers.push(glow('warp'));
  }

  btn.innerHTML = `
    <span class="a17-btn__layers" aria-hidden="true">
      ${layers.join('')}
    </span>
    <span class="a17-btn__ring" aria-hidden="true"></span>
    <span class="a17-btn__face">
      <span class="a17-btn__label">${label}</span>
    </span>
  `;

  return btn;
}

/**
 * @param {{ label?: string }} [args]
 */
function createShowcase({ label = 'Hello world' } = {}) {
  const root = document.createElement('main');
  root.className = 'a17-study';
  root.setAttribute('aria-label', 'Animation mesh gradient study');

  const combo = createButton({ label, variant: 'combo', size: 'lg' });
  const rotate = createButton({ label, variant: 'rotate', size: 'md' });
  const bottom = createButton({ label, variant: 'bottom', size: 'md' });
  const sides = createButton({ label, variant: 'sides', size: 'md' });
  const edges = createButton({ label, variant: 'edges', size: 'md' });

  root.innerHTML = `
    ${WARP_FILTER_SVG}
    <div class="a17-study__stage">
      <div class="a17-study__hero">
        <div data-slot="combo"></div>
        <p class="a17-study__caption a17-study__caption--hero">Combination</p>
      </div>
      <hr class="a17-study__rule" />
      <div class="a17-study__grid">
        <div class="a17-study__cell" data-slot="rotate">
          <p class="a17-study__caption">Rotate</p>
        </div>
        <div class="a17-study__cell" data-slot="bottom">
          <p class="a17-study__caption">Bottom</p>
        </div>
        <div class="a17-study__cell" data-slot="sides">
          <p class="a17-study__caption">Left &amp; right</p>
        </div>
        <div class="a17-study__cell" data-slot="edges">
          <p class="a17-study__caption">Top &amp; bottom</p>
        </div>
      </div>
    </div>
  `;

  root.querySelector('[data-slot="combo"]').replaceWith(combo);
  const grid = root.querySelector('.a17-study__grid');
  const slots = { rotate, bottom, sides, edges };
  Object.entries(slots).forEach(([key, btn]) => {
    const cellEl = grid.querySelector(`[data-slot="${key}"]`);
    cellEl.insertBefore(btn, cellEl.firstChild);
  });

  return root;
}

/**
 * @param {{ label?: string, variant?: string }} [args]
 */
function createSolo({ label = 'Hello world', variant = 'rotate' } = {}) {
  const root = document.createElement('main');
  root.className = 'a17-study';
  root.setAttribute('aria-label', `Animation mesh gradient ${variant} button`);

  const captions = {
    rotate: 'Rotate',
    bottom: 'Bottom',
    sides: 'Left & right',
    edges: 'Top & bottom',
    combo: 'Combination',
    warp: 'Warp',
  };

  root.innerHTML = WARP_FILTER_SVG;
  const solo = document.createElement('div');
  solo.className = 'a17-study__solo';
  solo.appendChild(createButton({ label, variant, size: 'lg' }));
  const caption = document.createElement('p');
  caption.className = 'a17-study__caption a17-study__caption--hero';
  caption.textContent = captions[variant] || variant;
  solo.appendChild(caption);
  root.appendChild(solo);
  return root;
}

export default {
  title: 'Studies/Motion/Animation mesh gradient',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    label: { control: 'text' },
  },
  args: {
    label: 'Hello world',
  },
};

/** Matches the Figma showcase: combination hero + four glow variants */
export const Showcase = {
  name: 'Showcase',
  render: (args) => createShowcase(args),
};

export const SignOrders = {
  name: 'Sign orders',
  args: {
    label: 'Sign orders',
  },
  render: (args) => createShowcase(args),
};

export const Rotate = {
  name: 'Rotate',
  render: (args) => createSolo({ ...args, variant: 'rotate' }),
};

export const Bottom = {
  name: 'Bottom',
  render: (args) => createSolo({ ...args, variant: 'bottom' }),
};

export const LeftAndRight = {
  name: 'Left & right',
  render: (args) => createSolo({ ...args, variant: 'sides' }),
};

export const TopAndBottom = {
  name: 'Top & bottom',
  render: (args) => createSolo({ ...args, variant: 'edges' }),
};

export const Combination = {
  name: 'Combination',
  render: (args) => createSolo({ ...args, variant: 'combo' }),
};

export const Warp = {
  name: 'Warp',
  render: (args) => createSolo({ ...args, variant: 'warp' }),
};
