// Kayıt sistemi (localStorage) ve yeni oyun durumu.
(function () {
  const KEY = 'arkeoloji-kasabasi-kayit-v1';
  const U = AK.U;

  AK.newState = function (opts) {
    opts = opts || {};
    const slots = new Array(40).fill(null);
    slots[0] = { id: 'shovel' }; slots[1] = { id: 'pickaxe' }; slots[2] = { id: 'hammer' }; slots[3] = { id: 'brush' };
    slots[4] = { id: 'simit', n: 3 };
    return {
      version: 1,
      seed: (Math.random() * 1e9) | 0,
      time: { day: 1, season: 0, year: 1, min: 360 },
      player: {
        name: opts.name || 'Kâşif', map: 'house', x: 3 * 16 + 8, y: 3 * 16 + 12, dir: 'down', energy: 100, maxEnergy: 100, money: 500,
        look: opts.look || { skin: '#f0c39b', hair: '#5a3a22', hairStyle: 'short', shirt: '#c9a26a', outfit: 'vest', outfitCol: '#7a5a3a', pants: '#5a4a3a', shoes: '#4a3020', hat: 'safari', hatCol: '#d8c08a' },
      },
      inv: { cap: 20, slots, sel: 0 },
      tools: { shovel: 1, pickaxe: 1, hammer: 1, brush: 1, detector: 0 },
      found: {},
      museum: [],
      shop: { level: 1, open: true, tables: new Array(12).fill(null), orders: [], orderDay: 0, cust: {}, store: new Array(12).fill(null) },
      house: { furn: { vitrin1: true }, disp: new Array(9).fill(null), chest: new Array(24).fill(null), bedCol: '#c8553d' },
      npcs: {},
      quests: { active: [], done: [] },
      flags: {},
      weather: { today: 'gunesli', tomorrow: 'gunesli' },
      dig: {},
      stats: { earned: 0, sold: 0, dug: 0, cleaned: 0, donated: 0, orders: 0, days: 1 },
      mail: [],
      daylog: { found: [], sold: [], donated: [], earned: 0, cleaned: 0 },
      settings: { music: 0.55, sfx: 0.7 },
      law: { sus: 0, honest: 0, caught: 0, blackSales: 0, legalSales: 0, fines: 0, raid: false, lastCaught: -99 },
    };
  };

  AK.Save = {
    exists() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } },
    peek() { try { const s = JSON.parse(localStorage.getItem(KEY)); return s; } catch (e) { return null; } },
    save(silent) {
      if (!AK.state || !AK.Game.playing) return false;
      const P = AK.Player, st = AK.state;
      if (AK.World.cur) { st.player.map = AK.World.cur.id; st.player.x = P.x; st.player.y = P.y; st.player.dir = P.dir; }
      try {
        localStorage.setItem(KEY, JSON.stringify(st));
        if (!silent) AK.UI.toast('Oyun kaydedildi.', 'star');
        return true;
      } catch (e) {
        console.warn('kayıt başarısız', e);
        if (!silent) AK.UI.toast('Kayıt yapılamadı (tarayıcı depolama izni yok).', 'lock');
        return false;
      }
    },
    load() {
      let raw = null;
      try { raw = JSON.parse(localStorage.getItem(KEY)); } catch (e) { raw = null; }
      if (!raw) return false;
      const base = AK.newState();
      const st = U.merge(base, raw);
      // dizi boyutlarını güvenceye al
      st.inv.slots.length = 40; for (let i = 0; i < 40; i++) if (st.inv.slots[i] === undefined) st.inv.slots[i] = null;
      st.shop.tables.length = 12; for (let i = 0; i < 12; i++) if (st.shop.tables[i] === undefined) st.shop.tables[i] = null;
      st.house.disp.length = 9; for (let i = 0; i < 9; i++) if (st.house.disp[i] === undefined) st.house.disp[i] = null;
      AK.state = st;
      return true;
    },
    clear() { try { localStorage.removeItem(KEY); } catch (e) { /* yok */ } },
  };
})();
