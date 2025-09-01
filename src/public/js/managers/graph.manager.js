import { adjacencyList } from "../game.js";
import cytoscape from "cytoscape";

// creating a manager to manipulate the game's graph
class GraphManager {
    constructor() {
        this.cy = null;
        this.container = 'cy';
    }

    init() {
        // Parse adjacencyList to Cytoscape format
        // using strings since Cytoscape requires IDs to be strings

        // Generatiing nodes data structure for Cytoscape
        const nodes = adjacencyList.map(
            // JSON parse for each node
            (_, index) => ({
                data: { id: `${index}` }
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

        // Create Cytoscape instance
        this.cy = cytoscape({
            // Get container from DOM container ID 'cy'
            container: document.getElementById(this.container),
            elements: { nodes, edges },
        });

        return this.cy;
    }
}
const graphManager = new GraphManager();

export { graphManager };