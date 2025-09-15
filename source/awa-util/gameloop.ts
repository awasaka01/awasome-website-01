// UNUSED
// UNUSED
// UNUSED
// UNUSED
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
