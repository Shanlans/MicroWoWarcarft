// input.js - keyboard / mouse / touch input wrapper
const Input = (() => {
  const keys = Object.create(null);
  const pressed = Object.create(null);
  let mouse = { x: 0, y: 0, down: false, clicked: false };

  // ---- Mobile detection & touch state ----
  let isMobile = false;
  const joystick = { active: false, cx: 0, cy: 0, dx: 0, dy: 0, touchId: null };
  const touchBtns = []; // populated by UI, format: {x, y, r, key}
  let touchTapPos = null; // {x, y} for target-tap

  function normalize(k) {
    if (k === 'ArrowUp') return 'w';
    if (k === 'ArrowDown') return 's';
    if (k === 'ArrowLeft') return 'a';
    if (k === 'ArrowRight') return 'd';
    return k.toLowerCase();
  }

  window.addEventListener('keydown', (e) => {
    const k = normalize(e.key);
    if (!keys[k]) pressed[k] = true;
    keys[k] = true;
    if (['w','a','s','d','b','c','l','m','i','tab',' ','1','2','3','4','5','escape','enter'].includes(k)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => { keys[normalize(e.key)] = false; });

  function attachMouse(canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
      mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    });
    canvas.addEventListener('mousedown', () => { mouse.down = true; mouse.clicked = true; });
    canvas.addEventListener('mouseup', () => { mouse.down = false; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // ---- Touch support ----
    function toCanvas(t) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (t.clientX - rect.left) * (canvas.width / rect.width),
        y: (t.clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isMobile = true;
      for (const t of e.changedTouches) {
        const p = toCanvas(t);
        // check virtual buttons first
        let hitBtn = false;
        for (const b of touchBtns) {
          if (Math.hypot(p.x - b.x, p.y - b.y) < b.r + 6) {
            pressed[b.key] = true;
            keys[b.key] = true;
            hitBtn = true;
            break;
          }
        }
        if (hitBtn) continue;
        // left 35% = joystick zone
        if (p.x < 960 * 0.35 && p.y > 640 * 0.4 && !joystick.active) {
          joystick.active = true;
          joystick.cx = p.x;
          joystick.cy = p.y;
          joystick.dx = 0;
          joystick.dy = 0;
          joystick.touchId = t.identifier;
        } else {
          // tap for targeting / NPC interaction
          mouse.x = p.x;
          mouse.y = p.y;
          mouse.clicked = true;
        }
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (joystick.active && t.identifier === joystick.touchId) {
          const p = toCanvas(t);
          const dx = p.x - joystick.cx;
          const dy = p.y - joystick.cy;
          const len = Math.hypot(dx, dy);
          const maxR = 50;
          if (len > 4) {
            const clamp = Math.min(len, maxR);
            joystick.dx = (dx / len) * (clamp / maxR);
            joystick.dy = (dy / len) * (clamp / maxR);
          } else {
            joystick.dx = 0;
            joystick.dy = 0;
          }
        }
      }
    }, { passive: false });

    function touchEnd(e) {
      for (const t of e.changedTouches) {
        if (joystick.active && t.identifier === joystick.touchId) {
          joystick.active = false;
          joystick.dx = 0;
          joystick.dy = 0;
          joystick.touchId = null;
        }
      }
    }
    canvas.addEventListener('touchend', touchEnd);
    canvas.addEventListener('touchcancel', touchEnd);
  }

  // isDown override for touch joystick
  function isDown(k) {
    const nk = normalize(k);
    if (keys[nk]) return true;
    // map joystick to WASD
    if (joystick.active) {
      if (nk === 'w' && joystick.dy < -0.3) return true;
      if (nk === 's' && joystick.dy > 0.3) return true;
      if (nk === 'a' && joystick.dx < -0.3) return true;
      if (nk === 'd' && joystick.dx > 0.3) return true;
    }
    return false;
  }

  function isPressed(k) {
    const nk = normalize(k);
    if (pressed[nk]) { pressed[nk] = false; return true; }
    return false;
  }

  return {
    attachMouse, isDown, isPressed, mouse,
    get isMobile() { return isMobile; },
    joystick,
    touchBtns, // UI populates this
    endFrame() {
      mouse.clicked = false;
      // clear edge-triggered virtual keys
      for (const b of touchBtns) keys[b.key] = false;
    },
  };
})();
