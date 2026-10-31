# Tidbyt

Art and apps for a [Tidbyt](https://tidbyt.com) (64x32 LED display), previewed in
Storybook under **Projects → Tidbyt**.

- `games/upcoming_games.star` is the **Upcoming Games** ticker, a live Pixlet app
  (below).

- `sigil/sigil.star` is a still Pixlet app: the 32x32 sigil centered on the board.
- `sigil/sigil.webp` is the animated **Ultrahand Sigil** story (Seal, with twinkle,
  hand and energy on, cycling green → red → purple), recorded LED by LED from
  Storybook. It loops one whole color cycle, 39 seconds at 20 fps, encoded lossless
  (about 1.8 MB) because lossy WebP smears single-LED color at this size.
- `sigil/sigil-tidbyt.webp` is the version that fits a Tidbyt Gen 1 (349 KB): every
  other frame, played at 20 fps, so the same full color cycle loops in 19.5 seconds,
  encoded lossy at quality 80.

## Push the animation

The Tidbyt runs [Tronbyt](https://github.com/tronbyt/server) firmware and talks to a
self-hosted Tronbyt server instead of Tidbyt's cloud. With the server running
(`brew install tronbyt-server && brew services start tronbyt-server`), push the WebP
with the device's API key from its Edit Device page.

Tidbyt Gen 1 firmware rejects any image over 460,000 bytes and shows a "mind explode"
graphic instead, so push `sigil-tidbyt.webp`, not the 1.8 MB `sigil.webp`. Tronbyt
server releases after 2.5.2 split oversized animations into chunks, which should let
the full-size file play.

```bash
curl -X POST "http://<server>:8000/v0/devices/<device id>/push" \
  -H "Authorization: Bearer <api key>" -H "Content-Type: application/json" \
  -d "{\"installationID\": \"sigil\", \"image\": \"$(base64 -i tidbyt/sigil/sigil-tidbyt.webp)\", \"background\": false}"
```

`installationID` keeps the sigil in the app rotation; the server answers
`WebP received.` The device gives each app its cycle time (15 seconds by default)
before moving on, so pin it or raise the cycle time in Tronbyt to watch the whole loop.

## Re-record after changing the story

```bash
npm run storybook                       # in one terminal
npm run tidbyt:sigil                    # in another: capture, then encode
```

`scripts/capture-tidbyt-sigil.mjs` steps the story on a fake clock and reads each
LED off its canvas into raw frames; `scripts/encode_tidbyt_webp.py` turns those into
the looping WebP. Set `CHROMIUM` to a browser path if Playwright's own isn't
installed.

## Upcoming Games

`games/upcoming_games.star` scrolls the PS5 and Switch 2 games coming out in the next
30 days, grouped by release date: the date and how many days off it is, then each
game's title over which of the two it's on (PS5, SW2). Games only on other platforms
are left out; `WANTED` in the app (and in `stories/tidbyt-games.js`) picks the
platforms. The count in the corner is how many games are coming.

- **Live dates** come from [RAWG](https://rawg.io/apidocs): get a free API key there
  and set it as the app's *RAWG API key* in Tronbyt. The app takes RAWG's most
  followed games releasing in the window on those platforms (up to 12, set by *Games
  to show*)
  and caches the answer for 6 hours.
- **Without a key** (or when RAWG can't be reached) it shows the snapshot bundled in
  the app, copied from `games/games.json`: release dates captured from
  [VGC's release schedule](https://www.videogameschronicle.com/guide/upcoming-game-release-dates-schedule/)
  on the date in that file. The snapshot only covers so far ahead, so past its last
  date the ticker reads "NOTHING DATED".

The scroll moves a LED every 40 ms and plays once through each time the app comes up
(`show_full_animation`), so a full list takes about 25–30 seconds. Raise the app's
display time in Tronbyt to match. Renders stay small (about 130 KB for eight games),
well under the Gen 1's 460,000-byte limit.

Add the app in Tronbyt from the `.star` file (Add App → upload), or render once and
push it like the sigil:

```bash
pixlet render tidbyt/games/upcoming_games.star rawg_key=<key> --max_duration 60000 \
  -o /tmp/games.webp
curl -X POST "http://<server>:8000/v0/devices/<device id>/push" \
  -H "Authorization: Bearer <api key>" -H "Content-Type: application/json" \
  -d "{\"installationID\": \"games\", \"image\": \"$(base64 -i /tmp/games.webp)\", \"background\": false}"
```

The Storybook story (`stories/TidbytGames.stories.js`) draws the same ticker LED for
LED from `games/games.json`, with Pixlet's own fonts (`games/fonts/`). After changing
the app, the story or the snapshot, check they still agree:

```bash
npm run tidbyt:games:check   # syncs the snapshot into the app, renders it, compares every frame
```
