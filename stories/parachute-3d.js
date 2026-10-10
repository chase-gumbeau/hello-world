/**
 * Parachute — a hero 3D icon in the soft, toy-like Airbnb style.
 * One raymarched WebGL2 scene: billowing purple canopy, suspension lines,
 * and a woven basket that swings like a pendulum.
 */

import { attachTilt, compile } from './icons-3d.js';

export const PARACHUTE_DEFAULTS = {
  canopy: '#8b5cf6',
  canopyAlt: '#c4b0ff',
  basket: '#c98a4b',
};

const VERT = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_tilt;
uniform vec3 u_canopyA;
uniform vec3 u_canopyB;
uniform vec3 u_basket;

const float PI = 3.14159265;
const float GORES = 8.0;
const float SECTOR = 2.0 * PI / GORES;
const float R = 1.05;
const float FLAT = 1.15;          // squashes the dome so it reads as a canopy, not a ball
const float HEM = -0.18;          // hem height at the seams, relative to the canopy center
const vec3 CANOPY_C = vec3(0.0, 0.5, 0.0);
const vec3 BASKET_C = vec3(0.0, -1.08, 0.0);

float gSway;
float gYaw;
float gBob;
float gBreath;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// World -> object space: bob, pendulum swing about the canopy, slow turntable spin.
vec3 toLocal(vec3 p) {
  p.y -= gBob;
  p -= CANOPY_C;
  p.xy = rot(gSway) * p.xy;
  p.xz = rot(gYaw) * p.xz;
  return p + CANOPY_C;
}

// 0 on a seam, 1 in the middle of a gore.
float goreProfile(float a) {
  return abs(sin(a * GORES * 0.5));
}

float canopyRadius(float g) {
  return R * (0.955 + 0.045 * sqrt(g)) * gBreath;
}

float sdCanopy(vec3 p) {
  vec3 q = p - CANOPY_C;
  float g = goreProfile(atan(q.z, q.x));
  vec3 s = q * vec3(1.0, FLAT, 1.0);
  float shell = (abs(length(s) - canopyRadius(g)) - 0.032) / FLAT;
  // Scalloped hem: pulled down at the seams where the lines attach.
  float hem = HEM + 0.11 * g;
  return max(shell, hem - q.y);
}

float sdVent(vec3 p) {
  vec3 q = p - CANOPY_C - vec3(0.0, R * gBreath / FLAT - 0.01, 0.0);
  q.y *= 1.6;
  return (length(q) - 0.11) / 1.6;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdLines(vec3 p) {
  float a = atan(p.z, p.x);
  float an = mod(a + SECTOR * 0.5, SECTOR) - SECTOR * 0.5;
  float rr = length(p.xz);
  vec3 s = vec3(rr * cos(an), p.y, rr * sin(an));
  vec3 top = vec3(0.965 * gBreath, CANOPY_C.y + HEM + 0.01, 0.0);
  vec3 bottom = vec3(0.33, BASKET_C.y + 0.29, 0.0);
  return sdCapsule(s, top, bottom, 0.013);
}

float sdBasket(vec3 p) {
  vec3 q = p - BASKET_C;
  const float h = 0.24;
  float rad = 0.31 + 0.06 * (q.y / h);   // slight taper, wider at the top
  vec2 d = vec2(length(q.xz) - rad, abs(q.y) - h);
  float body = (min(max(d.x, d.y), 0.0) + length(max(d, 0.0))) * 0.9 - 0.04;
  float hollow = max(length(q.xz) - (rad - 0.04), -0.1 - q.y);
  return max(body, -hollow);
}

float sdRim(vec3 p) {
  vec3 q = p - BASKET_C - vec3(0.0, 0.27, 0.0);
  vec2 t = vec2(length(q.xz) - 0.36, q.y);
  return length(t) - 0.055;
}

// x = distance, y = material (1 canopy, 2 vent, 3 lines, 4 basket, 5 rim)
vec2 map(vec3 pw) {
  vec3 p = toLocal(pw);
  vec2 res = vec2(sdCanopy(p), 1.0);
  float d = sdVent(p);
  if (d < res.x) res = vec2(d, 2.0);
  d = sdLines(p);
  if (d < res.x) res = vec2(d, 3.0);
  d = sdBasket(p);
  if (d < res.x) res = vec2(d, 4.0);
  d = sdRim(p);
  if (d < res.x) res = vec2(d, 5.0);
  return res;
}

vec3 calcNormal(vec3 p) {
  const vec2 k = vec2(1.0, -1.0);
  const float h = 0.0012;
  return normalize(
    k.xyy * map(p + k.xyy * h).x +
    k.yyx * map(p + k.yyx * h).x +
    k.yxy * map(p + k.yxy * h).x +
    k.xxx * map(p + k.xxx * h).x
  );
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.02 + 0.09 * float(i);
    occ += (h - map(p + h * n).x) * sca;
    sca *= 0.82;
  }
  return clamp(1.0 - 1.6 * occ, 0.0, 1.0);
}

float softShadow(vec3 ro, vec3 rd) {
  float res = 1.0;
  float t = 0.03;
  for (int i = 0; i < 40; i++) {
    float h = map(ro + rd * t).x;
    res = min(res, 9.0 * h / t);
    t += clamp(h, 0.02, 0.18);
    if (res < 0.01 || t > 4.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;

  float t = u_time;
  gSway = sin(t * 1.1) * 0.075;
  gBob = sin(t * 0.85) * 0.06;
  gBreath = 1.0 + 0.012 * sin(t * 2.2);
  gYaw = t * 0.32 + 0.35;

  // Orbit the camera with the pointer; rest slightly above for the three-quarter look.
  float yaw = u_tilt.x * 0.55;
  float pitch = 0.3 + u_tilt.y * 0.25;
  vec3 target = vec3(0.0, -0.1, 0.0);
  vec3 ro = target + 5.0 * vec3(sin(yaw) * cos(pitch), sin(pitch), cos(yaw) * cos(pitch));
  vec3 fw = normalize(target - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 1.45 * fw);

  float dist = 0.0;
  float edge = 1e9;
  float tEdge = 5.0;
  float mat = 0.0;
  bool hit = false;
  for (int i = 0; i < 140; i++) {
    vec2 h = map(ro + rd * dist);
    if (h.x < 0.0005 * dist) { hit = true; mat = h.y; break; }
    if (dist > 1.0 && h.x / dist < edge) { edge = h.x / dist; tEdge = dist; mat = h.y; }
    dist += h.x * 0.8;
    if (dist > 10.0) break;
  }

  float px = 1.0 / (u_res.y * 1.45);
  float alpha = hit ? 1.0 : 1.0 - smoothstep(0.0, 1.6 * px, edge);
  if (alpha <= 0.0) {
    outColor = vec4(0.0);
    return;
  }

  vec3 p = ro + rd * (hit ? dist : tEdge);
  vec3 n = calcNormal(p);
  vec3 lp = toLocal(p);

  vec3 key = normalize(vec3(-0.5, 0.85, 0.55));
  vec3 fillDir = normalize(vec3(0.75, 0.1, 0.5));
  float gloss = 40.0;
  float shine = 0.55;
  float translucency = 0.0;
  vec3 base;

  if (mat < 1.5) {
    vec3 q = lp - CANOPY_C;
    float a = atan(q.z, q.x);
    float gore = mod(floor(a / SECTOR), 2.0);
    base = toLinear(mix(u_canopyA, u_canopyB, gore));
    // Underside of the canopy is in its own shade.
    float g = goreProfile(a);
    float inside = step(length(q * vec3(1.0, FLAT, 1.0)), canopyRadius(g));
    base *= mix(1.0, 0.55, inside);
    // Thin seam piping between gores.
    base = mix(base, toLinear(u_canopyA) * 0.7, (1.0 - smoothstep(0.0, 0.06, g)) * 0.6);
    gloss = 28.0;
    shine = 0.45;
    translucency = 0.35;
  } else if (mat < 2.5) {
    base = toLinear(u_canopyA) * 0.75;
    gloss = 60.0;
    shine = 0.8;
  } else if (mat < 3.5) {
    base = toLinear(vec3(0.93, 0.9, 0.98));
    shine = 0.2;
  } else {
    vec3 q = lp - BASKET_C;
    float ba = atan(q.z, q.x);
    float rows = q.y * 22.0;
    float row = floor(rows);
    // Over/under wicker: columns flip every row.
    float weave = sin(ba * 12.0 + row * PI);
    float strand = smoothstep(0.0, 0.25, abs(fract(rows) - 0.5) * 2.0);
    base = toLinear(u_basket);
    base *= 0.82 + 0.18 * weave;
    base *= mix(0.62, 1.0, 1.0 - strand * 0.6);
    if (mat > 4.5) base = toLinear(u_basket) * 0.72;
    gloss = 18.0;
    shine = 0.25;
  }

  float dif = clamp(dot(n, key), 0.0, 1.0);
  float sha = dif > 0.0 ? softShadow(p + n * 0.01, key) : 0.0;
  float fil = clamp(dot(n, fillDir), 0.0, 1.0);
  float amb = 0.6 + 0.4 * n.y;
  float ao = calcAO(p, n);
  vec3 hv = normalize(key - rd);
  float spe = pow(clamp(dot(n, hv), 0.0, 1.0), gloss) * sha;
  float fre = pow(clamp(1.0 + dot(n, rd), 0.0, 1.0), 3.0);
  float back = clamp(dot(-n, key), 0.0, 1.0) * translucency;

  vec3 col = base * (0.42 * amb * vec3(0.95, 0.95, 1.1) + 1.0 * dif * mix(0.35, 1.0, sha)) * ao;
  col += base * fil * vec3(1.0, 0.9, 1.05) * 0.3 * ao;
  col += base * back;
  col += vec3(1.0) * spe * shine;
  col += mix(base, vec3(1.0), 0.7) * fre * 0.35 * ao;
  col = pow(clamp(col * 1.05, 0.0, 1.0), vec3(1.0 / 2.2));

  outColor = vec4(col * alpha, alpha);
}`;

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function createParachuteCanvas(tilt, colors) {
  const wrap = document.createElement('div');
  wrap.className = 'i3d-parachute__art';
  const canvas = document.createElement('canvas');
  canvas.className = 'i3d-parachute__canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Purple parachute carrying a woven basket');
  wrap.append(canvas);

  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false });
  const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG);
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
  gl.uniform3fv(u('u_canopyA'), hexToRgb(colors.canopy));
  gl.uniform3fv(u('u_canopyB'), hexToRgb(colors.canopyAlt));
  gl.uniform3fv(u('u_basket'), hexToRgb(colors.basket));

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

/** Hero figure for the showcase; shares the page's tilt controller. */
export function createParachuteHero(tilt, colors = PARACHUTE_DEFAULTS) {
  const figure = document.createElement('figure');
  figure.className = 'i3d-parachute';
  figure.append(createParachuteCanvas(tilt, { ...PARACHUTE_DEFAULTS, ...colors }));
  return figure;
}

export function createParachuteSolo(colors = {}) {
  const root = document.createElement('main');
  root.className = 'i3d-study i3d-study--solo';
  const tilt = attachTilt(root);
  const figure = createParachuteHero(tilt, colors);
  figure.classList.add('i3d-parachute--solo');
  const note = document.createElement('p');
  note.className = 'i3d-solo__note';
  note.innerHTML = '<strong>Parachute</strong> · Airbnb-style hero icon, raymarched in WebGL2';
  root.append(figure, note);
  return root;
}
