import { adjacencyList, gameManager } from "./game.manager.js";
import cytoscape from "cytoscape";

// creating a manager to manipulate the game's graph
class GraphManager {
    constructor() {
        this.cy = null;
        this.container = 'cy';
        this.lastTapped = null;
        this.nodePositions = {
            '0': { x: 625, y: 125 },
            '1': { x: 700, y: 225 },
            '2': { x: 725, y: 360 },
            '3': { x: 625, y: 450 },
            '4': { x: 500, y: 500 },
            '5': { x: 375, y: 450 },
            '6': { x: 275, y: 360 },
            '7': { x: 300, y: 225 },
            '8': { x: 375, y: 125 },
            '9': { x: 500, y: 100 },
            '10': { x: 500, y: 200 },
            '11': { x: 400, y: 270 },
            '12': { x: 440, y: 375 },
            '13': { x: 560, y: 375 },
            '14': { x: 600, y: 270 }
        };
    }

    init() {
        // Parse adjacencyList to Cytoscape format
        // using strings since Cytoscape requires IDs to be strings

        // Generatiing nodes data structure for Cytoscape
        const nodes = adjacencyList.map(
            // JSON parse for each node
            (_, index) => ({
                // using checked attribute to mark visited nodes
                data: {
                    id: `${index}`,
                    isPlayer: false,
                    checked: false,
                    hazard: null
                },
                position: this.nodePositions[`${index}`],
                locked: true
            })
        );

        // Generating edges data structure for Cytoscape
        // Using flatMap since each node can connect to multiple nodes (bidimensional array)
        const edges = adjacencyList.flatMap(
            // from-to stands for source node and target node respectively.
            (connections, from) => connections.map(to => ({
                // JSON parse for each edge
                data: {
                    id: `${from}-${to}`,
                    source: `${from}`,
                    target: `${to}`
                }
            }))
        );

        const style = [
            {
                selector: 'node',
                style: {
                    'background-color': '#181818',
                    'label': 'data(id)',
                    'text-valign': 'center',
                    'color': '#fff',
                    'width': 42,
                    'height': 42,
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'border-color': '#fff',
                    'border-width': 4
                }
            },
            {
                selector: 'node[?checked]',
                style: {
                    'background-color': '#444',
                    'transition-property': 'background-color',
                    'transition-duration': '0.3s'
                }
            },
            {
                selector: 'node[?isPlayer]',
                style: {
                    'background-color': '#73b11c'
                }
            },
            {
                selector: 'node[hazard = "bat"]',
                style: {
                    'background-color': '#501a52'
                }
            },
            {
                selector: 'node[hazard = "pit"]',
                style: {
                    'background-color': '#141b5e'
                }
            },
            {
                selector: 'node[hazard = "wumpus"]',
                style: {
                    'background-color': '#bd760b'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 7,
                    'line-color': '#090909',
                }
            }

        ]

        // Create Cytoscape instance
        this.cy = cytoscape({
            // Get container from DOM container ID 'cy'
            container: document.getElementById(this.container),
            elements: { nodes, edges },
            boxSelectionEnabled: false,
            maxZoom: 2.5,
            minZoom: 0.5,
            layout: {
                name: 'preset',
                fit: true,
                padding: 20
            }, // Use preset layout to respect defined positions
            style: style
        });

        this.cy.$id(`${gameManager.game.player.room[0]}`).data({ 'isPlayer': true, 'checked': true })

        /// Adding cytoscape event listeners
        // Store last selected node
        this.cy.on('tap', 'node', (e) => {
            const tappedNode = e.target.id();
            if (this.lastTapped !== tappedNode)
                this.lastTapped = tappedNode;
        });

        // Only set null when user unselects node without selecting another one
        this.cy.on('unselect', 'node', (e) => {
            const unselectedNode = e.target.id();
            if (this.lastTapped === unselectedNode && this.cy.$(':selected').length === 0)
                this.lastTapped = null
        });

        return this.cy;
    }

    setNodeProperty(id, property, value) {
        this.cy.$id(`${id}`).data(`${property}`, value)
        return;
    }

    checkUpNode(id) {
        id = id || gameManager.game.player.room[0]
        this.cy.$id(`${id}`).data('checked', true);
        return;
    }

    changePlayerNode(oldId, newId) {
        this.cy.$id(`${oldId}`).data('isPlayer', false);
        this.cy.$id(`${newId}`).data('isPlayer', true);
        return;
    }

    updateGraph(oldNode, newNode) {
        this.checkUpNode();
        this.changePlayerNode(oldNode, newNode);
        return;
    }
}
const graphManager = new GraphManager();

export { graphManager };