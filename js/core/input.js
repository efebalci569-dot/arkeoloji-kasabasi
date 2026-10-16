// Klavye + fare + dokunmatik girişi
(function () {
  const keys = {}, pressed = {};
  // V... kodları dokunmatik kontrollerin sanal tuşlarıdır (klavyeyle çakışmasınlar diye ayrı)
  const MAP = {
    up: ['KeyW', 'ArrowUp', 'VUp'], down: ['KeyS', 'ArrowDown', 'VDown'], left: ['KeyA', 'ArrowLeft', 'VLeft'], right: ['KeyD', 'ArrowRight', 'VRight'],
    run: ['ShiftLeft', 'ShiftRight', 'VRun'],
    use: ['Space', 'KeyC', 'VUse'],
    interact: ['KeyE', 'KeyF', 'Enter', 'VInteract'],
    inventory: ['KeyI', 'Tab'],
    journal: ['KeyJ'],
    collection: ['KeyK'],
    menu: ['Escape'],
  };
  const I = AK.Input = {
    keys, pressed,
    mouse: { cx: -1, cy: -1, down: [false, false, false], clicked: [false, false, false], wheel: 0, onCanvas: false, touch: false },
    init() {
      window.addEventListener('keydown', e => {
        const tg = e.target && e.target.tagName;
        if (tg === 'INPUT' || tg === 'TEXTAREA') return;
        if (!keys[e.code]) pressed[e.code] = true;
        keys[e.code] = true;
        if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
        AK.Bus.emit('key', e.code, e);
      });
      window.addEventListener('keyup', e => { keys[e.code] = false; });
      window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; I.mouse.down = [false, false, false]; });
      const cv = document.getElementById('game');
      cv.addEventListener('mousemove', e => { I.mouse.cx = e.clientX; I.mouse.cy = e.clientY; I.mouse.onCanvas = true; });
      cv.addEventListener('mouseleave', () => { I.mouse.onCanvas = false; });
      cv.addEventListener('mousedown', e => {
        I.mouse.cx = e.clientX; I.mouse.cy = e.clientY;
        I.mouse.down[e.button] = true; I.mouse.clicked[e.button] = true;
        AK.Audio && AK.Audio.unlock();
      });
      window.addEventListener('mouseup', e => { I.mouse.down[e.button] = false; });
      window.addEventListener('mousedown', () => { AK.Audio && AK.Audio.unlock(); });
      window.addEventListener('keydown', () => { AK.Audio && AK.Audio.unlock(); });
      // dokunma: ekrana dokunmak sol tık gibidir; imleç ekranda kalmasın diye kare sonunda unutulur
      cv.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'touch') return;
        e.preventDefault();
        I.mouse.cx = e.clientX; I.mouse.cy = e.clientY; I.mouse.onCanvas = true; I.mouse.touch = true;
        I.mouse.clicked[0] = true;
        AK.Bus.emit('canvasTap');
      });
      cv.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
      window.addEventListener('touchend', () => { AK.Audio && AK.Audio.unlock(); });
      cv.addEventListener('contextmenu', e => e.preventDefault());
      cv.addEventListener('wheel', e => { I.mouse.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    },
    down(a) { return MAP[a].some(k => keys[k]); },
    hit(a) { return MAP[a].some(k => pressed[k]); },
    code(c) { return !!pressed[c]; },
    eat(a) { MAP[a].forEach(k => { delete pressed[k]; }); },
    // sanal tuşlar (dokunmatik kontroller)
    vset(code, on) { if (on && !keys[code]) pressed[code] = true; keys[code] = !!on; },
    vtap(code) { pressed[code] = true; },
    clearAll() { for (const k in pressed) delete pressed[k]; I.mouse.clicked = [false, false, false]; },
    endFrame() {
      for (const k in pressed) delete pressed[k];
      I.mouse.clicked = [false, false, false];
      I.mouse.wheel = 0;
      if (I.mouse.touch) { I.mouse.touch = false; I.mouse.onCanvas = false; }
    }
  };
})();
