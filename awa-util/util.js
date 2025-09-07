export * from "./matrix.js";
export * from "./input_tracking.js";
/** Generate a random whole number between min and max */
export const rr = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
/** A promise that resolves after t milliseconds */
export const delay = async (t = 1000) => new Promise((resolve) => setTimeout(resolve, t));
export const longestIn = (array) => {
    let longest = array[0];
    for (const x of array) {
        if (longest.length < x.length)
            longest = x;
    }
    return longest;
};
const a = longestIn(["a", "b", "c", [], { a: 1, length: 2 }]);
export const removeANSI = (str) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, "");
class GameLoopTimer {
    unprocessedTime = 0;
    lastTimestamp = 0;
    MS_PER_LOOP;
    callback;
    MAX_CATCHUP_LOOPS;
    INTERPOLATION_ENABLED;
    _ticksSinceStart = 0;
    get ticksSinceStart() { return this._ticksSinceStart; }
    set ticksSinceStart(value) { this._ticksSinceStart = value; }
    constructor(targetRate, callback, interpolate = false, MAX_CATCHUP_LOOPS = 20) {
        this.MS_PER_LOOP = 1000 / targetRate;
        this.callback = callback;
        this.MAX_CATCHUP_LOOPS = MAX_CATCHUP_LOOPS;
        this.INTERPOLATION_ENABLED = interpolate;
    }
    tick(currentTimestamp) {
        if (this.lastTimestamp === 0) { // First loop
            this._ticksSinceStart += 1;
            this.lastTimestamp = currentTimestamp;
            this.callback(this.ticksSinceStart);
            return;
        }
        let delta = currentTimestamp - this.lastTimestamp; // Delta time is the time elapsed since the end of the previous frame, to the start of the current frame
        if (delta >= this.MS_PER_LOOP) { // If enough time has passed, run the callback
            this._ticksSinceStart += 1;
            this.lastTimestamp = currentTimestamp;
            this.callback(this.ticksSinceStart);
            return;
        } // else: do nothing
    }
    // TODO - implement alpha ticks
    tickwithalpha(currentTimestamp) {
        if (this.lastTimestamp === 0)
            this.lastTimestamp = currentTimestamp; // Initialize on the first loop
        // Catchup if lagging too much
        let delta = currentTimestamp - this.lastTimestamp; // Delta time is the time elapsed since the end of the previous frame, to the start of the current frame
        this.unprocessedTime += delta; // Unprocessed time is the time we have not ticked through yet
        for (let i = 1; i <= this.MAX_CATCHUP_LOOPS && this.unprocessedTime >= this.MS_PER_LOOP; i++) {
            this.callback(0);
            this.unprocessedTime -= this.MS_PER_LOOP;
        }
        // If even after the catchup loop we are still behind, reset and ignore all missed frames
        if (this.unprocessedTime >= this.MS_PER_LOOP)
            this.unprocessedTime = 0;
        this.lastTimestamp = currentTimestamp;
        this.callback(this.unprocessedTime / this.MS_PER_LOOP); // pass interpolation alpha (between 0 and 1)
    }
    reset() {
        this.unprocessedTime = 0;
        this.lastTimestamp = 0;
    }
}
export class GameLoop {
    timers = []; // The individual game loops for each requested loop
    paused = false; // Whether the loop is paused or not
    counters = {}; // Counters to measure loop rates
    options;
    constructor(loops, options = undefined) {
        this.options = options;
        for (const key in loops) {
            this.counters[key] = 0;
        } // Generate a counter for each loop
        // Generate timers for each requested loop, also wrap it for fps logging
        this.timers = Object.entries(loops).map(([key, obj]) => {
            return new GameLoopTimer(obj.rate, (alpha) => {
                this.counters[key] += 1; // If frame was not interpolated, increment counter
                obj.callback(alpha);
            }, obj.interpolate, this.options?.maxCatchupLoops);
        });
    }
    loop(timestamp) {
        if (this.paused)
            return;
        // Run each timer's individual loop
        for (const timer of this.timers) {
            timer.tick(timestamp);
        }
        this.nextFrame();
    }
    nextFrame() { requestAnimationFrame(this.loop.bind(this)); }
    // Return the amount of loops that have happened since this function was last called
    getLoopsSinceLastReport() {
        const current = { ...this.counters };
        for (const key in this.counters) {
            this.counters[key] = 0;
        }
        return current;
    }
    start() { this.nextFrame(); }
    pause() { this.paused = true; }
    resume() { this.paused = false; this.nextFrame(); }
}
export function weightedRandom(pairs, returnArray = false) {
    // Create array with n number of each value
    const ar = [];
    for (const [weight, value] of pairs) {
        for (let i = 0; i < weight; i++) {
            ar.push(value);
        }
    }
    if (returnArray)
        return ar;
    // Pick a random value from the array
    return ar[Math.floor(Math.random() * ar.length)];
}
export function arrayRandom(array) { return array[Math.floor(Math.random() * array.length)]; }
//
export function average(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
export const isPowerOf2 = (n) => n > 0 && (n & (n - 1)) === 0;
export class UpdateLoop {
    /** Array of performance values */
    performanceHistory = {}; // public get performanceHistory () { return this._performanceHistory; } private set performanceHistory (value) { this._performanceHistory = value; }
    maxPerformanceHistory;
    rate;
    frameDuration; // 1000 / rate
    maxCatchupTime; // 10 frames worth of time
    lastFrameTime = null;
    iteration = 0;
    running = false;
    steps;
    constructor(options) {
        options = { start: true, ...options };
        this.maxPerformanceHistory = options.maxPerformanceHistory;
        this.steps = options.steps;
        this.rate = options.rate;
        this.frameDuration = 1000 / this.rate;
        this.maxCatchupTime = this.frameDuration * 10;
        options.steps.forEach((step) => (this.performanceHistory[step.name] = []));
        if (options.start === true)
            this.start();
    }
    async run(timestamp = 0) {
        if (!this.running)
            return;
        if (this.lastFrameTime === null)
            this.lastFrameTime = timestamp;
        // While the elapsed time since the last processed frame is greater than or equal to
        // the expected frame duration, process another update step. Catch-up loop
        let elapsed = timestamp - this.lastFrameTime;
        if (elapsed > this.maxCatchupTime) {
            this.lastFrameTime = timestamp;
            elapsed = this.frameDuration;
        }
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
    start() {
        if (!this.running) {
            this.running = true;
            requestAnimationFrame((ts) => this.run(ts));
        }
    }
    stop() {
        this.running = false;
    }
}
// L1 / Manhattan distance (diamond), min amount of grid spaces needed to traverse to reach target
// L2 / Euclidean distance (circle), straight line to target
// L∞ norm / Chebyshev distance (square), maximum of horizontal and vertical distance
export const distanceL1 = (...[x1, y1, x2, y2]) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
export const distanceL2 = (...[x1, y1, x2, y2]) => Math.hypot(x1 - x2, y1 - y2);
export const distanceLInf = (...[x1, y1, x2, y2]) => Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
// Precomputes and caches coordinate offsets for a given radius + metric (L1, L2, LINF)
// Returns a flat Int32Array [dx, dy, distance, dx, dy, distance, ...] for fast coordinate lookup
const offsetCaches = { L1: {}, L2: {}, LINF: {} };
export function getOffsets(radius, metric = "L2") {
    const cached = offsetCaches[metric][radius];
    if (cached)
        return cached;
    let offsets = [];
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if (x === 0 && y === 0)
                continue;
            let dist;
            switch (metric) {
                case "L1":
                    dist = Math.sqrt(x * x + y * y);
                    break;
                case "L2":
                    dist = Math.hypot(x, y);
                    break;
                case "LINF":
                    dist = Math.max(Math.abs(x), Math.abs(y));
                    break;
            }
            if (dist <= radius)
                offsets.push([x, y, dist * 10000]);
        }
    }
    offsets.sort((a, b) => a[2] - b[2]); // Sort by distance
    const result = new Int32Array(offsets.flat());
    offsetCaches[metric][radius] = result;
    return result;
}
// Deprecated
// export const getDistance = (coordA : [number, number], coordB : [number, number]) => { return Math.sqrt((coordA[0] - coordB[0]) ** 2 + (coordA[1] - coordB[1]) ** 2); };
