// Kasaba hizmetleri: demirci, genel mağaza, restoran, kütüphane, otobüs, ilan panosu, hediyelik eşya standı.
(function () {
  const U = AK.U, esc = U.esc;
  const UI = () => AK.UI;
  const UPG = {
    shovel: [null, null, { cost: 600, mats: { tas: 10, metal: 3 } }, { cost: 2500, mats: { tas: 20, metal: 8, kuvars: 3 } }, { cost: 8000, mats: { altin: 4, ametist: 4 } }],
    pickaxe: [null, null, { cost: 500, mats: { tas: 12, metal: 3 } }, { cost: 2000, mats: { metal: 6, kuvars: 4 } }, { cost: 7000, mats: { altin: 3, ametist: 5 } }],
    hammer: [null, null, { cost: 1500, mats: { tas: 15, metal: 6, kuvars: 3 } }, { cost: 4000, mats: { metal: 10, ametist: 4 } }, { cost: 9000, mats: { altin: 5, ametist: 6 } }],
    brush: [null, null, { cost: 400, mats: { kemik: 5 } }, { cost: 1500, mats: { kuvars: 3, kemik: 8 } }, { cost: 5000, mats: { altin: 2, ametist: 3 } }],
    detector: [null, null, { cost: 2500, mats: { metal: 8, kuvars: 4 } }, { cost: 6000, mats: { altin: 3, ametist: 3 } }, null],
  };
  const UPG_INFO = {
    shovel: ['', '', 'Kazı işaretleri tek vuruşta, daha az enerji.', 'Sert toprağı kazabilir! Daha nadir eserler.', 'Antik katmanlar: en yüksek nadirlik şansı.'],
    pickaxe: ['', '', 'Mağara girişindeki kayaları kırar. Daha hızlı.', 'Kayalar tek vuruşta, daha çok taş.', 'Ustaca kazı, en az enerji.'],
    hammer: ['', '', 'Granit kayaları ve mühürlü kapıları kırar.', 'Kalın kumtaşı duvarları yıkar.', 'Her kaya tek vuruşta.'],
    brush: ['', '', 'Temizlikte daha geniş fırça, fosiller daha hızlı.', 'Çok daha hızlı temizlik.', 'Ustaca temizlik: neredeyse hiç hasar riski yok.'],
    detector: ['', '', 'Daha geniş sinyal menzili.', 'En geniş menzil.', ''],
  };
  const FURN = [
    { k: 'vitrin2', name: 'İkinci Vitrin', price: 600, desc: '3 eser daha sergile.' },
    { k: 'vitrin3', name: 'Üçüncü Vitrin', price: 900, desc: '3 eser daha sergile.' },
    { k: 'calisma', name: 'Çalışma Masası', price: 800, desc: 'Evde eser temizle (ve setin varsa araştır).' },
    { k: 'kitaplik', name: 'Kitaplık', price: 450, desc: 'İpuçları ve amcanın günlüğü.' },
    { k: 'hali', name: 'Desenli Halı', price: 300, desc: 'Evin sıcacık olsun.' },
    { k: 'lamba', name: 'Abajur', price: 250, desc: 'Geceleri yumuşak bir ışık.' },
    { k: 'bitki', name: 'Saksı Bitkisi', price: 150, desc: 'Biraz yeşillik.' },
  ];
  const MENU = ['cay', 'kahve', 'simit', 'corba', 'menemen', 'borek', 'kofte', 'kebap'];

  const matsHTML = mats => Object.entries(mats).map(([k, n]) => `<span class="${AK.Inv.count(k) >= n ? 'good' : 'bad'}">${n} ${AK.Items.D[k].name} (${AK.Inv.count(k)})</span>`).join(', ');
  const hasMats = mats => Object.entries(mats).every(([k, n]) => AK.Inv.count(k) >= n);
  const buy = (price, fn) => { if (AK.state.player.money < price) { UI().toast('Yeterli paran yok.', 'coin'); AK.Audio.sfx('error'); return false; } AK.Game.addMoney(-price); AK.Audio.sfx('coin'); fn(); return true; };
  const npc = id => AK.NPCs.list.find(n => n.id === id);
  const header = (id, txt) => `<div class="row"><canvas class="sv-port" width="16" height="16" data-npc="${id}" style="width:calc(var(--u)*24px);height:calc(var(--u)*24px);image-rendering:pixelated;background:#d9bf8c;border:2px solid #7a4f2a"></canvas><div class="grow"><b>${esc(AK.NPCs.byId[id].name)}</b><div class="small-t muted">${esc(txt)}</div></div></div>`;
  const paintPorts = el => el.querySelectorAll('canvas.sv-port').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(AK.Chars.portrait(AK.NPCs.byId[c.dataset.npc].look), 0, 0); });
  const talkBtn = id => UI().btn('Konuş', () => { UI().closeAll(); AK.NPCs.talk(npc(id)); });

  const Sv = AK.Services = {
    UPG, FURN,
    open(id) {
      const f = this[id];
      if (f) f.call(this);
    },
    forNpc(n) {
      if (n.id === 'nermin' && n.map === 'museum') return { label: 'Eser bağışla', fn: () => AK.Museum.donatePanel() };
      if (n.id === 'nermin' && AK.Progress.eventToday() === 'festival' && n.map === 'town') return { label: 'Yarışmaya katıl', fn: () => AK.Progress.contest() };
      return null;
    },
    closed(title, msg, extra) {
      const ui = UI();
      const body = ui.el('div', 'col', `<div>${msg}</div>`);
      if (extra) body.appendChild(extra);
      ui.panel({ title, body, width: '26rem', foot: [ui.btn('Tamam', () => ui.closeTop())] });
    },
    insideList(b) {
      const ui = UI();
      const list = AK.NPCs.insideOf(b);
      const wrap = ui.el('div', 'col');
      if (!list.length) return wrap;
      wrap.appendChild(ui.el('div', 'small-t muted', 'İçeridekiler:'));
      const row = ui.el('div', 'row'); row.style.flexWrap = 'wrap';
      list.forEach(n => row.appendChild(ui.btn(n.def.name + ' ile konuş', () => { ui.closeAll(); AK.NPCs.talk(n); }, 'small')));
      wrap.appendChild(row);
      return wrap;
    },
    // ---------------- DEMİRCİ ----------------
    smithy() {
      const ui = UI(), h = AK.Time.min();
      if (!(AK.NPCs.isIn('kaya', 'smithy') && h >= 480 && h < 1020)) {
        this.closed('Demirhane', h >= 1020 || h < 480 ? 'Demirhane kapalı. Kaya 08:00–17:00 arası çalışır.' : 'Kaya şu an burada değil. Biraz sonra tekrar uğra.');
        return;
      }
      const draw = () => {
        const body = ui.el('div', 'col');
        body.innerHTML = header('kaya', 'Aletini getir. Malzemeyi ve parayı koy, gerisini ben hallederim.' + (AK.state.flags.kayaDiscount ? ' (%15 dost indirimi)' : ''));
        const disc = AK.state.flags.kayaDiscount ? 0.85 : 1;
        for (const t of ['shovel', 'pickaxe', 'hammer', 'brush', 'detector']) {
          const lv = AK.state.tools[t];
          if (t === 'detector' && !lv) continue;
          const nx = UPG[t][lv + 1];
          const it = ui.el('div', 'list-item');
          const ic = AK.Icons.url(AK.Icons.tool(t, lv));
          if (!nx) { it.innerHTML = `<img class="ic" src="${ic}"><div class="grow"><b>${AK.Items.toolName(t)}</b><div class="small-t good">En yüksek seviye!</div></div>`; body.appendChild(it); continue; }
          const cost = Math.round(nx.cost * disc);
          const names = ['', 'Paslı', 'Bakır', 'Çelik', 'Antik'];
          it.innerHTML = `<img class="ic" src="${ic}"><div class="grow"><b>${AK.Items.toolName(t)}</b> → <b>${names[lv + 1]}</b> <span class="muted small-t">(Sv.${lv + 1})</span>
            <div class="small-t">${UPG_INFO[t][lv + 1]}</div><div class="small-t"><span class="${AK.state.player.money >= cost ? 'gold' : 'bad'}">${U.fmt(cost)} altın</span> + ${matsHTML(nx.mats)}</div></div>`;
          const b = ui.btn('Geliştir', () => {
            if (!hasMats(nx.mats)) { ui.toast('Malzemen eksik.', 'lock'); return; }
            buy(cost, () => {
              for (const k in nx.mats) AK.Inv.removeId(k, nx.mats[k]);
              AK.state.tools[t] = lv + 1; AK.Inv.touch();
              AK.Audio.sfx('upgrade');
              ui.toast(`${AK.Items.toolName(t)} hazır! "${UPG_INFO[t][lv + 1]}"`, 'star');
              AK.Bus.emit('upgraded', t, lv + 1);
              ui.closeTop(); draw();
            });
          }, 'small');
          b.disabled = AK.state.player.money < cost || !hasMats(nx.mats);
          it.appendChild(b);
          body.appendChild(it);
        }
        if (!AK.state.flags.lantern) {
          const it = ui.el('div', 'list-item');
          it.innerHTML = `<img class="ic" src="${AK.Icons.url(AK.Icons.tool('lantern', 1))}"><div class="grow"><b>Maden Feneri</b><div class="small-t">Karanlıkta iki kat geniş ışık.</div><div class="small-t"><span class="gold">${U.fmt(Math.round(800 * disc))} altın</span> + ${matsHTML({ metal: 5 })}</div></div>`;
          const b = ui.btn('Satın al', () => { if (!hasMats({ metal: 5 })) return ui.toast('Malzemen eksik.', 'lock'); buy(Math.round(800 * disc), () => { AK.Inv.removeId('metal', 5); AK.state.flags.lantern = true; ui.toast('Maden Feneri aldın!', 'star'); ui.closeTop(); draw(); }); }, 'small');
          it.appendChild(b); body.appendChild(it);
        }
        ui.panel({ title: 'Demirhane', body, width: '36rem', foot: [talkBtn('kaya'), ui.btn('Kapat', () => ui.closeTop())] });
        paintPorts(body);
      };
      draw();
    },
    // ---------------- GENEL MAĞAZA ----------------
    store(tab) {
      const ui = UI(), h = AK.Time.min();
      if (!(AK.NPCs.isIn('riza', 'store') && h >= 480 && h < 1080)) {
        this.closed('Genel Mağaza', h >= 1080 || h < 480 ? 'Mağaza kapalı. Rıza Usta 08:00–18:00 arası açık.' : 'Rıza Usta şu an mağazada değil.');
        return;
      }
      const body = ui.el('div', 'col');
      body.innerHTML = header('riza', 'Ne lazımsa bende! Çanta, mobilya, tadilat...');
      const tabs = ui.el('div', 'tabbar'), list = ui.el('div', 'col');
      body.append(tabs, list);
      const show = t => {
        tabs.innerHTML = '';
        [['buy', 'Satın Al'], ['sell', 'Sat'], ['reno', 'Dükkân Tadilatı']].forEach(([k, n]) => { const b = ui.el('div', 'tab' + (k === t ? ' on' : ''), n); b.onclick = () => show(k); tabs.appendChild(b); });
        list.innerHTML = '';
        const row = (icon, title, sub, price, can, fn, label) => {
          const it = ui.el('div', 'list-item');
          it.innerHTML = `<img class="ic" src="${icon}"><div class="grow"><b>${title}</b><div class="small-t">${sub}</div></div><span class="gold">${price}</span>`;
          const b = ui.btn(label || 'Al', fn, 'small'); b.disabled = !can; it.appendChild(b); list.appendChild(it);
        };
        const money = AK.state.player.money;
        if (t === 'buy') {
          const cap = AK.Inv.cap();
          if (cap < 40) { const nc = cap + 10, pr = cap === 20 ? 1000 : 3500; row(AK.Icons.url(AK.Icons.ui('bag')), `Büyük Çanta (${nc} slot)`, 'Daha fazla eşya taşı.', U.fmt(pr), money >= pr, () => buy(pr, () => { AK.state.inv.cap = nc; AK.Inv.touch(); ui.toast(`Çantan büyüdü: ${nc} slot!`, 'bag'); show('buy'); })); }
          if (!AK.state.tools.detector) row(AK.Icons.url(AK.Icons.tool('detector', 1)), 'Dedektör', 'Toprağın altındaki gizli eserlerin sinyalini alır.', '1.200', money >= 1200, () => {
            if (!AK.Inv.canAdd({ id: 'detector' })) return ui.toast('Çantan dolu!', 'bag');
            buy(1200, () => { AK.state.tools.detector = 1; AK.Inv.add({ id: 'detector' }); ui.toast('Dedektör aldın! Elinde tutarken sinyali dinle.', 'star'); show('buy'); });
          });
          for (const f of FURN) {
            if (AK.state.house.furn[f.k]) continue;
            row(AK.Icons.url(AK.Icons.ui('gift')), f.name, f.desc + ' (Evine yerleştirilir)', U.fmt(f.price), money >= f.price, () => buy(f.price, () => { AK.state.house.furn[f.k] = true; ui.toast(`${f.name} evine yerleştirildi!`, 'gift'); show('buy'); }));
          }
          for (const k of ['simit', 'kart']) { const d = AK.Items.D[k]; row(AK.Icons.url(AK.Icons.misc(k)), d.name, d.desc, d.price, money >= d.price, () => { if (!AK.Inv.canAdd({ id: k, n: 1 })) return ui.toast('Çantan dolu!', 'bag'); buy(d.price, () => AK.Inv.add({ id: k, n: 1 })); }); }
        } else if (t === 'sell') {
          const bonus = AK.state.flags.rizaBonus ? 1.2 : 1;
          list.appendChild(ui.el('div', 'small-t muted', `Kaynakları ve kirli eserleri buraya satabilirsin${bonus > 1 ? ' (+%20 dost fiyatı)' : ''}. Temiz eserler dükkânında çok daha iyi fiyata satılır!`));
          const idxs = AK.Inv.list(st => { const d = AK.Items.get(st.id); return d && (d.type === 'res' || d.type === 'gift' || (d.type === 'artifact' && !d.noSell)); });
          if (!idxs.length) list.appendChild(ui.el('div', 'muted', 'Satılacak bir şey yok.'));
          idxs.forEach(i => {
            const st = AK.Inv.get(i), d = AK.Items.get(st.id);
            const each = Math.max(1, Math.round((d.type === 'artifact' ? AK.Items.value(st) * (st.d ? 1 : 0.5) : d.value) * (d.type === 'res' ? bonus : 1)));
            const n = st.n || 1;
            row(AK.Icons.url(AK.Icons.forStack(st)), AK.Items.name(st) + (n > 1 ? ` x${n}` : ''), d.type === 'artifact' && !st.d ? 'Hızlı satış (yarı fiyat)' : `Tanesi ${each}`, U.fmt(each * n), true, () => {
              AK.Inv.removeAt(i, n); AK.Game.addMoney(each * n, 'Satış'); AK.Audio.sfx('coin'); show('sell');
            }, 'Sat');
          });
        } else {
          const S = AK.Shop, L = S.s.level, nx = S.LEVELS[L + 1];
          list.appendChild(ui.el('div', null, `Şu anki dükkân: <b>${S.LEVELS[L].name}</b> (${S.LEVELS[L].tables} sergi masası, ${S.LEVELS[L].depo} slot depo)`));
          if (!nx) list.appendChild(ui.el('div', 'good', 'Dükkânın en büyük haline ulaştı!'));
          else {
            list.appendChild(ui.el('div', 'sep'));
            list.appendChild(ui.el('div', null, `<b>Sonraki: ${nx.name}</b><div class="small-t">${nx.tables} sergi masası · ${nx.depo} slot depo · daha çok ve daha zengin müşteri${L + 1 === 4 ? ' · Laboratuvar' : ''}</div>
              <div class="small-t"><span class="${money >= nx.cost ? 'gold' : 'bad'}">${U.fmt(nx.cost)} altın</span> + ${matsHTML(nx.mats)}</div>`));
            const b = ui.btn('Tadilata başla', () => { const r = S.upgrade(); if (r !== true) ui.toast(r, 'lock'); else { ui.closeAll(); AK.World.get('shop').refresh(AK.World.get('shop')); } });
            b.disabled = money < nx.cost || !hasMats(nx.mats);
            list.appendChild(b);
          }
        }
      };
      show(tab || 'buy');
      ui.panel({ title: 'Genel Mağaza', body, width: '34rem', foot: [talkBtn('riza'), ui.btn('Kapat', () => ui.closeTop())] });
      paintPorts(body);
    },
    // ---------------- RESTORAN ----------------
    restaurant() {
      const ui = UI(), h = AK.Time.min();
      if (h < 420 || h >= 1440) { this.closed('Lale\'nin Restoranı', 'Restoran kapalı. (07:00–24:00)'); return; }
      const laleIn = AK.NPCs.isIn('lale', 'restaurant') && h >= 600 && h < 1320;
      const body = ui.el('div', 'col');
      if (!laleIn) {
        body.innerHTML = '<div class="muted">Lale şu an mutfakta değil, sipariş alınmıyor. (Mutfak 10:00–22:00)</div>';
      } else {
        body.innerHTML = header('lale', 'Hoş geldin! Bugün ne yemek istersin?');
        if (AK.state.flags.laleTea && AK.state.flags.teaDay !== AK.Time.abs()) {
          body.appendChild(ui.btn('Bedava çayını al', () => { if (AK.Inv.add({ id: 'cay', n: 1 })) { AK.state.flags.teaDay = AK.Time.abs(); ui.toast('Lale sana bir çay verdi!', 'heart'); ui.closeTop(); } }, 'small green'));
        }
        for (const k of MENU) {
          if (k === 'kofte' && !AK.state.flags.laleRecipe) continue;
          const d = AK.Items.D[k];
          const it = ui.el('div', 'list-item');
          it.innerHTML = `<img class="ic" src="${AK.Icons.url(AK.Icons.misc(k))}"><div class="grow"><b>${d.name}</b> <span class="small-t good">+${d.energy} enerji</span><div class="small-t muted">${d.desc}</div></div><span class="gold">${d.price}</span>`;
          const b = ui.btn('Al', () => { if (!AK.Inv.canAdd({ id: k, n: 1 })) return ui.toast('Çantan dolu!', 'bag'); buy(d.price, () => { AK.Inv.add({ id: k, n: 1 }); }); }, 'small');
          b.disabled = AK.state.player.money < d.price;
          it.appendChild(b);
          body.appendChild(it);
        }
      }
      body.appendChild(this.insideList('restaurant'));
      ui.panel({ title: 'Lale\'nin Restoranı', body, width: '30rem', foot: [ui.btn('Kapat', () => ui.closeTop())] });
      paintPorts(body);
    },
    // ---------------- KÜTÜPHANE ----------------
    library() {
      const ui = UI(), h = AK.Time.min();
      if (h < 480 || h >= 1200) { this.closed('Kütüphane', 'Kütüphane kapalı. (08:00–20:00)'); return; }
      const defIn = AK.NPCs.isIn('defne', 'library');
      const body = ui.el('div', 'col');
      if (defIn) {
        body.innerHTML = header('defne', 'Bir eser getirdiysen araştırabilirim. Araştırma ~1 saat sürer ve eserin değerini %20 artırır.');
      } else body.innerHTML = '<div class="muted">Defne şu an kütüphanede değil. Araştırma için onu beklemelisin. (Genelde 08:30–12:00 ve 14:00–18:00)</div>';
      const foot = [];
      if (defIn) { foot.push(ui.btn('Eser araştır', () => { ui.closeTop(); this.research(false); })); foot.push(talkBtn('defne')); }
      foot.push(ui.btn('Kitaplara göz at', () => AK.Menus.books()));
      foot.push(ui.btn('Kapat', () => ui.closeTop()));
      ui.panel({ title: 'Kütüphane', body, width: '28rem', foot });
      paintPorts(body);
    },
    researchCost(st) { const d = AK.Items.get(st.id); return Math.max(20, Math.round((d.value || 400) * 0.15 * (AK.state.flags.defneDiscount ? 0.5 : 1))); },
    research(self) {
      const ui = UI();
      const ok = s => AK.Items.isArtifact(s) && !s.d && !s.r;
      if (AK.Inv.find(ok) < 0) { ui.toast('Araştırılacak temiz bir eserin yok (kirli eserler önce temizlenmeli).', 'museum'); return; }
      ui.chooseItem({
        title: self ? 'Araştırma (Arkeoloji Seti)' : 'Defne ile Araştırma', note: self ? 'Kendi setinle ücretsiz araştır (2 saat sürer).' : 'Araştırma ücreti eserin değerine göre değişir. (~1 saat)',
        filter: ok,
        onPick: i => {
          const st = AK.Inv.get(i), d = AK.Items.get(st.id), cost = self ? 0 : this.researchCost(st);
          const go = () => {
            st.r = 1;
            AK.state.found[st.id] = Object.assign(AK.state.found[st.id] || { n: 1, day: AK.Time.abs() }, { res: true });
            AK.Inv.touch();
            AK.Time.advance(self ? 120 : 60);
            AK.Audio.sfx('page');
            AK.Bus.emit('researched', st.id);
            const lines = [`${d.name}... bakalım.`, d.lore];
            if (d.tablet) {
              const n = ['tablet_gunes', 'tablet_ay', 'tablet_yildiz'].filter(id => AK.state.found[id] && AK.state.found[id].res).length;
              lines.push(n >= 3 ? 'Üç tablet tamam! Birlikte okuyunca... mağaradaki mühürlü kapıyı anlatıyorlar! Güneş, ay, yıldız — kapı bu sırayla açılıyor!' : `Bu ${n}. tablet. ${3 - n} tane daha olmalı...`);
            }
            if (self) { ui.toast(`Araştırma tamamlandı: ${d.name} (+%20 değer)`, 'museum'); AK.Dialog.open({ name: 'Araştırma Notu', icon: AK.Icons.artifact(d, false), lines: [d.lore] }); }
            else AK.Dialog.open({ name: 'Defne', look: AK.NPCs.byId.defne.look, lines, onEnd: () => AK.NPCs.addFr('defne', 10) });
          };
          if (cost) ui.confirm(`<b>${esc(d.name)}</b> araştırılsın mı? Ücret: <b class="gold">${cost}</b> altın`, () => buy(cost, go), null, 'Araştır', 'Vazgeç');
          else go();
        },
      });
    },
    // ---------------- BELEDİYE: KÜLTÜR VARLIKLARI OFİSİ (YASAL) ----------------
    townhall() {
      const ui = UI(), La = AK.Law;
      const port = id => `<div class="row"><canvas class="sv-port2" width="16" height="16" style="width:calc(var(--u)*24px);height:calc(var(--u)*24px);image-rendering:pixelated;background:#d9bf8c;border:2px solid #7a4f2a"></canvas><div class="grow">${id}</div></div>`;
      const paint = el => el.querySelectorAll('canvas.sv-port2').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(AK.Chars.portrait(La.CLERK), 0, 0); });
      if (!La.officeOpen()) { this.closed('Belediye', 'Belediye binası kapalı. Kültür Varlıkları Ofisi hafta içi 09:00–17:00 arası açık.'); return; }
      const draw = () => {
        const body = ui.el('div', 'col');
        const s = La.s, lv = La.levelInfo();
        body.innerHTML = port(`<b>Memur Selin</b> <span class="small-t muted">— Kültür Varlıkları Ofisi</span><div class="small-t">Bulduğun eserleri devlete resmi ve belgeli olarak satabilirsin. Fiyat sabit ve güvenli; şüphe biriktirmez, aksine azaltır.</div>`) +
          `<div class="small-t">Dürüstlük puanı: <b>${s.honest}</b> ${La.honestBonus() > 1 ? `<span class="good">(Güvenilir Kâşif: +%${Math.round((La.honestBonus() - 1) * 100)})</span>` : '<span class="muted">(5 belgeli satışta +%10 bonus)</span>'} · Şüphe: <b style="color:${lv.col}">${lv.name}</b></div><div class="sep"></div>`;
        const idxs = AK.Inv.list(st => AK.Items.isArtifact(st) && !AK.Items.get(st.id).noSell);
        if (!idxs.length) body.appendChild(ui.el('div', 'muted', 'Satılacak eserin yok.'));
        idxs.forEach(i => {
          const st = AK.Inv.get(i), d = AK.Items.get(st.id), p = La.legalPrice(st);
          const it = ui.el('div', 'list-item');
          it.innerHTML = `<img class="ic" src="${AK.Icons.url(AK.Icons.forStack(st))}"><div class="grow"><b>${esc(AK.Items.name(st))}</b> <span class="small-t" style="color:${AK.Artifacts.rarityCol(d.rar)}">${AK.Artifacts.rarityName(d.rar)}</span>
            <div class="small-t muted">${st.d ? 'Kirli eser: %40 değer' : 'Belgeli satış'}${AK.state.museum.includes(d.id) ? '' : ' · <span class="bad">Müzede yok!</span>'}</div></div><span class="gold">${U.fmt(p)}</span>`;
          it.appendChild(ui.btn('Sat', () => { La.legalSell(i); ui.closeTop(); draw(); }, 'small'));
          body.appendChild(it);
        });
        if (s.sus > 0) {
          const b = ui.btn('Kasaba vakfına bağış yap (250 altın, şüphe -15)', () => buy(250, () => { La.addSus(-15); s.honest++; ui.toast('Bağışın için teşekkürler. Kasabada adın biraz temizlendi.', 'heart'); ui.closeTop(); draw(); }), 'small green');
          body.appendChild(b);
        }
        ui.panel({ title: 'Belediye — Kültür Varlıkları Ofisi', body, width: '34rem', foot: [ui.btn('Kapat', () => ui.closeTop())] });
        paint(body);
      };
      draw();
    },
    // ---------------- LİMAN DEPOSU & GÖLGE (YASA DIŞI) ----------------
    warehouse() {
      if (AK.Law.smugglerHere()) { this.blackmarket(); return; }
      AK.UI.toast('Liman deposunun kapısı zincirli. Balıkçılar, geceleri buralarda kapüşonlu birinin dolaştığını söylüyor...', 'lock');
    },
    blackmarket() {
      const ui = UI(), La = AK.Law, F = AK.state.flags;
      if (!La.smugglerHere()) { ui.toast('Ortalıkta kimse yok. Belki gece...', 'lock'); return; }
      if (!F.metGolge) {
        F.metGolge = true;
        AK.Dialog.open({
          name: 'Gölge', look: La.SMUGGLER,
          lines: ['Psst... Kâşif. Yaklaş, kimse bakmıyor.', 'Müze sana birkaç kuruş verir, Belediye kâğıt doldurtur. Ben ise nakit öderim — hem de çok.', 'Kirli, temiz fark etmez. Soru sormam... ama sen de sorma. Ve jandarmaya yakalanırsan beni tanımıyorsun.'],
          onEnd: () => this.blackmarket(),
        });
        return;
      }
      const draw = () => {
        const s = La.s, lv = La.levelInfo();
        const body = ui.el('div', 'col');
        body.innerHTML = `<div class="row"><canvas class="sv-port3" width="16" height="16" style="width:calc(var(--u)*24px);height:calc(var(--u)*24px);image-rendering:pixelated;background:#2b1d2a;border:2px solid #4a3a5a"></canvas>
          <div class="grow"><b>Gölge</b> <span class="small-t muted">— karaborsa</span><div class="small-t">"Ne getirdin bakalım?"</div></div></div>
          <div class="small-t">Kasabadaki şüphe: <b style="color:${lv.col}">${lv.name}</b> (${s.sus}/100)</div>
          <div class="meter"><div style="width:${s.sus}%;background:${lv.col}"></div></div>
          <div class="small-t bad">Uyarı: Kaçak satış yasa dışıdır. Her satış şüpheyi artırır; devriyeye yakalanabilir ya da sabah müfettiş baskını yiyebilirsin (para cezası + eserlere el konur).</div><div class="sep"></div>`;
        const idxs = AK.Inv.list(st => AK.Items.isArtifact(st) && !AK.Items.get(st.id).noSell);
        if (!idxs.length) body.appendChild(ui.el('div', 'muted', '"Elin boş mu? Vaktimi harcama."'));
        idxs.forEach(i => {
          const st = AK.Inv.get(i), d = AK.Items.get(st.id), p = La.blackPrice(st), [rl, rc] = La.riskLabel(st);
          const it = ui.el('div', 'list-item');
          it.innerHTML = `<img class="ic" src="${AK.Icons.url(AK.Icons.forStack(st))}"><div class="grow"><b>${esc(AK.Items.name(st))}</b> <span class="small-t" style="color:${AK.Artifacts.rarityCol(d.rar)}">${AK.Artifacts.rarityName(d.rar)}</span>
            <div class="small-t">Risk: <span style="color:${rc}">${rl}</span> · Devriye: %${Math.round(La.patrolChance(st) * 100)} · <span class="muted">yasal fiyat ${U.fmt(La.legalPrice(st))}</span></div></div><span class="gold">${U.fmt(p)}</span>`;
          it.appendChild(ui.btn('Sat', () => { ui.closeTop(); La.blackSell(i, () => { if (La.smugglerHere() && !AK.Dialog.isOpen) draw(); }); }, 'small'));
          body.appendChild(it);
        });
        const h = ui.panel({ title: 'Karaborsa', body, width: '36rem', foot: [ui.btn('Uzaklaş', () => ui.closeTop())] });
        h.panel.style.filter = 'saturate(0.7) brightness(0.92)';
        body.querySelectorAll('canvas.sv-port3').forEach(c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(AK.Chars.portrait(La.SMUGGLER), 0, 0); });
      };
      draw();
    },
    // ---------------- POSTANE ----------------
    postane() {
      const ui = UI(), h = AK.Time.min();
      if (h < 540 || h >= 1080) { this.closed('Postane', 'Postane kapalı. (09:00–18:00)'); return; }
      const body = ui.el('div', 'col');
      body.appendChild(ui.el('div', 'small-t muted', 'Mektupların evinin önündeki posta kutusuna gelir. Buradan kasabalılara hediye olarak kartpostal alabilirsin.'));
      const d = AK.Items.D.kart;
      const it = ui.el('div', 'list-item');
      it.innerHTML = `<img class="ic" src="${AK.Icons.url(AK.Icons.misc('kart'))}"><div class="grow"><b>${d.name}</b><div class="small-t muted">${d.desc}</div></div><span class="gold">${d.price}</span>`;
      it.appendChild(ui.btn('Al', () => { if (!AK.Inv.canAdd({ id: 'kart', n: 1 })) return ui.toast('Çantan dolu!', 'bag'); buy(d.price, () => AK.Inv.add({ id: 'kart', n: 1 })); }, 'small'));
      body.appendChild(it);
      ui.panel({ title: 'Postane', body, width: '26rem', foot: [ui.btn('Mektuplarım', () => { ui.closeTop(); AK.Menus.mail(); }), ui.btn('Kapat', () => ui.closeTop())] });
    },
    // ---------------- PANSİYON ----------------
    inn() {
      if (AK.Progress.rep() >= 3) this.closed('Turist Pansiyonu', 'Turistlerin kaldığı şirin bir pansiyon. Kasaba ünlendikçe dolup taşıyor!');
      else AK.UI.toast('Boş ve harap bir ev. Kapısı tahtalarla çakılmış. Kasaba ünlenirse belki biri burayı açar...', 'lock');
    },
    // ---------------- OTOBÜS ----------------
    bus() {
      const ui = UI(), F = AK.state.flags;
      const body = ui.el('div', 'col');
      body.appendChild(ui.el('div', 'small-t muted', 'Otobüs uzak kazı bölgelerine gider. Yolculuk 1 saat sürer, bilet 150 altın.'));
      const dest = (name, sub, open, fn, lock) => {
        const it = ui.el('div', 'list-item');
        it.innerHTML = `<img class="ic" src="${ui.icon(open ? 'bus' : 'lock')}"><div class="grow"><b>${name}</b><div class="small-t ${open ? '' : 'muted'}">${open ? sub : lock}</div></div>`;
        if (open) it.appendChild(ui.btn('Git (150)', fn, 'small'));
        body.appendChild(it);
      };
      dest('Çöl Harabeleri', 'Kum Krallığı\'nın kalıntıları. Nadir altın eserler.', !!F.desertOpen, () => {
        if (!AK.Weather.sitesOpen()) return ui.toast('Kum fırtınası! Bugün sefer yok.', 'storm');
        buy(150, () => { ui.closeAll(); AK.Time.advance(60); AK.World.go('desert', 23, 30, 'up'); });
      }, F.altarTaken ? 'Kilitli: Nermin Hanım\'dan Keşif Ruhsatı al (müzede 12 eser gerekli).' : 'Kilitli: Kayıp Şehir Haritası\'nın ilk parçasını bulmalısın.');
      dest('Donmuş Dağ', '', false, null, 'Kilitli: Haritanın üçüncü parçası gerekli. (Yakında)');
      dest('Volkanik Bölge', '', false, null, 'Kilitli: Haritanın dördüncü parçası gerekli. (Yakında)');
      dest('Kayıp Şehir', '', false, null, '???');
      ui.panel({ title: 'Otobüs Durağı', body, width: '28rem' });
    },
    busBack() {
      const ui = UI();
      ui.confirm('Kasabaya dönmek ister misin? (150 altın, 1 saat)', () => buy(150, () => { AK.Time.advance(60); AK.World.go('town', 5, 23, 'right'); }), null, 'Dön', 'Kal');
    },
    // ---------------- İLAN PANOSU ----------------
    board() {
      const ui = UI(), P = AK.Progress, n = AK.state.museum.length, r = P.rep();
      const nx = P.STAGE_NEED[r + 1];
      const ev = P.eventToday(), ne = P.nextEvent();
      const body = ui.el('div', 'col');
      body.innerHTML = `<div><b>Kasaba durumu:</b> ${P.stageName()} </div>
        <div class="meter"><div style="width:${nx ? Math.round((n - P.STAGE_NEED[r]) / (nx - P.STAGE_NEED[r]) * 100) : 100}%;background:#f2c14e"></div></div>
        <div class="small-t muted">${nx ? `Bir sonraki gelişim için müzede ${nx} eser gerekli (şu an ${n}).` : 'Kasaba en parlak dönemini yaşıyor!'}</div>
        <div class="sep"></div>
        ${ev ? `<div><b class="gold">BUGÜN: ${P.EVENTS_BY_ID[ev].name}</b><div class="small-t">${P.EVENTS_BY_ID[ev].desc}</div></div>` : ''}
        ${ne ? `<div><b>Yaklaşan etkinlik:</b> ${P.EVENTS_BY_ID[ne.id].name} — ${AK.Time.SEASONS[ne.s]} ${ne.d} <span class="muted small-t">(${ne.inDays} gün sonra)</span><div class="small-t">${P.EVENTS_BY_ID[ne.id].desc}</div></div>` : ''}
        <div class="sep"></div>
        <div><b>Takvim</b></div>
        ${P.EVENTS.map(e => `<div class="small-t">${AK.Time.SEASONS[e.s]} ${e.d}: ${P.EVENTS_BY_ID[e.id].name}</div>`).join('')}
        <div class="sep"></div>
        <div class="small-t muted">Duyuru: "Müzeye yapılan her bağış kasabamızı biraz daha güzelleştiriyor. — Belediye"</div>`;
      ui.panel({ title: 'İlan Panosu', body, width: '30rem', foot: [ui.btn('Tamam', () => ui.closeTop())] });
    },
    souvenir() {
      const ui = UI();
      const body = ui.el('div', 'col');
      body.appendChild(ui.el('div', 'small-t muted', 'Turistler için hediyelik eşyalar. Kasabalılar da hediye almayı sever!'));
      for (const k of ['kart', 'replika', 'figur']) {
        const d = AK.Items.D[k];
        const it = ui.el('div', 'list-item');
        it.innerHTML = `<img class="ic" src="${AK.Icons.url(AK.Icons.misc(k))}"><div class="grow"><b>${d.name}</b><div class="small-t muted">${d.desc}</div></div><span class="gold">${d.price}</span>`;
        it.appendChild(ui.btn('Al', () => { if (!AK.Inv.canAdd({ id: k, n: 1 })) return ui.toast('Çantan dolu!', 'bag'); buy(d.price, () => AK.Inv.add({ id: k, n: 1 })); }, 'small'));
        body.appendChild(it);
      }
      ui.panel({ title: 'Hediyelik Eşya Standı', body, width: '26rem' });
    },
  };
})();
