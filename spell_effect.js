import { intervalForN } from "./utils.js"

export class SpellEffect {
    constructor(props) {
        this.name = props.name
        this.dmg = props.dmg !== null ? props.dmg : 0
        this.ticks = props.ticks !== null ? props.ticks : 0
        this.interval = props.interval !== null ? props.interval : 0

        this.intervallId = null
    }

    handle(object) {
        if (this.ticks > 0) {
            intervalForN((self) => {
                object.damageFor({dmg: self.dmg, type: self.type})
            }, 500, 5, this)
        } else {
            object.damageFor({dmg: this.dmg, type: this.type})
        }
    }
}