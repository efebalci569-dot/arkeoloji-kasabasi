// Başlık ekranı ve karakter oluşturma.
(function () {
  const U = AK.U;
  const SKINS = ['#f0c39b', '#e2a878', '#c08a5e', '#8a5a3a'];
  const HAIRS = ['#5a3a22', '#2a2024', '#c8862a', '#b8482a', '#e8d6b0'];
  const STYLES = [['short', 'Kısa'], ['long', 'Uzun'], ['ponytail', 'At kuyruğu'], ['curly', 'Kıvırcık'], ['bun', 'Topuz']];
  const SHIRTS = ['#c9a26a', '#3a8a8a', '#c8553d', '#4f7a45', '#6a5a9a'];

  const Ti = AK.Title = {
    camT: 0,
    show() {
      const el = document.getElementById('title-screen');
      el.classList.remove('hidden');
      document.getElementById('hud').classList.add('hidden');
      const has = AK.Save.exists();
      const sv = has ? AK.Save.peek() : null;
      el.innerHTML = `<div class="logo"><div class="l1">ARKEOLOJİ KASABASI</div><div class="l2">Kaz · Keşfet · Temizle · Sergile · Kasabanı Büyüt</div></div>
        <div class="title-menu px-panel"></div>
        <div class="title-foot">Sürüm 1.3 · Tüm grafikler, müzik ve sesler kodla üretilmiştir</div>`;
      const menu = el.querySelector('.title-menu');
      if (has && sv) {
        const b = AK.UI.btn(`Devam Et <span style="font-size:.8rem;opacity:.85">(${U.esc(sv.player.name)} · ${AK.Time.SEASONS[sv.time.season]} ${sv.time.day}, Yıl ${sv.time.year})</span>`, () => this.cont());
        menu.appendChild(b);
      }
      menu.appendChild(AK.UI.btn('Yeni Oyun', () => this.newGame(has)));
      menu.appendChild(AK.UI.btn('Kontroller', () => AK.Menus.controls()));
      // arka plan: kasaba
      AK.World.enter('town', 30, 25, 'down');
      AK.World.camOverride = { x: 200, y: 180 };
      AK.Audio.music('title');
    },
    hide() { document.getElementById('title-screen').classList.add('hidden'); AK.World.camOverride = null; },
    update(dt) {
      this.camT += dt;
      const m = AK.World.get('town');
      const vw = AK.World.vw, vh = AK.World.vh;
      const ax = (m.w * 16 - vw), ay = (m.h * 16 - vh);
      AK.World.camOverride = { x: ax * (0.5 + Math.sin(this.camT * 0.04) * 0.35), y: ay * (0.45 + Math.cos(this.camT * 0.03) * 0.3) };
      AK.state.time.min = 360 + ((this.camT * 6) % 1080);
    },
    cont() {
      if (!AK.Save.load()) { AK.UI.toast('Kayıt okunamadı.', 'lock'); return; }
      this.hide();
      AK.Game.start(false);
    },
    newGame(has) {
      const go = () => this.creator();
      if (has) AK.UI.confirm('Mevcut kaydın silinecek. Yeni oyuna başlansın mı?', go, null, 'Yeni oyun', 'Vazgeç');
      else go();
    },
    creator() {
      const ui = AK.UI;
      const look = { skin: SKINS[0], hair: HAIRS[0], hairStyle: 'short', shirt: SHIRTS[0], outfit: 'vest', outfitCol: '#7a5a3a', pants: '#5a4a3a', shoes: '#4a3020', hat: 'safari', hatCol: '#d8c08a' };
      const body = ui.el('div', 'row');
      body.style.alignItems = 'flex-start'; body.style.gap = '1rem';
      const prev = document.createElement('canvas'); prev.width = 48; prev.height = 30;
      prev.style.width = '12rem'; prev.style.height = '7.5rem'; prev.style.imageRendering = 'pixelated'; prev.style.background = '#9bd86e'; prev.style.border = '3px solid #7a4f2a';
      const form = ui.el('div', 'col');
      form.innerHTML = '<div>Adın:</div>';
      const inp = document.createElement('input'); inp.className = 'px-input'; inp.maxLength = 14; inp.value = 'Kâşif'; inp.style.pointerEvents = 'auto';
      form.appendChild(inp);
      const sw = (label, arr, key) => {
        form.appendChild(ui.el('div', null, label));
        const r = ui.el('div', 'swatches');
        arr.forEach(c => { const s = ui.el('div', 'swatch' + (look[key] === c ? ' on' : '')); s.style.background = c; s.onclick = () => { look[key] = c; if (key === 'shirt') look.outfitCol = AK.Gfx.dk(c, 0.35); r.querySelectorAll('.swatch').forEach(x => x.classList.remove('on')); s.classList.add('on'); draw(); }; r.appendChild(s); });
        form.appendChild(r);
      };
      sw('Ten:', SKINS, 'skin'); sw('Saç rengi:', HAIRS, 'hair');
      form.appendChild(ui.el('div', null, 'Saç modeli:'));
      const st = ui.el('div', 'row'); st.style.flexWrap = 'wrap';
      STYLES.forEach(([k, n]) => st.appendChild(ui.btn(n, () => { look.hairStyle = k; draw(); }, 'small')));
      form.appendChild(st);
      sw('Kıyafet:', SHIRTS, 'shirt');
      const hatB = ui.btn('Kâşif şapkası: Var', () => { look.hat = look.hat ? null : 'safari'; hatB.textContent = 'Kâşif şapkası: ' + (look.hat ? 'Var' : 'Yok'); draw(); }, 'small');
      form.appendChild(hatB);
      let t = 0;
      const draw = () => {
        look._k = null;
        const g = prev.getContext('2d'); g.imageSmoothingEnabled = false;
        g.clearRect(0, 0, 48, 30);
        g.drawImage(AK.Chars.get(look, 'down', 'idle', 0), 2, 1);
        g.drawImage(AK.Chars.get(look, 'right', 'walk', Math.floor(t) % 4), 16, 1);
        g.drawImage(AK.Chars.get(look, 'up', 'idle', 0), 30, 1);
      };
      const iv = setInterval(() => { t += 1; draw(); }, 160);
      draw();
      const left = ui.el('div', 'col'); left.append(prev, ui.el('div', 'small-t muted', 'Amcan Prof. Doğan Arslan emekliye ayrıldı ve kasabadaki küçük arkeoloji dükkânını sana bıraktı...'));
      left.style.width = '12.5rem';
      body.append(left, form);
      let h;
      h = ui.panel({
        title: 'Yeni Kâşif', body, width: '36rem', onClose: () => clearInterval(iv),
        foot: [ui.btn('Maceraya başla!', () => {
          const name = (inp.value || 'Kâşif').trim().slice(0, 14) || 'Kâşif';
          clearInterval(iv);
          look._k = null;
          AK.Save.clear();
          AK.state = AK.newState({ name, look: Object.assign({}, look) });
          ui.closeAll();
          this.hide();
          AK.Game.start(true);
        })],
      });
      setTimeout(() => inp.focus(), 50);
      void h;
    },
  };
})();
