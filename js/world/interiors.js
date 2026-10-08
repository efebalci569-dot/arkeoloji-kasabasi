// İç mekânlar: oyuncunun evi, arkeoloji dükkânı, müze.
(function () {
  const U = AK.U, T = AK.T, S = AK.Spr, W = AK.World;

  function room(m, doorX) {
    W.fill(m, 0, 0, m.w, 2, T.WALL);
    W.fill(m, 0, 0, 1, m.h, T.WALL); W.fill(m, m.w - 1, 0, 1, m.h, T.WALL);
    W.fill(m, 0, m.h - 1, m.w, 1, T.WALL);
    W.set(m, doorX, m.h - 1, m.tiles[2 * m.w + 2]);
  }
  function indoorAmb() {
    const t = AK.Time.min();
    if (t >= 1170 || t < 370) return [120, 112, 160];
    if (t >= 1080) return [215, 196, 205];
    return [255, 255, 255];
  }
  const at = (tx, ty, w = 1) => ({ x: (tx + w / 2) * 16, y: (ty + 1) * 16 });

  // ışık hüzmesi (pencereden yere vuran gün ışığı)
  function beam(m, x0, x1, len, slant) {
    return W.add(m, {
      kind: 'beam', flat: true, x: (x0 + x1) / 2, y: 33, spr: null,
      draw(o, ctx, cx, cy) {
        const t = AK.Time.min();
        if (t < 390 || t > 1110 || AK.Weather.isWet()) return;
        const a = t < 450 ? (t - 390) / 60 : t > 1020 ? (1110 - t) / 90 : 1;
        const warm = t > 960 ? '255,196,140' : '255,242,200';
        ctx.fillStyle = 'rgba(' + warm + ',' + (0.16 * a).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(x0 - cx, 32 - cy); ctx.lineTo(x1 - cx, 32 - cy); ctx.lineTo(x1 + slant - cx, 32 + len - cy); ctx.lineTo(x0 + slant - cx, 32 + len - cy); ctx.closePath(); ctx.fill();
      },
    });
  }
  function plaque(text) {
    const w = AK.Gfx.textW(text) + 8, c = AK.Gfx.canvas(w, 12), g = c.g;
    AK.Gfx.rect(g, 0, 0, w, 12, '#7a5a2a'); AK.Gfx.rect(g, 1, 1, w - 2, 10, '#c9a050'); AK.Gfx.rect(g, 1, 1, w - 2, 1, '#f2d890');
    AK.Gfx.text(g, text, 4, 4, '#4a3010');
    return c;
  }

  // =================== EV ===================
  function buildHouse() {
    const m = W.newMap('house', 12, 10, T.WOOD, { name: 'Evin', style: 'house', floor: '', music: 'title', ambient: indoorAmb });
    room(m, 6);
    m.warps.push({ x: 6, y: 9, to: 'town', tx: 6, ty: 35, dir: 'down' });
    m.decals.push({ x: 2 * 16 + 4, y: 4, spr: S.windowBig() }, { x: 9 * 16 + 4, y: 4, spr: S.windowBig() }, { x: 6 * 16, y: 6, spr: S.painting(1) });
    beam(m, 2 * 16 + 6, 2 * 16 + 26, 30, 16); beam(m, 9 * 16 + 6, 9 * 16 + 26, 30, 16);
    const F = () => AK.state.house.furn;
    W.add(m, Object.assign(at(6, 9), { kind: 'mat', flat: true, spr: S.doormat(), oy: -3 }));
    W.add(m, Object.assign(at(1, 3, 2), { kind: 'bed', solid: [1, 2, 2, 2], spr: () => S.bed(AK.state.house.bedCol || '#c8553d'), int: () => AK.Game.askSleep(), prompt: 'Uyu' }));
    W.add(m, Object.assign(at(3, 2), { kind: 'radio', solid: [3, 2, 1, 1], spr: S.radio(), int: () => AK.Menus.radio(), prompt: 'Radyo' }));
    W.add(m, Object.assign(at(7, 2, 2), { kind: 'fire', solid: [7, 2, 2, 1], spr: () => S.fireplace(Math.floor(W.t * 6) % 3), light: { dy: -12, r: 64, c: '#ffa850', a: 0.95, fl: true }, int: () => AK.UI.toast('Şömine çıtır çıtır yanıyor. İçin ısınıyor.', 'heart'), prompt: 'Şömine' }));
    W.add(m, Object.assign(at(10, 3), { kind: 'chest', solid: [10, 3, 1, 1], spr: S.chest(), int: () => AK.Menus.storage('house'), prompt: 'Sandık' }));
    W.add(m, Object.assign(at(10, 5), { kind: 'stove', solid: [10, 5, 1, 1], spr: S.stove(), int: () => AK.UI.toast('Amcanın eski ocağı. Çaydanlık hâlâ sıcak.', 'museum'), prompt: 'Ocak' }));
    W.add(m, Object.assign(at(10, 6), { kind: 'kitchen', solid: [10, 6, 1, 1], spr: S.kitchen() }));
    W.add(m, Object.assign(at(2, 5, 2), { kind: 'table', solid: [2, 5, 2, 1], spr: S.table(), light: () => AK.Time.min() >= 1080 ? { dy: -18, r: 44, c: '#ffcf80', a: 0.9, fl: true } : null }));
    AK.BldInt.seat(m, 'chairR', 1, 5, S.chairSide('#a8743f', 0));
    AK.BldInt.seat(m, 'chairL', 4, 5, S.chairSide('#a8743f', 1));
    W.add(m, Object.assign(at(5, 8), { kind: 'pot', solid: [5, 8, 1, 1], spr: () => S.flowerpot(2, 0) }));
    const furn = [];
    const vit = (key, tx, ty, base) => furn.push(W.add(m, Object.assign(at(tx, ty, 2), {
      kind: 'vitrine', fk: key, solid: [tx, ty, 2, 1], spr: S.vitrine(), int: () => AK.Menus.homeDisplay(base), prompt: 'Vitrin',
      draw(o, ctx, cx, cy, s) {
        const bx = Math.round(o.x - s.width / 2 - cx), by = Math.round(o.y - s.height - cy);
        for (let i = 0; i < 3; i++) {
          const st = AK.state.house.disp[base + i];
          if (st) ctx.drawImage(AK.Icons.forStack(st), bx + 4 + i * 8, by + 13, 8, 8);
        }
      },
    })));
    vit('vitrin1', 4, 2, 0); vit('vitrin2', 2, 8, 3); vit('vitrin3', 8, 8, 6);
    furn.push(W.add(m, Object.assign(at(9, 2, 2), { kind: 'books', fk: 'kitaplik', solid: [9, 2, 2, 1], spr: S.bookshelf(), int: () => AK.Menus.books(), prompt: 'Kitaplık' })));
    furn.push(W.add(m, Object.assign(at(1, 6, 4), { kind: 'rug', fk: 'hali', flat: true, spr: S.rug('#a8453a', 64, 44), oy: 14 })));
    furn.push(W.add(m, Object.assign(at(7, 5, 2), { kind: 'bench', fk: 'calisma', solid: [7, 5, 2, 1], spr: S.workbench(), int: () => AK.Menus.workbench(), prompt: 'Çalışma Masası' })));
    furn.push(W.add(m, Object.assign(at(10, 8), { kind: 'plant', fk: 'bitki', solid: [10, 8, 1, 1], spr: S.plant(1) })));
    furn.push(W.add(m, Object.assign(at(1, 8), { kind: 'lamp', fk: 'lamba', solid: [1, 8, 1, 1], spr: S.floorlamp(), light: { dy: -28, r: 70, c: '#ffd890', a: 0.95 } })));
    m.furn = furn;
    m.refresh = mm => { for (const o of mm.furn) o.hidden = !F()[o.fk]; };
    return m;
  }

  // =================== DÜKKÂN ===================
  const TABLES = [[4, 4], [9, 4], [4, 7], [9, 7], [12, 4], [12, 7], [1, 5], [12, 9], [9, 9], [4, 9], [13, 2]];
  const TABLE_N = [0, 2, 6, 9, 11];
  const PMCOL = { 0.8: '#4f9a45', 1: '#f2c14e', 1.3: '#e8822a', 1.6: '#c8352e' };
  function buildShop() {
    const m = W.newMap('shop', 16, 12, T.WOOD, { name: 'Arkeoloji Dükkânı', style: 'shop', floor: 'dark', music: 'shop', ambient: indoorAmb });
    room(m, 7);
    m.warps.push({ x: 7, y: 11, to: 'town', tx: 42, ty: 21, dir: 'down' });
    m.decals.push({ x: 2 * 16, y: 4, spr: S.window() }, { x: 10 * 16, y: 4, spr: S.window() });
    beam(m, 2 * 16 + 2, 2 * 16 + 14, 28, 12); beam(m, 10 * 16 + 2, 10 * 16 + 14, 28, 12);
    W.add(m, { kind: 'shelf', x: 13 * 16, y: 2 * 16 - 3, spr: S.wallShelf(0) });
    W.add(m, { kind: 'shelf', x: 3 * 16 + 8, y: 2 * 16 - 16, spr: S.wallShelf(1) });
    W.add(m, { kind: 'map', x: 9 * 16 + 8, y: 2 * 16 - 8, spr: S.wallMap(), irect: [8 * 16 + 8, 8, 32, 30], int: () => AK.UI.toast('Amcanın eski kazı haritası. Kuzeyde orman, doğuda mağara... ve kenarda soru işaretli bir şehir çizimi.', 'museum'), prompt: 'Harita' });
    W.add(m, Object.assign(at(7, 11), { kind: 'mat', flat: true, spr: S.doormat(), oy: -3 }));
    W.add(m, Object.assign(at(1, 2, 2), { kind: 'clean', solid: [1, 2, 2, 1], spr: () => S.cleanTable(AK.state.shop.level >= 4 ? 1 : 0), int: () => AK.Cleaning.choose(), prompt: 'Temizleme Masası', oy: 2 }));
    W.add(m, Object.assign(at(4, 2), { kind: 'chest', solid: [4, 2, 1, 1], spr: S.chest(), int: () => AK.Menus.storage('shop'), prompt: 'Depo' }));
    W.add(m, {
      kind: 'orders', x: 7 * 16, y: 2 * 16 - 2, spr: () => S.orderBoard(Math.min(3, AK.state.shop.orders.length)), irect: [6 * 16, 16, 32, 30], prio: true,
      int: () => AK.Menus.orders(), prompt: 'Sipariş Panosu',
    });
    W.add(m, Object.assign(at(1, 9, 3), { kind: 'counter', solid: [1, 9, 3, 1], spr: S.counter(), int: () => AK.Menus.counter(), prompt: 'Tezgâh' }));
    const tables = [];
    TABLES.forEach(([x, y], i) => {
      tables.push(W.add(m, Object.assign(at(x, y, 2), {
        kind: 'table', idx: i, solid: [x, y, 2, 1], front: [x, y + 1],
        spr: () => S.dispTable(AK.state.shop.level >= 3 ? '#2f4f7a' : AK.state.shop.level === 2 ? '#3a7a5a' : '#8a3a3a'),
        int: o => AK.Shop.tableMenu(o.idx), prompt: 'Sergi Masası',
        light: o => AK.state.shop.tables[o.idx] && AK.state.shop.level >= 3 ? { dy: -18, r: 26, c: '#fff0c0', a: 0.6 } : null,
        draw(o, ctx, cx, cy, s) {
          const t = AK.state.shop.tables[o.idx];
          if (!t) return;
          const ic = AK.Icons.forStack(t.item);
          const bx = Math.round(o.x - 8 - cx), by = Math.round(o.y - s.height - cy - 7);
          ctx.drawImage(ic, bx, by);
          ctx.fillStyle = '#fff6e0'; ctx.fillRect(bx + 15, by + 11, 5, 4);
          ctx.fillStyle = PMCOL[t.pm] || '#f2c14e'; ctx.fillRect(bx + 16, by + 12, 3, 2);
        },
      })));
    });
    m.tables = tables;
    const parts = [];
    for (let y = 2; y <= 10; y++) parts.push(W.add(m, Object.assign(at(11, y), { kind: 'partition', lvl: 1, solid: [11, y, 1, 1], spr: S.partition(), int: () => AK.UI.toast('Dükkânın bu kısmı tadilat bekliyor. Genel Mağaza\'daki Rıza Usta dükkânı büyütebilir.', 'shop'), prompt: 'Tadilat' })));
    for (const [x, y, v] of [[13, 3, 1], [12, 6, 0], [14, 8, 1], [13, 10, 0]]) parts.push(W.add(m, Object.assign(at(x, y), { kind: 'crate', lvl: 1, solid: [x, y, 1, 1], spr: S.crate(v) })));
    const deco = [];
    deco.push(W.add(m, Object.assign(at(14, 2), { kind: 'plant', lvl: 2, solid: [14, 2, 1, 1], spr: S.plant(1) })));
    deco.push(W.add(m, Object.assign(at(14, 10), { kind: 'plant', lvl: 2, solid: [14, 10, 1, 1], spr: S.plant(0) })));
    deco.push(W.add(m, Object.assign(at(5, 8, 6), { kind: 'rug', lvl: 3, flat: true, spr: S.rug('#2f4f7a', 96, 28), oy: 6 })));
    deco.push(W.add(m, Object.assign(at(9, 2, 2), { kind: 'lab', lvl: 4, solid: [9, 2, 2, 1], spr: S.lab(), int: () => AK.Menus.workbench(true), prompt: 'Laboratuvar' })));
    m.parts = parts; m.deco = deco;
    m.lights = () => {
      const L = AK.state.shop.level, out = [{ x: 7 * 16, y: 6 * 16, r: 90, c: '#ffd890', a: 0.7 }];
      if (L >= 2) out.push({ x: 12 * 16, y: 6 * 16, r: 80, c: '#ffd890', a: 0.6 });
      out.push({ x: 2 * 16, y: 3 * 16, r: 40, c: '#fff0c0', a: 0.7 });
      return out;
    };
    m.refresh = mm => {
      const L = AK.state.shop.level;
      mm.tables.forEach((o, i) => { o.hidden = i >= TABLE_N[L]; });
      mm.parts.forEach(o => { o.hidden = L >= 2; });
      mm.deco.forEach(o => { o.hidden = L < o.lvl; });
      const want = L >= 4 ? T.MARBLE : L >= 3 ? T.TILE : T.WOOD;
      for (let y = 2; y < mm.h - 1; y++) for (let x = 1; x < mm.w - 1; x++) if (mm.tiles[y * mm.w + x] !== want) { mm.tiles[y * mm.w + x] = want; mm.groundDirty = true; }
      if (mm.tiles[(mm.h - 1) * mm.w + 7] !== want) { mm.tiles[(mm.h - 1) * mm.w + 7] = want; mm.groundDirty = true; }
      mm.floor = L >= 2 ? '' : 'dark';
    };
    return m;
  }

  // =================== MÜZE ===================
  const HALLS = {
    main: { cats: ['Sikkeler', 'Seramik & Cam', 'Araç & Silah', 'Fosil & Doğa'], need: 0, name: 'Ana Salon',
      slots: [[2, 4], [4, 4], [6, 4], [8, 4], [10, 4], [12, 4], [14, 4], [16, 4], [2, 8], [4, 8], [6, 8], [8, 8], [10, 8], [12, 8], [14, 8], [16, 8], [2, 12], [4, 12]] },
    east: { cats: ['Takı & Süs', 'Yazıt & Mühür'], need: 10, name: 'Doğu Kanadı',
      slots: [[21, 10], [23, 10], [25, 10], [27, 10], [21, 13], [23, 13], [25, 13], [27, 13], [21, 16], [23, 16], [25, 16], [27, 16]] },
    vault: { cats: ['Heykel & Figür', 'Gizem'], need: 20, name: 'Hazine Salonu',
      slots: [[20, 3], [22, 3], [26, 3], [28, 3], [20, 5], [22, 5], [26, 5], [28, 5]] },
  };
  function buildMuseum() {
    const m = W.newMap('museum', 30, 19, T.MARBLE, {
      name: 'Kasaba Müzesi', style: 'museum', music: 'museum',
      ambient: () => { const t = AK.Time.min(); if (t >= 1170 || t < 370) return [100, 96, 140]; if (t >= 1080) return [215, 200, 210]; return [255, 255, 255]; },
    });
    room(m, 14);
    W.fill(m, 18, 2, 1, 16, T.WALL); W.set(m, 18, 12, T.MARBLE); W.set(m, 18, 13, T.MARBLE);
    W.fill(m, 19, 7, 10, 2, T.WALL); W.set(m, 23, 7, T.MARBLE); W.set(m, 24, 7, T.MARBLE); W.set(m, 23, 8, T.MARBLE); W.set(m, 24, 8, T.MARBLE);
    m.warps.push({ x: 14, y: 18, to: 'town', tx: 16, ty: 21, dir: 'down' });
    m.decals.push({ x: 2 * 16, y: 6, spr: S.painting(0) }, { x: 15 * 16, y: 6, spr: S.painting(1) }, { x: 21 * 16 - 4, y: 6, spr: S.painting(1) }, { x: 26 * 16, y: 6, spr: S.painting(0) });
    m.decals.push({ x: 5 * 16, y: 4, spr: S.windowBig() }, { x: 11 * 16, y: 4, spr: S.windowBig() });
    m.decals.push({ x: 14 * 16 + 4, y: 9 * 16, spr: S.runner(24, 8 * 16, '#8a2a3a') });
    m.decals.push({ x: 2 * 16, y: 1 * 16 + 2, spr: plaque('SİKKELER') }, { x: 9 * 16, y: 1 * 16 + 2, spr: plaque('SERAMİK & CAM') }, { x: 20 * 16, y: 1 * 16 + 2, spr: plaque('HEYKEL & GİZEM') }, { x: 19 * 16 + 2, y: 8 * 16 + 2, spr: plaque('TAKI & YAZIT') });
    beam(m, 5 * 16 + 4, 5 * 16 + 22, 34, 18); beam(m, 11 * 16 + 4, 11 * 16 + 22, 34, 18);
    W.add(m, Object.assign(at(1, 7), { kind: 'plaque', solid: [1, 7, 1, 1], spr: S.shelfSign('#7a5a2a'), int: () => AK.UI.toast('Araç & Silah ve Fosil & Doğa salonu.', 'museum'), prompt: 'Tabela' }));
    for (const [x, y] of [[9, 16], [17, 12], [25, 2]]) W.add(m, Object.assign(at(x, y), { kind: 'palm', solid: [x, y, 1, 1], spr: S.palm() }));
    W.add(m, Object.assign(at(14, 18), { kind: 'mat', flat: true, spr: S.doormat(), oy: -3 }));
    W.add(m, Object.assign(at(11, 15, 3), { kind: 'desk', solid: [11, 15, 3, 1], spr: S.desk(), int: () => AK.Museum.deskTalk(), prompt: 'Danışma' }));
    for (const [x, y] of [[1, 16], [17, 16], [1, 2], [28, 9], [28, 17]]) W.add(m, Object.assign(at(x, y), { kind: 'plant', solid: [x, y, 1, 1], spr: S.plant(1) }));
    AK.BldInt.seat(m, 'bench', 7, 12, S.bench(), 2);
    // kaideler
    const peds = [];
    const A = AK.Artifacts;
    for (const hk in HALLS) {
      const H = HALLS[hk];
      const arts = A.LIST.filter(a => H.cats.includes(a.cat)).sort((a, b) => H.cats.indexOf(a.cat) - H.cats.indexOf(b.cat) || a.idx - b.idx);
      arts.forEach((a, i) => {
        if (!H.slots[i]) return; // salonda boş yer yoksa vitrin eklenmez
        const [x, y] = H.slots[i];
        const big = a.rar >= 4;
        peds.push(W.add(m, Object.assign(at(x, y), {
          kind: 'ped', art: a.id, hall: hk, solid: [x, y, 1, 1],
          spr: () => big ? S.glassCase() : S.pedestal(a.rar >= 3 ? 'gold' : 'stone'),
          int: o => AK.Museum.pedestal(o.art), prompt: 'İncele',
          light: o => AK.state.museum.includes(o.art) ? { dy: -24, r: big ? 34 : 24, c: big ? '#fff0b0' : '#fff6e0', a: 0.8 } : null,
          draw(o, ctx, cx, cy, s) {
            const has = AK.state.museum.includes(o.art);
            const bx = Math.round(o.x - 8 - cx), top = Math.round(o.y - s.height - cy);
            if (has) {
              const bob = big ? Math.round(Math.sin(W.t * 2 + x) * 1) : 0;
              ctx.drawImage(AK.Icons.artifact(A.byId[o.art], false), bx, top - (big ? -4 : 8) + bob);
              if (big && Math.random() < 0.02) W.sparkle(o.x, o.y - 26, '#fff2b0', 2);
            } else {
              ctx.fillStyle = '#8a7a64'; ctx.fillRect(bx + 5, top + 4, 6, 4);
              ctx.fillStyle = '#efe6d0'; ctx.fillRect(bx + 7, top + 5, 2, 1); ctx.fillRect(bx + 8, top + 6, 1, 1);
            }
          },
        })));
      });
    }
    m.peds = peds;
    // ipler
    const ropes = [];
    for (const [x, y, h] of [[18, 12, 'east'], [18, 13, 'east'], [23, 8, 'vault'], [24, 8, 'vault']]) {
      ropes.push(W.add(m, Object.assign(at(x, y), {
        kind: 'rope', hall: h, solid: [x, y, 1, 1], spr: S.rope(), prompt: 'İncele',
        int: o => AK.UI.toast(`${HALLS[o.hall].name} henüz kapalı. ${HALLS[o.hall].need} bağışta açılacak. (Şu an: ${AK.state.museum.length})`, 'lock'),
      })));
    }
    m.ropes = ropes;
    m.refresh = mm => { const n = AK.state.museum.length; for (const o of mm.ropes) o.hidden = n >= HALLS[o.hall].need; };
    m.lights = () => [{ x: 12 * 16, y: 14 * 16, r: 50, c: '#ffd890', a: 0.8 }, { x: 8 * 16, y: 6 * 16, r: 80, c: '#fff0c0', a: 0.55 }, { x: 8 * 16, y: 11 * 16, r: 80, c: '#fff0c0', a: 0.5 }, { x: 23 * 16, y: 12 * 16, r: 80, c: '#fff0c0', a: 0.5 }, { x: 24 * 16, y: 4 * 16, r: 70, c: '#ffe8a0', a: 0.55 }];
    return m;
  }

  AK.Interiors = {
    HALLS, TABLES, TABLE_N,
    build() { buildHouse(); buildShop(); buildMuseum(); },
  };
})();
