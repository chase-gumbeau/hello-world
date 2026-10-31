/**
 * Light and Sound — an image played as music. A lens of light travels a scanning path
 * across the image; the colours under it become a chord.
 *
 * - Hue sets pitch. On the circle of fifths mapping, each 30° of hue is a fifth, so
 *   neighbouring hues sound consonant, triadic hues land on thirds and complementary
 *   hues (180° apart) land on the tritone. The chromatic mapping spreads the twelve
 *   semitones around the wheel instead.
 * - Lightness sets the octave; chroma sets how loud a colour is, so black is silent.
 * - White light holds every hue, so bright, colourless points (stars) ring as overtones
 *   of whatever is sounding.
 * - The path sets time: how long the lens rests on each spot, where it breathes, and
 *   which colours are in view together.
 */
import crabNebulaUrl from '../assets/light-and-sound/crab-nebula.webp';

export const LIGHT_SOUND_DEFAULTS = {
  src: crabNebulaUrl,
  title: 'Crab Nebula',
  path: 'gaze',
  mapping: 'fifths',
  tempo: 84,
  lens: 4,
  volume: 70,
};

export const PATHS = [
  {
    id: 'gaze',
    label: 'Gaze',
    summary: 'Jumps between the most striking spots, lingering longer on stronger ones, like an eye.',
  },
  {
    id: 'reading',
    label: 'Reading',
    summary: 'Left to right, top to bottom, with a breath at the end of every line.',
  },
  {
    id: 'weave',
    label: 'Weave',
    summary: 'Back and forth along each row without stopping.',
  },
  {
    id: 'spiral',
    label: 'Spiral',
    summary: 'Circles in from the edge, quickening as it tightens, and holds at the centre.',
  },
  {
    id: 'columns',
    label: 'Columns',
    summary: 'Sweeps across, sounding each column as one chord, like reading a score.',
  },
];

export const MAPPINGS = [
  { id: 'fifths', label: 'Circle of fifths' },
  { id: 'chromatic', label: 'Chromatic' },
];

const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
// How rough each interval class (0–6 semitones) sounds, 0 smooth to 1 harsh.
const ROUGHNESS = [0, 1, 0.55, 0.25, 0.2, 0.1, 0.9];
// Cells across the image's longer side.
const GRID = 48;
// Analysis samples per cell side, to catch stars that averaging would wash out.
const SUB = 6;
const MAX_VOICES = 4;
// The lowest note: C3.
const BASE_MIDI = 48;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v) => clamp(v, 0, 1);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const midiToFreq = (midi) => 440 * 2 ** ((midi - 69) / 12);

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const c = max - min;
  if (c === 0) return { h: 0, s: 0, l, c };
  const s = c / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / c) % 6;
  else if (max === g) h = (b - r) / c + 2;
  else h = (r - g) / c + 4;
  return { h: (h * 60 + 360) % 360, s, l, c };
}

/** The pitch class (0 = C) a hue sounds, on either mapping. */
export function hueToPitchClass(hue, mapping = 'fifths') {
  const step = Math.round(hue / 30) % 12;
  return mapping === 'fifths' ? (step * 7) % 12 : step;
}

/** The hue (degrees) a pitch class is drawn at on the wheel. */
function pitchClassHue(pc, mapping) {
  const step = mapping === 'fifths' ? (pc * 7) % 12 : pc;
  return step * 30;
}

/** Averages the image into a grid of cells: colour, hue, lightness, chroma and brightest point. */
export function analyseImage(img) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const cols = w >= h ? GRID : Math.max(8, Math.round((GRID * w) / h));
  const rows = h > w ? GRID : Math.max(8, Math.round((GRID * h) / w));
  const canvas = document.createElement('canvas');
  canvas.width = cols * SUB;
  canvas.height = rows * SUB;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let peak = 0;
      for (let y = 0; y < SUB; y++) {
        for (let x = 0; x < SUB; x++) {
          const i = ((row * SUB + y) * canvas.width + col * SUB + x) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          peak = Math.max(peak, (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255);
        }
      }
      const n = SUB * SUB * 255;
      const hsl = rgbToHsl(r / n, g / n, b / n);
      cells.push({ col, row, r: r / n, g: g / n, b: b / n, ...hsl, peak });
    }
  }

  // Salience, for the gaze path: colour plus contrast with the neighbours.
  for (const cell of cells) {
    let sum = 0;
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = cell.col + dx;
        const y = cell.row + dy;
        if ((dx || dy) && x >= 0 && y >= 0 && x < cols && y < rows) {
          sum += cells[y * cols + x].l;
          count++;
        }
      }
    }
    const contrast = Math.abs(cell.l - sum / count);
    const star = Math.max(0, cell.peak - cell.l - 0.35);
    cell.salience = cell.c * 0.8 + contrast * 1.6 + star * 0.6;
  }

  return { cols, rows, cells };
}

/** Cells under a lens step. */
function cellsUnder(analysis, step) {
  const { cols, rows, cells } = analysis;
  const out = [];
  if (step.shape === 'column') {
    const x0 = Math.max(0, Math.floor(step.x - step.r));
    const x1 = Math.min(cols - 1, Math.ceil(step.x + step.r) - 1);
    for (let y = 0; y < rows; y++) for (let x = x0; x <= x1; x++) out.push(cells[y * cols + x]);
    return out;
  }
  const r2 = step.r * step.r;
  for (let y = Math.max(0, Math.floor(step.y - step.r)); y < Math.min(rows, Math.ceil(step.y + step.r)); y++) {
    for (let x = Math.max(0, Math.floor(step.x - step.r)); x < Math.min(cols, Math.ceil(step.x + step.r)); x++) {
      if ((x + 0.5 - step.x) ** 2 + (y + 0.5 - step.y) ** 2 <= r2) out.push(cells[y * cols + x]);
    }
  }
  return out;
}

/**
 * The chord a lens step sounds: up to four voices, one per pitch class, loudest
 * first, plus starlight and how dissonant the voices are together.
 */
export function chordAt(analysis, step, mapping = 'fifths') {
  const under = cellsUnder(analysis, step);
  const byPc = new Map();
  let total = 0;
  let stars = 0;
  let air = 0;
  for (const cell of under) {
    // Bright, colourless points: stars and white light.
    if (cell.peak > 0.8 && cell.peak - cell.l > 0.3) stars++;
    air += cell.l * (1 - cell.s);
    const weight = cell.c;
    if (weight < 0.04) continue;
    const pc = hueToPitchClass(cell.h, mapping);
    const v = byPc.get(pc) ?? { pc, weight: 0, l: 0, s: 0, r: 0, g: 0, b: 0 };
    v.weight += weight;
    v.l += cell.l * weight;
    v.s += cell.s * weight;
    v.r += cell.r * weight;
    v.g += cell.g * weight;
    v.b += cell.b * weight;
    byPc.set(pc, v);
    total += weight;
  }

  const density = under.length ? total / under.length : 0;
  const ranked = [...byPc.values()].sort((a, b) => b.weight - a.weight);
  const top = ranked[0]?.weight ?? 0;
  const voices = ranked
    .filter((v) => v.weight >= top * 0.15)
    .slice(0, MAX_VOICES)
    .map((v) => {
      const l = v.l / v.weight;
      const octave = clamp(Math.floor(l * 3.4), 0, 2);
      const midi = BASE_MIDI + 12 * octave + v.pc;
      // Brighten the swatch so dark colours still read as their hue.
      const k = 1 / Math.max(v.r, v.g, v.b, 1e-6);
      return {
        pc: v.pc,
        midi,
        name: `${NOTE_NAMES[v.pc]}${Math.floor(midi / 12) - 1}`,
        freq: midiToFreq(midi),
        // Mostly-dark lenses play softer, but not silent.
        gain: (v.weight / total) * clamp01(Math.sqrt(density) * 1.8),
        saturation: v.s / v.weight,
        color: `rgb(${Math.round(v.r * k * 255)} ${Math.round(v.g * k * 255)} ${Math.round(v.b * k * 255)})`,
      };
    });

  return {
    voices,
    dissonance: dissonanceOf(voices),
    stars,
    air: under.length ? air / under.length : 0,
  };
}

/** How rough a set of voices sounds together, 0 to 1, weighted by their gains. Null for under two voices. */
function dissonanceOf(voices) {
  let sum = 0;
  let weight = 0;
  for (let i = 0; i < voices.length; i++) {
    for (let j = i + 1; j < voices.length; j++) {
      const d = Math.abs(voices[i].pc - voices[j].pc) % 12;
      const w = voices[i].gain * voices[j].gain;
      sum += ROUGHNESS[Math.min(d, 12 - d)] * w;
      weight += w;
    }
  }
  return weight > 0 ? sum / weight : null;
}

/**
 * The lens steps for a path, in cell coordinates: { x, y, r, shape, beats }. `lens`
 * is the lens radius in cells.
 */
export function buildPath(analysis, pathId, lens) {
  const { cols, rows, cells } = analysis;
  const r = lens;
  const spacing = r * 1.5;
  const lineStarts = (length) => {
    const n = Math.max(1, Math.round((length - r) / spacing) + 1);
    const span = length - r * 1.2;
    return Array.from({ length: n }, (_, i) => (n === 1 ? length / 2 : r * 0.6 + (span * i) / (n - 1)));
  };

  if (pathId === 'reading' || pathId === 'weave') {
    const steps = [];
    lineStarts(rows).forEach((y, line) => {
      const xs = lineStarts(cols);
      if (pathId === 'weave' && line % 2) xs.reverse();
      xs.forEach((x, i) => {
        const end = i === xs.length - 1;
        steps.push({ x, y, r, shape: 'circle', beats: pathId === 'reading' && end ? 2 : 1 });
      });
    });
    return steps;
  }

  if (pathId === 'columns') {
    const w = Math.max(0.5, r * 0.4);
    const n = Math.max(2, Math.floor(cols / (w * 2)));
    return Array.from({ length: n }, (_, i) => ({
      x: w + ((cols - 2 * w) * i) / (n - 1),
      y: rows / 2,
      r: w,
      shape: 'column',
      // A whole column is a full chord; give it room to ring.
      beats: 2,
    }));
  }

  if (pathId === 'spiral') {
    const cx = cols / 2;
    const cy = rows / 2;
    const maxR = Math.min(cols, rows) / 2 - r * 0.6;
    const turns = Math.max(1, maxR / spacing);
    const steps = [];
    // Archimedean spiral, stepped at roughly equal arc lengths, from the edge inward.
    let theta = 0;
    const thetaMax = turns * Math.PI * 2;
    while (theta < thetaMax) {
      const rad = maxR * (1 - theta / thetaMax);
      steps.push({
        x: cx + rad * Math.cos(theta - Math.PI / 2),
        y: cy + rad * Math.sin(theta - Math.PI / 2),
        r,
        shape: 'circle',
        // Quicker as it tightens.
        beats: 0.4 + 0.8 * (rad / maxR),
      });
      theta += spacing / Math.max(rad, spacing);
    }
    steps.push({ x: cx, y: cy, r, shape: 'circle', beats: 4 });
    return steps;
  }

  // Gaze: the most salient spots, kept apart, visited nearest-and-strongest first.
  const count = clamp(Math.round((cols * rows) / (r * r * 7)), 10, 36);
  const ranked = [...cells].sort((a, b) => b.salience - a.salience);
  const picks = [];
  for (const cell of ranked) {
    const x = cell.col + 0.5;
    const y = cell.row + 0.5;
    if (picks.every((p) => (p.x - x) ** 2 + (p.y - y) ** 2 >= (r * 1.7) ** 2)) {
      picks.push({ x, y, salience: cell.salience });
      if (picks.length === count) break;
    }
  }
  const maxSal = picks[0]?.salience || 1;
  const minSal = picks[picks.length - 1]?.salience ?? 0;
  const steps = [];
  let current = picks.shift();
  while (current) {
    const norm = (current.salience - minSal) / Math.max(1e-6, maxSal - minSal);
    steps.push({ x: current.x, y: current.y, r, shape: 'circle', beats: 0.5 + 2.5 * norm, saccade: true });
    let best = -1;
    let bestScore = Infinity;
    picks.forEach((p, i) => {
      const score = Math.hypot(p.x - current.x, p.y - current.y) / (0.4 + p.salience / maxSal);
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    });
    current = best >= 0 ? picks.splice(best, 1)[0] : null;
  }
  return steps;
}

/** A long reverb tail made of decaying noise. */
function makeImpulse(ctx, seconds) {
  const length = Math.round(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  }
  return buffer;
}

/** The Web Audio voices: soft tones for colours, bells for stars, a breath of noise for white light. */
class Synth {
  constructor() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.ctx = ctx;
    this.master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(ctx, 3.5);
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    this.master.connect(comp);
    this.master.connect(reverb);
    reverb.connect(wet);
    wet.connect(comp);
    comp.connect(ctx.destination);

    // White light: looping noise, band-passed high, faded in and out.
    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    this.noise = ctx.createBufferSource();
    this.noise.buffer = noise;
    this.noise.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 5200;
    band.Q.value = 0.6;
    this.airGain = ctx.createGain();
    this.airGain.gain.value = 0;
    this.noise.connect(band).connect(this.airGain).connect(this.master);
    this.noise.start();
  }

  setVolume(volume) {
    this.master.gain.setTargetAtTime((volume / 100) * 0.9, this.ctx.currentTime, 0.05);
  }

  tone({ freq, gain, saturation }, seconds, attack) {
    const { ctx } = this;
    const t = ctx.currentTime + 0.02;
    const env = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500 + saturation * 3200;
    filter.Q.value = 0.7;
    const peak = 0.16 * gain;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(peak, t + attack);
    env.gain.setTargetAtTime(peak * 0.7, t + attack, seconds * 0.4);
    const end = t + seconds;
    env.gain.setTargetAtTime(0, end, 0.25);
    filter.connect(env).connect(this.master);
    for (const [type, detune, level] of [
      ['triangle', -5, 1],
      ['sine', 6, 0.7],
      ['sine', 1200, 0.12 * saturation],
    ]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      g.gain.value = level;
      osc.connect(g).connect(filter);
      osc.start(t);
      osc.stop(end + 1.5);
    }
  }

  bell(freq, gain) {
    const { ctx } = this;
    const t = ctx.currentTime + 0.02 + Math.random() * 0.15;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.06 * gain, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    osc.connect(env).connect(this.master);
    osc.start(t);
    osc.stop(t + 2);
  }

  air(level) {
    this.airGain.gain.setTargetAtTime(clamp01(level) * 0.12, this.ctx.currentTime, 0.2);
  }

  async suspend() {
    this.airGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    await this.ctx.suspend();
  }

  close() {
    this.ctx.close();
  }
}

const icon = (name) => `<md-icon slot="icon" aria-hidden="true">${name}</md-icon>`;

function chipSet(name, label, options, selected) {
  return `
    <md-chip-set class="light-sound__chips" role="radiogroup" aria-label="${label}" data-group="${name}">
      ${options
        .map(
          (o) =>
            `<md-filter-chip label="${o.label}" data-value="${o.id}" ${o.id === selected ? 'selected' : ''}></md-filter-chip>`,
        )
        .join('')}
    </md-chip-set>`;
}

function slider(name, label, min, max, step, value, unit = '') {
  return `
    <label class="light-sound__slider">
      <span class="light-sound__slider-label md-typescale-label-large">
        ${label}<output data-output="${name}">${value}${unit}</output>
      </span>
      <md-slider data-control="${name}" min="${min}" max="${max}" step="${step}" value="${value}"
        aria-label="${label}"></md-slider>
    </label>`;
}

/** The hue wheel: twelve notes at their hues, lit when sounding, joined into the chord. */
function wheelSvg(mapping) {
  const nodes = Array.from({ length: 12 }, (_, i) => {
    const pc = hueToPitchClass(i * 30, mapping);
    const a = ((i * 30 - 90) * Math.PI) / 180;
    const x = 100 + 78 * Math.cos(a);
    const y = 100 + 78 * Math.sin(a);
    return `
      <g class="light-sound__node" data-pc="${pc}" style="--node-hue: ${i * 30}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13"></circle>
        <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}">${NOTE_NAMES[pc]}</text>
      </g>`;
  }).join('');
  return `
    <svg class="light-sound__wheel" viewBox="0 0 200 200" role="img"
      aria-label="Hue wheel with the note each hue sounds">
      <circle class="light-sound__wheel-ring" cx="100" cy="100" r="78"></circle>
      <g data-chord></g>
      ${nodes}
    </svg>`;
}

/**
 * Builds the player: the image with its lens of light, the chord on a hue wheel, and
 * Material controls. Returns the root element; audio and animation stop once it
 * leaves the document.
 */
export function createLightSound(opts = {}) {
  const o = { ...LIGHT_SOUND_DEFAULTS, ...opts };
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const state = {
    path: o.path,
    mapping: o.mapping,
    tempo: o.tempo,
    lens: o.lens,
    volume: o.volume,
    playing: false,
    index: 0,
    steps: [],
    analysis: null,
    img: null,
    trail: [],
    move: null,
    chord: null,
    timer: 0,
    stepStarted: 0,
  };
  let synth = null;

  const root = document.createElement('div');
  root.className = 'light-sound';
  root.innerHTML = `
    <header class="light-sound__header">
      <p class="light-sound__eyebrow md-typescale-label-large">Light and Sound</p>
      <h1 class="light-sound__title" data-title>${o.title}</h1>
      <p class="light-sound__lede md-typescale-body-large">
        A lens of light travels the image. The colours under it become a chord: hue sets the note,
        lightness the octave, colourfulness the volume. The path you choose sets the time.
      </p>
    </header>

    <div class="light-sound__body">
      <div class="light-sound__stage" data-stage>
        <canvas class="light-sound__canvas" data-canvas role="img" aria-label="${o.title}"></canvas>
        <p class="light-sound__drop md-typescale-title-medium" aria-hidden="true">Drop an image to play it</p>
        <md-linear-progress class="light-sound__progress" data-progress value="0"
          aria-label="Position along the path"></md-linear-progress>
      </div>

      <aside class="light-sound__panel">
        <div class="light-sound__transport">
          <md-filled-button data-play>${icon('play_arrow')}Play</md-filled-button>
          <md-outlined-button data-load>${icon('upload')}Load image</md-outlined-button>
          <input type="file" accept="image/*" data-file hidden />
        </div>

        <section class="light-sound__section">
          <h2 class="light-sound__label md-typescale-title-small">Scanning path</h2>
          ${chipSet('path', 'Scanning path', PATHS, state.path)}
          <p class="light-sound__hint md-typescale-body-medium" data-path-summary></p>
        </section>

        <section class="light-sound__section light-sound__now">
          <div class="light-sound__wheel-wrap">${wheelSvg(state.mapping)}</div>
          <div class="light-sound__readout">
            <h2 class="light-sound__label md-typescale-title-small">Sounding</h2>
            <ul class="light-sound__voices" data-voices></ul>
            <div class="light-sound__meter" data-meter>
              <div class="light-sound__meter-track"><span data-meter-mark></span></div>
              <div class="light-sound__meter-scale md-typescale-label-medium">
                <span>Consonant</span><span data-meter-word>—</span><span>Dissonant</span>
              </div>
            </div>
          </div>
        </section>

        <section class="light-sound__section">
          <h2 class="light-sound__label md-typescale-title-small">Hue to pitch</h2>
          ${chipSet('mapping', 'Hue to pitch', MAPPINGS, state.mapping)}
        </section>

        <section class="light-sound__section light-sound__sliders">
          ${slider('tempo', 'Tempo', 40, 180, 1, state.tempo, ' bpm')}
          ${slider('lens', 'Lens', 2, 8, 0.5, state.lens)}
          ${slider('volume', 'Volume', 0, 100, 1, state.volume, '%')}
        </section>
      </aside>
    </div>
  `;

  const $ = (sel) => root.querySelector(sel);
  const canvas = $('[data-canvas]');
  const ctx = canvas.getContext('2d');
  const playButton = $('[data-play]');
  const progress = $('[data-progress]');

  // ---------- Image ----------

  const loadImage = (src, title) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    img.decode().then(
      () => {
        state.img = img;
        state.analysis = analyseImage(img);
        if (title) {
          $('[data-title]').textContent = title;
          canvas.setAttribute('aria-label', title);
        }
        sizeCanvas();
        rebuild(0);
      },
      () => {
        $('[data-title]').textContent = 'That image could not be read';
      },
    );
  };

  const sizeCanvas = () => {
    if (!state.img) return;
    // Drawn at a fixed resolution (upscaling small images); CSS fits it to the stage.
    const w = state.img.naturalWidth;
    const h = state.img.naturalHeight;
    const scale = 1400 / Math.max(w, h);
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.style.aspectRatio = `${w} / ${h}`;
  };

  // ---------- Path and playback ----------

  const rebuild = (fraction = state.steps.length ? state.index / state.steps.length : 0) => {
    if (!state.analysis) return;
    state.steps = buildPath(state.analysis, state.path, state.lens);
    state.index = Math.min(state.steps.length - 1, Math.floor(fraction * state.steps.length));
    state.trail = [];
    const step = state.steps[state.index];
    state.move = { from: step, to: step, start: 0, dur: 0 };
    state.chord = chordAt(state.analysis, step, state.mapping);
    renderChord(state.chord);
    progress.value = state.index / state.steps.length;
  };

  const playStep = () => {
    if (!state.playing || !root.isConnected) return;
    const step = state.steps[state.index];
    const prev = state.move?.to ?? step;
    const seconds = (60 / state.tempo) * step.beats;
    const glide = step.saccade ? 0.08 : Math.min(0.6, seconds * 0.6);
    state.trail.push({ ...prev, at: performance.now() });
    state.trail = state.trail.slice(-14);
    state.move = { from: prev, to: step, start: performance.now(), dur: reduced ? 0 : glide * 1000 };

    const chord = chordAt(state.analysis, step, state.mapping);
    state.chord = chord;
    renderChord(chord);
    const attack = step.saccade ? 0.05 : 0.12;
    for (const v of chord.voices) synth.tone(v, seconds, attack);
    // Stars ring as overtones of the chord's strongest note.
    const root0 = chord.voices[0]?.freq ?? midiToFreq(72);
    for (let i = 0; i < Math.min(chord.stars, 3); i++) synth.bell(root0 * [4, 6, 8][i], 1);
    synth.air(chord.air * 2.5);

    progress.value = (state.index + 1) / state.steps.length;
    state.index = (state.index + 1) % state.steps.length;
    if (state.index === 0) state.trail = [];
    state.timer = window.setTimeout(playStep, seconds * 1000);
  };

  const setPlaying = async (playing) => {
    state.playing = playing;
    playButton.innerHTML = playing ? `${icon('pause')}Pause` : `${icon('play_arrow')}Play`;
    window.clearTimeout(state.timer);
    if (playing) {
      if (!synth) synth = new Synth();
      synth.setVolume(state.volume);
      await synth.ctx.resume();
      playStep();
    } else if (synth) {
      await synth.suspend();
    }
  };

  // ---------- Readout ----------

  const renderChord = (chord) => {
    const list = $('[data-voices]');
    const voices = chord?.voices ?? [];
    list.innerHTML = voices.length
      ? voices
          .map(
            (v) => `
          <li class="light-sound__voice">
            <span class="light-sound__swatch" style="background: ${v.color}"></span>
            <span class="light-sound__note md-typescale-title-medium">${v.name}</span>
            <span class="light-sound__level"><span style="width: ${Math.round(clamp01(v.gain) * 100)}%"></span></span>
          </li>`,
          )
          .join('') +
        (chord.stars
          ? `<li class="light-sound__voice light-sound__voice--star">
              <span class="light-sound__swatch"></span>
              <span class="light-sound__note md-typescale-title-medium">Starlight</span>
              <span class="light-sound__count md-typescale-label-medium">${chord.stars} ${chord.stars === 1 ? 'star' : 'stars'}</span>
            </li>`
          : '')
      : `<li class="light-sound__voice light-sound__voice--rest md-typescale-body-medium">Silence: nothing but dark here.</li>`;

    for (const node of root.querySelectorAll('.light-sound__node')) {
      const voice = voices.find((v) => v.pc === Number(node.dataset.pc));
      node.classList.toggle('is-on', Boolean(voice));
      node.style.setProperty('--node-level', voice ? clamp01(voice.gain * 1.6) : 0);
    }

    // Lines between the sounding notes; rough intervals drawn dashed.
    const at = (pc) => {
      const a = ((pitchClassHue(pc, state.mapping) - 90) * Math.PI) / 180;
      return [100 + 78 * Math.cos(a), 100 + 78 * Math.sin(a)];
    };
    let lines = '';
    for (let i = 0; i < voices.length; i++) {
      for (let j = i + 1; j < voices.length; j++) {
        const [x1, y1] = at(voices[i].pc);
        const [x2, y2] = at(voices[j].pc);
        const d = Math.abs(voices[i].pc - voices[j].pc) % 12;
        const rough = ROUGHNESS[Math.min(d, 12 - d)] > 0.5;
        lines += `<line class="${rough ? 'is-rough' : ''}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"></line>`;
      }
    }
    $('[data-chord]').innerHTML = lines;

    const mark = $('[data-meter-mark]');
    const word = $('[data-meter-word]');
    const d = chord?.dissonance;
    $('[data-meter]').classList.toggle('is-idle', d == null);
    mark.style.left = `${Math.round((d ?? 0) * 100)}%`;
    word.textContent = d == null ? (voices.length ? 'Solo' : '—') : d < 0.3 ? 'Calm' : d < 0.6 ? 'Tense' : 'Clashing';
  };

  const renderPathSummary = () => {
    $('[data-path-summary]').textContent = PATHS.find((p) => p.id === state.path).summary;
  };

  // ---------- Drawing ----------

  const lensShape = (step, scale, grow = 1) => {
    ctx.beginPath();
    if (step.shape === 'column') {
      ctx.rect((step.x - step.r * grow) * scale, 0, step.r * 2 * grow * scale, canvas.height);
    } else {
      ctx.arc(step.x * scale, step.y * scale, step.r * grow * scale, 0, Math.PI * 2);
    }
  };

  const draw = (now) => {
    if (!root.isConnected) {
      window.clearTimeout(state.timer);
      synth?.close();
      return;
    }
    requestAnimationFrame(draw);
    if (!state.img || !state.steps.length) return;
    const { width, height } = canvas;
    const scale = width / state.analysis.cols;

    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.drawImage(state.img, 0, 0, width, height);
    // The veil: the image in shadow until the lens lights it.
    ctx.fillStyle = 'rgb(4 5 10 / 0.72)';
    ctx.fillRect(0, 0, width, height);

    // The path, faintly.
    ctx.save();
    ctx.strokeStyle = 'rgb(255 255 255 / 0.18)';
    ctx.lineWidth = Math.max(1, width / 600);
    ctx.setLineDash([width / 160, width / 160]);
    ctx.beginPath();
    state.steps.forEach((s, i) => {
      const y = s.shape === 'column' ? height - scale * 1.2 : s.y * scale;
      if (i) ctx.lineTo(s.x * scale, y);
      else ctx.moveTo(s.x * scale, y);
    });
    ctx.stroke();
    ctx.restore();

    // Afterglow: where the lens has been, fading.
    for (const t of state.trail) {
      const age = (now - t.at) / 2400;
      if (age >= 1) continue;
      ctx.save();
      lensShape(t, scale);
      ctx.clip();
      ctx.globalAlpha = 0.5 * (1 - age);
      ctx.drawImage(state.img, 0, 0, width, height);
      ctx.restore();
    }

    // The lens.
    const m = state.move;
    const p = m.dur ? easeInOut(clamp01((now - m.start) / m.dur)) : 1;
    const lens = {
      ...m.to,
      x: m.from.x + (m.to.x - m.from.x) * p,
      y: m.from.y + (m.to.y - m.from.y) * p,
      r: m.from.r + (m.to.r - m.from.r) * p,
    };
    const pulse = state.playing && !reduced ? 1 + 0.04 * Math.sin(now / 160) : 1;
    ctx.save();
    lensShape(lens, scale, pulse);
    ctx.clip();
    ctx.drawImage(state.img, 0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.06;
    ctx.drawImage(state.img, 0, 0, width, height);
    ctx.restore();

    const glow = state.chord?.voices[0]?.color ?? 'rgb(255 255 255)';
    ctx.save();
    ctx.strokeStyle = glow;
    ctx.shadowColor = glow;
    ctx.shadowBlur = width / 40;
    ctx.lineWidth = Math.max(1.5, width / 400);
    lensShape(lens, scale, pulse);
    ctx.stroke();
    ctx.restore();
  };

  // ---------- Controls ----------

  for (const set of root.querySelectorAll('[data-group]')) {
    set.addEventListener('click', (event) => {
      const chip = event.target.closest('md-filter-chip');
      if (!chip) return;
      // One choice at a time, like radio buttons.
      for (const c of set.querySelectorAll('md-filter-chip')) c.selected = c === chip;
      if (set.dataset.group === 'path') {
        state.path = chip.dataset.value;
        renderPathSummary();
        rebuild(0);
      } else {
        state.mapping = chip.dataset.value;
        $('.light-sound__wheel-wrap').innerHTML = wheelSvg(state.mapping);
        if (state.chord && state.steps.length) {
          state.chord = chordAt(state.analysis, state.move.to, state.mapping);
          renderChord(state.chord);
        }
      }
    });
  }

  for (const input of root.querySelectorAll('md-slider[data-control]')) {
    const name = input.dataset.control;
    const unit = { tempo: ' bpm', volume: '%' }[name] ?? '';
    input.addEventListener('input', () => {
      state[name] = Number(input.value);
      root.querySelector(`[data-output="${name}"]`).textContent = `${input.value}${unit}`;
      if (name === 'volume') synth?.setVolume(state.volume);
    });
    if (name === 'lens') input.addEventListener('change', () => rebuild());
  }

  playButton.addEventListener('click', () => setPlaying(!state.playing));

  const fileInput = $('[data-file]');
  const openFile = (file) => {
    if (!file?.type.startsWith('image/')) return;
    loadImage(URL.createObjectURL(file), file.name.replace(/\.[^.]+$/, ''));
  };
  $('[data-load]').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => openFile(fileInput.files[0]));

  const stage = $('[data-stage]');
  stage.addEventListener('dragover', (event) => {
    event.preventDefault();
    stage.classList.add('is-dropping');
  });
  stage.addEventListener('dragleave', () => stage.classList.remove('is-dropping'));
  stage.addEventListener('drop', (event) => {
    event.preventDefault();
    stage.classList.remove('is-dropping');
    openFile(event.dataTransfer.files[0]);
  });

  renderPathSummary();
  renderChord(null);
  loadImage(o.src);
  requestAnimationFrame(draw);
  return root;
}

/** Every scanning path drawn over the image, side by side, with what each does to time. */
export function createLightSoundPaths(opts = {}) {
  const o = { ...LIGHT_SOUND_DEFAULTS, ...opts };
  const root = document.createElement('div');
  root.className = 'light-sound light-sound--paths';
  root.innerHTML = `
    <header class="light-sound__header">
      <p class="light-sound__eyebrow md-typescale-label-large">Light and Sound</p>
      <h1 class="light-sound__title">Scanning paths</h1>
      <p class="light-sound__lede md-typescale-body-large">
        Each path reads the same ${o.title} in a different order. Bigger rings rest longer.
      </p>
    </header>
    <ol class="light-sound__path-grid">
      ${PATHS.map(
        (p) => `
        <li class="light-sound__path-card">
          <canvas class="light-sound__path-canvas" data-path="${p.id}" role="img"
            aria-label="The ${p.label} path over ${o.title}"></canvas>
          <h2 class="md-typescale-title-medium">${p.label}</h2>
          <p class="md-typescale-body-medium">${p.summary}</p>
        </li>`,
      ).join('')}
    </ol>
  `;

  const img = new Image();
  img.src = o.src;
  img.decode().then(() => {
    const analysis = analyseImage(img);
    for (const canvas of root.querySelectorAll('[data-path]')) {
      const steps = buildPath(analysis, canvas.dataset.path, o.lens);
      canvas.width = 640;
      canvas.height = Math.round((640 * img.naturalHeight) / img.naturalWidth);
      const ctx = canvas.getContext('2d');
      const scale = canvas.width / analysis.cols;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgb(4 5 10 / 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgb(255 255 255 / 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      steps.forEach((s, i) => {
        const y = s.shape === 'column' ? canvas.height / 2 : s.y * scale;
        if (i) ctx.lineTo(s.x * scale, y);
        else ctx.moveTo(s.x * scale, y);
      });
      ctx.stroke();

      steps.forEach((s, i) => {
        const chord = chordAt(analysis, s, o.mapping);
        ctx.fillStyle = chord.voices[0]?.color ?? 'rgb(255 255 255 / 0.4)';
        ctx.beginPath();
        if (s.shape === 'column') {
          ctx.globalAlpha = 0.25;
          ctx.fillRect((s.x - s.r) * scale, 0, s.r * 2 * scale - 1, canvas.height);
          ctx.globalAlpha = 1;
        } else {
          ctx.arc(s.x * scale, s.y * scale, 2 + s.beats * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (i === 0) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(s.x * scale, (s.shape === 'column' ? canvas.height / 2 / scale : s.y) * scale, 12, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }
  });
  return root;
}
