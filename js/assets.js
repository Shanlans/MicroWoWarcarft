// assets.js - fully procedural pixel sprites and tiles.
// All sprites are authored as small 2D arrays of palette indices.
// 0 = transparent. Indices >= 1 map into the palette array.
const Assets = (() => {
  const cache = Object.create(null);

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  // draw a pixel grid (data) scaled by `scale` onto a new canvas
  function render(data, palette, scale = 2) {
    const h = data.length;
    const w = data[0].length;
    const c = makeCanvas(w * scale, h * scale);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = data[y][x];
        if (v === 0) continue;
        ctx.fillStyle = palette[v - 1];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    return c;
  }

  // ---- Palettes ----
  const PAL = {
    grass:   ['#3b7a2e', '#2d5f22', '#4a8a3a', '#6fa44a'],
    dirt:    ['#6b4a28', '#54381d', '#8a6237', '#a3784a'],
    stone:   ['#888888', '#5a5a5a', '#aaaaaa', '#c8c8c8'],
    water:   ['#2a4a8a', '#1d3a70', '#4a6ab0', '#6a8ad0'],
    wood:    ['#5a3a1a', '#3a2510', '#7a5228', '#9a6a3a'],
    roof:    ['#8a2a2a', '#5a1a1a', '#aa3a3a', '#c85a5a'],
    tree:    ['#1a4a1a', '#0a2a0a', '#2d6a2d', '#3a7a3a'],
    warrior: ['#c08040', '#6a3a1a', '#aaaaaa', '#c8c8c8', '#ffd28a', '#a02020'],
    mage:    ['#2a4aaa', '#1a2a6a', '#ffd28a', '#e8c070', '#ffffff', '#aa3aff'],
    hunter:  ['#2a6a2a', '#1a4a1a', '#ffd28a', '#8a5a2a', '#c0c0c0', '#a0522d'],
    boar:    ['#5a3a28', '#3a2518', '#8a5a3a', '#ffffff', '#c83030'],
    spider:  ['#1a1a1a', '#3a2a3a', '#aa2020', '#6a1a1a'],
    kobold:  ['#aa8a5a', '#6a4a28', '#c8b070', '#4a2a10', '#ffffff'],
    bandit:  ['#3a1a1a', '#1a0a0a', '#c08040', '#ffd28a', '#8a2020', '#aaaaaa'],
    gnoll:   ['#c8a050', '#8a6a30', '#ffe090', '#4a2a10', '#ffffff'],
    dmage:   ['#5a1a5a', '#3a0a3a', '#aa3aff', '#ffd28a', '#ffffff'],
    dboss:   ['#2a2a2a', '#1a1a1a', '#aa3030', '#c8c8c8', '#ffe040', '#6a1a1a'],
    mech:    ['#6a6a6a', '#3a3a3a', '#aa3030', '#ffe040', '#c8c8c8'],
    npc:     ['#4a4a8a', '#2a2a5a', '#ffd28a', '#aa8a4a', '#ffffff', '#8a2020'],
    fireball:['#ff6a1a', '#ffd040', '#ff2020', '#ffffff'],
    arrow:   ['#8a5a2a', '#5a3a1a', '#c8c8c8', '#ffffff'],
    ice:     ['#6ac0ff', '#2a8ad0', '#c8e8ff', '#ffffff'],
  };

  // ---- Tile sprites (16x16, scale 2 = 32x32) ----
  const T = { _:0 };
  // grass tile with tiny tufts
  const grassTile = [
    [1,1,1,1,1,3,1,1,1,1,3,1,1,1,1,1],
    [1,3,1,1,1,1,1,1,3,1,1,1,1,1,3,1],
    [1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,1],
    [1,1,1,1,1,1,3,1,1,1,3,1,1,1,1,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1],
    [1,1,2,1,1,1,1,3,1,1,1,1,1,1,1,1],
    [1,1,1,1,3,1,1,1,1,1,1,1,1,1,3,1],
    [1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,1,3,1,1],
    [1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1],
    [1,1,2,1,1,3,1,1,1,1,1,1,1,1,1,2],
    [1,1,1,1,1,1,1,1,3,1,1,1,3,1,1,1],
    [1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1],
    [3,1,1,1,1,1,2,1,1,1,1,2,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,3,1,1,1,1,3,1],
    [1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];
  const dirtTile = [
    [1,1,2,1,1,1,3,1,1,1,1,1,2,1,1,1],
    [1,1,1,1,3,1,1,1,1,2,1,1,1,1,3,1],
    [2,1,1,1,1,1,1,3,1,1,1,1,1,2,1,1],
    [1,1,1,3,1,1,1,1,1,1,3,1,1,1,1,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,1,1,3,1],
    [1,1,1,1,1,3,1,1,1,2,1,1,1,1,1,1],
    [1,1,3,1,1,1,1,1,3,1,1,1,2,1,1,1],
    [1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,3],
    [3,1,1,1,1,1,1,2,1,1,1,3,1,1,1,1],
    [1,1,1,2,1,1,1,1,1,3,1,1,1,2,1,1],
    [1,3,1,1,1,1,3,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,2,1,1,1,3,1,1,1],
    [2,1,1,1,3,1,1,1,1,1,1,2,1,1,1,2],
    [1,1,1,1,1,1,1,3,1,1,1,1,1,1,3,1],
    [1,1,3,1,1,2,1,1,1,1,3,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1],
  ];
  const stoneTile = [
    [2,2,1,1,1,1,2,2,2,1,1,1,1,2,2,1],
    [2,1,1,3,1,1,1,1,2,1,3,1,1,1,1,1],
    [1,1,3,3,1,1,1,1,1,1,3,1,1,1,2,2],
    [1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,2],
    [1,1,1,1,2,2,2,2,1,3,1,1,1,1,1,1],
    [2,1,1,1,1,2,2,1,1,1,1,1,2,2,1,1],
    [2,2,1,1,1,1,1,1,1,1,1,2,2,2,1,1],
    [1,2,1,3,1,1,1,1,1,1,1,1,2,1,1,1],
    [1,1,1,3,1,1,1,2,2,1,1,1,1,1,1,3],
    [1,1,1,1,1,1,2,2,2,2,1,1,1,1,3,3],
    [1,1,3,1,1,1,1,2,2,1,1,1,2,1,1,1],
    [2,1,3,1,1,1,1,1,1,1,1,2,2,2,1,1],
    [2,2,1,1,1,2,2,1,1,1,1,1,2,2,1,1],
    [1,2,1,1,2,2,2,1,1,3,1,1,1,1,1,1],
    [1,1,1,1,1,2,2,1,1,3,1,1,1,1,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2],
  ];
  const waterTile = [
    [1,1,2,2,1,1,1,1,1,1,1,2,2,1,1,1],
    [1,1,1,1,1,3,3,1,1,1,1,1,1,1,3,3],
    [1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1],
    [2,2,1,1,1,1,1,2,2,1,1,1,1,1,1,1],
    [1,1,1,3,3,1,1,1,1,1,1,1,3,3,1,1],
    [1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1],
    [1,1,2,2,1,1,1,1,2,2,1,1,1,1,1,2],
    [1,1,1,1,1,1,3,3,1,1,1,1,1,3,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [2,2,1,1,1,2,2,1,1,1,1,1,2,2,1,1],
    [1,1,1,1,1,1,1,1,1,3,3,1,1,1,1,1],
    [1,1,1,3,3,1,1,1,1,1,1,1,1,1,1,2],
    [1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1],
    [1,2,2,1,1,1,1,1,1,1,1,1,1,2,2,1],
    [1,1,1,1,1,3,3,1,1,1,1,3,3,1,1,1],
    [1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1],
  ];
  const woodTile = [
    [1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1],
    [1,3,1,1,2,1,1,3,1,1,1,2,1,1,3,1],
    [1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1],
    [1,1,2,1,3,1,1,1,2,1,1,3,1,1,1,3],
    [1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1],
    [1,3,1,1,1,2,1,3,1,1,1,1,2,1,1,1],
    [1,1,1,1,1,2,1,1,1,1,1,1,2,1,1,3],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,2,1,1,3,1,1,2,1,3,1,1,1,1],
    [1,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ];
  // "tree" tile covers the whole tile (solid)
  const treeTile = [
    [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,3,3,3,1,1,1,1,0,0,0,0],
    [0,0,1,1,3,4,4,3,3,1,1,1,1,0,0,0],
    [0,1,1,3,3,4,4,4,3,3,1,1,1,1,0,0],
    [0,1,3,3,4,4,3,4,4,3,3,1,1,1,0,0],
    [1,1,3,4,4,3,3,3,4,4,3,3,1,1,1,0],
    [1,3,3,4,3,3,1,3,3,4,4,3,3,1,1,0],
    [1,3,4,4,3,1,1,3,3,4,4,3,3,1,1,0],
    [0,1,3,3,3,1,1,1,3,3,3,3,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0],
    [0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0],
    [0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0],
    [0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0],
    [0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0],
  ];
  const roofTile = [
    [2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2],
    [1,1,3,1,1,3,1,1,3,1,1,3,1,1,3,1],
    [1,3,1,1,3,1,1,3,1,1,3,1,1,3,1,1],
    [2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2],
    [1,1,3,1,1,3,1,1,3,1,1,3,1,1,3,1],
    [1,3,1,1,3,1,1,3,1,1,3,1,1,3,1,1],
    [2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2],
    [1,1,3,1,1,3,1,1,3,1,1,3,1,1,3,1],
    [1,3,1,1,3,1,1,3,1,1,3,1,1,3,1,1],
    [2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2],
    [1,1,3,1,1,3,1,1,3,1,1,3,1,1,3,1],
    [1,3,1,1,3,1,1,3,1,1,3,1,1,3,1,1],
    [2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2],
    [1,1,3,1,1,3,1,1,3,1,1,3,1,1,3,1],
    [1,3,1,1,3,1,1,3,1,1,3,1,1,3,1,1],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ];

  // ---- Character sprite (24x24, 4 directions x 2 frames) ----
  // We parameterize via a helper so each class shares body geometry.
  // layout: H head, S skin, A armor, W weapon-color, B boot, F feather/hat
  // palette index convention: 1=body/armor, 2=dark armor, 3=metal/accent,
  //                           4=armor highlight, 5=skin, 6=weapon-color
  function charFrames(variant) {
    // Returns {down:[f0,f1], up:[f0,f1], left:[f0,f1], right:[f0,f1]}
    // Each frame is a 20x24 grid (transparent padding).
    // We draw a chibi 20x24 body.
    const base = (step, dir) => {
      const g = Array.from({length: 24}, () => Array(20).fill(0));
      // hat/hair
      for (let x = 6; x <= 13; x++) g[2][x] = 2;
      for (let x = 5; x <= 14; x++) g[3][x] = 2;
      for (let x = 5; x <= 14; x++) g[4][x] = 2;
      // head/face
      for (let y = 5; y <= 9; y++)
        for (let x = 6; x <= 13; x++) g[y][x] = 5;
      // eyes (direction aware)
      if (dir === 'down') { g[7][8] = 2; g[7][11] = 2; }
      else if (dir === 'up') { g[6][8] = 2; g[6][11] = 2; }
      else if (dir === 'left') { g[7][7] = 2; g[7][9] = 2; }
      else if (dir === 'right') { g[7][10] = 2; g[7][12] = 2; }
      // body/armor
      for (let y = 10; y <= 16; y++)
        for (let x = 5; x <= 14; x++) g[y][x] = 1;
      // armor highlight row
      for (let x = 5; x <= 14; x++) g[10][x] = 4;
      // belt
      for (let x = 5; x <= 14; x++) g[16][x] = 3;
      // arms
      for (let y = 11; y <= 15; y++) { g[y][4] = 1; g[y][15] = 1; }
      g[12][4] = 5; g[12][15] = 5; // hands
      // legs
      const legOffset = step === 0 ? 0 : 1;
      for (let y = 17; y <= 21; y++) {
        g[y][6 + legOffset] = 2;
        g[y][7 + legOffset] = 2;
        g[y][12 - legOffset] = 2;
        g[y][13 - legOffset] = 2;
      }
      // boots
      g[22][6 + legOffset] = 3; g[22][7 + legOffset] = 3;
      g[22][12 - legOffset] = 3; g[22][13 - legOffset] = 3;
      // weapon (variant specific)
      if (variant === 'warrior') {
        // sword on right hand (big gray blade)
        for (let y = 6; y <= 15; y++) g[y][17] = 3;
        g[5][17] = 4; g[16][17] = 6;
      } else if (variant === 'mage') {
        // staff on left hand
        for (let y = 5; y <= 16; y++) g[y][3] = 6;
        g[4][3] = 6;
        // orb
        g[3][3] = 6; g[3][2] = 6; g[2][3] = 6; g[4][2] = 6;
      } else if (variant === 'hunter') {
        // bow on right
        for (let y = 6; y <= 15; y++) g[y][17] = 6;
        g[5][16] = 6; g[16][16] = 6;
        g[10][17] = 4; g[11][17] = 4;
      }
      return g;
    };
    const palette = PAL[variant];
    const out = {};
    for (const dir of ['down','up','left','right']) {
      out[dir] = [0,1].map(step => {
        let g = base(step, dir);
        // For left/right, we can mirror a down frame
        if (dir === 'left') g = g.map(row => row.slice().reverse());
        return render(g, palette, 2);
      });
    }
    return out;
  }

  // ---- Small creature sprites (16x16) ----
  const boarSprite = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,1,1,2,2,1,1,3,1,1,1,1,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,4,5,0],
    [0,0,1,1,3,1,1,1,1,1,1,1,1,1,5,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,2,2,1,1,1,1,1,1,1,1,2,2,0,0],
    [0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0],
    [0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];
  const spiderSprite = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [0,2,0,0,0,0,0,0,0,0,0,0,0,0,2,0],
    [0,0,2,0,0,1,1,1,1,1,1,0,0,2,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,0,0,1,1,3,1,1,3,1,1,0,0,0,0],
    [0,0,0,1,1,4,1,1,1,1,4,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,2,0,0,1,1,1,1,1,1,0,0,2,0,0],
    [0,2,0,0,0,0,1,1,1,1,0,0,0,0,2,0],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];

  // generic humanoid enemy (16 wide, 24 tall)
  function humanoid(variant) {
    const g = Array.from({length: 24}, () => Array(20).fill(0));
    // head
    for (let x = 7; x <= 12; x++) g[3][x] = 2;
    for (let x = 6; x <= 13; x++) g[4][x] = 2;
    for (let y = 5; y <= 8; y++)
      for (let x = 6; x <= 13; x++) g[y][x] = 3;
    g[6][8] = 2; g[6][11] = 2;
    // body
    for (let y = 9; y <= 15; y++)
      for (let x = 5; x <= 14; x++) g[y][x] = 1;
    for (let x = 5; x <= 14; x++) g[9][x] = 2;
    for (let x = 5; x <= 14; x++) g[15][x] = 2;
    // arms
    for (let y = 10; y <= 14; y++) { g[y][4] = 1; g[y][15] = 1; }
    g[14][4] = 3; g[14][15] = 3;
    // legs
    for (let y = 16; y <= 20; y++) { g[y][7] = 2; g[y][8] = 2; g[y][11] = 2; g[y][12] = 2; }
    g[21][7] = 4; g[21][8] = 4; g[21][11] = 4; g[21][12] = 4;
    // weapon variant
    if (variant === 'kobold') {
      // pickaxe on right
      for (let y = 6; y <= 15; y++) g[y][17] = 4;
      g[5][16] = 4; g[5][17] = 4; g[5][18] = 4;
    } else if (variant === 'bandit') {
      // dagger
      for (let y = 10; y <= 15; y++) g[y][17] = 6;
      g[9][17] = 6;
    } else if (variant === 'gnoll') {
      // club
      for (let y = 8; y <= 15; y++) g[y][17] = 4;
      g[7][16] = 4; g[7][17] = 4; g[7][18] = 4; g[8][16] = 4; g[8][18] = 4;
    } else if (variant === 'dmage') {
      // magic staff
      for (let y = 4; y <= 15; y++) g[y][17] = 4;
      g[3][17] = 3; g[3][16] = 3; g[3][18] = 3;
      g[2][17] = 3;
    } else if (variant === 'dboss') {
      // twin blades
      for (let y = 6; y <= 15; y++) { g[y][2] = 4; g[y][17] = 4; }
      g[5][2] = 4; g[5][17] = 4;
      // cape
      for (let y = 9; y <= 16; y++) { g[y][3] = 6; g[y][16] = 6; }
    }
    return g;
  }

  // mechanical harvester (wider, 20x20)
  const mechSprite = (() => {
    const g = Array.from({length: 24}, () => Array(20).fill(0));
    // body
    for (let y = 8; y <= 18; y++)
      for (let x = 3; x <= 16; x++) g[y][x] = 1;
    // frame outline
    for (let x = 3; x <= 16; x++) { g[8][x] = 2; g[18][x] = 2; }
    for (let y = 8; y <= 18; y++) { g[y][3] = 2; g[y][16] = 2; }
    // eye
    for (let y = 10; y <= 12; y++)
      for (let x = 8; x <= 11; x++) g[y][x] = 3;
    g[11][9] = 4; g[11][10] = 4;
    // blade
    for (let x = 0; x <= 19; x++) g[6][x] = 5;
    g[5][0] = 3; g[5][19] = 3;
    // treads
    for (let x = 2; x <= 17; x++) { g[20][x] = 2; g[21][x] = 2; }
    g[22][3] = 2; g[22][16] = 2; g[22][8] = 2; g[22][11] = 2;
    return g;
  })();

  // fireball projectile (8x8)
  const fireballSprite = [
    [0,0,2,2,2,0,0,0],
    [0,2,1,1,1,2,0,0],
    [2,1,4,4,1,1,2,0],
    [2,1,4,4,1,1,2,0],
    [2,1,1,1,1,1,2,0],
    [0,2,1,1,1,2,0,0],
    [0,0,2,2,2,0,0,0],
    [0,0,0,0,0,0,0,0],
  ];
  const arrowSprite = [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,2],
    [3,3,3,3,3,1,1,2],
    [3,4,4,4,4,1,1,2],
    [3,3,3,3,3,1,1,2],
    [0,0,0,0,0,1,1,2],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ];
  const iceSprite = [
    [0,0,1,1,1,0,0,0],
    [0,1,3,3,3,1,0,0],
    [1,3,4,4,3,1,2,0],
    [1,3,4,4,3,1,2,0],
    [1,3,3,3,3,1,2,0],
    [0,1,1,1,1,2,0,0],
    [0,0,2,2,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ];

  // ---- Build cache ----
  function build() {
    cache.grass = render(grassTile, PAL.grass, 2);
    cache.dirt  = render(dirtTile,  PAL.dirt,  2);
    cache.stone = render(stoneTile, PAL.stone, 2);
    cache.water = render(waterTile, PAL.water, 2);
    cache.wood  = render(woodTile,  PAL.wood,  2);
    cache.roof  = render(roofTile,  PAL.roof,  2);
    cache.tree  = render(treeTile,  PAL.tree,  2);

    cache.warrior = charFrames('warrior');
    cache.mage    = charFrames('mage');
    cache.hunter  = charFrames('hunter');

    cache.boar   = render(boarSprite,   PAL.boar,   2);
    cache.spider = render(spiderSprite, PAL.spider, 2);
    cache.kobold = render(humanoid('kobold'), PAL.kobold, 2);
    cache.bandit = render(humanoid('bandit'), PAL.bandit, 2);
    cache.gnoll  = render(humanoid('gnoll'),  PAL.gnoll,  2);
    cache.dmage  = render(humanoid('dmage'),  PAL.dmage,  2);
    cache.dboss  = render(humanoid('dboss'),  PAL.dboss,  2);
    cache.mech   = render(mechSprite, PAL.mech, 2);
    cache.npc    = render(humanoid('bandit'), PAL.npc, 2);

    cache.fireball = render(fireballSprite, PAL.fireball, 2);
    cache.arrow    = render(arrowSprite,    PAL.arrow,    2);
    cache.ice      = render(iceSprite,      PAL.ice,      2);
  }

  function get(name) { return cache[name]; }

  return { build, get };
})();
