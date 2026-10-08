// Eser temizleme mini oyunu: fırçayla kiri temizle, keskiyle kabuğu kır, çatlaklardan kaçın.
(function () {
  const U = AK.U, G = AK.Gfx;
  const N = 64, OFF = 8, SC = 3;
  const DIRT = [null, [168, 126, 82], [128, 88, 54], [92, 62, 40]];

  const C = AK.Cleaning = {
    open: false,
    choose(fromHome) {
      const list = AK.Inv.list(s => AK.Items.isArtifact(s) && s.d);
      if (!list.length) { AK.UI.toast('Temizlenecek kirli eser yok. Önce kazı alanında eser bul!', 'museum'); return; }
      AK.UI.chooseItem({
        title: 'Temizleme Masası', note: 'Temizlemek için kirli bir eser seç. Temizlik ~20 dakika sürer.',
        filter: s => AK.Items.isArtifact(s) && s.d,
        onPick: i => C.start(i, fromHome),
      });
    },
    start(idx, fromHome) {
      const st = AK.Inv.get(idx);
      if (!st) return;
      const def = AK.Items.get(st.id);
      const lvl = AK.state.tools.brush || 1;
      const bonus = (AK.state.shop.level >= 4 && !fromHome) ? 1 : 0;
      const s = this.s = {
        idx, st, def, lvl: Math.min(4, lvl + bonus), tool: 'brush', damage: 0, done: false,
        dirt: new Uint8Array(N * N), work: new Float32Array(N * N), frag: new Uint8Array(N * N), art: new Uint8Array(N * N),
        noise: new Float32Array(N * N), parts: [], mx: -10, my: -10, down: false, last: null, flash: 0, sndT: 0,
      };
      const r = U.rng(U.hash(st.id + AK.Time.abs() + idx));
      // taban görüntü: masa + eser
      const base = G.canvas(N, N), g = base.g;
      G.rect(g, 0, 0, N, N, '#b8844f');
      for (let y = 0; y < N; y += 6) { G.rect(g, 0, y + 5, N, 1, '#9a6a3e'); G.speckle(g, 0, y, N, 5, ['#c8955a', '#a8743f'], 0.08, r); }
      G.oval(g, 4, 4, 56, 56, '#e8dcc0'); G.oval(g, 6, 6, 52, 52, '#f2ead8');
      const icon = AK.Icons.artifact(def, false);
      g.drawImage(icon, OFF, OFF, 16 * SC, 16 * SC);
      s.base = base.g.getImageData(0, 0, N, N);
      const id = icon.getContext('2d').getImageData(0, 0, 16, 16).data;
      let ax0 = N, ay0 = N, ax1 = 0, ay1 = 0;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const ix = Math.floor((x - OFF) / SC), iy = Math.floor((y - OFF) / SC);
        if (ix >= 0 && iy >= 0 && ix < 16 && iy < 16 && id[(iy * 16 + ix) * 4 + 3] > 40) { s.art[y * N + x] = 1; ax0 = Math.min(ax0, x); ay0 = Math.min(ay0, y); ax1 = Math.max(ax1, x); ay1 = Math.max(ay1, y); }
        s.noise[y * N + x] = r();
      }
      s.artCount = s.art.reduce((a, b) => a + b, 0);
      // kir katmanı
      const cx = (ax0 + ax1) / 2, cy = (ay0 + ay1) / 2, rx = (ax1 - ax0) / 2 + 6, ry = (ay1 - ay0) / 2 + 6;
      const crust = [], thin = [], frag = [];
      const nCrust = 3 + def.rar + ((r() * 3) | 0);
      for (let i = 0; i < nCrust; i++) crust.push([ax0 + r() * (ax1 - ax0), ay0 + r() * (ay1 - ay0), 4 + r() * 5]);
      for (let i = 0; i < 3; i++) thin.push([ax0 + r() * (ax1 - ax0), ay0 + r() * (ay1 - ay0), 3 + r() * 4]);
      const artCells = [];
      for (let i = 0; i < N * N; i++) if (s.art[i]) artCells.push(i);
      const nFrag = 2 + Math.floor(def.rar / 2) + ((r() * 2) | 0);
      for (let i = 0; i < nFrag; i++) { const c = artCells[(r() * artCells.length) | 0]; frag.push([c % N, Math.floor(c / N), 2 + r() * 1.8]); }
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x;
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        const d = Math.sqrt(dx * dx + dy * dy) + (s.noise[i] - 0.5) * 0.25;
        if (d > 1) continue;
        let t = 2;
        for (const [bx, by, br] of crust) if ((x - bx) ** 2 + (y - by) ** 2 < br * br) t = 3;
        for (const [bx, by, br] of thin) if ((x - bx) ** 2 + (y - by) ** 2 < br * br) t = 1;
        if (d > 0.85) t = 1;
        s.dirt[i] = t;
        if (s.art[i]) for (const [bx, by, br] of frag) if ((x - bx) ** 2 + (y - by) ** 2 < br * br) s.frag[i] = 1;
      }
      this.buildUI();
    },
    buildUI() {
      const s = this.s, UI = AK.UI;
      this.open = true;
      const disp = 64 * Math.max(4, Math.min(6, Math.floor(window.innerHeight / 150)));
      const wrap = UI.el('div', 'clean-wrap');
      const cv = document.createElement('canvas'); cv.width = N; cv.height = N; cv.style.width = cv.style.height = disp + 'px';
      this.cv = cv; this.g = cv.getContext('2d'); this.g.imageSmoothingEnabled = false;
      const side = UI.el('div', 'col');
      side.style.width = '15rem';
      side.innerHTML = `
        <div><b>${U.esc(AK.Items.name(s.st))}</b><div class="small-t muted">${AK.Artifacts.REGIONS[s.def.region]} · <span style="color:${AK.Artifacts.rarityCol(s.def.rar)}">${AK.Artifacts.rarityName(s.def.rar)}</span></div></div>
        <div class="tool-pick"></div>
        <div class="small-t">Temizlik <span id="cl-pct">0%</span></div><div class="meter"><div id="cl-m1" style="width:0%"></div></div>
        <div class="small-t">Hasar</div><div class="meter"><div id="cl-m2" style="width:0%;background:#c8553d"></div></div>
        <div class="small-t muted" style="margin-top:.3rem">• <b>Fırça</b>: basılı tutup sürükle. Kalın koyu kabukta yavaştır.<br>• <b>Keski</b>: tıkla. Kabuğu hızla kırar ama ince kire/esere vurursan hasar verir.<br>• Kırmızı çatlaklı yerleri temizlendikten sonra fırçalamaya devam etme!</div>`;
      const tp = side.querySelector('.tool-pick');
      const bB = UI.btn('Fırça (Sv ' + s.lvl + ')', () => this.setTool('brush')); const bC = UI.btn('Keski', () => this.setTool('chisel'));
      tp.append(bB, bC); this.toolBtns = { brush: bB, chisel: bC };
      this.setTool('brush');
      wrap.append(cv, side);
      this.pnl = UI.panel({
        title: 'Eser Temizleme', body: wrap, width: '40rem', noClose: true,
        foot: [this.finishBtn = UI.btn('Bitir', () => this.finish(true)), UI.btn('Vazgeç', () => this.cancel())],
      });
      const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * N, (e.clientY - r.top) / r.height * N]; };
      cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); s.down = true; const [x, y] = pos(e); s.mx = x; s.my = y; s.last = [x, y]; if (s.tool === 'chisel') this.chisel(x, y); else this.brush(x, y); });
      cv.addEventListener('pointermove', e => { const [x, y] = pos(e); s.mx = x; s.my = y; if (s.down && s.tool === 'brush') { const [lx, ly] = s.last || [x, y]; const d = Math.max(1, Math.hypot(x - lx, y - ly)); for (let k = 1; k <= d; k++) this.brush(lx + (x - lx) * k / d, ly + (y - ly) * k / d); s.last = [x, y]; } });
      cv.addEventListener('pointerup', () => { s.down = false; s.last = null; });
      cv.addEventListener('pointerleave', () => { s.mx = -10; });
      const loop = () => { if (!this.open) return; this.render(); requestAnimationFrame(loop); };
      loop();
    },
    setTool(t) {
      this.s.tool = t;
      for (const k in this.toolBtns) this.toolBtns[k].classList.toggle('on', k === t);
    },
    brush(x, y) {
      const s = this.s; if (s.done) return;
      const R = 2.2 + 0.7 * s.lvl, pw = 0.2 + 0.06 * s.lvl;
      let removed = false;
      for (let j = Math.floor(y - R); j <= Math.ceil(y + R); j++) for (let i = Math.floor(x - R); i <= Math.ceil(x + R); i++) {
        if (i < 0 || j < 0 || i >= N || j >= N) continue;
        const dd = Math.hypot(i + 0.5 - x, j + 0.5 - y); if (dd > R) continue;
        const k = j * N + i, f = 1 - dd / (R + 0.5);
        const dt = s.dirt[k];
        if (dt > 0) {
          s.work[k] += pw * f;
          const th = dt === 3 ? 6 : dt === 2 ? 1.5 : 1;
          if (s.work[k] >= th) { s.dirt[k]--; s.work[k] = 0; removed = true; if (Math.random() < 0.25) s.parts.push({ x: i, y: j, vx: (Math.random() - 0.5) * 30, vy: -10 - Math.random() * 20, t: 0, c: DIRT[dt] }); }
        } else if (s.frag[k] && s.art[k]) {
          s.damage += 0.045 * f; s.flash = 0.25;
        }
      }
      const now = performance.now();
      if (removed && now - s.sndT > 90) { AK.Audio.sfx('brush'); s.sndT = now; }
      if (s.flash > 0 && now - s.sndT > 200) { AK.Audio.sfx('crack'); s.sndT = now; }
      this.check();
    },
    chisel(x, y) {
      const s = this.s; if (s.done) return;
      const R = 3.2;
      let dmg = 0;
      for (let j = Math.floor(y - R); j <= Math.ceil(y + R); j++) for (let i = Math.floor(x - R); i <= Math.ceil(x + R); i++) {
        if (i < 0 || j < 0 || i >= N || j >= N || Math.hypot(i + 0.5 - x, j + 0.5 - y) > R) continue;
        const k = j * N + i, dt = s.dirt[k];
        if (dt <= 1 && s.art[k]) dmg += s.frag[k] ? 2.4 : 0.7;
        s.dirt[k] = Math.max(0, dt - 2); s.work[k] = 0;
        if (dt > 0 && Math.random() < 0.4) s.parts.push({ x: i, y: j, vx: (Math.random() - 0.5) * 60, vy: -20 - Math.random() * 30, t: 0, c: DIRT[Math.max(1, dt)] });
      }
      AK.Audio.sfx('chisel');
      if (dmg > 0) { s.damage += Math.min(14, dmg); s.flash = 0.4; AK.Audio.sfx('crack'); }
      this.check();
    },
    completion() {
      const s = this.s; let c = 0;
      for (let i = 0; i < N * N; i++) if (s.art[i] && s.dirt[i] === 0) c++;
      return c / s.artCount;
    },
    check() {
      const s = this.s, c = this.completion();
      s.comp = c;
      document.getElementById('cl-pct').textContent = Math.floor(c * 100) + '%';
      document.getElementById('cl-m1').style.width = Math.floor(c * 100) + '%';
      document.getElementById('cl-m2').style.width = Math.min(100, Math.floor(s.damage * 1.6)) + '%';
      this.finishBtn.disabled = c < 0.6;
      if (c >= 0.985 && !s.done) setTimeout(() => this.finish(false), 250);
    },
    quality() {
      const s = this.s, d = s.damage, c = s.comp || 0;
      let q = d < 6 && c >= 0.97 ? 3 : d < 22 ? 2 : d < 48 ? 1 : 0;
      if (c < 0.9) q = Math.min(q, 1);
      return q;
    },
    render() {
      const s = this.s, g = this.g;
      const img = new ImageData(new Uint8ClampedArray(s.base.data), N, N), d = img.data;
      const blink = (performance.now() / 300 | 0) % 2;
      for (let k = 0; k < N * N; k++) {
        const dt = s.dirt[k], p = k * 4;
        if (dt > 0) {
          const c = DIRT[dt], n = (s.noise[k] - 0.5) * 22;
          const a = dt === 1 ? 0.72 : 1;
          d[p] = d[p] * (1 - a) + (c[0] + n) * a; d[p + 1] = d[p + 1] * (1 - a) + (c[1] + n) * a; d[p + 2] = d[p + 2] * (1 - a) + (c[2] + n) * a;
          if (dt === 1 && s.frag[k] && s.noise[k] < 0.4) { d[p] = 200; d[p + 1] = 80; d[p + 2] = 60; }
        } else if (s.frag[k] && s.art[k]) {
          if (s.noise[k] < 0.55 || blink) { d[p] = 220; d[p + 1] = 70 + (blink ? 30 : 0); d[p + 2] = 50; }
        }
      }
      g.putImageData(img, 0, 0);
      // parçacıklar
      for (const p of s.parts) { p.t += 0.016; p.x += p.vx * 0.016; p.y += p.vy * 0.016; p.vy += 80 * 0.016; g.fillStyle = `rgb(${p.c[0]},${p.c[1]},${p.c[2]})`; g.fillRect(p.x | 0, p.y | 0, 1, 1); }
      s.parts = s.parts.filter(p => p.t < 0.6);
      if (s.flash > 0) { s.flash -= 0.016; g.fillStyle = `rgba(255,60,40,${s.flash * 0.5})`; g.fillRect(0, 0, N, N); }
      // imleç
      if (s.mx >= 0 && !s.done) {
        const R = s.tool === 'brush' ? 2.2 + 0.7 * s.lvl : 3.2;
        g.fillStyle = s.tool === 'brush' ? 'rgba(255,248,220,0.9)' : 'rgba(255,200,120,0.95)';
        for (let a = 0; a < 24; a++) { const t = a / 24 * Math.PI * 2; g.fillRect(Math.round(s.mx + Math.cos(t) * R), Math.round(s.my + Math.sin(t) * R), 1, 1); }
      }
      if (s.done) { for (let i = 0; i < 3; i++) { g.fillStyle = '#fff6c0'; g.fillRect((Math.random() * N) | 0, (Math.random() * N) | 0, 1, 1); } }
    },
    finish(manual) {
      const s = this.s; if (s.done) return;
      if (manual && (s.comp || 0) < 0.6) { AK.UI.toast('Eser henüz yeterince ortaya çıkmadı.', 'museum'); return; }
      s.done = true;
      const q = this.quality();
      const before = AK.Items.value(s.st);
      s.st.d = 0; s.st.q = q;
      AK.Inv.touch();
      const after = AK.Items.value(s.st);
      AK.state.stats.cleaned++; AK.state.daylog.cleaned++;
      AK.Audio.sfx(q >= 2 ? 'quest' : 'pickup');
      const QN = AK.Items.QUALITY[q];
      const inMuseum = AK.state.museum.includes(s.def.id);
      const ic = AK.Icons.url(AK.Icons.artifact(s.def, false));
      this.close();
      const body = AK.UI.el('div', 'col');
      body.style.alignItems = 'center'; body.style.textAlign = 'center';
      body.innerHTML = `<img src="${ic}" style="width:${16 * 6}px;height:${16 * 6}px">
        <div style="font-size:1.3rem"><b>${U.esc(s.def.name)}</b></div>
        <div>Kalite: <span class="gold">${'★'.repeat(QN.stars)}${'☆'.repeat(3 - QN.stars)}</span> ${QN.name}</div>
        <div>Değer: <span class="muted">${before}</span> → <b class="gold">${after}</b> altın</div>
        <div class="small-t muted" style="max-width:22rem">${U.esc(s.def.desc)}</div>
        ${inMuseum ? '<div class="small-t muted">Bu eser zaten müzede sergileniyor.</div>' : '<div class="small-t good">★ Bu eser müzede yok! Bağışlamayı düşünebilirsin.</div>'}`;
      AK.UI.panel({ title: 'Temizlik Tamamlandı!', body, width: '28rem', foot: [AK.UI.btn('Harika!', () => AK.UI.closeTop())] });
      AK.Time.advance(20);
      AK.Bus.emit('cleaned', s.st, q);
    },
    cancel() { this.close(); },
    close() { this.open = false; if (this.pnl) this.pnl.close(); this.pnl = null; },
  };
})();
