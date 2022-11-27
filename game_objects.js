import { Vector, Rectangle, checkIntersection } from "./utils.js";
import { SpriteSheet } from "./sprite_sheet.js";
import { Game } from "./game.js"
import { Spell } from "./spells.js"


export class GameObject extends Game {
  constructor(pos) {
    super()
    this.pos = pos;
    this.width = Game.TILE_SIZE;
    this.height = Game.TILE_SIZE;
    this.middle = new Vector(this.width / 2, this.height / 2)
  }

  getBBox() {
    return new Rectangle(this.pos.x, this.pos.y, this.width, this.height);
  }

  getCenter() {
    return new Vector(this.pos.x + this.width / 2, this.pos.y + this.height / 2)
  }

  getMiddle() {
    return this.middle;
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

      if (dist.length() <= Game.TILE_SIZE) {
        console.log(dist, dist.length());
        if (Math.abs(dist.x) <= Game.TILE_SIZE) {
          this.dir.x = 0;
        }
        if (Math.abs(dist.y) <= Game.TILE_SIZE) {
          this.dir.y = 0;
        }
      }
    });

    this.pos = this.pos.add(this.dir);
    // TODO: This only works if the player is in the middle of the viewport
    this.orient = new Vector(Game.WIDTH / 2, Game.HEIGHT / 2)
      .diff(layers.pointer.getCenter())
      .normalize()
      .scale(20);

    this.checkCollision({layers});
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(
      this.pos.x + this.orient.x,
      this.pos.y + this.orient.y,
      2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    this.sprite.draw({
      ctx: ctx,
      pos: this.pos,
      config: { tileSize: Game.TILE_SIZE },
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
    createInventoryItem(item)

  }

  destroy() {
    delete this;
  }

  castSpell() {
    let spell = new Spell();
    spell.cast();
  }
}

export class Projectile extends GameObject {
  constructor(pos, dir, speed) {
    super(pos);
    this.dir = dir.normalize().scale(speed);
    this.speed = speed;

    this.radiusGrowth = 0;
    this.radius = 2;
    this.trigger = null;

    Game.LAYERS.projectiles.add(this);
  }

  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  updatePosition() {
    this.pos = this.pos.add(this.dir);
    if (this.radiusGrowth !== 0) {
      this.radius = this.radius + this.radiusGrowth;
    }
  }

  fire(duration) {
    this.trigger = setTimeout(
      function (proj) {
        proj.speed = 0;
        proj.explode();
      },
      duration,
      this
    );
  }

  explode() {
    this.radiusGrowth = 3;
    setTimeout(
      function (proj) {
        proj.destroy();
      },
      200,
      this
    );
  }

  destroy() {
    Game.LAYERS.projectiles.delete(this);
  }

  checkCollision() {
    Game.LAYERS.wall.forEach((elem) => {
      checkIntersection(this.getBBox(), elem.getBBox());
      if (checkIntersection(this.getBBox(), elem.getBBox())) {
        clearTimeout(this.trigger);
        if (this.radiusGrowth === 0) {
          this.explode();
        }
      }
    });
  }
}


function createInventoryItem(item) {
  const inventoryList = document.querySelector("#inventory-list")

  const li = document.createElement("li")
  li.classList.add("inventory-list-item")
  
  const it = document.createElement("div")
  it.classList.add("inventory-item")
  it.textContent = item.name

  li.appendChild(it)


  inventoryList.appendChild(li)
}

export class Pointer extends GameObject{
  constructor() {
      super(new Vector(0, 0))
      this.width = 8
      this.height = 8
  }

  updatePosition(ev) {
      this.pos.x = ev.offsetX / Game.screen.clientWidth * 320 + this.getMiddle().x
      this.pos.y = ev.offsetY / Game.screen.clientHeight * 240 + this.getMiddle().y
  }

  draw(ctx) {
      ctx.fillStyle = "black"
      ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height)
  }
}