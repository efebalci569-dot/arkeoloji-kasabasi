// Diyalog kutusu: daktilo efekti, portre, seçenekler.
(function () {
  const U = AK.U;
  const D = AK.Dialog = {
    isOpen: false, lines: [], i: 0, shown: 0, full: '', choices: null, onEnd: null, t: 0,
    init() {
      this.el = document.getElementById('dialog');
      this.txt = this.el.querySelector('.dlg-text');
      this.ch = this.el.querySelector('.dlg-choices');
      this.nameEl = this.el.querySelector('.dlg-name');
      this.port = this.el.querySelector('.dlg-portrait canvas');
      this.next = this.el.querySelector('.dlg-next');
      this.heartsEl = document.createElement('div'); this.heartsEl.className = 'dlg-hearts';
      this.el.querySelector('.dlg-portrait').appendChild(this.heartsEl);
      this.el.addEventListener('mousedown', e => { if (e.target.closest('.px-btn')) return; this.advance(); });
      AK.Bus.on('key', (code, e) => {
        if (!this.isOpen || AK.UI.panelOpen() || (e && e.repeat)) return;
        if (performance.now() - this.openedAt < 120) return;
        if (['KeyE', 'Space', 'Enter', 'KeyF'].includes(code)) this.advance();
        if (this.choices && this.shown >= this.full.length && this.i >= this.lines.length - 1) {
          const k = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4, Digit6: 5, Digit7: 6, Digit8: 7, Digit9: 8 }[code];
          if (k != null && this.choices[k]) this.pick(k);
          if (code === 'Escape') this.pick(this.choices.length - 1);
        } else if (code === 'Escape') { this.i = this.lines.length - 1; this.shown = this.full.length; this.advance(); }
      });
    },
    open(o) {
      this.lines = (o.lines || ['...']).map(s => AK.Lines ? AK.Lines.fill(s) : s);
      this.choices = o.choices || null;
      this.onEnd = o.onEnd || null;
      this.i = 0;
      this.nameEl.textContent = o.name || '';
      const pg = this.port.getContext('2d');
      pg.imageSmoothingEnabled = false;
      pg.clearRect(0, 0, 16, 16);
      if (o.look) pg.drawImage(AK.Chars.portrait(o.look), 0, 0);
      else if (o.icon) pg.drawImage(o.icon, 0, 0);
      this.el.querySelector('.dlg-portrait').style.display = (o.look || o.icon) ? '' : 'none';
      // kasabalıysa kalpleri göster
      const def = AK.NPCs && AK.NPCs.DEFS.find(d => d.name === o.name);
      if (def && AK.state && AK.NPCs.st(def.id).met) {
        const h = AK.NPCs.hearts(def.id), part = AK.state.rel && AK.state.rel.partner === def.id;
        let x = '';
        for (let i = 0; i < 10; i++) x += `<img src="${AK.Icons.url(AK.Icons.ui(i < h ? 'heart' : 'heartE'))}">`;
        this.heartsEl.innerHTML = x + (part ? '<div class="dlg-rel">♥ Sevgilin</div>' : '');
        this.heartsEl.style.display = '';
      } else this.heartsEl.style.display = 'none';
      this.isOpen = true;
      this.openedAt = performance.now();
      this.el.classList.remove('hidden');
      this.setLine();
      AK.Audio.sfx('open');
    },
    setLine() {
      this.full = this.lines[this.i];
      this.shown = 0; this.t = 0;
      this.ch.innerHTML = '';
      this.render();
    },
    update(dt) {
      if (!this.isOpen) return;
      if (this.shown < this.full.length) {
        this.t += dt * 55;
        const n = Math.min(this.full.length, Math.floor(this.t));
        if (n !== this.shown) { if (n % 3 === 0) AK.Audio.sfx('ui'); this.shown = n; this.render(); }
      }
    },
    render() {
      this.txt.textContent = this.full.slice(0, this.shown);
      const done = this.shown >= this.full.length, last = this.i >= this.lines.length - 1;
      this.next.style.visibility = done && !(last && this.choices) ? 'visible' : 'hidden';
      if (done && last && this.choices && !this.ch.children.length) {
        this.choices.forEach((c, k) => {
          const b = AK.UI.btn(`${k + 1}. ${c.t}`, () => this.pick(k), 'small');
          this.ch.appendChild(b);
        });
      }
    },
    advance() {
      if (!this.isOpen) return;
      if (this.shown < this.full.length) { this.shown = this.full.length; this.render(); return; }
      if (this.i < this.lines.length - 1) { this.i++; this.setLine(); return; }
      if (this.choices) return;
      this.close(true);
    },
    pick(k) {
      const c = this.choices[k];
      this.choices = null;
      this.close(false);
      AK.Audio.sfx('ui');
      if (c && c.fn) c.fn();
    },
    close(runEnd) {
      this.isOpen = false;
      this.el.classList.add('hidden');
      const cb = this.onEnd; this.onEnd = null;
      AK.Input.clearAll();
      if (runEnd && cb) cb();
    },
    // kısa yol: sadece metin
    say(name, lines, look, onEnd) { this.open({ name, lines: Array.isArray(lines) ? lines : [lines], look, onEnd }); },
  };
  void U;
})();
