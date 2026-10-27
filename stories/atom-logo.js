/**
 * Atom logo — vector line-art atom. Orbits and nucleus draw on as strokes,
 * then electrons travel the orbits, passing behind and in front of the nucleus.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEW = 400;
const C = VIEW / 2;

export const ATOM_DEFAULTS = {
  ink: '#1f1b17',
  electron: '#e2552f',
  background: '#f3f0eb',
  orbits: 3,
  strokeWidth: 3,
  speed: 1,
  tilt: 70,
  trail: true,
  simpleNucleus: false,
};

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** Point on an orbit: a circle of radius r tilted by `tilt`, then spun by `phi` in the screen plane. */
function orbitPoint(theta, r, ry, phi) {
  const x = r * Math.cos(theta);
  const y = ry * Math.sin(theta);
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  // depth: sin(theta) > 0 is the near half of the tilted ring.
  return { x: C + x * c - y * s, y: C + x * s + y * c, z: Math.sin(theta) };
}

/**
 * Builds the atom SVG and starts its animation. Returns the root element;
 * the animation loop stops itself once the element leaves the document.
 */
export function createAtom(opts = {}) {
  const o = { ...ATOM_DEFAULTS, ...opts };
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const svg = el('svg', {
    viewBox: `0 0 ${VIEW} ${VIEW}`,
    class: 'atom-svg',
    role: 'img',
    'aria-label': 'Atom logo',
  });
  svg.style.setProperty('--atom-ink', o.ink);
  svg.style.setProperty('--atom-electron', o.electron);
  svg.style.setProperty('--atom-bg', o.background);
  svg.style.setProperty('--atom-stroke', o.strokeWidth);

  const r = 160;
  // Electrons grow with heavier strokes so they still read at icon sizes.
  const er = Math.max(1, o.strokeWidth / 3);
  const ry = r * Math.cos((o.tilt * Math.PI) / 180);
  const count = Math.max(1, Math.round(o.orbits));

  const back = el('g', { class: 'atom-layer atom-back' });
  const orbitsG = el('g', { class: 'atom-orbits' });
  const nucleus = el('g', { class: 'atom-nucleus' });
  const front = el('g', { class: 'atom-layer atom-front' });

  const electrons = [];
  for (let i = 0; i < count; i++) {
    const phi = (Math.PI * i) / count;
    const ring = el('ellipse', {
      cx: C,
      cy: C,
      rx: r,
      ry,
      transform: `rotate(${(phi * 180) / Math.PI} ${C} ${C})`,
      pathLength: 1,
      class: 'atom-draw',
    });
    ring.style.setProperty('--atom-delay', `${i * 0.18}s`);
    orbitsG.append(ring);

    const trail = [];
    if (o.trail) {
      for (let t = 0; t < 14; t++) {
        const dot = el('circle', { r: (5 - t * 0.3) * er, class: 'atom-trail' });
        dot.style.setProperty('--atom-trail-o', (0.45 * (1 - t / 14)).toFixed(2));
        trail.push(dot);
      }
    }
    const dot = el('circle', { r: 7.5 * er, class: 'atom-electron' });
    electrons.push({ phi, theta: (i * 2.1) % (Math.PI * 2), dot, trail, z: null });
  }

  // Nucleus: a ring of overlapping circles around a centre, all as strokes.
  const nr = 13;
  const parts = [{ x: 0, y: 0 }];
  // Small renders keep a single nucleon so the centre doesn't clog into a blob.
  for (let k = 0; k < (o.simpleNucleus ? 0 : 6); k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    parts.push({ x: Math.cos(a) * nr * 1.05, y: Math.sin(a) * nr * 1.05 });
  }
  parts.forEach((p, k) => {
    const n = el('circle', {
      cx: C + p.x,
      cy: C + p.y,
      r: nr,
      pathLength: 1,
      class: 'atom-draw atom-nucleon',
    });
    n.style.setProperty('--atom-delay', `${0.5 + k * 0.06}s`);
    nucleus.append(n);
  });

  svg.append(back, orbitsG, nucleus, front);

  const place = (e) => {
    const p = orbitPoint(e.theta, r, ry, e.phi);
    e.dot.setAttribute('cx', p.x.toFixed(2));
    e.dot.setAttribute('cy', p.y.toFixed(2));
    // Electrons on the far half sit under the nucleus; scale hints at depth.
    e.dot.setAttribute('r', ((6.5 + p.z * 1.5) * er).toFixed(2));
    const layer = p.z >= 0 ? front : back;
    const z = p.z >= 0;
    if (e.z !== z) {
      e.trail.forEach((t) => layer.append(t));
      layer.append(e.dot);
      e.z = z;
    }
    e.trail.forEach((t, k) => {
      const q = orbitPoint(e.theta - (k + 1) * 0.035, r, ry, e.phi);
      t.setAttribute('cx', q.x.toFixed(2));
      t.setAttribute('cy', q.y.toFixed(2));
    });
  };
  electrons.forEach(place);

  if (reduced) {
    svg.classList.add('is-static');
    return svg;
  }

  // Electrons appear once the orbits have drawn on.
  const start = performance.now() + 1100;
  let last = null;
  let frame = 0;
  let mounted = false;
  const tick = (now) => {
    if (svg.isConnected) mounted = true;
    else if (mounted) return;
    frame = requestAnimationFrame(tick);
    if (now < start) return;
    if (last === null) svg.classList.add('is-live');
    const dt = Math.min(0.05, (now - (last ?? now)) / 1000);
    last = now;
    electrons.forEach((e, i) => {
      // Slight per-orbit speed variance keeps the motion from feeling mechanical.
      e.theta += dt * o.speed * (1.6 + i * 0.22);
      place(e);
    });
  };
  frame = requestAnimationFrame(tick);
  svg.stopAtom = () => cancelAnimationFrame(frame);

  return svg;
}

/** Restarts the draw-on by swapping in a fresh atom. */
function replay(stage, opts) {
  const old = stage.querySelector('.atom-svg');
  old?.stopAtom?.();
  old?.remove();
  stage.append(createAtom(opts));
}

export function createAtomSolo(opts = {}) {
  const o = { ...ATOM_DEFAULTS, ...opts };
  const root = document.createElement('div');
  root.className = 'atom-study';
  root.style.setProperty('--atom-bg', o.background);
  root.style.setProperty('--atom-ink', o.ink);

  const stage = document.createElement('div');
  stage.className = 'atom-stage';
  stage.append(createAtom(o));

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'atom-replay';
  button.textContent = 'Replay';
  button.addEventListener('click', () => replay(stage, o));

  root.append(stage, button);
  return root;
}

export function createAtomSizes(opts = {}) {
  const o = { ...ATOM_DEFAULTS, ...opts };
  const root = document.createElement('div');
  root.className = 'atom-study atom-sizes';
  root.style.setProperty('--atom-bg', o.background);
  root.style.setProperty('--atom-ink', o.ink);

  // Strokes are in viewBox units, so hold a ~1.5px minimum as the logo shrinks.
  const minStroke = (size) => Math.max(o.strokeWidth, (1.5 * VIEW) / size);
  [
    { size: 256 },
    { size: 128 },
    { size: 64, trail: false, simpleNucleus: true },
    { size: 32, trail: false, simpleNucleus: true, orbits: Math.min(o.orbits, 3) },
  ].forEach(({ size, ...rest }) => {
    rest.strokeWidth = minStroke(size);
    const cell = document.createElement('figure');
    cell.className = 'atom-size';
    const atom = createAtom({ ...o, ...rest });
    atom.style.width = `${size}px`;
    atom.style.height = `${size}px`;
    const cap = document.createElement('figcaption');
    cap.textContent = `${size}px`;
    cell.append(atom, cap);
    root.append(cell);
  });
  return root;
}
