// NPC'ler: görünüm, günlük program, yol bulma, arkadaşlık, hediye tercihleri. + turistler.
(function () {
  const U = AK.U, W = AK.World;
  const MUSEUM_SPOTS = { desk: [12, 14, 'down'], hall: [9, 6, 'up'], ped: [21, 12, 'up'], vault: [24, 4, 'up'], bench: [6, 11, 'right'] };

  const DEFS = [
    {
      id: 'nermin', name: 'Nermin Hanım', title: 'Müze Küratörü', home: 'house_nermin',
      look: { skin: '#e9b991', hair: '#c9c3cc', hairStyle: 'bun', shirt: '#8a3a5a', outfit: 'dress', outfitCol: '#5a3a6a', pants: '#5a3a6a', shoes: '#3b2a20', acc: ['glasses'] },
      bio: 'Kasabanın küçük müzesini yıllardır tek başına ayakta tutuyor. Amcanın en eski dostu.',
      loves: ['kandil', 'bahar_vazosu', 'cay', 'figur', 'replika'], loveCats: ['Seramik & Cam'], likes: ['kahve', 'kart', 'simit', 'papatya', 'sumbul'], likeArt: true, dislikes: ['tas', 'kil', 'metal'], hates: ['kemik'],
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
      loves: ['metal', 'kuvars', 'kebap', 'tunc_hancer', 'tunc_migfer'], loveCats: ['Araç & Silah'], likes: ['tas', 'altin', 'cay', 'ametist', 'bira', 'balik'], dislikes: ['kart', 'comlek'], hates: ['kil'],
      sched(d) {
        if (d.ev === 'festival' || d.ev === 'hazine') return [[0, 'smithy'], [540, 'fountain_e'], [1140, 'restaurant'], [1320, 'smithy']];
        if (d.wd === 6) return [[0, 'smithy'], [540, d.wet ? 'restaurant' : 'pond'], [840, 'smithy'], [1140, 'restaurant'], [1320, 'smithy']];
        if (d.wd === 4) return [[0, 'smithy'], [1020, d.wet ? 'restaurant' : 'fountain_e'], [1110, 'bar'], [1320, 'smithy']];
        return [[0, 'smithy'], [1020, d.wet ? 'restaurant' : 'fountain_e'], [1140, 'restaurant'], [1320, 'smithy']];
      },
    },
    {
      id: 'lale', name: 'Lale', title: 'Restoran Sahibi', home: 'restaurant',
      look: { skin: '#f0c39b', hair: '#b8482a', hairStyle: 'ponytail', shirt: '#e8823a', outfit: 'apron', outfitCol: '#fff6e0', pants: '#5a4a3a', shoes: '#7a3a2a', hat: 'bandana', hatCol: '#c8352e' },
      bio: 'Neşeli aşçı. Annesinden kalan restoranı kasabanın kalbi yapmaya çalışıyor.',
      loves: ['ametist', 'bahar_vazosu', 'pismis_kase', 'kart', 'gunes_tokasi', 'lale_demet'], likes: ['kil', 'simit', 'kahve', 'boncuk_kolye', 'figur', 'cikolata', 'limonata'], likeArt: true, dislikes: ['kemik', 'metal', 'tas'], hates: ['ayi_kafatasi', 'balik_fosili', 'amonit'],
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
      loves: ['altin', 'altin_sikke', 'gumus_sikke', 'ametist', 'kebap'], loveCats: ['Sikkeler'], likes: ['metal', 'comlek', 'kahve', 'tas', 'raki', 'cikolata'], dislikes: ['kil', 'kemik'], hates: [],
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
      loves: ['tablet_gunes', 'tablet_ay', 'tablet_yildiz', 'silindir_muhur', 'civi_tablet', 'kahve', 'kart'], loveCats: ['Yazıt & Mühür'], likes: ['kuvars', 'cay', 'simit', 'sumbul', 'cikolata', 'boza'], likeArt: true, dislikes: ['kil', 'tas'], hates: ['metal'],
      sched(d) {
        if (d.ev === 'muzegecesi') return [[0, 'home'], [510, 'library'], [1080, 'museum_in:ped'], [1380, 'home']];
        if (d.ev === 'festival') return [[0, 'home'], [600, 'fountain_s'], [1200, 'home']];
        if (d.wd === 6) return [[0, 'home'], [600, 'museum_in:ped'], [780, d.wet ? 'restaurant' : 'park_w'], [1020, 'library'], [1200, 'home']];
        if (d.wd === 4) return [[0, 'home'], [510, 'library'], [720, d.wet ? 'museum_in:hall' : 'library_front'], [840, 'library'], [1200, 'bar'], [1320, 'home']];
        return [[0, 'home'], [510, 'library'], [720, d.wet ? 'museum_in:hall' : 'library_front'], [840, 'library'], [1080, 'museum_in:ped'], [1200, 'home']];
      },
    },
    // ================= Doğu Mahallesi =================
    {
      id: 'can', name: 'Can', title: 'Fener Bar\'ın Sahibi', home: 'bar', romance: true,
      look: { skin: '#d8a070', hair: '#2a2024', hairStyle: 'spiky', shirt: '#f2ead8', outfit: 'vest', outfitCol: '#2a2430', pants: '#2a2430', shoes: '#1e1218', acc: ['beard'], beardCol: '#2a2024' },
      bio: 'Fener Bar\'ı babasından devraldı. Herkesin sırrını bilir ama kimseye söylemez. Kokteyllerine isim koymayı sever.',
      loves: ['kokteyl', 'balik', 'altin_sikke', 'gumus_sikke', 'cikolata'], likes: ['kalamar', 'midye', 'kahve', 'kart', 'figur'], likeArt: true, dislikes: ['kil', 'tas'], hates: ['kemik'],
      sched(d) {
        if (d.wet) return [[0, 'bar'], [660, 'restaurant'], [810, 'library'], [930, 'bar']];
        if (d.wd === 6) return [[0, 'bar'], [600, 'pier_bench'], [720, 'restaurant'], [840, 'park_e'], [930, 'bar']];
        return [[0, 'bar'], [600, 'pier_bench'], [720, 'restaurant'], [810, 'east_sq'], [930, 'bar']];
      },
    },
    {
      id: 'zeynep', name: 'Zeynep', title: 'Çiçekçi', home: 'house_zeynep', romance: true,
      look: { skin: '#f2cfae', hair: '#c8862a', hairStyle: 'long', shirt: '#f2a8c0', outfit: 'apron', outfitCol: '#7cc45a', pants: '#5a4a6a', shoes: '#7a3a4a', hat: 'sunhat', hatCol: '#f2e6c8' },
      bio: 'Her çiçeğin bir anlamı olduğuna inanır. Bahçesi kasabanın en renkli yeri; hava durumunu kasabadaki herkesten iyi tahmin eder.',
      loves: ['sumbul', 'ametist', 'bahar_vazosu', 'limonata', 'boncuk_kolye'], likes: ['papatya', 'lale_demet', 'kart', 'simit', 'cay', 'replika'], likeArt: true, dislikes: ['metal', 'tas'], hates: ['raki', 'kemik'],
      sched(d) {
        if (d.wd === 6) return [[0, 'home'], [540, d.wet ? 'cicekci' : 'garden_z'], [720, 'restaurant'], [840, d.wet ? 'cicekci' : 'garden_z'], [1080, 'bar'], [1260, 'home']];
        return [[0, 'home'], [420, d.wet ? 'cicekci' : 'garden_z'], [510, 'cicekci'], [1020, d.wet ? 'restaurant' : 'park_e'], [1110, d.wd === 4 ? 'bar' : 'restaurant'], [1260, 'home']];
      },
    },
    {
      id: 'emre', name: 'Emre', title: 'Balıkçı', home: 'house_emre', romance: true,
      look: { skin: '#c08a5e', hair: '#3b2a20', hairStyle: 'short', shirt: '#3d6aa8', outfit: 'vest', outfitCol: '#e8c040', pants: '#3b4a5a', shoes: '#2a2024', hat: 'cap', hatCol: '#2f4a6a', acc: ['beard'], beardCol: '#3b2a20' },
      bio: 'Güneş doğmadan iskelededir. Nehrin ve denizin her huyunu bilir. Sessiz görünür ama barda en çok gülen odur.',
      loves: ['balik', 'kalamar', 'kebap', 'balik_fosili', 'amonit'], likes: ['bira', 'cay', 'simit', 'metal', 'kahve'], dislikes: ['kart', 'papatya'], hates: ['kil'],
      sched(d) {
        if (d.wet) return [[0, 'home'], [360, 'pier'], [600, 'restaurant'], [720, 'home'], [1020, 'bar'], [1320, 'home']];
        return [[0, 'home'], [330, 'pier'], [720, 'restaurant'], [810, 'pier'], [1050, 'pier_bench'], [1110, 'bar'], [1350, 'home']];
      },
    },
    {
      id: 'elif', name: 'Elif', title: 'Ressam', home: 'house_elif', romance: true,
      look: { skin: '#f0c39b', hair: '#5a3a6a', hairStyle: 'bun', shirt: '#f6f0e4', outfit: 'apron', outfitCol: '#7a4a6a', pants: '#3b5a8a', shoes: '#3b2a20' },
      bio: 'İstanbul\'dan "bir yaz için" gelmiş, üç yıldır gitmedi. Göletin ışığını resmetmeye çalışıyor; eserlerin renklerine bayılır.',
      loves: ['bahar_vazosu', 'cam_sise', 'sarap', 'lale_demet', 'replika', 'gunes_tokasi'], loveCats: ['Heykel & Figür'], likes: ['kahve', 'kart', 'papatya', 'ametist', 'kuvars'], likeArt: true, dislikes: ['metal', 'kemik'], hates: ['tas'],
      sched(d) {
        if (d.wet) return [[0, 'home'], [600, 'museum_in:hall'], [750, 'restaurant'], [870, 'library'], [1080, 'home']];
        return [[0, 'home'], [540, 'easel'], [750, 'restaurant'], [840, 'museum_in:hall'], [960, 'easel'], [1110, d.wd >= 4 ? 'bar' : 'home'], [1320, 'home']];
      },
    },
    {
      id: 'baris', name: 'Barış', title: 'Gezgin Müzisyen', home: 'house_baris', romance: true,
      look: { skin: '#e2a878', hair: '#5a3a22', hairStyle: 'curly', shirt: '#2a2430', outfit: 'coat', outfitCol: '#7a3a2a', pants: '#3b4a6a', shoes: '#2a2024', acc: ['scarf'], scarfCol: '#e8c040' },
      bio: 'Gitarıyla on iki şehir dolaşmış, bu kasabada durmuş. Meydanda çalar, çarşamba-cuma-cumartesi geceleri Fener Bar sahnesindedir.',
      loves: ['kokteyl', 'tunc_hancer', 'kahve', 'meze_tabagi', 'kolye'], likes: ['bira', 'kart', 'figur', 'simit', 'altin'], likeArt: true, dislikes: ['kil', 'papatya'], hates: ['ayran'],
      sched(d) {
        const stage = d.wd === 2 || d.wd === 4 || d.wd === 5;
        if (d.wet) return [[0, 'home'], [660, 'restaurant'], [840, 'library'], [1080, stage ? 'bar:stage' : 'bar'], [1380, 'home']];
        return [[0, 'home'], [600, 'busk'], [780, 'restaurant'], [870, 'busk'], [1020, 'east_sq'], [1140, stage ? 'bar:stage' : 'bar'], [1380, 'home']];
      },
    },
    {
      id: 'ayse', name: 'Ayşe', title: 'Oğuz\'un Eşi', home: 'house_aile',
      look: { skin: '#f0c39b', hair: '#3b2a20', hairStyle: 'ponytail', shirt: '#7cc45a', outfit: 'dress', outfitCol: '#3d7fd9', pants: '#3d7fd9', shoes: '#5a3a2a', acc: ['scarf'], scarfCol: '#f2c14e' },
      bio: 'Bebekleri Deniz\'le uğraşmadığı zamanlarda mahallenin bütün işlerini organize eder. Kasabanın gayri resmî muhtarı.',
      loves: ['borek', 'cikolata', 'sumbul', 'replika'], likes: ['cay', 'simit', 'papatya', 'kart', 'corba'], dislikes: ['bira', 'raki', 'sarap'], hates: ['kemik', 'ayi_kafatasi'],
      sched(d) {
        if (d.wd === 6) return [[0, 'home'], [600, d.wet ? 'restaurant' : 'plaza_n'], [720, 'restaurant'], [840, 'home'], [1140, 'bar'], [1290, 'home']];
        return [[0, 'home'], [540, 'store'], [600, d.wet ? 'home' : 'east_sq'], [720, 'restaurant'], [810, 'home'], [1020, d.wet ? 'home' : 'park_w'], [1140, 'home']];
      },
    },
    {
      id: 'oguz', name: 'Oğuz', title: 'Otobüs Şoförü', home: 'house_aile',
      look: { skin: '#d8a070', hair: '#3b3540', hairStyle: 'short', shirt: '#e8e0d0', outfit: 'vest', outfitCol: '#3d5a8a', pants: '#2a3a5a', shoes: '#1e1218', body: 'wide', hat: 'cap', hatCol: '#3d5a8a', acc: ['mustache'], beardCol: '#3b3540' },
      bio: 'Kasabayla şehir arasındaki otobüsü yirmi yıldır o sürer. Her yolcunun hikâyesini ezbere bilir. Eşi Ayşe\'ye hâlâ ilk günkü gibi âşık.',
      loves: ['kebap', 'kahve', 'balik', 'altin_sikke'], likes: ['cay', 'simit', 'bira', 'metal', 'kart'], dislikes: ['papatya', 'kil'], hates: ['amonit'],
      sched(d) {
        if (d.wd === 6) return [[0, 'home'], [600, 'pond'], [720, 'restaurant'], [840, 'home'], [1140, 'bar'], [1290, 'home']];
        return [[0, 'home'], [450, 'busstop'], [720, 'restaurant'], [780, 'busstop'], [1050, 'home'], [1170, d.wd === 4 ? 'bar' : 'home'], [1300, 'home']];
      },
    },
    {
      id: 'bekir', name: 'Kaptan Bekir', title: 'Emekli Denizci', home: 'house_bekir',
      look: { skin: '#d8a070', hair: '#e8e4dc', hairStyle: 'bald', shirt: '#f2ead8', outfit: 'coat', outfitCol: '#2a3a5a', pants: '#2a3a5a', shoes: '#1e1218', hat: 'cap', hatCol: '#2a3a5a', acc: ['beard'], beardCol: '#e8e4dc' },
      bio: 'Kırk yıl gemilerde çalışmış, yedi denizi gezmiş. Hikâyelerinin yarısı doğru, diğer yarısı daha da güzel.',
      loves: ['raki', 'balik', 'tunc_ayna', 'altin_sikke', 'amonit'], likes: ['cay', 'kahve', 'kart', 'metal', 'midye'], dislikes: ['limonata'], hates: ['papatya'],
      sched(d) {
        if (d.wet) return [[0, 'home'], [690, 'restaurant'], [840, 'home'], [1080, 'bar'], [1260, 'home']];
        return [[0, 'home'], [480, 'pier_bench'], [690, 'restaurant'], [810, 'bridge'], [960, 'east_w'], [1080, 'bar'], [1290, 'home']];
      },
    },
  ];
  // sevgili olunabilecekler
  for (const id of ['lale', 'defne', 'kaya']) DEFS.find(d => d.id === id).romance = true;
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
    DEFS, byId, list: [], tourists: [], MUSEUM_SPOTS, claims: {},
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
      const ov = AK.Romance && AK.Romance.override(n, min);
      if (ov) return ov;
      let cur = s[0][1];
      for (const [t, k] of s) if (min >= t) cur = k;
      return cur === 'home' ? n.def.home : cur;
    },
    resolve(key) {
      const T = AK.Town;
      if (key.startsWith('museum_in')) { const sp = MUSEUM_SPOTS[key.split(':')[1]] || MUSEUM_SPOTS.hall; return { door: 'museum', inner: sp }; }
      if (key.includes(':')) { const [b, nm] = key.split(':'); if (T.DOORS[b]) return { door: b, named: nm }; }
      if (T.DOORS[key]) return { door: key };
      if (T.SPOTS[key]) {
        const tm = W.get('town'), bs = tm && tm.benchSeats && tm.benchSeats[key];
        if (bs) return { spot: bs };
        const sp = T.SPOTS[key];
        return { spot: { approach: [sp[0], sp[1]], dir: sp[2], pose: sp[3] } };
      }
      return { door: 'restaurant' };
    },
    // bina içinde NPC'nin duracağı / oturacağı yer
    spotFor(n, b, inner, named) {
      const R = AK.BldInt && AK.BldInt.REG[b];
      if (inner) { const sp = this.innerSpot(n, inner); return { approach: [sp[0], sp[1]], dir: sp[2] }; }
      if (!R) return null;
      if (named && R.spots[named]) return R.spots[named];
      if (R.spots[n.id]) return R.spots[n.id];
      if (R.seats.length) {
        // aynı sandalyeye iki kişi oturmasın
        const cl = this.claims[b] || (this.claims[b] = {}), L = R.seats.length, s0 = DEFS.indexOf(n.def) % L;
        for (let i = 0; i < L; i++) { const k = (s0 + i) % L; if (!cl[k] || cl[k] === n.id) { cl[k] = n.id; return R.seats[k]; } }
        return R.seats[s0];
      }
      return { approach: R.entry, dir: 'up' };
    },
    release(n) { for (const b in this.claims) for (const k in this.claims[b]) if (this.claims[b][k] === n.id) delete this.claims[b][k]; },
    sitAt(n, spot) {
      n.dir = spot.dir || 'down';
      n.pose = spot.pose || null;
      if (spot.seat) { n.sitFrom = [n.x, n.y]; n.x = spot.seat.x; n.y = spot.seat.y; n.sortY = spot.seat.sort; n.dir = spot.seat.dir; n.sitting = true; }
    },
    unsit(n) { n.pose = null; if (n.sitting) { n.sitting = false; if (n.sitFrom) { n.x = n.sitFrom[0]; n.y = n.sitFrom[1]; } n.sortY = null; } },
    snap(n) {
      const key = this.entryFor(n, AK.Time.min());
      const r = this.resolve(key);
      this.unsit(n); this.release(n);
      n.key = key; n.legs = []; n.path = [];
      const REG = AK.BldInt ? AK.BldInt.REG : {};
      if (r.door && REG[r.door]) {
        const sp = this.spotFor(n, r.door, r.inner, r.named);
        n.map = REG[r.door].map; n.inside = r.door; n.x = sp.approach[0] * 16 + 8; n.y = sp.approach[1] * 16 + 12;
        this.sitAt(n, sp);
      } else if (r.door) { n.map = null; n.inside = r.door; }
      else { n.map = 'town'; n.inside = null; n.x = r.spot.approach[0] * 16 + 8; n.y = r.spot.approach[1] * 16 + 12; this.sitAt(n, r.spot); }
    },
    innerSpot(n, sp) {
      // Doğu kanadı kapalıysa ana salonda bekle
      if (sp === MUSEUM_SPOTS.ped && AK.state.museum.length < 10) return [5, 10, 'up'];
      if (sp === MUSEUM_SPOTS.vault && AK.state.museum.length < 20) return [9, 10, 'up'];
      return sp;
    },
    snapAll() { this.day = null; this.claims = {}; for (const n of this.list) this.snap(n); this.tourists = []; },
    plan(n, key) {
      n.key = key;
      const r = this.resolve(key);
      const T = AK.Town, REG = AK.BldInt.REG;
      this.unsit(n); this.release(n);
      n.legs = [];
      const tb = r.door && REG[r.door] ? r.door : null;
      const tspot = tb ? this.spotFor(n, tb, r.inner, r.named) : null;
      const curB = n.inside && REG[n.inside] && n.map === REG[n.inside].map ? n.inside : null;
      if (curB) {
        if (curB === tb) { n.legs.push({ map: n.map, to: tspot.approach, then: 'spot', spot: tspot }); this.startLeg(n); return; }
        n.legs.push({ map: n.map, to: REG[curB].entry, then: 'leave', b: curB });
      } else if (n.inside || !n.map) {
        const d = T.DOORS[n.inside] || T.DOORS.restaurant;
        n.inside = null; n.map = 'town'; n.x = d[0] * 16 + 8; n.y = (d[1] + 1) * 16 + 12; n.dir = 'down';
      }
      if (tb) {
        n.legs.push({ map: 'town', to: T.DOORS[tb], then: 'enter', b: tb });
        n.legs.push({ map: REG[tb].map, to: tspot.approach, then: 'spot', spot: tspot });
      } else n.legs.push({ map: 'town', to: r.spot.approach, then: 'spot', spot: r.spot });
      this.startLeg(n);
    },
    startLeg(n) {
      const leg = n.legs[0];
      if (!leg) return;
      if (n.map !== leg.map) { n.path = []; return; }
      const m = W.get(leg.map);
      if (!m.blk) { if (m.refresh) m.refresh(m); W.rebuild(m); }
      const p = bfs(m, Math.floor(n.x / 16), Math.floor((n.y - 4) / 16), leg.to[0], leg.to[1]);
      if (!p) { n.x = leg.to[0] * 16 + 8; n.y = leg.to[1] * 16 + 12; n.path = []; }
      else n.path = p;
    },
    finishLeg(n) {
      const leg = n.legs.shift();
      if (!leg) return;
      const REG = AK.BldInt.REG;
      if (leg.then === 'enter') { const R = REG[leg.b]; n.map = R.map; n.inside = leg.b; n.x = R.entry[0] * 16 + 8; n.y = R.entry[1] * 16 + 12; n.dir = 'up'; }
      else if (leg.then === 'leave') { n.map = 'town'; n.inside = null; const d = AK.Town.DOORS[leg.b]; n.x = d[0] * 16 + 8; n.y = (d[1] + 1) * 16 + 12; n.dir = 'down'; }
      else if (leg.then === 'spot') this.sitAt(n, leg.spot);
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
    get(id) { return this.list.find(x => x.id === id); },
    near(id, tx, ty) { const n = this.get(id); return !!(n && n.map === 'town' && !this.walking(n) && Math.abs(Math.floor(n.x / 16) - tx) <= 1 && Math.abs(Math.floor((n.y - 4) / 16) - ty) <= 1); },
    status(id) {
      const s = this.st(id), h = this.hearts(id), R = AK.state.rel || {};
      if (R.partner === id) return 'Sevgili';
      if (!s.met) return 'Yabancı';
      if (byId[id].romance && h >= 10) return 'Kalbi Dolu';
      return h >= 8 ? 'Can Dostu' : h >= 6 ? 'Yakın Arkadaş' : h >= 4 ? 'İyi Arkadaş' : h >= 2 ? 'Arkadaş' : 'Tanıdık';
    },
    knock(id) {
      const n = this.list.find(x => x.id === id), name = byId[id].name;
      if (n && n.inside === byId[id].home) {
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
      const spr = AK.Chars.get(look, n.dir, n.sitting && !walking ? 'sit' : walking ? 'walk' : 'idle', walking ? Math.floor(n.anim) % 4 : 0);
      if (n.pose === 'fish' && !walking) N.drawRod(ctx, x, y);
      ctx.drawImage(spr, x - 8, y - 27);
      if (!walking && n.pose === 'guitar') { const st = Math.floor(AK.World.t * 4) % 2; ctx.drawImage(AK.Spr.guitar(), x - 8, y - 15 + st); if (Math.floor(AK.World.t * 1.5) % 3 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 8, y - 34 - (AK.World.t * 8 % 6 | 0), 2, 3); ctx.fillRect(x + 9, y - 37 - (AK.World.t * 8 % 6 | 0), 2, 1); } }
      if (!walking && n.pose === 'paint') { const k = Math.sin(AK.World.t * 3); ctx.fillStyle = '#7a4f2a'; ctx.fillRect(x + 5, Math.round(y - 15 + k * 2), 4, 1); ctx.fillStyle = '#e8354a'; ctx.fillRect(x + 9, Math.round(y - 15 + k * 2), 1, 1); }
      if (n.def) {
        const st = N.st(n.id);
        const q = AK.Quests && AK.Quests.npcHasNews(n.id);
        if (q || !st.met) {
          const b = Math.round(Math.sin(AK.World.t * 4) * 1.5);
          ctx.drawImage(AK.Icons.ui('quest'), x - 8, y - 46 + b);
        }
      }
      if (n.bubble && n.bubbleT > 0) ctx.drawImage(AK.Icons.ui(n.bubble), x - 8, y - 46);
      else if (n.def && AK.state.rel && AK.state.rel.partner === n.id && AK.World.cur && AK.World.cur.id === n.map && Math.hypot(AK.Player.x - n.x, AK.Player.y - n.y) < 56) {
        const b = Math.round(Math.sin(AK.World.t * 3) * 1.5);
        ctx.drawImage(AK.Icons.ui('heartS'), x - 4, y - 38 + b);
      }
    },
    drawRod(ctx, x, y) {
      const t = AK.World.t, bob = Math.round(Math.sin(t * 2.2) * 1);
      ctx.fillStyle = '#5a3820';
      for (let k = 0; k < 14; k++) ctx.fillRect(x + 4 + Math.round(k * 0.5), y - 14 + k, 1, 1);
      ctx.fillStyle = 'rgba(240,240,250,0.7)';
      for (let k = 0; k < 10; k++) ctx.fillRect(x + 11, y + k, 1, 1);
      ctx.fillStyle = '#e8354a'; ctx.fillRect(x + 10, y + 10 + bob, 3, 2); ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 10, y + 10 + bob, 3, 1);
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
      if (AK.Romance && AK.Romance.onTalk(n, end, first)) return;
      // görev kancası (teslimat vb.)
      if (AK.Quests.npcHook(n, end)) return;
      const ev = AK.Lines.heartEvent(n);
      if (ev) { AK.Dialog.open({ name: n.def.name, look: n.look, lines: ev.lines, onEnd: () => { ev.done(); end(); } }); return; }
      const lines = first ? AK.Lines.intro(n) : [AK.Romance ? AK.Romance.greet(n) : AK.Lines.greet(n)];
      AK.Dialog.open({ name: n.def.name, look: n.look, lines, choices: this.choices(n, end), onEnd: end });
    },
    choices(n, end) {
      const c = [];
      c.push({ t: 'Hediye ver', fn: () => this.gift(n, end) });
      c.push({ t: 'Sohbet', fn: () => AK.Dialog.open({ name: n.def.name, look: n.look, lines: [AK.Lines.chat(n)], onEnd: end }) });
      const svc = AK.Services.forNpc(n);
      if (svc) c.push({ t: svc.label, fn: () => { end(); svc.fn(); } });
      if (AK.Romance && AK.Romance.hasMenu(n)) c.push({ t: AK.state.rel.partner === n.id ? 'Sevgilim ♥' : 'İlişki ♥', fn: () => AK.Romance.menu(n, end) });
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
          if (st.id === 'gul' && AK.Romance) { AK.Romance.confess(n, end, i); return; }
          const r = this.reaction(n, st);
          AK.Inv.removeAt(i, 1);
          s.giftDay = today;
          let pts = { love: 80, like: 45, neutral: 20, dislike: -20, hate: -40, dirty: -10 }[r];
          if (AK.state.rel && AK.state.rel.partner === n.id && pts > 0) pts = Math.round(pts * 1.25);
          if (r === 'love') { s.known = s.known || []; if (!s.known.includes(st.id)) s.known.push(st.id); }
          if (st.id === 'kolye' && AK.state.rel && AK.state.rel.partner === n.id) pts = 150;
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
            const tx = sp[0] + U.ri(-1, 1), ty = sp[1] + U.ri(0, 1), tm = W.get('town');
            t.legs = [{ map: 'town', to: tm.blk && tm.blk[ty * tm.w + tx] ? [sp[0], sp[1]] : [tx, ty], then: 'face', face: U.pick(['up', 'down', 'left', 'right']) }];
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
