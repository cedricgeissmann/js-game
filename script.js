import { Vector, Input, $, $$ } from "./utils.js";
import { Map } from "./map.js";
import { GameObject, Pointer } from "./game_objects.js";
import { Game } from "./game.js";



class Item extends GameObject {
  constructor(pos) {
    super(pos);
    this.name = "T";
    Game.LAYERS.items.add(this);
  }

  draw() {
    Game.ctx.fillStyle = "blue";
    Game.ctx.fillRect(this.pos.x, this.pos.y, 20, 20);
  }

  destroy() {
    Game.LAYERS.items.delete(this);
  }
}

async function newGame() {
  Game.screen = document.querySelector("#game-screen");
  Game.screen.width = Game.WIDTH;
  Game.screen.height = Game.HEIGHT;
  Game.ctx = Game.screen.getContext("2d");

  Game.INPUT = new Input();

  addEventListeners();

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

function addEventListeners() {
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

  Game.screen.onmousedown = function (ev) {
    Game.LAYERS.pointer.updatePosition(ev);
    Game.LAYERS.player.castSpell()
  };

  Game.screen.onmousemove = function (ev) {
    Game.LAYERS.pointer.updatePosition(ev);
  };
}

$("#new-game-btn").addEventListener("click", newGame);
$("#resume-game-btn").addEventListener("click", resumeGame);
