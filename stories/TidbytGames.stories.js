import './tidbyt-display.css';
import { createLedDisplay } from './tidbyt-display.js';
import { createTicker, FRAME_MS, parseBdf, upcoming } from './tidbyt-games.js';
import snapshot from '../tidbyt/games/games.json';
import tb8 from '../tidbyt/games/fonts/tb-8.bdf?raw';
import tomThumb from '../tidbyt/games/fonts/tom-thumb.bdf?raw';

const fonts = { tb8: parseBdf(tb8), tomThumb: parseBdf(tomThumb) };

export default {
  title: 'Projects/Tidbyt/Upcoming Games',
  parameters: {
    layout: 'fullscreen',
    // An LED-matrix display drawn on a canvas: nothing for a11y checks to act on.
    a11y: { test: 'off' },
  },
  argTypes: {
    today: {
      control: 'text',
      description:
        'The day the ticker looks ahead from (YYYY-MM-DD). It lists the games releasing in the 30 days from then, from the release dates captured in tidbyt/games/games.json.',
    },
  },
  args: {
    today: snapshot.captured,
  },
  render: ({ today }) => {
    const stage = document.createElement('div');
    stage.className = 'tidbyt-stage';
    const display = createLedDisplay();
    stage.append(display);

    const valid = /^\d{4}-\d{2}-\d{2}$/.test(today) ? today : snapshot.captured;
    const ticker = createTicker(upcoming(snapshot.games, valid), valid, fonts);
    // Scrolls a LED every FRAME_MS, as the app does on the Tidbyt, until the story goes.
    let start = null;
    let shown = -1;
    let mounted = false;
    const tick = (now) => {
      start ??= now;
      mounted ||= stage.isConnected;
      const f = Math.floor((now - start) / FRAME_MS) % ticker.frames;
      if (f !== shown) {
        display.show(ticker.frame(f));
        shown = f;
      }
      if (stage.isConnected || !mounted) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return stage;
  },
};

export const NextThirtyDays = {
  name: 'Next 30 Days',
};

export const MidNovember = {
  name: 'Mid November',
  args: { today: '2026-11-12' },
};
