// Ganimet tabloları: nadirlik zarı (bölge + mevsim + ekipman + hava), kaynak düşüşleri.
(function () {
  const U = AK.U;
  const BASE = [60, 26, 10, 3.3, 0.7];
  const Loot = AK.Loot = {
    // bonus: 0 normal, 0.3 sert toprak, 0.6 dedektör, 1+ özel
    rollRarity(bonus, r = Math.random, min = 0) {
      const w = BASE.map((b, i) => (i >= 2 ? b * (1 + bonus * (i - 1)) : i === 0 ? b * Math.max(0.25, 1 - bonus * 0.45) : b));
      for (let i = 0; i < min; i++) w[i] = 0;
      return U.wpick([0, 1, 2, 3, 4], i => w[i], r);
    },
    toolBonus(tool) { return ((AK.state.tools[tool] || 1) - 1) * 0.12; },
    artifact(region, rar, opts) {
      opts = opts || {};
      const A = AK.Artifacts, s = AK.Time.season();
      // hikâye kolaylığı: tablet görevi aktifse eksik tabletler öne çıkar
      if (region === 'orman' && rar >= 2 && AK.Quests && AK.Quests.isActive('s_tabletler')) {
        const miss = ['tablet_gunes', 'tablet_ay', 'tablet_yildiz'].filter(id => !AK.state.found[id]);
        if (miss.length && Math.random() < 0.55) return U.pick(miss);
      }
      let r = rar;
      for (let k = 0; k < 6; k++) {
        const pool = A.pool(region, r, s, opts);
        if (pool.length) {
          // henüz bulunmamış eserler daha olası
          return U.wpick(pool, a => (AK.state.found[a.id] ? 1 : 2.6) * (a.spotOnly ? 3 : 1)).id;
        }
        r = k % 2 === 0 ? Math.max(0, rar - 1 - (k >> 1)) : Math.min(4, rar + 1 + (k >> 1));
      }
      return region === 'col' ? 'amfora' : region === 'magara' ? 'tas_balta' : 'bakir_sikke';
    },
    fossil(region) {
      const A = AK.Artifacts;
      const pool = A.LIST.filter(a => a.fossil && a.region === region);
      if (!pool.length) return null;
      return U.wpick(pool, a => [0, 70, 26, 6, 1][a.rar]).id;
    },
    // düz toprak kazısı
    soil(region) {
      const r = Math.random();
      const artP = 0.05 + AK.Weather.soilBonus() + (AK.state.tools.shovel - 1) * 0.01;
      if (r < artP) return { art: this.artifact(region, this.rollRarity(this.toolBonus('shovel') * 0.5)) };
      const t = Math.random();
      if (region === 'col') {
        if (t < 0.22) return { res: 'tas', n: 1 };
        if (t < 0.36) return { res: 'comlek', n: 1 };
        if (t < 0.44) return { res: 'metal', n: 1 };
        if (t < 0.46) return { res: 'altin', n: 1 };
        return null;
      }
      if (region === 'magara') {
        if (t < 0.18) return { res: 'kemik', n: 1 };
        if (t < 0.38) return { res: 'tas', n: 1 };
        if (t < 0.44) return { res: 'kuvars', n: 1 };
        return null;
      }
      if (t < 0.30) return { res: 'kil', n: 1 + (Math.random() < 0.3 ? 1 : 0) };
      if (t < 0.42) return { res: 'comlek', n: 1 };
      if (t < 0.50) return { res: 'kemik', n: 1 };
      if (t < 0.55) return { res: 'metal', n: 1 };
      if (t < 0.65) return { res: 'tas', n: 1 };
      return null;
    },
  };
})();
