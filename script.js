import { Vector, Input } from "./utils.js";
import { Map } from "./map.js";
import { GameObject, Pointer } from "./game_objects.js";
import { Game } from "./game.js";

Game.INPUT = new Input();

const screen = document.querySelector("#game-screen");
screen.width = Game.WIDTH;
screen.height = Game.HEIGHT;
Game.ctx = screen.getContext("2d");

class Projectile extends GameObject {
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
    $$(".can-collide").forEach((elem) => {
      checkIntersection(this.projectile.getBBox(), elem.getBBox());
      if (checkIntersection(this.projectile.getBBox(), elem.getBBox())) {
        clearTimeout(this.trigger);
        if (this.radiusGrowth === 0) {
          this.explode();
        }
      }
    });
  }
}

class Item extends GameObject {
  constructor(pos) {
    super(pos);
    this.name = "T"
    Game.LAYERS.items.add(this);
  }

  draw(ctx) {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.pos.x, this.pos.y, 20, 20);
  }

  destroy() {
    Game.LAYERS.items.delete(this);
  }
}

class Spell {
  constructor() {
    this.name = "Fireball";
    this.value = 1;
    this.duration = 2000;
    this.cooldown = 5;
  }

  cast() {
    this.projectile = new Projectile(
      Game.LAYERS.player.pos.copy(),
      Game.LAYERS.player.orient,
      2
    );
    this.projectile.fire(this.duration);
  }

  finish() {}
}

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

async function newGame() {
  const menu = document.querySelector("#menu");
  const game = document.querySelector("#game");
  menu.style.display = "none";
  game.style.display = "block";

  let map = new Map("maps/level1.txt");
  await map.loadMap();
  map.instantiate({ layers: Game.LAYERS });

  Game.LAYERS.pointer = new Pointer();

  if (Game.LAYERS.player != null) {
    Game.LAYERS.player.destroy();
  }

  new Item(new Vector(100, 50));

  Game.runGame();
}

function resumeGame() {
  const menu = document.querySelector("#menu");
  const game = document.querySelector("#game");
  menu.style.display = "none";
  game.style.display = "block";
  runGame();
}

function showMenu() {
  const menu = document.querySelector("#menu");
  const game = document.querySelector("#game");
  menu.style.display = "block";
  game.style.display = "none";
  Game.pauseGame();
}

function showOverlay() {
  const overlay = document.querySelector("#overlay");
  overlay.style.display = "block";
  Game.pauseGame();
}

function hideOverlay() {
  const overlay = document.querySelector("#overlay");
  overlay.style.display = "none";
  Game.runGame();
}

window.onkeydown = function (ev) {
  if (ev.key === "d") {
    Game.INPUT.right = 1;
  } else if (ev.key === "a") {
    Game.INPUT.left = 1;
  } else if (ev.key === "w") {
    Game.INPUT.up = 1;
  } else if (ev.key === "s") {
    Game.INPUT.down = 1;
  } else if (ev.code === "Tab") {
    showOverlay();
    return false;
  } else if (ev.code === "Escape") {
    showMenu();
  }
};

window.onkeyup = function (ev) {
  if (ev.key === "d") {
    Game.INPUT.right = 0;
  } else if (ev.key === "a") {
    Game.INPUT.left = 0;
  } else if (ev.key === "w") {
    Game.INPUT.up = 0;
  } else if (ev.key === "s") {
    Game.INPUT.down = 0;
  } else if (ev.code === "Tab") {
    hideOverlay();
    return false;
  }
};

screen.onmousedown = function (ev) {
  Game.LAYERS.pointer.updatePosition(ev, Game.ctx);
  let spell = new Spell();
  spell.cast();
};

screen.onmousemove = function (ev) {
  Game.LAYERS.pointer.updatePosition(ev, Game.ctx);
};

$("#new-game-btn").addEventListener("click", newGame);
$("#resume-game-btn").addEventListener("click", resumeGame);
