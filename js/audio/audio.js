// WebAudio ile prosedürel müzik ve ses efektleri (harici dosya yok).
(function () {
  const U = AK.U;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // parçalar: tempo, kök, mod, akor ilerleyişi, enstrüman ayarları
  const TRACKS = {
    town: { bpm: 92, root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], lead: 'triangle', dens: 0.62, hat: true, pad: 0.035, bass: 0.09, seed: 11 },
    night: { bpm: 68, root: 57, scale: [0, 2, 4, 7, 9, 11], prog: [0, 3, 5, 4], lead: 'sine', dens: 0.35, hat: false, pad: 0.04, bass: 0.06, seed: 23, bell: true },
    dig: { bpm: 84, root: 57, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 6, 5, 4], lead: 'triangle', dens: 0.5, hat: true, pad: 0.035, bass: 0.08, seed: 37 },
    cave: { bpm: 60, root: 50, scale: [0, 2, 3, 7, 8], prog: [0, 0, 5, 4], lead: 'sine', dens: 0.22, hat: false, pad: 0.05, bass: 0.07, seed: 41, bell: true, drone: true },
    shop: { bpm: 104, root: 62, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 3, 4, 0], lead: 'square', dens: 0.55, hat: true, pad: 0.03, bass: 0.08, seed: 53 },
    museum: { bpm: 76, root: 58, scale: [0, 2, 4, 7, 9, 11], prog: [0, 5, 3, 4], lead: 'sine', dens: 0.42, hat: false, pad: 0.045, bass: 0.06, seed: 67, bell: true },
    desert: { bpm: 88, root: 55, scale: [0, 1, 4, 5, 7, 8, 10], prog: [0, 1, 0, 6], lead: 'triangle', dens: 0.5, hat: true, pad: 0.03, bass: 0.08, seed: 79 },
    title: { bpm: 80, root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 3, 5, 4], lead: 'triangle', dens: 0.5, hat: false, pad: 0.04, bass: 0.07, seed: 3, bell: true },
    bar: { bpm: 100, root: 57, scale: [0, 1, 4, 5, 7, 8, 10], prog: [0, 3, 4, 0], lead: 'triangle', dens: 0.6, hat: true, pad: 0.035, bass: 0.1, seed: 131 },
    festival: { bpm: 118, root: 62, scale: [0, 2, 4, 5, 7, 9], prog: [0, 3, 4, 4], lead: 'square', dens: 0.75, hat: true, pad: 0.03, bass: 0.1, seed: 97 },
  };
  // 7 notalık diziden derece → yarım ton
  function deg(sc, d) { const n = sc.length; const o = Math.floor(d / n); return sc[((d % n) + n) % n] + 12 * o; }

  function compose(tr) {
    const r = U.rng(tr.seed);
    const bars = 8, steps = 8;
    const motifA = [], motifB = [];
    const gen = (arr) => {
      let d = 2 + ((r() * 3) | 0);
      for (let s = 0; s < steps * 2; s++) {
        if (r() < tr.dens || s % 4 === 0) { d += U.pick([-2, -1, -1, 1, 1, 2, 0], r); d = U.clamp(d, 0, tr.scale.length * 2); arr.push({ s, d, len: r() < 0.3 ? 2 : 1 }); }
      }
    };
    gen(motifA); gen(motifB);
    const notes = [];
    [motifA, motifA, motifB, motifA].forEach((m, i) => m.forEach(n => notes.push({ s: i * steps * 2 + n.s, d: n.d + (i === 2 ? 1 : 0), len: n.len })));
    return { notes, len: bars * steps };
  }

  const A = AK.Audio = {
    ctx: null, master: null, mus: null, sfxG: null, vol: { music: 0.55, sfx: 0.7 },
    cur: null, want: null, song: null, step: 0, nextT: 0, timer: null, ready: false,
    noiseBuf: null, rainNode: null, rainGain: null,
    unlock() {
      if (this.ready) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain(); this.master.gain.value = 0.8;
        const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
        this.master.connect(lp); lp.connect(this.ctx.destination);
        this.mus = this.ctx.createGain(); this.mus.gain.value = this.vol.music;
        this.sfxG = this.ctx.createGain(); this.sfxG.gain.value = this.vol.sfx;
        // yankı
        this.delay = this.ctx.createDelay(1); this.delay.delayTime.value = 0.32;
        this.fb = this.ctx.createGain(); this.fb.gain.value = 0.28;
        this.delay.connect(this.fb); this.fb.connect(this.delay);
        this.wet = this.ctx.createGain(); this.wet.gain.value = 0.25;
        this.delay.connect(this.wet); this.wet.connect(this.master);
        this.mus.connect(this.master); this.mus.connect(this.delay);
        this.sfxG.connect(this.master);
        const len = this.ctx.sampleRate * 2;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.ready = true;
        this.timer = setInterval(() => this.sched(), 60);
        if (this.want) this.music(this.want, true);
      } catch (e) { console.warn('ses başlatılamadı', e); }
    },
    setVol(k, v) {
      this.vol[k] = v;
      if (!this.ready) return;
      (k === 'music' ? this.mus : this.sfxG).gain.value = v;
    },
    music(name, force) {
      this.want = name;
      if (!this.ready || (!force && this.cur === name)) return;
      this.cur = name;
      const tr = TRACKS[name];
      if (!tr) { this.song = null; return; }
      this.song = Object.assign({ tr }, compose(tr));
      this.step = 0;
      this.nextT = this.ctx.currentTime + 0.25;
      this.wet.gain.value = tr.bell ? 0.4 : 0.22;
    },
    sched() {
      if (!this.ready || !this.song || this.ctx.state !== 'running') return;
      const tr = this.song.tr, spb = 60 / tr.bpm / 2; // 8'lik
      while (this.nextT < this.ctx.currentTime + 0.3) {
        const st = this.step % this.song.len, t = this.nextT;
        const bar = Math.floor(st / 8), ch = tr.prog[bar % tr.prog.length];
        if (st % 8 === 0) {
          // pad akoru
          [0, 2, 4].forEach(k => this.tone(mtof(tr.root - 12 + deg(tr.scale, ch + k)), t, spb * 8, 'triangle', tr.pad, this.mus, 0.5, 0.8));
          if (tr.drone) this.tone(mtof(tr.root - 24), t, spb * 8, 'sine', 0.06, this.mus, 1, 1);
        }
        if (st % 4 === 0) this.tone(mtof(tr.root - 24 + deg(tr.scale, ch + (st % 8 === 4 ? 4 : 0))), t, spb * 3, 'triangle', tr.bass, this.mus, 0.01, 0.2);
        if (tr.hat && st % 2 === 1) this.noise(t, 0.03, 0.018, 7000, 'highpass', this.mus);
        for (const n of this.song.notes) if (n.s % this.song.len === st) {
          const f = mtof(tr.root + 12 + deg(tr.scale, n.d) - 12);
          if (tr.bell) this.bell(f, t, 0.07);
          else this.tone(f, t, spb * n.len * 0.95, tr.lead, tr.lead === 'square' ? 0.035 : 0.09, this.mus, 0.01, 0.15);
        }
        this.step++;
        this.nextT += spb;
      }
    },
    tone(f, t, dur, type, gain, dest, att = 0.01, rel = 0.1) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain, t + att);
      g.gain.setValueAtTime(gain, t + Math.max(att, dur - rel));
      g.gain.linearRampToValueAtTime(0, t + dur + rel);
      o.connect(g); g.connect(dest || this.sfxG);
      o.start(t); o.stop(t + dur + rel + 0.05);
      return o;
    },
    bell(f, t, gain, dest) {
      [1, 2.01, 3.02].forEach((m, i) => {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'sine'; o.frequency.value = f * m;
        g.gain.setValueAtTime(gain / (i + 1), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4 / (i + 1));
        o.connect(g); g.connect(dest || this.mus); o.start(t); o.stop(t + 1.5);
      });
    },
    noise(t, dur, gain, freq, type, dest, q = 1) {
      const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf;
      const f = this.ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq || 1000; f.Q.value = q;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(dest || this.sfxG);
      s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
    },
    sfx(name) {
      if (!this.ready) return;
      const t = this.ctx.currentTime;
      switch (name) {
        case 'dig': this.noise(t, 0.18, 0.5, 500, 'lowpass'); this.tone(90, t, 0.08, 'sine', 0.3, null, 0.005, 0.05); break;
        case 'pick': this.noise(t, 0.08, 0.4, 3000, 'bandpass', null, 3); this.tone(800, t, 0.04, 'square', 0.06, null, 0.002, 0.04); break;
        case 'hammer': this.tone(70, t, 0.12, 'sine', 0.45, null, 0.002, 0.1); this.noise(t, 0.12, 0.35, 1200, 'bandpass'); break;
        case 'break': this.noise(t, 0.35, 0.5, 900, 'lowpass'); this.tone(60, t, 0.2, 'triangle', 0.3); break;
        case 'brush': this.noise(t, 0.12, 0.12, 4000, 'bandpass', null, 0.7); break;
        case 'coin': this.tone(1318, t, 0.06, 'square', 0.06, null, 0.002, 0.05); this.tone(1760, t + 0.07, 0.14, 'square', 0.06, null, 0.002, 0.12); break;
        case 'step': this.noise(t, 0.04, 0.05, 600, 'lowpass'); break;
        case 'door': this.tone(110, t, 0.1, 'triangle', 0.25); this.noise(t, 0.12, 0.15, 400, 'lowpass'); break;
        case 'ui': this.tone(880, t, 0.03, 'square', 0.04, null, 0.002, 0.03); break;
        case 'open': this.tone(660, t, 0.04, 'triangle', 0.1); this.tone(990, t + 0.05, 0.06, 'triangle', 0.08); break;
        case 'close': this.tone(990, t, 0.04, 'triangle', 0.08); this.tone(660, t + 0.05, 0.06, 'triangle', 0.08); break;
        case 'error': this.tone(140, t, 0.15, 'square', 0.05); break;
        case 'pickup': this.tone(784, t, 0.05, 'triangle', 0.12); this.tone(1175, t + 0.05, 0.08, 'triangle', 0.1); break;
        case 'eat': for (let i = 0; i < 3; i++) this.noise(t + i * 0.09, 0.05, 0.2, 1800, 'bandpass', null, 2); break;
        case 'sleep': [784, 659, 523, 392].forEach((f, i) => this.tone(f, t + i * 0.18, 0.3, 'sine', 0.1)); break;
        case 'quest': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, t + i * 0.08, 0.18, 'triangle', 0.1)); break;
        case 'upgrade': [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, t + i * 0.07, 0.25, 'square', 0.05)); break;
        case 'crack': this.noise(t, 0.08, 0.3, 2500, 'highpass'); this.tone(300, t, 0.05, 'square', 0.05); break;
        case 'chisel': this.tone(1500, t, 0.03, 'square', 0.05); this.noise(t, 0.06, 0.25, 2000, 'bandpass'); break;
        case 'thunder': this.noise(t, 1.6, 0.6, 160, 'lowpass'); break;
        case 'page': this.noise(t, 0.12, 0.12, 3000, 'highpass'); break;
        case 'beep': this.tone(1600, t, 0.04, 'sine', 0.08); break;
        case 'splash': this.noise(t, 0.3, 0.3, 1200, 'bandpass'); break;
        case 'heart': this.tone(659, t, 0.08, 'sine', 0.1); this.tone(988, t + 0.09, 0.15, 'sine', 0.1); break;
      }
    },
    // nadirliğe göre keşif melodisi
    stinger(rar) {
      if (!this.ready) return;
      const t = this.ctx.currentTime;
      const base = [72, 74, 76, 79, 84][rar];
      const seq = [0, 4, 7, 12, 16, 19].slice(0, 2 + rar + (rar >= 3 ? 1 : 0));
      this.mus.gain.setTargetAtTime(this.vol.music * 0.3, t, 0.05);
      this.mus.gain.setTargetAtTime(this.vol.music, t + 1.2 + rar * 0.3, 0.4);
      seq.forEach((s, i) => this.bell(mtof(base + s - 12), t + i * 0.11, 0.12, this.sfxG));
      if (rar >= 3) this.tone(mtof(base), t + seq.length * 0.11, 1.0, 'triangle', 0.08, this.sfxG, 0.05, 0.6);
    },
    // yağmur ambiyansı
    ambience(kind) {
      if (!this.ready) return;
      const target = kind === 'rain' ? 0.06 : kind === 'storm' ? 0.12 : 0;
      if (!this.rainNode && target > 0) {
        const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
        const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400;
        this.rainGain = this.ctx.createGain(); this.rainGain.gain.value = 0;
        s.connect(f); f.connect(this.rainGain); this.rainGain.connect(this.master); s.start();
        this.rainNode = s;
      }
      if (this.rainGain) this.rainGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.5);
    },
    // kuş cıvıltısı / cırcır böceği
    critter(kind) {
      if (!this.ready) return;
      const t = this.ctx.currentTime;
      if (kind === 'bird') {
        const f0 = 2200 + Math.random() * 1200;
        for (let i = 0; i < 2 + (Math.random() * 3 | 0); i++) {
          const o = this.ctx.createOscillator(), g = this.ctx.createGain(), tt = t + i * 0.12;
          o.type = 'sine'; o.frequency.setValueAtTime(f0, tt); o.frequency.exponentialRampToValueAtTime(f0 * 1.4, tt + 0.06);
          g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(0.025, tt + 0.01); g.gain.linearRampToValueAtTime(0, tt + 0.08);
          o.connect(g); g.connect(this.sfxG); o.start(tt); o.stop(tt + 0.1);
        }
      } else if (kind === 'cricket') {
        for (let i = 0; i < 3; i++) this.tone(4200, t + i * 0.05, 0.02, 'square', 0.006, null, 0.002, 0.01);
      } else if (kind === 'drip') {
        this.tone(1200 + Math.random() * 600, t, 0.03, 'sine', 0.05, null, 0.001, 0.2);
      }
    },
  };
})();
