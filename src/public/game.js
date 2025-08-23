

const _ = require('lodash');
//Lodash import
//Import all lodash functions to the main 

_.each(_.keys(_), k => global[k === 'isNaN' ? '_isNaN' : k] = _[k]);

//Constants
const ROOOMS = 15;
const ROOMS_TUNNELS = 3;
const BATS = 2;
const PITS = 2;
const ARROWS = 1;
const HELP = "`Welcome to Hunt the Wumpus!'";

//Adjacency list of a dodecahedron
const ADJACENIES = [
    [1, 9],
    [0, 2, 14],
    [1, 3],
    [2, 3, 13],
    [3, 5],
    [4, 6, 12],
    [5, 7],
    [6, 8, 11],
    [7, 9],
    [0, 8, 10],
    [9, 11, 14],
    [7, 10, 12],
    [5, 11, 13],
    [3, 12, 14],
    [1, 10, 13]
];
//Estructure of a room:
const cave = chain(range(ROOOMS)) //Create a cave of 15 interconected rooms
    // [room number, [connected rooms], [elements in the room]]
    .map(n => [n, ADJACENIES[n], []]) //Map each room to its connections 0 to 14
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