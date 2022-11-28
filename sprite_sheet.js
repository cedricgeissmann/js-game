import { Game } from "./game.js"

export class SpriteSheet {
  constructor({ url }) {
    this.url = url;
    this.img = new Image();
    this.img.src = this.url;
    this.tot = 3;
    this.animPos = 0;
    this.frameCount = 0;
    this.animType = 0;
  }

  draw({pos}) {
    Game.ctx.drawImage(
      this.img,
      Game.TILE_SIZE * this.animPos,
      Game.TILE_SIZE * this.animType,
      Game.TILE_SIZE,
      Game.TILE_SIZE,
      pos.x,
      pos.y,
      Game.TILE_SIZE,
      Game.TILE_SIZE
    );
    this.frameCount++;
    if (this.frameCount > 10) {
      this.animPos = (this.animPos + 1) % this.tot;
      this.frameCount = 0;
    }
  }
}
