// Kazı alanları: Eski Orman, Küçük Mağara, Çöl Harabeleri. Her gün yeni kazı işaretleri ve kayalar çıkar.
(function () {
  const U = AK.U, T = AK.T, S = AK.Spr, W = AK.World;
  const Exc = () => AK.Exc;
  const hasKit = () => !!AK.state.flags.kit;
  const RCOL = ['#d8d0c0', '#7cf06a', '#6aa8ff', '#d88aff', '#ffc040'];

  // ---------------- ortak nesne fabrikaları ----------------
  function rockObj(m, sid, tx, ty, kind, v) {
    return W.add(m, {
      kind: 'rock', daily: true, sid, tx, ty, x: tx * 16 + 8, y: ty * 16 + 15, solid: [tx, ty, 1, 1], hp: kind === 'desert' ? 3 : 2,
      spr: S.rock(kind, v), update: (o, dt) => Exc().wobble(o, dt),
      hit(o, tool, lv) {
        if (tool === 'pickaxe' || tool === 'hammer') {
          o.hp -= tool === 'pickaxe' ? lv : Math.max(1, lv - 1);
          Exc().hitFx(o, ['#9a958c', '#bfbab0', '#77726a'], 'pick');
          if (o.hp <= 0) {
            Exc().breakObj(m, o);
            const x = o.x, y = o.y - 8;
            Exc().giveRes('tas', 1 + (Math.random() < 0.4 ? 1 : 0) + (AK.state.tools.pickaxe >= 3 ? 1 : 0), x, y);
            const r = Math.random();
            if (kind === 'cave') {
              if (r < 0.18) Exc().giveRes('kuvars', 1, x, y - 6); else if (r < 0.24) Exc().giveRes('ametist', 1, x, y - 6);
              else if (r < 0.31) Exc().giveArtifact(AK.Loot.artifact('magara', AK.Loot.rollRarity(AK.Loot.toolBonus('pickaxe'))), x, y);
            } else if (kind === 'desert') {
              if (r < 0.09) Exc().giveRes('altin', 1, x, y - 6); else if (r < 0.19) Exc().giveRes('metal', 1, x, y - 6);
              else if (r < 0.25) Exc().giveArtifact(AK.Loot.artifact('col', AK.Loot.rollRarity(AK.Loot.toolBonus('pickaxe'))), x, y);
            } else {
              if (r < 0.12) Exc().giveRes('metal', 1, x, y - 6);
              else if (r < 0.18) Exc().giveArtifact(AK.Loot.artifact('orman', AK.Loot.rollRarity(AK.Loot.toolBonus('pickaxe'))), x, y);
            }
          }
          return { ok: true, cost: Exc().cost(tool) };
        }
        if (tool === 'shovel') return { ok: false, msg: 'Kürek taşa işlemez. Kazma kullan.' };
        if (tool === 'brush') return { ok: false, msg: 'Sıradan bir taş. Kazmayla kırabilirsin.' };
        return null;
      },
    });
  }
  function boulderObj(m, sid, tx, ty, kind, hard) {
    return W.add(m, {
      kind: 'boulder', daily: true, sid, tx, ty, x: (tx + 1) * 16, y: (ty + 1) * 16 + 2, solid: [tx, ty, 2, 1], hp: hard ? 9 : 5,
      spr: S.boulder(kind, hard ? 1 : 0), update: (o, dt) => Exc().wobble(o, dt),
      hit(o, tool, lv) {
        if (tool === 'hammer') {
          if (hard && lv < 2) return { ok: false, msg: 'Granit kaya! Bunun için Çekiç Seviye 2 (Bakır) gerekli.' };
          o.hp -= lv + 1;
          Exc().hitFx(o, ['#9a958c', '#bfbab0', '#5a5260'], 'hammer');
          W.shake = 1.5;
          if (o.hp <= 0) {
            Exc().breakObj(m, o);
            const x = o.x, y = o.y - 10;
            Exc().giveRes('tas', U.ri(3, 5), x, y);
            const r = Math.random();
            const reg = m.region;
            if (r < (hard ? 0.5 : 0.3)) { const f = AK.Loot.fossil(reg); if (f) Exc().giveArtifact(f, x, y); }
            else if (r < 0.45) Exc().giveRes('metal', U.ri(1, 2), x, y - 6);
            if (reg === 'col' && Math.random() < 0.2) Exc().giveRes('altin', 1, x, y - 10);
          }
          return { ok: true, cost: Exc().cost('hammer') };
        }
        if (tool === 'pickaxe') return { ok: false, msg: 'Bu kaya kazma için fazla büyük. Çekiç kullan.' };
        if (tool === 'shovel' || tool === 'brush') return { ok: false, msg: 'Koca bir kaya. Çekiçle parçalayabilirsin.' };
        return null;
      },
    });
  }
  function spotObj(m, sid, tx, ty, rar, opts) {
    opts = opts || {};
    const kind = opts.kind || 'dig';
    return W.add(m, {
      kind: 'spot', daily: true, sid, tx, ty, x: tx * 16 + 8, y: ty * 16 + 15, rar, flat: kind !== 'dig', hits: 0, nightOnly: opts.nightOnly,
      spr: o => {
        const f = Math.floor(W.t * 3 + tx) % 4;
        if (kind === 'kar') return S.snowruin(f);
        if (kind === 'sis') return S.fogspot(f);
        return S.digspot(f, hasKit() ? RCOL[o.rar] : '');
      },
      light: kind === 'sis' ? { dy: -6, r: 30, c: '#b08aff', a: 0.8 } : kind === 'kar' ? { dy: -6, r: 18, c: '#bfe8ff', a: 0.5 } : null,
      hit(o, tool, lv) {
        if (tool !== 'shovel') return { ok: false, msg: kind === 'dig' ? 'Kazı işaretini kürekle kazmalısın!' : 'Bunu dikkatlice kürekle kazmalısın.' };
        const tile = W.tile(m, tx, ty);
        if (AK.Tiles.digLevel(tile) > lv) return { ok: false, msg: 'Bu toprak çok sert! Kürek Seviye 3 (Çelik Kürek) gerekli.' };
        o.hits++;
        W.burst(o.x, o.y - 4, ['#6e4426', '#8b5a36', '#a8734a'], 6, 35);
        AK.Audio.sfx('dig');
        const need = lv >= 2 ? 1 : 2;
        if (o.hits < need) { o.shakeT = 0.15; return { ok: true, cost: Exc().cost('shovel') }; }
        Exc().markUsed(m.id, o.sid);
        W.remove(m, o);
        const st = Exc().dstate(m.id), idx = ty * m.w + tx;
        if (!st.holes.includes(idx) && AK.Tiles.digLevel(tile)) { st.holes.push(idx); Exc().addHole(m, tx, ty); }
        AK.state.stats.dug++;
        const id = opts.spot ? AK.Loot.artifact(m.region, rar, { spot: opts.spot }) : AK.Loot.artifact(m.region, rar);
        Exc().giveArtifact(id, o.x, o.y - 12);
        AK.Bus.emit('spotDug', m.id);
        return { ok: true, cost: Exc().cost('shovel') };
      },
    });
  }
  function fossilObj(m, sid, tx, ty) {
    return W.add(m, {
      kind: 'fossil', daily: true, sid, tx, ty, x: tx * 16 + 8, y: ty * 16 + 15, solid: [tx, ty, 1, 1], hp: 4,
      spr: S.fossil(), update: (o, dt) => Exc().wobble(o, dt),
      hit(o, tool, lv) {
        if (tool === 'brush') {
          o.hp -= lv;
          o.shakeT = 0.1;
          W.burst(o.x, o.y - 8, ['#efe6d0', '#d8cfb8', '#ffffff'], 5, 20, 0.6, 40);
          AK.Audio.sfx('brush');
          if (o.hp <= 0) {
            Exc().markUsed(m.id, o.sid);
            W.remove(m, o);
            const f = AK.Loot.fossil(m.region) || 'amonit';
            Exc().giveArtifact(f, o.x, o.y - 12);
          }
          return { ok: true, cost: Exc().cost('brush') };
        }
        if (tool === 'pickaxe' || tool === 'hammer') return { ok: false, msg: 'Dikkat! Fosil kırılabilir. Fırçayla yavaşça ortaya çıkar.' };
        if (tool === 'shovel') return { ok: false, msg: 'Bu bir fosil katmanı. Fırça kullanmalısın.' };
        return null;
      },
    });
  }
  function crystalObj(m, sid, tx, ty, kind) {
    return W.add(m, {
      kind: 'crystal', daily: true, sid, tx, ty, x: tx * 16 + 8, y: ty * 16 + 15, solid: [tx, ty, 1, 1], hp: 2,
      spr: S.crystal(kind), update: (o, dt) => Exc().wobble(o, dt),
      light: { dy: -8, r: 22, c: kind === 'ametist' ? '#c090ff' : '#a0e8ff', a: 0.6 },
      hit(o, tool, lv) {
        if (tool !== 'pickaxe') return { ok: false, msg: 'Kristali kazmayla dikkatlice ayırabilirsin.' };
        o.hp -= lv;
        Exc().hitFx(o, kind === 'ametist' ? ['#a77ad8', '#dcc6f6'] : ['#bfe4f0', '#ffffff'], 'pick');
        if (o.hp <= 0) { Exc().breakObj(m, o); Exc().giveRes(kind, kind === 'ametist' ? 1 : U.ri(1, 2), o.x, o.y - 8); }
        return { ok: true, cost: Exc().cost('pickaxe') };
      },
    });
  }
  // rastgele boş karo bul
  function finder(m, r) {
    const occ = new Set();
    for (const o of m.objects) {
      if (o.solid) { const [x, y, w, h] = o.solid; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) occ.add(j * m.w + i); }
      if (o.tx != null) occ.add(o.ty * m.w + o.tx);
    }
    return function (tiles, area, w = 1, extra) {
      for (let k = 0; k < 400; k++) {
        const x = area[0] + ((r() * (area[2] - area[0] + 1)) | 0), y = area[1] + ((r() * (area[3] - area[1] + 1)) | 0);
        let ok = true;
        for (let i = 0; i < w && ok; i++) {
          const t = W.tile(m, x + i, y), id = y * m.w + x + i;
          if (!tiles.includes(t) || occ.has(id) || m.force[id] || AK.Tiles.solid(t)) ok = false;
        }
        if (!ok || (extra && !extra(x, y))) continue;
        for (let i = 0; i < w; i++) occ.add(y * m.w + x + i);
        return [x, y];
      }
      return null;
    };
  }
  // ortak günlük üretim
  function resetDaily(m) {
    m.objects = m.objects.filter(o => !o.daily);
    m.hidden = [];
    return Exc().dstate(m.id);
  }
  function addHoles(m, st) { for (const idx of st.holes) Exc().addHole(m, idx % m.w, Math.floor(idx / m.w)); }
  function place(st, list, fn) { list.forEach((p, i) => { if (p && !st.used.includes(fn.prefix + i)) fn(fn.prefix + i, p[0], p[1]); }); }
  function trenchDecal(x, y, w, h) {
    const c = AK.Gfx.canvas(w * 16 + 2, h * 16 + 2), g = c.g;
    g.fillStyle = '#efe2b8';
    g.fillRect(1, 1, w * 16, 1); g.fillRect(1, h * 16, w * 16, 1); g.fillRect(1, 1, 1, h * 16); g.fillRect(w * 16, 1, 1, h * 16);
    g.fillStyle = '#7a4f2a';
    for (let i = 0; i <= w; i += 2) { g.fillRect(i * 16, 0, 2, 3); g.fillRect(i * 16, h * 16 - 1, 2, 3); }
    for (let j = 0; j <= h; j += 2) { g.fillRect(0, j * 16, 2, 3); g.fillRect(w * 16 - 1, j * 16, 2, 3); }
    return { x: x * 16 - 1, y: y * 16 - 1, spr: c };
  }
  function treeObj(m, tx, ty, kind, v) {
    return W.add(m, {
      kind: 'tree', x: tx * 16 + 8, y: ty * 16 + 14, tx, ty, solid: [tx, ty, 1, 1], shadow: kind === 'oak' ? [32, 9, 5] : [20, 7, 4], flatShadow: true, fade: true,
      spr: () => kind === 'pine' ? S.pine(AK.Time.season(), v) : kind === 'palm' ? S.palm(v) : S.oak(AK.Time.season(), v),
    });
  }
  function scatter(m, r, n, tiles, area, avoid, fn) {
    let placed = 0;
    for (let k = 0; k < n * 12 && placed < n; k++) {
      const x = area[0] + ((r() * (area[2] - area[0] + 1)) | 0), y = area[1] + ((r() * (area[3] - area[1] + 1)) | 0);
      let ok = true;
      for (let j = -1; j <= 1 && ok; j++) for (let i = -1; i <= 1 && ok; i++) { if (!tiles.includes(W.tile(m, x + i, y + j))) ok = false; }
      if (!ok || (avoid && avoid(x, y))) continue;
      if (m.objects.some(o => o.solid && Math.abs(o.solid[0] - x) < 2 && Math.abs(o.solid[1] - y) < 2)) continue;
      fn(x, y); placed++;
    }
  }

  // =================== ESKİ ORMAN ===================
  function buildForest() {
    const m = W.newMap('forest', 46, 36, T.FOREST, { name: 'Eski Orman Kazı Alanı', sub: 'Kazı işaretlerini kürekle kaz!', outdoor: true, music: 'dig', region: 'orman', digsite: true, hasWater: true });
    const r = U.rng(9001);
    W.fill(m, 0, 0, 46, 2, T.CANOPY); W.fill(m, 0, 34, 46, 2, T.CANOPY);
    W.fill(m, 0, 0, 2, 36, T.CANOPY); W.fill(m, 44, 0, 2, 36, T.CANOPY);
    W.fill(m, 2, 2, 42, 3, T.CLIFF);
    W.fill(m, 22, 5, 2, 30, T.PATH); W.set(m, 22, 4, T.PATH);
    W.fill(m, 22, 34, 2, 2, T.PATH);
    W.fill(m, 18, 27, 10, 5, T.PATH);
    W.fill(m, 6, 15, 35, 2, T.PATH);
    const trenches = [[4, 7, 8, 6, T.DIG], [13, 7, 7, 5, T.DIG], [26, 7, 8, 6, T.DIG], [36, 7, 7, 7, T.DIG], [5, 18, 9, 7, T.DIG], [31, 18, 10, 7, T.HARD]];
    for (const [x, y, w, h, t] of trenches) { W.fill(m, x, y, w, h, t); m.decals.push(trenchDecal(x, y, w, h)); }
    W.fill(m, 30, 7, 4, 6, T.HARD);
    for (const [x, y, w, h] of [[7, 13, 2, 2], [15, 12, 2, 3], [28, 13, 2, 2], [38, 14, 2, 1], [8, 17, 2, 1], [34, 17, 2, 1]]) W.fill(m, x, y, w, h, T.PATH);
    W.ovalFill(m, 40, 30, 2.8, 1.6, T.WATER);
    m.warps.push({ x: 22, y: 35, w: 2, h: 1, to: 'town', tx: 55, ty: 2, dir: 'down' });
    m.warps.push({ x: 22, y: 4, to: 'cave', tx: 16, ty: 23, dir: 'up', need: () => AK.state.flags.caveOpen ? null : 'Mağaranın girişi çökmüş kayalarla kapalı.' });
    // mağara girişi
    W.add(m, { kind: 'cave', x: 22 * 16 + 8, y: 5 * 16, spr: () => S.caveEntrance(AK.Time.season()) });
    const rubble = W.add(m, {
      kind: 'rubble', x: 22 * 16 + 8, y: 5 * 16 + 4, solid: [22, 4, 1, 1], spr: S.rubble('forest'), prompt: 'İncele',
      int: () => AK.UI.toast(AK.state.tools.pickaxe >= 2 ? 'Çökmüş kayalar. Bakır kazman bunları kırabilir!' : 'Çökmüş kayalar mağarayı kapatıyor. Kazmanı Seviye 2\'ye (Bakır) yükseltmelisin — Demirci Kaya yardımcı olur.', 'lock'),
      hit(o, tool, lv) {
        if (tool !== 'pickaxe') return { ok: false, msg: 'Bu kayaları kazmayla kırmalısın.' };
        if (lv < 2) return { ok: false, msg: 'Paslı kazman bu kayalara yetmiyor. Kazma Seviye 2 (Bakır) gerekli.' };
        o.hp = (o.hp || 3) - 1;
        Exc().hitFx(o, ['#9a958c', '#bfbab0'], 'pick'); W.shake = 2;
        if (o.hp <= 0) {
          o.hidden = true; W.rebuild(m); AK.Audio.sfx('break');
          AK.state.flags.caveOpen = true;
          W.burst(o.x, o.y - 10, ['#9a958c', '#bfbab0', '#77726a'], 24, 60);
          AK.UI.toast('Mağaranın girişi açıldı! Yeni bir bölge keşfettin: Küçük Mağara', 'star');
          AK.Audio.stinger(2);
          AK.Bus.emit('flag', 'caveOpen');
        }
        return { ok: true, cost: Exc().cost('pickaxe') };
      },
    });
    m.rubble = rubble;
    // kamp
    W.add(m, { kind: 'tent', x: 19 * 16 + 8, y: 29 * 16, solid: [18, 28, 3, 1], spr: S.tent(), int: () => AK.Game.rest(), prompt: 'Çadırda Dinlen' });
    W.add(m, { kind: 'fire', x: 24 * 16 + 8, y: 30 * 16, solid: [24, 29, 1, 1], spr: () => S.campfire(Math.floor(W.t * 6) % 3), light: { dy: -6, r: 64, c: '#ffb060', a: 1, fl: true } });
    W.add(m, { kind: 'crate', x: 26 * 16 + 8, y: 29 * 16, solid: [26, 28, 1, 1], spr: S.crate(1), int: () => AK.Menus.ship(), prompt: 'Nakliye Sandığı' });
    W.add(m, { kind: 'barrel', x: 27 * 16 + 8, y: 29 * 16, solid: [27, 28, 1, 1], spr: S.barrel() });
    W.add(m, { kind: 'crates', x: 28 * 16, y: 31 * 16, solid: [27, 30, 1, 1], spr: S.crates(1), shadow: [22, 5, 4], flatShadow: true });
    W.add(m, { kind: 'sacks', x: 18 * 16, y: 31 * 16, solid: [17, 30, 1, 1], spr: S.sacks() });
    for (const x of [21, 24]) W.add(m, { kind: 'post', x: x * 16 + 8, y: 27 * 16, solid: [x, 26, 1, 1], spr: S.lanternPost(), light: { dy: -24, r: 40, c: '#ffd890', a: 0.9, fl: true } });
    W.add(m, { kind: 'cart', x: 26 * 16, y: 33 * 16 - 4, solid: [25, 32, 2, 1], spr: S.cart('goods'), shadow: [36, 6, 4], flatShadow: true });
    W.add(m, { kind: 'sign', x: 21 * 16 + 8, y: 32 * 16, solid: [21, 31, 1, 1], spr: S.sign(), int: () => AK.UI.toast('Eski Orman Kazı Alanı — Kazı işaretlerini kürekle kaz, taşları kazmayla kır, fosil katmanlarını fırçala. Sağdaki sert topraklı hendek için Çelik Kürek gerekir.', 'museum'), prompt: 'Tabela' });
    W.add(m, { kind: 'sign', x: 30 * 16 + 8, y: 18 * 16, solid: [30, 17, 1, 1], spr: S.sign(), int: () => AK.UI.toast('Derin Kazı: Sert toprak! Çelik kürek olmadan kazılamaz ama nadir eserler burada.', 'lock'), prompt: 'Tabela' });
    // kalıntılar
    for (const [x, y, k] of [[3, 6, 0], [21, 13, 1], [24, 13, 0], [12, 14, 1], [16, 21, 0], [29, 21, 1], [33, 14, 0]]) {
      W.add(m, { kind: 'ruin', x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], spr: k ? S.pillar('forest', 1) : S.pillar('forest', 0) });
    }
    for (const [x, y, v] of [[25, 21, 1], [14, 24, 0], [19, 19, 1]]) W.add(m, { kind: 'ruin', x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], spr: S.ruinblock('forest', v) });
    // sisli koru
    const fogBush = [];
    for (let y = 25; y <= 33; y++) fogBush.push([9, y]);
    for (let x = 2; x <= 8; x++) fogBush.push([x, 25]);
    m.fogBushes = fogBush.map(([x, y]) => W.add(m, { kind: 'bush', fogGate: (x === 9 && (y === 29 || y === 30)), x: x * 16 + 8, y: y * 16 + 15, tx: x, ty: y, solid: [x, y, 1, 1], spr: () => S.bush(AK.Time.season(), (x + y) % 4) }));
    for (const [x, y, v] of [[4, 27, 0], [7, 27, 1], [3, 31, 1], [7, 32, 0]]) W.add(m, { kind: 'stone', x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], spr: S.stone(v) });
    for (const [x, y] of [[37, 30], [42, 29], [39, 32]]) W.add(m, { kind: 'reeds', x: x * 16 + 8, y: (y + 1) * 16, spr: () => S.reeds(AK.Time.season()) });
    // ağaçlar
    const avoid = (x, y) => (x >= 16 && x <= 29 && y >= 25) || (x <= 10 && y >= 24) || (y <= 6);
    scatter(m, r, 48, [T.FOREST], [3, 5, 42, 33], avoid, (x, y) => treeObj(m, x, y, r() < 0.45 ? 'pine' : 'oak', (r() * 6) | 0));
    for (let x = 2; x < 44; x += 2) if (W.tile(m, x, 33) === T.FOREST) treeObj(m, x, 33, r() < 0.5 ? 'pine' : 'oak', (r() * 6) | 0);
    for (let y = 6; y < 33; y += 2) { if (W.tile(m, 2, y) === T.FOREST && !(y >= 25)) treeObj(m, 2, y, 'pine', (r() * 6) | 0); if (W.tile(m, 43, y) === T.FOREST) treeObj(m, 43, y, r() < 0.5 ? 'pine' : 'oak', (r() * 6) | 0); }
    scatter(m, r, 14, [T.FOREST], [3, 6, 42, 32], avoid, (x, y) => { const v = (r() * 4) | 0; W.add(m, { kind: 'bush', x: x * 16 + 8, y: y * 16 + 15, tx: x, ty: y, solid: [x, y, 1, 1], spr: () => S.bush(AK.Time.season(), v) }); });
    scatter(m, r, 5, [T.FOREST], [3, 6, 42, 32], avoid, (x, y) => W.add(m, { kind: 'stump', x: x * 16 + 8, y: y * 16 + 15, solid: [x, y, 1, 1], spr: r() < 0.5 ? S.stump() : S.log(), tx: x, ty: y }));
    for (let i = 0; i < 160; i++) { const x = 2 + ((r() * 42) | 0), y = 5 + ((r() * 28) | 0); if (W.tile(m, x, y) === T.FOREST) { const v = (r() * 8) | 0; m.decals.push({ x: x * 16, y: y * 16, spr: s => S.flowers(s, v) }); } }

    m.daily = dm => {
      const st = resetDaily(dm);
      const rr = U.rng(U.hash('forest' + AK.Time.abs() + (AK.state.seed || 0)));
      W.rebuild(dm);
      const find = finder(dm, rr);
      const wthr = AK.Weather.today(), ev = AK.Progress.eventToday();
      const notCamp = (x, y) => !avoid(x, y) || (y <= 6 && y >= 5);
      const rocks = []; for (let i = 0; i < 16; i++) rocks.push(find([T.FOREST], [3, 6, 42, 32], 1, (x, y) => !avoid(x, y)));
      const bould = []; for (let i = 0; i < 4; i++) bould.push(find([T.FOREST], [3, 6, 41, 32], 2, (x, y) => !avoid(x, y) && !avoid(x + 1, y)));
      const spots = []; for (let i = 0; i < 12; i++) spots.push(find([T.DIG], [3, 6, 43, 33]));
      const hard = []; for (let i = 0; i < 3; i++) hard.push(find([T.HARD], [3, 6, 43, 33]));
      const foss = []; for (let i = 0; i < 3; i++) foss.push(find([T.FOREST], [3, 5, 42, 5], 1, x => x < 20 || x > 25));
      const hid = []; for (let i = 0; i < 4; i++) hid.push(find([T.DIG, T.HARD, T.FOREST], [3, 6, 42, 32], 1, (x, y) => !avoid(x, y)));
      const rain = []; if (AK.Weather.isWet()) for (let i = 0; i < 3; i++) rain.push(find([T.DIG], [3, 6, 43, 33]));
      const snow = []; if (wthr === 'kar') for (let i = 0; i < 2; i++) snow.push(find([T.FOREST], [3, 6, 42, 32], 1, notCamp));
      const night = []; if (ev === 'gecekazisi') for (let i = 0; i < 4; i++) night.push(find([T.DIG], [3, 6, 43, 33]));
      const rars = spots.map(() => AK.Loot.rollRarity(AK.Loot.toolBonus('shovel'), rr));
      const hrars = hard.map(() => AK.Loot.rollRarity(0.35 + AK.Loot.toolBonus('shovel'), rr, 1));
      const hidr = hid.map(() => AK.Loot.rollRarity(0.6, rr, 1));
      const rainr = rain.map(() => AK.Loot.rollRarity(0.15, rr));
      const snowr = snow.map(() => AK.Loot.rollRarity(1.0, rr, 2));
      const nightr = night.map(() => AK.Loot.rollRarity(0.5, rr, 1));
      const fogr = AK.Loot.rollRarity(1.4, rr, 2);
      // ilk gün: ilk işaretler kolay ve yakın olsun
      if (AK.Time.abs() === 1) { rars[0] = 0; rars[1] = 1; }
      const p = (prefix, fn) => { fn.prefix = prefix; return fn; };
      place(st, rocks, p('r', (sid, x, y) => rockObj(dm, sid, x, y, 'forest', (x + y) % 4)));
      place(st, bould, p('b', (sid, x, y) => boulderObj(dm, sid, x, y, 'forest', (x * 7 + y) % 3 === 0)));
      place(st, spots, p('s', (sid, x, y) => spotObj(dm, sid, x, y, rars[+sid.slice(1)])));
      place(st, hard, p('h', (sid, x, y) => spotObj(dm, sid, x, y, hrars[+sid.slice(1)])));
      place(st, foss, p('f', (sid, x, y) => fossilObj(dm, sid, x, y)));
      place(st, rain, p('y', (sid, x, y) => spotObj(dm, sid, x, y, rainr[+sid.slice(1)])));
      place(st, snow, p('k', (sid, x, y) => spotObj(dm, sid, x, y, snowr[+sid.slice(1)], { kind: 'kar', spot: 'kar' })));
      place(st, night, p('n', (sid, x, y) => spotObj(dm, sid, x, y, nightr[+sid.slice(1)], { nightOnly: true })));
      hid.forEach((h, i) => { if (h && !st.used.includes('d' + i)) dm.hidden.push({ sid: 'd' + i, tx: h[0], ty: h[1], rar: hidr[i] }); });
      const fog = wthr === 'sis';
      for (const b of dm.fogBushes) b.hidden = fog && b.fogGate;
      if (fog && !st.used.includes('fog')) spotObj(dm, 'fog', 5, 29, fogr, { kind: 'sis' });
      if (ev === 'gecekazisi') for (const [x, y] of [[12, 15], [30, 15], [22, 20]]) W.add(dm, { kind: 'lamp', daily: true, x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], spr: S.lamp(1), light: { dy: -30, r: 70, c: '#ffd890', a: 1, fl: true } });
      addHoles(dm, st);
      W.rebuild(dm);
    };
    m.update = (mm) => {
      const night = AK.Time.min() >= 1200;
      for (const o of mm.objects) if (o.nightOnly) o.hidden = !night;
    };
    m.refresh = mm => { mm.rubble.hidden = !!AK.state.flags.caveOpen; };
    return m;
  }

  // =================== KÜÇÜK MAĞARA ===================
  function buildCave() {
    const m = W.newMap('cave', 32, 26, T.CWALL, {
      name: 'Küçük Mağara', sub: 'Karanlık ve serin...', music: 'cave', region: 'magara', digsite: true, lantern: true, hasWater: true, bg: '#0d0910',
      ambient: () => [54, 48, 82],
    });
    W.ovalFill(m, 16, 19.5, 7.5, 3.8, T.CAVE);
    W.fill(m, 15, 13, 3, 6, T.CAVE);
    W.ovalFill(m, 8, 10, 6, 4, T.CAVE);
    W.fill(m, 11, 10, 5, 3, T.CAVE);
    W.ovalFill(m, 24, 10, 5.5, 4, T.CAVE);
    W.fill(m, 16, 9, 5, 3, T.CAVE);
    W.fill(m, 23, 3, 2, 4, T.CAVE);
    W.ovalFill(m, 23.5, 2.5, 4.2, 1.6, T.CAVE);
    W.fill(m, 16, 23, 1, 3, T.CAVE);
    W.ovalFill(m, 5, 11, 2.2, 1.3, T.WATER);
    W.ovalFill(m, 13, 20, 2, 1, T.SANDDIG); W.ovalFill(m, 20, 21, 2, 1, T.SANDDIG);
    W.ovalFill(m, 9, 7.5, 2, 1, T.SANDDIG); W.ovalFill(m, 26, 12, 2, 1, T.SANDDIG);
    m.warps.push({ x: 16, y: 25, to: 'forest', tx: 22, ty: 5, dir: 'down' });
    // meşaleler
    for (const [x, y] of [[13, 15], [19, 15], [6, 6], [11, 6], [22, 6], [27, 6], [9, 18], [23, 18]]) {
      if (W.tile(m, x, y) !== T.CWALL) continue;
      W.add(m, { kind: 'torch', x: x * 16 + 8, y: y * 16 + 14, spr: () => S.torch(Math.floor(W.t * 7 + x) % 3), light: { dy: -10, r: 62, c: '#ffa850', a: 0.95, fl: true } });
    }
    for (const [x, y] of [[3, 12], [7, 13], [4, 9]]) if (W.tile(m, x, y) === T.CAVE) W.add(m, { kind: 'mush', x: x * 16 + 8, y: (y + 1) * 16, tx: x, ty: y, spr: S.mushroom(0), light: { dy: -6, r: 30, c: '#60f0e0', a: 0.8 } });
    // duvar oyması
    W.add(m, {
      kind: 'carving', x: 8 * 16 + 8, y: 6 * 16 + 15, irect: [7 * 16, 5 * 16, 48, 34], prio: true, prompt: 'Duvar Oyması',
      spr: () => { const c = AK.Gfx.canvas(32, 16); const g = c.g; g.fillStyle = '#c8a050'; for (const [a, b] of [[4, 6], [8, 4], [12, 6], [20, 3], [24, 5], [28, 7]]) g.fillRect(a, b, 2, 2); g.fillRect(4, 10, 24, 1); g.fillRect(14, 2, 4, 4); return c; },
      int: () => AK.Dialog.open({ name: 'Duvar Oyması', lines: ['Duvara oyulmuş bir sahne: Yerin altında, sütunlarla dolu bir şehir. Üstünde bir güneş, bir ay ve yedi yıldız.', 'Şehrin kapısında bir figür bekliyor. Elinde bir disk tutuyor.'] }),
    });
    // mühürlü kapı
    const seal = W.add(m, {
      kind: 'seal', x: 24 * 16, y: 6 * 16 + 4, solid: [23, 5, 2, 1], hp: 3, prompt: 'Mühürlü Kapı',
      spr: () => S.sealedWall(AK.state.flags.tabletsDecoded ? 1 : 0), update: (o, dt) => Exc().wobble(o, dt),
      int: () => AK.UI.toast(AK.state.flags.tabletsDecoded ? 'Semboller parlıyor: Güneş, Ay, Yıldız. Tabletlerin anlattığı kapı bu! Bakır bir çekiçle kırılabilir gibi.' : 'Taş bir kapı. Üzerinde güneş, ay ve yıldız sembolleri var. Bir yerlerde bunu açıklayan yazıtlar olmalı...', 'lock'),
      light: () => AK.state.flags.tabletsDecoded ? { dy: -16, r: 40, c: '#ffe080', a: 0.8, fl: true } : null,
      hit(o, tool, lv) {
        if (tool !== 'hammer') return { ok: false, msg: 'Bu taş kapıyı ancak bir çekiç açabilir.' };
        if (!AK.state.flags.tabletsDecoded) return { ok: false, msg: 'Sembollerin ne anlama geldiğini bilmeden bu kapıya vurmaya kıyamazsın. Tabletleri bulmalısın.' };
        if (lv < 2) return { ok: false, msg: 'Kapı çok sağlam. Çekiç Seviye 2 (Bakır) gerekli.' };
        o.hp--; Exc().hitFx(o, ['#7d7088', '#9d90a8', '#f2c14e'], 'hammer'); W.shake = 3;
        if (o.hp <= 0) {
          o.hidden = true; W.rebuild(m); AK.Audio.sfx('break'); AK.Audio.stinger(3);
          AK.state.flags.sealBroken = true;
          W.burst(o.x, o.y - 12, ['#7d7088', '#9d90a8', '#f2c14e'], 30, 70);
          AK.UI.toast('Mühür kırıldı! Arkasında gizli bir oda var...', 'star');
          AK.Bus.emit('flag', 'sealBroken');
        }
        return { ok: true, cost: Exc().cost('hammer') };
      },
    });
    m.seal = seal;
    W.add(m, {
      kind: 'altar', x: 23 * 16 + 16, y: 3 * 16 + 4, solid: [23, 2, 2, 1], irect: [22 * 16 + 8, 2 * 16, 48, 44], spr: () => S.altar(AK.state.flags.altarTaken ? 1 : 0), prompt: 'Sunak',
      light: () => AK.state.flags.altarTaken ? null : { dy: -20, r: 56, c: '#ffe080', a: 1, fl: true },
      int: () => AK.Progress.altar(),
    });
    m.daily = dm => {
      const st = resetDaily(dm);
      const rr = U.rng(U.hash('cave' + AK.Time.abs() + (AK.state.seed || 0)));
      W.rebuild(dm);
      const find = finder(dm, rr);
      const nearWall = (x, y) => [[1, 0], [-1, 0], [0, -1], [0, 1]].some(([a, b]) => W.tile(dm, x + a, y + b) === T.CWALL);
      const rocks = []; for (let i = 0; i < 11; i++) rocks.push(find([T.CAVE], [1, 6, 30, 23]));
      const crys = []; for (let i = 0; i < 6; i++) crys.push(find([T.CAVE], [1, 4, 30, 23], 1, nearWall));
      const spots = []; for (let i = 0; i < 5; i++) spots.push(find([T.SANDDIG], [1, 1, 30, 24]));
      const bould = []; for (let i = 0; i < 2; i++) bould.push(find([T.CAVE], [1, 6, 29, 23], 2));
      const foss = []; for (let i = 0; i < 2; i++) foss.push(find([T.CAVE], [1, 6, 30, 23], 1, nearWall));
      const hid = []; for (let i = 0; i < 2; i++) hid.push(find([T.CAVE, T.SANDDIG], [1, 6, 30, 23]));
      const rars = spots.map(() => AK.Loot.rollRarity(0.25 + AK.Loot.toolBonus('shovel'), rr, 1));
      const hidr = hid.map(() => AK.Loot.rollRarity(0.7, rr, 1));
      const p = (prefix, fn) => { fn.prefix = prefix; return fn; };
      place(st, rocks, p('r', (sid, x, y) => rockObj(dm, sid, x, y, 'cave', (x + y) % 4)));
      place(st, crys, p('c', (sid, x, y) => crystalObj(dm, sid, x, y, (x * 3 + y) % 3 === 0 ? 'ametist' : 'kuvars')));
      place(st, spots, p('s', (sid, x, y) => spotObj(dm, sid, x, y, rars[+sid.slice(1)])));
      place(st, bould, p('b', (sid, x, y) => boulderObj(dm, sid, x, y, 'cave', true)));
      place(st, foss, p('f', (sid, x, y) => fossilObj(dm, sid, x, y)));
      hid.forEach((h, i) => { if (h && !st.used.includes('d' + i)) dm.hidden.push({ sid: 'd' + i, tx: h[0], ty: h[1], rar: hidr[i] }); });
      addHoles(dm, st);
      W.rebuild(dm);
    };
    m.refresh = mm => { mm.seal.hidden = !!AK.state.flags.sealBroken; };
    return m;
  }

  // =================== ÇÖL HARABELERİ ===================
  function buildDesert() {
    const m = W.newMap('desert', 46, 36, T.SAND, { name: 'Çöl Harabeleri', sub: 'Kumların altında bir krallık', outdoor: true, music: 'desert', region: 'col', digsite: true, hasWater: true, bg: '#d9b679' });
    const r = U.rng(7007);
    W.fill(m, 0, 0, 46, 3, T.DUNE); W.fill(m, 0, 33, 46, 3, T.DUNE); W.fill(m, 0, 0, 2, 36, T.DUNE); W.fill(m, 44, 0, 2, 36, T.DUNE);
    const wallRect = (x, y, w, h, gaps) => {
      for (let i = x; i < x + w; i++) { W.set(m, i, y, T.SWALL); W.set(m, i, y + h - 1, T.SWALL); }
      for (let j = y; j < y + h; j++) { W.set(m, x, j, T.SWALL); W.set(m, x + w - 1, j, T.SWALL); }
      for (const [gx, gy] of gaps) W.set(m, gx, gy, T.SAND);
    };
    // orta salon
    wallRect(16, 6, 14, 11, [[22, 16], [23, 16], [16, 11], [29, 11]]);
    W.fill(m, 18, 8, 10, 7, T.SANDDIG);
    // kral avlusu (sert)
    wallRect(32, 5, 10, 10, [[36, 14], [37, 14]]);
    W.fill(m, 34, 7, 6, 6, T.HARDSAND);
    // gizli oda
    wallRect(4, 5, 8, 9, []);
    W.set(m, 7, 13, T.SAND); W.set(m, 8, 13, T.SAND);
    // açık kazı alanları
    W.fill(m, 8, 19, 9, 7, T.SANDDIG); W.fill(m, 28, 20, 9, 7, T.SANDDIG);
    m.decals.push(trenchDecal(8, 19, 9, 7), trenchDecal(28, 20, 9, 7), trenchDecal(34, 7, 6, 6));
    // vaha
    W.ovalFill(m, 40, 28, 3, 1.8, T.WATER);
    m.warps.length = 0;
    W.add(m, { kind: 'bus', x: 23 * 16 + 8, y: 32 * 16, solid: [22, 31, 3, 1], spr: S.busstop(), int: () => AK.Services.open('busBack'), prompt: 'Otobüs Durağı' });
    W.add(m, { kind: 'obelisk', x: 23 * 16, y: 19 * 16, solid: [22, 18, 2, 1], spr: S.obelisk(), int: () => AK.UI.toast('Dikilitaştaki yazı: "Yedi ışın, yedi kapı. Kumların bekçisi uyanık."', 'museum'), prompt: 'Dikilitaş' });
    for (let y = 20; y <= 29; y += 3) for (const x of [20, 26]) W.add(m, { kind: 'ruin', x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], spr: S.pillar('desert', (x + y) % 2) });
    for (const [x, y] of [[38, 26], [42, 27], [41, 30], [37, 30]]) W.add(m, { kind: 'tree', x: x * 16 + 8, y: y * 16 + 14, tx: x, ty: y, solid: [x, y, 1, 1], shadow: [20, 6], spr: S.palm(0) });
    scatter(m, r, 8, [T.SAND], [3, 4, 42, 31], (x, y) => (x >= 19 && x <= 27 && y >= 17), (x, y) => W.add(m, { kind: 'cactus', x: x * 16 + 8, y: y * 16 + 15, tx: x, ty: y, solid: [x, y, 1, 1], spr: S.cactus() }));
    // gizli oda duvarı ve sandık
    const cw = W.add(m, {
      kind: 'cwall', x: 8 * 16, y: 14 * 16 + 2, solid: [7, 13, 2, 1], hp: 4, prompt: 'Çatlak Duvar',
      spr: S.crackedWall(0), update: (o, dt) => Exc().wobble(o, dt),
      int: () => AK.UI.toast('Kumtaşı duvarda derin çatlaklar var. Arkası boş gibi ses veriyor. Güçlü bir çekiç gerek (Seviye 3).', 'lock'),
      hit(o, tool, lv) {
        if (tool !== 'hammer') return { ok: false, msg: 'Bu duvarı ancak bir çekiç yıkabilir.' };
        if (lv < 3) return { ok: false, msg: 'Duvar çok kalın. Çekiç Seviye 3 (Çelik) gerekli.' };
        o.hp--; Exc().hitFx(o, ['#c39a62', '#dcb87e'], 'hammer'); W.shake = 3;
        if (o.hp <= 0) { o.hidden = true; W.rebuild(m); AK.Audio.sfx('break'); AK.state.flags.desertWall = true; AK.UI.toast('Gizli oda açıldı!', 'star'); AK.Audio.stinger(3); }
        return { ok: true, cost: Exc().cost('hammer') };
      },
    });
    m.cwall = cw;
    W.add(m, { kind: 'chest', x: 8 * 16, y: 9 * 16, solid: [7, 8, 2, 1], irect: [6 * 16 + 8, 8 * 16, 48, 40], spr: () => S.chestOld(AK.state.flags.desertChest ? 1 : 0), ox: 0, prompt: 'Antik Sandık', int: () => AK.Progress.desertChest(), light: () => AK.state.flags.desertChest ? null : { dy: -8, r: 40, c: '#ffe080', a: 0.9, fl: true } });
    m.daily = dm => {
      const st = resetDaily(dm);
      const rr = U.rng(U.hash('desert' + AK.Time.abs() + (AK.state.seed || 0)));
      W.rebuild(dm);
      const find = finder(dm, rr);
      const rocks = []; for (let i = 0; i < 14; i++) rocks.push(find([T.SAND], [3, 4, 42, 31], 1, (x, y) => !(x >= 21 && x <= 25 && y >= 29)));
      const busFree = (x, y) => !(x >= 19 && x <= 26 && y >= 27);
      const bould = []; for (let i = 0; i < 3; i++) bould.push(find([T.SAND], [3, 4, 41, 31], 2, busFree));
      const spots = []; for (let i = 0; i < 10; i++) spots.push(find([T.SANDDIG], [3, 4, 42, 31]));
      const hard = []; for (let i = 0; i < 3; i++) hard.push(find([T.HARDSAND], [3, 4, 42, 31]));
      const hid = []; for (let i = 0; i < 4; i++) hid.push(find([T.SAND, T.SANDDIG], [3, 4, 42, 31], 1, busFree));
      const rars = spots.map(() => AK.Loot.rollRarity(0.1 + AK.Loot.toolBonus('shovel'), rr));
      const hrars = hard.map(() => AK.Loot.rollRarity(0.5 + AK.Loot.toolBonus('shovel'), rr, 1));
      const hidr = hid.map(() => AK.Loot.rollRarity(0.7, rr, 1));
      const p = (prefix, fn) => { fn.prefix = prefix; return fn; };
      place(st, rocks, p('r', (sid, x, y) => rockObj(dm, sid, x, y, 'desert', (x + y) % 4)));
      place(st, bould, p('b', (sid, x, y) => boulderObj(dm, sid, x, y, 'desert', (x + y) % 2 === 0)));
      place(st, spots, p('s', (sid, x, y) => spotObj(dm, sid, x, y, rars[+sid.slice(1)])));
      place(st, hard, p('h', (sid, x, y) => spotObj(dm, sid, x, y, hrars[+sid.slice(1)])));
      hid.forEach((h, i) => { if (h && !st.used.includes('d' + i)) dm.hidden.push({ sid: 'd' + i, tx: h[0], ty: h[1], rar: hidr[i] }); });
      addHoles(dm, st);
      W.rebuild(dm);
    };
    m.refresh = mm => { mm.cwall.hidden = !!AK.state.flags.desertWall; };
    return m;
  }

  AK.DigSites = { build() { buildForest(); buildCave(); buildDesert(); } };
})();
