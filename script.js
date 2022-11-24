import { Vector, Input, Pointer, Rectangle } from "./utils.js"

let speed = 0.2
let player

const TILE_SIZE = 16
const WIDTH = 20 * TILE_SIZE
const HEIGHT = 15 * TILE_SIZE

const NS = "http://www.w3.org/2000/svg"
const PROJECTILES = new Set()
const ITEMS = new Set()
const CAMERA_CENTER = new Vector(0, 0)
const INPUT = new Input()
let PAUSE = true

const screen = document.querySelector("#game-screen")
screen.width = WIDTH
screen.height = HEIGHT
const ctx = screen.getContext("2d")
const pointer = new Pointer()

class SpriteSheet {
    constructor({url}) {
        this.url = url
        this.img = new Image()
        this.img.src = this.url
        this.tot = 3
        this.animPos = 0
        this.frameCount = 0
        this.animType = 0
    }

    draw(ctx, pos) {
        ctx.drawImage(this.img, TILE_SIZE*this.animPos, TILE_SIZE*this.animType, TILE_SIZE, TILE_SIZE, pos.x, pos.y, TILE_SIZE, TILE_SIZE)
        this.frameCount++
        if (this.frameCount > 10) {
            this.animPos = (this.animPos + 1) % this.tot
            this.frameCount = 0
        }
    }
}


class GameObject {
    constructor(pos) {
        this.pos = pos
    }

    getBBox() {
        return new Rectangle(this.pos.x, this.pos.y, TILE_SIZE, TILE_SIZE)
    }
}

class Projectile extends GameObject {
    constructor(pos, dir, speed) {
        super(pos)
        this.dir = dir.normalize().scale(speed)
        this.speed = speed

        this.radiusGrowth = 0
        this.radius = 2
        this.trigger = null

        PROJECTILES.add(this)
    }

    draw(ctx) {
        ctx.fillStyle = "red"
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI*2)
        ctx.fill()
    }

    updatePosition() {
        this.pos = this.pos.add(this.dir)
        if (this.radiusGrowth !== 0) {
            this.radius = this.radius + this.radiusGrowth
        }
    }

    fire(duration) {
        this.trigger = setTimeout(function(proj) {
            proj.speed = 0
            proj.explode()
        }, duration, this)
    }

    explode() {
        this.radiusGrowth = 3
        setTimeout(function(proj) {
            proj.destroy()
        }, 200, this)
    }

    destroy() {
        PROJECTILES.delete(this)
    }

    checkCollision() {
        $$(".can-collide").forEach((elem) => {
            checkIntersection(this.projectile.getBBox(), elem.getBBox())
            if (checkIntersection(this.projectile.getBBox(), elem.getBBox())) {
                clearTimeout(this.trigger)
                if (this.radiusGrowth === 0) {
                    this.explode()
                }
            }
        })
    }
}

class Item extends GameObject {
    constructor(pos) {
        super(pos)
        ITEMS.add(this)
    }

    draw(ctx) {
        ctx.fillStyle = "blue"
        ctx.fillRect(this.pos.x, this.pos.y, 20, 20)
    }

    destroy() {
        ITEMS.delete(this)
    }
}

class Player extends GameObject {
    constructor(pos) {
        super(pos)
        this.speed = 2
        this.orient = new Vector(0, 0)

        this.sprite = new SpriteSheet({url: "res/player.png"})
    }

    updatePosition() {
        this.dir = INPUT.getDirection().normalize().scale(this.speed)
        let dirBefore = this.dir.copy()


        $$(".can-collide").forEach((obstacle) => {
            let rect1 = this.obj.getBBox()
            let rect2 = obstacle.getBBox()

            let diag1 = new Vector(rect1.width, rect1.height)
            let diag2 = new Vector(rect2.width, rect2.height)
            let p1 = new Vector(rect1.x, rect1.y).add(this.dir)
            let p2 = new Vector(rect2.x, rect2.y)

            let dist = p1.diff(p2)

            if (dist.length() <= diag1.length()) {
                //console.log(dist)
                this.dir = this.dir.add(dist.neg().normalize().scale(2))
            }
        })

        this.pos = this.pos.add(this.dir)
        this.orient = this.pos.diff(pointer.pos).normalize().scale(20)

        this.checkCollision()
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.pos.x + this.orient.x + 10,
            this.pos.y + this.orient.y + 10,
            2, 0, Math.PI*2)
        ctx.fill()
        this.sprite.draw(ctx, this.pos)
    }

    checkCollision() {
        ITEMS.forEach((item) => {
            if (checkIntersection(this.getBBox(), item.getBBox())) {
                this.pickUp(item)
                ITEMS.delete(item)
            }
        })

    }

    pickUp(item) {
        console.log("Implement pick up: ", item)
    }

    destroy() {
        delete this
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
        this.projectile.fire(this.duration)
    }

    finish() {

    }
}

function checkIntersection(rect1, rect2) {
    if (rect2.x - rect1.x < rect1.width && rect2.x + rect2.width - rect1.x > 0) {
        if (rect2.y - rect1.y < rect1.height && rect2.y + rect2.height - rect1.y > 0) {
            return true
        }
    }
    return false
}

function $(selector) {
    return document.querySelector(selector)
}

function $$(selector) {
    return document.querySelectorAll(selector)
}

function newGame() {
    const menu = document.querySelector("#menu")
    const game = document.querySelector("#game")
    menu.style.display = "none"
    game.style.display = "block"

    if (player != null) {
        player.destroy()
    }

    player = new Player(new Vector(0, 0))
    new Item(new Vector(100, 50))
    PAUSE = false
    window.requestAnimationFrame(gameLoop)
}

function resumeGame() {
    const menu = document.querySelector("#menu")
    const game = document.querySelector("#game")
    menu.style.display = "none"
    game.style.display = "block"
    PAUSE = false
    window.requestAnimationFrame(gameLoop)
}

function showMenu() {
    const menu = document.querySelector("#menu")
    const game = document.querySelector("#game")
    menu.style.display = "block"
    game.style.display = "none"
    PAUSE = true
}



function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    pointer.draw(ctx)

    PROJECTILES.forEach(function(proj) {
         proj.updatePosition()
         proj.checkCollision()
         proj.draw(ctx)
    })
    ITEMS.forEach(function(item) {
        item.draw(ctx)
    })
    player.updatePosition()
    player.draw(ctx)


    // // center camera on player
    // CAMERA_CENTER.x = player.pos.x - WIDTH / 2
    // CAMERA_CENTER.y = player.pos.y - HEIGHT / 2
    // screen.setAttribute("viewBox", `${CAMERA_CENTER.x} ${CAMERA_CENTER.y} ${WIDTH} ${HEIGHT}`)
    if (!PAUSE) {
        window.requestAnimationFrame(gameLoop)
    }
}

window.onkeydown = function(ev) {
    if (ev.key === "d") {
        INPUT.right = 1
    } else if (ev.key === "a") {
        INPUT.left = 1
    } else if (ev.key === "w") {
        INPUT.up = 1
    } else if (ev.key === "s") {
        INPUT.down = 1
    } else if (ev.code === "Space") {
        
    } else if (ev.code === "Escape") {
        showMenu()
    }
}

window.onkeyup = function(ev) {
    if (ev.key === "d") {
        INPUT.right = 0
    } else if (ev.key === "a") {
        INPUT.left = 0
    } else if (ev.key === "w") {
        INPUT.up = 0
    } else if (ev.key === "s") {
        INPUT.down = 0
    }
}

screen.onmousedown = function(ev) {
    pointer.updatePosition(ev, ctx)
    let spell = new Spell()
    spell.cast()
}

screen.onmousemove = function(ev) {
    pointer.updatePosition(ev, ctx)
}

$("#new-game-btn").addEventListener("click", newGame)
$("#resume-game-btn").addEventListener("click", resumeGame)