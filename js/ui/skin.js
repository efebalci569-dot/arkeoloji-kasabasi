// Arayüz için piksel 9-slice çerçeve görselleri ve imleç (kodla üretilir).
(function () {
  const G = AK.Gfx, R = G.rect;
  AK.Skin = {
    init() {
      const root = document.documentElement.style;
      const set = (name, c) => root.setProperty(name, `url(${c.toDataURL()})`);
      // panel: ahşap çerçeve + parşömen
      let c = G.canvas(16, 16), g = c.g;
      R(g, 1, 0, 14, 16, '#2e1b12'); R(g, 0, 1, 16, 14, '#2e1b12');
      R(g, 1, 1, 14, 14, '#c08a4e'); R(g, 2, 2, 12, 12, '#9a6535'); R(g, 3, 3, 10, 10, '#6e4422');
      R(g, 4, 4, 8, 8, '#e8c98f'); R(g, 5, 5, 6, 6, '#f6e7c6');
      R(g, 2, 1, 12, 1, '#d9a868'); R(g, 1, 2, 1, 12, '#d0995a');
      for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { G.px(g, x, y, '#f2c14e'); }
      set('--panel-img', c);
      // slot
      c = G.canvas(12, 12); g = c.g;
      R(g, 0, 0, 12, 12, '#6e4422'); R(g, 1, 1, 10, 10, '#d9b47c'); R(g, 2, 2, 8, 8, '#ecd2a0'); R(g, 2, 2, 8, 1, '#c99a5e'); R(g, 2, 2, 1, 8, '#c99a5e');
      set('--slot-img', c);
      c = G.canvas(12, 12); g = c.g;
      R(g, 0, 0, 12, 12, '#a8241a'); R(g, 1, 1, 10, 10, '#f2c14e'); R(g, 2, 2, 8, 8, '#fff3d6'); R(g, 2, 2, 8, 1, '#f2dca0');
      set('--slotsel-img', c);
      // düğmeler
      const btn = (face, hi, lo) => { const b = G.canvas(12, 12), q = b.g; R(q, 1, 0, 10, 12, '#2e1b12'); R(q, 0, 1, 12, 10, '#2e1b12'); R(q, 1, 1, 10, 10, face); R(q, 1, 1, 10, 1, hi); R(q, 1, 1, 1, 9, hi); R(q, 1, 10, 10, 1, lo); R(q, 10, 2, 1, 8, lo); return b; };
      set('--btn-img', btn('#d9824a', '#f0a86a', '#a85a2e'));
      set('--btnh-img', btn('#e8965c', '#ffc08a', '#b8663a'));
      set('--btnd-img', btn('#a89a8a', '#c8bcae', '#7a6e62'));
      // ipucu & koyu panel
      c = G.canvas(12, 12); g = c.g;
      R(g, 1, 0, 10, 12, '#f2d39a'); R(g, 0, 1, 12, 10, '#f2d39a'); R(g, 1, 1, 10, 10, '#2b1d2a'); R(g, 2, 2, 8, 8, '#2b1d2a');
      set('--tip-img', c); set('--dark-img', c);
      // imleç
      const cur = G.rows([
        'aa.........',
        'aba........',
        'abba.......',
        'abbba......',
        'abbbba.....',
        'abbbbba....',
        'abbbbbba...',
        'abbbbaaaa..',
        'abbaba.....',
        'aba.aba....',
        'aa..aba....',
        '.....aa....',
      ], { a: '#2e1b12', b: '#fff6e0' });
      const big = G.scale(cur, 2);
      document.body.style.cursor = `url(${big.toDataURL()}) 0 0, auto`;
      const st = document.createElement('style');
      st.textContent = `.px-btn, .slot, .tab, .x-btn, .swatch, #dialog { cursor: url(${big.toDataURL()}) 0 0, pointer; }`;
      document.head.appendChild(st);
    },
  };
})();
