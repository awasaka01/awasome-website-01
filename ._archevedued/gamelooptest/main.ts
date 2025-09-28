import chroma from "chroma-js";
import { it } from "node:test";
import { VisualLayer } from "../../../__dev/beepboop/layers";
import { BaseCell } from "../../../__dev/beepboop/cells";
const rr = (min : number, max : number) => Math.floor(Math.random() * (max - min + 1)) + min;



type RGBA = [number, number, number, number?];


window.addEventListener("DOMContentLoaded", () => {
	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	const { width, height } = canvas;
	const ctx = canvas.getContext("2d");

	// data8 is an array with 4 bytes per pixel [r, g, b, a, r, g, b, a, ...],
	// data32 combines the 4 bytes into a single 32-bit number, access each individual byte using shifts [rgba, rgba, ...]
	const imageData = ctx.createImageData(width, height);
	const data8 = imageData.data;
	const data32 = new Uint32Array(data8.buffer);




	//


	class BaseCell {
		public x : number;
		public y : number;
		public color : RGBA;
		public visualLayer : VisualLayer;

		constructor (x : number, y : number, color : RGBA) {
			this.x = x;
			this.y = y;
			this.color = color;
		}

		goTo (x : number, y : number) {
			setPixel(x, y, this.color);
			setPixel(this.x, this.y, [0, 0, 0, 0]);
			this.x = x; this.y = y;
		}
	}



	// Visual Layer, only used for rendering to a canvas
	class VisualLayer {
		readonly canvas : HTMLCanvasElement;
		readonly ctx : CanvasRenderingContext2D;
		public autoRender ?: boolean;
		public cells : BaseCell[];

		public imageData = ctx.createImageData(width, height);
		public data8 = imageData.data;
		public data32 = new Uint32Array(data8.buffer);



		constructor (canvas : HTMLCanvasElement, { autoRender = true } = {}) {
			this.canvas = canvas;
			this.ctx = canvas.getContext("2d");
			this.ctx.imageSmoothingEnabled = false;
			this.autoRender = autoRender;
			this.cells = [];
		}

		public move (fromX : number, fromY : number, toX : number, toY : number) {

		}
		public add (x : number, y : number) { this.cells.push(cell); }
		public remove (cell : BaseCell) { this.cells.splice(this.cells.indexOf(cell), 1); }
	}







	const thingsToDraw : ({ x : number, y : number, rgba : RGBA })[] = [];


	function changeThings (iteration : number) {
		const totalPixels = width * height;
		const iterationMod = iteration % totalPixels;
		thingsToDraw.push({ x: iterationMod % width, y: ~~(iterationMod / width), rgba: [
			iterationMod % 256,
			~~((iterationMod / 256) % 256),
			~~((iterationMod / (256 * 256)) % 256),
		] });
		// if (thingsToDraw.length > 2000) thingsToDraw.shift();
	}

	function emptyData () {
		data8.fill(0);
	}

	function drawImageData () {
		for (const thing of thingsToDraw) {
			const pointer = (thing.x + thing.y * width) * 4;
			data8[pointer + 0] = thing.rgba[0];
			data8[pointer + 1] = thing.rgba[1];
			data8[pointer + 2] = thing.rgba[2];
			data8[pointer + 3] = 255;
		}
	}

	async function putImageData () {
		ctx.putImageData(imageData, 0, 0);
	}


	type UpdateLoopOptions = {
		/**  */
		rate : number;
		steps : ((iteration : number) => void)[];
		maxPerformanceHistory : number;
		start ?: boolean;
	};
	class UpdateLoop {
		/** Array of performance values */
		public performanceHistory : { [key : string] : number[] } = {}; // public get performanceHistory () { return this._performanceHistory; } private set performanceHistory (value) { this._performanceHistory = value; }
		public maxPerformanceHistory : number;

		readonly rate : number;
		public steps : ((iteration : number) => void)[];
		public iteration = 0;
		public lastFrameTime = 0;
		private maxCatchupTime = 200; // ms

		constructor (
			options : UpdateLoopOptions = {
				rate: 30,
				steps: [putImageData, drawImageData],
				maxPerformanceHistory: 1000,
			},
		) {
			this.maxPerformanceHistory = options.maxPerformanceHistory;
			this.steps = options.steps;
			this.rate = options.rate;

			options.steps.forEach((step) => this.performanceHistory[step.name] = []);

			if (options.start !== false) this.start();
		}


		private async run (timestamp = 0) {
			if (!this.lastFrameTime) this.lastFrameTime = timestamp;

		// Calculate how long each frame should take, based on the desired target FPS rate
		// For example, if rate = 40, frameDuration = 1000ms / 40 = 25ms per frame
		const frameDuration = 1000 / this.rate;

		// The "catch-up" loop:
		// While the elapsed time since the last processed frame is greater than or equal to
		// the expected frame duration, process another update step.
		// This means if we are behind schedule, we run multiple updates to catch up.
		while (timestamp - this.lastFrameTime >= frameDuration) {
			// Move lastFrameTime forward by one frame duration.
			// This simulates that we processed a frame exactly on time.
			this.lastFrameTime += frameDuration;

			for (const step of this.steps) {
				const startTime = performance.now();
				// Run the step, passing in the current iteration count
				await (step as any)(this.iteration);

				// Calculate how long the step took and record it in performance history
				this.performanceHistory[step.name].push(performance.now() - startTime);

				// Keep performance history arrays within the max size limit
				if (this.performanceHistory[step.name].length > this.maxPerformanceHistory) {
					this.performanceHistory[step.name].shift();
				}
			}

			// Increment iteration counter after processing a full update cycle
			this.iteration++;
		}

			// After catching up on all required updates, schedule the next animation frame
			// The browser will call this.run() again, passing the new timestamp automatically.
			requestAnimationFrame((ts) => this.run(ts));
		}


		public start () { this.run(); }
	}

	const renderLoop = new UpdateLoop({
		rate: 100,
		steps: [changeThings, emptyData, drawImageData, putImageData],
		maxPerformanceHistory: 400,
	});
	const fpsOutput = document.getElementById("fps") as HTMLOutputElement;
	const sampleSize = 30;
	const fpsSamples = [];
	setInterval(() => {
		const now = performance.now();
		const deltaIter = renderLoop.iteration - fpsSamples[fpsSamples.length - 1]?.iteration || 0;
		fpsSamples.push({ iteration: renderLoop.iteration, timestamp: now });
		if (fpsSamples.length > sampleSize) fpsSamples.shift();
		const totalDeltaIter = fpsSamples[fpsSamples.length - 1].iteration - fpsSamples[0].iteration;
		const totalDeltaTS = fpsSamples[fpsSamples.length - 1].timestamp - fpsSamples[0].timestamp;
		fpsOutput.value = `${Math.round(totalDeltaIter / (totalDeltaTS / 1000))}`;
	}, 300);


	const perfList = document.getElementById("perf") as HTMLDivElement;
	const stepElements = [];
	let totalElement;
	[{ name: "total" }, ...renderLoop.steps].forEach((step) => {
		const div = document.createElement("div");
		const output = document.createElement("output");
		output.id = step.name;
		output.value = "0";
		div.appendChild(document.createTextNode(`${step.name}: `));
		div.appendChild(output);
		div.appendChild(document.createTextNode("ms"));
		perfList.appendChild(div);
		step.name === "total" ? totalElement = output : stepElements.push(output);
	});

	setInterval(() => {
		let total = 0;
		stepElements.forEach((output, index) => {
			const average = renderLoop.performanceHistory[output.id].reduce((a, b) => a + b, 0) / renderLoop.performanceHistory[output.id].length;
			(document.getElementById(output.id) as HTMLOutputElement).value = average.toFixed(2);
			total += average;
		});
		(totalElement as HTMLOutputElement).value = `${total.toFixed(2)}`;
	}, 500);

});


function displayPerformance () {
		// .times.forEach((time, index) => {
		// 	const average = time.reduce((a, b) => a + b, 0) / time.length;
		// 	outputs[index].value = average.toFixed(2);

		// 	// Remove if more than 1000 values
		// 	if (time.length > 1000) {
		// 		performanceValues.times[index].splice(0, time.length - 1000);
		// 	}
		// });
}
