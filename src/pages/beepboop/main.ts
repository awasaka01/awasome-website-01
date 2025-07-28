/*
	Potential optimizations: (styupid)
	Collect cells in color groups (Map<color, cells[]>) and draw them all at once, with .rect and .beginPath and stuff
*/

// Imports
import awa from "@util"; const { rr } = awa; // '@util' in tsconfig.json and vite config
import chroma from "chroma-js";

// Specific "Errors" / Exceptions(?)
const ErrOutOfBounds = Symbol("Out of bounds error");
const ErrNotEmpty = Symbol("Not empty error");




// Layers, seperated to allow being updated and rendered separately
let visualLayers : { "main" : VisualLayer; "notMoving" : VisualLayer; };
let collisionLayers : { "main" : CollisionLayer; };

abstract class BaseLayer {
	protected constructor () {}
}

// Visual Layer, only used for rendering to a canvas
class VisualLayer extends BaseLayer {
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
class CollisionLayer extends BaseLayer {
	private grid : Map<string, BaseCell | null>;
	public autoTick ?: boolean; // Whether to tick this layer in the main game loop, can still be manually triggered

	constructor (readonly width : number, readonly height : number,	{ autoTick = true } = {}) {
		if (width < 0 || height < 0) throw new Error(`[CollisionLayer] Width and height must be >= 0, got ${width}, ${height}`);
		super();
		this.width = width;
		this.height = height;
		this.autoTick = autoTick;
		this.cells = [];

		// Generate an empty Map to store postitions of all cells, coordinates are in the format `${x} ${y}`
		this.grid = new Map<string, BaseCell | null>(Array.from({ length: width * height }, (_, i) => [`${i % width} ${Math.trunc(i / width)}`, null]));
	}

	public move (cell : BaseCell, toX : number, toY : number) {
		const result = this.CheckIfInBoundsAndEmpty(toX, toY); if (result !== true) return result;
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
		const result = this.CheckIfInBoundsAndEmpty(x, y); if (result !== true) return result;
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




type BaseCellArgs = [
	x: number, y: number,
	collisionLayer: CollisionLayer, visualLayer: VisualLayer,
];
class BaseCell {
	private _x : number;
	private _y : number;
	public collisionLayer : CollisionLayer;
	public visualLayer : VisualLayer;
	public color : string;

	constructor (x : number, y : number, collisionLayer : CollisionLayer, visualLayer : VisualLayer, options : { color ?: string } = {}) {
		this._x = x;
		this._y = y;
		console.log(options);
		this.color = options.color || "#888888";
		this.collisionLayer = collisionLayer;
		this.visualLayer = visualLayer;

		const success = collisionLayer.set(x, y, this);
		if (success !== true) throw success;
		visualLayer.add(this);
	}

	get x () { return this._x;	}
	get y () { return this._y;	}

	draw () {
		this.visualLayer.ctx.fillStyle = this.color;
		this.visualLayer.ctx.fillRect(this.x, this.y, 1, 1);
	}

	move (byX : number, byY : number) {
		const success = this.collisionLayer.move(this, this.x + byX, this.y + byY);
		if (success !== true) return success;

		this._x += byX;	this._y += byY;
		return true;
	}

	moveRandomly () {
		const random = Math.random();
		random < 0.25 ? this.move(0, 1) : random < 0.5 ? this.move(0, -1) : random < 0.75 ? this.move(1, 0) : this.move(-1, 0);
	}

	nearestOf (type ?: typeof BaseCell, distanceFunction = this.distanceL2) {
		const cells = type === undefined ? this.collisionLayer.cells : this.collisionLayer.cells.filter((cell) => cell instanceof type);
		if (cells.length === 0) return null;
		return cells.reduce((nearest, cell) => distanceFunction.call(cell, this.x, this.y) < distanceFunction.call(nearest, this.x, this.y) ? cell : nearest);
	}

	// L1 / Manhattan distance (diamond), min amount of grid spaces needed to traverse to reach target
	distanceL1 (x : number, y : number) {
		return Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
	}
	// L2 / Euclidean distance (circle), straight line to target
	distanceL2 (x : number, y : number) {
		return Math.hypot(this.x - x, this.y - y);
	}
	// L∞ norm / Chebyshev distance (square), maximum of horizontal and vertical distance
	distanceLInf (x : number, y : number) {
		return Math.max(Math.abs(this.x - x), Math.abs(this.y - y));
	}

	tick () { console.error("Do not call BaseCell.tick, only use child classes");	}
}

class Drone extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: chroma.random().desaturate(10).brighten(-1).hex() });
	}
	tick () {
		// Move towards nearest queen
		const r = Math.random();
		if (r > 0.5) return this.moveRandomly();

		const target = this.nearestOf(Queen);
		if (target === null) return;

		if (this.distanceL1(target.x, target.y) > 20 || this.distanceL1(target.x, target.y) < 4) return;

		const directionX = this.x === target.y ? 0 : target.x > this.x ? 1 : -1;
		const directionY = this.y === target.y ? 0 : target.y > this.y ? 1 : -1;

		this.move(directionX, directionY);
	}
}

class NotMoving extends BaseCell {
	// constructor (...args : BaseCellArgs) {
	// 	super(...args);
	// }
	// tick () {}
	// draw () : void {
	// 	this.layer.ctx.fillStyle = this.color;
	// 	this.layer.ctx.rect(this.x, this.y, 1, 1);
	// 	this.layer.ctx.fillRect(this.x, this.y, 1, 1);
	// }
}

class Queen extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: "#f0ef03" });
	}
	tick () : void {
		// Just move randomly
		this.moveRandomly();
	}
}

window.addEventListener("DOMContentLoaded", () => {

	// Setup layers
	const canvasElements = Array.from(document.getElementById("layers").children) as HTMLCanvasElement[];
	visualLayers = {
		"main": new VisualLayer(canvasElements[0]),
		"notMoving": new VisualLayer(canvasElements[1], { autoRender: false }), // Layer for cells that don't move, therefore don't need to be updated constantly
	};
	collisionLayers = {
		"main": new CollisionLayer(canvasElements[0].width, canvasElements[0].height),
	};


	const spawnRandomly = (type : typeof BaseCell, collisionLayer = collisionLayers.main, visualLayer = visualLayers.main, options = {}) => {
		try {
			const r = new type(rr(0, visualLayer.canvas.width - 1), rr(0, visualLayer.canvas.height - 1), collisionLayer, visualLayer, options);
		} catch (e) {
			spawnRandomly(type, collisionLayer, visualLayer, options);
		}
	};

	const a = visualLayers.main;
	const b = collisionLayers.main;
	new Queen(rr(0, a.canvas.width - 1), rr(0, a.canvas.height - 1), b, a);

	// spawnRandomly(Queen, "#ff00ea", mainLayer);
	// spawnRandomly(Queen, "#ff00ea", mainLayer);
	// spawnRandomly(Queen, "#ff00ea", mainLayer);
	// spawnRandomly(Queen, "#ff00ea", mainLayer);

	for (let i = 0; i < 20; i++) {
		spawnRandomly(Drone, collisionLayers.main, visualLayers.main);
	}

	const layersToRender = Object.values(visualLayers).filter((layer) => layer.autoRender === true);
	const layersToTick = Object.values(collisionLayers).filter((layer) => layer.autoTick === true);
	const Game = new awa.GameLoop({
		tick: {
			rate: 40,
			callback: () => {
				layersToTick.forEach((layer) => {
					layer.cells.forEach((cell) => cell.tick());
				});
			},
		},
		render: {
			rate: 15,
			callback: (a) => {
				layersToRender.forEach((layer) => {
					// layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
					layer.draw();
				});
			},
		},
	});

	Game.start();
	// setInterval(() => {
	// 	console.log(`Rates: ${Object.entries(Game.getLoopsSinceLastReport()).map(([key, count]) => `${key}: ${count}`).join(", ")}`);
	// }, 1000);
});
