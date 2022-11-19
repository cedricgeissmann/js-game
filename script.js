let dy = 0
let dx = 0
let speed = 0.2


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