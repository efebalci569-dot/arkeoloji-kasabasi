// Kasabadaki tüm binaların iç mekânları, açılış saatleri, oturulabilir mobilyalar ve yan karakterler.
(function () {
  const U = AK.U, T = AK.T, S = AK.Spr, W = AK.World;
  const at = (tx, ty, w = 1) => ({ x: (tx + w / 2) * 16, y: (ty + 1) * 16 });
  const min = () => AK.Time.min();
  const between = (a, b) => { const m = min(); return a <= b ? m >= a && m < b : m >= a || m < b; };

  // ---------------- ortak yardımcılar ----------------
  function room(m, doorX) {
    W.fill(m, 0, 0, m.w, 2, T.WALL);
    W.fill(m, 0, 0, 1, m.h, T.WALL); W.fill(m, m.w - 1, 0, 1, m.h, T.WALL);
    W.fill(m, 0, m.h - 1, m.w, 1, T.WALL);
    W.set(m, doorX, m.h - 1, m.tiles[2 * m.w + 2]);
  }
  function amb() {
    const t = min();
    if (t >= 1170 || t < 370) return [120, 112, 160];
    if (t >= 1080) return [215, 196, 205];
    return [255, 255, 255];
  }
  const put = (m, kind, tx, ty, spr, w = 1, extra) => W.add(m, Object.assign(at(tx, ty, w), { kind, solid: [tx, ty, w, 1], spr }, extra || {}));
  const deco = (m, kind, tx, ty, spr, w = 1, extra) => W.add(m, Object.assign(at(tx, ty, w), { kind, spr }, extra || {}));
  function beam(m, x0, x1, len, slant) {
    return W.add(m, {
      kind: 'beam', flat: true, x: (x0 + x1) / 2, y: 33, spr: null,
      draw(o, ctx, cx, cy) {
        const t = min();
        if (t < 390 || t > 1110 || AK.Weather.isWet()) return;
        const a = t < 450 ? (t - 390) / 60 : t > 1020 ? (1110 - t) / 90 : 1;
        ctx.fillStyle = 'rgba(' + (t > 960 ? '255,196,140' : '255,242,200') + ',' + (0.15 * a).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(x0 - cx, 32 - cy); ctx.lineTo(x1 - cx, 32 - cy); ctx.lineTo(x1 + slant - cx, 32 + len - cy); ctx.lineTo(x0 + slant - cx, 32 + len - cy); ctx.closePath(); ctx.fill();
      },
    });
  }
  function windowAt(m, tx) { m.decals.push({ x: tx * 16 + 4, y: 4, spr: S.windowBig() }); beam(m, tx * 16 + 6, tx * 16 + 24, 32, 16); }

  // ---------------- oturma yerleri ----------------
  function seatDefs(kind, o) {
    switch (kind) {
      case 'bench': return [{ x: o.x - 7, y: o.y - 7, dir: 'down', sort: o.y + 1 }, { x: o.x + 7, y: o.y - 7, dir: 'down', sort: o.y + 1 }];
      case 'sofa': return [{ x: o.x - 8, y: o.y - 8, dir: 'down', sort: o.y + 1 }, { x: o.x + 8, y: o.y - 8, dir: 'down', sort: o.y + 1 }];
      case 'chair': return [{ x: o.x, y: o.y - 7, dir: 'down', sort: o.y + 1 }];
      case 'chairR': return [{ x: o.x + 1, y: o.y - 8, dir: 'right', sort: o.y + 1 }];
      case 'chairL': return [{ x: o.x - 1, y: o.y - 8, dir: 'left', sort: o.y + 1 }];
      case 'armchair': return [{ x: o.x, y: o.y - 8, dir: 'down', sort: o.y + 1 }];
      case 'stool': return [{ x: o.x, y: o.y - 9, dir: 'down', sort: o.y + 1 }];
      default: return [];
    }
  }
  // oturulabilir nesne ekle (dünyaya ve oyuncu etkileşimine)
  function seat(m, kind, tx, ty, spr, w = 1, extra) {
    const o = W.add(m, Object.assign(at(tx, ty, w), { kind: 'seat', seatKind: kind, solid: [tx, ty, w, 1], spr, prompt: 'Otur', int: ob => AK.Player.sitOn(ob) }, extra || {}));
    o.seats = seatDefs(kind, o);
    return o;
  }
  // NPC için oturma noktası: yaklaşma karosu + oturma
  const npcSeat = (o, i, approach) => ({ approach, seat: o.seats[i || 0], dir: o.seats[i || 0].dir });

  // ---------------- yan karakter (sabit) ----------------
  const LOOKS = {
    cemil: { skin: '#e2a878', hair: '#3b3540', hairStyle: 'short', shirt: '#3d6aa8', outfit: 'vest', outfitCol: '#2a4a7a', pants: '#2a3a5a', hat: 'cap', hatCol: '#3d6aa8', acc: ['mustache'] },
    hatice: { skin: '#f0c39b', hair: '#d8d0d8', hairStyle: 'bun', shirt: '#a8453a', outfit: 'dress', outfitCol: '#6a3a5a', pants: '#6a3a5a', acc: ['glasses', 'scarf'], scarfCol: '#e8c070' },
    mert: { skin: '#d8a070', hair: '#5a3a22', hairStyle: 'curly', shirt: '#f2e6c8', outfit: 'apron', outfitCol: '#7a3a2a', pants: '#4a3a2a', acc: ['beard'] },
  };
  function mnpc(m, look, name, tx, ty, dir, o) {
    const st = o.seat;
    return W.add(m, {
      kind: 'mnpc', name, x: st ? st.x : tx * 16 + 8, y: st ? st.y : ty * 16 + 12, sortY: st ? st.sort : undefined, oy: 1,
      spr: () => AK.Chars.get(typeof look === 'function' ? look() : look, st ? st.dir : dir, st ? 'sit' : 'idle', 0), shadow: st ? null : [12, 4, 0],
      irect: [tx * 16 - 4, ty * 16 - 10, 24, 30], prio: true, int: o.int, prompt: 'Konuş · ' + name,
      update: e => { e.hidden = o.visible ? !o.visible() : false; },
    });
  }
  function patron(m, seatObj, idx, win, seed) {
    const r = U.rng(seed);
    const look = { skin: U.pick(['#f2cfae', '#e2a878', '#b07a52', '#f0c39b'], r), hair: U.pick(['#f2d070', '#5a3a22', '#2a2024', '#b8482a'], r), hairStyle: U.pick(['short', 'long', 'ponytail', 'curly'], r), shirt: U.pick(['#e85a7a', '#3d9ae0', '#f2c14e', '#7cc45a', '#ff8a5c'], r), pants: U.pick(['#3b5a8a', '#5a4a3a', '#e8dcc0'], r), hat: r() < 0.5 ? 'sunhat' : null, hatCol: '#f2e6c8' };
    const st = seatObj.seats[idx];
    return W.add(m, {
      kind: 'patron', x: st.x, y: st.y, sortY: st.sort, oy: 1, spr: () => AK.Chars.get(look, st.dir, 'sit', 0),
      irect: [st.x - 8, st.y - 20, 16, 24], int: () => AK.Dialog.open({ name: 'Turist', look, lines: [U.pick(AK.Lines.tourist)] }), prompt: 'Konuş · Turist',
      update: e => { e.hidden = !(AK.Progress.rep() >= 3 && win()); },
    });
  }

  const REG = {};
  const exitTo = (m, doorX, b) => m.warps.push({ x: doorX, y: m.h - 1, to: 'town', tx: AK.Town.DOORS[b][0], ty: AK.Town.DOORS[b][1] + 1, dir: 'down' });
  function newRoom(id, b, w, h, doorX, style, floor, opts) {
    const m = W.newMap(id, w, h, opts && opts.tile || T.WOOD, Object.assign({ name: opts.name, style, floor, music: opts.music || 'shop', ambient: opts.ambient || amb }, opts.extra || {}));
    room(m, doorX);
    exitTo(m, doorX, b);
    deco(m, 'mat', doorX, h - 1, S.doormat(), 1, { flat: true, oy: -3 });
    REG[b] = { map: id, entry: [doorX, h - 2], spots: {}, seats: [] };
    m.lights = () => [{ x: w * 8, y: h * 8, r: Math.max(w, h) * 7, c: '#ffd8a0', a: 0.55 }];
    return m;
  }

  // =================== KÜTÜPHANE ===================
  function library() {
    const m = newRoom('int_library', 'library', 16, 11, 7, 'library', 'dark', { name: 'Kütüphane', music: 'museum' });
    for (const x of [1, 3, 5, 9, 11, 13]) put(m, 'shelf', x, 2, S.shelfTall('books', x), 2, { int: () => AK.Menus.books(), prompt: 'Kitaplara bak' });
    windowAt(m, 7);
    put(m, 'rtable', 3, 5, S.readingTable(), 2); put(m, 'rtable', 11, 5, S.readingTable(), 2);
    const c1 = seat(m, 'chairR', 2, 5, S.chairSide('#3f6a52', 0)), c2 = seat(m, 'chairL', 5, 5, S.chairSide('#3f6a52', 1));
    const c3 = seat(m, 'chairR', 10, 5, S.chairSide('#3f6a52', 0)), c4 = seat(m, 'chairL', 13, 5, S.chairSide('#3f6a52', 1));
    put(m, 'desk', 2, 8, S.counter2(3, '#6a4428', '#c8a06a', 'books'), 3, { int: () => AK.Services.open('library'), prompt: 'Danışma', oy: 2 });
    put(m, 'globe', 14, 8, S.globe(), 1, { int: () => AK.UI.toast('Eski bir yerküre. Üzerinde bilinmeyen bir kıta işaretlenmiş.', 'museum'), prompt: 'Yerküre' });
    deco(m, 'books', 9, 8, S.bookStack()); deco(m, 'books', 6, 9, S.bookStack());
    put(m, 'plant', 1, 9, S.plant(1)); put(m, 'plant', 14, 2, S.plant(0));
    m.decals.push({ x: 14 * 16 - 4, y: 6, spr: S.wallClock() });
    m.lights = () => [{ x: 4 * 16, y: 5 * 16, r: 50, c: '#ffe0a0', a: 0.75 }, { x: 12 * 16, y: 5 * 16, r: 50, c: '#ffe0a0', a: 0.75 }, { x: 3 * 16, y: 8 * 16, r: 40, c: '#ffe0a0', a: 0.7 }];
    REG.library.spots.defne = { approach: [3, 7], dir: 'down' };
    REG.library.seats = [npcSeat(c1, 0, [2, 6]), npcSeat(c2, 0, [5, 6]), npcSeat(c3, 0, [10, 6]), npcSeat(c4, 0, [13, 6])];
  }

  // =================== DEMİRHANE ===================
  function smithy() {
    const m = newRoom('int_smithy', 'smithy', 14, 10, 6, 'smithy', '', { name: 'Demirhane', tile: T.PLAZA, music: 'dig' });
    put(m, 'furnace', 9, 2, () => S.furnace(Math.floor(W.t * 6) % 3), 2, { light: { dy: -10, r: 80, c: '#ff8a40', a: 1, fl: true }, int: () => AK.UI.toast('Ocağın harı yüzünü yakıyor. Kaya buna "kalbim" diyor.', 'museum'), prompt: 'Ocak' });
    put(m, 'coal', 11, 3, S.coal());
    put(m, 'anvil', 9, 5, S.anvil(), 1, { int: () => AK.Services.open('smithy'), prompt: 'Örs' });
    put(m, 'trough', 11, 5, S.trough(), 2);
    W.add(m, { kind: 'toolwall', x: 4 * 16, y: 2 * 16 - 4, spr: S.toolWall() });
    put(m, 'counter', 1, 6, S.counter2(3, '#5a4a4a', '#8a8a96', 'register'), 3, { int: () => AK.Services.open('smithy'), prompt: 'Tezgâh', oy: 2 });
    put(m, 'barrel', 12, 8, S.barrel()); put(m, 'crates', 12, 7, S.crates(1));
    const st = seat(m, 'stool', 5, 6, S.stool());
    m.lights = () => [{ x: 6 * 16, y: 4 * 16, r: 60, c: '#ffd890', a: 0.6 }];
    REG.smithy.spots.kaya = { approach: [2, 5], dir: 'down' };
    REG.smithy.seats = [npcSeat(st, 0, [5, 7])];
  }

  // =================== MAĞAZA ===================
  function store() {
    const m = newRoom('int_store', 'store', 14, 10, 6, 'store', 'light', { name: 'Genel Mağaza' });
    for (const x of [1, 3, 9, 11]) put(m, 'shelf', x, 2, S.shelfTall('goods', x), 2, { int: () => AK.Services.open('store'), prompt: 'Raflar' });
    windowAt(m, 6);
    put(m, 'counter', 8, 6, S.counter2(3, '#8d5d32', '#d0a06a', 'register'), 3, { int: () => AK.Services.open('store'), prompt: 'Tezgâh', oy: 2 });
    put(m, 'barrel', 1, 7, S.barrel()); put(m, 'barrel', 1, 8, S.barrel()); put(m, 'sacks', 2, 8, S.sacks());
    put(m, 'crates', 12, 7, S.crates(0)); put(m, 'amphora', 12, 5, S.amphoraStand());
    const st = seat(m, 'stool', 4, 7, S.stool());
    put(m, 'plant', 12, 8, S.plant(0));
    REG.store.spots.riza = { approach: [9, 5], dir: 'down' };
    REG.store.seats = [npcSeat(st, 0, [4, 8])];
  }

  // =================== RESTORAN ===================
  function restaurant() {
    const m = newRoom('int_restaurant', 'restaurant', 17, 11, 8, 'restaurant', '', { name: "Lale'nin Mutfağı", tile: T.TILE, music: 'town' });
    put(m, 'oven', 1, 2, () => S.oven(Math.floor(W.t * 5) % 3), 2, { light: { dy: -10, r: 48, c: '#ff9a50', a: 0.9, fl: true } });
    put(m, 'stove', 3, 2, S.stove()); put(m, 'shelf', 4, 2, S.shelfTall('bottles', 1), 2);
    put(m, 'bar', 1, 5, S.counter2(5, '#8a3a2e', '#e8d6b0', 'food'), 5, { int: () => AK.Services.open('restaurant'), prompt: 'Sipariş ver', oy: 2 });
    windowAt(m, 9); windowAt(m, 13);
    const chairs = [];
    for (const [tx, ty] of [[9, 3], [13, 3], [9, 7], [13, 7]]) {
      put(m, 'table', tx, ty, S.tableCloth(tx === 9 ? '#c8453a' : '#3d7fd9'), 2, { light: () => min() >= 1080 ? { dy: -16, r: 34, c: '#ffcf80', a: 0.8, fl: true } : null });
      chairs.push(seat(m, 'chairR', tx - 1, ty, S.chairSide('#a8453a', 0)), seat(m, 'chairL', tx + 2, ty, S.chairSide('#a8453a', 1)));
    }
    put(m, 'menu', 6, 8, S.menuBoard(), 1, { int: () => AK.Services.open('restaurant'), prompt: 'Menü' });
    put(m, 'plant', 1, 9, S.plant(1)); put(m, 'plant', 15, 9, S.plant(1));
    // turistler (kasaba ünlenince öğle ve akşam yemeği)
    const meal = () => between(720, 840) || between(1080, 1260);
    patron(m, chairs[6], 0, meal, 11); patron(m, chairs[7], 0, meal, 12);
    REG.restaurant.spots.lale = { approach: [3, 4], dir: 'down' };
    REG.restaurant.seats = chairs.map((c, i) => npcSeat(c, 0, [c.seatKind === 'chairR' ? (c.x / 16 | 0) : (c.x / 16 | 0), (c.y / 16 | 0)]));
    // yaklaşma karosu: sandalyenin altındaki karo
    REG.restaurant.seats.forEach((s, i) => { const c = chairs[i]; s.approach = [Math.floor(c.x / 16), Math.floor(c.y / 16)]; });
  }

  // =================== BELEDİYE ===================
  function belediye() {
    const m = newRoom('int_belediye', 'belediye', 16, 11, 7, 'office', '', { name: 'Belediye Binası', tile: T.MARBLE, music: 'museum' });
    m.decals.push({ x: 7 * 16 + 3, y: 4, spr: S.bigPortrait() }, { x: 7 * 16 + 3, y: 9 * 16 - 4, spr: S.runner(26, 1 * 16 + 4, '#3d5a8a') });
    m.decals.push({ x: 7 * 16 + 4, y: 5 * 16, spr: S.runner(24, 5 * 16, '#3d5a8a') });
    put(m, 'flag', 5, 2, S.flagStand('#c8352e')); put(m, 'flag', 10, 2, S.flagStand('#3d6aa8'));
    for (const x of [1, 2, 13, 14]) put(m, 'cabinet', x, 2, S.cabinet());
    put(m, 'desk', 6, 4, S.counter2(4, '#4a5a6a', '#d8e0e8', 'papers'), 4, { int: () => AK.Services.open('townhall'), prompt: 'Kültür Varlıkları Ofisi', oy: 2 });
    mnpc(m, AK.Law.CLERK, 'Memur Selin', 7, 3, 'down', { visible: () => AK.Law.officeOpen(), int: () => AK.Services.open('townhall') });
    const b1 = seat(m, 'bench', 1, 7, S.benchIn(), 2), b2 = seat(m, 'bench', 13, 7, S.benchIn(), 2);
    put(m, 'plant', 1, 9, S.plant(1)); put(m, 'plant', 14, 9, S.plant(1));
    m.decals.push({ x: 3 * 16, y: 6, spr: S.wallClock() });
    REG.belediye.seats = [npcSeat(b1, 0, [1, 8]), npcSeat(b2, 1, [14, 8])];
  }

  // =================== POSTANE ===================
  function postane() {
    const m = newRoom('int_postane', 'postane', 12, 9, 5, 'post', 'light', { name: 'Postane' });
    put(m, 'shelf', 1, 2, S.shelfTall('mail', 1), 2); put(m, 'shelf', 3, 2, S.shelfTall('mail', 2), 2);
    windowAt(m, 7);
    put(m, 'parcels', 10, 2, S.parcels()); put(m, 'parcels', 1, 6, S.parcels());
    put(m, 'counter', 4, 4, S.counter2(4, '#3d6aa8', '#f2e0a0', 'papers'), 4, { int: () => AK.Services.open('postane'), prompt: 'Gişe', oy: 2 });
    mnpc(m, LOOKS.cemil, 'Postacı Cemil', 5, 3, 'down', { visible: () => between(540, 1080), int: () => AK.Dialog.open({ name: 'Postacı Cemil', look: LOOKS.cemil, lines: [U.pick(['Mektubun mu var? Gişe her zaman açık!', 'Bu kasabaya yıllardır bu kadar çok mektup gelmemişti. Hepsi senin sayende!', 'Kartpostallar kasaba halkına güzel hediye olur, söyleyeyim.'])], onEnd: () => AK.Services.open('postane') }) });
    const b = seat(m, 'bench', 8, 6, S.benchIn(), 2);
    put(m, 'plant', 10, 7, S.plant(0));
    REG.postane.seats = [npcSeat(b, 0, [8, 7])];
  }

  // =================== LİMAN DEPOSU (KARABORSA) ===================
  function warehouse() {
    const m = newRoom('int_warehouse', 'warehouse', 14, 10, 6, 'warehouse', 'dark', { name: 'Liman Deposu', music: 'cave', ambient: () => [70, 62, 96] });
    for (const [x, y, v] of [[1, 2, 0], [2, 2, 1], [3, 3, 0], [11, 2, 1], [12, 2, 0], [12, 3, 1], [1, 7, 1], [12, 7, 0]]) put(m, 'crates', x, y, S.crates(v));
    put(m, 'barrel', 11, 7, S.barrel()); put(m, 'barrel', 2, 8, S.barrel());
    deco(m, 'rope', 4, 8, S.ropeCoil()); put(m, 'sacks', 10, 8, S.sacks());
    put(m, 'table', 6, 4, S.readingTable(), 2, { light: { dy: -14, r: 46, c: '#ffb060', a: 1, fl: true } });
    const st = seat(m, 'stool', 8, 4, S.stool());
    st.int = () => AK.UI.toast('Gölge\'nin taburesi. Buraya oturmak istemezsin.', 'lock');
    mnpc(m, AK.Law.SMUGGLER, 'Gölge', 8, 4, 'down', { seat: st.seats[0], visible: () => AK.Law.smugglerHere(), int: () => AK.Services.open('blackmarket') });
    m.lights = () => [{ x: 3 * 16, y: 3 * 16, r: 34, c: '#ffb060', a: 0.7, fl: true }, { x: 11 * 16, y: 6 * 16, r: 34, c: '#ffb060', a: 0.7, fl: true }];
    for (const x of [3 * 16, 11 * 16]) m.decals.push({ x, y: 4, spr: S.lanternWall() });
  }

  // =================== PANSİYON ===================
  function inn() {
    const m = newRoom('int_inn', 'inn', 14, 10, 6, 'inn', '', { name: 'Pansiyon' });
    const nw = [], old = [];
    nw.push(put(m, 'desk', 2, 3, S.counter2(3, '#7a3a2a', '#e8c8a0', 'register'), 3, { int: () => AK.Services.open('inn'), prompt: 'Resepsiyon', oy: 2 }));
    nw.push(mnpc(m, LOOKS.mert, 'Hancı Mert', 3, 2, 'down', { visible: () => AK.Progress.rep() >= 3, int: () => AK.Services.open('inn') }));
    nw.push(put(m, 'fire', 9, 2, () => S.fireplace(Math.floor(W.t * 6) % 3), 2, { light: { dy: -12, r: 64, c: '#ffa850', a: 0.95, fl: true } }));
    const sofa = seat(m, 'sofa', 8, 6, S.sofa('#7a3a5a'), 2); nw.push(sofa);
    const ac = seat(m, 'armchair', 11, 6, S.armchair('#a8453a')); nw.push(ac);
    nw.push(put(m, 'tea', 10, 7, S.teaTable()));
    nw.push(put(m, 'plant', 12, 2, S.plant(1)), put(m, 'crates', 1, 7, S.crates(1)));
    nw.push(deco(m, 'rug', 7, 8, S.rug('#7a3a2a', 80, 44), 5, { flat: true, oy: 6 }));
    nw.push(patron(m, sofa, 0, () => between(600, 1200), 21), patron(m, sofa, 1, () => between(660, 1140), 22));
    // terk edilmiş hâl
    old.push(put(m, 'sheet', 2, 3, S.sheet(48), 3), put(m, 'sheet', 9, 3, S.sheet(32), 2), put(m, 'sheet', 7, 6, S.sheet(40), 2));
    old.push(put(m, 'broken', 11, 6, S.brokenChair()), put(m, 'crates', 1, 7, S.crates(0)), put(m, 'crates', 12, 2, S.crates(1)));
    old.push(deco(m, 'web', 1, 2, S.cobweb(0), 1, { oy: -16 }), deco(m, 'web', 12, 2, S.cobweb(1), 1, { oy: -16 }));
    old.push(W.add(m, Object.assign(at(10, 8), {
      kind: 'board', flat: true, spr: () => { const c = AK.Gfx.canvas(16, 8); AK.Gfx.rect(c.g, 1, 2, 14, 4, '#8a6a4a'); AK.Gfx.rect(c.g, 1, 2, 14, 1, '#a8845a'); if (!AK.state.flags.innSecret) AK.Gfx.rect(c.g, 6, 3, 3, 1, '#f2c14e'); return c; },
      irect: [10 * 16 - 2, 8 * 16, 20, 18], prompt: 'Gevşek tahta',
      int: () => {
        if (AK.state.flags.innSecret) { AK.UI.toast('Gevşek döşeme tahtası. Altı artık boş.', 'museum'); return; }
        AK.state.flags.innSecret = true;
        AK.Dialog.open({ name: 'Gevşek Tahta', lines: ['Döşeme tahtalarından biri gıcırdıyor... Kaldırınca altında küçük bir bez kese buldun!', 'İçinden parlak bir sikke çıktı. Belki de eski pansiyon sahibinin saklı hazinesi.'], onEnd: () => AK.Exc.giveArtifact('gumus_sikke', AK.Player.x, AK.Player.y - 16) });
      },
    })));
    m.innNew = nw; m.innOld = old;
    m.refresh = mm => {
      const ok = AK.Progress.rep() >= 3;
      for (const o of mm.innNew) o.hidden = !ok;
      for (const o of mm.innOld) o.hidden = ok;
      const st = ok ? 'inn' : 'ruin';
      if (mm.style !== st) { mm.style = st; mm.groundDirty = true; }
      mm.ambient = ok ? amb : () => { const a = amb(); return a.map(v => v * 0.75); };
    };
    REG.inn.seats = [npcSeat(sofa, 0, [8, 7]), npcSeat(ac, 0, [11, 7])];
  }

  // =================== NERMİN'İN EVİ ===================
  function nerminHome() {
    const m = newRoom('int_nermin', 'house_nermin', 12, 9, 5, 'cottage', '', { name: 'Nermin Hanım\'ın Evi', music: 'title' });
    put(m, 'bed', 1, 2, S.bed('#7a5a9a'), 2, { solid: [1, 2, 2, 2], y: 4 * 16 });
    put(m, 'shelf', 3, 2, S.shelfTall('pots', 3), 2, { int: () => AK.UI.toast('Nermin Hanım\'ın kendi küçük koleksiyonu: çocukluğundan beri topladığı çömlek kırıkları.', 'museum'), prompt: 'Raf' });
    windowAt(m, 6);
    put(m, 'books', 9, 2, S.bookshelf(), 2);
    const ac = seat(m, 'armchair', 8, 5, S.armchair('#7a5a9a'));
    put(m, 'tea', 9, 5, S.teaTable());
    deco(m, 'rug', 4, 6, S.rug('#6a5a8a', 64, 40), 4, { flat: true, oy: 8 });
    W.add(m, Object.assign(at(5, 6), { kind: 'cat', spr: () => S.cat(Math.floor(W.t * 1.5) % 2), int: () => AK.UI.toast('Nermin Hanım\'ın kedisi Pamuk mırlıyor.', 'heart'), irect: [5 * 16 - 2, 6 * 16, 20, 16], prompt: 'Kediyi sev' }));
    put(m, 'plant', 10, 7, S.plant(1)); put(m, 'dresser', 1, 6, S.dresser('#8a6a8a'), 2);
    REG.house_nermin.spots.nermin = npcSeat(ac, 0, [8, 6]);
  }

  // =================== DEFNE'NİN EVİ ===================
  function defneHome() {
    const m = newRoom('int_defne', 'house_defne', 12, 9, 5, 'study', '', { name: 'Defne\'nin Evi', music: 'night' });
    put(m, 'shelf', 1, 2, S.shelfTall('books', 7), 2); put(m, 'shelf', 3, 2, S.shelfTall('books', 8), 2);
    windowAt(m, 6);
    put(m, 'scope', 8, 2, S.telescope(), 1, { int: () => AK.UI.toast('Defne\'nin teleskobu. Yedi parlak yıldıza ayarlanmış.', 'star'), prompt: 'Teleskop' });
    put(m, 'bed', 9, 2, S.bed('#3f6a8a'), 2, { solid: [9, 2, 2, 2], y: 4 * 16 });
    m.decals.push({ x: 3 * 16 + 2, y: 2 * 16 + 4, spr: S.starChart() });
    put(m, 'desk', 2, 5, S.readingTable(), 2);
    const ch = seat(m, 'chairR', 1, 5, S.chairSide('#3f5a52', 0));
    deco(m, 'books', 5, 7, S.bookStack()); deco(m, 'books', 10, 6, S.bookStack()); deco(m, 'books', 4, 4, S.bookStack());
    const ac = seat(m, 'armchair', 8, 6, S.armchair('#3f6a6a'));
    put(m, 'plant', 10, 7, S.plant(0));
    REG.house_defne.spots.defne = npcSeat(ch, 0, [1, 6]);
    REG.house_defne.seats = [npcSeat(ac, 0, [8, 7])];
  }

  // =================== KOMŞU (HATİCE TEYZE) ===================
  function komsu() {
    const m = newRoom('int_komsu', 'komsu', 12, 9, 5, 'house', 'light', { name: 'Hatice Teyze\'nin Evi', music: 'title' });
    put(m, 'bed', 1, 2, S.bed('#c8a050'), 2, { solid: [1, 2, 2, 2], y: 4 * 16 });
    put(m, 'wardrobe', 3, 2, S.wardrobe('#8d5d32'), 2);
    windowAt(m, 6);
    put(m, 'stove', 9, 2, S.stove()); put(m, 'kitchen', 10, 2, S.kitchen());
    const ac = seat(m, 'armchair', 3, 5, S.armchair('#a8453a'));
    deco(m, 'basket', 4, 6, S.basket());
    W.add(m, Object.assign(at(7, 6), { kind: 'cat', spr: () => S.cat(Math.floor(W.t * 1.2) % 2), int: () => AK.UI.toast('Tekir kedi tembelce gerindi.', 'heart'), irect: [7 * 16 - 2, 6 * 16, 20, 16], prompt: 'Kediyi sev' }));
    put(m, 'table', 8, 5, S.table(), 2);
    seat(m, 'chairR', 7, 5, S.chairSide('#8d5d32', 0)); seat(m, 'chairL', 10, 5, S.chairSide('#8d5d32', 1));
    deco(m, 'rug', 2, 7, S.rug('#c8553d', 64, 40), 4, { flat: true, oy: 4 });
    put(m, 'plant', 10, 7, S.plant(1));
    m.decals.push({ x: 8 * 16, y: 6, spr: S.wallClock() });
    mnpc(m, LOOKS.hatice, 'Hatice Teyze', 3, 5, 'down', {
      seat: ac.seats[0], visible: () => between(540, 1140),
      int: () => {
        const F = AK.state.flags, d = AK.Time.abs();
        if (!F.haticeDay || d - F.haticeDay >= 3) {
          F.haticeDay = d;
          AK.Dialog.open({ name: 'Hatice Teyze', look: LOOKS.hatice, lines: ['Aa, gel yavrum gel! Ben de tam börek açmıştım.', 'Al bakalım, sıcacık. Kazıda aç kalma sakın!'], onEnd: () => { if (!AK.Inv.add({ id: 'borek', n: 1 })) AK.World.drop(AK.World.cur, AK.Player.x, AK.Player.y, { id: 'borek', n: 1 }); AK.UI.toast('Hatice Teyze sana su böreği verdi!', 'heart'); } });
        } else AK.Dialog.open({ name: 'Hatice Teyze', look: LOOKS.hatice, lines: [U.pick(['Gençken ben de amcanla bu ormanda çiçek toplardık. Ne günlerdi...', 'Örgüm bitince sana bir atkı öreceğim, kışın üşümezsin.', 'Bu kedi bütün gün uyuyor, tıpkı rahmetli kocam gibi!', 'Müze ne güzel olmuş yavrum! Sen gelmeden önce kapısı kilitliydi.'])] });
      },
    });
  }

  // =================== AÇILIŞ SAATLERİ ===================
  const hours = {
    library: () => between(480, 1200) ? null : 'Kütüphane kapalı. (08:00–20:00)',
    smithy: () => between(480, 1020) ? null : 'Demirhane kapalı. Kaya 08:00–17:00 arası çalışır.',
    store: () => between(480, 1080) ? null : 'Genel Mağaza kapalı. (08:00–18:00)',
    restaurant: () => between(420, 1440) ? null : 'Restoran kapalı. (07:00–24:00)',
    belediye: () => (AK.Time.weekday() < 5 && between(540, 1020)) ? null : 'Belediye kapalı. (Hafta içi 09:00–17:00)',
    postane: () => between(540, 1080) ? null : 'Postane kapalı. (09:00–18:00)',
    warehouse: () => AK.Law.smugglerHere() ? null : 'Liman deposunun kapısı zincirli. Balıkçılar geceleri burada kapüşonlu birinin dolaştığını söylüyor...',
    inn: () => between(420, 1380) ? null : (AK.Progress.rep() >= 3 ? 'Pansiyon kapalı. (07:00–23:00)' : 'Harap evin kapısı gece kilitli gibi.'),
    house_nermin: () => (AK.NPCs.isIn('nermin', 'house_nermin') && between(420, 1320)) ? null : AK.NPCs.knock('nermin'),
    house_defne: () => (AK.NPCs.isIn('defne', 'house_defne') && between(420, 1320)) ? null : AK.NPCs.knock('defne'),
    komsu: () => between(540, 1140) ? null : 'Hatice Teyze uyuyor. Kapıda bir not: "09:00\'dan sonra gel yavrum."',
    museum: () => (between(480, 1200) || (AK.Progress.eventToday() === 'muzegecesi' && between(480, 1440))) ? null : 'Müze kapalı. (08:00–20:00)',
  };

  AK.BldInt = {
    REG, LOOKS, seatDefs,
    closedMsg(b) { const f = hours[b]; return f ? f() : null; },
    build() {
      library(); smithy(); store(); restaurant(); belediye(); postane(); warehouse(); inn(); nerminHome(); defneHome(); komsu();
      // mevcut iç mekânlar
      REG.museum = { map: 'museum', entry: [14, 17], spots: {}, seats: [] };
      REG.shop = { map: 'shop', entry: [7, 10], spots: {}, seats: [] };
      REG.house_player = { map: 'house', entry: [6, 8], spots: {}, seats: [] };
    },
    seat, npcSeat,
  };
})();
