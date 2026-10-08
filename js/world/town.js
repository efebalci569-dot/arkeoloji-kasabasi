// Kasaba haritası v2: binalar, meydan, nehir ve liman, park, bahçeler ve kasabanın gelişimine göre değişen süslemeler.
(function () {
  const U = AK.U, T = AK.T, S = AK.Spr;
  const W = AK.World;
  const MW = 78, MH = 52;

  // NPC'lerin kullandığı kapı ve noktalar (karo koordinatları)
  const DOORS = {
    house_player: [6, 34], house_nermin: [14, 34], house_defne: [43, 34], inn: [51, 34], komsu: [22, 34], postane: [35, 34],
    museum: [16, 20], library: [6, 20], shop: [42, 20], smithy: [52, 20], store: [45, 11], restaurant: [29, 13],
    belediye: [15, 10], warehouse: [69, 20],
  };
  const SPOTS = {
    fountain_w: [27, 22, 'right'], fountain_e: [32, 22, 'left'], fountain_s: [30, 25, 'up'],
    bench_w: [24, 27, 'down'], bench_e: [35, 27, 'down'], board: [26, 18, 'up'], plaza_n: [30, 17, 'down'],
    park_w: [23, 38, 'right'], park_e: [36, 38, 'left'], pond: [31, 37, 'down'], library_front: [8, 23, 'down'],
    garden: [11, 36, 'down'], restaurant_front: [31, 15, 'down'], smithy_front: [53, 22, 'left'], stall: [34, 20, 'up'],
    bridge: [61, 23, 'down'], well: [19, 28, 'left'], pier: [61, 32, 'down'],
  };

  const sz = () => AK.Time.season() === 3;
  const rep = () => (AK.Progress ? AK.Progress.rep() : 0);
  const SPEC = {
    house_player: () => ({ key: 'hp', w: 6, fh: 4, wallH: 44, extra: 30, wall: 'wood', wallCol: '#d8b47e', trim: '#6a4a2a', roof: 'hip', roofCol: '#b5523b', door: 2, doorCol: '#8d5d32', doorWin: true, windows: [0.4, 3.6], shutters: '#4f8a5a', winBox: true, chimney: 4.4, lamp: true, snow: sz() }),
    house_nermin: () => ({ key: 'hn', w: 6, fh: 4, wallH: 44, extra: 30, wall: 'timber', wallCol: '#efe4cc', beam: '#5a3a2a', trim: '#5a3a2a', roof: 'gable', roofCol: '#5a6a9a', door: 2, doorCol: '#6a5a8a', windows: [0.4, 3.6], winBox: true, curtains: '#c890b0', chimney: 0.6, snow: sz() }),
    house_defne: () => ({ key: 'hd', w: 6, fh: 4, wallH: 44, extra: 30, wall: 'stone', wallCol: '#b8b4a8', trim: '#3f5a52', roof: 'front', roofCol: '#3f6a6a', gableCol: '#c8c4b8', door: 2, doorCol: '#3f5a52', doorStyle: 'arch', windows: [0.4, 3.6], winStyle: 'arch', ivy: true, snow: sz() }),
    komsu: () => ({ key: 'hk', w: 6, fh: 4, wallH: 44, extra: 30, wall: 'brick', wallCol: '#a8584a', trim: '#4a3020', roof: 'hip', roofCol: '#6a5a4a', door: 2, doorCol: '#4a6a3a', windows: [0.4, 3.6], shutters: '#c8a050', chimney: 4.6, dormer: 2, snow: sz() }),
    postane: () => ({ key: 'po', w: 6, fh: 4, wallH: 44, extra: 30, wall: 'plaster', wallCol: '#f0d890', trim: '#7a4a2a', roof: 'front', roofCol: '#a8453a', gableCol: '#f4e2a8', gableWin: true, door: 2, doorCol: '#3d6aa8', doorWin: true, windows: [0.4, 3.6], winBox: true, sign: 'POSTA', signBg: '#f2c14e', snow: sz() }),
    inn: () => rep() >= 3
      ? { key: 'inn2', w: 6, fh: 4, wallH: 44, extra: 30, wall: 'timber', wallCol: '#f4e8d0', beam: '#6a3a2a', trim: '#6a3a2a', roof: 'hip', roofCol: '#8a4a3a', door: 2, doorCol: '#a8453a', windows: [0.4, 3.6], winBox: true, curtains: '#e8a0a0', chimney: 4.4, sign: 'PANSİYON', lamp: true, snow: sz() }
      : { key: 'inn1', w: 6, fh: 4, wallH: 44, extra: 30, wall: 'wood', wallCol: '#a89878', trim: '#5a4a3a', roof: 'hip', roofCol: '#6a5a4a', door: 2, doorCol: '#5a4a3a', windows: [0.4, 3.6], boarded: true, worn: true, snow: sz() },
    library: () => ({ key: 'lib', w: 7, fh: 5, wallH: 50, extra: 32, wall: 'stone', wallCol: '#c8c0b0', trim: '#4a3a2a', roof: 'hip', roofCol: '#3f6a52', door: 3, doorW: 14, doorStyle: 'arch', doorCol: '#5a3a22', windows: [0.6, 5.4], winStyle: 'arch', sign: 'KÜTÜPHANE', signBg: '#e8e0c8', ivy: true, lamp: true, snow: sz() }),
    museum: () => { const r = rep(); return { kind: 'museum', key: 'mus' + Math.min(r, 4), w: 11, fh: 7, extra: 44, door: 5, restored: r >= 2, banners: r >= 2, emblem: r >= 4, snow: sz() }; },
    belediye: () => ({ kind: 'townhall', key: 'bel', w: 10, fh: 5, extra: 44, door: 4, snow: sz() }),
    warehouse: () => ({ kind: 'warehouse', key: 'wh', w: 7, fh: 5, extra: 26, door: 3, snow: sz() }),
    shop: () => {
      const L = AK.state.shop.level;
      if (L <= 1) return { key: 'sh1', w: 8, fh: 5, wallH: 50, extra: 32, wall: 'wood', wallCol: '#b89a70', trim: '#5a4a2a', roof: 'gable', roofCol: '#7a6a5a', door: 3, doorCol: '#7a4f2a', windows: [0.8, 6.2], winStyle: 'shop', goods: ['#8a6a4a', '#7a6a5a'], sign: 'DÜKKÂN', signBg: '#c8b890', worn: true, snow: sz() };
      if (L === 2) return { key: 'sh2', w: 8, fh: 5, wallH: 50, extra: 32, wall: 'wood', wallCol: '#e8d4a4', trim: '#7a4f2a', roof: 'gable', roofCol: '#3a8a7a', door: 3, doorCol: '#2f6a5a', doorWin: true, windows: [0.8, 6.2], winStyle: 'shop', awning: ['#3a9e8f', '#f2e6c8'], sign: 'ARKEOLOJİ', signBg: '#f2e6c8', lamp: true, snow: sz() };
      if (L === 3) return { key: 'sh3', w: 8, fh: 5, wallH: 50, extra: 32, wall: 'stone', wallCol: '#d8d0c0', trim: '#4a3a2a', roof: 'hip', roofCol: '#2f6a8a', door: 3, doorCol: '#2a4a6a', doorStyle: 'arch', windows: [0.8, 6.2], winStyle: 'shop', awning: ['#c8553d', '#fff6e0'], sign: 'GALERİ', signBg: '#fff6e0', lamp: true, snow: sz() };
      return { key: 'sh4', w: 8, fh: 5, wallH: 50, extra: 32, wall: 'stone', wallCol: '#efe8da', quoins: '#c9a050', trim: '#7a4f2a', roof: 'hip', roofCol: '#a8453a', door: 3, doorW: 14, doorStyle: 'arch', doorCol: '#6a3a1a', windows: [0.8, 6.2], winStyle: 'shop', awning: ['#f2c14e', '#a8453a'], sign: 'ARKEOLOJİ MERKEZİ', signBg: '#f2e2a8', lamp: true, snow: sz() };
    },
    smithy: () => ({ key: 'sm', w: 7, fh: 5, wallH: 50, extra: 32, wall: 'brick', wallCol: '#9a4a3a', trim: '#3b3540', roof: 'gable', roofCol: '#4a4a5a', door: 3, doorCol: '#3b3540', windows: [0.6], forge: 4.6, chimney: 5.6, chimCol: '#7a3a2e', sign: 'DEMİRCİ', signBg: '#d8c8b0', snow: sz() }),
    store: () => ({ key: 'st', w: 7, fh: 5, wallH: 50, extra: 32, wall: 'plaster', wallCol: '#f0e0b8', trim: '#6a4a2a', roof: 'front', roofCol: '#c8783a', door: 3, doorCol: '#4f7a45', doorWin: true, windows: [0.8, 5.2], winStyle: 'shop', awning: ['#4f9a45', '#fff6e0'], sign: 'MAĞAZA', signBg: '#fff6e0', lamp: true, snow: sz() }),
    restaurant: () => ({ key: 're', w: 8, fh: 5, wallH: 50, extra: 32, wall: 'plaster', wallCol: '#f4e4c4', trim: '#7a3a2a', roof: 'hip', roofCol: '#c8453a', door: 3, doorCol: '#7a3a2a', doorWin: true, windows: [0.7, 6.3], winBox: true, curtains: '#e8c070', awning: ['#c8453a', '#fff6e0'], sign: "LALE'NİN MUTFAĞI", signBg: '#fff6e0', chimney: 6.2, lamp: true, snow: sz() }),
  };

  function building(m, id, bx, by, w, fh, door) {
    return W.add(m, {
      kind: 'bld', bid: id, id, x: (bx + w / 2) * 16, y: (by + fh) * 16, fade: true,
      cshadow: AK.Bld.shadow(bx, by, w, fh), csx: bx * 16, csy: by * 16,
      spr(o) {
        const s = AK.Bld.draw(SPEC[id]());
        const h = AK.Time.hour();
        o.emit = (h >= 17 && h < 24) || h < 2 ? s.wins : null;
        o.smoke = s.smoke;
        o.lampPts = s.lamps;
        return s;
      },
      light(o) {
        if (!o._spr || !o.lampPts) return null;
        const s = o._spr, bx0 = o.x - s.width / 2, by0 = o.y - s.height;
        return o.lampPts.map(p => p[2] === 'forge'
          ? { dx: bx0 + p[0] - o.x, dy: by0 + p[1] - o.y, r: 46, c: '#ff9040', a: 1, fl: true }
          : { dx: bx0 + p[0] - o.x, dy: by0 + p[1] - o.y, r: 30, c: '#ffd890', a: 0.9, fl: true });
      },
      solid: [bx, by, w, fh], holes: [[bx + door, by + fh - 1]],
    });
  }
  function treeObj(m, tx, ty, kind, v) {
    return W.add(m, {
      kind: 'tree', x: tx * 16 + 8, y: ty * 16 + 14, tx, ty, solid: [tx, ty, 1, 1], fade: kind !== 'bush',
      shadow: kind === 'pine' ? [20, 7, 4] : [32, 9, 5], flatShadow: true,
      spr: () => kind === 'pine' ? S.pine(AK.Time.season(), v) : S.oak(AK.Time.season(), v),
    });
  }
  const prop = (m, o) => W.add(m, Object.assign({ flatShadow: true }, o));

  function build() {
    const m = W.newMap('town', MW, MH, T.GRASS, { name: 'Kasaba', sub: 'Arkeoloji Kasabası', outdoor: true, music: 'town', hasWater: true });
    const r = U.rng(4242);
    // kenarlar: sık orman
    W.fill(m, 0, 0, MW, 2, T.CANOPY); W.fill(m, 0, MH - 2, MW, 2, T.CANOPY);
    W.fill(m, 0, 0, 2, MH, T.CANOPY); W.fill(m, MW - 2, 0, 2, MH, T.CANOPY);
    // nehir
    W.fill(m, 59, 2, 5, MH - 4, T.SAND);
    W.fill(m, 60, 2, 3, MH - 4, T.WATER);
    // yollar
    W.fill(m, 0, 22, 23, 2, T.PATH); W.fill(m, 37, 22, 37, 2, T.PATH);
    W.fill(m, 59, 22, 5, 2, T.BRIDGE);
    W.fill(m, 22, 15, 16, 14, T.PLAZA);
    W.fill(m, 29, 14, 1, 1, T.PATH);
    W.fill(m, 34, 12, 24, 2, T.PATH); W.fill(m, 34, 14, 2, 1, T.PATH);
    W.fill(m, 55, 0, 2, 12, T.PATH);
    W.fill(m, 29, 29, 2, 6, T.PATH);
    W.fill(m, 3, 35, 54, 2, T.PATH);
    W.fill(m, 10, 11, 15, 1, T.PATH); W.fill(m, 10, 12, 1, 10, T.PATH); W.fill(m, 24, 12, 1, 3, T.PATH);
    for (const [x, y] of [[6, 21], [16, 21], [42, 21], [52, 21], [69, 21], [15, 11]]) W.set(m, x, y, T.PATH);
    // iskele (nehir)
    W.fill(m, 60, 33, 3, 1, T.BRIDGE);
    // park & gölet
    W.ovalFill(m, 30, 41.5, 7.5, 3.2, T.SAND);
    W.ovalFill(m, 30, 41.5, 6, 2.2, T.WATER);
    W.fill(m, 30, 38, 1, 3, T.BRIDGE);
    // batı yolu kapalı
    W.block(m, 0, 22, 2, 2);

    // ---------------- binalar ----------------
    building(m, 'library', 3, 16, 7, 5, 3);
    building(m, 'museum', 11, 14, 11, 7, 5);
    building(m, 'belediye', 11, 6, 10, 5, 4);
    building(m, 'shop', 39, 16, 8, 5, 3);
    building(m, 'smithy', 49, 16, 7, 5, 3);
    building(m, 'store', 42, 7, 7, 5, 3);
    building(m, 'restaurant', 26, 9, 8, 5, 3);
    building(m, 'warehouse', 66, 16, 7, 5, 3);
    building(m, 'house_player', 4, 31, 6, 4, 2);
    building(m, 'house_nermin', 12, 31, 6, 4, 2);
    building(m, 'komsu', 20, 31, 6, 4, 2);
    building(m, 'postane', 33, 31, 6, 4, 2);
    building(m, 'house_defne', 41, 31, 6, 4, 2);
    building(m, 'inn', 49, 31, 6, 4, 2);

    // kapı geçişleri
    const svc = (id) => () => AK.Services.open(id);
    const knock = (who) => () => AK.UI.toast(AK.NPCs.knock(who), 'mail');
    m.warps.push(
      { x: 6, y: 34, to: 'house', tx: 6, ty: 8, dir: 'up' },
      { x: 16, y: 20, to: 'museum', tx: 14, ty: 17, dir: 'up' },
      { x: 42, y: 20, to: 'shop', tx: 7, ty: 10, dir: 'up' },
      { x: 6, y: 20, fn: svc('library') }, { x: 52, y: 20, fn: svc('smithy') },
      { x: 45, y: 11, fn: svc('store') }, { x: 29, y: 13, fn: svc('restaurant') },
      { x: 15, y: 10, fn: svc('townhall') }, { x: 69, y: 20, fn: svc('warehouse') },
      { x: 35, y: 34, fn: svc('postane') },
      { x: 22, y: 34, fn: () => AK.UI.toast(U.pick(['Kapıyı kimse açmıyor. İçeriden radyo sesi geliyor.', 'Komşu teyze pencereden el sallıyor: "Bugün çok yoruldum yavrum, sonra gel!"', 'Kapıda bir not: "Pazara gittim."']), 'mail') },
      { x: 14, y: 34, fn: knock('nermin') }, { x: 43, y: 34, fn: knock('defne') },
      { x: 51, y: 34, fn: () => AK.Services.open('inn') },
      {
        x: 55, y: 0, w: 2, h: 1, to: 'forest', tx: 22, ty: 33, dir: 'up', back: [0, 14],
        need: () => !AK.state.flags.kaziIzni ? 'Kazı alanına girmek için önce müzede Nermin Hanım ile konuşmalısın.' :
          AK.Law && AK.Law.permitBanned() ? 'Kazı iznin müfettiş tarafından bugünlük askıya alındı.' :
          !AK.Weather.sitesOpen() ? 'Fırtına! Kazı alanı bugün güvenlik nedeniyle kapalı.' : null,
      },
    );

    // ---------------- meydan ----------------
    prop(m, {
      kind: 'fountain', x: 30 * 16, y: 23 * 16 + 2, solid: [29, 21, 2, 2], shadow: [50, 12, 4],
      spr: () => S.fountain(rep() >= 1 ? 1 : 0, Math.floor(W.t * 4) % 3),
      int: () => AK.UI.toast(rep() >= 1 ? 'Çeşme yeniden akıyor. Suyun sesi meydanı canlandırmış.' : 'Kurumuş eski çeşme. Kasaba onu tamir ettirecek parayı bulamamış.', 'museum'),
      prompt: 'İncele',
    });
    prop(m, { kind: 'board', x: 26 * 16, y: 18 * 16, solid: [25, 17, 2, 1], shadow: [30, 7, 3], spr: S.board(), int: () => AK.Services.open('board'), prompt: 'İlan Panosu' });
    prop(m, {
      kind: 'clock', x: 36 * 16, y: 18 * 16, solid: [35, 16, 2, 2], shadow: [36, 10, 6], fade: true, spr: () => S.clockTower(AK.Time.season()),
      draw(o, ctx, cx, cy, s) {
        const bx = Math.round(o.x - s.width / 2 - cx), by = Math.round(o.y - s.height - cy);
        const mn = AK.Time.min(), hr = (mn / 60) % 12, mi = mn % 60;
        const ccx = bx + 18, ccy = by + 46;
        const ha = hr / 12 * Math.PI * 2 - Math.PI / 2, ma = mi / 60 * Math.PI * 2 - Math.PI / 2;
        ctx.fillStyle = '#2a1a24';
        for (let k = 0; k <= 4; k++) ctx.fillRect(Math.round(ccx + Math.cos(ha) * k), Math.round(ccy + Math.sin(ha) * k), 1, 1);
        ctx.fillStyle = '#5a3a3a';
        for (let k = 0; k <= 6; k++) ctx.fillRect(Math.round(ccx + Math.cos(ma) * k), Math.round(ccy + Math.sin(ma) * k), 1, 1);
      },
      int: () => AK.UI.toast(`Saat kulesi: ${AK.Time.clock()}. Kasaba ${AK.Progress.stageName()}.`, 'clock'), prompt: 'Saat Kulesi',
    });
    for (const [x, y] of [[23, 26], [35, 26]]) prop(m, { kind: 'bench', x: (x + 1) * 16, y: (y + 1) * 16, solid: [x, y, 2, 1], shadow: [30, 6, 3], spr: S.bench() });
    for (const [x, y] of [[23, 16], [23, 27], [36, 27], [33, 16], [8, 24], [50, 24], [20, 37], [40, 37], [55, 14], [65, 21], [58, 21], [12, 12], [20, 12], [72, 24]]) {
      prop(m, { kind: 'lamp', x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], shadow: [10, 4, 3], spr: () => S.lamp(AK.Time.isDark() ? 1 : 0), light: { dy: -30, r: 46, c: '#ffd890', a: 0.95, fl: true }, emit: [[5, 4, 6, 5]] });
    }
    for (const [x, y] of [[22, 20], [36, 20], [22, 24], [36, 24]]) prop(m, { kind: 'planter', x: (x + 1) * 16, y: (y + 1) * 16, solid: [x, y, 2, 1], spr: () => S.planter(rep() >= 1, AK.Time.season()) });
    // gelişim süsleri
    const deco = [];
    for (const [x, y] of [[22, 15], [37, 15], [22, 28], [37, 28]]) deco.push(prop(m, { kind: 'banner', need: 2, x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], spr: S.banner(x < 30 ? '#a8453a' : '#2f6a8a') }));
    deco.push(prop(m, { kind: 'statue', need: 4, x: 25 * 16 + 8, y: 24 * 16, solid: [25, 23, 1, 1], shadow: [22, 6, 4], spr: S.statue(), int: () => AK.UI.toast('"Kasabanın Kâşifine" — Kasaba halkı, keşiflerin anısına bu heykeli dikti.', 'star'), prompt: 'İncele' }));
    deco.push(prop(m, { kind: 'stall', need: 4, x: 34 * 16 + 8, y: 20 * 16, solid: [33, 19, 3, 1], shadow: [46, 8, 4], spr: S.stall('#3d7fd9'), int: () => AK.Services.open('souvenir'), prompt: 'Hediyelik Eşya' }));
    for (const [x, y, c] of [[24, 18, '#c8553d'], [24, 21, '#4f9a45'], [33, 25, '#9b4fd1']]) deco.push(prop(m, { kind: 'stall', fest: true, x: x * 16 + 8, y: (y + 1) * 16, solid: [x - 1, y, 3, 1], spr: S.stall(c) }));
    m.devDeco = deco;

    // ---------------- dükkânların önü ----------------
    prop(m, { kind: 'amphora', x: 38 * 16 + 8, y: 20 * 16, solid: [38, 19, 1, 1], shadow: [12, 4, 3], spr: S.amphoraStand() });
    prop(m, { kind: 'crates', x: 47 * 16 + 12, y: 20 * 16, solid: [47, 19, 1, 1], shadow: [22, 5, 4], spr: S.crates(0) });
    prop(m, { kind: 'cart', x: 50 * 16, y: 11 * 16, solid: [49, 10, 2, 1], shadow: [36, 6, 4], spr: S.cart('goods') });
    prop(m, { kind: 'sacks', x: 41 * 16 + 4, y: 12 * 16 - 2, solid: [41, 11, 1, 1], spr: S.sacks() });
    prop(m, { kind: 'hay', x: 40 * 16 + 8, y: 11 * 16, solid: [40, 10, 1, 1], shadow: [18, 5, 3], spr: S.hay() });
    for (const [x, y, c] of [[35, 9, '#c8453a'], [38, 9, '#3d7fd9']]) prop(m, { kind: 'umbrella', x: (x + 1) * 16, y: (y + 1) * 16, solid: [x, y, 2, 1], shadow: [30, 7, 4], spr: S.umbrellaTable(c) });
    prop(m, { kind: 'anvil', x: 56 * 16 + 8, y: 20 * 16, solid: [56, 19, 1, 1], shadow: [16, 4, 3], spr: S.anvil(), int: () => AK.UI.toast('Kaya\'nın dış örsü. Sıcak demir kokusu hâlâ havada.', 'museum'), prompt: 'Örs' });
    prop(m, { kind: 'grind', x: 57 * 16 + 8, y: 18 * 16, solid: [57, 17, 1, 1], spr: S.grindstone() });
    prop(m, { kind: 'barrel', x: 56 * 16 + 8, y: 18 * 16, solid: [56, 17, 1, 1], shadow: [12, 4, 3], spr: S.barrel() });
    prop(m, { kind: 'bookcart', x: 8 * 16 + 8, y: 22 * 16 - 2, solid: [8, 21, 1, 1], spr: S.bookcart(), int: () => AK.Services.open('library'), prompt: 'Kitap Arabası' });
    prop(m, { kind: 'flag', x: 21 * 16 + 8, y: 11 * 16, solid: [21, 10, 1, 1], spr: S.banner('#c8352e') });
    // liman
    prop(m, { kind: 'crates', x: 64 * 16 + 12, y: 20 * 16, solid: [64, 19, 1, 1], shadow: [22, 5, 4], spr: S.crates(1) });
    prop(m, { kind: 'crates', x: 73 * 16 + 8, y: 18 * 16, solid: [73, 17, 1, 1], shadow: [22, 5, 4], spr: S.crates(0) });
    prop(m, { kind: 'barrel', x: 73 * 16 + 8, y: 20 * 16, solid: [73, 19, 1, 1], spr: S.barrel() });
    prop(m, { kind: 'sacks', x: 67 * 16, y: 25 * 16, solid: [66, 24, 2, 1], spr: S.sacks() });
    prop(m, { kind: 'boat', x: 61 * 16 + 8, y: 36 * 16, spr: S.rowboat(), update: o => { o.oy = Math.round(Math.sin(W.t * 1.5) * 1); } });
    prop(m, { kind: 'post', x: 63 * 16 + 8, y: 34 * 16, solid: [63, 33, 1, 1], spr: S.lanternPost(), light: { dy: -24, r: 34, c: '#ffd890', a: 0.9, fl: true } });
    for (const x of [59, 63]) for (const y of [21, 24]) prop(m, { kind: 'rail', x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], spr: S.bridgeRail() });
    for (const x of [60, 61, 62]) { prop(m, { kind: 'rail', x: x * 16 + 8, y: 22 * 16 - 1, spr: S.bridgeRail(), oy: 0 }); prop(m, { kind: 'rail', x: x * 16 + 8, y: 25 * 16 - 2, spr: S.bridgeRail() }); }
    prop(m, { kind: 'signpost', x: 58 * 16 + 8, y: 25 * 16, solid: [58, 24, 1, 1], spr: S.signpost('LİMAN', 'MEYDAN') });
    prop(m, { kind: 'signpost', x: 21 * 16 + 8, y: 25 * 16, solid: [21, 24, 1, 1], spr: S.signpost('MEYDAN', 'OTOBÜS') });
    // karaborsacı Gölge (gece)
    const smug = W.add(m, {
      kind: 'smuggler', x: 71 * 16 + 8, y: 24 * 16 + 12, irect: [70 * 16, 23 * 16, 40, 40], prio: true, shadow: [12, 4, 0],
      spr: () => AK.Chars.get(AK.Law.SMUGGLER, 'left', 'idle', 0),
      light: { dx: -10, dy: -10, r: 26, c: '#ffb060', a: 0.9, fl: true },
      draw(o, ctx, cx, cy) { ctx.fillStyle = '#3b3540'; ctx.fillRect(Math.round(o.x - 12 - cx), Math.round(o.y - 14 - cy), 3, 5); ctx.fillStyle = '#ffd27a'; ctx.fillRect(Math.round(o.x - 11 - cx), Math.round(o.y - 13 - cy), 1, 3); },
      int: () => AK.Services.open('blackmarket'), prompt: 'Gölge',
    });
    m.smuggler = smug;
    // otobüs durağı & tabelalar
    prop(m, { kind: 'bus', x: 3 * 16 + 8, y: 25 * 16, solid: [2, 24, 3, 1], shadow: [46, 8, 4], spr: S.busstop(), int: () => AK.Services.open('bus'), prompt: 'Otobüs Durağı' });
    prop(m, { kind: 'sign', x: 2 * 16 + 8, y: 22 * 16, solid: [2, 21, 1, 1], spr: S.sign(), int: () => AK.UI.toast('Şehre giden yol. Uzak bölgelere gitmek için otobüs durağını kullan.', 'bus'), prompt: 'Tabela' });
    prop(m, { kind: 'sign', x: 54 * 16 + 8, y: 11 * 16, solid: [54, 10, 1, 1], spr: S.sign(), int: () => AK.UI.toast('↑ Eski Orman Kazı Alanı', 'museum'), prompt: 'Tabela' });
    // posta kutusu
    prop(m, {
      kind: 'mailbox', x: 10 * 16 + 8, y: 35 * 16 - 2, solid: [10, 34, 1, 1], spr: () => S.mailbox(AK.state.mail.some(l => !l.read) ? 1 : 0),
      int: () => AK.Menus.mail(), prompt: 'Posta Kutusu',
    });
    // evlerin çevresi
    prop(m, { kind: 'wood', x: 11 * 16 + 4, y: 34 * 16 - 2, solid: [11, 33, 1, 1], spr: S.firewood() });
    prop(m, { kind: 'laundry', x: 7 * 16, y: 29 * 16 + 4, spr: S.laundry() });
    prop(m, { kind: 'well', x: 19 * 16, y: 28 * 16, solid: [18, 27, 2, 1], shadow: [32, 8, 4], spr: () => S.well(AK.Time.season()), int: () => AK.UI.toast('Eski taş kuyu. Aşağıdan serin bir hava ve su sesi geliyor.', 'museum'), prompt: 'Kuyu' });
    for (const [x, y, v] of [[3, 34, 0], [19, 34, 1], [26, 34, 2], [32, 34, 3], [39, 34, 1], [47, 34, 2], [55, 34, 0]]) prop(m, { kind: 'pot', x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], spr: () => S.flowerpot(v, AK.Time.season()) });
    // sebze bahçesi (oyuncunun)
    for (let x = 4; x <= 11; x++) for (const y of [38, 43]) if (!(y === 38 && (x === 7 || x === 8))) prop(m, { kind: 'fence', x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], spr: () => S.fence('h', AK.Time.season()) });
    for (let y = 39; y <= 42; y++) for (const x of [4, 11]) prop(m, { kind: 'fence', x: x * 16 + 8, y: (y + 1) * 16, solid: [x, y, 1, 1], spr: () => S.fence('p', AK.Time.season()) });
    for (let y = 40; y <= 42; y++) for (let x = 5; x <= 10; x++) if (x !== 7 && x !== 8 || y !== 40) prop(m, { kind: 'crop', flat: true, x: x * 16 + 8, y: (y + 1) * 16, spr: () => S.crops(AK.Time.season(), x + y) });
    prop(m, { kind: 'scarecrow', x: 10 * 16 + 8, y: 40 * 16 + 4, solid: [10, 39, 1, 1], spr: S.scarecrow(), int: () => AK.UI.toast('Amcanın bahçesi. Korkuluk bile onun eski kâşif şapkasını takıyor!', 'star'), prompt: 'Bahçe' });
    // park
    for (const [x, y] of [[21, 38], [37, 38]]) prop(m, { kind: 'bench', x: (x + 1) * 16, y: (y + 1) * 16, solid: [x, y, 2, 1], shadow: [30, 6, 3], spr: S.bench() });
    prop(m, { kind: 'picnic', x: 42 * 16, y: 41 * 16, solid: [41, 40, 2, 1], shadow: [34, 7, 4], spr: S.picnic() });
    prop(m, { kind: 'boat', x: 32 * 16, y: 41 * 16 + 6, spr: S.rowboat(), update: o => { o.oy = Math.round(Math.sin(W.t * 1.3 + 1) * 1); } });
    for (const [x, y] of [[23, 42], [36, 40], [26, 44], [34, 44]]) prop(m, { kind: 'reeds', x: x * 16 + 8, y: (y + 1) * 16, spr: () => S.reeds(AK.Time.season()) });
    for (const [x, y] of [[27, 41], [33, 42]]) prop(m, { kind: 'lily', flat: true, x: x * 16 + 8, y: y * 16 + 12, spr: () => AK.Time.season() === 3 ? null : S.lily() });
    // ördekler
    const duck = (cx, cy, rx, ry, sp, ph) => prop(m, {
      kind: 'duck', x: cx * 16, y: cy * 16, t0: ph,
      spr: o => S.duck(Math.floor(W.t * 3) % 2, o.vx < 0 ? -1 : 1),
      update(o) { if (AK.Time.season() === 3) { o.hidden = true; return; } const t = W.t * sp + o.t0; const nx = cx * 16 + Math.cos(t) * rx; o.vx = nx - o.x; o.x = nx; o.y = cy * 16 + Math.sin(t) * ry; },
    });
    duck(30, 42, 56, 14, 0.25, 0); duck(30, 42, 40, 10, 0.32, 2.5);
    // nehirde ördek
    prop(m, { kind: 'duck', x: 61 * 16, y: 10 * 16, spr: o => S.duck(Math.floor(W.t * 3) % 2, o.vx < 0 ? -1 : 1), update(o) { if (AK.Time.season() === 3) { o.hidden = true; return; } const ny = (10 + ((W.t * 0.4) % 30)) * 16; o.vx = 1; o.x = 61 * 16 + Math.sin(W.t) * 6; o.y = ny; } });

    // ---------------- ağaçlar, çalılar, çiçekler ----------------
    const occupied = (x, y) => {
      if (x < 2 || y < 2 || x > MW - 3 || y > MH - 3) return true;
      if (m.tiles[y * m.w + x] !== T.GRASS) return true;
      for (const o of m.objects) if (o.solid) { const [a, b, w, h] = o.solid; if (x >= a - 1 && x <= a + w && y >= b - 1 && y <= b + h) return true; }
      for (const wp of m.warps) if (Math.abs(wp.x - x) <= 1 && y >= wp.y && y <= wp.y + 2) return true;
      if (x >= 3 && x <= 12 && y >= 37 && y <= 44) return true;
      return false;
    };
    const clear3 = (x, y) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (occupied(x + i, y + j)) return false; return true; };
    for (let x = 2; x < MW - 2; x += 2) { if (!occupied(x, 2)) treeObj(m, x, 2, r() < 0.3 ? 'pine' : 'oak', (r() * 6) | 0); if (!occupied(x + (r() < 0.5 ? 1 : 0), MH - 3)) treeObj(m, x, MH - 3, r() < 0.3 ? 'pine' : 'oak', (r() * 6) | 0); }
    for (let y = 4; y < MH - 4; y += 2) { if (!occupied(2, y)) treeObj(m, 2, y, r() < 0.4 ? 'pine' : 'oak', (r() * 6) | 0); if (!occupied(MW - 3, y)) treeObj(m, MW - 3, y, r() < 0.4 ? 'pine' : 'oak', (r() * 6) | 0); }
    let placed = 0;
    for (let i = 0; i < 600 && placed < 62; i++) {
      const x = 3 + ((r() * (MW - 6)) | 0), y = 3 + ((r() * (MH - 6)) | 0);
      if (!clear3(x, y)) continue;
      if (m.objects.some(o => o.kind === 'tree' && Math.abs(o.tx - x) < 3 && Math.abs(o.ty - y) < 3)) continue;
      treeObj(m, x, y, r() < 0.3 ? 'pine' : 'oak', (r() * 6) | 0); placed++;
    }
    for (let i = 0; i < 70; i++) {
      const x = 3 + ((r() * (MW - 6)) | 0), y = 3 + ((r() * (MH - 6)) | 0);
      if (!clear3(x, y)) continue;
      const v = (r() * 4) | 0;
      prop(m, { kind: 'bush', x: x * 16 + 8, y: y * 16 + 15, tx: x, ty: y, solid: [x, y, 1, 1], shadow: [16, 5, 3], spr: () => S.bush(AK.Time.season(), v) });
    }
    for (let i = 0; i < 12; i++) {
      const x = 3 + ((r() * (MW - 6)) | 0), y = 3 + ((r() * (MH - 6)) | 0);
      if (!clear3(x, y)) continue;
      prop(m, { kind: 'rockd', x: x * 16 + 8, y: y * 16 + 15, solid: [x, y, 1, 1], shadow: [14, 4, 3], spr: S.rock('forest', i) });
    }
    for (let i = 0; i < 380; i++) {
      const x = 2 + ((r() * (MW - 4)) | 0), y = 2 + ((r() * (MH - 4)) | 0);
      if (m.tiles[y * m.w + x] !== T.GRASS) continue;
      const v = (r() * 8) | 0;
      m.decals.push({ x: x * 16, y: y * 16, spr: s => S.flowers(s, v) });
    }

    m.refresh = refresh;
    m.daily = daily;
    m.update = mm => { mm.smuggler.hidden = !(AK.Law && AK.Law.smugglerHere()); };
    m.lights = () => [];
    return m;
  }

  function refresh(m) {
    const rp = rep(), fest = AK.Progress && AK.Progress.eventToday() === 'festival';
    for (const o of m.devDeco) o.hidden = o.fest ? !fest : rp < o.need;
    if (m.smuggler) m.smuggler.hidden = !(AK.Law && AK.Law.smugglerHere());
  }

  // hazine avı günü X işaretleri
  function daily(m) {
    m.objects = m.objects.filter(o => o.kind !== 'xmark');
    if (!AK.Progress || AK.Progress.eventToday() !== 'hazine') return;
    const r = U.rng(U.hash('hazine' + AK.Time.abs()));
    const used = (AK.state.dig.town && AK.state.dig.town.day === AK.Time.abs()) ? AK.state.dig.town.used : [];
    let n = 0;
    for (let i = 0; i < 400 && n < 8; i++) {
      const x = 4 + ((r() * (MW - 8)) | 0), y = 4 + ((r() * (MH - 8)) | 0);
      if (m.tiles[y * m.w + x] !== T.GRASS || W.solid(m, x, y) || m.objects.some(o => o.tx === x && o.ty === y)) continue;
      const id = 'x' + n++;
      if (used.includes(id)) continue;
      W.add(m, {
        kind: 'xmark', sid: id, flat: true, tx: x, ty: y, x: x * 16 + 8, y: y * 16 + 16, spr: S.xmark(),
        hit(o, tool) {
          if (tool !== 'shovel') return { ok: false, msg: 'Hazine işaretini kürekle kazmalısın!' };
          AK.Exc.markUsed('town', o.sid);
          W.remove(m, o);
          AK.Exc.treasure(o.x, o.y - 6);
          return { ok: true, cost: 2 };
        },
      });
    }
  }

  AK.Town = { DOORS, SPOTS, build, SPEC };
})();
