// Karakter sprite üreticisi (16x26). Görünüm parametreleriyle her NPC farklı görünür.
// look: {skin, hair, hairStyle, shirt, outfit, outfitCol, pants, shoes, body, acc:[], hat, hatCol}
(function () {
  const G = AK.Gfx;
  const W = 16, H = 26;
  const EYE = '#2a1a24';

  function draw(L, dir, act, step) {
    const c = G.canvas(W, H), g = c.g;
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const P = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    const skin = L.skin, skinD = G.dk(skin, 0.18), skinL = G.lt(skin, 0.25);
    const hair = L.hair, hairD = G.dk(hair, 0.25), hairL = G.lt(hair, 0.22);
    const shirt = L.shirt, shirtD = G.dk(shirt, 0.22), shirtL = G.lt(shirt, 0.15);
    const pants = L.pants || '#5a4a3a', pantsD = G.dk(pants, 0.25);
    const shoes = L.shoes || '#3b2a20';
    const oc = L.outfitCol || shirt;
    const body = L.body || 'normal';
    const wide = body === 'wide', thin = body === 'thin';
    const walk = act === 'walk';
    const bob = walk && (step === 1 || step === 3) ? 1 : 0;
    const oy = bob;
    const acc = L.acc || [];
    const side = dir === 'side';

    // ---------- bacaklar ----------
    if (!side) {
      const lw = wide ? 3 : 2;
      const lx = wide ? 4 : 5, rx = wide ? 9 : 9;
      const lLift = walk && step === 1 ? 1 : 0, rLift = walk && step === 3 ? 1 : 0;
      const leg = (x, lift, col) => { R(x, 20, lw, 3 - lift, col); R(x, 23 - lift, lw, 2, shoes); };
      leg(lx, lLift, pants); leg(rx, rLift, pantsD);
    } else {
      let back = [6, 2], front = [8, 2];
      if (walk && (step === 1 || step === 3)) { back = [5, 2]; front = [9, 2]; }
      const bc = step === 3 ? pants : pantsD, fc = step === 3 ? pantsD : pants;
      R(back[0], 20, 2, 3, bc); R(back[0], 23, 3, 2, shoes);
      R(front[0], 20, 2, 3, fc); R(front[0], 23, 3, 2, G.lt(shoes, 0.1));
    }
    // ---------- gövde ----------
    const tx = side ? (wide ? 4 : thin ? 6 : 5) : (wide ? 3 : thin ? 5 : 4);
    const tw = side ? (wide ? 8 : thin ? 5 : 6) : (wide ? 10 : thin ? 6 : 8);
    R(tx, 19 + oy, tw, 1, pants);
    R(tx, 13 + oy, tw, 6, shirt);
    R(tx + tw - 1, 13 + oy, 1, 6, shirtD);
    R(tx, 13 + oy, 1, 6, shirtL);
    const outfit = L.outfit || 'shirt';
    if (outfit === 'apron') {
      R(tx + 1, 15 + oy, tw - 2, 6, oc); R(tx + 1, 15 + oy, tw - 2, 1, G.lt(oc, 0.2));
      if (!side) { P(tx + 1, 13 + oy, oc); P(tx + 1, 14 + oy, oc); P(tx + tw - 2, 13 + oy, oc); P(tx + tw - 2, 14 + oy, oc); }
    } else if (outfit === 'dress') {
      R(tx - 1, 18 + oy, tw + 2, 4, oc); R(tx - 1, 21 + oy, tw + 2, 1, G.dk(oc, 0.2)); R(tx, 18 + oy, tw, 1, G.dk(oc, 0.15));
    } else if (outfit === 'coat') {
      R(tx, 13 + oy, tw, 9, oc); R(tx + tw - 1, 13 + oy, 1, 9, G.dk(oc, 0.2)); R(tx, 13 + oy, 1, 9, G.lt(oc, 0.15));
      if (!side) { R(tx + (tw >> 1) - 1, 13 + oy, 2, 3, shirt); R(tx + (tw >> 1), 16 + oy, 1, 5, G.dk(oc, 0.25)); }
    } else if (outfit === 'vest') {
      if (!side) { R(tx, 13 + oy, 2, 6, oc); R(tx + tw - 2, 13 + oy, 2, 6, oc); } else R(tx, 13 + oy, tw - 2, 6, oc);
    } else if (outfit === 'robe') {
      R(tx - 1, 13 + oy, tw + 2, 10 - oy, oc); R(tx - 1, 22, tw + 2, 1, G.dk(oc, 0.3)); R(tx + tw, 13 + oy, 1, 10 - oy, G.dk(oc, 0.25));
    } else if (outfit === 'tunic') {
      R(tx - 1, 17 + oy, tw + 2, 4, oc); R(tx, 17 + oy, tw, 1, '#f2c14e');
    } else if (!side && outfit === 'shirt') {
      P(tx + (tw >> 1), 15 + oy, shirtD); P(tx + (tw >> 1), 17 + oy, shirtD);
    }
    if (!side && dir === 'down' && outfit !== 'robe') R(tx + (tw >> 1) - 1, 13 + oy, 2, 1, skinD);
    if (acc.includes('scarf')) R(tx, 13 + oy, tw, 2, L.scarfCol || '#c8553d');

    // ---------- kollar ----------
    const armsUp = act === 'raise' || act === 'hold';
    const sleeve = outfit === 'coat' || outfit === 'robe' ? oc : shirt;
    const drawArms = () => {
      if (!side) {
        const lax = tx - 2, rax = tx + tw;
        if (act === 'raise') {
          R(lax, 8 + oy, 2, 6, sleeve); R(lax, 7 + oy, 2, 1, skin); R(rax, 8 + oy, 2, 6, sleeve); R(rax, 7 + oy, 2, 1, skin);
        } else if (act === 'hold') {
          R(lax + 1, 5 + oy, 2, 9, sleeve); R(lax + 1, 3 + oy, 2, 2, skin); R(rax - 1, 5 + oy, 2, 9, sleeve); R(rax - 1, 3 + oy, 2, 2, skin);
        } else if (act === 'strike' || act === 'brush') {
          R(lax + 1, 13 + oy, 2, 5, sleeve); R(rax - 1, 13 + oy, 2, 5, sleeve);
          R(tx + 1, 18 + oy, tw - 2, 2, skin);
        } else {
          const a = walk ? (step === 1 ? 1 : step === 3 ? -1 : 0) : 0;
          R(lax, 13 + oy + a, 2, 5, sleeve); R(lax, 18 + oy + a, 2, 1, skin); R(lax, 13 + oy + a, 1, 5, G.dk(sleeve, 0.15));
          R(rax, 13 + oy - a, 2, 5, sleeve); R(rax, 18 + oy - a, 2, 1, skin); R(rax + 1, 13 + oy - a, 1, 5, G.dk(sleeve, 0.15));
        }
      } else {
        const ax = tx + (tw >> 1) - 1;
        if (act === 'raise') { R(ax - 1, 8 + oy, 2, 6, sleeve); R(ax - 1, 7 + oy, 2, 1, skin); }
        else if (act === 'hold') { R(ax, 5 + oy, 2, 9, sleeve); R(ax, 3 + oy, 2, 2, skin); }
        else if (act === 'strike') { R(ax, 14 + oy, 5, 2, sleeve); R(ax + 5, 14 + oy, 2, 2, skin); }
        else if (act === 'brush') { const b = step % 2; R(ax, 15 + oy, 3 + b, 2, sleeve); R(ax + 3 + b, 16 + oy, 2, 1, skin); }
        else {
          const a = walk ? (step === 1 ? 1 : step === 3 ? -1 : 0) : 0;
          R(ax + a, 13 + oy, 2, 5, sleeve); R(ax + a * 2, 18 + oy, 2, 1, skin); R(ax + a, 13 + oy, 1, 5, G.dk(sleeve, 0.12));
        }
      }
    };
    if (!armsUp) drawArms();

    // ---------- kafa ----------
    const hx = side ? 4 : 3, hw = side ? 9 : 10, hy = 3 + oy, hh = 10;
    R(hx + 1, hy, hw - 2, hh, skin); R(hx, hy + 1, hw, hh - 2, skin);
    R(hx + 1, hy + hh - 1, hw - 2, 1, skinD);
    const hs = L.hairStyle || 'short';
    if (dir === 'down') {
      P(hx + 2, hy + 5, EYE); P(hx + 2, hy + 6, EYE); P(hx + hw - 3, hy + 5, EYE); P(hx + hw - 3, hy + 6, EYE);
      const blush = G.mix(skin, '#ff7f7f', 0.35);
      P(hx + 1, hy + 7, blush); P(hx + hw - 2, hy + 7, blush);
    } else if (side) {
      P(hx + 6, hy + 5, EYE); P(hx + 6, hy + 6, EYE); P(hx + hw, hy + 6, skin); P(hx + 3, hy + 6, skinD);
      P(hx + 7, hy + 7, G.mix(skin, '#ff7f7f', 0.3));
    }
    // ---------- saç ----------
    const hood = acc.includes('hood');
    if (!hood) {
      if (dir === 'down') {
        if (hs === 'bald') { R(hx, hy + 3, 1, 3, hair); R(hx + hw - 1, hy + 3, 1, 3, hair); P(hx + 3, hy + 1, skinL); }
        else {
          if (hs === 'curly') { R(hx - 1, hy - 1, hw + 2, 4, hair); for (let i = 0; i < hw + 2; i += 2) P(hx - 1 + i, hy - 2, hair); R(hx - 1, hy + 3, 2, 4, hair); R(hx + hw - 1, hy + 3, 2, 4, hair); }
          else if (hs === 'spiky') { R(hx, hy, hw, 3, hair); for (let i = 0; i < hw; i += 2) P(hx + i, hy - 1, hair); R(hx, hy + 3, 1, 2, hair); R(hx + hw - 1, hy + 3, 1, 2, hair); }
          else { R(hx, hy, hw, 3, hair); R(hx, hy + 3, 1, 3, hair); R(hx + hw - 1, hy + 3, 1, 3, hair); }
          P(hx + 1, hy + 3, hair); P(hx + 2, hy + 3, hair); P(hx + 4, hy + 3, hair); P(hx + hw - 2, hy + 3, hair);
          R(hx + 2, hy, 3, 1, hairL);
          if (hs === 'long') { R(hx, hy + 3, 2, 9, hair); R(hx + hw - 2, hy + 3, 2, 9, hair); R(hx, hy + 11, 2, 1, hairD); R(hx + hw - 2, hy + 11, 2, 1, hairD); }
          if (hs === 'bun') { G.oval(g, hx + 3, hy - 3, 4, 4, hair); P(hx + 4, hy - 2, hairL); }
          if (hs === 'ponytail') { R(hx + hw, hy + 4, 1, 5, hair); }
        }
      } else if (dir === 'up') {
        if (hs === 'bald') { R(hx, hy + 3, hw, 4, hair); P(hx + 4, hy + 1, skinL); }
        else {
          R(hx + 1, hy, hw - 2, hh - 2, hair); R(hx, hy + 1, hw, hh - 3, hair); R(hx + 2, hy, 3, 1, hairL);
          R(hx + 2, hy + hh - 2, hw - 4, 2, skinD);
          if (hs === 'long') R(hx, hy + 6, hw, 7, hair);
          if (hs === 'bun') { G.oval(g, hx + 3, hy - 3, 4, 4, hair); }
          if (hs === 'ponytail') { R(hx + 4, hy + 8, 2, 6, hair); R(hx + 4, hy + 13, 2, 1, hairD); }
          if (hs === 'curly') { R(hx - 1, hy, hw + 2, 8, hair); }
        }
      } else {
        if (hs === 'bald') { R(hx, hy + 3, 3, 3, hair); P(hx + 4, hy + 1, skinL); }
        else {
          R(hx, hy, hw, 3, hair); R(hx, hy + 3, 3, 4, hair); P(hx + hw - 1, hy + 3, hair); P(hx + hw - 2, hy + 3, hair);
          R(hx + 3, hy, 3, 1, hairL);
          if (hs === 'long') R(hx - 1, hy + 3, 4, 9, hair);
          if (hs === 'bun') G.oval(g, hx - 1, hy - 2, 4, 4, hair);
          if (hs === 'ponytail') { R(hx - 2, hy + 3, 2, 6, hair); P(hx - 2, hy + 9, hairD); }
          if (hs === 'curly') { R(hx - 1, hy - 1, hw, 4, hair); R(hx - 1, hy + 3, 4, 5, hair); }
          if (hs === 'spiky') { for (let i = 0; i < hw; i += 2) P(hx + i, hy - 1, hair); }
        }
      }
    }
    // ---------- aksesuarlar ----------
    const fr = '#5a5260';
    if (acc.includes('glasses')) {
      if (dir === 'down') { R(hx + 1, hy + 4, hw - 2, 1, fr); P(hx + 2, hy + 4, '#e8f4ff'); P(hx + hw - 3, hy + 4, '#e8f4ff'); }
      else if (side) { R(hx + 5, hy + 4, 3, 1, fr); R(hx + 2, hy + 5, 3, 1, fr); }
    }
    const bc = L.beardCol || hair;
    if (acc.includes('beard')) {
      if (dir === 'down') { R(hx, hy + 6, 1, 3, bc); R(hx + hw - 1, hy + 6, 1, 3, bc); R(hx + 1, hy + 8, hw - 2, 2, bc); R(hx + 2, hy + 10, hw - 4, 1, bc); P(hx + 4, hy + 8, skinD); P(hx + 5, hy + 8, skinD); }
      else if (side) { R(hx + 4, hy + 7, 5, 3, bc); R(hx + 5, hy + 10, 3, 1, bc); }
    }
    if (acc.includes('mustache')) {
      if (dir === 'down') { R(hx + 2, hy + 7, 2, 1, bc); R(hx + hw - 4, hy + 7, 2, 1, bc); P(hx + 4, hy + 7, bc); P(hx + 5, hy + 7, bc); }
      else if (side) R(hx + 6, hy + 7, 3, 1, bc);
    }
    if (hood) {
      const hc = L.hatCol || '#3b3550';
      if (dir === 'up') { R(hx - 1, hy - 1, hw + 2, hh + 2, hc); }
      else {
        R(hx - 1, hy - 1, hw + 2, 4, hc); R(hx - 1, hy + 3, 2, 8, hc); R(hx + hw - 1, hy + 3, 2, 8, hc);
        if (dir === 'down') { R(hx + 1, hy + 3, hw - 2, 6, G.dk(skin, 0.55)); P(hx + 3, hy + 5, '#f2e6a0'); P(hx + hw - 4, hy + 5, '#f2e6a0'); }
        else { R(hx + 2, hy + 3, hw - 2, 6, G.dk(skin, 0.55)); P(hx + 6, hy + 5, '#f2e6a0'); R(hx - 1, hy + 3, 4, 8, hc); }
      }
    }
    const hat = L.hat;
    if (hat) {
      const hc = L.hatCol || '#c9a26a', hd = G.dk(hc, 0.25), hb = L.hatBand || '#7a4f2a';
      if (hat === 'safari') {
        if (!side) { R(hx - 2, hy + 2, hw + 4, 1, hd); R(hx + 1, hy - 2, hw - 2, 4, hc); R(hx + 1, hy + 1, hw - 2, 1, hb); R(hx + 2, hy - 2, 3, 1, G.lt(hc, 0.3)); }
        else { R(hx - 2, hy + 2, hw + 4, 1, hd); R(hx, hy - 2, hw - 2, 4, hc); R(hx, hy + 1, hw - 2, 1, hb); }
      } else if (hat === 'cap') {
        R(hx, hy - 1, hw, 3, hc); R(hx + 1, hy - 1, 3, 1, G.lt(hc, 0.3));
        if (dir === 'down') R(hx + 1, hy + 2, hw - 2, 1, hd); else if (side) R(hx + hw - 2, hy + 1, 4, 1, hd);
      } else if (hat === 'bandana') {
        R(hx, hy, hw, 2, hc); R(hx, hy + 2, hw, 1, hd); for (let i = 1; i < hw; i += 3) P(hx + i, hy, '#ffffff');
        if (side) { P(hx - 1, hy + 2, hc); P(hx - 2, hy + 3, hc); }
      } else if (hat === 'sunhat') {
        R(hx - 3, hy + 2, hw + 6, 1, hd); R(hx - 2, hy + 1, hw + 4, 1, hc); R(hx + 1, hy - 2, hw - 2, 3, hc); R(hx + 1, hy, hw - 2, 1, hb);
      } else if (hat === 'tophat') {
        R(hx + 2, hy - 3, hw - 4, 5, hc); R(hx, hy + 1, hw, 1, hc); R(hx + 2, hy, hw - 4, 1, hb);
      } else if (hat === 'laurel') {
        for (let i = 0; i < hw; i += 2) { P(hx + i, hy + 1, '#5fa645'); P(hx + i + 1, hy, '#7cc45a'); }
      } else if (hat === 'chef') {
        R(hx + 1, hy - 3, hw - 2, 5, '#ffffff'); G.oval(g, hx, hy - 4, hw, 4, '#ffffff'); R(hx + 1, hy + 1, hw - 2, 1, '#d8d0c8');
      }
    }
    if (armsUp) drawArms();
    return G.outline(c);
  }

  const cache = new Map();
  function key(look) { return look._k || (look._k = JSON.stringify(look)); }

  AK.Chars = {
    W, H,
    // dir: 'down' | 'up' | 'left' | 'right'; act: 'idle'|'walk'|'raise'|'strike'|'brush'|'hold'
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
