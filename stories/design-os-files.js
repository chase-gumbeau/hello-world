/**
 * Design OS File Manager — the Design OS map as a Windows 3.1 desktop.
 *
 * Same content as the pixel Mini World (design-os-world-data.js), projected onto a
 * file system: drive C: is the Design OS, each loop stage is a directory, each
 * dimension is a file, quests are G??.TXT, blueprints are *.PLN. Files open in the
 * period app that suits them: Notepad, Cardfile, Write, Program Manager groups,
 * an MS-DOS Prompt for .BAT, and Paintbrush for WORLD.BMP (the pixel world).
 */
import {
  BLUEPRINTS,
  GAPS,
  LANDMARK_BY_ID,
  LOOP_CLOSE,
  SOURCES,
  STAGES,
  WAITING_NOTE,
} from './design-os-world-data.js';
import { renderWorldBitmap } from './design-os-world.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') {
      for (const [prop, val] of Object.entries(v)) {
        if (prop.startsWith('--')) el.style.setProperty(prop, val);
        else el.style[prop] = val;
      }
    } else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** "&File" → F underlined. */
function mnemonic(label) {
  const i = label.indexOf('&');
  if (i < 0) return [label];
  return [label.slice(0, i), h('u', {}, label[i + 1]), label.slice(i + 2)];
}

const ascii = (t) =>
  t
    .replace(/→/g, '->')
    .replace(/↔/g, '<->')
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/×/g, 'x')
    .replace(/…/g, '...');

const pad = (s, n, ch = ' ') => (s.length >= n ? s : s + ch.repeat(n - s.length));
const fmtBytes = (n) => n.toLocaleString('en-US');

function strHash(s) {
  let x = 2166136261;
  for (let i = 0; i < s.length; i++) {
    x ^= s.charCodeAt(i);
    x = Math.imul(x, 16777619);
  }
  return x >>> 0;
}

function timeOf(name) {
  const x = strHash(name);
  const hr = 9 + (x % 10);
  const mi = (x >>> 8) % 60;
  const h12 = hr > 12 ? hr - 12 : hr;
  return `${h12}:${String(mi).padStart(2, '0')}${hr >= 12 ? 'p' : 'a'}`;
}

// ---------------------------------------------------------------------------
// Icons — 16-color VGA palette, painted as crisp SVG runs
// ---------------------------------------------------------------------------

const VGA = {
  k: '#000000',
  w: '#ffffff',
  g: '#c0c0c0',
  d: '#808080',
  y: '#ffff00',
  o: '#808000',
  b: '#0000ff',
  n: '#000080',
  r: '#ff0000',
  m: '#800000',
  c: '#00ffff',
  t: '#008080',
  l: '#00ff00',
  e: '#008000',
  p: '#ff00ff',
  u: '#800080',
};

const ICON = {
  folder: [
    '..kkkkk.........',
    '.kywwwyk........',
    'kywyyyyykkkkkkk.',
    'kwyyyyyyyyyyyyyk',
    'kyyyyyyyyyyyyyok',
    'kyyyyyyyyyyyyyok',
    'kyyyyyyyyyyyyyok',
    'kyyyyyyyyyyyyyok',
    'kyyyyyyyyyyyyyok',
    'kyyyyyyyyyyyyyok',
    'kooooooooooooook',
    '.kkkkkkkkkkkkkk.',
  ],
  folderOpen: [
    '..kkkkk.........',
    '.kywwwyk........',
    'kywyyyyykkkkkk..',
    'kwyyyyyyyyyyyyk.',
    'kyykkkkkkkkkkkkk',
    'kykwyyyyyyyyyyyk',
    'kykyyyyyyyyyyyk.',
    'kkyyyyyyyyyyyok.',
    'kkyyyyyyyyyyyok.',
    'kyyyyyyyyyyyok..',
    'kooooooooooook..',
    '.kkkkkkkkkkkk...',
  ],
  up: [
    '.....k......',
    '....kkk.....',
    '...kkkkk....',
    '..kkkkkkk...',
    '....kkk.....',
    '....kkk.....',
    '....kkkkkkk.',
    '....kkkkkkk.',
  ],
  doc: [
    'kkkkkkkkk...',
    'kwwwwwwwkk..',
    'kwwwwwwwkwk.',
    'kwkkkkwwkkkk',
    'kwwwwwwwwwwk',
    'kwkkkkkkkwwk',
    'kwwwwwwwwwwk',
    'kwkkkkkkkwwk',
    'kwwwwwwwwwwk',
    'kwkkkkkwwwwk',
    'kwwwwwwwwwwk',
    'kkkkkkkkkkkk',
  ],
  file: [
    'kkkkkkkkk...',
    'kwwwwwwwkk..',
    'kwwwwwwwkwk.',
    'kwwwwwwwkkkk',
    'kwwwwwwwwwwk',
    'kwwwwwwwwwwk',
    'kwwwwwwwwwwk',
    'kwwwwwwwwwwk',
    'kwwwwwwwwwwk',
    'kwwwwwwwwwwk',
    'kwwwwwwwwwwk',
    'kkkkkkkkkkkk',
  ],
  program: [
    'kkkkkkkkkkkkkk',
    'kgknnnnnnnnnnk',
    'kkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwk',
    'kwwwwwwwwwwwwk',
    'kwwwwwwwwwwwwk',
    'kwwwwwwwwwwwwk',
    'kwwwwwwwwwwwwk',
    'kkkkkkkkkkkkkk',
  ],
  hdd: [
    '.kkkkkkkkkkkkkk.',
    'kwwwwwwwwwwwwwdk',
    'kwggggggggggggdk',
    'kwgggggggggleedk',
    'kwggggggggggggdk',
    'kddddddddddddddk',
    '.kkkkkkkkkkkkkk.',
  ],
  floppy: [
    '.kkkkkkkkkkkkkk.',
    'kwwwwwwwwwwwwwdk',
    'kwggggggggggggdk',
    'kwgkkkkkkkkkggdk',
    'kwggggggggggggdk',
    'kddddddddddddddk',
    '.kkkkkkkkkkkkkk.',
  ],
  notepad: [
    '..k.k.k.k.k.k...',
    '.kkkkkkkkkkkkk..',
    '.kwkwkwkwkwkwk..',
    '.kwwwwwwwwwwwk..',
    '.kwbbbbbbbbbwk..',
    '.kwwwwwwwwwwwk..',
    '.kwbbbbbbbbbwk..',
    '.kwwwwwwwwwwwk..',
    '.kwbbbbbbbbbwk..',
    '.kwwwwwwwwwwwk..',
    '.kwbbbbbbwwwwk..',
    '.kwwwwwwwwwwwkd.',
    '.kkkkkkkkkkkkkd.',
    '..dddddddddddd..',
  ],
  cardfile: [
    '.....kkkkkkkkkkk',
    '.....kwwwwwwwwwk',
    '.....krrrrrrrrrk',
    '..kkkkkkkkkkkwwk',
    '..kwwwwwwwwwkwwk',
    '..krrrrrrrrrkwwk',
    'kkkkkkkkkkkkkwwk',
    'kwwwwwwwwwwkkkkk',
    'krrrrrrrrrrk....',
    'kwwwwwwwwwwk....',
    'kwbbbbbbbwwk....',
    'kwwwwwwwwwwk....',
    'kwbbbbbwwwwk....',
    'kwwwwwwwwwwk....',
    'kkkkkkkkkkkk....',
  ],
  write: [
    'kkkkkkkkkkkk....',
    'kwwwwwwwwwwk....',
    'kwwwwkkwwwwk....',
    'kwwwkwwkwwwk....',
    'kwwkwwwwkwwk....',
    'kwwkkkkkkwwk....',
    'kwwkwwwwkwwk....',
    'kwwkwwwwkwwk..kk',
    'kwwwwwwwwwwk.kyk',
    'kwbbbbbbbbwkkyk.',
    'kwwwwwwwwwwkykk.',
    'kwbbbbbbbwwkkk..',
    'kwwwwwwwwwwk....',
    'kkkkkkkkkkkk....',
  ],
  paint: [
    '....kkkkkkk.....',
    '..kkwwwwwwwkk...',
    '.kwwrrwwwbbwwk..',
    'kwwwrrwwwbbwwwk.',
    'kwlwwwwwwwwwwwk.',
    'kwllwwwkkwwyywk.',
    'kwwwwwkddkwyywk.',
    'kwwwwwkddkwwwwk.',
    '.kwwwwwkkwwppwk.',
    '..kwwwwwwwwppk..',
    '...kkkwwwwwkk...',
    '......kkkkk.....',
  ],
  dos: [
    'kkkkkkkkkkkkkkkk',
    'kgknnnnnnnnnnnnk',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
    'kkggkkkkkkkkkkkk',
    'kgkkkkgkkkgkkkkk',
    'kgkkkkkkkkkgkkkk',
    'kgkkkkgkkkgkkkkk',
    'kkggkkkkkkkkgggk',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
    'kkkkkkkkkkkkkkkk',
  ],
  filemgr: [
    '..kkkkkkkkkkk...',
    '..kwwwwwwwwwdk..',
    '..kwgggggggddk..',
    '..kwggkkkggddk..',
    '..kwgggggggddk..',
    '..kdddddddddddk.',
    '..kwwwwwwwwwdk..',
    '..kwgggggggddk..',
    '..kwggkkkggddk..',
    '..kwgggggggddk..',
    '..kdddddddddddk.',
    '..kkkkkkkkkkkkk.',
  ],
  group: [
    'kkkkkkkkkkkkkkkk',
    'kgknnnnnnnnnnnnk',
    'kkkkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwwwk',
    'kwrrwwbbwwllwwwk',
    'kwrrwwbbwwllwwwk',
    'kwwwwwwwwwwwwwwk',
    'kwyywwppwwccwwwk',
    'kwyywwppwwccwwwk',
    'kwwwwwwwwwwwwwwk',
    'kkkkkkkkkkkkkkkk',
  ],
  book: [
    '..kkkkkkkkkkk...',
    '.kpppppppppppk..',
    '.kpwwwwwwwwppk..',
    '.kpwkkkkkkwppk..',
    '.kpwwwwwwwwppk..',
    '.kpwkkkkwwwppk..',
    '.kpwwwwwwwwppk..',
    '.kpppppppppppk..',
    '.kpppppppppppk..',
    '.kuuuuuuuuuuuk..',
    '.kwwwwwwwwwwwk..',
    '.kkkkkkkkkkkkk..',
  ],
  chart: [
    'kkkkkkkkkkkkkkkk',
    'kwwwwwwwwwwwwwwk',
    'kwwwwwwwwwwrrwwk',
    'kwwwwwwwwwwrrwwk',
    'kwwwwwwbbwwrrwwk',
    'kwwwwwwbbwwrrwwk',
    'kwwllwwbbwwrrwwk',
    'kwwllwwbbwwrrwwk',
    'kwwllwwbbwwrrwwk',
    'kwkkkkkkkkkkkkwk',
    'kwwwwwwwwwwwwwwk',
    'kkkkkkkkkkkkkkkk',
  ],
  db: [
    '..kkkkkkkkkkk..',
    '.kcwwwwwwwwwck.',
    '.kccccccccccck.',
    '.ktcccccccccck.',
    '.kkkkkkkkkkkkk.',
    '.kccccccccccck.',
    '.ktcccccccccck.',
    '.kkkkkkkkkkkkk.',
    '.kccccccccccck.',
    '.ktcccccccccck.',
    '..kkkkkkkkkkk..',
  ],
  checklist: [
    'kkkkkkkkkkkk',
    'kwwwwwwwwwwk',
    'kwkkkwwwwwwk',
    'kwkekwbbbbwk',
    'kwkkkwwwwwwk',
    'kwwwwwwwwwwk',
    'kwkkkwwwwwwk',
    'kwkekwbbbbwk',
    'kwkkkwwwwwwk',
    'kwwwwwwwwwwk',
    'kwkkkwwwwwwk',
    'kwkwkwbbbwwk',
    'kwkkkwwwwwwk',
    'kkkkkkkkkkkk',
  ],
  robot: [
    '......kk......',
    '......yy......',
    '..kkkkkkkkkk..',
    '..kggggggggk..',
    '..kgcckkccgk..',
    '..kgcckkccgk..',
    '..kggggggggk..',
    '..kggkkkkggk..',
    '..kggggggggk..',
    '..kkkkkkkkkk..',
    '...kddddddk...',
    '.kkkddddddkkk.',
    '.kgkddddddkgk.',
    '.kkkkkkkkkkkk.',
  ],
  gear: [
    '......kk......',
    '...k.kggk.k...',
    '..kgkggggkgk..',
    '...kggkkggk...',
    '.kkggk..kggkk.',
    '.kgggk..kgggk.',
    '.kkggk..kggkk.',
    '...kggkkggk...',
    '..kgkggggkgk..',
    '...k.kggk.k...',
    '......kk......',
  ],
  people: [
    '...kkk....kkk...',
    '..kyyyk..kyyyk..',
    '..kyyyk..kyyyk..',
    '...kkk....kkk...',
    '..kbbbk..krrrk..',
    '.kbbbbbkkrrrrrk.',
    '.kbbbbbkkrrrrrk.',
    '.kbbbbbkkrrrrrk.',
    '.kkkkkkkkkkkkkk.',
  ],
  chat: [
    '.kkkkkkkkkkkk.',
    'kwwwwwwwwwwwwk',
    'kwkkkkkkkkkwwk',
    'kwwwwwwwwwwwwk',
    'kwkkkkkkkwwwwk',
    'kwwwwwwwwwwwwk',
    '.kkkwwkkkkkkk.',
    '...kwk........',
    '...kk.........',
  ],
  flask: [
    '....kkkk....',
    '....kwwk....',
    '....kwwk....',
    '....kwwk....',
    '...kwwwwk...',
    '..kwwwwwwk..',
    '.kwwwwwwwwk.',
    '.kllllllllk.',
    'kllllwlllllk',
    'kllllllllllk',
    'kkkkkkkkkkkk',
  ],
  box: [
    '.kkkkkkkkkkkk.',
    'kyyyyyyyyyyyyk',
    'kokkkkkkkkkkok',
    'koyyyyyyyyyyok',
    'koyykkkkkkyyok',
    'koyyyyyyyyyyok',
    'koyyyyyyyyyyok',
    'koyyyyyyyyyyok',
    'kooooooooooook',
    '.kkkkkkkkkkkk.',
  ],
  cube: [
    '....kkkkkk....',
    '....krrrrk....',
    '....krwwrk....',
    '....krrrrk....',
    '.kkkkkkkkkkkk.',
    '.kbbbbkkllllk.',
    '.kbwwbkklwwlk.',
    '.kbbbbkkllllk.',
    '.kkkkkkkkkkkk.',
  ],
  info: [
    '....kkkkkkk.....',
    '..kkwwwwwwwkk...',
    '.kwwwwwbbwwwwk..',
    'kwwwwwwbbwwwwwk.',
    'kwwwwwwwwwwwwwk.',
    'kwwwwwbbbwwwwwk.',
    'kwwwwwwbbwwwwwk.',
    'kwwwwwwbbwwwwwk.',
    'kwwwwwwbbwwwwwk.',
    '.kwwwwbbbbwwwk..',
    '..kkwwwwwwwkk...',
    '....kkkwkkk.....',
    '.......kk.......',
  ],
  warn: [
    '....kkkkkkk.....',
    '..kkyyyyyyykk...',
    '.kyyyyykyyyyyk..',
    'kyyyyykkkyyyyyk.',
    'kyyyyykkkyyyyyk.',
    'kyyyyykkkyyyyyk.',
    'kyyyyyykyyyyyyk.',
    'kyyyyyyyyyyyyyk.',
    'kyyyyyykyyyyyyk.',
    '.kyyyykkkyyyyk..',
    '..kkyyykyyykk...',
    '....kkkkkkk.....',
  ],
  stop: [
    '....kkkkkkk.....',
    '...krrrrrrrk....',
    '..krrrrrrrrrk...',
    '.krrrrrrrrrrrk..',
    'krrrrrrrrrrrrrk.',
    'krwwwwwwwwwwwrk.',
    'krwwwwwwwwwwwrk.',
    'krrrrrrrrrrrrrk.',
    '.krrrrrrrrrrrk..',
    '..krrrrrrrrrk...',
    '...krrrrrrrk....',
    '....kkkkkkk.....',
  ],
};

const iconCache = new Map();

function icon(name, scale = 1) {
  const key = `${name}@${scale}`;
  if (!iconCache.has(key)) {
    const rows = ICON[name] ?? ICON.file;
    const wid = Math.max(...rows.map((r) => r.length));
    const hgt = rows.length;
    let rects = '';
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        if (!VGA[ch]) {
          x++;
          continue;
        }
        let run = 1;
        while (row[x + run] === ch) run++;
        rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${VGA[ch]}"/>`;
        x += run;
      }
    });
    iconCache.set(key, `<svg width="${wid * scale}" height="${hgt * scale}" viewBox="0 0 ${wid} ${hgt}" shape-rendering="crispEdges">${rects}</svg>`);
  }
  return h('span', { class: 'w31-icon', 'aria-hidden': 'true', html: iconCache.get(key) });
}

const SVG_DOWN = '<svg width="9" height="5" viewBox="0 0 9 5" shape-rendering="crispEdges"><path d="M0 0h9v1H0zM1 1h7v1H1zM2 2h5v1H2zM3 3h3v1H3zM4 4h1v1H4z"/></svg>';
const SVG_UP = '<svg width="9" height="5" viewBox="0 0 9 5" shape-rendering="crispEdges"><path d="M4 0h1v1H4zM3 1h3v1H3zM2 2h5v1H2zM1 3h7v1H1zM0 4h9v1H0z"/></svg>';
const SVG_RESTORE = '<svg width="9" height="11" viewBox="0 0 9 11" shape-rendering="crispEdges"><path d="M4 0h1v1H4zM3 1h3v1H3zM2 2h5v1H2zM1 3h7v1H1zM1 7h7v1H1zM2 8h5v1H2zM3 9h3v1H3zM4 10h1v1H4z"/></svg>';
const SVG_CHECK = '<svg width="8" height="7" viewBox="0 0 8 7" shape-rendering="crispEdges"><path d="M7 0h1v2H7zM6 1h1v2H6zM5 2h1v2H5zM0 3h2v1H0zM4 3h1v2H4zM1 4h2v1H1zM3 4h1v2H3zM2 5h1v2H2z"/></svg>';

function toolIcon(label) {
  const t = label.toLowerCase();
  if (t.includes('figma')) return 'paint';
  if (t.includes('playroom')) return 'cube';
  if (t.includes('cursor') || t.includes('claude')) return 'robot';
  if (t.includes('storybook') || t.includes('docs')) return 'book';
  if (t.includes('pantry')) return 'box';
  if (t.includes('slack') || t.includes('logger')) return 'chat';
  if (t.includes('kitchen') || t.includes('lab')) return 'flask';
  if (t.includes('research') || t.includes('ritual') || t.includes('codeowners')) return 'people';
  if (t.includes('datadog') || t.includes('metabase') || t.includes('milestone')) return 'chart';
  if (t.includes('redshift') || t.includes('registry')) return 'db';
  if (t.includes('linear')) return 'checklist';
  if (t.includes('notion')) return 'notepad';
  return 'gear';
}

// ---------------------------------------------------------------------------
// The file system
// ---------------------------------------------------------------------------

const DATE = '10/10/26';

const DIR_OF = {
  frame: '1FRAME',
  explore: '2EXPLORE',
  test: '3TEST',
  decide: '4DECIDE',
  ship: '5SHIP',
  observe: '6OBSERVE',
  learn: '7LEARN',
  canopy: 'CANOPY',
  keystone: 'KEYS',
  capture: 'CAPTURE',
  disposition: 'SORTING',
  pantry: 'PANTRY',
};

const BP_FILE = {
  'bp-workflows': 'WORKFLOW.PLN',
  'bp-enrich': 'ENRICH.PLN',
  'bp-flows': 'FLOWDIAG.PLN',
  'bp-contribution': 'CONTRIB.PLN',
  'bp-routing': 'ROUTING.PLN',
  'bp-sync': 'SYNC.PLN',
};

const gapName = (g) => `G${g.id.slice(1).padStart(2, '0')}.TXT`;
const openCount = GAPS.filter((g) => !g.waiting).length;
const waitingCount = GAPS.length - openCount;

function sizeOf(node) {
  const p = node.payload;
  switch (node.app) {
    case 'notepad':
      return ascii(p.text).replace(/\n/g, '\r\n').length;
    case 'dos':
      return ascii(p.source).replace(/\n/g, '\r\n').length;
    case 'cardfile':
      return 52 + p.cards.reduce((n, c) => n + 64 + c.index.length + c.body.length, 0);
    case 'write':
      return 384 + JSON.stringify(p).length;
    case 'progman':
      return 1056 + p.items.length * 132;
    case 'exe':
      return 23552;
    case 'paint':
      return 46198;
    default:
      return 0;
  }
}

function dir(name, children, desc) {
  return { kind: 'dir', name, children, desc };
}

function file(name, app, payload, desc, attr = 'a') {
  const node = { kind: 'file', name, app, payload, desc, attr, date: DATE, time: timeOf(name) };
  node.size = sizeOf(node);
  return node;
}

function connections(s) {
  const out = [];
  const cap = LANDMARK_BY_ID.capture.consumers.find(([id]) => id === s.id);
  if (cap) out.push(['CAPTURE', cap[1]]);
  const root = LANDMARK_BY_ID.canopy.roots.find(([id]) => id === s.id);
  if (root) out.push(['CANOPY', root[1]]);
  const dispIdx = { test: 0, decide: 1, ship: 2 }[s.id];
  if (dispIdx != null) {
    const [name, detail] = LANDMARK_BY_ID.disposition.inputs[dispIdx];
    out.push(['SORTING', `${name}: ${detail}`]);
  }
  if (s.id === 'explore' || s.id === 'learn') out.push(['PANTRY', 'Recipes, layouts, canonical screens']);
  out.push(['KEYS', s.keys[0]]);
  return out;
}

function gapNode(g) {
  const stage = STAGES.find((s) => s.id === g.stage);
  const where = stage ? `${stage.n} ${stage.name.toUpperCase()}` : 'ALL STAGES';
  const lines = [
    `${g.id} - ${where}`,
    '-'.repeat(44),
    `Status: ${g.waiting ? 'DEPENDS ON THE OCT 9 SESSION (read-only)' : 'OPEN'}`,
    g.main ? 'MAIN QUEST - named the highest-leverage fix.' : null,
    '',
    g.text,
    '',
    g.waiting ? WAITING_NOTE : null,
    'Registered in the FigJam gap register, Oct 10 2026.',
  ].filter((l) => l !== null);
  return file(
    gapName(g),
    'notepad',
    { text: lines.join('\n') },
    `Quest ${g.id}${g.main ? ' (main quest)' : ''}${g.waiting ? ' - read-only, depends on Oct 9' : ''}`,
    g.waiting ? 'ra' : 'a',
  );
}

function blueprintNode(b) {
  const name = BP_FILE[b.id];
  const text = [
    '*** UNDER CONSTRUCTION ***',
    `${name} - ${b.kind}`,
    '',
    b.name,
    '-'.repeat(Math.min(44, b.name.length)),
    b.text,
    '',
    b.surfaces ? `Surfaces: ${b.surfaces}` : null,
    'Source: Design OS idea log (Notion), Oct 10 2026.',
  ]
    .filter((l) => l !== null)
    .join('\n');
  return file(name, 'notepad', { text }, `Blueprint: ${b.name}`);
}

function stageDir(s) {
  const idx = STAGES.indexOf(s);
  const prev = STAGES[(idx + STAGES.length - 1) % STAGES.length];
  const next = STAGES[(idx + 1) % STAGES.length];
  const gaps = GAPS.filter((g) => g.stage === s.id);
  const bps = BLUEPRINTS.filter((b) => b.home === s.id);
  const DIR = DIR_OF[s.id];
  const NAME = s.name.toUpperCase();

  const readme = [
    `${s.n} . ${NAME}`,
    s.land,
    '='.repeat(44),
    s.sub,
    '',
    `Stage ${s.n} of ${STAGES.length} in the one-loop model.`,
    `  Previous  ..\\${DIR_OF[prev.id]}`,
    `  Next      ..\\${DIR_OF[next.id]}${s.id === 'learn' ? `  (${LOOP_CLOSE})` : ''}`,
    '',
    'FILES',
    ...[
      ['OBJECTS.CRD', 'Objects - what exists here (Cardfile)'],
      ['KEYS.INI', 'Keys - identifiers that join this stage to the OS'],
      ['TOOLS.GRP', 'Tools - where the work happens'],
      ['AGENT.BAT', 'Agent role - run it'],
      ['DECISION.TXT', 'Human decision - only a person makes it'],
      ['NOTION.WRI', 'Written back to Notion (Write)'],
      ['G??.TXT', `Quests - ${gaps.length} gap(s) registered here`],
      bps.length ? ['*.PLN', 'Blueprints - under construction'] : null,
    ]
      .filter(Boolean)
      .map(([f, d]) => `  ${pad(f, 13)} ${d}`),
    '',
    'CONNECTIONS',
    ...connections(s).map(([d, t]) => `  ..\\${pad(d, 9)} ${t}`),
  ].join('\n');

  const keys = [
    `; KEYS.INI - ${s.n} ${s.name}`,
    '; The identifiers that join this stage to the rest of the OS.',
    '; Story URL + UXAF IDs are the spine. See C:\\KEYS\\SPINE.INI',
    '',
    '[Keys]',
    ...s.keys.flatMap((k, i) => {
      const missing = /\(missing\)/i.test(k);
      const line = `Key${i + 1}=${k.replace(/\s*\(missing\)/i, '')}`;
      return missing ? [line, `; Key${i + 1} is MISSING - nothing carries it yet`] : [line];
    }),
  ].join('\n');

  const batchSource = [
    '@ECHO OFF',
    `REM AGENT.BAT - agent role for ${DIR}`,
    'REM Agents coach and draft; they never decide.',
    ...s.agent.map((a) => `ECHO ${a}`),
    'ECHO Hand-off: DECISION.TXT',
    'PAUSE',
  ].join('\n');
  const agentLines = [
    `AGENT ROLE - ${s.n} ${NAME}`,
    'Agents coach and draft; they never decide.',
    '',
    ...s.agent.map((a) => (a.length < 46 ? `  ${pad(a + ' ', 48, '.')} ok` : `  ${a} ... ok`)),
    '',
    'Hand-off to a person: DECISION.TXT',
  ];

  const decision = [
    `HUMAN DECISION - ${s.n} ${NAME}`,
    'The decision only a person makes at this stage.',
    'Agents coach and draft; they never decide.',
    '',
    ...s.human.map((d) => `[ ] ${d}`),
  ].join('\n');

  const files = [
    file('README.TXT', 'notepad', { text: readme }, `About ${s.n} ${s.name} - ${s.land}`),
    file(
      'OBJECTS.CRD',
      'cardfile',
      {
        cards: s.objects.map((o, i) => ({
          index: o,
          body: `${o}\n\nStage ${s.n} - ${s.name}\nObject ${i + 1} of ${s.objects.length}\n\nWhat exists at this stage: records, artifacts, issues.`,
        })),
      },
      'Objects: what exists at this stage',
    ),
    file('KEYS.INI', 'notepad', { text: keys }, 'Keys: identifiers that join this stage to the OS'),
    file(
      'TOOLS.GRP',
      'progman',
      {
        title: `${s.short} Tools`,
        note: `${s.n} ${s.name}: where the work happens. One job per tool.`,
        items: s.tools.map((t) => ({
          label: t.replace(/\s*\(proposed\)/i, ''),
          proposed: /\(proposed\)/i.test(t),
          icon: toolIcon(t),
        })),
      },
      'Tools: where the work happens',
    ),
    file('AGENT.BAT', 'dos', { cwd: `C:\\${DIR}`, cmd: 'agent', source: batchSource, lines: agentLines, pause: true }, 'Agent role: run it'),
    file('DECISION.TXT', 'notepad', { text: decision }, 'Human decision: only a person makes it'),
    file(
      'NOTION.WRI',
      'write',
      {
        title: 'Written back to Notion',
        subtitle: `${s.n} · ${s.name} — what the stage leaves behind so context travels with the work.`,
        sections: [{ bullets: s.notion }],
      },
      'Written back to Notion',
    ),
    ...gaps.map(gapNode),
    ...bps.map(blueprintNode),
  ];
  return dir(DIR, files, `${s.n} ${s.name} - ${s.land}`);
}

function readmeFor(l, extra = []) {
  return file('README.TXT', 'notepad', { text: [l.name.toUpperCase(), l.kind, '='.repeat(44), l.sub, '', l.lede, ...extra].join('\n') }, `About ${l.name}`);
}

function canopyDir() {
  const l = LANDMARK_BY_ID.canopy;
  const roots = [
    'WHERE CANOPY REACHES EACH STAGE',
    '='.repeat(44),
    '',
    ...l.roots.map(([id, text]) => `..\\${pad(DIR_OF[id], 9)} ${text}`),
  ].join('\n');
  return dir('CANOPY', [readmeFor(l), file('ROOTS.TXT', 'notepad', { text: roots }, 'Roots: where Canopy shows up')], 'The design system every stage grows from');
}

function keysDir() {
  const l = LANDMARK_BY_ID.keystone;
  const carriers = ['Storybook', 'Figma', 'Linear', 'GitHub', 'Notion', 'Code'];
  const spine = [
    '; SPINE.INI - Keys spine (cross-cutting lane 1)',
    `; ${l.sub}`,
    '',
    '[Spine]',
    'Core=Story URL + UXAF IDs (feature, surface, workflow, logic rule)',
    'Rule=One ID per item, everywhere',
    '',
    '[Carriers]',
    ...l.items.map((t, i) => `${carriers[i]}=${t}`),
  ].join('\n');
  return dir('KEYS', [readmeFor(l), file('SPINE.INI', 'notepad', { text: spine }, 'The keys spine and what carries it')], 'Keys spine: Story URL + UXAF IDs');
}

function captureDir() {
  const l = LANDMARK_BY_ID.capture;
  const list = ['CAPTURE CONSUMERS - one primitive, five consumers', '='.repeat(44), '', ...l.consumers.map(([id, t]) => `${pad(DIR_OF[id], 9)} ${t}`)].join('\n');
  const consumers = file('CONSUMER.LST', 'notepad', { text: list }, 'Five consumers of the capture service');
  return dir(
    'CAPTURE',
    [
      file('CAPTURE.EXE', 'exe', { title: 'Capture Service', text: `${l.core}\n\n${l.lede}`, consumers }, 'Capture service: run it'),
      consumers,
      readmeFor(l, ['', 'SERVICE', l.core]),
    ],
    'Capture service: one primitive, five consumers',
  );
}

function sortingDir() {
  const l = LANDMARK_BY_ID.disposition;
  const routes = { Rule: 'RULE', Example: 'EXAMPLE', Ticket: 'TICKET', 'Pattern candidate': 'PATTERN', 'Resolved / Dismissed': 'RESOLVED' };
  const source = ['@ECHO OFF', 'REM DISPOSE.BAT - review is a triage, not a pipe', ...l.outputs.map(([n, t]) => `REM ${routes[n]} -> ${t}`), 'CHOICE /C:RETPD Route to'].join('\n');
  const lines = [
    `DISPOSITION TRIAGE - ${l.sub.toLowerCase()}`,
    'Reading findings...',
    ...l.inputs.map(([n, d]) => `  ${pad(n, 29)} ${d}`),
    '',
    'Agent proposes. Designer confirms.',
    'Route to [R]ule, [E]xample, [T]icket, [P]attern candidate, [D]ismissed?',
    '',
    ...l.outputs.map(([n, t, empty]) => `  ${pad(routes[n], 9)} -> ${t}${empty ? '   (0 files - nothing writes here today)' : ''}`),
  ];
  const routeDirs = l.outputs.map(([n, t, empty]) =>
    dir(
      routes[n],
      empty ? [] : [file('README.TXT', 'notepad', { text: `${n.toUpperCase()}\n${'='.repeat(44)}\n${t}` }, `${n} route`)],
      empty ? `${n}: ${t} - nothing writes here today` : `${n}: ${t}`,
    ),
  );
  const bp = BLUEPRINTS.filter((b) => b.home === 'disposition').map(blueprintNode);
  return dir(
    'SORTING',
    [
      ...routeDirs,
      file('DISPOSE.BAT', 'dos', { cwd: 'C:\\SORTING', cmd: 'dispose', source, lines }, 'Disposition triage: run it'),
      readmeFor(l, ['', l.decision, '', 'Nothing writes to C:\\SORTING\\EXAMPLE today.']),
      ...bp,
    ],
    'Disposition triage: review is a triage, not a pipe',
  );
}

function pantryDir() {
  const l = LANDMARK_BY_ID.pantry;
  const [cap, persona, flows] = l.shelves;
  const card = (title, body) => ({ index: title, body });
  const bp = BLUEPRINTS.filter((b) => b.home === 'pantry').map(blueprintNode);
  return dir(
    'PANTRY',
    [
      dir(
        'CAPABIL',
        [
          file('CATALOG.CAP', 'none', {}, 'Capability file - Catalog (planned first)'),
          file('ORDERCOR.CAP', 'none', {}, 'Capability file - Order Core (planned first)'),
          file('README.TXT', 'notepad', { text: `CAPABILITY FILES\n${'='.repeat(44)}\n${cap[1]}.\nProjection of: ${cap[2]} (${cap[3]})\nIndexed in: ${cap[4]}, ${cap[5]}` }, 'About capability files'),
        ],
        `${cap[0]} -> ${cap[2]}`,
      ),
      dir('FLOWS', [file('README.TXT', 'notepad', { text: `PRODUCT-FLOW FILES\n${'='.repeat(44)}\nProjection of: ${flows[2]}\nIndexed in: ${flows[4]}` }, 'About product-flow files')], `${flows[0]} -> ${flows[2]}`),
      dir('PERSONA', [file('README.TXT', 'notepad', { text: `PERSONA FILES\n${'='.repeat(44)}\n${persona[1]}.\nProjection of: ${persona[2]}\nIndexed in: ${persona[4]}, ${persona[5]}` }, 'About persona files')], `${persona[0]} -> ${persona[2]}`),
      file('KEYFRAME.CRD', 'cardfile', { cards: [card('Keyframes DB', `Keyframes DB\n\n${cap[5]}.\nIndexes ${cap[2]}, projected from ${cap[0]}.`)] }, 'Keyframes DB, linked to Capabilities'),
      readmeFor(l, ['', 'SHELVES', ...l.shelves.map(([f, , layer, , db]) => `  ${pad(f, 19)} -> ${pad(layer, 19)} -> ${db}`)]),
      file('SURFACES.CRD', 'cardfile', { cards: [card('Surfaces DB', `Surfaces DB\n\n${persona[5]}.\nIndexes ${persona[2]}, projected from ${persona[0]}.`)] }, `Surfaces DB, ${persona[5]}`),
      ...bp,
      file('WORKFLOW.CRD', 'cardfile', { cards: [card('Workflows DB', `Workflows DB\n\nIndexes ${flows[2]}, projected from ${flows[0]}.`)] }, 'Workflows DB'),
    ],
    'UXAF projected onto a file system',
  );
}

function rootDir() {
  const readme = [
    'DESIGN OS                              C:\\README.TXT',
    '='.repeat(52),
    'The Design OS map, projected onto a file system.',
    '',
    'Source of record: FigJam "Design OS map - loop stages x dimensions"',
    `  ${SOURCES.figjam}`,
    'Idea log: Notion',
    `  ${SOURCES.notion}`,
    '',
    'THE LOOP (one directory per stage)',
    ...STAGES.map((s) => `  ${pad(DIR_OF[s.id], 10)} ${s.sub}`),
    `  ${pad('', 10)} ${LOOP_CLOSE}`,
    '',
    'LANDMARKS (cross-cutting lanes)',
    '  KEYS       Keys spine - Story URL + UXAF IDs',
    '  CAPTURE    Capture service - one primitive, five consumers',
    '  SORTING    Disposition triage - review is a triage, not a pipe',
    '  PANTRY     UXAF on disk',
    '  CANOPY     The design system every stage grows from',
    '',
    'EVERY STAGE DIRECTORY HOLDS',
    '  OBJECTS.CRD  KEYS.INI  TOOLS.GRP  AGENT.BAT  DECISION.TXT  NOTION.WRI',
    '',
    'QUESTS',
    `  ${GAPS.length} gaps are G??.TXT files, filed under the stage they belong to.`,
    `  ${openCount} are open. ${waitingCount} are read-only (r): they depend on the Oct 9 session.`,
    '  Find them all with File > Search... G*.TXT',
    '',
    'TRY',
    '  LOOP.BAT    walk the loop',
    '  WORLD.BMP   the same OS as a pixel world (Paintbrush)',
  ].join('\n');
  const loopSource = ['@ECHO OFF', ...STAGES.flatMap((s) => [`:${DIR_OF[s.id]}`, `ECHO ${s.sub}`]), `REM ${LOOP_CLOSE}`, 'GOTO 1FRAME'].join('\n');
  const loopOnce = [...STAGES.map((s) => `${pad(DIR_OF[s.id], 10)}${s.sub}`), `${pad('', 10)}${LOOP_CLOSE}`];
  const g25 = GAPS.find((g) => g.stage === 'all');
  const maps = [
    '*** UNDER CONSTRUCTION ***',
    'MAPS.PLN - Task',
    '',
    'Maps of the design OS',
    '-'.repeat(21),
    'Block diagrams in FigJam: what each resource contains, its description,',
    'and what it connects to. Scan for missing elements.',
    '',
    'You are looking at one of them.',
  ].join('\n');
  return dir(
    'C:',
    [
      stageDir(STAGES[0]),
      stageDir(STAGES[1]),
      stageDir(STAGES[2]),
      stageDir(STAGES[3]),
      stageDir(STAGES[4]),
      stageDir(STAGES[5]),
      stageDir(STAGES[6]),
      canopyDir(),
      captureDir(),
      keysDir(),
      pantryDir(),
      sortingDir(),
      gapNode(g25),
      file('LOOP.BAT', 'dos', { cwd: 'C:\\', cmd: 'loop', source: loopSource, lines: [...loopOnce, ...loopOnce.slice(0, 3), '^C', 'Terminate batch job (Y/N)?y'] }, 'Walk the loop'),
      file('MAPS.PLN', 'notepad', { text: maps }, 'Blueprint: maps of the design OS'),
      file('README.TXT', 'notepad', { text: readme }, 'Start here'),
      file('WORLD.BMP', 'paint', {}, 'The Design OS mini world (Paintbrush)'),
    ],
    'DESIGNOS',
  );
}

function buildFs() {
  const root = rootDir();
  const link = (node, parent) => {
    node.parent = parent;
    if (node.kind === 'dir') node.children.forEach((c) => link(c, node));
  };
  link(root, null);
  return root;
}

function pathOf(node) {
  if (!node.parent) return 'C:\\';
  const parts = [];
  for (let n = node; n.parent; n = n.parent) parts.unshift(n.name);
  return `C:\\${parts.join('\\')}`;
}

function resolve(root, path) {
  const parts = path
    .replace(/^c:\\?/i, '')
    .split('\\')
    .filter(Boolean);
  let node = root;
  for (const part of parts) {
    if (node.kind !== 'dir') return null;
    node = node.children.find((c) => c.name.toUpperCase() === part.toUpperCase());
    if (!node) return null;
  }
  return node;
}

function walk(node, fn) {
  fn(node);
  if (node.kind === 'dir') node.children.forEach((c) => walk(c, fn));
}

function wildcard(pattern) {
  const re = pattern
    .toUpperCase()
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${re}$`);
}

// ---------------------------------------------------------------------------
// Window manager
// ---------------------------------------------------------------------------

function createWM(screen, root) {
  const wins = [];
  const iconTray = h('div', { class: 'w31-tray' });
  screen.append(iconTray);
  let z = 10;
  let menu = null;
  let cascade = 0;

  const wm = {
    scale: 1,
    width: 800,
    height: 600,
    open,
    focus,
    close,
    minimize,
    restore,
    toggleMax,
    msgbox,
    showMenu,
    closeMenu,
    menuOwner: () => menu?.owner ?? null,
    nextPos,
  };

  function nextPos(w, hgt) {
    if (wm.width < 640) return { x: 4, y: 4 + (cascade++ % 4) * 18, w: wm.width - 8, h: Math.min(hgt, wm.height - 70) };
    const x = wm.width - w - 16 - (cascade % 6) * 26;
    const y = Math.min(wm.height - hgt - 60, 40 + (cascade % 6) * 26);
    cascade++;
    return { x: Math.max(4, x), y: Math.max(4, y), w, h: hgt };
  }

  function applyGeom(win) {
    const el = win.el;
    if (win.max) {
      Object.assign(el.style, { left: '0px', top: '0px', width: `${wm.width}px`, height: `${wm.height}px` });
    } else {
      Object.assign(el.style, { left: `${win.x}px`, top: `${win.y}px`, width: `${win.w}px`, height: win.h === 'auto' ? 'auto' : `${win.h}px` });
    }
  }

  function open(o) {
    if (o.id) {
      const existing = wins.find((w) => w.id === o.id);
      if (existing) {
        if (existing.minimized) restore(existing);
        focus(existing);
        return existing;
      }
    }
    const dialog = o.kind === 'dialog';
    const win = { ...o, x: o.x ?? 40, y: o.y ?? 40, w: o.w ?? 400, h: o.h ?? 300, max: false, minimized: false };
    const titleText = h('h2', { class: 'w31-title' }, o.title);
    const ctl = h('button', { class: 'w31-ctl', type: 'button', 'aria-label': `Control menu: ${o.title}`, 'aria-haspopup': 'menu' });
    const minBtn = dialog ? null : h('button', { class: 'w31-tbtn', type: 'button', 'aria-label': 'Minimize', html: SVG_DOWN, onclick: () => minimize(win) });
    const maxBtn = dialog ? null : h('button', { class: 'w31-tbtn', type: 'button', 'aria-label': 'Maximize', html: SVG_UP, onclick: () => toggleMax(win) });
    const titlebar = h('div', { class: 'w31-titlebar' }, ctl, titleText, minBtn, maxBtn);
    const frame = h('div', { class: 'w31-win__frame' }, titlebar, o.menubar ?? null, o.body);
    const el = h('section', { class: `w31-win${dialog ? ' w31-win--dialog' : ''}`, 'aria-label': o.title, tabindex: '-1' }, frame);
    if (!dialog) el.append(h('div', { class: 'w31-grip', 'aria-hidden': 'true' }));
    Object.assign(win, { el, titleText, maxBtn });
    win.setTitle = (t) => {
      win.title = t;
      titleText.textContent = t;
      el.setAttribute('aria-label', t);
    };

    if (o.modal) {
      win.shield = h('div', { class: 'w31-shield', onpointerdown: (e) => e.stopPropagation() });
      screen.append(win.shield);
    }
    screen.append(el);
    wins.push(win);
    if (o.center) {
      win.x = Math.max(4, (wm.width - win.w) / 2);
      applyGeom(win);
      const hh = el.offsetHeight;
      win.y = Math.max(4, (wm.height - hh) / 2 - 20);
    }
    applyGeom(win);
    focus(win);

    el.addEventListener('pointerdown', () => focus(win), true);
    ctl.addEventListener('click', () => {
      const r = ctl.getBoundingClientRect();
      showMenu(
        r,
        [
          { label: '&Restore', disabled: !win.max, action: () => toggleMax(win) },
          { label: '&Move', disabled: true },
          { label: '&Size', disabled: true },
          { label: 'Mi&nimize', disabled: dialog, action: () => minimize(win) },
          { label: 'Ma&ximize', disabled: dialog || win.max, action: () => toggleMax(win) },
          { sep: true },
          { label: '&Close', key: 'Alt+F4', action: () => close(win) },
          { sep: true },
          { label: 'S&witch To...', key: 'Ctrl+Esc', disabled: true },
        ],
        ctl,
      );
    });
    ctl.addEventListener('dblclick', () => close(win));
    titlebar.addEventListener('dblclick', (e) => {
      if (!dialog && !e.target.closest('button')) toggleMax(win);
    });

    // drag
    titlebar.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('button') || win.max) return;
      const sx = e.clientX;
      const sy = e.clientY;
      const ox = win.x;
      const oy = win.y;
      titlebar.setPointerCapture(e.pointerId);
      const move = (ev) => {
        win.x = Math.min(wm.width - 40, Math.max(40 - win.w, ox + (ev.clientX - sx) / wm.scale));
        win.y = Math.min(wm.height - 20, Math.max(0, oy + (ev.clientY - sy) / wm.scale));
        applyGeom(win);
      };
      const up = () => {
        titlebar.removeEventListener('pointermove', move);
        titlebar.removeEventListener('pointerup', up);
      };
      titlebar.addEventListener('pointermove', move);
      titlebar.addEventListener('pointerup', up);
    });

    // resize
    const grip = el.querySelector('.w31-grip');
    grip?.addEventListener('pointerdown', (e) => {
      if (win.max) return;
      e.preventDefault();
      const sx = e.clientX;
      const sy = e.clientY;
      const ow = win.w;
      const oh = win.h === 'auto' ? el.offsetHeight : win.h;
      grip.setPointerCapture(e.pointerId);
      const move = (ev) => {
        win.w = Math.max(220, ow + (ev.clientX - sx) / wm.scale);
        win.h = Math.max(140, oh + (ev.clientY - sy) / wm.scale);
        applyGeom(win);
      };
      const up = () => {
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', up);
      };
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', up);
    });
    return win;
  }

  function focus(win) {
    if (!win || win.minimized) return;
    for (const w of wins) w.el.classList.toggle('is-active', w === win);
    if (win.el.style.zIndex !== String(z)) win.el.style.zIndex = String(++z);
    if (win.shield) win.shield.style.zIndex = String(z - 1);
    wm.active = win;
  }

  function close(win) {
    const i = wins.indexOf(win);
    if (i < 0) return;
    wins.splice(i, 1);
    win.el.remove();
    win.shield?.remove();
    win.trayIcon?.remove();
    win.onClose?.();
    closeMenu();
    const top = wins.filter((w) => !w.minimized).sort((a, b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex))[0];
    if (top) {
      focus(top);
      (win.returnFocus && root.contains(win.returnFocus) ? win.returnFocus : top.el).focus({ preventScroll: true });
    }
  }

  function minimize(win) {
    win.minimized = true;
    win.el.hidden = true;
    const btn = h(
      'button',
      {
        class: 'w31-desk-icon',
        type: 'button',
        'aria-label': `Restore ${win.title}`,
        ondblclick: () => restore(win),
        onkeydown: (e) => e.key === 'Enter' && restore(win),
      },
      icon(win.icon ?? 'program', 2),
      h('span', { class: 'w31-desk-icon__label' }, win.iconLabel ?? win.title),
    );
    win.trayIcon = btn;
    iconTray.append(btn);
    btn.focus({ preventScroll: true });
    const top = wins.filter((w) => !w.minimized).sort((a, b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex))[0];
    if (top) focus(top);
  }

  function restore(win) {
    win.minimized = false;
    win.el.hidden = false;
    win.trayIcon?.remove();
    win.trayIcon = null;
    focus(win);
    win.el.focus({ preventScroll: true });
  }

  function toggleMax(win) {
    win.max = !win.max;
    win.el.classList.toggle('is-max', win.max);
    if (win.maxBtn) {
      win.maxBtn.innerHTML = win.max ? SVG_RESTORE : SVG_UP;
      win.maxBtn.setAttribute('aria-label', win.max ? 'Restore' : 'Maximize');
    }
    applyGeom(win);
  }

  wm.relayout = () => {
    for (const w of wins) {
      if (w.max) applyGeom(w);
      else {
        w.x = Math.min(w.x, Math.max(0, wm.width - 60));
        w.y = Math.min(w.y, Math.max(0, wm.height - 40));
        applyGeom(w);
      }
    }
  };

  function msgbox({ title, iconName = 'info', text, buttons = [{ label: 'OK', primary: true }], w = 340 }) {
    let win;
    const btns = buttons.map((b) =>
      h(
        'button',
        {
          class: `w31-button${b.primary ? ' is-default' : ''}`,
          type: 'button',
          onclick: () => {
            close(win);
            b.action?.();
          },
        },
        mnemonic(b.label),
      ),
    );
    const body = h(
      'div',
      { class: 'w31-msg' },
      h('div', { class: 'w31-msg__row' }, iconName ? icon(iconName, 2) : null, h('div', { class: 'w31-msg__text' }, text.split('\n').map((line) => h('p', {}, line || '\u00a0')))),
      h('div', { class: 'w31-msg__buttons' }, btns),
    );
    const returnFocus = document.activeElement;
    win = open({ kind: 'dialog', title, body, w: wm.width < 400 ? wm.width - 16 : w, h: 'auto', center: true, modal: true, returnFocus });
    body.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close(win);
      }
    });
    (btns.find((b) => b.classList.contains('is-default')) ?? btns[0])?.focus({ preventScroll: true });
    return win;
  }

  // --- menus
  function showMenu(anchorRect, items, owner) {
    closeMenu();
    const sr = screen.getBoundingClientRect();
    const s = wm.scale;
    const el = h(
      'div',
      { class: 'w31-dropdown', role: 'menu' },
      items.map((it) => {
        if (it.sep) return h('div', { class: 'w31-dropdown__sep', role: 'separator' });
        return h(
          'button',
          {
            class: 'w31-mi',
            type: 'button',
            role: it.checked != null ? 'menuitemcheckbox' : 'menuitem',
            'aria-checked': it.checked != null ? String(!!it.checked) : null,
            disabled: it.disabled,
            onclick: () => {
              closeMenu();
              it.action?.();
            },
          },
          h('span', { class: 'w31-mi__check', html: it.checked ? SVG_CHECK : '' }),
          h('span', { class: 'w31-mi__label' }, mnemonic(it.label)),
          h('span', { class: 'w31-mi__key' }, it.key ?? ''),
        );
      }),
    );
    el.style.left = `${(anchorRect.left - sr.left) / s}px`;
    el.style.top = `${(anchorRect.bottom - sr.top) / s}px`;
    el.style.zIndex = String(z + 1000);
    screen.append(el);
    const over = el.offsetLeft + el.offsetWidth - wm.width;
    if (over > 0) el.style.left = `${Math.max(0, el.offsetLeft - over - 4)}px`;
    owner?.classList.add('is-open');
    owner?.setAttribute('aria-expanded', 'true');
    menu = { el, owner };
    el.addEventListener('keydown', (e) => {
      const btns = [...el.querySelectorAll('.w31-mi:not(:disabled)')];
      const i = btns.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        btns[(i + 1) % btns.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        btns[(i - 1 + btns.length) % btns.length]?.focus();
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        const o = menu?.owner;
        closeMenu();
        o?.focus();
      }
    });
    el.querySelector('.w31-mi:not(:disabled)')?.focus({ preventScroll: true });
  }

  function closeMenu() {
    if (!menu) return;
    menu.el.remove();
    menu.owner?.classList.remove('is-open');
    menu.owner?.setAttribute('aria-expanded', 'false');
    menu = null;
  }

  root.addEventListener('pointerdown', (e) => {
    if (menu && !menu.el.contains(e.target) && e.target !== menu.owner && !menu.owner?.contains(e.target)) closeMenu();
  });

  return wm;
}

function menubar(wm, defs, { before = null, after = null } = {}) {
  const bar = h('div', { class: 'w31-menubar', role: 'menubar' });
  if (before) bar.append(before);
  defs.forEach((def) => {
    const btn = h('button', { class: 'w31-menubar__item', type: 'button', role: 'menuitem', 'aria-haspopup': 'menu', 'aria-expanded': 'false' }, mnemonic(def.label));
    const openIt = () => wm.showMenu(btn.getBoundingClientRect(), def.items(), btn);
    btn.addEventListener('click', () => (wm.menuOwner() === btn ? wm.closeMenu() : openIt()));
    btn.addEventListener('pointerenter', () => {
      const owner = wm.menuOwner();
      if (owner && owner !== btn && bar.contains(owner)) openIt();
    });
    bar.append(btn);
  });
  if (after) bar.append(h('span', { class: 'w31-menubar__spacer' }), after);
  return bar;
}

// ---------------------------------------------------------------------------
// The desktop
// ---------------------------------------------------------------------------

const PAINT_COLORS = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#4000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040',
];

const PAINT_TOOLS = [
  ['Scissors', '<path d="M2 2l8 8M10 2L2 10" stroke="#000" fill="none"/><circle cx="2.5" cy="9.5" r="1.5" fill="none" stroke="#000"/><circle cx="9.5" cy="9.5" r="1.5" fill="none" stroke="#000"/>'],
  ['Pick', '<rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="#000" stroke-dasharray="1 1"/>'],
  ['Airbrush', '<path d="M3 9h3V5H3z" fill="#000"/><circle cx="9" cy="3" r=".6"/><circle cx="8" cy="5" r=".6"/><circle cx="10" cy="6" r=".6"/>'],
  ['Text', '<text x="1" y="10" font-size="10" font-family="serif" font-weight="bold">abc</text>'],
  ['Color Eraser', '<rect x="2" y="3" width="8" height="6" fill="#ff0000" stroke="#000"/>'],
  ['Eraser', '<rect x="2" y="3" width="8" height="6" fill="#fff" stroke="#000"/>'],
  ['Paint Roller', '<rect x="2" y="2" width="7" height="3" fill="#000"/><path d="M9 3.5h1.5V7H6v4" stroke="#000" fill="none"/>'],
  ['Brush', '<path d="M3 10c0-2 2-2 2-4l4-4 1 1-4 4c-2 0-2 2-3 3z" fill="#000"/>'],
  ['Curve', '<path d="M1 10C4 0 8 12 11 2" stroke="#000" fill="none"/>'],
  ['Line', '<path d="M1 11L11 1" stroke="#000"/>'],
  ['Box', '<rect x="1.5" y="2.5" width="9" height="7" fill="none" stroke="#000"/>'],
  ['Filled Box', '<rect x="1.5" y="2.5" width="9" height="7" fill="#808080" stroke="#000"/>'],
  ['Rounded Box', '<rect x="1.5" y="2.5" width="9" height="7" rx="2" fill="none" stroke="#000"/>'],
  ['Filled Rounded Box', '<rect x="1.5" y="2.5" width="9" height="7" rx="2" fill="#808080" stroke="#000"/>'],
  ['Circle', '<ellipse cx="6" cy="6" rx="4.5" ry="3.5" fill="none" stroke="#000"/>'],
  ['Filled Circle', '<ellipse cx="6" cy="6" rx="4.5" ry="3.5" fill="#808080" stroke="#000"/>'],
  ['Polygon', '<path d="M2 10l2-8 6 2-1 6z" fill="none" stroke="#000"/>'],
  ['Filled Polygon', '<path d="M2 10l2-8 6 2-1 6z" fill="#808080" stroke="#000"/>'],
];

/**
 * @param {{ path?: string, open?: string | null, search?: string | null, desktop?: string }} [options]
 */
export function createDesignOsFiles(options = {}) {
  const opts = { path: 'C:\\', open: 'C:\\README.TXT', search: null, desktop: '#008080', ...options };
  const fs = buildFs();
  const screen = h('div', { class: 'w31__screen' });
  const root = h('div', { class: 'w31', style: { '--w31-desktop': opts.desktop } }, screen);
  const wm = createWM(screen, root);

  // --------------------------------------------------------------- File Manager
  const fm = {
    cwd: resolve(fs, opts.path)?.kind === 'dir' ? resolve(fs, opts.path) : fs,
    expanded: new Set([fs]),
    selected: null,
    view: 'both',
    details: true,
    sort: 'name',
    status: true,
  };
  for (let n = fm.cwd; n; n = n.parent) fm.expanded.add(n);

  const tree = h('div', { class: 'w31-tree', role: 'tree', 'aria-label': 'Directory tree' });
  const list = h('div', { class: 'w31-list', role: 'listbox', 'aria-label': 'Directory contents' });
  const statusLeft = h('span', { class: 'w31-status__cell w31-status__cell--grow' });
  const statusRight = h('span', { class: 'w31-status__cell' });
  const status = h('div', { class: 'w31-status' }, statusLeft, statusRight);
  const volume = h('span', { class: 'w31-drives__label' }, 'C: [DESIGNOS]');
  const driveA = h(
    'button',
    {
      class: 'w31-drive',
      type: 'button',
      'aria-label': 'Drive A',
      onclick: () => noDisk(),
    },
    icon('floppy'),
    'a',
  );
  const driveC = h('button', { class: 'w31-drive is-current', type: 'button', 'aria-label': 'Drive C, DESIGNOS', 'aria-pressed': 'true', onclick: () => navigate(fs) }, icon('hdd'), 'c');
  const drives = h('div', { class: 'w31-drives' }, driveA, driveC, volume);
  const panes = h('div', { class: 'w31-panes' }, tree, h('div', { class: 'w31-panes__bar', 'aria-hidden': 'true' }), list);
  const fmBody = h('div', { class: 'w31-app w31-app--fm' }, drives, panes, status);

  function noDisk() {
    wm.msgbox({
      title: 'File Manager',
      iconName: 'warn',
      text: 'There is no disk in drive A.\nInsert a disk, and then try again.',
      buttons: [{ label: '&Retry', primary: true, action: () => noDisk() }, { label: 'Cancel' }],
    });
  }

  const fmMenus = [
    {
      label: '&File',
      items: () => [
        { label: '&Open', key: 'Enter', disabled: !fm.selected, action: () => fm.selected && activate(fm.selected) },
        { label: '&Move...', key: 'F7', disabled: true },
        { label: '&Copy...', key: 'F8', disabled: true },
        { label: '&Delete...', key: 'Del', disabled: true },
        { label: 'Re&name...', disabled: true },
        { label: 'Prope&rties...', key: 'Alt+Enter', disabled: !fm.selected || fm.selected === 'up', action: () => properties(fm.selected) },
        { sep: true },
        { label: '&Run...', disabled: true },
        { label: '&Print...', disabled: true },
        { label: '&Associate...', disabled: true },
        { sep: true },
        { label: 'Cr&eate Directory...', disabled: true },
        { label: 'Searc&h...', action: () => searchDialog() },
        { label: '&Select Files...', disabled: true },
        { sep: true },
        { label: 'E&xit', action: () => wm.minimize(fmWin) },
      ],
    },
    {
      label: '&Disk',
      items: () => [
        { label: '&Copy Disk...', disabled: true },
        { label: '&Label Disk...', disabled: true },
        { label: '&Format Disk...', disabled: true },
        { label: '&Make System Disk...', disabled: true },
        { sep: true },
        { label: 'Select &Drive...', disabled: true },
      ],
    },
    {
      label: '&Tree',
      items: () => [
        { label: 'E&xpand One Level', key: '+', action: () => expand(fm.cwd, false) },
        { label: 'Expand &Branch', key: '*', action: () => expand(fm.cwd, true) },
        { label: 'Expand &All', key: 'Ctrl+*', action: () => expand(fs, true) },
        { label: '&Collapse Branch', key: '-', action: () => collapse(fm.cwd) },
        { sep: true },
        { label: '&Indicate Expandable Branches', checked: true },
      ],
    },
    {
      label: '&View',
      items: () => [
        { label: 'T&ree and Directory', checked: fm.view === 'both', action: () => setView('both') },
        { label: 'Tr&ee Only', checked: fm.view === 'tree', action: () => setView('tree') },
        { label: 'Directory &Only', checked: fm.view === 'dir', action: () => setView('dir') },
        { sep: true },
        { label: 'Sp&lit', disabled: true },
        { sep: true },
        { label: '&Name', checked: !fm.details, action: () => setDetails(false) },
        { label: '&All File Details', checked: fm.details, action: () => setDetails(true) },
        { label: '&Partial Details...', disabled: true },
        { sep: true },
        { label: '&Sort by Name', checked: fm.sort === 'name', action: () => setSort('name') },
        { label: 'Sort &by Type', checked: fm.sort === 'type', action: () => setSort('type') },
        { label: 'Sort by Si&ze', checked: fm.sort === 'size', action: () => setSort('size') },
        { label: 'Sort by &Date', checked: fm.sort === 'date', action: () => setSort('date') },
        { sep: true },
        { label: 'By File &Type...', disabled: true },
      ],
    },
    {
      label: '&Options',
      items: () => [
        { label: '&Confirmation...', disabled: true },
        { label: '&Font...', disabled: true },
        { sep: true },
        {
          label: '&Status Bar',
          checked: fm.status,
          action: () => {
            fm.status = !fm.status;
            status.hidden = !fm.status;
          },
        },
        { label: '&Minimize on Use', disabled: true },
        { label: 'Save Settings on &Exit', checked: true, disabled: true },
      ],
    },
    {
      label: '&Window',
      items: () => [
        { label: '&New Window', disabled: true },
        { label: '&Cascade', key: 'Shift+F5', disabled: true },
        { label: '&Tile', key: 'Shift+F4', disabled: true },
        { label: '&Arrange Icons', disabled: true },
        { label: '&Refresh', key: 'F5', action: () => render() },
        { sep: true },
        { label: `&1 ${pathOf(fm.cwd)}${fm.cwd.parent ? '\\' : ''}*.*`, checked: true },
      ],
    },
    {
      label: '&Help',
      items: () => [
        { label: '&Contents', action: () => activate(resolve(fs, 'C:\\README.TXT')) },
        { label: '&Search for Help on...', disabled: true },
        { label: '&How to Use Help', disabled: true },
        { sep: true },
        { label: '&About File Manager...', action: () => about() },
      ],
    },
  ];
  const childCtl = h('span', { class: 'w31-ctl w31-ctl--doc', 'aria-hidden': 'true' });
  const childRestore = h('span', { class: 'w31-tbtn w31-tbtn--inline', 'aria-hidden': 'true', html: SVG_RESTORE });
  const fmBar = menubar(wm, fmMenus, { before: childCtl, after: childRestore });

  const fmWin = wm.open({ id: 'filemgr', title: 'File Manager', icon: 'filemgr', iconLabel: 'File Manager', body: fmBody, menubar: fmBar, x: 10, y: 10, w: 600, h: 420 });

  function displayName(node) {
    return node.name.toLowerCase();
  }

  function sortChildren(children) {
    const dirs = children.filter((c) => c.kind === 'dir').sort((a, b) => a.name.localeCompare(b.name));
    const ext = (n) => n.name.split('.')[1] ?? '';
    const files = children.filter((c) => c.kind === 'file');
    const by = {
      name: (a, b) => a.name.localeCompare(b.name),
      type: (a, b) => ext(a).localeCompare(ext(b)) || a.name.localeCompare(b.name),
      size: (a, b) => b.size - a.size || a.name.localeCompare(b.name),
      date: (a, b) => b.time.localeCompare(a.time) || a.name.localeCompare(b.name),
    }[fm.sort];
    return [...dirs, ...files.sort(by)];
  }

  function renderTitle() {
    const p = pathOf(fm.cwd);
    fmWin.setTitle(`File Manager - [${p}${fm.cwd.parent ? '\\' : ''}*.*]`);
  }

  function renderTree() {
    const rows = [];
    const visit = (node, depth, guides, isLast) => {
      const subdirs = node.children.filter((c) => c.kind === 'dir').sort((a, b) => a.name.localeCompare(b.name));
      const open = fm.expanded.has(node);
      const current = node === fm.cwd;
      const indent = h('span', { class: 'w31-tree__indent' }, guides.map((g) => h('span', { class: `w31-tree__guide${g ? ' has-line' : ''}` })), depth > 0 ? h('span', { class: `w31-tree__elbow${isLast ? ' is-last' : ''}` }) : null);
      const folderIcon = h('span', { class: 'w31-tree__folder' }, icon(current || open ? 'folderOpen' : 'folder'), subdirs.length ? h('span', { class: 'w31-tree__sign' }, open ? '-' : '+') : null);
      const row = h(
        'div',
        {
          class: `w31-tree__item${current ? ' is-current' : ''}`,
          role: 'treeitem',
          'aria-level': String(depth + 1),
          'aria-selected': String(current),
          'aria-expanded': subdirs.length ? String(open) : null,
          tabindex: current ? '0' : '-1',
          onclick: (e) => {
            if (e.target.closest('.w31-tree__folder') && subdirs.length) toggle(node);
            navigate(node, { keepTreeFocus: true });
          },
          ondblclick: () => subdirs.length && toggle(node),
        },
        indent,
        folderIcon,
        h('span', { class: 'w31-tree__label' }, node.parent ? displayName(node) : 'c:\\'),
      );
      row._node = node;
      rows.push(row);
      if (open) subdirs.forEach((c, i) => visit(c, depth + 1, depth > 0 ? [...guides, !isLast] : guides, i === subdirs.length - 1));
    };
    visit(fs, 0, [], true);
    tree.replaceChildren(...rows);
  }

  function rowFor(node) {
    const isUp = node === 'up';
    const n = isUp ? null : node;
    const selected = fm.selected === node;
    const iconName = isUp ? 'up' : n.kind === 'dir' ? 'folder' : n.app === 'dos' || n.app === 'exe' ? 'program' : n.app === 'none' ? 'file' : 'doc';
    const cells = [h('span', { class: 'w31-list__name' }, icon(iconName), h('span', { class: 'w31-list__text' }, isUp ? '..' : displayName(n)))];
    if (fm.details) {
      cells.push(
        h('span', { class: 'w31-list__size' }, isUp || n.kind === 'dir' ? '' : fmtBytes(n.size)),
        h('span', { class: 'w31-list__date' }, isUp ? '' : DATE),
        h('span', { class: 'w31-list__time' }, isUp ? '' : n.time ?? timeOf(n.name)),
        h('span', { class: 'w31-list__attr' }, isUp ? '' : n.kind === 'dir' ? '' : n.attr),
      );
    }
    const row = h(
      'div',
      {
        class: `w31-list__row${selected ? ' is-selected' : ''}`,
        role: 'option',
        'aria-selected': String(selected),
        tabindex: selected ? '0' : '-1',
        title: isUp ? 'Parent directory' : n.desc,
        onclick: () => select(node),
        ondblclick: () => activate(node),
      },
      cells,
    );
    row._node = node;
    return row;
  }

  function renderList() {
    const items = [...(fm.cwd.parent ? ['up'] : []), ...sortChildren(fm.cwd.children)];
    list.classList.toggle('is-names', !fm.details);
    list.replaceChildren(...items.map(rowFor), ...(fm.cwd.children.length ? [] : [h('p', { class: 'w31-list__empty' }, 'No files found.')]));
    if (!list.querySelector('[tabindex="0"]')) list.firstElementChild?.setAttribute('tabindex', '0');
  }

  function renderStatus() {
    const files = fm.cwd.children.filter((c) => c.kind === 'file');
    const bytes = files.reduce((n, f) => n + f.size, 0);
    const sel = fm.selected && fm.selected !== 'up' ? fm.selected : null;
    statusLeft.textContent = sel ? `${sel.name}  —  ${sel.desc}` : fm.cwd.parent ? `${pathOf(fm.cwd)}  —  ${fm.cwd.desc}` : `C: ${openCount} quests open, ${waitingCount} read-only (Oct 9)`;
    statusRight.textContent = sel && sel.kind === 'file' ? `Selected 1 file(s) (${fmtBytes(sel.size)} bytes)` : `Total ${files.length} file(s) (${fmtBytes(bytes)} bytes)`;
  }

  function render() {
    renderTitle();
    renderTree();
    renderList();
    renderStatus();
    panes.dataset.view = fm.view;
  }

  function navigate(node, { keepTreeFocus = false } = {}) {
    fm.cwd = node;
    fm.selected = null;
    for (let n = node; n; n = n.parent) if (n !== node) fm.expanded.add(n);
    render();
    if (keepTreeFocus) tree.querySelector('.is-current')?.focus({ preventScroll: true });
  }

  function toggle(node) {
    if (fm.expanded.has(node)) fm.expanded.delete(node);
    else fm.expanded.add(node);
    renderTree();
  }

  function expand(node, deep) {
    fm.expanded.add(node);
    if (deep) walk(node, (n) => n.kind === 'dir' && fm.expanded.add(n));
    renderTree();
  }

  function collapse(node) {
    walk(node, (n) => fm.expanded.delete(n));
    renderTree();
  }

  function setView(v) {
    fm.view = v;
    panes.dataset.view = v;
  }

  function setDetails(d) {
    fm.details = d;
    renderList();
  }

  function setSort(s) {
    fm.sort = s;
    renderList();
  }

  function select(node) {
    fm.selected = node;
    list.querySelectorAll('.w31-list__row').forEach((r) => {
      const on = r._node === node;
      r.classList.toggle('is-selected', on);
      r.setAttribute('aria-selected', String(on));
      r.setAttribute('tabindex', on ? '0' : '-1');
      if (on) r.focus({ preventScroll: false });
    });
    renderStatus();
  }

  function activate(node) {
    if (!node) return;
    if (node === 'up') {
      const from = fm.cwd;
      navigate(fm.cwd.parent);
      const back = [...list.children].find((r) => r._node === from);
      if (back) select(from);
      return;
    }
    if (node.kind === 'dir') {
      fm.expanded.add(node);
      navigate(node);
      list.querySelector('.w31-list__row')?.focus({ preventScroll: true });
      return;
    }
    openFile(node);
  }

  list.addEventListener('keydown', (e) => {
    const rows = [...list.querySelectorAll('.w31-list__row')];
    const i = rows.indexOf(document.activeElement);
    const step = { ArrowDown: 1, ArrowUp: -1, ArrowRight: fm.details ? 0 : 1, ArrowLeft: fm.details ? 0 : -1 }[e.key];
    if (step) {
      e.preventDefault();
      const next = rows[Math.min(rows.length - 1, Math.max(0, (i < 0 ? 0 : i) + step))];
      if (next) select(next._node);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const r = e.key === 'Home' ? rows[0] : rows[rows.length - 1];
      if (r) select(r._node);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.altKey && fm.selected && fm.selected !== 'up') properties(fm.selected);
      else if (i >= 0) activate(rows[i]._node);
    } else if (e.key === 'Backspace' && fm.cwd.parent) {
      e.preventDefault();
      activate('up');
    }
  });

  tree.addEventListener('keydown', (e) => {
    const rows = [...tree.querySelectorAll('.w31-tree__item')];
    const i = rows.indexOf(document.activeElement);
    if (i < 0) return;
    const node = rows[i]._node;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = rows[Math.min(rows.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
      navigate(next._node, { keepTreeFocus: true });
    } else if (e.key === 'ArrowRight' || e.key === '+') {
      e.preventDefault();
      fm.expanded.add(node);
      renderTree();
      tree.querySelector('.is-current')?.focus({ preventScroll: true });
    } else if (e.key === 'ArrowLeft' || e.key === '-') {
      e.preventDefault();
      if (fm.expanded.has(node) && node.children.some((c) => c.kind === 'dir')) collapse(node);
      else if (node.parent) navigate(node.parent, { keepTreeFocus: true });
      tree.querySelector('.is-current')?.focus({ preventScroll: true });
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.key === 'Enter') {
        e.preventDefault();
        list.querySelector('.w31-list__row')?.focus();
      }
    }
  });

  // --------------------------------------------------------------- dialogs
  function about() {
    wm.msgbox({
      title: 'About File Manager',
      iconName: 'filemgr',
      w: 380,
      text: [
        'Design OS File Manager',
        'Version 3.1 (Oct 10 2026)',
        '',
        'The Design OS map, projected onto drive C:.',
        'Source of record: FigJam "Design OS map — loop stages × dimensions".',
        '',
        `Read-only (r) quests: ${WAITING_NOTE}`,
      ].join('\n'),
    });
  }

  function properties(node) {
    const isFile = node.kind === 'file';
    const row = (label, value) => h('div', { class: 'w31-props__row' }, h('span', { class: 'w31-props__label' }, label), h('span', {}, value));
    const check = (label, on) => h('label', { class: 'w31-check' }, h('input', { type: 'checkbox', checked: on, disabled: true }), h('span', { class: 'w31-check__box', 'aria-hidden': 'true' }), label);
    let win;
    const body = h(
      'div',
      { class: 'w31-dialog' },
      h(
        'div',
        { class: 'w31-dialog__cols' },
        h(
          'div',
          { class: 'w31-props' },
          row('File Name:', node.name),
          isFile ? row('Size:', `${fmtBytes(node.size)} bytes`) : null,
          row('Last Change:', `${DATE}   ${node.time ?? timeOf(node.name)}`),
          row('Path:', pathOf(node.parent ?? node)),
          row('About:', node.desc),
          h(
            'fieldset',
            { class: 'w31-group-box' },
            h('legend', {}, 'Attributes'),
            check('Read Only', isFile && node.attr.includes('r')),
            check('Archive', isFile && node.attr.includes('a')),
            check('Hidden', false),
            check('System', false),
          ),
          isFile && node.attr.includes('r') ? h('p', { class: 'w31-dialog__note' }, 'Read only: depends on the Oct 9 session.') : null,
        ),
        h(
          'div',
          { class: 'w31-dialog__buttons' },
          h('button', { class: 'w31-button is-default', type: 'button', onclick: () => wm.close(win) }, 'OK'),
          h('button', { class: 'w31-button', type: 'button', onclick: () => wm.close(win) }, 'Cancel'),
          h('button', { class: 'w31-button', type: 'button', disabled: true }, 'Help'),
        ),
      ),
    );
    win = wm.open({ kind: 'dialog', title: 'Properties for ' + node.name, body, w: 400, h: 'auto', center: true, modal: true, returnFocus: document.activeElement });
    body.querySelector('.is-default').focus({ preventScroll: true });
  }

  function searchDialog() {
    let win;
    const input = h('input', { class: 'w31-input', type: 'text', value: 'G*.TXT', 'aria-label': 'Search for', spellcheck: 'false' });
    const from = h('input', { class: 'w31-input', type: 'text', value: pathOf(fm.cwd), 'aria-label': 'Start from', spellcheck: 'false' });
    const sub = h('input', { type: 'checkbox', checked: true });
    const go = () => {
      wm.close(win);
      searchResults(input.value.trim() || '*.*', from.value.trim() || 'C:\\', sub.checked);
    };
    const body = h(
      'form',
      { class: 'w31-dialog', onsubmit: (e) => (e.preventDefault(), go()) },
      h(
        'div',
        { class: 'w31-dialog__cols' },
        h(
          'div',
          { class: 'w31-props' },
          h('label', { class: 'w31-props__row' }, h('span', { class: 'w31-props__label' }, mnemonic('Search &For:')), input),
          h('label', { class: 'w31-props__row' }, h('span', { class: 'w31-props__label' }, mnemonic('&Start From:')), from),
          h('label', { class: 'w31-check' }, sub, h('span', { class: 'w31-check__box', 'aria-hidden': 'true' }), mnemonic('Search &All Subdirectories')),
          h('p', { class: 'w31-dialog__note' }, 'Try G*.TXT (quests), *.PLN (blueprints), *.BAT, or OBJECTS.CRD.'),
        ),
        h(
          'div',
          { class: 'w31-dialog__buttons' },
          h('button', { class: 'w31-button is-default', type: 'submit' }, 'OK'),
          h('button', { class: 'w31-button', type: 'button', onclick: () => wm.close(win) }, 'Cancel'),
        ),
      ),
    );
    win = wm.open({ kind: 'dialog', title: 'Search', body, w: 420, h: 'auto', center: true, modal: true, returnFocus: document.activeElement });
    input.focus();
    input.select();
  }

  function searchResults(pattern, startPath, deep) {
    const start = resolve(fs, startPath) ?? fs;
    const re = wildcard(pattern);
    const found = [];
    const visit = (node) => {
      for (const c of node.children) {
        if (c.kind === 'file' && re.test(c.name)) found.push(c);
        if (c.kind === 'dir' && deep) visit(c);
      }
    };
    if (start.kind === 'dir') visit(start);
    const rows = found.map((f) =>
      h(
        'div',
        {
          class: 'w31-list__row',
          role: 'option',
          'aria-selected': 'false',
          tabindex: '-1',
          title: f.desc,
          onclick: (e) => {
            body.querySelectorAll('.w31-list__row').forEach((r) => {
              r.classList.toggle('is-selected', r === e.currentTarget);
              r.setAttribute('aria-selected', String(r === e.currentTarget));
            });
            searchStatus.textContent = `${f.name}  —  ${f.desc}`;
          },
          ondblclick: () => openFile(f),
          onkeydown: (e) => e.key === 'Enter' && openFile(f),
        },
        h('span', { class: 'w31-list__name' }, icon(f.app === 'dos' || f.app === 'exe' ? 'program' : f.app === 'none' ? 'file' : 'doc'), h('span', { class: 'w31-list__text' }, pathOf(f).toLowerCase())),
        h('span', { class: 'w31-list__size' }, fmtBytes(f.size)),
        h('span', { class: 'w31-list__date' }, DATE),
        h('span', { class: 'w31-list__attr' }, f.attr),
      ),
    );
    if (rows[0]) rows[0].tabIndex = 0;
    const searchStatus = h('span', { class: 'w31-status__cell w31-status__cell--grow' }, `${found.length} file(s) found`);
    const body = h(
      'div',
      { class: 'w31-app w31-app--search' },
      h('div', { class: 'w31-list w31-list--search', role: 'listbox', 'aria-label': 'Search results' }, rows.length ? rows : h('p', { class: 'w31-list__empty' }, 'No matching files were found.')),
      h('div', { class: 'w31-status' }, searchStatus),
    );
    body.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const i = rows.indexOf(document.activeElement);
      const next = rows[Math.min(rows.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
      next?.focus();
      next?.click();
    });
    const geom = wm.nextPos(470, 330);
    wm.open({ id: `search:${pattern}:${startPath}`, title: `Search Results: ${pathOf(start)}${start.parent ? '\\' : ''}${pattern.toUpperCase()}`, icon: 'filemgr', iconLabel: 'Search Results', body, ...geom });
    rows[0]?.focus({ preventScroll: true });
  }

  // --------------------------------------------------------------- apps
  function openFile(node) {
    const returnFocus = document.activeElement;
    const app = { notepad: openNotepad, cardfile: openCardfile, write: openWrite, progman: openGroup, dos: openDos, exe: openExe, paint: openPaint }[node.app];
    if (!app) {
      wm.msgbox({
        title: 'File Manager',
        iconName: 'stop',
        text: `No application is associated with this file.\nChoose Associate from the File menu to create an association.\n\n${node.name}: ${node.desc}`,
      });
      return;
    }
    const win = app(node);
    if (win) win.returnFocus = returnFocus;
  }

  function appMenus(win, extra = []) {
    return [
      {
        label: '&File',
        items: () => [
          { label: '&New', disabled: true },
          { label: '&Open...', disabled: true },
          { label: '&Save', disabled: true },
          { label: 'Save &As...', disabled: true },
          { sep: true },
          { label: '&Print', disabled: true },
          { sep: true },
          { label: 'E&xit', action: () => wm.close(win.ref) },
        ],
      },
      ...extra,
    ];
  }

  function openNotepad(node) {
    const ro = node.attr.includes('r');
    const pre = h('pre', { class: 'w31-notepad', tabindex: '0', 'aria-label': `${node.name} contents` }, ascii(node.payload.text));
    let wrap = true;
    const ref = {};
    const bar = menubar(
      wm,
      appMenus(ref, [
        {
          label: '&Edit',
          items: () => [
            { label: '&Undo', key: 'Ctrl+Z', disabled: true },
            { sep: true },
            { label: 'Cu&t', key: 'Ctrl+X', disabled: true },
            { label: '&Copy', key: 'Ctrl+C', action: () => navigator.clipboard?.writeText(String(window.getSelection() || pre.textContent)) },
            { label: '&Paste', key: 'Ctrl+V', disabled: true },
            { label: 'De&lete', key: 'Del', disabled: true },
            { sep: true },
            {
              label: 'Select &All',
              action: () => {
                const r = document.createRange();
                r.selectNodeContents(pre);
                const s = window.getSelection();
                s.removeAllRanges();
                s.addRange(r);
              },
            },
            { label: 'Time/&Date', key: 'F5', disabled: true },
            { sep: true },
            {
              label: '&Word Wrap',
              checked: wrap,
              action: () => {
                wrap = !wrap;
                pre.classList.toggle('is-nowrap', !wrap);
              },
            },
          ],
        },
        { label: '&Search', items: () => [{ label: '&Find...', disabled: true }, { label: 'Find &Next', key: 'F3', disabled: true }] },
        { label: '&Help', items: () => [{ label: '&About Notepad...', action: () => wm.msgbox({ title: 'About Notepad', iconName: 'notepad', text: 'Notepad\nDesign OS edition\n\nEvery text file here is a projection of the FigJam map.' }) }] },
      ]),
    );
    const geom = wm.nextPos(460, 340);
    ref.ref = wm.open({ id: `np:${pathOf(node)}`, title: `Notepad - ${node.name}${ro ? ' [Read Only]' : ''}`, icon: 'notepad', iconLabel: node.name, body: h('div', { class: 'w31-app w31-app--notepad' }, pre), menubar: bar, ...geom });
    pre.focus({ preventScroll: true });
    return ref.ref;
  }

  function openCardfile(node) {
    const cards = node.payload.cards;
    let order = cards.map((_, i) => i);
    const stack = h('div', { class: 'w31-cards' });
    const count = h('span', { class: 'w31-cardbar__count' });
    const DX = 16;
    const DY = 19;
    const render = () => {
      const n = order.length;
      stack.style.width = `${280 + (n - 1) * DX}px`;
      stack.style.height = `${168 + (n - 1) * DY}px`;
      stack.replaceChildren(
        ...[...order].reverse().map((ci, k) => {
          const depth = n - 1 - k;
          const c = cards[ci];
          const front = depth === 0;
          return h(
            'div',
            { class: `w31-card${front ? ' is-front' : ''}`, style: { left: `${depth * DX}px`, top: `${(n - 1 - depth) * DY}px` } },
            h(
              'button',
              {
                class: 'w31-card__index',
                type: 'button',
                tabindex: front ? '-1' : '0',
                'aria-label': front ? c.index : `Bring to front: ${c.index}`,
                onclick: () => {
                  order = [ci, ...order.filter((x) => x !== ci)];
                  render();
                },
              },
              ascii(c.index),
            ),
            front ? h('pre', { class: 'w31-card__body' }, ascii(c.body)) : null,
          );
        }),
      );
      count.textContent = `${n} Card${n === 1 ? '' : 's'}`;
    };
    const step = (d) => {
      order = d > 0 ? [...order.slice(1), order[0]] : [order[order.length - 1], ...order.slice(0, -1)];
      render();
    };
    const body = h(
      'div',
      { class: 'w31-app w31-app--cardfile' },
      h(
        'div',
        { class: 'w31-cardbar' },
        h('span', { class: 'w31-cardbar__view' }, 'Card View'),
        h('button', { class: 'w31-arrow', type: 'button', 'aria-label': 'Previous card', onclick: () => step(-1), html: '<svg width="6" height="9" viewBox="0 0 6 9" shape-rendering="crispEdges"><path d="M5 0h1v9H5zM4 1h1v7H4zM3 2h1v5H3zM2 3h1v3H2zM1 4h1v1H1z"/></svg>' }),
        h('button', { class: 'w31-arrow', type: 'button', 'aria-label': 'Next card', onclick: () => step(1), html: '<svg width="6" height="9" viewBox="0 0 6 9" shape-rendering="crispEdges"><path d="M0 0h1v9H0zM1 1h1v7H1zM2 2h1v5H2zM3 3h1v3H3zM4 4h1v1H4z"/></svg>' }),
        count,
      ),
      h('div', { class: 'w31-cards__area' }, stack),
    );
    render();
    const ref = {};
    const bar = menubar(
      wm,
      appMenus(ref, [
        { label: '&Edit', items: () => [{ label: '&Undo', disabled: true }, { label: '&Index...', key: 'F6', disabled: true }] },
        { label: '&View', items: () => [{ label: '&Cards', checked: true }, { label: '&List', disabled: true }] },
        { label: '&Card', items: () => [{ label: '&Add...', key: 'F7', disabled: true }, { label: '&Delete', disabled: true }, { label: 'D&uplicate', disabled: true }, { label: 'A&utodial...', key: 'F5', disabled: true }] },
        { label: 'S&earch', items: () => [{ label: '&Go To...', key: 'F4', disabled: true }, { label: '&Find...', disabled: true }] },
        { label: '&Help', items: () => [{ label: '&About Cardfile...', action: () => wm.msgbox({ title: 'About Cardfile', iconName: 'cardfile', text: 'Cardfile\nDesign OS edition\n\nDatabase shapes on the FigJam map are card files here.' }) }] },
      ]),
    );
    const geom = wm.nextPos(Math.min(520, 330 + order.length * DX), Math.min(460, 250 + order.length * DY));
    ref.ref = wm.open({ id: `cf:${pathOf(node)}`, title: `Cardfile - ${node.name}`, icon: 'cardfile', iconLabel: node.name, body, menubar: bar, ...geom });
    return ref.ref;
  }

  function openWrite(node) {
    const p = node.payload;
    const page = h(
      'div',
      { class: 'w31-write__page' },
      h('h1', { class: 'w31-write__title' }, p.title),
      p.subtitle ? h('p', { class: 'w31-write__sub' }, p.subtitle) : null,
      ...p.sections.map((sec) => h('ul', { class: 'w31-write__list' }, sec.bullets.map((b) => h('li', {}, b)))),
      h('p', { class: 'w31-write__end', 'aria-hidden': 'true' }, '¤'),
    );
    const body = h('div', { class: 'w31-app w31-app--write' }, h('div', { class: 'w31-write__scroll', tabindex: '0' }, page), h('div', { class: 'w31-status' }, h('span', { class: 'w31-status__cell' }, 'Page 1')));
    const ref = {};
    const off = (label) => ({ label: `&${label}`, items: () => [{ label: 'Not available in this edition', disabled: true }] });
    const bar = menubar(wm, appMenus(ref, [off('Edit'), { ...off('Find'), label: 'Fi&nd' }, off('Character'), off('Paragraph'), off('Document'), { label: '&Help', items: () => [{ label: '&About Write...', action: () => wm.msgbox({ title: 'About Write', iconName: 'write', text: 'Write\nDesign OS edition\n\nWhat each stage writes back to Notion.' }) }] }]));
    const geom = wm.nextPos(460, 320);
    ref.ref = wm.open({ id: `wr:${pathOf(node)}`, title: `Write - ${node.name}`, icon: 'write', iconLabel: node.name, body, menubar: bar, ...geom });
    return ref.ref;
  }

  function openGroup(node) {
    const p = node.payload;
    const grid = h('div', { class: 'w31-group', role: 'listbox', 'aria-label': p.title });
    const launch = (it) =>
      it.proposed
        ? wm.msgbox({ title: 'Program Manager', iconName: 'warn', text: `Cannot find ${it.label.toUpperCase()}.\n\nThis program is proposed and does not exist yet.` })
        : wm.msgbox({ title: it.label, iconName: 'info', text: `${it.label}\n\n${p.note}` });
    p.items.forEach((it) => {
      const btn = h(
        'button',
        {
          class: `w31-group__item${it.proposed ? ' is-proposed' : ''}`,
          type: 'button',
          role: 'option',
          'aria-selected': 'false',
          title: it.proposed ? `${it.label} (proposed)` : it.label,
          onclick: (e) => {
            grid.querySelectorAll('.w31-group__item').forEach((b) => b.setAttribute('aria-selected', String(b === e.currentTarget)));
          },
          ondblclick: () => launch(it),
          onkeydown: (e) => e.key === 'Enter' && (e.preventDefault(), launch(it)),
        },
        icon(it.icon, 2),
        h('span', { class: 'w31-group__label' }, it.label, it.proposed ? h('em', {}, ' (proposed)') : null),
      );
      grid.append(btn);
    });
    const ref = {};
    const bar = menubar(wm, appMenus(ref, [{ label: '&Options', items: () => [{ label: '&Auto Arrange', checked: true, disabled: true }, { label: '&Minimize on Use', disabled: true }] }, { label: '&Window', items: () => [{ label: `&1 ${p.title}`, checked: true }] }, { label: '&Help', items: () => [{ label: '&About Program Manager...', action: () => wm.msgbox({ title: 'About Program Manager', iconName: 'group', text: 'Program Manager\nDesign OS edition\n\nTools: where the work happens. One job per tool.' }) }] }]));
    const geom = wm.nextPos(440, 290);
    ref.ref = wm.open({ id: `pm:${pathOf(node)}`, title: `Program Manager - [${p.title}]`, icon: 'group', iconLabel: p.title, body: h('div', { class: 'w31-app w31-app--group' }, grid), menubar: bar, ...geom });
    grid.querySelector('button')?.focus({ preventScroll: true });
    return ref.ref;
  }

  function openDos(node) {
    const p = node.payload;
    const out = h('pre', { class: 'w31-dos', tabindex: '0', 'aria-live': 'polite', 'aria-label': 'MS-DOS Prompt output' });
    const cursor = h('span', { class: 'w31-dos__cursor' }, '_');
    const lines = [`${p.cwd}>${p.cmd}`, '', ...p.lines.map(ascii), ''];
    let i = 0;
    let done = false;
    let closed = false;
    const finish = () => {
      if (done) return;
      done = true;
      out.append(`${p.pause ? 'Press any key to continue . . .' : ''}`);
      const prompt = () => {
        out.append(`\n\n${p.cwd}>`, cursor);
        out.scrollTop = out.scrollHeight;
      };
      if (p.pause) {
        const any = () => {
          out.removeEventListener('keydown', any);
          out.removeEventListener('click', any);
          prompt();
        };
        out.addEventListener('keydown', any);
        out.addEventListener('click', any);
      } else {
        out.append(`${p.cwd}>`, cursor);
      }
    };
    const tick = () => {
      if (closed || !root.isConnected) return;
      if (i >= lines.length) {
        finish();
        return;
      }
      out.append(`${lines[i]}\n`);
      out.scrollTop = out.scrollHeight;
      i++;
      setTimeout(tick, i === 1 ? 260 : 70);
    };
    const geom = wm.nextPos(560, 320);
    const win = wm.open({ title: `MS-DOS Prompt - ${node.name}`, icon: 'dos', iconLabel: 'MS-DOS Prompt', body: h('div', { class: 'w31-app w31-app--dos' }, out), onClose: () => (closed = true), ...geom });
    out.focus({ preventScroll: true });
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      out.append(lines.join('\n'));
      i = lines.length;
      finish();
    } else {
      tick();
    }
    return win;
  }

  function openExe(node) {
    const p = node.payload;
    return wm.msgbox({
      title: p.title,
      iconName: 'info',
      w: 420,
      text: p.text,
      buttons: [{ label: 'OK', primary: true }, { label: '&Consumers...', action: () => openFile(p.consumers) }],
    });
  }

  function openPaint(node) {
    const bmp = renderWorldBitmap();
    bmp.className = 'w31-paint__bitmap';
    bmp.setAttribute('role', 'img');
    bmp.setAttribute('aria-label', 'The Design OS mini world: seven lands on a ring road around the Canopy tree.');
    const ctx = bmp.getContext('2d');
    let color = '#000000';
    const current = h('span', { class: 'w31-paint__current', style: { background: color } });
    const palette = h(
      'div',
      { class: 'w31-paint__palette' },
      h('span', { class: 'w31-paint__current-box' }, current),
      h(
        'div',
        { class: 'w31-paint__swatches' },
        PAINT_COLORS.map((c) =>
          h('button', {
            class: 'w31-paint__swatch',
            type: 'button',
            style: { background: c },
            'aria-label': `Color ${c}`,
            onclick: () => {
              color = c;
              current.style.background = c;
            },
          }),
        ),
      ),
    );
    const tools = h(
      'div',
      { class: 'w31-paint__tools', role: 'toolbar', 'aria-label': 'Tools' },
      PAINT_TOOLS.map(([name, svg]) =>
        h('button', {
          class: `w31-paint__tool${name === 'Brush' ? ' is-on' : ''}`,
          type: 'button',
          'aria-label': name,
          'aria-pressed': String(name === 'Brush'),
          disabled: name !== 'Brush',
          html: `<svg width="12" height="12" viewBox="0 0 12 12">${svg}</svg>`,
        }),
      ),
      h('div', { class: 'w31-paint__widths', 'aria-hidden': 'true' }, [1, 2, 3, 4, 6].map((w) => h('span', { style: { height: `${w}px` } }))),
    );
    let drawing = false;
    const paintAt = (e) => {
      const r = bmp.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / r.width) * bmp.width);
      const y = Math.floor(((e.clientY - r.top) / r.height) * bmp.height);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    };
    bmp.addEventListener('pointerdown', (e) => {
      drawing = true;
      bmp.setPointerCapture(e.pointerId);
      paintAt(e);
    });
    bmp.addEventListener('pointermove', (e) => drawing && paintAt(e));
    bmp.addEventListener('pointerup', () => (drawing = false));
    const body = h(
      'div',
      { class: 'w31-app w31-app--paint' },
      h('div', { class: 'w31-paint__main' }, tools, h('div', { class: 'w31-paint__canvas', tabindex: '0', 'aria-label': 'Canvas' }, bmp)),
      palette,
    );
    const ref = {};
    const off = (label) => ({ label, items: () => [{ label: 'Not available in this edition', disabled: true }] });
    const bar = menubar(wm, appMenus(ref, [off('&Edit'), off('&View'), off('&Text'), off('&Pick'), off('&Options'), { label: '&Help', items: () => [{ label: '&About Paintbrush...', action: () => wm.msgbox({ title: 'About Paintbrush', iconName: 'paint', text: 'Paintbrush\nDesign OS edition\n\nWORLD.BMP is the same Design OS as a pixel world: seven lands on a ring road around the Canopy tree. The brush works.' }) }] }]));
    const geom = wm.nextPos(Math.min(wm.width - 16, 880), Math.min(wm.height - 70, 620));
    ref.ref = wm.open({ id: 'paint:world', title: `Paintbrush - ${node.name}`, icon: 'paint', iconLabel: node.name, body, menubar: bar, ...geom });
    return ref.ref;
  }

  // --------------------------------------------------------------- layout + boot
  const s0 = { done: false };
  function fit() {
    const r = root.getBoundingClientRect();
    const w = r.width || 1024;
    const hh = r.height || 700;
    const s = w >= 1680 && hh >= 960 ? 1.5 : w >= 1280 && hh >= 760 ? 1.25 : 1;
    wm.scale = s;
    wm.width = Math.floor(w / s);
    wm.height = Math.floor(hh / s);
    Object.assign(screen.style, { width: `${wm.width}px`, height: `${wm.height}px`, transform: s === 1 ? 'none' : `scale(${s})` });
    if (!s0.done) {
      s0.done = true;
      boot();
    } else {
      wm.relayout();
    }
  }

  function boot() {
    const narrow = wm.width < 640;
    Object.assign(fmWin, narrow ? { x: 0, y: 0, w: wm.width, h: wm.height - 64 } : { x: 10, y: 10, w: Math.min(660, Math.round(wm.width * 0.64)), h: Math.min(560, wm.height - 90) });
    if (narrow) fm.view = 'dir';
    fmWin.el.style.left = `${fmWin.x}px`;
    fmWin.el.style.top = `${fmWin.y}px`;
    fmWin.el.style.width = `${fmWin.w}px`;
    fmWin.el.style.height = `${fmWin.h}px`;
    render();
    if (opts.search) searchResults(opts.search, 'C:\\', true);
    if (opts.open) {
      const node = resolve(fs, opts.open);
      if (node?.kind === 'file') {
        if (node.parent !== fm.cwd) navigate(node.parent);
        select(node);
        openFile(node);
      }
    }
  }

  const ro = new ResizeObserver(() => {
    if (!root.isConnected) return;
    fit();
  });
  // Timers (not rAF) so boot also runs in a background tab or a hidden docs iframe.
  const mountCheck = () => {
    if (root.isConnected) {
      ro.observe(root);
      fit();
    } else setTimeout(mountCheck, 30);
  };
  setTimeout(mountCheck, 0);

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wm.menuOwner()) {
      const o = wm.menuOwner();
      wm.closeMenu();
      o?.focus();
    }
  });
  return root;
}
