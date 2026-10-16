// Dokunmatik kontroller: sanal çubuk, eylem düğmeleri ve telefona uygun HUD düzeni.
(function () {
  const In = AK.Input;
  const $ = id => document.getElementById(id);
  const KEY = 'arkeoloji-kasabasi-dokunmatik';
  const MODES = { auto: 'Otomatik', on: 'Açık', off: 'Kapalı' };
  const HUD_ICONS = { inventory: 'bag', journal: 'quest', collection: 'museum', relations: 'heart', menu: 'menu' };
  const KB_KEYS = /^(Key[WASDE]|Arrow|Space)/;

  AK.Touch = {
    on: false, mode: 'auto', seen: false, kb: false, MODES,
    init() {
      try { this.mode = localStorage.getItem(KEY) || 'auto'; } catch (e) { this.mode = 'auto'; }
      if (!MODES[this.mode]) this.mode = 'auto';
      this.build();
      // Otomatik: son kullanılan giriş kazanır. Dokunmatik ekranlı dizüstünde kontroller ilk dokunuşta açılır;
      // iPad klavye kılıfı gibi gerçek bir klavyeyle oynanınca gizlenir, ekrana dokununca geri gelir.
      window.addEventListener('touchstart', () => { if (!this.seen || this.kb) { this.seen = true; this.kb = false; if (this.mode === 'auto') this.apply(); } }, { passive: true, capture: true });
      AK.Bus.on('key', code => { if (this.mode === 'auto' && this.on && KB_KEYS.test(code)) { this.kb = true; this.apply(); } });
      // iPad'e fare / trackpad takılıp çıkarılınca yeniden karar ver
      this.mq = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
      if (this.mq) { const f = () => this.apply(); if (this.mq.addEventListener) this.mq.addEventListener('change', f); else if (this.mq.addListener) this.mq.addListener(f); }
      // iOS Safari viewport'taki user-scalable=no'yu yok sayar: iki parmakla yakınlaştırmayı burada engelle
      document.addEventListener('gesturestart', e => e.preventDefault());
      // iPad/iPhone'da ekran klavyesi kapanınca kaymış kalan sayfayı geri al
      document.addEventListener('focusout', e => { if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) setTimeout(() => window.scrollTo(0, 0), 60); });
      // dokununca beliren ipucu kutusu ekranda takılı kalmasın
      document.addEventListener('touchstart', () => { clearTimeout(this._tipT); AK.UI.hideTip(); }, { passive: true, capture: true });
      document.addEventListener('touchend', () => { clearTimeout(this._tipT); this._tipT = setTimeout(() => AK.UI.hideTip(), 2600); }, { passive: true });
      // konuşma açıkken ekranın herhangi bir yerine dokunmak metni ilerletir
      AK.Bus.on('canvasTap', () => { if (AK.Dialog.isOpen && !AK.UI.panelOpen()) this.advance(); });
      if (window.ResizeObserver) new ResizeObserver(() => this.layout()).observe($('clockbox'));
      this.apply();
    },
    build() {
      const root = AK.UI.el('div');
      root.id = 'touch-ui';
      root.innerHTML = '<div id="t-stick"><div id="t-knob"></div></div><div id="t-act" class="t-btn">E</div><div id="t-use" class="t-btn"><img alt=""><span></span></div>';
      $('hud').appendChild(root);
      this.stick = $('t-stick'); this.knob = $('t-knob'); this.act = $('t-act'); this.use = $('t-use');
      root.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
      root.addEventListener('contextmenu', e => e.preventDefault());
      this.bindStick();
      this.bindBtn(this.act, () => this.press('VInteract'));
      this.bindBtn(this.use, () => this.press('VUse'));
      // "E Konuş" balonuna dokunmak da E düğmesi gibi çalışır
      const pr = $('prompt');
      pr.addEventListener('pointerdown', e => { if (!this.on) return; e.preventDefault(); this.press('VInteract'); });
      pr.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    },
    // ---------------- sanal çubuk (8 yön; sonuna kadar itince koşar) ----------------
    bindStick() {
      const el = this.stick;
      let id = null, cx = 0, cy = 0;
      const move = e => {
        const max = el.clientWidth * 0.32;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const d = Math.hypot(dx, dy), k = d > max ? max / d : 1;
        this.knob.style.transform = `translate(${(dx * k).toFixed(1)}px,${(dy * k).toFixed(1)}px)`;
        let ux = 0, uy = 0;
        if (d > max * 0.25) {
          const o = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) & 7;
          ux = [1, 1, 0, -1, -1, -1, 0, 1][o]; uy = [0, 1, 1, 1, 0, -1, -1, -1][o];
        }
        this.setDir(ux, uy, d > max * 0.9);
      };
      const release = () => { id = null; el.classList.remove('on'); this.knob.style.transform = ''; this.setDir(0, 0, false); };
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (id !== null) return;
        id = e.pointerId;
        try { el.setPointerCapture(id); } catch (er) { /* bazı tarayıcılarda yok */ }
        const r = el.getBoundingClientRect();
        cx = r.left + r.width / 2; cy = r.top + r.height / 2;
        el.classList.add('on');
        AK.Audio.unlock();
        move(e);
      });
      el.addEventListener('pointermove', e => { if (e.pointerId === id) move(e); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => el.addEventListener(n, e => { if (e.pointerId === id) release(); }));
      this.releaseStick = release;
    },
    setDir(x, y, run) {
      In.vset('VLeft', x < 0); In.vset('VRight', x > 0); In.vset('VUp', y < 0); In.vset('VDown', y > 0); In.vset('VRun', run);
    },
    // ---------------- eylem düğmeleri ----------------
    bindBtn(el, fn) {
      el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); el.classList.add('on'); fn(); });
      const up = () => el.classList.remove('on');
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.addEventListener(n, up));
    },
    press(code) {
      AK.Audio.unlock();
      if (AK.Dialog.isOpen) { if (!AK.UI.panelOpen()) this.advance(); return; }
      In.vtap(code);
    },
    advance() { if (performance.now() - (AK.Dialog.openedAt || 0) > 150) AK.Dialog.advance(); },
    // alet düğmesi seçili eşyayı gösterir
    refreshUse() {
      if (!this.use || !AK.state) return;
      const st = AK.Inv.selected(), d = st && AK.Items.get(st.id), ic = st && AK.Icons.forStack(st);
      const img = this.use.querySelector('img');
      img.style.display = ic ? '' : 'none';
      if (ic) img.src = AK.Icons.url(ic);
      this.use.querySelector('span').textContent = d && d.type === 'food' ? (d.drink ? 'İç' : 'Ye') : 'Kullan';
    },
    // yakında etkileşilecek bir şey varsa E düğmesi parlar
    hint(on) {
      if (!this.act || on === this._hint) return;
      this._hint = on;
      this.act.classList.toggle('ready', on);
    },
    // ---------------- açma / kapama ----------------
    setMode(m) {
      this.mode = m;
      try { localStorage.setItem(KEY, m); } catch (e) { /* depolama yok */ }
      this.apply();
    },
    apply() {
      const coarse = !!(this.mq && this.mq.matches);
      this.on = this.mode === 'on' || (this.mode === 'auto' && !this.kb && (coarse || this.seen));
      document.body.classList.toggle('touch', this.on);
      if (!this.on && this.releaseStick) this.releaseStick();
      document.querySelectorAll('#hud-buttons .px-btn').forEach(b => {
        if (b.dataset.label == null) b.dataset.label = b.innerHTML;
        b.classList.toggle('ticon', this.on);
        b.innerHTML = this.on ? `<img src="${AK.Icons.url(AK.Icons.ui(HUD_ICONS[b.dataset.act] || 'star'))}" alt="">` : b.dataset.label;
      });
      this.refreshUse();
      this.layout();
    },
    // hızlı erişim çubuğunu çubuk ile düğmelerin arasına sığdır; dar ekranda kontrolleri onun üstüne al
    layout() {
      if (!this.stick) return;
      const hb = $('hotbar'), bs = document.body.style;
      hb.style.transform = '';
      document.body.classList.remove('tall');
      if (!this.on) { bs.removeProperty('--tb'); bs.removeProperty('--hbtop'); return; }
      const W = window.innerWidth, w = hb.offsetWidth, h = hb.offsetHeight;
      if (!w) return; // HUD gizli (başlık ekranı)
      const left = this.stick.getBoundingClientRect().right, right = W - this.act.getBoundingClientRect().left;
      let k = (W - 2 * Math.max(left, right) - 12) / w, tb = 12;
      if (k < 0.8) { k = (W - 12) / w; tb = Math.ceil(h * Math.min(1, k)) + 14; document.body.classList.add('tall'); }
      hb.style.transform = `translateX(-50%) scale(${Math.min(1, k).toFixed(3)})`;
      bs.setProperty('--tb', tb + 'px');
      bs.setProperty('--hbtop', Math.ceil($('clockbox').getBoundingClientRect().bottom + 4) + 'px');
    },
    started() {
      this.refreshUse();
      this.layout();
      // yalnızca dar (telefon) ekranlarda; iPad dikeyde zaten rahat sığar
      if (this.on && !this.hinted && window.innerHeight > window.innerWidth && window.innerWidth < 600) {
        this.hinted = true;
        setTimeout(() => AK.UI.toast('İpucu: Ekranı yan çevirirsen kasabanın daha büyük bir kısmını görürsün.', 'star'), 1800);
      }
    },
    // ---------------- tam ekran ----------------
    canFull() { const d = document.documentElement; return !!(d.requestFullscreen || d.webkitRequestFullscreen); },
    isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
    toggleFull() {
      if (this.isFull()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      const d = document.documentElement;
      const p = (d.requestFullscreen || d.webkitRequestFullscreen).call(d);
      // telefonda tam ekrandayken yatay kilitlemeyi dene (desteklenmezse sessizce geç)
      if (p && p.then) p.then(() => {
        try { if (this.on && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* iOS/iPad desteklemez */ }
      }).catch(() => {});
    },
  };
})();
