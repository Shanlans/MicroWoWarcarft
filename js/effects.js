// effects.js - transient visual effects (slashes, explosions, rings, ice bursts)
const Effects = (() => {
  const list = [];

  function spawn(opts) {
    list.push({ t: 0, dur: 0.3, ...opts });
  }

  // melee slash arc on a point
  function slash(x, y, color = '#ffffff', size = 36) {
    spawn({ type: 'slash', x, y, color, size, dur: 0.22 });
  }

  // bigger heroic slash
  function bigSlash(x, y, color = '#ff6040', size = 50) {
    spawn({ type: 'slash', x, y, color, size, dur: 0.3 });
  }

  // expanding ring centered on a point (whirlwind / blizzard)
  function ring(x, y, color = '#ffffff', radius = 90) {
    spawn({ type: 'ring', x, y, color, radius, dur: 0.4 });
  }

  // explosion (fireball impact)
  function explosion(x, y, color = '#ff8040', radius = 28) {
    spawn({ type: 'explosion', x, y, color, radius, dur: 0.35 });
  }

  // ice burst (frostbolt impact)
  function iceBurst(x, y) {
    spawn({ type: 'ice', x, y, dur: 0.4 });
  }

  // arrow impact spark
  function spark(x, y, color = '#ffe080') {
    spawn({ type: 'spark', x, y, color, dur: 0.2 });
  }

  function update(dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].t += dt;
      if (list[i].t >= list[i].dur) list.splice(i, 1);
    }
  }

  function draw(ctx, cam) {
    for (const e of list) {
      const k = Math.min(1, e.t / e.dur);
      const fade = 1 - k;
      ctx.save();
      ctx.translate(Math.round(e.x - cam.x), Math.round(e.y - cam.y));
      ctx.globalAlpha = fade;
      ctx.lineCap = 'round';

      if (e.type === 'slash') {
        // a curved arc made of 3 progressive strokes
        const sweep = -Math.PI * 0.7 + k * Math.PI * 1.4;
        const half = e.size / 2;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, half, sweep - 0.6, sweep + 0.6);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, half, sweep - 0.4, sweep + 0.4);
        ctx.stroke();
      } else if (e.type === 'ring') {
        const r = e.radius * (0.2 + k * 0.8);
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (e.type === 'explosion') {
        const r = e.radius * (0.3 + k * 0.7);
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffe040';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'ice') {
        // 8 ice spikes radiating
        ctx.strokeStyle = '#aae0ff';
        ctx.lineWidth = 4;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const len = 14 + k * 16;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
          ctx.stroke();
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const len = 12 + k * 14;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
          ctx.stroke();
        }
      } else if (e.type === 'spark') {
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 3;
        const len = 8 + k * 6;
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + k;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  function clear() { list.length = 0; }

  return { spawn, slash, bigSlash, ring, explosion, iceBurst, spark, update, draw, clear, list };
})();
