import { BaseCell } from "./cells.js";
import { config, mouse, clr, symbols, WIDTH, HEIGHT, indexToXY } from "./global.js";


// Visual Layer, only used for rendering to a canvas
export class VisualLayer {
	private imageData : ImageData;
	private data32 : Uint32Array;

	readonly canvas : HTMLCanvasElement;
	readonly ctx : CanvasRenderingContext2D;

	public autoRender ?: boolean;

	constructor (canvas : HTMLCanvasElement, { autoRender = true } = {}) {
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		this.ctx = ctx;
		this.canvas = canvas;

		// Create Image Buffer, for efficient single pixel changes
		// imageData.data is an array with 4 bytes per pixel [r, g, b, a, r, g, b, a, ...],
		// data32 combines the 4 bytes into a single 32-bit number, access each individual byte using shifts [rgba, rgba, ...]
		this.imageData = ctx.createImageData(WIDTH, HEIGHT);
		this.data32 = new Uint32Array(this.imageData.data.buffer);

		// Options
		this.autoRender = autoRender;
	}


	private pixelsHaveBeenChanged = false;

	public setPixel (index : number, RGBa32bit : number) {
		if (this.pixelsHaveBeenChanged === false) this.pixelsHaveBeenChanged = true;
		this.data32[index] = RGBa32bit;
	}

	public draw () {
		if (this.pixelsHaveBeenChanged) { // Only draw if a change has been made
			this.pixelsHaveBeenChanged = false;
			this.ctx.putImageData(this.imageData, 0, 0);
		}
	}
}



// Collision Layer, used for updates
type CollisionLayerOptions = { autoTick ?: boolean, edgeLooping ?: boolean };
export class CollisionLayer {

	public grid : (BaseCell | null)[];
	public cells : Set<BaseCell> = new Set();
	public options : CollisionLayerOptions;

	constructor (options : CollisionLayerOptions = {}) {
		this.options = { autoTick: true, edgeLooping: true, ...options };

		// Generate an empty 2D array to store postitions of all cells on this layer, index = 'x + y * WIDTH'
		this.grid = Array.from({ length: WIDTH * HEIGHT }, () => null);
	}


	public get (index : number) { return this.grid[index]; }

	public add (cell : BaseCell) : Symbol | BaseCell | void {
		const index = cell.index;
		const destination = this.grid[index];

		if (destination === undefined) throw Error(`Out of bounds: ${cell.x}, ${cell.y}`);
		if (destination !== null) return destination; // A cell already exists at this location

		this.cells.add(cell);
		this.grid[index] = cell;
		return symbols.success;
	}

	public remove (cell : BaseCell) {
		if (this.cells.delete(cell) === false) throw Error(`Cell does not exist on this layer: ${cell}, ${JSON.stringify(this)}`);
		this.grid[cell.index] = null;
	}

	public move (cell : BaseCell, toIndex : number) {
		const destination = this.grid[toIndex];

		if (destination === undefined) throw Error(`Out of bounds: ${cell.x}, ${cell.y}`);
		if (destination !== null) return destination; // A cell already exists at this location

		this.grid[cell.index] = null;
		this.grid[toIndex] = cell;
		return symbols.success;
	}
}

