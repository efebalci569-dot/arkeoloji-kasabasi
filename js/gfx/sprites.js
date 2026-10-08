// Dünya nesneleri ve mobilyalar — tamamı kodla çizilir, otomatik konturlanır.
(function () {
  const G = AK.Gfx, R = G.rect, P = G.px, O = G.oval, L = G.line;
  const out = c => G.outline(c);
  const m = G.memo;
  const inOval = (x, y, ox, oy, w, h) => { const dx = (x - (ox + w / 2)) / (w / 2), dy = (y - (oy + h / 2)) / (h / 2); return dx * dx + dy * dy <= 1; };
  function spk(g, ox, oy, w, h, cols, n, r) {
    for (let i = 0; i < n; i++) { const x = ox + r() * w, y = oy + r() * h; if (inOval(x, y, ox, oy, w, h)) P(g, x | 0, y | 0, cols[(r() * cols.length) | 0]); }
  }
  function tri(g, cx, top, h, w0, w1, col) {
    for (let j = 0; j < h; j++) { const half = Math.round(w0 + (w1 - w0) * j / h); R(g, cx - half, top + j, half * 2, 1, col); }
  }

  const S = {};
  // ---------------- ağaçlar ----------------
  const OAK = [
    { b: '#5fb04a', d: '#3f8a36', l: '#8fd067' },
    { b: '#4a9e3c', d: '#2f7a2e', l: '#6fbf52' },
    { b: '#e08a2e', d: '#b0581c', l: '#f4b44e' },
    { b: '#c8502e', d: '#963820', l: '#e8783e' },
  ];
  S.oak = m(function (s, v) {
    const c = G.canvas(32, 48), g = c.g, r = G.rnd('oak', s, v);
    const tr = '#7a4f2e', trd = '#5a3820', trl = '#946240';
    R(g, 13, 28, 6, 18, tr); R(g, 13, 28, 2, 18, trl); R(g, 17, 28, 2, 18, trd);
    R(g, 10, 44, 4, 2, tr); R(g, 18, 44, 4, 2, trd);
    if (s === 3) {
      L(g, 15, 30, 7, 14, tr); L(g, 16, 30, 7, 15, tr); L(g, 16, 28, 25, 12, tr); L(g, 17, 28, 25, 13, tr);
      L(g, 15, 24, 11, 5, tr); L(g, 17, 22, 21, 3, tr); L(g, 9, 18, 4, 12, trd); L(g, 22, 16, 28, 10, trd); L(g, 12, 9, 9, 3, trd);
      for (const [x, y] of [[7, 13], [8, 13], [24, 11], [25, 11], [11, 4], [12, 4], [21, 2], [4, 11], [28, 9], [15, 22], [16, 21]]) P(g, x, y, '#ffffff');
      return out(c);
    }
    const p = s === 2 ? OAK[2 + (v % 2)] : OAK[s];
    O(g, 2, 8, 28, 26, p.d); O(g, 0, 14, 16, 16, p.d); O(g, 16, 14, 16, 16, p.d);
    O(g, 3, 6, 26, 23, p.b); O(g, 1, 13, 14, 13, p.b); O(g, 17, 13, 14, 13, p.b); O(g, 7, 1, 18, 15, p.b);
    spk(g, 2, 3, 28, 28, [p.d], 50, r);
    O(g, 9, 3, 9, 6, p.l); O(g, 4, 14, 6, 4, p.l); O(g, 19, 9, 7, 4, p.l);
    spk(g, 4, 2, 24, 16, [p.l], 14, r);
    if (s === 0) spk(g, 2, 3, 28, 26, ['#f7b6cf', '#ffffff', '#f49ab8'], 22, r);
    if (s === 1 && v % 3 === 0) spk(g, 3, 6, 26, 22, ['#d8452e'], 7, r);
    return out(c);
  });
  S.pine = m(function (s, v) {
    const c = G.canvas(24, 42), g = c.g;
    R(g, 10, 32, 4, 9, '#6a4428'); R(g, 10, 32, 1, 9, '#86583a');
    const d = '#22502c', b = '#2f6b3a', l = '#4a8c4c';
    for (let i = 0; i < 4; i++) {
      const top = 1 + i * 7, h = 12;
      tri(g, 12, top, h, 1 + i, 7 + i * 1.6, d);
      tri(g, 11, top + 1, h - 2, 1 + i * 0.8, 5 + i * 1.4, b);
      tri(g, 10, top + 2, h - 5, 0.5, 2 + i * 0.6, l);
      if (s === 3) { R(g, 12 - (2 + i), top + 2, 4 + i * 2, 1, '#ffffff'); P(g, 12 - (4 + i), top + 9, '#ffffff'); P(g, 12 + (3 + i), top + 8, '#ffffff'); }
    }
    return out(c);
  });
  S.palm = m(function (v) {
    const c = G.canvas(32, 48), g = c.g;
    for (let y = 16; y < 46; y++) { const x = 14 + Math.round(Math.sin((y - 16) / 9) * 2); R(g, x, y, 4, 1, (y % 4 === 0) ? '#8a6436' : '#a8824e'); }
    const fr = '#3f8f3a', frd = '#2a6a2a';
    const arms = [[-14, 6], [-12, -4], [-4, -10], [6, -10], [13, -3], [14, 7]];
    for (const [dx, dy] of arms) { L(g, 16, 16, 16 + dx, 16 + dy, fr); L(g, 16, 17, 16 + dx, 17 + dy, frd); L(g, 16 + dx, 16 + dy, 16 + dx + Math.sign(dx), 18 + dy, frd); }
    O(g, 13, 14, 7, 5, fr);
    P(g, 14, 18, '#7a4f2e'); P(g, 17, 19, '#7a4f2e'); P(g, 15, 19, '#5a3820');
    return out(c);
  });
  S.bush = m(function (s, v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('bush', s, v), p = OAK[s === 3 ? 1 : s === 2 ? 2 : s];
    if (s === 3) { O(g, 1, 4, 14, 11, '#5c7a62'); O(g, 2, 4, 12, 6, '#f4f8fa'); return out(c); }
    O(g, 1, 4, 14, 11, p.d); O(g, 2, 4, 11, 9, p.b); O(g, 4, 5, 5, 3, p.l);
    if (s === 1) spk(g, 2, 5, 12, 9, ['#d8352e'], 5, r);
    if (s === 0) spk(g, 2, 5, 12, 9, ['#ffffff', '#f7b6cf'], 5, r);
    return out(c);
  });
  S.stump = m(function () {
    const c = G.canvas(16, 16), g = c.g;
    R(g, 3, 7, 10, 7, '#7a4f2e'); R(g, 3, 7, 2, 7, '#946240'); R(g, 11, 7, 2, 7, '#5a3820');
    O(g, 3, 4, 10, 6, '#c8a06a'); O(g, 5, 5, 6, 3, '#a8804e'); P(g, 8, 6, '#c8a06a');
    R(g, 1, 13, 3, 1, '#7a4f2e'); R(g, 12, 13, 3, 1, '#5a3820');
    return out(c);
  });
  S.log = m(function () {
    const c = G.canvas(32, 16), g = c.g;
    R(g, 3, 5, 26, 8, '#7a4f2e'); R(g, 3, 5, 26, 2, '#946240'); R(g, 3, 11, 26, 2, '#5a3820');
    O(g, 25, 5, 6, 8, '#c8a06a'); O(g, 26, 7, 4, 4, '#a8804e');
    P(g, 10, 8, '#5a3820'); P(g, 16, 9, '#5a3820'); R(g, 12, 5, 3, 1, '#6f9a4a');
    return out(c);
  });
  // ---------------- kayalar & kristaller ----------------
  const ROCK = {
    forest: { b: '#9a958c', d: '#77726a', l: '#bfbab0' },
    cave: { b: '#7d7088', d: '#5e5368', l: '#9d90a8' },
    desert: { b: '#c8a070', d: '#a07a4a', l: '#e2c08e' },
  };
  S.rock = m(function (kind, v) {
    const c = G.canvas(16, 16), g = c.g, p = ROCK[kind] || ROCK.forest;
    O(g, 2, 5, 12, 10, p.d); O(g, 2, 4, 12, 9, p.b); O(g, 4, 5, 5, 3, p.l);
    if (v % 2) L(g, 8, 7, 10, 11, p.d); else { L(g, 6, 9, 9, 8, p.d); P(g, 11, 6, p.l); }
    if (kind === 'forest' && v % 3 === 0) { R(g, 4, 4, 3, 1, '#6f9a4a'); P(g, 5, 3, '#6f9a4a'); }
    return out(c);
  });
  S.boulder = m(function (kind, hardv) {
    const c = G.canvas(32, 26), g = c.g, p = ROCK[kind] || ROCK.forest, r = G.rnd('bo', kind, hardv);
    const b = hardv ? G.dk(p.b, 0.25) : p.b, d = hardv ? G.dk(p.d, 0.25) : p.d, l = hardv ? G.dk(p.l, 0.15) : p.l;
    O(g, 1, 6, 30, 19, d); O(g, 2, 3, 28, 19, b); O(g, 5, 4, 12, 7, l);
    L(g, 15, 9, 19, 15, d); L(g, 19, 15, 24, 16, d); L(g, 9, 14, 13, 18, d);
    if (hardv) spk(g, 2, 3, 28, 19, ['#d8d0e0', '#4a4250'], 30, r);
    return out(c);
  });
  S.crystal = m(function (kind) {
    const c = G.canvas(16, 18), g = c.g;
    const p = kind === 'ametist' ? { b: '#a77ad8', d: '#7448a8', l: '#dcc6f6' } : { b: '#bfe4f0', d: '#7fb0c4', l: '#ffffff' };
    O(g, 1, 12, 14, 6, '#6e6378');
    const pr = [[3, 6, 3, 9], [7, 1, 3, 14], [11, 5, 3, 10]];
    for (const [x, y, w, h] of pr) { R(g, x, y + 1, w, h - 1, p.b); P(g, x + 1, y, p.b); R(g, x, y + 1, 1, h - 1, p.l); R(g, x + w - 1, y + 1, 1, h - 1, p.d); }
    return out(c);
  });
  S.mushroom = m(function (v) {
    const c = G.canvas(16, 16), g = c.g;
    const caps = [[2, 7, 6, 4], [8, 4, 7, 5], [6, 10, 5, 3]];
    for (const [x, y, w, h] of caps) { R(g, x + w / 2 - 1 | 0, y + h - 1, 2, 4, '#e8e0d0'); O(g, x, y, w, h, '#58d0c8'); P(g, x + 1, y + 1, '#c8fff8'); }
    return out(c);
  });
  // ---------------- kazı nesneleri ----------------
  S.digspot = m(function (f, tint) {
    const c = G.canvas(16, 16), g = c.g;
    O(g, 3, 10, 10, 5, '#6e4426'); O(g, 4, 10, 8, 3, '#8b5a36');
    const off = [0, 1, 0, -1][f % 4];
    const sticks = [[5, 6], [8, 4], [11, 7]];
    sticks.forEach(([x, y], i) => {
      const o = i % 2 ? -off : off;
      P(g, x + o, y, '#c8b48a'); P(g, x, y + 1, '#a8946a'); P(g, x + (o > 0 ? 1 : 0), y + 2, '#a8946a'); R(g, x, y + 3, 1, 9 - y, '#8a7650');
    });
    if (tint) { P(g, 2, 3 + (f % 2), tint); P(g, 13, 5 - (f % 2), tint); }
    return out(c);
  });
  S.hole = m(function (sand) {
    const c = G.canvas(16, 16), g = c.g;
    const rim = sand ? '#b98d50' : '#6e4426', inner = sand ? '#7a5a30' : '#3b2416', lip = sand ? '#e8c587' : '#a8734a';
    O(g, 2, 4, 12, 10, rim); O(g, 3, 5, 10, 7, inner); R(g, 4, 12, 8, 1, lip);
    P(g, 1, 9, rim); P(g, 14, 8, rim);
    return c;
  });
  S.fossil = m(function () {
    const c = G.canvas(16, 16), g = c.g;
    O(g, 1, 4, 14, 11, '#8f8273'); O(g, 2, 4, 12, 9, '#a89a89');
    R(g, 4, 9, 8, 1, '#efe6d0'); for (let i = 0; i < 4; i++) { P(g, 5 + i * 2, 7, '#efe6d0'); P(g, 5 + i * 2, 8, '#efe6d0'); P(g, 5 + i * 2, 10, '#efe6d0'); P(g, 5 + i * 2, 11, '#efe6d0'); }
    O(g, 10, 7, 4, 3, '#efe6d0'); P(g, 12, 8, '#3a2a2a');
    return out(c);
  });
  S.snowruin = m(function (f) {
    const c = G.canvas(16, 16), g = c.g;
    O(g, 1, 9, 14, 6, '#ffffff'); O(g, 2, 10, 12, 4, '#e3ecf0');
    R(g, 5, 3, 6, 8, '#a8a090'); R(g, 5, 3, 6, 1, '#c8c0b0'); R(g, 6, 5, 3, 1, '#787060'); R(g, 6, 7, 4, 1, '#787060');
    R(g, 5, 3, 6, 2, '#ffffff');
    if (f % 2) { P(g, 12, 4, '#bfe8ff'); P(g, 13, 3, '#ffffff'); }
    return out(c);
  });
  S.fogspot = m(function (f) {
    const c = G.canvas(16, 16), g = c.g;
    O(g, 1, 5, 14, 9, f % 2 ? '#9b7fd8' : '#8a6cc8'); O(g, 3, 6, 10, 7, '#5a4a8a');
    P(g, 5, 9, '#e8dcff'); P(g, 8, 7, '#e8dcff'); P(g, 11, 10, '#e8dcff'); P(g, 8, 11, '#e8dcff');
    return c;
  });
  S.stone = m(function (v) {
    const c = G.canvas(16, 30), g = c.g;
    R(g, 3, 4, 10, 24, '#8f8a96'); R(g, 3, 4, 3, 24, '#a9a4b0'); R(g, 11, 4, 2, 24, '#6f6a76');
    R(g, 4, 2, 8, 2, '#8f8a96'); P(g, 7, 10, '#c8b8ff'); P(g, 8, 14, '#c8b8ff'); P(g, 7, 18, '#c8b8ff');
    if (v % 2) R(g, 3, 20, 4, 3, '#6f9a4a');
    return out(c);
  });
  S.xmark = m(function () {
    const c = G.canvas(16, 16), g = c.g;
    for (let i = 0; i < 9; i++) { R(g, 3 + i, 4 + i, 2, 1, '#c8352e'); R(g, 12 - i, 4 + i, 2, 1, '#c8352e'); }
    return c;
  });
  S.rubble = m(function (kind) {
    const c = G.canvas(48, 30), g = c.g, p = ROCK[kind] || ROCK.forest;
    const rs = [[2, 12, 16, 14], [14, 8, 18, 18], [30, 11, 16, 15], [8, 2, 14, 12], [24, 1, 14, 12]];
    for (const [x, y, w, h] of rs) { O(g, x, y, w, h, p.d); O(g, x + 1, y, w - 2, h - 2, p.b); O(g, x + 3, y + 1, w / 3 | 0, h / 4 | 0, p.l); }
    return out(c);
  });
  // ---------------- kasaba süsleri ----------------
  S.flowers = m(function (s, v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('fl', s, v);
    const pal = [['#f7a8c4', '#ffffff', '#fff27a', '#c8a0f0'], ['#ffd54a', '#ff8a5c', '#ffffff', '#e85a5a'], ['#e0782e', '#c9452e', '#f2c14e'], ['#bfe8ff']][s];
    const n = s === 3 ? 0 : 3 + (v % 3);
    for (let i = 0; i < n; i++) {
      const x = 2 + ((r() * 11) | 0), y = 3 + ((r() * 10) | 0), col = pal[(r() * pal.length) | 0];
      R(g, x, y + 2, 1, 2, '#3f8a36'); P(g, x - 1, y + 1, col); P(g, x + 1, y + 1, col); P(g, x, y, col); P(g, x, y + 2, col); P(g, x, y + 1, '#fff2a0');
    }
    return c;
  });
  S.fenceH = m(function () {
    const c = G.canvas(16, 18), g = c.g;
    R(g, 0, 6, 16, 2, '#c8955a'); R(g, 0, 11, 16, 2, '#c8955a'); R(g, 0, 7, 16, 1, '#a8743f'); R(g, 0, 12, 16, 1, '#a8743f');
    R(g, 2, 3, 3, 14, '#b07a45'); R(g, 2, 3, 1, 14, '#d0a06a'); P(g, 3, 2, '#b07a45');
    return out(c);
  });
  S.lamp = m(function (lit) {
    const c = G.canvas(16, 36), g = c.g;
    R(g, 7, 9, 2, 25, '#3b3540'); R(g, 7, 9, 1, 25, '#5a5260'); R(g, 5, 32, 6, 3, '#3b3540');
    R(g, 4, 3, 8, 7, '#3b3540'); R(g, 5, 4, 6, 5, lit ? '#fff2b0' : '#f2dc90'); R(g, 7, 4, 1, 5, '#3b3540');
    R(g, 5, 1, 6, 2, '#3b3540'); P(g, 7, 0, '#3b3540'); P(g, 8, 0, '#3b3540');
    return out(c);
  });
  S.bench = m(function () {
    const c = G.canvas(32, 20), g = c.g;
    R(g, 2, 2, 28, 3, '#a8743f'); R(g, 2, 2, 28, 1, '#c8955a'); R(g, 2, 6, 28, 2, '#a8743f');
    R(g, 2, 10, 28, 3, '#b8844f'); R(g, 2, 10, 28, 1, '#d8a46a');
    R(g, 3, 5, 2, 13, '#3b3540'); R(g, 27, 5, 2, 13, '#3b3540'); R(g, 3, 13, 2, 5, '#3b3540');
    return out(c);
  });
  S.fountain = m(function (flow, f) {
    const c = G.canvas(48, 44), g = c.g;
    O(g, 1, 20, 46, 23, '#8a8274'); O(g, 2, 20, 44, 21, '#bdb5a6'); O(g, 4, 21, 40, 3, '#d8d0c2');
    O(g, 6, 24, 36, 15, flow ? '#3f88c8' : '#8a8274');
    if (flow) { O(g, 9, 26, 30, 10, '#4a98d4'); for (let i = 0; i < 5; i++) { const x = 10 + ((i * 7 + f * 3) % 28); R(g, x, 28 + (i % 3) * 3, 3, 1, '#9fd2f2'); } }
    else { L(g, 12, 30, 18, 33, '#6e675c'); L(g, 26, 28, 32, 34, '#6e675c'); }
    R(g, 20, 10, 8, 22, '#b2aa9a'); R(g, 20, 10, 2, 22, '#d0c8b8'); R(g, 26, 10, 2, 22, '#968e80');
    O(g, 14, 8, 20, 6, '#bdb5a6'); O(g, 16, 9, 16, 3, flow ? '#4a98d4' : '#8a8274');
    R(g, 22, 3, 4, 6, '#b2aa9a'); O(g, 21, 1, 6, 4, '#c8c0b0');
    if (flow) {
      const dr = [[18, 12], [15, 16], [13, 21], [30, 12], [33, 16], [35, 21]];
      dr.forEach(([x, y], i) => { const yy = y + ((f + i) % 3); P(g, x, yy, '#bfe8ff'); P(g, x, yy + 1, '#7cc0ee'); });
      P(g, 24, 0, '#bfe8ff'); P(g, 23, 1 + (f % 2), '#bfe8ff');
    }
    return out(c);
  });
  S.board = m(function () {
    const c = G.canvas(32, 34), g = c.g;
    R(g, 4, 8, 3, 25, '#7a4f2a'); R(g, 25, 8, 3, 25, '#7a4f2a');
    R(g, 1, 6, 30, 19, '#7a4f2a'); R(g, 3, 8, 26, 15, '#c9935a');
    R(g, 5, 10, 7, 6, '#fff6e0'); R(g, 14, 9, 6, 8, '#fff2a0'); R(g, 22, 11, 5, 6, '#fff6e0'); R(g, 8, 17, 8, 4, '#f6d0c0');
    P(g, 8, 10, '#c8352e'); P(g, 16, 9, '#3d7fd9'); P(g, 24, 11, '#c8352e');
    R(g, 0, 3, 32, 3, '#a8453a'); R(g, 0, 3, 32, 1, '#c8655a');
    return out(c);
  });
  S.mailbox = m(function (has) {
    const c = G.canvas(16, 24), g = c.g;
    R(g, 7, 10, 2, 13, '#7a4f2a');
    R(g, 3, 4, 10, 7, '#c8553d'); R(g, 3, 4, 10, 1, '#e07a5f'); O(g, 3, 2, 10, 4, '#c8553d'); R(g, 4, 6, 8, 1, '#8a3a2a');
    if (has) { R(g, 12, 1, 1, 6, '#3b3540'); R(g, 13, 1, 2, 2, '#f2c14e'); R(g, 5, 7, 5, 2, '#fff6e0'); }
    return out(c);
  });
  S.sign = m(function () {
    const c = G.canvas(16, 24), g = c.g;
    R(g, 7, 10, 2, 13, '#7a4f2a'); R(g, 1, 3, 14, 8, '#b07a45'); R(g, 2, 4, 12, 6, '#c8955a');
    R(g, 4, 6, 7, 1, '#5a3a22'); R(g, 4, 8, 5, 1, '#5a3a22'); P(g, 11, 5, '#5a3a22'); P(g, 12, 6, '#5a3a22'); P(g, 11, 7, '#5a3a22');
    return out(c);
  });
  S.barrel = m(function () {
    const c = G.canvas(16, 20), g = c.g;
    R(g, 3, 3, 10, 15, '#a8743f'); R(g, 2, 5, 12, 11, '#a8743f'); R(g, 3, 3, 3, 15, '#c8955a'); R(g, 11, 3, 2, 15, '#7a4f2a');
    R(g, 2, 6, 12, 1, '#5a5260'); R(g, 2, 13, 12, 1, '#5a5260'); O(g, 3, 1, 10, 4, '#8a5a30');
    return out(c);
  });
  S.crate = m(function (v) {
    const c = G.canvas(16, 18), g = c.g;
    R(g, 1, 3, 14, 14, '#b8844f'); R(g, 1, 3, 14, 2, '#d8a46a'); R(g, 1, 3, 2, 14, '#c8955a');
    L(g, 3, 6, 13, 15, '#8a5a30'); R(g, 1, 9, 14, 1, '#8a5a30'); R(g, 1, 16, 14, 1, '#7a4f2a');
    if (v === 1) { R(g, 4, 0, 4, 4, '#c8a06a'); R(g, 9, 1, 3, 3, '#9c9282'); }
    return out(c);
  });
  S.tent = m(function () {
    const c = G.canvas(48, 40), g = c.g;
    for (let y = 4; y < 37; y++) { const half = Math.round(4 + (y - 4) * 0.62); R(g, 24 - half, y, half * 2, 1, y % 6 < 3 ? '#d8c49a' : '#cdb88a'); }
    for (let y = 4; y < 37; y++) { const half = Math.round(4 + (y - 4) * 0.62); R(g, 24 + half - 3, y, 3, 1, '#b8a476'); R(g, 24 - half, y, 2, 1, '#e8d8b4'); }
    for (let y = 18; y < 37; y++) { const half = Math.round((y - 18) * 0.42); R(g, 24 - half, y, half * 2 + 1, 1, '#3b2a20'); }
    R(g, 23, 0, 2, 6, '#7a4f2a'); R(g, 25, 0, 6, 3, '#c8553d');
    L(g, 4, 36, 0, 39, '#7a6a50'); L(g, 44, 36, 47, 39, '#7a6a50');
    return out(c);
  });
  S.campfire = m(function (f) {
    const c = G.canvas(16, 18), g = c.g;
    for (const [x, y] of [[1, 13], [4, 15], [9, 15], [13, 13], [7, 12]]) { O(g, x, y, 4, 3, '#8a8274'); }
    L(g, 3, 14, 12, 11, '#7a4f2e'); L(g, 3, 11, 12, 14, '#5a3820');
    const h = [8, 10, 9][f % 3];
    tri(g, 8, 12 - h, h, 0.5, 3.5, '#e8702a'); tri(g, 8, 13 - h + 3, h - 3, 0.5, 2, '#f2c14e'); P(g, 8, 11, '#fff2b0');
    return out(c);
  });
  S.pillar = m(function (kind, broken) {
    const c = G.canvas(16, 42), g = c.g;
    const b = kind === 'desert' ? '#e0c08a' : '#d8d0c0', d = G.dk(b, 0.2), l = G.lt(b, 0.3);
    const top = broken ? 18 : 6;
    R(g, 3, top, 10, 36 - top, b); R(g, 3, top, 2, 36 - top, l); R(g, 11, top, 2, 36 - top, d);
    for (let x = 6; x < 11; x += 2) R(g, x, top + 1, 1, 34 - top, d);
    R(g, 1, 36, 14, 4, b); R(g, 1, 36, 14, 1, l); R(g, 1, 39, 14, 1, d);
    if (!broken) { R(g, 1, 2, 14, 4, b); R(g, 1, 2, 14, 1, l); R(g, 2, 5, 12, 1, d); }
    else { P(g, 4, top - 1, b); P(g, 5, top - 2, b); P(g, 9, top - 1, b); P(g, 10, top - 1, b); R(g, 2, 38, 3, 2, kind === 'desert' ? '#c8a070' : '#6f9a4a'); }
    if (kind !== 'desert' && !broken) R(g, 3, 28, 3, 4, '#6f9a4a');
    return out(c);
  });
  S.ruinblock = m(function (kind, v) {
    const c = G.canvas(16, 20), g = c.g;
    const b = kind === 'desert' ? '#d8b47a' : '#b8b0a2', d = G.dk(b, 0.25), l = G.lt(b, 0.25);
    R(g, 1, 4, 14, 14, b); R(g, 1, 4, 14, 2, l); R(g, 1, 11, 14, 1, d); R(g, 7, 4, 1, 7, d); R(g, 4, 11, 1, 7, d); R(g, 11, 11, 1, 7, d);
    if (kind !== 'desert' && v % 2) R(g, 2, 4, 5, 2, '#6f9a4a');
    return out(c);
  });
  S.caveEntrance = m(function (s) {
    const c = G.canvas(48, 44), g = c.g;
    O(g, 0, 2, 48, 44, '#776a5c'); O(g, 2, 4, 44, 40, '#8f8273');
    for (let y = 10; y < 44; y += 6) R(g, 4, y, 40, 1, '#766a5d');
    O(g, 12, 14, 24, 34, '#2b1f2a'); O(g, 14, 17, 20, 30, '#140e18');
    if (s === 3) { O(g, 4, 2, 40, 8, '#f4f8fa'); }
    else { R(g, 6, 4, 10, 3, '#5fa645'); R(g, 30, 3, 12, 3, '#5fa645'); }
    return out(c);
  });
  S.torch = m(function (f) {
    const c = G.canvas(8, 18), g = c.g;
    R(g, 3, 8, 2, 9, '#6a4428'); R(g, 2, 7, 4, 2, '#5a5260');
    const h = [5, 6, 5][f % 3];
    tri(g, 4, 7 - h, h, 0.5, 2.5, '#e8702a'); P(g, 4, 5, '#f2c14e'); P(g, 3, 6, '#f2c14e'); P(g, 4, 6, '#fff2b0');
    return out(c);
  });
  S.sealedWall = m(function (state) {
    const c = G.canvas(32, 36), g = c.g;
    if (state === 2) {
      return S.rubble('cave');
    }
    R(g, 1, 2, 30, 33, '#5e5368'); R(g, 2, 3, 28, 31, '#7d7088'); R(g, 2, 3, 28, 2, '#9d90a8');
    R(g, 15, 3, 2, 31, '#5e5368');
    const glow = state === 1;
    const col = glow ? '#f2c14e' : '#4a4152';
    O(g, 5, 8, 7, 7, col); for (const [x, y] of [[8, 6], [8, 16], [3, 11], [13, 11]]) P(g, x, y, col);
    O(g, 20, 8, 7, 7, glow ? '#cfe3ff' : '#4a4152'); O(g, 22, 8, 6, 6, '#7d7088');
    const sx = 16, sy = 24; for (const [x, y] of [[0, -4], [0, 4], [-4, 0], [4, 0], [-3, -3], [3, 3], [3, -3], [-3, 3]]) L(g, sx, sy, sx + x, sy + y, glow ? '#bfe8ff' : '#4a4152');
    return out(c);
  });
  S.altar = m(function (empty) {
    const c = G.canvas(32, 26), g = c.g;
    R(g, 2, 8, 28, 16, '#7d7088'); R(g, 2, 8, 28, 2, '#9d90a8'); R(g, 4, 12, 24, 1, '#5e5368'); R(g, 4, 18, 24, 1, '#5e5368');
    R(g, 0, 5, 32, 4, '#9d90a8'); R(g, 0, 5, 32, 1, '#c0b4ca');
    if (!empty) { O(g, 11, 0, 10, 7, '#f2c14e'); O(g, 13, 1, 6, 4, '#fff2b0'); }
    for (let x = 6; x < 28; x += 5) P(g, x, 15, '#f2c14e');
    return out(c);
  });
  S.chestOld = m(function (open) {
    const c = G.canvas(16, 16), g = c.g;
    R(g, 1, 6, 14, 9, '#7a4f2a'); R(g, 1, 6, 14, 1, '#a8743f'); R(g, 1, 9, 14, 1, '#c9a050'); R(g, 7, 8, 2, 3, '#f2c14e');
    if (!open) { O(g, 1, 2, 14, 7, '#8a5a30'); R(g, 1, 5, 14, 1, '#c9a050'); } else { R(g, 2, 3, 12, 3, '#3b2416'); }
    return out(c);
  });
  S.statue = m(function () {
    const c = G.canvas(24, 46), g = c.g;
    const st = '#d8d0c0', sd = '#a89e8c', sl = '#f2ece0';
    R(g, 2, 34, 20, 11, '#9c9282'); R(g, 2, 34, 20, 2, '#bdb4a4'); R(g, 5, 38, 14, 3, '#857c70');
    R(g, 8, 18, 8, 16, st); R(g, 8, 18, 2, 16, sl); R(g, 14, 18, 2, 16, sd);
    O(g, 8, 6, 8, 9, st); O(g, 9, 7, 3, 3, sl); R(g, 5, 4, 14, 2, sd); R(g, 8, 1, 8, 4, st);
    L(g, 16, 20, 21, 12, sd); L(g, 20, 10, 22, 14, sd); L(g, 19, 10, 17, 12, sd);
    R(g, 6, 20, 2, 8, st);
    return out(c);
  });
  S.banner = m(function (col) {
    const c = G.canvas(16, 42), g = c.g;
    R(g, 7, 2, 2, 39, '#5a5260'); O(g, 6, 0, 4, 4, '#f2c14e');
    R(g, 9, 6, 6, 18, col); R(g, 9, 6, 6, 1, G.lt(col, 0.3)); P(g, 9, 24, col); P(g, 12, 24, col); P(g, 14, 24, col);
    O(g, 10, 11, 4, 5, '#f2c14e'); R(g, 11, 10, 2, 1, '#f2c14e');
    return out(c);
  });
  S.stall = m(function (col) {
    const c = G.canvas(48, 40), g = c.g;
    R(g, 4, 12, 2, 26, '#7a4f2a'); R(g, 42, 12, 2, 26, '#7a4f2a');
    for (let x = 0; x < 48; x += 6) { R(g, x, 4, 6, 9, (x / 6) % 2 ? '#fff6e0' : col); }
    for (let x = 0; x < 48; x += 6) O(g, x, 11, 6, 4, (x / 6) % 2 ? '#fff6e0' : col);
    R(g, 0, 2, 48, 2, G.dk(col, 0.3));
    R(g, 2, 24, 44, 12, '#b07a45'); R(g, 2, 24, 44, 2, '#d0a06a'); R(g, 2, 34, 44, 2, '#7a4f2a');
    const goods = ['#c46a3c', '#3d7fd9', '#f2c14e', '#6f9a4a', '#c8553d'];
    goods.forEach((gc, i) => { O(g, 5 + i * 8, 19, 6, 6, gc); P(g, 6 + i * 8, 20, '#ffffff'); });
    return out(c);
  });
  S.busstop = m(function () {
    const c = G.canvas(48, 40), g = c.g;
    R(g, 2, 4, 44, 4, '#3f8a5a'); R(g, 2, 4, 44, 1, '#5fb07a'); R(g, 0, 8, 48, 2, '#2f6a44');
    R(g, 4, 10, 2, 28, '#5a5260'); R(g, 42, 10, 2, 28, '#5a5260');
    R(g, 6, 10, 36, 16, '#bfe0e8'); R(g, 6, 10, 36, 2, '#e0f4f8'); R(g, 23, 10, 1, 16, '#5a5260');
    R(g, 8, 28, 32, 3, '#a8743f'); R(g, 10, 31, 2, 6, '#5a5260'); R(g, 36, 31, 2, 6, '#5a5260');
    R(g, 30, 13, 8, 6, '#f2c14e'); R(g, 31, 14, 6, 3, '#3d7fd9'); P(g, 32, 18, '#3b3540'); P(g, 35, 18, '#3b3540');
    return out(c);
  });
  S.reeds = m(function (s) {
    const c = G.canvas(16, 16), g = c.g;
    const col = s === 2 ? '#a89040' : s === 3 ? '#a8b0a0' : '#5f9a3a';
    for (const x of [3, 6, 9, 12]) { R(g, x, 4 + (x % 3), 1, 12 - (x % 3), col); }
    R(g, 6, 2, 1, 4, '#7a4f2a'); R(g, 12, 3, 1, 3, '#7a4f2a');
    return out(c);
  });
  S.lily = m(function () {
    const c = G.canvas(16, 10), g = c.g;
    O(g, 1, 2, 9, 6, '#4f9a45'); R(g, 5, 4, 3, 1, '#3f8a36'); O(g, 9, 4, 6, 4, '#5fb04a'); P(g, 4, 3, '#f7b6cf'); P(g, 5, 3, '#ffffff');
    return c;
  });
  S.cactus = m(function () {
    const c = G.canvas(16, 26), g = c.g;
    R(g, 6, 4, 4, 21, '#4f9a45'); R(g, 6, 4, 1, 21, '#7cc45a'); O(g, 6, 2, 4, 4, '#4f9a45');
    R(g, 2, 10, 2, 7, '#4f9a45'); R(g, 2, 16, 4, 2, '#4f9a45'); R(g, 12, 7, 2, 7, '#4f9a45'); R(g, 10, 13, 4, 2, '#4f9a45');
    P(g, 7, 9, '#e8f0d0'); P(g, 8, 15, '#e8f0d0'); P(g, 7, 20, '#e8f0d0'); P(g, 7, 2, '#f7a8c4');
    return out(c);
  });
  S.obelisk = m(function () {
    const c = G.canvas(16, 50), g = c.g;
    tri(g, 8, 1, 6, 0.5, 4, '#e0c08a');
    for (let y = 7; y < 44; y++) { const half = 4 + Math.round((y - 7) / 14); R(g, 8 - half, y, half * 2, 1, '#d8b47a'); R(g, 8 - half, y, 2, 1, '#ecd2a0'); }
    for (let y = 12; y < 40; y += 5) { R(g, 6, y, 4, 1, '#9a7448'); P(g, 7, y + 2, '#9a7448'); }
    R(g, 1, 44, 14, 5, '#c39a62'); R(g, 1, 44, 14, 1, '#e0c08a');
    return out(c);
  });
  S.crackedWall = m(function (broken) {
    if (broken) return S.rubble('desert');
    const c = G.canvas(32, 36), g = c.g;
    R(g, 0, 2, 32, 33, '#c39a62'); R(g, 0, 2, 32, 2, '#dcb87e');
    for (let y = 8; y < 34; y += 6) R(g, 0, y, 32, 1, '#a8814e');
    L(g, 10, 4, 14, 14, '#5a3a22'); L(g, 14, 14, 12, 22, '#5a3a22'); L(g, 14, 14, 20, 18, '#5a3a22'); L(g, 20, 18, 22, 30, '#5a3a22');
    return out(c);
  });
  S.smoke = null;

  // ---------------- iç mekân mobilyaları ----------------
  S.bed = m(function (col) {
    const c = G.canvas(32, 42), g = c.g;
    R(g, 1, 2, 30, 12, '#7a4f2a'); R(g, 1, 2, 30, 2, '#a8743f'); R(g, 4, 5, 24, 6, '#8d5d32');
    R(g, 2, 12, 28, 28, '#8d5d32');
    R(g, 3, 12, 26, 9, '#f2ead8'); O(g, 6, 13, 20, 7, '#ffffff');
    R(g, 3, 20, 26, 18, col); for (let y = 22; y < 38; y += 4) for (let x = 3; x < 29; x += 4) R(g, x + ((y / 4) % 2) * 2, y, 2, 2, G.lt(col, 0.25));
    R(g, 3, 20, 26, 2, G.lt(col, 0.35)); R(g, 2, 38, 28, 3, '#5a3820');
    return out(c);
  });
  S.table = m(function () {
    const c = G.canvas(32, 24), g = c.g;
    R(g, 1, 3, 30, 11, '#b07a45'); R(g, 1, 3, 30, 2, '#d0a06a'); R(g, 1, 13, 30, 3, '#8a5a30');
    R(g, 3, 16, 3, 7, '#7a4f2a'); R(g, 26, 16, 3, 7, '#7a4f2a');
    return out(c);
  });
  S.chair = m(function () {
    const c = G.canvas(16, 22), g = c.g;
    R(g, 3, 2, 10, 9, '#a8743f'); R(g, 4, 3, 8, 6, '#c8955a'); R(g, 2, 11, 12, 4, '#b8844f'); R(g, 2, 11, 12, 1, '#d8a46a');
    R(g, 3, 15, 2, 6, '#7a4f2a'); R(g, 11, 15, 2, 6, '#7a4f2a');
    return out(c);
  });
  S.chest = m(function () {
    const c = G.canvas(16, 18), g = c.g;
    R(g, 1, 7, 14, 10, '#a8743f'); O(g, 1, 2, 14, 9, '#b8844f'); R(g, 1, 6, 14, 2, '#c9a050');
    R(g, 3, 2, 2, 15, '#c9a050'); R(g, 11, 2, 2, 15, '#c9a050'); R(g, 7, 7, 2, 3, '#5a5260');
    return out(c);
  });
  S.radio = m(function () {
    const c = G.canvas(16, 26), g = c.g;
    R(g, 1, 12, 14, 4, '#a8743f'); R(g, 1, 12, 14, 1, '#c8955a'); R(g, 2, 16, 2, 9, '#7a4f2a'); R(g, 12, 16, 2, 9, '#7a4f2a');
    R(g, 2, 3, 12, 9, '#8a5a30'); R(g, 3, 4, 6, 7, '#d8c49a'); for (let y = 5; y < 11; y += 2) R(g, 3, y, 6, 1, '#a8946a');
    O(g, 10, 5, 3, 3, '#f2c14e'); R(g, 10, 9, 3, 1, '#3b2416'); L(g, 12, 3, 15, 0, '#5a5260');
    return out(c);
  });
  S.plant = m(function (big) {
    const c = G.canvas(16, big ? 32 : 24), g = c.g, h = big ? 32 : 24;
    R(g, 4, h - 9, 8, 8, '#c46a3c'); R(g, 3, h - 9, 10, 2, '#d8865a'); R(g, 4, h - 2, 8, 1, '#8f4524');
    const top = big ? 1 : 3;
    O(g, 2, top + 4, 12, h - 14, '#3f8a36'); O(g, 1, top, 7, 9, '#4f9a45'); O(g, 8, top + 2, 7, 8, '#4f9a45'); O(g, 4, top + 3, 4, 3, '#7cc45a');
    return out(c);
  });
  S.bookshelf = m(function () {
    const c = G.canvas(32, 38), g = c.g, r = G.rnd('bs');
    R(g, 1, 2, 30, 35, '#7a4f2a'); R(g, 3, 4, 26, 31, '#4a3022');
    const cols = ['#c8553d', '#3d7fd9', '#4f9a45', '#f2c14e', '#9b4fd1', '#e8d6b0', '#a8453a'];
    for (let sh = 0; sh < 3; sh++) {
      const y = 5 + sh * 10; R(g, 3, y + 9, 26, 1, '#a8743f');
      let x = 4; while (x < 27) { const w = 2 + ((r() * 2) | 0), h = 6 + ((r() * 3) | 0); R(g, x, y + 9 - h, w, h, cols[(r() * cols.length) | 0]); x += w + (r() < 0.2 ? 1 : 0); }
    }
    return out(c);
  });
  S.floorlamp = m(function () {
    const c = G.canvas(16, 34), g = c.g;
    R(g, 7, 10, 2, 22, '#5a5260'); R(g, 4, 31, 8, 2, '#5a5260');
    tri(g, 8, 1, 10, 3, 7, '#f2d39a'); R(g, 2, 10, 12, 1, '#c9a050');
    return out(c);
  });
  S.vitrine = m(function () {
    const c = G.canvas(32, 36), g = c.g;
    R(g, 1, 22, 30, 13, '#7a4f2a'); R(g, 1, 22, 30, 2, '#a8743f'); R(g, 4, 26, 10, 7, '#8d5d32'); R(g, 18, 26, 10, 7, '#8d5d32');
    R(g, 2, 2, 28, 20, '#cfe8f0'); R(g, 3, 3, 26, 18, '#e8f6fa');
    R(g, 3, 12, 26, 1, '#a8c8d4'); R(g, 2, 2, 28, 1, '#c9a050'); R(g, 2, 2, 1, 20, '#c9a050'); R(g, 29, 2, 1, 20, '#c9a050');
    L(g, 5, 5, 9, 1 + 4, '#ffffff');
    return out(c);
  });
  S.dispTable = m(function (col) {
    const c = G.canvas(32, 22), g = c.g;
    R(g, 1, 4, 30, 9, col); R(g, 1, 4, 30, 2, G.lt(col, 0.25)); R(g, 1, 11, 30, 3, G.dk(col, 0.2));
    for (let x = 2; x < 30; x += 4) P(g, x, 13, '#f2c14e');
    R(g, 3, 14, 3, 7, '#7a4f2a'); R(g, 26, 14, 3, 7, '#7a4f2a');
    return out(c);
  });
  S.counter = m(function () {
    const c = G.canvas(48, 26), g = c.g;
    R(g, 1, 6, 46, 18, '#8d5d32'); R(g, 1, 6, 46, 3, '#c8955a'); R(g, 1, 9, 46, 1, '#5a3820');
    for (let x = 5; x < 46; x += 10) R(g, x, 12, 6, 9, '#7a4f2a');
    R(g, 30, 0, 12, 7, '#5a5260'); R(g, 31, 1, 10, 3, '#3f8a5a'); R(g, 33, 2, 2, 1, '#bfffc8'); R(g, 30, 5, 12, 2, '#3b3540');
    O(g, 6, 3, 6, 4, '#f2c14e'); P(g, 8, 2, '#f2c14e');
    return out(c);
  });
  S.cleanTable = m(function (lab) {
    const c = G.canvas(32, 28), g = c.g;
    R(g, 1, 8, 30, 10, lab ? '#c8d0d8' : '#a8743f'); R(g, 1, 8, 30, 2, lab ? '#e8eef2' : '#c8955a'); R(g, 1, 17, 30, 2, '#5a3820');
    R(g, 3, 19, 3, 8, '#7a4f2a'); R(g, 26, 19, 3, 8, '#7a4f2a');
    R(g, 4, 5, 2, 6, '#c8955a'); R(g, 4, 3, 2, 3, '#e8d6b0'); R(g, 8, 6, 2, 5, '#7a4f2a'); R(g, 8, 4, 3, 2, '#9c9282');
    O(g, 13, 7, 9, 4, '#e8e0d0'); O(g, 14, 8, 7, 2, '#8a5a30');
    R(g, 25, 1, 2, 9, '#5a5260'); R(g, 22, 0, 6, 3, '#3f8a5a'); R(g, 23, 2, 4, 1, '#fff2b0');
    if (lab) { R(g, 15, 0, 3, 8, '#bfe8ff'); R(g, 15, 5, 3, 3, '#58d0c8'); }
    return out(c);
  });
  S.orderBoard = m(function (n) {
    const c = G.canvas(32, 22), g = c.g;
    R(g, 1, 1, 30, 20, '#7a4f2a'); R(g, 3, 3, 26, 16, '#c9935a');
    for (let i = 0; i < n; i++) { R(g, 5 + i * 8, 5 + (i % 2) * 2, 6, 8, '#fff6e0'); R(g, 6 + i * 8, 7 + (i % 2) * 2, 4, 1, '#8a6a4a'); R(g, 6 + i * 8, 9 + (i % 2) * 2, 3, 1, '#8a6a4a'); P(g, 8 + i * 8, 5 + (i % 2) * 2, '#c8352e'); }
    return out(c);
  });
  S.pedestal = m(function (kind) {
    const c = G.canvas(16, 26), g = c.g;
    const b = kind === 'gold' ? '#d8c08a' : '#d8d0c0', d = G.dk(b, 0.2), l = G.lt(b, 0.3);
    R(g, 3, 12, 10, 12, b); R(g, 3, 12, 2, 12, l); R(g, 11, 12, 2, 12, d);
    R(g, 1, 9, 14, 3, b); R(g, 1, 9, 14, 1, l); R(g, 1, 23, 14, 2, d);
    return out(c);
  });
  S.glassCase = m(function () {
    const c = G.canvas(16, 28), g = c.g;
    R(g, 2, 17, 12, 10, '#7a4f2a'); R(g, 2, 17, 12, 2, '#a8743f');
    R(g, 2, 3, 12, 14, 'rgba(207,232,240,0.55)'); R(g, 2, 2, 12, 1, '#c9a050'); R(g, 2, 3, 1, 14, '#c9a050'); R(g, 13, 3, 1, 14, '#c9a050');
    P(g, 4, 5, '#ffffff'); P(g, 4, 6, '#ffffff'); P(g, 5, 4, '#ffffff');
    return out(c);
  });
  S.rope = m(function () {
    const c = G.canvas(16, 18), g = c.g;
    R(g, 1, 4, 2, 13, '#c9a050'); R(g, 13, 4, 2, 13, '#c9a050'); O(g, 0, 2, 4, 3, '#f2c14e'); O(g, 12, 2, 4, 3, '#f2c14e');
    for (let x = 3; x < 13; x++) { const y = 6 + Math.round(Math.sin((x - 3) / 10 * Math.PI) * 2); R(g, x, y, 1, 2, '#c8352e'); }
    R(g, 0, 16, 4, 1, '#8a7030'); R(g, 12, 16, 4, 1, '#8a7030');
    return out(c);
  });
  S.desk = m(function () {
    const c = G.canvas(48, 26), g = c.g;
    R(g, 1, 6, 46, 18, '#7a4f2a'); R(g, 1, 6, 46, 3, '#a8743f'); R(g, 4, 11, 40, 10, '#8d5d32'); R(g, 6, 13, 36, 6, '#6e4422');
    R(g, 6, 2, 8, 5, '#3d7fd9'); R(g, 7, 1, 6, 1, '#e8d6b0'); R(g, 16, 3, 7, 4, '#c8553d');
    R(g, 36, 0, 2, 7, '#5a5260'); R(g, 33, 0, 7, 2, '#3f8a5a');
    return out(c);
  });
  S.painting = m(function (v) {
    const c = G.canvas(16, 14), g = c.g;
    R(g, 0, 0, 16, 14, '#c9a050'); R(g, 1, 1, 14, 12, '#a07a30');
    R(g, 2, 2, 12, 10, v % 2 ? '#8fc3e0' : '#e8c88a');
    if (v % 2) { O(g, 2, 7, 12, 8, '#5fa645'); O(g, 9, 3, 3, 3, '#fff2a0'); } else { tri(g, 8, 4, 7, 0.5, 5, '#a8a090'); R(g, 7, 6, 2, 4, '#3b3540'); }
    return c;
  });
  S.window = m(function () {
    const c = G.canvas(16, 16), g = c.g;
    R(g, 1, 1, 14, 13, '#7a4f2a'); R(g, 2, 2, 12, 11, '#8fc3e0'); R(g, 2, 2, 12, 4, '#b8dcf0');
    R(g, 7, 2, 2, 11, '#7a4f2a'); R(g, 2, 7, 12, 1, '#7a4f2a'); R(g, 0, 13, 16, 2, '#a8743f');
    R(g, 1, 1, 3, 12, '#c8553d'); R(g, 12, 1, 3, 12, '#c8553d');
    return c;
  });
  S.partition = m(function () {
    const c = G.canvas(16, 34), g = c.g;
    R(g, 1, 2, 14, 31, '#b8844f'); for (let y = 2; y < 33; y += 5) R(g, 1, y, 14, 1, '#8a5a30');
    L(g, 2, 4, 13, 30, '#7a4f2a'); L(g, 13, 4, 2, 30, '#7a4f2a');
    return out(c);
  });
  S.workbench = m(function () { return S.cleanTable(0); });
  S.lab = m(function () {
    const c = G.canvas(32, 28), g = c.g;
    R(g, 1, 8, 30, 10, '#c8d0d8'); R(g, 1, 8, 30, 2, '#e8eef2'); R(g, 3, 18, 3, 9, '#5a5260'); R(g, 26, 18, 3, 9, '#5a5260');
    R(g, 5, 0, 4, 9, '#3b3540'); O(g, 4, 6, 6, 3, '#5a5260'); R(g, 6, 1, 2, 2, '#bfe8ff');
    R(g, 14, 3, 3, 6, '#bfe8ff'); R(g, 14, 6, 3, 3, '#9b4fd1'); R(g, 20, 4, 4, 5, '#bfe8ff'); R(g, 20, 7, 4, 2, '#58d0c8');
    return out(c);
  });
  S.doormat = m(function () {
    const c = G.canvas(16, 10), g = c.g;
    R(g, 1, 1, 14, 8, '#a8453a'); R(g, 2, 2, 12, 6, '#c8655a'); R(g, 3, 4, 10, 1, '#f2c14e');
    return c;
  });
  S.rug = m(function (col, w, h) {
    const c = G.canvas(w, h), g = c.g;
    R(g, 0, 0, w, h, G.dk(col, 0.25)); R(g, 2, 2, w - 4, h - 4, col); R(g, 4, 4, w - 8, h - 8, G.lt(col, 0.15)); R(g, 6, 6, w - 12, h - 12, col);
    for (let x = 8; x < w - 8; x += 6) { P(g, x, h / 2 | 0, '#f2c14e'); P(g, x + 1, (h / 2 | 0) - 1, '#f2c14e'); P(g, x + 1, (h / 2 | 0) + 1, '#f2c14e'); P(g, x + 2, h / 2 | 0, '#f2c14e'); }
    return c;
  });
  S.shelfSign = m(function (col) {
    const c = G.canvas(16, 20), g = c.g;
    R(g, 7, 9, 2, 10, '#7a4f2a'); R(g, 1, 2, 14, 8, col); R(g, 2, 3, 12, 6, G.lt(col, 0.4)); R(g, 4, 5, 8, 1, G.dk(col, 0.3)); R(g, 4, 7, 6, 1, G.dk(col, 0.3));
    return out(c);
  });

  AK.Spr = S;
})();
