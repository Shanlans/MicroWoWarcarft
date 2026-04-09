// quests.js - quest definitions and tracker
const Quests = (() => {
  // status: undefined (not taken) | 'active' | 'done' (turned in)
  const DB = {
    q_boar_meat: {
      id: 'q_boar_meat',
      giver: 'questGiver',
      title: '野猪肉风波',
      desc: '镇长需要 5 块新鲜野猪肉给旅店。\n\n击杀艾尔文森林的野猪收集。',
      objectives: [{ type: 'item', item: 'boarMeat', count: 5, text: '新鲜野猪肉' }],
      reward: { xp: 80, gold: 20, items: ['bread'] },
    },
    q_kobold_gear: {
      id: 'q_kobold_gear',
      giver: 'questGiver',
      title: '狗头人的阴谋',
      desc: '清除骚扰矿区的狗头人,带回 4 个狗头人齿轮。',
      objectives: [{ type: 'item', item: 'koboldGear', count: 4, text: '狗头人齿轮' }],
      reward: { xp: 120, gold: 30, items: ['leatherCap'] },
    },
    q_bandit_letter: {
      id: 'q_bandit_letter',
      giver: 'questGiver',
      title: '被偷的信件',
      desc: '找回迪菲亚强盗偷走的密信。',
      objectives: [{ type: 'item', item: 'banditLetter', count: 1, text: '迪菲亚密信' }],
      reward: { xp: 160, gold: 45, items: ['rustSword'] },
    },
    q_bandit_leader: {
      id: 'q_bandit_leader',
      giver: 'guardMarshal',
      title: '强盗头目',
      desc: '击杀迪菲亚强盗头目。',
      objectives: [{ type: 'kill', target: 'banditLeader', count: 1, text: '击杀强盗头目' }],
      reward: { xp: 220, gold: 60, items: ['ironSword'] },
    },
    q_mech_parts: {
      id: 'q_mech_parts',
      giver: 'gryanStoutmantle',
      title: '收割机威胁',
      desc: '摧毁西部荒野的收割机器,收集 3 个齿轮。',
      objectives: [{ type: 'item', item: 'mechPart', count: 3, text: '收割机齿轮' }],
      reward: { xp: 300, gold: 90, items: ['silverRing'] },
    },
    q_vancleef: {
      id: 'q_vancleef',
      giver: 'gryanStoutmantle',
      title: '范克里夫的末日',
      desc: '击杀迪菲亚兄弟会的首领范克里夫。',
      objectives: [{ type: 'kill', target: 'vancleef', count: 1, text: '击杀范克里夫' }],
      reward: { xp: 800, gold: 300, items: ['luckyCharm'] },
    },
  };

  function available(npcId, player) {
    const res = [];
    const def = NPC.DB[npcId];
    if (!def.quests) return res;
    for (const qid of def.quests) {
      const q = DB[qid];
      const st = player.questState[qid];
      if (!st) res.push({ q, state: 'offer' });
      else if (st.status === 'active' && canTurnIn(q, player)) res.push({ q, state: 'turnin' });
      else if (st.status === 'active') res.push({ q, state: 'active' });
      else if (st.status === 'done') res.push({ q, state: 'done' });
    }
    return res;
  }

  function canTurnIn(q, player) {
    for (const o of q.objectives) {
      if (o.type === 'item') {
        if (player.countItem(o.item) < o.count) return false;
      } else if (o.type === 'kill') {
        if ((player.killLog[o.target] || 0) < o.count) return false;
      }
    }
    return true;
  }

  function accept(qid, player) {
    player.questState[qid] = { status: 'active' };
  }

  function turnIn(qid, player) {
    const q = DB[qid];
    if (!canTurnIn(q, player)) return false;
    for (const o of q.objectives) {
      if (o.type === 'item') player.removeItem(o.item, o.count);
    }
    player.questState[qid] = { status: 'done' };
    if (q.reward) {
      if (q.reward.xp) player.gainXp(q.reward.xp);
      if (q.reward.gold) player.gold += q.reward.gold;
      if (q.reward.items) q.reward.items.forEach(it => player.addItem(it, 1));
    }
    return true;
  }

  function markerFor(npc, player) {
    if (!player) return null;
    const offers = available(npc.id, player);
    if (offers.some(o => o.state === 'turnin')) return '?';
    if (offers.some(o => o.state === 'offer')) return '!';
    return null;
  }

  function progressText(q, player) {
    const parts = [];
    for (const o of q.objectives) {
      if (o.type === 'item') {
        parts.push(`${o.text}: ${Math.min(o.count, player.countItem(o.item))}/${o.count}`);
      } else if (o.type === 'kill') {
        parts.push(`${o.text}: ${Math.min(o.count, player.killLog[o.target] || 0)}/${o.count}`);
      }
    }
    return parts.join('\n');
  }

  // ---- Quest log panel ----
  let open = false;
  function toggleLog() { open = !open; }
  function isLogOpen() { return open; }
  function updateLog() {
    if (Input.isPressed('l')) open = !open;
    if (open && Input.isPressed('escape')) open = false;
  }
  function drawLog(ctx, game) {
    if (!open) return;
    const W = 960, H = 640;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    const pw = 520, ph = 420;
    const px = (W - pw) / 2, py = (H - ph) / 2;
    InventoryUI.drawPanel(ctx, px, py, pw, ph, '任务日志 L');
    ctx.font = '14px monospace'; ctx.textAlign = 'left';
    let y = py + 60;
    const active = Object.keys(game.player.questState)
      .filter(k => game.player.questState[k].status === 'active');
    const done = Object.keys(game.player.questState)
      .filter(k => game.player.questState[k].status === 'done');
    ctx.fillStyle = '#ffe040'; ctx.fillText('进行中:', px + 20, y); y += 22;
    if (active.length === 0) {
      ctx.fillStyle = '#6a5a3a'; ctx.fillText('  (空)', px + 20, y); y += 20;
    }
    for (const qid of active) {
      const q = DB[qid];
      ctx.fillStyle = '#fff'; ctx.fillText('• ' + q.title, px + 30, y); y += 18;
      const prog = progressText(q, game.player).split('\n');
      for (const p of prog) {
        ctx.fillStyle = '#c0c0c0'; ctx.fillText('    ' + p, px + 30, y); y += 16;
      }
    }
    y += 10;
    ctx.fillStyle = '#40ff40'; ctx.fillText('已完成:', px + 20, y); y += 22;
    for (const qid of done) {
      const q = DB[qid];
      ctx.fillStyle = '#8aff8a'; ctx.fillText('• ' + q.title, px + 30, y); y += 18;
    }
  }

  return { DB, available, canTurnIn, accept, turnIn, markerFor, progressText, updateLog, drawLog, toggleLog, isLogOpen };
})();
