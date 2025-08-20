/*
	Potential optimizations: (styupid)
		Collect cells in color groups (Map<color, cells[]>) and draw them all at once, with .rect and .beginPath and stuff
		replace reduce in the distancecheck thing,. tto avvoid getting same distance twice
*/

const config = {
	width: 100,
	height: 100,
};

// Imports
import awa from "@util";
const { rr } = awa; // '@util' in tsconfig.json and vite config

//
import * as cells from "./cells.js";
const { BaseCell, NotMoving, Drone, Hunter, Scared, Queen } = cells;


// Layers, seperated to allow being updated and rendered separately
import { VisualLayer, CollisionLayer } from "./layers.js";
let visualLayers : { "main" : VisualLayer; "notMoving" : VisualLayer; };
let collisionLayers : { "main" : CollisionLayer; };
const layer_config = {
	visualLayers: {
		"main": [0],
		"notMoving": [1, { autoRender: false }],
	},
	collision: {
		"main": [],
	},
};



window.addEventListener("DOMContentLoaded", () => {

	// Get canvas elements
	const canvasElements = Array.from(document.getElementById("layers").children) as HTMLCanvasElement[];
	canvasElements.forEach((canvas) => { canvas.width = config.width; canvas.height = config.height; });



	visualLayers = {
		"main": new VisualLayer(canvasElements[0]),
		"notMoving": new VisualLayer(canvasElements[1], { autoRender: false }), // Layer for cells that don't move, therefore don't need to be updated constantly
	};
	collisionLayers = {
		"main": new CollisionLayer(canvasElements[0].width, canvasElements[0].height),
	};


	const spawnRandomly = (type : typeof BaseCell, collisionLayer = collisionLayers.main, visualLayer = visualLayers.main, options = {}) => {
		try {
			const r = new type(rr(0, visualLayer.canvas.width - 1), rr(0, visualLayer.canvas.height - 1), collisionLayer, visualLayer, options);
		} catch (e) {
			spawnRandomly(type, collisionLayer, visualLayer, options);
		}
	};
	// for (let i = 0; i < 20; i++) {
	// 	new NotMoving(25, i + 6, collisionLayers.main, visualLayers.notMoving);
	// 	new NotMoving(i, 27 + 6, collisionLayers.main, visualLayers.notMoving);
	// }
	// for (let i = 0; i < 100; i++) {
	// 	spawnRandomly(Drone, collisionLayers.main, visualLayers.main);
	// }
	for (let i = 1; i <= 1; i++) {
		setInterval(() => { spawnRandomly(Hunter, collisionLayers.main, visualLayers.main); }, i * 4000);
	}
	for (let i = 0; i < 100; i++) {
		spawnRandomly(Scared, collisionLayers.main, visualLayers.main);
	}
	// spawnRandomly(Hunter, collisionLayers.main, visualLayers.main);
	visualLayers.notMoving.draw();

	const layersToRender = Object.values(visualLayers).filter((layer) => layer.autoRender === true);
	const layersToTick = Object.values(collisionLayers).filter((layer) => layer.autoTick === true);
	const Game = new awa.GameLoop({
		tick: {
			rate: 40,
			callback: () => {
				layersToTick.forEach((layer) => {
					layer.cells.forEach((cell) => cell.tick());
				});
			},
		},
		render: {
			rate: 15,
			callback: (a) => {
				layersToRender.forEach((layer) => {
					// layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
					layer.draw();
				});
			},
		},
	});

	Game.start();
	// setInterval(() => {
	// 	console.log(`Rates: ${Object.entries(Game.getLoopsSinceLastReport()).map(([key, count]) => `${key}: ${count}`).join(", ")}`);
	// }, 1000);
});
