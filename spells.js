import { Projectile } from "./game_objects.js"
import { Game } from "./game.js"
import { SpellEffect } from "./spell_effect.js";


export class Spell {
    constructor() {
      this.name = "Fireball";
      this.value = 1;
      this.duration = 500;
      this.cooldown = 5;
      this.effect = new SpellEffect({
        name: "Fire damage",
        dmg: 25
      })
    }
  
    cast() {
      this.projectile = new Projectile(
        Game.LAYERS.player.getCenter(),
        Game.LAYERS.player.orient,
        2,
        this  // hand over the spell to the projectile to resolve on collision.
      );

      // The spell gets a timeout after which to spell triggers another stage.
      this.trigger = setTimeout(
        function (proj) {
          proj.speed = 0;
          proj.explode();
        },
        this.duration,
        this.projectile
      );
    }
  
    finish() {}

    // Apply the spell effect to the target.
    // The target can come from the projectile if we want to check for collisions.
    applyEffect(target) {
      if (target == null) return
      target.addSpellEffect(this.effect)
    }
  }
  