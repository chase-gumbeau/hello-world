/**
 * 3D Icons study — four ways to give a flat 24px glyph depth.
 * CSS layer extrusion, SVG lighting (clay), layered glass parallax,
 * and WebGL raymarched signed distance fields.
 */

function starPath(cx, cy, outer, inner) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 ? inner : outer;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    d += `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
}

// Polygon vertices are in the 24-unit SVG grid; the raymarcher maps them to SDF space.
export const ICONS = {
  heart: {
    label: 'Heart',
    color: '#ff5a5f',
    path: 'M12 21s-7.5-4.6-9.6-9.3C1 8.4 3 5 6.5 5c2.1 0 3.6 1.1 4.5 2.6C11.9 6.1 13.4 5 15.5 5 19 5 21 8.4 19.6 11.7 17.5 16.4 12 21 12 21z',
    sdf: { shape: 1 },
  },
  star: {
    label: 'Star',
    color: '#ffb020',
    path: starPath(12, 12.6, 10.5, 4.6),
    sdf: { shape: 2 },
  },
  bolt: {
    label: 'Bolt',
    color: '#7b61ff',
    path: 'M13 2 4 14h6l-1 8 9-12h-6l1-8z',
    sdf: { shape: 0, verts: [[13, 2], [4, 14], [10, 14], [9, 22], [18, 10], [12, 10]] },
  },
  home: {
    label: 'Home',
    color: '#19b394',
    path: 'M3 11 12 3l9 8v10h-6v-6H9v6H3z',
    sdf: {
      shape: 0,
      verts: [[3, 11], [12, 3], [21, 11], [21, 21], [15, 21], [15, 15], [9, 15], [9, 21], [3, 21]],
    },
  },
  chat: {
    label: 'Chat',
    color: '#2f80ff',
    path: 'M3 5h18v12H10l-5 4v-4H3z',
    sdf: { shape: 0, verts: [[3, 5], [21, 5], [21, 17], [10, 17], [5, 21], [5, 17], [3, 17]] },
  },
};

export const ICON_KEYS = Object.keys(ICONS);

export const TECHNIQUES = {
  extrude: {
    label: 'Extruded layers',
    how: 'The glyph is stacked as ~18 SVG planes in a preserve-3d context, each pushed 1px back and darkened, so the sides read as solid.',
    cost: 'CSS 3D · 1 DOM node per pixel of depth',
  },
  clay: {
    label: 'Clay',
    how: 'A blurred copy of the alpha becomes a height map; feDiffuseLighting and feSpecularLighting shade it like soft, inflated plastic.',
    cost: 'One SVG filter · 2D, no geometry',
  },
  glass: {
    label: 'Layered glass',
    how: 'A colored plate sits behind a frosted glyph clipped with clip-path; the two layers drift apart with the pointer for parallax.',
    cost: 'backdrop-filter · 2.5D parallax',
  },
  ray: {
    label: 'Raymarched SDF',
    how: 'The glyph is a 2D signed distance field, extruded and rounded in a fragment shader, then lit with key, fill, AO and fresnel.',
    cost: 'WebGL2 · real geometry, per-pixel lighting',
  },
};

const SVG_NS = 'http://www.w3.org/2000/svg';
let uid = 0;
const nextId = (prefix) => `i3d-${prefix}-${++uid}`;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ---------- Shared frame loop ---------- */

// One rAF for every study instance; tasks drop out once their root leaves the DOM.
const tasks = new Set();
let raf = 0;

function tick(now) {
  for (const task of tasks) {
    if (!task.el.isConnected) {
      if (task.seen || now - task.born > 3000) {
        task.dispose();
        tasks.delete(task);
      }
      continue;
    }
    task.seen = true;
    task.frame(now);
  }
  raf = tasks.size ? requestAnimationFrame(tick) : 0;
}

function schedule(task) {
  tasks.add({ seen: false, born: performance.now(), ...task });
  if (!raf) raf = requestAnimationFrame(tick);
}

/* ---------- Tilt controller ---------- */

// Pointer position over the root drives every tile; idles with a slow sway otherwise.
export function attachTilt(root) {
  const reduced = prefersReducedMotion();
  const state = { x: 0, y: 0, tx: 0, ty: 0, hover: false, time: 0, reduced };
  const updaters = [];
  const disposers = [];

  const onMove = (event) => {
    const rect = root.getBoundingClientRect();
    state.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.ty = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    state.hover = true;
  };
  const onLeave = () => {
    state.hover = false;
  };
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerleave', onLeave);

  let last = 0;
  schedule({
    el: root,
    frame(now) {
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      if (!reduced) state.time += dt / 1000;
      if (!state.hover) {
        state.tx = reduced ? 0 : Math.sin(state.time * 0.55) * 0.55;
        state.ty = reduced ? 0 : Math.sin(state.time * 0.4 + 1.2) * 0.3;
      }
      const ease = 1 - Math.pow(0.001, dt / 1000);
      state.x += (state.tx - state.x) * ease;
      state.y += (state.ty - state.y) * ease;

      root.style.setProperty('--i3d-rx', `${(-state.y * 22).toFixed(2)}deg`);
      root.style.setProperty('--i3d-ry', `${(state.x * 30).toFixed(2)}deg`);
      root.style.setProperty('--i3d-px', state.x.toFixed(3));
      root.style.setProperty('--i3d-py', state.y.toFixed(3));
      for (const update of updaters) update(state);
    },
    dispose() {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      for (const dispose of disposers) dispose();
    },
  });

  return { state, updaters, disposers };
}

/* ---------- Helpers ---------- */

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}

function glyphSvg(className) {
  return svgEl('svg', {
    class: className,
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
    focusable: 'false',
  });
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* ---------- 1. Extruded layers ---------- */

function createExtrude(icon, color, { depth = 18 } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'i3d-extrude';

  const layers = Math.max(2, Math.round(depth));
  for (let i = layers; i >= 1; i--) {
    const svg = glyphSvg('i3d-extrude__layer');
    svg.style.transform = `translateZ(${-i}px)`;
    // Darken toward the back so the sides have a falloff instead of a flat band.
    const shade = 62 - (i / layers) * 22;
    svg.append(svgEl('path', { d: icon.path, fill: `color-mix(in oklab, ${color} ${shade}%, #1b1220)` }));
    wrap.append(svg);
  }

  const front = glyphSvg('i3d-extrude__layer i3d-extrude__front');
  const gradId = nextId('face');
  const defs = svgEl('defs');
  const grad = svgEl('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0.4', y2: '1' });
  grad.append(
    svgEl('stop', { offset: '0', 'stop-color': `color-mix(in oklab, ${color} 62%, white)` }),
    svgEl('stop', { offset: '0.55', 'stop-color': color }),
    svgEl('stop', { offset: '1', 'stop-color': `color-mix(in oklab, ${color} 82%, #1b1220)` }),
  );
  defs.append(grad);
  front.append(
    defs,
    svgEl('path', { d: icon.path, fill: `url(#${gradId})` }),
    svgEl('path', {
      d: icon.path,
      fill: 'none',
      stroke: 'rgba(255,255,255,0.55)',
      'stroke-width': '0.35',
      'stroke-linejoin': 'round',
      class: 'i3d-extrude__rim',
    }),
  );
  wrap.append(front);
  return wrap;
}

/* ---------- 2. Clay ---------- */

function createClay(icon, color, tilt) {
  const svg = glyphSvg('i3d-clay');
  const filterId = nextId('clay');

  const filter = svgEl('filter', {
    id: filterId,
    x: '-20%',
    y: '-20%',
    width: '140%',
    height: '140%',
    'color-interpolation-filters': 'sRGB',
  });
  const point = svgEl('fePointLight', { x: '4', y: '0', z: '30' });
  const distant = svgEl('feDistantLight', { azimuth: '235', elevation: '50' });
  const diffuse = svgEl('feDiffuseLighting', {
    in: 'height',
    surfaceScale: '3.2',
    diffuseConstant: '1.2',
    'lighting-color': '#ffffff',
    result: 'diffuse',
  });
  diffuse.append(distant);
  const specular = svgEl('feSpecularLighting', {
    in: 'height',
    surfaceScale: '3.2',
    specularConstant: '0.9',
    specularExponent: '22',
    'lighting-color': '#ffffff',
    result: 'specular',
  });
  specular.append(point);

  filter.append(
    svgEl('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: '1.15', result: 'height' }),
    diffuse,
    svgEl('feComposite', { in: 'SourceGraphic', in2: 'diffuse', operator: 'arithmetic', k1: '1', result: 'lit' }),
    specular,
    svgEl('feComposite', { in: 'specular', in2: 'SourceAlpha', operator: 'in', result: 'shine' }),
    svgEl('feComposite', { in: 'lit', in2: 'shine', operator: 'arithmetic', k2: '1', k3: '0.75' }),
  );

  const defs = svgEl('defs');
  defs.append(filter);
  svg.append(defs, svgEl('path', { d: icon.path, fill: color, filter: `url(#${filterId})` }));

  // Swing the lights opposite the pointer so the highlight stays "in the room".
  tilt.updaters.push((state) => {
    point.setAttribute('x', (8 - state.x * 10).toFixed(2));
    point.setAttribute('y', (2 - state.y * 8).toFixed(2));
    distant.setAttribute('azimuth', (235 - state.x * 40).toFixed(1));
  });
  return svg;
}

/* ---------- 3. Layered glass ---------- */

function createGlass(icon, color) {
  const wrap = document.createElement('div');
  wrap.className = 'i3d-glass';
  wrap.style.setProperty('--i3d-c', color);

  const clipId = nextId('glass-clip');
  const rimId = nextId('glass-rim');
  const defsSvg = svgEl('svg', { class: 'i3d-defs', width: '0', height: '0', 'aria-hidden': 'true' });
  const clip = svgEl('clipPath', { id: clipId, clipPathUnits: 'objectBoundingBox' });
  clip.append(svgEl('path', { d: icon.path, transform: 'scale(0.0416667)' }));
  const rim = svgEl('linearGradient', { id: rimId, x1: '0', y1: '0', x2: '1', y2: '1' });
  rim.append(
    svgEl('stop', { offset: '0', 'stop-color': 'rgba(255,255,255,0.95)' }),
    svgEl('stop', { offset: '0.5', 'stop-color': 'rgba(255,255,255,0.2)' }),
    svgEl('stop', { offset: '1', 'stop-color': 'rgba(255,255,255,0.7)' }),
  );
  defsSvg.append(clip, rim);

  const back = document.createElement('div');
  back.className = 'i3d-glass__back';

  const front = document.createElement('div');
  front.className = 'i3d-glass__front';
  const pane = document.createElement('div');
  pane.className = 'i3d-glass__pane';
  pane.style.clipPath = `url(#${clipId})`;
  const edge = glyphSvg('i3d-glass__edge');
  edge.append(
    svgEl('path', {
      d: icon.path,
      fill: 'none',
      stroke: `url(#${rimId})`,
      'stroke-width': '0.6',
      'stroke-linejoin': 'round',
    }),
  );
  front.append(pane, edge);

  wrap.append(defsSvg, back, front);
  return wrap;
}

/* ---------- 4. Raymarched SDF ---------- */

const RAY_VERT = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const RAY_FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_tilt;
uniform int u_shape;
uniform int u_n;
uniform vec2 u_v[12];
uniform vec3 u_color;
uniform float u_depth;

const float ROUND = 0.11;
float gRx;
float gRy;

float dot2(vec2 v) { return dot(v, v); }

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float sdHeart(vec2 p) {
  p.x = abs(p.x);
  if (p.y + p.x > 1.0) return sqrt(dot2(p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
  return sqrt(min(dot2(p - vec2(0.0, 1.0)), dot2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}

float sdStar5(vec2 p, float r, float rf) {
  const vec2 k1 = vec2(0.809016994375, -0.587785252292);
  const vec2 k2 = vec2(-k1.x, k1.y);
  p.x = abs(p.x);
  p -= 2.0 * max(dot(k1, p), 0.0) * k1;
  p -= 2.0 * max(dot(k2, p), 0.0) * k2;
  p.x = abs(p.x);
  p.y -= r;
  vec2 ba = rf * vec2(-k1.y, k1.x) - vec2(0.0, 1.0);
  float h = clamp(dot(p, ba) / dot(ba, ba), 0.0, r);
  return length(p - ba * h) * sign(p.y * ba.x - p.x * ba.y);
}

float sdPoly(vec2 p) {
  float d = dot2(p - u_v[0]);
  float s = 1.0;
  int j = u_n - 1;
  for (int i = 0; i < 12; i++) {
    if (i >= u_n) break;
    vec2 e = u_v[j] - u_v[i];
    vec2 w = p - u_v[i];
    vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
    d = min(d, dot(b, b));
    bvec3 c = bvec3(p.y >= u_v[i].y, p.y < u_v[j].y, e.x * w.y > e.y * w.x);
    if (all(c) || all(not(c))) s *= -1.0;
    j = i;
  }
  return s * sqrt(d);
}

float shape2d(vec2 p) {
  if (u_shape == 1) {
    vec2 q = (p - vec2(0.0, -1.0)) / 1.8;
    return sdHeart(q) * 1.8;
  }
  if (u_shape == 2) return sdStar5(p - vec2(0.0, -0.06), 1.22, 0.46);
  return sdPoly(p);
}

float map(vec3 p) {
  p.xz = rot(gRy) * p.xz;
  p.yz = rot(gRx) * p.yz;
  float d2 = shape2d(p.xy) + ROUND;
  vec2 w = vec2(d2, abs(p.z) - (u_depth - ROUND));
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - ROUND;
}

vec3 calcNormal(vec3 p) {
  const vec2 k = vec2(1.0, -1.0);
  const float h = 0.0015;
  return normalize(
    k.xyy * map(p + k.xyy * h) +
    k.yyx * map(p + k.yyx * h) +
    k.yxy * map(p + k.yxy * h) +
    k.xxx * map(p + k.xxx * h)
  );
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.02 + 0.1 * float(i);
    occ += (h - map(p + h * n)) * sca;
    sca *= 0.85;
  }
  return clamp(1.0 - 1.5 * occ, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  // A resting three-quarter angle so the depth reads even with no pointer.
  gRy = u_tilt.x * 0.95 - 0.38;
  gRx = u_tilt.y * 0.6 + 0.2 + sin(u_time * 0.9) * 0.04;

  vec3 ro = vec3(0.0, 0.0, 4.2);
  vec3 rd = normalize(vec3(uv, -1.25));

  float t = 0.0;
  float edge = 1e9;
  float tEdge = 4.2;
  bool hit = false;
  for (int i = 0; i < 110; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0006 * t) { hit = true; break; }
    if (t > 0.5 && d / t < edge) { edge = d / t; tEdge = t; }
    t += d * 0.9;
    if (t > 8.0) break;
  }

  // Coverage from the closest miss gives the silhouette analytic-ish antialiasing.
  float px = 1.0 / (u_res.y * 1.25);
  float alpha = hit ? 1.0 : 1.0 - smoothstep(0.0, 1.6 * px, edge);
  if (alpha <= 0.0) {
    outColor = vec4(0.0);
    return;
  }

  vec3 p = ro + rd * (hit ? t : tEdge);
  vec3 n = calcNormal(p);
  vec3 base = pow(u_color, vec3(2.2));

  vec3 key = normalize(vec3(-0.55, 0.75, 0.65));
  vec3 fill = normalize(vec3(0.7, -0.15, 0.4));
  float dif = clamp(dot(n, key), 0.0, 1.0);
  float fil = clamp(dot(n, fill), 0.0, 1.0);
  float amb = 0.55 + 0.45 * n.y;
  float ao = calcAO(p, n);
  vec3 hv = normalize(key - rd);
  float spe = pow(clamp(dot(n, hv), 0.0, 1.0), 56.0);
  float fre = pow(clamp(1.0 + dot(n, rd), 0.0, 1.0), 3.0);

  vec3 col = base * (0.32 * amb * vec3(0.92, 0.96, 1.08) + 1.05 * dif) * ao;
  col += base * fil * 0.28;
  col += vec3(1.0) * spe * 0.85 * (0.4 + 0.6 * ao);
  col += mix(base, vec3(1.0), 0.65) * fre * 0.4 * ao;
  col = pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2));

  outColor = vec4(col * alpha, alpha);
}`;

export function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[3D Icons] shader error', gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function createRay(icon, color, tilt, { depth = 0.3 } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'i3d-ray';
  const canvas = document.createElement('canvas');
  canvas.className = 'i3d-ray__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  wrap.append(canvas);

  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false });
  const vs = gl && compile(gl, gl.VERTEX_SHADER, RAY_VERT);
  const fs = gl && compile(gl, gl.FRAGMENT_SHADER, RAY_FRAG);
  if (!gl || !vs || !fs) {
    wrap.classList.add('i3d-ray--fallback');
    wrap.textContent = 'WebGL2 unavailable';
    return wrap;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name) => gl.getUniformLocation(program, name);
  const uRes = u('u_res');
  const uTime = u('u_time');
  const uTilt = u('u_tilt');

  gl.uniform1i(u('u_shape'), icon.sdf.shape);
  gl.uniform3fv(u('u_color'), hexToRgb(color));
  gl.uniform1f(u('u_depth'), depth);
  if (icon.sdf.verts) {
    // 24-unit SVG grid (y down) -> SDF space centered on the glyph (y up).
    const flat = icon.sdf.verts.flatMap(([x, y]) => [(x - 12) / 8.6, (12 - y) / 8.6]);
    gl.uniform1i(u('u_n'), icon.sdf.verts.length);
    gl.uniform2fv(u('u_v[0]'), new Float32Array(flat));
  } else {
    gl.uniform1i(u('u_n'), 1);
    gl.uniform2fv(u('u_v[0]'), new Float32Array([0, 0]));
  }

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(wrap);

  let lastKey = '';
  tilt.updaters.push((state) => {
    if (!visible) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (!w || !h) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    // Skip redundant frames once the tilt has settled (reduced motion, no pointer).
    const key = `${w}x${h}:${state.x.toFixed(4)}:${state.y.toFixed(4)}:${state.time.toFixed(3)}`;
    if (key === lastKey) return;
    lastKey = key;

    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uTime, state.time);
    gl.uniform2f(uTilt, state.x, -state.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });

  tilt.disposers.push(() => {
    io.disconnect();
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  });

  return wrap;
}

/* ---------- Tiles & layouts ---------- */

function createTile(technique, iconKey, tilt, { color, depth, size } = {}) {
  const icon = ICONS[iconKey] ?? ICONS.heart;
  const tint = color || icon.color;

  const figure = document.createElement('figure');
  figure.className = `i3d-tile i3d-tile--${technique}`;
  if (size) figure.style.setProperty('--i3d-size', `${size}px`);

  const stage = document.createElement('div');
  stage.className = 'i3d-tile__stage';

  let art;
  if (technique === 'extrude') art = createExtrude(icon, tint, { depth });
  else if (technique === 'clay') art = createClay(icon, tint, tilt);
  else if (technique === 'glass') art = createGlass(icon, tint);
  else art = createRay(icon, tint, tilt, depth ? { depth: depth / 60 } : undefined);
  stage.append(art);

  const caption = document.createElement('figcaption');
  caption.className = 'i3d-tile__label';
  caption.textContent = icon.label;

  figure.append(stage, caption);
  figure.setAttribute('aria-label', `${icon.label} icon, ${TECHNIQUES[technique].label.toLowerCase()}`);
  return figure;
}

function createSection(technique, index, tilt) {
  const meta = TECHNIQUES[technique];
  const section = document.createElement('section');
  section.className = 'i3d-section';
  section.innerHTML = `
    <div class="i3d-section__meta">
      <span class="i3d-section__index">${String(index + 1).padStart(2, '0')}</span>
      <h2 class="i3d-section__title">${meta.label}</h2>
      <p class="i3d-section__how">${meta.how}</p>
      <p class="i3d-section__cost">${meta.cost}</p>
    </div>
  `;
  const row = document.createElement('div');
  row.className = 'i3d-section__row';
  for (const key of ICON_KEYS) row.append(createTile(technique, key, tilt));
  section.append(row);
  return section;
}

function createRoot(modifier) {
  const root = document.createElement('main');
  root.className = `i3d-study${modifier ? ` i3d-study--${modifier}` : ''}`;
  return root;
}

/** `hero(tilt)` returns an optional feature figure placed beside the header. */
export function createShowcase({ hero } = {}) {
  const root = createRoot();
  const tilt = attachTilt(root);
  root.innerHTML = `
    <header class="i3d-header">
      <div class="i3d-header__copy">
        <p class="i3d-eyebrow">Study</p>
        <h1 class="i3d-title">3D Icons</h1>
        <p class="i3d-lede">
          Four ways to give a flat 24px glyph depth, from stacked CSS planes to a raymarched
          distance field. Move the pointer over the page to turn every icon at once.
        </p>
      </div>
    </header>
  `;
  if (hero) root.querySelector('.i3d-header').append(hero(tilt));
  Object.keys(TECHNIQUES).forEach((technique, i) => root.append(createSection(technique, i, tilt)));
  return root;
}

export function createSolo({ technique = 'extrude', icon = 'heart', color, depth } = {}) {
  const root = createRoot('solo');
  const tilt = attachTilt(root);
  const meta = TECHNIQUES[technique];
  root.append(createTile(technique, icon, tilt, { color, depth, size: 240 }));
  const note = document.createElement('p');
  note.className = 'i3d-solo__note';
  note.innerHTML = `<strong>${meta.label}</strong> · ${meta.cost}`;
  root.append(note);
  return root;
}
