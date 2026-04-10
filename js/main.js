// main.js - entry point, state machine, main loop
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  Input.attachMouse(canvas);
  Assets.build();
  canvas.focus();

  const STATE = { MENU: 'menu', CHAR_SELECT: 'char', PLAYING: 'playing', GHOST: 'ghost', WIN: 'win' };

  const game = {
    state: STATE.MENU,
    player: null,
    world: null,
    menuButtons: [],
    charButtons: [],
    spiritHealer: null,
    loadZone(zone, spawn = null) {
      this.world = new World(zone);
      window.game = this;
      if (zone === 'elwynn') buildElwynn(this.world, this.player);
      else if (zone === 'westfall') buildWestfall(this.world, this.player);
      else if (zone === 'deadmines') buildDeadmines(this.world, this.player);
      if (spawn) { this.player.x = spawn.x; this.player.y = spawn.y; }
      Effects.clear();
      Combat.floaters.length = 0;
      this.spiritHealer = null;
    },
  };
  window.game = game;

  // --- Menu rendering ---
  function drawMenu() {
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 960, 640);
    // pixel sky stars
    for (let i = 0; i < 80; i++) {
      const x = (i * 53 + 17) % 960;
      const y = (i * 91 + 11) % 300;
      ctx.fillStyle = i % 5 === 0 ? '#ffe040' : '#aaaaff';
      ctx.fillRect(x, y, 2, 2);
    }
    // title
    ctx.fillStyle = '#ffe040'; ctx.textAlign = 'center';
    ctx.font = 'bold 56px monospace';
    ctx.fillText('MICRO WoW', 480, 180);
    ctx.fillStyle = '#c08040'; ctx.font = 'bold 20px monospace';
    ctx.fillText('像素魔兽世界', 480, 218);
    ctx.fillStyle = '#8a7a5a'; ctx.font = '12px monospace';
    ctx.fillText('Pixel World of Warcraft · Single Player', 480, 240);

    // buttons
    game.menuButtons = [];
    const btnW = 260, btnH = 50;
    const bx = 480 - btnW / 2;
    let by = 320;
    const add = (label, action, enabled = true) => {
      ctx.fillStyle = enabled ? '#3a1a0a' : '#1a0a00';
      ctx.fillRect(bx, by, btnW, btnH);
      ctx.strokeStyle = enabled ? '#a07030' : '#4a2a10'; ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, btnW, btnH);
      ctx.fillStyle = enabled ? '#f0e4c8' : '#6a5a3a'; ctx.font = 'bold 18px monospace';
      ctx.fillText(label, 480, by + 32);
      if (enabled) game.menuButtons.push({ x: bx, y: by, w: btnW, h: btnH, action });
      by += 68;
    };
    add('新游戏', () => { game.state = STATE.CHAR_SELECT; });
    add('继续游戏', () => {
      const data = Save.load();
      if (data) { Save.apply(data, game); game.state = STATE.PLAYING; }
    }, Save.has());
    add('删除存档', () => { Save.erase(); }, Save.has());

    ctx.fillStyle = '#6a5a3a'; ctx.font = '11px monospace';
    ctx.fillText('点击按钮开始冒险 · ESC 随时保存', 480, 620);
    ctx.lineWidth = 1;
  }

  function drawCharSelect() {
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 960, 640);
    ctx.fillStyle = '#ffe040'; ctx.textAlign = 'center';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('选择你的职业', 480, 80);

    game.charButtons = [];
    const classes = [
      { id: 'warrior', name: '战士', color: '#d04040',
        desc: ['高血量,近战爆发', '起始技能: 撕裂', '主属性: 力量'] },
      { id: 'mage', name: '法师', color: '#4060d0',
        desc: ['远程魔法伤害', '起始技能: 火球术', '主属性: 智力'] },
      { id: 'hunter', name: '猎人', color: '#40a040',
        desc: ['稳定远程输出', '起始技能: 瞄准射击', '主属性: 敏捷'] },
    ];
    const cardW = 240, cardH = 340, gap = 30;
    const total = 3 * cardW + 2 * gap;
    let cx = (960 - total) / 2;
    const cy = 140;
    for (const c of classes) {
      ctx.fillStyle = '#1a0a00'; ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = c.color; ctx.lineWidth = 3; ctx.strokeRect(cx, cy, cardW, cardH);
      // sprite preview
      const frames = Assets.get(c.id);
      const img = frames.down[0];
      ctx.drawImage(img, cx + cardW / 2 - img.width / 2, cy + 30, img.width * 1.6, img.height * 1.6);
      ctx.fillStyle = c.color; ctx.font = 'bold 24px monospace'; ctx.textAlign = 'center';
      ctx.fillText(c.name, cx + cardW / 2, cy + 140);
      ctx.fillStyle = '#c0c0c0'; ctx.font = '13px monospace';
      for (let i = 0; i < c.desc.length; i++) {
        ctx.fillText(c.desc[i], cx + cardW / 2, cy + 180 + i * 22);
      }
      // select button
      ctx.fillStyle = '#3a1a0a'; ctx.fillRect(cx + 30, cy + cardH - 60, cardW - 60, 38);
      ctx.strokeStyle = '#a07030'; ctx.lineWidth = 2;
      ctx.strokeRect(cx + 30, cy + cardH - 60, cardW - 60, 38);
      ctx.fillStyle = '#ffe040'; ctx.font = 'bold 16px monospace';
      ctx.fillText('选择', cx + cardW / 2, cy + cardH - 35);
      game.charButtons.push({ x: cx + 30, y: cy + cardH - 60, w: cardW - 60, h: 38, cls: c.id });
      cx += cardW + gap;
    }
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8a7a5a'; ctx.font = '12px monospace';
    ctx.fillText('Esc 返回主菜单', 480, 620);
  }

  function startGame(cls) {
    game.player = new Player(cls);
    game.loadZone('elwynn');
    game.state = STATE.PLAYING;
    UI.toast('欢迎来到艾尔文森林!');
  }

  function handleMenuClick(x, y) {
    for (const b of game.menuButtons) {
      if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
        b.action(); return;
      }
    }
  }
  function handleCharClick(x, y) {
    for (const b of game.charButtons) {
      if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
        startGame(b.cls); return;
      }
    }
  }

  // --- Target selection ---
  function pickTarget(x, y) {
    const wx = x + Camera.x, wy = y + Camera.y;
    let best = null, bestD = 9999;
    // on mobile, expand hitbox by 16px for easier tapping
    const pad = Input.isMobile ? 16 : 0;
    for (const e of game.world.enemies) {
      if (e.dead) continue;
      if (wx >= e.x - pad && wx < e.x + e.w + pad && wy >= e.y - pad && wy < e.y + e.h + pad) {
        const d = (wx - (e.x + e.w/2))**2 + (wy - (e.y + e.h/2))**2;
        if (d < bestD) { bestD = d; best = e; }
      }
    }
    return best;
  }
  function pickNPC(x, y) {
    const wx = x + Camera.x, wy = y + Camera.y;
    const pad = Input.isMobile ? 20 : 6;
    for (const n of game.world.npcs) {
      if (wx >= n.x - pad && wx < n.x + n.w + pad && wy >= n.y - pad && wy < n.y + n.h + pad) return n;
    }
    return null;
  }
  function tabNearest() {
    let best = null, bestD = 9999;
    const pc = game.player.center();
    for (const e of game.world.enemies) {
      if (e.dead) continue;
      const c = e.center();
      const d = Math.hypot(c.x - pc.x, c.y - pc.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    if (best !== game.player.target) game.player.autoAttacking = false;
    game.player.target = best;
  }

  // --- Playing update ---
  function updatePlaying(dt) {
    // UI overlays first
    InventoryUI.update(game);
    Quests.updateLog();
    Dialog.update(game);

    if (InventoryUI.isOpen() || Quests.isLogOpen() || Dialog.isOpen()) {
      game.player.animate(dt);
      Combat.update(dt);
      Effects.update(dt);
      UI.update(dt);
      // consume touch flags so they don't pile up
      Input.consumeTab(); Input.consumeSkill();
      return;
    }

    // Esc: save and return to menu
    if (Input.isPressed('escape')) {
      Save.save(game);
      game.state = STATE.MENU;
      return;
    }

    // Tab / T key / mobile "选敌" button
    if (Input.isPressed('tab') || Input.isPressed('t') || Input.consumeTab()) {
      tabNearest();
    }

    // Mobile skill buttons
    const si = Input.consumeSkill();
    if (si >= 0) game.player.useSkill(si, game.world);

    // Mouse: hotbar slot -> use skill; enemy -> target; NPC nearby -> dialog
    if (Input.mouse.clicked) {
      let consumed = false;
      // hotbar first (it's UI, on top of world)
      for (const r of UI.getHotbarRects()) {
        if (Input.mouse.x >= r.x && Input.mouse.x < r.x + r.w &&
            Input.mouse.y >= r.y && Input.mouse.y < r.y + r.h) {
          game.player.useSkill(r.index, game.world);
          consumed = true;
          break;
        }
      }
      if (!consumed) {
        const npc = pickNPC(Input.mouse.x, Input.mouse.y);
        if (npc) {
          const dx = (npc.x + npc.w/2) - (game.player.x + game.player.w/2);
          const dy = (npc.y + npc.h/2) - (game.player.y + game.player.h/2);
          if (Math.hypot(dx, dy) < 80) Dialog.open(npc, game);
          else UI.toast('距离太远', '#ffe040');
        } else {
          const e = pickTarget(Input.mouse.x, Input.mouse.y);
          if (e) {
            if (e !== game.player.target) game.player.autoAttacking = false;
            game.player.target = e;
          }
        }
      }
    }

    // Skills 1-5
    for (let i = 0; i < 5; i++) {
      if (Input.isPressed((i + 1).toString())) {
        game.player.useSkill(i, game.world);
      }
    }

    // Update world
    game.player.update(dt, game.world);
    for (const e of game.world.enemies) e.update(dt, game.world, game.player);
    game.world.updateProjectiles(dt, game.player);
    Combat.update(dt);
    Effects.update(dt);
    UI.update(dt);

    // Cleanup dead enemies (keep corpses briefly via dead flag)
    // Camera
    Camera.follow(game.player, game.world.map);

    // Transitions
    for (const t of game.world.transitions) {
      if (game.player.x + game.player.w > t.x && game.player.x < t.x + t.w &&
          game.player.y + game.player.h > t.y && game.player.y < t.y + t.h) {
        game.loadZone(t.to);
        const names = { westfall: '进入西部荒野!', elwynn: '回到艾尔文森林', deadmines: '进入副本: 死亡矿井!' };
        UI.toast(names[t.to] || t.to, t.to === 'deadmines' ? '#ff40ff' : '#ffe040');
        break;
      }
    }

    // player death -> enter ghost mode
    if (game.player.dead && !game.player.ghost) {
      game.player.ghost = true;
      game.player.deathX = game.player.x;
      game.player.deathY = game.player.y;
      game.player.target = null;
      game.player.dots = [];
      // spawn Spirit Healer near the player
      const shx = Math.max(TILE * 2, game.player.x - 200);
      const shy = Math.max(TILE * 2, game.player.y - 60);
      game.spiritHealer = NPC.createSpiritHealer(shx, shy);
      game.world.projectiles.length = 0;
      Effects.clear();
      UI.toast('你的灵魂离开了身体…… 寻找灵魂医者复活。', '#80d0ff');
    }

    // Win: vancleef killed in the Deadmines dungeon
    if (game.world.zone === 'deadmines') {
      const vc = game.world.enemies.find(e => e.id === 'vancleef');
      if (vc && vc.dead && !game.world.bossDefeated) {
        game.world.bossDefeated = true;
        game.state = STATE.WIN;
      }
    }
  }

  function drawPlaying() {
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 960, 640);
    game.world.draw(ctx, Camera);
    // draw entities sorted by y
    const ents = [];
    for (const n of game.world.npcs) ents.push(n);
    for (const e of game.world.enemies) if (!e.dead) ents.push(e);
    ents.push(game.player);
    ents.sort((a, b) => (a.y + a.h) - (b.y + b.h));
    for (const e of ents) e.draw(ctx, Camera);
    game.world.drawProjectiles(ctx, Camera);
    Effects.draw(ctx, Camera);
    Combat.draw(ctx, Camera);
    UI.draw(ctx, game);
    InventoryUI.draw(ctx, game);
    Quests.drawLog(ctx, game);
    Dialog.draw(ctx, game);
  }

  // ---- Ghost mode: grayscale world, Spirit Healer to revive ----
  function updateGhost(dt) {
    const p = game.player;
    // allow movement in ghost form
    let dx = 0, dy = 0;
    if (Input.isDown('w')) dy -= 1;
    if (Input.isDown('s')) dy += 1;
    if (Input.isDown('a')) dx -= 1;
    if (Input.isDown('d')) dx += 1;
    p.moving = (dx !== 0 || dy !== 0);
    if (p.moving) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      const sp = 200 * dt; // slightly faster in ghost form
      const nx = p.x + dx * sp, ny = p.y + dy * sp;
      if (!game.world.collidesBox(nx, p.y, p.w, p.h)) p.x = nx;
      if (!game.world.collidesBox(p.x, ny, p.w, p.h)) p.y = ny;
      if (Math.abs(dx) > Math.abs(dy)) p.dir = dx > 0 ? 'right' : 'left';
      else p.dir = dy > 0 ? 'down' : 'up';
    }
    p.animate(dt);
    Camera.follow(p, game.world.map);
    UI.update(dt);
    // check proximity to Spirit Healer
    if (game.spiritHealer) {
      const sh = game.spiritHealer;
      const d = Math.hypot((p.x + p.w/2) - (sh.x + sh.w/2), (p.y + p.h/2) - (sh.y + sh.h/2));
      if (d < 70 && Input.mouse.clicked) {
        // revive!
        const cost = Math.min(50, Math.floor(p.gold * 0.1));
        p.gold = Math.max(0, p.gold - cost);
        p.dead = false;
        p.ghost = false;
        p.hp = p.maxHp; p.mp = p.maxMp;
        p.target = null;
        p.cooldowns = {};
        p.gcd = 0;
        game.spiritHealer = null;
        if (cost > 0) UI.toast(`复活! 修理费 -${cost} 金`, '#80ff80');
        else UI.toast('复活!', '#80ff80');
        return;
      }
    }
  }
  function drawGhost() {
    // draw the world in grayscale
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 960, 640);
    game.world.draw(ctx, Camera);
    // player's corpse (semi-transparent at death location)
    const cdx = Math.round(game.player.deathX - Camera.x);
    const cdy = Math.round(game.player.deathY - Camera.y);
    ctx.save(); ctx.globalAlpha = 0.3;
    const f = Assets.get(game.player.cls);
    ctx.drawImage(f.down[0], cdx, cdy);
    ctx.restore();
    // Spirit Healer
    if (game.spiritHealer) game.spiritHealer.draw(ctx, Camera);
    // player ghost
    game.player.draw(ctx, Camera);
    // apply grayscale + blue tint overlay to entire canvas
    ctx.save();
    ctx.filter = 'grayscale(85%) brightness(0.7)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#3050a0';
    ctx.fillRect(0, 0, 960, 640);
    ctx.restore();
    // HUD overlay
    ctx.fillStyle = 'rgba(0,0,30,0.5)';
    ctx.fillRect(0, 0, 960, 40);
    ctx.fillStyle = '#80d0ff'; ctx.textAlign = 'center'; ctx.font = 'bold 18px monospace';
    ctx.fillText('灵魂状态  ·  找到灵魂医者点击复活', 480, 27);
    // show arrow pointing to Spirit Healer if offscreen
    if (game.spiritHealer) {
      const sh = game.spiritHealer;
      const sdx = (sh.x + sh.w/2) - Camera.x;
      const sdy = (sh.y + sh.h/2) - Camera.y;
      const d = Math.hypot((game.player.x + game.player.w/2) - (sh.x + sh.w/2),
                           (game.player.y + game.player.h/2) - (sh.y + sh.h/2));
      ctx.fillStyle = '#80d0ff'; ctx.font = '14px monospace';
      ctx.fillText(`灵魂医者距离: ${Math.round(d / TILE)} 格`, 480, 630);
    }
  }

  function drawWin() {
    drawPlaying();
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, 960, 640);
    ctx.fillStyle = '#ffe040'; ctx.textAlign = 'center'; ctx.font = 'bold 56px monospace';
    ctx.fillText('胜利!', 480, 240);
    ctx.fillStyle = '#f0e4c8'; ctx.font = '20px monospace';
    ctx.fillText('死亡矿井副本通关!你击败了范克里夫!', 480, 290);
    ctx.fillText('艾尔文森林又回到了安宁。你已通关主线。', 480, 320);
    ctx.fillStyle = '#c0c0c0'; ctx.font = '15px monospace';
    ctx.fillText(`最终等级: ${game.player.level}   金币: ${game.player.gold}`, 480, 370);
    ctx.fillStyle = '#8a7a5a'; ctx.font = '14px monospace';
    ctx.fillText('按空格键继续自由探索 · Esc 返回菜单', 480, 430);
    if (Input.isPressed(' ')) { game.state = STATE.PLAYING; }
    if (Input.isPressed('escape')) { Save.save(game); game.state = STATE.MENU; }
  }

  // --- Main loop ---
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (game.state === STATE.MENU) {
      if (Input.mouse.clicked) handleMenuClick(Input.mouse.x, Input.mouse.y);
      drawMenu();
    } else if (game.state === STATE.CHAR_SELECT) {
      if (Input.isPressed('escape')) game.state = STATE.MENU;
      if (Input.mouse.clicked) handleCharClick(Input.mouse.x, Input.mouse.y);
      drawCharSelect();
    } else if (game.state === STATE.PLAYING) {
      updatePlaying(dt);
      if (game.player.ghost) {
        game.state = STATE.GHOST;
      } else {
        drawPlaying();
      }
    } else if (game.state === STATE.GHOST) {
      updateGhost(dt);
      if (!game.player.ghost) {
        game.state = STATE.PLAYING;
        drawPlaying();
      } else {
        drawGhost();
      }
    } else if (game.state === STATE.WIN) {
      drawWin();
    }

    Input.endFrame();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
