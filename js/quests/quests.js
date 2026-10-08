// Görev sistemi: ana hikâye, müze hedefleri ve NPC yan görevleri.
(function () {
  const U = AK.U;
  const art = id => AK.Artifacts.get(id);
  const isTablet = id => ['tablet_gunes', 'tablet_ay', 'tablet_yildiz'].includes(id);
  const resTablets = () => ['tablet_gunes', 'tablet_ay', 'tablet_yildiz'].filter(id => AK.state.found[id] && AK.state.found[id].res).length;
  const donatedIn = cat => AK.state.museum.filter(id => art(id).cat === cat).length;
  const deliver = (npc, id, n, lines, after) => ({ type: 'deliver', npc, item: id, n, text: `${n} ${AK.Items.D[id].name} getir (${AK.NPCs.byId[npc].name})`, lines, after });

  const DEFS = {
    // ================= ANA HİKÂYE =================
    s_hosgeldin: {
      title: 'Hoş Geldin, Kâşif!', story: true, giver: 'nermin',
      desc: 'Amcanın eski dostu Nermin Hanım müzede seni bekliyor. Müze, meydanın batısındaki sütunlu büyük bina.',
      obj: [{ type: 'hook', npc: 'nermin', text: 'Müzede Nermin Hanım ile konuş' }],
      hook: () => [
        'Sen... {ad} olmalısın! Doğan\'ın yeğeni. Hoş geldin, çocuğum.',
        'Ben Nermin, bu müzenin küratörüyüm. Gördüğün gibi vitrinler bomboş... Kasaba unutuldu, ziyaretçi gelmez oldu.',
        'Amcan kuzeydoğudaki Eski Orman\'da yıllarca kazı yaptı. Toprağın altında kayıp bir şehir olduğuna inanırdı.',
        'Al, bu onun kazı izni. Artık senin. Kasabanın kuzeydoğu çıkışından ormana gidebilirsin.',
        'Toprağın üstünde titreyen küçük çubuklar göreceksin; onlar kazı işaretleri. Küreğini seç ve kaz!',
        'Bulduğun eserler kirli çıkacak. Dükkânındaki temizleme masasında temizle, sonra ister bana bağışla ister dükkânında sat. Haydi bakalım!',
      ],
      reward: { flags: ['kaziIzni'] }, next: ['s_ilk_kazi'],
    },
    s_ilk_kazi: {
      title: 'İlk Kazı', story: true, giver: 'nermin',
      desc: 'Eski Orman Kazı Alanı\'na git ve ilk eserini bul. Kahverengi hendeklerdeki titreyen çubuklar kazı işaretleridir. Kürekle (1) kaz!',
      obj: [{ type: 'ev', ev: 'found', text: 'Eski Orman\'da bir eser bul', n: 1 }],
      reward: { money: 50 }, next: ['s_temizlik', 'q_lale_kil'],
    },
    s_temizlik: {
      title: 'Temiz İş', story: true, giver: 'nermin',
      desc: 'Kirli eserleri doğrudan satamazsın. Meydanın doğusundaki dükkânına git, sol üstteki temizleme masasında eseri temizle.',
      obj: [{ type: 'ev', ev: 'cleaned', text: 'Dükkânda bir eseri temizle', n: 1 }],
      reward: { money: 50 }, next: ['s_karar', 'q_riza_comlek'],
    },
    s_karar: {
      title: 'Bağışla ya da Sat', story: true, giver: 'nermin',
      desc: 'Her eser bir seçim! Müzeye bağışlarsan kasaba gelişir; dükkândaki sergi masasına koyarsan müşteriler satın alır.',
      obj: [{ type: 'check', text: 'Müzeye bir eser bağışla (Nermin\'in masası)', check: () => AK.state.museum.length >= 1 }, { type: 'check', text: 'Dükkânında bir eser sat (sergi masası)', check: () => AK.state.stats.sold >= 1 }],
      reward: { money: 250 }, next: ['s_demirci', 'q_kaya_tas', 'q_defne_arastir', 'm_5'],
    },
    s_demirci: {
      title: 'Demircinin Ateşi', story: true, giver: 'kaya',
      desc: 'Paslı aletlerle bir yere kadar. Demirci Kaya\'ya git ve bir aletini geliştir. Bakır Kazma ile mağaranın girişindeki kayaları kırabilirsin!',
      obj: [{ type: 'check', text: 'Demircide bir aleti geliştir', check: () => ['shovel', 'pickaxe', 'hammer', 'brush'].some(t => AK.state.tools[t] >= 2) }],
      reward: { money: 100 }, next: ['s_magara'],
    },
    s_magara: {
      title: 'Mağaranın Kapısı', story: true, giver: 'nermin',
      desc: 'Eski Orman\'ın kuzeyindeki kayalığın dibinde çökmüş bir mağara girişi var. Bakır kazmayla kayaları kır ve içeri gir.',
      obj: [{ type: 'check', text: 'Mağara girişini aç (Kazma Sv.2)', check: () => !!AK.state.flags.caveOpen }, { type: 'check', text: 'Küçük Mağara\'ya gir', check: () => !!AK.state.flags.visitedCave }],
      reward: { money: 150 }, next: ['s_tabletler'],
    },
    s_tabletler: {
      title: 'Üç Tablet', story: true, giver: 'defne',
      desc: 'Mağaradaki duvar oymasında güneş, ay ve yedi yıldız var. Defne üç yazıtlı tablet olduğunu düşünüyor. Eski Orman\'da tabletleri bul, temizle ve kütüphanede Defne\'ye araştırt.',
      obj: [{ type: 'check', text: 'Tabletleri araştır: ', count: () => resTablets(), n: 3, check: () => resTablets() >= 3 }],
      reward: { money: 300, flags: ['tabletsDecoded'], fr: { defne: 80 } }, next: ['s_muhur'],
      doneMsg: 'Defne tabletleri çözdü: "Güneş doğar, ay yükselir, yıldızlar sayılır — ve mühür çözülür." Mağaradaki mühürlü kapı artık parlıyor!',
    },
    s_muhur: {
      title: 'Mühürlü Kapı', story: true, giver: 'defne',
      desc: 'Mağaranın doğu odasındaki mühürlü taş kapıyı Bakır Çekiç (Sv.2) ile kır ve arkasındaki odayı keşfet.',
      obj: [{ type: 'check', text: 'Mühürlü kapıyı kır (Çekiç Sv.2)', check: () => !!AK.state.flags.sealBroken }, { type: 'check', text: 'Gizli odadaki sunağı incele', check: () => !!AK.state.flags.altarTaken }],
      reward: { money: 500 }, next: ['s_col'],
    },
    s_col: {
      title: 'Kum Altındaki İz', story: true, giver: 'nermin',
      desc: 'Harita parçası Çöl Harabeleri\'ni gösteriyor! Oraya gitmek için Nermin Hanım\'dan Keşif Ruhsatı almalısın. Ruhsat için müzenin en az 12 esere ulaşması gerekiyor.',
      obj: [{ type: 'check', text: 'Müzeye 12 eser bağışla: ', count: () => AK.state.museum.length, n: 12, check: () => AK.state.museum.length >= 12 }, { type: 'hook', npc: 'nermin', text: 'Nermin\'den Keşif Ruhsatı al (2.000 altın)' }],
      hookIf: () => AK.state.museum.length >= 12,
      reward: { money: 0 }, next: ['s_col_harita'],
    },
    s_col_harita: {
      title: 'İkinci Parça', story: true, giver: 'defne',
      desc: 'Çöl Harabeleri\'nin batısında duvarlarla çevrili, girişi olmayan bir oda var. Çatlak duvarı Çelik Çekiç (Sv.3) ile kır ve haritanın ikinci parçasını bul.',
      obj: [{ type: 'check', text: 'Gizli odayı aç ve sandığı incele', check: () => !!AK.state.flags.desertChest }],
      reward: { money: 1000 }, next: ['s_devam'],
    },
    s_devam: {
      title: 'Kayıp Şehir\'e Doğru', story: true, giver: 'defne',
      desc: 'İki harita parçasını kütüphanedeki Defne\'ye göster.',
      obj: [{ type: 'hook', npc: 'defne', text: 'Defne ile konuş' }],
      hook: () => [
        '{ad}! İki parçayı yan yana koyalım...',
        'Bak! Çizgiler birleşiyor. Çölden kuzeye, karlı bir dağa... oradan da ateşli bir vadiye uzanıyor.',
        'Ve yolun sonu... burası. Bizim kasabamız. Kayıp Şehir tam altımızda, {ad}!',
        'Ama kapıyı açmak için kalan iki harita parçasını bulmalıyız: biri Donmuş Dağ\'da, biri Volkanik Bölge\'de.',
        'Oralara gitmek için daha iyi ekipman ve daha ünlü bir kasaba lazım. Ama biliyorum ki başaracağız.',
        '(Ana hikâyenin bu bölümü tamamlandı! Donmuş Dağ ve Volkanik Bölge ileriki bir güncellemede açılacak. Keşfetmeye, koleksiyonu tamamlamaya ve kasabayı büyütmeye devam edebilirsin!)',
      ],
      reward: { money: 2000, flags: ['storyV1'] }, next: [],
    },
    // ================= MÜZE HEDEFLERİ =================
    m_5: { title: 'Müze Hedefi: 5 Eser', giver: 'nermin', desc: 'Müzeye 5 eser bağışla. Kasaba çeşmeyi onarmaya söz verdi!', obj: [{ type: 'check', text: 'Bağışlanan eser: ', count: () => AK.state.museum.length, n: 5, check: () => AK.state.museum.length >= 5 }], reward: { money: 300 }, next: ['m_10', 'q_nermin_seramik'] },
    m_10: { title: 'Müze Hedefi: 10 Eser', giver: 'nermin', desc: '10 bağışta müzenin Doğu Kanadı açılacak ve kasabaya turistler gelmeye başlayacak.', obj: [{ type: 'check', text: 'Bağışlanan eser: ', count: () => AK.state.museum.length, n: 10, check: () => AK.state.museum.length >= 10 }], reward: { money: 600 }, next: ['m_20'] },
    m_20: { title: 'Müze Hedefi: 20 Eser', giver: 'nermin', desc: '20 bağışta Hazine Salonu açılacak ve meydana hediyelik eşya standı kurulacak.', obj: [{ type: 'check', text: 'Bağışlanan eser: ', count: () => AK.state.museum.length, n: 20, check: () => AK.state.museum.length >= 20 }], reward: { money: 1500 }, next: ['m_30'] },
    m_30: { title: 'Müze Hedefi: 30 Eser', giver: 'nermin', desc: '30 eserle kasaba ünlü bir arkeoloji merkezi olacak!', obj: [{ type: 'check', text: 'Bağışlanan eser: ', count: () => AK.state.museum.length, n: 30, check: () => AK.state.museum.length >= 30 }], reward: { money: 3000 }, next: ['m_all'] },
    m_all: { title: 'Tam Koleksiyon', giver: 'nermin', desc: 'Müzedeki tüm vitrinleri doldur.', obj: [{ type: 'check', text: 'Bağışlanan eser: ', count: () => AK.state.museum.length, n: AK.Artifacts.LIST.length, check: () => AK.state.museum.length >= AK.Artifacts.LIST.length }], reward: { money: 10000 }, next: [] },
    // ================= YAN GÖREVLER =================
    q_lale_kil: {
      title: 'Lale\'nin Fırını', giver: 'lale', desc: 'Lale\'nin taş fırını çatlamış. Tamir için kazı alanından 5 kil getir.',
      obj: [deliver('lale', 'kil', 5, ['Kil mi getirdin? Harikasın! Fırınım yeniden yanacak!', 'Al bakalım, sıcacık menemenler! Kazıda enerjin bitmesin.'])],
      reward: { items: [{ id: 'menemen', n: 3 }], fr: { lale: 60 } }, next: [],
    },
    q_riza_comlek: {
      title: 'Mozaik İşi', giver: 'riza', desc: 'Rıza Usta çömlek kırıklarından mozaik halı yapmak istiyor. 6 çömlek kırığı getir.',
      obj: [deliver('riza', 'comlek', 6, ['Oo, ne güzel parçalar! Bunlardan nefis bir mozaik çıkar.', 'Sana da evin için bir halı dokudum, evine yerleştirdim bile!'])],
      reward: { money: 100, fr: { riza: 60 }, fn: () => { AK.state.house.furn.hali = true; } }, next: [],
    },
    q_kaya_tas: {
      title: 'Demirciye Taş', giver: 'kaya', desc: 'Kaya\'nın ocağının duvarları yıpranmış. 10 taş getir.',
      obj: [deliver('kaya', 'tas', 10, ['Taşlar. Güzel. Sağlam.', 'Al. Emeğinin karşılığı.'])],
      reward: { money: 150, fr: { kaya: 60 } }, next: [],
    },
    q_defne_arastir: {
      title: 'Araştırma Ortaklığı', giver: 'defne', desc: 'Defne\'nin kütüphanesi için 3 eseri araştır. Araştırılan eserlerin değeri %20 artar.',
      obj: [{ type: 'ev', ev: 'researched', text: 'Eser araştır', n: 3 }],
      reward: { money: 200, fr: { defne: 60 } }, next: [],
    },
    q_nermin_seramik: {
      title: 'Seramik Koleksiyonu', giver: 'nermin', desc: 'Nermin Hanım seramik salonunu doldurmak istiyor. Müzeye 3 "Seramik & Cam" eseri bağışla.',
      obj: [{ type: 'check', text: 'Seramik & Cam bağışı: ', count: () => donatedIn('Seramik & Cam'), n: 3, check: () => donatedIn('Seramik & Cam') >= 3 }],
      reward: { money: 500, fr: { nermin: 80 } }, next: [],
    },
  };

  const Q = AK.Quests = {
    DEFS,
    get s() { return AK.state.quests; },
    isActive(id) { return this.s.active.some(q => q.id === id); },
    isDone(id) { return this.s.done.includes(id); },
    start(id, silent) {
      if (!DEFS[id] || this.isActive(id) || this.isDone(id)) return;
      this.s.active.push({ id, p: DEFS[id].obj.map(() => 0) });
      if (!silent) { AK.UI.toast(`Yeni görev: ${DEFS[id].title}`, 'quest'); }
      this.poll();
    },
    objDone(q, k) {
      const o = DEFS[q.id].obj[k];
      if (o.type === 'check') return o.check();
      if (o.type === 'deliver' || o.type === 'hook') return q.p[k] >= 1;
      return q.p[k] >= (o.n || 1);
    },
    objText(q, k) {
      const o = DEFS[q.id].obj[k];
      if (o.count) return o.text + `${Math.min(o.count(), o.n)}/${o.n}`;
      if (o.type === 'deliver') return o.text + ` (${Math.min(AK.Inv.count(o.item), o.n)}/${o.n})`;
      if (o.n > 1) return o.text + ` (${Math.min(q.p[k], o.n)}/${o.n})`;
      return o.text;
    },
    onEvent(ev, ...args) {
      for (const q of this.s.active.slice()) {
        DEFS[q.id].obj.forEach((o, k) => {
          if (o.type === 'ev' && o.ev === ev && (!o.match || o.match(...args))) q.p[k]++;
        });
      }
      this.poll();
    },
    poll() {
      for (const q of this.s.active.slice()) {
        const d = DEFS[q.id];
        if (d.obj.every((o, k) => this.objDone(q, k))) this.complete(q.id);
      }
    },
    complete(id) {
      const d = DEFS[id];
      this.s.active = this.s.active.filter(q => q.id !== id);
      if (!this.s.done.includes(id)) this.s.done.push(id);
      const r = d.reward || {};
      const parts = [];
      if (r.money) { AK.Game.addMoney(r.money, 'Görev'); parts.push(`+${U.fmt(r.money)} altın`); }
      (r.items || []).forEach(it => { if (!AK.Inv.add({ id: it.id, n: it.n })) AK.World.drop(AK.World.cur, AK.Player.x, AK.Player.y, { id: it.id, n: it.n }); parts.push(`${it.n} ${AK.Items.D[it.id].name}`); });
      (r.flags || []).forEach(f => { AK.state.flags[f] = true; });
      for (const k in r.fr || {}) AK.NPCs.addFr(k, r.fr[k]);
      if (r.fn) r.fn();
      AK.Audio.sfx('quest');
      AK.UI.toast(`Görev tamamlandı: ${d.title}${parts.length ? ' (' + parts.join(', ') + ')' : ''}`, 'star');
      if (d.doneMsg) setTimeout(() => AK.UI.toast(d.doneMsg, 'museum'), 600);
      AK.Bus.emit('questDone', id);
      (d.next || []).forEach(n => this.start(n));
      AK.UI.refreshTracker();
    },
    // NPC konuşmasında görev kancası
    npcHook(n, end) {
      for (const q of this.s.active) {
        const d = DEFS[q.id];
        for (let k = 0; k < d.obj.length; k++) {
          const o = d.obj[k];
          if (o.npc !== n.id || this.objDone(q, k)) continue;
          if (o.type === 'hook') {
            if (d.hookIf && !d.hookIf()) continue;
            if (q.id === 's_col') { this.licenseDialog(n, q, k, end); return true; }
            AK.Dialog.open({ name: n.def.name, look: n.look, lines: d.hook(), onEnd: () => { q.p[k] = 1; this.poll(); end(); } });
            return true;
          }
          if (o.type === 'deliver' && AK.Inv.count(o.item) >= o.n) {
            AK.Dialog.open({
              name: n.def.name, look: n.look, lines: [`${o.n} ${AK.Items.D[o.item].name} getirdin mi?`],
              choices: [
                { t: `Ver (${o.n} ${AK.Items.D[o.item].name})`, fn: () => { AK.Inv.removeId(o.item, o.n); q.p[k] = 1; AK.Dialog.open({ name: n.def.name, look: n.look, lines: o.lines, onEnd: () => { this.poll(); end(); } }); } },
                { t: 'Sonra', fn: end },
              ],
            });
            return true;
          }
        }
      }
      return false;
    },
    licenseDialog(n, q, k, end) {
      const cost = 2000;
      AK.Dialog.open({
        name: n.def.name, look: n.look,
        lines: ['Müzemizde tam 12 eser var, {ad}! Belediye artık sana bir Keşif Ruhsatı verebilir.', `Ruhsatın harcı ${U.fmt(cost)} altın. Ruhsatla otobüs durağından Çöl Harabeleri\'ne gidebilirsin.`],
        choices: [
          { t: `Ruhsatı al (${U.fmt(cost)} altın)`, fn: () => {
            if (AK.state.player.money < cost) { AK.Dialog.open({ name: n.def.name, look: n.look, lines: ['Henüz yeterli paran yok gibi. Biraz daha birikince gel.'], onEnd: end }); return; }
            AK.Game.addMoney(-cost); AK.state.flags.desertOpen = true; q.p[k] = 1;
            AK.Dialog.open({ name: n.def.name, look: n.look, lines: ['İşte ruhsatın! Otobüs durağı kasabanın batı çıkışında. Çöl sıcaktır, yanına bol yiyecek al!'], onEnd: () => { AK.UI.toast('Yeni bölge açıldı: Çöl Harabeleri!', 'bus'); AK.Audio.stinger(3); this.poll(); end(); } });
          } },
          { t: 'Daha sonra', fn: end },
        ],
      });
    },
    npcHasNews(id) {
      for (const q of this.s.active) {
        const d = DEFS[q.id];
        for (let k = 0; k < d.obj.length; k++) {
          const o = d.obj[k];
          if (o.npc !== id || this.objDone(q, k)) continue;
          if (o.type === 'hook' && (!d.hookIf || d.hookIf())) return true;
          if (o.type === 'deliver' && AK.Inv.count(o.item) >= o.n) return true;
        }
      }
      return false;
    },
    tracked() {
      const a = this.s.active;
      return a.find(q => DEFS[q.id].story) || a[0] || null;
    },
    init() {
      ['found', 'cleaned', 'donated', 'sold', 'upgraded', 'researched', 'mapEnter', 'gift', 'spotDug'].forEach(ev => AK.Bus.on(ev, (...a) => this.onEvent(ev, ...a)));
      AK.Bus.on('flag', () => this.poll());
    },
  };
  void isTablet;
})();
