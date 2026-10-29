"""Encodes raw 64x32 frames from capture-tidbyt-sigil.mjs as a looping animated WebP
the Tidbyt can show (pixlet push <device> <file>.webp).

Usage: python3 scripts/encode_tidbyt_webp.py <frames.rgb> <out.webp> [frame ms] [quality]
Encodes lossless unless given a quality (1-100) to encode lossy.
"""

import sys

from PIL import Image

COLS, ROWS = 64, 32
FRAME = COLS * ROWS * 3


def main():
    src, out = sys.argv[1], sys.argv[2]
    frame_ms = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    quality = int(sys.argv[4]) if len(sys.argv) > 4 else 0
    data = open(src, "rb").read()
    frames = [
        Image.frombytes("RGB", (COLS, ROWS), data[i : i + FRAME])
        for i in range(0, len(data) - FRAME + 1, FRAME)
    ]
    # Lossless by default: lossy WebP halves the color resolution, which smears the
    # single-LED reds and purples into their neighbors at 64x32.
    frames[0].save(
        out,
        save_all=True,
        append_images=frames[1:],
        duration=frame_ms,
        loop=0,
        lossless=quality == 0,
        quality=quality or 100,
        method=6,
        minimize_size=True,
    )
    print(f"{len(frames)} frames written to {out}")


if __name__ == "__main__":
    main()
