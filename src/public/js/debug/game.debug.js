import { gameManager } from "../managers/game.manager.js";
import { graphManager } from "../managers/graph.manager.js";
import { render } from "../ui.js"

/*
Functions and objects to interact
with gameManager via browser console.

TODO:
Remove debug functions in production.
*/

// Exposing gameManager and Cytoscape to browser console
window.world = gameManager;
window.cyto = graphManager.cy;

// Move player to certain room
window.moveTo = (room) => {
    if (!isNaN(room) && room >= 0 && room < 15) {
        gameManager.movePlayer(room);
        render();
    } else {
        alert("Ingresa un número válido de cueva (0-14).");
    }
};

// Shoot arrow to certain room
window.shootTo = (room) => {
    if (!isNaN(room) && room >= 0 && room < 15) {
        gameManager.shootArrow(room);
        render();
    } else {
        alert("Ingresa un número válido de cueva (0-14).");
    }
};