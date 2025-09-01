import * as game from "../game.js";
import { world } from "../ui.js";

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