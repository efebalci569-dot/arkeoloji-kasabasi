// Yasal ve yasa dışı satış: Belediye'deki Kültür Varlıkları Ofisi (güvenli, sabit fiyat)
// ve liman deposundaki karaborsacı "Gölge" (yüksek fiyat, ama şüphe, devriye ve baskın riski).
(function () {
  const U = AK.U;
  const LEVELS = [
    { max: 0, name: 'Temiz', col: '#5cc24a' },
    { max: 20, name: 'Fısıltılar', col: '#c8d84a' },
    { max: 45, name: 'Dedikodu', col: '#e8c23a' },
    { max: 70, name: 'Şüpheli', col: '#e8822a' },
    { max: 101, name: 'Aranıyor', col: '#d8352e' },
  ];
  const INSPECTOR = { skin: '#e2a878', hair: '#2a2024', hairStyle: 'short', shirt: '#e8e0d0', outfit: 'coat', outfitCol: '#2a3a5a', pants: '#1e2a40', shoes: '#1e1218', hat: 'cap', hatCol: '#2a3a5a', acc: ['mustache'] };
  const CLERK = { skin: '#f2cfae', hair: '#5a3a22', hairStyle: 'bun', shirt: '#e8e0d0', outfit: 'vest', outfitCol: '#3d5a7a', pants: '#3b3550', acc: ['glasses'] };
  const SMUGGLER = { skin: '#c8a080', hair: '#2a2024', hairStyle: 'short', shirt: '#2f2a40', outfit: 'robe', outfitCol: '#2a2438', pants: '#1e1824', acc: ['hood'], hatCol: '#221c30' };

  const La = AK.Law = {
    LEVELS, INSPECTOR, CLERK, SMUGGLER,
    get s() {
      if (!AK.state.law) AK.state.law = { sus: 0, honest: 0, caught: 0, blackSales: 0, legalSales: 0, fines: 0, raid: false, lastCaught: -99 };
      return AK.state.law;
    },
    level() { const v = this.s.sus; return LEVELS.findIndex(l => v <= l.max); },
    levelInfo() { return LEVELS[Math.max(0, this.level())]; },
    addSus(n) { this.s.sus = U.clamp(Math.round(this.s.sus + n), 0, 100); },
    // ---------------- yasal ofis ----------------
    officeOpen() { const m = AK.Time.min(); return AK.Time.weekday() < 5 && m >= 540 && m < 1020; },
    honestBonus() { const h = this.s.honest; return h >= 15 ? 1.15 : h >= 5 ? 1.1 : 1; },
    legalPrice(st) {
      const d = AK.Items.get(st.id);
      if (!d || d.type !== 'artifact' || d.noSell) return 0;
      const base = st.d ? d.value * 0.4 : AK.Items.value(st);
      return Math.max(1, Math.round(base * this.honestBonus()));
    },
    legalSell(i) {
      const st = AK.Inv.get(i);
      if (!st) return;
      const p = this.legalPrice(st);
      const name = AK.Items.name(st);
      AK.Inv.removeAt(i, 1);
      AK.Game.addMoney(p, 'Yasal satış');
      this.s.legalSales++; this.s.honest++;
      this.addSus(-5);
      AK.state.daylog.sold.push({ name, price: p, buyer: 'Kültür Varlıkları Ofisi' });
      AK.Audio.sfx('coin');
      AK.UI.toast(`${name} resmi olarak satıldı (+${U.fmt(p)}). Belgeli satış: dürüstlük puanın arttı.`, 'museum');
      if (this.s.honest === 5 || this.s.honest === 15) AK.UI.toast(`"Güvenilir Kâşif" unvanı! Ofis artık %${this.s.honest >= 15 ? 15 : 10} fazla ödüyor.`, 'star');
      AK.Bus.emit('legalSold', st.id, p);
    },
    // ---------------- karaborsa ----------------
    smugglerHere() { const m = AK.Time.min(); return m >= 1200 || m < 120; },
    haggle(st) { return 0.9 + U.h2(U.hash(st.id), AK.Time.abs(), 5) * 0.25; },
    blackPrice(st) {
      const d = AK.Items.get(st.id);
      if (!d || d.type !== 'artifact' || d.noSell) return 0;
      const q = AK.Items.QUALITY[st.q != null ? st.q : 1].mult;
      return Math.max(1, Math.round(d.value * (st.d ? 1.25 : 1.65 * q) * this.haggle(st)));
    },
    riskOf(st) {
      const d = AK.Items.get(st.id);
      return 6 + d.rar * 5 + (d.rar >= 3 && !AK.state.museum.includes(d.id) ? 8 : 0);
    },
    riskLabel(st) { const r = this.riskOf(st); return r >= 25 ? ['Çok yüksek', '#ff6a5a'] : r >= 16 ? ['Yüksek', '#ff9a5a'] : r >= 11 ? ['Orta', '#f2c14e'] : ['Düşük', '#9fe08a']; },
    patrolChance(st) { const d = AK.Items.get(st.id); return Math.min(0.5, 0.03 + this.s.sus / 450 + (d.rar >= 4 ? 0.06 : 0)); },
    blackSell(i, onDone) {
      const st = AK.Inv.get(i);
      if (!st) return;
      const d = AK.Items.get(st.id), name = AK.Items.name(st);
      if (Math.random() < this.patrolChance(st)) {
        // suçüstü!
        AK.Inv.removeAt(i, 1);
        const fine = Math.min(AK.state.player.money, 300 + this.s.sus * 10);
        AK.Game.addMoney(-fine);
        this.s.fines += fine; this.s.caught++; this.s.lastCaught = AK.Time.abs();
        this.addSus(10);
        AK.NPCs.addFr('nermin', -60);
        AK.Audio.sfx('error');
        AK.UI.closeAll();
        AK.Dialog.open({
          name: 'Jandarma Devriyesi', look: INSPECTOR,
          lines: ['DUR! Jandarma! Kımıldama!', `Bu... ${d.name}? Kaçak eser ticareti suçtur! Esere el konuluyor.`, `${U.fmt(fine)} altın para cezası kesildi. Bir daha gözümüze çarpma.`, '(Gölge karanlıkta çoktan kaybolmuştu...)'],
          onEnd: () => { AK.UI.toast('Yakalandın! Şüphe arttı, Nermin Hanım çok üzgün.', 'lock'); if (onDone) onDone(); },
        });
        AK.Bus.emit('caught', st.id);
        return;
      }
      const p = this.blackPrice(st);
      AK.Inv.removeAt(i, 1);
      AK.Game.addMoney(p, 'Karaborsa');
      this.s.blackSales++;
      this.addSus(this.riskOf(st));
      AK.state.daylog.sold.push({ name, price: p, buyer: 'Gölge (karaborsa)' });
      AK.Audio.sfx('coin');
      AK.UI.toast(`Gölge, ${name} için ${U.fmt(p)} altını avucuna sıkıştırdı. Kimse görmedi... umarım.`, 'coin');
      AK.Bus.emit('blackSold', st.id, p);
      if (onDone) onDone();
    },
    // ---------------- gece: şüphe azalır, baskın riski ----------------
    nightly() {
      const s = this.s;
      const prev = s.sus;
      s.sus = Math.max(0, s.sus - 6);
      if (prev >= 25 && Math.random() < Math.min(0.6, (prev - 15) / 110)) s.raid = true;
    },
    // uyanınca müfettiş gelir
    morning() {
      const s = this.s;
      if (!s.raid) return;
      s.raid = false;
      const taken = [];
      const isArt = st => st && AK.Items.isArtifact(st) && !AK.Items.get(st.id).noSell && !AK.Artifacts.get(st.id).fixed;
      // envanterden, evdeki sandık/vitrinlerden ve dükkân masalarından en fazla 2 eser
      const pools = [
        () => AK.Inv.list(isArt).map(i => ({ get: () => AK.Inv.get(i), take: () => AK.Inv.removeAt(i, 1) })),
        () => AK.state.house.chest.map((st, i) => isArt(st) ? { get: () => st, take: () => { AK.state.house.chest[i] = null; return st; } } : null).filter(Boolean),
        () => AK.state.house.disp.map((st, i) => isArt(st) ? { get: () => st, take: () => { AK.state.house.disp[i] = null; return st; } } : null).filter(Boolean),
        () => AK.state.shop.tables.map((t, i) => t && isArt(t.item) ? { get: () => t.item, take: () => { AK.state.shop.tables[i] = null; return t.item; } } : null).filter(Boolean),
      ];
      for (const pf of pools) {
        const list = pf();
        while (list.length && taken.length < 2) { const k = (Math.random() * list.length) | 0; const it = list.splice(k, 1)[0]; const st = it.take(); if (st) taken.push(AK.Items.name(st)); }
        if (taken.length >= 2) break;
      }
      const fine = Math.min(AK.state.player.money, 200 + s.sus * 12 + s.caught * 150);
      AK.Game.addMoney(-fine);
      s.fines += fine; s.caught++; s.lastCaught = AK.Time.abs();
      s.sus = Math.round(s.sus * 0.4);
      AK.Inv.touch();
      AK.NPCs.addFr('nermin', -80);
      for (const n of AK.NPCs.DEFS) if (n.id !== 'nermin') AK.NPCs.addFr(n.id, -20);
      if (s.caught >= 3) AK.state.flags.permitBanDay = AK.Time.abs();
      AK.Dialog.open({
        name: 'Müfettiş Kemal', look: INSPECTOR,
        lines: [
          `Günaydın, ${AK.state.player.name}. Kültür Varlıkları Müfettişi Kemal. Hakkınızda kaçak eser satışı ihbarı var.`,
          taken.length ? `Arama sonucunda şu eserlere el konuldu: ${taken.join(', ')}.` : 'Arama yaptık ama bir şey bulamadık... şimdilik.',
          `${U.fmt(fine)} altın idari para cezası kesildi.${s.caught >= 3 ? ' Ayrıca kazı izniniz bugünlük askıya alındı!' : ''}`,
          'Bu kasabanın tarihi hepimizin. Bir dahaki sefere eserleri müzeye ya da Belediye\'deki ofise götürün.',
        ],
        onEnd: () => AK.UI.toast('Baskın! Kasabada dedikodu yayıldı; herkes sana biraz soğuk davranıyor.', 'lock'),
      });
    },
    permitBanned() { return AK.state.flags.permitBanDay === AK.Time.abs(); },
    greetLine(id) {
      const s = this.s, recent = AK.Time.abs() - s.lastCaught <= 3;
      if (recent && id === 'nermin') return 'Duydum... Eserleri karaborsaya satıyormuşsun. Amcan bunu asla yapmazdı. Beni çok üzdün, {ad}.';
      if (recent) return U.pick(['Müfettiş senin evine gelmiş diyorlar... Doğru mu?', 'Kasabada senin hakkında konuşuyorlar. Dikkatli ol.']);
      if (s.sus >= 45) return U.pick(['Geceleri liman tarafında dolaşan biri varmış. Sen bir şey gördün mü?', 'Bazı eserlerin yurt dışına kaçırıldığı konuşuluyor... Çok kötü.']);
      if (s.honest >= 5 && id === 'nermin') return 'Belediye\'deki ofisten senin hakkında çok iyi şeyler duydum. Dürüst bir kâşifsin!';
      return null;
    },
  };
})();
