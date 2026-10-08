// Ortak yardımcılar + olay yolu (event bus)
window.AK = window.AK || {};
(function () {
  const U = {};
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.ri = (a, b, r = Math.random) => a + Math.floor(r() * (b - a + 1));
  U.pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
  U.chance = (p, r = Math.random) => r() < p;
  // tohumlu rastgele sayı üreteci (mulberry32)
  U.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.hash = function (s) {
    s = String(s);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  U.h2 = function (x, y, s = 0) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  // ağırlıklı seçim
  U.wpick = function (list, wf, r = Math.random) {
    let tot = 0;
    for (const it of list) tot += Math.max(0, wf(it));
    if (tot <= 0) return list[0];
    let x = r() * tot;
    for (const it of list) { x -= Math.max(0, wf(it)); if (x <= 0) return it; }
    return list[list.length - 1];
  };
  U.shuffle = function (a, r = Math.random) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  U.fmt = n => Math.floor(n).toLocaleString('tr-TR');
  U.pad2 = n => (n < 10 ? '0' : '') + n;
  U.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  U.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  U.up = s => String(s).toLocaleUpperCase('tr-TR');
  U.clone = o => JSON.parse(JSON.stringify(o));
  // derin birleştirme (kayıt uyumluluğu için)
  U.merge = function (base, over) {
    if (Array.isArray(base) || Array.isArray(over)) return over !== undefined ? over : base;
    if (base && typeof base === 'object' && over && typeof over === 'object') {
      const out = Object.assign({}, base);
      for (const k in over) out[k] = k in base ? U.merge(base[k], over[k]) : over[k];
      return out;
    }
    return over !== undefined ? over : base;
  };
  AK.U = U;

  const handlers = {};
  AK.Bus = {
    on(ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); },
    emit(ev, ...a) {
      const list = handlers[ev];
      if (!list) return;
      for (const fn of list.slice()) { try { fn(...a); } catch (e) { console.error('[Bus]', ev, e); } }
    }
  };
})();
