export class Game {
  static TILE_SIZE = 16;
  static WIDTH = 20 * Game.TILE_SIZE;
  static HEIGHT = 15 * Game.TILE_SIZE;
  static LAYERS = {
    background: new Set(),
    wall: new Set(),
    player: null,
    pointer: null,
    items: new Set(),
    projectiles: new Set(),
  };

  static screen;
  static ctx;
  static INPUT;

  static RUNNING = false;

  constructor() {}

  static pauseGame() {
    Game.RUNNING = false;
  }

  static runGame() {
    Game.RUNNING = true;
    window.requestAnimationFrame(Game.gameLoop);
  }

  static gameLoop() {
    Game.ctx.clearRect(0, 0, Game.WIDTH, Game.HEIGHT);

    Game.LAYERS.player.updatePosition({
      layers: Game.LAYERS,
      input: Game.INPUT,
    });

    Game.LAYERS.projectiles.forEach(function (proj) {
      proj.updatePosition();
      proj.checkCollision();
    });

    Game.ctx.translate(
      -(Game.LAYERS.player.pos.x - Game.WIDTH / 2),
      -(Game.LAYERS.player.pos.y - Game.HEIGHT / 2)
    );

    Game.LAYERS.wall.forEach((wall) => wall.draw(Game.ctx));

    Game.LAYERS.items.forEach(function (item) {
      item.draw(Game.ctx);
    });
    Game.LAYERS.projectiles.forEach(function (proj) {
      proj.draw(Game.ctx);
    });
    Game.LAYERS.player.draw(Game.ctx);

    Game.ctx.setTransform(1, 0, 0, 1, 0, 0);
    Game.LAYERS.pointer.draw(Game.ctx);

    if (Game.RUNNING) {
      window.requestAnimationFrame(Game.gameLoop);
    }
  }
}
