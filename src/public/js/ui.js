import * as game from "./game.js";

// Función para actualizar el HTML con el estado actual del juego
function render() {
    const state = game.getGameState(world);
    
    // Información básica
    document.getElementById("player-location").textContent = state.playerRoom;
    document.getElementById("arrows-left").textContent = state.arrows;
    document.getElementById("available-rooms").textContent = state.exits.join(", ");
}

let world = game.init();

// create game state
render();

export { world };