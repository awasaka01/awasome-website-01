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
    unprocessedTime = 0;
    lastTimestamp = 0;
    MS_PER_LOOP;
    callback;
    MAX_CATCHUP_LOOPS;
    constructor(targetRate, callback, MAX_CATCHUP_LOOPS = 20) {
        this.MS_PER_LOOP = 1000 / targetRate;
        this.callback = callback;
        this.MAX_CATCHUP_LOOPS = MAX_CATCHUP_LOOPS;
    }
    loop(currentTimestamp) {
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
class GameLoop {
    timers = []; // The individual game loops for each requested loop
    paused = false; // Whether the loop is paused or not
    counters = {}; // Counters to measure loop rates
    options;
    constructor(loops, options = undefined) {
        // Generate timers for each requested loop, also wrap it for fps logging
        this.timers = Object.entries(loops).map(([key, obj]) => {
            this.counters[key] = 0; // Generate a counter for each loop
            return new GameLoopTimer(obj.rate, (alpha) => {
                if (alpha === 0)
                    this.counters[key] += 1; // If frame was not interpolated, increment counter
                obj.callback(alpha);
            });
        });
    }
    loop(timestamp) {
        if (this.paused)
            return;
        // Run each timer's individual loop
        for (const timer of this.timers) {
            timer.loop(timestamp);
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
// Polyfill for Node.js environment or older browsers
function requestAnimationFrame(callback) {
    setTimeout(() => callback(performance.now()), 1);
}
const game = new GameLoop({
    "update": { rate: 60, callback: () => { } },
    "draw": { rate: 30, callback: () => { } },
});
game.start();
setInterval(() => {
    console.log(`Rates: ${Object.entries(game.getLoopsSinceLastReport()).map(([key, count]) => `${key}: ${count * 2}`).join(", ")}`);
}, 500);
export {};
