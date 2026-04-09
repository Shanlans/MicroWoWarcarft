// items.js - item and equipment definitions
const Items = (() => {
  // quality: 0 poor, 1 common, 2 uncommon, 3 rare
  // slots: head, chest, legs, weapon, ring, trinket
  const DB = {
    // consumables
    bread:       { id: 'bread', name: '可口的面包', type: 'consume', quality: 1, heal: 40, price: 8, desc: '恢复 40 点生命。' },
    water:       { id: 'water', name: '清凉泉水',   type: 'consume', quality: 1, mana: 30, price: 10, desc: '恢复 30 点法力。' },
    potion:      { id: 'potion', name: '次级治疗药水', type: 'consume', quality: 2, heal: 120, price: 30, desc: '立即恢复 120 点生命。' },

    // weapons
    rustSword:   { id: 'rustSword', name: '生锈的短剑', type: 'weapon', slot: 'weapon', quality: 0, stats: { str: 1, atk: 3 }, price: 12, desc: '+3 攻击 +1 力量' },
    ironSword:   { id: 'ironSword', name: '铁质战剑',   type: 'weapon', slot: 'weapon', quality: 1, stats: { str: 3, atk: 7 }, price: 50, desc: '+7 攻击 +3 力量' },
    steelBlade:  { id: 'steelBlade', name: '精钢巨剑',  type: 'weapon', slot: 'weapon', quality: 2, stats: { str: 6, atk: 14 }, price: 200, desc: '+14 攻击 +6 力量' },
    oakStaff:    { id: 'oakStaff', name: '橡木法杖',   type: 'weapon', slot: 'weapon', quality: 1, stats: { int: 4, atk: 5 }, price: 55, desc: '+5 攻击 +4 智力' },
    arcaneStaff: { id: 'arcaneStaff', name: '奥术法杖', type: 'weapon', slot: 'weapon', quality: 2, stats: { int: 8, atk: 10 }, price: 220, desc: '+10 攻击 +8 智力' },
    shortBow:    { id: 'shortBow', name: '猎人短弓',   type: 'weapon', slot: 'weapon', quality: 1, stats: { agi: 4, atk: 6 }, price: 55, desc: '+6 攻击 +4 敏捷' },
    longBow:     { id: 'longBow', name: '精制长弓',    type: 'weapon', slot: 'weapon', quality: 2, stats: { agi: 7, atk: 12 }, price: 220, desc: '+12 攻击 +7 敏捷' },

    // armor
    leatherCap:  { id: 'leatherCap', name: '皮革头盔', type: 'armor', slot: 'head',  quality: 1, stats: { armor: 4, sta: 2 }, price: 25, desc: '+4 护甲 +2 耐力' },
    ironHelm:    { id: 'ironHelm', name: '铁盔',       type: 'armor', slot: 'head',  quality: 2, stats: { armor: 10, sta: 5 }, price: 110, desc: '+10 护甲 +5 耐力' },
    leatherVest: { id: 'leatherVest', name: '皮革护胸', type: 'armor', slot: 'chest', quality: 1, stats: { armor: 8, sta: 3 }, price: 40, desc: '+8 护甲 +3 耐力' },
    chainMail:   { id: 'chainMail', name: '锁子甲',    type: 'armor', slot: 'chest', quality: 2, stats: { armor: 18, sta: 7 }, price: 160, desc: '+18 护甲 +7 耐力' },
    leatherLegs: { id: 'leatherLegs', name: '皮革护腿', type: 'armor', slot: 'legs',  quality: 1, stats: { armor: 6, sta: 2 }, price: 30, desc: '+6 护甲 +2 耐力' },
    ironLegs:    { id: 'ironLegs', name: '铁制护腿',   type: 'armor', slot: 'legs',  quality: 2, stats: { armor: 14, sta: 6 }, price: 140, desc: '+14 护甲 +6 耐力' },
    copperRing:  { id: 'copperRing', name: '铜戒指',  type: 'armor', slot: 'ring',  quality: 1, stats: { str: 1, agi: 1, int: 1 }, price: 25, desc: '全属性 +1' },
    silverRing:  { id: 'silverRing', name: '白银戒指', type: 'armor', slot: 'ring', quality: 2, stats: { str: 3, agi: 3, int: 3 }, price: 120, desc: '全属性 +3' },
    luckyCharm:  { id: 'luckyCharm', name: '幸运符',  type: 'armor', slot: 'trinket', quality: 2, stats: { agi: 5 }, price: 150, desc: '+5 敏捷' },

    // quest items
    boarMeat:    { id: 'boarMeat', name: '新鲜野猪肉', type: 'quest', quality: 1, desc: '一块肥美的野猪肉。' },
    koboldGear:  { id: 'koboldGear', name: '狗头人齿轮', type: 'quest', quality: 1, desc: '狗头人用的奇怪零件。' },
    banditLetter:{ id: 'banditLetter', name: '迪菲亚密信', type: 'quest', quality: 2, desc: '染血的羊皮纸。' },
    mechPart:    { id: 'mechPart', name: '收割机齿轮', type: 'quest', quality: 2, desc: '一块沉重的金属齿轮。' },
    vcHead:      { id: 'vcHead', name: '范克里夫的头颅', type: 'quest', quality: 3, desc: '迪菲亚首领的头颅。' },

    // rare drops
    warmask:     { id: 'warmask', name: '范克里夫的面具', type: 'armor', slot: 'head', quality: 3, stats: { armor: 16, sta: 8, str: 3 }, price: 400, desc: '+16 护甲 +8 耐力 +3 力量' },
  };

  function get(id) { return DB[id]; }
  const QUALITY_COLORS = ['#8a8a8a', '#ffffff', '#1eff00', '#0070ff'];
  function color(item) { return QUALITY_COLORS[item.quality || 1]; }
  return { get, DB, color };
})();
