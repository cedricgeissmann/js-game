import { Vector, Rectangle, checkIntersection } from "./utils.js";
import { SpriteSheet } from "./sprite_sheet.js";

const TILE_SIZE = 16;
const WIDTH = 20 * TILE_SIZE;
const HEIGHT = 15 * TILE_SIZE;

export class GameObject {
  constructor(pos) {
    this.pos = pos;
  }

  getBBox() {
    return new Rectangle(this.pos.x, this.pos.y, TILE_SIZE, TILE_SIZE);
  }
}

export class Wall extends GameObject {
  constructor({ pos = new Vector(0, 0) }) {
    super(pos);
  }

  draw(ctx) {
    ctx.fillStyle = "brown";
    ctx.fillRect(this.pos.x, this.pos.y, 16, 16);
  }
}

export class Player extends GameObject {
  constructor(pos) {
    super(pos);
    this.speed = 2;
    this.orient = new Vector(0, 0);

    this.sprite = new SpriteSheet({ url: "res/player.png" });
  }

  updatePosition({ layers, input}) {
    this.dir = input.getDirection().normalize().scale(this.speed);

    layers.wall.forEach((obstacle) => {
      let rect1 = this.getBBox();
      let rect2 = obstacle.getBBox();

      let p1 = new Vector(rect1.x, rect1.y).add(this.dir);
      let p2 = new Vector(rect2.x, rect2.y);

      let dist = p1.diff(p2);

      if (dist.length() <= TILE_SIZE) {
        console.log(dist, dist.length());
        if (Math.abs(dist.x) <= TILE_SIZE) {
          this.dir.x = 0;
        }
        if (Math.abs(dist.y) <= TILE_SIZE) {
          this.dir.y = 0;
        }
      }
    });

    this.pos = this.pos.add(this.dir);
    // TODO: This only works if the player is in the middle of the viewport
    this.orient = new Vector(WIDTH / 2, HEIGHT / 2)
      .diff(layers.pointer.pos)
      .normalize()
      .scale(20);

    this.checkCollision({layers});
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(
      this.pos.x + this.orient.x + 10,
      this.pos.y + this.orient.y + 10,
      2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    this.sprite.draw({
      ctx: ctx,
      pos: this.pos,
      config: { tileSize: TILE_SIZE },
    });
    ctx.strokeStyle = "black";
    let bBox = this.getBBox();
    ctx.strokeRect(bBox.x, bBox.y, bBox.width, bBox.height);
  }

  checkCollision({layers}) {
    layers.items.forEach((item) => {
      if (checkIntersection(this.getBBox(), item.getBBox())) {
        this.pickUp(item);
        layers.items.delete(item);
      }
    });
  }

  pickUp(item) {
    console.log("Implement pick up: ", item);
  }

  destroy() {
    delete this;
  }
}