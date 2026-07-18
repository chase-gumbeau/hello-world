# Scrolls

Horizontal photo-scroll trips shown in Storybook under **Projects / Scrolls**. The home screen lists destinations by year; clicking one animates into the trip under a stable centered white frame.

## Geometry (do not drift)

All trips share one design stage and one window frame. Numbers live in [`scripts/scrolls_geometry.py`](../scripts/scrolls_geometry.py) — convert scripts and the alignment checker import from there.

| Constant | Value | Meaning |
| --- | --- | --- |
| `DESIGN_W` × `DESIGN_H` | 3842 × 2160 | Figma artboard / scaled stage |
| `FRAME_OUTER_W` | 1078 | White window + scrim hole width |
| `FRAME_PANEL_W` × `FRAME_PANEL_H` | 1080 × 1350 | Content panel size / scroll pitch |
| `FRAME_LEFT` | **1382** | `(DESIGN_W - FRAME_OUTER_W) / 2` — left edge of the centered frame |

**Rule:** at scroll position `0`, the first content panel’s left edge must sit at `FRAME_LEFT` (flush with the inside of the window). Figma often exports the strip/panels at `1478` (historically offset +99px); convert scripts remap to `1382`.

Two layout models are OK:

1. **Flex strip** (Summer, Costa Rica, Guanajuato, Puerto Rico, 33) — `.scroll-strip` has `left: 1382px`; children flow from the strip origin.
2. **Canvas-absolute** (Mexico City) — strip sits at `left: 0`; each panel has an absolute `left`, with the first panel at `1382px`.

## Check alignment

```bash
npm run scrolls:check-align
# or
python3 scripts/check_scroll_frame_align.py
```

Expect `All trips aligned.` Exit code `1` if any trip’s effective start ≠ `1382`.

Run this after regenerating a trip’s CSS, or when adding a new destination.

## Add a new trip

1. **Assets** — create `assets/scrolls-<id>/` with Figma export (`source.jsx`), images, and (if using a convert script) `local-manifest.json`.
2. **Convert** — either extend an existing convert script or copy the closest one (`scripts/convert_*.py`). Always remap strip/first panel to `FRAME_LEFT` from `scrolls_geometry.py`.
3. **Mount module** — add `scrolls-<id>.js` that calls `createScrollExperience({ id, bodyHtml, frameCount, embedded })`.
4. **Registry** — add an entry to `SCROLL_TRIPS` in [`scrolls-registry.js`](../scrolls-registry.js) (`id`, `year`, `title`, `frames`, `storyExport`, `heroImage`, `mount`).
5. **Storybook** — export the trip from `stories/Scrolls{year}.stories.js` (or create that year file). Title pattern: `Projects/Scrolls/{year}`.
6. **Verify** — `npm run scrolls:check-align`, then open **Projects → Scrolls → Home** and the year story; confirm the first frame kisses the white window’s left edge.

### Re-run an existing convert

```bash
npm run scrolls:convert:mexico-city
npm run scrolls:convert:costa-rica
npm run scrolls:convert:puerto-rico
```

Mexico City’s convert also shifts every 1080×1350 panel so the first lands at `FRAME_LEFT`, and rebuilds the scroll-strip override (strip at origin, panels canvas-absolute).

## Key files

| File | Role |
| --- | --- |
| `scrolls-app.js` / `scrolls-app.css` | App shell: stable frame, home ↔ trip transitions, glow peek |
| `scrolls-shell.js` / `scrolls.css` | Shared stage chrome for standalone trip stories |
| `scrolls-mount.js` | Drag / wheel / keyboard → `--scroll-x` |
| `scrolls-registry.js` | Single source of trip metadata |
| `scrolls-home.js` | Destination list on Home |
| `scripts/scrolls_geometry.py` | Shared frame numbers |
| `scripts/check_scroll_frame_align.py` | Alignment guard |
| `scripts/convert_*.py` | Figma JSX → `generated.css` + `generated-body.html` |

## Chrome notes

- Year/title meta beside the frame was removed — destinations show only frame, scrim, and content.
- Embedded mode (`embedded: true`) hides each trip’s own scrim/frame so the app shell owns the single window.
