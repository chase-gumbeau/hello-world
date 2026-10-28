"""Builds the art for the Ultrahand Sigil's Vision mode, in the seal's green: the eye from
the top of the seal's column on its own, with no circles. Its lashes, lids, iris and
pupil come as drawn; the lower lashes (dark drips cut into the column in the seal) are
turned into bright strokes. It is as large as fits the strip the board shows when
zoomed to fill its width. Its position is written to tidbyt/vision/vision.json for the
blink.

Usage: python3 scripts/build_vision_art.py .   (from the repo root)
Writes tidbyt/vision/vision-source.png and vision.json; then make the 32x32 copy with:
  sips -z 32 32 tidbyt/vision/vision-source.png --out tidbyt/vision/vision-32.png
"""
import json, os, sys
from PIL import Image, ImageChops, ImageFilter

root = sys.argv[1]
seal = Image.open(root + '/tidbyt/sigil/sigil-source.png').convert('RGBA')

W, H = seal.size
cx, cy = 228, 227.5
BAND = 106       # contents stay this far above or below center (the zoomed board's strip)...
REACH = 220      # ...and this far either side of it
GREEN = (10, 245, 170)


def largest_scale(fits, hi=3.0):
    """The largest scale (to within a hair) for which fits(scale) holds."""
    lo = 0.05
    for _ in range(30):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if fits(mid) else (lo, mid)
    return lo


def mask_fits(mask, x0, y0, scale):
    for y in range(0, mask.height, 2):
        for x in range(0, mask.width, 2):
            if mask.getpixel((x, y)) > 128:
                px, py = x0 + x * scale, y0 + y * scale
                if abs(px - cx) > REACH or abs(py - cy) > BAND:
                    return False
    return True


def paste_scaled(canvas, mask, x0, y0, scale):
    """`canvas` with `mask` scaled and placed at (x0, y0), keeping the brighter of the two."""
    small = mask.resize((max(1, round(mask.width * scale)), max(1, round(mask.height * scale))), Image.LANCZOS)
    region = Image.new('L', canvas.size, 0)
    region.paste(small, (round(x0), round(y0)))
    return ImageChops.lighter(canvas, region)


def compose(art, name):
    """`art` (an 'L' mask of the contents) in green, with a soft glow; everything else unlit."""
    glow = art.filter(ImageFilter.GaussianBlur(9))
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    px = out.load()
    for y in range(H):
        for x in range(W):
            # Brightness rides on alpha, which the display reads as how lit an LED is.
            a = max(art.getpixel((x, y)) / 255, 0.28 * glow.getpixel((x, y)) / 255)
            px[x, y] = (*GREEN, round(a * 255))
    os.makedirs(f'{root}/tidbyt/{name}', exist_ok=True)
    out.save(f'{root}/tidbyt/{name}/{name}-source.png')


def seal_mask(box, level):
    """An 'L' mask of the seal in `box` (x0, y0, x1, y1): level(x, y, green) gives each pixel 0–255."""
    x0, y0, x1, y1 = box
    mask = Image.new('L', (x1 - x0, y1 - y0), 0)
    for y in range(y0, y1):
        for x in range(x0, x1):
            mask.putpixel((x - x0, y - y0), max(0, min(255, level(x, y, seal.getpixel((x, y))[1]))))
    return mask


# ---------- Vision ----------

def build_vision():
    lid = 118  # the lower lid: above it the eye is bright strokes; below, lashes cut in dark
    upper_lid = 92  # the bottom of the upper lid (its band and thin inner line), above the iris
    box = (150, 56, 306, 152)

    # Where the column is bright, row by row, below the lid (the lashes live inside it).
    edges = {}
    for y in range(lid, box[3]):
        xs = [x for x in range(box[0], box[2]) if seal.getpixel((x, max(y, 126)))[1] > 150]
        edges[y] = (xs[0] + 4, xs[-1] - 4) if xs else (0, -1)

    def level(x, y, g):
        if y < lid:
            # The eye's own strokes, within an oval around it (clear of the rune ring above).
            in_oval = ((x - 228) / 82) ** 2 + ((y - 100) / 46) ** 2 <= 1
            # Curve the bottom up toward the corners, following the lower lid, so the
            # column's top corners beside the eye drop away.
            above_lid = y <= lid - 16 * ((x - 228) / 82) ** 2
            return g if in_oval and above_lid and g > 60 else 0
        # The lower lid and lashes, inverted, within the column and an oval under the eye.
        lo, hi = edges[y]
        under = ((x - 230) / 66) ** 2 + ((y - 118) / 34) ** 2 <= 1
        return 255 - g if under and lo <= x <= hi and g < 190 else 0

    eye = seal_mask(box, level)

    def place(s):
        return cx - eye.width * s / 2, cy - eye.height * s / 2

    scale = largest_scale(lambda s: mask_fits(eye, *place(s), s))
    art = paste_scaled(Image.new('L', (W, H), 0), eye, *place(scale), scale)
    compose(art, 'vision')

    # Where the eye sits, in the display's image units (the art is 32 units across).
    unit = 32 / W
    x0, y0 = place(scale)
    geometry = {
        'top': round(y0 * unit, 2),                                   # top of the upper lashes
        'upperLid': round((y0 + (upper_lid - box[1]) * scale) * unit, 2),  # bottom of the upper lid
        'lid': round((y0 + (lid - box[1]) * scale) * unit, 2),            # the lower lid line
        'left': round(x0 * unit, 2),
        'right': round((x0 + eye.width * scale) * unit, 2),
    }
    with open(f'{root}/tidbyt/vision/vision.json', 'w') as f:
        json.dump(geometry, f, indent=2)
        f.write('\n')
    print('vision: eye scale', round(scale, 3), geometry)


build_vision()
