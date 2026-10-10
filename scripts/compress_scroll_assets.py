#!/usr/bin/env python3
"""Re-encode scroll trip photos as right-sized WebP.

Usage: python3 scripts/compress_scroll_assets.py <display-sizes.json>

`display-sizes.json` maps each trip asset dir (e.g. "scrolls-puerto-rico") to
{filename: [width, height]}: the largest size, in design px, that the image is
drawn at on the 3842×2160 stage. Measure it from the running Storybook story
(each <img> / background box's getBoundingClientRect() divided by the root's
--stage-scale). The stage never renders above ~1 device px per design px, so
images are capped at HEADROOM × their drawn size and never upscaled.

WebP keeps the alpha channel, so cut-out and masked shapes stay transparent
(unlike the JPEG flattening in compress_mexico_city_assets.py). References in
generated-body.html, generated.css and local-manifest.json are rewritten, and
the originals are deleted. Files missing from the sizes map are left alone.
"""
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"

HEADROOM = 1.25
QUALITY = 82
RASTER_SUFFIXES = {".png", ".jpg", ".jpeg"}
REFERENCE_FILES = ("generated-body.html", "generated.css", "local-manifest.json")


def target_size(natural, drawn):
    width, height = natural
    scale = min(1.0, max(drawn[0] * HEADROOM / width, drawn[1] * HEADROOM / height))
    return max(1, round(width * scale)), max(1, round(height * scale))


def compress_dir(asset_dir, sizes):
    renames = {}
    before = after = 0
    for filename, drawn in sizes.items():
        path = asset_dir / filename
        if not path.exists() or path.suffix.lower() not in RASTER_SUFFIXES:
            continue

        im = Image.open(path)
        im.load()
        has_alpha = im.mode in ("RGBA", "LA", "PA") or "transparency" in im.info
        im = im.convert("RGBA" if has_alpha else "RGB")
        if has_alpha and im.getchannel("A").getextrema() == (255, 255):
            im = im.convert("RGB")

        size = target_size(im.size, drawn)
        if size != im.size:
            im = im.resize(size, Image.Resampling.LANCZOS)

        webp_path = path.with_suffix(".webp")
        im.save(webp_path, "WEBP", quality=QUALITY, method=6)

        before += path.stat().st_size
        after += webp_path.stat().st_size
        path.unlink()
        renames[filename] = webp_path.name

    for ref_name in REFERENCE_FILES:
        ref = asset_dir / ref_name
        if not ref.exists():
            continue
        text = ref.read_text()
        for old, new in renames.items():
            # Quote/paren/slash-delimited so imgImage7.png never hits imgImage71.png.
            for lead in ('"', "/", "("):
                text = text.replace(f"{lead}{old}", f"{lead}{new}")
        ref.write_text(text)

    return renames, before, after


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    display_sizes = json.loads(Path(sys.argv[1]).read_text())

    total_before = total_after = 0
    for dir_name, sizes in display_sizes.items():
        renames, before, after = compress_dir(ASSETS / dir_name, sizes)
        total_before += before
        total_after += after
        print(f"{dir_name}: {len(renames)} files, {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB")

    print(f"\nTotal: {total_before / 1e6:.1f} MB -> {total_after / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
