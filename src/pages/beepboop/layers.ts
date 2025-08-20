import type { BaseCell } from "./cells.js";
import * as types from "./types.js";
const { ErrNotEmpty, ErrOutOfBounds } = types;


export abstract class BaseLayer {
	protected constructor () {}
}

// Visual Layer, only used for rendering to a canvas
export class VisualLayer extends BaseLayer {
	readonly canvas : HTMLCanvasElement;
	readonly ctx : CanvasRenderingContext2D;
	public autoRender ?: boolean;
	public cells : BaseCell[];

	constructor (canvas : HTMLCanvasElement, { autoRender = true } = {}) {
		super();
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.ctx.imageSmoothingEnabled = false;
		this.autoRender = autoRender;
		this.cells = [];
	}
	public draw () {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.cells.forEach((cell) => cell.draw());
	}
	public add (cell : BaseCell) { this.cells.push(cell); }
	public remove (cell : BaseCell) { this.cells.splice(this.cells.indexOf(cell), 1); }
}

// Collision Layer, used for updates
export class CollisionLayer extends BaseLayer {
	private grid : Map<string, BaseCell | null>;
	public autoTick ?: boolean; // Whether to tick this layer in the main game loop, can still be manually triggered

	constructor (readonly width : number, readonly height : number,	{ autoTick = true, edgeLooping = true } = {}) {
		if (width < 0 || height < 0) throw new Error(`[CollisionLayer] Width and height must be >= 0, got ${width}, ${height}`);
		super();
		this.width = width;
		this.height = height;
		this.autoTick = autoTick;
		this.cells = [];

		// Generate an empty Map to store postitions of all cells, coordinates are in the format `${x} ${y}`
		this.grid = new Map<string, BaseCell | null>(Array.from({ length: width * height }, (_, i) => [`${i % width} ${Math.trunc(i / width)}`, null]));
	}

	public move (cell : BaseCell, toX : number, toY : number, skipCheck = false) {
		if (skipCheck !== true) {
			const result = this.CheckIfInBoundsAndEmpty(toX, toY); if (result !== true)
			return result;
		}
		this.grid.set(`${cell.x} ${cell.y}`, null);
		this.grid.set(`${toX} ${toY}`, cell);
		return true;
	}
	public set (x : number, y : number, cell : BaseCell) {
		const result = this.CheckIfInBoundsAndEmpty(x, y); if (result !== true) return result;
		this.grid.set(`${x} ${y}`, cell);
		this.cells.push(cell);
		return true;
	}
	public remove (x : number, y : number) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return ErrOutOfBounds;
		this.grid.set(`${x} ${y}`, null);
		this.cells.splice(this.cells.findIndex((cell) => cell.x === x && cell.y === y), 1);
		return true;
	}

	public get (x : number, y : number) { return this.grid.get(`${x} ${y}`); }

	// Safety checks to avoid sneaky bugs
	private CheckIfInBoundsAndEmpty (x : number, y : number) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return ErrOutOfBounds;
		if (this.grid.get(`${x} ${y}`) !== null) return ErrNotEmpty;
		return true;
	}

	// Outside of class methods, do not allow modifying the cells array directly
	private _cells : BaseCell[];
	public get cells () { return this._cells; }
	protected set cells (arr : BaseCell[]) { this._cells = arr; }
}
