// Arayüz çekirdeği: paneller, onay kutuları, eşya seçici, ipuçları, bildirimler, HUD.
(function () {
  const U = AK.U;
  const $ = id => document.getElementById(id);
  const UI = AK.UI = {
    stack: [],
    el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; },
    btn(label, fn, cls) {
      const b = document.createElement('button');
      b.className = 'px-btn' + (cls ? ' ' + cls : '');
      b.innerHTML = label;
      b.addEventListener('click', e => { e.stopPropagation(); if (b.disabled) return; AK.Audio.sfx('ui'); fn && fn(e); });
      return b;
    },
    icon(k) { return AK.Icons.url(AK.Icons.ui(k)); },
    // ---------------- paneller ----------------
    panel(o) {
      const root = $('panel-root');
      const bd = this.el('div', 'backdrop');
      const p = this.el('div', 'panel px-panel');
      if (o.width) p.style.width = o.width;
      const head = this.el('div', 'panel-head');
      head.appendChild(this.el('h2', null, U.esc(o.title || '')));
      const h = { el: bd, panel: p, o };
      if (!o.noClose) { const x = this.el('span', 'x-btn', '✕'); x.title = 'Kapat (Esc)'; x.onclick = () => this.close(h); head.appendChild(x); }
      const body = this.el('div', 'panel-body');
      if (typeof o.body === 'string') body.innerHTML = o.body; else if (o.body) body.appendChild(o.body);
      p.append(head, body);
      if (o.foot && o.foot.length) { const f = this.el('div', 'panel-foot'); o.foot.forEach(b => f.appendChild(b)); p.appendChild(f); }
      bd.appendChild(p);
      bd.addEventListener('mousedown', e => { if (e.target === bd && !o.noClose && !o.modal) this.close(h); });
      root.appendChild(bd);
      h.body = body;
      h.close = () => this.close(h);
      this.stack.push(h);
      AK.Audio.sfx('open');
      AK.Input.clearAll();
      return h;
    },
    close(h) {
      const i = this.stack.indexOf(h);
      if (i < 0) return;
      this.stack.splice(i, 1);
      h.el.remove();
      this.hideTip();
      AK.Audio.sfx('close');
      if (h.o.onClose) h.o.onClose();
      AK.Input.clearAll();
    },
    closeTop() { const h = this.stack[this.stack.length - 1]; if (h) this.close(h); },
    closeAll() { while (this.stack.length) this.closeTop(); },
    panelOpen() { return this.stack.length > 0; },
    blocking() { return this.panelOpen() || AK.Dialog.isOpen || AK.Cleaning.open; },
    confirm(html, yes, no, yl, nl) {
      const body = this.el('div', null, html);
      let h;
      h = this.panel({ title: 'Emin misin?', body, width: '24rem', onClose: () => { if (!h.done && no) no(); }, foot: [this.btn(yl || 'Evet', () => { h.done = true; this.close(h); yes && yes(); }), this.btn(nl || 'Hayır', () => { this.close(h); })] });
      return h;
    },
    // ---------------- slot ve ipuçları ----------------
    slot(st, opts) {
      opts = opts || {};
      const s = this.el('div', 'slot' + (opts.sel ? ' sel' : '') + (opts.locked ? ' locked' : '') + (opts.dim ? ' dim' : ''));
      if (st) {
        const ic = AK.Icons.forStack(st);
        if (ic) { const img = document.createElement('img'); img.src = AK.Icons.url(ic); s.appendChild(img); }
        if (st.n > 1) s.appendChild(this.el('span', 'n', st.n));
        const def = AK.Items.get(st.id);
        if (def && def.type === 'artifact') {
          const r = this.el('span', 'rar'); r.style.background = AK.Artifacts.rarityCol(def.rar); s.appendChild(r);
          if (!st.d) s.appendChild(this.el('span', 'q', '★'.repeat(AK.Items.QUALITY[st.q].stars)));
        }
        s._tip = () => this.tipHTML(st);
      }
      if (opts.key != null) s.appendChild(this.el('span', 'k', opts.key));
      if (opts.onClick) s.addEventListener('click', e => { e.stopPropagation(); AK.Audio.sfx('ui'); opts.onClick(e); });
      return s;
    },
    tipHTML(st) {
      const d = AK.Items.get(st.id);
      if (!d) return '';
      let h = `<div class="tt-name">${U.esc(AK.Items.name(st))}</div>`;
      if (d.type === 'artifact') {
        h += `<div class="tt-sub"><span style="color:${AK.Artifacts.rarityCol(d.rar)}">${AK.Artifacts.rarityName(d.rar)}</span> · ${d.cat}</div>`;
        h += `<div class="tt-sub">${AK.Artifacts.REGIONS[d.region]} · ${d.era}</div>`;
        h += `<div class="tt-desc">${U.esc(st.d ? 'Toprak ve kirle kaplı. Temizleme masasında temizlenmeli.' : d.desc)}</div>`;
        if (!st.d) h += `<div class="tt-sub">Kalite: ${AK.Items.QUALITY[st.q].name}${st.r ? ' · Araştırıldı (+%20)' : ''}</div>`;
        h += AK.state.museum.includes(d.id) ? '<div class="tt-sub">✓ Müzede sergileniyor</div>' : '<div class="tt-sub" style="color:#9fe08a">★ Müzede yok!</div>';
        if (!d.noSell) h += `<div class="tt-val">Değer: ${AK.Items.value(st)} altın</div>`;
        else h += '<div class="tt-val">Paha biçilemez (satılamaz)</div>';
      } else if (d.type === 'tool') {
        h += `<div class="tt-sub">Seviye ${AK.state.tools[d.tool]} · Enerji: ${AK.Exc.cost(d.tool)}</div><div class="tt-desc">${U.esc(d.desc)}</div>`;
      } else {
        h += `<div class="tt-desc">${U.esc(d.desc || '')}</div>`;
        if (d.energy) h += `<div class="tt-sub">+${d.energy} enerji (kullanmak için seç ve Boşluk)</div>`;
        if (d.value) h += `<div class="tt-val">Değer: ${d.value} altın${st.n > 1 ? ` (x${st.n})` : ''}</div>`;
      }
      return h;
    },
    showTip(html, x, y) {
      const t = $('tooltip');
      t.innerHTML = html; t.classList.remove('hidden');
      const w = t.offsetWidth, hh = t.offsetHeight;
      t.style.left = Math.min(window.innerWidth - w - 4, x + 14) + 'px';
      t.style.top = Math.max(4, Math.min(window.innerHeight - hh - 4, y + 14)) + 'px';
    },
    hideTip() { $('tooltip').classList.add('hidden'); },
    // ---------------- eşya seçici ----------------
    chooseItem(o) {
      const body = this.el('div', 'col');
      if (o.note) body.appendChild(this.el('div', 'small-t muted', U.esc(o.note)));
      const grid = this.el('div', 'grid');
      let h, picked = false;
      const cap = AK.Inv.cap();
      for (let i = 0; i < cap; i++) {
        const st = AK.Inv.get(i);
        const ok = st && o.filter(st, i);
        grid.appendChild(this.slot(st, { dim: !ok, onClick: ok ? () => { picked = true; this.close(h); o.onPick(i); } : null }));
      }
      body.appendChild(grid);
      h = this.panel({ title: o.title, body, width: '30rem', onClose: () => { if (!picked && o.onCancel) o.onCancel(); } });
      return h;
    },
    // ---------------- bildirimler ----------------
    toast(text, icon) {
      const box = $('toasts');
      const t = this.el('div', 'toast px-panel small');
      if (icon) { const im = document.createElement('img'); im.src = this.icon(icon); t.appendChild(im); }
      t.appendChild(this.el('span', null, U.esc(AK.Lines ? AK.Lines.fill(text) : text)));
      box.appendChild(t);
      while (box.children.length > 5) box.firstChild.remove();
      setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 4200 + Math.min(4000, text.length * 25));
    },
    toastItem(st) { this.toast(`+${st.n || 1} ${AK.Items.name(st)}`, 'bag'); },
    banner(def, isNew, dirty) {
      const b = $('banner');
      b.className = 'px-panel';
      b.innerHTML = `<div class="b-top">${isNew ? 'YENİ KEŞİF!' : 'Eser bulundu'}</div><div class="b-name">${dirty ? 'Kirli ' : ''}${U.esc(def.name)}</div>
        <div class="b-rar" style="color:${AK.Artifacts.rarityCol(def.rar)}">${AK.Artifacts.rarityName(def.rar)}</div>`;
      clearTimeout(this._bt);
      this._bt = setTimeout(() => b.classList.add('hidden'), 2600);
    },
    float(sx, sy, text, col) {
      const f = this.el('div', null, U.esc(text));
      Object.assign(f.style, { position: 'absolute', left: sx + 'px', top: sy + 'px', transform: 'translate(-50%,-100%)', color: col || '#fff', fontSize: '1.05rem', textShadow: '1px 1px 0 #2a1a24,-1px -1px 0 #2a1a24,1px -1px 0 #2a1a24,-1px 1px 0 #2a1a24', transition: 'top 1.2s ease-out, opacity 1.2s', pointerEvents: 'none', whiteSpace: 'nowrap' });
      $('ui').appendChild(f);
      requestAnimationFrame(() => { f.style.top = (sy - 40) + 'px'; f.style.opacity = '0'; });
      setTimeout(() => f.remove(), 1300);
    },
    locName(m) {
      const el = $('loc-name');
      el.innerHTML = `${U.esc(m.name)}${m.sub ? `<small>${U.esc(m.sub)}</small>` : ''}`;
      el.style.opacity = '1';
      clearTimeout(this._lt);
      this._lt = setTimeout(() => { el.style.opacity = '0'; }, 2200);
    },
    showToolName() {
      const st = AK.Inv.selected(), el = $('toolname');
      el.textContent = st ? AK.Items.name(st) : '';
      el.style.opacity = st ? '1' : '0';
      clearTimeout(this._tt);
      this._tt = setTimeout(() => { el.style.opacity = '0'; }, 1400);
    },
    prompt(text, sx, sy) {
      const el = $('prompt');
      if (!text) { el.classList.add('hidden'); return; }
      el.innerHTML = text;
      el.classList.remove('hidden');
      el.style.left = sx + 'px'; el.style.top = sy + 'px';
    },
    // ---------------- HUD ----------------
    initHUD() {
      const hb = $('hotbar');
      this.hot = [];
      for (let i = 0; i < 10; i++) { const s = this.el('div', 'slot'); hb.appendChild(s); this.hot.push(s); }
      $('h-coin').src = this.icon('coin');
      document.querySelectorAll('#hud-buttons .px-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); AK.Game.openMenu(b.dataset.act); }));
      document.addEventListener('mousemove', e => {
        let t = e.target;
        while (t && t !== document.body && !t._tip) t = t.parentElement;
        if (t && t._tip) this.showTip(t._tip(), e.clientX, e.clientY); else this.hideTip();
      });
      this.last = {};
    },
    updateHUD() {
      const L = this.last, st = AK.state, T = AK.Time;
      const date = T.dateStr();
      if (L.date !== date) { $('h-date').textContent = date; L.date = date; }
      const clock = T.clock();
      if (L.clock !== clock) { $('h-time').textContent = clock; L.clock = clock; $('h-time').style.color = T.min() >= 1440 ? '#c8352e' : ''; }
      const w = AK.Weather.today();
      if (L.w !== w) { const inf = AK.Weather.info(w); $('h-wicon').src = this.icon(inf.icon); $('h-wname').textContent = inf.name; $('clockbox')._tip = () => `<div class="tt-name">${inf.name}</div><div class="tt-desc">${inf.tip}</div>`; L.w = w; }
      const money = st.player.money;
      if (L.money !== money) { $('h-money').textContent = U.fmt(money); L.money = money; }
      const sus = AK.Law ? AK.Law.s.sus : 0;
      if (L.sus !== sus) {
        const row = $('h-sus'); row.classList.toggle('hidden', sus <= 0);
        if (sus > 0) { const li = AK.Law.levelInfo(); $('h-susicon').src = this.icon('eye'); $('h-suslabel').textContent = li.name; $('h-suslabel').style.color = li.col; $('h-susbar').style.width = sus + '%'; $('h-susbar').style.background = li.col; row._tip = () => '<div class="tt-name">Şüphe: ' + li.name + ' (' + sus + '/100)</div><div class="tt-desc">Karaborsa satışları şüpheyi artırır. Yüksek şüphe = devriye ve sabah baskını riski. Her gece biraz azalır; yasal satış ve bağış da azaltır.</div>'; }
        L.sus = sus;
      }
      const p = st.player, pct = U.clamp(p.energy / p.maxEnergy, 0, 1);
      const ek = Math.round(pct * 100);
      if (L.e !== ek) {
        const f = $('energy-fill'); f.style.height = ek + '%';
        f.style.background = pct > 0.5 ? '#5cc24a' : pct > 0.2 ? '#e8c23a' : '#d8452e';
        $('energy')._tip = () => `<div class="tt-name">Enerji: ${Math.floor(p.energy)}/${p.maxEnergy}</div><div class="tt-desc">Alet kullanmak enerji harcar. Yemek ye ya da uyu.</div>`;
        L.e = ek;
      }
      if (L.inv !== AK.Inv.ver || L.sel !== st.inv.sel) {
        for (let i = 0; i < 10; i++) {
          const old = this.hot[i];
          const s = this.slot(AK.Inv.get(i), { sel: i === st.inv.sel, key: (i + 1) % 10, onClick: () => { AK.Inv.select(i); this.showToolName(); } });
          old.replaceWith(s); this.hot[i] = s;
        }
        L.inv = AK.Inv.ver; L.sel = st.inv.sel;
        this.refreshTracker();
      }
    },
    refreshTracker() {
      const el = $('quest-tracker');
      const q = AK.Quests.tracked();
      if (!q) { el.innerHTML = ''; return; }
      const d = AK.Quests.DEFS[q.id];
      let h = `<div class="qt-title">${d.story ? 'Hikâye: ' : ''}${U.esc(d.title)}</div>`;
      d.obj.forEach((o, k) => { h += `<div class="qt-obj ${AK.Quests.objDone(q, k) ? 'done' : ''}">• ${U.esc(AK.Quests.objText(q, k))}</div>`; });
      el.innerHTML = h;
    },
    // ölçek
    setScale(u) {
      document.documentElement.style.setProperty('--u', u);
      document.documentElement.style.fontSize = (u * 6 + 4) + 'px';
    },
  };
})();
