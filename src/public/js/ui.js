import { gameManager } from "./managers/game.manager.js";
import { graphManager } from "./managers/graph.manager.js";
import { inputManager } from "./managers/input.manager.js";

// Starting game by initializing managers and refreshing stats
gameManager.init();
graphManager.init();
inputManager.init();
inputManager.updateStats();