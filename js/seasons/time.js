// Takvim, saat ve gün ışığı. 1 oyun dakikası = RATE gerçek saniye.
(function () {
  const U = AK.U;
  const SEASONS = ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];
  const WD = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const DPS = 14; // mevsim başına gün
  // dış mekân ışık anahtar kareleri [dakika, r, g, b]
  const KEYS = [
    [360, 205, 192, 226], [420, 252, 236, 220], [480, 255, 255, 255], [1020, 255, 255, 255],
    [1110, 255, 216, 172], [1170, 220, 162, 172], [1230, 128, 122, 190], [1320, 84, 88, 160], [1600, 72, 76, 150],
  ];
  const Time = AK.Time = {
    SEASONS, WD, DPS,
    RATE: 0.6,
    acc: 0,
    get t() { return AK.state.time; },
    min() { return this.t.min; },
    season() { return this.t.season; },
    day() { return this.t.day; },
    abs() { return (this.t.year - 1) * DPS * 4 + this.t.season * DPS + this.t.day; },
    weekday() { return (this.abs() - 1) % 7; },
    hour() { return Math.floor(this.t.min / 60); },
    clock(m) {
      m = m == null ? this.t.min : m;
      m = Math.floor(m / 10) * 10;
      const h = Math.floor(m / 60) % 24, mm = m % 60;
      return U.pad2(h) + ':' + U.pad2(mm);
    },
    dateStr() { return `${SEASONS[this.t.season]} ${this.t.day} · ${WD[this.weekday()]}`; },
    shortDate() { return `${SEASONS[this.t.season]} ${this.t.day}, Yıl ${this.t.year}`; },
    tick(dt) {
      this.acc += dt;
      while (this.acc >= this.RATE) {
        this.acc -= this.RATE;
        this.step();
      }
    },
    step() {
      this.t.min++;
      if (this.t.min % 10 === 0) AK.Bus.emit('tick10', this.t.min);
      if (this.t.min === 1440) AK.Bus.emit('midnight');
      if (this.t.min >= 1560) AK.Bus.emit('passOut');
    },
    // zamanı ileri sar (araştırma, temizlik, yolculuk)
    advance(mins) {
      for (let i = 0; i < mins; i++) {
        if (this.t.min >= 1559) break;
        this.step();
      }
    },
    nextDay() {
      const t = this.t;
      t.day++;
      if (t.day > DPS) { t.day = 1; t.season++; if (t.season > 3) { t.season = 0; t.year++; } }
      t.min = 360;
      this.acc = 0;
    },
    // dış mekân ortam ışığı (çarpma rengi)
    ambient() {
      const m = this.t.min;
      let a = KEYS[0], b = KEYS[KEYS.length - 1];
      for (let i = 0; i < KEYS.length - 1; i++) if (m >= KEYS[i][0] && m <= KEYS[i + 1][0]) { a = KEYS[i]; b = KEYS[i + 1]; break; }
      const f = b[0] === a[0] ? 0 : (m - a[0]) / (b[0] - a[0]);
      let col = [U.lerp(a[1], b[1], f), U.lerp(a[2], b[2], f), U.lerp(a[3], b[3], f)];
      const w = AK.Weather.today();
      const mod = { yagmur: [0.78, 0.8, 0.88], firtina: [0.62, 0.64, 0.74], sis: [0.94, 0.94, 0.97], kar: [0.95, 0.97, 1.0], bulutlu: [0.9, 0.9, 0.94] }[w];
      if (mod) col = col.map((v, i) => v * mod[i]);
      return col;
    },
    isDark() { const a = this.ambient(); return (a[0] + a[1] + a[2]) / 3 < 200; },
  };
})();
