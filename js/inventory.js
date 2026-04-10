// inventory.js - inventory / character UI overlay
const InventoryUI = (() => {
  let open = false;
  let tab = 'inventory'; // 'inventory' | 'character'

  function toggle() { open = !open; }
  function isOpen() { return open; }
  function close() { open = false; }

  function update(game) {
    if (Input.isPressed('b')) { open = !open; tab = 'inventory'; }
    if (Input.isPressed('c')) { open = !open; tab = 'character'; }
    if (open && Input.isPressed('escape')) { open = false; }
    if (!open) return;
    // mouse clicks -> use / equip
    if (Input.mouse.clicked) {
      handleClick(game, Input.mouse.x, Input.mouse.y);
    }
  }

  function rectContains(r, x, y) {
    return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
  }

  let slotRects = [];
  let equipRects = {};
  let tabRects = [];

  function handleClick(game, mx, my) {
    const p = game.player;
    for (const tr of tabRects) {
      if (rectContains(tr, mx, my)) { tab = tr.tab; return; }
    }
    if (tab === 'inventory') {
      for (let i = 0; i < slotRects.length; i++) {
        if (rectContains(slotRects[i], mx, my)) {
          const slot = p.inventory[i];
          if (!slot) return;
          const it = Items.get(slot.id);
          if (it.type === 'consume') p.use(i);
          else if (it.type === 'armor' || it.type === 'weapon') p.equip(i);
          return;
        }
      }
    } else {
      for (const k of Object.keys(equipRects)) {
        if (rectContains(equipRects[k], mx, my)) { p.unequip(k); return; }
      }
    }
  }

  function draw(ctx, game) {
    if (!open) return;
    const W = 960, H = 640;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);

    const pw = 560, ph = 440;
    const px = (W - pw) / 2, py = (H - ph) / 2;
    drawPanel(ctx, px, py, pw, ph, '角色面板');
    // tabs
    tabRects = [
      { x: px + 20, y: py + 40, w: 90, h: 28, tab: 'inventory', label: '背包 B' },
      { x: px + 120, y: py + 40, w: 90, h: 28, tab: 'character', label: '角色 C' },
    ];
    for (const t of tabRects) {
      ctx.fillStyle = tab === t.tab ? '#6a4a2a' : '#2a1a0a';
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.strokeStyle = '#a07030'; ctx.strokeRect(t.x, t.y, t.w, t.h);
      ctx.fillStyle = '#f0e4c8'; ctx.textAlign = 'center'; ctx.font = '14px monospace';
      ctx.fillText(t.label, t.x + t.w / 2, t.y + 19);
    }

    if (tab === 'inventory') drawInventory(ctx, game, px, py, pw, ph);
    else drawCharacter(ctx, game, px, py, pw, ph);

    ctx.restore();
  }

  function drawInventory(ctx, game, px, py, pw, ph) {
    const p = game.player;
    const cols = 6, rows = 5;
    const slot = 56, pad = 8;
    const gx = px + 30, gy = py + 90;
    slotRects = [];
    for (let i = 0; i < cols * rows; i++) {
      const cx = gx + (i % cols) * (slot + pad);
      const cy = gy + Math.floor(i / cols) * (slot + pad);
      slotRects.push({ x: cx, y: cy, w: slot, h: slot });
      ctx.fillStyle = '#1a0a00';
      ctx.fillRect(cx, cy, slot, slot);
      ctx.strokeStyle = '#5a3a1a'; ctx.strokeRect(cx, cy, slot, slot);
      const it = p.inventory[i];
      if (it) {
        const def = Items.get(it.id);
        // draw item icon
        const icon = Assets.getItemIcon(it.id);
        if (icon) {
          const iw = icon.width, ih = icon.height;
          const scale = Math.min((slot - 8) / iw, (slot - 8) / ih);
          const dw = Math.round(iw * scale), dh = Math.round(ih * scale);
          ctx.drawImage(icon, cx + (slot - dw) / 2, cy + (slot - dh) / 2 - 4, dw, dh);
        } else {
          ctx.fillStyle = Items.color(def);
          ctx.fillRect(cx + 12, cy + 12, slot - 24, slot - 24);
        }
        // item name below icon
        ctx.fillStyle = Items.color(def); ctx.font = '9px monospace'; ctx.textAlign = 'center';
        ctx.fillText(def.name.slice(0, 5), cx + slot / 2, cy + slot - 5);
        // stack count
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'right';
        if (it.count > 1) ctx.fillText(it.count, cx + slot - 3, cy + 13);
      }
    }
    // gold
    ctx.fillStyle = '#ffe040'; ctx.textAlign = 'left'; ctx.font = '14px monospace';
    ctx.fillText('金币: ' + p.gold, px + 30, py + ph - 20);
    ctx.fillStyle = '#8a8a8a'; ctx.font = '11px monospace';
    ctx.fillText('点击物品使用/装备', px + pw - 180, py + ph - 20);
  }

  function drawCharacter(ctx, game, px, py, pw, ph) {
    const p = game.player;
    ctx.textAlign = 'left'; ctx.font = '14px monospace'; ctx.fillStyle = '#f0e4c8';
    const lx = px + 30, ly = py + 100;
    ctx.fillText('职业: ' + p.name, lx, ly);
    ctx.fillText('等级: ' + p.level, lx, ly + 22);
    ctx.fillText('经验: ' + p.xp + ' / ' + p.xpToNext(), lx, ly + 44);
    ctx.fillText('生命: ' + Math.floor(p.hp) + ' / ' + p.maxHp, lx, ly + 66);
    ctx.fillText('法力: ' + Math.floor(p.mp) + ' / ' + p.maxMp, lx, ly + 88);
    ctx.fillText('攻击: ' + p.atk, lx, ly + 110);
    ctx.fillText('护甲: ' + p.armor, lx, ly + 132);
    ctx.fillText('力量: ' + p.totalStats.str, lx, ly + 154);
    ctx.fillText('敏捷: ' + p.totalStats.agi, lx, ly + 176);
    ctx.fillText('智力: ' + p.totalStats.int, lx, ly + 198);
    ctx.fillText('耐力: ' + p.totalStats.sta, lx, ly + 220);

    // equipment slots on the right
    const slots = ['head', 'chest', 'legs', 'weapon', 'ring', 'trinket'];
    const labels = { head: '头部', chest: '胸部', legs: '腿部', weapon: '武器', ring: '戒指', trinket: '饰品' };
    const sx = px + 300, sy = py + 100;
    equipRects = {};
    for (let i = 0; i < slots.length; i++) {
      const k = slots[i];
      const cx = sx + (i % 2) * 130;
      const cy = sy + Math.floor(i / 2) * 70;
      equipRects[k] = { x: cx, y: cy, w: 110, h: 54 };
      ctx.fillStyle = '#1a0a00'; ctx.fillRect(cx, cy, 110, 54);
      ctx.strokeStyle = '#5a3a1a'; ctx.strokeRect(cx, cy, 110, 54);
      ctx.fillStyle = '#8a7a5a'; ctx.font = '11px monospace'; ctx.textAlign = 'left';
      ctx.fillText(labels[k], cx + 6, cy + 14);
      const it = p.equipment[k];
      if (it) {
        const icon = Assets.getItemIcon(it.id);
        if (icon) ctx.drawImage(icon, cx + 6, cy + 18, 22, 22);
        ctx.fillStyle = Items.color(it);
        ctx.font = '11px monospace'; ctx.textAlign = 'left';
        ctx.fillText(it.name, cx + 32, cy + 34);
      } else {
        ctx.fillStyle = '#4a3a2a'; ctx.font = '11px monospace';
        ctx.fillText('(空)', cx + 6, cy + 32);
      }
    }
    ctx.fillStyle = '#8a8a8a'; ctx.font = '11px monospace'; ctx.textAlign = 'left';
    ctx.fillText('点击装备槽卸下', sx, sy + 250);
  }

  function drawPanel(ctx, x, y, w, h, title) {
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#a07030'; ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#ffe040'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'left';
    ctx.fillText(title, x + 20, y + 26);
    ctx.lineWidth = 1;
  }

  return { update, draw, toggle, isOpen, close, drawPanel };
})();
