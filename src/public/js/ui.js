import game from "./game.js";

let world = game.init();

// Función para actualizar el HTML con el estado actual del juego
function render() {
    const state = game.getGameState(world);

    // Información básica
    document.getElementById("player-location").textContent = state.playerRoom;
    document.getElementById("arrows-left").textContent = state.arrows;
    document.getElementById("available-rooms").textContent = state.exits.join(", ");
}

// create game state
render();

/*
Functions and objects to interact
with game via browser console.

TODO:
Remove debug functions in production.
*/

// Expose game world
window.world = world;

// Expose ./game.js functions for debugging
window.getHazardAsList = () => game.getHazardAsList(world);
window.getHazardByType = () => game.getHazardByType(world);
window.getHazardByRoom = () => game.getHazardByRoom(world);

// Move player to certain room
window.moveTo = (room) => {
    if (!isNaN(room) && room >= 0 && room < 15) {
        world = game.movePlayer(world, room);
        render();
    } else {
        alert("Ingresa un número válido de cueva (0-14).");
    }
};

// Shoot arrow to certain room
window.shootTo = (room) => {
    if (!isNaN(room) && room >= 0 && room < 15) {
        world = game.shootArrow(world, room);
        render();
    } else {
        alert("Ingresa un número válido de cueva (0-14).");
    }
};