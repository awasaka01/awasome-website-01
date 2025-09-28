import { symbols, WIDTH, HEIGHT } from "./global.js";
import * as awa from "@util";
export const visualLayers = {};
export const collisionLayers = {};
export class VisualLayer {
    imageData;
    data32;
    canvas;
    ctx;
    // Offscreen canvas used for scaled rendering
    offscreenCanvas;
    offscreenCtx;
    options;
    constructor(canvas, options) {
        options = { autoRender: true, ...options };
        if (options.resolution && awa.isPowerOf2(options.resolution) === false)
            throw new Error("resolution must be a power of 2");
        if (options.resolution) {
            canvas.width = WIDTH * options.resolution;
            canvas.height = HEIGHT * options.resolution;
            this.offscreenCanvas = document.createElement("canvas"); // Offscreen canvas at 1:1 scale for logic, will be scaled by resolution later
            this.offscreenCanvas.width = WIDTH;
            this.offscreenCanvas.height = HEIGHT;
            this.offscreenCtx = this.offscreenCanvas.getContext("2d");
            this.offscreenCtx.imageSmoothingEnabled = false;
        }
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        this.ctx = ctx;
        this.canvas = canvas;
        // Create Image Buffer, for efficient single pixel changes
        // imageData.data is an array with 4 bytes per pixel [r, g, b, a, r, g, b, a, ...],
        // data32 combines the 4 bytes into a single 32-bit number, access each individual byte using shifts [rgba, rgba, ...]
        this.imageData = new ImageData(WIDTH, HEIGHT); // (this.offscreenCtx ?? ctx).createImageData(WIDTH, HEIGHT);
        this.data32 = new Uint32Array(this.imageData.data.buffer);
        // Options
        this.options = options;
    }
    pixelsHaveBeenChanged = false;
    setPixel(index, RGBa32bit) {
        if (this.pixelsHaveBeenChanged === false)
            this.pixelsHaveBeenChanged = true;
        this.data32[index] = RGBa32bit;
    }
    draw(force = false) {
        if (!this.pixelsHaveBeenChanged && !force)
            return; // Only draw if a change has been made
        this.pixelsHaveBeenChanged = false;
        // If at normal resolution, just draw to visible canvas
        if (!this.options.resolution) {
            this.ctx.putImageData(this.imageData, 0, 0);
        }
        // If at scaled resolution, draw to offscreen canvas and scale from there
        else {
            this.offscreenCtx.putImageData(this.imageData, 0, 0);
            // Draw scaled from offscreen to visible canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.offscreenCanvas, 0, 0, WIDTH, HEIGHT, 0, 0, WIDTH * this.options.resolution, HEIGHT * this.options.resolution);
        }
        if (this.options.postProcess)
            this.options.postProcess(this);
    }
}
export class CollisionLayer {
    grid;
    cells = new Set();
    options;
    constructor(options = {}) {
        this.options = { autoTick: true, edgeLooping: true, ...options };
        // Generate an empty 1D array to store postitions of all cells on this layer, index = 'x + y * WIDTH'
        this.grid = Array.from({ length: WIDTH * HEIGHT }, () => null);
    }
    get(index) { return this.grid[index]; }
    add(cell) {
        const index = cell.index;
        const destination = this.grid[index];
        if (destination === undefined)
            throw Error(`Out of bounds: ${cell.x}, ${cell.y}`);
        if (destination !== null)
            return destination; // A cell already exists at this location
        this.cells.add(cell);
        this.grid[index] = cell;
        return symbols.success;
    }
    remove(cell) {
        if (this.cells.delete(cell) === false)
            throw Error(`Cell does not exist on this layer: ${cell}, ${JSON.stringify(this)}`);
        this.grid[cell.index] = null;
    }
    move(cell, toIndex) {
        const destination = this.grid[toIndex];
        if (destination === undefined)
            throw Error(`Out of bounds: ${cell.x}, ${cell.y}`);
        if (destination !== null)
            return destination; // A cell already exists at this location
        this.grid[cell.index] = null;
        this.grid[toIndex] = cell;
        return symbols.success;
    }
}
