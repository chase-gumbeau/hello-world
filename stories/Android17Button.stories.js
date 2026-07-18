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
        <animate
          attributeName="baseFrequency"
          dur="1.8s"
          values="0.018 0.08;0.045 0.14;0.012 0.055;0.018 0.08"
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
          dur="1.8s"
          values="2;10;5;2"
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

  const layers = [];

  if (variant === 'rotate' || variant === 'combo') {
    layers.push('<span class="a17-btn__glow a17-btn__glow--beam" aria-hidden="true"></span>');
    layers.push('<span class="a17-btn__glow a17-btn__glow--beam-sharp" aria-hidden="true"></span>');
  }
  if (variant === 'bottom' || variant === 'combo') {
    layers.push('<span class="a17-btn__glow a17-btn__glow--bottom" aria-hidden="true"></span>');
  }
  if (variant === 'sides' || variant === 'combo') {
    layers.push('<span class="a17-btn__glow a17-btn__glow--sides-static" aria-hidden="true"></span>');
  }
  if (variant === 'edges' || variant === 'combo') {
    layers.push('<span class="a17-btn__glow a17-btn__glow--edges" aria-hidden="true"></span>');
  }
  if (variant === 'warp') {
    layers.push('<span class="a17-btn__glow a17-btn__glow--warp" aria-hidden="true"></span>');
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
  root.setAttribute('aria-label', 'Android 17 button animation study');

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
  root.setAttribute('aria-label', `Android 17 ${variant} button`);

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
  title: 'Studies/Android 17 Button',
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
