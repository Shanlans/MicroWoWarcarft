// effects.js - transient visual effects (slashes, explosions, rings, ice bursts)
// All effects use world coordinates. `draw(ctx, cam)` handles the camera offset.
const Effects = (() => {
  const list = [];

  function spawn(opts) {
    list.push({ t: 0, dur: 0.5, ...opts });
  }

  // melee slash cross (big, 3 lines)
  function slash(x, y, color = '#ff5050', size = 64) {
    spawn({ type: 'slash', x, y, color, size, dur: 0.45 });
  }
  // bigger heroic slash
  function bigSlash(x, y, color = '#ff3020', size = 96) {
    spawn({ type: 'slash', x, y, color, size, dur: 0.55 });
  }
  // expanding ring (whirlwind / blizzard)
  function ring(x, y, color = '#ffe040', radius = 90) {
    spawn({ type: 'ring', x, y, color, radius, dur: 0.6 });
  }
  // explosion (fireball impact)
  function explosion(x, y, color = '#ff8040', radius = 42) {
    spawn({ type: 'explosion', x, y, color, radius, dur: 0.5 });
  }
  // ice burst (frostbolt impact)
  function iceBurst(x, y) {
    spawn({ type: 'ice', x, y, dur: 0.55 });
  }
  // arrow impact spark
  function spark(x, y, color = '#ffe080') {
    spawn({ type: 'spark', x, y, color, dur: 0.35 });
  }

  function update(dt) {
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].t += dt;
      if (list[i].t >= list[i].dur) list.splice(i, 1);
    }
  }

  // "bloom then fade" curve: 0..0.4 scale up, 0.4..1.0 fade out
  function curve(k) {
    if (k < 0.4) return k / 0.4;          // 0..1
    return 1 - (k - 0.4) / 0.6;             // 1..0
  }

  function draw(ctx, cam) {
    for (const e of list) {
      const k = Math.min(1, e.t / e.dur);
      const fade = curve(k);
      ctx.save();
      ctx.translate(Math.round(e.x - cam.x), Math.round(e.y - cam.y));
      ctx.globalAlpha = fade;
      ctx.lineCap = 'round';

      if (e.type === 'slash') {
        const size = e.size;
        // three diagonal slash lines at angle 30°, staggered
        const ang = -Math.PI / 4;
        const cos = Math.cos(ang), sin = Math.sin(ang);
        // dark outer
        ctx.strokeStyle = '#200';
        ctx.lineWidth = 10;
        for (let i = -1; i <= 1; i++) {
          const off = i * size * 0.18;
          ctx.beginPath();
          ctx.moveTo(-cos * size / 2 + off, -sin * size / 2 - off);
          ctx.lineTo(cos * size / 2 + off, sin * size / 2 - off);
          ctx.stroke();
        }
        // color fill
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 7;
        for (let i = -1; i <= 1; i++) {
          const off = i * size * 0.18;
          ctx.beginPath();
          ctx.moveTo(-cos * size / 2 + off, -sin * size / 2 - off);
          ctx.lineTo(cos * size / 2 + off, sin * size / 2 - off);
          ctx.stroke();
        }
        // white inner highlight
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-cos * size / 2, -sin * size / 2);
        ctx.lineTo(cos * size / 2, sin * size / 2);
        ctx.stroke();
      } else if (e.type === 'ring') {
        const r = e.radius * (0.15 + k * 0.85);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (e.type === 'explosion') {
        const r = e.radius * (0.3 + k * 0.9);
        // dark outline
        ctx.fillStyle = '#400';
        ctx.beginPath(); ctx.arc(0, 0, r + 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffe040';
        ctx.beginPath(); ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fill();
      } else if (e.type === 'ice') {
        // 12 ice spikes radiating with outline
        const len = 18 + k * 22;
        for (let layer = 0; layer < 2; layer++) {
          ctx.strokeStyle = layer === 0 ? '#003060' : '#aae0ff';
          ctx.lineWidth = layer === 0 ? 7 : 4;
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
            ctx.stroke();
          }
        }
        // center burst
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
      } else if (e.type === 'spark') {
        const len = 14 + k * 10;
        ctx.strokeStyle = '#400';
        ctx.lineWidth = 6;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
          ctx.stroke();
        }
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
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
