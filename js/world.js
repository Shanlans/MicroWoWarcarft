// world.js - tile map, collision, entity containers, projectiles
const TILE = 32;

// Tile codes
// G=grass, D=dirt path, W=water, T=tree, S=stone wall, R=roof, P=wood floor
const TILE_TYPES = {
  G: { asset: 'grass', solid: false },
  D: { asset: 'dirt',  solid: false },
  W: { asset: 'water', solid: true  },
  T: { asset: 'tree',  solid: true  },
  S: { asset: 'stone', solid: true  },
  R: { asset: 'roof',  solid: true  },
  P: { asset: 'wood',  solid: false },
};

// ---- Map builder ----
function makeMap(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const data = [];
  for (let y = 0; y < h; y++) {
    data.push(rows[y].split(''));
  }
  return { data, w, h, pixelW: w * TILE, pixelH: h * TILE };
}

// ---- Elwynn Forest map (40x30) ----
const ELWYNN_ROWS = [
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGT",
  "TGGGGGGGGGGTTTGGGGGGGGGGGGGTTGGGGGGGGGGT",
  "TGTTGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGTTGGGT",
  "TGTTGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGT",
  "TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGTTGGT",
  "TGGGGGGDDDDDDDDDDDDDDDDDDDDDDDDGGGGGGGGT",
  "TGGTTGGDGGGGGGGGGGGGGGGGGGGGGGDGGGGGGGGT",
  "TGGGGGGDGGSSSSSSSSSSSSGGGGGGGGDGGGGTTGGT",
  "TGGGGGGDGGSPPPPPPPPPPSGGGGGGGGDGGGGGGGGT",
  "TGGGGGGDGGSPPPPPPPPPPSGGGGGGGGDGGGGGGGGT",
  "TGGGGGGDGGSPPPPPPPPPPSGGGTTGGGDGGGGGGGGT",
  "TGTTGGGDGGDPPPPPPPPPPDGGGGGGGGDGGGGGTTGT",
  "TGGGGGGDDDDDPPPPPPPPDDDDDDDDDDDGGGGGGGGT",
  "TGGGGGGGGGGSPPPPPPPPSGGGGGGGGGGGGGGGGGGT",
  "TGGGGGGGGGGSPPPPPPPPSGGGGGGGGGGGGTTGGGGT",
  "TGGTTGGGGGGSSSSSSSSSSGGGGGGGGGGGGGGGGGGT",
  "TGGGGGGGGGGGGGDDDDDGGGGGGGGGGGGGGGGGGGGT",
  "TGGGGGGGGGGGGGDGGGDGGGGGGGGGGGTTGGGGGGGT",
  "TGGTTGGGGGGGGGDGGGDGGGGGGGGGGGGGGGGGGGGT",
  "TGGGGGGGGGGGGGDGGGDGGGGGGTTGGGGGGGGGGGGT",
  "TGGGGGGGTTGGGGDGGGDGGGGGGGGGGGGGGGGTTGGT",
  "TGGGGGGGGGGGGGDGGGDGGGGGGGGGGGGGGGGGGGGT",
  "TGGGGGGGGGGGGGDGGGDDDDDDDDDDDDDDDDDDGGGT",
  "TGGTTGGGGGGGGGDGGGGGGGGGGGGGGGGGGGGGGGGT",
  "TGGGGGGGGGGGGGDGGGGGGGGGTTGGGGGGGGGGGGGT",
  "TGGGGGGGGGGGGGDGGGGGGGGGGGGGGGGGGGGTTGGT",
  "TGGGTTGGGGGGGGDGGGGGGGGGGGGGGGGGGGGGGGGT",
  "TGGGGGGGGGGGGGDGGGGGGGGGGGGGGGGGGGGGGGGT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
];

// ---- Westfall map (40x30) ----
const WESTFALL_ROWS = [
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
  "TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGT",
  "TGGDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDGGT",
  "TGGDGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGSSSSSSGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGSPPPPSGGGGGGGGGGGGGGGGTTGGGGGGGDGGT",
  "TGGDGSPPPPSGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGSPPPPSGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGSSGGSSGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGGGDDGGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGGGGTTGGGGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGGTTGGGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGSSSGGSSSGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGSPPPPPPSGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGSPPPPPPSGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGSPPPPPPSGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGSPPPPPPSGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGSSSSSSSSGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGGGGTTGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGDGGT",
  "TGGDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDGGT",
  "TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGT",
  "TGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGT",
  "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
];

// ---- World container ----
class World {
  constructor(zone) {
    this.zone = zone;
    this.map = makeMap(zone === 'elwynn' ? ELWYNN_ROWS : WESTFALL_ROWS);
    this.enemies = [];
    this.npcs = [];
    this.projectiles = [];
    this.transitions = []; // {x, y, w, h, to}
    this.loot = []; // floating pickups
    this.bossDefeated = false;
  }
  collidesBox(x, y, w, h) {
    // bounds
    if (x < 0 || y < 0 || x + w > this.map.pixelW || y + h > this.map.pixelH) return true;
    const x0 = Math.floor(x / TILE);
    const y0 = Math.floor(y / TILE);
    const x1 = Math.floor((x + w - 1) / TILE);
    const y1 = Math.floor((y + h - 1) / TILE);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const c = this.map.data[ty][tx];
        const t = TILE_TYPES[c];
        if (!t || t.solid) return true;
      }
    }
    return false;
  }
  draw(ctx, cam) {
    const x0 = Math.max(0, Math.floor(cam.x / TILE));
    const y0 = Math.max(0, Math.floor(cam.y / TILE));
    const x1 = Math.min(this.map.w - 1, Math.ceil((cam.x + cam.w) / TILE));
    const y1 = Math.min(this.map.h - 1, Math.ceil((cam.y + cam.h) / TILE));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const c = this.map.data[y][x];
        const t = TILE_TYPES[c];
        if (!t) continue;
        // base ground under trees so it doesn't show black
        if (c === 'T' || c === 'S' || c === 'W') {
          ctx.drawImage(Assets.get('grass'), x * TILE - cam.x, y * TILE - cam.y);
        }
        ctx.drawImage(Assets.get(t.asset), x * TILE - cam.x, y * TILE - cam.y);
      }
    }
    // loot piles
    for (const l of this.loot) {
      const px = Math.round(l.x - cam.x), py = Math.round(l.y - cam.y);
      ctx.fillStyle = '#000';
      ctx.fillRect(px - 5, py - 5, 10, 10);
      ctx.fillStyle = '#ffe040';
      ctx.fillRect(px - 4, py - 4, 8, 8);
    }
  }
  spawnProjectile(from, to, sprite, dmg, onHit) {
    const a = from.center(), b = to.center();
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = sprite === 'arrow' ? 420 : 320;
    this.projectiles.push({
      x: a.x, y: a.y,
      vx: (dx / len) * speed, vy: (dy / len) * speed,
      sprite, dmg, owner: from, target: to, onHit, t: 0,
    });
  }
  updateProjectiles(dt, player) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.t += dt;
      if (p.t > 3) { this.projectiles.splice(i, 1); continue; }
      // hit target if close
      if (!p.target.dead) {
        const tc = p.target.center();
        if (Math.hypot(p.x - tc.x, p.y - tc.y) < 18) {
          p.target.takeDamage(p.dmg, p.owner);
          if (p.sprite === 'fireball') Effects.explosion(tc.x, tc.y, '#ff8040', 28);
          else if (p.sprite === 'ice') Effects.iceBurst(tc.x, tc.y);
          else if (p.sprite === 'arrow') Effects.spark(tc.x, tc.y, '#ffe080');
          if (p.onHit) p.onHit(p.target);
          this.projectiles.splice(i, 1);
          continue;
        }
      }
      // wall
      if (this.collidesBox(p.x - 4, p.y - 4, 8, 8)) {
        this.projectiles.splice(i, 1);
      }
    }
  }
  drawProjectiles(ctx, cam) {
    for (const p of this.projectiles) {
      const img = Assets.get(p.sprite);
      ctx.drawImage(img, Math.round(p.x - cam.x - 8), Math.round(p.y - cam.y - 8));
    }
  }
}

// ---- Zone builder: fill enemies / NPCs / transitions ----
function buildElwynn(world, player) {
  const s = (ex, ey) => ({ x: ex * TILE, y: ey * TILE });

  // Enemies around the forest (avoid the town and road)
  const spots = [
    ['boar', 4, 3], ['boar', 6, 4], ['boar', 5, 22], ['boar', 8, 25], ['boar', 3, 27],
    ['spider', 33, 4], ['spider', 35, 5], ['spider', 34, 22],
    ['kobold', 3, 18], ['kobold', 3, 20], ['kobold', 4, 17],
    ['kobold', 36, 17], ['kobold', 37, 18],
    ['bandit', 30, 25], ['bandit', 32, 27], ['bandit', 28, 26],
    ['banditLeader', 33, 27],
  ];
  for (const [id, tx, ty] of spots) {
    world.enemies.push(new Enemy(id, tx * TILE, ty * TILE));
  }

  // NPCs in Goldshire (wood platform area ~ rows 9-16, cols 11-20)
  world.npcs.push(NPC.create('innkeeper',       13 * TILE, 11 * TILE));
  world.npcs.push(NPC.create('questGiver',      16 * TILE, 11 * TILE));
  world.npcs.push(NPC.create('merchant',        13 * TILE, 14 * TILE));
  world.npcs.push(NPC.create('trainerWarrior',  18 * TILE, 11 * TILE));
  world.npcs.push(NPC.create('trainerMage',     18 * TILE, 13 * TILE));
  world.npcs.push(NPC.create('trainerHunter',   18 * TILE, 15 * TILE));
  world.npcs.push(NPC.create('guardMarshal',    15 * TILE, 9 * TILE));

  // Transition to Westfall (east edge, rows 23-25)
  world.transitions.push({ x: 38 * TILE, y: 22 * TILE, w: TILE * 2, h: TILE * 3, to: 'westfall' });

  // Player spawn in town
  player.x = 15 * TILE; player.y = 12 * TILE;
}

function buildWestfall(world, player) {
  const spots = [
    ['gnoll', 4, 4], ['gnoll', 6, 6], ['gnoll', 5, 10],
    ['gnoll', 32, 4], ['gnoll', 34, 5],
    ['dmage', 28, 10], ['dmage', 30, 12],
    ['dmage', 10, 14], ['dmage', 12, 16],
    ['dforeman', 30, 22], ['dforeman', 32, 24],
    ['mech', 8, 22], ['mech', 10, 24], ['mech', 28, 25],
    ['vancleef', 21, 20],
  ];
  for (const [id, tx, ty] of spots) {
    world.enemies.push(new Enemy(id, tx * TILE, ty * TILE));
  }
  // Sentinel Hill NPCs (small hut at ~ cols 5-10, rows 4-8)
  world.npcs.push(NPC.create('gryanStoutmantle', 7 * TILE, 5 * TILE));
  world.npcs.push(NPC.create('merchantWest',     7 * TILE, 7 * TILE));

  // transition back to elwynn
  world.transitions.push({ x: 0, y: 22 * TILE, w: TILE, h: TILE * 3, to: 'elwynn' });

  player.x = 2 * TILE; player.y = 23 * TILE;
}
