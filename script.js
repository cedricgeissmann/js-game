import { Vector, Input } from "./utils.js"

let speed = 0.2
let player

const WIDTH = 1024
const HEIGHT = 800

const NS = "http://www.w3.org/2000/svg"
const PROJECTILES = []
const ITEMS = {}
let ITEMS_LAST_ID = 0
const CAMERA_CENTER = new Vector(0, 0)
const INPUT = new Input()
let PAUSE = true



class GameObject {
    constructor(pos) {
        this.pos = pos
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

        this.projectile = document.createElementNS(NS, "circle")
        this.projectile.setAttribute("cx", pos.x)
        this.projectile.setAttribute("cy", pos.y)
        this.projectile.setAttribute("r", this.radius)
        this.projectile.setAttribute("fill", "red")
        PROJECTILES.push(this)
        screen.appendChild(this.projectile)
    }

    updatePosition() {
        this.pos = this.pos.add(this.dir)
        if (this.radiusGrowth !== 0) {
            this.radius = this.radius + this.radiusGrowth
            this.projectile.setAttribute("r", this.radius)
        }

        updateCirclePosition(this.projectile, this.pos)
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
        screen.removeChild(this.projectile)
        //delete(this)
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
        this.obj = document.createElementNS(NS, "rect")
        this.obj.setAttribute("x", pos.x)
        this.obj.setAttribute("y", pos.y)
        this.obj.setAttribute("width", 20)
        this.obj.setAttribute("height", 20)
        this.obj.setAttribute("fill", "blue")
        this.obj.setAttribute("class", "item")
        screen.appendChild(this.obj)

        this.id = ITEMS_LAST_ID++

        ITEMS[this.id] = this
    }
}

class Player extends GameObject {
    constructor(pos) {
        super(pos)
        this.speed = 2
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
        updateCirclePosition(this.obj, this.pos)
        this.orient = this.pos.diff(pointer.pos).normalize().scale(20)
        updateCirclePosition(this.orientetion, this.pos.add(this.orient))

        this.checkCollision()
    }

    checkCollision() {
        Object.values(ITEMS).forEach((item) => {
            if (checkIntersection(this.obj.getBBox(), item.obj.getBBox())) {
                this.pickUp(item)
                screen.removeChild(item.obj)
                delete ITEMS[item.id]
            }
        })

    }

    pickUp(item) {
        console.log("Implement pick up: ", item)
    }

    destroy() {
        screen.removeChild(this.obj)
        screen.removeChild(this.orientetion)
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
        this.duration = 5000
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

function updateCirclePosition(circ, pos) {
    circ.setAttribute("cx", pos.x)
    circ.setAttribute("cy", pos.y)
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

const screen = document.querySelector("#game-screen")
const pointer = new Pointer()

function gameLoop() {
    PROJECTILES.forEach(function(proj) {
        proj.updatePosition()
        proj.checkCollision()
    })
    player.updatePosition()


    // center camera on player
    CAMERA_CENTER.x = player.pos.x - WIDTH / 2
    CAMERA_CENTER.y = player.pos.y - HEIGHT / 2
    screen.setAttribute("viewBox", `${CAMERA_CENTER.x} ${CAMERA_CENTER.y} ${WIDTH} ${HEIGHT}`)
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
    pointer.updatePosition(ev)
    let spell = new Spell()
    spell.cast()
}

screen.onmousemove = function(ev) {
    pointer.updatePosition(ev)
}

$("#new-game-btn").addEventListener("click", newGame)
$("#resume-game-btn").addEventListener("click", resumeGame)