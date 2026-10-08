// Kazı sistemi: alet kullanımı, çukurlar, eser/kaynak verme, günlük kazı durumu.
(function () {
  const U = AK.U, W = AK.World, TS = AK.Tiles, T = AK.T;
  const RES_NAMES = () => AK.Items.D;
  const Exc = AK.Exc = {
    COST: { shovel: 4, pickaxe: 4, hammer: 5, brush: 1, detector: 0 },
    cost(tool) {
      const lv = AK.state.tools[tool] || 1;
      let c = this.COST[tool] - (lv - 1);
      if (tool === 'shovel') c += AK.Weather.digEnergyMod();
      return Math.max(tool === 'detector' ? 0 : 1, c);
    },
    dstate(mapId) {
      let d = AK.state.dig[mapId];
      const day = AK.Time.abs();
      if (!d || d.day !== day) d = AK.state.dig[mapId] = { day, used: [], holes: [] };
      return d;
    },
    markUsed(mapId, sid) { this.dstate(mapId).used.push(sid); },
    // ---------------- alet kullanımı ----------------
    use(tool, tx, ty) {
      const m = W.cur, lv = AK.state.tools[tool] || 1;
      const o = W.objAtTile(m, tx, ty);
      if (o && o.hit) { const r = o.hit(o, tool, lv); if (r) return r; }
      if (o && (o.kind === 'tree' || o.kind === 'bush')) return { ok: false, msg: 'Doğaya zarar vermek istemezsin.' };
      if (tool === 'shovel') return this.digTile(m, tx, ty, lv);
      if (tool === 'pickaxe' || tool === 'hammer') return { ok: false, msg: 'Burada kırılacak bir şey yok.', silent: true };
      if (tool === 'brush') return { ok: false, msg: 'Burada fırçalanacak bir şey yok.', silent: true };
      return { ok: false, silent: true };
    },
    digTile(m, tx, ty, lv) {
      const t = W.tile(m, tx, ty), need = TS.digLevel(t);
      if (!need) return { ok: false, msg: m.digsite ? 'Burası kazı toprağı değil. Kahverengi kazı alanlarını ara.' : 'Burayı kazamazsın.', silent: !m.digsite };
      if (W.solid(m, tx, ty)) return { ok: false, silent: true };
      if (need > lv) return { ok: false, msg: 'Bu toprak çok sert! Kürek Seviye 3 (Çelik Kürek) gerekli.' };
      const st = this.dstate(m.id), idx = ty * m.w + tx;
      if (st.holes.includes(idx)) return { ok: false, msg: 'Burayı zaten kazdın.' };
      st.holes.push(idx);
      this.addHole(m, tx, ty);
      const x = tx * 16 + 8, y = ty * 16 + 10;
      W.burst(x, y, ['#6e4426', '#8b5a36', '#a8734a'], 8, 40);
      AK.Audio.sfx('dig');
      AK.state.stats.dug++;
      const hs = (m.hidden || []).find(h => h.tx === tx && h.ty === ty && !st.used.includes(h.sid));
      if (hs) {
        st.used.push(hs.sid);
        W.sparkle(x, y - 6, '#fff2b0', 14);
        this.giveArtifact(AK.Loot.artifact(m.region, hs.rar), x, y - 8);
      } else {
        const L = AK.Loot.soil(m.region);
        if (L && L.art) this.giveArtifact(L.art, x, y - 8);
        else if (L && L.res) this.giveRes(L.res, L.n, x, y - 8);
        else if (Math.random() < 0.4) W.float(x, y - 10, 'Sadece toprak...', '#e8d6b0');
      }
      return { ok: true, cost: Exc.cost('shovel') };
    },
    addHole(m, tx, ty) {
      const sand = W.tile(m, tx, ty) === T.SANDDIG || W.tile(m, tx, ty) === T.HARDSAND;
      W.add(m, { kind: 'hole', daily: true, flat: true, tx, ty, x: tx * 16 + 8, y: ty * 16 + 16, spr: AK.Spr.hole(sand ? 1 : 0) });
    },
    // ---------------- ödüller ----------------
    giveArtifact(id, x, y, opts) {
      opts = opts || {};
      const def = AK.Artifacts.get(id);
      if (!def) return;
      const st = { id, d: def.fixed ? 0 : 1, q: 1, r: 0 };
      const f = AK.state.found[id];
      const isNew = !f;
      AK.state.found[id] = { n: (f ? f.n : 0) + 1, day: f ? f.day : AK.Time.abs(), res: f ? f.res : false };
      AK.state.daylog.found.push(id);
      if (AK.Inv.canAdd(st)) AK.Inv.add(st);
      else { W.drop(W.cur, x, y + 8, st); AK.UI.toast('Çantan dolu! Eser yere bırakıldı.', 'bag'); }
      AK.Player.holdUp(st);
      AK.UI.banner(def, isNew, !!st.d);
      AK.Audio.stinger(def.rar);
      W.sparkle(x, y - 6, AK.Artifacts.rarityCol(def.rar), 8 + def.rar * 6);
      if (def.rar >= 3) W.shake = 2;
      AK.Bus.emit('found', st, def, isNew);
    },
    giveRes(id, n, x, y) {
      const st = { id, n };
      if (AK.Inv.canAdd(st)) AK.Inv.add(st); else { W.drop(W.cur, x, y + 8, { id, n }); AK.UI.toast('Çantan dolu!', 'bag'); }
      W.float(x, y - 4, `+${n} ${RES_NAMES()[id].name}`, '#fff6e0');
      AK.Audio.sfx('pickup');
      AK.Bus.emit('resource', id, n);
    },
    treasure(x, y) {
      const r = Math.random();
      if (r < 0.25) { const n = U.ri(80, 250); AK.Game.addMoney(n, 'Hazine'); W.float(x, y, `+${n} altın`, '#f2c14e'); AK.Audio.sfx('coin'); }
      else if (r < 0.55) this.giveArtifact(AK.Loot.artifact('orman', AK.Loot.rollRarity(0.4)), x, y);
      else if (r < 0.8) this.giveRes(U.pick(['kuvars', 'metal', 'ametist']), U.ri(1, 3), x, y);
      else { const it = U.pick(['kebap', 'borek', 'kart', 'figur']); this.giveRes(it, 1, x, y); }
      W.sparkle(x, y, '#f2c14e', 16);
    },
    // ---------------- ortak nesne davranışları ----------------
    hitFx(o, cols, sfx) {
      o.shakeT = 0.2;
      W.burst(o.x, o.y - 8, cols, 6, 35);
      AK.Audio.sfx(sfx);
    },
    breakObj(m, o) {
      this.markUsed(m.id, o.sid);
      W.remove(m, o);
      AK.Audio.sfx('break');
    },
    // sallanma animasyonu için ofset
    wobble(o, dt) { if (o.shakeT > 0) { o.shakeT -= dt; o.ox = Math.round(Math.sin(o.shakeT * 60) * 1.5); } else o.ox = 0; },
  };
})();
