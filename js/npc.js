// npc.js - NPC definitions
const NPC = (() => {
  const DB = {
    innkeeper: {
      name: '旅店老板 法瑞丽',
      color: '#80c0ff',
      dialog: [
        '欢迎来到闪金镇!',
        '如果你死了,会在这里复活。',
      ],
    },
    questGiver: {
      name: '镇长 索尔玛',
      color: '#ffe040',
      quests: ['q_boar_meat', 'q_kobold_gear', 'q_bandit_letter'],
      dialog: [
        '勇士,我们的村庄急需你的帮助!',
      ],
    },
    merchant: {
      name: '商人 安德鲁',
      color: '#80ff80',
      shop: ['bread', 'water', 'potion', 'rustSword', 'leatherCap', 'leatherVest', 'leatherLegs', 'copperRing'],
      dialog: ['看看我的商品吧?'],
    },
    trainerWarrior: {
      name: '战士训练师 帕克',
      color: '#ff8080',
      trainer: 'warrior',
      dialog: ['力量来自于战斗。'],
    },
    trainerMage: {
      name: '法师训练师 玛丽亚',
      color: '#aa80ff',
      trainer: 'mage',
      dialog: ['奥术的奥秘等待你去掌握。'],
    },
    trainerHunter: {
      name: '猎人训练师 艾伦',
      color: '#80ffaa',
      trainer: 'hunter',
      dialog: ['保持你弓弦的张力。'],
    },
    guardMarshal: {
      name: '元帅 达格兰',
      color: '#ffcc00',
      quests: ['q_bandit_leader'],
      dialog: ['迪菲亚兄弟会正在威胁我们的土地!'],
    },
    gryanStoutmantle: {
      name: '人民军长官 格里安',
      color: '#ffe040',
      quests: ['q_mech_parts', 'q_vancleef'],
      dialog: ['你必须帮助我们对抗迪菲亚兄弟会!'],
    },
    merchantWest: {
      name: '西部商人 萨尔玛',
      color: '#80ff80',
      shop: ['bread', 'water', 'potion', 'ironSword', 'oakStaff', 'shortBow', 'ironHelm', 'chainMail', 'ironLegs', 'silverRing', 'luckyCharm', 'arcaneStaff', 'longBow', 'steelBlade'],
      dialog: ['来自远方的珍品!'],
    },
  };

  function create(id, x, y) {
    const def = DB[id];
    return {
      id, x, y, w: 40, h: 48, def,
      dir: 'down', animStep: 0, moving: false,
      draw(ctx, cam) {
        const img = Assets.get('npc');
        ctx.drawImage(img, Math.round(this.x - cam.x), Math.round(this.y - cam.y));
        // name
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        const x = this.x - cam.x + this.w / 2;
        const y = this.y - cam.y - 8;
        ctx.fillStyle = '#000';
        ctx.fillText(def.name, x + 1, y + 1);
        ctx.fillStyle = def.color;
        ctx.fillText(def.name, x, y);
        // quest marker
        if (def.quests && def.quests.length > 0) {
          const marker = Quests.markerFor(this, window.game && window.game.player);
          if (marker) {
            ctx.font = 'bold 20px monospace';
            ctx.fillStyle = '#000';
            ctx.fillText(marker, x + 1, y - 13);
            ctx.fillStyle = marker === '!' ? '#ffe040' : '#40ff40';
            ctx.fillText(marker, x, y - 14);
          }
        }
      },
    };
  }

  return { DB, create };
})();
