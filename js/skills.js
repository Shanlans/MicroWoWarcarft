// skills.js - skill definitions per class
const Skills = (() => {
  // damage = (base + mainStatCoef * mainStat) * armorMitigation
  // onUse(player, target, world) executes the skill effect
  const DB = {
    // ---- Warrior ----
    slash: {
      id: 'slash', name: '撕裂', cls: 'warrior', level: 1, mp: 0, cd: 2,
      range: 48, base: 10, coef: 1.0, desc: '近战撕裂目标,造成伤害并施加 3 秒流血。',
      onUse(p, t, w) {
        if (!t || t.dead) return false;
        if (p.distTo(t) > this.range) return false;
        const dmg = Combat.roll(p, t, this.base + p.mainStat() * this.coef);
        t.takeDamage(dmg, p);
        t.applyDot({ name: '流血', dps: 5, duration: 3, src: p });
        const tc = t.center();
        Effects.slash(tc.x, tc.y, '#ff5050', 40);
        return true;
      },
    },
    whirlwind: {
      id: 'whirlwind', name: '旋风斩', cls: 'warrior', level: 5, mp: 15, cd: 6,
      range: 64, base: 14, coef: 1.3, desc: '对周围所有敌人造成旋风伤害。',
      onUse(p, t, w) {
        const hit = [];
        for (const e of w.enemies) {
          if (!e.dead && p.distTo(e) <= this.range) {
            const dmg = Combat.roll(p, e, this.base + p.mainStat() * this.coef);
            e.takeDamage(dmg, p);
            const ec = e.center();
            Effects.slash(ec.x, ec.y, '#ffe040', 36);
            hit.push(e);
          }
        }
        const pc = p.center();
        Effects.ring(pc.x, pc.y, '#ffe040', this.range);
        return hit.length > 0;
      },
    },
    heroicStrike: {
      id: 'heroicStrike', name: '英勇打击', cls: 'warrior', level: 10, mp: 10, cd: 4,
      range: 48, base: 25, coef: 1.8, desc: '蓄力一击,造成巨额伤害。',
      onUse(p, t, w) {
        if (!t || t.dead || p.distTo(t) > this.range) return false;
        const dmg = Combat.roll(p, t, this.base + p.mainStat() * this.coef, 1.2);
        t.takeDamage(dmg, p);
        const tc = t.center();
        Effects.bigSlash(tc.x, tc.y, '#ff4040', 56);
        return true;
      },
    },

    // ---- Mage ----
    fireball: {
      id: 'fireball', name: '火球术', cls: 'mage', level: 1, mp: 8, cd: 1.5,
      range: 220, base: 12, coef: 1.4, desc: '投掷火球,造成火焰伤害。',
      onUse(p, t, w) {
        if (!t || t.dead || p.distTo(t) > this.range) return false;
        const dmg = Combat.roll(p, t, this.base + p.mainStat() * this.coef);
        w.spawnProjectile(p, t, 'fireball', dmg);
        return true;
      },
    },
    frostbolt: {
      id: 'frostbolt', name: '寒冰箭', cls: 'mage', level: 5, mp: 10, cd: 2,
      range: 200, base: 10, coef: 1.1, desc: '冰冻箭击,伤害并减速目标 3 秒。',
      onUse(p, t, w) {
        if (!t || t.dead || p.distTo(t) > this.range) return false;
        const dmg = Combat.roll(p, t, this.base + p.mainStat() * this.coef);
        w.spawnProjectile(p, t, 'ice', dmg, (tgt) => {
          tgt.slowUntil = (performance.now() / 1000) + 3;
        });
        return true;
      },
    },
    blizzard: {
      id: 'blizzard', name: '暴风雪', cls: 'mage', level: 10, mp: 30, cd: 10,
      range: 180, base: 18, coef: 1.6, desc: '召唤暴风雪轰击所有附近敌人。',
      onUse(p, t, w) {
        const hit = [];
        for (const e of w.enemies) {
          if (!e.dead && p.distTo(e) <= this.range) {
            const dmg = Combat.roll(p, e, this.base + p.mainStat() * this.coef);
            e.takeDamage(dmg, p);
            e.slowUntil = (performance.now() / 1000) + 2;
            const ec = e.center();
            Effects.iceBurst(ec.x, ec.y);
            hit.push(e);
          }
        }
        const pc = p.center();
        Effects.ring(pc.x, pc.y, '#80c0ff', this.range);
        return hit.length > 0;
      },
    },

    // ---- Hunter ----
    aimShot: {
      id: 'aimShot', name: '瞄准射击', cls: 'hunter', level: 1, mp: 5, cd: 2,
      range: 260, base: 14, coef: 1.3, desc: '射出精准一箭。',
      onUse(p, t, w) {
        if (!t || t.dead || p.distTo(t) > this.range) return false;
        const dmg = Combat.roll(p, t, this.base + p.mainStat() * this.coef);
        w.spawnProjectile(p, t, 'arrow', dmg);
        return true;
      },
    },
    multiShot: {
      id: 'multiShot', name: '多重射击', cls: 'hunter', level: 5, mp: 12, cd: 4,
      range: 220, base: 10, coef: 0.9, desc: '同时射击最多 3 个目标。',
      onUse(p, t, w) {
        const targets = w.enemies
          .filter(e => !e.dead && p.distTo(e) <= this.range)
          .sort((a, b) => p.distTo(a) - p.distTo(b))
          .slice(0, 3);
        targets.forEach(tgt => {
          const dmg = Combat.roll(p, tgt, this.base + p.mainStat() * this.coef);
          w.spawnProjectile(p, tgt, 'arrow', dmg);
        });
        return targets.length > 0;
      },
    },
    viperSting: {
      id: 'viperSting', name: '毒蛇钉刺', cls: 'hunter', level: 10, mp: 15, cd: 6,
      range: 240, base: 8, coef: 0.8, desc: '注入剧毒,造成持续伤害。',
      onUse(p, t, w) {
        if (!t || t.dead || p.distTo(t) > this.range) return false;
        const dmg = Combat.roll(p, t, this.base + p.mainStat() * this.coef);
        w.spawnProjectile(p, t, 'arrow', dmg, (tgt) => {
          tgt.applyDot({ name: '剧毒', dps: 12, duration: 6, src: p });
        });
        return true;
      },
    },
  };

  const CLASS_START = {
    warrior: ['slash'],
    mage:    ['fireball'],
    hunter:  ['aimShot'],
  };
  const CLASS_ORDER = {
    warrior: ['slash', 'whirlwind', 'heroicStrike'],
    mage:    ['fireball', 'frostbolt', 'blizzard'],
    hunter:  ['aimShot', 'multiShot', 'viperSting'],
  };

  function get(id) { return DB[id]; }

  return { DB, get, CLASS_START, CLASS_ORDER };
})();
