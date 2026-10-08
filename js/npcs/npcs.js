// NPC'ler: görünüm, günlük program, yol bulma, arkadaşlık, hediye tercihleri. + turistler.
(function () {
  const U = AK.U, W = AK.World;
  const MUSEUM_SPOTS = { desk: [12, 14, 'down'], hall: [9, 6, 'up'], ped: [21, 12, 'up'], vault: [24, 4, 'up'], bench: [6, 11, 'right'] };

  const DEFS = [
    {
      id: 'nermin', name: 'Nermin Hanım', title: 'Müze Küratörü', home: 'house_nermin',
      look: { skin: '#e9b991', hair: '#c9c3cc', hairStyle: 'bun', shirt: '#8a3a5a', outfit: 'dress', outfitCol: '#5a3a6a', pants: '#5a3a6a', shoes: '#3b2a20', acc: ['glasses'] },
      bio: 'Kasabanın küçük müzesini yıllardır tek başına ayakta tutuyor. Amcanın en eski dostu.',
      loves: ['kandil', 'bahar_vazosu', 'cay', 'figur', 'replika'], loveCats: ['Seramik & Cam'], likes: ['kahve', 'kart', 'simit'], likeArt: true, dislikes: ['tas', 'kil', 'metal'], hates: ['kemik'],
      sched(d) {
        if (d.abs === 1) return [[0, 'museum_in:desk'], [1080, 'restaurant'], [1260, 'home']];
        if (d.ev === 'muzegecesi') return [[0, 'home'], [450, 'museum_in:desk'], [1140, 'museum_in:hall'], [1380, 'home']];
        if (d.ev === 'festival' || d.ev === 'hazine' || d.ev === 'kostum') return [[0, 'home'], [480, 'plaza_n'], [1080, 'museum_in:desk'], [1200, 'restaurant'], [1320, 'home']];
        if (d.wd === 6) return [[0, 'home'], [600, d.wet ? 'museum_in:hall' : 'park_w'], [780, 'museum_in:desk'], [1080, 'restaurant'], [1260, 'home']];
        return [[0, 'home'], [450, 'museum_in:desk'], [1020, d.wet ? 'restaurant' : 'bench_w'], [1110, 'restaurant'], [1260, 'home']];
      },
    },
    {
      id: 'kaya', name: 'Demirci Kaya', title: 'Demirci', home: 'smithy',
      look: { skin: '#b07a52', hair: '#2a2024', hairStyle: 'short', shirt: '#6a6a72', outfit: 'apron', outfitCol: '#6a4428', pants: '#3b3540', shoes: '#2a2024', body: 'wide', acc: ['beard'], beardCol: '#2a2024' },
      bio: 'Kasabanın demircisi. Az konuşur ama çok iş yapar. Örsünün sesi kasabanın saatidir.',
      loves: ['metal', 'kuvars', 'kebap', 'tunc_hancer', 'tunc_migfer'], loveCats: ['Araç & Silah'], likes: ['tas', 'altin', 'cay', 'ametist'], dislikes: ['kart', 'comlek'], hates: ['kil'],
      sched(d) {
        if (d.ev === 'festival' || d.ev === 'hazine') return [[0, 'smithy'], [540, 'fountain_e'], [1140, 'restaurant'], [1320, 'smithy']];
        if (d.wd === 6) return [[0, 'smithy'], [540, d.wet ? 'restaurant' : 'pond'], [840, 'smithy'], [1140, 'restaurant'], [1320, 'smithy']];
        return [[0, 'smithy'], [1020, d.wet ? 'restaurant' : 'fountain_e'], [1140, 'restaurant'], [1320, 'smithy']];
      },
    },
    {
      id: 'lale', name: 'Lale', title: 'Restoran Sahibi', home: 'restaurant',
      look: { skin: '#f0c39b', hair: '#b8482a', hairStyle: 'ponytail', shirt: '#e8823a', outfit: 'apron', outfitCol: '#fff6e0', pants: '#5a4a3a', shoes: '#7a3a2a', hat: 'bandana', hatCol: '#c8352e' },
      bio: 'Neşeli aşçı. Annesinden kalan restoranı kasabanın kalbi yapmaya çalışıyor.',
      loves: ['ametist', 'bahar_vazosu', 'pismis_kase', 'kart', 'gunes_tokasi'], likes: ['kil', 'simit', 'kahve', 'boncuk_kolye', 'figur'], likeArt: true, dislikes: ['kemik', 'metal', 'tas'], hates: ['ayi_kafatasi', 'balik_fosili', 'amonit'],
      sched(d) {
        if (d.ev === 'festival') return [[0, 'restaurant'], [540, 'restaurant_front'], [1260, 'restaurant']];
        if (d.wet) return [[0, 'restaurant']];
        return [[0, 'restaurant'], [460, 'board'], [500, d.season === 3 ? 'restaurant' : 'park_e'], [600, 'restaurant']];
      },
    },
    {
      id: 'riza', name: 'Rıza Usta', title: 'Genel Mağaza & Usta', home: 'store',
      look: { skin: '#e2a878', hair: '#9a9298', hairStyle: 'bald', shirt: '#e8dcc0', outfit: 'vest', outfitCol: '#4f7a45', pants: '#5a4a3a', shoes: '#3b2a20', body: 'wide', acc: ['mustache'], beardCol: '#9a9298', hat: 'cap', hatCol: '#4f7a45' },
      bio: 'Kasabada ne lazımsa onda bulunur. Eski bir marangoz; dükkânları onarmayı da bilir.',
      loves: ['altin', 'altin_sikke', 'gumus_sikke', 'ametist', 'kebap'], loveCats: ['Sikkeler'], likes: ['metal', 'comlek', 'kahve', 'tas'], dislikes: ['kil', 'kemik'], hates: [],
      sched(d) {
        if (d.ev === 'festival' || d.ev === 'kostum') return [[0, 'store'], [540, 'stall'], [1140, 'restaurant'], [1290, 'store']];
        if (d.wd === 6) return [[0, 'store'], [600, d.wet ? 'restaurant' : 'bench_e'], [780, 'store'], [1140, 'restaurant'], [1290, 'store']];
        return [[0, 'store'], [1080, d.wet ? 'store' : 'plaza_n'], [1170, 'restaurant'], [1290, 'store']];
      },
    },
    {
      id: 'defne', name: 'Defne', title: 'Kütüphaneci', home: 'house_defne',
      look: { skin: '#f2cfae', hair: '#1f1a24', hairStyle: 'long', shirt: '#3a8a8a', outfit: 'coat', outfitCol: '#2f6a7a', pants: '#3b3550', shoes: '#2a2024', body: 'thin', acc: ['glasses'] },
      bio: 'Utangaç ama parlak bir araştırmacı. Eski dilleri çözmek en büyük tutkusu.',
      loves: ['tablet_gunes', 'tablet_ay', 'tablet_yildiz', 'silindir_muhur', 'civi_tablet', 'kahve', 'kart'], loveCats: ['Yazıt & Mühür'], likes: ['kuvars', 'cay', 'simit'], likeArt: true, dislikes: ['kil', 'tas'], hates: ['metal'],
      sched(d) {
        if (d.ev === 'muzegecesi') return [[0, 'home'], [510, 'library'], [1080, 'museum_in:ped'], [1380, 'home']];
        if (d.ev === 'festival') return [[0, 'home'], [600, 'fountain_s'], [1200, 'home']];
        if (d.wd === 6) return [[0, 'home'], [600, 'museum_in:ped'], [780, d.wet ? 'restaurant' : 'park_w'], [1020, 'library'], [1200, 'home']];
        return [[0, 'home'], [510, 'library'], [720, d.wet ? 'museum_in:hall' : 'library_front'], [840, 'library'], [1080, 'museum_in:ped'], [1200, 'home']];
      },
    },
  ];
  const byId = {};
  DEFS.forEach(d => { byId[d.id] = d; });

  // ---------------- yol bulma (BFS) ----------------
  function bfs(m, sx, sy, gx, gy) {
    if (sx === gx && sy === gy) return [];
    const w = m.w, h = m.h, prev = new Int32Array(w * h).fill(-1);
    const start = sy * w + sx, goal = gy * w + gx;
    const q = [start]; prev[start] = start;
    let qi = 0;
    while (qi < q.length) {
      const c = q[qi++];
      if (c === goal) break;
      const cx = c % w, cy = (c / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx;
        if (prev[n] !== -1) continue;
        if (m.blk[n] && n !== goal) continue;
        prev[n] = c; q.push(n);
      }
    }
    if (prev[goal] === -1) return null;
    const path = [];
    for (let c = goal; c !== start; c = prev[c]) path.push([c % w, (c / w) | 0]);
    return path.reverse();
  }

  function dayInfo() {
    return { abs: AK.Time.abs(), wd: AK.Time.weekday(), season: AK.Time.season(), wet: AK.Weather.isWet() || AK.Weather.today() === 'kar', ev: AK.Progress ? AK.Progress.eventToday() : null };
  }

  const N = AK.NPCs = {
    DEFS, byId, list: [], tourists: [], MUSEUM_SPOTS,
    st(id) { return AK.state.npcs[id] || (AK.state.npcs[id] = { fr: 0, talkDay: 0, giftDay: 0, met: false, ev: {} }); },
    hearts(id) { return Math.min(10, Math.floor(this.st(id).fr / 100)); },
    addFr(id, n) { const s = this.st(id); const before = this.hearts(id); s.fr = U.clamp(s.fr + n, 0, 1000); if (this.hearts(id) > before) { AK.UI.toast(`${byId[id].name} ile arkadaşlığın gelişti! (${this.hearts(id)} kalp)`, 'heart'); AK.Audio.sfx('heart'); } },
    init() {
      this.list = DEFS.map(d => ({ id: d.id, def: d, look: d.look, map: null, inside: null, x: 0, y: 0, dir: 'down', legs: [], path: [], key: null, anim: 0, talking: false, isEnt: true, idleT: 0 }));
      this.tourists = [];
      this.day = null;
      this.snapAll();
    },
    entryFor(n, min) {
      if (!this.day || this.day.abs !== AK.Time.abs()) { this.day = dayInfo(); this.scheds = {}; }
      let s = this.scheds[n.id];
      if (!s) s = this.scheds[n.id] = n.def.sched(this.day);
      let cur = s[0][1];
      for (const [t, k] of s) if (min >= t) cur = k;
      return cur === 'home' ? n.def.home : cur;
    },
    resolve(key) {
      const T = AK.Town;
      if (key.startsWith('museum_in')) { const sp = MUSEUM_SPOTS[key.split(':')[1]] || MUSEUM_SPOTS.hall; return { door: 'museum', inner: sp }; }
      if (T.DOORS[key]) return { door: key };
      if (T.SPOTS[key]) return { spot: T.SPOTS[key] };
      return { door: 'restaurant' };
    },
    snap(n) {
      const key = this.entryFor(n, AK.Time.min());
      const r = this.resolve(key);
      n.key = key; n.legs = []; n.path = [];
      if (r.inner) {
        const sp = this.innerSpot(n, r.inner);
        n.map = 'museum'; n.inside = null; n.x = sp[0] * 16 + 8; n.y = sp[1] * 16 + 12; n.dir = sp[2];
      } else if (r.door) { n.map = null; n.inside = r.door; }
      else { n.map = 'town'; n.inside = null; n.x = r.spot[0] * 16 + 8; n.y = r.spot[1] * 16 + 12; n.dir = r.spot[2]; }
    },
    innerSpot(n, sp) {
      // Doğu kanadı kapalıysa ana salonda bekle
      if (sp === MUSEUM_SPOTS.ped && AK.state.museum.length < 10) return [5, 10, 'up'];
      if (sp === MUSEUM_SPOTS.vault && AK.state.museum.length < 20) return [9, 10, 'up'];
      return sp;
    },
    snapAll() { this.day = null; for (const n of this.list) this.snap(n); this.tourists = []; },
    plan(n, key) {
      n.key = key;
      const r = this.resolve(key);
      const T = AK.Town;
      n.legs = [];
      // içerideyse kapıdan çık
      if (n.inside) {
        const d = T.DOORS[n.inside];
        n.inside = null; n.map = 'town'; n.x = d[0] * 16 + 8; n.y = (d[1] + 1) * 16 + 12; n.dir = 'down';
      } else if (n.map === 'museum' && !(r.inner)) {
        n.legs.push({ map: 'museum', to: [14, 17], then: 'leaveMuseum' });
      } else if (n.map === 'museum' && r.inner) {
        const sp = this.innerSpot(n, r.inner);
        n.legs.push({ map: 'museum', to: [sp[0], sp[1]], then: 'face', face: sp[2] });
        this.startLeg(n); return;
      }
      if (r.door) n.legs.push({ map: 'town', to: T.DOORS[r.door], then: r.inner ? 'enterMuseum' : 'enter', b: r.door, inner: r.inner });
      else n.legs.push({ map: 'town', to: [r.spot[0], r.spot[1]], then: 'face', face: r.spot[2] });
      if (r.inner) { const sp = this.innerSpot(n, r.inner); n.legs.push({ map: 'museum', to: [sp[0], sp[1]], then: 'face', face: sp[2] }); }
      this.startLeg(n);
    },
    startLeg(n) {
      const leg = n.legs[0];
      if (!leg) return;
      if (n.map !== leg.map) { n.path = []; return; }
      const m = W.get(leg.map);
      if (!m.blk) W.rebuild(m);
      const p = bfs(m, Math.floor(n.x / 16), Math.floor((n.y - 4) / 16), leg.to[0], leg.to[1]);
      if (!p) { n.x = leg.to[0] * 16 + 8; n.y = leg.to[1] * 16 + 12; n.path = []; }
      else n.path = p;
    },
    finishLeg(n) {
      const leg = n.legs.shift();
      if (!leg) return;
      if (leg.then === 'enter') { n.map = null; n.inside = leg.b; }
      else if (leg.then === 'enterMuseum') { n.map = 'museum'; n.x = 14 * 16 + 8; n.y = 17 * 16 + 12; n.dir = 'up'; }
      else if (leg.then === 'leaveMuseum') { n.map = 'town'; const d = AK.Town.DOORS.museum; n.x = d[0] * 16 + 8; n.y = (d[1] + 1) * 16 + 12; n.dir = 'down'; }
      else if (leg.then === 'face') n.dir = leg.face;
      this.startLeg(n);
    },
    move(n, dt, sp = 44) {
      if (!n.path.length) { if (n.legs.length) this.finishLeg(n); return; }
      const [tx, ty] = n.path[0];
      const gx = tx * 16 + 8, gy = ty * 16 + 12;
      const dx = gx - n.x, dy = gy - n.y, d = Math.hypot(dx, dy), s = sp * dt;
      if (d <= s) { n.x = gx; n.y = gy; n.path.shift(); if (!n.path.length) this.finishLeg(n); }
      else { n.x += dx / d * s; n.y += dy / d * s; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
      n.anim += dt * 7;
    },
    update(dt) {
      const min = AK.Time.min();
      for (const n of this.list) {
        if (n.talking) continue;
        const key = this.entryFor(n, min);
        if (key !== n.key) this.plan(n, key);
        this.move(n, dt);
      }
      this.updateTourists(dt);
    },
    walking(n) { return n.path && n.path.length > 0; },
    collect(mapId, list) {
      for (const n of this.list) if (n.map === mapId) list.push(n);
      for (const t of this.tourists) if (t.map === mapId) list.push(t);
    },
    at(mapId, px, py) {
      let best = null, bd = 99;
      for (const n of this.list.concat(this.tourists)) {
        if (n.map !== mapId) continue;
        const dx = Math.abs(n.x - px), dy = (n.y - 10) - py;
        if (dx < 11 && dy > -16 && dy < 18) { const d = dx + Math.abs(dy); if (d < bd) { bd = d; best = n; } }
      }
      return best;
    },
    // binadakiler (restoran vb.)
    insideOf(b) { return this.list.filter(n => n.inside === b); },
    isIn(id, b) { const n = this.list.find(x => x.id === id); return n && n.inside === b; },
    knock(id) {
      const n = this.list.find(x => x.id === id), name = byId[id].name;
      if (n.inside === byId[id].home) {
        const h = AK.Time.hour();
        return h >= 22 || h < 7 ? `Kapı kilitli. ${name} uyuyor olmalı.` : `${name}: "Kim o? Ah, sen misin! Birazdan dışarı çıkacağım, meydanda görüşürüz."`;
      }
      return `Kimse cevap vermiyor. ${name} evde değil gibi.`;
    },
    // ---------------- çizim ----------------
    renderNPC(n, ctx, cx, cy) {
      const x = Math.round(n.x - cx), y = Math.round(n.y - cy);
      ctx.fillStyle = 'rgba(40,24,48,0.28)'; ctx.fillRect(x - 5, y - 2, 10, 3); ctx.fillRect(x - 4, y - 3, 8, 5);
      const walking = n.path && n.path.length > 0;
      let look = n.look;
      if (n.def && AK.Progress && AK.Progress.eventToday() === 'kostum') look = N.costume(n);
      const spr = AK.Chars.get(look, n.dir, walking ? 'walk' : 'idle', walking ? Math.floor(n.anim) % 4 : 0);
      ctx.drawImage(spr, x - 8, y - 26);
      if (n.def) {
        const st = N.st(n.id);
        const q = AK.Quests && AK.Quests.npcHasNews(n.id);
        if (q || !st.met) {
          const b = Math.round(Math.sin(AK.World.t * 4) * 1.5);
          ctx.drawImage(AK.Icons.ui('quest'), x - 8, y - 44 + b);
        }
      }
      if (n.bubble && n.bubbleT > 0) ctx.drawImage(AK.Icons.ui(n.bubble), x - 8, y - 44);
    },
    costume(n) {
      n._cos = n._cos || Object.assign({}, n.look, { outfit: 'tunic', outfitCol: '#f2ead8', shirt: '#e8dcc0', hat: 'laurel', _k: null });
      return n._cos;
    },
    // ---------------- konuşma & hediye ----------------
    talk(n) {
      if (!n.def) { // turist
        AK.Dialog.open({ name: 'Turist', look: n.look, lines: [U.pick(AK.Lines.tourist)] });
        return;
      }
      n.talking = true;
      const dx = AK.Player.x - n.x, dy = AK.Player.y - n.y;
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      const s = this.st(n.id), today = AK.Time.abs();
      const first = !s.met;
      s.met = true;
      if (s.talkDay !== today) { s.talkDay = today; this.addFr(n.id, AK.Progress.eventToday() === 'kostum' ? 30 : 15); }
      AK.Bus.emit('talk', n.id);
      const end = () => { n.talking = false; };
      // görev kancası (teslimat vb.)
      if (AK.Quests.npcHook(n, end)) return;
      const ev = AK.Lines.heartEvent(n);
      if (ev) { AK.Dialog.open({ name: n.def.name, look: n.look, lines: ev.lines, onEnd: () => { ev.done(); end(); } }); return; }
      const lines = first ? AK.Lines.intro(n) : [AK.Lines.greet(n)];
      AK.Dialog.open({ name: n.def.name, look: n.look, lines, choices: this.choices(n, end), onEnd: end });
    },
    choices(n, end) {
      const c = [];
      c.push({ t: 'Hediye ver', fn: () => this.gift(n, end) });
      c.push({ t: 'Sohbet', fn: () => AK.Dialog.open({ name: n.def.name, look: n.look, lines: [AK.Lines.chat(n)], onEnd: end }) });
      const svc = AK.Services.forNpc(n);
      if (svc) c.push({ t: svc.label, fn: () => { end(); svc.fn(); } });
      c.push({ t: 'Hoşça kal', fn: end });
      return c;
    },
    reaction(n, st) {
      const d = n.def, it = AK.Items.get(st.id);
      if (!it) return 'neutral';
      if (it.type === 'artifact' && st.d) return 'dirty';
      if (d.hates.includes(st.id)) return 'hate';
      if (d.loves.includes(st.id) || (it.type === 'artifact' && d.loveCats && d.loveCats.includes(it.cat))) return 'love';
      if (d.dislikes.includes(st.id)) return 'dislike';
      if (d.likes.includes(st.id) || (it.type === 'artifact' && (d.likeArt || it.rar >= 2))) return 'like';
      if (it.type === 'food' || it.type === 'gift') return 'like';
      return 'neutral';
    },
    gift(n, end) {
      const s = this.st(n.id), today = AK.Time.abs();
      if (s.giftDay === today) { AK.Dialog.open({ name: n.def.name, look: n.look, lines: ['Bugün zaten bir hediye verdin, çok naziksin! Yarın yine uğra.'], onEnd: end }); return; }
      const ok = AK.Inv.list(st => { const d = AK.Items.get(st.id); return d && d.type !== 'tool' && d.type !== 'key' && !(d.type === 'artifact' && d.noSell); });
      if (!ok.length) { AK.Dialog.open({ name: n.def.name, look: n.look, lines: ['(Verebileceğin bir şey yok.)'], onEnd: end }); return; }
      AK.UI.chooseItem({
        title: 'Hediye ver: ' + n.def.name, note: n.def.bio,
        filter: st => { const d = AK.Items.get(st.id); return d && d.type !== 'tool' && d.type !== 'key' && !(d.type === 'artifact' && d.noSell); },
        onCancel: end,
        onPick: i => {
          const st = AK.Inv.get(i);
          const r = this.reaction(n, st);
          AK.Inv.removeAt(i, 1);
          s.giftDay = today;
          const pts = { love: 80, like: 45, neutral: 20, dislike: -20, hate: -40, dirty: -10 }[r];
          this.addFr(n.id, pts);
          AK.Bus.emit('gift', n.id, st.id, r);
          if (r === 'love' || r === 'like') { n.bubble = 'heart'; n.bubbleT = 2; setTimeout(() => { n.bubbleT = 0; }, 2000); }
          AK.Dialog.open({ name: n.def.name, look: n.look, lines: [AK.Lines.giftLine(n, r, st)], onEnd: end });
        },
      });
    },
    // ---------------- turistler ----------------
    updateTourists(dt) {
      const rep = AK.Progress ? AK.Progress.rep() : 0, h = AK.Time.hour();
      const want = (rep >= 3 && h >= 9 && h < 19 && AK.Weather.today() !== 'firtina') ? Math.min(7, (rep - 2) * 2 + (AK.Progress.eventToday() ? 3 : 0)) : 0;
      const spots = Object.keys(AK.Town.SPOTS);
      while (this.tourists.length < want) {
        const r = Math.random;
        const t = {
          map: 'town', isEnt: true, x: 3 * 16 + 8, y: 22 * 16 + 12, dir: 'right', path: [], legs: [], anim: 0, idleT: 0,
          look: { skin: U.pick(['#f2cfae', '#e2a878', '#b07a52', '#f0c39b'], r), hair: U.pick(['#f2d070', '#5a3a22', '#2a2024', '#b8482a'], r), hairStyle: U.pick(['short', 'long', 'ponytail', 'curly'], r), shirt: U.pick(['#e85a7a', '#3d9ae0', '#f2c14e', '#7cc45a', '#ff8a5c'], r), pants: U.pick(['#3b5a8a', '#5a4a3a', '#e8dcc0'], r), hat: r() < 0.6 ? 'sunhat' : 'cap', hatCol: U.pick(['#f2e6c8', '#e85a7a', '#3d9ae0'], r) },
        };
        this.tourists.push(t);
      }
      for (let i = this.tourists.length - 1; i >= 0; i--) {
        const t = this.tourists[i];
        if (i >= want && !t.leaving) { t.leaving = true; t.legs = [{ map: 'town', to: [1, 22], then: 'gone' }]; this.startLeg(t); }
        if (!t.path.length) {
          if (t.leaving) { this.tourists.splice(i, 1); continue; }
          t.idleT -= dt;
          if (t.idleT <= 0) {
            const sp = AK.Town.SPOTS[U.pick(spots)];
            t.legs = [{ map: 'town', to: [sp[0] + U.ri(-1, 1), sp[1] + U.ri(0, 1)], then: 'face', face: U.pick(['up', 'down', 'left', 'right']) }];
            this.startLeg(t); t.idleT = 4 + Math.random() * 10;
          }
        } else this.move(t, dt, 38);
      }
    },
  };
  // NPC'ler dünyada render() ile çizilir
  Object.defineProperty(N, 'renderFn', { value: null });
  const origInit = N.init.bind(N);
  N.init = function () {
    origInit();
    for (const n of this.list) n.render = (ctx, cx, cy) => N.renderNPC(n, ctx, cx, cy);
  };
  const origUT = N.updateTourists.bind(N);
  N.updateTourists = function (dt) {
    origUT(dt);
    for (const t of this.tourists) if (!t.render) t.render = (ctx, cx, cy) => N.renderNPC(t, ctx, cx, cy);
  };
})();
