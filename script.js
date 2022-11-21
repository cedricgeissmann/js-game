let speed = 0.2
let player

const WIDTH = 1024
const HEIGHT = 800

const NS = "http://www.w3.org/2000/svg"
const projectiles = []

class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    normalize() {
        let len = this.length()
        if (len > 0) {
        this.x = this.x / len
        this.y = this.y / len
        }
        return this
    }

    scale(val) {
        this.x = this.x * val
        this.y = this.y * val
        return this
    }
}

class GameObject {
    constructor(pos, dir, speed) {
        this.pos = pos
        this.dir = dir.normalize().scale(speed)
        
    }

    updatePosition() {
        this.pos.x = this.pos.x + this.dir.x
        this.pos.y = this.pos.y + this.dir.y
    }
}

class Projectile extends GameObject {
    constructor(pos, dir, speed) {
        super(pos, dir, speed)
        this.projectile = document.createElementNS(NS, "circle")
        this.projectile.setAttribute("cx", pos.x)
        this.projectile.setAttribute("cy", pos.y)
        this.projectile.setAttribute("r", 2)
        this.projectile.setAttribute("fill", "red")
        projectiles.push(this)
        document.querySelector("#game > svg").appendChild(this.projectile)
    }

    updatePosition() {
        super.updatePosition()
        this.projectile.setAttribute("cx", this.pos.x)
        this.projectile.setAttribute("cy", this.pos.y)
    }
}

class Player extends GameObject {
    constructor(pos, dir, speed) {
        super(pos, dir, speed)
        this.obj = document.createElementNS(NS, "circle")
        this.obj.setAttribute("cx", pos.x)
        this.obj.setAttribute("cy", pos.y)
        this.obj.setAttribute("r", 10)
        this.obj.setAttribute("fill", "black")
        document.querySelector("#game > svg").appendChild(this.obj)
    }

    updatePosition() {
        super.updatePosition()
        this.obj.setAttribute("cx", this.pos.x)
        this.obj.setAttribute("cy", this.pos.y)
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
        this.obj.setAttribute("cx", this.pos.x)
        this.obj.setAttribute("cy", this.pos.y)
    }
}


class Spell {
    constructor () {
        this.name = "Sprint"
        this.value = 1
        this.duration = 2000
        this.cooldown = 5
    }

    cast() {

    }

    finish() {

    }
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
    screen.setAttribute("viewBox", `${player.pos.x - WIDTH / 2} ${player.pos.y - HEIGHT / 2} ${WIDTH} ${HEIGHT}`)
    //console.log(player)
    //screen.setAttribute("viewBox", `0 0 100 100`)
    window.requestAnimationFrame(gameLoop)
}

window.onkeydown = function(ev) {
    if (ev.code === "ArrowRight") {
        player.dir.x = 1
    } else if (ev.code === "ArrowLeft") {
        player.dir.x = -1
    } else if (ev.code === "ArrowUp") {
        player.dir.y = -1
    } else if (ev.code === "ArrowDown") {
        player.dir.y = 1
    } else if (ev.code === "Space") {
        let proj = new Projectile(new Vector(player.pos.x, player.pos.y), new Vector(Math.random()-0.5,Math.random()-0.5), 2)
        let spell = new Spell()
        let valBefore = speed
        speed = speed + spell.value
        setTimeout(function() {
            speed = valBefore
        }, spell.duration)
    }
}

window.onkeyup = function(ev) {
    if (ev.code === "ArrowLeft" || ev.code === "ArrowRight") {
        player.dir.x = 0
    } else if (ev.code === "ArrowUp" || ev.code === "ArrowDown") {
        player.dir.y = 0
    }
}

screen.onmousemove = function(ev) {
    pointer.updatePosition(ev)
}