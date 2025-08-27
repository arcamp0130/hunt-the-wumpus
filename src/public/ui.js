//Import logic game
import { initGame, movePlayer, shootArrow, getGameState } from "./game.js";
// The world is initialized
let world = initGame();
//Show constantly the Game Status
function render() {
  const state = getGameState(world); 
  document.getElementById("player-location").textContent = state.playerRoom;
  document.getElementById("arrows-left").textContent = state.arrows;
  document.getElementById("game-status").textContent = state.message;
  document.getElementById("available-rooms").textContent = state.exits.join(", ");
}

render();

// Expose functions for use with buttons or console
window.movePlayerTo = (roomId) => {
  world = movePlayer(world, roomId);
  render();
};

window.shootArrow = (roomId) => {
  world = shootArrow(world, roomId);
  render();
};
