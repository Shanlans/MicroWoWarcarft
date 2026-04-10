// player.js - Player entity
class Player extends Entity {
  constructor(cls) {
    super(0, 0, 40, 48);
    this.cls = cls; // 'warrior' | 'mage' | 'hunter'
    this.name = ({ warrior: '战士', mage: '法师', hunter: '猎人' })[cls];
    this.level = 1;
    this.xp = 0;
    this.gold = 25;
    this.stats = { str: 5, agi: 5, int: 5, sta: 5 };
    if (cls === 'warrior') this.stats.str = 10;
    if (cls === 'hunter')  this.stats.agi = 10;
    if (cls === 'mage')    this.stats.int = 10;
    this.baseAtk = cls === 'warrior' ? 8 : cls === 'hunter' ? 6 : 4;
    this.baseArmor = cls === 'warrior' ? 10 : cls === 'hunter' ? 5 : 2;
    this.speed = 160;
    this.skills = Skills.CLASS_START[cls].slice();
    this.cooldowns = {};
    this.equipment = { head: null, chest: null, legs: null, weapon: null, ring: null, trinket: null };
    this.inventory = [];
    this.target = null;
    this.autoAttackCd = 0;
    this.recomputeStats();
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    this.gcd = 0; // global cooldown
    this.killLog = {}; // enemyId -> count
    this.questState = {}; // questId -> { status: 'active'|'done', progress }
    this.reachedZones = { elwynn: true };
    this.currentZone = 'elwynn';
  }
  mainStat() {
    if (this.cls === 'warrior') return this.stats.str;
    if (this.cls === 'mage')    return this.stats.int;
    return this.stats.agi;
  }
  critChance() {
    return 0.05 + this.stats.agi * 0.002;
  }
  recomputeStats() {
    const s = { str: 0, agi: 0, int: 0, sta: 0, armor: 0, atk: 0 };
    for (const k of Object.keys(this.equipment)) {
      const it = this.equipment[k];
      if (!it || !it.stats) continue;
      for (const kk of Object.keys(it.stats)) s[kk] = (s[kk] || 0) + it.stats[kk];
    }
    this.totalStats = {
      str: this.stats.str + (s.str || 0),
      agi: this.stats.agi + (s.agi || 0),
      int: this.stats.int + (s.int || 0),
      sta: this.stats.sta + (s.sta || 0),
    };
    this.armor = this.baseArmor + (s.armor || 0);
    this.atk = this.baseAtk + (s.atk || 0);
    const prevMaxHp = this.maxHp || 0;
    const prevMaxMp = this.maxMp || 0;
    this.maxHp = 80 + this.totalStats.sta * 10 + this.level * 10;
    this.maxMp = 40 + this.totalStats.int * 5 + this.level * 5;
    if (prevMaxHp) { // preserve ratio on recompute
      this.hp = Math.min(this.maxHp, Math.round(this.hp * this.maxHp / prevMaxHp));
      this.mp = Math.min(this.maxMp, Math.round(this.mp * this.maxMp / prevMaxMp));
    }
  }
  // stat delta for mainStat() based equation
  gainXp(amount) {
    this.xp += amount;
    Combat.pushFloat(this.x + this.w / 2, this.y - 10, '+' + amount + ' XP', '#80ffff', 12);
    let leveled = false;
    while (this.xp >= this.xpToNext()) {
      this.xp -= this.xpToNext();
      this.levelUp();
      leveled = true;
    }
    return leveled;
  }
  xpToNext() { return 80 + (this.level - 1) * 40; }
  levelUp() {
    this.level++;
    this.stats.str += this.cls === 'warrior' ? 3 : 1;
    this.stats.agi += this.cls === 'hunter' ? 3 : 1;
    this.stats.int += this.cls === 'mage' ? 3 : 1;
    this.stats.sta += 2;
    this.recomputeStats();
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    Combat.pushFloat(this.x + this.w / 2, this.y - 26, '升级! Lv.' + this.level, '#ffe040', 18);
    // prompt to visit trainer for new skills
    const order = Skills.CLASS_ORDER[this.cls];
    if (this.level === 5 && !this.skills.includes(order[1])) {
      UI.toast('可以在训练师处学习新技能', '#ffe040');
    }
    if (this.level === 10 && !this.skills.includes(order[2])) {
      UI.toast('可以在训练师处学习新技能', '#ffe040');
    }
  }
  update(dt, world) {
    if (this.dead) return;
    this.updateDots(dt);
    let dx = 0, dy = 0;
    if (Input.isDown('w')) dy -= 1;
    if (Input.isDown('s')) dy += 1;
    if (Input.isDown('a')) dx -= 1;
    if (Input.isDown('d')) dx += 1;
    this.moving = (dx !== 0 || dy !== 0);
    if (this.moving) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      const sp = this.speed * dt;
      const nx = this.x + dx * sp;
      const ny = this.y + dy * sp;
      if (!world.collidesBox(nx, this.y, this.w, this.h)) this.x = nx;
      if (!world.collidesBox(this.x, ny, this.w, this.h)) this.y = ny;
      if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? 'right' : 'left';
      else this.dir = dy > 0 ? 'down' : 'up';
    }
    this.animate(dt);
    // cooldowns
    for (const k of Object.keys(this.cooldowns)) {
      this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt);
    }
    this.gcd = Math.max(0, this.gcd - dt);
    this.autoAttackCd = Math.max(0, this.autoAttackCd - dt);
    // auto-attack target in range
    if (this.target && !this.target.dead) {
      const range = this.cls === 'warrior' ? 48 : 200;
      if (this.distTo(this.target) <= range && this.autoAttackCd <= 0) {
        const tc = this.target.center();
        if (this.cls === 'warrior') {
          const dmg = Combat.roll(this, this.target, this.atk + this.mainStat());
          this.target.takeDamage(dmg, this);
          Effects.slash(tc.x, tc.y, '#ffffff', 30);
        } else {
          const sprite = this.cls === 'mage' ? 'fireball' : 'arrow';
          const dmg = this.atk + this.mainStat() * 0.8;
          world.spawnProjectile(this, this.target, sprite, Combat.roll(this, this.target, dmg));
        }
        this.autoAttackCd = 1.5;
      }
    } else {
      this.target = null;
    }
    // regen
    this.hp = Math.min(this.maxHp, this.hp + 3 * dt);
    this.mp = Math.min(this.maxMp, this.mp + 4 * dt);
  }
  canUseSkill(i) {
    const id = this.skills[i];
    if (!id) return false;
    const sk = Skills.get(id);
    if ((this.cooldowns[id] || 0) > 0) return false;
    if (this.mp < sk.mp) return false;
    if (this.gcd > 0) return false;
    return true;
  }
  useSkill(i, world) {
    const id = this.skills[i];
    if (!id) return false;
    const sk = Skills.get(id);
    if ((this.cooldowns[id] || 0) > 0) {
      UI.toast(sk.name + ' 冷却中', '#ff8080');
      return false;
    }
    if (this.mp < sk.mp) {
      UI.toast('法力不足', '#80a0ff');
      return false;
    }
    if (this.gcd > 0) return false;
    // single-target skills need a target
    const needsTarget = sk.id === 'slash' || sk.id === 'heroicStrike' ||
                        sk.id === 'fireball' || sk.id === 'frostbolt' ||
                        sk.id === 'aimShot' || sk.id === 'viperSting';
    if (needsTarget && (!this.target || this.target.dead)) {
      UI.toast('需要选择目标', '#ffe040');
      return false;
    }
    if (needsTarget && this.distTo(this.target) > sk.range) {
      UI.toast('目标超出范围', '#ffe040');
      return false;
    }
    const ok = sk.onUse(this, this.target, world);
    if (ok) {
      this.cooldowns[id] = sk.cd;
      this.mp -= sk.mp;
      this.gcd = 0.6;
      return true;
    } else {
      UI.toast('附近没有可攻击的目标', '#ffe040');
    }
    return false;
  }
  addItem(id, n = 1) {
    const it = Items.get(id);
    if (!it) return;
    if (it.type === 'consume' || it.type === 'quest') {
      const existing = this.inventory.find(x => x.id === id);
      if (existing) { existing.count += n; return; }
      this.inventory.push({ id, count: n });
    } else {
      for (let i = 0; i < n; i++) this.inventory.push({ id, count: 1 });
    }
  }
  removeItem(id, n = 1) {
    for (let i = 0; i < this.inventory.length && n > 0; i++) {
      if (this.inventory[i].id === id) {
        if (this.inventory[i].count <= n) {
          n -= this.inventory[i].count;
          this.inventory.splice(i, 1); i--;
        } else {
          this.inventory[i].count -= n; n = 0;
        }
      }
    }
  }
  countItem(id) {
    let n = 0;
    for (const s of this.inventory) if (s.id === id) n += s.count;
    return n;
  }
  equip(idx) {
    const slot = this.inventory[idx];
    if (!slot) return;
    const it = Items.get(slot.id);
    if (!it || (it.type !== 'armor' && it.type !== 'weapon')) return;
    const prev = this.equipment[it.slot];
    this.equipment[it.slot] = it;
    this.inventory.splice(idx, 1);
    if (prev) this.inventory.push({ id: prev.id, count: 1 });
    this.recomputeStats();
  }
  unequip(slot) {
    const prev = this.equipment[slot];
    if (!prev) return;
    this.equipment[slot] = null;
    this.inventory.push({ id: prev.id, count: 1 });
    this.recomputeStats();
  }
  use(idx) {
    const slot = this.inventory[idx];
    if (!slot) return;
    const it = Items.get(slot.id);
    if (!it || it.type !== 'consume') return;
    if (it.heal) this.hp = Math.min(this.maxHp, this.hp + it.heal);
    if (it.mana) this.mp = Math.min(this.maxMp, this.mp + it.mana);
    this.removeItem(it.id, 1);
  }
  draw(ctx, cam) {
    const frames = Assets.get(this.cls);
    const img = frames[this.dir][this.animStep];
    ctx.drawImage(img, Math.round(this.x - cam.x), Math.round(this.y - cam.y));
    // hp bar under
    this.drawHpBar(ctx, cam);
  }
  drawHpBar(ctx, cam) {
    const x = Math.round(this.x - cam.x);
    const y = Math.round(this.y - cam.y - 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, this.w, 4);
    ctx.fillStyle = '#40ff40';
    ctx.fillRect(x + 1, y + 1, (this.w - 2) * (this.hp / this.maxHp), 2);
  }
}
