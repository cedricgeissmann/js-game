import { Vector, Input, Pointer } from "./utils.js";
import { Map } from "./map.js";
import { GameObject } from "./game_objects.js";

const CONFIG = {
  tileSize: 16,
};

const TILE_SIZE = 16;
const WIDTH = 20 * TILE_SIZE;
const HEIGHT = 15 * TILE_SIZE;

const NS = "http://www.w3.org/2000/svg";
const PROJECTILES = new Set();
const LAYERS = {
  background: new Set(),
  wall: new Set(),
  player: null,
  pointer: new Pointer(),
  items: new Set()
};
const CAMERA_CENTER = new Vector(0, 0);
const INPUT = new Input();
let PAUSE = true;

const screen = document.querySelector("#game-screen");
screen.width = WIDTH;
screen.height = HEIGHT;
const ctx = screen.getContext("2d");

class Projectile extends GameObject {
  constructor(pos, dir, speed) {
    super(pos);
    this.dir = dir.normalize().scale(speed);
    this.speed = speed;

    this.radiusGrowth = 0;
    this.radius = 2;
    this.trigger = null;

    PROJECTILES.add(this);
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
    PROJECTILES.delete(this);
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
    LAYERS.items.add(this);
  }

  draw(ctx) {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.pos.x, this.pos.y, 20, 20);
  }

  destroy() {
    LAYERS.items.delete(this);
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
      LAYERS.player.pos.copy(),
      LAYERS.player.orient,
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
  map.instantiate({ layers: LAYERS, config: CONFIG });

  if (LAYERS.player != null) {
    LAYERS.player.destroy();
  }

  new Item(new Vector(100, 50));

  runGame()
}

function resumeGame() {
  const menu = document.querySelector("#menu");
  const game = document.querySelector("#game");
  menu.style.display = "none";
  game.style.display = "block";
  runGame()
}

function showMenu() {
  const menu = document.querySelector("#menu");
  const game = document.querySelector("#game");
  menu.style.display = "block";
  game.style.display = "none";
  PAUSE = true;
}

function gameLoop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  LAYERS.player.updatePosition({layers: LAYERS, input: INPUT});

  PROJECTILES.forEach(function (proj) {
    proj.updatePosition();
    proj.checkCollision();
  });

  ctx.translate(
    -(LAYERS.player.pos.x - WIDTH / 2),
    -(LAYERS.player.pos.y - HEIGHT / 2)
  );

  LAYERS.wall.forEach((wall) => wall.draw(ctx));

  LAYERS.items.forEach(function (item) {
    item.draw(ctx);
  });
  PROJECTILES.forEach(function (proj) {
    proj.draw(ctx);
  });
  LAYERS.player.draw(ctx);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  LAYERS.pointer.draw(ctx);

  if (!PAUSE) {
    window.requestAnimationFrame(gameLoop);
}
}

function pauseGame() {
    PAUSE = true
}

function runGame() {
    PAUSE = false
    window.requestAnimationFrame(gameLoop);
}

function showOverlay() {
    const overlay = document.querySelector("#overlay")
    overlay.style.display = "block"
    pauseGame()
}

function hideOverlay() {
    const overlay = document.querySelector("#overlay")
    overlay.style.display = "none"
    runGame()
}

window.onkeydown = function (ev) {
  if (ev.key === "d") {
    INPUT.right = 1;
  } else if (ev.key === "a") {
    INPUT.left = 1;
  } else if (ev.key === "w") {
    INPUT.up = 1;
  } else if (ev.key === "s") {
    INPUT.down = 1;
  } else if (ev.code === "Tab") {
    showOverlay()
    return false;
  } else if (ev.code === "Escape") {
    showMenu();
  }
};

window.onkeyup = function (ev) {
  if (ev.key === "d") {
    INPUT.right = 0;
  } else if (ev.key === "a") {
    INPUT.left = 0;
  } else if (ev.key === "w") {
    INPUT.up = 0;
  } else if (ev.key === "s") {
    INPUT.down = 0;
  } else if (ev.code === "Tab") {
    hideOverlay()
    return false
  }
};

screen.onmousedown = function (ev) {
  LAYERS.pointer.updatePosition(ev, ctx);
  let spell = new Spell();
  spell.cast();
};

screen.onmousemove = function (ev) {
  LAYERS.pointer.updatePosition(ev, ctx);
};

$("#new-game-btn").addEventListener("click", newGame);
$("#resume-game-btn").addEventListener("click", resumeGame);
