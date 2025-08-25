/*
Potential optimizations: (styupid)
	Collect cells in color groups (Map<color, cells[]>) and draw them all at once, with .rect and .beginPath and stuff
	replace reduce in the distancecheck thing,. tto avvoid getting same distance twice

Other ideas:
	mouse tracking + drawing
	dropdown of scenarios, different starting positions


*/

import { config, HEIGHT, mouse, WIDTH } from "./global.js";

// Imports - '@util' in tsconfig.json and vite config
import awa from "@util";

import * as cells from "./cells.js";
const { BaseCell } = cells;




// Layers, seperated to allow being updated and rendered separately
import { VisualLayer, CollisionLayer } from "./layers.js";
let visualLayers : { [key : string] : VisualLayer };
let collisionLayers : { [key : string] : CollisionLayer };

function setupLayers () {
	const canvasElements = Array.from(document.getElementById("layers").children) as HTMLCanvasElement[];
	canvasElements.forEach((canvas) => { canvas.width = WIDTH; canvas.height = HEIGHT; });

	// Layer config
	visualLayers = {
		"main": new VisualLayer(canvasElements[0], {}),
		"notMoving": new VisualLayer(canvasElements[1], { autoRender: false }), // Layer for cells that don't move, therefore don't need to be updated constantly
	};
	collisionLayers = {
		"main": new CollisionLayer({}),
	};
}



window.addEventListener("DOMContentLoaded", () => {

	setupLayers();
	new cells.MoveRandomly(0, 0, collisionLayers.main, visualLayers.main);
	new cells.MoveRandomly(0, 1, collisionLayers.main, visualLayers.main);
	new cells.MoveRandomly(0, 2, collisionLayers.main, visualLayers.main);

	const [renderLoop, tickLoop] = startGameloop();

	displayFPSandTPS(renderLoop, tickLoop);


// const perfList = document.getElementById("perf") as HTMLDivElement;
// const perfOutputs : HTMLOutputElement[] = [];
// for (const { name } of [{ name: "total" }, ...renderLoop.steps, ...tickLoop.steps]) {
// 	const output = document.createElement("output");
// 	output.id = name; output.value = "-";
// 	const div = document.createElement("div");
// 	div.append(`${name}: `, output, document.createTextNode("ms"));
// 	perfList.appendChild(div);
// }

// setInterval(() => {
// 	let total = 0;
// 	for (const { id, value } of perfOutputs) {
// 		const average = renderLoop.performanceHistory[id].reduce((a, b) => a + b, 0) / renderLoop.performanceHistory[id].length;
// 		(document.getElementById(id) as HTMLOutputElement).value = average.toFixed(2);
// 		total += average;
// 	}
// 	(document.getElementById("total") as HTMLOutputElement).value = `${total.toFixed(2)}`;
// }, 500);
});


function displayFPSandTPS (renderLoop : UpdateLoop, tickLoop : UpdateLoop) {
	const fpsOutput = document.getElementById("fps") as HTMLOutputElement;
	const tpsOutput = document.getElementById("tps") as HTMLOutputElement;
	displayRate(() => renderLoop.iteration, fpsOutput);
	displayRate(() => tickLoop.iteration, tpsOutput);

	// Display performance for each step
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
]; }
function tick () {
	collisionLayers.main.cells.forEach((cell) => cell.tick());
}
function draw () {
	visualLayers.main.draw();
}


type UpdateLoopOptions = {
	rate : number;
	steps : ((iteration : number) => void)[];
	maxPerformanceHistory ?: number;
	start ?: boolean;
};
class UpdateLoop {
	/** Array of performance values */
	public performanceHistory : { [key : string] : number[] } = {}; // public get performanceHistory () { return this._performanceHistory; } private set performanceHistory (value) { this._performanceHistory = value; }
	public maxPerformanceHistory : number;

	readonly rate : number;
	readonly frameDuration : number; // 1000 / rate
	private readonly maxCatchupTime : number; // 10 frames worth of time

	private lastFrameTime = null;
	public iteration = 0;
	public running = false;
	public steps : ((iteration : number) => void)[];

	constructor (options : UpdateLoopOptions) {
		options = { start: true, ...options };
		this.maxPerformanceHistory = options.maxPerformanceHistory;
		this.steps = options.steps;
		this.rate = options.rate;
		this.frameDuration = 1000 / this.rate;
		this.maxCatchupTime = this.frameDuration * 10;

		options.steps.forEach((step) => (this.performanceHistory[step.name] = []));
		if (options.start === true) this.start();
	}

	private async run (timestamp = 0) {
		if (!this.running) return;
		if (this.lastFrameTime === null) this.lastFrameTime = timestamp;

		// While the elapsed time since the last processed frame is greater than or equal to
		// the expected frame duration, process another update step. Catch-up loop
		let elapsed = timestamp - this.lastFrameTime;
		if (elapsed > this.maxCatchupTime) elapsed = this.maxCatchupTime;

		while (elapsed >= this.frameDuration) {
			this.lastFrameTime += this.frameDuration; // Advance by fixed frameDuration to keep consistent update intervals and avoid timing drift

			for (const step of this.steps) {
				const startTime = performance.now();

				// Run the step, passing in the current iteration count
				await (step as any)(this.iteration);

				// Calculate how long the step took and record it in performance history, then shift if needed
				this.performanceHistory[step.name].push(performance.now() - startTime);
				if (this.performanceHistory[step.name].length > this.maxPerformanceHistory) {
					this.performanceHistory[step.name].shift();
				}
			}

			this.iteration++;
			elapsed = timestamp - this.lastFrameTime; // Recalculate elapsed!
			if (elapsed > this.maxCatchupTime) elapsed = this.maxCatchupTime;
		}

		requestAnimationFrame((ts) => this.run(ts));
	}

	public start () {
		if (!this.running) {
			this.running = true;
			requestAnimationFrame((ts) => this.run(ts));
		}
	}
	public stop () {
		this.running = false;
	}
}


// 	// Handle config options
// 	const inputTracker = awa.trackInputs();
// 	// inputTracker.get("show-weights").listen("input", (e) => {

// 	// Generate border walls
// 	for (let i = 0; i < config.width; i++) {
// 		spawnAndIgnore(Wall, i, 0, collisionLayers.main, visualLayers.notMoving);
// 		spawnAndIgnore(Wall, i, config.height - 1, collisionLayers.main, visualLayers.notMoving);
// 	}
// 	for (let i = 0; i < config.height; i++) {
// 		spawnAndIgnore(Wall, 0, i, collisionLayers.main, visualLayers.notMoving);
// 		spawnAndIgnore(Wall, config.width - 1, i, collisionLayers.main, visualLayers.notMoving);
// 	}

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



// 	visualLayers.notMoving.draw();

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
			if (el === undefined) return;
			el.value = `${average.toFixed(2)}`;
			totalMS += average;
		});
		totalElement.value = `${totalMS.toFixed(2)}`;
	}, 1000);
}
