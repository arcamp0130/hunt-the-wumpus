class InputManager {
    constructor() {
        this.travelBtn = document.querySelector("#travel-btn");
        this.shootBtn = document.querySelector("#shoot-btn");
    }

    init() {
        this.travelBtn.addEventListener("click", (e) => { this.movePlayer(e) });
        this.shootBtn.addEventListener("click", (e) => { this.shootArrow(e) });
    }

    movePlayer(e) {
        // Handling player traveling
        console.log("Moving player!");
    }

    shootArrow(e) {
        // Handling arrow shooting
        console.log("Shooting arrow!");
    }

}

const inputManager = new InputManager();
export { inputManager };