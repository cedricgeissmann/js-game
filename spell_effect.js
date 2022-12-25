export class SpellEffect {
    constructor(props) {
        this.name = props.name
        this.dmg = props.dmg !== null ? props.dmg : 0
    }

    handle(object) {
        object.damageFor({
            dmg: this.dmg,
            type: "magic"
        })
    }
}