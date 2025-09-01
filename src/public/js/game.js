//Import dependecies
import ld from "lodash";
// import { world } from "./ui";

// Dodecahedron-shaped adjacency list
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

class GameManager {
    constructor() {
        this.game = null;
        this.nodes = adjacencyList.length;
        this.bats = 2;
        this.pits = 2;
        this.shoots = 3;
        this.adjacencyList = adjacencyList;
    }

    #createGame() {
        // chains lodash methods
        const cave = ld.chain(ld.range(this.nodes))
            // [room number, [connected rooms], [elements in the room]]
            .map((n) => [n, adjacencyList[n], []])
            .thru((c) => {
                //Add elements to the cave wumpus, bats and pits
                const findEmptyAndAdd = (element) =>
                    (ld.sample(ld.filter(c, (r) => ld.isEmpty(r[2])))[2] = [element]);
                findEmptyAndAdd("wumpus");
                ld.times(this.bats, ld.partial(findEmptyAndAdd, "bat"));
                ld.times(this.pits, ld.partial(findEmptyAndAdd, "pit"));
                return c;
            })
            .value();

        return {
            cave,
            player: {
                room: ld.sample(ld.filter(cave, r => r[2].length === 0)), //Player starts in an empty room
                arrows: this.shoots, //Player starts with 3 arrows
            },
            message: null,
            alert: null,
            isOver: false,
        };
    }

    init() {
        this.game = this.#createGame();
        return this.game;
    }

    isNearby(element) {
        return ld.chain(this.game.player.room[1]) //Get connected rooms
            .map((r) => ld.find(this.game.cave, (rr) => ld.first(rr) === r)) //Map to the room structure
            .some((r) => ld.includes(r[2], element)) //Check if any of the connected rooms has the element
            .value();
    }

    isInRoom(element, room) {
        room = room || this.game.player.room;
        return ld.includes(room[2], element);
    }

    roomIsAdjacent(roomId) {
        return ld.includes(this.game.player.room[1], roomId);
    }

    roomById(roomId) {
        return ld.find(this.game.cave, (r) => ld.first(r) === roomId);
    }

    randomEmptyRoom() {
        return ld.sample(ld.filter(this.game.cave, (r) => ld.isEmpty(r[2]))); // Filter empty rooms and choose one at random
    }

    getHazardAsList() {
        const list = [];
        ld.forEach(this.game.cave, (r) => {
            const id = ld.first(r);
            r[2].forEach((haz) => list.push({ type: haz, room: id }));
        });
        return list;
    }

    getHazardByType() {
        const res = { wumpus: null, bats: [], pits: [] };
        ld.forEach(this.game.cave, (r) => {
            const id = ld.first(r);
            const hazards = r[2];
            if (ld.includes(hazards, "wumpus")) res.wumpus = id;
            if (ld.includes(hazards, "bat")) res.bats.push(id);
            if (ld.includes(hazards, "pit")) res.pits.push(id);
        });

        return res;
    }

    getHazardByRoom() {
        return ld.map(this.game.cave, (r) => ({
            room: ld.first(r),
            hazards: r[2].slice()
        }));
    }

    getNearbyHazards() {
        return {
            'pit': this.isNearby("pit"),
            'wumpus': this.isNearby("wumpus"),
            'bat': this.isNearby("bat")
        }
    }

    //Moves the player to an adjacent room
    movePlayer(roomId) {
        // Reset game stats
        this.game.alert = null;
        this.game.message = null;

        //If target room is not adjacent, return with an error menssage
        if (!this.roomIsAdjacent(roomId)) {
            this.game.alert = "Can\'t move to this room";
            return;
        }

        // Move player to specified room
        this.game.player.room = this.roomById(roomId);

        // Looking for danger in current room.
        // ...

        if (this.isInRoom("pit")) {
            this.game.message = "Bad luck!";
            this.game.alert = "You\'ve fell to a pit and have died...";
            this.game.isOver = true;
            return;
        }

        if (this.isInRoom("wumpus")) {
            this.game.message = "Oh no!";
            this.game.alert = "The feared wumpus have killed you.";
            this.game.isOver = true;
            return;
        }

        if (this.isInRoom("bat")) {
            this.game.player.room = this.randomEmptyRoom();
            this.game.alert =
                `Unexpected bats have moved you to room ${this.game.player.room}`;
            return;
        }

        this.game.alert = "Be carefull...";
    }
    //Being able to shoot the wumpus
    shootArrow(roomId) {
        if (!this.roomIsAdjacent(roomId)) { //If the room is not adjacent, shooting is not possible
            this.game.alert = "Can\'t shoot to this room";
        }

        // If room is valid, shoot and decrease
        this.game.player.arrows--;

        //If player manages to hit the shot you win
        if (this.isInRoom("wumpus", this.roomById(roomId))) {
            this.game.message = "You won!";
            this.game.alert = "You\'ve killed the feared wumpus... like a boss...";
            this.game.isOver = true;
        }

        //If player runs out of arrows
        if (this.game.player.arrows == 0) {
            this.game.message = "Job, only had a bro";
            this.game.alert = "You\'ve ran out of shoots, you're getting killed.";
        }

        //The wumpus may move to player's room
        if (ld.random(0, 2) > 0) {
            let newWumpusRoom = this.randomEmptyRoom();
            // ld.find(this.game.cave, ld.partial(this.isInRoom, this.game, "wumpus"))[2] = [];
            
            newWumpusRoom[2] = ["wumpus"];
            // If, after shoot fails, wumpus moves to player's location
            if (ld.isEqual(this.game.player.room, newWumpusRoom)) {
                this.game.message = "You got murdered!";
                this.game.alert = "The feared wumpus have moved to your room and killed you...";
                this.game.isOver = true;
                return;
            }
        }
        
        this.game.alert = "Be careful... The wumpus is moving, looking for your life.";
        return;
    }

    //Info about Game State
    getGameState() {
        return {
            playerRoom: ld.first(this.game.player.room),
            exits: this.game.player.room[1],
            arrows: this.game.player.arrows,
            isOver: this.game.isOver,
            message: this.game.message,
        };
    }

}

const gameManager = new GameManager();
export { gameManager, adjacencyList };
