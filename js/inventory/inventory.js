// Slot tabanlı envanter. İlk 10 slot hızlı erişim çubuğudur.
(function () {
  const MAXSTACK = 99;
  const Inv = AK.Inv = {
    ver: 0,
    get s() { return AK.state.inv; },
    cap() { return this.s.cap; },
    slots() { return this.s.slots; },
    touch() { this.ver++; },
    get(i) { return this.s.slots[i] || null; },
    selected() { return this.get(this.s.sel); },
    select(i) { if (i >= 0 && i < 10) { this.s.sel = i; this.touch(); } },
    // container: slot dizisi (envanter, depo, sandık) üzerinde genel ekleme
    addTo(slots, cap, st) {
      const it = AK.Items.get(st.id);
      if (!it) return false;
      if (AK.Items.stackable(st.id)) {
        let n = st.n || 1;
        for (let i = 0; i < cap && n > 0; i++) {
          const s = slots[i];
          if (s && s.id === st.id && s.n < MAXSTACK) { const add = Math.min(n, MAXSTACK - s.n); s.n += add; n -= add; }
        }
        for (let i = 0; i < cap && n > 0; i++) {
          if (!slots[i]) { const add = Math.min(n, MAXSTACK); slots[i] = { id: st.id, n: add }; n -= add; }
        }
        if (n > 0) { st.n = n; return false; }
        return true;
      }
      for (let i = 0; i < cap; i++) if (!slots[i]) { slots[i] = Object.assign({}, st); return true; }
      return false;
    },
    canAdd(st) {
      if (AK.Items.stackable(st.id)) {
        let room = 0;
        for (let i = 0; i < this.cap(); i++) { const s = this.s.slots[i]; if (!s) room += MAXSTACK; else if (s.id === st.id) room += MAXSTACK - s.n; }
        return room >= (st.n || 1);
      }
      return this.free() > 0;
    },
    free() { let n = 0; for (let i = 0; i < this.cap(); i++) if (!this.s.slots[i]) n++; return n; },
    add(st) { const ok = this.addTo(this.s.slots, this.cap(), st); this.touch(); return ok; },
    removeAt(i, n = 1) {
      const s = this.s.slots[i];
      if (!s) return null;
      let taken;
      if (s.n && s.n > n) { s.n -= n; taken = { id: s.id, n }; }
      else { this.s.slots[i] = null; taken = s; }
      this.touch();
      return taken;
    },
    count(id) { let n = 0; for (let i = 0; i < this.cap(); i++) { const s = this.s.slots[i]; if (s && s.id === id) n += s.n || 1; } return n; },
    has(id, n = 1) { return this.count(id) >= n; },
    removeId(id, n = 1) {
      if (this.count(id) < n) return false;
      for (let i = this.cap() - 1; i >= 0 && n > 0; i--) {
        const s = this.s.slots[i];
        if (s && s.id === id) { const take = Math.min(n, s.n || 1); this.removeAt(i, take); n -= take; }
      }
      return true;
    },
    find(pred) { for (let i = 0; i < this.cap(); i++) { const s = this.s.slots[i]; if (s && pred(s, i)) return i; } return -1; },
    list(pred) { const out = []; for (let i = 0; i < this.cap(); i++) { const s = this.s.slots[i]; if (s && (!pred || pred(s, i))) out.push(i); } return out; },
    swap(a, b) { const s = this.s.slots; [s[a], s[b]] = [s[b] || null, s[a] || null]; this.touch(); },
    hasTool(t) { return this.find(s => s.id === t) >= 0; },
  };
})();
