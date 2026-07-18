#!/usr/bin/env python3
"""Downscale @2x Subtract mask PNGs to their 1x display size (still PNG, alpha preserved)."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "scrolls-mexico-city"

total_before = 0
total_after = 0

for path in sorted(ASSET_DIR.glob("imgSubtract*.png")):
    im = Image.open(path)
    size_before = path.stat().st_size
    target = (im.width // 2, im.height // 2)
    resized = im.resize(target, Image.LANCZOS)
    resized.save(path, "PNG", optimize=True)
    size_after = path.stat().st_size
    total_before += size_before
    total_after += size_after
    print(f"{path.name}: {im.size} -> {target}, {size_before} -> {size_after} bytes")

print(f"\nTotal: {total_before} -> {total_after} bytes ({total_before - total_after} saved)")
