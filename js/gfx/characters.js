// Karakter sprite üreticisi v2 (16x28). Işık sol üstten; renkli kontur; oturma pozu dahil.
// look: {skin, hair, hairStyle, eyes, shirt, outfit, outfitCol, pants, shoes, body, acc:[], hat, hatCol, hatBand, beardCol, scarfCol}
(function () {
  const G = AK.Gfx;
  const W = 16, H = 28;
  const EYE = '#2a1a2a';

  // kafa satırları (sol-sağ x aralıkları), y = 3..13
  const HEAD_F = [[4, 11], [3, 12], [2, 13], [2, 13], [2, 13], [2, 13], [2, 13], [2, 13], [2, 13], [3, 12], [4, 11]];
  const HEAD_S = [[5, 10], [4, 11], [3, 12], [3, 12], [3, 12], [3, 12], [3, 12], [3, 12], [3, 12], [4, 11], [5, 10]];

  function draw(L, dir, act, step) {
    const c = G.canvas(W, H), g = c.g;
    const R = (x, y, w, h, col) => { if (w <= 0 || h <= 0) return; g.fillStyle = col; g.fillRect(x, y, w, h); };
    const P = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    const skin = L.skin, skinD = G.dk(skin, 0.16), skinDD = G.dk(skin, 0.3), skinL = G.lt(skin, 0.22);
    const hair = L.hair, hairD = G.dk(hair, 0.28), hairL = G.lt(hair, 0.28), hairLL = G.lt(hair, 0.5);
    const shirt = L.shirt, shirtD = G.dk(shirt, 0.2), shirtDD = G.dk(shirt, 0.34), shirtL = G.lt(shirt, 0.18);
    const pants = L.pants || '#5a4a3a', pantsD = G.dk(pants, 0.25), pantsL = G.lt(pants, 0.12);
    const shoes = L.shoes || '#3b2a20', shoesL = G.lt(shoes, 0.28);
    const oc = L.outfitCol || shirt, ocD = G.dk(oc, 0.22), ocL = G.lt(oc, 0.18);
    const eyeC = L.eyes || '#4a3a5a';
    const body = L.body || 'normal', wide = body === 'wide', thin = body === 'thin';
    const side = dir === 'side', up = dir === 'up', down = dir === 'down';
    const walk = act === 'walk', sit = act === 'sit';
    const bob = walk && (step === 1 || step === 3) ? 1 : 0;
    const oy = bob + (sit ? 3 : 0);
    const acc = L.acc || [];
    const hs = L.hairStyle || 'short';
    const hood = acc.includes('hood');
    const outfit = L.outfit || 'shirt';

    // ---------- arka saç (uzun saç sırtta) ----------
    if (up && !hood) {
      if (hs === 'long') { R(3, 12 + oy, 10, 7, hair); R(3, 18 + oy, 10, 1, hairD); R(4, 13 + oy, 1, 5, hairL); }
      if (hs === 'ponytail') { R(7, 11 + oy, 2, 7, hair); P(7, 12 + oy, hairL); R(7, 17 + oy, 2, 1, hairD); }
    }
    if (side && !hood) {
      if (hs === 'long') { R(2, 7 + oy, 4, 11, hair); R(2, 17 + oy, 4, 1, hairD); P(3, 9 + oy, hairL); }
      if (hs === 'ponytail') { R(1, 7 + oy, 2, 7, hair); P(1, 13 + oy, hairD); P(2, 8 + oy, hairL); }
    }

    // ---------- bacaklar ----------
    const tx = side ? (wide ? 4 : thin ? 6 : 5) : (wide ? 3 : thin ? 5 : 4);
    const tw = side ? (wide ? 8 : thin ? 5 : 6) : (wide ? 10 : thin ? 6 : 8);
    if (!side) {
      const lx = tx + (wide ? 1 : 1), rx = tx + tw - 4;
      if (sit) {
        if (!up) { R(lx, 24, 3, 1, pants); R(rx, 24, 3, 1, pantsD); R(lx - 1, 25, 4, 2, shoes); R(rx, 25, 4, 2, shoes); P(lx - 1, 25, shoesL); P(rx, 25, shoesL); }
      } else {
        const lL = walk && step === 1 ? 1 : 0, rL = walk && step === 3 ? 1 : 0;
        R(lx, 21, 3, 4 - lL, pants); P(lx + 2, 21, pantsD); R(lx + 2, 22, 1, 3 - lL, pantsD); P(lx, 21, pantsL);
        R(rx, 21, 3, 4 - rL, pantsD); P(rx, 21, pants);
        R(lx - (up ? 0 : 1), 25 - lL, 4, 2, shoes); P(lx - (up ? 0 : 1), 25 - lL, shoesL);
        R(rx, 25 - rL, 4, 2, shoes); P(rx + 1, 25 - rL, shoesL);
      }
    } else {
      if (sit) {
        R(tx, 22, tw + 2, 2, pants); R(tx, 23, tw + 2, 1, pantsD);
        R(tx + tw, 24, 2, 1, pants); R(tx + tw, 25, 3, 2, shoes); P(tx + tw, 25, shoesL);
      } else {
        let back = 6, front = 8;
        if (walk && (step === 1 || step === 3)) { back = 5; front = 9; }
        const bc = step === 3 ? pants : pantsD, fc = step === 3 ? pantsD : pants;
        R(back, 21, 2, 4, bc); R(back, 25, 3, 2, G.dk(shoes, 0.1));
        R(front, 21, 2, 4, fc); P(front, 21, pantsL); R(front, 25, 4, 2, shoes); P(front + 1, 25, shoesL);
      }
    }
    // ---------- gövde ----------
    R(tx, 14 + oy, tw, 7, shirt);
    if (side) { R(tx, 14 + oy, 1, 7, shirtL); R(tx + tw - 1, 14 + oy, 1, 7, shirtD); }
    else { R(tx, 14 + oy, 1, 7, shirtL); R(tx + tw - 2, 14 + oy, 2, 7, shirtD); P(tx + tw - 1, 15 + oy, shirtDD); P(tx + 2, 17 + oy, shirtD); P(tx + 3, 18 + oy, shirtD); }
    R(tx, 20 + oy, tw, 1, pantsD);
    if (down && outfit !== 'robe' && outfit !== 'coat') P(tx + (tw >> 1) - 1, 20 + oy, '#c9a050');
    if (outfit === 'apron') {
      const ax = side ? tx + 1 : tx + 1, aw = side ? tw - 1 : tw - 2;
      R(ax, 16 + oy, aw, 7 - (sit ? 2 : 0), oc); R(ax + aw - 1, 16 + oy, 1, 7 - (sit ? 2 : 0), ocD); R(ax, 16 + oy, aw, 1, ocL);
      if (down) { P(tx + 1, 14 + oy, oc); P(tx + 1, 15 + oy, oc); P(tx + tw - 2, 14 + oy, oc); P(tx + tw - 2, 15 + oy, oc); R(ax + 2, 19 + oy, aw - 4, 2, ocD); R(ax + 2, 19 + oy, aw - 4, 1, oc); }
    } else if (outfit === 'dress') {
      R(tx - 1, 19 + oy, tw + 2, 4 - (sit ? 1 : 0), oc); R(tx + tw - 1, 19 + oy, 2, 4 - (sit ? 1 : 0), ocD); R(tx - 1, 22 + oy - (sit ? 1 : 0), tw + 2, 1, ocD); R(tx, 18 + oy, tw, 1, ocD);
      R(tx, 14 + oy, tw, 4, oc); R(tx + tw - 2, 14 + oy, 2, 4, ocD); R(tx, 14 + oy, 1, 4, ocL);
      if (down) { P(tx + (tw >> 1) - 1, 14 + oy, skinD); P(tx + (tw >> 1), 14 + oy, skinD); }
    } else if (outfit === 'coat') {
      const ch = sit ? 7 : 9;
      R(tx, 14 + oy, tw, ch, oc); R(tx + tw - 2, 14 + oy, 2, ch, ocD); R(tx, 14 + oy, 1, ch, ocL);
      if (down) { R(tx + (tw >> 1) - 1, 14 + oy, 2, 3, shirt); P(tx + (tw >> 1) - 2, 15 + oy, ocL); P(tx + (tw >> 1) + 1, 15 + oy, ocD); R(tx + (tw >> 1), 17 + oy, 1, ch - 3, ocD); P(tx + 2, 18 + oy, G.dk(oc, 0.35)); }
      if (up) R(tx + (tw >> 1), 18 + oy, 1, ch - 4, ocD);
    } else if (outfit === 'vest') {
      if (!side) { R(tx, 14 + oy, 2, 7, oc); R(tx + tw - 2, 14 + oy, 2, 7, ocD); if (down) { P(tx + 1, 16 + oy, ocL); P(tx + tw - 2, 17 + oy, '#c9a050'); } }
      else R(tx, 14 + oy, tw - 2, 7, oc);
    } else if (outfit === 'robe') {
      const rh = sit ? 9 : 11;
      R(tx - 1, 14 + oy, tw + 2, rh, oc); R(tx + tw - 1, 14 + oy, 2, rh, ocD); R(tx - 1, 13 + oy + rh, tw + 2, 1, G.dk(oc, 0.35)); R(tx - 1, 14 + oy, 1, rh, ocL);
    } else if (outfit === 'tunic') {
      R(tx - 1, 18 + oy, tw + 2, 4, oc); R(tx, 18 + oy, tw, 1, '#f2c14e'); R(tx + tw, 18 + oy, 1, 4, ocD);
    } else if (down) {
      P(tx + (tw >> 1) - 1, 14 + oy, skinD); P(tx + (tw >> 1), 14 + oy, skinD); P(tx + (tw >> 1) - 2, 14 + oy, shirtL); P(tx + (tw >> 1) + 1, 14 + oy, shirtL);
      P(tx + (tw >> 1), 16 + oy, shirtDD); P(tx + (tw >> 1), 18 + oy, shirtDD);
    }
    if (acc.includes('scarf')) { const sc = L.scarfCol || '#c8553d'; R(tx, 14 + oy, tw, 2, sc); R(tx, 15 + oy, tw, 1, G.dk(sc, 0.2)); if (down) R(tx + 1, 16 + oy, 2, 3, sc); }

    // ---------- kollar ----------
    const armsUp = act === 'raise' || act === 'hold';
    const sleeve = outfit === 'coat' || outfit === 'robe' ? oc : shirt, sleeveD = G.dk(sleeve, 0.22), sleeveL = G.lt(sleeve, 0.15);
    const drawArms = () => {
      if (!side) {
        const lax = tx - 2, rax = tx + tw;
        if (act === 'raise') {
          R(lax, 9 + oy, 2, 6, sleeve); P(lax, 9 + oy, sleeveL); R(lax, 7 + oy, 2, 2, skin); R(rax, 9 + oy, 2, 6, sleeveD); R(rax, 7 + oy, 2, 2, skinD);
        } else if (act === 'hold') {
          R(lax + 1, 5 + oy, 2, 9, sleeve); R(lax + 1, 3 + oy, 2, 2, skin); R(rax - 1, 5 + oy, 2, 9, sleeveD); R(rax - 1, 3 + oy, 2, 2, skin);
        } else if (act === 'strike' || act === 'brush') {
          const b = act === 'brush' ? (step % 2) : 0;
          R(lax + 1, 14 + oy, 2, 5, sleeve); R(rax - 1, 14 + oy, 2, 5, sleeveD);
          R(tx + 2 + b, 19 + oy, tw - 4, 2, skin); R(tx + 2 + b, 20 + oy, tw - 4, 1, skinD);
        } else if (sit) {
          R(lax, 14 + oy, 2, 5, sleeve); R(rax, 14 + oy, 2, 5, sleeveD); R(lax + 1, 19 + oy, 2, 1, skin); R(rax - 1, 19 + oy, 2, 1, skinD);
        } else {
          const a = walk ? (step === 1 ? 1 : step === 3 ? -1 : 0) : 0;
          R(lax, 14 + oy + a, 2, 6, sleeve); P(lax, 14 + oy + a, sleeveL); R(lax, 19 + oy + a, 2, 1, sleeveD); R(lax, 20 + oy + a, 2, 1, skin);
          R(rax, 14 + oy - a, 2, 6, sleeveD); R(rax + 1, 15 + oy - a, 1, 4, G.dk(sleeve, 0.34)); R(rax, 20 + oy - a, 2, 1, skinD);
        }
      } else {
        const ax = tx + (tw >> 1) - 1;
        if (act === 'raise') { R(ax - 1, 9 + oy, 2, 6, sleeve); R(ax - 1, 7 + oy, 2, 2, skin); }
        else if (act === 'hold') { R(ax, 5 + oy, 2, 9, sleeve); R(ax, 3 + oy, 2, 2, skin); }
        else if (act === 'strike') { R(ax, 15 + oy, 5, 2, sleeve); R(ax + 5, 15 + oy, 2, 2, skin); }
        else if (act === 'brush') { const b = step % 2; R(ax, 16 + oy, 3 + b, 2, sleeve); R(ax + 3 + b, 17 + oy, 2, 1, skin); }
        else if (sit) { R(ax, 14 + oy, 2, 4, sleeve); R(ax + 1, 18 + oy, 3, 2, sleeve); R(ax + 4, 18 + oy, 1, 2, skin); }
        else {
          const a = walk ? (step === 1 ? 1 : step === 3 ? -1 : 0) : 0;
          R(ax + a, 14 + oy, 2, 6, sleeve); R(ax + a + 1, 14 + oy, 1, 6, sleeveD); R(ax + a * 2, 20 + oy, 2, 1, skin);
        }
      }
    };
    if (!armsUp) drawArms();

    // ---------- kafa ----------
    const HD = side ? HEAD_S : HEAD_F;
    for (let j = 0; j < 11; j++) { const [a, b] = HD[j]; R(a, 3 + j + oy, b - a + 1, 1, skin); P(b, 3 + j + oy, skinD); }
    { const [a, b] = HD[10]; R(a, 13 + oy, b - a + 1, 1, skinD); }
    { const [a, b] = HD[9]; P(b, 12 + oy, skinDD); }
    if (down) {
      P(3, 8 + oy, skinL); P(3, 9 + oy, skinL);
      // gözler: üstte koyu, altta iris rengi, beyaz parıltı
      P(5, 8 + oy, EYE); P(5, 9 + oy, eyeC); P(10, 8 + oy, EYE); P(10, 9 + oy, eyeC);
      P(4, 8 + oy, G.mix(skin, '#ffffff', 0.15));
      P(8, 10 + oy, skinD);
      const mouth = G.mix(skin, '#a03a3a', 0.4);
      P(7, 11 + oy, mouth); P(8, 11 + oy, mouth);
      const blush = G.mix(skin, '#ff6a6a', 0.3);
      P(3, 10 + oy, blush); P(12, 10 + oy, blush);
    } else if (side) {
      P(10, 8 + oy, EYE); P(10, 9 + oy, eyeC);
      P(13, 9 + oy, skin); P(13, 10 + oy, skinD);
      P(11, 11 + oy, G.mix(skin, '#a03a3a', 0.4));
      R(6, 8 + oy, 1, 3, skinD); P(7, 9 + oy, skinDD);
      P(10, 10 + oy, G.mix(skin, '#ff6a6a', 0.28));
    }

    // ---------- saç ----------
    if (!hood) {
      if (down) {
        if (hs === 'bald') { R(2, 7 + oy, 1, 4, hair); R(13, 7 + oy, 1, 4, hairD); P(5, 4 + oy, skinL); P(6, 4 + oy, G.lt(skin, 0.4)); }
        else {
          const cap = hs === 'curly' ? [[3, 12], [2, 13], [1, 14], [1, 14], [1, 14]] : [[4, 11], [3, 12], [2, 13], [2, 13], [2, 13]];
          cap.forEach(([a, b], j) => R(a, 2 + j + oy, b - a + 1, 1, hair));
          // perçem
          const fr = hs === 'spiky' ? [2, 3, 5, 6, 8, 9, 11, 12, 13] : hs === 'curly' ? [1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14] : [2, 3, 4, 6, 7, 8, 9, 11, 12, 13];
          for (const x of fr) P(x, 7 + oy, hairD);
          for (const x of fr) if (x % 3 !== 1) P(x, 6 + oy, hair);
          R(2, 7 + oy, 1, 3, hair); R(13, 7 + oy, 1, 3, hairD);
          if (hs === 'curly') { R(1, 7 + oy, 1, 4, hair); R(14, 7 + oy, 1, 4, hairD); for (let x = 2; x < 14; x += 3) P(x, 3 + oy, hairL); }
          R(5, 3 + oy, 4, 1, hairL); P(4, 4 + oy, hairL); P(6, 3 + oy, hairLL);
          if (hs === 'spiky') for (let x = 3; x < 13; x += 2) { P(x, 1 + oy, hair); P(x, 0 + oy, hairD); }
          if (hs === 'long') { R(1, 7 + oy, 2, 10, hair); R(13, 7 + oy, 2, 10, hairD); P(1, 17 + oy, hairD); P(14, 17 + oy, G.dk(hair, 0.4)); P(2, 9 + oy, hairL); }
          if (hs === 'bun') { G.oval(g, 5, -1 + oy, 6, 5, hair); P(6, 0 + oy, hairL); P(7, 0 + oy, hairLL); R(5, 3 + oy, 6, 1, hairD); }
          if (hs === 'ponytail') { R(14, 6 + oy, 1, 6, hairD); P(14, 12 + oy, G.dk(hair, 0.4)); R(5, 2 + oy, 6, 1, '#c8553d'); }
        }
      } else if (up) {
        if (hs === 'bald') { R(2, 7 + oy, 12, 5, hair); P(6, 4 + oy, skinL); }
        else {
          HD.forEach(([a, b], j) => { if (j < 10) R(a, 3 + j + oy, b - a + 1, 1, hair); });
          R(4, 2 + oy, 8, 1, hair);
          R(4, 3 + oy, 5, 1, hairL); P(5, 4 + oy, hairLL);
          for (let x = 3; x < 13; x += 2) P(x, 12 + oy, hairD);
          R(12, 5 + oy, 2, 6, hairD);
          if (hs === 'curly') { R(1, 4 + oy, 14, 8, hair); for (let x = 2; x < 14; x += 3) P(x, 5 + oy, hairL); }
          if (hs === 'bun') { G.oval(g, 5, -1 + oy, 6, 5, hair); P(6, 0 + oy, hairL); }
          if (hs === 'spiky') for (let x = 3; x < 13; x += 2) P(x, 1 + oy, hair);
          R(5, 13 + oy, 6, 1, skinD);
        }
      } else {
        if (hs === 'bald') { R(3, 7 + oy, 3, 4, hair); P(6, 4 + oy, skinL); }
        else {
          [[5, 10], [4, 11], [3, 12], [3, 12], [3, 12]].forEach(([a, b], j) => R(a, 2 + j + oy, b - a + 1, 1, hair));
          R(3, 7 + oy, 4, 4, hair); R(3, 11 + oy, 3, 1, hairD); P(11, 7 + oy, hairD); P(12, 7 + oy, hairD); P(12, 6 + oy, hair);
          R(5, 3 + oy, 4, 1, hairL); P(6, 2 + oy, hairLL);
          if (hs === 'curly') { R(2, 2 + oy, 10, 6, hair); R(2, 8 + oy, 4, 4, hair); for (let x = 3; x < 11; x += 3) P(x, 3 + oy, hairL); }
          if (hs === 'spiky') for (let x = 4; x < 12; x += 2) P(x, 1 + oy, hair);
          if (hs === 'bun') { G.oval(g, 2, 0 + oy, 5, 5, hair); P(3, 1 + oy, hairL); }
          if (hs === 'ponytail') R(2, 5 + oy, 2, 2, '#c8553d');
        }
      }
    }
    // ---------- aksesuarlar ----------
    const fr = '#4a4a5a';
    if (acc.includes('glasses')) {
      if (down) { R(3, 8 + oy, 4, 1, fr); R(9, 8 + oy, 4, 1, fr); P(7, 8 + oy, fr); P(8, 8 + oy, fr); P(4, 8 + oy, '#dff0ff'); P(10, 8 + oy, '#dff0ff'); P(5, 9 + oy, EYE); P(10, 9 + oy, EYE); }
      else if (side) { R(9, 8 + oy, 3, 1, fr); R(6, 8 + oy, 3, 1, fr); P(10, 8 + oy, '#dff0ff'); }
    }
    const bc = L.beardCol || hair, bcD = G.dk(bc, 0.25);
    if (acc.includes('beard')) {
      if (down) { R(2, 9 + oy, 1, 4, bc); R(13, 9 + oy, 1, 4, bcD); R(3, 11 + oy, 10, 2, bc); R(4, 13 + oy, 8, 1, bc); R(5, 14 + oy, 6, 1, bcD); R(5, 10 + oy, 6, 1, bc); P(7, 11 + oy, skinDD); P(8, 11 + oy, skinDD); R(11, 11 + oy, 2, 3, bcD); }
      else if (side) { R(7, 10 + oy, 6, 3, bc); R(8, 13 + oy, 4, 1, bcD); P(12, 11 + oy, bcD); }
    }
    if (acc.includes('mustache')) {
      if (down) { R(5, 10 + oy, 2, 1, bc); R(9, 10 + oy, 2, 1, bc); P(7, 10 + oy, bcD); P(8, 10 + oy, bcD); P(4, 11 + oy, bc); P(11, 11 + oy, bcD); }
      else if (side) { R(10, 10 + oy, 3, 1, bc); P(13, 10 + oy, bcD); }
    }
    if (hood) {
      const hc = L.hatCol || '#3b3550', hcD = G.dk(hc, 0.3), hcL = G.lt(hc, 0.15);
      if (up) { R(1, 2 + oy, 14, 13, hc); R(1, 2 + oy, 2, 13, hcL); R(12, 2 + oy, 3, 13, hcD); }
      else {
        R(2, 2 + oy, 12, 4, hc); R(1, 4 + oy, 2, 10, hc); R(13, 4 + oy, 2, 10, hcD); R(3, 1 + oy, 10, 1, hc); R(3, 2 + oy, 4, 1, hcL);
        if (down) { R(3, 6 + oy, 10, 7, G.dk(skin, 0.6)); P(5, 8 + oy, '#f2e6a0'); P(10, 8 + oy, '#f2e6a0'); R(3, 6 + oy, 10, 1, hcD); }
        else { R(5, 6 + oy, 8, 7, G.dk(skin, 0.6)); P(10, 8 + oy, '#f2e6a0'); R(1, 4 + oy, 5, 10, hc); }
      }
    }
    const hat = L.hat;
    if (hat) {
      const hc = L.hatCol || '#c9a26a', hd = G.dk(hc, 0.25), hl = G.lt(hc, 0.3), hb = L.hatBand || '#7a4f2a';
      if (hat === 'safari') {
        if (!side) { R(0, 6 + oy, 16, 1, hd); R(1, 5 + oy, 14, 1, hc); R(3, 1 + oy, 10, 4, hc); R(3, 4 + oy, 10, 1, hb); R(4, 1 + oy, 4, 1, hl); R(11, 1 + oy, 2, 4, hd); }
        else { R(1, 6 + oy, 14, 1, hd); R(2, 5 + oy, 12, 1, hc); R(4, 1 + oy, 8, 4, hc); R(4, 4 + oy, 8, 1, hb); R(5, 1 + oy, 3, 1, hl); }
      } else if (hat === 'cap') {
        R(2, 1 + oy, 12, 5, hc); R(3, 1 + oy, 4, 1, hl); R(12, 2 + oy, 2, 4, hd);
        if (down) R(3, 6 + oy, 10, 1, hd); else if (side) R(11, 5 + oy, 4, 1, hd);
      } else if (hat === 'bandana') {
        R(2, 2 + oy, 12, 3, hc); R(2, 5 + oy, 12, 1, hd); for (let i = 3; i < 13; i += 3) P(i, 3 + oy, '#ffffff');
        if (side) { P(2, 5 + oy, hc); P(1, 6 + oy, hc); } else P(13, 6 + oy, hc);
      } else if (hat === 'sunhat') {
        R(0, 6 + oy, 16, 1, hd); R(0, 5 + oy, 16, 1, hc); R(4, 1 + oy, 8, 4, hc); R(4, 4 + oy, 8, 1, hb); R(5, 1 + oy, 3, 1, hl);
      } else if (hat === 'tophat') {
        R(4, 0 + oy, 8, 6, hc); R(2, 6 + oy, 12, 1, hc); R(4, 5 + oy, 8, 1, hb); R(5, 0 + oy, 2, 5, hl);
      } else if (hat === 'laurel') {
        for (let i = 2; i < 14; i += 2) { P(i, 5 + oy, '#5fa645'); P(i + 1, 4 + oy, '#8fd067'); }
      } else if (hat === 'chef') {
        R(4, 0 + oy, 8, 6, '#ffffff'); G.oval(g, 3, -1 + oy, 10, 5, '#ffffff'); R(4, 5 + oy, 8, 1, '#d8d0c8'); R(10, 1 + oy, 2, 4, '#e8e0d8');
      }
    }
    if (armsUp) drawArms();
    return G.outline(c);
  }

  const cache = new Map();
  function key(look) { return look._k || (look._k = JSON.stringify(look)); }

  AK.Chars = {
    W, H,
    // dir: 'down' | 'up' | 'left' | 'right'; act: 'idle'|'walk'|'raise'|'strike'|'brush'|'hold'|'sit'
    get(look, dir, act, step) {
      const k = key(look) + '|' + dir + '|' + act + '|' + (step | 0);
      let c = cache.get(k);
      if (c) return c;
      const d = dir === 'left' || dir === 'right' ? 'side' : dir;
      c = draw(look, d, act === 'idle' ? null : act, step | 0);
      if (dir === 'left') c = G.flip(c);
      cache.set(k, c);
      return c;
    },
    // ayak noktasına (x,y) göre çizim
    blit(ctx, look, dir, act, step, x, y) { ctx.drawImage(this.get(look, dir, act, step), x - 8, y - H + 1); },
    portrait(look) {
      const k = key(look) + '|portrait';
      let c = cache.get(k);
      if (c) return c;
      const src = AK.Chars.get(look, 'down', 'idle', 0);
      c = G.canvas(16, 16);
      c.g.drawImage(src, 0, 0, 16, 16, 0, 1, 16, 16);
      cache.set(k, c);
      return c;
    },
  };
})();
