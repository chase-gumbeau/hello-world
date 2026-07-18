import './scrolls.css';

// Design stage / frame numbers — keep in sync with scripts/scrolls_geometry.py
// and docs/scrolls.md (FRAME_LEFT = (3842 - 1078) / 2 = 1382).
const DESIGN_W = 3842;
const DESIGN_H = 2160;
const FRAME_W = 1080;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Wire drag / wheel / keyboard controls on a scrolls root.
 * @param {HTMLElement} root
 * @param {{ frameCount?: number }} [options]
 */
export function mountScrolls(root, { frameCount = 20 } = {}) {
  const MAX_SCROLL = -(frameCount - 1) * FRAME_W;
  const stage = root.querySelector('[data-scrolls-stage]') || root.querySelector('.stage');
  const strip = root.querySelector('#scroll-strip') || root.querySelector('.scroll-strip');
  if (!stage || !strip) {
    console.warn('Scrolls: missing stage or strip');
    return () => {};
  }

  let scrollX = 0;
  let targetX = 0;
  let dragging = false;
  let lastPointerX = 0;
  let velocity = 0;
  let rafId = 0;
  let disposed = false;

  function fitStage() {
    const width = root.clientWidth || window.innerWidth;
    const height = root.clientHeight || window.innerHeight;
    const scale = Math.min(width / DESIGN_W, height / DESIGN_H);
    root.style.setProperty('--stage-scale', String(scale));
  }

  function setScroll(value, { immediate = false } = {}) {
    targetX = clamp(value, MAX_SCROLL, 0);
    if (immediate) {
      scrollX = targetX;
      strip.style.setProperty('--scroll-x', `${scrollX}px`);
    }
  }

  function tick() {
    if (disposed) return;
    scrollX += (targetX - scrollX) * 0.18;
    if (Math.abs(targetX - scrollX) < 0.1) {
      scrollX = targetX;
    }
    strip.style.setProperty('--scroll-x', `${scrollX}px`);
    rafId = requestAnimationFrame(tick);
  }

  function onWheel(event) {
    event.preventDefault();
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    setScroll(targetX - delta * 1.25);
  }

  function onPointerDown(event) {
    dragging = true;
    lastPointerX = event.clientX;
    velocity = 0;
    root.classList.add('is-dragging');
    stage.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragging) return;
    const scale = Number.parseFloat(root.style.getPropertyValue('--stage-scale')) || 1;
    const dx = event.clientX - lastPointerX;
    lastPointerX = event.clientX;
    velocity = dx / scale;
    setScroll(targetX + velocity);
  }

  function onPointerUp(event) {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    setScroll(targetX + velocity * 8);
    velocity = 0;
    try {
      stage.releasePointerCapture?.(event.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onKeyDown(event) {
    if (!root.isConnected) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      setScroll(targetX - FRAME_W * 0.85);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      setScroll(targetX + FRAME_W * 0.85);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setScroll(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setScroll(MAX_SCROLL);
    }
  }

  const resizeObserver = new ResizeObserver(fitStage);
  resizeObserver.observe(root);
  fitStage();

  stage.addEventListener('wheel', onWheel, { passive: false });
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);
  stage.addEventListener('pointerleave', onPointerUp);
  window.addEventListener('keydown', onKeyDown);

  rafId = requestAnimationFrame(tick);

  root.scrolls = {
    set(x, immediate = false) {
      setScroll(x, { immediate });
    },
    get() {
      return { scrollX, targetX, max: MAX_SCROLL };
    },
  };

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    stage.removeEventListener('wheel', onWheel);
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerup', onPointerUp);
    stage.removeEventListener('pointercancel', onPointerUp);
    stage.removeEventListener('pointerleave', onPointerUp);
    window.removeEventListener('keydown', onKeyDown);
  };
}
