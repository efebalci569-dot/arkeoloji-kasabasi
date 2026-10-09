// Zemin karoları (16x16). Mevsime göre renk değiştirir.
(function () {
  const G = AK.Gfx;
  const T = AK.T = {
    VOID: 0, GRASS: 1, PATH: 2, PLAZA: 3, SAND: 4, WATER: 5, WOOD: 6, WALL: 7, DIG: 8, HARD: 9,
    FOREST: 10, CAVE: 11, CWALL: 12, CANOPY: 13, MARBLE: 14, SANDDIG: 15, HARDSAND: 16, CLIFF: 17,
    BRIDGE: 18, TILE: 19, CARPET: 20, DUNE: 21, SWALL: 22,
  };
  const SOLID = new Set([T.VOID, T.WATER, T.WALL, T.CWALL, T.CANOPY, T.CLIFF, T.DUNE, T.SWALL]);
  const DIGLV = { [T.DIG]: 1, [T.HARD]: 3, [T.SANDDIG]: 1, [T.HARDSAND]: 3 };
  const SOFT = new Set([T.GRASS, T.FOREST]);
  const LOW = new Set([T.PATH, T.PLAZA, T.SAND, T.DIG, T.HARD, T.SANDDIG, T.HARDSAND, T.BRIDGE]);

  // mevsimlik çim paletleri: 0 ilkbahar, 1 yaz, 2 sonbahar, 3 kış
  const GRASS = [
    { base: '#7cc45a', dk: '#5fa645', lt: '#a2dc78', ac: ['#f7a8c4', '#fff4a0', '#ffffff'] },
    { base: '#62b04a', dk: '#4b923a', lt: '#86c962', ac: ['#ffd54a', '#ff8a5c'] },
    { base: '#b4a24e', dk: '#93823c', lt: '#d0bd66', ac: ['#e0782e', '#c9452e'] },
    { base: '#e3ecf0', dk: '#c3d2dc', lt: '#ffffff', ac: ['#9fb6c4'] },
  ];
  const FOREST = [
    { base: '#5c9e48', dk: '#447f37', lt: '#79b85c' },
    { base: '#4f9440', dk: '#3b7631', lt: '#6aae55' },
    { base: '#988a44', dk: '#786b33', lt: '#b3a25a' },
    { base: '#d3dfe6', dk: '#afc0cc', lt: '#f4f8fa' },
  ];
  const CANOPY = [
    { dk: '#2f6a2e', base: '#4a8e3a', lt: '#6fb04e' },
    { dk: '#285f2a', base: '#3f8535', lt: '#5ea548' },
    { dk: '#8a4a1e', base: '#c0702a', lt: '#e09a3e' },
    { dk: '#3f5f4a', base: '#56785f', lt: '#eef4f6' },
  ];

  function grass(P, s, v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('g', s, v, P.base);
    G.rect(g, 0, 0, 16, 16, P.base);
    G.speckle(g, 0, 0, 16, 16, [P.dk], 0.10, r);
    G.speckle(g, 0, 0, 16, 16, [P.lt], 0.06, r);
    const n = v % 3;
    for (let i = 0; i < n; i++) {
      const x = 1 + ((r() * 10) | 0), y = 4 + ((r() * 10) | 0);
      G.px(g, x, y, P.dk); G.px(g, x, y - 1, P.dk);
      G.px(g, x + 2, y, P.dk); G.px(g, x + 2, y - 1, P.dk); G.px(g, x + 2, y - 2, P.dk);
      G.px(g, x + 4, y, P.dk); G.px(g, x + 4, y - 1, P.dk);
      G.px(g, x + 2, y - 3, P.lt);
    }
    if (s === 3 && v % 3 === 0) {
      for (let i = 0; i < 3; i++) { const x = 2 + ((r() * 12) | 0), y = 2 + ((r() * 12) | 0); G.px(g, x, y, '#8aa37a'); G.px(g, x + 1, y - 1, '#8aa37a'); }
    }
    if (s === 2 && v % 4 === 1) { // düşen yapraklar
      for (let i = 0; i < 2; i++) { const x = 2 + ((r() * 12) | 0), y = 2 + ((r() * 12) | 0); G.px(g, x, y, '#d8742a'); G.px(g, x + 1, y, '#b8521e'); }
    }
    return c;
  }
  function path(s, v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('p', s, v);
    const w = s === 3;
    const base = w ? '#d2c4b0' : '#c8a26a', dk = w ? '#b3a590' : '#a9844f', lt = w ? '#efe8de' : '#dcbd88';
    G.rect(g, 0, 0, 16, 16, base);
    G.speckle(g, 0, 0, 16, 16, [dk], 0.13, r);
    G.speckle(g, 0, 0, 16, 16, [lt], 0.08, r);
    for (let i = 0; i < 1 + (v % 2); i++) {
      const x = 1 + ((r() * 13) | 0), y = 1 + ((r() * 13) | 0);
      G.rect(g, x, y, 2, 1, '#9c9282'); G.px(g, x, y - 1, '#bdb4a4');
    }
    return c;
  }
  function plaza(s, v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('pz', s, v);
    G.rect(g, 0, 0, 16, 16, '#857c70');
    const cols = ['#bdb4a4', '#b2a998', '#c6bead', '#aca291'];
    const st = [[0, 0, 8, 8], [8, 0, 8, 8], [-4, 8, 8, 8], [4, 8, 8, 8], [12, 8, 8, 8]];
    for (const [x, y, w, h] of st) {
      const col = cols[(r() * cols.length) | 0];
      G.rect(g, x + 1, y + 1, w - 1, h - 1, col);
      G.rect(g, x + 1, y + 1, w - 1, 1, G.lt(col, 0.3));
      G.rect(g, x + 1, y + h - 1, w - 1, 1, G.dk(col, 0.12));
    }
    if (s === 3) G.speckle(g, 0, 0, 16, 16, ['#ffffff', '#e8f0f5'], 0.14, r);
    return c;
  }
  function sand(v, dig) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('sd', v, dig);
    const base = dig ? '#d6ad6c' : '#e6cb8e', dk = dig ? '#b98d50' : '#cfb072', lt = dig ? '#e8c587' : '#f4e0ad';
    G.rect(g, 0, 0, 16, 16, base);
    G.speckle(g, 0, 0, 16, 16, [dk], 0.12, r);
    G.speckle(g, 0, 0, 16, 16, [lt], 0.10, r);
    if (!dig && v % 3 === 0) { const y = 4 + ((r() * 8) | 0); G.rect(g, 2, y, 6, 1, dk); G.rect(g, 8, y + 1, 5, 1, dk); }
    if (dig) { for (let i = 0; i < 3; i++) { const x = (r() * 14) | 0, y = (r() * 14) | 0; G.rect(g, x, y, 2, 1, lt); G.rect(g, x, y + 1, 2, 1, dk); } }
    return c;
  }
  function hardsand(v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('hs', v);
    G.rect(g, 0, 0, 16, 16, '#c0935c');
    G.speckle(g, 0, 0, 16, 16, ['#a37a46'], 0.14, r);
    G.speckle(g, 0, 0, 16, 16, ['#d7ad74'], 0.08, r);
    const x = (r() * 10) | 0, y = (r() * 10) | 0;
    G.line(g, x, y, x + 4, y + 3, '#8a6236'); G.line(g, x + 4, y + 3, x + 6, y + 2, '#8a6236');
    return c;
  }
  function dune(v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('du', v);
    G.rect(g, 0, 0, 16, 16, '#d9b679');
    for (let y = 2; y < 16; y += 5) { G.rect(g, 0, y, 16, 1, '#c29a5e'); G.rect(g, 0, y + 1, 16, 1, '#ecd2a0'); }
    G.speckle(g, 0, 0, 16, 16, ['#c8a266'], 0.08, r);
    return c;
  }
  const waterFrames = [];
  function water(f) {
    if (waterFrames[f]) return waterFrames[f];
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('w', 1);
    G.rect(g, 0, 0, 16, 16, '#4392d0');
    G.speckle(g, 0, 0, 16, 16, ['#3a84c2'], 0.15, r);
    for (let i = 0; i < 3; i++) {
      const y = (i * 5 + f * 2) % 16, x = (i * 7 + f * 3) % 16;
      G.rect(g, x, y, 4, 1, '#7cc0ee'); G.rect(g, (x + 5) % 16, (y + 1) % 16, 2, 1, '#a4d6f6');
    }
    waterFrames[f] = c;
    return c;
  }
  function wood(style, v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('wd', style, v);
    const P = style === 'dark' ? { b: '#9a6a3e', d: '#6e4524', l: '#b8834f' } :
      style === 'light' ? { b: '#d0a46c', d: '#a77c48', l: '#e3bd88' } : { b: '#bb8550', d: '#8d5d32', l: '#d39d63' };
    for (let p = 0; p < 4; p++) {
      const y = p * 4;
      const col = (p + v) % 2 ? P.b : G.mix(P.b, P.l, 0.3);
      G.rect(g, 0, y, 16, 4, col);
      G.rect(g, 0, y + 3, 16, 1, P.d);
      G.speckle(g, 0, y, 16, 3, [G.mix(col, P.d, 0.4)], 0.06, r);
      const sx = (p * 5 + v * 3 + 3) % 16;
      G.rect(g, sx, y, 1, 3, P.d);
    }
    return c;
  }
  function marble(v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('mb', v);
    const a = '#ece6d8', b = '#dcd3c2';
    G.rect(g, 0, 0, 8, 8, a); G.rect(g, 8, 8, 8, 8, a); G.rect(g, 8, 0, 8, 8, b); G.rect(g, 0, 8, 8, 8, b);
    G.line(g, (r() * 6) | 0, 0, 7, 7, '#d0c6b4'); G.line(g, 8, 9 + ((r() * 4) | 0), 15, 15, '#d0c6b4');
    G.rect(g, 0, 15, 16, 1, '#c9bfae'); G.rect(g, 15, 0, 1, 16, '#c9bfae');
    return c;
  }
  function tile(v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('tl', v);
    G.rect(g, 0, 0, 16, 16, '#a35f3e');
    for (const [x, y] of [[0, 0], [8, 0], [0, 8], [8, 8]]) {
      const col = r() < 0.5 ? '#c47a52' : '#bb7049';
      G.rect(g, x + 1, y + 1, 7, 7, col); G.rect(g, x + 1, y + 1, 7, 1, '#d8956b');
    }
    return c;
  }
  function carpet(col, v) {
    const c = G.canvas(16, 16), g = c.g;
    G.rect(g, 0, 0, 16, 16, col);
    const d = G.dk(col, 0.2), l = G.lt(col, 0.25);
    for (let i = 0; i < 16; i += 4) { G.px(g, i + 1, 3, l); G.px(g, i + 3, 11, l); G.px(g, i + 2, 7, d); }
    return c;
  }
  function dig(v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('dg', v);
    G.rect(g, 0, 0, 16, 16, '#8b5a36');
    G.speckle(g, 0, 0, 16, 16, ['#6e4426'], 0.14, r);
    G.speckle(g, 0, 0, 16, 16, ['#a8734a'], 0.08, r);
    for (let i = 0; i < 3; i++) { const x = (r() * 14) | 0, y = (r() * 14) | 0; G.rect(g, x, y, 2, 1, '#a8734a'); G.rect(g, x, y + 1, 2, 1, '#5e391f'); }
    if (v % 3 === 0) { const x = (r() * 13) | 0, y = (r() * 13) | 0; G.rect(g, x, y, 2, 2, '#9c9282'); G.px(g, x, y, '#bdb4a4'); }
    return c;
  }
  function hard(v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('hd', v);
    G.rect(g, 0, 0, 16, 16, '#7d6656');
    G.speckle(g, 0, 0, 16, 16, ['#665243'], 0.15, r);
    G.speckle(g, 0, 0, 16, 16, ['#957d6a'], 0.08, r);
    const x = (r() * 8) | 0, y = (r() * 8) | 0;
    G.line(g, x, y, x + 5, y + 4, '#4e3e33'); G.line(g, x + 5, y + 4, x + 8, y + 3, '#4e3e33'); G.line(g, x + 5, y + 4, x + 5, y + 7, '#4e3e33');
    for (let i = 0; i < 2; i++) { const px = (r() * 14) | 0, py = (r() * 14) | 0; G.rect(g, px, py, 2, 1, '#a39a8c'); }
    return c;
  }
  function cave(v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('cv', v);
    G.rect(g, 0, 0, 16, 16, '#5b5163');
    G.speckle(g, 0, 0, 16, 16, ['#4a4152'], 0.16, r);
    G.speckle(g, 0, 0, 16, 16, ['#6e6378'], 0.08, r);
    if (v % 2) { const x = (r() * 13) | 0, y = (r() * 13) | 0; G.rect(g, x, y, 2, 2, '#7a6f84'); G.px(g, x + 1, y + 1, '#463e4e'); }
    return c;
  }
  // duvar parçaları: part 0 üst/kalınlık, 1 üst yüz, 2 alt yüz
  const WALLS = {
    house: { paper: '#dcc9a0', stripe: '#cfb98c', wain: '#8d5d32', top: '#4a3022' },
    shop: { paper: '#b8cfc0', stripe: '#a5c0b0', wain: '#7a4f2a', top: '#3f2a20' },
    museum: { paper: '#d9d1c1', stripe: '#c8bfab', wain: '#a99f8c', top: '#4a4038' },
    smithy: { paper: '#9a5a48', stripe: '#8a4a3a', wain: '#4a4a56', top: '#2e2630' },
    library: { paper: '#3f6a52', stripe: '#355c46', wain: '#6a4428', top: '#2e2420' },
    store: { paper: '#f0e2b8', stripe: '#e2d0a0', wain: '#7a5a3a', top: '#3f2a20' },
    restaurant: { paper: '#f2d0b0', stripe: '#e8bc98', wain: '#a8453a', top: '#4a2a22' },
    office: { paper: '#b8c8d8', stripe: '#a8b8c8', wain: '#5a6a7a', top: '#2e3440' },
    post: { paper: '#f2e0a0', stripe: '#e8d088', wain: '#3d6aa8', top: '#3f3020' },
    warehouse: { paper: '#6a5a4a', stripe: '#5a4a3c', wain: '#4a3a2e', top: '#221a16' },
    inn: { paper: '#d8b0a0', stripe: '#c89a8a', wain: '#7a3a2a', top: '#3a2420' },
    cottage: { paper: '#d8d0e8', stripe: '#c8bedc', wain: '#6a5a8a', top: '#3a3048' },
    study: { paper: '#c8d8d0', stripe: '#b8ccc2', wain: '#3f5a52', top: '#2a3430' },
    ruin: { paper: '#a89880', stripe: '#988870', wain: '#5a4a3a', top: '#2a221c' },
    bar: { paper: '#3f5a5a', stripe: '#354e4e', wain: '#5a2a22', top: '#1e1418' },
    florist: { paper: '#e8f2e0', stripe: '#d8e8cc', wain: '#d87a9a', top: '#3a3a2a' },
    fisher: { paper: '#c8dce8', stripe: '#b8ccdc', wain: '#2f5a7a', top: '#22303a' },
    artist: { paper: '#f6ecd0', stripe: '#ecdcb8', wain: '#7a4a6a', top: '#3a2a34' },
    music: { paper: '#c8a888', stripe: '#b89878', wain: '#2f5a6a', top: '#2a2420' },
    family: { paper: '#f2dcc8', stripe: '#e8ccb4', wain: '#3d6aa8', top: '#3a2a22' },
    sailor: { paper: '#b8c4cc', stripe: '#a8b4bc', wain: '#2a3a5a', top: '#1e2430' },
  };
  function wallTile(style, part, v) {
    const c = G.canvas(16, 16), g = c.g, W = WALLS[style] || WALLS.house, r = G.rnd('wl', style, part, v);
    if (part === 0) {
      G.rect(g, 0, 0, 16, 16, W.top);
      G.speckle(g, 0, 0, 16, 16, [G.lt(W.top, 0.08)], 0.1, r);
      return c;
    }
    G.rect(g, 0, 0, 16, 16, W.paper);
    if (style === 'museum') {
      // taş bloklar
      for (let y = 0; y < 16; y += 5) { G.rect(g, 0, y, 16, 1, W.stripe); const off = (y / 5) % 2 ? 4 : 12; G.rect(g, off, y, 1, 5, W.stripe); }
    } else {
      for (let x = (v % 2) * 2; x < 16; x += 4) G.rect(g, x, 0, 1, 16, W.stripe);
    }
    if (part === 1) {
      G.rect(g, 0, 0, 16, 2, G.dk(W.paper, 0.25));
    } else {
      G.rect(g, 0, 7, 16, 1, G.lt(W.wain, 0.35));
      G.rect(g, 0, 8, 16, 6, W.wain);
      G.rect(g, 2, 9, 5, 4, G.dk(W.wain, 0.15)); G.rect(g, 9, 9, 5, 4, G.dk(W.wain, 0.15));
      G.rect(g, 2, 9, 5, 1, G.lt(W.wain, 0.15)); G.rect(g, 9, 9, 5, 1, G.lt(W.wain, 0.15));
      G.rect(g, 0, 14, 16, 2, G.dk(W.wain, 0.35));
    }
    return c;
  }
  function cwall(part, v, sand) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('cw', part, v, sand);
    const P = sand ? { top: '#9a7448', tdk: '#86643c', face: '#c39a62', st: '#a8814e', hl: '#dcb87e' }
                   : { top: '#2b2430', tdk: '#221c27', face: '#4b3f55', st: '#3c3245', hl: '#625470' };
    if (part === 0) {
      G.rect(g, 0, 0, 16, 16, P.top);
      G.speckle(g, 0, 0, 16, 16, [P.tdk, G.lt(P.top, 0.06)], 0.2, r);
      return c;
    }
    G.rect(g, 0, 0, 16, 16, P.face);
    G.rect(g, 0, 0, 16, 2, P.hl);
    for (let y = 5; y < 16; y += 4 + (v % 2)) G.rect(g, 0, y, 16, 1, P.st);
    G.line(g, 4 + (v % 6), 2, 3 + (v % 6), 9, P.st);
    G.speckle(g, 0, 2, 16, 14, [P.st, P.hl], 0.06, r);
    G.rect(g, 0, 14, 16, 2, G.dk(P.face, 0.2));
    return c;
  }
  function cliff(part, s, v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('cl', part, s, v);
    if (part === 0) {
      const P = FOREST[s];
      G.rect(g, 0, 0, 16, 16, '#776a5c');
      G.speckle(g, 0, 0, 16, 16, ['#685c4f', '#8a7d6e'], 0.2, r);
      G.rect(g, 0, 0, 16, 3, P.base); G.speckle(g, 0, 3, 16, 2, [P.base, P.dk], 0.5, r);
      return c;
    }
    G.rect(g, 0, 0, 16, 16, '#8f8273');
    for (let y = 3; y < 16; y += 4) { G.rect(g, 0, y, 16, 1, '#766a5d'); G.rect(g, 0, y + 1, 16, 1, '#a89a89'); }
    G.line(g, 3 + (v % 9), 0, 5 + (v % 9), 15, '#766a5d');
    G.speckle(g, 0, 0, 16, 16, ['#6e6255'], 0.05, r);
    if (s === 3) G.rect(g, 0, 0, 16, 2, '#f4f8fa');
    G.rect(g, 0, 15, 16, 1, '#5f5448');
    return c;
  }
  function canopy(s, v) {
    const c = G.canvas(16, 16), g = c.g, r = G.rnd('cn', s, v), P = CANOPY[s];
    G.rect(g, 0, 0, 16, 16, P.dk);
    for (let i = 0; i < 4; i++) {
      const x = -2 + ((r() * 12) | 0), y = -2 + ((r() * 12) | 0);
      G.oval(g, x, y, 9, 8, P.base);
      G.oval(g, x + 1, y + 1, 4, 3, P.lt);
    }
    if (s === 3) G.speckle(g, 0, 0, 16, 16, ['#ffffff'], 0.08, r);
    return c;
  }
  function bridge(v) {
    const c = G.canvas(16, 16), g = c.g;
    G.rect(g, 0, 0, 16, 16, '#a8743f');
    for (let x = 0; x < 16; x += 4) { G.rect(g, x, 0, 1, 16, '#7a4f2a'); G.rect(g, x + 1, 0, 1, 16, '#c08a52'); }
    G.rect(g, 0, 0, 16, 1, '#5a3a22'); G.rect(g, 0, 15, 16, 1, '#5a3a22');
    return c;
  }

  const memo = G.memo(function (id, s, v, style, part) {
    switch (id) {
      case T.GRASS: return grass(GRASS[s], s, v);
      case T.FOREST: return grass(FOREST[s], s + 10, v);
      case T.PATH: return path(s, v);
      case T.PLAZA: return plaza(s, v);
      case T.SAND: return sand(v, false);
      case T.SANDDIG: return sand(v, true);
      case T.HARDSAND: return hardsand(v);
      case T.DUNE: return dune(v);
      case T.WOOD: return wood(style, v);
      case T.MARBLE: return marble(v);
      case T.TILE: return tile(v);
      case T.CARPET: return carpet(style || '#a8453a', v);
      case T.DIG: return dig(v);
      case T.HARD: return hard(v);
      case T.CAVE: return cave(v);
      case T.CWALL: return cwall(part, v, false);
      case T.SWALL: return cwall(part, v, true);
      case T.WALL: return wallTile(style, part, v);
      case T.CLIFF: return cliff(part, s, v);
      case T.CANOPY: return canopy(s, v);
      case T.BRIDGE: return bridge(v);
      default: { const c = G.canvas(16, 16); G.rect(c.g, 0, 0, 16, 16, '#120b16'); return c; }
    }
  });

  AK.Tiles = {
    GRASS, FOREST,
    solid: id => SOLID.has(id),
    digLevel: id => DIGLV[id] || 0,
    soft: id => SOFT.has(id),
    low: id => LOW.has(id),
    get(id, s, v, style, part) { return memo(id, s, v % 4, style || '', part || 0); },
    water,
    // çim saçağı: alçak karoların kenarına çim taşması
    fringe(g, px, py, side, P) {
      for (let i = 0; i < 16; i++) {
        const d = 1 + (((i * 7 + px * 3 + py * 5) % 3 === 0) ? 1 : 0) + ((i % 5) === 0 ? 1 : 0);
        g.fillStyle = P.base;
        if (side === 0) g.fillRect(px + i, py, 1, d);
        else if (side === 2) g.fillRect(px + i, py + 16 - d, 1, d);
        else if (side === 3) g.fillRect(px, py + i, d, 1);
        else g.fillRect(px + 16 - d, py + i, d, 1);
        g.fillStyle = P.dk;
        if (side === 0) g.fillRect(px + i, py + d, 1, 1);
        else if (side === 2) g.fillRect(px + i, py + 15 - d, 1, 1);
        else if (side === 3) g.fillRect(px + d, py + i, 1, 1);
        else g.fillRect(px + 15 - d, py + i, 1, 1);
      }
    },
  };
})();
