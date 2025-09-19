
type UpdateLoopOptions = {
	rate : number;
	steps : ((iteration : number) => void)[];
	maxPerformanceHistory ?: number;
	start ?: boolean;
};
export class UpdateLoop {
	/** Array of performance values */
	public performanceHistory : { [key : string] : number[] } = {}; // public get performanceHistory () { return this._performanceHistory; } private set performanceHistory (value) { this._performanceHistory = value; }
	public maxPerformanceHistory : number;

	readonly rate : number;
	readonly frameDuration : number; // 1000 / rate
	private readonly maxCatchupTime : number; // 10 frames worth of time

	private lastFrameTime = null;
	public iteration = 0;
	public running = false;
	public steps : ((iteration : number) => void | Promise<void>)[];

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

		if (elapsed > this.maxCatchupTime) { this.lastFrameTime = timestamp; elapsed = this.frameDuration; }

		while (elapsed >= this.frameDuration) {
			this.lastFrameTime += this.frameDuration; // Advance by fixed frameDuration to keep consistent update intervals and avoid timing drift

			for (const step of this.steps) {
				const startTime = performance.now();

				// Run the step, passing in the current iteration count
				await step(this.iteration);

				// Calculate how long the step took and record it in performance history, then shift if needed
				this.performanceHistory[step.name].push(performance.now() - startTime);
				if (this.performanceHistory[step.name].length > this.maxPerformanceHistory) {
					this.performanceHistory[step.name].shift();
				}
			}

			this.iteration++;
			elapsed = timestamp - this.lastFrameTime; // Recalculate elapsed!
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
