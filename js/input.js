// input.js - keyboard / mouse input wrapper
const Input = (() => {
  const keys = Object.create(null);
  const pressed = Object.create(null); // edge triggered, consumed by isPressed()
  let mouse = { x: 0, y: 0, down: false, clicked: false };

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

  window.addEventListener('keyup', (e) => {
    const k = normalize(e.key);
    keys[k] = false;
  });

  function attachMouse(canvas) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
      mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    });
    canvas.addEventListener('mousedown', () => { mouse.down = true; mouse.clicked = true; });
    canvas.addEventListener('mouseup', () => { mouse.down = false; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  return {
    attachMouse,
    isDown(k) { return !!keys[normalize(k)]; },
    isPressed(k) {
      const nk = normalize(k);
      if (pressed[nk]) { pressed[nk] = false; return true; }
      return false;
    },
    mouse,
    endFrame() { mouse.clicked = false; },
  };
})();
