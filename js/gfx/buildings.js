// Bina sprite üreticisi v2 — piksel art + 3D his: kırma/üçgen çatılar, saçak gölgeleri,
// girintili pencereler, basamaklı kapılar, piksel yazılı tabelalar. Işık sol üstten gelir.
(function () {
  const G = AK.Gfx, U = AK.U;
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const P = (g, x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
  const SH = a => `rgba(28,14,38,${a})`;
  const HL = a => `rgba(255,248,224,${a})`;

  // ---------------- çatı ----------------
  function shingleFn(base, seed, y0, row = 5, tw = 6) {
    const dk = G.dk(base, 0.3), dk2 = G.dk(base, 0.13), lt = G.lt(base, 0.22), lt2 = G.lt(base, 0.08);
    return (x, y) => {
      const yy = y - y0, r = Math.floor(yy / row), ry = ((yy % row) + row) % row;
      const off = (r & 1) * (tw >> 1);
      const tx = ((x + off) % tw + tw) % tw, t = Math.floor((x + off) / tw);
      if (ry === row - 1) return dk;
      if (tx === 0) return dk2;
      if (ry === 0) return lt;
      const h = U.h2(t, r, seed);
      return h < 0.12 ? dk2 : h > 0.9 ? lt2 : base;
    };
  }
  // kırma çatı (zarf görünümü): ön yüz, arka yüz, sol ve sağ kalça üçgenleri
  function hipRoof(g, o) {
    const { L, Rr, top, bot, col, seed } = o;
    const hip = o.hip, ry = o.ridge;
    const cF = col, cB = G.dk(col, 0.1), cL = G.lt(col, 0.14), cR = G.dk(col, 0.26);
    const faces = [
      { pts: [[L, top], [Rr, top], [Rr - hip, ry], [L + hip, ry]], c: cB, y0: top },
      { pts: [[L, top], [L + hip, ry], [L, bot]], c: cL, y0: bot },
      { pts: [[Rr, top], [Rr, bot], [Rr - hip, ry]], c: cR, y0: bot },
      { pts: [[L, bot], [Rr, bot], [Rr - hip, ry], [L + hip, ry]], c: cF, y0: bot },
    ];
    for (const f of faces) if (f.pts.length) G.poly(g, f.pts, shingleFn(f.c, seed + f.c.length, f.y0));
    if (o.snow) {
      G.poly(g, faces[0].pts, (x, y) => (U.h2(x, y, 3) < 0.08 ? '#dfe8ee' : '#f4f8fa'));
      const sl = ry + (bot - ry) * 0.35;
      G.poly(g, [[L + hip * 0.65, sl], [Rr - hip * 0.65, sl], [Rr - hip, ry], [L + hip, ry]], '#f4f8fa');
      for (let x = Math.round(L + hip * 0.7); x < Rr - hip * 0.7; x += 3) R(g, x, Math.round(sl), 2, 1 + (x % 2), '#f4f8fa');
    }
    // sırt ve kalça çizgileri
    G.line(g, L + hip, ry, Rr - hip, ry, G.lt(col, 0.35)); G.line(g, L + hip, ry + 1, Rr - hip, ry + 1, G.dk(col, 0.35));
    if (hip > 2) {
      G.line(g, L + 1, bot - 1, L + hip, ry, G.lt(col, 0.3)); G.line(g, Rr - 1, bot - 1, Rr - hip, ry, G.dk(col, 0.45));
      G.line(g, L + 1, top + 1, L + hip, ry, G.lt(col, 0.2)); G.line(g, Rr - 1, top + 1, Rr - hip, ry, G.dk(col, 0.35));
    }
    if (o.worn) { const r = U.rng(seed); for (let i = 0; i < 8; i++) R(g, (L + 6 + r() * (Rr - L - 14)) | 0, (ry + 3 + r() * (bot - ry - 8)) | 0, 3, 2, G.dk(col, 0.5)); }
    // saçak
    R(g, L, bot - 3, Rr - L, 1, G.lt(col, 0.25));
    R(g, L, bot - 2, Rr - L, 3, G.dk(col, 0.45));
  }
  // önden üçgen (alınlıklı) çatı: iki eğim geriye doğru uzanır
  function frontGable(g, o) {
    const { L, Rr, top, bot, col, seed, apex } = o;
    const mid = Math.round((L + Rr) / 2);
    const lp = [[L, bot], [mid, apex], [mid, top], [L, top + (bot - apex)]];
    const rp = [[mid, apex], [Rr, bot], [Rr, top + (bot - apex)], [mid, top]];
    G.poly(g, lp, shingleFn(G.lt(col, 0.1), seed, bot));
    G.poly(g, rp, shingleFn(G.dk(col, 0.25), seed + 7, bot));
    if (o.snow) {
      G.poly(g, [[L, top + (bot - apex) * 0.6], [mid, top], [mid, top + 8], [L, top + (bot - apex) * 0.6 + 8]], '#f4f8fa');
      G.poly(g, [[mid, top], [Rr, top + (bot - apex) * 0.6], [Rr, top + (bot - apex) * 0.6 + 8], [mid, top + 8]], '#e3ecf0');
    }
    G.line(g, mid, top, mid, apex, G.lt(col, 0.4));
    G.line(g, L, top + (bot - apex), mid, top, G.lt(col, 0.3));
    G.line(g, Rr - 1, top + (bot - apex), mid, top, G.dk(col, 0.4));
  }

  // ---------------- duvar malzemeleri ----------------
  function wall(g, x, y, w, h, mat, col, seed, o) {
    o = o || {};
    const r = U.rng(seed);
    R(g, x, y, w, h, col);
    if (mat === 'wood') {
      for (let yy = y; yy < y + h; yy += 5) {
        R(g, x, yy, w, 5, r() < 0.5 ? G.lt(col, 0.05) : G.dk(col, 0.04));
        R(g, x, yy, w, 1, G.lt(col, 0.2)); R(g, x, yy + 4, w, 1, G.dk(col, 0.28));
        for (let k = 0; k < Math.ceil(w / 28); k++) R(g, x + ((r() * w) | 0), yy + 1, 1, 3, G.dk(col, 0.2));
      }
    } else if (mat === 'vwood') {
      for (let xx = x; xx < x + w; xx += 5) {
        const c = r() < 0.5 ? G.lt(col, 0.06) : G.dk(col, 0.08);
        R(g, xx, y, 5, h, c); R(g, xx, y, 1, h, G.lt(col, 0.18)); R(g, xx + 4, y, 1, h, G.dk(col, 0.3));
        if (r() < 0.4) R(g, xx + 2, y + ((r() * h) | 0), 1, 2, G.dk(col, 0.35));
      }
    } else if (mat === 'stone') {
      for (let yy = y, row = 0; yy < y + h; yy += 6, row++) {
        let xx = x - (row % 2 ? 5 : 0);
        while (xx < x + w) {
          const bw = 7 + ((r() * 6) | 0), c = G.mix(col, r() < 0.5 ? '#ffffff' : '#000000', r() * 0.08);
          const a = Math.max(x, xx), b = Math.min(x + w, xx + bw - 1);
          if (b > a) { R(g, a, yy, b - a, 5, c); R(g, a, yy, b - a, 1, G.lt(c, 0.22)); R(g, a, yy + 4, b - a, 1, G.dk(c, 0.2)); R(g, a, yy, 1, 5, G.lt(c, 0.12)); }
          xx += bw;
        }
        R(g, x, yy + 5, w, 1, G.dk(col, 0.32));
      }
    } else if (mat === 'brick') {
      const mortar = G.lt(col, 0.45);
      R(g, x, y, w, h, mortar);
      for (let yy = y, row = 0; yy < y + h; yy += 4, row++) {
        for (let xx = x - (row % 2 ? 4 : 0); xx < x + w; xx += 8) {
          const c = G.mix(col, r() < 0.5 ? '#ffd0a0' : '#2a1a24', r() * 0.18);
          const a = Math.max(x, xx), b = Math.min(x + w, xx + 7);
          if (b > a) { R(g, a, yy, b - a, 3, c); R(g, a, yy, b - a, 1, G.lt(c, 0.15)); }
        }
      }
    } else { // sıva (plaster / timber)
      G.speckle(g, x, y, w, h, [G.dk(col, 0.06), G.lt(col, 0.08)], 0.07, r);
      for (let i = 0; i < 3; i++) { const px = x + ((r() * (w - 10)) | 0), py = y + ((r() * (h - 8)) | 0); R(g, px, py, 6 + ((r() * 6) | 0), 4, G.dk(col, 0.04)); }
      if (mat === 'timber') {
        const beam = o.beam || '#5a3a22', bl = G.lt(beam, 0.2);
        const mid = y + Math.round(h * 0.42);
        R(g, x, y, w, 3, beam); R(g, x, mid, w, 3, beam); R(g, x, mid, w, 1, bl);
        const posts = [x, x + w - 3];
        for (let px = x + 22; px < x + w - 12; px += 22) posts.push(px);
        posts.sort((p1, p2) => p1 - p2);
        for (const px of posts) { R(g, px, y, 3, h, beam); R(g, px, y, 1, h, bl); }
        for (let i = 0; i < posts.length - 1; i++) {
          const a = posts[i] + 3, b = posts[i + 1];
          if (b - a > 10 && i % 2 === 0) { G.line(g, a, mid + 2, b - 1, y + h - 1, beam); G.line(g, a + 1, mid + 2, b, y + h - 1, beam); }
        }
      }
    }
    if (o.worn) {
      for (let i = 0; i < 5; i++) { const px = x + 4 + ((r() * (w - 10)) | 0), py = y + 4 + ((r() * (h - 14)) | 0); G.line(g, px, py, px + 3, py + 4, G.dk(col, 0.4)); G.line(g, px + 3, py + 4, px + 2, py + 7, G.dk(col, 0.4)); }
      for (let i = 0; i < 4; i++) R(g, x + ((r() * (w - 6)) | 0), y + h - 4 - ((r() * 6) | 0), 4, 3, '#5f8a4a');
    }
    // köşe gölgesi (3D) ve zemin oklüzyonu
    for (let i = 0; i < 5; i++) R(g, x + w - 5 + i, y, 1, h, SH(0.04 + i * 0.035));
    R(g, x, y, 2, h, HL(0.12));
    R(g, x, y + h - 4, w, 4, SH(0.12)); R(g, x, y + h - 2, w, 2, SH(0.12));
  }
  function foundation(g, x, y, w, col) {
    col = col || '#8a8274';
    R(g, x - 1, y, w + 2, 5, col); R(g, x - 1, y, w + 2, 1, G.lt(col, 0.3)); R(g, x - 1, y + 4, w + 2, 1, G.dk(col, 0.3));
    for (let xx = x + 5; xx < x + w; xx += 11) R(g, xx, y + 1, 1, 3, G.dk(col, 0.2));
  }
  function ivy(g, x, y, h, seed) {
    const r = U.rng(seed);
    for (let i = 0; i < h * 1.4; i++) {
      const yy = y + h - ((r() * h) | 0), xx = x + ((r() * (6 + (y + h - yy) * 0.25)) | 0);
      P(g, xx, yy, r() < 0.5 ? '#3f7a3a' : '#5f9a45'); if (r() < 0.3) P(g, xx + 1, yy, '#2f6a2e');
    }
  }

  // ---------------- ayrıntılar ----------------
  function windowAt(g, x, y, w, h, o) {
    const trim = o.trim || '#6a4a2a', tl = G.lt(trim, 0.3), td = G.dk(trim, 0.3);
    const arch = o.style === 'arch';
    if (o.boarded) {
      R(g, x - 1, y - 1, w + 2, h + 2, '#2b1d20');
      for (let k = 0; k < 3; k++) { R(g, x - 3, y + 1 + k * Math.floor(h / 3), w + 6, 3, k % 2 ? '#946240' : '#a8743f'); R(g, x - 3, y + 1 + k * Math.floor(h / 3), w + 6, 1, '#c8955a'); }
      return null;
    }
    if (arch) { G.oval(g, x - 2, y - (w >> 1) - 2, w + 4, w + 4, trim); G.oval(g, x, y - (w >> 1), w, w, '#a8d8f0'); }
    R(g, x - 2, y - 2, w + 4, h + 4, trim);
    if (!arch) { R(g, x - 2, y - 2, w + 4, 1, tl); }
    R(g, x - 2, y - 2, 1, h + 4, tl); R(g, x - 2, y + h + 1, w + 4, 1, td); R(g, x + w + 1, y - 2, 1, h + 4, td);
    for (let j = 0; j < h; j++) R(g, x, y + j, w, 1, G.mix('#b8e0f4', '#4a78a8', j / h));
    if (arch) for (let j = -(w >> 1); j < 0; j++) { const half = Math.sqrt(Math.max(0, (w / 2) * (w / 2) - j * j)); R(g, Math.round(x + w / 2 - half), y + j, Math.round(half * 2), 1, '#c8e8f8'); }
    R(g, x, y, w, 2, SH(0.4)); R(g, x, y, 2, h, SH(0.3));
    for (let k = 0; k < Math.min(w, h) - 3; k += 1) if (k % 4 < 2) P(g, x + 3 + k, y + h - 3 - k, HL(0.55));
    if (o.style === 'shop') {
      // vitrin: içerideki ürünler
      const cs = o.goods || ['#c46a3c', '#3d7fd9', '#f2c14e', '#6f9a4a'];
      for (let k = 0; k < Math.floor(w / 7); k++) { const c = cs[k % cs.length]; G.oval(g, x + 2 + k * 7, y + h - 8, 5, 6, c); P(g, x + 3 + k * 7, y + h - 7, HL(0.6)); }
      R(g, x, y + h - 2, w, 2, '#7a4f2a');
      R(g, x + (w >> 1), y, 1, h, trim);
    } else {
      R(g, x + (w >> 1) - 1, y, 2, h, trim); R(g, x, y + (h >> 1) - 1, w, 2, trim);
      if (o.curtains) { R(g, x, y, 3, h - 2, o.curtains); R(g, x + w - 3, y, 3, h - 2, o.curtains); }
    }
    R(g, x - 3, y + h + 2, w + 6, 2, G.lt(trim, 0.2)); R(g, x - 3, y + h + 4, w + 6, 1, SH(0.35));
    if (o.shutters) {
      const sc = o.shutters;
      for (const sx of [x - 7, x + w + 3]) { R(g, sx, y - 1, 4, h + 2, sc); for (let j = 1; j < h; j += 3) R(g, sx, y + j, 4, 1, G.dk(sc, 0.3)); R(g, sx, y - 1, 1, h + 2, G.lt(sc, 0.25)); }
    }
    if (o.box) {
      R(g, x - 2, y + h + 3, w + 4, 4, '#8a5a30'); R(g, x - 2, y + h + 3, w + 4, 1, '#b07a45'); R(g, x - 2, y + h + 6, w + 4, 1, SH(0.3));
      const fl = ['#e85a7a', '#fff27a', '#ffffff', '#c890f0'];
      for (let k = 0; k < w + 2; k += 2) { P(g, x - 1 + k, y + h + 2, '#4f9a45'); if (k % 4 === 0) P(g, x - 1 + k, y + h + 1, fl[(k / 4) % fl.length]); }
    }
    return [x, arch ? y - (w >> 1) + 1 : y, w, arch ? h + (w >> 1) - 1 : h];
  }
  function doorAt(g, x, y, w, h, o) {
    const trim = o.trim || '#5a3a22', dc = o.col || '#8d5d32';
    const dl = G.lt(dc, 0.18), dd = G.dk(dc, 0.32);
    if (o.style === 'arch') { G.oval(g, x - 3, y - (w >> 1) - 3, w + 6, w + 6, trim); G.oval(g, x - 1, y - (w >> 1) - 1, w + 2, w + 2, '#2b1d20'); G.oval(g, x, y - (w >> 1), w, w, '#f2dca0'); R(g, x, y - 2, w, 2, trim); }
    R(g, x - 3, y - 3, w + 6, h + 3, trim); R(g, x - 3, y - 3, w + 6, 1, G.lt(trim, 0.3)); R(g, x - 3, y - 3, 1, h + 3, G.lt(trim, 0.25));
    R(g, x - 1, y - 1, w + 2, h + 1, '#1e1218');
    const leaves = o.style === 'double' || o.style === 'arch' && w > 14 ? 2 : 1;
    const lw = Math.floor((w - (leaves - 1)) / leaves);
    for (let i = 0; i < leaves; i++) {
      const lx = x + i * (lw + 1);
      R(g, lx, y, lw, h, dc); R(g, lx, y, 1, h, dl); R(g, lx + lw - 1, y, 1, h, dd);
      const ph = Math.floor((h - 6) / 2);
      for (let k = 0; k < 2; k++) { const py = y + 2 + k * (ph + 2); R(g, lx + 2, py, lw - 4, ph, dd); R(g, lx + 3, py + 1, lw - 5, ph - 1, G.mix(dc, dd, 0.3)); R(g, lx + 3, py + 1, lw - 5, 1, dl); }
      P(g, leaves === 2 ? (i === 0 ? lx + lw - 2 : lx + 1) : lx + lw - 3, y + (h >> 1) + 1, '#f2c14e');
    }
    if (o.window) { R(g, x + 3, y + 3, w - 6, 5, '#a8d8f0'); R(g, x + (w >> 1), y + 3, 1, 5, dc); }
    // basamaklar
    const sc = o.step || '#b8b0a2';
    R(g, x - 4, y + h, w + 8, 2, sc); R(g, x - 4, y + h, w + 8, 1, G.lt(sc, 0.3));
    R(g, x - 6, y + h + 2, w + 12, 2, G.dk(sc, 0.08)); R(g, x - 6, y + h + 2, w + 12, 1, G.lt(sc, 0.15)); R(g, x - 6, y + h + 3, w + 12, 1, G.dk(sc, 0.3));
  }
  function signBoard(g, cx, y, text, o) {
    o = o || {};
    const tw = G.textW(text), w = tw + 8, x = Math.round(cx - w / 2), bg = o.bg || '#e8d6b0', fr = o.frame || '#5a3a22';
    R(g, x, y, w, 12, fr); R(g, x + 1, y + 1, w - 2, 10, bg); R(g, x + 1, y + 1, w - 2, 1, G.lt(bg, 0.35)); R(g, x + 1, y + 10, w - 2, 1, G.dk(bg, 0.25));
    R(g, x + 1, y + 12, w - 1, 1, SH(0.35));
    G.text(g, text, x + 4, y + 4, o.fg || '#3b2416', o.shadow);
    return [x, y, w, 12];
  }
  function hangSign(g, x, y, text, o) {
    R(g, x, y, 12, 2, '#3b3540'); R(g, x + 10, y - 2, 2, 6, '#3b3540');
    R(g, x + 2, y + 2, 1, 3, '#5a5260'); R(g, x + 8, y + 2, 1, 3, '#5a5260');
    const w = Math.max(14, G.textW(text) + 6);
    R(g, x, y + 5, w, 10, '#5a3a22'); R(g, x + 1, y + 6, w - 2, 8, o.bg || '#d8b77e'); R(g, x + 1, y + 6, w - 2, 1, HL(0.4));
    G.text(g, text, x + 3, y + 8, o.fg || '#3b2416');
  }
  function awning(g, x0, x1, y, cols) {
    R(g, x0, y - 1, x1 - x0, 2, G.dk(cols[0], 0.45));
    for (let i = 0, xx = x0; xx < x1; i++, xx += 6) {
      const c = cols[i % 2], w = Math.min(6, x1 - xx);
      for (let j = 0; j < 6; j++) R(g, xx, y + 1 + j, w, 1, G.mix(G.dk(c, 0.3), c, j / 6));
      R(g, xx, y + 7, w, 2, c); G.oval(g, xx, y + 7, w, 5, c); P(g, xx + 1, y + 9, G.dk(c, 0.2));
    }
    R(g, x0 + 2, y + 12, x1 - x0 - 4, 3, SH(0.2));
  }
  function chimney(g, x, y, h, col) {
    R(g, x, y, 9, h, col); for (let yy = y + 2; yy < y + h; yy += 3) R(g, x, yy, 9, 1, G.dk(col, 0.25));
    R(g, x + 9, y + 1, 3, h - 1, G.dk(col, 0.4)); R(g, x, y, 1, h, G.lt(col, 0.2));
    R(g, x - 1, y - 2, 13, 3, '#6e6058'); R(g, x - 1, y - 2, 13, 1, '#8e8078'); R(g, x + 2, y - 2, 6, 1, '#1e1218');
    return [x + 5, y - 3];
  }
  function wallLamp(g, x, y) {
    R(g, x, y + 2, 4, 1, '#3b3540'); R(g, x + 1, y - 3, 4, 6, '#3b3540'); R(g, x + 2, y - 2, 2, 4, '#ffe8a0'); R(g, x + 1, y - 4, 4, 1, '#5a5260');
    return [x + 3, y];
  }
  function column(g, x, y, h, col) {
    const shade = [G.dk(col, 0.2), G.lt(col, 0.1), G.lt(col, 0.3), G.lt(col, 0.2), col, G.dk(col, 0.06), G.dk(col, 0.18), G.dk(col, 0.32)];
    for (let i = 0; i < 8; i++) R(g, x + i, y, 1, h, shade[i]);
    for (const fx of [2, 5]) for (let yy = y + 2; yy < y + h - 2; yy += 2) P(g, x + fx, yy, G.dk(col, 0.12));
    R(g, x - 2, y - 4, 12, 4, G.lt(col, 0.15)); R(g, x - 2, y - 4, 12, 1, G.lt(col, 0.4)); R(g, x - 2, y - 1, 12, 1, G.dk(col, 0.25));
    P(g, x - 2, y - 3, G.dk(col, 0.3)); P(g, x + 9, y - 3, G.dk(col, 0.3));
    R(g, x - 1, y + h, 10, 3, G.lt(col, 0.1)); R(g, x - 1, y + h + 2, 10, 1, G.dk(col, 0.25));
  }

  // ---------------- genel bina ----------------
  function generic(sp) {
    const ww = sp.w * 16, W = ww + 16, H = sp.fh * 16 + sp.extra, ox = 8;
    const c = G.canvas(W, H), g = c.g;
    const wallH = sp.wallH, wy = H - wallH, seed = U.hash(sp.key);
    const wins = [], lights = [];
    let smoke = null;
    // duvar
    wall(g, ox, wy, ww, wallH - 5, sp.wall, sp.wallCol, seed, { worn: sp.worn, beam: sp.beam });
    foundation(g, ox, H - 5, ww, sp.found);
    if (sp.wall !== 'stone' && sp.wall !== 'brick') { R(g, ox, wy, 3, wallH - 5, sp.trim); R(g, ox, wy, 1, wallH - 5, G.lt(sp.trim, 0.25)); R(g, ox + ww - 3, wy, 3, wallH - 5, G.dk(sp.trim, 0.2)); }
    if (sp.quoins) for (let yy = wy; yy < H - 6; yy += 6) { const qx = [ox, ox + ww - 6]; for (const q of qx) { R(g, q, yy, 6, 5, sp.quoins); R(g, q, yy, 6, 1, G.lt(sp.quoins, 0.3)); } }
    if (sp.ivy) ivy(g, ox + 1, wy + 6, wallH - 12, seed);
    // çatı
    const L = 2, Rr = W - 2, bot = wy + 3, top = sp.roofTop || 4;
    if (sp.roof === 'front') {
      const apex = Math.max(top + 8, wy - 18);
      frontGable(g, { L, Rr, top, bot, col: sp.roofCol, seed, apex, snow: sp.snow });
      // alınlık üçgeni (duvar malzemesi)
      const mid = Math.round(W / 2);
      G.poly(g, [[ox, wy + 1], [ox + ww, wy + 1], [mid, apex + 3]], sp.gableCol || sp.wallCol);
      if (sp.wall === 'wood' || sp.wall === 'timber') for (let yy = apex + 6; yy < wy; yy += 5) G.poly(g, [[ox, wy + 1], [ox + ww, wy + 1], [mid, apex + 3]], (x, y) => ((y - apex) % 5 === 0 ? G.dk(sp.gableCol || sp.wallCol, 0.18) : null));
      G.line(g, ox - 3, wy + 2, mid, apex, sp.trim); G.line(g, ox - 3, wy + 3, mid, apex + 1, G.lt(sp.trim, 0.2));
      G.line(g, ox + ww + 2, wy + 2, mid, apex, sp.trim); G.line(g, ox + ww + 2, wy + 3, mid, apex + 1, G.dk(sp.trim, 0.2));
      if (sp.gableWin) wins.push(windowAt(g, mid - 4, wy - 13, 8, 8, { trim: sp.trim, style: 'square' }));
      R(g, ox, wy + 1, ww, 3, SH(0.25));
    } else {
      const ridge = Math.round(top + (bot - top) * (sp.ridgeK || 0.33));
      const hip = sp.roof === 'gable' ? 0 : Math.min(Math.round((bot - top) * 0.5), Math.round(ww * 0.22));
      hipRoof(g, { L, Rr, top, bot, ridge, hip, col: sp.roofCol, seed, snow: sp.snow, worn: sp.worn });
      if (sp.roof === 'gable') { R(g, L, top, 2, bot - top, G.lt(sp.roofCol, 0.2)); R(g, Rr - 3, top, 3, bot - top, G.dk(sp.roofCol, 0.4)); }
      if (sp.dormer) {
        const dx = Math.round(ox + sp.dormer * 16 + 1), dy = ridge + 4;
        R(g, dx - 1, dy, 16, 14, sp.wallCol); R(g, dx + 14, dy, 2, 14, SH(0.3));
        G.poly(g, [[dx - 3, dy + 1], [dx + 7, dy - 7], [dx + 17, dy + 1]], G.dk(sp.roofCol, 0.05));
        wins.push(windowAt(g, dx + 3, dy + 3, 8, 8, { trim: sp.trim }));
      }
    }
    R(g, ox, bot, ww, 4, SH(0.28)); R(g, ox, bot + 4, ww, 2, SH(0.12));
    if (sp.chimney != null) smoke = chimney(g, Math.round(ox + sp.chimney * 16 + 3), (sp.roofTop || 4) + 2, Math.max(12, Math.round((bot - 4) * 0.45)), sp.chimCol || '#9a5040');
    // tente
    if (sp.awning) awning(g, ox - 2, ox + ww + 2, wy + 4, sp.awning);
    // pencereler
    const winY = wy + (sp.awning ? 19 : 10);
    const winH = Math.min(14, wallH - (sp.awning ? 37 : 26));
    for (const wx of sp.windows || []) {
      const wd = sp.winStyle === 'shop' ? 28 : 12;
      const x = Math.round(ox + wx * 16 + (sp.winStyle === 'shop' ? -6 : 2));
      const r = windowAt(g, x, winY + (sp.winStyle === 'arch' ? 4 : 0), wd, winH + (sp.winStyle === 'shop' ? 2 : 0), { trim: sp.trim, style: sp.winStyle, shutters: sp.shutters, box: sp.winBox, boarded: sp.boarded, curtains: sp.curtains, goods: sp.goods });
      if (r) wins.push(r);
    }
    // kapı
    if (sp.door != null) {
      const dw = sp.doorW || 12, dh = Math.min(22, wallH - 12);
      const dx = ox + sp.door * 16 + 8 - (dw >> 1);
      doorAt(g, dx, H - 5 - dh, dw, dh, { col: sp.doorCol, trim: sp.trim, style: sp.doorStyle, window: sp.doorWin, step: sp.step });
      c.door = [dx, H - 5 - dh, dw, dh];
      if (sp.lamp) { lights.push(wallLamp(g, dx - 9, H - dh - 2)); }
      if (sp.sign) {
        const sy = sp.awning ? wy - 1 : Math.max(wy + 1, H - 5 - dh - 17);
        if (sp.signStyle === 'hang') hangSign(g, dx + dw + 3, H - 5 - dh - 8, sp.sign, { bg: sp.signBg, fg: sp.signFg });
        else signBoard(g, ox + sp.door * 16 + 8 + (sp.signDx || 0), sy, sp.sign, { bg: sp.signBg, fg: sp.signFg, frame: sp.signFrame });
      }
    }
    if (sp.forge) {
      // demirci ocağı: açık kemer, kor ışığı
      const fx = Math.round(ox + sp.forge * 16), fy = H - 5 - 22;
      G.oval(g, fx - 1, fy - 6, 26, 14, '#3b3540'); R(g, fx - 1, fy, 26, 22, '#3b3540');
      G.oval(g, fx + 1, fy - 4, 22, 10, '#1e1218'); R(g, fx + 1, fy, 22, 20, '#1e1218');
      R(g, fx + 3, fy + 12, 18, 6, '#c8452e'); R(g, fx + 5, fy + 13, 14, 3, '#f2a02a'); R(g, fx + 8, fy + 13, 6, 2, '#fff2a0');
      wins.push([fx + 3, fy + 10, 18, 8]);
      lights.push([fx + 12, fy + 16, 'forge']);
    }
    if (sp.extraDraw) sp.extraDraw(g, { ox, ww, W, H, wy, bot });
    const o = G.outline(c);
    o.wins = wins.filter(Boolean); o.smoke = smoke; o.door = c.door; o.lamps = lights;
    return o;
  }

  // ---------------- müze ----------------
  function museum(sp) {
    const ww = sp.w * 16, W = ww + 16, H = sp.fh * 16 + sp.extra, ox = 8;
    const c = G.canvas(W, H), g = c.g, seed = 77;
    const st = sp.restored ? '#ece6d8' : '#d6cdbb', stD = G.dk(st, 0.18);
    const wallH = 64, wy = H - wallH;
    const wins = [], lights = [];
    // çatı (kırma) + kubbe
    const top = 18, bot = wy + 3;
    hipRoof(g, { L: 2, Rr: W - 2, top, bot, ridge: Math.round(top + (bot - top) * 0.35), hip: 34, col: sp.restored ? '#5f7486' : '#6e747c', seed, snow: sp.snow, worn: !sp.restored });
    const dcx = Math.round(W / 2), dTop = 2;
    // kubbe
    const dw = 50, dh = 30, dx0 = dcx - dw / 2, dy0 = top + 6;
    R(g, dx0 + 4, dy0 + dh - 8, dw - 8, 10, st); R(g, dx0 + 4, dy0 + dh - 8, dw - 8, 1, G.lt(st, 0.3));
    for (let k = 0; k < 6; k++) R(g, dx0 + 7 + k * 7, dy0 + dh - 6, 3, 6, '#5a7aa8');
    const dc = sp.restored ? '#5aa08f' : '#7a8a82';
    for (let j = 0; j < dh - 8; j++) {
      const yy = (j + 0.5) / (dh - 8), half = (dw / 2 - 2) * Math.sqrt(1 - Math.pow(1 - yy, 2));
      for (let i = -Math.round(half); i < Math.round(half); i++) {
        const t = (i + half) / (2 * half);
        const col = t < 0.25 ? G.lt(dc, 0.25) : t < 0.55 ? dc : t < 0.8 ? G.dk(dc, 0.18) : G.dk(dc, 0.32);
        P(g, dcx + i, dy0 + j, ((i + 40) % 7 === 0) ? G.dk(col, 0.18) : col);
      }
    }
    if (sp.snow) for (let i = -14; i < 14; i++) P(g, dcx + i, dy0 + 1 + Math.round(Math.abs(i) * 0.5), '#f4f8fa');
    R(g, dcx - 4, dTop + 6, 8, 10, st); R(g, dcx - 3, dTop + 8, 2, 5, '#3b3550'); R(g, dcx + 1, dTop + 8, 2, 5, '#3b3550');
    G.poly(g, [[dcx - 6, dTop + 7], [dcx, dTop], [dcx + 6, dTop + 7]], dc);
    R(g, dcx, 0, 1, 3, '#5a5260');
    if (sp.restored) { R(g, dcx + 1, 0, 6, 3, '#c8452e'); P(g, dcx + 1, 3, '#c8452e'); }
    // kanatlar
    wall(g, ox, wy, 36, wallH - 6, 'stone', st, seed + 1, { worn: !sp.restored });
    wall(g, ox + ww - 36, wy, 36, wallH - 6, 'stone', st, seed + 2, { worn: !sp.restored });
    for (const wx of [ox + 12, ox + ww - 24]) {
      const r = windowAt(g, wx, wy + 22, 12, 24, { trim: G.dk(st, 0.25), style: 'arch', boarded: !sp.restored && wx > ox + 20 });
      if (r) wins.push(r);
      R(g, wx + 4, wy + 11, 4, 3, G.lt(st, 0.2));
    }
    // ön cephe (revak arkası, gölgede)
    const cx0 = ox + 36, cx1 = ox + ww - 36;
    wall(g, cx0, wy + 6, cx1 - cx0, wallH - 12, 'stone', G.dk(st, 0.16), seed + 3, {});
    R(g, cx0, wy + 6, cx1 - cx0, 8, SH(0.3));
    const doorX = ox + sp.door * 16 + 8;
    doorAt(g, doorX - 11, H - 13 - 26, 22, 26, { col: sp.restored ? '#7a5030' : '#5a4030', trim: '#4a3828', style: 'arch', step: st });
    c.door = [doorX - 11, H - 39, 22, 26];
    wins.push([doorX - 9, H - 39 - 10, 18, 8]);
    for (const wx of [cx0 + 8, cx1 - 18]) { const r = windowAt(g, wx, wy + 24, 10, 18, { trim: G.dk(st, 0.3), style: 'arch' }); if (r) wins.push(r); }
    // basamaklar
    for (let k = 0; k < 3; k++) {
      const sw = (cx1 - cx0) + 10 + k * 8, sx = Math.round(W / 2 - sw / 2), sy = H - 3 - (2 - k) * 3 - 3;
      R(g, sx, sy, sw, 3, k === 2 ? G.dk(st, 0.05) : st); R(g, sx, sy, sw, 1, G.lt(st, 0.35)); R(g, sx, sy + 2, sw, 1, G.dk(st, 0.25));
    }
    R(g, ox - 1, H - 6, 36, 6, '#a89e8c'); R(g, ox + ww - 35, H - 6, 36, 6, '#a89e8c'); R(g, ox - 1, H - 6, 36, 1, '#c8c0b0'); R(g, ox + ww - 35, H - 6, 36, 1, '#c8c0b0');
    // sütunlar
    const colY = wy + 17, colH = wallH - 31;
    const centers = [cx0 + 6, cx0 + 24, doorX - 18, doorX + 18, cx1 - 24, cx1 - 6];
    for (const cxx of centers) column(g, cxx - 4, colY, colH, sp.restored ? '#f6f0e2' : '#ddd5c2');
    // pankartlar
    if (sp.banners) for (const bx of [cx0 + 13, cx1 - 17]) { R(g, bx, colY + 4, 6, 18, '#a8453a'); R(g, bx, colY + 4, 6, 1, '#f2c14e'); G.oval(g, bx + 1, colY + 9, 4, 5, '#f2c14e'); P(g, bx, colY + 22, '#a8453a'); P(g, bx + 5, colY + 22, '#a8453a'); }
    // saçaklık + yazı
    const eY = wy + 4;
    R(g, cx0 - 6, eY, cx1 - cx0 + 12, 12, st); R(g, cx0 - 6, eY, cx1 - cx0 + 12, 1, G.lt(st, 0.4));
    R(g, cx0 - 6, eY + 3, cx1 - cx0 + 12, 1, stD); R(g, cx0 - 8, eY + 11, cx1 - cx0 + 16, 2, G.lt(st, 0.2)); R(g, cx0 - 8, eY + 13, cx1 - cx0 + 16, 1, SH(0.4));
    for (let x = cx0 - 2; x < cx1 + 2; x += 8) { R(g, x, eY + 5, 1, 5, stD); R(g, x + 2, eY + 5, 1, 5, stD); }
    const label = 'MÜZE';
    const lw = G.textW(label) + 8;
    R(g, Math.round(W / 2 - lw / 2), eY + 4, lw, 7, G.lt(st, 0.25));
    G.text(g, label, Math.round(W / 2 - lw / 2) + 4, eY + 5 + 0, sp.emblem ? '#a87a10' : '#5a4a3a');
    // alınlık
    const pw = cx1 - cx0 + 20, px0 = Math.round(W / 2 - pw / 2), ph = 24;
    G.poly(g, [[px0, eY + 1], [px0 + pw, eY + 1], [W / 2, eY - ph]], G.lt(st, 0.12));
    G.poly(g, [[px0 + 7, eY - 1], [px0 + pw - 7, eY - 1], [W / 2, eY - ph + 5]], G.dk(st, 0.08));
    G.line(g, px0, eY, Math.round(W / 2), eY - ph, G.lt(st, 0.45)); G.line(g, px0 + pw - 1, eY, Math.round(W / 2), eY - ph, G.dk(st, 0.2));
    G.line(g, px0 + 1, eY + 1, Math.round(W / 2), eY - ph + 1, stD);
    const em = sp.emblem ? '#f2c14e' : G.dk(st, 0.28);
    G.oval(g, W / 2 - 6, eY - 14, 12, 12, em); G.oval(g, W / 2 - 3, eY - 11, 6, 6, sp.emblem ? '#fff2b0' : G.dk(st, 0.1));
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; P(g, Math.round(W / 2 + Math.cos(a) * 8), Math.round(eY - 8 + Math.sin(a) * 8), em); }
    lights.push([doorX - 16, H - 30], [doorX + 16, H - 30]);
    for (const [lx, ly] of lights) { R(g, lx - 1, ly - 6, 4, 6, '#3b3540'); R(g, lx, ly - 5, 2, 4, '#ffe8a0'); }
    const o = G.outline(c);
    o.wins = wins; o.door = c.door; o.lamps = lights.map(l => [l[0], l[1] - 3]);
    return o;
  }

  // ---------------- belediye ----------------
  function townhall(sp) {
    const ww = sp.w * 16, W = ww + 16, H = sp.fh * 16 + sp.extra, ox = 8;
    const c = G.canvas(W, H), g = c.g, seed = 91;
    const wallH = 56, wy = H - wallH, wins = [], lights = [];
    const top = 16, bot = wy + 3;
    hipRoof(g, { L: 2, Rr: W - 2, top, bot, ridge: Math.round(top + (bot - top) * 0.34), hip: 30, col: '#7a4a3a', seed, snow: sp.snow });
    // çan kulesi
    const cx = Math.round(W / 2);
    R(g, cx - 7, top - 4, 14, 16, '#e8e0d0'); R(g, cx + 5, top - 3, 2, 15, SH(0.3)); R(g, cx - 4, top, 8, 7, '#3b3550'); G.oval(g, cx - 2, top + 2, 4, 4, '#c9a050');
    G.poly(g, [[cx - 9, top - 3], [cx, top - 14], [cx + 9, top - 3]], '#6a3a2e'); G.poly(g, [[cx, top - 14], [cx + 9, top - 3], [cx + 2, top - 3]], '#4a2a22');
    R(g, cx, top - 20, 1, 7, '#5a5260'); R(g, cx + 1, top - 20, 7, 4, '#c8352e'); R(g, cx + 3, top - 19, 2, 2, '#ffffff');
    wall(g, ox, wy, ww, wallH - 5, 'brick', '#a85a40', seed, {});
    foundation(g, ox, H - 5, ww, '#9a9284');
    for (let yy = wy; yy < H - 6; yy += 6) for (const q of [ox, ox + ww - 6, ox + 50, ox + ww - 56]) { R(g, q, yy, 6, 5, '#ddd5c4'); R(g, q, yy, 6, 1, '#f2ece0'); }
    // orta alınlık
    const px0 = ox + 50, pw = ww - 100, mid = Math.round(W / 2);
    G.poly(g, [[px0 - 4, wy + 2], [px0 + pw + 4, wy + 2], [mid, wy - 18]], '#ece4d4');
    G.line(g, px0 - 4, wy + 2, mid, wy - 18, '#fff8ec'); G.line(g, px0 + pw + 3, wy + 2, mid, wy - 18, '#b8ae9c');
    G.oval(g, mid - 7, wy - 12, 14, 14, '#5a4a3a'); G.oval(g, mid - 6, wy - 11, 12, 12, '#fff8ec');
    R(g, mid, wy - 9, 1, 4, '#2a1a24'); R(g, mid, wy - 5, 3, 1, '#2a1a24');
    R(g, ox, bot, ww, 4, SH(0.25));
    signBoard(g, mid, wy + 6, 'BELEDİYE', { bg: '#f2ece0', fg: '#5a2a1a', frame: '#4a3828' });
    for (const wx of [ox + 12, ox + 32, ox + ww - 44, ox + ww - 24]) { const r = windowAt(g, wx, wy + 16, 10, 18, { trim: '#ece4d4', shutters: '#2f5a4a', curtains: '#c8a060' }); if (r) wins.push(r); }
    const doorX = ox + sp.door * 16 + 8;
    doorAt(g, doorX - 9, H - 5 - 24, 18, 24, { col: '#5a3020', trim: '#ece4d4', style: 'double', window: false, step: '#c8c0b0' });
    c.door = [doorX - 9, H - 29, 18, 24];
    for (const lx of [doorX - 16, doorX + 13]) lights.push(wallLamp(g, lx, H - 30));
    const o = G.outline(c);
    o.wins = wins; o.door = c.door; o.lamps = lights;
    return o;
  }

  // ---------------- liman deposu ----------------
  function warehouse(sp) {
    const ww = sp.w * 16, W = ww + 16, H = sp.fh * 16 + sp.extra, ox = 8;
    const c = G.canvas(W, H), g = c.g, seed = 55;
    const wallH = 50, wy = H - wallH, wins = [], lights = [];
    const top = 6, bot = wy + 3, rc = '#5a4a48';
    G.poly(g, [[2, top], [W - 2, top], [W - 2, bot], [2, bot]], (x, y) => (x % 4 === 0 ? G.dk(rc, 0.3) : x % 4 === 1 ? G.lt(rc, 0.15) : (U.h2(x >> 2, y >> 3, 9) < 0.15 ? '#8a5a3a' : rc)));
    R(g, 2, Math.round(top + (bot - top) * 0.33), W - 4, 2, G.lt(rc, 0.25));
    if (sp.snow) R(g, 2, top, W - 4, Math.round((bot - top) * 0.33), '#eef4f6');
    R(g, 2, bot - 2, W - 4, 3, G.dk(rc, 0.45)); R(g, 2, top, 2, bot - top, G.lt(rc, 0.2)); R(g, W - 5, top, 3, bot - top, G.dk(rc, 0.45));
    wall(g, ox, wy, ww, wallH - 5, 'vwood', '#8a7a68', seed, { worn: true });
    foundation(g, ox, H - 5, ww, '#6e675c');
    R(g, ox, bot, ww, 4, SH(0.3));
    for (const wx of [ox + 8, ox + ww - 20]) { const r = windowAt(g, wx, wy + 8, 12, 8, { trim: '#4a3a2a' }); if (r) wins.push(r); }
    const doorX = ox + sp.door * 16 + 8, dx = doorX - 14, dy = H - 5 - 30;
    R(g, dx - 2, dy - 2, 32, 32, '#3b2a20');
    for (const lx of [dx, dx + 14]) { R(g, lx, dy, 14, 30, '#7a5a3a'); for (let k = 0; k < 14; k += 3) R(g, lx + k, dy, 1, 30, '#5a4028'); G.line(g, lx + 1, dy + 1, lx + 12, dy + 28, '#4a3020'); G.line(g, lx + 12, dy + 1, lx + 1, dy + 28, '#4a3020'); R(g, lx, dy, 14, 2, '#4a3020'); R(g, lx, dy + 14, 14, 2, '#4a3020'); }
    R(g, dx - 4, dy - 4, 36, 2, '#3b3540'); P(g, dx + 6, dy - 3, '#7a7280'); P(g, dx + 22, dy - 3, '#7a7280');
    c.door = [dx, dy, 28, 30];
    const t = 'LİMAN DEPOSU';
    signBoard(g, Math.round(W / 2), wy + 3, t, { bg: '#b8a888', fg: '#4a3a2a', frame: '#3b2a20' });
    lights.push(wallLamp(g, dx + 33, dy + 4));
    const o = G.outline(c);
    o.wins = wins; o.door = c.door; o.lamps = lights;
    return o;
  }

  const cache = {};
  AK.Bld = {
    draw(sp) {
      const k = sp.key + '|' + (sp.snow ? 1 : 0);
      if (!cache[k]) cache[k] = sp.kind === 'museum' ? museum(sp) : sp.kind === 'townhall' ? townhall(sp) : sp.kind === 'warehouse' ? warehouse(sp) : generic(sp);
      return cache[k];
    },
    // bina gölgesi: ışık sol üstten, gölge sağ alta düşer
    shadow(bx, by, w, fh) {
      const k = 'sh' + w + 'x' + fh;
      if (cache[k]) return cache[k];
      const W = w * 16 + 18, H = fh * 16 + 10, c = G.canvas(W, H), g = c.g;
      const col = 'rgba(30,16,40,0.24)';
      G.poly(g, [[w * 16, 6], [w * 16 + 14, 16], [w * 16 + 14, fh * 16 + 7], [w * 16, fh * 16 + 7]], col);
      G.poly(g, [[8, fh * 16], [w * 16, fh * 16], [w * 16, fh * 16 + 7], [12, fh * 16 + 7]], col);
      return (cache[k] = c);
    },
  };
})();
