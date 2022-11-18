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
    let posY = parseFloat(player.getAttribute("y"))
    player.setAttribute("y", posY + 1)
    window.requestAnimationFrame(gameLoop)
}