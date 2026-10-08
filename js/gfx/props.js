// Ek dünya nesneleri ve mobilyalar (v2): kasabayı canlandıran ayrıntılar.
(function () {
  const G = AK.Gfx, U = AK.U, R = G.rect, P = G.px, O = G.oval, L = G.line;
  const out = c => G.outline(c);
  const m = G.memo;
  const SH = a => `rgba(28,14,38,${a})`;
  const S = AK.Spr;

  // ---------------- ağaçlar (hacimli) ----------------
  const LEAF = [
    { d: '#3f8a36', b: '#5fb04a', l: '#8fd067', x: '#b8e88a' },
    { d: '#2f7a2e', b: '#4a9e3c', l: '#6fbf52', x: '#9bd870' },
    { d: '#a8501c', b: '#d8822a', l: '#f2b04a', x: '#ffd27a' },
    { d: '#8a3420', b: '#c04a2a', l: '#e8783e', x: '#f8a868' },
  ];
  S.oak = m(function (s, v) {
    const c = G.canvas(36, 50), g = c.g, r = G.rnd('oak2', s, v);
    const tr = '#7a4f2e', trd = '#4e3020', trl = '#9a6a44';
    R(g, 15, 28, 7, 20, tr); R(g, 15, 28, 2, 20, trl); R(g, 20, 28, 2, 20, trd);
    R(g, 12, 46, 4, 2, tr); R(g, 21, 46, 4, 2, trd); P(g, 11, 47, tr); P(g, 25, 47, trd);
    for (let i = 0; i < 4; i++) P(g, 17 + (i % 2), 32 + i * 4, trd);
    if (s === 3) {
      L(g, 18, 30, 8, 13, tr); L(g, 18, 30, 9, 14, trd); L(g, 18, 29, 28, 12, tr); L(g, 19, 29, 28, 13, trd);
      L(g, 17, 24, 12, 4, tr); L(g, 19, 22, 23, 2, tr); L(g, 11, 17, 4, 10, trd); L(g, 25, 15, 32, 8, trd); L(g, 13, 8, 9, 2, trd);
      for (const [x, y] of [[8, 12], [9, 12], [27, 10], [28, 10], [12, 3], [13, 3], [22, 1], [4, 9], [31, 7], [17, 21], [18, 20]]) { P(g, x, y, '#ffffff'); P(g, x + 1, y, '#e8f0f4'); }
      return out(c);
    }
    const p = s === 2 ? LEAF[2 + (v % 2)] : LEAF[s];
    // gövdenin üstünde kümeler: önce gölge kümeleri, sonra ana, sonra ışık
    const clusters = [[2, 14, 16, 15], [18, 13, 16, 16], [7, 4, 22, 18], [4, 22, 13, 11], [19, 21, 14, 12], [10, 17, 17, 14]];
    for (const [x, y, w, h] of clusters) O(g, x, y + 2, w, h, p.d);
    for (const [x, y, w, h] of clusters) O(g, x, y, w - 1, h - 2, p.b);
    for (const [x, y, w, h] of clusters) { O(g, x + 2, y + 1, (w * 0.5) | 0, (h * 0.4) | 0, p.l); P(g, x + 4, y + 2, p.x); }
    for (let i = 0; i < 70; i++) { const x = 3 + r() * 30, y = 3 + r() * 30; if (g.getImageData(x | 0, y | 0, 1, 1).data[3] > 0) P(g, x | 0, y | 0, r() < 0.6 ? p.d : p.l); }
    if (s === 0) for (let i = 0; i < 26; i++) { const x = 3 + r() * 30, y = 3 + r() * 28; if (g.getImageData(x | 0, y | 0, 1, 1).data[3] > 0) P(g, x | 0, y | 0, r() < 0.7 ? '#f7b6cf' : '#ffffff'); }
    if (s === 1 && v % 3 === 0) for (let i = 0; i < 8; i++) { const x = 5 + r() * 26, y = 8 + r() * 22; if (g.getImageData(x | 0, y | 0, 1, 1).data[3] > 0) { P(g, x | 0, y | 0, '#d8352e'); P(g, (x | 0) + 1, y | 0, '#a82a22'); } }
    return out(c);
  });
  S.treeShadow = m(function (w) { const c = G.canvas(w, 10); O(c.g, 0, 0, w, 10, SH(0.22)); O(c.g, 4, 2, w - 8, 6, SH(0.12)); return c; });

  // ---------------- kasaba eşyaları ----------------
  S.well = m(function (s) {
    const c = G.canvas(32, 40), g = c.g;
    O(g, 2, 24, 28, 14, '#8a8274'); O(g, 2, 22, 28, 12, '#a9a193'); O(g, 6, 24, 20, 7, '#2a3a4a'); O(g, 8, 25, 16, 4, '#3a5a7a');
    for (let x = 4; x < 28; x += 6) R(g, x, 30, 1, 5, '#77706a');
    R(g, 4, 6, 3, 22, '#7a4f2a'); R(g, 25, 6, 3, 22, '#5a3820'); R(g, 4, 6, 1, 22, '#9a6a44');
    G.poly(g, [[0, 9], [16, 1], [32, 9], [32, 12], [0, 12]], '#a8453a');
    G.poly(g, [[16, 1], [32, 9], [32, 12], [16, 12]], '#7a3028');
    if (s === 3) R(g, 1, 7, 30, 2, '#f4f8fa');
    R(g, 7, 13, 18, 2, '#5a3820'); R(g, 15, 15, 1, 8, '#c8b48a'); R(g, 13, 22, 5, 4, '#8a5a30');
    return out(c);
  });
  S.cart = m(function (load) {
    const c = G.canvas(40, 30), g = c.g;
    R(g, 4, 10, 30, 10, '#a8743f'); R(g, 4, 10, 30, 2, '#c8955a'); for (let x = 8; x < 34; x += 6) R(g, x, 12, 1, 8, '#7a4f2a');
    R(g, 34, 15, 6, 2, '#7a4f2a');
    if (load === 'hay') { O(g, 3, 1, 32, 14, '#d8b84a'); for (let i = 0; i < 12; i++) L(g, 6 + i * 2, 4, 8 + i * 2, 10, '#b8962e'); }
    else { for (let i = 0; i < 4; i++) { R(g, 6 + i * 7, 4, 6, 6, ['#c46a3c', '#e8d6b0', '#3d7fd9', '#4f9a45'][i]); R(g, 6 + i * 7, 4, 6, 1, '#fff6e0'); } }
    for (const wx of [6, 26]) { O(g, wx, 17, 12, 12, '#5a3820'); O(g, wx + 2, 19, 8, 8, '#8a5a30'); P(g, wx + 5, 22, '#3b2416'); L(g, wx + 2, 23, wx + 9, 23, '#5a3820'); L(g, wx + 6, 19, wx + 6, 26, '#5a3820'); }
    return out(c);
  });
  S.hay = m(function () {
    const c = G.canvas(20, 18), g = c.g;
    O(g, 1, 2, 18, 15, '#c8a43a'); O(g, 2, 2, 16, 12, '#e0c050'); for (let i = 0; i < 8; i++) L(g, 3 + i * 2, 4, 4 + i * 2, 12, '#b8942a');
    R(g, 1, 8, 18, 1, '#8a5a30');
    return out(c);
  });
  S.anvil = m(function () {
    const c = G.canvas(20, 16), g = c.g;
    R(g, 6, 9, 8, 6, '#6a4428'); R(g, 6, 9, 2, 6, '#8a5a3a');
    R(g, 2, 3, 15, 4, '#4a4a56'); R(g, 2, 3, 15, 1, '#8a8a96'); R(g, 0, 4, 3, 2, '#4a4a56'); R(g, 7, 7, 6, 2, '#3b3b46');
    return out(c);
  });
  S.grindstone = m(function () {
    const c = G.canvas(18, 20), g = c.g;
    R(g, 3, 10, 2, 9, '#6a4428'); R(g, 13, 10, 2, 9, '#6a4428'); R(g, 2, 16, 14, 2, '#7a4f2a');
    O(g, 3, 1, 12, 14, '#8a8274'); O(g, 4, 2, 10, 12, '#a9a193'); O(g, 7, 6, 4, 4, '#77706a'); R(g, 15, 7, 3, 1, '#5a3820');
    return out(c);
  });
  S.firewood = m(function () {
    const c = G.canvas(24, 16), g = c.g;
    for (let row = 0; row < 3; row++) for (let i = 0; i < 4 - row; i++) { const x = 2 + i * 5 + row * 2.5 | 0, y = 10 - row * 4; O(g, x, y, 5, 5, '#c8a06a'); O(g, x + 1, y + 1, 3, 3, '#a8804e'); P(g, x + 2, y + 2, '#7a4f2a'); }
    return out(c);
  });
  S.laundry = m(function () {
    const c = G.canvas(48, 26), g = c.g;
    R(g, 1, 4, 2, 21, '#7a4f2a'); R(g, 45, 4, 2, 21, '#5a3820');
    for (let x = 3; x < 45; x++) P(g, x, 5 + Math.round(Math.sin((x - 3) / 42 * Math.PI) * 2), '#e8e0d0');
    const cl = [[8, '#e85a7a', 9, 10], [19, '#ffffff', 8, 12], [29, '#3d7fd9', 10, 9], [39, '#f2c14e', 5, 7]];
    for (const [x, col, w, h] of cl) { const y = 6 + Math.round(Math.sin((x - 3) / 42 * Math.PI) * 2); R(g, x, y, w, h, col); R(g, x + w - 1, y, 1, h, G.dk(col, 0.2)); R(g, x, y, w, 1, G.lt(col, 0.3)); }
    return out(c);
  });
  S.flowerpot = m(function (v, s) {
    const c = G.canvas(14, 16), g = c.g;
    R(g, 3, 9, 8, 6, '#c46a3c'); R(g, 2, 8, 10, 2, '#d8865a'); R(g, 3, 14, 8, 1, '#8f4524'); R(g, 9, 9, 2, 6, '#a85a30');
    if (s === 3) { R(g, 4, 6, 6, 3, '#6a5a4a'); return out(c); }
    O(g, 2, 1, 10, 8, '#4f9a45'); O(g, 3, 1, 5, 4, '#7cc45a');
    const fc = ['#e85a7a', '#fff27a', '#c890f0', '#ff8a5c'][v % 4];
    for (const [x, y] of [[4, 2], [8, 3], [6, 5], [10, 6]]) { P(g, x, y, fc); P(g, x + 1, y, G.lt(fc, 0.3)); }
    return out(c);
  });
  S.planter = m(function (full, s) {
    const c = G.canvas(32, 18), g = c.g;
    R(g, 1, 8, 30, 9, '#a89e8c'); R(g, 1, 8, 30, 2, '#c8c0b0'); R(g, 1, 15, 30, 2, '#857c70'); R(g, 3, 9, 26, 3, '#5a3a22');
    if (!full) { for (const x of [7, 16, 24]) { L(g, x, 9, x - 1, 4, '#8a7050'); L(g, x, 9, x + 2, 5, '#8a7050'); } return out(c); }
    if (s === 3) { R(g, 3, 6, 26, 3, '#f4f8fa'); return out(c); }
    const pal = [['#f7a8c4', '#ffffff', '#fff27a'], ['#ff8a5c', '#ffd54a', '#e85a5a'], ['#e0782e', '#c9452e', '#f2c14e'], ['#bfe8ff']][s];
    O(g, 2, 2, 28, 9, '#4f9a45'); O(g, 3, 2, 26, 5, '#6fb04a');
    for (let x = 4; x < 28; x += 3) { const col = pal[(x / 3 | 0) % pal.length]; P(g, x, 3 + (x % 2) * 2, col); P(g, x + 1, 3 + (x % 2) * 2, col); P(g, x, 2 + (x % 2) * 2, G.lt(col, 0.4)); }
    return out(c);
  });
  S.umbrellaTable = m(function (col) {
    const c = G.canvas(32, 40), g = c.g;
    O(g, 6, 24, 20, 8, '#c8955a'); O(g, 6, 23, 20, 6, '#e0b07a'); R(g, 15, 28, 2, 10, '#7a4f2a'); R(g, 11, 37, 10, 2, '#5a3820');
    R(g, 15, 8, 2, 17, '#e8e0d0');
    G.poly(g, [[1, 13], [16, 2], [31, 13], [31, 15], [1, 15]], col);
    G.poly(g, [[16, 2], [31, 13], [31, 15], [16, 15]], G.dk(col, 0.22));
    for (let x = 3; x < 30; x += 7) { O(g, x, 13, 7, 4, x % 14 === 3 ? '#fff6e0' : col); }
    for (const cx of [2, 26]) { R(g, cx, 26, 4, 3, '#a8743f'); R(g, cx, 29, 1, 6, '#7a4f2a'); R(g, cx + 3, 29, 1, 6, '#7a4f2a'); R(g, cx, 21, 1, 5, '#7a4f2a'); }
    return out(c);
  });
  S.picnic = m(function () {
    const c = G.canvas(36, 24), g = c.g;
    R(g, 2, 15, 32, 3, '#a8743f'); R(g, 2, 15, 32, 1, '#c8955a');
    R(g, 4, 6, 28, 7, '#b8844f'); R(g, 4, 6, 28, 2, '#d8a46a'); for (let x = 9; x < 32; x += 6) R(g, x, 8, 1, 5, '#8a5a30');
    R(g, 6, 13, 2, 9, '#7a4f2a'); R(g, 28, 13, 2, 9, '#7a4f2a');
    R(g, 10, 3, 6, 4, '#c8553d'); R(g, 10, 3, 6, 1, '#e07a5f'); O(g, 20, 3, 6, 4, '#f2c14e');
    return out(c);
  });
  S.rowboat = m(function () {
    const c = G.canvas(40, 18), g = c.g;
    for (let j = 0; j < 12; j++) { const half = 18 - Math.abs(j - 4) * (j < 4 ? 1.5 : 1.2); R(g, 20 - half, 3 + j, half * 2, 1, j < 3 ? '#c8955a' : j < 8 ? '#a8743f' : '#7a4f2a'); }
    O(g, 6, 3, 28, 7, '#5a3820'); O(g, 8, 4, 24, 5, '#7a4f2a'); R(g, 12, 5, 2, 4, '#c8955a'); R(g, 26, 5, 2, 4, '#c8955a');
    R(g, 3, 12, 34, 2, '#e8e0d0');
    L(g, 15, 6, 4, 16, '#c8b48a'); L(g, 25, 6, 36, 16, '#c8b48a');
    return out(c);
  });
  S.duck = m(function (f, dir) {
    const c = G.canvas(12, 10), g = c.g;
    O(g, 1, 3, 9, 6, '#f6f0e4'); O(g, 6, 0, 5, 5, '#3f8a36'); P(g, 8, 1, '#ffffff'); P(g, 9, 2, '#1e1218'); R(g, 10, 2, 2, 1, '#f2a02a');
    R(g, 1, 4 + (f % 2), 3, 2, '#e0d8c8');
    R(g, 0, 8, 12, 1, 'rgba(180,220,255,0.7)');
    const o = out(c);
    return dir < 0 ? G.flip(o) : o;
  });
  S.crops = m(function (s, v) {
    const c = G.canvas(16, 16), g = c.g;
    R(g, 0, 10, 16, 4, '#6e4426'); R(g, 0, 10, 16, 1, '#8b5a36'); R(g, 0, 13, 16, 1, '#5a3820');
    if (s === 3) { for (let x = 2; x < 16; x += 5) R(g, x, 9, 2, 1, '#f4f8fa'); return c; }
    for (let x = 2; x < 16; x += 5) {
      if (s === 0) { R(g, x + 1, 6, 1, 4, '#4f9a45'); P(g, x, 6, '#7cc45a'); P(g, x + 2, 7, '#7cc45a'); }
      else if (s === 1) { R(g, x + 1, 2, 1, 8, '#3f8a36'); O(g, x - 1, 3, 4, 5, '#4f9a45'); P(g, x, 5, v % 2 ? '#d8352e' : '#f2c14e'); P(g, x + 2, 7, v % 2 ? '#d8352e' : '#f2c14e'); }
      else { O(g, x - 1, 5, 5, 5, '#e8822a'); R(g, x + 1, 4, 1, 2, '#4f7a2a'); P(g, x, 6, '#f2b04a'); }
    }
    return c;
  });
  S.fence = m(function (kind, s) {
    // kind: h (yatay parça), p (tek direk), g (kapı)
    const c = G.canvas(16, 20), g = c.g;
    const wd = '#c8955a', wl = '#e0b07a', wdk = '#8a5a30';
    if (kind !== 'p') { R(g, 0, 8, 16, 3, wd); R(g, 0, 8, 16, 1, wl); R(g, 0, 10, 16, 1, wdk); R(g, 0, 14, 16, 3, wd); R(g, 0, 14, 16, 1, wl); R(g, 0, 16, 16, 1, wdk); }
    R(g, 1, 4, 4, 15, '#b07a45'); R(g, 1, 4, 1, 15, wl); R(g, 4, 4, 1, 15, wdk); P(g, 2, 3, '#b07a45'); P(g, 3, 3, '#b07a45');
    if (s === 3) { R(g, 1, 3, 4, 1, '#ffffff'); if (kind !== 'p') R(g, 0, 7, 16, 1, '#ffffff'); }
    return out(c);
  });
  S.crates = m(function (v) {
    const c = G.canvas(24, 26), g = c.g;
    const box = (x, y, w, h, col) => { R(g, x, y, w, h, col); R(g, x, y, w, 2, G.lt(col, 0.25)); R(g, x, y, 1, h, G.lt(col, 0.15)); R(g, x + w - 1, y, 1, h, G.dk(col, 0.3)); L(g, x + 1, y + 2, x + w - 2, y + h - 1, G.dk(col, 0.25)); R(g, x, y + h - 1, w, 1, G.dk(col, 0.35)); };
    box(1, 12, 13, 13, '#b8844f'); box(12, 14, 11, 11, '#a8743f');
    if (v % 2 === 0) box(5, 2, 11, 11, '#c8955a'); else { O(g, 6, 3, 10, 10, '#d8c49a'); R(g, 9, 2, 4, 3, '#b8a476'); }
    return out(c);
  });
  S.sacks = m(function () {
    const c = G.canvas(22, 16), g = c.g;
    for (const [x, y] of [[1, 5], [9, 4], [5, 1]]) { O(g, x, y, 11, 11, '#c8b48a'); O(g, x + 1, y + 1, 7, 6, '#e0cea0'); R(g, x + 4, y, 3, 2, '#8a7650'); }
    return out(c);
  });
  S.amphoraStand = m(function () {
    const c = G.canvas(16, 26), g = c.g;
    R(g, 5, 20, 6, 5, '#7a4f2a'); R(g, 3, 19, 10, 2, '#a8743f');
    R(g, 6, 2, 4, 2, '#8f4524'); R(g, 7, 4, 2, 3, '#c46a3c'); O(g, 3, 6, 10, 12, '#c46a3c'); O(g, 4, 7, 4, 6, '#e39260'); R(g, 4, 10, 8, 1, '#3b2416'); R(g, 3, 4, 1, 4, '#8f4524'); R(g, 12, 4, 1, 4, '#8f4524');
    return out(c);
  });
  S.signpost = m(function (a, b) {
    const c = G.canvas(72, 30), g = c.g;
    R(g, 35, 6, 3, 23, '#7a4f2a'); R(g, 35, 6, 1, 23, '#9a6a44');
    const arrow = (y, txt, right) => {
      const w = G.textW(txt) + 8, x = right ? 37 : 35 - w;
      R(g, x, y, w, 8, '#c8955a'); R(g, x, y, w, 1, '#e0b07a'); R(g, x, y + 7, w, 1, '#8a5a30');
      if (right) { P(g, x + w, y + 3, '#c8955a'); P(g, x + w, y + 4, '#c8955a'); } else { P(g, x - 1, y + 3, '#c8955a'); P(g, x - 1, y + 4, '#c8955a'); }
      G.text(g, txt, x + 4, y + 2, '#3b2416');
    };
    if (a) arrow(3, a, true);
    if (b) arrow(13, b, false);
    return out(c);
  });
  S.clockTower = m(function (s) {
    const c = G.canvas(36, 92), g = c.g;
    const st = '#d8d0c0', sd = '#a89e8c', sl = '#f2ece0';
    R(g, 4, 30, 28, 58, st);
    for (let y = 32; y < 86; y += 6) { R(g, 4, y, 28, 1, sd); for (let x = 4 + ((y / 6) % 2) * 5; x < 32; x += 10) R(g, x, y, 1, 6, sd); }
    R(g, 4, 30, 2, 58, sl); R(g, 27, 30, 5, 58, SH(0.22));
    R(g, 2, 84, 32, 6, '#a89e8c'); R(g, 2, 84, 32, 1, '#c8c0b0');
    R(g, 13, 70, 10, 15, '#3b2a20'); G.oval(g, 13, 66, 10, 8, '#3b2a20'); R(g, 14, 72, 8, 13, '#6a4428');
    R(g, 2, 26, 32, 5, sl); R(g, 2, 30, 32, 1, sd);
    O(g, 8, 36, 20, 20, '#5a4a3a'); O(g, 9, 37, 18, 18, '#fff8ec');
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; P(g, Math.round(18 + Math.cos(a) * 7), Math.round(46 + Math.sin(a) * 7), '#5a4a3a'); }
    R(g, 6, 12, 24, 15, st); R(g, 10, 15, 6, 10, '#2a2030'); R(g, 20, 15, 6, 10, '#2a2030'); O(g, 12, 17, 12, 8, '#c9a050'); R(g, 6, 12, 2, 15, sl); R(g, 25, 12, 5, 15, SH(0.2));
    G.poly(g, [[3, 13], [18, 0], [33, 13]], '#6a3a2e'); G.poly(g, [[18, 0], [33, 13], [20, 13]], '#4a2a22'); G.line(g, 18, 0, 3, 13, '#8a5a4a');
    if (s === 3) { G.poly(g, [[6, 10], [18, 1], [22, 4], [10, 11]], '#f4f8fa'); R(g, 2, 26, 32, 1, '#ffffff'); }
    return out(c);
  });
  S.bridgeRail = m(function () {
    const c = G.canvas(16, 14), g = c.g;
    R(g, 0, 4, 16, 3, '#a8743f'); R(g, 0, 4, 16, 1, '#c8955a'); R(g, 1, 2, 3, 11, '#7a4f2a'); R(g, 1, 2, 1, 11, '#9a6a44');
    return out(c);
  });
  S.lanternPost = m(function () {
    const c = G.canvas(12, 30), g = c.g;
    R(g, 5, 6, 2, 23, '#5a3820'); R(g, 3, 27, 6, 2, '#5a3820'); R(g, 5, 4, 6, 1, '#3b3540');
    R(g, 8, 5, 4, 6, '#3b3540'); R(g, 9, 6, 2, 4, '#ffd27a');
    return out(c);
  });
  S.bookcart = m(function () {
    const c = G.canvas(24, 22), g = c.g;
    R(g, 2, 6, 20, 10, '#7a4f2a'); R(g, 2, 6, 20, 1, '#a8743f');
    const cols = ['#c8553d', '#3d7fd9', '#4f9a45', '#f2c14e', '#9b4fd1'];
    for (let i = 0; i < 6; i++) R(g, 3 + i * 3, 1 + (i % 2), 2, 5 - (i % 2), cols[i % 5]);
    O(g, 3, 15, 6, 6, '#3b3540'); O(g, 15, 15, 6, 6, '#3b3540');
    return out(c);
  });
  S.dock = m(function (len) {
    const c = G.canvas(16, len * 16), g = c.g;
    for (let y = 0; y < len * 16; y += 4) { R(g, 1, y, 14, 3, y % 8 ? '#a8743f' : '#b8844f'); R(g, 1, y + 3, 14, 1, '#6a4428'); }
    R(g, 0, 0, 1, len * 16, '#5a3820'); R(g, 15, 0, 1, len * 16, '#5a3820');
    return c;
  });
  S.scarecrow = m(function () {
    const c = G.canvas(20, 32), g = c.g;
    R(g, 9, 10, 2, 21, '#7a4f2a'); R(g, 2, 13, 16, 2, '#7a4f2a');
    R(g, 6, 12, 8, 10, '#3d7fd9'); R(g, 6, 15, 8, 1, '#2a5a9a');
    O(g, 6, 3, 8, 8, '#e8c88a'); P(g, 8, 6, '#2a1a24'); P(g, 11, 6, '#2a1a24');
    R(g, 4, 2, 12, 2, '#a8743f'); R(g, 6, 0, 8, 3, '#c8955a');
    for (const x of [2, 17]) L(g, x, 15, x + (x < 10 ? -1 : 1), 18, '#e0c050');
    return out(c);
  });

  // ---------------- iç mekân ----------------
  S.fireplace = m(function (f) {
    const c = G.canvas(32, 40), g = c.g;
    R(g, 1, 4, 30, 35, '#8a8274'); for (let y = 6; y < 38; y += 5) for (let x = 1 + ((y / 5) % 2) * 4; x < 31; x += 8) { R(g, x, y, 7, 4, '#a9a193'); R(g, x, y, 7, 1, '#c8c0b0'); }
    R(g, 0, 2, 32, 4, '#7a4f2a'); R(g, 0, 2, 32, 1, '#a8743f');
    R(g, 7, 18, 18, 18, '#2a1a1a'); G.oval(g, 7, 13, 18, 10, '#2a1a1a');
    L(g, 9, 33, 22, 31, '#7a4f2e'); L(g, 9, 31, 22, 33, '#5a3820');
    const h = [10, 12, 11][f % 3];
    for (let i = 0; i < 3; i++) { const fx = 12 + i * 4; G.oval(g, fx - 2, 32 - h + (i % 2) * 2, 6, h, '#e8702a'); G.oval(g, fx - 1, 34 - h * 0.6, 4, h * 0.6, '#f2c14e'); }
    P(g, 16, 30, '#fff2b0');
    R(g, 4, 0, 6, 3, '#c46a3c'); R(g, 22, 0, 6, 3, '#3d7fd9');
    return out(c);
  });
  S.stove = m(function () {
    const c = G.canvas(16, 26), g = c.g;
    R(g, 1, 8, 14, 17, '#4a4a56'); R(g, 1, 8, 14, 2, '#6a6a76'); R(g, 3, 14, 10, 6, '#2a2a34'); R(g, 4, 15, 8, 4, '#c8452e');
    O(g, 2, 6, 6, 3, '#2a2a34'); O(g, 9, 6, 6, 3, '#2a2a34'); R(g, 10, 1, 4, 5, '#8a8a96'); R(g, 9, 1, 6, 1, '#aaaab6');
    return out(c);
  });
  S.kitchen = m(function () {
    const c = G.canvas(16, 26), g = c.g;
    R(g, 1, 10, 14, 15, '#a8743f'); R(g, 1, 10, 14, 2, '#e8e0d0'); R(g, 3, 14, 10, 9, '#8a5a30'); R(g, 3, 14, 10, 1, '#c8955a'); P(g, 11, 18, '#f2c14e');
    R(g, 3, 5, 3, 5, '#c46a3c'); O(g, 8, 6, 6, 4, '#e8e0d0'); P(g, 10, 7, '#c8452e');
    return out(c);
  });
  S.wallShelf = m(function (v) {
    const c = G.canvas(32, 18), g = c.g;
    R(g, 1, 14, 30, 2, '#8a5a30'); R(g, 1, 14, 30, 1, '#b07a45'); R(g, 3, 16, 2, 2, '#5a3820'); R(g, 27, 16, 2, 2, '#5a3820');
    const items = v % 2 ? ['#c46a3c', '#e8d6b0', '#6f8a8f'] : ['#3d7fd9', '#c46a3c', '#f2c14e'];
    items.forEach((col, i) => { const x = 4 + i * 9; O(g, x, 6, 7, 8, col); R(g, x + 2, 3, 3, 4, G.dk(col, 0.15)); P(g, x + 1, 8, G.lt(col, 0.4)); });
    return out(c);
  });
  S.wallMap = m(function () {
    const c = G.canvas(28, 20), g = c.g;
    R(g, 0, 0, 28, 20, '#7a4f2a'); R(g, 1, 1, 26, 18, '#e8d6a8');
    O(g, 3, 4, 12, 9, '#a8c870'); O(g, 14, 8, 10, 8, '#c8b070'); L(g, 5, 15, 20, 5, '#c8452e'); P(g, 20, 5, '#c8452e'); P(g, 19, 4, '#c8452e'); P(g, 21, 6, '#c8452e');
    R(g, 22, 13, 4, 4, '#3d7fd9');
    return out(c);
  });
  S.chandelier = m(function () {
    const c = G.canvas(32, 18), g = c.g;
    R(g, 15, 0, 2, 6, '#8a7030'); O(g, 4, 6, 24, 6, '#c9a050'); O(g, 6, 7, 20, 3, '#8a7030');
    for (const x of [5, 11, 20, 26]) { R(g, x, 3, 2, 4, '#fff6e0'); P(g, x, 1, '#ffd27a'); P(g, x + 1, 2, '#ffe8a0'); }
    return out(c);
  });
  S.runner = m(function (w, h, col) {
    const c = G.canvas(w, h), g = c.g;
    R(g, 0, 0, w, h, G.dk(col, 0.25)); R(g, 2, 0, w - 4, h, col);
    for (let y = 4; y < h; y += 8) { P(g, (w >> 1) - 1, y, '#f2c14e'); P(g, w >> 1, y + 1, '#f2c14e'); P(g, (w >> 1) - 2, y + 1, '#f2c14e'); P(g, (w >> 1) - 1, y + 2, '#f2c14e'); }
    R(g, 3, 0, 1, h, '#f2c14e'); R(g, w - 4, 0, 1, h, '#f2c14e');
    return c;
  });
  S.palm = m(function () {
    const c = G.canvas(20, 34), g = c.g;
    R(g, 6, 24, 8, 9, '#c46a3c'); R(g, 5, 24, 10, 2, '#d8865a'); R(g, 9, 14, 2, 10, '#7a5a3a');
    for (const [dx, dy] of [[-8, -2], [-6, -8], [0, -12], [6, -8], [8, -2]]) { L(g, 10, 15, 10 + dx, 15 + dy, '#3f8a3a'); L(g, 10, 16, 10 + dx, 16 + dy, '#2a6a2a'); }
    O(g, 7, 12, 6, 5, '#4f9a45');
    return out(c);
  });
  S.banner2 = m(function (col, k) {
    const c = G.canvas(14, 24), g = c.g;
    R(g, 0, 0, 14, 2, '#c9a050'); R(g, 1, 2, 12, 18, col); R(g, 1, 2, 12, 1, G.lt(col, 0.3)); R(g, 12, 2, 1, 18, G.dk(col, 0.3));
    G.poly(g, [[1, 20], [13, 20], [7, 23]], col);
    G.text(g, k, 6 - (k.length > 1 ? 2 : 0), 9, '#f2c14e');
    return out(c);
  });
  S.windowBig = m(function () {
    const c = G.canvas(24, 20), g = c.g;
    R(g, 0, 0, 24, 20, '#7a4f2a'); R(g, 2, 2, 20, 14, '#a8d8f0'); R(g, 2, 2, 20, 5, '#c8e8f8'); R(g, 11, 2, 2, 14, '#7a4f2a'); R(g, 2, 8, 20, 2, '#7a4f2a');
    R(g, 0, 16, 24, 3, '#a8743f'); R(g, 0, 16, 24, 1, '#c8955a');
    R(g, 1, 1, 4, 15, '#c8553d'); R(g, 19, 1, 4, 15, '#c8553d');
    return c;
  });
})();
