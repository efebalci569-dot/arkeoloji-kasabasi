// Klavye + fare girişi
(function () {
  const keys = {}, pressed = {};
  const MAP = {
    up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
    run: ['ShiftLeft', 'ShiftRight'],
    use: ['Space', 'KeyC'],
    interact: ['KeyE', 'KeyF', 'Enter'],
    inventory: ['KeyI', 'Tab'],
    journal: ['KeyJ'],
    collection: ['KeyK'],
    menu: ['Escape'],
  };
  const I = AK.Input = {
    keys, pressed,
    mouse: { cx: -1, cy: -1, down: [false, false, false], clicked: [false, false, false], wheel: 0, onCanvas: false },
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
      cv.addEventListener('contextmenu', e => e.preventDefault());
      cv.addEventListener('wheel', e => { I.mouse.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    },
    down(a) { return MAP[a].some(k => keys[k]); },
    hit(a) { return MAP[a].some(k => pressed[k]); },
    code(c) { return !!pressed[c]; },
    eat(a) { MAP[a].forEach(k => { delete pressed[k]; }); },
    clearAll() { for (const k in pressed) delete pressed[k]; I.mouse.clicked = [false, false, false]; },
    endFrame() {
      for (const k in pressed) delete pressed[k];
      I.mouse.clicked = [false, false, false];
      I.mouse.wheel = 0;
    }
  };
})();
