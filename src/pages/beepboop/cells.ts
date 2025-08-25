// Imports
import type { CollisionLayer, VisualLayer } from "./layers.js";
import { config, mouse, clr, symbols, WIDTH, HEIGHT } from "./global.js";

import awa from "@util";
import chroma from "chroma-js";


// Types
type DistanceFunctions = typeof awa.distanceL1 | typeof awa.distanceL2 | typeof awa.distanceLInf;
type Direction = "N" | "S" | "E" | "W";


/* 01100001 01110111 01100001 01100001 01110111 01100001

~	Main Cell Types:

01100001 01110111 01100001 01100001 01110111 01100001 */

type BaseCellArgs = [
	x: number, y: number,
	collisionLayer: CollisionLayer,
	visualLayer: VisualLayer,
	options?: BaseCellOptions,
];
type BaseCellOptions = {
	color ?: number, unkillable ?: boolean,
	// visualWidth?: number, visualHeight?: number
};
export abstract class BaseCell {

	// Positioning
	private _x : number; public get x () { return this._x; }
	private _y : number; public get y () { return this._y; }
	public _index : number; public get index () { return this._index; } // x + y * canvas.width, used for accessing a 2D coordinate in a 1D array

	// Layers
	public readonly collisionLayer : CollisionLayer;
	public readonly visualLayer : VisualLayer;

	// Options
	public options : BaseCellOptions;


	constructor (...args : BaseCellArgs) {
		const [x, y, collisionLayer, visualLayer, options] = args;
		const index = x + y * WIDTH;

		// Bounds and collision checking
		const target = collisionLayer.get(index);
		if (target === undefined) throw symbols.OutOfBounds;
		if (target !== null) throw symbols.NotEmpty;

		// Set properties
		this.options = options ?? {};
		this._x = x; this._y = y; this._index = index;
		this.collisionLayer = collisionLayer; this.visualLayer = visualLayer;
		if (options.color === undefined) this.options.color = 0xff0000ff;

		this.visualLayer.setPixel(index, options.color);
		this.collisionLayer.add(this);
	}

	// Go to specified location, or return the cell there if occupied
	public goTo (toX : number, toY : number) {
		const toIndex = toX + toY * WIDTH;

		// Move collisionally, return cell if collision
		const result = this.collisionLayer.move(this, toIndex);
		if (result !== symbols.success) return result;

		// Move visually, set old pixel to trans, set new pixel to color
		this.visualLayer.setPixel(this._index, 0);
		this.visualLayer.setPixel(toIndex, this.options.color);

		// Update own properties
		this._x = toX; this._y = toY; this._index = toIndex;

		return symbols.success;
	}

	abstract tick () : void;
}




/* 01100001 01110111 01100001 01100001 01110111 01100001

~	Sub Cell Types:

01100001 01110111 01100001 01100001 01110111 01100001 */

export class MoveRandomly extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { ...a[4] });
	}
	tick () {
		const res = this.goTo(Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT));
	}
}

/*
import * as types from "./types.js"; const { ErrNotEmpty, ErrOutOfBounds } = types;





export class BaseCell {
	public color : number; // 32-bit rgba value
	public collisionLayer : CollisionLayer;
	public visualLayer : VisualLayer;

	public unkillable : boolean;
	// For being visual size different from collision size, leave blank for default
	public visualWidth ?: number;
	public visualHeight ?: number;


	constructor (x : number, y : number, collisionLayer : CollisionLayer, visualLayer : VisualLayer, options : BaseCellOptions = {}) {
		this._x = x;
		this._y = y;

		this.color = options.color || clr("#888888");
		this.collisionLayer = collisionLayer;
		this.visualLayer = visualLayer;

		// Options
		this.unkillable = options.unkillable || false;
		// this.visualWidth = options.visualWidth;
		// this.visualHeight = options.visualHeight;

		// const success = collisionLayer.set(x, y, this);
		// if (success !== true) throw success;

		this.goTo(x, y);
	}

	private _x : number;
	private _y : number;
	public get x () { return this._x; }
	public get y () { return this._y; }

	// draw () {
	// 	this.visualLayer.ctx.fillStyle = this.color;
	// 	if (this.visualWidth && this.visualHeight) {
	// 		this.visualLayer.ctx.fillRect(this.x - this.visualWidth / 2, this.y - this.visualHeight / 2, this.visualWidth, this.visualHeight);
	// 	}
	// 	else { this.visualLayer.ctx.fillRect(this.x, this.y, 1, 1); }


	// 	// if (config.showDanger) this.visualLayer.ctx.fillText(":3", this.x, this.y);
	// }



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
	// deprecated:
	nearestOf (type : typeof BaseCell = BaseCell, distanceFunction = this.distanceL1) {
		const cells = this.collisionLayer.cells.filter((cell) => cell instanceof type && cell !== this);
		if (cells.length === 0) return null;
		return cells.reduce((nearest, cell) => distanceFunction.call(cell, this.x, this.y) < distanceFunction.call(nearest, this.x, this.y) ? cell : nearest);
	}

	nearest (filter ?: (cell : BaseCell, distance : number) => boolean, distanceFunction : DistanceFunctions = awa.distanceL1) {
		const cells = this.collisionLayer.cells.filter((cell) => cell !== this);
		if (cells.length === 0) return null;

		const lowestDistance = cells.reduce((lowest, cell) => Math.min(lowest, distanceFunction(this.x, this.y, cell.x, cell.y)), Infinity);
		const lowestDistanceCells = cells.filter((cell) => {
			const distance = distanceFunction(this.x, this.y, cell.x, cell.y);
			if (filter !== undefined && !filter(cell, distance)) return false;
			return distance === lowestDistance;
		});
		if (lowestDistanceCells.length === 0) return null;

		return lowestDistanceCells[Math.floor(Math.random() * lowestDistanceCells.length)];
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
		// this.visualLayer.draw();
	}

	tick () { throw new Error("Do not call BaseCell.tick, only use child classes");	}
	collision (target : BaseCell) : (boolean | void) {}
}

export class Drone extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: chroma.random().desaturate(10).brighten(-1).hex(), ...(a[4]) });
	}
	tick () {
		// Move towards nearest queen
		const r = Math.random();
		if (r > 0.5) return this.moveRandomly();

		const target = this.nearestOf(Queen);
		if (target === null) return;

		if (this.distanceL1(target.x, target.y) > 10 || this.distanceL1(target.x, target.y) < 5) return;

		const directionX = this.x === target.x ? 0 : target.x > this.x ? 1 : -1;
		const directionY = this.y === target.y ? 0 : target.y > this.y ? 1 : -1;

		this.move(directionX, directionY);
	}
	collision (target : BaseCell) {
		// this.color = clr("#ff0000");
	}
}

export class NotMoving extends BaseCell {
	constructor (...a : BaseCellArgs) {


		super(a[0], a[1], a[2], a[3], { ...(a[4]) });
	}
	tick () {}
}

export class Scared extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], {
			color: chroma.scale([clr("#8c984a"), clr("#48a552")])(Math.random()).hex(), ...(a[4]),
			visualWidth: 3, visualHeight: 3,
		});
	}
	tick () {
		// if (Math.random() > 0.7) return this.moveRandomly();


		const target = this.nearest((cell, distance) => distance <= 4, awa.distanceLInf);
		if (target === null) return;

		const directionX = this.x === target.x ? 0 : target.x > this.x ? 1 : -1;
		const directionY = this.y === target.y ? 0 : target.y > this.y ? 1 : -1;

		if (directionX !== 0 && directionY !== 0) {
			Math.random() > 0.5 ? this.move(-directionX, 0) : this.move(0, -directionY);
		}
		else {
			this.move(-directionX, -directionY);
		}
	}
}

export class Hunter extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: clr("#ff0000"), ...(a[4]) });
	}
	tick () {
		if (Math.random() > 0.5) return;
		if (Math.random() > 0.9) return this.moveRandomly();

		const target = this.nearest((cell) => !(cell instanceof Hunter) && !cell.unkillable);
		if (target === null) return;

		const directionX = this.x === target.y ? 0 : target.x > this.x ? 1 : -1;
		const directionY = this.y === target.y ? 0 : target.y > this.y ? 1 : -1;

		this.move(directionX, directionY);
	}
	collision (target : BaseCell) {
		if (target instanceof Hunter) return;
		if (target.unkillable) return;
		target.delete();
	}
}

export class Queen extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: clr("#f0ef03"), ...(a[4]) });
	}
	tick () : void {
		// Just move randomly
		this.moveRandomly();
	}
}

export class Wall extends NotMoving {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: clr("#3e3838"), unkillable: true, ...(a[4]) });
	}
}

export class FollowMouse extends BaseCell {
	constructor (...a : BaseCellArgs) {
		super(a[0], a[1], a[2], a[3], { color: clr("#78cfb7"), ...(a[4]) });
	}
	tick () : void {
		if (Math.random() > 0.6) return this.moveRandomly();
		const target = mouse;
		// Move towards target

		const directionX = this.x === target.x ? 0 : target.x > this.x ? 1 : -1;
		const directionY = this.y === target.y ? 0 : target.y > this.y ? 1 : -1;
if (directionX !== 0 && directionY !== 0) {
			Math.random() > 0.5 ? this.move(directionX, 0) : this.move(0, directionY);
		}
		else {
			this.move(directionX, directionY);
		}
	}
}
*/
