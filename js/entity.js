// entity.js - base entity for player and enemies
class Entity {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.vx = 0; this.vy = 0;
    this.dir = 'down';
    this.animStep = 0;
    this.animT = 0;
    this.moving = false;
    this.hp = 10; this.maxHp = 10;
    this.mp = 0; this.maxMp = 0;
    this.armor = 0;
    this.dead = false;
    this.dots = [];
    this.slowUntil = 0;
    this.damageFlash = 0;
  }
  center() { return { x: this.x + this.w / 2, y: this.y + this.h / 2 }; }
  distTo(other) {
    const a = this.center(), b = other.center();
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }
  takeDamage(dmg, from) {
    if (this.dead) return;
    this.hp -= dmg;
    this.damageFlash = 0.15;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.onDeath && this.onDeath(from);
    } else {
      this.onDamaged && this.onDamaged(from);
    }
  }
  applyDot(dot) {
    // stack by name (refresh)
    const existing = this.dots.find(d => d.name === dot.name);
    if (existing) { existing.duration = dot.duration; return; }
    this.dots.push({ ...dot, t: 0, tick: 0 });
  }
  updateDots(dt) {
    for (let i = this.dots.length - 1; i >= 0; i--) {
      const d = this.dots[i];
      d.t += dt;
      d.tick += dt;
      if (d.tick >= 1) {
        d.tick = 0;
        this.takeDamage(d.dps, d.src);
      }
      if (d.t >= d.duration) this.dots.splice(i, 1);
    }
  }
  animate(dt) {
    if (this.moving) {
      this.animT += dt;
      if (this.animT >= 0.18) { this.animT = 0; this.animStep ^= 1; }
    } else {
      this.animStep = 0; this.animT = 0;
    }
    if (this.damageFlash > 0) this.damageFlash = Math.max(0, this.damageFlash - dt);
  }
}
