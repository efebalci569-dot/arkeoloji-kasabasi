// Doğu Mahallesi, Fener Bar, çiçekçi ve yeni evler için nesneler (hepsi kodla çizilir).
(function () {
  const G = AK.Gfx, R = G.rect, P = G.px, O = G.oval, L = G.line;
  const out = c => G.outline(c);
  const m = G.memo;
  const S = AK.Spr;
  const FLW = ['#e85a7a', '#fff27a', '#c890f0', '#ff8a5c', '#ffffff', '#f2a8c0', '#6aa8f0'];

  // ---------------- dış mekân ----------------
  S.easel = m(function (s) {
    const c = G.canvas(20, 32), g = c.g, wd = '#9a6a3e';
    L(g, 10, 2, 3, 31, wd); L(g, 10, 2, 17, 31, G.dk(wd, 0.2)); L(g, 10, 6, 10, 30, G.dk(wd, 0.3));
    R(g, 3, 20, 15, 2, wd);
    R(g, 2, 5, 16, 15, '#fff6e0'); R(g, 3, 6, 14, 13, '#bfe4f0');
    R(g, 3, 6, 14, 5, s === 3 ? '#d8e0e8' : '#8fc8f0'); O(g, 12, 7, 4, 3, '#fff27a');
    R(g, 3, 11, 14, 3, s === 2 ? '#d8822a' : s === 3 ? '#f4f8fa' : '#5fa645');
    O(g, 5, 14, 10, 4, '#3d7fd9'); P(g, 8, 15, '#bfe8ff'); P(g, 4, 12, '#e85a7a'); P(g, 15, 12, '#fff27a');
    R(g, 2, 5, 16, 1, '#e8dcc0');
    return out(c);
  });
  S.pump = m(function (s) {
    const c = G.canvas(22, 28), g = c.g;
    O(g, 1, 17, 20, 10, '#8a8274'); O(g, 2, 17, 18, 7, '#a9a193'); O(g, 4, 18, 14, 5, s === 3 ? '#d8eef8' : '#4f8ab8'); P(g, 7, 19, '#bfe8ff');
    R(g, 9, 3, 4, 16, '#3f5a52'); R(g, 9, 3, 1, 16, '#5f7a72'); R(g, 8, 1, 6, 3, '#2f4a42'); P(g, 10, 0, '#c9a050');
    R(g, 13, 7, 5, 2, '#3f5a52'); R(g, 16, 9, 2, 2, '#2f4a42');
    L(g, 9, 5, 3, 1, '#2f4a42'); O(g, 1, 0, 3, 3, '#c9a050');
    if (s === 3) { P(g, 16, 11, '#e8f8ff'); P(g, 17, 12, '#e8f8ff'); } else { P(g, 17, 12, '#7cc0ee'); P(g, 17, 14, '#7cc0ee'); P(g, 16, 16, '#7cc0ee'); }
    return out(c);
  });
  S.flowerBed = m(function (v, s) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('fbed', v, s);
    R(g, 0, 2, 16, 13, '#6a4428'); R(g, 0, 2, 16, 1, '#8a5a3a'); R(g, 0, 14, 16, 1, '#4a2e1c');
    if (s === 3) { for (let i = 0; i < 18; i++) P(g, (r() * 16) | 0, 3 + ((r() * 11) | 0), '#f4f8fa'); return c; }
    for (let row = 0; row < 3; row++) for (let i = 0; i < 4; i++) {
      const x = 1 + i * 4 + (row % 2), y = 4 + row * 4;
      R(g, x + 1, y + 1, 1, 3, '#3f8a36'); P(g, x, y + 2, '#5fb04a'); P(g, x + 2, y + 2, '#5fb04a');
      const col = s === 2 ? ['#d8822a', '#c04a2a', '#f2c14e'][(v + i + row) % 3] : FLW[(v + i * 2 + row) % FLW.length];
      R(g, x, y, 3, 2, col); P(g, x + 1, y, G.lt(col, 0.4)); P(g, x + 1, y + 1, '#f2c14e');
    }
    return c;
  });
  S.netRack = m(function () {
    const c = G.canvas(22, 28), g = c.g;
    R(g, 2, 4, 2, 23, '#7a4f2a'); R(g, 18, 4, 2, 23, '#5a3820'); R(g, 1, 3, 20, 2, '#8a5a30');
    for (let x = 4; x < 18; x += 2) L(g, x, 5, x + 1, 20 - Math.abs(x - 11), '#c8b48a');
    for (let y = 7; y < 20; y += 3) L(g, 4, y, 17, y + 1, '#a8946a');
    O(g, 9, 14, 5, 5, '#e8553d'); P(g, 10, 15, '#ffb0a0');
    return out(c);
  });
  S.swing = m(function () {
    const c = G.canvas(50, 36), g = c.g, wd = '#9a6a3e';
    L(g, 6, 2, 1, 35, wd); L(g, 6, 2, 11, 35, G.dk(wd, 0.2)); L(g, 44, 2, 39, 35, wd); L(g, 44, 2, 49, 35, G.dk(wd, 0.2));
    R(g, 4, 1, 42, 3, '#7a4f2a'); R(g, 4, 1, 42, 1, '#a8743f');
    for (const x of [18, 32]) { R(g, x, 4, 1, 20, '#d8c8a0'); R(g, x + 6, 4, 1, 20, '#d8c8a0'); R(g, x - 1, 23, 9, 3, '#c8553d'); R(g, x - 1, 23, 9, 1, '#e8857a'); }
    return out(c);
  });
  S.anchor = m(function () {
    const c = G.canvas(20, 24), g = c.g, col = '#6a5a5a';
    O(g, 7, 1, 6, 6, col); g.clearRect(9, 3, 2, 2); R(g, 9, 6, 2, 14, col); R(g, 5, 8, 10, 2, col);
    for (let i = 0; i < 8; i++) { P(g, 2 + i, 15 + Math.round(Math.sin(i / 7 * Math.PI) * 3), col); P(g, 17 - i, 15 + Math.round(Math.sin(i / 7 * Math.PI) * 3), col); }
    L(g, 1, 13, 4, 18, col); L(g, 18, 13, 15, 18, col); R(g, 7, 19, 6, 3, col);
    P(g, 10, 10, '#a8603a'); P(g, 6, 16, '#a8603a'); P(g, 9, 14, '#8a7a7a');
    return out(c);
  });
  S.flowerCart = m(function (s) {
    const c = G.canvas(40, 32), g = c.g;
    R(g, 4, 14, 30, 8, '#4f7a45'); R(g, 4, 14, 30, 2, '#6f9a5a'); R(g, 34, 17, 6, 2, '#3f5a35');
    for (let i = 0; i < 4; i++) {
      const x = 5 + i * 7; R(g, x, 9, 6, 6, '#a8b0b8'); R(g, x, 9, 6, 1, '#d8e0e8');
      if (s === 3) { R(g, x + 1, 7, 4, 2, '#f4f8fa'); continue; }
      for (let k = 0; k < 4; k++) { const col = FLW[(i * 2 + k) % FLW.length]; R(g, x + (k % 2) * 3, 3 + ((k / 2) | 0) * 3, 3, 3, col); P(g, x + 1 + (k % 2) * 3, 4 + ((k / 2) | 0) * 3, G.lt(col, 0.4)); }
      L(g, x + 2, 8, x + 2, 6, '#3f8a36');
    }
    for (const wx of [6, 24]) { O(g, wx, 19, 12, 12, '#5a3820'); O(g, wx + 2, 21, 8, 8, '#8a5a30'); P(g, wx + 5, 24, '#3b2416'); }
    return out(c);
  });

  // ---------------- bar ----------------
  S.barCounter = m(function (w) {
    const W2 = w * 16, c = G.canvas(W2, 30), g = c.g, col = '#4a2a22', top = '#8a5a3a';
    R(g, 0, 11, W2, 18, col);
    for (let x = 3; x < W2 - 3; x += 12) { R(g, x, 15, 10, 11, G.dk(col, 0.2)); R(g, x + 1, 16, 8, 9, G.lt(col, 0.05)); }
    R(g, 0, 25, W2, 2, '#c9a050'); R(g, 0, 25, W2, 1, '#f2d27a');
    R(g, 0, 7, W2, 5, top); R(g, 0, 7, W2, 1, G.lt(top, 0.35)); R(g, 0, 11, W2, 1, G.dk(top, 0.4));
    // biralık musluklar
    for (const x of [8, 14]) { R(g, x, 0, 2, 7, '#c9a050'); R(g, x - 1, 0, 4, 2, '#f2d27a'); R(g, x, 4, 3, 1, '#a87a1e'); }
    // bardaklar
    for (const x of [24, 30, W2 - 22]) { R(g, x, 2, 4, 5, 'rgba(220,240,250,0.85)'); R(g, x, 4, 4, 3, '#e8a83a'); R(g, x, 2, 4, 1, '#ffffff'); }
    O(g, W2 - 14, 3, 9, 4, '#f6f0e4'); P(g, W2 - 11, 4, '#4f9a45'); P(g, W2 - 9, 4, '#e8553d');
    return out(c);
  });
  S.barStool = m(function () {
    const c = G.canvas(14, 20), g = c.g;
    O(g, 1, 1, 12, 6, '#a8353a'); O(g, 2, 1, 10, 3, '#d8555a'); R(g, 6, 6, 2, 12, '#5a5260'); R(g, 3, 13, 8, 1, '#8a8a96'); R(g, 3, 18, 8, 2, '#3b3540');
    return out(c);
  });
  S.jukebox = m(function (f) {
    const c = G.canvas(22, 32), g = c.g;
    O(g, 1, 0, 20, 16, '#7a3a2a'); R(g, 1, 8, 20, 23, '#7a3a2a'); R(g, 1, 8, 2, 23, '#9a5a3a');
    const glow = ['#ff7ab8', '#7ad8ff', '#f2c14e'];
    for (let k = 0; k < 3; k++) { const col = glow[(k + f) % 3]; O(g, 3 + k * 2, 2 + k * 2, 16 - k * 4, 14 - k * 4, col); }
    O(g, 9, 8, 4, 6, '#2a1a24'); R(g, 4, 17, 14, 6, '#2a1a24'); for (let x = 5; x < 17; x += 3) R(g, x, 18, 2, 4, glow[(x + f) % 3]);
    R(g, 4, 24, 14, 5, '#c9a050'); for (let x = 5; x < 17; x += 2) R(g, x, 25, 1, 3, '#7a5a1a');
    return out(c);
  });
  S.stage = m(function (w, h) {
    const c = G.canvas(w * 16, h * 16 + 4), g = c.g;
    R(g, 0, 0, w * 16, h * 16, '#6a4428');
    for (let y = 0; y < h * 16; y += 4) { R(g, 0, y, w * 16, 1, '#5a3820'); for (let x = (y / 4 % 2) * 12; x < w * 16; x += 24) R(g, x, y, 1, 4, '#5a3820'); }
    R(g, 0, 0, w * 16, 1, '#8a5a3a');
    R(g, 0, h * 16, w * 16, 4, '#3b2416'); R(g, 0, h * 16, w * 16, 1, '#c9a050');
    return c;
  });
  S.neon = m(function (txt, col) {
    const tw = G.textW(txt), c = G.canvas(tw + 10, 13), g = c.g;
    R(g, 0, 0, tw + 10, 13, '#2a1a2a'); R(g, 1, 1, tw + 8, 11, '#3a2440');
    G.text(g, txt, 5, 4, G.dk(col, 0.45));
    G.text(g, txt, 5, 3, col);
    R(g, 0, 0, tw + 10, 1, '#c9a050'); R(g, 0, 12, tw + 10, 1, '#8a6a2a');
    return c;
  });
  S.dartboard = m(function () {
    const c = G.canvas(16, 16), g = c.g;
    O(g, 0, 0, 16, 16, '#2a1a24'); O(g, 1, 1, 14, 14, '#e8dcc0'); O(g, 3, 3, 10, 10, '#c8353a'); O(g, 5, 5, 6, 6, '#e8dcc0'); O(g, 6, 6, 4, 4, '#3f8a5a'); P(g, 7, 7, '#c8353a');
    L(g, 10, 5, 13, 2, '#f2c14e'); P(g, 13, 2, '#c8553d');
    return c;
  });
  S.barrelTable = m(function () {
    const c = G.canvas(18, 24), g = c.g;
    O(g, 2, 4, 14, 19, '#8a5a30'); R(g, 2, 9, 14, 2, '#5a5260'); R(g, 2, 17, 14, 2, '#5a5260'); R(g, 4, 6, 2, 15, '#a8743f');
    O(g, 0, 1, 18, 7, '#6a4428'); O(g, 1, 1, 16, 5, '#8a5a3a');
    R(g, 5, 0, 3, 3, 'rgba(220,240,250,0.85)'); R(g, 5, 1, 3, 2, '#e8a83a'); O(g, 10, 1, 5, 3, '#f6f0e4'); P(g, 12, 1, '#c9a050');
    return out(c);
  });
  S.dateTable = m(function () {
    const c = G.canvas(32, 26), g = c.g;
    R(g, 1, 6, 30, 11, '#f6f0e4'); R(g, 1, 6, 30, 1, '#ffffff');
    R(g, 1, 14, 30, 4, '#e8dcd0'); for (let x = 1; x < 31; x += 4) R(g, x, 14, 2, 4, '#a8354a');
    R(g, 3, 18, 3, 8, '#3b2416'); R(g, 26, 18, 3, 8, '#3b2416');
    R(g, 15, 2, 2, 6, '#f6f0e4'); P(g, 15, 0, '#ffd27a'); P(g, 15, 1, '#f2a03a'); R(g, 14, 7, 4, 1, '#c9a050');
    R(g, 21, 4, 3, 4, 'rgba(220,240,250,0.85)'); P(g, 22, 1, '#e8354a'); P(g, 21, 2, '#e8354a'); P(g, 23, 2, '#c8253a'); L(g, 22, 3, 22, 5, '#3f8a36');
    O(g, 4, 8, 8, 4, '#ffffff'); O(g, 5, 9, 6, 2, '#e8b04a'); O(g, 20, 9, 8, 4, '#ffffff'); P(g, 23, 10, '#a8352e');
    return out(c);
  });
  S.guitar = m(function () {
    const c = G.canvas(16, 9), g = c.g;
    R(g, 7, 3, 8, 2, '#5a3820'); R(g, 14, 2, 2, 4, '#3b2416');
    O(g, 0, 0, 9, 9, '#c8783a'); O(g, 1, 1, 7, 7, '#e8a05a'); O(g, 3, 3, 3, 3, '#3b2416'); P(g, 1, 4, '#fff2c8');
    return out(c);
  });
  S.mic = m(function () {
    const c = G.canvas(10, 28), g = c.g;
    R(g, 4, 6, 2, 20, '#5a5260'); R(g, 1, 25, 8, 2, '#3b3540'); O(g, 3, 1, 5, 6, '#8a8a96'); P(g, 4, 2, '#d8d8e0');
    return out(c);
  });
  S.speaker = m(function () {
    const c = G.canvas(16, 22), g = c.g;
    R(g, 1, 1, 14, 20, '#2a2430'); R(g, 1, 1, 14, 1, '#4a4450'); O(g, 3, 3, 10, 9, '#4a4450'); O(g, 6, 6, 4, 3, '#1a1420'); O(g, 5, 13, 6, 6, '#4a4450'); P(g, 7, 15, '#1a1420');
    return out(c);
  });
  S.wallGuitar = m(function () { return G.rot(S.guitar(), 3); });

  // ---------------- çiçekçi ----------------
  S.flowerBucket = m(function (v) {
    const c = G.canvas(16, 20), g = c.g;
    R(g, 3, 11, 10, 8, '#8a9aa8'); R(g, 2, 10, 12, 2, '#c8d4dc'); R(g, 3, 18, 10, 1, '#5a6a78'); R(g, 10, 11, 2, 7, '#6a7a88');
    const kind = v % 4;
    for (let i = 0; i < 6; i++) {
      const x = 2 + (i % 3) * 4, y = 2 + ((i / 3) | 0) * 4;
      L(g, x + 1, y + 3, 7, 10, '#3f8a36');
      const col = kind === 0 ? '#e8354a' : kind === 1 ? '#ffffff' : kind === 2 ? '#c890f0' : FLW[(i + v) % FLW.length];
      if (kind === 1) { O(g, x, y, 4, 4, '#ffffff'); P(g, x + 1, y + 1, '#f2c14e'); }
      else { R(g, x, y, 3, 3, col); P(g, x + 1, y, G.lt(col, 0.4)); }
    }
    return out(c);
  });
  S.flowerShelf = m(function (v) {
    const c = G.canvas(32, 34), g = c.g, wd = '#e8e0d0';
    R(g, 1, 3, 2, 30, '#a8946a'); R(g, 29, 3, 2, 30, '#8a7650');
    for (let s = 0; s < 3; s++) {
      const y = 11 + s * 10;
      R(g, 1, y, 30, 2, wd); R(g, 1, y + 1, 30, 1, G.dk(wd, 0.2));
      for (let i = 0; i < 4; i++) {
        const x = 3 + i * 7; R(g, x + 1, y - 4, 5, 4, '#c46a3c'); R(g, x, y - 5, 7, 1, '#d8865a');
        const col = FLW[(v + s * 3 + i) % FLW.length]; O(g, x + 1, y - 9, 5, 5, '#4f9a45'); R(g, x + 2, y - 9, 2, 2, col); P(g, x + 4, y - 7, col);
      }
    }
    return out(c);
  });
  S.wrapTable = m(function () {
    const c = G.canvas(32, 26), g = c.g;
    R(g, 1, 8, 30, 8, '#b8844f'); R(g, 1, 8, 30, 2, '#d8a46a'); R(g, 3, 16, 3, 9, '#7a4f2a'); R(g, 26, 16, 3, 9, '#7a4f2a');
    G.poly(g, [[4, 9], [12, 2], [16, 9]], '#f2e6c8'); O(g, 8, 1, 6, 5, '#e8354a'); P(g, 10, 2, '#ff8a9a');
    R(g, 18, 6, 9, 3, '#e87a9a'); R(g, 20, 4, 2, 2, '#f2a8c0'); L(g, 24, 3, 28, 7, '#c9a050');
    return out(c);
  });

  // ---------------- evler ----------------
  S.artwork = m(function (v) {
    const c = G.canvas(18, 14), g = c.g;
    R(g, 0, 0, 18, 14, '#c9a050'); R(g, 1, 1, 16, 12, '#8a6a2a');
    const k = v % 4;
    if (k === 0) { R(g, 2, 2, 14, 10, '#8fc8f0'); R(g, 2, 8, 14, 4, '#5fa645'); O(g, 11, 3, 4, 4, '#fff27a'); }
    else if (k === 1) { R(g, 2, 2, 14, 10, '#2a3a5a'); O(g, 4, 3, 4, 4, '#f2f2d0'); for (const [x, y] of [[11, 3], [14, 5], [9, 6]]) P(g, x, y, '#ffffff'); R(g, 2, 10, 14, 2, '#1a2a3a'); }
    else if (k === 2) { R(g, 2, 2, 14, 10, '#f2e6c8'); O(g, 5, 4, 8, 7, '#e8354a'); O(g, 7, 5, 4, 4, '#ff8a9a'); L(g, 9, 11, 9, 12, '#3f8a36'); }
    else { R(g, 2, 2, 14, 10, '#4f8ab8'); R(g, 2, 8, 14, 4, '#2f5a8a'); G.poly(g, [[6, 8], [9, 3], [9, 8]], '#ffffff'); R(g, 5, 8, 7, 2, '#7a4f2a'); }
    return c;
  });
  S.canvasStack = m(function () {
    const c = G.canvas(22, 24), g = c.g;
    for (let i = 0; i < 3; i++) { const x = 1 + i * 6, y = 6 - i * 2; R(g, x, y, 12, 17 - (2 - i), '#fff6e0'); R(g, x + 1, y + 1, 10, 14 - (2 - i), ['#8fc8f0', '#e8b04a', '#c890f0'][i]); R(g, x, y, 1, 17, '#a8946a'); }
    return out(c);
  });
  S.paintTable = m(function () {
    const c = G.canvas(32, 22), g = c.g;
    R(g, 1, 6, 30, 7, '#b8844f'); R(g, 1, 6, 30, 2, '#d8a46a'); R(g, 3, 13, 3, 8, '#7a4f2a'); R(g, 26, 13, 3, 8, '#7a4f2a');
    O(g, 4, 2, 12, 6, '#e8c890'); for (const [x, y, col] of [[6, 3, '#e8354a'], [9, 3, '#3d7fd9'], [12, 4, '#fff27a'], [8, 5, '#4f9a45']]) R(g, x, y, 2, 1, col);
    R(g, 19, 1, 3, 6, '#5a7aa8'); R(g, 23, 2, 3, 5, '#c8553d'); L(g, 27, 0, 29, 6, '#7a4f2a'); P(g, 27, 0, '#e8354a');
    return out(c);
  });
  S.shipWheel = m(function () {
    const c = G.canvas(22, 22), g = c.g;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; L(g, 11, 11, 11 + Math.round(Math.cos(a) * 10), 11 + Math.round(Math.sin(a) * 10), '#7a4f2a'); }
    O(g, 3, 3, 16, 16, '#a8743f'); O(g, 5, 5, 12, 12, 'rgba(0,0,0,0)'); g.clearRect(6, 6, 10, 10);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; L(g, 11, 11, 11 + Math.round(Math.cos(a) * 7), 11 + Math.round(Math.sin(a) * 7), '#8a5a30'); }
    O(g, 9, 9, 4, 4, '#c9a050');
    return out(c);
  });
  S.fishTank = m(function (f) {
    const c = G.canvas(32, 26), g = c.g;
    R(g, 2, 14, 28, 11, '#5a3820'); R(g, 2, 14, 28, 1, '#8a5a30');
    R(g, 1, 1, 30, 14, '#2a5a7a'); R(g, 2, 2, 28, 12, '#4f9ac8'); R(g, 2, 2, 28, 2, '#7cc0ee');
    R(g, 2, 11, 28, 3, '#d8c890'); L(g, 6, 11, 6, 5, '#3f8a36'); L(g, 7, 11, 8, 6, '#4f9a45'); L(g, 25, 11, 24, 6, '#3f8a36');
    const fx = 8 + ((f * 3) % 14);
    R(g, fx, 6, 4, 2, '#ff8a3a'); P(g, fx - 1, 6, '#e8553d'); P(g, fx + 3, 6, '#2a1a24');
    R(g, 22 - ((f * 2) % 12), 9, 3, 2, '#f2c14e');
    P(g, 14, 4, '#bfe8ff'); P(g, 15, 3, '#bfe8ff');
    return out(c);
  });
  S.rodRack = m(function () {
    const c = G.canvas(20, 32), g = c.g;
    R(g, 1, 26, 18, 4, '#7a4f2a'); R(g, 1, 26, 18, 1, '#a8743f');
    for (const [x, col] of [[4, '#5a3820'], [9, '#8a5a30'], [14, '#3f5a6a']]) { L(g, x, 27, x + 2, 1, col); P(g, x + 2, 1, '#c8c8d0'); R(g, x, 20, 3, 2, '#5a5260'); }
    return out(c);
  });
  S.crib = m(function () {
    const c = G.canvas(30, 22), g = c.g;
    R(g, 1, 4, 28, 14, '#e8dcc0'); R(g, 3, 6, 24, 9, '#bfe0f0'); for (let x = 3; x < 28; x += 3) R(g, x, 4, 1, 12, '#d8c8a0');
    O(g, 6, 7, 7, 6, '#f0c39b'); R(g, 12, 9, 13, 5, '#f2a8c0'); R(g, 12, 9, 13, 1, '#ffc8dc');
    R(g, 1, 3, 28, 2, '#c8b48a'); R(g, 2, 18, 3, 3, '#a8946a'); R(g, 25, 18, 3, 3, '#a8946a');
    return out(c);
  });
  S.toyBox = m(function () {
    const c = G.canvas(18, 18), g = c.g;
    R(g, 1, 7, 16, 10, '#3d7fd9'); R(g, 1, 7, 16, 2, '#6aa8f0'); O(g, 2, 1, 7, 7, '#f2c14e'); P(g, 4, 3, '#fff2b0'); R(g, 10, 2, 5, 6, '#e8553d'); R(g, 11, 3, 3, 1, '#ff9a8a');
    return out(c);
  });
  S.piano = m(function () {
    const c = G.canvas(34, 32), g = c.g;
    R(g, 1, 2, 32, 24, '#3b2a24'); R(g, 1, 2, 32, 2, '#5a4038'); R(g, 3, 6, 28, 8, '#2a1e1a');
    R(g, 1, 16, 32, 4, '#f6f0e4'); for (let x = 2; x < 32; x += 3) R(g, x, 16, 1, 4, '#c8c0b0'); for (let x = 3; x < 31; x += 6) R(g, x, 16, 2, 2, '#1e1218');
    R(g, 3, 26, 3, 5, '#2a1e1a'); R(g, 28, 26, 3, 5, '#2a1e1a'); R(g, 12, 3, 10, 2, '#c9a050');
    O(g, 24, 7, 4, 5, '#fff6e0'); P(g, 25, 8, '#c9a050');
    return out(c);
  });
  S.drum = m(function () {
    const c = G.canvas(20, 18), g = c.g;
    O(g, 2, 4, 16, 13, '#c8353a'); O(g, 2, 2, 16, 7, '#e8dcc0'); O(g, 4, 3, 12, 4, '#f6f0e4'); for (let x = 4; x < 17; x += 4) L(g, x, 8, x + 2, 15, '#c9a050');
    L(g, 13, 0, 18, 4, '#a8743f'); L(g, 15, 0, 19, 3, '#a8743f');
    return out(c);
  });
  S.bottleShip = m(function () {
    const c = G.canvas(20, 12), g = c.g;
    O(g, 1, 2, 16, 9, 'rgba(200,230,240,0.6)'); R(g, 16, 5, 3, 3, '#7a4f2a');
    R(g, 4, 7, 9, 2, '#7a4f2a'); G.poly(g, [[8, 2], [8, 7], [12, 7]], '#ffffff'); G.poly(g, [[7, 3], [7, 7], [4, 7]], '#f2e6c8');
    R(g, 2, 9, 14, 1, '#3d7fd9');
    return out(c);
  });
  S.compassMap = m(function () {
    const c = G.canvas(26, 18), g = c.g;
    R(g, 0, 0, 26, 18, '#c8b48a'); R(g, 1, 1, 24, 16, '#e8d6a8');
    O(g, 3, 3, 8, 6, '#9ac87a'); O(g, 14, 8, 9, 7, '#9ac87a'); L(g, 7, 9, 18, 6, '#a8453a'); P(g, 18, 6, '#a8453a');
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; L(g, 20, 4, 20 + Math.round(Math.cos(a) * 3), 4 + Math.round(Math.sin(a) * 3), '#5a3820'); }
    return c;
  });
})();
