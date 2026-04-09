// camera.js - follows the player, clamped to world bounds
const Camera = {
  x: 0, y: 0, w: 960, h: 640,
  follow(target, world) {
    const tx = target.x + target.w / 2 - this.w / 2;
    const ty = target.y + target.h / 2 - this.h / 2;
    this.x = Math.max(0, Math.min(world.pixelW - this.w, tx));
    this.y = Math.max(0, Math.min(world.pixelH - this.h, ty));
  },
  worldToScreen(x, y) { return { x: x - this.x, y: y - this.y }; },
  screenToWorld(x, y) { return { x: x + this.x, y: y + this.y }; },
};
