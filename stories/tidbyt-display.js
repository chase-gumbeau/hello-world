// Renders an image onto a 64x32 LED matrix, centered, like the Tidbyt / Pixlet preview.
const COLS = 64;
const ROWS = 32;
const PITCH = 10;

export function createTidbytDisplay(src, { size = 32 } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'tidbyt-display';

  const canvas = document.createElement('canvas');
  canvas.width = COLS * PITCH;
  canvas.height = ROWS * PITCH;
  wrap.append(canvas);

  const img = new Image();
  img.onload = () => {
    // Draw the source at native LED resolution, centered in the 64x32 frame.
    const frame = document.createElement('canvas');
    frame.width = COLS;
    frame.height = ROWS;
    const fctx = frame.getContext('2d');
    fctx.imageSmoothingEnabled = false;
    fctx.drawImage(img, (COLS - size) / 2, (ROWS - size) / 2, size, size);
    const pixels = fctx.getImageData(0, 0, COLS, ROWS).data;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = (y * COLS + x) * 4;
        const a = pixels[i + 3] / 255;
        ctx.fillStyle = a
          ? `rgb(${pixels[i] * a} ${pixels[i + 1] * a} ${pixels[i + 2] * a})`
          : '#0c0c0c';
        ctx.beginPath();
        ctx.arc(x * PITCH + PITCH / 2, y * PITCH + PITCH / 2, PITCH * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  img.src = src;

  return wrap;
}
