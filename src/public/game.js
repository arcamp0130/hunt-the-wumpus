const _ = require('lodash');
//Lodash import
//Import all lodash functions to the main 

_.each(_.keys(_), k => global[k === 'isNaN' ? '_isNaN' : k] = _[k]);

//Constants
const ROOMS = 15;
const ROOMS_TUNNELS = 3;
const BATS = 2;
const PITS = 2;
const ARROWS = 3;
const HELP = "`Welcome to Hunt the Wumpus!'";

//Adjacency list of a dodecahedron
const ADJACENCIES = [
    [1, 9],         // Room 0 is connected to rooms 1 and 9
    [0, 2, 14],     // Room 1 is connected to rooms 0, 2, and 14
    [1, 3],         // Room 2 is connected to rooms 1 and 3
    [2, 4, 13],     // Room 3 is connected to rooms 2, 3, and 13
    [3, 5],         // Room 4 is connected to rooms 3 and 5
    [4, 6, 12],     // Room 5 is connected to rooms 4, 6, and 12
    [5, 7],         // Room 6 is connected to rooms 5 and 7
    [6, 8, 11],     // Room 7 is connected to rooms 6, 8, and 11
    [7, 9],         // Room 8 is connected to rooms 7 and 9
    [0, 8, 10],     // Room 9 is connected to rooms 0, 8, and 10
    [9, 11, 14],    // Room 10 is connected to rooms 9, 11, and 14
    [7, 10, 12],    // Room 11 is connected to rooms 7, 10, and 12
    [5, 11, 13],    // Room 12 is connected to rooms 5, 11, and 13
    [3, 12, 14],    // Room 13 is connected to rooms 3, 12, and 14
    [1, 10, 13]     // Room 14 is connected to rooms 1, 10, and 13
];
//Estructure of a room:
const cave = chain(range(ROOMS)) //Create a cave of 15 interconected rooms
    // [room number, [connected rooms], [elements in the room]]
    .map(n => [n, ADJACENCIES[n], []]) //Map each room to its connections 0 to 14
    .thru(c => {
        //Add elements to the cave wumpus, bats and pits
        const findEmptyAndAdd = (element) => sample(filter(c, r => isEmpty(r[2])))[2] = [element];
        findEmptyAndAdd('wumpus');
        times(BATS, partial(findEmptyAndAdd, 'bat'));
        times(PITS, partial(findEmptyAndAdd, 'pit'));
        return c;
    })
    .value();
//Starting world
let world = {
    cave: cave, 
    player: {
        room: sample(filter(cave, r => isEmpty(r[2]))), //Player starts in an empty room
        arrows: ARROWS //Player starts with 3 arrows
    }
};

//////////
//HELPERS//
//////////

//Ckeck if are there danger in the room
function isNearby(world, element){
    return chain(world.player.room[1]) //Get connected rooms
        .map(r => find(world.cave, rr => first(rr) === r)) //Map to the room structure
        .some(r => includes(r[2], element)) //Check if any of the connected rooms has the element
        .value();
}
//Check specific element in the room
function isInRoom(world, element, room){
    room = room || world.player.room;
    return includes(room[2], element);
}

// Revisa si una habitación es un túnel válido desde la posición actual del jugador.
function roomIsNearby(world, roomId) {
  // Verifica si el roomId está en los túneles del jugador o es la misma habitación del jugador
  return includes(world.player.room[1].concat(first(world.player.room)), roomId);
}

//Find a room by its number
function roomById(world, roomId){
    return find(world.cave, r => first(r) === roomId);
}

// Encuentra una habitación sin peligros (usado para la posición inicial o para los murciélagos).
function randomEmptyRoom(world) {
  return sample(filter(world.cave, r => isEmpty(r[2]))); // Filtra habitaciones vacías y elige una al azar
}

//////////////
//ACTIONS////
//////////////

//Describe the current room, including nearby dangers
function describeCurrentRoom(world) {
  const pit    = isNearby(world, 'pit')    ? '\nSientes una brisa fría proveniente de una caverna cercana.' : '',
        wumpus = isNearby(world, 'wumpus') ? '\nHueles algo terrible cerca.' : '',
        bat    = isNearby(world, 'bat')    ? '\nEscuchas un aleteo.' : '';

  // CORREGIDO: Acceso al ID de la habitación y formato de salida
  return `Estás en la habitación ${first(world.player.room)}
Salidas hacia: ${world.player.room[1].join(', ')}${pit}${wumpus}${bat}`;
}  

//Process input
function processInput(world, input){
    //Validate input
    function validateRoom(){
        let roomId;

        if (!_isNaN(roomId = parseInt(input, 10)) && roomId < ROOMS && roomIsNearby(world, roomId)){
            return roomById(world, roomId);
        }
        return null; // Asegura que siempre se retorne algo si la validación falla
    }

    //Quit
    if (processInput.awaiting === 'quit') { 
        if (input !== 'y' && input !== 'n') {
            // CORREGIDO: Mensaje para entrada inválida, ya no retorna un array.
            console.log("Eso no tiene sentido. ¿Estás seguro que quieres salir? (y/n)"); 
        } else {
            if (input === 'y') {
                console.log('Pierdes por cobarde!');
                process.exit(0); 
            } else {
                // 
                console.log('¡El Wumpus te está buscando!'); 
            }
        }
        processInput.awaiting = null; // Resetea el estado de espera para cualquier caso.
        return world; // Siempre devuelve el mundo para continuar el juego (a menos que se haya hecho un exit).
    }

    if(input === 'q'){
        console.log('Estas tan asustado que quieres salir? (y/n)');
        processInput.awaiting = 'quit';
        return world;
    }

    //Move

    if (processInput.awaiting === 'move'){
        let room;

        if (!(room = validateRoom())){
            console.log('No puedes ir a esa caverna');
        } else {
            world.player.room = room;
            if (isInRoom(world, 'pit')){
                console.log('Has caido en un pozo y muerto');
                process.exit(0);
            }
            if (isInRoom(world, 'wumpus')){
                console.log('El Wumpus te ha comido!');
                process.exit(0);
            }
            if (isInRoom(world, 'bat')){
                world.player.room = randomEmptyRoom(world);
                console.log('Un murcielago te ha llevado a una caverna aleatoria');
            }
            console.log(describeCurrentRoom(world));
        }
        console.log('Que quieres hacer? (m)overse o (s)hoot');

        processInput.awaiting = null;
        return world;
    }
    //Move
    if (input === 'm'){
        console.log('A que caverna quieres ir?');
        processInput.awaiting = 'move';
        return world;
    }
    //Shoot
    if (input === 's'){
        let room;

        if (!(room = validateRoom())){
            console.log('No puedes disparar a esa caverna');
        } else {
            if (isInRoom(world, 'wumpus', room)){
                console.log('Has matado al Wumpus! Eres un heroe!');
                process.exit(0);
            } else {
                if (_.random (0, 2) > 0){
                    let newWumpusRoom = randomEmptyRoom(world);

                    find(world.cave, partial(isInRoom, world, 'wumpus')) [2] = [];
                    newWumpusRoom[2] = ['wumpus'];
                    console.log('Fallaste! El Wumpus se ha movido a otra caverna');

                    if (isEqual(world.player.room, newWumpusRoom)){
                        console.log('El Wumpus se ha mudado a tu caverna y te ha comido!');
                        process.exit(0);
                    } else {
                        console.log('Escuchaste un fuerte rugid en una caverna cercana');
                    }
                }
            }
        }

        world.player.arrows--;

        if (world.player.arrows <= 0){
            console.log('Te has quedado sin flechas! \nFin del juego!');
            process.exit(0);
        }

        processInput.awaiting = null;
        return world;
    }

    if (input === 's') {
        processInput.awaiting = 'shoot';
        console.log('A que caverna quieres disparar?');
        return world;
    }

    if (input === 'h'){
        console.log(HELP);
        return world;
    }

    console.log("Eso no tiene sentido");
    return world;
}
processInput.awaiting = 'move';

///////////
//GAME LOOP//
///////////

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', input => {
    world = processInput(world, trim(input));
    console.log('________________________________________________');
});

console.log(HELP);

//Start the game
process.stdin.emit('data', first(world.player.room));

//Elx