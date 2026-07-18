#!/usr/bin/env python3
"""Compress large photo PNGs to JPEG for Mexico City scrolls.

Keeps true-alpha decorative/mask assets (Subtract shapes, papel picado banner,
mask SVGs) as PNG/SVG since they rely on transparency. All other photo fills
sit on solid black frame backgrounds, so alpha can be safely flattened onto
black before re-encoding as JPEG for a big size win.
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "scrolls-mexico-city"

KEEP_PNG_PREFIXES = ("imgSubtract",)
KEEP_PNG_EXACT = {"imgImage73"}

manifest_path = ASSET_DIR / "local-manifest.json"
manifest = json.loads(manifest_path.read_text())

total_before = 0
total_after = 0

for name, filename in list(manifest.items()):
    path = ASSET_DIR / filename
    if not path.exists() or path.suffix.lower() != ".png":
        continue
    if name.startswith(KEEP_PNG_PREFIXES) or name in KEEP_PNG_EXACT:
        continue

    size_before = path.stat().st_size
    if size_before < 150_000:
        continue

    im = Image.open(path).convert("RGBA")
    bg = Image.new("RGB", im.size, (0, 0, 0))
    bg.paste(im, mask=im.split()[-1])

    jpg_path = path.with_suffix(".jpg")
    bg.save(jpg_path, "JPEG", quality=82, optimize=True)
    size_after = jpg_path.stat().st_size

    path.unlink()
    manifest[name] = jpg_path.name

    total_before += size_before
    total_after += size_after
    print(f"{filename} -> {jpg_path.name}: {size_before} -> {size_after} bytes")

manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
print(f"\nTotal: {total_before} -> {total_after} bytes ({total_before - total_after} saved)")
