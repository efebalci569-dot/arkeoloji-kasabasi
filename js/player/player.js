// Oyuncu: hareket, çarpışma, alet kullanımı, etkileşim, animasyon.
(function () {
  const U = AK.U, G = AK.Gfx, In = AK.Input;
  const toolRot = G.memo((kind, lvl, q, flip) => { let c = G.rot(AK.Icons.tool(kind, lvl), q); if (flip) c = G.flip(c); return c; });

  const P = AK.Player = {
    x: 0, y: 0, dir: 'down', moving: false, animT: 0, step: 0, stepSnd: 0,
    act: null, hold: null, holdT: 0, target: null, isEnt: true, signal: 0, beepT: 0,
    get look() { return AK.state.player.look; },
    stop() { this.moving = false; this.act = null; this.step = 0; if (this.seated) { this.seated = null; this.sortY = null; } },
    // ---------------- oturma ----------------
    sitOn(o) {
      if (this.seated) { this.standUp(); return; }
      const seats = o.seats || [];
      if (!seats.length) return;
      const m = AK.World.cur;
      const taken = s => AK.NPCs.list.concat(AK.NPCs.tourists).some(n => n.map === m.id && n.sitting && Math.abs(n.x - s.x) < 3 && Math.abs(n.y - s.y) < 3) ||
        m.objects.some(e => (e.kind === 'mnpc' || e.kind === 'patron') && !e.hidden && Math.abs(e.x - s.x) < 3 && Math.abs(e.y - s.y) < 3);
      const free = seats.filter(s => !taken(s)).sort((a, b) => Math.hypot(a.x - this.x, a.y - this.y) - Math.hypot(b.x - this.x, b.y - this.y));
      if (!free.length) { AK.UI.toast('Burası dolu.', 'lock'); return; }
      const st = free[0];
      this.seated = { o, st, px: this.x, py: this.y, t: 0, rest: 0 };
      this.x = st.x; this.y = st.y; this.dir = st.dir; this.sortY = st.sort; this.moving = false; this.act = null;
      AK.Audio.sfx('step');
      if (!AK.state.flags.tipSit) { AK.state.flags.tipSit = true; AK.UI.toast('Oturdun. Kalkmak için yürü ya da E\'ye bas. Oturmak seni yavaşça dinlendirir.', 'heart'); }
    },
    standUp() {
      const s = this.seated;
      if (!s) return;
      this.seated = null; this.sortY = null;
      this.x = s.px; this.y = s.py;
      AK.Audio.sfx('step');
    },
    // ---------------- çarpışma ----------------
    free(nx, ny) {
      const m = AK.World.cur;
      const x0 = Math.floor((nx - 5) / 16), x1 = Math.floor((nx + 4) / 16), y0 = Math.floor((ny - 5) / 16), y1 = Math.floor((ny - 1) / 16);
      for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (AK.World.solid(m, tx, ty)) return false;
      return true;
    },
    dirVec(d) { return { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d || this.dir]; },
    ipoint() {
      const d = this.dir;
      if (d === 'up') return [this.x, this.y - 14];
      if (d === 'down') return [this.x, this.y + 10];
      return [this.x + (d === 'right' ? 13 : -13), this.y - 4];
    },
    mouseWorld() {
      const M = In.mouse, s = AK.Game.scale;
      if (!M.onCanvas) return null;
      return [M.cx / s + AK.World.cam.x, M.cy / s + AK.World.cam.y];
    },
    // ---------------- güncelleme ----------------
    update(dt) {
      if (this.seated) {
        this.seated.t += dt;
        this.moving = false; this.target = null; this.signal = 0;
        const moveKey = In.down('up') || In.down('down') || In.down('left') || In.down('right');
        if (this.seated.t > 0.35 && (moveKey || In.hit('interact') || In.hit('use') || In.mouse.clicked[0] || In.mouse.clicked[2])) { this.standUp(); In.eat('interact'); }
        return;
      }
      if (this.holdT > 0) { this.holdT -= dt; if (this.holdT <= 0) this.hold = null; this.moving = false; return; }
      if (this.act) {
        const a = this.act;
        a.t += dt;
        if (!a.fired && a.t >= a.hitAt) { a.fired = true; a.fn(); }
        if (a.t >= a.dur) this.act = null;
        return;
      }
      // hareket
      let dx = (In.down('right') ? 1 : 0) - (In.down('left') ? 1 : 0);
      let dy = (In.down('down') ? 1 : 0) - (In.down('up') ? 1 : 0);
      this.moving = dx !== 0 || dy !== 0;
      if (this.moving) {
        if (dx !== 0 && dy === 0) this.dir = dx > 0 ? 'right' : 'left';
        else if (dy !== 0 && dx === 0) this.dir = dy > 0 ? 'down' : 'up';
        else if (dx !== 0 && dy !== 0 && !['left', 'right', 'up', 'down'].includes(this.dir)) this.dir = 'down';
        else if (dx !== 0 && dy !== 0) { const want = [dx > 0 ? 'right' : 'left', dy > 0 ? 'down' : 'up']; if (!want.includes(this.dir)) this.dir = want[0]; }
        const run = In.down('run');
        let sp = (run ? 112 : 74) * (AK.state.player.energy <= 0 ? 0.6 : 1);
        const len = Math.hypot(dx, dy);
        const mx = dx / len * sp * dt, my = dy / len * sp * dt;
        if (mx && this.free(this.x + mx, this.y)) this.x += mx;
        else if (mx && !dy) { for (const s of [-1, 1]) if (this.free(this.x + mx, this.y + s * 5) && this.free(this.x, this.y + s * sp * dt)) { this.y += s * sp * dt * 0.8; break; } }
        if (my && this.free(this.x, this.y + my)) this.y += my;
        else if (my && !dx) { for (const s of [-1, 1]) if (this.free(this.x + s * 6, this.y + my) && this.free(this.x + s * sp * dt, this.y)) { this.x += s * sp * dt * 0.8; break; } }
        this.animT += dt * (run ? 12 : 8);
        this.step = Math.floor(this.animT) % 4;
        this.stepSnd -= dt;
        if (this.stepSnd <= 0) { this.stepSnd = run ? 0.24 : 0.34; AK.Audio.sfx('step'); }
        AK.World.checkWarp();
      } else { this.step = 0; this.animT = 0; }
      // hızlı erişim çubuğu
      for (let i = 0; i < 10; i++) if (In.code('Digit' + ((i + 1) % 10))) { AK.Inv.select(i); AK.UI.showToolName(); }
      if (In.mouse.wheel) { AK.Inv.select((AK.state.inv.sel + (In.mouse.wheel > 0 ? 1 : 9)) % 10); AK.UI.showToolName(); }
      this.computeTarget();
      this.updateDetector(dt);
      if (In.hit('interact') || In.mouse.clicked[2]) this.interact(In.mouse.clicked[2]);
      else if (In.hit('use')) this.use(false);
      else if (In.mouse.clicked[0]) this.use(true);
    },
    computeTarget() {
      const m = AK.World.cur;
      let tx, ty, mouse = false;
      const mw = this.mouseWorld();
      if (mw && U.dist(mw[0], mw[1], this.x, this.y - 6) < 30) {
        tx = Math.floor(mw[0] / 16); ty = Math.floor(mw[1] / 16); mouse = true;
      } else { const [px, py] = this.ipoint(); tx = Math.floor(px / 16); ty = Math.floor(py / 16); }
      const st = AK.Inv.selected(), def = st && AK.Items.get(st.id);
      if (def && def.type === 'tool' && def.tool !== 'detector') {
        const o = AK.World.objAtTile(m, tx, ty);
        const ok = !!(o && o.hit) || (def.tool === 'shovel' && AK.Tiles.digLevel(AK.World.tile(m, tx, ty)) > 0);
        this.target = (m.digsite || ok) ? { tx, ty, ok, mouse } : null;
      } else this.target = null;
      this.mouseT = mouse ? [tx, ty] : null;
    },
    faceTo(tx, ty) {
      const dx = tx * 16 + 8 - this.x, dy = ty * 16 + 8 - (this.y - 6);
      if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? 'right' : 'left'; else this.dir = dy > 0 ? 'down' : 'up';
    },
    // ---------------- etkileşim ----------------
    findInteract(useMouse) {
      const m = AK.World.cur;
      let pts = [this.ipoint(), [this.x, this.y - 4]];
      const mw = this.mouseWorld();
      if (useMouse && mw && U.dist(mw[0], mw[1], this.x, this.y - 8) < 40) pts = [mw];
      for (const [px, py] of pts) {
        const n = AK.NPCs.at(m.id, px, py) || AK.Customers.at(m.id, px, py);
        if (n) return { npc: n };
        const o = AK.World.intAt(m, px, py);
        if (o) return { obj: o };
      }
      return null;
    },
    interact(useMouse) {
      const f = this.findInteract(useMouse);
      if (!f) return false;
      if (f.npc) { this.faceTo(Math.floor(f.npc.x / 16), Math.floor((f.npc.y - 4) / 16)); f.npc.talk ? f.npc.talk() : AK.NPCs.talk(f.npc); }
      else if (f.obj) f.obj.int(f.obj);
      return true;
    },
    use(mouse) {
      const st = AK.Inv.selected(), def = st && AK.Items.get(st.id);
      if (mouse) {
        // fareyle tıklanan şey etkileşimliyse önce onu kullan
        const f = this.findInteract(true);
        if (f && (!def || def.type !== 'tool' || f.npc)) { this.interact(true); return; }
      }
      if (!def) { if (!mouse) this.interact(); return; }
      if (def.type === 'food') return this.eat(st);
      if (def.type !== 'tool') { if (!this.interact(mouse)) AK.UI.toast('Bunu bir yere koymak için sergi masası, müze ya da vitrinle etkileşime geç.', 'bag'); return; }
      if (def.tool === 'detector') { AK.UI.toast(this.signal > 0.9 ? 'Sinyal çok güçlü! Tam önündeki toprağı kürekle kaz.' : this.signal > 0 ? 'Sinyal var... yaklaştıkça bip sesi hızlanır.' : 'Burada sinyal yok.', 'star'); return; }
      const tool = def.tool, cost = AK.Exc.cost(tool);
      if (AK.state.player.energy < cost) { AK.UI.toast('Çok yorgunsun! Bir şeyler ye ya da dinlen.', 'energy'); AK.Audio.sfx('error'); return; }
      if (this.target && this.target.mouse) this.faceTo(this.target.tx, this.target.ty);
      const tg = this.target || (() => { const [px, py] = this.ipoint(); return { tx: Math.floor(px / 16), ty: Math.floor(py / 16) }; })();
      const lv = AK.state.tools[tool] || 1;
      const dur = tool === 'brush' ? 0.36 : 0.44 - 0.035 * (lv - 1);
      this.act = {
        kind: tool === 'brush' ? 'brush' : 'swing', tool, t: 0, dur, hitAt: dur * (tool === 'brush' ? 0.5 : 0.58), fired: false,
        fn: () => {
          const r = AK.Exc.use(tool, tg.tx, tg.ty);
          if (r && r.ok) { AK.Game.useEnergy(r.cost || 0); AK.Bus.emit('toolUse', tool); }
          else if (r && r.msg) { AK.UI.toast(r.msg, 'lock'); if (!r.silent) AK.Audio.sfx('error'); }
          else AK.Audio.sfx(tool === 'brush' ? 'brush' : 'dig');
        },
      };
    },
    eat(st) {
      const def = AK.Items.get(st.id);
      const p = AK.state.player;
      if (p.energy >= p.maxEnergy) { AK.UI.toast('Şu an aç değilsin.', 'energy'); return; }
      AK.Inv.removeAt(AK.state.inv.sel, 1);
      p.energy = Math.min(p.maxEnergy, p.energy + def.energy);
      AK.Audio.sfx('eat');
      this.hold = { id: st.id, n: 1 }; this.holdT = 0.6;
      AK.World.float(this.x, this.y - 30, `+${def.energy} enerji`, '#7cf06a');
    },
    holdUp(st) { this.hold = st; this.holdT = 1.2; this.act = null; this.moving = false; },
    updateDetector(dt) {
      const st = AK.Inv.selected();
      const m = AK.World.cur;
      this.signal = 0;
      if (!st || st.id !== 'detector' || !m.hidden || !m.hidden.length) return;
      const used = AK.Exc.dstate(m.id).used;
      const lv = AK.state.tools.detector || 1, range = 4 + lv * 2;
      const [px, py] = this.ipoint(), tx = Math.floor(px / 16), ty = Math.floor(py / 16);
      let best = 99;
      for (const h of m.hidden) if (!used.includes(h.sid)) best = Math.min(best, Math.hypot(h.tx - tx, h.ty - ty));
      if (best === 0) this.signal = 1; else this.signal = Math.max(0, 1 - best / range) * 0.9;
      if (this.signal > 0) {
        this.beepT -= dt;
        if (this.beepT <= 0) { this.beepT = U.lerp(1.1, 0.12, this.signal); AK.Audio.sfx('beep'); }
      }
    },
    // ---------------- çizim ----------------
    render(ctx, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      ctx.fillStyle = 'rgba(40,24,48,0.28)'; ctx.fillRect(x - 5, y - 2, 10, 3); ctx.fillRect(x - 4, y - 3, 8, 5);
      let anim = 'idle', step = 0, dir = this.dir;
      const a = this.act;
      let toolDraw = null;
      if (this.seated) { anim = 'sit'; }
      else if (this.hold) { anim = 'hold'; dir = 'down'; }
      else if (a) {
        const ph = a.t / a.dur;
        if (a.kind === 'brush') { anim = 'brush'; step = Math.floor(a.t * 12) % 2; }
        else anim = ph < 0.58 ? 'raise' : 'strike';
        toolDraw = { kind: a.tool, phase: anim };
      } else if (this.moving) { anim = 'walk'; step = this.step; }
      const spr = AK.Chars.get(this.look, dir, anim, step);
      const sx = x - 8, sy = y - 27;
      const lv = toolDraw ? (AK.state.tools[toolDraw.kind] || 1) : 1;
      const drawTool = () => {
        const k = toolDraw.kind, ph = toolDraw.phase;
        let c, ox, oy;
        if (ph === 'brush') {
          c = toolRot(k, lv, 0, dir === 'left');
          if (dir === 'right') { ox = 3; oy = -18 + step; } else if (dir === 'left') { ox = -19; oy = -18 + step; } else if (dir === 'down') { ox = -8 + step * 2; oy = -12; } else { ox = -8 + step * 2; oy = -30; }
        } else if (dir === 'down') { if (ph === 'raise') { c = toolRot(k, lv, 0, 0); ox = -3; oy = -38; } else { c = toolRot(k, lv, 2, 0); ox = -9; oy = -12; } }
        else if (dir === 'up') { if (ph === 'raise') { c = toolRot(k, lv, 0, 0); ox = -9; oy = -34; } else { c = toolRot(k, lv, 0, 0); ox = -9; oy = -44; } }
        else { const f = dir === 'left'; if (ph === 'raise') { c = toolRot(k, lv, 3, f); ox = f ? 0 : -16; oy = -36; } else { c = toolRot(k, lv, 1, f); ox = f ? -18 : 2; oy = -20; } }
        ctx.drawImage(c, x + ox, y + oy);
      };
      const behind = toolDraw && (dir === 'up' || (toolDraw.phase === 'raise' && dir !== 'down'));
      if (toolDraw && behind) drawTool();
      ctx.drawImage(spr, sx, sy);
      if (toolDraw && !behind) drawTool();
      if (this.hold) {
        const ic = AK.Icons.forStack(this.hold);
        if (ic) ctx.drawImage(ic, x - 8, y - 46 + Math.round(Math.sin(AK.World.t * 6)));
      }
      if (this.signal > 0) {
        const bars = Math.ceil(this.signal * 4);
        for (let i = 0; i < 4; i++) { ctx.fillStyle = i < bars ? (this.signal > 0.95 ? '#7cf06a' : '#f2c14e') : 'rgba(40,24,48,0.5)'; ctx.fillRect(x - 6 + i * 3, y - 36 - i * 2, 2, 2 + i * 2); }
      }
    },
  };
})();
