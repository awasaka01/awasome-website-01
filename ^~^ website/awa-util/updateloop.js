export class UpdateLoop {
  /** Array of performance values */
  performanceHistory = {};
  // public get performanceHistory () { return this._performanceHistory; } private set performanceHistory (value) { this._performanceHistory = value; }
  maxPerformanceHistory;
  rate;
  frameDuration;
  // 1000 / rate
  maxCatchupTime;
  // 10 frames worth of time
  lastFrameTime = null;
  iteration = 0;
  running = false;
  steps;
  constructor(options) {
    options = { start: true, ...options };
    this.maxPerformanceHistory = options.maxPerformanceHistory;
    this.steps = options.steps;
    this.rate = options.rate;
    this.frameDuration = 1e3 / this.rate;
    this.maxCatchupTime = this.frameDuration * 10;
    options.steps.forEach((step) => this.performanceHistory[step.name] = []);
    if (options.start === true) this.start();
  }
  async run(timestamp = 0) {
    if (!this.running) return;
    if (this.lastFrameTime === null) this.lastFrameTime = timestamp;
    let elapsed = timestamp - this.lastFrameTime;
    if (elapsed > this.maxCatchupTime) {
      this.lastFrameTime = timestamp;
      elapsed = this.frameDuration;
    }
    while (elapsed >= this.frameDuration) {
      this.lastFrameTime += this.frameDuration;
      for (const step of this.steps) {
        const startTime = performance.now();
        await step(this.iteration);
        this.performanceHistory[step.name].push(performance.now() - startTime);
        if (this.performanceHistory[step.name].length > this.maxPerformanceHistory) {
          this.performanceHistory[step.name].shift();
        }
      }
      this.iteration++;
      elapsed = timestamp - this.lastFrameTime;
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
