// Menüler: envanter, görev defteri, koleksiyon, depo/sandık, posta, radyo, vitrin, siparişler, tezgâh, gün özeti, duraklat.
(function () {
  const U = AK.U;
  const UI = () => AK.UI;
  const esc = U.esc;

  const Mn = AK.Menus = {
    // ---------------- ENVANTER ----------------
    inventory() {
      const ui = UI();
      const body = ui.el('div', 'row');
      body.style.alignItems = 'flex-start';
      const left = ui.el('div', 'col');
      let pick = -1;
      const grid = ui.el('div', 'grid');
      grid.style.width = 'calc(var(--u) * 23px * 10)';
      const draw = () => {
        grid.innerHTML = '';
        for (let i = 0; i < 40; i++) {
          const locked = i >= AK.Inv.cap();
          grid.appendChild(ui.slot(locked ? null : AK.Inv.get(i), {
            sel: i === pick || (pick < 0 && i === AK.state.inv.sel), locked, key: i < 10 ? (i + 1) % 10 : null,
            onClick: locked ? null : () => {
              if (pick < 0) { if (AK.Inv.get(i)) { pick = i; } else if (i < 10) AK.Inv.select(i); }
              else { if (pick !== i) AK.Inv.swap(pick, i); pick = -1; }
              draw(); info();
            },
          }));
        }
      };
      const hint = ui.el('div', 'small-t muted', 'Bir eşyaya tıkla, sonra başka bir slota tıklayarak yerini değiştir. İlk 10 slot hızlı erişim çubuğudur.');
      left.append(grid, hint);
      const right = ui.el('div', 'col');
      right.style.width = '15rem';
      const info = () => {
        const p = AK.state.player, T = AK.state.tools;
        const tl = ['shovel', 'pickaxe', 'hammer', 'brush'].concat(T.detector ? ['detector'] : []).map(t => `<div class="row"><img class="ic" src="${AK.Icons.url(AK.Icons.tool(t, T[t]))}"> ${AK.Items.toolName(t)} <span class="muted small-t">Sv.${T[t]}</span></div>`).join('');
        right.innerHTML = `<div><b style="font-size:1.2rem">${esc(p.name)}</b></div>
          <div class="small-t muted">${AK.Progress.stageName()} · Gün ${AK.state.stats.days}</div>
          <div>Para: <b class="gold">${U.fmt(p.money)}</b></div>
          <div>Enerji: ${Math.floor(p.energy)}/${p.maxEnergy}</div>
          <div>Çanta: ${AK.Inv.cap()} slot</div>
          <div class="sep"></div>${tl}
          ${AK.state.flags.kit ? '<div class="row small-t"><img class="ic" src="' + AK.Icons.url(AK.Icons.misc('kit')) + '"> Arkeoloji Seti</div>' : ''}
          ${AK.state.flags.lantern ? '<div class="small-t">Maden Feneri</div>' : ''}`;
        const st = pick >= 0 ? AK.Inv.get(pick) : null, d = st && AK.Items.get(st.id);
        if (st && d && (d.type === 'res' || d.type === 'food' || d.type === 'gift')) {
          right.appendChild(ui.btn('Çöpe at', () => ui.confirm(`${esc(AK.Items.name(st))} (x${st.n || 1}) atılsın mı?`, () => { AK.Inv.removeAt(pick, st.n || 1); pick = -1; draw(); info(); }), 'small'));
        }
      };
      draw(); info();
      body.append(left, right);
      ui.panel({ title: 'Çanta', body, width: 'auto' });
    },
    // ---------------- GÖREV DEFTERİ ----------------
    journal(tab) {
      const ui = UI();
      const body = ui.el('div', 'col');
      const tabs = ui.el('div', 'tabbar'), list = ui.el('div', 'col');
      const show = t => {
        tabs.innerHTML = '';
        [['q', 'Görevler'], ['o', `Siparişler (${AK.state.shop.orders.length})`], ['d', 'Tamamlanan']].forEach(([k, n]) => {
          const b = ui.el('div', 'tab' + (k === t ? ' on' : ''), n); b.onclick = () => show(k); tabs.appendChild(b);
        });
        list.innerHTML = '';
        if (t === 'q') {
          const act = AK.state.quests.active.slice().sort((a, b) => (AK.Quests.DEFS[b.id].story ? 1 : 0) - (AK.Quests.DEFS[a.id].story ? 1 : 0));
          if (!act.length) list.appendChild(ui.el('div', 'muted', 'Aktif görev yok. Kasabayı dolaş, insanlarla konuş!'));
          for (const q of act) {
            const d = AK.Quests.DEFS[q.id];
            const giver = AK.NPCs.byId[d.giver];
            const it = ui.el('div', 'list-item');
            it.innerHTML = `<img class="ic" src="${ui.icon(d.story ? 'star' : 'quest')}"><div class="grow"><b>${esc(d.title)}</b> ${d.story ? '<span class="badge gold">HİKÂYE</span>' : ''}<div class="small-t muted">${giver ? esc(giver.name) + ' · ' : ''}${esc(d.desc)}</div>
              ${d.obj.map((o, k) => `<div class="small-t ${AK.Quests.objDone(q, k) ? 'good' : ''}">${AK.Quests.objDone(q, k) ? '✓' : '•'} ${esc(AK.Quests.objText(q, k))}</div>`).join('')}
              ${d.reward && d.reward.money ? `<div class="small-t gold">Ödül: ${U.fmt(d.reward.money)} altın</div>` : ''}</div>`;
            list.appendChild(it);
          }
        } else if (t === 'o') {
          Mn.orderList(list);
        } else {
          const done = AK.state.quests.done;
          if (!done.length) list.appendChild(ui.el('div', 'muted', 'Henüz tamamlanan görev yok.'));
          done.slice().reverse().forEach(id => list.appendChild(ui.el('div', 'list-item small-t', `<span class="good">✓</span> ${esc(AK.Quests.DEFS[id].title)}`)));
          list.appendChild(ui.el('div', 'small-t muted', `Toplam: ${done.length} görev · ${AK.state.stats.orders || 0} sipariş`));
        }
      };
      body.append(tabs, list);
      show(tab || 'q');
      ui.panel({ title: 'Görev Defteri', body, width: '34rem' });
    },
    orderList(list, canDeliver) {
      const ui = UI(), S = AK.Shop;
      const os = AK.state.shop.orders;
      if (!os.length) { list.appendChild(ui.el('div', 'muted', 'Panoda sipariş yok. Müşteriler zaman zaman sipariş bırakır.')); return; }
      for (const o of os) {
        const left = o.until - AK.Time.abs();
        const it = ui.el('div', 'list-item');
        let ic = o.kind === 'item' ? AK.Icons.artifact(AK.Artifacts.get(o.target), false) : o.kind === 'res' ? AK.Icons.misc(o.target) : AK.Icons.ui('quest');
        it.innerHTML = `<img class="ic" src="${AK.Icons.url(ic)}"><div class="grow"><b>${esc(o.from)}</b><div class="small-t">${esc(o.text)}</div><div class="small-t muted">Ödül: <span class="gold">${U.fmt(o.reward)}</span> · ${left <= 0 ? 'Bugün son gün!' : left + ' gün kaldı'}</div></div>`;
        if (canDeliver) {
          const b = ui.btn('Teslim et', () => {
            if (o.kind === 'res') { S.fill(o); ui.closeTop(); return; }
            ui.closeTop();
            ui.chooseItem({ title: 'Sipariş: ' + o.from, note: o.text, filter: st => S.orderMatch(o, st), onPick: i => S.fill(o, i) });
          }, 'small');
          b.disabled = !S.canFill(o);
          it.appendChild(b);
        }
        list.appendChild(it);
      }
    },
    orders() {
      const ui = UI(), body = ui.el('div', 'col');
      body.appendChild(ui.el('div', 'small-t muted', 'Müşterilerin özel istekleri. Siparişleri tamamlamak iyi para ve sadık müşteri kazandırır.'));
      const list = ui.el('div', 'col'); body.appendChild(list);
      this.orderList(list, true);
      ui.panel({ title: 'Sipariş Panosu', body, width: '32rem' });
    },
    // ---------------- KOLEKSİYON ----------------
    collection() {
      const ui = UI(), A = AK.Artifacts;
      const body = ui.el('div', 'row'); body.style.alignItems = 'flex-start';
      const left = ui.el('div', 'col coll-grid'), right = ui.el('div', 'col');
      right.style.width = '17rem';
      const found = Object.keys(AK.state.found).length;
      left.appendChild(ui.el('div', 'small-t', `Bulunan: <b>${found}/${A.LIST.length}</b> · Müzede: <b>${AK.state.museum.length}/${A.LIST.length}</b>`));
      const detail = def => {
        const f = AK.state.found[def.id];
        if (!f) { right.innerHTML = `<div class="row"><img src="${AK.Icons.url(AK.Icons.silhouette(def))}" style="width:4rem;height:4rem"><div><b>???</b><div class="small-t muted">${def.cat}</div></div></div><div class="small-t">Henüz bulunmadı.</div><div class="small-t muted">İpucu: ${A.REGIONS[def.region]} · <span style="color:${A.rarityCol(def.rar)}">${A.rarityName(def.rar)}</span>${def.seasons ? ' · Sadece ' + def.seasons.map(s => AK.Time.SEASONS[s]).join(', ') : ''}${def.spotOnly ? ' · Karlı günlerde' : ''}</div>`; return; }
        right.innerHTML = `<div class="row"><img src="${AK.Icons.url(AK.Icons.artifact(def, false))}" style="width:4rem;height:4rem"><div><b>${esc(def.name)}</b><div class="small-t" style="color:${A.rarityCol(def.rar)}">${A.rarityName(def.rar)} · ${A.RARITY[def.rar].tr}</div></div></div>
          <div class="small-t muted">${def.cat} · ${A.REGIONS[def.region]}<br>Dönem: ${def.era}</div>
          <div class="small-t">${esc(def.desc)}</div>
          ${f.res ? `<div class="small-t" style="color:#3a5a8a"><b>Araştırma:</b> ${esc(def.lore)}</div>` : '<div class="small-t muted">Araştırılmadı — kütüphanede Defne\'ye araştırt.</div>'}
          <div class="small-t">Taban değer: <span class="gold">${def.noSell ? 'Paha biçilemez' : def.value + ' altın'}</span></div>
          <div class="small-t">Bulunma: ${f.n} kez · ${AK.state.museum.includes(def.id) ? '<span class="good">Müzede ✓</span>' : '<span class="bad">Müzede yok</span>'}</div>`;
      };
      for (const cat of A.CATS) {
        left.appendChild(ui.el('div', 'cat-title', cat));
        const g = ui.el('div', 'grid');
        A.LIST.filter(a => a.cat === cat).forEach(def => {
          const f = AK.state.found[def.id];
          const s = ui.slot(null, { onClick: () => detail(def) });
          const img = document.createElement('img');
          img.src = AK.Icons.url(f ? AK.Icons.artifact(def, false) : AK.Icons.silhouette(def));
          s.appendChild(img);
          if (AK.state.museum.includes(def.id)) { const m = ui.el('span', 'q', '✓'); m.style.color = '#4f9a45'; s.appendChild(m); }
          if (f) s._tip = () => `<div class="tt-name">${esc(def.name)}</div><div class="tt-sub" style="color:${A.rarityCol(def.rar)}">${A.rarityName(def.rar)}</div>`;
          g.appendChild(s);
        });
        left.appendChild(g);
      }
      right.innerHTML = '<div class="muted">Ayrıntı için bir esere tıkla.</div>';
      body.append(left, right);
      ui.panel({ title: 'Keşif Defteri', body, width: '46rem' });
    },
    // ---------------- DEPO / SANDIK / NAKLİYE ----------------
    storage(kind, ship) {
      const ui = UI();
      const S = AK.state;
      const box = kind === 'house' ? S.house.chest : S.shop.store;
      const cap = kind === 'house' ? 24 : AK.Shop.LEVELS[S.shop.level].depo;
      while (box.length < cap) box.push(null);
      const body = ui.el('div', 'col');
      body.appendChild(ui.el('div', 'small-t muted', ship ? 'Eşyaya tıkla: dükkân deposuna gönderilir (geri almak için dükkândaki depoyu kullan).' : 'Eşyaya tıkla: diğer tarafa taşınır.'));
      const g1 = ui.el('div', 'grid'), g2 = ui.el('div', 'grid');
      g1.style.width = g2.style.width = 'calc(var(--u) * 23px * 10)';
      const draw = () => {
        g1.innerHTML = ''; g2.innerHTML = '';
        for (let i = 0; i < AK.Inv.cap(); i++) {
          const st = AK.Inv.get(i);
          const ok = st && AK.Items.get(st.id).type !== 'tool';
          g1.appendChild(ui.slot(st, { dim: st && !ok, onClick: ok ? () => {
            const c = Object.assign({}, st);
            if (AK.Inv.addTo(box, cap, c)) AK.state.inv.slots[i] = null;
            else { if (c.n) st.n = c.n; ui.toast('Depo dolu!', 'bag'); }
            AK.Inv.touch(); draw();
          } : null }));
        }
        for (let i = 0; i < cap; i++) {
          const st = box[i];
          g2.appendChild(ui.slot(st, { onClick: st && !ship ? () => { const c = Object.assign({}, st); if (AK.Inv.add(c)) box[i] = null; else { box[i] = c.n ? c : st; ui.toast('Çantan dolu!', 'bag'); } draw(); } : null }));
        }
      };
      body.append(ui.el('b', null, 'Çanta'), g1, ui.el('b', null, ship ? 'Dükkân Deposu' : kind === 'house' ? 'Sandık' : `Depo (${cap} slot)`), g2);
      draw();
      ui.panel({ title: ship ? 'Nakliye Sandığı' : kind === 'house' ? 'Sandık' : 'Dükkân Deposu', body, width: 'auto' });
    },
    ship() { this.storage('shop', true); },
    // ---------------- POSTA ----------------
    mail() {
      const ui = UI(), L = AK.state.mail;
      if (!L.length) { ui.toast('Posta kutusu boş.', 'mail'); return; }
      const body = ui.el('div', 'col');
      L.slice().reverse().forEach(l => {
        const it = ui.el('div', 'list-item');
        it.innerHTML = `<img class="ic" src="${ui.icon('mail')}"><div class="grow"><b>${esc(l.title)}</b> ${l.read ? '' : '<span class="badge bad">YENİ</span>'}<div class="small-t muted">${esc(l.from)}</div></div>`;
        it.appendChild(ui.btn('Oku', () => this.readMail(l), 'small'));
        body.appendChild(it);
      });
      ui.panel({ title: 'Posta Kutusu', body, width: '28rem' });
    },
    readMail(l) {
      const ui = UI();
      l.read = true;
      const body = ui.el('div', 'col');
      body.appendChild(ui.el('div', null, esc(AK.Lines.fill(l.text)).replace(/\n/g, '<br>')));
      const foot = [];
      if (l.gift && !l.claimed) foot.push(ui.btn('Hediyeyi al', () => { if (l.gift.item) { if (!AK.Inv.add({ id: l.gift.item, n: l.gift.n || 1 })) { ui.toast('Çantan dolu!', 'bag'); return; } } if (l.gift.money) AK.Game.addMoney(l.gift.money); l.claimed = true; ui.closeTop(); ui.toast('Hediye alındı!', 'gift'); }));
      foot.push(ui.btn('Kapat', () => ui.closeTop()));
      ui.panel({ title: l.title, body, width: '26rem', foot });
      AK.Audio.sfx('page');
    },
    // ---------------- RADYO ----------------
    radio() {
      const W = AK.Weather, P = AK.Progress;
      const t = W.info(W.tomorrow()), ev = P.eventTomorrow(), ne = P.nextEvent();
      AK.Dialog.open({
        name: 'Radyo', icon: AK.Icons.ui(t.icon),
        lines: [`"Günaydın Arkeoloji Kasabası! Yarın için hava durumu: ${t.name}." ${t.tip}`,
          ev ? `"Unutmayın, yarın ${P.EVENTS_BY_ID[ev].name}! ${P.EVENTS_BY_ID[ev].desc}"` : ne ? `"Sıradaki etkinlik: ${P.EVENTS_BY_ID[ne.id].name} — ${AK.Time.SEASONS[ne.s]} ${ne.d} (${ne.inDays} gün sonra)."` : '"Müzik zamanı!"'],
      });
    },
    books() {
      const ui = UI();
      const body = ui.el('div', 'col');
      const pages = [
        ['Kazının Temelleri', 'Kazı işaretleri (titreyen çubuklar) her zaman bir eser verir. Düz kazı toprağını kazmak da bazen kil, çömlek kırığı ya da şanslıysan bir eser çıkarır. Taşları kazmayla, büyük kayaları çekiçle kır. Fosil katmanlarını yalnızca fırçayla çıkarabilirsin.'],
        ['Nadirlik Rehberi', 'COMMON (gri) < UNCOMMON (yeşil) < RARE (mavi) < EPIC (mor) < LEGENDARY (turuncu). Sert toprak, dedektörle bulunan gizli noktalar, karda beliren kalıntılar ve sisli günlerdeki taş çember daha nadir eserler verir.'],
        ['Temizlik Sanatı', 'Fırça yumuşak kiri alır ama koyu kabukta yavaştır. Keski kabuğu hızla kırar, ancak eserin kendisine vurursan hasar verir. Kırmızı çatlaklar kırılgan bölgelerdir: temizlendikten sonra üzerlerinde fırçayı gezdirme!'],
        ['Hava ve Toprak', 'Yağmur toprağı yumuşatır: kürek daha az yorar ve yeni izler açılır. Fırtınada kazı alanları kapanır. Kar eski kalıntıları açığa çıkarır. Sis ise ormanın güneybatısındaki gizli koruya giden yolu açar.'],
        ['Doğan Arslan\'ın Günlüğü', '"Bu kasabanın altında bir şehir var. Eminim. Orman Krallığı da, Kum Krallığı da ondan söz ediyor. Güneş, ay ve yıldız... Kapının anahtarı bunlarda saklı."'],
      ];
      pages.forEach(([t, x]) => { const it = ui.el('div', 'list-item'); it.innerHTML = `<div class="grow"><b>${t}</b><div class="small-t">${esc(x)}</div></div>`; body.appendChild(it); });
      ui.panel({ title: 'Kitaplık', body, width: '32rem' });
    },
    workbench(lab) {
      const ui = UI();
      const body = ui.el('div', 'col');
      body.appendChild(ui.el('div', 'small-t muted', lab ? 'Laboratuvarda temizlik yaparken fırçan bir seviye daha güçlüdür.' : 'Evindeki çalışma masası.'));
      const foot = [ui.btn('Eser temizle', () => { ui.closeTop(); AK.Cleaning.choose(!lab); })];
      if (AK.state.flags.kit) foot.push(ui.btn('Araştır (Arkeoloji Seti)', () => { ui.closeTop(); AK.Services.research(true); }));
      else body.appendChild(ui.el('div', 'small-t muted', 'Arkeoloji Seti\'n olsaydı burada kendi araştırmanı da yapabilirdin.'));
      foot.push(ui.btn('Kapat', () => ui.closeTop()));
      ui.panel({ title: lab ? 'Laboratuvar' : 'Çalışma Masası', body, width: '24rem', foot });
    },
    // ---------------- EV VİTRİNİ ----------------
    homeDisplay(base) {
      const ui = UI(), D = AK.state.house.disp;
      const body = ui.el('div', 'col');
      body.appendChild(ui.el('div', 'small-t muted', 'Evinde sergilediğin her NADİR (RARE) veya daha değerli eser, sabahları sana +5 ekstra enerji (ilham) verir.'));
      const row = ui.el('div', 'row');
      const draw = () => {
        row.innerHTML = '';
        for (let k = 0; k < 3; k++) {
          const i = base + k, st = D[i];
          row.appendChild(ui.slot(st, {
            onClick: () => {
              if (st) { if (AK.Inv.add(st)) { D[i] = null; draw(); } else ui.toast('Çantan dolu!', 'bag'); return; }
              ui.chooseItem({ title: 'Vitrine koy', filter: s => AK.Items.isArtifact(s) && !s.d, onPick: j => { D[i] = AK.Inv.removeAt(j, 1); AK.Audio.sfx('pickup'); } });
            },
          }));
        }
      };
      draw();
      body.appendChild(row);
      ui.panel({ title: 'Ev Vitrini', body, width: '22rem' });
    },
    // ---------------- TEZGÂH ----------------
    counter() {
      const ui = UI(), S = AK.state.shop, L = AK.Shop.info();
      const body = ui.el('div', 'col');
      const sold = AK.state.daylog.sold;
      const loyal = Object.entries(S.cust).filter(([, c]) => c.buys + c.orders >= 1).sort((a, b) => (b[1].buys + b[1].orders) - (a[1].buys + a[1].orders)).slice(0, 6);
      body.innerHTML = `<div><b>${L.name}</b> <span class="muted small-t">(Seviye ${S.level})</span></div>
        <div>Durum: ${S.open ? '<b class="good">AÇIK</b>' : '<b class="bad">KAPALI</b>'} <span class="small-t muted">· Çalışma saatleri 09:00–18:00</span></div>
        <div class="small-t muted">Sen dükkânda değilken de müşteriler gelir ama daha seyrek. Masalara eser koymayı unutma!</div>
        <div class="sep"></div><b>Bugünkü satışlar</b>
        ${sold.length ? sold.map(s => `<div class="small-t">${esc(s.name)} → ${esc(s.buyer)} <span class="gold">+${s.price}</span></div>`).join('') : '<div class="small-t muted">Henüz satış yok.</div>'}
        <div class="sep"></div><b>Müşteri defteri</b>
        ${loyal.length ? loyal.map(([n, c]) => `<div class="small-t">${esc(n)} — ${c.buys} alışveriş, ${c.orders} sipariş${c.orders >= 3 ? ' <span class="good">(sadık)</span>' : ''}</div>`).join('') : '<div class="small-t muted">Henüz düzenli müşterin yok.</div>'}`;
      ui.panel({ title: 'Tezgâh', body, width: '28rem', foot: [ui.btn(S.open ? 'Dükkânı kapat' : 'Dükkânı aç', () => { S.open = !S.open; ui.closeTop(); ui.toast(S.open ? 'Dükkân açıldı.' : 'Dükkân kapandı.', 'shop'); }), ui.btn('Kapat', () => ui.closeTop())] });
    },
    // ---------------- GÜN ÖZETİ ----------------
    daySummary(cb, passedOut) {
      const ui = UI(), L = AK.state.daylog;
      const body = ui.el('div', 'col');
      const found = L.found.map(id => `<img src="${AK.Icons.url(AK.Icons.artifact(AK.Artifacts.get(id), false))}" class="icon-inline" style="width:calc(var(--u)*16px);height:calc(var(--u)*16px)" title="${esc(AK.Artifacts.get(id).name)}">`).join('');
      const tomorrow = AK.Weather.info(AK.Weather.tomorrow());
      body.innerHTML = `${passedOut ? '<div class="bad">Gece çok geç saatlere kadar dışarıda kaldın ve bayıldın. Biri seni evine taşıdı...</div>' : ''}
        <div><b>Bulunan eserler (${L.found.length})</b></div><div>${found || '<span class="muted small-t">Bugün eser bulunmadı.</span>'}</div>
        <div><b>Temizlenen:</b> ${L.cleaned} · <b>Bağışlanan:</b> ${L.donated.length} · <b>Satılan:</b> ${L.sold.length}</div>
        <div><b>Bugünkü kazanç:</b> <span class="gold">${U.fmt(L.earned)} altın</span></div>
        <div class="sep"></div>
        <div class="row"><img class="ic" src="${ui.icon(tomorrow.icon)}"> <span>Yarın: <b>${tomorrow.name}</b> — <span class="small-t">${tomorrow.tip}</span></span></div>
        <div class="small-t muted">Kasaba: ${AK.Progress.stageName()} · Müze: ${AK.state.museum.length}/${AK.Artifacts.LIST.length}</div>`;
      let done = false;
      const go = () => { if (done) return; done = true; cb(); };
      ui.panel({ title: `Gün Özeti — ${AK.Time.dateStr()}`, body, width: '30rem', noClose: true, modal: true, onClose: go, foot: [ui.btn('Yeni güne başla', () => { ui.closeTop(); go(); })] });
    },
    // ---------------- DURAKLAT ----------------
    pause() {
      const ui = UI();
      const body = ui.el('div', 'col');
      const vol = (label, k) => {
        const r = ui.el('div', 'row');
        r.innerHTML = `<span style="width:5rem">${label}</span>`;
        const inp = document.createElement('input');
        inp.type = 'range'; inp.min = 0; inp.max = 1; inp.step = 0.05; inp.value = AK.state.settings[k];
        inp.style.pointerEvents = 'auto';
        inp.oninput = () => { AK.state.settings[k] = +inp.value; AK.Audio.setVol(k, +inp.value); };
        r.appendChild(inp); return r;
      };
      body.append(vol('Müzik', 'music'), vol('Efektler', 'sfx'));
      body.appendChild(ui.el('div', 'small-t muted', `Oyun her uyuduğunda ve bölge değiştirdiğinde otomatik kaydedilir.`));
      ui.panel({
        title: 'Menü', body, width: '22rem',
        foot: [ui.btn('Devam', () => ui.closeTop()), ui.btn('Kaydet', () => { AK.Save.save(); }), ui.btn('Kontroller', () => this.controls()), ui.btn('Ana menü', () => ui.confirm('Kaydedip ana menüye dönülsün mü?', () => { AK.Save.save(true); location.reload(); }))],
      });
    },
    controls() {
      const ui = UI();
      ui.panel({
        title: 'Kontroller', width: '28rem', body: `<div class="col small-t">
        <div><b>WASD / Ok tuşları</b> — Yürü (Shift: koş)</div>
        <div><b>E / F</b> veya <b>sağ tık</b> — Konuş, etkileşime geç, kapıdan gir</div>
        <div><b>Boşluk / C</b> veya <b>sol tık</b> — Seçili aleti kullan / yemek ye</div>
        <div><b>1–0</b> veya <b>fare tekerleği</b> — Hızlı erişim çubuğundan seç</div>
        <div><b>I / Tab</b> — Çanta · <b>J</b> — Görevler · <b>K</b> — Koleksiyon · <b>Esc</b> — Menü</div>
        <div class="sep"></div>
        <div><b>Oyun döngüsü:</b> Keşfet → Kaz → Eser bul → Temizle → Sat ya da Bağışla → Para kazan → Ekipman/Dükkân geliştir → Yeni bölge aç</div></div>`,
        foot: [ui.btn('Tamam', () => ui.closeTop())],
      });
    },
  };
})();
