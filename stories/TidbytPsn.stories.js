import './tidbyt-display.css';
import { createLedDisplay } from './tidbyt-display.js';
import { parseBdf } from './tidbyt-games.js';
import { createPsn, FRAME_MS, GRADES } from './tidbyt-psn.js';
import sample from '../tidbyt/psn/sample.json';
import tb8 from '../tidbyt/games/fonts/tb-8.bdf?raw';
import tomThumb from '../tidbyt/games/fonts/tom-thumb.bdf?raw';

const fonts = { tb8: parseBdf(tb8), tomThumb: parseBdf(tomThumb) };

export default {
  title: 'Projects/Tidbyt/PlayStation',
  parameters: {
    layout: 'fullscreen',
    // An LED-matrix display drawn on a canvas: nothing for a11y checks to act on.
    a11y: { test: 'off' },
  },
  argTypes: {
    game: { control: 'text', description: 'The game played last.' },
    trophy: { control: 'text', description: 'The name of the trophy earned last.' },
    grade: {
      control: 'select',
      options: Object.keys(GRADES),
      description: "The trophy's grade, which colors its cup.",
    },
    trophyGame: { control: 'text', description: 'The game the trophy is from.' },
  },
  args: {
    game: sample.played.title,
    trophy: sample.trophy.name,
    grade: sample.trophy.grade,
    trophyGame: sample.trophy.game,
  },
  render: ({ game, trophy, grade, trophyGame }) => {
    const stage = document.createElement('div');
    stage.className = 'tidbyt-stage';
    const display = createLedDisplay();
    stage.append(display);

    // The sample profile in tidbyt/psn/sample.json with the story's names. Cover art
    // needs a live profile, so the played screen shows the app's gamepad instead.
    const psn = createPsn(
      {
        ...sample,
        played: { ...sample.played, title: game },
        trophy: { ...sample.trophy, name: trophy, grade, game: trophyGame },
      },
      fonts,
    );
    // Steps a frame every FRAME_MS, as the app does on the Tidbyt, until the story goes.
    let start = null;
    let shown = -1;
    let mounted = false;
    const tick = (now) => {
      start ??= now;
      mounted ||= stage.isConnected;
      const f = Math.floor((now - start) / FRAME_MS) % psn.frames;
      if (f !== shown) {
        display.show(psn.frame(f));
        shown = f;
      }
      if (stage.isConnected || !mounted) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return stage;
  },
};

export const LastPlayedAndTrophy = {
  name: 'Last Played and Trophy',
};

export const Platinum = {
  args: { trophy: 'Every Bot Rescued', grade: 'platinum' },
};
