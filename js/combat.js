// combat.js - damage rolls, floating text, projectiles
const Combat = (() => {
  const floaters = []; // {x, y, text, color, t, vy, size}

  function roll(attacker, defender, base, bonus = 1.0) {
    const armor = defender.armor || 0;
    const mit = 1 - armor / (armor + 100);
    let dmg = base * bonus * mit;
    // crit
    const critChance = (attacker.critChance ? attacker.critChance() : 0.05);
    let crit = false;
    if (Math.random() < critChance) { dmg *= 1.5; crit = true; }
    dmg = Math.max(1, Math.round(dmg));
    // schedule floater
    pushFloat(defender.x + defender.w / 2, defender.y, '-' + dmg, crit ? '#ffcc40' : '#ff5050', crit ? 18 : 14);
    return dmg;
  }

  function pushFloat(x, y, text, color = '#ffffff', size = 14) {
    floaters.push({ x, y, text, color, size, t: 0, vy: -28 });
  }

  function update(dt) {
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      f.t += dt;
      f.y += f.vy * dt;
      f.vy += 20 * dt;
      if (f.t > 0.9) floaters.splice(i, 1);
    }
  }

  function draw(ctx, cam) {
    ctx.save();
    ctx.textAlign = 'center';
    for (const f of floaters) {
      const alpha = 1 - (f.t / 0.9);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.font = `bold ${f.size}px "Courier New", monospace`;
      ctx.fillStyle = '#000';
      ctx.fillText(f.text, f.x - cam.x + 1, f.y - cam.y + 1);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x - cam.x, f.y - cam.y);
    }
    ctx.restore();
  }

  return { roll, pushFloat, update, draw, floaters };
})();
