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

  // Pokemon GBA style: 1px black outline around all non-transparent pixels
  function addOutline(src) {
    const sw = src.width, sh = src.height;
    const c = makeCanvas(sw + 2, sh + 2);
    const ctx = c.getContext('2d');
    // draw offset copies in 4 cardinal directions
    for (const [ox, oy] of [[0,1],[2,1],[1,0],[1,2]]) {
      ctx.drawImage(src, ox, oy);
    }
    // turn all drawn pixels to black
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, sw + 2, sh + 2);
    // draw original sprite on top
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(src, 1, 1);
    return c;
  }

  // ---- Palettes (Pokemon GBA vibrant style) ----
  const PAL = {
    grass:   ['#58C038', '#408020', '#78D858', '#90E870'],
    dirt:    ['#C0A060', '#906830', '#E0C080', '#F0D898'],
    stone:   ['#909090', '#606060', '#B8B8B8', '#D0D0D0'],
    water:   ['#3890F8', '#2068C0', '#68B0FF', '#98D0FF'],
    wood:    ['#805828', '#583818', '#A87838', '#C89848'],
    roof:    ['#C83838', '#902020', '#E05050', '#F07070'],
    tree:    ['#208030', '#105010', '#38A048', '#50C060'],
    warrior: ['#C05030', '#802818', '#A0A0A8', '#C8C8D0', '#FFD8A8', '#D03020'],
    mage:    ['#3858C8', '#202880', '#FFD8A8', '#E8C078', '#F0F0F8', '#B848FF'],
    hunter:  ['#388838', '#205020', '#FFD8A8', '#986838', '#C8C8C8', '#B06030'],
    boar:    ['#785030', '#482818', '#A07048', '#F0F0F0', '#D83030'],
    spider:  ['#282028', '#483048', '#D02020', '#801010'],
    kobold:  ['#C8A060', '#886830', '#E8C878', '#583018', '#F0F0F0'],
    bandit:  ['#581818', '#300808', '#C88040', '#FFD8A8', '#B02020', '#B0B0B0'],
    gnoll:   ['#D0A848', '#907028', '#F8E090', '#583018', '#F0F0F0'],
    dmage:   ['#702870', '#480848', '#C848FF', '#FFD8A8', '#F0F0F0'],
    dboss:   ['#383838', '#1C1C1C', '#C03030', '#D0D0D0', '#FFE040', '#801818'],
    mech:    ['#808080', '#484848', '#C03030', '#FFE040', '#D0D0D0'],
    npc:     ['#5060A8', '#303878', '#FFD8A8', '#B89050', '#F0F0F0', '#B02020'],
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
        return addOutline(render(g, palette, 2));
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

  // ---- Item icon sprites (10x10, scale 2 = 20x20, + outline) ----
  const ICON_PAL = {
    sword:   ['#A0A0A8', '#707078', '#805828', '#C8C8D0'],
    staff:   ['#805828', '#583818', '#B848FF', '#D080FF'],
    bow:     ['#805828', '#583818', '#C8C8C8', '#F0F0F0'],
    helm:    ['#A0A0A8', '#707078', '#C8C8D0', '#F0F0F0'],
    chest:   ['#A0A0A8', '#707078', '#C8C8D0', '#F0F0F0'],
    legs:    ['#A0A0A8', '#707078', '#C8C8D0', '#F0F0F0'],
    ring:    ['#FFD040', '#C8A020', '#FFE880', '#FFFFFF'],
    trinket: ['#40C060', '#208030', '#80E890', '#FFFFFF'],
    potion:  ['#D83030', '#901818', '#F06060', '#FFFFFF'],
    bread:   ['#D0A848', '#907028', '#F0D080', '#F8E8B0'],
    water_i: ['#3890F8', '#2068C0', '#68B0FF', '#FFFFFF'],
    meat:    ['#D83030', '#901818', '#F06060', '#F0D0A0'],
    gear:    ['#A0A0A8', '#707078', '#C8C8D0', '#FFE040'],
    letter:  ['#E0C888', '#B09858', '#F0E0B0', '#383838'],
    quest:   ['#FFE040', '#C8A020', '#FFF080', '#FFFFFF'],
  };

  const iconSword = [
    [0,0,0,0,0,0,0,0,4,0],
    [0,0,0,0,0,0,0,4,1,0],
    [0,0,0,0,0,0,4,1,0,0],
    [0,0,0,0,0,4,1,0,0,0],
    [0,0,0,0,4,1,0,0,0,0],
    [0,0,0,4,1,0,0,0,0,0],
    [0,0,3,2,1,0,0,0,0,0],
    [0,3,3,3,0,0,0,0,0,0],
    [0,0,3,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconStaff = [
    [0,0,0,3,4,3,0,0,0,0],
    [0,0,0,4,3,4,0,0,0,0],
    [0,0,0,3,4,3,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,2,0,0,0,0,0],
    [0,0,0,0,2,0,0,0,0,0],
  ];
  const iconBow = [
    [0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,3,0,0,0],
    [0,0,0,1,0,0,3,0,0,0],
    [0,0,1,0,0,3,0,0,0,0],
    [0,1,2,0,3,0,0,0,0,0],
    [0,1,2,0,3,0,0,0,0,0],
    [0,0,1,0,0,3,0,0,0,0],
    [0,0,0,1,0,0,3,0,0,0],
    [0,0,0,0,1,0,3,0,0,0],
    [0,0,0,0,0,1,0,0,0,0],
  ];
  const iconHelm = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,3,3,3,3,0,0,0],
    [0,0,3,1,1,1,1,3,0,0],
    [0,3,1,1,1,1,1,1,3,0],
    [0,3,1,1,1,1,1,1,3,0],
    [0,2,2,2,2,2,2,2,2,0],
    [0,2,4,2,0,0,2,4,2,0],
    [0,0,2,2,0,0,2,2,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconChest = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,3,3,3,3,3,3,0,0],
    [0,3,1,1,1,1,1,1,3,0],
    [0,1,1,3,1,1,3,1,1,0],
    [0,1,1,3,1,1,3,1,1,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,2,1,1,1,1,1,1,2,0],
    [0,0,2,2,2,2,2,2,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconLegs = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,3,3,3,3,3,3,0,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,0,1,1,2,2,1,1,0,0],
    [0,0,1,1,0,0,1,1,0,0],
    [0,0,1,1,0,0,1,1,0,0],
    [0,0,1,1,0,0,1,1,0,0],
    [0,0,2,2,0,0,2,2,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconRing = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,3,3,3,3,0,0,0],
    [0,0,3,1,4,4,1,3,0,0],
    [0,0,1,0,0,0,0,1,0,0],
    [0,0,1,0,0,0,0,1,0,0],
    [0,0,2,1,0,0,1,2,0,0],
    [0,0,0,2,2,2,2,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconTrinket = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,4,4,0,0,0,0],
    [0,0,0,4,3,3,4,0,0,0],
    [0,0,4,3,1,1,3,4,0,0],
    [0,0,4,1,1,1,1,4,0,0],
    [0,0,4,3,1,1,3,4,0,0],
    [0,0,0,4,3,3,4,0,0,0],
    [0,0,0,0,4,4,0,0,0,0],
    [0,0,0,0,2,2,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconPotion = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,4,4,0,0,0,0],
    [0,0,0,0,2,2,0,0,0,0],
    [0,0,0,2,1,1,2,0,0,0],
    [0,0,2,1,3,3,1,2,0,0],
    [0,0,2,1,3,3,1,2,0,0],
    [0,0,2,1,1,1,1,2,0,0],
    [0,0,0,2,1,1,2,0,0,0],
    [0,0,0,0,2,2,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconBread = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,3,3,3,3,0,0,0],
    [0,0,3,4,4,4,4,3,0,0],
    [0,3,1,3,3,3,3,1,3,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,2,2,2,2,2,2,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconWater = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,4,4,0,0,0,0],
    [0,0,0,0,2,2,0,0,0,0],
    [0,0,0,2,1,1,2,0,0,0],
    [0,0,2,1,3,3,1,2,0,0],
    [0,0,2,1,3,3,1,2,0,0],
    [0,0,2,1,1,1,1,2,0,0],
    [0,0,0,2,1,1,2,0,0,0],
    [0,0,0,0,2,2,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconMeat = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,1,3,3,1,0,0,0],
    [0,0,1,3,1,1,3,1,0,0],
    [0,0,1,3,1,3,3,1,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,0,4,4,0,0,0,0,0],
    [0,0,4,2,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconGear = [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,2,0,0,2,1,0,0],
    [0,1,0,0,0,0,0,0,1,0],
    [1,2,0,0,3,3,0,0,2,1],
    [1,0,0,3,4,4,3,0,0,1],
    [1,0,0,3,4,4,3,0,0,1],
    [1,2,0,0,3,3,0,0,2,1],
    [0,1,0,0,0,0,0,0,1,0],
    [0,0,1,2,0,0,2,1,0,0],
    [0,0,0,1,1,1,1,0,0,0],
  ];
  const iconLetter = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,1,2,3,3,3,3,2,1,0],
    [0,1,3,2,3,3,2,3,1,0],
    [0,1,3,3,2,2,3,3,1,0],
    [0,1,3,3,3,3,3,3,1,0],
    [0,1,3,4,4,4,4,3,1,0],
    [0,1,3,4,4,4,4,3,1,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];
  const iconQuest = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,3,3,3,3,1,0,0],
    [0,0,0,0,0,3,3,1,0,0],
    [0,0,0,0,3,3,1,0,0,0],
    [0,0,0,1,3,1,0,0,0,0],
    [0,0,0,1,3,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,3,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];

  // ---- Build cache ----
  function build() {
    cache.grass = addOutline(render(grassTile, PAL.grass, 2));
    cache.dirt  = addOutline(render(dirtTile,  PAL.dirt,  2));
    cache.stone = addOutline(render(stoneTile, PAL.stone, 2));
    cache.water = addOutline(render(waterTile, PAL.water, 2));
    cache.wood  = addOutline(render(woodTile,  PAL.wood,  2));
    cache.roof  = addOutline(render(roofTile,  PAL.roof,  2));
    cache.tree  = addOutline(render(treeTile,  PAL.tree,  2));

    cache.warrior = charFrames('warrior');
    cache.mage    = charFrames('mage');
    cache.hunter  = charFrames('hunter');

    cache.boar   = addOutline(render(boarSprite,   PAL.boar,   2));
    cache.spider = addOutline(render(spiderSprite, PAL.spider, 2));
    cache.kobold = addOutline(render(humanoid('kobold'), PAL.kobold, 2));
    cache.bandit = addOutline(render(humanoid('bandit'), PAL.bandit, 2));
    cache.gnoll  = addOutline(render(humanoid('gnoll'),  PAL.gnoll,  2));
    cache.dmage  = addOutline(render(humanoid('dmage'),  PAL.dmage,  2));
    cache.dboss  = addOutline(render(humanoid('dboss'),  PAL.dboss,  2));
    cache.mech   = addOutline(render(mechSprite, PAL.mech, 2));
    cache.npc    = addOutline(render(humanoid('bandit'), PAL.npc, 2));

    cache.fireball = addOutline(render(fireballSprite, PAL.fireball, 2));
    cache.arrow    = addOutline(render(arrowSprite,    PAL.arrow,    2));
    cache.ice      = addOutline(render(iceSprite,      PAL.ice,      2));

    // Item icons (10x10 at scale 2 = 20x20, with outline = 22x22)
    cache.icon_sword   = addOutline(render(iconSword,   ICON_PAL.sword,   2));
    cache.icon_staff   = addOutline(render(iconStaff,   ICON_PAL.staff,   2));
    cache.icon_bow     = addOutline(render(iconBow,     ICON_PAL.bow,     2));
    cache.icon_helm    = addOutline(render(iconHelm,    ICON_PAL.helm,    2));
    cache.icon_chest   = addOutline(render(iconChest,   ICON_PAL.chest,   2));
    cache.icon_legs    = addOutline(render(iconLegs,    ICON_PAL.legs,    2));
    cache.icon_ring    = addOutline(render(iconRing,    ICON_PAL.ring,    2));
    cache.icon_trinket = addOutline(render(iconTrinket, ICON_PAL.trinket, 2));
    cache.icon_potion  = addOutline(render(iconPotion,  ICON_PAL.potion,  2));
    cache.icon_bread   = addOutline(render(iconBread,   ICON_PAL.bread,   2));
    cache.icon_water   = addOutline(render(iconWater,   ICON_PAL.water_i, 2));
    cache.icon_meat    = addOutline(render(iconMeat,    ICON_PAL.meat,    2));
    cache.icon_gear    = addOutline(render(iconGear,    ICON_PAL.gear,    2));
    cache.icon_letter  = addOutline(render(iconLetter,  ICON_PAL.letter,  2));
    cache.icon_quest   = addOutline(render(iconQuest,   ICON_PAL.quest,   2));
  }

  function get(name) { return cache[name]; }

  // Map item IDs from items.js to the appropriate icon canvas
  function getItemIcon(itemId) {
    const iconMap = {
      // weapons
      rustSword: 'icon_sword', ironSword: 'icon_sword', steelBlade: 'icon_sword',
      oakStaff: 'icon_staff', arcaneStaff: 'icon_staff',
      shortBow: 'icon_bow', longBow: 'icon_bow',
      // armor
      leatherCap: 'icon_helm', ironHelm: 'icon_helm', warmask: 'icon_helm',
      leatherVest: 'icon_chest', chainMail: 'icon_chest',
      leatherLegs: 'icon_legs', ironLegs: 'icon_legs',
      copperRing: 'icon_ring', silverRing: 'icon_ring',
      luckyCharm: 'icon_trinket',
      // consumables
      potion: 'icon_potion',
      bread: 'icon_bread',
      water: 'icon_water',
      // quest items
      boarMeat: 'icon_meat',
      koboldGear: 'icon_gear',
      banditLetter: 'icon_letter',
      mechPart: 'icon_gear',
      vcHead: 'icon_quest',
    };
    const key = iconMap[itemId];
    return key ? cache[key] : cache['icon_quest'];
  }

  return { build, get, getItemIcon };
})();
