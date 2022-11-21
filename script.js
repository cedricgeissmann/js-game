import { Vector } from "./utils.js"

let speed = 0.2
let player

const WIDTH = 1024
const HEIGHT = 800

const NS = "http://www.w3.org/2000/svg"
const projectiles = []
const CAMERA_CENTER = new Vector(0, 0)



class GameObject {
    constructor(pos, dir, speed) {
        this.speed = speed
        this.pos = pos
        this.dir = dir.normalize()
    }

    updatePosition() {
        this.pos.x = this.pos.x + this.dir.x * this.speed
        this.pos.y = this.pos.y + this.dir.y * this.speed
    }
}

class Projectile extends GameObject {
    constructor(pos, dir, speed) {
        super(pos, dir, speed)

        this.radiusGrowth = 0
        this.radius = 2

        this.projectile = document.createElementNS(NS, "circle")
        this.projectile.setAttribute("cx", pos.x)
        this.projectile.setAttribute("cy", pos.y)
        this.projectile.setAttribute("r", this.radius)
        this.projectile.setAttribute("fill", "red")
        projectiles.push(this)
        screen.appendChild(this.projectile)
    }

    updatePosition() {
        super.updatePosition()

        if (this.radiusGrowth !== 0) {
            this.radius = this.radius + this.radiusGrowth
            this.projectile.setAttribute("r", this.radius)
        }

        updateCirclePosition(this.projectile, this.pos)
    }

    explode() {
        this.radiusGrowth = 3
        setTimeout(function(proj) {
            proj.destroy()
        }, 200, this)
    }

    destroy() {
        screen.removeChild(this.projectile)
        delete this
    }
}

class Player extends GameObject {
    constructor(pos, dir, speed) {
        super(pos, dir, speed)
        this.orient = new Vector(0, 0)
        this.obj = document.createElementNS(NS, "circle")
        this.obj.setAttribute("cx", pos.x)
        this.obj.setAttribute("cy", pos.y)
        this.obj.setAttribute("r", 10)
        this.obj.setAttribute("fill", "black")
        screen.appendChild(this.obj)

        this.orientetion = document.createElementNS(NS, "circle")
        this.orientetion.setAttribute("r", 5)
        this.orientetion.setAttribute("fill", "black")
        screen.appendChild(this.orientetion)
    }

    updatePosition() {
        super.updatePosition()
        updateCirclePosition(this.obj, this.pos)
        this.orient = this.pos.diff(pointer.pos).normalize().scale(20)
        updateCirclePosition(this.orientetion, this.pos.add(this.orient))
    }
}

class Pointer {
    constructor() {
        this.pos = new Vector(0, 0)
        this.obj = document.createElementNS(NS, "circle")
        this.obj.setAttribute("cx", 0)
        this.obj.setAttribute("cy", 0)
        this.obj.setAttribute("r", 5)
        this.obj.setAttribute("fill", "red")
        document.querySelector("#game > svg").appendChild(this.obj)
    }

    updatePosition(ev) {
        this.pos.x = ev.offsetX / screen.clientWidth * WIDTH + (player.pos.x - WIDTH / 2)
        this.pos.y = ev.offsetY / screen.clientHeight * HEIGHT + (player.pos.y - HEIGHT / 2)
        updateCirclePosition(this.obj, this.pos)
    }
}


class Spell {
    constructor () {
        this.name = "Fireball"
        this.value = 1
        this.duration = 2000
        this.cooldown = 5
    }

    cast() {
        this.projectile = new Projectile(player.pos.copy(), player.orient, 2)
        setTimeout(function(proj) {
            proj.speed = 0
            proj.explode()
        }, this.duration, this.projectile)
    }

    finish() {

    }
}

function updateCirclePosition(circ, pos) {
    circ.setAttribute("cx", pos.x)
    circ.setAttribute("cy", pos.y)
}

function $(selector) {
    return document.querySelector(selector)
}

function newGame() {
    const menu = document.querySelector("#menu")
    const game = document.querySelector("#game")
    menu.style.display = "none"
    game.style.display = "block"

    player = new Player(new Vector(50, 50), new Vector(0, 0), 1)

    window.requestAnimationFrame(gameLoop)
}

const screen = document.querySelector("#game-screen")
const pointer = new Pointer()

function gameLoop() {
    projectiles.forEach(function(proj) {
        proj.updatePosition()
    })
    player.updatePosition()

    // center camera on player
    CAMERA_CENTER.x = player.pos.x - WIDTH / 2
    CAMERA_CENTER.y = player.pos.y - HEIGHT / 2
    screen.setAttribute("viewBox", `${CAMERA_CENTER.x} ${CAMERA_CENTER.y} ${WIDTH} ${HEIGHT}`)

    window.requestAnimationFrame(gameLoop)
}

window.onkeydown = function(ev) {
    if (ev.key === "d") {
        player.dir.x = 1
    } else if (ev.key === "a") {
        player.dir.x = -1
    } else if (ev.key === "w") {
        player.dir.y = -1
    } else if (ev.key === "s") {
        player.dir.y = 1
    } else if (ev.code === "Space") {
        //let proj = new Projectile(new Vector(player.pos.x, player.pos.y), player.orient, 2)
        let spell = new Spell()
        spell.cast()
        let valBefore = speed
        speed = speed + spell.value
        setTimeout(function() {
            speed = valBefore
        }, spell.duration)
    }
}

window.onkeyup = function(ev) {
    if (ev.key === "a" || ev.key === "d") {
        player.dir.x = 0
    } else if (ev.key === "w" || ev.key === "s") {
        player.dir.y = 0
    }
}

screen.onmousemove = function(ev) {
    pointer.updatePosition(ev)
}

$("#new-game-btn").addEventListener("click", newGame)