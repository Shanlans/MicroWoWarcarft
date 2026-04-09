// dialog.js - dialog / shop / trainer UI
const Dialog = (() => {
  let state = null; // { npc, mode, page }
  // mode: 'main' | 'quest_offer' | 'quest_progress' | 'shop' | 'trainer' | 'reward'

  function open(npc, game) {
    state = { npc, mode: 'main', selection: 0 };
  }
  function close() { state = null; }
  function isOpen() { return state !== null; }

  let buttons = [];

  function update(game) {
    if (!state) return;
    if (Input.isPressed('escape')) { close(); return; }
    if (Input.mouse.clicked) {
      for (const b of buttons) {
        if (Input.mouse.x >= b.x && Input.mouse.x < b.x + b.w &&
            Input.mouse.y >= b.y && Input.mouse.y < b.y + b.h) {
          b.action(game);
          return;
        }
      }
    }
  }

  function draw(ctx, game) {
    if (!state) return;
    const { npc } = state;
    const W = 960, H = 640;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H);
    const pw = 640, ph = 360;
    const px = (W - pw) / 2, py = H - ph - 20;
    InventoryUI.drawPanel(ctx, px, py, pw, ph, npc.def.name);
    buttons = [];

    if (state.mode === 'main') drawMain(ctx, game, px, py, pw, ph);
    else if (state.mode === 'shop') drawShop(ctx, game, px, py, pw, ph);
    else if (state.mode === 'trainer') drawTrainer(ctx, game, px, py, pw, ph);
    else if (state.mode === 'quest_offer') drawQuest(ctx, game, px, py, pw, ph);

    // close hint
    ctx.fillStyle = '#8a7a5a'; ctx.font = '11px monospace'; ctx.textAlign = 'right';
    ctx.fillText('Esc 关闭', px + pw - 14, py + ph - 10);
  }

  function btn(ctx, x, y, w, h, label, action, color = '#6a4a2a') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#a07030'; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#f0e4c8'; ctx.font = '13px monospace'; ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h / 2 + 5);
    buttons.push({ x, y, w, h, action });
  }

  function drawMain(ctx, game, px, py, pw, ph) {
    const d = state.npc.def;
    // dialog text
    ctx.fillStyle = '#f0e4c8'; ctx.font = '14px monospace'; ctx.textAlign = 'left';
    let y = py + 70;
    for (const line of d.dialog || []) {
      ctx.fillText(line, px + 20, y); y += 22;
    }
    // options
    let bx = px + 20, by = py + ph - 80;
    if (d.quests) {
      const offers = Quests.available(state.npc.id, game.player);
      for (const off of offers) {
        if (off.state === 'done') continue;
        const color = off.state === 'turnin' ? '#4a6a2a' : '#6a4a2a';
        const label = (off.state === 'turnin' ? '[完成] ' : '[任务] ') + off.q.title;
        btn(ctx, bx, by, 260, 34, label, () => {
          state.mode = 'quest_offer';
          state.qid = off.q.id;
          state.offerState = off.state;
        }, color);
        by += 40;
        if (by > py + ph - 40) { bx += 280; by = py + ph - 80; }
      }
    }
    if (d.shop) {
      btn(ctx, px + pw - 160, py + ph - 80, 140, 34, '查看商店', () => state.mode = 'shop');
    }
    if (d.trainer) {
      btn(ctx, px + pw - 160, py + ph - 40, 140, 34, '学习技能', () => state.mode = 'trainer');
    }
  }

  function drawQuest(ctx, game, px, py, pw, ph) {
    const q = Quests.DB[state.qid];
    ctx.fillStyle = '#ffe040'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'left';
    ctx.fillText(q.title, px + 20, py + 70);
    ctx.fillStyle = '#f0e4c8'; ctx.font = '13px monospace';
    let y = py + 94;
    for (const line of q.desc.split('\n')) {
      ctx.fillText(line, px + 20, y); y += 18;
    }
    y += 10;
    ctx.fillStyle = '#c0c0c0';
    ctx.fillText('目标:', px + 20, y); y += 18;
    for (const line of Quests.progressText(q, game.player).split('\n')) {
      ctx.fillText('  ' + line, px + 20, y); y += 18;
    }
    y += 8;
    ctx.fillStyle = '#ffe040';
    ctx.fillText(`奖励: ${q.reward.xp} 经验, ${q.reward.gold} 金`, px + 20, y);
    if (q.reward.items) {
      y += 18;
      for (const id of q.reward.items) {
        const it = Items.get(id);
        ctx.fillStyle = Items.color(it);
        ctx.fillText('  ' + it.name, px + 20, y); y += 16;
      }
    }

    if (state.offerState === 'offer') {
      btn(ctx, px + pw - 260, py + ph - 60, 110, 34, '接受', (g) => {
        Quests.accept(q.id, g.player);
        close();
      });
      btn(ctx, px + pw - 140, py + ph - 60, 110, 34, '返回', () => state.mode = 'main');
    } else if (state.offerState === 'turnin') {
      btn(ctx, px + pw - 260, py + ph - 60, 110, 34, '交付', (g) => {
        Quests.turnIn(q.id, g.player);
        close();
      }, '#4a6a2a');
      btn(ctx, px + pw - 140, py + ph - 60, 110, 34, '返回', () => state.mode = 'main');
    } else {
      btn(ctx, px + pw - 140, py + ph - 60, 110, 34, '返回', () => state.mode = 'main');
    }
  }

  function drawShop(ctx, game, px, py, pw, ph) {
    const shop = state.npc.def.shop;
    ctx.fillStyle = '#ffe040'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
    ctx.fillText('商店', px + 20, py + 64);
    ctx.fillStyle = '#ffe040';
    ctx.textAlign = 'right';
    ctx.fillText('金币: ' + game.player.gold, px + pw - 20, py + 64);

    ctx.textAlign = 'left';
    let y = py + 86;
    for (const id of shop) {
      const it = Items.get(id);
      ctx.fillStyle = Items.color(it); ctx.font = '13px monospace';
      ctx.fillText('• ' + it.name, px + 20, y);
      ctx.fillStyle = '#c0c0c0'; ctx.font = '11px monospace';
      ctx.fillText(it.desc, px + 170, y);
      ctx.fillStyle = '#ffe040'; ctx.font = '12px monospace'; ctx.textAlign = 'right';
      ctx.fillText(it.price + 'g', px + 440, y);
      ctx.textAlign = 'left';
      btn(ctx, px + 460, y - 14, 50, 22, '购买', (g) => {
        if (g.player.gold >= it.price) {
          g.player.gold -= it.price;
          g.player.addItem(it.id, 1);
        }
      });
      y += 28;
      if (y > py + ph - 80) break;
    }
    btn(ctx, px + pw - 140, py + ph - 40, 110, 30, '返回', () => state.mode = 'main');
  }

  function drawTrainer(ctx, game, px, py, pw, ph) {
    const cls = state.npc.def.trainer;
    ctx.fillStyle = '#ffe040'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
    ctx.fillText('技能训练', px + 20, py + 64);
    const order = Skills.CLASS_ORDER[cls];
    let y = py + 90;
    if (game.player.cls !== cls) {
      ctx.fillStyle = '#ff6060'; ctx.font = '13px monospace';
      ctx.fillText('你的职业无法学习该训练师的技能。', px + 20, y);
    } else {
      for (const id of order) {
        const sk = Skills.get(id);
        const known = game.player.skills.includes(id);
        const canLearn = !known && game.player.level >= sk.level;
        ctx.fillStyle = known ? '#40ff40' : canLearn ? '#ffe040' : '#8a8a8a';
        ctx.font = '13px monospace';
        ctx.fillText(`• ${sk.name}  (需求等级 ${sk.level})`, px + 20, y);
        ctx.fillStyle = '#c0c0c0'; ctx.font = '11px monospace';
        ctx.fillText(sk.desc, px + 20, y + 14);
        if (canLearn) {
          btn(ctx, px + 460, y - 10, 70, 24, '学习', (g) => {
            if (!g.player.skills.includes(id)) g.player.skills.push(id);
          });
        }
        y += 40;
      }
    }
    btn(ctx, px + pw - 140, py + ph - 40, 110, 30, '返回', () => state.mode = 'main');
  }

  return { open, close, isOpen, update, draw };
})();
