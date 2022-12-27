import { Vector, Rectangle, checkIntersection } from "./utils.js";
import { SpriteSheet } from "./sprite_sheet.js";
import { Game } from "./game.js";
import { Spell } from "./spells.js";

export class GameObject extends Game {
  constructor(pos) {
    super();
    this.pos = pos;
    this.width = Game.TILE_SIZE;
    this.height = Game.TILE_SIZE;
    this.middle = new Vector(this.width / 2, this.height / 2);

    this.canDie = true
    this.hp = 30

    this.effects = new Set()
  }

  getBBox() {
    return new Rectangle(this.pos.x, this.pos.y, this.width, this.height);
  }

  getCenter() {
    return new Vector(
      this.pos.x + this.width / 2,
      this.pos.y + this.height / 2
    );
  }

  getMiddle() {
    return this.middle;
  }

  destroy() { }

  addSpellEffect( effect ) {
    // TODO: remove the spell effects for a one shot after the effect has resolved.
    // We need this right now, because if the object is in a growing radius of a spell,
    // the effect gets applied every frame the object is inside the effected area.
    if (this.effects.has(effect)) return
    this.effects.add(effect)
    effect.handle(this)
  }

  damageFor(prop) {
    console.log("Damge for: ", prop.dmg)
    this.hp = this.hp - prop.dmg
    this.checkAlive()
  }

  checkAlive() {
    if (this.canDie && this.hp <= 0) {
      this.destroy()
    }
  }
}

export class Wall extends GameObject {
  constructor({ pos = new Vector(0, 0) }) {
    super(pos);
  }

  draw() {

    Game.ctx.fillStyle = "brown";
    if (this.effects.size >= 1) {
      Game.ctx.fillStyle = "magenta"
    }
    Game.ctx.fillRect(this.pos.x, this.pos.y, 16, 16);
  }

  damageFor(prop) {
    let dmgFactor = 1
    if (prop.type === "magic") {
      dmgFactor = 0.5
    }
    prop.dmg *= dmgFactor
    super.damageFor(prop)
  }

  destroy() {
    Game.LAYERS.wall.delete(this)
  }
}

export class Player extends GameObject {
  constructor(pos) {
    super(pos);
    this.speed = 2;
    this.orient = new Vector(0, 0);

    this.sprite = new SpriteSheet({ url: "res/player.png" });
  }

  updatePosition({ layers, input }) {
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

    this.orient = this.getCenter()
      .diff(layers.pointer.getCenter())
      .normalize()
      .scale(20);

    this.checkCollision({ layers });
  }

  draw() {
    Game.ctx.beginPath();
    const center = this.getCenter();
    Game.ctx.arc(
      center.x + this.orient.x,
      center.y + this.orient.y,
      2,
      0,
      Math.PI * 2
    );
    Game.ctx.fill();
    this.sprite.draw({ pos: this.pos });
    Game.ctx.strokeStyle = "black";
    let bBox = this.getBBox();
    Game.ctx.strokeRect(bBox.x, bBox.y, bBox.width, bBox.height);
  }

  checkCollision({ layers }) {
    layers.items.forEach((item) => {
      if (checkIntersection(this.getBBox(), item.getBBox())) {
        this.pickUp(item);
        layers.items.delete(item);
      }
    });
  }

  pickUp(item) {
    console.log("Implement pick up: ", item);
    createInventoryItem(item);
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
  constructor(pos, dir, speed, spell) {
    super(pos);
    this.dir = dir.normalize().scale(speed);
    this.speed = speed;
    this.spell = spell

    this.radiusGrowth = 0;
    this.radius = 2;
    this.trigger = null;

    Game.LAYERS.projectiles.add(this);
  }

  draw() {
    Game.ctx.fillStyle = "red";
    Game.ctx.beginPath();
    Game.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    Game.ctx.fill();
  }

  updatePosition() {
    this.pos = this.pos.add(this.dir);
    if (this.radiusGrowth !== 0) {
      this.radius = this.radius + this.radiusGrowth;
    }
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

  // Hand the element from the collision back to the spell to resolve the spell logic.
  applyEffect(elem) {
    this.spell.applyEffect(elem)
  }

  checkCollision() {
    Game.LAYERS.wall.forEach((elem) => {
      checkIntersection(this.getBBox(), elem.getBBox());
      if (checkIntersection(this.getBBox(), elem.getBBox())) {
        this.applyEffect(elem)
        clearTimeout(this.trigger);
        if (this.radiusGrowth === 0) { // a collision is detected, and the pojectile explodes
          this.explode();
        }
      }
    });
  }
}

function createInventoryItem(item) {
  const inventoryList = document.querySelector("#inventory-list");

  const li = document.createElement("li");
  li.classList.add("inventory-list-item");

  const it = document.createElement("div");
  it.classList.add("inventory-item");
  it.textContent = item.name;

  li.appendChild(it);

  inventoryList.appendChild(li);
}

export class Pointer extends GameObject {
  constructor() {
    super(new Vector(0, 0));
    this.width = 8;
    this.height = 8;
  }

  updatePosition(ev) {
    const trans = Game.ctx.getTransform();
    this.pos.x = (ev.offsetX / Game.screen.clientWidth) * Game.WIDTH - trans.e;
    this.pos.y =
      (ev.offsetY / Game.screen.clientHeight) * Game.HEIGHT - trans.f;
  }

  draw() {
    Game.ctx.fillStyle = "black";
    Game.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
  }
}
