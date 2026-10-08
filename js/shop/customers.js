// Müşteriler: tipler, zevkler, dükkân içinde dolaşma, satın alma kararı, sadık müşteriler.
(function () {
  const U = AK.U, W = AK.World;
  const TYPES = {
    turist: {
      name: 'Turist', tol: 1.3, pay: 1.0, hat: 'sunhat',
      pref: (d, st) => (AK.Items.value(st) <= 220 ? 1 : 0.35),
      lines: ['Ne güzel bir dükkân! Hatıra olarak bir şey almak istiyorum.', 'Bunlar gerçekten bu kasabadan mı çıktı?', 'Arkadaşlarıma göstermek için ufak bir şey arıyorum.'],
    },
    koleksiyoncu: {
      name: 'Koleksiyoncu', tol: 1.3, pay: 1.05, hat: 'cap',
      pref: d => (d.rar >= 2 ? 1 : d.rar === 1 ? 0.45 : 0.15),
      lines: ['Nadir parçalar arıyorum. Sıradan şeylerle vaktimi harcamam.', 'Koleksiyonumda eksik olan bir şey var mı acaba...'],
    },
    akademisyen: {
      name: 'Akademisyen', tol: 1.0, pay: 1.0, hat: null,
      pref: (d, st) => (['Yazıt & Mühür', 'Araç & Silah', 'Seramik & Cam', 'Fosil & Doğa'].includes(d.cat) ? 0.95 : 0.3) * (st.r ? 1.35 : 1),
      lines: ['Araştırılmış, belgelenmiş eserler benim için çok değerli.', 'Üniversitemizin koleksiyonu için örnekler topluyorum.'],
    },
    zengin: {
      name: 'Zengin Koleksiyoncu', tol: 1.6, pay: 1.2, hat: 'tophat',
      pref: d => (d.rar >= 3 ? 1 : d.rar === 2 ? 0.5 : 0.08),
      lines: ['Fiyat önemli değil, yeter ki eşsiz olsun.', 'Malikânemin salonuna yakışacak bir parça arıyorum.'],
    },
    gizemli: {
      name: 'Gizemli Müşteri', tol: 1.6, pay: 1.5, hat: null,
      pref: d => (d.cat === 'Gizem' || d.cat === 'Yazıt & Mühür' ? 1 : 0.12),
      lines: ['...Güneş, ay ve yedi yıldız. Onları gördün mü?', 'Bazı kapılar kapalı kalmalı, kâşif. Bazıları ise açılmayı bekler.', 'Toprağın altındaki şehir uyuyor. Ama uykusu hafif...'],
    },
  };
  const NAMED = {
    turist: ['Turist Hiro', 'Turist Elena'], koleksiyoncu: ['Bay Cemal', 'Bayan Ferda'], akademisyen: ['Prof. Selim', 'Dr. Ayla'],
    zengin: ['Madam Aylin', 'Kont Vural'], gizemli: ['Kapüşonlu Yabancı'],
  };
  const LOOKS = {
    'Prof. Selim': { skin: '#e2a878', hair: '#d8d0c8', hairStyle: 'bald', shirt: '#8a6a4a', outfit: 'coat', outfitCol: '#7a5a3a', pants: '#4a3a2a', acc: ['glasses', 'beard'], beardCol: '#d8d0c8' },
    'Dr. Ayla': { skin: '#f2cfae', hair: '#5a3a22', hairStyle: 'bun', shirt: '#e8dcc0', outfit: 'coat', outfitCol: '#3d5a7a', pants: '#3b3550', acc: ['glasses'] },
    'Madam Aylin': { skin: '#f0c39b', hair: '#2a2024', hairStyle: 'long', shirt: '#9b4fd1', outfit: 'dress', outfitCol: '#6a2a8a', pants: '#6a2a8a', hat: 'sunhat', hatCol: '#f2c14e', acc: ['scarf'], scarfCol: '#f2c14e' },
    'Kont Vural': { skin: '#e9b991', hair: '#3b3540', hairStyle: 'short', shirt: '#2a2024', outfit: 'coat', outfitCol: '#3a2a4a', pants: '#2a2024', hat: 'tophat', hatCol: '#2a2024', hatBand: '#a8453a', acc: ['mustache'] },
    'Kapüşonlu Yabancı': { skin: '#c8a080', hair: '#2a2024', hairStyle: 'short', shirt: '#3b3550', outfit: 'robe', outfitCol: '#3b3550', pants: '#2a2024', acc: ['hood'], hatCol: '#2f2a40' },
    'Bay Cemal': { skin: '#d8a070', hair: '#5a5260', hairStyle: 'short', shirt: '#c8b88a', outfit: 'vest', outfitCol: '#7a4f2a', pants: '#5a4a3a', acc: ['mustache'], hat: 'cap', hatCol: '#7a4f2a' },
    'Bayan Ferda': { skin: '#f2cfae', hair: '#a85a2a', hairStyle: 'curly', shirt: '#4f9a45', outfit: 'dress', outfitCol: '#3f7a3a', pants: '#3f7a3a', acc: ['glasses'] },
  };
  function randLook(type, r = Math.random) {
    return {
      skin: U.pick(['#f2cfae', '#e2a878', '#b07a52', '#f0c39b', '#e9b991'], r), hair: U.pick(['#f2d070', '#5a3a22', '#2a2024', '#b8482a', '#9a9298'], r),
      hairStyle: U.pick(['short', 'long', 'ponytail', 'curly', 'spiky'], r), shirt: U.pick(['#e85a7a', '#3d9ae0', '#f2c14e', '#7cc45a', '#ff8a5c', '#c8a0f0'], r),
      pants: U.pick(['#3b5a8a', '#5a4a3a', '#e8dcc0', '#3b3540'], r), hat: TYPES[type].hat, hatCol: U.pick(['#f2e6c8', '#e85a7a', '#3d9ae0', '#c9a26a'], r),
      outfit: type === 'zengin' ? 'coat' : 'shirt', outfitCol: '#6a2a8a',
    };
  }

  const Cu = AK.Customers = {
    TYPES, NAMED, list: [], spawnAcc: 0,
    pickType(offsite) {
      const rep = AK.Progress.rep(), L = AK.state.shop.level, h = AK.Time.hour();
      const epic = Object.keys(AK.state.found).some(id => AK.Artifacts.get(id).rar >= 3);
      const w = {
        turist: 2.5 + rep * 1.4, koleksiyoncu: 2, akademisyen: 1.6,
        zengin: (L >= 2 || rep >= 2) ? 0.6 + L * 0.35 : 0,
        gizemli: (epic || AK.Time.abs() >= 6) && h >= 15 ? (AK.Weather.today() === 'sis' ? 1.2 : 0.35) : 0,
      };
      if (offsite) w.gizemli = 0;
      return U.wpick(Object.keys(w), k => w[k]);
    },
    makeBuyer(named) {
      const type = this.pickType(true);
      const isNamed = named || Math.random() < 0.5;
      const name = isNamed ? U.pick(NAMED[type]) : TYPES[type].name;
      return { type, name, named: isNamed, payMult: TYPES[type].pay };
    },
    buyChance(b, st, pm) {
      const T = TYPES[b.type], d = AK.Items.get(st.id);
      const q = [0.7, 1, 1.1, 1.2][st.q != null ? st.q : 1];
      const pf = pm <= 0.8 ? 1.35 : pm <= 1 ? 1 : pm <= T.tol ? 0.72 : 0.22;
      return U.clamp(T.pref(d, st) * q * pf * 0.8, 0, 0.95);
    },
    // ---------------- dükkân içi ----------------
    update(dt) {
      const S = AK.Shop;
      const inShop = W.cur && W.cur.id === 'shop';
      if (inShop && S.isOpenNow()) {
        const stocked = S.stocked().length;
        const rate = S.rate() * (stocked ? 1 : 0.35);
        // oyun saatine göre: 1 oyun saati = 60 * RATE gerçek saniye
        this.spawnAcc += dt * rate / (60 * AK.Time.RATE);
        if (this.spawnAcc >= 1 || (this.list.length === 0 && this.spawnAcc > 0.5)) { this.spawnAcc = 0; if (this.list.length < 3 + AK.state.shop.level) this.spawn(); }
      }
      if (!inShop && this.list.length) this.list = [];
      for (let i = this.list.length - 1; i >= 0; i--) {
        const c = this.list[i];
        if (c.talking) continue;
        if (c.bubbleT > 0) c.bubbleT -= dt;
        if (c.path.length) { AK.NPCs.move(c, dt, 36); continue; }
        if (c.legs.length) { AK.NPCs.finishLeg(c); continue; }
        c.t -= dt;
        if (c.t > 0) continue;
        this.think(c);
        if (c.gone) this.list.splice(i, 1);
      }
    },
    spawn() {
      const type = this.pickType(false);
      const named = Math.random() < 0.55;
      const name = named ? U.pick(NAMED[type]) : TYPES[type].name;
      if (named && this.list.some(c => c.name === name)) return;
      const look = LOOKS[name] || randLook(type);
      const c = { type, name, named, look, map: 'shop', x: 7 * 16 + 8, y: 10 * 16 + 12, dir: 'up', path: [], legs: [], anim: 0, t: 0.3, state: 'enter', visited: [], isEnt: true, payMult: TYPES[type].pay };
      c.render = (ctx, cx, cy) => this.render(c, ctx, cx, cy);
      c.talk = () => this.talk(c);
      const cust = AK.state.shop.cust[name];
      if (named && cust && cust.buys + cust.orders >= 2 && Math.random() < 0.5) c.greet = true;
      if (named && Math.random() < 0.3 && AK.state.shop.orders.length < 3 && AK.state.shop.orderDay !== AK.Time.abs() && AK.Quests.isDone('s_karar')) c.wantsOrder = true;
      if (type === 'gizemli') c.mystery = true;
      this.list.push(c);
      AK.Audio.sfx('door');
    },
    goTo(c, tx, ty, face) {
      c.legs = [{ map: 'shop', to: [tx, ty], then: 'face', face }];
      AK.NPCs.startLeg(c);
    },
    think(c) {
      const S = AK.Shop, m = W.get('shop');
      if (c.state === 'leave') { c.gone = true; return; }
      if ((c.wantsOrder || c.mystery) && !c.didCounter) {
        c.didCounter = true; c.state = 'counter';
        this.goTo(c, 4, 10, 'left'); c.t = 0.1; c.bubble = 'quest'; c.bubbleT = 99;
        return;
      }
      if (c.state === 'counter') { c.t = 6; c.waiting = (c.waiting || 0) + 1; if (c.waiting > 3) { c.bubbleT = 0; this.leave(c); } return; }
      if (c.state === 'browse') {
        // karar ver
        const t = S.s.tables[c.target];
        if (t) {
          if (Math.random() < this.buyChance(c, t.item, t.pm)) {
            const name = AK.Items.name(t.item);
            const p = S.sell(c.target, c);
            c.bubble = 'coin'; c.bubbleT = 1.6;
            W.float(c.x, c.y - 30, `+${p}`, '#f2c14e');
            AK.Audio.sfx('coin');
            AK.UI.toast(`${c.name}, "${name}" satın aldı! (+${p})`, 'coin');
            this.leave(c, 1.2);
            return;
          }
          c.bubble = 'cloud'; c.bubbleT = 1;
        }
      }
      // sıradaki masa
      const opts = S.stocked().filter(i => !c.visited.includes(i));
      if (!opts.length || c.visited.length >= 2) {
        if (!S.stocked().length && !c.visited.length) { c.bubble = 'cloud'; c.bubbleT = 1.5; }
        this.leave(c, 0.6); return;
      }
      const idx = U.pick(opts);
      c.visited.push(idx); c.target = idx; c.state = 'browse';
      const tb = m.tables[idx];
      this.goTo(c, tb.front[0] + (Math.random() < 0.5 ? 0 : 1), tb.front[1], 'up');
      c.t = 1.8 + Math.random() * 1.6;
      c.bubble = 'star'; c.bubbleT = 0;
    },
    leave(c, delay) { c.state = 'leave'; c.bubbleT = Math.max(c.bubbleT, 0); this.goTo(c, 7, 11, 'down'); c.t = delay || 0; },
    talk(c) {
      c.talking = true;
      const end = () => { c.talking = false; };
      const T = TYPES[c.type];
      if (c.state === 'counter' && c.wantsOrder) {
        c.wantsOrder = false; c.bubbleT = 0;
        const o = AK.Shop.genOrder(c);
        AK.Dialog.open({
          name: c.name, look: c.look, lines: [U.pick(T.lines), `Sana bir sipariş vermek istiyorum: ${o.text}`, `${o.until - AK.Time.abs()} gün içinde getirirsen ${U.fmt(o.reward)} altın öderim.`],
          choices: [
            { t: 'Kabul et', fn: () => { AK.state.shop.orders.push(o); AK.state.shop.orderDay = AK.Time.abs(); AK.UI.toast('Sipariş panoya eklendi.', 'quest'); this.leave(c); end(); } },
            { t: 'Reddet', fn: () => { this.leave(c); end(); } },
          ],
        });
        return;
      }
      if (c.state === 'counter' && c.mystery) {
        c.mystery = false; c.bubbleT = 0;
        const hints = !AK.state.flags.tabletsDecoded ? ['Güneş, ay ve yıldız... üç taş, tek bir kapı.', 'Mağaranın doğusundaki kapıyı gördün mü? Yazıtlar sana yolu gösterecek.']
          : !AK.state.flags.desertOpen ? ['Haritanın ilk parçası kumları işaret ediyor.', 'Müzeyi doldur, kâşif. Kasaba sana güvendiğinde yollar açılır.']
            : ['Çölde bir oda var, kapısı yok. Duvarı dinle.', 'Kral maskesi yedi ışınlı bir taç taşır. Disk de öyle. Rastlantı mı sence?'];
        AK.Dialog.open({ name: c.name, look: c.look, lines: hints, onEnd: () => { AK.state.flags.metStranger = true; this.leave(c); end(); } });
        return;
      }
      const cust = AK.state.shop.cust[c.name];
      const lines = c.greet && cust ? [`Yine ben! ${cust.buys} kez alışveriş yaptım burada, bayılıyorum bu dükkâna.`] : [U.pick(T.lines)];
      AK.Dialog.open({ name: c.name, look: c.look, lines, onEnd: end });
    },
    loyaltyReward(name) {
      const F = AK.state.flags;
      if (name === 'Prof. Selim' && !F.kit) {
        F.kit = true;
        AK.UI.toast('Prof. Selim teşekkür olarak sana Arkeoloji Seti hediye etti! Kazı işaretlerinin nadirliğini artık görebilirsin.', 'star');
      } else {
        const n = { zengin: 1500, gizemli: 1000, koleksiyoncu: 600, akademisyen: 500, turist: 300 }[(AK.state.shop.cust[name] || {}).type] || 400;
        AK.Game.addMoney(n, 'Sadakat');
        AK.UI.toast(`${name} sadık müşterin oldu! Teşekkür olarak ${U.fmt(n)} altın bıraktı.`, 'heart');
      }
      AK.Audio.sfx('quest');
    },
    collect(mapId, list) { for (const c of this.list) if (c.map === mapId) list.push(c); },
    at(mapId, px, py) {
      for (const c of this.list) {
        if (c.map !== mapId) continue;
        if (Math.abs(c.x - px) < 11 && (c.y - 10) - py > -16 && (c.y - 10) - py < 18) return c;
      }
      return null;
    },
    render(c, ctx, cx, cy) {
      const x = Math.round(c.x - cx), y = Math.round(c.y - cy);
      ctx.fillStyle = 'rgba(40,24,48,0.28)'; ctx.fillRect(x - 5, y - 2, 10, 3);
      const walking = c.path.length > 0;
      ctx.drawImage(AK.Chars.get(c.look, c.dir, walking ? 'walk' : 'idle', walking ? Math.floor(c.anim) % 4 : 0), x - 8, y - 26);
      if (c.bubble && c.bubbleT > 0) {
        const b = c.state === 'counter' ? Math.round(Math.sin(W.t * 4) * 1.5) : 0;
        ctx.fillStyle = '#fff6e0'; ctx.fillRect(x - 7, y - 44 + b, 14, 13); ctx.fillStyle = '#2a1a24'; ctx.fillRect(x - 1, y - 31 + b, 2, 2);
        ctx.drawImage(AK.Icons.ui(c.bubble), x - 6, y - 43 + b, 12, 12);
      }
    },
  };
})();
