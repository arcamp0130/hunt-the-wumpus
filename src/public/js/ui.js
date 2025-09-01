import { gameManager } from "./game.js";
import { graphManager } from "./managers/graph.manager.js";

// Función para actualizar el HTML con el estado actual del juego
function render() {
    const state = gameManager.getGameState(gameManager.game);
    
    // Información básica
    document.getElementById("player-location").textContent = state.playerRoom;
    document.getElementById("arrows-left").textContent = state.arrows;
    document.getElementById("available-rooms").textContent = state.exits.join(", ");
}

gameManager.init();
graphManager.init();

console.log(gameManager.game.alert || "Everything\'s fine")

// create game state
render();

export { render };