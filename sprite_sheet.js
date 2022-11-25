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

  draw({ ctx, pos, config }) {
    ctx.drawImage(
      this.img,
      config.tileSize * this.animPos,
      config.tileSize * this.animType,
      config.tileSize,
      config.tileSize,
      pos.x,
      pos.y,
      config.tileSize,
      config.tileSize
    );
    this.frameCount++;
    if (this.frameCount > 10) {
      this.animPos = (this.animPos + 1) % this.tot;
      this.frameCount = 0;
    }
  }
}
