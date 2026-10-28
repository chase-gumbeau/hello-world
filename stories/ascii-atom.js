/**
 * ASCII atom — the atom logo drawn in characters. Orbits and the nucleus draw on,
 * then electrons travel the orbits trailing fading characters, passing behind and in
 * front of the nucleus. Each frame redraws the whole grid.
 */

export const ATOM_DEFAULTS = {
  ink: '#1f1b17',
  electron: '#e2552f',
  background: '#f3f0eb',
  orbits: 3,
  cols: 72,
  speed: 1,
  tilt: 70,
  trail: true,
  simpleNucleus: false,
};

// A character cell's width over its height (0.6em wide at line-height 1.1).
const CELL = 0.6 / 1.1;
const FPS = 30;
// The atom's proportions, as shares of its half-width (from the original 400-unit logo).
const ORBIT_R = 0.8;
const NUCLEON_R = 0.065;
// Draw-on timing, in seconds: each orbit, then the nucleus; electrons after.
const ORBIT_DRAW = 1.1;
const ORBIT_STAGGER = 0.18;
const NUCLEUS_AT = 0.5;
const NUCLEUS_DRAW = 0.7;
const ELECTRONS_AT = 1.1;
// What's drawn over what: far electrons, then orbits, the nucleus, near electrons.
const LAYER = { back: 1, orbit: 2, nucleus: 3, front: 4 };
// An electron's trail, nearest first.
const TRAIL = ['o', 'o', '*', '*', '+', '+', ':', ':', ':', '.', '.', '.', '.', '.'];

/** A point on an orbit: a circle tilted to height `ry`, spun by `phi` in the screen plane. */
function orbitPoint(theta, ry, phi) {
  const x = ORBIT_R * Math.cos(theta);
  const y = ry * Math.sin(theta);
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  // sin(theta) > 0 is the near half of the tilted ring.
  return { x: x * c - y * s, y: x * s + y * c, z: Math.sin(theta) };
}

/** The character for a line heading (dx, dy) across the grid. */
function slopeChar(dx, dy) {
  const a = ((Math.atan2(dy, dx) * 180) / Math.PI + 180) % 180;
  if (a < 22.5 || a >= 157.5) return '-';
  if (a < 67.5) return '\\';
  if (a < 112.5) return '|';
  return '/';
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * Builds the ASCII atom and starts its animation. Returns the root element; the
 * animation stops itself once the element leaves the document.
 */
export function createAsciiAtom(opts = {}) {
  const o = { ...ATOM_DEFAULTS, ...opts };
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const cols = Math.round(o.cols);
  const rows = Math.round(cols * CELL);
  const ry = ORBIT_R * Math.cos((o.tilt * Math.PI) / 180);
  const count = Math.max(1, Math.round(o.orbits));

  const pre = document.createElement('pre');
  pre.className = 'ascii-atom';
  pre.setAttribute('role', 'img');
  pre.setAttribute('aria-label', 'Atom logo in ASCII characters');
  pre.style.setProperty('--cols', cols);
  pre.style.setProperty('--rows', rows);
  pre.style.setProperty('--atom-ink', o.ink);
  pre.style.setProperty('--atom-electron', o.electron);

  // Grid coordinates for a point in the atom's space (-1 to 1 across).
  const toCol = (x) => Math.round(((x + 1) / 2) * (cols - 1));
  const toRow = (y) => Math.round(((y + 1) / 2) * (rows - 1));

  const electrons = Array.from({ length: count }, (_, i) => ({
    phi: (Math.PI * i) / count,
    theta: (i * 2.1) % (Math.PI * 2),
    pace: 1.6 + i * 0.22, // slight per-orbit variance keeps it from feeling mechanical
  }));

  const nucleons = [{ x: 0, y: 0 }];
  for (let k = 0; k < (o.simpleNucleus ? 0 : 6); k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    nucleons.push({ x: Math.cos(a) * NUCLEON_R * 1.05, y: Math.sin(a) * NUCLEON_R * 1.05 });
  }

  /** Draws the atom `t` seconds in (Infinity: fully drawn, electrons parked). */
  const render = (t) => {
    const chars = new Array(cols * rows).fill(' ');
    const layer = new Uint8Array(cols * rows);
    const fade = new Array(cols * rows).fill(null); // electron cells: their opacity
    const put = (x, y, ch, level, opacity = null) => {
      const col = toCol(x);
      const row = toRow(y);
      if (col < 0 || col >= cols || row < 0 || row >= rows) return;
      const i = row * cols + col;
      if (level < layer[i]) return;
      chars[i] = ch;
      layer[i] = level;
      fade[i] = opacity;
    };

    // Orbits, each drawing on in turn.
    const steps = cols * 8;
    electrons.forEach(({ phi }, i) => {
      const drawn = clamp01((t - i * ORBIT_STAGGER) / ORBIT_DRAW);
      for (let k = 0; k < steps * drawn; k++) {
        const theta = (k / steps) * Math.PI * 2;
        const p = orbitPoint(theta, ry, phi);
        const q = orbitPoint(theta + 0.01, ry, phi);
        put(p.x, p.y, slopeChar((q.x - p.x) * cols, (q.y - p.y) * rows), LAYER.orbit);
      }
    });

    // The nucleus: overlapping nucleons, drawing on after the orbits start. Each ring
    // is drawn only where no other nucleon covers it, so the cluster reads as a
    // scalloped outline (like the original's stroked circles) rather than a solid block.
    const shown = nucleons.slice(0, Math.ceil(nucleons.length * clamp01((t - NUCLEUS_AT) / NUCLEUS_DRAW)));
    const covered = (x, y, self) =>
      shown.some((m) => m !== self && Math.hypot(x - m.x, y - m.y) < NUCLEON_R * 0.92);
    shown.forEach((n) => {
      const ring = Math.max(12, Math.round(cols * NUCLEON_R * 8));
      for (let k = 0; k < ring; k++) {
        const a = (k / ring) * Math.PI * 2;
        const x = n.x + Math.cos(a) * NUCLEON_R;
        const y = n.y + Math.sin(a) * NUCLEON_R;
        if (!covered(x, y, n)) put(x, y, 'o', LAYER.nucleus);
      }
    });

    // Electrons and their trails, once the orbits are in.
    if (t >= ELECTRONS_AT) {
      const fadeIn = Number.isFinite(t) ? clamp01((t - ELECTRONS_AT) / 0.4) : 1;
      electrons.forEach((e) => {
        const p = orbitPoint(e.theta, ry, e.phi);
        const level = p.z >= 0 ? LAYER.front : LAYER.back;
        if (o.trail) {
          for (let k = TRAIL.length - 1; k >= 0; k--) {
            const q = orbitPoint(e.theta - (k + 1) * 0.035, ry, e.phi);
            put(q.x, q.y, TRAIL[k], level, fadeIn * 0.85 * (1 - k / TRAIL.length));
          }
        }
        // Far electrons read a little fainter, as in the original.
        put(p.x, p.y, '@', level, fadeIn * (p.z >= 0 ? 1 : 0.55));
      });
    }

    // One line per row; electron cells are colored and faded.
    let html = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        html += fade[i] === null ? chars[i] : `<span class="ascii-atom__e" style="opacity:${fade[i].toFixed(2)}">${chars[i]}</span>`;
      }
      html += '\n';
    }
    pre.innerHTML = html;
  };

  if (reduced) {
    render(Infinity);
    return pre;
  }

  const start = performance.now();
  let last = null;
  let frame = 0;
  let mounted = false;
  const tick = (now) => {
    if (pre.isConnected) mounted = true;
    else if (mounted) return; // story unmounted
    frame = requestAnimationFrame(tick);
    if (last !== null && now - last < 1000 / FPS) return;
    const dt = Math.min(0.05, (now - (last ?? now)) / 1000);
    last = now;
    const t = (now - start) / 1000;
    if (t >= ELECTRONS_AT) electrons.forEach((e) => (e.theta += dt * o.speed * e.pace));
    render(t);
  };
  frame = requestAnimationFrame(tick);
  pre.stopAtom = () => cancelAnimationFrame(frame);
  return pre;
}

/** Restarts the draw-on by swapping in a fresh atom. */
function replay(stage, opts) {
  const old = stage.querySelector('.ascii-atom');
  old?.stopAtom?.();
  old?.remove();
  stage.append(createAsciiAtom(opts));
}

export function createAsciiAtomSolo(opts = {}) {
  const o = { ...ATOM_DEFAULTS, ...opts };
  const root = document.createElement('div');
  root.className = 'atom-study';
  root.style.setProperty('--atom-bg', o.background);
  root.style.setProperty('--atom-ink', o.ink);

  const stage = document.createElement('div');
  stage.className = 'atom-stage';
  stage.append(createAsciiAtom(o));

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'atom-replay';
  button.textContent = 'Replay';
  button.addEventListener('click', () => replay(stage, o));

  root.append(stage, button);
  return root;
}

/** The atom at four grid densities, from detailed to icon-sized. */
export function createAsciiAtomSizes(opts = {}) {
  const o = { ...ATOM_DEFAULTS, ...opts };
  const root = document.createElement('div');
  root.className = 'atom-study atom-sizes';
  root.style.setProperty('--atom-bg', o.background);
  root.style.setProperty('--atom-ink', o.ink);

  [
    { cols: 72 },
    { cols: 48 },
    // Coarse grids keep a single nucleon and no trail so the centre doesn't clog.
    { cols: 32, trail: false, simpleNucleus: true },
    { cols: 20, trail: false, simpleNucleus: true, orbits: Math.min(o.orbits, 3) },
  ].forEach((size) => {
    const cell = document.createElement('figure');
    cell.className = 'atom-size';
    const stage = document.createElement('div');
    stage.className = 'atom-size__stage';
    stage.append(createAsciiAtom({ ...o, ...size }));
    const cap = document.createElement('figcaption');
    cap.textContent = `${size.cols} columns`;
    cell.append(stage, cap);
    root.append(cell);
  });
  return root;
}
