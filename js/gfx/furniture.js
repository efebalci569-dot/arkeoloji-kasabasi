// İç mekân mobilyaları (v3): tezgâhlar, raflar, oturulabilir sandalye/koltuk/kanepe, ocak, fırın vb.
(function () {
  const G = AK.Gfx, U = AK.U, R = G.rect, P = G.px, O = G.oval, L = G.line;
  const out = c => G.outline(c);
  const m = G.memo;
  const SH = a => `rgba(28,14,38,${a})`;
  const S = AK.Spr;
  const wood = (g, x, y, w, h, c) => { R(g, x, y, w, h, c); R(g, x, y, w, 1, G.lt(c, 0.25)); R(g, x, y + h - 1, w, 1, G.dk(c, 0.3)); R(g, x + w - 1, y, 1, h, G.dk(c, 0.2)); };

  // ---------------- oturulabilirler ----------------
  S.chairSide = m(function (col, flip) {
    const c = G.canvas(16, 24), g = c.g, wd = '#9a6a3e';
    R(g, 3, 3, 3, 14, wd); R(g, 3, 3, 1, 14, G.lt(wd, 0.25)); R(g, 4, 4, 1, 10, col);
    R(g, 3, 13, 10, 3, wd); R(g, 3, 13, 10, 1, G.lt(wd, 0.3)); R(g, 5, 12, 7, 1, col);
    R(g, 4, 16, 2, 7, G.dk(wd, 0.2)); R(g, 11, 16, 2, 7, G.dk(wd, 0.3));
    const o = out(c);
    return flip ? G.flip(o) : o;
  });
  S.stool = m(function () {
    const c = G.canvas(14, 16), g = c.g;
    O(g, 1, 3, 12, 5, '#b07a45'); O(g, 2, 3, 10, 3, '#d0a06a'); R(g, 3, 7, 2, 8, '#7a4f2a'); R(g, 9, 7, 2, 8, '#6a4022');
    return out(c);
  });
  S.armchair = m(function (col) {
    const c = G.canvas(22, 24), g = c.g, d = G.dk(col, 0.25), l = G.lt(col, 0.2);
    R(g, 3, 2, 16, 11, col); R(g, 3, 2, 16, 2, l); R(g, 16, 3, 3, 10, d); O(g, 5, 4, 12, 6, G.lt(col, 0.08));
    R(g, 1, 9, 4, 10, col); R(g, 17, 9, 4, 10, d); R(g, 1, 9, 4, 2, l);
    R(g, 5, 12, 12, 5, l); R(g, 5, 16, 12, 2, d);
    R(g, 2, 19, 2, 4, '#5a3820'); R(g, 18, 19, 2, 4, '#5a3820');
    return out(c);
  });
  S.sofa = m(function (col) {
    const c = G.canvas(38, 24), g = c.g, d = G.dk(col, 0.25), l = G.lt(col, 0.2);
    R(g, 3, 2, 32, 11, col); R(g, 3, 2, 32, 2, l); R(g, 18, 4, 1, 8, d);
    R(g, 1, 9, 4, 10, col); R(g, 33, 9, 4, 10, d); R(g, 1, 9, 4, 2, l);
    R(g, 5, 12, 28, 5, l); R(g, 18, 12, 1, 5, d); R(g, 5, 16, 28, 2, d);
    R(g, 2, 19, 2, 4, '#5a3820'); R(g, 34, 19, 2, 4, '#5a3820');
    O(g, 6, 5, 7, 6, '#f2c14e'); O(g, 26, 5, 7, 6, '#c8553d');
    return out(c);
  });
  S.benchIn = m(function () {
    const c = G.canvas(32, 18), g = c.g;
    R(g, 2, 7, 28, 4, '#8d5d32'); R(g, 2, 7, 28, 1, '#b07a45'); R(g, 2, 2, 28, 4, '#7a4f2a'); R(g, 2, 2, 28, 1, '#a8743f');
    R(g, 4, 11, 2, 6, '#5a3820'); R(g, 26, 11, 2, 6, '#5a3820'); R(g, 15, 11, 2, 6, '#5a3820');
    return out(c);
  });

  // ---------------- tezgâh & raflar ----------------
  S.counter2 = m(function (w, col, top, kind) {
    const W2 = w * 16, c = G.canvas(W2, 28), g = c.g;
    const tc = top || G.lt(col, 0.35);
    R(g, 0, 10, W2, 17, col);
    for (let x = 2; x < W2 - 2; x += 10) { R(g, x, 14, 8, 10, G.dk(col, 0.15)); R(g, x + 1, 15, 6, 8, col); R(g, x + 1, 15, 6, 1, G.lt(col, 0.15)); }
    R(g, W2 - 2, 10, 2, 17, G.dk(col, 0.3));
    R(g, 0, 6, W2, 5, tc); R(g, 0, 6, W2, 1, G.lt(tc, 0.3)); R(g, 0, 10, W2, 1, G.dk(tc, 0.3));
    if (kind === 'register') { R(g, W2 - 14, 0, 11, 7, '#5a5260'); R(g, W2 - 13, 1, 9, 3, '#3f8a5a'); P(g, W2 - 11, 2, '#bfffc8'); O(g, 4, 3, 6, 4, '#f2c14e'); }
    if (kind === 'food') { O(g, 4, 3, 8, 4, '#f6f0e4'); P(g, 7, 4, '#d8452e'); R(g, 16, 2, 4, 5, '#bfe0e8'); R(g, 16, 4, 4, 3, '#c8452e'); O(g, W2 - 14, 3, 9, 4, '#e8b04a'); }
    if (kind === 'papers') { R(g, 6, 3, 8, 4, '#fff6e0'); R(g, 7, 2, 8, 4, '#f6ead0'); R(g, W2 - 12, 1, 3, 6, '#3d7fd9'); R(g, W2 - 9, 2, 4, 5, '#c8553d'); P(g, 10, 4, '#8a6a4a'); }
    if (kind === 'books') { R(g, 4, 2, 10, 5, '#a8453a'); R(g, 5, 1, 9, 2, '#e8d6b0'); R(g, W2 - 12, 0, 2, 7, '#5a5260'); R(g, W2 - 14, 0, 6, 2, '#3f8a5a'); }
    return out(c);
  });
  const GOODS = {
    goods: (g, x, y, r) => { const t = (r() * 4) | 0; const col = ['#c46a3c', '#3d7fd9', '#f2c14e', '#6f9a4a', '#e8d6b0'][(r() * 5) | 0]; if (t === 0) { R(g, x, y - 5, 4, 5, col); R(g, x, y - 5, 4, 1, G.lt(col, 0.4)); } else if (t === 1) { O(g, x, y - 5, 4, 5, col); R(g, x + 1, y - 6, 2, 1, '#8a7650'); } else if (t === 2) { R(g, x, y - 3, 5, 3, '#c8b48a'); R(g, x + 1, y - 4, 3, 1, '#a8946a'); } else { R(g, x, y - 6, 3, 6, col); P(g, x + 1, y - 7, '#5a5260'); } return 5; },
    books: (g, x, y, r) => { const w = 2 + ((r() * 2) | 0), h = 5 + ((r() * 2) | 0); const col = ['#c8553d', '#3d7fd9', '#4f9a45', '#f2c14e', '#9b4fd1', '#e8d6b0', '#7a4f2a'][(r() * 7) | 0]; R(g, x, y - h, w, h, col); P(g, x, y - h, G.lt(col, 0.4)); return w; },
    tools: (g, x, y, r) => { const k = (r() * 3) | 0; R(g, x + 2, y - 7, 1, 7, '#a8743f'); if (k === 0) R(g, x, y - 7, 5, 2, '#8a8a96'); else if (k === 1) L(g, x, y - 6, x + 4, y - 8, '#8a8a96'); else R(g, x + 1, y - 8, 3, 3, '#6a6a76'); return 6; },
    pots: (g, x, y, r) => { const col = ['#c46a3c', '#d8a070', '#8f4524'][(r() * 3) | 0]; O(g, x, y - 6, 5, 6, col); R(g, x + 1, y - 7, 3, 1, G.dk(col, 0.2)); P(g, x + 1, y - 4, G.lt(col, 0.4)); return 6; },
    mail: (g, x, y, r) => { R(g, x, y - 5, 5, 5, '#5a3820'); if (r() < 0.7) { R(g, x + 1, y - 4, 3, 3, r() < 0.5 ? '#fff6e0' : '#f2dca0'); P(g, x + 2, y - 3, '#c8553d'); } return 5; },
    bottles: (g, x, y, r) => { const col = ['#4a8a4a', '#8a3a3a', '#c8a050', '#5a7aa8'][(r() * 4) | 0]; R(g, x, y - 5, 3, 5, col); R(g, x + 1, y - 7, 1, 2, col); P(g, x, y - 4, G.lt(col, 0.4)); return 4; },
    files: (g, x, y, r) => { const col = ['#3d5a7a', '#a8453a', '#4f7a45', '#c8a050'][(r() * 4) | 0]; R(g, x, y - 6, 3, 6, col); R(g, x, y - 3, 3, 1, '#fff6e0'); return 3; },
  };
  S.shelfTall = m(function (kind, v) {
    const c = G.canvas(32, 42), g = c.g, r = G.rnd('shelf', kind, v), wd = kind === 'mail' ? '#8a5a30' : '#7a4f2a';
    R(g, 1, 2, 30, 39, wd); R(g, 1, 2, 30, 2, G.lt(wd, 0.25)); R(g, 3, 4, 26, 35, G.dk(wd, 0.45));
    R(g, 1, 2, 2, 39, G.lt(wd, 0.15)); R(g, 29, 2, 2, 39, G.dk(wd, 0.2));
    for (let s = 0; s < 3; s++) {
      const y = 15 + s * 12;
      let x = 4;
      while (x < 26) x += GOODS[kind](g, x, y - 1, r) + (kind === 'books' ? 0 : 1);
      R(g, 3, y - 1, 26, 2, G.lt(wd, 0.1)); R(g, 3, y, 26, 1, G.dk(wd, 0.2));
    }
    return out(c);
  });
  S.furnace = m(function (f) {
    const c = G.canvas(36, 46), g = c.g;
    G.poly(g, [[6, 2], [30, 2], [34, 14], [2, 14]], '#4a4a56'); G.poly(g, [[18, 2], [30, 2], [34, 14], [18, 14]], '#3a3a46'); R(g, 14, 0, 8, 3, '#3a3a46');
    R(g, 2, 14, 32, 31, '#8a3a2e'); for (let y = 16; y < 44; y += 4) for (let x = 2 + ((y / 4) % 2) * 4; x < 34; x += 8) { R(g, x, y, 7, 3, '#a84a3a'); R(g, x, y, 7, 1, '#c86a5a'); }
    R(g, 30, 14, 4, 31, SH(0.3));
    O(g, 8, 22, 20, 12, '#1e1218'); R(g, 8, 28, 20, 14, '#1e1218');
    const h = [8, 10, 9][f % 3];
    R(g, 10, 36, 16, 5, '#c8452e'); O(g, 11, 41 - h, 14, h, '#e8702a'); O(g, 14, 42 - h * 0.7, 8, h * 0.7, '#f2c14e'); P(g, 17, 37, '#fff2b0');
    R(g, 4, 41, 28, 4, '#6a6a76'); R(g, 4, 41, 28, 1, '#8a8a96');
    return out(c);
  });
  S.trough = m(function () {
    const c = G.canvas(30, 16), g = c.g;
    R(g, 1, 4, 28, 10, '#7a4f2a'); R(g, 1, 4, 28, 1, '#a8743f'); R(g, 3, 5, 24, 4, '#3f88c8'); R(g, 3, 5, 24, 1, '#7cc0ee'); P(g, 8, 6, '#bfe8ff');
    R(g, 2, 14, 2, 2, '#5a3820'); R(g, 26, 14, 2, 2, '#5a3820');
    return out(c);
  });
  S.coal = m(function () {
    const c = G.canvas(18, 12), g = c.g;
    O(g, 1, 3, 16, 9, '#2a2a30'); for (const [x, y] of [[4, 4], [8, 3], [12, 5], [6, 7], [11, 8]]) { O(g, x, y, 4, 3, '#3a3a44'); P(g, x + 1, y, '#5a5a66'); }
    return out(c);
  });
  S.toolWall = m(function () {
    const c = G.canvas(34, 20), g = c.g;
    R(g, 1, 1, 32, 18, '#8a5a30'); R(g, 1, 1, 32, 1, '#b07a45'); for (let x = 4; x < 32; x += 6) P(g, x, 3, '#3b3540');
    L(g, 5, 4, 5, 16, '#a8743f'); R(g, 3, 4, 5, 3, '#8a8a96');
    L(g, 11, 4, 11, 17, '#a8743f'); R(g, 9, 14, 5, 3, '#8a8a96');
    L(g, 17, 4, 21, 16, '#a8743f'); R(g, 20, 4, 3, 2, '#6a6a76'); L(g, 23, 4, 23, 15, '#a8743f'); O(g, 21, 13, 5, 4, '#6a6a76');
    R(g, 27, 4, 2, 12, '#6a6a76'); R(g, 26, 4, 4, 2, '#8a8a96');
    return out(c);
  });
  S.tableCloth = m(function (col) {
    const c = G.canvas(32, 26), g = c.g;
    R(g, 1, 4, 30, 12, '#f6f0e4'); R(g, 1, 4, 30, 1, '#ffffff');
    for (let x = 1; x < 31; x += 4) { R(g, x, 4, 2, 12, col); }
    R(g, 1, 13, 30, 4, G.dk('#f6f0e4', 0.1)); for (let x = 1; x < 31; x += 4) R(g, x, 13, 2, 4, G.dk(col, 0.15));
    R(g, 3, 17, 3, 8, '#5a3820'); R(g, 26, 17, 3, 8, '#5a3820');
    O(g, 4, 6, 8, 5, '#ffffff'); O(g, 6, 7, 4, 3, '#e8b04a'); O(g, 20, 6, 8, 5, '#ffffff'); O(g, 22, 7, 4, 3, '#c8452e');
    R(g, 15, 3, 2, 6, '#bfe0e8'); R(g, 15, 3, 2, 1, '#ffffff'); P(g, 15, 6, '#f2a8c0');
    return out(c);
  });
  S.oven = m(function (f) {
    const c = G.canvas(34, 38), g = c.g;
    O(g, 1, 4, 32, 28, '#a85a40'); for (let y = 6; y < 30; y += 4) for (let x = 3 + ((y / 4) % 2) * 3; x < 31; x += 6) if (Math.hypot(x + 2 - 17, y - 18) < 14) R(g, x, y, 5, 3, '#c87a5a');
    O(g, 25, 6, 8, 24, SH(0.25));
    R(g, 1, 26, 32, 11, '#8a8274'); R(g, 1, 26, 32, 1, '#a9a193');
    O(g, 10, 16, 14, 12, '#1e1218'); R(g, 10, 22, 14, 6, '#1e1218');
    R(g, 12, 23, 10, 4, ['#c8452e', '#e8702a', '#d8582a'][f % 3]); P(g, 16, 24, '#f2c14e'); O(g, 14, 20, 6, 3, '#e8b04a');
    R(g, 14, 0, 6, 5, '#7a4a3a');
    return out(c);
  });
  S.menuBoard = m(function () {
    const c = G.canvas(20, 26), g = c.g;
    L(g, 3, 25, 7, 3, '#7a4f2a'); L(g, 16, 25, 12, 3, '#7a4f2a');
    R(g, 2, 2, 16, 16, '#7a4f2a'); R(g, 3, 3, 14, 14, '#2a3a32');
    G.text(g, 'MENÜ', 3, 6, '#f6f0e4');
    for (let y = 10; y < 16; y += 2) R(g, 4, y, 6 + (y % 4), 1, '#bfd8c8');
    return out(c);
  });
  S.readingTable = m(function () {
    const c = G.canvas(32, 24), g = c.g;
    wood(g, 1, 6, 30, 10, '#8d5d32'); R(g, 3, 16, 3, 7, '#5a3820'); R(g, 26, 16, 3, 7, '#5a3820');
    R(g, 5, 4, 9, 5, '#f6f0e4'); R(g, 9, 4, 1, 5, '#c8b48a'); R(g, 6, 5, 3, 1, '#8a7a6a'); R(g, 10, 6, 3, 1, '#8a7a6a');
    R(g, 20, 0, 2, 8, '#5a5260'); G.poly(g, [[17, 3], [21, -1], [25, 3]], '#3f8a5a'); R(g, 18, 3, 7, 1, '#2f6a44');
    R(g, 24, 6, 5, 3, '#a8453a'); R(g, 24, 5, 5, 1, '#c8655a');
    return out(c);
  });
  S.globe = m(function () {
    const c = G.canvas(16, 26), g = c.g;
    R(g, 7, 15, 2, 9, '#7a4f2a'); R(g, 4, 23, 8, 2, '#5a3820');
    O(g, 2, 2, 12, 12, '#3d7fd9'); O(g, 4, 4, 5, 4, '#6fbf52'); O(g, 8, 8, 4, 3, '#6fbf52'); P(g, 4, 4, '#bfe8ff');
    L(g, 2, 8, 8, 14, '#c9a050'); L(g, 8, 1, 14, 7, '#c9a050');
    return out(c);
  });
  S.cabinet = m(function () {
    const c = G.canvas(16, 32), g = c.g;
    R(g, 1, 2, 14, 29, '#6a7a8a'); R(g, 1, 2, 14, 1, '#8a9aaa'); R(g, 13, 2, 2, 29, '#4a5a6a');
    for (let y = 4; y < 30; y += 7) { R(g, 3, y, 10, 6, '#7a8a9a'); R(g, 3, y, 10, 1, '#9aaaba'); R(g, 6, y + 2, 4, 1, '#3a4a5a'); }
    return out(c);
  });
  S.flagStand = m(function (col) {
    const c = G.canvas(16, 42), g = c.g;
    R(g, 3, 2, 2, 38, '#c9a050'); O(g, 2, 0, 4, 3, '#f2c14e'); R(g, 1, 39, 6, 2, '#8a7030');
    R(g, 5, 3, 10, 14, col); R(g, 5, 3, 10, 1, G.lt(col, 0.3)); O(g, 8, 7, 5, 5, '#ffffff'); O(g, 9, 7, 4, 5, col);
    for (let y = 5; y < 17; y += 3) P(g, 14, y, G.dk(col, 0.25));
    return out(c);
  });
  S.bigPortrait = m(function () {
    const c = G.canvas(26, 24), g = c.g;
    R(g, 0, 0, 26, 24, '#c9a050'); R(g, 1, 1, 24, 22, '#8a7030'); R(g, 2, 2, 22, 20, '#3a4a5a');
    O(g, 8, 5, 10, 10, '#e2a878'); R(g, 8, 4, 10, 3, '#5a5260'); P(g, 11, 9, '#2a1a24'); P(g, 15, 9, '#2a1a24'); R(g, 11, 12, 4, 1, '#5a5260');
    R(g, 5, 15, 16, 7, '#2a3a5a'); R(g, 12, 15, 2, 4, '#e8e0d0');
    return c;
  });
  S.parcels = m(function () {
    const c = G.canvas(22, 20), g = c.g;
    const box = (x, y, w, h) => { R(g, x, y, w, h, '#c8a06a'); R(g, x, y, w, 1, '#e0c08a'); R(g, x + w - 1, y, 1, h, '#a8804e'); R(g, x + (w >> 1), y, 1, h, '#7a5a3a'); R(g, x, y + (h >> 1), w, 1, '#7a5a3a'); };
    box(1, 9, 12, 10); box(10, 11, 11, 8); box(4, 1, 10, 9);
    return out(c);
  });
  S.scale = m(function () {
    const c = G.canvas(16, 18), g = c.g;
    R(g, 3, 13, 10, 4, '#5a5260'); R(g, 7, 6, 2, 8, '#8a8a96'); R(g, 2, 5, 12, 2, '#c9a050'); O(g, 0, 7, 6, 3, '#c9a050'); O(g, 10, 7, 6, 3, '#c9a050');
    return out(c);
  });
  S.ropeCoil = m(function () {
    const c = G.canvas(16, 12), g = c.g;
    O(g, 1, 2, 14, 9, '#c8b48a'); O(g, 3, 3, 10, 6, '#a8946a'); O(g, 5, 4, 6, 4, '#c8b48a'); O(g, 6, 5, 4, 2, '#8a7650');
    return out(c);
  });
  S.wardrobe = m(function (col) {
    const c = G.canvas(32, 44), g = c.g;
    R(g, 1, 2, 30, 41, col); R(g, 1, 2, 30, 2, G.lt(col, 0.3)); R(g, 28, 2, 3, 41, G.dk(col, 0.25));
    R(g, 3, 6, 12, 32, G.dk(col, 0.12)); R(g, 17, 6, 11, 32, G.dk(col, 0.12)); R(g, 4, 7, 10, 30, col); R(g, 18, 7, 9, 30, col);
    P(g, 14, 22, '#f2c14e'); P(g, 17, 22, '#f2c14e'); R(g, 0, 0, 32, 3, G.dk(col, 0.1)); R(g, 3, 40, 3, 3, '#3b2416'); R(g, 26, 40, 3, 3, '#3b2416');
    return out(c);
  });
  S.teaTable = m(function () {
    const c = G.canvas(18, 18), g = c.g;
    O(g, 1, 4, 16, 7, '#a8743f'); O(g, 1, 3, 16, 6, '#c8955a'); R(g, 8, 9, 2, 8, '#7a4f2a'); R(g, 5, 16, 8, 1, '#5a3820');
    R(g, 4, 2, 3, 3, 'rgba(220,240,250,0.8)'); R(g, 4, 3, 3, 2, '#b8402a'); O(g, 9, 1, 5, 4, '#e8e0d0'); P(g, 13, 1, '#e8e0d0');
    return out(c);
  });
  S.telescope = m(function () {
    const c = G.canvas(18, 30), g = c.g;
    L(g, 9, 16, 3, 28, '#7a4f2a'); L(g, 9, 16, 15, 28, '#7a4f2a'); L(g, 9, 16, 9, 28, '#5a3820');
    L(g, 3, 13, 15, 4, '#c9a050'); L(g, 3, 14, 15, 5, '#a87a1e'); L(g, 4, 14, 16, 5, '#c9a050'); O(g, 13, 2, 5, 5, '#3d5a7a'); P(g, 14, 3, '#bfe8ff');
    return out(c);
  });
  S.starChart = m(function () {
    const c = G.canvas(28, 20), g = c.g, r = G.rnd('star');
    R(g, 0, 0, 28, 20, '#c9a050'); R(g, 1, 1, 26, 18, '#1e2a4a');
    for (let i = 0; i < 18; i++) P(g, 2 + ((r() * 24) | 0), 2 + ((r() * 16) | 0), r() < 0.3 ? '#f2c14e' : '#ffffff');
    const pts = [[6, 6], [10, 5], [13, 8], [17, 7], [20, 11], [16, 14], [11, 13]];
    for (let i = 0; i < pts.length - 1; i++) L(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], '#5a7aa8');
    for (const [x, y] of pts) P(g, x, y, '#fff2b0');
    return c;
  });
  S.basket = m(function () {
    const c = G.canvas(16, 12), g = c.g;
    R(g, 2, 5, 12, 6, '#a8743f'); for (let x = 3; x < 14; x += 2) R(g, x, 5, 1, 6, '#8a5a30'); R(g, 2, 5, 12, 1, '#c8955a');
    O(g, 3, 1, 5, 5, '#c8553d'); O(g, 8, 2, 5, 4, '#3d7fd9'); P(g, 4, 2, '#e07a5f'); L(g, 7, 3, 11, 0, '#c9a050');
    return out(c);
  });
  S.cat = m(function (f) {
    const c = G.canvas(18, 12), g = c.g, col = '#e8822a', d = '#b8601e';
    O(g, 3, 4, 12, 7, col); O(g, 3, 3, 6, 5, col); P(g, 4, 2, col); P(g, 7, 2, col); P(g, 4, 3, '#f2c0a0');
    R(g, 5, 5, 1, 1, '#2a1a24'); R(g, 7, 5, 1, 1, '#2a1a24');
    for (let x = 9; x < 14; x += 2) P(g, x, 5, d);
    const tail = f % 2 ? [[14, 9], [15, 8], [16, 7]] : [[14, 9], [15, 9], [16, 8]];
    for (const [x, y] of tail) P(g, x, y, col);
    return out(c);
  });
  S.cobweb = m(function (flip) {
    const c = G.canvas(16, 16), g = c.g, col = 'rgba(240,240,250,0.55)';
    for (let i = 0; i < 5; i++) L(g, 0, 0, 15 - i * 3, i * 3, col);
    for (const r0 of [4, 8, 12]) for (let a = 0; a < 6; a++) { const t = a / 5 * Math.PI / 2; P(g, Math.round(Math.cos(t) * r0), Math.round(Math.sin(t) * r0), col); }
    return flip ? G.flip(c) : c;
  });
  S.sheet = m(function (w) {
    const c = G.canvas(w, 24), g = c.g;
    O(g, 1, 2, w - 2, 12, '#e8e4dc'); R(g, 1, 8, w - 2, 14, '#e8e4dc'); R(g, w - 4, 8, 3, 14, '#c8c4bc');
    for (let x = 4; x < w - 2; x += 5) R(g, x, 10, 1, 12, '#d0ccc4');
    R(g, 1, 21, w - 2, 1, '#b8b4ac');
    return out(c);
  });
  S.brokenChair = m(function () {
    const c = G.canvas(18, 14), g = c.g;
    R(g, 2, 8, 12, 3, '#8a6a4a'); L(g, 3, 11, 1, 13, '#6a4a2a'); L(g, 12, 11, 15, 13, '#6a4a2a'); L(g, 4, 7, 9, 1, '#7a5a3a'); R(g, 13, 3, 2, 6, '#6a4a2a');
    return out(c);
  });
  S.dresser = m(function (col) {
    const c = G.canvas(32, 24), g = c.g;
    R(g, 1, 6, 30, 17, col); R(g, 1, 6, 30, 2, G.lt(col, 0.3)); R(g, 29, 6, 2, 17, G.dk(col, 0.25));
    for (let y = 9; y < 22; y += 5) { R(g, 3, y, 25, 4, G.dk(col, 0.1)); P(g, 15, y + 2, '#f2c14e'); }
    O(g, 4, 1, 7, 6, '#c46a3c'); R(g, 20, 2, 6, 5, '#e8d6b0'); R(g, 21, 3, 4, 3, '#8fc3e0');
    return out(c);
  });
  S.bookStack = m(function () {
    const c = G.canvas(14, 14), g = c.g;
    const cols = ['#c8553d', '#3d7fd9', '#4f9a45', '#f2c14e', '#9b4fd1'];
    for (let i = 0; i < 5; i++) { R(g, 1 + (i % 2), 10 - i * 2, 11, 2, cols[i]); R(g, 1 + (i % 2), 10 - i * 2, 11, 1, G.lt(cols[i], 0.3)); }
    return out(c);
  });
  S.wallClock = m(function () {
    const c = G.canvas(12, 12), g = c.g;
    O(g, 0, 0, 12, 12, '#7a4f2a'); O(g, 1, 1, 10, 10, '#fff6e0'); R(g, 6, 3, 1, 3, '#2a1a24'); R(g, 6, 6, 3, 1, '#2a1a24');
    return c;
  });
  S.lanternWall = m(function () {
    const c = G.canvas(8, 12), g = c.g;
    R(g, 3, 0, 2, 2, '#3b3540'); R(g, 1, 2, 6, 8, '#3b3540'); R(g, 2, 3, 4, 6, '#ffd27a'); R(g, 1, 10, 6, 1, '#3b3540');
    return c;
  });
})();
