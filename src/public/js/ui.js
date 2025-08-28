// Import logic game
import {
  initGame,
  movePlayer,
  shootArrow,
  getGameState,
  getAdjacencyList,
  getHazardAsList,
  getHazardByType,
  getHazardByRoom,
  describeCurrentRoom
} from "./game.js";

// Inicializar el mundo
let world = initGame();

// Exponer world para depuración en consola
window.world = world;
world.message = `Bienvenido. ${describeCurrentRoom(world)}`;

// Función para actualizar el HTML con el estado actual del juego
function render() {
  const state = getGameState(world);

  // Información básica
  document.getElementById("player-location").textContent = state.playerRoom;
  document.getElementById("arrows-left").textContent = state.arrows;
  document.getElementById("available-rooms").textContent = state.exits.join(", ");
}

// Render inicial
render();

/////////////////////////////
// Funciones expuestas al global (window)
/////////////////////////////

// Mover jugador a la cueva del input
window.movePlayerTo = () => {
  const roomId = Number(document.getElementById("room-input").value);
  if (!isNaN(roomId)) {
    world = movePlayer(world, roomId);
    render();
  } else {
    alert("Ingresa un número válido de cueva (0-14).");
  }
};

// Disparar flecha a la cueva del input
window.shootArrow = () => {
  const roomId = Number(document.getElementById("room-input").value);
  if (!isNaN(roomId)) {
    world = shootArrow(world, roomId);
    render();
  } else {
    alert("Ingresa un número válido de cueva (0-14).");
  }
};

// Exponer helpers al global
window.getAdjacencyList = () => getAdjacencyList();
window.getHazardAsList = () => getHazardAsList(world);
window.getHazardByType = () => getHazardByType(world);
window.getHazardByRoom = () => getHazardByRoom(world);

console.log("state", getGameState(world));
