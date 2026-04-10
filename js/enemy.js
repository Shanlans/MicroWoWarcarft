// enemy.js - enemy entity and templates
const EnemyDB = {
  boar:   { sprite: 'boar',   name: '野猪',       level: 2,  hp: 45,  dmg: 6,  armor: 2,  speed: 80,  sight: 150, range: 32,  xp: 25, loot: [['boarMeat', 0.6]], ranged: false, w: 32, h: 32 },
  spider: { sprite: 'spider', name: '林地蜘蛛',   level: 3,  hp: 55,  dmg: 7,  armor: 2,  speed: 100, sight: 170, range: 32,  xp: 30, loot: [], ranged: false, w: 32, h: 32 },
  kobold: { sprite: 'kobold', name: '狗头人矿工', level: 4,  hp: 70,  dmg: 9,  armor: 4,  speed: 85,  sight: 180, range: 32,  xp: 40, loot: [['koboldGear', 0.5], ['bread', 0.2]], ranged: false, w: 40, h: 48 },
  bandit: { sprite: 'bandit', name: '迪菲亚强盗', level: 5,  hp: 90,  dmg: 11, armor: 5,  speed: 95,  sight: 200, range: 32,  xp: 55, loot: [['rustSword', 0.1], ['bread', 0.25], ['leatherCap', 0.08]], ranged: false, w: 40, h: 48 },
  banditLeader:{ sprite:'bandit', name:'强盗头目', level:6, hp:180, dmg:15, armor:8, speed:95, sight:220, range:32, xp:120, loot:[['banditLetter',1],['ironSword',0.4]], ranged:false, w:40, h:48 },
  gnoll:  { sprite: 'gnoll',  name: '豺狼人',     level: 6,  hp: 110, dmg: 13, armor: 8,  speed: 100, sight: 210, range: 32,  xp: 70, loot: [['leatherVest', 0.12], ['bread', 0.2]], ranged: false, w: 40, h: 48 },
  dmage:  { sprite: 'dmage',  name: '迪菲亚法师', level: 7,  hp: 95,  dmg: 16, armor: 4,  speed: 90,  sight: 240, range: 200, xp: 85, loot: [['water', 0.3], ['oakStaff', 0.08]], ranged: true, proj: 'fireball', w: 40, h: 48 },
  dforeman:{ sprite:'dboss',  name: '迪菲亚监工', level: 8,  hp: 200, dmg: 18, armor: 12, speed: 100, sight: 240, range: 32,  xp: 140, loot: [['mechPart', 0.5], ['silverRing', 0.1]], ranged: false, w: 40, h: 48 },
  mech:   { sprite: 'mech',   name: '收割机器',   level: 9,  hp: 280, dmg: 20, armor: 16, speed: 60,  sight: 180, range: 36,  xp: 170, loot: [['mechPart', 1], ['ironLegs', 0.2]], ranged: false, w: 48, h: 48 },
  vancleef:{ sprite:'dboss',  name: '范克里夫',   level: 12, hp: 700, dmg: 26, armor: 20, speed: 110, sight: 280, range: 36,  xp: 500, loot: [['vcHead',1], ['warmask',1], ['steelBlade',0.5], ['arcaneStaff',0.5], ['longBow',0.5]], ranged: false, w: 48, h: 56, boss: true },
};

class Enemy extends Entity {
  constructor(id, x, y) {
    const t = EnemyDB[id];
    super(x, y, t.w, t.h);
    this.id = id;
    this.template = t;
    this.maxHp = t.hp;
    this.hp = t.hp;
    this.armor = t.armor;
    this.speed = t.speed;
    this.state = 'idle';
    this.sight = t.sight;
    this.range = t.range;
    this.attackCd = 0;
    this.idleTimer = 0;
    this.wanderDir = { x: 0, y: 0 };
    this.spawnX = x; this.spawnY = y;
    this.name = t.name;
    this.level = t.level;
    this.critChance = () => 0.03;
    this.respawnAt = 0;
    this.onDeath = (from) => {
      // normal enemies respawn after 45 seconds, bosses stay dead
      if (!t.boss) this.respawnAt = performance.now() + 45000;
      if (from instanceof Player) {
        from.gainXp(t.xp);
        from.killLog[id] = (from.killLog[id] || 0) + 1;
        // loot
        for (const [itemId, chance] of t.loot || []) {
          if (Math.random() < chance) from.addItem(itemId, 1);
        }
        // gold drop
        const g = Math.floor(t.level * (1 + Math.random() * 2));
        from.gold += g;
        Combat.pushFloat(this.x + this.w / 2, this.y - 18, '+' + g + ' 金', '#ffe040', 12);
      }
    };
  }
  tryRespawn(player) {
    if (!this.dead || !this.respawnAt) return;
    if (performance.now() < this.respawnAt) return;
    // don't respawn right under the player's nose
    const pc = player.center();
    const dx = this.spawnX + this.w / 2 - pc.x;
    const dy = this.spawnY + this.h / 2 - pc.y;
    if (Math.hypot(dx, dy) < 180) return;
    this.hp = this.maxHp;
    this.dead = false;
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.state = 'idle';
    this.dots = [];
    this.damageFlash = 0;
    this.attackCd = 0;
    this.respawnAt = 0;
  }
  update(dt, world, player) {
    if (this.dead) { this.tryRespawn(player); return; }
    this.updateDots(dt);
    const slowed = (performance.now() / 1000) < this.slowUntil;
    const speed = this.speed * (slowed ? 0.5 : 1);
    this.attackCd = Math.max(0, this.attackCd - dt);
    const d = this.distTo(player);
    if (!player.dead && d <= this.sight) this.state = 'chase';
    if (this.state === 'chase') {
      if (player.dead || d > this.sight * 1.8) {
        this.state = 'idle';
      } else if (d <= this.range) {
        // attack
        if (this.attackCd <= 0) {
          if (this.template.ranged) {
            world.spawnProjectile(this, player, this.template.proj || 'fireball',
              Combat.roll(this, player, this.template.dmg));
          } else {
            const dmg = Combat.roll(this, player, this.template.dmg);
            player.takeDamage(dmg, this);
          }
          this.attackCd = 1.8;
        }
        this.moving = false;
      } else {
        // pathfind naive: move toward player
        const pc = player.center(), me = this.center();
        const dx = pc.x - me.x, dy = pc.y - me.y;
        const len = Math.hypot(dx, dy);
        const nx = this.x + (dx / len) * speed * dt;
        const ny = this.y + (dy / len) * speed * dt;
        if (!world.collidesBox(nx, this.y, this.w, this.h)) this.x = nx;
        if (!world.collidesBox(this.x, ny, this.w, this.h)) this.y = ny;
        if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? 'right' : 'left';
        else this.dir = dy > 0 ? 'down' : 'up';
        this.moving = true;
      }
    } else {
      // idle wander
      this.idleTimer -= dt;
      if (this.idleTimer <= 0) {
        this.idleTimer = 1 + Math.random() * 2;
        const a = Math.random() * Math.PI * 2;
        this.wanderDir = { x: Math.cos(a), y: Math.sin(a) };
        if (Math.random() < 0.5) this.wanderDir = { x: 0, y: 0 };
      }
      const nx = this.x + this.wanderDir.x * speed * 0.3 * dt;
      const ny = this.y + this.wanderDir.y * speed * 0.3 * dt;
      const dx = nx - this.spawnX, dy = ny - this.spawnY;
      if (Math.hypot(dx, dy) < 120 && !world.collidesBox(nx, this.y, this.w, this.h)) this.x = nx;
      if (Math.hypot(dx, dy) < 120 && !world.collidesBox(this.x, ny, this.w, this.h)) this.y = ny;
      this.moving = (this.wanderDir.x !== 0 || this.wanderDir.y !== 0);
      if (Math.abs(this.wanderDir.x) > Math.abs(this.wanderDir.y))
        this.dir = this.wanderDir.x > 0 ? 'right' : 'left';
      else if (this.wanderDir.y !== 0)
        this.dir = this.wanderDir.y > 0 ? 'down' : 'up';
    }
    this.animate(dt);
  }
  draw(ctx, cam) {
    const img = Assets.get(this.template.sprite);
    const dx = Math.round(this.x - cam.x), dy = Math.round(this.y - cam.y);
    ctx.drawImage(img, dx, dy);
    if (this.damageFlash > 0) {
      // flash overlay: brighten sprite with "lighter" blend
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.7 * (this.damageFlash / 0.15);
      ctx.drawImage(img, dx, dy);
      ctx.drawImage(img, dx, dy);
      ctx.restore();
    }
    // hp bar
    const x = Math.round(this.x - cam.x);
    const y = Math.round(this.y - cam.y - 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, this.w, 4);
    ctx.fillStyle = this.template.boss ? '#ff4040' : '#ff8040';
    ctx.fillRect(x + 1, y + 1, (this.w - 2) * (this.hp / this.maxHp), 2);
    // name
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(`[${this.level}] ${this.name}`, x + this.w / 2 + 1, y - 3);
    ctx.fillStyle = this.template.boss ? '#ff6060' : '#ffd0a0';
    ctx.fillText(`[${this.level}] ${this.name}`, x + this.w / 2, y - 4);
    // debuff icons above the hp bar
    if (this.dots.length > 0) {
      ctx.textAlign = 'center';
      let ix = x + this.w / 2 - (this.dots.length * 7);
      for (const d of this.dots) {
        const col = d.name === '流血' ? '#d02020' : d.name === '剧毒' ? '#30b030' : '#6080ff';
        ctx.fillStyle = '#000'; ctx.fillRect(ix - 1, y - 28, 12, 12);
        ctx.fillStyle = col;   ctx.fillRect(ix, y - 27, 10, 10);
        // remaining seconds
        ctx.fillStyle = '#fff'; ctx.font = 'bold 8px monospace';
        ctx.fillText(Math.ceil(d.duration - d.t), ix + 5, y - 18);
        ix += 14;
      }
    }
  }
}
