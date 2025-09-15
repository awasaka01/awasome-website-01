class GameLoopTimer {
  unprocessedTime = 0;
  lastTimestamp = 0;
  MS_PER_LOOP;
  callback;
  MAX_CATCHUP_LOOPS;
  INTERPOLATION_ENABLED;
  _ticksSinceStart = 0;
  get ticksSinceStart() {
    return this._ticksSinceStart;
  }
  set ticksSinceStart(value) {
    this._ticksSinceStart = value;
  }
  constructor(targetRate, callback, interpolate = false, MAX_CATCHUP_LOOPS = 20) {
    this.MS_PER_LOOP = 1e3 / targetRate;
    this.callback = callback;
    this.MAX_CATCHUP_LOOPS = MAX_CATCHUP_LOOPS;
    this.INTERPOLATION_ENABLED = interpolate;
  }
  tick(currentTimestamp) {
    if (this.lastTimestamp === 0) {
      this._ticksSinceStart += 1;
      this.lastTimestamp = currentTimestamp;
      this.callback(this.ticksSinceStart);
      return;
    }
    let delta = currentTimestamp - this.lastTimestamp;
    if (delta >= this.MS_PER_LOOP) {
      this._ticksSinceStart += 1;
      this.lastTimestamp = currentTimestamp;
      this.callback(this.ticksSinceStart);
      return;
    }
  }
  // TODO - implement alpha ticks
  tickwithalpha(currentTimestamp) {
    if (this.lastTimestamp === 0) this.lastTimestamp = currentTimestamp;
    let delta = currentTimestamp - this.lastTimestamp;
    this.unprocessedTime += delta;
    for (let i = 1; i <= this.MAX_CATCHUP_LOOPS && this.unprocessedTime >= this.MS_PER_LOOP; i++) {
      this.callback(0);
      this.unprocessedTime -= this.MS_PER_LOOP;
    }
    if (this.unprocessedTime >= this.MS_PER_LOOP) this.unprocessedTime = 0;
    this.lastTimestamp = currentTimestamp;
    this.callback(this.unprocessedTime / this.MS_PER_LOOP);
  }
  reset() {
    this.unprocessedTime = 0;
    this.lastTimestamp = 0;
  }
}
export class GameLoop {
  timers = [];
  // The individual game loops for each requested loop
  paused = false;
  // Whether the loop is paused or not
  counters = {};
  // Counters to measure loop rates
  options;
  constructor(loops, options = void 0) {
    this.options = options;
    for (const key in loops) {
      this.counters[key] = 0;
    }
    this.timers = Object.entries(loops).map(([key, obj]) => {
      return new GameLoopTimer(obj.rate, (alpha) => {
        this.counters[key] += 1;
        obj.callback(alpha);
      }, obj.interpolate, this.options?.maxCatchupLoops);
    });
  }
  loop(timestamp) {
    if (this.paused) return;
    for (const timer of this.timers) {
      timer.tick(timestamp);
    }
    this.nextFrame();
  }
  nextFrame() {
    requestAnimationFrame(this.loop.bind(this));
  }
  // Return the amount of loops that have happened since this function was last called
  getLoopsSinceLastReport() {
    const current = { ...this.counters };
    for (const key in this.counters) {
      this.counters[key] = 0;
    }
    return current;
  }
  start() {
    this.nextFrame();
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
    this.nextFrame();
  }
}
