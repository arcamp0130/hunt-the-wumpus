import { graphManager } from "./graph.manager.js";
import { gameManager } from "./game.manager.js";

class InputManager {
    constructor() {
        this.travelBtn = document.querySelector("#travel-btn");
        this.shootBtn = document.querySelector("#shoot-btn");
        this.holders = {
            playerLocation: document.querySelector("#player-location"),
            arrowsLeft: document.querySelector("#arrows-left"),
            availableRooms: document.querySelector("#available-rooms"),
            gameAlert: document.querySelector("#game-alert"),
            gameFinalMessage: document.querySelector("#game-final-message"),
            messageContainer: document.querySelector(".final-message")
        }
    }

    init() {
        this.travelBtn.addEventListener("click", (e) => this.movePlayer(e));
        this.shootBtn.addEventListener("click", (e) => this.shootArrow(e));
    }

    movePlayer(e) {
        if (graphManager.lastTapped !== null)
            gameManager.movePlayer(parseInt(graphManager.lastTapped));
        this.updateStats();
    }

    shootArrow(e) {
        if (graphManager.lastTapped !== null)
            gameManager.shootArrow(parseInt(graphManager.lastTapped));
        this.updateStats();
    }

    updateStats() {
        inputManager.holders.playerLocation.textContent = gameManager.game.player.room[0];
        inputManager.holders.arrowsLeft.textContent = gameManager.game.player.arrows;
        inputManager.holders.availableRooms.textContent = gameManager.game.player.room[1].join(', ');
        inputManager.holders.gameAlert.textContent = gameManager.game.alert;

        if (gameManager.game.isOver) {
            inputManager.holders.messageContainer.style.display = "flex"
            inputManager.holders.gameFinalMessage.textContent = gameManager.game.message;
            inputManager.shootBtn.disabled = true;
            inputManager.travelBtn.disabled = true;
        }
        return;
    }

}

const inputManager = new InputManager();
export { inputManager };