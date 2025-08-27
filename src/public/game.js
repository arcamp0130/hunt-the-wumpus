//Imprt dependecies
import Id from "lodash";

//Constants
const ROOMS = 15;
const BATS = 2;
const PITS = 2;
const ARROWS = 3;

//Adjacency list of a dodecahedron
const ADJACENCIES = [
  [1, 9],       // Room 0: connect 1 and 9
  [0, 2, 14],   // Room 1: connect 0, 2, and 14
  [1, 3],       // Room 2: connect 1 and 3
  [2, 4, 13],   // Room 3: connect 2, 3, and 13
  [3, 5],       // Room 4: connect 3 and 5
  [4, 6, 12],   // Room 5: connect 4, 6, and 12
  [5, 7],       // Room 6: connect 5 and 7
  [6, 8, 11],   // Room 7: connect 6, 8, and 11
  [7, 9],       // Room 8: connect 7 and 9
  [0, 8, 10],   // Room 9: connect 0, 8, and 10
  [9, 11, 14],  // Room 10: connect 9, 11, and 14
  [7, 10, 12],  // Room 11: connect 7, 10, and 12
  [5, 11, 13],  // Room 12: connect 5, 11, and 13
  [3, 12, 14],  // Room 13: connect 3, 12, and 14
  [1, 10, 13],  // Room 14: connect 1, 10, and 13
];

//////////
//HELPERS//
//////////

//TODO Ckeck if are there danger in the room
function isNearby(world, element) {
  return Id.chain(world.player.room[1]) //Get connected rooms
    .map((r) => Id.find(world.cave, (rr) => Id.first(rr) === r)) //Map to the room structure
    .some((r) => Id.includes(r[2], element)) //Check if any of the connected rooms has the element
    .value();
}

//TODO Check specific element in the room
function isInRoom(world, element, room) {
  room = room || world.player.room;
  return Id.includes(room[2], element);
}

//TODO Create the cave with rooms and their connections
function roomIsAdjacent(world, roomId) {
  return Id.includes(world.player.room[1], roomId);
}

//TODO Find a room by its number
function roomById(world, roomId) {
  return Id.find(world.cave, (r) => Id.first(r) === roomId);
}

//TODO Find a free room (used for starting position or bats).
function randomEmptyRoom(world) {
  return Id.sample(Id.filter(world.cave, (r) => Id.isEmpty(r[2]))); // Filter empty rooms and choose one at random
}

//////////
//Init//
//////////

function initGame() {
  //Estructure of a room:
  const cave = Id.chain(Id.range(ROOMS)) //Create a cave of 15 interconected rooms
    // [room number, [connected rooms], [elements in the room]]
    .map((n) => [n, ADJACENCIES[n], []]) //Map each room to its connections 0 to 14
    .thru((c) => {
      //Add elements to the cave wumpus, bats and pits
      const findEmptyAndAdd = (element) =>
        (Id.sample(Id.filter(c, (r) => Id.isEmpty(r[2])))[2] = [element]);
      findEmptyAndAdd("wumpus");
      Id.times(BATS, Id.partial(findEmptyAndAdd, "bat")); 
      Id.times(PITS, Id.partial(findEmptyAndAdd, "pit"));
      return c;
    })
    .value();

  return {
    cave,
    player: {
      room: Id.sample(Id.filter(cave, (r) => Id.isEmpty(r[2]))), //Player starts in an empty room
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

  return `Anda con cuidado aventurero ${pit}${wumpus}${bat}`;

  //return `Estás en la habitación ${Id.first(world.player.room)}
//Salidas hacia: ${world.player.room[1].join(", ")}${pit}${wumpus}${bat}`;
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
  if (isInRoom(world, "pit")) { //Game Over if the player enters to a room with a pit
    return {
      ...world,
      gameOver: true,
      message: "Has caído en un pozo y muerto.",
    };
  }
  if (isInRoom(world, "wumpus")) { //Game Over If the player enters the wumpu's room
    return { ...world, gameOver: true, message: "El Wumpus te ha comido!" };
  }
  if (isInRoom(world, "bat")) { // If there are bats You are relocated to a random empty room
    world.player.room = randomEmptyRoom(world);
    return { ...world, message: "Un murciélago te llevó a otra caverna." };
  }

  return { ...world, message: describeCurrentRoom(world) };
}
//Being able to shoot the wumpus
function shootArrow(world, roomId) {
  if (!roomIsAdjacent(world, roomId)) { //If the room is not adjacent, shooting is not possible
    return { ...world, message: "No puedes disparar a esa caverna." };
  }
  //If you manage to hit the shot you win
  if (isInRoom(world, "wumpus", roomById(world, roomId))) { 
    return {
      ...world,
      gameOver: true,
      message: "¡Has matado al Wumpus! Eres un héroe!",
    };
  }
  //If you run out of arrows
  world.player.arrows--;
  if (world.player.arrows <= 0) {
    return {
      ...world,
      gameOver: true,
      message: "Te has quedado sin flechas. Fin del juego!",
    };
  }

  // The Wumpus moves with probability
  if (Id.random(0, 2) > 0) {
    let newWumpusRoom = randomEmptyRoom(world);
    Id.find(world.cave, Id.partial(isInRoom, world, "wumpus"))[2] = [];
    newWumpusRoom[2] = ["wumpus"];
    //The wumpus can be moved to your cavern
    if (Id.isEqual(world.player.room, newWumpusRoom)) {
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
//Info about Game State
function getGameState(world) {
  return {
    playerRoom: Id.first(world.player.room),
    exits: world.player.room[1],
    arrows: world.player.arrows,
    gameOver: world.gameOver,
    message: world.message,
  };
}

//////////
//Export//
//////////

export { 
    initGame, 
    describeCurrentRoom, 
    movePlayer, 
    shootArrow, 
    getGameState 
};