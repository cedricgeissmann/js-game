import { Projectile } from "./game_objects.js"
import { Game } from "./game.js"


export class Spell {
    constructor() {
      this.name = "Fireball";
      this.value = 1;
      this.duration = 2000;
      this.cooldown = 5;
    }
  
    cast() {
      this.projectile = new Projectile(
        Game.LAYERS.player.getCenter(),
        Game.LAYERS.player.orient,
        2
      );
      this.projectile.fire(this.duration);
    }
  
    finish() {}
  }
  