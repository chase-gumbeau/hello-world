#!/usr/bin/env python3
"""Verify every Scrolls trip starts flush with the centered window frame.

Usage (from repo root):
  python3 scripts/check_scroll_frame_align.py
  npm run scrolls:check-align

Exit code 0 = all trips OK; 1 = at least one misaligned.
See docs/scrolls.md and scripts/scrolls_geometry.py.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from scrolls_geometry import FRAME_LEFT, FRAME_PANEL_H, FRAME_PANEL_W

ROOT = Path(__file__).resolve().parents[1]

# Trip asset dirs keyed by registry id. Summer lives in assets/scrolls/.
TRIPS = {
    "summer": ROOT / "assets" / "scrolls",
    "33": ROOT / "assets" / "scrolls-33",
    "costa-rica": ROOT / "assets" / "scrolls-costa-rica",
    "guanajuato": ROOT / "assets" / "scrolls-guanajuato",
    "mexico-city": ROOT / "assets" / "scrolls-mexico-city",
    "puerto-rico": ROOT / "assets" / "scrolls-puerto-rico",
}

PANEL_H = f"height: {int(FRAME_PANEL_H)}px"
PANEL_W = f"width: {FRAME_PANEL_W}px"
TOLERANCE = 0.5


def strip_left(css: str, strip_cls: str) -> float | None:
    """Return the strip's `left` in design px, preferring the scrolls-root override."""
    override = re.search(
        rf"\.scrolls-root\s+\.{re.escape(strip_cls)}\.scroll-strip\s*\{{([^}}]+)\}}",
        css,
        re.S,
    )
    block = override.group(1) if override else None
    if block is None:
        base = re.search(rf"\.{re.escape(strip_cls)}\s*\{{([^}}]+)\}}", css, re.S)
        block = base.group(1) if base else None
    if not block:
        return None
    m = re.search(r"left:\s*([\d.]+)(?:px)?", block)
    return float(m.group(1)) if m else None


def first_panel_left(css: str) -> float | None:
    """Leftmost absolute 1080×1350 panel (canvas-absolute layout)."""
    lefts = []
    for m in re.finditer(r"\.([a-zA-Z_][\w-]*)\s*\{([^}]+)\}", css, re.S):
        body = m.group(2)
        if PANEL_H not in body or PANEL_W not in body:
            continue
        lm = re.search(r"left:\s*([\d.]+)px", body)
        if lm:
            lefts.append(float(lm.group(1)))
    return min(lefts) if lefts else None


def effective_start(asset_dir: Path) -> tuple[float | None, str]:
    css_path = asset_dir / "generated.css"
    body_path = asset_dir / "generated-body.html"
    if not css_path.exists() or not body_path.exists():
        return None, "missing generated.css or generated-body.html"

    css = css_path.read_text()
    body = body_path.read_text()
    m = re.search(r'class="([^"]*\bscroll-strip\b[^"]*)"', body)
    if not m:
        return None, "no .scroll-strip in body"

    strip_cls = next(c for c in m.group(1).split() if c != "scroll-strip")
    s_left = strip_left(css, strip_cls)
    panel = first_panel_left(css)

    # Canvas-absolute trips: strip at 0, panels carry the frame offset.
    if s_left is not None and abs(s_left) < TOLERANCE and panel is not None:
        return panel, f"canvas-absolute (strip={s_left:g}, first panel={panel:g})"

    # Flex-strip trips: strip at FRAME_LEFT, children start at strip origin.
    if s_left is not None:
        return s_left, f"flex-strip (strip={s_left:g})"

    if panel is not None:
        return panel, f"panels only (first={panel:g})"

    return None, "could not resolve strip or panel left"


def main() -> int:
    print(f"Expected FRAME_LEFT = {FRAME_LEFT}\n")
    failed = 0
    for trip_id, asset_dir in TRIPS.items():
        value, detail = effective_start(asset_dir)
        if value is None:
            print(f"FAIL  {trip_id}: {detail}")
            failed += 1
            continue
        ok = abs(value - FRAME_LEFT) <= TOLERANCE
        status = "OK  " if ok else "FAIL"
        print(f"{status}  {trip_id}: {value:g} — {detail}")
        if not ok:
            failed += 1

    print()
    if failed:
        print(f"{failed} trip(s) misaligned. First content must start at {FRAME_LEFT}px.")
        return 1
    print("All trips aligned.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
