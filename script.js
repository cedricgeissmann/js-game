let dy = 0
let dx = 0
let speed = 0.2

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
        this.x = this.x / len
        this.y = this.y / len
        return this
    }

    scale(val) {
        this.x = this.x * val
        this.y = this.y * val
        return this
    }
}

class Projectile {
    constructor(pos, dir, speed) {
        this.pos = pos
        this.dir = dir.normalize().scale(speed)
        this.projectile = document.createElementNS(NS, "circle")
        this.projectile.setAttribute("cx", pos.x)
        this.projectile.setAttribute("cy", pos.y)
        this.projectile.setAttribute("r", 2)
        this.projectile.setAttribute("fill", "red")
        projectiles.push(this)
        document.querySelector("#game > svg").appendChild(this.projectile)
    }

    updatePosition() {
        this.pos.x = this.pos.x + this.dir.x
        this.pos.y = this.pos.y + this.dir.y
        this.projectile.setAttribute("cx", this.pos.x)
        this.projectile.setAttribute("cy", this.pos.y)

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

    window.requestAnimationFrame(gameLoop)
}

function gameLoop() {
    projectiles.forEach(function(proj) {
        proj.updatePosition()
    })
    const player = $("#player")
    let posX = parseFloat(player.getAttribute("x"))
    let posY = parseFloat(player.getAttribute("y"))
    player.setAttribute("x", posX + dx * speed)
    player.setAttribute("y", posY + dy * speed)
    window.requestAnimationFrame(gameLoop)
}

window.onkeydown = function(ev) {
    if (ev.code === "ArrowRight") {
        dx = 1
    } else if (ev.code === "ArrowLeft") {
        dx = -1
    } else if (ev.code === "ArrowUp") {
        dy = -1
    } else if (ev.code === "ArrowDown") {
        dy = 1
    } else if (ev.code === "Space") {
        let proj = new Projectile(new Vector(50, 50), new Vector(Math.random()-0.5,Math.random()-0.5), 0.2)
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
        dx = 0
    } else if (ev.code === "ArrowUp" || ev.code === "ArrowDown") {
        dy = 0
    }
}