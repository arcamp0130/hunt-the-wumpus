import { gameManager } from "./managers/game.manager.js";
import { graphManager } from "./managers/graph.manager.js";

const messageContainer = document.querySelector(".final-message")

// Updating game information and relevating to player
function update() {
    // Core information for player
    document.getElementById("player-location").textContent = gameManager.game.player.room[0];
    document.getElementById("arrows-left").textContent = gameManager.game.player.arrows;
    document.getElementById("available-rooms").textContent = gameManager.game.player.room[1].join(', ');
    document.getElementById("game-alert").textContent = gameManager.game.alert;

    if (gameManager.game.isOver) {
        messageContainer.style.display = "flex"
        document.getElementById("game-final-message").textContent = gameManager.game.message;
    }
    return;
}

gameManager.init();
graphManager.init();

// create game state
update();

export default { update };