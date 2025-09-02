import ui from "../ui.js";
import { graphManager } from "./graph.manager.js";
import { gameManager } from "./game.manager.js";

class InputManager {
    constructor() {
        this.travelBtn = document.querySelector("#travel-btn");
        this.shootBtn = document.querySelector("#shoot-btn");
    }

    init() {
        this.travelBtn.addEventListener("click", (e) => this.movePlayer(e));
        this.shootBtn.addEventListener("click", (e) => this.shootArrow(e));
    }

    movePlayer(e) {
        if (graphManager.lastTapped !== null)
            gameManager.movePlayer(parseInt(graphManager.lastTapped));

        ui.update();
    }

    shootArrow(e) {
        if (graphManager.lastTapped !== null)
            gameManager.shootArrow(parseInt(graphManager.lastTapped));
        ui.update();
    }

}

const inputManager = new InputManager();
export { inputManager };