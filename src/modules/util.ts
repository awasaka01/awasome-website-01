import chroma from "chroma-js";

namespace awa {
	export const rr = (min : number, max : number) => Math.floor(Math.random() * (max - min + 1)) + min;

	export const delay = async (t = 1000) : Promise<void> => new Promise((resolve) => setTimeout(resolve, t));

	export const getDistance = (coordA : [number, number], coordB : [number, number]) => { return Math.sqrt((coordA[0] - coordB[0]) ** 2 + (coordA[1] - coordB[1]) ** 2); };

	const longestIn = <T extends { length : number }> (array : T[]) : T => {
		let longest = array[0];
		for (const x of array) { if (longest.length < x.length) longest = x; }
		return longest;
	};

	export const removeANSI = (str : string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, "");


	type MatrixType = string[][];
	export class Matrix {

		constructor (public array : MatrixType) {
			return this;
		}


		transpose () { this.array = Matrix.transpose(this.array); return this; }
		static transpose (matrix : MatrixType) {
			Matrix.validate(matrix);

			const output : MatrixType = [];
			const longestRowLength = longestIn(matrix).length;

			for (let i = 0; i < matrix.length; i++) {
				for (var j = 0; j < longestRowLength; j++) {
					if (output[j] === undefined) output[j] = [];
					output[j][i] = matrix[i][j] ?? "";
				}
			}
			return output;
		}


		reverseRows () { this.array = Matrix.reverseRows(this.array); return this; }
		static reverseRows (matrix : MatrixType) {
			Matrix.validate(matrix);
			for (let i = 0; i < matrix.length; i++) { matrix[i].reverse(); }
			return matrix;
		}

		validate () { this.array = Matrix.validate(this.array); return this; }
		static validate (matrix : MatrixType) { if (!Array.isArray(matrix) || matrix.some((row) => !Array.isArray(row))) { throw new Error("rotate2DArray: Array must be a 2D array, got " + JSON.stringify(matrix)); } return matrix; }


		rotate (angle = 90) { this.array = Matrix.rotate(this.array, angle); return this; }
		static rotate (matrix : MatrixType, angle = 90) {
			Matrix.validate(matrix);

			// Validate Angle
			if (angle % 90 !== 0) throw new Error("rotate2DArray: Angle must be a multiple of 90 degrees, got " + angle);
			angle = (angle < 0 ? 360 + angle : angle) % 360; // Allow negative angles (-90 to 270) and large (720 to 360)

			if (angle === 0 || angle === 360) { return matrix; }
			else if (angle === 90) { return Matrix.reverseRows(Matrix.transpose(matrix)); }
			else if (angle === 180) { return (Matrix.reverseRows(matrix)).reverse(); }
			else if (angle === 270) { return Matrix.transpose(Matrix.reverseRows(matrix)); }
			else { throw new Error("CATASTROPHIC FAILURE with: " + angle); }
		}
	}

	// pnpm exec ts-node ./src/modules/Untitled-1.ts

	/*
	class GameLoop {
		public paused: boolean;
		private targetTPS: number;
		private targetFPS: number;
		private tickCount: number = 0;
		private frameCount: number = 0;

		private lastTickTimestamp: number = 0;
		private lastFrameTimestamp: number = 0;

		private updateCallback: Function;
		private drawCallback: Function;

		constructor (options: { tps: number, fps: number }, updateCallback: Function, drawCallback: Function) {
			this.paused = false;

			this.targetTPS = options.tps;
			this.targetFPS = options.fps;
			this.updateCallback = updateCallback;
			this.drawCallback = drawCallback;



			// // Start main loop
			// requestAnimationFrame(() => {
			// 	if (this.paused !== true) {
			// 		drawCallback();
			// 		updateCallback();
			// 		requestAnimationFrame(() => this.start());
			// 	}
			// 	console.log("e");
			// });
			requestAnimationFrame((t) => this.loop(t));
		}
		loop (currentTimestamp: number) {

			let ticksThisFrame = 0;

			const msPerFrame = 1000 / this.targetFPS;
			const msPerTick = 1000 / this.targetTPS;
			let delta = currentTimestamp - this.lastTickTimestamp;

			// console.log(currentTimestamp - this.lastTickTimestamp, msPerTick);
			while (currentTimestamp - this.lastTickTimestamp >= msPerTick) {
				this.updateCallback();
				this.lastTickTimestamp += msPerTick;

				ticksThisFrame += 1;
				if (ticksThisFrame >= 5) { this.lastTickTimestamp = currentTimestamp; break; }
			}


			// console.log(currentTimestamp - this.lastTickTimestamp, msPerFrame);
			if (currentTimestamp - this.lastFrameTimestamp >= msPerFrame) {
				this.drawCallback();
				this.lastFrameTimestamp = currentTimestamp;
			}


			requestAnimationFrame((t) => this.loop(t));
		}

		start () { return this; }
		end () { return this; }
		pause () { this.paused = true; return this;	}
		resume () { this.paused = false; return this; }
	}


	const game = new GameLoop({ tps: 1, fps: 3 },
		() => {
			console.log("ticked!",);
		},
		() => {
			console.log("drawn!", performance.now());
		},
	);

	function requestAnimationFrame (callback: Function) {
		setTimeout(() => { callback(performance.now()); }, 1);
	}
	*/

	class GameLoopTimer {
		private unprocessedTime = 0;
		private lastTimestamp = 0;
		private readonly MS_PER_LOOP : number;

		private callback : (alpha ?: number) => void;
		private readonly MAX_CATCHUP_LOOPS : number;
		private readonly INTERPOLATION_ENABLED : boolean;

		constructor (targetRate : number, callback : (alpha ?: number) => void, interpolate : boolean = false, MAX_CATCHUP_LOOPS = 20) {
			this.MS_PER_LOOP = 1000 / targetRate;
			this.callback = callback;
			this.MAX_CATCHUP_LOOPS = MAX_CATCHUP_LOOPS;
			this.INTERPOLATION_ENABLED = interpolate;

		}
		tick (currentTimestamp : number) {
			if (this.lastTimestamp === 0) { // First loop
				this.lastTimestamp = currentTimestamp;
				this.callback(); return;
			}

			let delta = currentTimestamp - this.lastTimestamp; // Delta time is the time elapsed since the end of the previous frame, to the start of the current frame

			if (delta >= this.MS_PER_LOOP) { // If enough time has passed, run the callback
				this.lastTimestamp = currentTimestamp;
				this.callback(); return;
			} // else: do nothing
		}
		// TODO - implement alpha ticks
		tickwithalpha (currentTimestamp : number) {
			if (this.lastTimestamp === 0) this.lastTimestamp = currentTimestamp; // Initialize on the first loop

			// Catchup if lagging too much
			let delta = currentTimestamp - this.lastTimestamp; // Delta time is the time elapsed since the end of the previous frame, to the start of the current frame
			this.unprocessedTime += delta; // Unprocessed time is the time we have not ticked through yet

			for (let i = 1; i <= this.MAX_CATCHUP_LOOPS && this.unprocessedTime >= this.MS_PER_LOOP; i++) {
				// console.log(this);.
				this.callback(0);
				this.unprocessedTime -= this.MS_PER_LOOP;
			}
			// If even after the catchup loop we are still behind, reset and ignore all missed frames
			if (this.unprocessedTime >= this.MS_PER_LOOP) this.unprocessedTime = 0;

			this.lastTimestamp = currentTimestamp;
			this.callback(this.unprocessedTime / this.MS_PER_LOOP); // pass interpolation alpha (between 0 and 1)
		}

		reset () {
			this.unprocessedTime = 0;
			this.lastTimestamp = 0;
		}
	}

	export class GameLoop {
		private timers : GameLoopTimer[] = []; // The individual game loops for each requested loop
		private paused : boolean = false; // Whether the loop is paused or not
		private counters : { [key : string] : number } = {}; // Counters to measure loop rates

		private options ?: { "maxCatchupLoops" : number };

		constructor (
			loops : {
				[key : string] : {
					rate : number;
					callback : (alpha : number | null) => void; // Function to run on each loop
					interpolate ?: boolean // Optionally provide interpolation ability with an 'alpha' parameter in the callback, also results in the callback function being called as often as possible
				}
			}, options = undefined) {

			this.options = options;

			for (const key in loops) { this.counters[key] = 0; } // Generate a counter for each loop

			// Generate timers for each requested loop, also wrap it for fps logging
			this.timers = Object.entries(loops).map(([key, obj]) => {
				return new GameLoopTimer(obj.rate, (alpha) => {
					this.counters[key] += 1; // If frame was not interpolated, increment counter
					obj.callback(alpha);
				}, obj.interpolate, this.options?.maxCatchupLoops);
			});
		}

		private loop (timestamp : number) {
			if (this.paused) return;

			// Run each timer's individual loop
			for (const timer of this.timers) { timer.tick(timestamp); }

			this.nextFrame();
		}

		private nextFrame () { requestAnimationFrame(this.loop.bind(this)); }


		// Return the amount of loops that have happened since this function was last called
		public getLoopsSinceLastReport () {
			const current = { ...this.counters };
			for (const key in this.counters) { this.counters[key] = 0; }
			return current;
		}

		public start () { this.nextFrame(); }
		public pause () { this.paused = true; }
		public resume () { this.paused = false; this.nextFrame(); }
	}
	// Polyfill for Node.js environment or older browsers
	// function requestAnimationFrame (callback : FrameRequestCallback) { setTimeout(() => callback(performance.now()), 1); }


	export function weightedRandom (pairs : [number, any][], returnArray = false) {

		// Create array with n number of each value
		const ar = [];
		for (const [weight, value] of pairs) {
			for (let i = 0; i < weight; i++) {
				ar.push(value);
			}
		}
		if (returnArray) return ar;

		// Pick a random value from the array
		return ar[Math.floor(Math.random() * ar.length)];
	}

	export function arrayRandom (array : any[]) { return array[Math.floor(Math.random() * array.length)]; }




	export class MouseTrack {
		private _x : number;
		private _y : number;
		private set y (y : number) { this._y = y; }
		private set x (x : number) { this._x = x; }
		public get x () { return this._x; }
		public get y () { return this._y; }
		private update (x : number, y : number) { this._x = x; this._y = y; }
		constructor () {
			document.addEventListener("mousemove", (e) => this.update(e.clientX, e.clientY));
			document.addEventListener("touchmove", (e) => this.update(e.touches[0].clientX, e.touches[0].clientY));
			document.addEventListener("touchstart", (e) => this.update(e.touches[0].clientX, e.touches[0].clientY));
			document.addEventListener("touchend", (e) => this.update(e.changedTouches[0].clientX, e.changedTouches[0].clientY));
			document.addEventListener("touchcancel", (e) => this.update(e.changedTouches[0].clientX, e.changedTouches[0].clientY));
		}
	}
}

export default awa;




// const all = { rr, delay, getDistance, longestIn, removeANSI, Matrix, GameLoop, weightedRandom, arrayRandom, MouseTrack };
// export default all;
