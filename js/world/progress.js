// Kasaba gelişimi (itibar), etkinlik takvimi, posta, hikâye ödülleri ve festival yarışması.
(function () {
  const U = AK.U;
  const STAGES = ['Unutulmuş Kasaba', 'Uyanan Kasaba', 'Meraklı Kasaba', 'Turist Kasabası', 'Tanınan Kasaba', 'Ünlü Arkeoloji Merkezi'];
  const STAGE_NEED = [0, 5, 10, 15, 20, 30];
  const STAGE_TEXT = [
    '',
    'Kasaba çeşmesi onarıldı ve meydana çiçekler dikildi! Müzeye gelen ilk ziyaretçiler kasabada konuşuluyor.',
    'Müzenin Doğu Kanadı açıldı! Meydana kasaba bayrakları asıldı ve müze binası restore edildi.',
    'Kasabaya turistler gelmeye başladı! Eski boş ev bir turist pansiyonuna dönüştü. Dükkânına daha çok müşteri gelecek.',
    'Meydana bir Hediyelik Eşya Standı kuruldu ve kasaba halkı adına bir kâşif heykeli dikildi!',
    'Kasaban artık ünlü bir arkeoloji merkezi! Gazeteler senden bahsediyor.',
  ];
  const EVENTS = [
    { s: 0, d: 5, id: 'hazine' }, { s: 0, d: 12, id: 'muzegecesi' },
    { s: 1, d: 6, id: 'gecekazisi' }, { s: 1, d: 12, id: 'kostum' },
    { s: 2, d: 4, id: 'hazine' }, { s: 2, d: 10, id: 'festival' },
    { s: 3, d: 7, id: 'gecekazisi' }, { s: 3, d: 12, id: 'muzegecesi' },
  ];
  const EVENTS_BY_ID = {
    hazine: { name: 'Hazine Avı', desc: 'Kasabanın çimenlerine gizli hazineler gömüldü! Yerde kırmızı X işaretlerini ara ve kürekle kaz.' },
    muzegecesi: { name: 'Müze Gecesi', desc: 'Akşam 19:00\'dan sonra herkes müzede! O gece yapılan bağışlara +100 altın ödül.' },
    gecekazisi: { name: 'Gece Kazısı', desc: 'Eski Orman fenerlerle aydınlanıyor. 20:00\'den sonra ekstra kazı işaretleri belirir.' },
    kostum: { name: 'Antik Kostüm Günü', desc: 'Kasaba halkı antik kostümler giyiyor! Sohbetler iki kat arkadaşlık kazandırır.' },
    festival: { name: 'Büyük Arkeoloji Festivali', desc: 'Meydanda festival! Nermin Hanım\'ın "En İyi Eser" yarışmasına katıl.' },
  };

  const Pr = AK.Progress = {
    STAGES, EVENTS, EVENTS_BY_ID, STAGE_NEED,
    rep() { const n = AK.state.museum.length; let r = 0; for (let i = 0; i < STAGE_NEED.length; i++) if (n >= STAGE_NEED[i]) r = i; return r; },
    stageName(r) { return STAGES[r == null ? this.rep() : r]; },
    eventOn(season, day) { const e = EVENTS.find(x => x.s === season && x.d === day); return e ? e.id : null; },
    eventToday() { if (!AK.state) return null; return this.eventOn(AK.Time.season(), AK.Time.day()); },
    eventTomorrow() { let d = AK.Time.day() + 1, s = AK.Time.season(); if (d > AK.Time.DPS) { d = 1; s = (s + 1) % 4; } return this.eventOn(s, d); },
    nextEvent() {
      let s = AK.Time.season(), d = AK.Time.day();
      for (let k = 0; k < 56; k++) { d++; if (d > AK.Time.DPS) { d = 1; s = (s + 1) % 4; } const e = this.eventOn(s, d); if (e) return { id: e, s, d, inDays: k + 1 }; }
      return null;
    },
    checkRep(prev) {
      const r = this.rep();
      if (r > prev) {
        for (let i = prev + 1; i <= r; i++) {
          this.mail('belediye_' + i, 'Kasaba Belediyesi', `Kasaba gelişiyor: ${STAGES[i]}`, STAGE_TEXT[i] + `\n\nTeşekkürler, ${AK.state.player.name}!`);
          AK.UI.toast(`Kasaba gelişti: ${STAGES[i]}! ${STAGE_TEXT[i]}`, 'star');
        }
        AK.Audio.sfx('upgrade');
        const t = AK.World.get('town');
        if (t && t.refresh) t.refresh(t);
        AK.World.rebuild(t);
      }
    },
    // ---------------- posta ----------------
    mail(id, from, title, text, gift) {
      if (AK.state.mail.some(l => l.id === id)) return;
      AK.state.mail.push({ id, from, title, text, read: false, gift: gift || null, day: AK.Time.abs() });
    },
    onNewDay() {
      const abs = AK.Time.abs();
      if (abs === 2) this.mail('hosgeldin', 'Nermin', 'Hoş geldin!', 'Sevgili {ad},\n\nKasabaya hoş geldin. Unutma: her sabah kazı alanında yeni işaretler belirir. Taşları kazmayla kırarsan demirci için malzeme toplarsın.\n\nYağmurlu günlerde toprak yumuşar; o günleri kaçırma!\n\nSevgiyle, Nermin', { item: 'simit', n: 3 });
      if (abs === 4) this.mail('riza1', 'Rıza Usta', 'Dükkânın için', 'Evlat,\n\nDükkânının arka tarafı tadilat bekliyor. 2.500 altın, 30 taş ve 15 kil getirirsen orayı açar, 4 yeni sergi masası koyarım.\n\nRıza');
      if (abs === 3) this.mail('ofis', 'Nermin', 'Eserlerin hakkında', 'Sevgili {ad},\n\nBulduğun eserleri satmak istersen dükkânın dışında Belediye\'deki Kültür Varlıkları Ofisi\'ne de götürebilirsin; fiyatı sabit ve her şey belgeli.\n\nBir de... liman tarafında geceleri Gölge diye birinin dolaştığını duydum. Kaçak eser alıp satıyormuş. Ondan uzak dur; jandarma ve müfettişler peşinde.\n\nNermin');
      const ev = this.eventTomorrow();
      if (ev) this.mail('ev_' + abs, 'Kasaba Belediyesi', `Yarın: ${EVENTS_BY_ID[ev].name}!`, `Değerli kasaba sakinleri,\n\nYarın ${EVENTS_BY_ID[ev].name} var! ${EVENTS_BY_ID[ev].desc}\n\nHepinizi bekleriz.`);
      if (AK.state.flags.metStranger && !AK.state.flags.strangerNote) { AK.state.flags.strangerNote = true; this.mail('stranger', '???', 'İmzasız bir not', '"Mühür kırılınca, sunağa bak. Kumların altındaki oda ise duvarın ardında. Her kapının bir bekçisi vardır, kâşif."'); }
      if (AK.Time.day() === 1 && abs > 1) this.mail('season_' + abs, 'Lale', `${AK.Time.SEASONS[AK.Time.season()]} geldi!`, `Yeni mevsim, yeni lezzetler! ${['Bahar çiçekleri açtı', 'Yaz sıcakları başladı', 'Yapraklar dökülüyor', 'Kar yağıyor'][AK.Time.season()]}. Restorana uğra, sıcak bir çorba ısmarlayayım!\n\nLale`);
    },
    // ---------------- hikâye ödülleri ----------------
    altar() {
      const F = AK.state.flags;
      if (F.altarTaken) { AK.UI.toast('Boş sunak. Üzerindeki oymalar yedi ışınlı bir güneşi anlatıyor.', 'museum'); return; }
      AK.Dialog.open({
        name: 'Gizli Oda', lines: ['Sunağın üzerinde altın bir disk duruyor. Yanında, deri bir parşömen var...', 'Parşömende bir harita! Kum tepeleri ve bir dikilitaş çizilmiş.'],
        onEnd: () => {
          F.altarTaken = true;
          AK.Exc.giveArtifact('gunes_diski', AK.Player.x, AK.Player.y - 16);
          setTimeout(() => AK.Exc.giveArtifact('harita_1', AK.Player.x, AK.Player.y - 16), 1500);
          AK.Bus.emit('flag', 'altarTaken');
        },
      });
    },
    desertChest() {
      const F = AK.state.flags;
      if (F.desertChest) { AK.UI.toast('Boş antik sandık.', 'museum'); return; }
      AK.Dialog.open({
        name: 'Antik Sandık', lines: ['Sandığın kapağı yüzyıllardır açılmamış... İçinde bir miğfer ve katlanmış bir harita parçası var!'],
        onEnd: () => {
          F.desertChest = true;
          AK.Exc.giveArtifact('harita_2', AK.Player.x, AK.Player.y - 16);
          setTimeout(() => AK.Exc.giveArtifact('tunc_migfer', AK.Player.x, AK.Player.y - 16), 1500);
          AK.Bus.emit('flag', 'desertChest');
        },
      });
    },
    // ---------------- festival ----------------
    contest() {
      const key = 'contest' + AK.state.time.year;
      if (AK.state.flags[key]) { AK.UI.toast('Bu yılın yarışmasına zaten katıldın.', 'star'); return; }
      AK.UI.chooseItem({
        title: 'En İyi Eser Yarışması', note: 'Jüriye göstermek için temiz bir eser seç. Eser sende kalır; değeri ve kalitesi puanını belirler.',
        filter: s => AK.Items.isArtifact(s) && !s.d,
        onPick: i => {
          const st = AK.Inv.get(i), def = AK.Items.get(st.id);
          const score = Math.round((def.value || 2000) * AK.Items.QUALITY[st.q].mult * (st.r ? 1.2 : 1) * (0.9 + Math.random() * 0.2));
          AK.state.flags[key] = true;
          const [place, prize] = score >= 1400 ? [1, 3000] : score >= 450 ? [2, 1200] : [3, 400];
          AK.Dialog.open({
            name: 'Nermin Hanım', look: AK.NPCs.byId.nermin.look,
            lines: [`Jüri ${def.name} eserini inceliyor... (Puan: ${score})`, place === 1 ? 'Ve birinci... {ad}! Muhteşem bir eser! Festival kupası senin!' : place === 2 ? 'İkincilik {ad}\'ın! Çok güzel bir parça!' : 'Üçüncülük {ad}\'ın! Katıldığın için teşekkürler!'],
            onEnd: () => { AK.Game.addMoney(prize, 'Festival'); if (place === 1) AK.Inv.add({ id: 'figur', n: 1 }); AK.Audio.sfx('upgrade'); AK.UI.toast(`Festival ödülü: +${U.fmt(prize)} altın`, 'star'); },
          });
        },
      });
    },
    TIPS: {
      forest: 'İpucu: Hendeklerdeki titreyen çubuklar kazı işaretidir — Kürek (1) ile kaz. Taşları Kazma (2), büyük kayaları Çekiç (3), fosil katmanlarını Fırça (4) ile çıkar.',
      shop: 'İpucu: Sol üstte temizleme masası, ortada sergi masaları, solda tezgâh var. Kirli eserleri temizle, sonra masalara koy; müşteriler 09:00–18:00 arası gelir.',
      museum: 'İpucu: Nermin Hanım\'ın masasından eser bağışlayabilirsin. Bağışladığın her eser kendi vitrininde sergilenir!',
      cave: 'İpucu: Kristalleri kazmayla topla, kumlu zeminde kazı işaretleri ara. Demirci kuvarsı alet geliştirmede kullanır.',
      desert: 'İpucu: Kumtaşı kayalarda altın külçe saklı olabilir. Sert kumlu avlu için Çelik Kürek gerekir.',
      house: 'İpucu: Yatakta uyuyunca gün biter ve oyun kaydedilir. Radyo yarının havasını söyler, vitrinde eserlerini sergileyebilirsin.',
    },
    init() {
      AK.Bus.on('mapEnter', id => {
        if (id === 'cave') { AK.state.flags.visitedCave = true; AK.Quests.poll(); }
        if (id === 'desert') AK.state.flags.visitedDesert = true;
        const k = 'tip_' + id;
        if (AK.Game.playing && this.TIPS[id] && !AK.state.flags[k] && !(id === 'house' && AK.state.stats.days <= 1)) {
          AK.state.flags[k] = true;
          setTimeout(() => AK.UI.toast(this.TIPS[id], 'quest'), 900);
        }
      });
    },
  };
})();
