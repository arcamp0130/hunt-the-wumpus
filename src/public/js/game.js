//Import dependecies
import ld from "lodash";

//Constants
const ROOMS = 15;
const BATS = 2;
const PITS = 2;
const ARROWS = 3;

//Adjacency list of a dodecahedron
const adjacencyList = [
    [1, 9],       //  0 ==>  1,  9
    [0, 2, 14],   //  1 ==>  0,  2, 14
    [1, 3],       //  2 ==>  1,  3
    [2, 4, 13],   //  3 ==>  2,  4, 13
    [3, 5],       //  4 ==>  3,  5
    [4, 6, 12],   //  5 ==>  4,  6, 12
    [5, 7],       //  6 ==>  5,  7
    [6, 8, 11],   //  7 ==>  6,  8, 11
    [7, 9],       //  8 ==>  7,  9
    [0, 8, 10],   //  9 ==>  0,  8, 10
    [9, 11, 14],  // 10 ==>  9, 11, 14
    [7, 10, 12],  // 11 ==>  7, 10, 12
    [5, 11, 13],  // 12 ==>  5, 11, 13
    [3, 12, 14],  // 13 ==>  3, 12, 14
    [1, 10, 13],  // 14 ==>  1, 10, 13
];

//////////
//HELPERS//
//////////

//TODO Ckeck if are there danger in the room
function isNearby(world, element) {
    return ld.chain(world.player.room[1]) //Get connected rooms
        .map((r) => ld.find(world.cave, (rr) => ld.first(rr) === r)) //Map to the room structure
        .some((r) => ld.includes(r[2], element)) //Check if any of the connected rooms has the element
        .value();
}

//TODO Check specific element in the room
function isInRoom(world, element, room) {
    room = room || world.player.room;
    return ld.includes(room[2], element);
}

//TODO Create the cave with rooms and their connections
function roomIsAdjacent(world, roomId) {
    return ld.includes(world.player.room[1], roomId);
}

//TODO Find a room by its number
function roomById(world, roomId) {
    return ld.find(world.cave, (r) => ld.first(r) === roomId);
}

//TODO Find a free room (used for starting position or bats).
function randomEmptyRoom(world) {
    return ld.sample(ld.filter(world.cave, (r) => ld.isEmpty(r[2]))); // Filter empty rooms and choose one at random
}

//TODO HAZARD (LIST)
function getHazardAsList(world) {
    const list = [];
    ld.forEach(world.cave, (r) => {
        const id = ld.first(r);
        r[2].forEach((haz) => list.push({ type: haz, room: id }));
    });
    return list;
}


//TODO HAZARD (OBJECT)
function getHazardByType(world) {
    const res = { wumpus: null, bats: [], pits: [] };
    ld.forEach(world.cave, (r) => {
        const id = ld.first(r);
        const hazards = r[2];
        if (ld.includes(hazards, "wumpus")) res.wumpus = id;
        if (ld.includes(hazards, "bat")) res.bats.push(id);
        if (ld.includes(hazards, "pit")) res.pits.push(id);
    });
    return res;
}

//TODO HAZARD (ByRoom)
function getHazardByRoom(world) {
    return ld.map(world.cave, (r) => ({ room: ld.first(r), hazards: r[2].slice() }));
}


// Initialize game state
// Room structure: [room number, [connected rooms], [elements in the room]]
// Elements can be "wumpus", "bat", "pit"
function init() {
    // create array [0..14] for 15 rooms
    const cave = ld.chain(ld.range(ROOMS))
        // [room number, [connected rooms], [elements in the room]]
        .map((n) => [n, adjacencyList[n], []])
        .thru((c) => {
            //Add elements to the cave wumpus, bats and pits
            const findEmptyAndAdd = (element) =>
                (ld.sample(ld.filter(c, (r) => ld.isEmpty(r[2])))[2] = [element]);
            findEmptyAndAdd("wumpus");
            ld.times(BATS, ld.partial(findEmptyAndAdd, "bat"));
            ld.times(PITS, ld.partial(findEmptyAndAdd, "pit"));
            return c;
        })
        .value();

    return {
        cave,
        player: {
            room: ld.sample(ld.filter(cave, r => r[2].length === 0)), //Player starts in an empty room
            arrows: ARROWS, //Player starts with 3 arrows
        },
        message: "",
        gameOver: false,
    };
}

/*
    Game actions:

    Are used to update game state
    and return a new game state object.
*/

//Describe current room, including nearby dangers
function describeCurrentRoom(world) {
    const pit = isNearby(world, "pit") ? "\nSientes una brisa fría." : "";
    const wumpus = isNearby(world, "wumpus") ? "\nHueles algo terrible." : "";
    const bat = isNearby(world, "bat") ? "\nEscuchas un aleteo." : "";

    return `Anda con cuidado aventurero ${pit}${wumpus}${bat}`;

    //return `Estás en la habitación ${ld.first(world.player.room)}
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
    if (ld.random(0, 2) > 0) {
        let newWumpusRoom = randomEmptyRoom(world);
        ld.find(world.cave, ld.partial(isInRoom, world, "wumpus"))[2] = [];
        newWumpusRoom[2] = ["wumpus"];
        //The wumpus can be moved to your cavern
        if (ld.isEqual(world.player.room, newWumpusRoom)) {
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
        playerRoom: ld.first(world.player.room),
        exits: world.player.room[1],
        arrows: world.player.arrows,
        gameOver: world.gameOver,
        message: world.message,
    };
}

//////////
//Export//
//////////

export default {
    adjacencyList,
    init,
    describeCurrentRoom,
    movePlayer,
    shootArrow,
    getGameState,
    getHazardAsList,  //Adjacency as List
    getHazardByType,  //Hazard as Object
    getHazardByRoom   //Hazard by room

    /*
      Guide of Use
      getHazardsAsList(world) -> para recorrer o pintar en Cytoscape.
      getHazardsByType(world) -> para saber rápido dónde está cada cosa.
      getHazardsByRoom(world) -> para asociar los peligros directamente a cada nodo.
      */
};
