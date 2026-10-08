// Piksel çizim yardımcıları: tüm sprite'lar bu fonksiyonlarla kodla üretilir.
(function () {
  const U = AK.U;
  const G = {};
  G.OUT = '#2a1a24'; // ortak kontur rengi

  G.canvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.g = c.getContext('2d');
    c.g.imageSmoothingEnabled = false;
    return c;
  };
  const hexCache = {};
  G.rgb = function (h) {
    let v = hexCache[h];
    if (v) return v;
    let s = h.replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    const n = parseInt(s, 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    hexCache[h] = v;
    return v;
  };
  G.hex = (r, g, b) => '#' + ((1 << 24) | (U.clamp(Math.round(r), 0, 255) << 16) | (U.clamp(Math.round(g), 0, 255) << 8) | U.clamp(Math.round(b), 0, 255)).toString(16).slice(1);
  G.mix = function (a, b, t) {
    const A = G.rgb(a), B = G.rgb(b);
    return G.hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  };
  G.dk = (c, t) => G.mix(c, '#24142a', t);   // sıcak koyulaştırma
  G.lt = (c, t) => G.mix(c, '#fff8e0', t);   // sıcak açma
  G.rgba = (h, a) => { const v = G.rgb(h); return `rgba(${v[0]},${v[1]},${v[2]},${a})`; };
  G.rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  G.px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
  // kutu içine dolu elips
  G.oval = function (g, x, y, w, h, c) {
    g.fillStyle = c;
    for (let j = 0; j < h; j++) {
      const yy = (j + 0.5 - h / 2) / (h / 2);
      const half = (w / 2) * Math.sqrt(Math.max(0, 1 - yy * yy));
      const x0 = Math.round(x + w / 2 - half), x1 = Math.round(x + w / 2 + half);
      if (x1 > x0) g.fillRect(x0, y + j, x1 - x0, 1);
    }
  };
  G.line = function (g, x0, y0, x1, y1, c) {
    g.fillStyle = c;
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let i = 0; i < 400; i++) {
      g.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  G.speckle = function (g, x, y, w, h, cols, dens, r) {
    const n = Math.round(w * h * dens);
    for (let i = 0; i < n; i++) {
      g.fillStyle = cols[(r() * cols.length) | 0];
      g.fillRect(x + ((r() * w) | 0), y + ((r() * h) | 0), 1, 1);
    }
  };
  // 1px kontur ekler (şeffaf komşu piksellere)
  G.outline = function (src, col) {
    col = col || G.OUT;
    const w = src.width, h = src.height;
    const sd = (src.g || src.getContext('2d')).getImageData(0, 0, w, h);
    const d = sd.data;
    const o = new Uint8ClampedArray(d);
    const [r, g, b] = G.rgb(col);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (d[i + 3] > 40) continue;
        if ((x > 0 && d[i - 4 + 3] > 40) || (x < w - 1 && d[i + 4 + 3] > 40) ||
            (y > 0 && d[i - w * 4 + 3] > 40) || (y < h - 1 && d[i + w * 4 + 3] > 40)) {
          o[i] = r; o[i + 1] = g; o[i + 2] = b; o[i + 3] = 255;
        }
      }
    }
    const c = G.canvas(w, h);
    c.g.putImageData(new ImageData(o, w, h), 0, 0);
    return c;
  };
  G.flip = function (src) {
    const c = G.canvas(src.width, src.height);
    c.g.translate(src.width, 0); c.g.scale(-1, 1); c.g.drawImage(src, 0, 0);
    return c;
  };
  G.rot = function (src, q) {
    const w = src.width, h = src.height;
    const c = (q % 2) ? G.canvas(h, w) : G.canvas(w, h);
    c.g.translate(c.width / 2, c.height / 2);
    c.g.rotate(q * Math.PI / 2);
    c.g.drawImage(src, -w / 2, -h / 2);
    return c;
  };
  G.scale = function (src, s) {
    const c = G.canvas(src.width * s, src.height * s);
    c.g.drawImage(src, 0, 0, c.width, c.height);
    return c;
  };
  // satır dizisinden sprite: '.' şeffaf, diğer karakterler paletten
  G.rows = function (rows, pal) {
    const h = rows.length, w = rows[0].length;
    const c = G.canvas(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch !== '.' && ch !== ' ' && pal[ch]) G.px(c.g, x, y, pal[ch]);
    }
    return c;
  };
  // tek renk siluet
  G.silhouette = function (src, col) {
    const c = G.canvas(src.width, src.height);
    c.g.drawImage(src, 0, 0);
    c.g.globalCompositeOperation = 'source-in';
    G.rect(c.g, 0, 0, c.width, c.height, col);
    return c;
  };
  const urlCache = new WeakMap();
  G.url = function (c) {
    let u = urlCache.get(c);
    if (!u) { u = c.toDataURL(); urlCache.set(c, u); }
    return u;
  };
  // argümanlara göre önbellekleyen sarmalayıcı
  G.memo = function (fn) {
    const m = new Map();
    return function (...a) {
      const k = a.join('|');
      let v = m.get(k);
      if (!v) { v = fn(...a); m.set(k, v); }
      return v;
    };
  };
  G.rnd = (...a) => U.rng(U.hash(a.join(',')));

  // dışbükey çokgeni tarama çizgisiyle doldurur; col bir renk ya da (x,y)=>renk fonksiyonu olabilir
  G.poly = function (g, pts, col) {
    let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    y0 = Math.floor(y0); y1 = Math.ceil(y1);
    for (let y = y0; y < y1; y++) {
      const yc = y + 0.5;
      let xl = Infinity, xr = -Infinity;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if (yc >= Math.min(a[1], b[1]) && yc < Math.max(a[1], b[1])) {
          const x = a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1]);
          if (x < xl) xl = x; if (x > xr) xr = x;
        }
      }
      if (xr < xl) continue;
      const a = Math.round(xl), b = Math.round(xr);
      if (typeof col !== 'function') { g.fillStyle = col; g.fillRect(a, y, b - a, 1); continue; }
      let run = a, cur = col(a, y);
      for (let x = a + 1; x <= b; x++) {
        const c = x < b ? col(x, y) : null;
        if (c !== cur) { if (cur) { g.fillStyle = cur; g.fillRect(run, y, x - run, 1); } run = x; cur = c; }
      }
    }
  };

  // ---------------- 3x5 piksel yazı tipi (Türkçe karakterlerle) ----------------
  const GL = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'],
    D: ['##.', '#.#', '#.#', '#.#', '##.'], E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
    G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'],
    J: ['..#', '..#', '..#', '#.#', '.#.'], K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
    M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
    P: ['##.', '#.#', '##.', '#..', '#..'], R: ['##.', '#.#', '##.', '#.#', '#.#'], S: ['.##', '#..', '.#.', '..#', '##.'],
    T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'], W: ['#.#', '#.#', '###', '###', '#.#'],
    '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'], '2': ['##.', '..#', '.#.', '#..', '###'],
    '3': ['##.', '..#', '.#.', '..#', '##.'], '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '##.', '..#', '##.'],
    '6': ['.##', '#..', '###', '#.#', '###'], '7': ['###', '..#', '.#.', '.#.', '.#.'], '8': ['###', '#.#', '###', '#.#', '###'],
    '9': ['###', '#.#', '###', '..#', '##.'], "'": ['.#.', '.#.', '...', '...', '...'], '.': ['...', '...', '...', '...', '.#.'],
    '-': ['...', '...', '###', '...', '...'], '&': ['.#.', '#.#', '.#.', '#.#', '.##'], ':': ['...', '.#.', '...', '.#.', '...'],
  };
  const ACC = { 'Ç': ['C', 'ced'], 'Ş': ['S', 'ced'], 'Ğ': ['G', 'bar'], 'İ': ['I', 'dot'], 'Ö': ['O', 'dd'], 'Ü': ['U', 'dd'], 'Â': ['A', 'bar'] };
  G.textW = s => { let w = 0; for (const ch of s) w += ch === ' ' ? 2 : 4; return Math.max(0, w - 1); };
  // y: büyük harfin üst satırı (aksanlar y-2'ye çizilir)
  G.text = function (g, s, x, y, col, shadow) {
    s = String(s).toLocaleUpperCase('tr-TR');
    const draw = (cx, cy, c) => {
      for (const ch of s) {
        if (ch === ' ') { cx += 2; continue; }
        const acc = ACC[ch];
        const gl = GL[acc ? acc[0] : ch];
        if (gl) {
          g.fillStyle = c;
          for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (gl[j][i] === '#') g.fillRect(cx + i, cy + j, 1, 1);
          if (acc) {
            if (acc[1] === 'ced') g.fillRect(cx + 1, cy + 5, 1, 1);
            else if (acc[1] === 'dot') g.fillRect(cx + 1, cy - 2, 1, 1);
            else if (acc[1] === 'dd') { g.fillRect(cx, cy - 2, 1, 1); g.fillRect(cx + 2, cy - 2, 1, 1); }
            else g.fillRect(cx, cy - 2, 3, 1);
          }
        }
        cx += 4;
      }
    };
    if (shadow) draw(x + 1, y + 1, shadow);
    draw(x, y, col);
  };
  AK.Gfx = G;
})();
