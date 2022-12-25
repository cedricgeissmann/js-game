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
            this.currentTick = 0
            this.intervallId = setInterval((self) => {
                object.damageFor({dmg: self.dmg, type: self.type})
                self.currentTick++
                console.log(self.currentTick, self.ticks, self.intervallId)
                if (self.currentTick >= self.ticks) {
                    
                    self.endEffect()
                }
            }, this.interval, this)
        } else {
            object.damageFor({dmg: this.dmg, type: this.type})
        }
    }

    endEffect() {
        console.log("Abort")
        clearInterval(this.intervallId)
    }
}