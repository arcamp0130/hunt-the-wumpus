import { gameManager } from "./managers/game.manager.js";
import { graphManager } from "./managers/graph.manager.js";

// Updating game information and relevating to player
function update() {
    // Core information for player
    document.getElementById("player-location").textContent = gameManager.game.player.room[0];
    document.getElementById("arrows-left").textContent = gameManager.game.player.arrows;
    document.getElementById("available-rooms").textContent = gameManager.game.player.room[1].join(', ');
    document.getElementById("game-alert").textContent = gameManager.game.alert;
    return;
}

gameManager.init();
graphManager.init();

console.log(gameManager.game.alert || "Everything\'s fine")

// create game state
update();

export default { update };