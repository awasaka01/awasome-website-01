import { CollisionLayer, VisualLayer } from "./layers.js";
import * as types from "./types.js"; const { ErrNotEmpty, ErrOutOfBounds } = types;
import chroma from "chroma-js";


type BaseCellArgs = [
	x: number, y: number,
	collisionLayer: CollisionLayer, visualLayer: VisualLayer,
];
export class BaseCell {
	private _x : number;
	private _y : number;
	public collisionLayer : CollisionLayer;
	public visualLayer : VisualLayer;
	public color : string;


	constructor (x : number, y : number, collisionLayer : CollisionLayer, visualLayer : VisualLayer, options : { color ?: string } = {}) {
		this._x = x;
		this._y = y;
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
		// const toX = (this.x + byX + this.collisionLayer.width) % this.collisionLayer.width;// const toY = (this.y + byY + this.collisionLayer.height) % this.collisionLayer.height;
		if (byX === 0 && byY === 0) return false;
		const toX = this.x + byX; const toY = this.y + byY;
		const target = this.collisionLayer.get(toX, toY);
		if (target === undefined) return ErrOutOfBounds;

		if (target !== null) {
			target.collision(this);
			this.collision(target);
			return;
		}

		this.collisionLayer.move(this, toX, toY, true);

		this._x = toX; this._y = toY;
		return true;
	}

	moveRandomly () {
		const random = Math.random();
		random < 0.25 ? this.move(0, 1) : random < 0.5 ? this.move(0, -1) : random < 0.75 ? this.move(1, 0) : this.move(-1, 0);
	}

	nearestOf (type : typeof BaseCell = BaseCell, distanceFunction = this.distanceL1) {
		const cells = this.collisionLayer.cells.filter((cell) => cell instanceof type && cell !== this);
		if (cells.length === 0) return null;
		return cells.reduce((nearest, cell) => distanceFunction.call(cell, this.x, this.y) < distanceFunction.call(nearest, this.x, this.y) ? cell : nearest);
	}
	nearest (filter ?: (cell : BaseCell) => boolean, distanceFunction = this.distanceL1) {
		const cells = this.collisionLayer.cells.filter((cell) => (filter ? filter(cell) : true) && cell !== this);
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

	delete () {
		this.collisionLayer.remove(this.x, this.y);
		this.visualLayer.remove(this);
		this.visualLayer.draw();
	}

	tick () { throw new Error("Do not call BaseCell.tick, only use child classes");	}
	collision (target : BaseCell) : (boolean | void) {}
}

export class Drone extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: chroma.random().desaturate(10).brighten(-1).hex() });
	}
	tick () {
		// Move towards nearest queen
		const r = Math.random();
		if (r > 0.5) return this.moveRandomly();

		const target = this.nearestOf(Queen);
		if (target === null) return;

		if (this.distanceL1(target.x, target.y) > 10 || this.distanceL1(target.x, target.y) < 5) return;

		const directionX = this.x === target.y ? 0 : target.x > this.x ? 1 : -1;
		const directionY = this.y === target.y ? 0 : target.y > this.y ? 1 : -1;

		this.move(directionX, directionY);
	}
	collision (target : BaseCell) {
		// this.color = "#ff0000";
	}
}

export class NotMoving extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: "#4b3535" });
	}
	tick () {}
}

export class Scared extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: "#ffffff" });
	}
	tick () {
		if (Math.random() > 0.7) return this.moveRandomly();

		const target = this.nearest((cell) => !(cell instanceof Scared), this.distanceL2);
		if (target === null) return;

		const directionX = this.x === target.y ? 0 : target.x > this.x ? 1 : -1;
		const directionY = this.y === target.y ? 0 : target.y > this.y ? 1 : -1;

		this.move(-directionX, -directionY);
	}
}

export class Hunter extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: "#ff0000" });
	}
	tick () {
		if (Math.random() > 0.5) return;
		if (Math.random() > 0.9) return this.moveRandomly();

		const target = this.nearestOf();
		if (target === null) return;

		const directionX = this.x === target.y ? 0 : target.x > this.x ? 1 : -1;
		const directionY = this.y === target.y ? 0 : target.y > this.y ? 1 : -1;

		this.move(directionX, directionY);
	}
	collision (target : BaseCell) {
		// console.log("collision", target);
		target.delete();
	}
}

export class Queen extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: "#f0ef03" });
	}
	tick () : void {
		// Just move randomly
		this.moveRandomly();
	}
}
