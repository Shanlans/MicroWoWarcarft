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
      const th = t.dots.length > 0 ? 72 : 50;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(tx, 10, 250, th);
      ctx.strokeStyle = '#a07030'; ctx.strokeRect(tx, 10, 250, th);
      ctx.fillStyle = t.template.boss ? '#ff6060' : '#f0e4c8';
      ctx.font = 'bold 13px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`[${t.level}] ${t.name}`, tx + 10, 28);
      drawBar(ctx, tx + 10, 34, 230, 10, t.hp / t.maxHp, t.template.boss ? '#ff2020' : '#d04040');
      ctx.fillStyle = '#fff'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(t.hp)}/${t.maxHp}`, tx + 125, 43);
      // debuffs row
      if (t.dots.length > 0) {
        ctx.textAlign = 'left';
        let dx = tx + 10, dy = 52;
        for (const d of t.dots) {
          const col = d.name === '流血' ? '#d02020' : d.name === '剧毒' ? '#30b030' : '#6080ff';
          ctx.fillStyle = '#000'; ctx.fillRect(dx - 1, dy - 1, 62, 16);
          ctx.fillStyle = col;   ctx.fillRect(dx, dy, 14, 14);
          ctx.fillStyle = '#fff'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
          ctx.fillText(Math.ceil(d.duration - d.t), dx + 7, dy + 11);
          ctx.fillStyle = '#f0e4c8'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
          ctx.fillText(d.name, dx + 18, dy + 11);
          dx += 68;
        }
      }
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

    // ---- Mobile touch controls ----
    if (Input.isMobile) drawMobileControls(ctx, game);
  }

  function drawMobileControls(ctx, game) {
    const p = game.player;
    const js = Input.joystick;

    // Virtual joystick (left side)
    const jx = 110, jy = 520, jr = 56;
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(jx, jy, jr, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.5;
    if (js.active) {
      ctx.fillStyle = '#ffe040';
      ctx.beginPath();
      ctx.arc(jx + js.dx * 36, jy + js.dy * 36, 20, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#c0c0c0';
      ctx.beginPath(); ctx.arc(jx, jy, 16, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // Skill buttons (right side) + Tab + B/L
    Input.touchBtns.length = 0;
    const btnR = 30;
    const skills = p.skills || [];
    // skill 1-3 in a row
    for (let i = 0; i < Math.min(3, skills.length); i++) {
      const bx = 760 + i * 70, by = 530;
      const sk = Skills.get(skills[i]);
      const cd = p.cooldowns[skills[i]] || 0;
      const col = cd > 0 ? '#4a3a2a' : (sk.cls === 'warrior' ? '#c04040' : sk.cls === 'mage' ? '#4060d0' : '#40a040');
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(bx, by, btnR + 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(bx, by, btnR, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
      if (cd > 0) {
        ctx.fillText(cd.toFixed(1), bx, by + 4);
      } else {
        ctx.fillText(sk.name.slice(0, 2), bx, by + 4);
      }
      ctx.restore();
      Input.touchBtns.push({ x: bx, y: by, r: btnR, key: (i + 1).toString() });
    }
    // skill 4-5 above row
    for (let i = 3; i < Math.min(5, skills.length); i++) {
      const bx = 795 + (i - 3) * 70, by = 460;
      const sk = Skills.get(skills[i]);
      const cd = p.cooldowns[skills[i]] || 0;
      const col = cd > 0 ? '#4a3a2a' : '#6a5a2a';
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(bx, by, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(cd > 0 ? cd.toFixed(1) : sk.name.slice(0, 2), bx, by + 3);
      ctx.restore();
      Input.touchBtns.push({ x: bx, y: by, r: 24, key: (i + 1).toString() });
    }

    // Tab (target nearest) button
    const tabX = 680, tabY = 530;
    ctx.save(); ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(tabX, tabY, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a6a8a';
    ctx.beginPath(); ctx.arc(tabX, tabY, 22, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText('选敌', tabX, tabY + 4);
    ctx.restore();
    Input.touchBtns.push({ x: tabX, y: tabY, r: 24, key: 'tab' });

    // B (bag) button
    const bagX = 30, bagY = 460;
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(bagX, bagY, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6a5a2a';
    ctx.beginPath(); ctx.arc(bagX, bagY, 18, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText('背包', bagX, bagY + 4);
    ctx.restore();
    Input.touchBtns.push({ x: bagX, y: bagY, r: 20, key: 'b' });

    // L (quest log) button
    const logX = 80, logY = 460;
    ctx.save(); ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(logX, logY, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a4a6a';
    ctx.beginPath(); ctx.arc(logX, logY, 18, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText('任务', logX, logY + 4);
    ctx.restore();
    Input.touchBtns.push({ x: logX, y: logY, r: 20, key: 'l' });
  }

  return { draw, toast, update, getHotbarRects };
})();
