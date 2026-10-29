# Tidbyt

Art for a [Tidbyt](https://tidbyt.com) (64x32 LED display), previewed in Storybook under
**Projects → Tidbyt**.

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
