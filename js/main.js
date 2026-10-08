// Ana oyun: başlatma, döngü, gün akışı, uyku, enerji ve para.
(function () {
  const U = AK.U;
  const G = AK.Game = {
    scale: 3, playing: false, title: true, last: 0, saveT: 0, openName: null,
    init() {
      this.canvas = document.getElementById('game');
      this.ctx = this.canvas.getContext('2d');
      AK.Input.init();
      AK.Skin.init();
      AK.UI.initHUD();
      AK.Dialog.init();
      window.addEventListener('resize', () => this.resize());
      this.resize();
      AK.state = AK.newState();
      this.buildWorld();
      AK.NPCs.init();
      AK.Quests.init();
      AK.Progress.init();
      AK.Bus.on('tick10', m => this.tick10(m));
      AK.Bus.on('midnight', () => AK.UI.toast('Gece yarısı oldu! Saat 02:00\'de bayılırsın, eve dönüp uyumalısın.', 'clock'));
      AK.Bus.on('passOut', () => this.passOut());
      AK.Bus.on('mapEnter', () => { this.ambience(); if (this.playing) AK.Save.save(true); });
      AK.Bus.on('key', (code, e) => this.onKey(code, e));
      window.addEventListener('beforeunload', () => { if (this.playing) AK.Save.save(true); });
      AK.Title.show();
      requestAnimationFrame(t => this.loop(t));
      // requestAnimationFrame durursa (gömülü görünümler vb.) yedek zamanlayıcı
      this.rafAt = performance.now();
      setInterval(() => { const now = performance.now(); if (now - this.rafAt > 250) this.frame(now); }, 33);
    },
    buildWorld() {
      AK.World.maps = {};
      AK.Town.build();
      AK.Interiors.build();
      AK.DigSites.build();
    },
    resize() {
      if (window.innerWidth < 50 || window.innerHeight < 50) { clearTimeout(this._rz); this._rz = setTimeout(() => this.resize(), 150); return; }
      const s = Math.max(2, Math.floor(Math.min(window.innerWidth / 420, window.innerHeight / 236)));
      this.scale = s;
      const vw = Math.ceil(window.innerWidth / s), vh = Math.ceil(window.innerHeight / s);
      this.canvas.width = vw; this.canvas.height = vh;
      this.canvas.style.width = vw * s + 'px'; this.canvas.style.height = vh * s + 'px';
      this.ctx.imageSmoothingEnabled = false;
      AK.World.vw = vw; AK.World.vh = vh;
      AK.UI.setScale(Math.max(2, s - 1));
    },
    start(isNew) {
      this.title = false;
      this.playing = true;
      AK.Audio.setVol('music', AK.state.settings.music);
      AK.Audio.setVol('sfx', AK.state.settings.sfx);
      this.buildWorld();
      AK.NPCs.init();
      AK.Customers.list = [];
      const p = AK.state.player;
      if (!AK.World.get(p.map)) p.map = 'house';
      const sx = p.x, sy = p.y;
      AK.Player.x = sx; AK.Player.y = sy;
      AK.World.enter(p.map, null, null, p.dir);
      AK.Player.x = sx; AK.Player.y = sy;
      if (!AK.Player.free(p.x, p.y)) { AK.World.enter('house', 3, 3, 'down'); }
      AK.World.fade = 1; AK.World.fadeDir = -1; AK.World.busy = true;
      document.getElementById('hud').classList.remove('hidden');
      AK.UI.last = {};
      AK.UI.refreshTracker();
      this.ambience();
      if (isNew) {
        AK.Quests.start('s_hosgeldin', true);
        setTimeout(() => AK.Dialog.open({
          name: 'Amcandan Mektup', icon: AK.Icons.ui('mail'),
          lines: ['"Sevgili {ad},', 'Dizlerim artık kazıya dayanmıyor; emekliye ayrılıp dünyayı gezmeye karar verdim. Hayatım boyunca bu kasabanın altındaki sırrı aradım. Şimdi sıra sende.', 'Küçük evim, harap dükkânım ve paslı aletlerim artık senin. Müzedeki eski dostum Nermin\'e selamımı söyle. Sana yol gösterecektir.', 'Toprağı dinle. — Amcan Doğan"', '(Hareket: WASD · Etkileşim: E · Alet kullan: Boşluk veya sol tık · Çanta: I · Görevler: J)'],
          onEnd: () => AK.UI.toast('İlk görev: Müzeye git ve Nermin Hanım ile konuş. Müze, meydanın batısındaki sütunlu bina.', 'quest'),
        }), 600);
        AK.Save.save(true);
      } else {
        AK.UI.toast(`Tekrar hoş geldin, ${AK.state.player.name}! ${AK.Time.dateStr()}`, 'star');
      }
    },
    loop(t) {
      this.rafAt = performance.now();
      this.frame(t);
      requestAnimationFrame(tt => this.loop(tt));
    },
    frame(t) {
      const dt = Math.min(0.05, (t - this.last) / 1000 || 0.016);
      if (dt <= 0) return;
      this.last = t;
      try { this.update(dt); this.draw(); } catch (e) { console.error(e); }
    },
    update(dt) {
      if (this.title) {
        AK.Title.update(dt);
        AK.World.update(dt);
        AK.Weather.update(dt, AK.World.vw, AK.World.vh, true);
        AK.Input.endFrame();
        return;
      }
      AK.Dialog.update(dt);
      const blocking = AK.UI.blocking() || AK.World.busy;
      if (!blocking) {
        AK.Time.tick(dt);
        AK.Player.update(dt);
        AK.NPCs.update(dt);
        AK.Customers.update(dt);
        this.updatePrompt();
      } else AK.UI.prompt(null);
      AK.World.update(dt);
      AK.Weather.update(dt, AK.World.vw, AK.World.vh, AK.World.cur && AK.World.cur.outdoor);
      AK.UI.updateHUD();
      document.getElementById('fade').style.opacity = AK.World.fade;
      this.saveT += dt;
      if (this.saveT > 60 && !blocking) { this.saveT = 0; AK.Save.save(true); }
      this.pollT = (this.pollT || 0) + dt;
      if (this.pollT > 0.5) { this.pollT = 0; AK.Quests.poll(); AK.UI.refreshTracker(); }
      AK.Input.endFrame();
    },
    draw() {
      const showTarget = this.playing && !AK.UI.blocking();
      AK.World.draw(this.ctx, showTarget);
    },
    updatePrompt() {
      const f = AK.Player.findInteract(false);
      const s = this.scale, cam = AK.World.cam;
      if (!f) { AK.UI.prompt(null); return; }
      let x, y, text;
      if (f.npc) { x = f.npc.x; y = f.npc.y - 30; text = `<b>E</b> Konuş${f.npc.def ? ' · ' + U.esc(f.npc.def.name) : f.npc.name ? ' · ' + U.esc(f.npc.name) : ''}`; }
      else { const o = f.obj, sp = o._spr; x = o.irect ? o.irect[0] + o.irect[2] / 2 : o.x; y = o.y - (sp ? sp.height : 16) - 2; text = `<b>E</b> ${U.esc(o.prompt || 'İncele')}`; }
      AK.UI.prompt(text, (x - cam.x) * s, (y - cam.y) * s);
    },
    onKey(code, e) {
      if (!this.playing || (e && e.repeat)) return;
      if (AK.Dialog.isOpen || AK.Cleaning.open) return;
      const top = AK.UI.stack[AK.UI.stack.length - 1];
      if (code === 'Escape') {
        if (top) { if (!top.o.noClose) AK.UI.closeTop(); }
        else this.openMenu('menu');
        return;
      }
      const map = { KeyI: 'inventory', Tab: 'inventory', KeyJ: 'journal', KeyK: 'collection' };
      const name = map[code];
      if (!name) return;
      if (top) { if (this.openName === name && !top.o.noClose) AK.UI.closeAll(); return; }
      if (AK.World.busy) return;
      this.openMenu(name);
    },
    openMenu(name) {
      if (!this.playing || AK.Dialog.isOpen || AK.Cleaning.open) return;
      if (AK.UI.panelOpen()) AK.UI.closeAll();
      this.openName = name;
      if (name === 'menu') AK.Menus.pause();
      else AK.Menus[name]();
    },
    tick10(m) {
      AK.Shop.offsiteTick();
      AK.World.updateMusic();
      if (m === 1200 && AK.World.cur && AK.World.cur.id !== 'house' && AK.World.cur.outdoor) AK.UI.toast('Hava karardı. Gece ormanda ve mağarada fenerinin ışığı yanına kalır.', 'clock');
    },
    ambience() {
      const m = AK.World.cur, w = AK.Weather.today();
      AK.Audio.ambience(m && m.outdoor ? (w === 'yagmur' ? 'rain' : w === 'firtina' ? 'storm' : null) : null);
    },
    // ---------------- para & enerji ----------------
    addMoney(n, src) {
      const p = AK.state.player;
      p.money = Math.max(0, p.money + n);
      if (n > 0) { AK.state.daylog.earned += n; AK.state.stats.earned += n; }
      void src;
    },
    useEnergy(n) {
      const p = AK.state.player;
      const before = p.energy;
      p.energy = Math.max(0, p.energy - n);
      if (before > 0 && p.energy <= 0) AK.UI.toast('Bitkin düştün! Yavaş yürüyorsun ve alet kullanamazsın. Bir şeyler ye ya da uyu.', 'energy');
      else if (before > 15 && p.energy <= 15) AK.UI.toast('Yorulmaya başladın...', 'energy');
    },
    rest() {
      const today = AK.Time.abs();
      if (AK.state.flags.restDay === today) { AK.UI.toast('Bugün zaten çadırda dinlendin.', 'energy'); return; }
      AK.UI.confirm('Çadırda bir saat dinlen? (+30 enerji, günde bir kez)', () => {
        AK.state.flags.restDay = today;
        const p = AK.state.player;
        p.energy = Math.min(p.maxEnergy, p.energy + 30);
        AK.Time.advance(60);
        AK.Audio.sfx('sleep');
        AK.UI.toast('Biraz dinlendin. (+30 enerji)', 'energy');
      }, null, 'Dinlen', 'Vazgeç');
    },
    // ---------------- uyku & yeni gün ----------------
    askSleep() {
      const early = AK.Time.min() < 1080;
      AK.UI.confirm(early ? 'Henüz erken. Yine de uyuyup günü bitirmek istiyor musun?' : 'Uyuyup günü bitirmek istiyor musun? (Oyun kaydedilir)', () => this.sleep(false), null, 'Uyu', 'Vazgeç');
    },
    sleep(passedOut) {
      if (this.sleeping) return;
      this.sleeping = true;
      AK.Audio.sfx('sleep');
      AK.UI.closeAll();
      const W = AK.World;
      W.busy = true; W.fadeDir = 1;
      W.fadeCb = () => { W.fadeDir = 0; W.fade = 1; AK.Menus.daySummary(() => this.newDay(passedOut), passedOut); };
    },
    passOut() {
      if (this.sleeping) return;
      AK.UI.toast('Gözlerin kapanıyor...', 'clock');
      this.sleep(true);
    },
    newDay(passedOut) {
      const st = AK.state, p = st.player;
      const late = AK.Time.min() >= 1440;
      AK.Law.nightly();
      AK.Time.nextDay();
      AK.Weather.advance(AK.Time.season(), AK.Time.abs());
      st.stats.days++;
      const rare = st.house.disp.filter(s => s && AK.Items.get(s.id).rar >= 2).length;
      const bonus = Math.min(20, rare * 5);
      p.energy = Math.round(p.maxEnergy * (passedOut ? 0.5 : late ? 0.8 : 1)) + bonus;
      let penalty = 0;
      if (passedOut) { penalty = Math.min(500, Math.floor(p.money * 0.1)); p.money -= penalty; }
      st.daylog = { found: [], sold: [], donated: [], earned: 0, cleaned: 0 };
      AK.Shop.newDay();
      AK.Progress.onNewDay();
      AK.NPCs.snapAll();
      AK.Customers.list = [];
      AK.World.enter('house', 3, 3, 'down');
      AK.World.fadeDir = -1;
      AK.Quests.poll();
      this.ambience();
      this.sleeping = false;
      AK.Save.save(true);
      const w = AK.Weather.info();
      const ev = AK.Progress.eventToday();
      setTimeout(() => {
        AK.UI.toast(`${AK.Time.dateStr()} — ${w.name}. ${w.tip}`, w.icon);
        if (bonus) AK.UI.toast(`Evindeki eserler sana ilham verdi! (+${bonus} enerji)`, 'star');
        if (penalty) AK.UI.toast(`Seni eve taşıyanlara ${penalty} altın ödedin.`, 'coin');
        if (ev) AK.UI.toast(`Bugün ${AK.Progress.EVENTS_BY_ID[ev].name}! ${AK.Progress.EVENTS_BY_ID[ev].desc}`, 'star');
        if (AK.Time.day() === 1) AK.UI.toast(`${AK.Time.SEASONS[AK.Time.season()]} mevsimi başladı!`, 'star');
        if (st.mail.some(l => !l.read)) AK.UI.toast('Posta kutunda yeni mektup var!', 'mail');
      }, 500);
      setTimeout(() => AK.Law.morning(), 900);
    },
  };
  window.addEventListener('load', () => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => G.init()).catch(() => G.init());
    else G.init();
  });
})();
