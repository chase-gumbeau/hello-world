/**
 * Frame glow — ambient drifting mesh + cursor hotspot above.
 * Palette peeks lerp colors so fields morph instead of snapping.
 */

import './scrolls-frame-glow.css';

const FILTER_ID = 'scrolls-frame-noise';

const BW = ['#ffffff', '#e8e8e8', '#9a9a9a', '#3a3a3a', '#0a0a0a', '#000000'];

/** Base anchors for ambient color fields (percent). Drift orbits around these. */
const AMBIENT_BASE = [
  [72, 18],
  [88, 22],
  [12, 78],
  [70, 88],
];

const COLOR_LERP = 0.08;
const CURSOR_LERP = 0.14;

function ensureNoiseFilter() {
  if (document.getElementById(FILTER_ID)) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.style.overflow = 'hidden';
  svg.innerHTML = `
    <filter id="${FILTER_ID}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.85 0.95"
        numOctaves="3"
        seed="7"
        stitchTiles="stitch"
        result="noise"
      />
      <feColorMatrix
        in="noise"
        type="matrix"
        values="
          0 0 0 0 1
          0 0 0 0 1
          0 0 0 0 1
          0 0 0 0.55 0"
        result="monoNoise"
      />
      <feComposite in="monoNoise" in2="SourceGraphic" operator="in" result="noiseAlpha" />
      <feBlend in="SourceGraphic" in2="noiseAlpha" mode="soft-light" />
    </filter>
  `;
  document.body.appendChild(svg);
}

/** @param {string} hex */
function parseHex(hex) {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** @param {number[]} rgb */
function toHex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * @param {string[]} colors
 * @returns {number[][]}
 */
function normalizePalette(colors) {
  const c = [...colors];
  while (c.length < 6) c.push(c[c.length - 1] || '#000000');
  return c.slice(0, 6).map(parseHex);
}

/**
 * @param {number[][]} from
 * @param {number[][]} to
 * @param {number} t
 */
function lerpPalettes(from, to, t) {
  return from.map((rgb, i) => {
    const target = to[i] || rgb;
    return [
      rgb[0] + (target[0] - rgb[0]) * t,
      rgb[1] + (target[1] - rgb[1]) * t,
      rgb[2] + (target[2] - rgb[2]) * t,
    ];
  });
}

/**
 * @param {HTMLElement} frame
 * @param {number[][]} palette
 */
function applyPaletteVars(frame, palette) {
  palette.forEach((rgb, i) => {
    frame.style.setProperty(`--glow-c${i}`, toHex(rgb));
  });
  frame.style.setProperty('--glow-accent', toHex(palette[0]));
}

/**
 * @param {HTMLElement} root Pointer-tracking surface (stage or app root)
 * @param {HTMLElement | null} frame Frame element to style
 * @returns {{ dispose: () => void, setPalette: (colors: string[] | null) => void }}
 */
export function mountFrameGlow(root, frame) {
  if (!root || !frame) {
    return { dispose: () => {}, setPalette: () => {} };
  }

  ensureNoiseFilter();
  frame.classList.add('scrolls-frame-glow');

  const ambient = document.createElement('div');
  ambient.className = 'scrolls-frame-glow__ambient';
  ambient.setAttribute('aria-hidden', 'true');
  const cursor = document.createElement('div');
  cursor.className = 'scrolls-frame-glow__cursor';
  cursor.setAttribute('aria-hidden', 'true');
  frame.append(ambient, cursor);

  let currentPalette = normalizePalette(BW);
  let targetPalette = normalizePalette(BW);
  applyPaletteVars(frame, currentPalette);

  let targetX = 0.5;
  let targetY = 0.18;
  let currentX = 0.5;
  let currentY = 0.18;
  let rafId = 0;
  let disposed = false;
  let startTime = performance.now();

  function writeAmbientAnchors(t) {
    // Slow independent orbits — only while on Home (not destination)
    const drift = !frame.classList.contains('is-destination');
    AMBIENT_BASE.forEach(([bx, by], i) => {
      let x = bx;
      let y = by;
      if (drift) {
        const phase = i * 1.7;
        // ~18–28s periods; small amplitude so fields wander, not thrash
        const ampX = 10 + i * 1.5;
        const ampY = 8 + i * 1.2;
        x = bx + Math.sin(t * 0.00022 + phase) * ampX + Math.sin(t * 0.00011 + phase * 0.6) * 4;
        y = by + Math.cos(t * 0.00019 + phase * 1.3) * ampY + Math.sin(t * 0.00015 + phase) * 3.5;
      }
      frame.style.setProperty(`--glow-ax${i}`, `${x.toFixed(2)}%`);
      frame.style.setProperty(`--glow-ay${i}`, `${y.toFixed(2)}%`);
    });
  }

  function tick(now) {
    if (disposed) return;

    currentX += (targetX - currentX) * CURSOR_LERP;
    currentY += (targetY - currentY) * CURSOR_LERP;
    frame.style.setProperty('--glow-x', `${(currentX * 100).toFixed(2)}%`);
    frame.style.setProperty('--glow-y', `${(currentY * 100).toFixed(2)}%`);
    const ox = ((currentX - 0.5) * 10).toFixed(2);
    const oy = ((currentY - 0.5) * 10).toFixed(2);
    frame.style.setProperty('--glow-ox', `${ox}px`);
    frame.style.setProperty('--glow-oy', `${oy}px`);

    currentPalette = lerpPalettes(currentPalette, targetPalette, COLOR_LERP);
    applyPaletteVars(frame, currentPalette);

    writeAmbientAnchors(now - startTime);

    rafId = requestAnimationFrame(tick);
  }

  function onPointerMove(event) {
    const rect = frame.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    targetX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    targetY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  }

  function onPointerLeave() {
    targetX = 0.5;
    targetY = 0.18;
  }

  /**
   * @param {string[] | null} colors hex palette; null restores B&W
   */
  function setPalette(colors) {
    if (!colors || colors.length === 0) {
      frame.classList.remove('is-peeking');
      targetPalette = normalizePalette(BW);
      return;
    }
    targetPalette = normalizePalette(colors);
    frame.classList.add('is-peeking');
  }

  root.addEventListener('pointermove', onPointerMove, { passive: true });
  root.addEventListener('pointerleave', onPointerLeave);
  rafId = requestAnimationFrame(tick);

  return {
    setPalette,
    dispose() {
      disposed = true;
      cancelAnimationFrame(rafId);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      ambient.remove();
      cursor.remove();
      frame.classList.remove('scrolls-frame-glow', 'is-peeking');
    },
  };
}
