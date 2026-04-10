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
    let bx = px + 20, by = py + 120;
    if (d.quests) {
      const offers = Quests.available(state.npc.id, game.player);
      // sort: turnin first, then offer, then active, then done
      const order = { turnin: 0, offer: 1, active: 2, done: 3 };
      offers.sort((a, b) => order[a.state] - order[b.state]);
      for (const off of offers) {
        if (off.state === 'done') continue;
        let color, prefix;
        if (off.state === 'turnin') { color = '#2a5a2a'; prefix = '[可交付] '; }
        else if (off.state === 'offer') { color = '#6a4a2a'; prefix = '[新任务] '; }
        else { color = '#2a3a5a'; prefix = '[进行中] '; }
        const label = prefix + off.q.title;
        btn(ctx, bx, by, 260, 34, label, () => {
          state.mode = 'quest_offer';
          state.qid = off.q.id;
          state.offerState = off.state;
        }, color);
        by += 40;
        if (by > py + ph - 80) { bx += 280; by = py + 120; }
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
    let stateLabel = '', stateColor = '#ffe040';
    if (state.offerState === 'offer')   { stateLabel = '[新任务]';  stateColor = '#ffe040'; }
    if (state.offerState === 'active')  { stateLabel = '[进行中]';  stateColor = '#80a0ff'; }
    if (state.offerState === 'turnin')  { stateLabel = '[可交付]';  stateColor = '#80ff80'; }
    ctx.fillStyle = stateColor; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'left';
    ctx.fillText(stateLabel + ' ' + q.title, px + 20, py + 70);
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
      btn(ctx, px + pw - 260, py + ph - 60, 110, 34, '接受任务', (g) => {
        Quests.accept(q.id, g.player);
        UI.toast(`已接受任务: ${q.title}  · 按 L 查看任务日志`, '#80a0ff');
        close();
      });
      btn(ctx, px + pw - 140, py + ph - 60, 110, 34, '返回', () => state.mode = 'main');
    } else if (state.offerState === 'turnin') {
      btn(ctx, px + pw - 260, py + ph - 60, 110, 34, '交付任务', (g) => {
        Quests.turnIn(q.id, g.player);
        UI.toast(`完成任务: ${q.title}  · +${q.reward.xp} XP +${q.reward.gold} 金`, '#80ff80');
        close();
      }, '#2a5a2a');
      btn(ctx, px + pw - 140, py + ph - 60, 110, 34, '返回', () => state.mode = 'main');
    } else {
      // active in-progress
      ctx.fillStyle = '#80a0ff'; ctx.font = '12px monospace';
      ctx.fillText('继续努力,完成目标后回来交付。', px + 20, py + ph - 70);
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
    ctx.fillStyle = '#ffe040'; ctx.textAlign = 'right';
    ctx.fillText('金币: ' + game.player.gold, px + pw - 20, py + 64);
    ctx.textAlign = 'left';
    const order = Skills.CLASS_ORDER[cls];
    let y = py + 90;
    if (game.player.cls !== cls) {
      ctx.fillStyle = '#ff6060'; ctx.font = '13px monospace';
      ctx.fillText('你的职业无法学习该训练师的技能。', px + 20, y);
    } else {
      for (const id of order) {
        const sk = Skills.get(id);
        const known = game.player.skills.includes(id);
        const levelOK = game.player.level >= sk.level;
        const cost = sk.level * 20;
        const canLearn = !known && levelOK;
        const statusColor = known ? '#40ff40' : canLearn ? '#ffe040' : '#8a8a8a';
        ctx.fillStyle = statusColor; ctx.font = '13px monospace';
        const statusTag = known ? '[已学会]' : !levelOK ? `[需 Lv.${sk.level}]` : '';
        ctx.fillText(`• ${sk.name}  ${statusTag}`, px + 20, y);
        ctx.fillStyle = '#c0c0c0'; ctx.font = '11px monospace';
        ctx.fillText(sk.desc, px + 20, y + 14);
        if (canLearn) {
          btn(ctx, px + 440, y - 10, 100, 24, `${cost} 金 学习`, (g) => {
            if (g.player.gold < cost) { UI.toast('金币不足', '#ff6060'); return; }
            if (g.player.skills.includes(id)) return;
            g.player.gold -= cost;
            g.player.skills.push(id);
            UI.toast(`已学会「${sk.name}」!技能已加入技能栏`, '#80ff80');
          });
        }
        y += 42;
      }
    }
    btn(ctx, px + pw - 140, py + ph - 40, 110, 30, '返回', () => state.mode = 'main');
  }

  return { open, close, isOpen, update, draw };
})();
