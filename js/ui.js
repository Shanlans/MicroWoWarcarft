// ui.js - HUD: hp/mp/xp bars, skill hotbar, target frame, toast
const UI = (() => {
  const toasts = []; // { text, color, t }
  let hotbarRects = []; // {x,y,w,h,index} - filled by draw(), read by main.js

  function toast(text, color = '#ffe040') {
    toasts.push({ text, color, t: 0 });
  }

  function getHotbarRects() { return hotbarRects; }

  function update(dt) {
    for (let i = toasts.length - 1; i >= 0; i--) {
      toasts[i].t += dt;
      if (toasts[i].t > 4.5) toasts.splice(i, 1);
    }
  }

  function drawBar(ctx, x, y, w, h, pct, color, bg = '#200') {
    ctx.fillStyle = '#000'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color; ctx.fillRect(x, y, Math.max(0, w * pct), h);
  }

  function draw(ctx, game) {
    const p = game.player;
    // Player frame top-left
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(10, 10, 260, 72);
    ctx.strokeStyle = '#a07030'; ctx.strokeRect(10, 10, 260, 72);
    ctx.fillStyle = '#f0e4c8'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`[${p.level}] ${p.name}`, 20, 28);
    drawBar(ctx, 20, 34, 240, 10, p.hp / p.maxHp, '#d04040', '#400');
    ctx.fillStyle = '#fff'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(p.hp)}/${p.maxHp}`, 140, 43);
    drawBar(ctx, 20, 48, 240, 8, p.mp / p.maxMp, '#4080ff', '#003');
    ctx.fillStyle = '#fff'; ctx.fillText(`${Math.floor(p.mp)}/${p.maxMp}`, 140, 55);
    drawBar(ctx, 20, 62, 240, 6, p.xp / p.xpToNext(), '#a040ff', '#200');
    ctx.fillStyle = '#fff'; ctx.font = '9px monospace';
    ctx.fillText(`XP ${p.xp}/${p.xpToNext()}`, 140, 68);

    // gold
    ctx.fillStyle = '#ffe040'; ctx.font = '13px monospace'; ctx.textAlign = 'left';
    ctx.fillText('金币: ' + p.gold, 20, 98);

    // target frame
    if (p.target && !p.target.dead) {
      const t = p.target;
      const tx = 700;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(tx, 10, 250, 50);
      ctx.strokeStyle = '#a07030'; ctx.strokeRect(tx, 10, 250, 50);
      ctx.fillStyle = t.template.boss ? '#ff6060' : '#f0e4c8';
      ctx.font = 'bold 13px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`[${t.level}] ${t.name}`, tx + 10, 28);
      drawBar(ctx, tx + 10, 34, 230, 10, t.hp / t.maxHp, t.template.boss ? '#ff2020' : '#d04040');
      ctx.fillStyle = '#fff'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(t.hp)}/${t.maxHp}`, tx + 125, 43);
    }

    // Skill hotbar
    const slot = 50, pad = 6;
    const total = 5 * slot + 4 * pad;
    const sx = (960 - total) / 2;
    const sy = 640 - 60;
    hotbarRects = [];
    for (let i = 0; i < 5; i++) {
      const cx = sx + i * (slot + pad), cy = sy;
      hotbarRects.push({ x: cx, y: cy, w: slot, h: slot, index: i });
      ctx.fillStyle = '#000'; ctx.fillRect(cx - 2, cy - 2, slot + 4, slot + 4);
      ctx.fillStyle = '#2a1a0a'; ctx.fillRect(cx, cy, slot, slot);
      ctx.strokeStyle = '#a07030'; ctx.strokeRect(cx, cy, slot, slot);
      const id = p.skills[i];
      if (id) {
        const sk = Skills.get(id);
        // color block icon
        const col = sk.cls === 'warrior' ? '#c04040' : sk.cls === 'mage' ? '#4060d0' : '#40a040';
        ctx.fillStyle = col; ctx.fillRect(cx + 6, cy + 6, slot - 12, slot - 12);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText(sk.name, cx + slot / 2, cy + slot / 2 + 3);
        // cooldown overlay
        const cd = p.cooldowns[id] || 0;
        if (cd > 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.65)';
          ctx.fillRect(cx, cy, slot, slot);
          ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace';
          ctx.fillText(cd.toFixed(1), cx + slot / 2, cy + slot / 2 + 5);
        }
      }
      // key label
      ctx.fillStyle = '#ffe040'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText((i + 1).toString(), cx + 3, cy + 11);
    }

    // zone name
    ctx.fillStyle = '#ffe040'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center';
    const zoneName = game.world.zone === 'elwynn' ? '艾尔文森林' : '西部荒野';
    ctx.fillText(zoneName, 480, 28);

    // active quest tracker (right side, below target frame)
    const active = Object.keys(p.questState).filter(k => p.questState[k].status === 'active');
    if (active.length > 0) {
      const tx = 700, ty = 110;
      const rows = active.slice(0, 3);
      const h = 18 + rows.length * 38;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(tx, ty, 250, h);
      ctx.strokeStyle = '#a07030'; ctx.strokeRect(tx, ty, 250, h);
      ctx.fillStyle = '#ffe040'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
      ctx.fillText('当前任务 (L 查看)', tx + 8, ty + 14);
      let yy = ty + 30;
      for (const qid of rows) {
        const q = Quests.DB[qid];
        if (!q) continue;
        const turnin = Quests.canTurnIn(q, p);
        ctx.fillStyle = turnin ? '#80ff80' : '#f0e4c8'; ctx.font = '12px monospace';
        ctx.fillText('• ' + q.title, tx + 8, yy);
        ctx.fillStyle = turnin ? '#80ff80' : '#a0c0ff'; ctx.font = '10px monospace';
        const prog = Quests.progressText(q, p).split('\n')[0] || '';
        ctx.fillText('  ' + (turnin ? '可交付' : prog), tx + 8, yy + 14);
        yy += 30;
      }
    }

    // toasts
    ctx.textAlign = 'center';
    for (let i = 0; i < toasts.length; i++) {
      const t = toasts[i];
      const alpha = Math.max(0, 1 - (t.t / 3));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#000';
      ctx.fillText(t.text, 481, 130 + i * 22);
      ctx.fillStyle = t.color;
      ctx.font = 'bold 16px monospace';
      ctx.fillText(t.text, 480, 129 + i * 22);
      ctx.globalAlpha = 1;
    }
  }

  return { draw, toast, update, getHotbarRects };
})();
