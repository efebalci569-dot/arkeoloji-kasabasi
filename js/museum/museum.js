// Müze: bağış, vitrin bilgisi, salon açılışları.
(function () {
  const U = AK.U;
  const M = AK.Museum = {
    has(id) { return AK.state.museum.includes(id); },
    count() { return AK.state.museum.length; },
    hallOf(def) { for (const k in AK.Interiors.HALLS) if (AK.Interiors.HALLS[k].cats.includes(def.cat)) return AK.Interiors.HALLS[k]; return null; },
    deskTalk() {
      const n = AK.NPCs.list.find(x => x.id === 'nermin');
      if (n && n.map === 'museum' && !AK.NPCs.walking(n) && Math.hypot(n.x - (12 * 16 + 8), n.y - (14 * 16 + 12)) < 24) { AK.NPCs.talk(n); return; }
      AK.UI.toast('Nermin Hanım masasında değil. Bağışını masadaki bağış defterine yazabilirsin.', 'museum');
      this.donatePanel();
    },
    donatePanel() {
      const ok = s => AK.Items.isArtifact(s) && !s.d && !this.has(s.id);
      if (AK.Inv.find(ok) < 0) {
        const dirty = AK.Inv.find(s => AK.Items.isArtifact(s) && s.d && !this.has(s.id)) >= 0;
        AK.UI.toast(dirty ? 'Kirli eserleri bağışlayamazsın. Önce dükkânındaki temizleme masasında temizle.' : 'Müzede olmayan temiz bir eserin yok.', 'museum');
        return;
      }
      AK.UI.chooseItem({
        title: 'Müzeye Bağışla', note: `Müzede ${this.count()}/${AK.Artifacts.LIST.length} eser var. Yalnızca müzede olmayan temiz eserler bağışlanabilir.`,
        filter: ok,
        onPick: i => {
          const st = AK.Inv.get(i), def = AK.Items.get(st.id);
          AK.UI.confirm(`<b>${U.esc(def.name)}</b> müzeye bağışlansın mı?<br><span class="small-t muted">Satış değeri: ${AK.Items.value(st)} altın. Bağış küçük bir ödül verir ama kasabayı geliştirir.</span>`, () => this.donate(i), null, 'Bağışla', 'Vazgeç');
        },
      });
    },
    donate(i) {
      const st = AK.Inv.get(i);
      if (!st) return;
      const def = AK.Items.get(st.id);
      if (this.has(def.id)) { AK.UI.toast('Bu eser zaten müzede.', 'museum'); return; }
      const prevRep = AK.Progress.rep();
      AK.Inv.removeAt(i, 1);
      AK.state.museum.push(def.id);
      AK.state.stats.donated++;
      AK.state.daylog.donated.push(def.id);
      let reward = Math.round(def.value * 0.1 * (AK.state.flags.donBonus ? 1.5 : 1)) + 10;
      if (AK.Progress.eventToday() === 'muzegecesi' && AK.Time.min() >= 1140) reward += 100;
      AK.Game.addMoney(reward, 'Bağış');
      AK.NPCs.addFr('nermin', 10);
      const mus = AK.World.get('museum');
      if (mus.refresh) mus.refresh(mus);
      AK.World.rebuild(mus);
      AK.Audio.stinger(Math.max(1, def.rar));
      const hall = this.hallOf(def);
      const locked = hall && this.count() < hall.need;
      AK.UI.toast(`${def.name} müzeye bağışlandı! (+${reward} altın) ${locked ? `${hall.name} açılınca sergilenecek.` : 'Vitrininde sergileniyor!'}`, 'museum');
      const ped = mus.peds.find(p => p.art === def.id);
      if (ped && AK.World.cur === mus) AK.World.sparkle(ped.x, ped.y - 22, '#fff2b0', 18);
      const n = this.count();
      if (n === 10) setTimeout(() => AK.UI.toast('Doğu Kanadı açıldı! Takı ve yazıt salonu artık ziyarete açık.', 'star'), 900);
      if (n === 20) setTimeout(() => AK.UI.toast('Hazine Salonu açıldı! En değerli eserler artık burada parlayacak.', 'star'), 900);
      if (n === AK.Artifacts.LIST.length) setTimeout(() => AK.UI.toast('Müzedeki tüm vitrinler doldu! Efsanevi bir koleksiyon!', 'star'), 1200);
      AK.Bus.emit('donated', def.id);
      AK.Progress.checkRep(prevRep);
    },
    pedestal(id) {
      const def = AK.Artifacts.get(id);
      const UI = AK.UI;
      const body = UI.el('div', 'col');
      if (this.has(id)) {
        const f = AK.state.found[id] || {};
        body.innerHTML = `<div class="row"><img src="${AK.Icons.url(AK.Icons.artifact(def, false))}" style="width:5rem;height:5rem">
          <div><b style="font-size:1.2rem">${U.esc(def.name)}</b><div style="color:${AK.Artifacts.rarityCol(def.rar)}">${AK.Artifacts.rarityName(def.rar)} · ${def.cat}</div>
          <div class="small-t muted">${def.era} · ${AK.Artifacts.REGIONS[def.region]}</div></div></div>
          <div>${U.esc(def.desc)}</div>
          ${f.res ? `<div class="small-t" style="color:#4a6a8a"><b>Araştırma:</b> ${U.esc(def.lore)}</div>` : '<div class="small-t muted">Bu eser henüz araştırılmadı. Defne\'ye araştırtırsan hikâyesini öğrenebilirsin.</div>'}
          <div class="small-t muted">Bağışlayan: ${U.esc(AK.state.player.name)}</div>`;
      } else {
        const hall = this.hallOf(def);
        body.innerHTML = `<div class="row"><img src="${AK.Icons.url(AK.Icons.silhouette(def))}" style="width:5rem;height:5rem;opacity:.6">
          <div><b>Boş Vitrin</b><div class="muted">${def.cat}</div></div></div>
          <div>Bu vitrin bir eser bekliyor. ${AK.state.found[def.id] ? `Bu eseri daha önce buldun: <b>${U.esc(def.name)}</b>.` : `İpucu: ${AK.Artifacts.REGIONS[def.region]} bölgesinde, <span style="color:${AK.Artifacts.rarityCol(def.rar)}">${AK.Artifacts.rarityName(def.rar)}</span> bir eser.`}</div>
          ${hall && this.count() < hall.need ? `<div class="small-t muted">${hall.name} ${hall.need} bağışta açılacak.</div>` : ''}`;
      }
      UI.panel({ title: 'Müze Vitrini', body, width: '26rem', foot: [UI.btn('Tamam', () => UI.closeTop())] });
    },
  };
})();
