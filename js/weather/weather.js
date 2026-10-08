// Hava durumu: günlük zar, oynanışa etkileri ve ekran parçacıkları.
(function () {
  const U = AK.U, G = AK.Gfx;
  const TYPES = {
    gunesli: { name: 'Güneşli', icon: 'sun', tip: 'Güzel bir gün. Turistler dükkâna daha çok uğrar.' },
    bulutlu: { name: 'Bulutlu', icon: 'cloud', tip: 'Serin ve sakin bir gün.' },
    yagmur: { name: 'Yağmurlu', icon: 'rain', tip: 'Toprak yumuşak! Kürek daha az yorar, yağmur yeni kazı izleri açar.' },
    firtina: { name: 'Fırtına', icon: 'storm', tip: 'Kazı alanları tehlikeli olduğu için kapalı. Dükkân ve kasaba günü!' },
    kar: { name: 'Karlı', icon: 'snow', tip: 'Kar, bazı eski kalıntıları görünür kılar. Gözünü dört aç!' },
    sis: { name: 'Sisli', icon: 'fog', tip: 'Sis ormandaki gizli bir yolu açığa çıkarır...' },
  };
  const CHANCES = [
    { gunesli: 45, bulutlu: 18, yagmur: 25, sis: 9, firtina: 3 },
    { gunesli: 60, bulutlu: 14, yagmur: 11, firtina: 11, sis: 4 },
    { gunesli: 34, bulutlu: 20, yagmur: 25, sis: 16, firtina: 5 },
    { gunesli: 28, bulutlu: 20, kar: 37, sis: 10, firtina: 5 },
  ];
  const W = AK.Weather = {
    TYPES,
    parts: [],
    flash: 0,
    fogT: 0,
    get s() { return AK.state.weather; },
    today() { return AK.state ? this.s.today : 'gunesli'; },
    tomorrow() { return this.s.tomorrow; },
    info(k) { return TYPES[k || this.today()]; },
    roll(season, absDay) {
      if (absDay <= 3) return 'gunesli';
      const r = U.rng(U.hash('weather' + absDay + (AK.state.seed || 0)));
      const tab = CHANCES[season];
      const keys = Object.keys(tab);
      let pick = U.wpick(keys, k => tab[k], r);
      if (pick === 'firtina' && absDay < 6) pick = 'yagmur';
      return pick;
    },
    // yeni gün: yarının havası bugünün olur
    advance(season, absDay) {
      this.s.today = this.s.tomorrow || this.roll(season, absDay);
      const nd = absDay + 1;
      const ns = Math.floor(((nd - 1) % (AK.Time.DPS * 4)) / AK.Time.DPS);
      this.s.tomorrow = this.roll(ns, nd);
      if (season === 3 && this.s.today === 'yagmur') this.s.today = 'kar';
      if (season !== 3 && this.s.today === 'kar') this.s.today = 'yagmur';
    },
    isWet() { const t = this.today(); return t === 'yagmur' || t === 'firtina'; },
    // oynanış etkileri
    digEnergyMod() { return this.isWet() ? -1 : 0; },
    soilBonus() { return this.isWet() ? 0.04 : 0; },
    customerMod() { return { gunesli: 1.2, bulutlu: 1.0, yagmur: 0.7, firtina: 0.4, kar: 0.8, sis: 0.9 }[this.today()] || 1; },
    sitesOpen() { return this.today() !== 'firtina'; },

    // ---------------- parçacıklar ----------------
    update(dt, vw, vh, outdoor) {
      const t = this.today();
      const s = AK.Time.season();
      let want = 0, kind = null;
      if (outdoor) {
        if (t === 'yagmur') { want = 140; kind = 'rain'; }
        else if (t === 'firtina') { want = 260; kind = 'rain'; }
        else if (t === 'kar') { want = 110; kind = 'snow'; }
        else if (s === 2) { want = 10; kind = 'leaf'; }
        else if (s === 0) { want = 8; kind = 'petal'; }
      }
      while (this.parts.length < want) this.parts.push(this.spawn(kind, vw, vh, true));
      if (this.parts.length > want) this.parts.length = want;
      const wind = t === 'firtina' ? 2.2 : 1;
      for (const p of this.parts) {
        if (p.k !== kind) Object.assign(p, this.spawn(kind, vw, vh, true));
        p.x += p.vx * dt * wind; p.y += p.vy * dt;
        if (p.k === 'snow' || p.k === 'leaf' || p.k === 'petal') p.x += Math.sin((p.y + p.ph) / 14) * 12 * dt;
        if (p.y > vh + 4 || p.x > vw + 10 || p.x < -10) Object.assign(p, this.spawn(kind, vw, vh, false));
      }
      if (outdoor && t === 'firtina' && Math.random() < dt * 0.08) { this.flash = 1; setTimeout(() => AK.Audio.sfx('thunder'), 300 + Math.random() * 800); }
      this.flash = Math.max(0, this.flash - dt * 2.5);
      this.fogT += dt;
    },
    spawn(k, vw, vh, anywhere) {
      const p = { k, x: Math.random() * (vw + 40) - 20, y: anywhere ? Math.random() * vh : -6, ph: Math.random() * 100 };
      if (k === 'rain') { p.vx = 40; p.vy = 260 + Math.random() * 80; }
      else if (k === 'snow') { p.vx = 6; p.vy = 18 + Math.random() * 18; p.sz = Math.random() < 0.3 ? 2 : 1; }
      else { p.vx = 14; p.vy = 16 + Math.random() * 10; p.c = k === 'leaf' ? U.pick(['#d8742a', '#c8452e', '#e8a03a']) : U.pick(['#f7b6cf', '#ffffff']); }
      return p;
    },
    fogTex: null,
    draw(ctx, vw, vh, outdoor) {
      if (!outdoor) return;
      const t = this.today();
      if (t === 'yagmur' || t === 'firtina') { ctx.fillStyle = t === 'firtina' ? 'rgba(30,36,60,0.22)' : 'rgba(40,52,84,0.12)'; ctx.fillRect(0, 0, vw, vh); }
      for (const p of this.parts) {
        if (p.k === 'rain') {
          ctx.fillStyle = 'rgba(205,228,255,0.78)'; ctx.fillRect(p.x | 0, p.y | 0, 1, 5);
          if (p.y > p.ph * 2.5 && p.y < p.ph * 2.5 + 6) { ctx.fillStyle = 'rgba(220,236,255,0.6)'; ctx.fillRect((p.x | 0) - 1, (p.ph * 2.5 + 6) | 0, 3, 1); }
        }
        else if (p.k === 'snow') { ctx.fillStyle = '#ffffff'; ctx.fillRect(p.x | 0, p.y | 0, p.sz, p.sz); }
        else { ctx.fillStyle = p.c; ctx.fillRect(p.x | 0, p.y | 0, 2, 1); ctx.fillRect((p.x | 0) + 1, (p.y | 0) + 1, 1, 1); }
      }
      if (t === 'sis') {
        if (!this.fogTex) {
          const c = G.canvas(128, 128), g = c.g, r = U.rng(7);
          for (let i = 0; i < 40; i++) { const x = r() * 128, y = r() * 128, rr = 14 + r() * 26; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(230,232,240,0.30)'); gr.addColorStop(1, 'rgba(230,232,240,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
          this.fogTex = c;
        }
        ctx.fillStyle = 'rgba(220,224,235,0.22)'; ctx.fillRect(0, 0, vw, vh);
        const ox = -((this.fogT * 8) % 128), oy = -((this.fogT * 3) % 128);
        for (let x = ox; x < vw; x += 128) for (let y = oy; y < vh; y += 128) ctx.drawImage(this.fogTex, x | 0, y | 0);
      }
      if (this.flash > 0) { ctx.fillStyle = `rgba(255,255,240,${this.flash * 0.6})`; ctx.fillRect(0, 0, vw, vh); }
    },
  };
})();
