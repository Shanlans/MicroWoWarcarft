// save.js - localStorage save/load
const Save = (() => {
  const KEY = 'microwow_save_v1';

  function has() {
    try { return !!localStorage.getItem(KEY); } catch { return false; }
  }
  function save(game) {
    try {
      const p = game.player;
      const data = {
        cls: p.cls, level: p.level, xp: p.xp, gold: p.gold,
        stats: p.stats,
        hp: p.hp, mp: p.mp,
        skills: p.skills,
        inventory: p.inventory,
        equipment: Object.fromEntries(
          Object.entries(p.equipment).map(([k, v]) => [k, v ? v.id : null])
        ),
        killLog: p.killLog,
        questState: p.questState,
        zone: game.world.zone,
        x: p.x, y: p.y,
      };
      localStorage.setItem(KEY, JSON.stringify(data));
      UI.toast('已保存');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  function load() {
    try {
      const s = localStorage.getItem(KEY);
      if (!s) return null;
      return JSON.parse(s);
    } catch { return null; }
  }
  function erase() {
    try { localStorage.removeItem(KEY); } catch {}
  }
  function apply(data, game) {
    const p = new Player(data.cls);
    p.level = data.level; p.xp = data.xp; p.gold = data.gold;
    p.stats = data.stats;
    p.skills = data.skills.slice();
    p.inventory = data.inventory.map(s => ({ ...s }));
    for (const k of Object.keys(data.equipment)) {
      const id = data.equipment[k];
      p.equipment[k] = id ? Items.get(id) : null;
    }
    p.killLog = Object.assign({}, data.killLog);
    p.questState = Object.assign({}, data.questState);
    p.recomputeStats();
    p.hp = Math.min(p.maxHp, data.hp);
    p.mp = Math.min(p.maxMp, data.mp);
    game.player = p;
    game.loadZone(data.zone, { x: data.x, y: data.y });
  }
  return { has, save, load, erase, apply };
})();
