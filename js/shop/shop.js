// Arkeoloji dükkânı: sergi masaları, fiyatlandırma, satış, siparişler, dükkân seviyeleri.
(function () {
  const U = AK.U;
  const PRICES = [{ pm: 0.8, name: 'Ucuz (%80)' }, { pm: 1, name: 'Normal (%100)' }, { pm: 1.3, name: 'Yüksek (%130)' }, { pm: 1.6, name: 'Çok Yüksek (%160)' }];
  const LEVELS = [
    null,
    { name: 'Küçük Eski Dükkân', tables: 2, depo: 12, rate: 2.2 },
    { name: 'Arkeoloji Dükkânı', tables: 6, depo: 24, rate: 3.6, cost: 2500, mats: { tas: 30, kil: 15 } },
    { name: 'Arkeoloji Galerisi', tables: 9, depo: 36, rate: 5, cost: 7500, mats: { tas: 50, kuvars: 8, metal: 10 } },
    { name: 'Büyük Arkeoloji Merkezi', tables: 11, depo: 48, rate: 6.5, cost: 20000, mats: { tas: 80, ametist: 6, altin: 4 } },
  ];

  const Shop = AK.Shop = {
    PRICES, LEVELS,
    get s() { return AK.state.shop; },
    level() { return this.s.level; },
    info() { return LEVELS[this.s.level]; },
    isOpenNow() { const m = AK.Time.min(); return this.s.open && m >= 540 && m < 1080; },
    stocked() { const out = []; const n = LEVELS[this.s.level].tables; for (let i = 0; i < n; i++) if (this.s.tables[i]) out.push(i); return out; },
    // ---------------- sergi masası ----------------
    tableMenu(idx) {
      const t = this.s.tables[idx];
      const UI = AK.UI;
      if (!t) {
        const ok = s => AK.Items.isArtifact(s) && !s.d && !AK.Items.get(s.id).noSell;
        if (AK.Inv.find(ok) < 0) {
          const dirty = AK.Inv.find(s => AK.Items.isArtifact(s) && s.d) >= 0;
          UI.toast(dirty ? 'Kirli eserler sergilenemez. Önce temizleme masasında temizle!' : 'Sergilenecek temiz bir eserin yok.', 'shop');
          return;
        }
        UI.chooseItem({
          title: 'Sergi Masası', note: 'Satmak için temiz bir eser seç. Müşteriler fiyatı ve kendi zevklerini göz önüne alır.',
          filter: ok,
          onPick: i => this.pricePick(AK.Inv.get(i), pm => {
            const st = AK.Inv.removeAt(i, 1);
            this.s.tables[idx] = { item: st, pm };
            AK.Audio.sfx('pickup');
            AK.UI.toast(`${AK.Items.name(st)} sergiye kondu: ${this.price(st, pm)} altın`, 'shop');
            AK.Bus.emit('displayed', st);
          }),
        });
        return;
      }
      const st = t.item, def = AK.Items.get(st.id);
      const body = UI.el('div', 'col');
      body.innerHTML = `<div class="row"><img class="ic" src="${AK.Icons.url(AK.Icons.forStack(st))}" style="width:4rem;height:4rem">
        <div><b>${U.esc(AK.Items.name(st))}</b><div class="small-t" style="color:${AK.Artifacts.rarityCol(def.rar)}">${AK.Artifacts.rarityName(def.rar)}</div>
        <div>Etiket: <b class="gold">${this.price(st, t.pm)}</b> altın <span class="muted small-t">(${PRICES.find(p => p.pm === t.pm).name})</span></div></div></div>
        <div class="small-t muted">${this.isOpenNow() ? 'Dükkân açık — müşteriler bu masaya bakacak.' : 'Dükkân şu an kapalı (Açık: 09:00–18:00).'}</div>`;
      UI.panel({
        title: 'Sergi Masası', body, width: '24rem',
        foot: [
          UI.btn('Fiyatı değiştir', () => { UI.closeTop(); this.pricePick(st, pm => { t.pm = pm; }); }),
          UI.btn('Geri al', () => { if (!AK.Inv.canAdd(st)) { UI.toast('Çantan dolu!', 'bag'); return; } AK.Inv.add(st); this.s.tables[idx] = null; UI.closeTop(); }),
          UI.btn('Kapat', () => UI.closeTop()),
        ],
      });
    },
    pricePick(st, cb) {
      const UI = AK.UI, body = UI.el('div', 'col');
      body.innerHTML = `<div>${U.esc(AK.Items.name(st))} için fiyat etiketi seç. Taban değer: <b class="gold">${AK.Items.value(st)}</b></div>
        <div class="small-t muted">Ucuz fiyat hızlı satar. Yüksek fiyatı sadece koleksiyoncular ve zenginler öder.</div>`;
      const btns = PRICES.map(p => UI.btn(`${p.name}: ${this.price(st, p.pm)}`, () => { UI.closeTop(); cb(p.pm); }));
      const col = UI.el('div', 'col'); btns.forEach(b => col.appendChild(b)); body.appendChild(col);
      UI.panel({ title: 'Fiyat Etiketi', body, width: '22rem' });
    },
    price(st, pm) { return Math.max(1, Math.round(AK.Items.value(st) * pm)); },
    // ---------------- satış ----------------
    sell(idx, buyer) {
      const t = this.s.tables[idx];
      if (!t) return 0;
      const price = Math.round(this.price(t.item, t.pm) * (buyer.payMult || 1) * (AK.state.flags.elifArt ? 1.05 : 1));
      this.s.tables[idx] = null;
      AK.Game.addMoney(price, 'Satış');
      AK.state.stats.sold++;
      AK.state.daylog.sold.push({ name: AK.Items.name(t.item), price, buyer: buyer.name });
      const c = this.s.cust[buyer.name] || (this.s.cust[buyer.name] = { buys: 0, orders: 0, type: buyer.type });
      c.buys++;
      AK.Bus.emit('sold', t.item, price, buyer.type);
      return price;
    },
    // dükkânda değilken: arka planda satış simülasyonu
    offsiteTick() {
      if (!this.isOpenNow()) return;
      if (AK.World.cur && AK.World.cur.id === 'shop') return;
      const rate = this.rate() * 0.6;
      if (Math.random() > rate / 6) return;
      const st = this.stocked();
      if (!st.length) return;
      const buyer = AK.Customers.makeBuyer();
      const idx = U.pick(st);
      const t = this.s.tables[idx];
      if (Math.random() < AK.Customers.buyChance(buyer, t.item, t.pm)) {
        const name = AK.Items.name(t.item);
        const p = this.sell(idx, buyer);
        AK.UI.toast(`Dükkân: ${buyer.name}, "${name}" satın aldı (+${p})`, 'shop');
        AK.Audio.sfx('coin');
      }
      if (buyer.named && Math.random() < 0.15) this.maybeOrder(buyer);
    },
    rate() {
      const rep = AK.Progress.rep();
      return LEVELS[this.s.level].rate * (1 + 0.12 * rep) * AK.Weather.customerMod() * (AK.Progress.eventToday() ? 1.4 : 1);
    },
    // ---------------- siparişler ----------------
    maybeOrder(buyer) {
      if (this.s.orders.length >= 3 || this.s.orderDay === AK.Time.abs()) return null;
      const o = this.genOrder(buyer);
      if (!o) return null;
      this.s.orders.push(o);
      this.s.orderDay = AK.Time.abs();
      AK.UI.toast(`Yeni sipariş: ${o.from} — ${o.text}`, 'quest');
      return o;
    },
    genOrder(buyer) {
      const A = AK.Artifacts, F = AK.state.flags;
      const regions = ['orman'].concat(F.caveOpen ? ['magara'] : []).concat(F.desertOpen ? ['col'] : []);
      const reg = U.pick(regions);
      const pool = A.LIST.filter(a => a.region === reg && !a.fixed && !a.spotOnly && a.rar <= 2 && (!a.seasons || a.seasons.includes(AK.Time.season())));
      const r = Math.random();
      const days = U.ri(3, 5);
      const base = { id: 'o' + Date.now().toString(36) + U.ri(0, 999), from: buyer.name, type: buyer.type, until: AK.Time.abs() + days };
      if (r < 0.45 && pool.length) {
        const a = buyer.type === 'akademisyen' ? (pool.find(x => x.cat === 'Yazıt & Mühür' || x.cat === 'Araç & Silah') || U.pick(pool)) : U.pick(pool);
        return Object.assign(base, { kind: 'item', target: a.id, text: `"${a.name}" arıyorum. Temiz olsun lütfen.`, reward: Math.round(a.value * 1.9 + 40) });
      }
      if (r < 0.75) {
        const cats = [...new Set(pool.map(a => a.cat))];
        const cat = U.pick(cats);
        const avg = pool.filter(a => a.cat === cat).reduce((s, a) => s + a.value, 0) / Math.max(1, pool.filter(a => a.cat === cat).length);
        return Object.assign(base, { kind: 'cat', target: cat, region: reg, text: `${({ orman: "Eski Orman'dan", magara: "Küçük Mağara'dan", col: "Çöl Harabeleri'nden" })[reg]} bir "${cat}" eseri istiyorum.`, reward: Math.round(Math.max(120, avg * 1.7)) });
      }
      if (r < 0.88) {
        return Object.assign(base, { kind: 'rar', target: 2, text: 'Nadir (RARE) ya da daha değerli herhangi bir eser.', reward: 520 });
      }
      const res = U.pick(reg === 'magara' ? ['kuvars', 'ametist'] : reg === 'col' ? ['altin', 'metal'] : ['kil', 'comlek', 'kemik', 'metal']);
      const n = res === 'ametist' || res === 'altin' ? 2 : U.ri(4, 8);
      return Object.assign(base, { kind: 'res', target: res, n, text: `${n} adet ${AK.Items.D[res].name} lazım.`, reward: Math.round(AK.Items.D[res].value * n * 2.6 + 30) });
    },
    orderMatch(o, st) {
      if (!st) return false;
      const d = AK.Items.get(st.id);
      if (o.kind === 'res') return st.id === o.target;
      if (!d || d.type !== 'artifact' || st.d || d.noSell) return false;
      if (o.kind === 'item') return st.id === o.target;
      if (o.kind === 'cat') return d.cat === o.target && d.region === o.region;
      if (o.kind === 'rar') return d.rar >= o.target;
      return false;
    },
    canFill(o) { return o.kind === 'res' ? AK.Inv.count(o.target) >= o.n : AK.Inv.find(s => this.orderMatch(o, s)) >= 0; },
    fill(o, invIdx) {
      if (o.kind === 'res') { if (!AK.Inv.removeId(o.target, o.n)) return; }
      else AK.Inv.removeAt(invIdx, 1);
      this.s.orders = this.s.orders.filter(x => x !== o);
      AK.Game.addMoney(o.reward, 'Sipariş');
      AK.Audio.sfx('coin');
      AK.state.stats.orders = (AK.state.stats.orders || 0) + 1;
      const c = this.s.cust[o.from] || (this.s.cust[o.from] = { buys: 0, orders: 0, type: o.type });
      c.orders++;
      AK.UI.toast(`Sipariş teslim edildi: ${o.from} (+${U.fmt(o.reward)} altın)`, 'coin');
      if (c.orders === 3) AK.Customers.loyaltyReward(o.from);
      AK.Bus.emit('orderDone', o);
    },
    newDay() {
      const today = AK.Time.abs();
      const exp = this.s.orders.filter(o => o.until < today);
      if (exp.length) AK.UI.toast(`${exp.length} siparişin süresi doldu.`, 'quest');
      this.s.orders = this.s.orders.filter(o => o.until >= today);
      if (this.s.orders.length < 2 && AK.Quests.isDone('s_karar') && Math.random() < 0.6) {
        const b = AK.Customers.makeBuyer(true);
        const o = this.genOrder(b);
        if (o) { this.s.orders.push(o); this.s.orderDay = today; }
      }
    },
    upgrade() {
      const nx = LEVELS[this.s.level + 1];
      if (!nx) return false;
      if (AK.state.player.money < nx.cost) return 'Yeterli paran yok.';
      for (const k in nx.mats) if (AK.Inv.count(k) < nx.mats[k]) return `Yeterli malzeme yok: ${AK.Items.D[k].name}`;
      AK.Game.addMoney(-nx.cost);
      for (const k in nx.mats) AK.Inv.removeId(k, nx.mats[k]);
      this.s.level++;
      this.s.store.length = Math.max(this.s.store.length, nx.depo);
      AK.Audio.sfx('upgrade');
      AK.UI.toast(`Dükkânın büyüdü: ${nx.name}! Artık ${nx.tables} sergi masan var.`, 'shop');
      AK.Bus.emit('shopUpgrade', this.s.level);
      return true;
    },
  };
})();
