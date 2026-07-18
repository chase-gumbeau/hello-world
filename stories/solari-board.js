/**
 * Vestaboard-inspired Solari split-flap board.
 * Fixed 6×22 grid, black flaps / white glyphs, message opens with flips.
 */

const ROWS = 6;
const COLS = 22;
const CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?.\'-';

function charIndex(ch) {
  const i = CHARSET.indexOf(ch.toUpperCase());
  return i === -1 ? 0 : i;
}

function createCell() {
  const cell = document.createElement('div');
  cell.className = 'solari__cell';
  cell.setAttribute('aria-hidden', 'true');
  cell.innerHTML = `
    <div class="solari__half solari__half--top">
      <span class="solari__glyph">&nbsp;</span>
    </div>
    <div class="solari__half solari__half--bottom">
      <span class="solari__glyph">&nbsp;</span>
    </div>
    <div class="solari__flap solari__flap--top">
      <span class="solari__glyph">&nbsp;</span>
    </div>
    <div class="solari__flap solari__flap--bottom">
      <span class="solari__glyph">&nbsp;</span>
    </div>
    <span class="solari__nub solari__nub--left" aria-hidden="true"></span>
    <span class="solari__nub solari__nub--right" aria-hidden="true"></span>
    <div class="solari__seam" aria-hidden="true"></div>
  `;
  return cell;
}

function displayChar(ch) {
  return ch === ' ' ? '\u00A0' : ch;
}

function setHalfGlyphs(cell, ch) {
  const glyph = displayChar(ch);
  cell.querySelectorAll('.solari__half .solari__glyph').forEach((el) => {
    el.textContent = glyph;
  });
}

function setFlapGlyphs(cell, topCh, bottomCh) {
  cell.querySelector('.solari__flap--top .solari__glyph').textContent =
    displayChar(topCh);
  cell.querySelector('.solari__flap--bottom .solari__glyph').textContent =
    displayChar(bottomCh);
}

function flipOnce(cell, fromCh, toCh) {
  return new Promise((resolve) => {
    const topFlap = cell.querySelector('.solari__flap--top');
    const bottomFlap = cell.querySelector('.solari__flap--bottom');

    setFlapGlyphs(cell, fromCh, toCh);
    topFlap.classList.remove('is-flip');
    bottomFlap.classList.remove('is-flip');
    void topFlap.offsetWidth;

    topFlap.classList.add('is-flip');
    bottomFlap.classList.add('is-flip');

    const onEnd = (event) => {
      if (event.target !== bottomFlap) return;
      bottomFlap.removeEventListener('animationend', onEnd);
      setHalfGlyphs(cell, toCh);
      topFlap.classList.remove('is-flip');
      bottomFlap.classList.remove('is-flip');
      setFlapGlyphs(cell, toCh, toCh);
      resolve();
    };

    bottomFlap.addEventListener('animationend', onEnd);
  });
}

async function animateCellTo(cell, target, { stepMs = 24, minFlips = 4 } = {}) {
  const goal = target.toUpperCase();
  let current = ' ';
  setHalfGlyphs(cell, current);
  setFlapGlyphs(cell, current, current);

  if (goal === ' ') return;

  const start = charIndex(current);
  const end = charIndex(goal);
  let distance = (end - start + CHARSET.length) % CHARSET.length;
  if (distance < minFlips) distance += CHARSET.length;

  for (let step = 1; step <= distance; step += 1) {
    const next = CHARSET[(start + step) % CHARSET.length];
    // eslint-disable-next-line no-await-in-loop
    await flipOnce(cell, current, next);
    current = next;
    if (stepMs > 0) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, stepMs));
    }
  }
}

/** Center a single-line message on a given row of a COLS-wide board. */
function layoutMessage(message, rowIndex = 2) {
  const text = message.toUpperCase().slice(0, COLS);
  const pad = Math.max(0, Math.floor((COLS - text.length) / 2));
  const line = `${' '.repeat(pad)}${text}${' '.repeat(COLS - pad - text.length)}`;
  const grid = Array.from({ length: ROWS }, () => ' '.repeat(COLS).split(''));
  grid[rowIndex] = [...line];
  return grid;
}

/**
 * Full-viewport Vestaboard-style split-flap board.
 * Animates HELLO WORLD open across the center row.
 */
export function createSolariBoard(message = 'HELLO WORLD') {
  const targets = layoutMessage(message, 2);

  const root = document.createElement('div');
  root.className = 'solari';
  root.setAttribute('role', 'img');
  root.setAttribute(
    'aria-label',
    `Split-flap board displaying ${message}`,
  );

  const frame = document.createElement('div');
  frame.className = 'solari__frame';

  const grid = document.createElement('div');
  grid.className = 'solari__grid';
  grid.style.setProperty('--solari-cols', String(COLS));
  grid.style.setProperty('--solari-rows', String(ROWS));

  /** @type {{ cell: HTMLElement, ch: string, row: number, col: number }[]} */
  const cells = [];

  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const ch = targets[r][c];
      const cell = createCell();
      setHalfGlyphs(cell, ' ');
      setFlapGlyphs(cell, ' ', ' ');
      grid.append(cell);
      cells.push({ cell, ch, row: r, col: c });
    }
  }

  frame.append(grid);
  root.append(frame);

  const run = async () => {
    root.classList.add('is-running');
    root.classList.remove('is-settled');

    cells.forEach(({ cell }) => {
      setHalfGlyphs(cell, ' ');
      setFlapGlyphs(cell, ' ', ' ');
    });

    const active = cells.filter(({ ch }) => ch !== ' ');
    const staggerMs = 55;

    await Promise.all(
      active.map(({ cell, ch, col }, index) =>
        (async () => {
          // Open left → right along the message
          await new Promise((r) => setTimeout(r, col * staggerMs + (index % 3) * 12));
          await animateCellTo(cell, ch, {
            stepMs: 18,
            minFlips: 8 + (col % 7),
          });
        })(),
      ),
    );

    root.classList.add('is-settled');
    root.classList.remove('is-running');
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      run();
    });
  });

  root.addEventListener('click', () => {
    if (root.classList.contains('is-running')) return;
    run();
  });

  return root;
}
