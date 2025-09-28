/*


Other ideas:
	mouse drawing
	dropdown of scenarios, different starting positions


*/

import { config, HEIGHT, mouse, WIDTH, clr, symbols, coordinateGrid } from "./global.js";

// Imports - '@util' in tsconfig.json and vite config
import * as awa from "../../../../source/awa-util/core.js";
import { UpdateLoop } from "../../../../source/awa-util/core.js";
import * as CellTypes from "./cells.js";
const { BaseCell } = CellTypes;
import chroma from "chroma-js";


// Layers, seperated to allow being updated and rendered separately
import { VisualLayer, CollisionLayer, visualLayers, collisionLayers } from "./layers.js";



function setupLayers () {
	const canvasElements = Array.from(document.getElementById("layers").children) as HTMLCanvasElement[];
	canvasElements.forEach((canvas) => { canvas.width = WIDTH; canvas.height = HEIGHT; });

	// Layer config
	visualLayers.main = new VisualLayer(canvasElements[0], {});
	visualLayers.notMoving = new VisualLayer(canvasElements[1], { autoRender: false });
	visualLayers.water = new VisualLayer(canvasElements[2], { resolution: 1, autoRender: false, postProcess: ({ ctx }) => {
		ctx.save();



		ctx.restore();
	} });

	collisionLayers.main = new CollisionLayer({});
	collisionLayers.water = new CollisionLayer({});
}



window.addEventListener("DOMContentLoaded", () => {

	const [tickLoop, renderLoop] = startGameloop();

	// Handle the pause button
	let paused = false;
	const text = document.querySelector("#pause > span:first-child");
	document.getElementById("pause").addEventListener("click", () => {
		paused = !paused;
		text.textContent = paused ? "Resume" : "Pause";
		if (paused) { tickLoop.stop(); renderLoop.stop(); }
		else { tickLoop.start(); renderLoop.start(); }
	});


	setupLayers();

	spawnInitialCells();

	displayPerformance(renderLoop, tickLoop);
	visualLayers.notMoving.draw();
	visualLayers.water.draw();

	setInterval(() => {
		visualLayers.water.draw(true);
	}, 100);
});
const spawn = (type, x, y, options = {}) => { try { return new type(x, y, options); } catch {} };
const spawnRandomly = (type, amount = 1, options = {}, attemptCount = 100) => {
	for (let i = 0; i < amount; i++) {
		if (attemptCount < 0) return;
		try { new type(Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT), options); }
		catch { spawnRandomly(type, 1, options, attemptCount - 1); }
	}
};
function spawnInitialCells () {

	// Create border walls
	awa.Matrix.getRect(coordinateGrid, 0, 0, WIDTH, HEIGHT).forEach(([x, y]) => CellTypes.Wall.trySpawn(x, y));

	// Spawn straight line of water down
	const riverWidth = 10;
	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < riverWidth; x++) {
			spawn(CellTypes.River, x + (WIDTH - riverWidth) / 2, y, { direction: "S" });
		}
	}
	spawnRandomly(CellTypes.MoveRandomly, 100);






}

function displayPerformance (renderLoop : UpdateLoop, tickLoop : UpdateLoop) {
	const fpsOutput = document.getElementById("fps") as HTMLOutputElement;
	const tpsOutput = document.getElementById("tps") as HTMLOutputElement;
	displayRate(() => renderLoop.iteration, fpsOutput);
	displayRate(() => tickLoop.iteration, tpsOutput);

	displayStepPerformance([renderLoop, tickLoop]);
}





function startGameloop () { return [
	new UpdateLoop({
		rate: 60,
		steps: [tick],
	}),
	new UpdateLoop({
		rate: 20,
		steps: [draw],
	}),
];
}


function tick (i) {
	const cells = [...collisionLayers.main.cells];
	// if (cells.filter((c) => c instanceof CellTypes.Volitile).length < 20) spawnRandomly(CellTypes.Volitile);
	cells.forEach((cell) => {
		if(cell.tick && cell.pauseUntilFrame <= i) cell.tick(i);
	});
}
function draw () {
	visualLayers.main.draw();
}




// 	// Handle config options
// 	const inputTracker = awa.trackInputs();
// 	// inputTracker.get("show-weights").listen("input", (e) => {



// 	// Generate random lines of wall
// 	// const outergap = 20;

// 	// // Generate outer

// 	// let y = 0;
// 	// while (y < config.height - outergap * 2) {

// 	// 	const gapsize = rr(10, 50);
// 	// 	const gap = rr(0, config.width - outergap * 2 - gapsize);
// 	// 	for (let x = 0; x < config.width - outergap * 2; x++) {
// 	// 		if (x > gap && x < gap + gapsize) continue;
// 	// 		spawnAndIgnore(Wall, x + outergap, y + outergap, collisionLayers.main, visualLayers.notMoving);
// 	// 	}

// 	// 	y += rr(4, 20);
// 	// }




// 	const layersToRender = Object.values(visualLayers).filter((layer) => layer.autoRender === true);
// 	const layersToTick = Object.values(collisionLayers).filter((layer) => layer.autoTick === true);
// 	const game = new awa.GameLoop({
// 		tick: {
// 			rate: 40,
// 			callback: (loopsSinceStart) => {
// 				if (collisionLayers.main.cells.filter((cell) => cell instanceof Scared).length < 200) spawnRandomly(Scared, collisionLayers.main, visualLayers.main);
// 				layersToTick.forEach((layer) => {

// 					layer.cells.forEach((cell) => cell.tick());


// 				});
// 			},
// 		},
// 		render: {
// 			rate: 15,
// 			callback: (a) => {
// 				layersToRender.forEach((layer, i) => {

// 					layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
// 					layer.draw();
// 				});
// 			},
// 		},
// 	});
// 	const fpsDisplay = document.getElementById("fps") as HTMLOutputElement;
// 	const tpsDisplay = document.getElementById("tps") as HTMLOutputElement;
// 	setInterval(() => {
// 		const { tick, render } = game.getLoopsSinceLastReport();

// 		fpsDisplay.innerText = render.toString();
// 		tpsDisplay.innerText = tick.toString();
// 	}, 1000);

// 	game.start();
// 	// setInterval(() => {
// 	// }, 1000);
// });


// Generic function to get the average rate of a value, and output it to a HTMLOutputElement
function displayRate (
	getCurrentValue : () => number,
	outputElement : HTMLOutputElement,
	updateIntervalMs = 500,
	averageOver = 5,
) {
	let lastValue = getCurrentValue();
	let lastTime = performance.now();
	const rateHistory : number[] = [];

	setInterval(() => {
		const now = performance.now();
		const currentValue = getCurrentValue();
		const deltaValue = currentValue - lastValue;
		const deltaTime = now - lastTime;

		if (deltaTime > 0) {
			const rate = (deltaValue / deltaTime) * 1000; // scale to per second

			// Keep history for smoothing
			rateHistory.push(rate);
			if (rateHistory.length > averageOver) {
				rateHistory.shift();
			}

			const avgRate = rateHistory.reduce((a, b) => a + b, 0) / rateHistory.length;
			outputElement.value = Math.round(avgRate).toString();
		}

		lastValue = currentValue;
		lastTime = now;
	}, updateIntervalMs);
}


// Display the average performance for each step
function displayStepPerformance (loops : UpdateLoop[]) {

	// Create divs and outputs for each step
	const steps = loops.flatMap((loop) => loop.steps);
	const stepElements = [];
	steps.forEach((step) => {
		const div = document.createElement("div");
		const output = document.createElement("output");
		output.id = step.name; output.value = "0";
		div.append(`${step.name}: `, output, "ms");
		document.getElementById("step-performance").appendChild(div);
		stepElements.push(output);
	});
	const totalElement = document.getElementById("total") as HTMLOutputElement;

	setInterval(() => {
		let totalMS = 0;
		loops.forEach((loop, i) => {
			const average = awa.average(loop.performanceHistory[steps[i].name]);
			const el = document.getElementById(steps[i].name) as HTMLOutputElement;
			if (!el) return;
			el.value = `${average.toFixed(2)}`;
			totalMS += average;
		});
		totalElement.value = `${totalMS.toFixed(2)}`;
	}, 1000);
}
