//Version modularizada
import _ from "lodash";

//Constants
const ROOMS = 15;
//const ROOMS_TUNNELS = 3;
const BATS = 2;
const PITS = 2;
const ARROWS = 3;
//const HELP = "`Welcome to Hunt the Wumpus!'";

//Adjacency list of a dodecahedron
const ADJACENCIES = [
  [1, 9], // Room 0 is connected to rooms 1 and 9
  [0, 2, 14], // Room 1 is connected to rooms 0, 2, and 14
  [1, 3], // Room 2 is connected to rooms 1 and 3
  [2, 4, 13], // Room 3 is connected to rooms 2, 3, and 13
  [3, 5], // Room 4 is connected to rooms 3 and 5
  [4, 6, 12], // Room 5 is connected to rooms 4, 6, and 12
  [5, 7], // Room 6 is connected to rooms 5 and 7
  [6, 8, 11], // Room 7 is connected to rooms 6, 8, and 11
  [7, 9], // Room 8 is connected to rooms 7 and 9
  [0, 8, 10], // Room 9 is connected to rooms 0, 8, and 10
  [9, 11, 14], // Room 10 is connected to rooms 9, 11, and 14
  [7, 10, 12], // Room 11 is connected to rooms 7, 10, and 12
  [5, 11, 13], // Room 12 is connected to rooms 5, 11, and 13
  [3, 12, 14], // Room 13 is connected to rooms 3, 12, and 14
  [1, 10, 13], // Room 14 is connected to rooms 1, 10, and 13
];

//////////
//HELPERS//
//////////

//TODOCkeck if are there danger in the room
function isNearby(world, element) {
  return _.chain(world.player.room[1]) //Get connected rooms
    .map((r) => _.find(world.cave, (rr) => _.first(rr) === r)) //Map to the room structure
    .some((r) => _.includes(r[2], element)) //Check if any of the connected rooms has the element
    .value();
}
//TODOCheck specific element in the room
function isInRoom(world, element, room) {
  room = room || world.player.room;
  return _.includes(room[2], element);
}
//TODO Create the cave with rooms and their connections
function roomIsAdjacent(world, roomId) {
  return _.includes(world.player.room[1], roomId);
}

/* // Revisa si una habitación es un túnel válido desde la posición actual del jugador.
function roomIsNearby(world, roomId) {
  // Verifica si el roomId está en los túneles del jugador o es la misma habitación del jugador
  return _.includes(world.player.room[1].concat(_.first(world.player.room)), roomId);
} */

//TODOFind a room by its number
function roomById(world, roomId) {
  return _.find(world.cave, (r) => _.first(r) === roomId);
}

//TODOEncuentra una habitación sin peligros (usado para la posición inicial o para los murciélagos).
function randomEmptyRoom(world) {
  return _.sample(_.filter(world.cave, (r) => _.isEmpty(r[2]))); // Filtra habitaciones vacías y elige una al azar
}

//////////
//Init//
//////////

function initGame() {
  //Estructure of a room:
  const cave = _.chain(_.range(ROOMS)) //Create a cave of 15 interconected rooms
    // [room number, [connected rooms], [elements in the room]]
    .map((n) => [n, ADJACENCIES[n], []]) //Map each room to its connections 0 to 14
    .thru((c) => {
      //Add elements to the cave wumpus, bats and pits
      const findEmptyAndAdd = (element) =>
        (_.sample(_.filter(c, (r) => _.isEmpty(r[2])))[2] = [element]);
      findEmptyAndAdd("wumpus");
      _.times(BATS, _.partial(findEmptyAndAdd, "bat"));
      _.times(PITS, _.partial(findEmptyAndAdd, "pit"));
      return c;
    })
    .value();

  return {
    cave,
    player: {
      room: _.sample(_.filter(cave, (r) => _.isEmpty(r[2]))), //Player starts in an empty room
      arrows: ARROWS, //Player starts with 3 arrows
    },
    gameOver: false,
    message: "Bienenido a caza el Wumpus",
  };
}
//////////////
///ACTIONS////
//////////////

//Describe the current room, including nearby dangers
function describeCurrentRoom(world) {
  const pit = isNearby(world, "pit") ? "\nSientes una brisa fría." : "";
  const wumpus = isNearby(world, "wumpus") ? "\nHueles algo terrible." : "";
  const bat = isNearby(world, "bat") ? "\nEscuchas un aleteo." : "";

  return `Estás en la habitación ${first(world.player.room)}
Salidas hacia: ${world.player.room[1].join(", ")}${pit}${wumpus}${bat}`;
}
//Moves the player to an adjacent room
function movePlayer(world, roomId) {
  //If the target room is not adjacent, return with an error menssage
  if (!roomIsAdjacent(world, roomId)) {
    return { ...world, message: "No puedes ir a esa caverna." };
  }
  //Move player to the new room
  world.player.room = roomById(world, roomId);
  //Chack for danger in the new room
  if (isInRoom(world, "pit")) {
    return {
      ...world,
      gameOver: true,
      message: "Has caído en un pozo y muerto.",
    };
  }
  if (isInRoom(world, "wumpus")) {
    return { ...world, gameOver: true, message: "El Wumpus te ha comido!" };
  }
  if (isInRoom(world, "bat")) {
    world.player.room = randomEmptyRoom(world);
    return { ...world, message: "Un murciélago te llevó a otra caverna." };
  }

  return { ...world, message: describeCurrentRoom(world) };
}

function shootArrow(world, roomId) {
  if (!roomIsAdjacent(world, roomId)) {
    return { ...world, message: "No puedes disparar a esa caverna." };
  }

  if (isInRoom(world, "wumpus", roomById(world, roomId))) {
    return {
      ...world,
      gameOver: true,
      message: "¡Has matado al Wumpus! Eres un héroe!",
    };
  }

  world.player.arrows--;
  if (world.player.arrows <= 0) {
    return {
      ...world,
      gameOver: true,
      message: "Te has quedado sin flechas. Fin del juego!",
    };
  }

  // El Wumpus se mueve con probabilidad
  if (_.random(0, 2) > 0) {
    let newWumpusRoom = randomEmptyRoom(world);
    find(world.cave, partial(isInRoom, world, "wumpus"))[2] = [];
    newWumpusRoom[2] = ["wumpus"];
    if (isEqual(world.player.room, newWumpusRoom)) {
      return {
        ...world,
        gameOver: true,
        message: "El Wumpus se mudó a tu caverna y te comió!",
      };
    }
  }

  return {
    ...world,
    message: "Fallaste. Escuchaste un rugido en la distancia.",
  };
}

function getGameState(world) {
  return {
    playerRoom: first(world.player.room),
    exits: world.player.room[1],
    arrows: world.player.arrows,
    gameOver: world.gameOver,
    message: world.message,
  };
}

//////////
//Export//
//////////

export { initGame, describeCurrentRoom, movePlayer, shootArrow, getGameState };
