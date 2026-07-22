/**
 * Animated shader text / glyph study.
 * WebGL fragment shaders on rasterized type + CSS/SVG glyph treatments.
 */

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG_WAVE = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_ink;
uniform vec3 u_glow;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = v_uv;
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float wave = sin(uv.x * 18.0 + u_time * 2.2) * 0.012
             + sin(uv.y * 14.0 - u_time * 1.6) * 0.008;
  float n = noise(uv * 6.0 + u_time * 0.35) - 0.5;
  vec2 distort = vec2(wave + n * 0.018, wave * 0.7 - n * 0.012);

  float r = texture(u_tex, uv + distort * 1.15 + vec2(0.003, 0.0)).a;
  float g = texture(u_tex, uv + distort).a;
  float b = texture(u_tex, uv + distort * 0.85 - vec2(0.003, 0.0)).a;
  float a = max(r, max(g, b));

  float rim = smoothstep(0.15, 0.85, a) - smoothstep(0.55, 1.0, a);
  vec3 col = mix(u_ink, u_glow, rim * 0.65 + g * 0.35);
  col += u_glow * pow(a, 2.2) * 0.35;
  // Keep letterforms bright against dark stage
  col = max(col, u_ink * a);

  float vig = 1.0 - length(p) * 0.22;
  outColor = vec4(col * a * vig, a);
}`;

const FRAG_CAUSTIC = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_ink;
uniform vec3 u_glow;

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.7;
  float c1 = sin((uv.x * 9.0 + uv.y * 3.0) + t * 1.4);
  float c2 = sin((uv.x * 4.0 - uv.y * 7.0) - t * 1.1);
  float c3 = sin((uv.x + uv.y) * 11.0 + t * 0.9);
  float caustic = (c1 + c2 + c3) * 0.166 + 0.5;

  vec2 warp = vec2(c1, c2) * 0.008;
  float mask = texture(u_tex, uv + warp).a;
  float edge = smoothstep(0.05, 0.55, mask);

  vec3 fill = mix(u_ink, u_glow, caustic);
  fill = mix(fill, vec3(1.0, 0.96, 0.88), pow(caustic, 3.0) * 0.45);
  float spark = pow(max(0.0, caustic - 0.72), 2.0) * edge;

  outColor = vec4(fill * edge + u_glow * spark * 1.4, edge);
}`;

const FRAG_GLITCH = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_ink;
uniform vec3 u_glow;

float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

void main() {
  vec2 uv = v_uv;
  float band = floor(uv.y * 28.0);
  float tear = (hash(band + floor(u_time * 7.0)) - 0.5) * 0.04
             * step(0.82, hash(band * 3.1 + floor(u_time * 3.0)));
  float slice = step(0.92, hash(floor(u_time * 5.0) + 2.7));
  uv.x += tear + slice * (hash(floor(uv.y * 40.0)) - 0.5) * 0.08;

  float r = texture(u_tex, uv + vec2(0.006 + tear, 0.0)).a;
  float g = texture(u_tex, uv).a;
  float b = texture(u_tex, uv - vec2(0.006 + tear * 0.5, 0.0)).a;
  float a = max(r, max(g, b));

  vec3 col = vec3(r, g, b);
  col = mix(u_ink * a, col, 0.85);
  col = mix(col, u_glow, (r - b) * 0.5 + 0.15);
  float scan = 0.92 + 0.08 * sin(uv.y * u_res.y * 1.5 + u_time * 12.0);
  outColor = vec4(col * scan, a);
}`;

const SHADERS = {
  wave: FRAG_WAVE,
  caustic: FRAG_CAUSTIC,
  glitch: FRAG_GLITCH,
};

/**
 * @param {WebGL2RenderingContext} gl
 * @param {number} type
 * @param {string} source
 */
function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || 'Shader compile failed');
  }
  return shader;
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {string} fragSource
 */
function createProgram(gl, fragSource) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || 'Program link failed');
  }
  return program;
}

/**
 * Draw display text onto a canvas texture (white on transparent).
 * @param {string} text
 * @param {number} width
 * @param {number} height
 * @param {string} font
 */
function rasterizeText(text, width, height, font) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = font;

  // Fit long strings
  let sizeMatch = font.match(/(\d+)px/);
  let size = sizeMatch ? Number(sizeMatch[1]) : 96;
  const family = font.replace(/^\d+px\s+/, '');
  while (size > 24) {
    ctx.font = `${size}px ${family}`;
    if (ctx.measureText(text).width < width * 0.88) break;
    size -= 4;
  }
  ctx.fillText(text, width / 2, height / 2);
  return canvas;
}

/**
 * @param {object} opts
 * @param {string} [opts.text]
 * @param {'wave'|'caustic'|'glitch'} [opts.shader]
 * @param {number} [opts.width]
 * @param {number} [opts.height]
 */
export function createShaderCanvas({
  text = 'GLYPH',
  shader = 'wave',
  width = 960,
  height = 320,
} = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'stx-gl';
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', `Shader text: ${text}`);

  const canvas = document.createElement('canvas');
  canvas.className = 'stx-gl__canvas';
  // Device-pixel buffer; CSS sizes the element
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  wrap.appendChild(canvas);

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
  });

  if (!gl) {
    wrap.classList.add('stx-gl--fallback');
    wrap.textContent = text;
    return wrap;
  }

  const frag = SHADERS[shader] || SHADERS.wave;
  let program;
  try {
    program = createProgram(gl, frag);
  } catch {
    wrap.classList.add('stx-gl--fallback');
    wrap.textContent = text;
    return wrap;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const tex = gl.createTexture();
  const textCanvas = rasterizeText(
    text,
    canvas.width,
    canvas.height,
    `${Math.round(height * dpr * 0.42)}px "Italiana", "EB Garamond", Georgia, serif`,
  );
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);

  gl.useProgram(program);
  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_res');
  const uTex = gl.getUniformLocation(program, 'u_tex');
  const uInk = gl.getUniformLocation(program, 'u_ink');
  const uGlow = gl.getUniformLocation(program, 'u_glow');

  gl.uniform1i(uTex, 0);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  // Warm copper ink + cool sea-glass glow (no purple)
  gl.uniform3f(uInk, 0.98, 0.88, 0.68);
  gl.uniform3f(uGlow, 0.55, 0.92, 0.86);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let raf = 0;
  let start = performance.now();
  let running = true;

  const draw = (now) => {
    if (!running) return;
    const t = (now - start) / 1000;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (visible && !running) {
        running = true;
        start = performance.now() - ((performance.now() - start) % 100000);
        raf = requestAnimationFrame(draw);
      } else if (!visible && running) {
        stop();
      }
    },
    { threshold: 0.05 },
  );
  io.observe(wrap);

  const detachWatch = new MutationObserver(() => {
    if (!document.body.contains(canvas)) {
      stop();
      io.disconnect();
      detachWatch.disconnect();
    }
  });
  detachWatch.observe(document.body, { childList: true, subtree: true });

  return wrap;
}

const WARP_FILTER = `
  <svg class="stx-filters" aria-hidden="true" focusable="false">
    <filter id="stx-warp" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.06" numOctaves="2" seed="3" result="n">
        <animate attributeName="baseFrequency" dur="4s"
          values="0.02 0.06;0.04 0.09;0.015 0.04;0.02 0.06" repeatCount="indefinite" />
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G">
        <animate attributeName="scale" dur="4s" values="4;12;6;4" repeatCount="indefinite" />
      </feDisplacementMap>
    </filter>
    <filter id="stx-melt" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="turbulence" baseFrequency="0.015 0.04" numOctaves="3" seed="11" result="n">
        <animate attributeName="baseFrequency" dur="6s"
          values="0.015 0.04;0.03 0.07;0.012 0.03;0.015 0.04" repeatCount="indefinite" />
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="G" yChannelSelector="R">
        <animate attributeName="scale" dur="6s" values="8;18;10;8" repeatCount="indefinite" />
      </feDisplacementMap>
    </filter>
  </svg>
`;

/**
 * @param {object} opts
 * @param {string} opts.text
 * @param {'flow'|'warp'|'melt'|'chroma'|'grain'|'stagger'} opts.variant
 */
export function createCssGlyph({ text, variant }) {
  const el = document.createElement('div');
  el.className = `stx-glyph stx-glyph--${variant}`;
  el.setAttribute('aria-label', text);

  if (variant === 'stagger') {
    const chars = [...text].map((ch, i) => {
      const span = document.createElement('span');
      span.className = 'stx-glyph__char';
      span.style.setProperty('--i', String(i));
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      return span.outerHTML;
    });
    el.innerHTML = `<p class="stx-glyph__word">${chars.join('')}</p>`;
  } else if (variant === 'chroma') {
    el.innerHTML = `
      <span class="stx-glyph__layer stx-glyph__layer--r" aria-hidden="true">${text}</span>
      <span class="stx-glyph__layer stx-glyph__layer--g" aria-hidden="true">${text}</span>
      <span class="stx-glyph__layer stx-glyph__layer--b" aria-hidden="true">${text}</span>
      <span class="stx-glyph__face">${text}</span>
    `;
  } else {
    el.innerHTML = `<p class="stx-glyph__word">${text}</p>`;
  }

  return el;
}

/**
 * @param {object} [opts]
 * @param {string} [opts.text]
 * @param {'wave'|'caustic'|'glitch'} [opts.shader]
 */
export function createShowcase({ text = 'SHADERS', shader = 'wave' } = {}) {
  const root = document.createElement('main');
  root.className = 'stx-study';
  root.setAttribute('aria-label', 'Animated shaders on text and glyphs');

  root.innerHTML = `
    ${WARP_FILTER}
    <div class="stx-study__atmosphere" aria-hidden="true"></div>
    <div class="stx-study__stage">
      <header class="stx-study__intro">
        <p class="stx-study__eyebrow">Study</p>
        <h1 class="stx-study__brand">Shader Type</h1>
        <p class="stx-study__lede">
          Fragment shaders and living filters on letterforms — wave, caustic, warp, and chromatic glyphs.
        </p>
      </header>

      <section class="stx-study__hero" aria-label="WebGL shader">
        <div data-slot="gl"></div>
        <p class="stx-study__caption">WebGL · ${shader}</p>
      </section>

      <hr class="stx-study__rule" />

      <section class="stx-study__grid" aria-label="CSS and SVG glyph treatments">
        <div class="stx-study__cell" data-slot="flow">
          <p class="stx-study__caption">Flow fill</p>
        </div>
        <div class="stx-study__cell" data-slot="warp">
          <p class="stx-study__caption">SVG warp</p>
        </div>
        <div class="stx-study__cell" data-slot="melt">
          <p class="stx-study__caption">Melt</p>
        </div>
        <div class="stx-study__cell" data-slot="chroma">
          <p class="stx-study__caption">Chromatic</p>
        </div>
        <div class="stx-study__cell" data-slot="grain">
          <p class="stx-study__caption">Grain mask</p>
        </div>
        <div class="stx-study__cell" data-slot="stagger">
          <p class="stx-study__caption">Staggered glyphs</p>
        </div>
      </section>
    </div>
  `;

  const gl = createShaderCanvas({ text, shader, width: 900, height: 280 });
  root.querySelector('[data-slot="gl"]').replaceWith(gl);

  const samples = {
    flow: createCssGlyph({ text: 'FLOW', variant: 'flow' }),
    warp: createCssGlyph({ text: 'WARP', variant: 'warp' }),
    melt: createCssGlyph({ text: 'MELT', variant: 'melt' }),
    chroma: createCssGlyph({ text: 'RGB', variant: 'chroma' }),
    grain: createCssGlyph({ text: 'NOISE', variant: 'grain' }),
    stagger: createCssGlyph({ text: 'TYPE', variant: 'stagger' }),
  };

  Object.entries(samples).forEach(([key, node]) => {
    const cell = root.querySelector(`[data-slot="${key}"]`);
    cell.insertBefore(node, cell.firstChild);
  });

  return root;
}

/**
 * @param {object} opts
 * @param {string} [opts.text]
 * @param {'wave'|'caustic'|'glitch'} opts.shader
 */
export function createGlSolo({ text = 'GLYPH', shader = 'wave' } = {}) {
  const root = document.createElement('main');
  root.className = 'stx-study';
  root.setAttribute('aria-label', `WebGL ${shader} shader text`);
  root.innerHTML = `
    <div class="stx-study__atmosphere" aria-hidden="true"></div>
    <div class="stx-study__solo">
      <div data-slot="gl"></div>
      <p class="stx-study__caption stx-study__caption--hero">WebGL · ${shader}</p>
    </div>
  `;
  root.querySelector('[data-slot="gl"]').replaceWith(
    createShaderCanvas({ text, shader, width: 960, height: 360 }),
  );
  return root;
}

/**
 * @param {object} opts
 * @param {string} [opts.text]
 * @param {'flow'|'warp'|'melt'|'chroma'|'grain'|'stagger'} opts.variant
 */
export function createCssSolo({ text, variant }) {
  const labels = {
    flow: 'Flow fill',
    warp: 'SVG warp',
    melt: 'Melt',
    chroma: 'Chromatic',
    grain: 'Grain mask',
    stagger: 'Staggered glyphs',
  };
  const sampleText =
    text ||
    ({
      flow: 'FLOW',
      warp: 'WARP',
      melt: 'MELT',
      chroma: 'RGB',
      grain: 'NOISE',
      stagger: 'TYPE',
    }[variant] || 'TEXT');

  const root = document.createElement('main');
  root.className = 'stx-study';
  root.setAttribute('aria-label', labels[variant] || variant);
  root.innerHTML = `
    ${WARP_FILTER}
    <div class="stx-study__atmosphere" aria-hidden="true"></div>
    <div class="stx-study__solo stx-study__solo--glyph">
      <div data-slot="glyph"></div>
      <p class="stx-study__caption stx-study__caption--hero">${labels[variant]}</p>
    </div>
  `;
  root.querySelector('[data-slot="glyph"]').replaceWith(
    createCssGlyph({ text: sampleText, variant }),
  );
  return root;
}
