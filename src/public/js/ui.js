// Import logic game
import {
  initGame,
  movePlayer,
  shootArrow,
  getGameState,
  getAdjacencyList,
  getHazardAsList,
  getHazardByType,
  getHazardByRoom
} from "./game.js";

// Inicializar el mundo
let world = initGame();

// Exponer world para depuración en consola
window.world = world;

// Función para actualizar el HTML con el estado actual del juego
function render() {
  const state = getGameState(world);

  // Información básica
  document.getElementById("player-location").textContent = state.playerRoom;
  document.getElementById("arrows-left").textContent = state.arrows;
  document.getElementById("game-status").textContent = state.message;
  document.getElementById("available-rooms").textContent = state.exits.join(", ");

  // Debug extra (Hazards y adyacencia)
  // document.getElementById("hazard-list").textContent = JSON.stringify(getHazardAsList(world), null, 2);
  // document.getElementById("hazard-type").textContent = JSON.stringify(getHazardByType(world), null, 2);
  // document.getElementById("hazard-room").textContent = JSON.stringify(getHazardByRoom(world), null, 2);
  // document.getElementById("adjacency-list").textContent = JSON.stringify(getAdjacencyList(), null, 2);
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
