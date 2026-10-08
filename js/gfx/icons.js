// 16x16 ikonlar: eserler, aletler, kaynaklar, yemekler, arayüz simgeleri.
(function () {
  const G = AK.Gfx, R = G.rect, P = G.px, O = G.oval, L = G.line;
  function tri(g, cx, top, h, w0, w1, col) { for (let j = 0; j < h; j++) { const half = Math.round(w0 + (w1 - w0) * j / h); R(g, cx - half, top + j, half * 2, 1, col); } }

  // ---------------- eser şekilleri ----------------
  const SH = {
    coin(g, c) { O(g, 2, 2, 12, 12, c.b); O(g, 2, 2, 11, 11, c.a); O(g, 4, 4, 7, 7, c.b); O(g, 5, 5, 5, 5, c.a); R(g, 7, 5, 1, 5, c.b); R(g, 6, 6, 3, 1, c.b); P(g, 4, 3, c.c); P(g, 5, 3, c.c); P(g, 3, 4, c.c); },
    bowl(g, c) { O(g, 1, 4, 14, 5, c.b); O(g, 2, 5, 12, 3, G.dk(c.b, 0.3)); for (let y = 7; y < 13; y++) { const h = Math.round(7 - (y - 7) * 0.8); R(g, 8 - h, y, h * 2, 1, c.a); } R(g, 5, 13, 6, 1, c.b); R(g, 3, 8, 10, 1, c.c); P(g, 4, 9, c.c); },
    amphora(g, c) { R(g, 6, 1, 4, 2, c.b); R(g, 7, 3, 2, 3, c.a); O(g, 3, 5, 10, 9, c.a); R(g, 7, 13, 2, 2, c.b); R(g, 4, 3, 1, 4, c.b); R(g, 11, 3, 1, 4, c.b); R(g, 4, 3, 3, 1, c.b); R(g, 9, 3, 3, 1, c.b); R(g, 4, 8, 8, 1, c.c); R(g, 5, 6, 2, 1, G.lt(c.a, 0.3)); },
    vase(g, c) { R(g, 5, 1, 6, 2, c.b); R(g, 6, 3, 4, 3, c.a); O(g, 3, 5, 10, 9, c.a); R(g, 5, 13, 6, 2, c.b); R(g, 4, 8, 8, 2, c.c); P(g, 5, 7, c.c); P(g, 10, 11, c.c); P(g, 7, 11, '#4f9a45'); R(g, 5, 6, 1, 2, G.lt(c.a, 0.4)); },
    lamp(g, c) { O(g, 2, 7, 12, 6, c.a); O(g, 11, 8, 4, 3, c.a); R(g, 1, 8, 2, 3, c.b); O(g, 6, 7, 4, 3, c.b); P(g, 13, 9, '#2a1a24'); R(g, 4, 11, 8, 1, c.b); P(g, 14, 7, '#f2c14e'); P(g, 14, 6, '#ffe28a'); R(g, 4, 8, 2, 1, c.c); },
    figurine(g, c) { O(g, 6, 1, 5, 5, c.a); R(g, 6, 6, 5, 2, c.a); O(g, 4, 7, 9, 8, c.a); R(g, 5, 9, 7, 1, c.b); R(g, 6, 10, 5, 1, c.b); P(g, 7, 3, c.b); P(g, 9, 3, c.b); R(g, 5, 14, 7, 1, c.b); P(g, 7, 2, c.c); },
    bust(g, c) { O(g, 5, 1, 7, 8, c.a); R(g, 4, 1, 9, 3, c.c); P(g, 6, 5, c.b); P(g, 10, 5, c.b); R(g, 7, 7, 3, 1, c.b); R(g, 7, 9, 3, 2, c.a); O(g, 2, 10, 13, 5, c.a); R(g, 5, 14, 7, 1, c.b); P(g, 4, 2, G.lt(c.c, 0.3)); P(g, 12, 3, G.lt(c.c, 0.3)); },
    tablet(g, c) { R(g, 3, 2, 10, 12, c.a); R(g, 2, 3, 12, 10, c.a); P(g, 12, 2, 'rgba(0,0,0,0)'); R(g, 11, 2, 2, 2, c.b); for (let y = 4; y < 13; y += 2) R(g, 4, y, 8, 1, c.b); O(g, 6, 6, 4, 4, c.c); R(g, 3, 2, 1, 11, G.lt(c.a, 0.25)); },
    ring(g, c) { O(g, 3, 6, 10, 9, c.a); O(g, 5, 8, 6, 5, 'rgba(0,0,0,0)'); g.clearRect(6, 9, 4, 3); O(g, 5, 2, 6, 6, c.b); O(g, 6, 3, 4, 4, c.c); P(g, 7, 3, '#ffffff'); P(g, 4, 9, G.lt(c.a, 0.4)); },
    necklace(g, c) { for (let i = 0; i <= 10; i++) { const x = 2 + i, y = 2 + Math.round(Math.sin(i / 10 * Math.PI) * 7); P(g, x + 1, y, '#7a5a3a'); if (i % 2 === 0) { R(g, x, y, 2, 2, [c.a, c.b, c.c][i / 2 % 3]); } } O(g, 6, 9, 5, 6, c.c); P(g, 7, 10, '#ffffff'); },
    bracelet(g, c) { O(g, 1, 4, 14, 10, c.a); O(g, 4, 6, 8, 5, 'rgba(0,0,0,0)'); g.clearRect(5, 7, 6, 3); R(g, 2, 8, 2, 2, c.b); R(g, 12, 7, 2, 2, c.b); P(g, 6, 5, c.c); P(g, 9, 5, c.c); R(g, 5, 12, 6, 1, c.b); },
    dagger(g, c) { L(g, 4, 11, 12, 3, c.c); L(g, 5, 11, 13, 3, c.c); L(g, 5, 12, 13, 4, G.dk(c.c, 0.2)); P(g, 13, 2, c.c); L(g, 3, 9, 7, 13, c.a); L(g, 2, 10, 6, 14, c.a); R(g, 1, 13, 3, 2, c.b); P(g, 2, 14, c.b); },
    arrowhead(g, c) { tri(g, 8, 1, 11, 0.5, 5, c.a); R(g, 6, 12, 4, 3, c.b); P(g, 4, 11, 'rgba(0,0,0,0)'); g.clearRect(3, 10, 2, 2); g.clearRect(11, 10, 2, 2); P(g, 7, 4, c.c); P(g, 8, 7, c.c); P(g, 6, 8, c.c); P(g, 9, 9, c.c); },
    needle(g, c) { L(g, 3, 13, 12, 2, c.a); L(g, 4, 13, 13, 2, c.b); g.clearRect(11, 3, 1, 1); O(g, 10, 1, 4, 4, c.a); g.clearRect(11, 2, 2, 2); },
    axe(g, c) { O(g, 2, 3, 12, 10, c.a); O(g, 3, 4, 7, 6, G.lt(c.a, 0.2)); R(g, 9, 5, 2, 6, c.b); L(g, 13, 4, 14, 11, c.c); P(g, 4, 5, c.c); },
    sickle(g, c) { for (let a = 0; a < 20; a++) { const t = a / 19 * Math.PI * 1.1; const x = 9 + Math.round(Math.cos(t + 1.5) * 6), y = 7 - Math.round(Math.sin(t + 1.5) * 5); R(g, x, y, 2, 2, c.a); } R(g, 3, 11, 2, 4, c.b); R(g, 2, 13, 4, 2, c.b); P(g, 12, 3, c.c); },
    ammonite(g, c) { O(g, 1, 1, 14, 14, c.b); O(g, 2, 2, 12, 12, c.a); O(g, 4, 4, 8, 8, c.b); O(g, 5, 5, 6, 6, c.a); O(g, 6, 6, 4, 4, c.b); P(g, 7, 7, c.c); for (const [x, y] of [[8, 2], [12, 4], [13, 8], [11, 12], [6, 13], [2, 10], [2, 5]]) P(g, x, y, c.c); },
    fishfossil(g, c) { O(g, 0, 2, 16, 12, c.b); O(g, 1, 3, 14, 10, c.a); R(g, 3, 8, 9, 1, c.c); for (let x = 4; x < 11; x += 2) { P(g, x, 6, c.c); P(g, x, 7, c.c); P(g, x, 9, c.c); P(g, x, 10, c.c); } O(g, 10, 6, 4, 4, c.c); P(g, 11, 7, '#2a1a24'); P(g, 2, 6, c.c); P(g, 2, 10, c.c); P(g, 1, 8, c.c); },
    skull(g, c) { O(g, 2, 2, 12, 10, c.a); R(g, 4, 10, 8, 4, c.a); O(g, 4, 6, 3, 3, c.c); O(g, 9, 6, 3, 3, c.c); P(g, 8, 9, c.c); for (let x = 5; x < 11; x += 2) P(g, x, 13, c.b); R(g, 4, 2, 4, 2, G.lt(c.a, 0.3)); R(g, 2, 9, 2, 3, c.b); },
    seal(g, c) { R(g, 4, 2, 8, 12, c.a); O(g, 4, 1, 8, 3, G.lt(c.a, 0.2)); O(g, 4, 12, 8, 3, c.b); for (let y = 4; y < 12; y += 2) { R(g, 5, y, 2, 1, c.b); R(g, 9, y + 1, 2, 1, c.b); } P(g, 7, 6, c.c); P(g, 8, 8, c.c); R(g, 4, 2, 1, 11, G.lt(c.a, 0.3)); },
    mask(g, c) { O(g, 2, 1, 12, 14, c.a); R(g, 4, 2, 8, 2, c.c); O(g, 4, 5, 3, 2, '#2a1a24'); O(g, 9, 5, 3, 2, '#2a1a24'); R(g, 7, 7, 2, 3, c.b); R(g, 6, 11, 4, 1, '#2a1a24'); P(g, 3, 8, c.c); P(g, 12, 8, c.c); R(g, 3, 3, 1, 6, G.lt(c.a, 0.25)); },
    disc(g, c) { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; L(g, 8, 8, 8 + Math.round(Math.cos(a) * 7), 8 + Math.round(Math.sin(a) * 7), c.b); } O(g, 3, 3, 10, 10, c.a); O(g, 5, 5, 6, 6, c.c); O(g, 6, 6, 4, 4, c.a); P(g, 7, 7, '#ffffff'); },
    scarab(g, c) { O(g, 3, 4, 10, 11, c.a); O(g, 5, 1, 6, 5, c.b); R(g, 8, 5, 1, 9, c.b); P(g, 5, 7, c.c); P(g, 10, 9, c.c); for (const y of [6, 9, 12]) { P(g, 2, y, c.b); P(g, 13, y, c.b); } P(g, 6, 2, '#ffffff'); },
    helmet(g, c) { O(g, 2, 2, 12, 10, c.a); R(g, 2, 7, 12, 4, c.a); R(g, 7, 7, 2, 6, c.b); R(g, 3, 10, 3, 4, c.a); R(g, 10, 10, 3, 4, c.a); g.clearRect(5, 8, 2, 4); g.clearRect(9, 8, 2, 4); R(g, 6, 0, 4, 3, c.c); R(g, 3, 3, 2, 3, G.lt(c.a, 0.3)); },
    bottle(g, c) { R(g, 6, 1, 4, 2, c.b); R(g, 7, 3, 2, 4, c.a); O(g, 3, 6, 10, 9, c.a); R(g, 5, 8, 2, 4, '#ffffff'); P(g, 9, 10, c.c); P(g, 10, 12, c.c); R(g, 5, 14, 6, 1, c.b); },
    mirror(g, c) { O(g, 2, 1, 12, 11, c.b); O(g, 3, 2, 10, 9, c.a); O(g, 4, 3, 8, 7, c.c); L(g, 5, 4, 8, 4, '#ffffff'); R(g, 7, 12, 2, 4, c.b); R(g, 6, 14, 4, 1, c.b); },
    amulet(g, c) { L(g, 3, 1, 8, 6, '#9c9282'); L(g, 13, 1, 8, 6, '#9c9282'); O(g, 4, 5, 8, 10, c.b); O(g, 5, 6, 6, 8, c.a); O(g, 6, 8, 3, 4, c.c); P(g, 6, 7, '#ffffff'); },
    brooch(g, c) { for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; P(g, 8 + Math.round(Math.cos(a) * 6), 8 + Math.round(Math.sin(a) * 6), c.b); } O(g, 3, 3, 10, 10, c.a); O(g, 5, 5, 6, 6, c.c); P(g, 6, 6, '#ffffff'); },
    idol(g, c) { tri(g, 8, 1, 5, 0.5, 3, c.a); R(g, 5, 6, 6, 6, c.a); R(g, 3, 7, 2, 3, c.b); R(g, 11, 7, 2, 3, c.b); tri(g, 8, 12, 3, 3, 4, c.b); P(g, 7, 3, '#ffffff'); P(g, 6, 8, c.c); P(g, 9, 9, c.c); R(g, 5, 6, 1, 6, '#ffffff'); },
    map(g, c) { R(g, 2, 3, 12, 10, c.a); for (const [x, y] of [[2, 3], [5, 3], [13, 6], [9, 12], [2, 9]]) g.clearRect(x, y, 2, 1); R(g, 3, 4, 1, 8, G.lt(c.a, 0.2)); L(g, 4, 10, 7, 7, c.b); L(g, 7, 7, 11, 8, c.b); P(g, 10, 5, c.c); P(g, 11, 6, c.c); P(g, 12, 5, c.c); P(g, 10, 7, c.c); P(g, 12, 7, c.c); R(g, 5, 5, 2, 1, c.b); },
    amber(g, c) { O(g, 2, 3, 12, 11, c.b); O(g, 3, 3, 10, 9, c.a); R(g, 6, 6, 4, 3, '#3a2a1a'); P(g, 5, 7, '#3a2a1a'); P(g, 10, 7, '#3a2a1a'); P(g, 6, 9, '#3a2a1a'); P(g, 9, 9, '#3a2a1a'); P(g, 5, 4, '#ffffff'); P(g, 4, 5, c.c); },
  };

  // ---------------- aletler ----------------
  const LV = ['#9a6b4a', '#9a6b4a', '#d0824a', '#aab7c4', '#49c2b0']; // 1 paslı, 2 bakır, 3 çelik, 4 antik
  const TOOLS = {
    shovel(g, m) { L(g, 3, 13, 10, 6, '#a8743f'); L(g, 4, 13, 11, 6, '#7a4f2a'); R(g, 2, 12, 3, 3, '#7a4f2a'); tri(g, 12, 2, 6, 3, 2, m); R(g, 9, 1, 6, 2, m); P(g, 11, 3, G.lt(m, 0.4)); },
    pickaxe(g, m) { L(g, 3, 14, 10, 5, '#a8743f'); L(g, 4, 14, 11, 5, '#7a4f2a'); for (let i = 0; i < 10; i++) { const x = 4 + i, y = 2 + Math.round(Math.abs(i - 5) * 0.6); R(g, x, y, 1, 3, i === 5 ? G.dk(m, 0.2) : m); } P(g, 4, 4, G.lt(m, 0.4)); },
    hammer(g, m) { L(g, 3, 14, 9, 7, '#a8743f'); L(g, 4, 14, 10, 7, '#7a4f2a'); R(g, 7, 2, 8, 6, m); R(g, 7, 2, 8, 1, G.lt(m, 0.35)); R(g, 7, 7, 8, 1, G.dk(m, 0.3)); },
    brush(g, m) { L(g, 3, 13, 9, 7, '#c8955a'); L(g, 4, 13, 10, 7, '#a8743f'); R(g, 9, 4, 5, 4, m); for (let x = 10; x < 15; x++) R(g, x, 1, 1, 4, '#e8d6b0'); R(g, 9, 4, 5, 1, G.lt(m, 0.3)); },
    detector(g, m) { L(g, 2, 2, 10, 10, '#5a5260'); L(g, 3, 2, 11, 10, '#3b3540'); O(g, 8, 9, 7, 5, m); O(g, 10, 10, 3, 3, '#3b3540'); R(g, 2, 2, 3, 2, '#c8553d'); P(g, 5, 5, '#f2c14e'); },
    lantern(g, m) { R(g, 6, 1, 4, 2, '#3b3540'); R(g, 4, 3, 8, 11, '#3b3540'); R(g, 5, 4, 6, 9, '#fff2b0'); R(g, 7, 6, 2, 5, '#f2c14e'); R(g, 3, 13, 10, 2, '#3b3540'); R(g, 4, 4, 1, 9, m); },
  };

  // ---------------- kaynak & yemek ----------------
  const MISC = {
    tas(g) { O(g, 2, 4, 12, 10, '#77726a'); O(g, 2, 4, 11, 9, '#9a958c'); O(g, 4, 5, 4, 3, '#bfbab0'); },
    kil(g) { O(g, 2, 5, 12, 9, '#8f4524'); O(g, 2, 4, 11, 9, '#c46a3c'); O(g, 4, 5, 4, 3, '#e39260'); P(g, 9, 9, '#8f4524'); },
    kemik(g) { L(g, 4, 11, 11, 4, '#e8dcc0'); L(g, 5, 11, 12, 4, '#d0c4a6'); O(g, 2, 9, 4, 4, '#e8dcc0'); O(g, 3, 11, 4, 4, '#e8dcc0'); O(g, 10, 2, 4, 4, '#e8dcc0'); O(g, 11, 4, 4, 4, '#e8dcc0'); },
    comlek(g) { R(g, 3, 5, 9, 7, '#c46a3c'); L(g, 3, 5, 12, 4, '#c46a3c'); g.clearRect(3, 11, 3, 1); g.clearRect(10, 5, 2, 2); R(g, 3, 7, 9, 1, '#2a1a24'); R(g, 4, 9, 7, 1, '#e8d6b0'); },
    metal(g) { R(g, 3, 6, 10, 6, '#8a6a52'); L(g, 3, 6, 9, 3, '#8a6a52'); R(g, 4, 7, 4, 2, '#b07a52'); P(g, 9, 9, '#c86a3a'); P(g, 6, 10, '#c86a3a'); R(g, 10, 4, 3, 2, '#6e5a4a'); },
    kuvars(g) { for (const [x, y, h] of [[4, 5, 9], [7, 2, 12], [10, 6, 8]]) { R(g, x, y + 1, 3, h - 1, '#bfe4f0'); P(g, x + 1, y, '#bfe4f0'); R(g, x, y + 1, 1, h - 1, '#ffffff'); R(g, x + 2, y + 1, 1, h - 1, '#7fb0c4'); } },
    ametist(g) { for (const [x, y, h] of [[4, 5, 9], [7, 2, 12], [10, 6, 8]]) { R(g, x, y + 1, 3, h - 1, '#a77ad8'); P(g, x + 1, y, '#a77ad8'); R(g, x, y + 1, 1, h - 1, '#dcc6f6'); R(g, x + 2, y + 1, 1, h - 1, '#7448a8'); } },
    altin(g) { R(g, 2, 7, 12, 6, '#d8a42a'); R(g, 4, 5, 8, 2, '#f2c14e'); R(g, 4, 5, 8, 1, '#fff2b0'); R(g, 2, 12, 12, 1, '#a87a1e'); P(g, 5, 9, '#fff2b0'); },
    cay(g) { O(g, 1, 12, 14, 3, '#e8e0d0'); R(g, 5, 4, 6, 9, 'rgba(220,240,250,0.7)'); R(g, 5, 6, 6, 7, '#b8402a'); R(g, 6, 6, 4, 6, '#d0582e'); R(g, 4, 3, 8, 1, '#e8f4ff'); R(g, 6, 9, 4, 1, '#e8f4ff'); P(g, 6, 7, '#f2a07a'); },
    kahve(g) { O(g, 1, 12, 14, 3, '#e8e0d0'); R(g, 4, 6, 8, 7, '#f6f0e4'); R(g, 4, 6, 8, 1, '#5a3220'); R(g, 4, 10, 8, 1, '#3d7fd9'); R(g, 12, 8, 2, 3, '#f6f0e4'); P(g, 7, 3, '#d8d0c8'); P(g, 8, 2, '#d8d0c8'); },
    simit(g) { O(g, 1, 3, 14, 11, '#b8642a'); O(g, 2, 3, 12, 10, '#d0843a'); O(g, 5, 6, 6, 5, 'rgba(0,0,0,0)'); g.clearRect(6, 7, 4, 3); for (const [x, y] of [[3, 6], [5, 4], [9, 4], [12, 6], [12, 10], [8, 12], [4, 10]]) P(g, x, y, '#fff2c8'); },
    corba(g) { O(g, 1, 6, 14, 4, '#e8a03a'); for (let y = 8; y < 14; y++) { const h = Math.round(7 - (y - 8)); R(g, 8 - h, y, h * 2, 1, '#f6f0e4'); } O(g, 2, 6, 12, 3, '#e8822a'); P(g, 6, 7, '#c8452e'); P(g, 9, 7, '#ffffff'); P(g, 6, 3, '#d8d0c8'); P(g, 9, 2, '#d8d0c8'); },
    menemen(g) { O(g, 1, 6, 14, 8, '#3b3540'); O(g, 2, 6, 12, 6, '#d8452e'); O(g, 4, 7, 4, 3, '#f2c14e'); O(g, 9, 8, 3, 3, '#fff6e0'); P(g, 7, 10, '#4f9a45'); R(g, 13, 9, 3, 2, '#3b3540'); },
    borek(g) { R(g, 2, 6, 12, 7, '#e8b04a'); R(g, 2, 6, 12, 2, '#f6d080'); for (let y = 8; y < 13; y += 2) R(g, 2, y, 12, 1, '#c8862a'); R(g, 2, 12, 12, 1, '#a86a1e'); },
    kebap(g) { O(g, 1, 9, 14, 6, '#e8e0d0'); L(g, 1, 12, 14, 3, '#9c9282'); for (let i = 0; i < 4; i++) O(g, 3 + i * 3, 9 - i * 2, 4, 4, i % 2 ? '#a8452e' : '#8a3a22'); P(g, 5, 12, '#4f9a45'); P(g, 11, 12, '#d8452e'); },
    kofte(g) { O(g, 1, 9, 14, 6, '#e8e0d0'); for (let i = 0; i < 3; i++) O(g, 3 + i * 3, 6 + (i % 2), 5, 4, '#e8823a'); P(g, 6, 9, '#4f9a45'); },
    kit(g) { R(g, 2, 5, 12, 9, '#7a4f2a'); R(g, 2, 5, 12, 2, '#a8743f'); R(g, 6, 3, 4, 2, '#5a3a22'); R(g, 7, 8, 2, 3, '#f2c14e'); R(g, 3, 9, 10, 1, '#5a3a22'); },
    kart(g) { R(g, 2, 3, 12, 10, '#fff6e0'); R(g, 3, 4, 6, 6, '#8fc3e0'); O(g, 3, 7, 6, 4, '#5fa645'); R(g, 10, 5, 3, 1, '#8a6a4a'); R(g, 10, 7, 3, 1, '#8a6a4a'); R(g, 11, 4, 2, 1, '#c8553d'); },
    figur(g) { O(g, 5, 2, 6, 5, '#f2c14e'); R(g, 5, 7, 6, 6, '#d8a42a'); R(g, 3, 13, 10, 2, '#a87a1e'); P(g, 6, 4, '#2a1a24'); P(g, 9, 4, '#2a1a24'); },
    replika(g) { SH.vase(g, { a: '#3d7fd9', b: '#2a5a9a', c: '#f2c14e' }); },
  };

  // ---------------- arayüz simgeleri ----------------
  const UI = {
    eye(g) { O(g, 1, 4, 14, 8, '#fff6e0'); O(g, 5, 5, 6, 6, '#7a4a8a'); O(g, 7, 7, 2, 2, '#1e1218'); P(g, 6, 6, '#ffffff'); L(g, 1, 8, 4, 5, '#3b2416'); L(g, 14, 8, 11, 5, '#3b2416'); },
    coin(g) { O(g, 2, 2, 12, 12, '#a87a1e'); O(g, 2, 2, 11, 11, '#f2c14e'); O(g, 4, 4, 7, 7, '#d8a42a'); R(g, 7, 5, 2, 5, '#fff2b0'); P(g, 4, 4, '#fff2b0'); },
    energy(g) { tri(g, 9, 1, 7, 0.5, 4, '#f2c14e'); tri(g, 7, 7, 8, 4, 0.5, '#f2c14e'); R(g, 5, 7, 7, 1, '#f2c14e'); P(g, 8, 3, '#fff2b0'); },
    sun(g) { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; L(g, 8 + Math.round(Math.cos(a) * 5), 8 + Math.round(Math.sin(a) * 5), 8 + Math.round(Math.cos(a) * 7), 8 + Math.round(Math.sin(a) * 7), '#f2a02a'); } O(g, 4, 4, 8, 8, '#f2c14e'); O(g, 5, 5, 4, 4, '#fff2b0'); },
    cloud(g) { O(g, 1, 6, 9, 7, '#c8d4dc'); O(g, 5, 3, 9, 9, '#e8eef2'); O(g, 8, 6, 7, 7, '#d8e2e8'); R(g, 3, 10, 11, 3, '#e8eef2'); },
    rain(g) { O(g, 1, 3, 9, 6, '#8a9aa8'); O(g, 5, 1, 9, 7, '#a8b8c4'); R(g, 3, 6, 11, 3, '#a8b8c4'); for (const [x, y] of [[4, 10], [8, 11], [12, 10], [6, 13], [10, 14]]) R(g, x, y, 1, 2, '#4392d0'); },
    storm(g) { O(g, 1, 2, 9, 6, '#5a6470'); O(g, 5, 0, 9, 7, '#6e7884'); R(g, 3, 5, 11, 3, '#6e7884'); L(g, 9, 8, 6, 12, '#f2c14e'); L(g, 6, 12, 9, 12, '#f2c14e'); L(g, 9, 12, 7, 15, '#f2c14e'); },
    snow(g) { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; L(g, 8, 8, 8 + Math.round(Math.cos(a) * 6), 8 + Math.round(Math.sin(a) * 6), '#bfe8ff'); } O(g, 6, 6, 4, 4, '#ffffff'); },
    fog(g) { for (const [y, x, w] of [[3, 2, 10], [6, 4, 11], [9, 1, 12], [12, 3, 10]]) R(g, x, y, w, 2, '#c8ccd8'); },
    heart(g) { O(g, 1, 2, 7, 7, '#e8402a'); O(g, 8, 2, 7, 7, '#e8402a'); tri(g, 8, 6, 8, 7, 0.5, '#e8402a'); P(g, 4, 4, '#ff9a8a'); },
    heartE(g) { O(g, 1, 2, 7, 7, '#7a5a5a'); O(g, 8, 2, 7, 7, '#7a5a5a'); tri(g, 8, 6, 8, 7, 0.5, '#7a5a5a'); O(g, 3, 4, 3, 3, '#a88a8a'); },
    star(g) { tri(g, 8, 1, 6, 0.5, 2, '#f2c14e'); R(g, 1, 6, 14, 2, '#f2c14e'); R(g, 3, 8, 10, 2, '#f2c14e'); R(g, 3, 10, 4, 3, '#f2c14e'); R(g, 9, 10, 4, 3, '#f2c14e'); R(g, 2, 12, 3, 2, '#f2c14e'); R(g, 11, 12, 3, 2, '#f2c14e'); },
    quest(g) { R(g, 6, 2, 4, 8, '#f2c14e'); R(g, 6, 12, 4, 3, '#f2c14e'); R(g, 7, 2, 1, 8, '#fff2b0'); },
    museum(g) { tri(g, 8, 1, 4, 0.5, 7, '#d8d0c0'); R(g, 1, 5, 14, 1, '#a89e8c'); for (const x of [2, 6, 10]) R(g, x, 6, 3, 7, '#efe8da'); R(g, 1, 13, 14, 2, '#a89e8c'); },
    bag(g) { R(g, 2, 5, 12, 10, '#a8743f'); R(g, 2, 5, 12, 2, '#c8955a'); R(g, 5, 2, 6, 4, '#7a4f2a'); g.clearRect(6, 3, 4, 3); R(g, 6, 8, 4, 3, '#f2c14e'); },
    clock(g) { O(g, 1, 1, 14, 14, '#7a4f2a'); O(g, 2, 2, 12, 12, '#fff6e0'); R(g, 7, 4, 2, 5, '#3b2416'); R(g, 7, 7, 4, 2, '#3b2416'); },
    shop(g) { R(g, 2, 6, 12, 9, '#c8955a'); for (let x = 1; x < 15; x += 4) R(g, x, 3, 4, 4, x % 8 === 1 ? '#c8553d' : '#fff6e0'); R(g, 6, 9, 4, 6, '#7a4f2a'); },
    gift(g) { R(g, 2, 6, 12, 9, '#c8553d'); R(g, 1, 4, 14, 3, '#e07a5f'); R(g, 7, 4, 2, 11, '#f2c14e'); O(g, 4, 1, 4, 4, '#f2c14e'); O(g, 8, 1, 4, 4, '#f2c14e'); },
    mail(g) { R(g, 1, 4, 14, 9, '#fff6e0'); L(g, 1, 4, 8, 9, '#c8a06a'); L(g, 14, 4, 8, 9, '#c8a06a'); R(g, 1, 12, 14, 1, '#c8a06a'); },
    lock(g) { R(g, 3, 7, 10, 8, '#c9a050'); R(g, 5, 2, 6, 6, '#5a5260'); g.clearRect(7, 4, 2, 4); R(g, 7, 9, 2, 3, '#3b2416'); },
    bus(g) { R(g, 1, 3, 14, 9, '#f2c14e'); R(g, 2, 4, 12, 4, '#8fc3e0'); R(g, 1, 9, 14, 1, '#c8553d'); O(g, 2, 11, 4, 4, '#3b3540'); O(g, 10, 11, 4, 4, '#3b3540'); },
  };

  const cache = {};
  function make(key, fn) {
    if (cache[key]) return cache[key];
    const c = G.canvas(16, 16);
    fn(c.g);
    return (cache[key] = G.outline(c));
  }
  function dirtify(src, seed) {
    const w = 16, h = 16, c = G.canvas(w, h);
    c.g.drawImage(src, 0, 0);
    const id = c.g.getImageData(0, 0, w, h), d = id.data, r = AK.U.rng(seed);
    const blobs = [];
    for (let i = 0; i < 5; i++) blobs.push([2 + r() * 12, 2 + r() * 12, 2 + r() * 3.5]);
    const [or, og, ob] = G.rgb(G.OUT);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 40) continue;
      if (d[i] === or && d[i + 1] === og && d[i + 2] === ob) continue;
      // soluklaştır
      const gray = (d[i] + d[i + 1] + d[i + 2]) / 3;
      d[i] = d[i] * 0.45 + gray * 0.3 + 70 * 0.25; d[i + 1] = d[i + 1] * 0.45 + gray * 0.3 + 48 * 0.25; d[i + 2] = d[i + 2] * 0.45 + gray * 0.3 + 30 * 0.25;
      let dirt = false;
      for (const [bx, by, br] of blobs) if ((x - bx) ** 2 + (y - by) ** 2 < br * br) dirt = true;
      if (dirt || r() < 0.18) { const t = r(); const col = t < 0.4 ? [107, 74, 47] : t < 0.8 ? [125, 88, 56] : [90, 61, 39]; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; }
    }
    c.g.putImageData(id, 0, 0);
    return c;
  }

  AK.Icons = {
    SH, TOOLS, LV,
    artifact(def, dirty) {
      const key = 'art:' + def.id;
      const clean = make(key, g => (SH[def.shape] || SH.tablet)(g, def.col));
      if (!dirty) return clean;
      return cache[key + ':d'] || (cache[key + ':d'] = dirtify(clean, AK.U.hash(def.id)));
    },
    silhouette(def) {
      const key = 'sil:' + def.id;
      return cache[key] || (cache[key] = G.silhouette(AK.Icons.artifact(def, false), '#8a6a4a'));
    },
    tool(kind, lvl) { return make('tool:' + kind + lvl, g => TOOLS[kind](g, LV[lvl] || LV[1])); },
    misc(k) { return make('misc:' + k, MISC[k] || MISC.tas); },
    ui(k) { return make('ui:' + k, UI[k] || UI.star); },
    url(c) { return G.url(c); },
    // envanter yığını için ikon
    forStack(st) {
      if (!st) return null;
      const def = AK.Items.get(st.id);
      if (!def) return AK.Icons.ui('star');
      if (def.type === 'artifact') return AK.Icons.artifact(def, !!st.d);
      if (def.type === 'tool') return AK.Icons.tool(def.tool, AK.state.tools[def.tool] || 1);
      return AK.Icons.misc(def.icon || st.id);
    },
  };
})();
