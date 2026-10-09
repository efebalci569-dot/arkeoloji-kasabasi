// Dünya çalışma zamanı: haritalar, çarpışma, kamera, çizim, ışıklandırma, geçişler.
(function () {
  const U = AK.U, G = AK.Gfx, T = AK.T, TS = AK.Tiles;
  const shadowSpr = G.memo((w, h) => { const c = G.canvas(w, h); G.oval(c.g, 0, 0, w, h, 'rgba(40,24,48,0.28)'); return c; });

  const World = AK.World = {
    maps: {}, cur: null, cam: { x: 0, y: 0 }, t: 0,
    fx: [], vw: 480, vh: 270,
    fade: 0, fadeDir: 0, fadeCb: null, busy: false,
    shake: 0, camOverride: null, warpLock: null,
    light: null,

    // ---------------- harita oluşturma ----------------
    newMap(id, w, h, fill, o) {
      const m = Object.assign({
        id, w, h, name: id, tiles: new Uint8Array(w * h).fill(fill), force: new Uint8Array(w * h),
        objects: [], decals: [], warps: [], drops: [], outdoor: false, music: 'town', style: 'house', floor: '',
        bg: '#120b16', hasWater: false,
      }, o || {});
      this.maps[id] = m;
      return m;
    },
    set(m, x, y, t) { if (x >= 0 && y >= 0 && x < m.w && y < m.h) m.tiles[y * m.w + x] = t; },
    tile(m, x, y) { if (x < 0 || y < 0 || x >= m.w || y >= m.h) return T.VOID; return m.tiles[y * m.w + x]; },
    fill(m, x, y, w, h, t) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(m, i, j, t); },
    ovalFill(m, cx, cy, rx, ry, t) {
      for (let j = Math.floor(cy - ry); j <= Math.ceil(cy + ry); j++) for (let i = Math.floor(cx - rx); i <= Math.ceil(cx + rx); i++) {
        const dx = (i - cx) / rx, dy = (j - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(m, i, j, t);
      }
    },
    block(m, x, y, w = 1, h = 1) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && j >= 0 && i < m.w && j < m.h) m.force[j * m.w + i] = 1; },
    add(m, o) { m.objects.push(o); return o; },
    remove(m, o) { const i = m.objects.indexOf(o); if (i >= 0) m.objects.splice(i, 1); this.rebuild(m); },
    get(id) { return this.maps[id]; },

    // ---------------- çarpışma ----------------
    rebuild(m) {
      const n = m.w * m.h;
      if (!m.blk || m.blk.length !== n) m.blk = new Uint8Array(n);
      for (let i = 0; i < n; i++) m.blk[i] = (TS.solid(m.tiles[i]) || m.force[i]) ? 1 : 0;
      for (const o of m.objects) {
        if (o.hidden || !o.solid) continue;
        const [x, y, w, h] = o.solid;
        for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && j >= 0 && i < m.w && j < m.h) m.blk[j * m.w + i] = 1;
      }
      for (const o of m.objects) if (!o.hidden && o.holes) for (const [hx, hy] of o.holes) m.blk[hy * m.w + hx] = 0;
    },
    solid(m, tx, ty) { if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return true; return m.blk[ty * m.w + tx] === 1; },
    objAtTile(m, tx, ty) {
      for (const o of m.objects) if (!o.hidden && o.tx === tx && o.ty === ty && (o.hit || o.int)) return o;
      for (const o of m.objects) {
        if (o.hidden || !o.solid || !(o.hit || o.int)) continue;
        const [x, y, w, h] = o.solid;
        if (tx >= x && tx < x + w && ty >= y && ty < y + h) return o;
      }
      return null;
    },
    intAt(m, px, py) {
      let best = null;
      for (const o of m.objects) {
        if (o.hidden || !o.int) continue;
        const r = o.irect || (o.solid ? [o.solid[0] * 16 - 2, o.solid[1] * 16 - 2, o.solid[2] * 16 + 4, o.solid[3] * 16 + 4] : (o.tx != null ? [o.tx * 16, o.ty * 16, 16, 16] : null));
        if (r && px >= r[0] && px < r[0] + r[2] && py >= r[1] && py < r[1] + r[3]) { best = o; if (o.prio) return o; }
      }
      return best;
    },
    warpAt(m, tx, ty) {
      for (const w of m.warps) if (tx >= w.x && tx < w.x + (w.w || 1) && ty >= w.y && ty < w.y + (w.h || 1)) return w;
      return null;
    },
    checkWarp() {
      const m = this.cur, P = AK.Player;
      if (this.busy) return;
      const w = this.warpAt(m, P.x >> 4, P.y >> 4);
      if (!w) { this.warpLock = null; return; }
      if (this.warpLock === w) return;
      this.warpLock = w;
      if (w.need) {
        const msg = w.need();
        if (msg) { AK.UI.toast(msg, 'lock'); this.nudge(w); return; }
      }
      if (w.fn) { this.nudge(w); w.fn(); return; }
      AK.Audio.sfx('door');
      this.go(w.to, w.tx, w.ty, w.dir);
    },
    nudge(w) {
      const P = AK.Player, d = w.back || [0, 10];
      P.x += d[0]; P.y += d[1];
      this.warpLock = this.warpAt(this.cur, P.x >> 4, P.y >> 4);
    },

    // ---------------- geçiş ----------------
    go(id, tx, ty, dir, cb) {
      if (this.busy) return;
      this.busy = true;
      this.fadeDir = 1;
      this.fadeCb = () => { this.enter(id, tx, ty, dir); if (cb) cb(); };
    },
    enter(id, tx, ty, dir) {
      const m = this.maps[id];
      if (!m) { console.error('harita yok', id); return; }
      const prev = this.cur;
      if (m.refresh) m.refresh(m);
      if (m.daily && m.dayBuilt !== AK.Time.abs()) { this.rebuild(m); m.daily(m); m.dayBuilt = AK.Time.abs(); }
      this.rebuild(m);
      this.renderGround(m);
      this.cur = m;
      AK.state.player.map = id;
      const P = AK.Player;
      if (tx != null) { P.x = tx * 16 + 8; P.y = ty * 16 + 12; }
      if (dir) P.dir = dir;
      P.stop();
      this.fx.length = 0;
      this.warpLock = this.warpAt(m, P.x >> 4, P.y >> 4);
      this.updateMusic(true);
      if (m.onEnter) m.onEnter(m, prev);
      AK.Bus.emit('mapEnter', id, prev && prev.id);
      if ((!prev || prev.id !== id) && AK.Game.playing) AK.UI.locName(m);
    },
    musicFor(m) {
      if (typeof m.music === 'function') return m.music(m);
      if (m.outdoor && m.id === 'town') { const h = AK.Time.hour(); if (AK.Progress && AK.Progress.eventToday() === 'festival' && h >= 9 && h < 20) return 'festival'; return h >= 20 || h < 6 ? 'night' : 'town'; }
      return m.music;
    },
    updateMusic(force) { if (this.cur) AK.Audio.music(this.musicFor(this.cur), false); void force; },

    // ---------------- zemin önceden çizimi ----------------
    renderGround(m) {
      const s = AK.Time.season();
      if (m.ground && m.groundS === s && !m.groundDirty) return;
      const W = m.w * 16, H = m.h * 16;
      if (!m.ground || m.ground.width !== W) m.ground = G.canvas(W, H);
      const g = m.ground.g;
      g.clearRect(0, 0, W, H);
      const tl = (x, y) => this.tile(m, x, y);
      const wallish = id => id === T.WALL;
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        const id = m.tiles[y * m.w + x];
        const v = (U.h2(x, y, 7) * 16) | 0;
        let style = '', part = 0;
        if (id === T.WALL) {
          style = m.style;
          if (!wallish(tl(x, y + 1))) part = 2; else if (!wallish(tl(x, y + 2))) part = 1; else part = 0;
          if (y === m.h - 1 || ((x === 0 || x === m.w - 1) && y >= 2)) part = 0;
        } else if (id === T.CWALL || id === T.SWALL) {
          const b = tl(x, y + 1);
          part = (b !== id && b !== T.VOID && !TS.solid(b)) ? 1 : 0;
        } else if (id === T.CLIFF) {
          part = tl(x, y + 1) !== T.CLIFF ? 1 : 0;
        } else if (id === T.WOOD) style = m.floor;
        else if (id === T.CARPET) style = m.carpet;
        if (id === T.WATER) { g.drawImage(TS.water(0), x * 16, y * 16); continue; }
        g.drawImage(TS.get(id, s, v, style, part), x * 16, y * 16);
      }
      // çim saçakları
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        const id = m.tiles[y * m.w + x];
        if (!TS.low(id)) continue;
        const nb = [tl(x, y - 1), tl(x + 1, y), tl(x, y + 1), tl(x - 1, y)];
        nb.forEach((n, side) => { if (TS.soft(n)) TS.fringe(g, x * 16, y * 16, side, n === T.FOREST ? TS.FOREST[s] : TS.GRASS[s]); });
      }
      for (const d of m.decals) {
        const spr = typeof d.spr === 'function' ? d.spr(s) : d.spr;
        if (spr) g.drawImage(spr, d.x, d.y);
      }
      // iç mekân: duvar diplerine ortam gölgesi (3D his)
      if (!m.outdoor) {
        for (let y = 1; y < m.h; y++) for (let x = 0; x < m.w; x++) {
          const id = m.tiles[y * m.w + x];
          if (TS.solid(id)) continue;
          const px = x * 16, py = y * 16;
          if (TS.solid(tl(x, y - 1))) { g.fillStyle = 'rgba(20,10,30,0.28)'; g.fillRect(px, py, 16, 2); g.fillStyle = 'rgba(20,10,30,0.14)'; g.fillRect(px, py + 2, 16, 3); g.fillStyle = 'rgba(20,10,30,0.06)'; g.fillRect(px, py + 5, 16, 3); }
          if (TS.solid(tl(x - 1, y))) { g.fillStyle = 'rgba(20,10,30,0.18)'; g.fillRect(px, py, 3, 16); }
          if (TS.solid(tl(x + 1, y))) { g.fillStyle = 'rgba(20,10,30,0.22)'; g.fillRect(px + 13, py, 3, 16); }
        }
      }
      m.groundS = s; m.groundDirty = false;
    },

    // ---------------- güncelleme ----------------
    update(dt) {
      this.t += dt;
      const m = this.cur;
      if (this.fadeDir) {
        this.fade += this.fadeDir * dt / 0.22;
        if (this.fadeDir > 0 && this.fade >= 1) {
          this.fade = 1; this.fadeDir = -1;
          const cb = this.fadeCb; this.fadeCb = null; if (cb) cb();
        } else if (this.fadeDir < 0 && this.fade <= 0) { this.fade = 0; this.fadeDir = 0; this.busy = false; }
      }
      if (!m) return;
      for (const o of m.objects) if (o.update && !o.hidden) o.update(o, dt);
      if (m.update) m.update(m, dt);
      for (const p of this.fx) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.gr || 0) * dt; }
      this.fx = this.fx.filter(p => p.t < p.life);
      if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 12);
      // bacalardan duman
      if (m.outdoor && Math.random() < dt * 2) {
        for (const o of m.objects) {
          if (o.smoke && !o.hidden && Math.random() < 0.35) {
            const s = o._spr || (typeof o.spr === 'function' ? null : o.spr);
            if (!s) continue;
            const x = o.x - s.width / 2 + o.smoke[0], y = o.y - s.height + o.smoke[1];
            this.fx.push({ x, y, vx: 4 + Math.random() * 4, vy: -10 - Math.random() * 6, t: 0, life: 2.2, c: '#d8d0d8', sz: 2, smoke: true });
          }
        }
      }
      // ambiyans sesleri
      this.ambT = (this.ambT || 0) - dt;
      if (this.ambT <= 0) {
        this.ambT = 3 + Math.random() * 6;
        const h = AK.Time.hour(), s = AK.Time.season(), w = AK.Weather.today();
        if (m.outdoor && !AK.Weather.isWet()) {
          if (h >= 6 && h < 18 && s < 3 && w !== 'kar') AK.Audio.critter('bird');
          else if ((h >= 20 || h < 4) && (s === 1 || s === 2)) AK.Audio.critter('cricket');
        } else if (m.id === 'cave') AK.Audio.critter('drip');
      }
      // yerdeki eşyaları topla
      const P = AK.Player;
      for (let i = m.drops.length - 1; i >= 0; i--) {
        const d = m.drops[i];
        d.t += dt;
        if (d.t > 0.6 && Math.abs(d.x - P.x) < 10 && Math.abs(d.y - P.y) < 10) {
          if (AK.Inv.canAdd(d.st)) { AK.Inv.add(d.st); m.drops.splice(i, 1); AK.Audio.sfx('pickup'); AK.UI.toastItem(d.st); }
        }
      }
    },
    // ---------------- efektler ----------------
    burst(x, y, cols, n, spd = 40, life = 0.5, gr = 120) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = spd * (0.4 + Math.random());
        this.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - spd * 0.6, gr, t: 0, life: life * (0.6 + Math.random() * 0.6), c: cols[(Math.random() * cols.length) | 0], sz: Math.random() < 0.3 ? 2 : 1 });
      }
    },
    sparkle(x, y, col = '#fff2b0', n = 10) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = 10 + Math.random() * 30;
        this.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.6 + Math.random() * 0.6, c: col, sz: 1, star: true });
      }
    },
    drop(m, x, y, st) { m.drops.push({ x, y, st, t: 0 }); },
    float(x, y, text, col) {
      const sx = (x - this.cam.x) * AK.Game.scale, sy = (y - this.cam.y) * AK.Game.scale;
      AK.UI.float(sx, sy, text, col);
    },

    // ---------------- kamera & çizim ----------------
    updateCam() {
      const m = this.cur, P = AK.Player;
      let tx = P.x - this.vw / 2, ty = P.y - 10 - this.vh / 2;
      if (this.camOverride) { tx = this.camOverride.x; ty = this.camOverride.y; }
      const mw = m.w * 16, mh = m.h * 16;
      tx = mw <= this.vw ? (mw - this.vw) / 2 : U.clamp(tx, 0, mw - this.vw);
      ty = mh <= this.vh ? (mh - this.vh) / 2 : U.clamp(ty, 0, mh - this.vh);
      this.cam.x = Math.round(tx); this.cam.y = Math.round(ty);
      // çakırkeyifken kamera hafifçe salınır
      const tp = !this.camOverride && AK.Game.playing && AK.state.player.tipsy;
      if (tp > 40) { const a = Math.min(3, tp / 60); this.cam.x += Math.round(Math.sin(this.t * 1.3) * a); this.cam.y += Math.round(Math.cos(this.t * 0.9) * a * 0.6); }
    },
    drawObj(o, ctx, cx, cy) {
      const s = typeof o.spr === 'function' ? o.spr(o, this.t) : o.spr;
      o._spr = s;
      if (o.shadow && !o.flatShadow) ctx.drawImage(shadowSpr(o.shadow[0], o.shadow[1]), Math.round(o.x - o.shadow[0] / 2 - cx + (o.shadow[2] || 0)), Math.round(o.y - o.shadow[1] / 2 - cy - 1));
      let faded = false;
      if (o.fade && s && AK.Game.playing) {
        const P = AK.Player;
        if (P.y < o.y - 2 && P.y > o.y - s.height + 6 && Math.abs(P.x - o.x) < s.width / 2 - 3) { ctx.globalAlpha = 0.45; faded = true; }
      }
      if (s) ctx.drawImage(s, Math.round(o.x - s.width / 2 - cx + (o.ox || 0)), Math.round(o.y - s.height - cy + (o.oy || 0)));
      if (o.draw) o.draw(o, ctx, cx, cy, s);
      if (faded) ctx.globalAlpha = 1;
    },
    // yere düşen gölgeler (düz katman, varlıklardan önce)
    drawShadows(m, ctx, cx, cy, L, Rr, Tp, B) {
      for (const o of m.objects) {
        if (o.hidden || o.x < L - 64 || o.x > Rr + 64 || o.y < Tp || o.y > B + 40) continue;
        if (o.cshadow) ctx.drawImage(o.cshadow, Math.round(o.csx - cx), Math.round(o.csy - cy));
        else if (o.shadow && o.flatShadow) ctx.drawImage(shadowSpr(o.shadow[0], o.shadow[1]), Math.round(o.x - o.shadow[0] / 2 - cx + (o.shadow[2] || 0)), Math.round(o.y - o.shadow[1] / 2 - cy - 1));
      }
    },
    draw(ctx, showTarget) {
      const m = this.cur, vw = this.vw, vh = this.vh;
      if (!m) return;
      this.updateCam();
      let cx = this.cam.x, cy = this.cam.y;
      if (this.shake > 0) { cx += Math.round((Math.random() * 2 - 1) * this.shake); cy += Math.round((Math.random() * 2 - 1) * this.shake); }
      ctx.fillStyle = m.bg; ctx.fillRect(0, 0, vw, vh);
      // zemin
      const sx = Math.max(0, cx), sy = Math.max(0, cy);
      const sw = Math.min(m.w * 16 - sx, vw - (sx - cx)), sh = Math.min(m.h * 16 - sy, vh - (sy - cy));
      if (sw > 0 && sh > 0) ctx.drawImage(m.ground, sx, sy, sw, sh, sx - cx, sy - cy, sw, sh);
      const x0 = Math.max(0, cx >> 4), x1 = Math.min(m.w - 1, (cx + vw) >> 4), y0 = Math.max(0, cy >> 4), y1 = Math.min(m.h - 1, (cy + vh) >> 4);
      // animasyonlu su
      if (m.hasWater) {
        const f = Math.floor(this.t * 2.5);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          if (m.tiles[y * m.w + x] !== T.WATER) continue;
          const px = x * 16 - cx, py = y * 16 - cy;
          ctx.drawImage(TS.water((f + x + y * 2) % 3), px, py);
          const up = this.tile(m, x, y - 1);
          if (up !== T.WATER) { ctx.fillStyle = '#2c5f8f'; ctx.fillRect(px, py, 16, 3); ctx.fillStyle = (f % 2) ? '#cfe9f7' : '#a4d6f6'; ctx.fillRect(px + ((f * 3 + x) % 6), py + 3, 6, 1); }
          if (this.tile(m, x - 1, y) !== T.WATER) { ctx.fillStyle = '#2c5f8f'; ctx.fillRect(px, py, 1, 16); }
          if (this.tile(m, x + 1, y) !== T.WATER) { ctx.fillStyle = '#2c5f8f'; ctx.fillRect(px + 15, py, 1, 16); }
          if (this.tile(m, x, y + 1) !== T.WATER) { ctx.fillStyle = '#7cc0ee'; ctx.fillRect(px, py + 15, 16, 1); }
        }
      }
      // düz nesneler
      const list = [];
      const L = cx - 64, Rr = cx + vw + 64, Tp = cy - 16, B = cy + vh + 120;
      this.drawShadows(m, ctx, cx, cy, L, Rr, Tp, B);
      for (const o of m.objects) {
        if (o.hidden || o.x < L || o.x > Rr || o.y < Tp || o.y > B) continue;
        if (o.flat) this.drawObj(o, ctx, cx, cy); else list.push(o);
      }
      // yerdeki eşyalar
      for (const d of m.drops) {
        const ic = AK.Icons.forStack(d.st);
        if (ic) ctx.drawImage(ic, Math.round(d.x - 8 - cx), Math.round(d.y - 14 - cy + Math.sin(this.t * 4 + d.x) * 1.5));
      }
      AK.NPCs.collect(m.id, list);
      AK.Customers.collect(m.id, list);
      if (AK.Game.playing) list.push(AK.Player);
      const sortOf = e => (e.sortY != null ? e.sortY : e.y);
      list.sort((a, b) => sortOf(a) - sortOf(b));
      for (const e of list) { if (e.render) e.render(ctx, cx, cy); else this.drawObj(e, ctx, cx, cy); }
      // hedef karesi
      if (showTarget) {
        const tg = AK.Player.target;
        if (tg) {
          ctx.strokeStyle = tg.ok ? 'rgba(255,248,224,0.85)' : 'rgba(255,120,100,0.55)';
          ctx.lineWidth = 1;
          ctx.strokeRect(tg.tx * 16 - cx + 0.5, tg.ty * 16 - cy + 0.5, 15, 15);
        }
      }
      // parçacıklar
      for (const p of this.fx) {
        const a = 1 - p.t / p.life;
        ctx.globalAlpha = p.smoke ? a * 0.5 : Math.min(1, a * 1.5);
        ctx.fillStyle = p.c;
        const sz = p.smoke ? Math.round(2 + p.t * 2) : p.sz;
        ctx.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), sz, sz);
        if (p.star && a > 0.5) { ctx.fillRect(Math.round(p.x - cx) - 1, Math.round(p.y - cy), 3, 1); ctx.fillRect(Math.round(p.x - cx), Math.round(p.y - cy) - 1, 1, 3); }
      }
      ctx.globalAlpha = 1;
      this.drawLighting(ctx, m, cx, cy);
      AK.Weather.draw(ctx, vw, vh, m.outdoor);
    },
    // ---------------- ışıklandırma ----------------
    drawLighting(ctx, m, cx, cy) {
      const vw = this.vw, vh = this.vh;
      let amb = m.outdoor ? AK.Time.ambient() : (m.ambient ? m.ambient(m) : [255, 255, 255]);
      const avg = (amb[0] + amb[1] + amb[2]) / 3;
      if (avg >= 252 || vw < 1 || vh < 1) return;
      if (!this.light || this.light.width !== vw || this.light.height !== vh) this.light = G.canvas(vw, vh);
      const lg = this.light.g;
      lg.globalCompositeOperation = 'source-over';
      lg.fillStyle = `rgb(${amb[0] | 0},${amb[1] | 0},${amb[2] | 0})`;
      lg.fillRect(0, 0, vw, vh);
      lg.globalCompositeOperation = 'lighter';
      const str = m.outdoor ? U.clamp((235 - avg) / 120, 0, 1) : 1;
      const lights = [], emit = [];
      if (str > 0.02) {
        for (const o of m.objects) {
          if (o.hidden) continue;
          if (o.light) { const l = typeof o.light === 'function' ? o.light(o) : o.light; if (l) (Array.isArray(l) ? l : [l]).forEach(li => lights.push(Object.assign({ x: o.x + (li.dx || 0), y: o.y + (li.dy || 0) }, li))); }
          if (o.emit && o._spr) {
            const s = o._spr, bx = o.x - s.width / 2, by = o.y - s.height;
            for (const r of o.emit) { emit.push([bx + r[0], by + r[1], r[2], r[3]]); lights.push({ x: bx + r[0] + r[2] / 2, y: by + r[1] + r[3] + 6, r: 26, c: '#ffc870', a: 0.55 }); }
          }
        }
        if (m.lights) m.lights(m).forEach(l => lights.push(l));
        const P = AK.Player;
        if (m.lantern || (m.outdoor && avg < 150 && m.id !== 'town')) {
          const lv = AK.state.flags.lantern ? 2 : 1;
          lights.push({ x: P.x, y: P.y - 10, r: lv === 2 ? 84 : 56, c: '#ffe0a8', a: 0.95, fl: true });
        }
      }
      for (const l of lights) {
        const x = l.x - cx, y = l.y - cy;
        let r = l.r || 40;
        if (l.fl) r *= 1 + Math.sin(this.t * 9 + l.x) * 0.04 + Math.sin(this.t * 23 + l.y) * 0.02;
        if (x < -r || x > vw + r || y < -r || y > vh + r) continue;
        const gr = lg.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, G.rgba(l.c || '#ffd890', (l.a == null ? 0.8 : l.a) * str));
        gr.addColorStop(1, G.rgba(l.c || '#ffd890', 0));
        lg.fillStyle = gr;
        lg.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(this.light, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      if (str > 0.1) {
        ctx.fillStyle = `rgba(255,214,120,${0.85 * str})`;
        for (const e of emit) ctx.fillRect(Math.round(e[0] - cx), Math.round(e[1] - cy), e[2], e[3]);
      }
    },
  };
})();
