# Tidbyt

Art for a [Tidbyt](https://tidbyt.com) (64x32 LED display), previewed in Storybook under
**Projects → Tidbyt**.

- `sigil/sigil.star` is a still Pixlet app: the 32x32 sigil centered on the board.
- `sigil/sigil.webp` is the animated **Ultrahand Sigil** story (Seal, with twinkle,
  hand and energy on, cycling green → red → purple), recorded LED by LED from
  Storybook. It loops one whole color cycle, 39 seconds at 20 fps, encoded lossless
  (about 1.8 MB) because lossy WebP smears single-LED color at this size.

## Push the animation

Pushing goes through Tidbyt's cloud, so it works from any computer with
[Pixlet](https://github.com/tidbyt/pixlet) installed (`brew install tidbyt/tidbyt/pixlet`):

```bash
pixlet login                # once; or pass --api-token from the Tidbyt app
pixlet devices              # find your device ID
pixlet push --installation-id sigil <device id> tidbyt/sigil/sigil.webp
```

With `--installation-id` the sigil joins the app rotation and stays until you remove
it; without it, it shows once. The device gives each app about 15 seconds before
moving on, so pin it in the Tidbyt app (long-press) to watch the whole cycle.

## Re-record after changing the story

```bash
npm run storybook                       # in one terminal
npm run tidbyt:sigil                    # in another: capture, then encode
```

`scripts/capture-tidbyt-sigil.mjs` steps the story on a fake clock and reads each
LED off its canvas into raw frames; `scripts/encode_tidbyt_webp.py` turns those into
the looping WebP. Set `CHROMIUM` to a browser path if Playwright's own isn't
installed.
