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

	// L1 / Manhattan distance (diamond), min amount of grid spaces needed to traverse to reach target
	export function distanceL1 (x1 : number, y1 : number, x2 : number, y2 : number) {
		return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
	}
	// L2 / Euclidean distance (circle), straight line to target
	export function distanceL2 (x1 : number, y1 : number, x2 : number, y2 : number) {
		return Math.hypot(x1 - x2, y1 - y2);
	}
	// L∞ norm / Chebyshev distance (square), maximum of horizontal and vertical distance
	export function distanceLInf (x1 : number, y1 : number, x2 : number, y2 : number) {
		return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
	}

	type Generate = (x : number, y : number) => any;
	type Array2D = any[][];
	export function generate2DArray (width : number, height : number, fn ?: Generate) : Array2D {
		const arr : Array2D = [];
		for (let y = 0; y < height; y++) {
			arr.push([]);
			for (let x = 0; x < width; x++) {
				arr[y].push(fn ? fn(x, y) : null);
			}
		}
		return arr;
	}

	export class Matrix {
		public array : Array2D;

		// "Overload signatures"
		constructor (array : Array2D);
		constructor (width : number, height : number, fn ?: Generate);

		constructor (arg1 : (Array2D | number), height ?: number, mappingFunction : Generate = () => null) {

			// If arg1 is a number, and all other arguments are defined, generate the matrix with that width and height
			if (typeof arg1 === "number" && height && mappingFunction) {
				const width = arg1;
				this.array = generate2DArray(width, height, mappingFunction);
			}
			// If arg1 is an array, use it for the matrix
			else if (Array.isArray(arg1)) {
				this.array = arg1;
			}
		}

		// Transpose : Swap rows and columns
		transpose () { this.array = Matrix.transpose(this.array); return this; }
		static transpose (matrix : Array2D) {
			Matrix.validate(matrix);

			const output : Array2D = [];
			const longestRowLength = longestIn(matrix).length;


			for (let i = 0; i < matrix.length; i++) {
				for (var j = 0; j < longestRowLength; j++) {
					if (output[j] === undefined) output[j] = [];
					output[j][i] = matrix[i][j] ?? "";
				}
			}
			return output;
		}

		static getRect (
			matrix : Array2D, x : number, y : number, width : number, height : number,
			options ?: { fill ?: boolean },
		) : any[] {

			return [];
		}


		reverseRows () { this.array = Matrix.reverseRows(this.array); return this; }
		static reverseRows (matrix : Array2D) {
			Matrix.validate(matrix);
			for (let i = 0; i < matrix.length; i++) { matrix[i].reverse(); }
			return matrix;
		}

		validate () { this.array = Matrix.validate(this.array); return this; }
		static validate (matrix : Array2D) { if (!Array.isArray(matrix) || matrix.some((row) => !Array.isArray(row))) { throw new Error("rotate2DArray: Array must be a 2D array, got " + JSON.stringify(matrix)); } return matrix; }


		rotate (angle = 90) { this.array = Matrix.rotate(this.array, angle); return this; }
		static rotate (matrix : Array2D, angle = 90) {
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

	class GameLoopTimer {
		private unprocessedTime = 0;
		private lastTimestamp = 0;
		private readonly MS_PER_LOOP : number;

		private callback : (alpha ?: number) => void;
		private readonly MAX_CATCHUP_LOOPS : number;
		private readonly INTERPOLATION_ENABLED : boolean;

		private _ticksSinceStart = 0;
		public get ticksSinceStart () { return this._ticksSinceStart; }
		private set ticksSinceStart (value : number) { this._ticksSinceStart = value; }

		constructor (targetRate : number, callback : (alpha ?: number) => void, interpolate : boolean = false, MAX_CATCHUP_LOOPS = 20) {
			this.MS_PER_LOOP = 1000 / targetRate;
			this.callback = callback;
			this.MAX_CATCHUP_LOOPS = MAX_CATCHUP_LOOPS;
			this.INTERPOLATION_ENABLED = interpolate;

		}
		tick (currentTimestamp : number) {
			if (this.lastTimestamp === 0) { // First loop
				this._ticksSinceStart += 1;
				this.lastTimestamp = currentTimestamp;
				this.callback(this.ticksSinceStart); return;
			}

			let delta = currentTimestamp - this.lastTimestamp; // Delta time is the time elapsed since the end of the previous frame, to the start of the current frame

			if (delta >= this.MS_PER_LOOP) { // If enough time has passed, run the callback
				this._ticksSinceStart += 1;
				this.lastTimestamp = currentTimestamp;
				this.callback(this.ticksSinceStart); return;
			} // else: do nothing
		}
		// TODO - implement alpha ticks
		tickwithalpha (currentTimestamp : number) {
			if (this.lastTimestamp === 0) this.lastTimestamp = currentTimestamp; // Initialize on the first loop

			// Catchup if lagging too much
			let delta = currentTimestamp - this.lastTimestamp; // Delta time is the time elapsed since the end of the previous frame, to the start of the current frame
			this.unprocessedTime += delta; // Unprocessed time is the time we have not ticked through yet

			for (let i = 1; i <= this.MAX_CATCHUP_LOOPS && this.unprocessedTime >= this.MS_PER_LOOP; i++) {
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



	//
	class MouseTracker {
		private _x : number;
		private _y : number;
		private set y (y : number) { this._y = y; }
		private set x (x : number) { this._x = x; }
		public get x () { return this._x; }
		public get y () { return this._y; }
		private update (x : number, y : number) { this._x = x; this._y = y; }
		constructor (target : HTMLElement | HTMLDocument = document) {
			target.addEventListener("mousemove", (e : Event) => this.update((e as MouseEvent).offsetX, (e as MouseEvent).offsetY));

		}
	}

	let mouse = undefined;
	export function trackMouse (target ?: HTMLElement) : MouseTracker {
		if (mouse !== undefined) return mouse;
		mouse = new MouseTracker(target);
		return mouse;
	}

	class TrackedInput {
		name : string;

		element : HTMLInputElement;
		eventNames : string[] = [];
		public callbacks : { "input" : ((e : { target : HTMLInputElement } & Event) => void)[], "change" : ((e : { target : HTMLInputElement } & Event) => void)[] } = { "input": [], "change": [] };
		constructor (element) {
			this.element = element;
			this.name = element.name;

			// Add event listeners
			this.element.addEventListener("input", (e) => { for (const callback of this.callbacks.input) { callback(e as { target : HTMLInputElement } & Event); } });
			this.element.addEventListener("change", (e) => { for (const callback of this.callbacks.change) { callback(e as { target : HTMLInputElement } & Event); } });
		}
		public listen (event : ("input" | "change"), callback : (e : { target : HTMLInputElement } & Event) => void) {
			this.callbacks[event].push(callback);
			callback({ target: this.element } as { target : HTMLInputElement } & Event);
		}
		public getValue () {
			if (this.element.type === "checkbox") return `${this.element.checked}`;
			return this.element.value;
		}
		public get value () { return this.element.value; }
	}


	class InputTracker {
		static inputs : TrackedInput[] = [];

		// Register an 'input' element to be tracked on change, triggering callbacks that can be attached by '.listen()'
		static addInput (input : HTMLInputElement) {
			const trackedInput = new TrackedInput(input);
			this.inputs.push(trackedInput);
			return trackedInput;
		}

		// Register an 'output' element to automatically fill itself with the value of a TrackedInput, when it changes
		static addOutput (output : HTMLOutputElement) {
			const targetInput = this.inputs.find((input) => input.name === output.name);
			if (targetInput === undefined) throw new Error(`No matching input found for name ${output.name}, or it is not yet tracked`);
			targetInput.listen("input", () => output.value = targetInput.getValue());
			output.value = targetInput.getValue();
		}
		static get (name : string) {
			return this.inputs.find((input) => input.name === name);
		}
	}


	export function trackInputs (identifierClassName = "awa-input") {

		// Start tracking all inputs currently on page, that have class
		const inputElements = document.querySelectorAll(`input.${identifierClassName}`) as NodeListOf<HTMLInputElement>;
		for (const input of inputElements) {
			if (input.id === undefined) throw new Error("Tracked element must have an id");
			InputTracker.addInput(input);
		}

		// Add all output elements to the element it wants to be output for
		const outputElements = document.querySelectorAll(`output.${identifierClassName}`) as NodeListOf<HTMLOutputElement>;
		for (const output of outputElements) {
			if (output.name === undefined) throw new Error("Tracked element must have a specified 'name' attribute");
			InputTracker.addOutput(output);
		}

		return InputTracker; //
	}


	export function average (arr : number[]) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

}

export default awa;




// const all = { rr, delay, getDistance, longestIn, removeANSI, Matrix, GameLoop, weightedRandom, arrayRandom, MouseTrack };
// export default all;
