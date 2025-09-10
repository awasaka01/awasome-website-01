import { collisionLayers, visualLayers } from "./layers.js";
import { config, clr as hexToRGBa32, symbols, WIDTH, HEIGHT, CELL_COLORS } from "./global.js";
import * as awa from "@util";
const directions = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
function computeOffsets(radius) {
    const out = [];
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if ((x !== 0 || y !== 0) && x * x + y * y <= radius * radius) {
                out.push(x, y);
            }
        }
    }
    return new Int32Array(out);
}
export class BaseCell {
    // Positioning
    _x;
    get x() { return this._x; }
    _y;
    get y() { return this._y; }
    _index;
    get index() {
        return this._index;
    } // x + y * canvas.width, used for accessing a 2D coordinate in a 1D array
    // Layers
    collisionLayer;
    visualLayer;
    // Options
    options;
    /** Random offset to avoid clustering whilst using the current frame count as a seed */
    offset = Math.trunc(Math.random() * 100);
    pauseUntilFrame = 0; // tick will not be called until this frame is reached
    cooldown = 0; // generic cooldown storage for subclasses, affects nothing by default
    spawnedAt = 0;
    constructor(...args) {
        this.spawnedAt = config.i;
        const [x, y, options] = args;
        const index = x + y * WIDTH;
        const collisionLayer = options.collisionLayer ?? collisionLayers.main;
        const visualLayer = options.visualLayer ?? visualLayers.main;
        // Bounds and collision checking
        const target = collisionLayer.get(index);
        if (target === undefined)
            throw symbols.OutOfBounds;
        if (target !== null)
            throw symbols.NotEmpty;
        // Set properties
        this.options = options ?? {};
        this._x = x;
        this._y = y;
        this._index = index;
        this.collisionLayer = collisionLayer;
        this.visualLayer = visualLayer;
        // Choose color from defaults
        if (this.options.color === undefined) {
            const color = CELL_COLORS[this.constructor.name] ?? "#ff0090";
            if (typeof color === "function")
                this.options.color = hexToRGBa32(color(Math.random()).hex());
            else {
                this.options.color = hexToRGBa32(color);
            }
        }
        this.visualLayer.setPixel(index, options.color);
        this.collisionLayer.add(this);
    }
    static trySpawn(x, y, options) {
        try {
            return new this(x, y, options);
        }
        catch {
            return null;
        }
    }
    // Go to specified location, or return the cell there if occupied
    goTo(toX, toY) {
        const toIndex = toX + toY * WIDTH;
        if (toX < 0 || toY < 0 || toX >= WIDTH || toY >= HEIGHT)
            return symbols.OutOfBounds;
        // Move collisionally, return cell if collision
        const result = this.collisionLayer.move(this, toIndex);
        if (result !== symbols.success)
            return result;
        // Move visually, set old pixel to trans, set new pixel to color
        this.visualLayer.setPixel(this._index, 0);
        this.visualLayer.setPixel(toIndex, this.options.color);
        // Update own properties
        this._x = toX;
        this._y = toY;
        this._index = toIndex;
        return symbols.success;
    }
    kill() {
        this.collisionLayer.remove(this);
        this.visualLayer.setPixel(this._index, 0);
    }
    touching(diagonals = true, options = {}) {
        this.neighboursBuffer.length = 0;
        const neighborsIndices = diagonals
            ? [this._index - WIDTH, this._index - WIDTH + 1, this._index + 1, this._index + WIDTH + 1, this._index + WIDTH, this._index + WIDTH - 1, this._index - 1, this._index - WIDTH - 1]
            : [this._index - WIDTH, this._index + 1, this._index + WIDTH, this._index - 1];
        for (const idx of neighborsIndices) {
            const neighbor = (options.layer ?? this.collisionLayer).get(idx);
            if (neighbor !== null
                && (!options.whitelist || options.whitelist.some((cls) => neighbor instanceof cls))
                && (!options.blacklist || !options.blacklist.some((cls) => neighbor instanceof cls)))
                this.neighboursBuffer.push(neighbor);
        }
        return this.neighboursBuffer;
    }
    neighboursBuffer = [];
    getNeighboursInRadius(radius, options = {}) {
        options = { ...options };
        let lowestDistance = Infinity;
        const add = (cell, distance) => {
            if (options.onlyNearest)
                lowestDistance = distance;
            this.neighboursBuffer.push(cell);
        };
        this.neighboursBuffer.length = 0;
        const offsets = awa.getOffsets(radius, options.metric);
        outerLoop: for (let i = 0; i < offsets.length; i += 3) {
            // offsets is sorted by distance, so we can break early if we've passed the lowest
            const distance = offsets[i + 2]; // float * 10000
            if (distance > lowestDistance)
                return this.neighboursBuffer;
            const dx = offsets[i], dy = offsets[i + 1];
            const neighbor = (options.layer ?? this.collisionLayer).get(this._index + dx + dy * WIDTH);
            if (!neighbor || neighbor === this)
                continue;
            if (options.whitelist) { // Whitelist: if any of the classes match, add and jump to next offset
                for (const t of options.whitelist)
                    if (neighbor instanceof t) {
                        add(neighbor, distance);
                        continue outerLoop;
                    }
            }
            else if (options.blacklist) { // Blacklist: if any of the classes match, jump to next offset
                for (const t of options.blacklist) {
                    if (neighbor instanceof t)
                        continue outerLoop;
                }
                add(neighbor, distance);
            }
            else {
                add(neighbor, distance);
            }
        }
        return this.neighboursBuffer;
    }
    moveRandomly() {
        const [x, y] = directions[Math.floor(Math.random() * 8)];
        // Pick new if blocked
        this.goTo(this.x + x, this.y + y);
    }
    moveTowards(toX, toY) {
        const dx = Math.sign(toX - this._x), dy = Math.sign(toY - this._y);
        this.goTo(this._x + dx, this._y + dy);
    }
    nearestOf(cells, metric = "LINF") {
        if (cells.length === 0)
            return null;
        let lowestDistance = Infinity, tieCount = 1, chosen;
        for (const cell of cells) {
            const dx = cell.x - this._x, dy = cell.y - this._y;
            const distance = metric === "L1" ? Math.abs(dx) + Math.abs(dy)
                : metric === "L2" ? Math.sqrt(dx * dx + dy * dy)
                    : Math.max(Math.abs(dx), Math.abs(dy)); // L∞
            if (distance < lowestDistance) {
                lowestDistance = distance;
                chosen = cell;
            }
            // if tie; use reservoir sampling 1/k to pick randomly (if we dont do this there will be a bias towards cells at the start of the array)
            else if (distance === lowestDistance) {
                tieCount++;
                if (Math.random() < 1 / tieCount)
                    chosen = cell;
            }
        }
        return chosen;
    }
}
/* 01100001 01110111 01100001 01100001 01110111 01100001

~	Sub Cell Types:

01100001 01110111 01100001 01100001 01110111 01100001 */
export class MoveRandomly extends BaseCell {
    constructor(...a) {
        super(a[0], a[1], { ...a[2] });
    }
    tick(i) {
        if (collisionLayers.water.get(this._index) && Math.random() < 0.9)
            return;
        this.moveRandomly();
    }
}
export class Food extends BaseCell {
    constructor(...a) {
        super(a[0], a[1], { ...a[2] });
    }
    tick(i) {
        const neighbors = (i + this.offset) % 4 === 0 ? this.getNeighboursInRadius(4, { metric: "L2", whitelist: [Food, NotMoving] }) : this.neighboursBuffer;
        if (neighbors.length === 0)
            return;
        // Move away from closest neighbor
        if (Math.random() < 0.2)
            this.moveRandomly();
        const closest = this.nearestOf(neighbors, "L2");
        const dx = Math.sign(this._x - closest.x);
        const dy = Math.sign(this._y - closest.y);
        this.goTo(this._x + dx, this._y + dy);
    }
}
export class NotMoving extends BaseCell {
    constructor(...a) {
        super(a[0], a[1], { visualLayer: visualLayers.notMoving, ...a[2], unkillable: true });
    }
}
export class Wall extends NotMoving {
    constructor(...a) {
        super(a[0], a[1], { ...a[2] });
    }
}
export class Grow extends BaseCell {
    constructor(...a) {
        super(a[0], a[1], { ...a[2] });
    }
    tick(iteration) {
        if ((iteration + this.offset) % 20 !== 0)
            return;
        if (Math.random() < 0.5)
            return;
        if (this.touching(false).length === 4)
            return; //
        const ne = this.getNeighboursInRadius(10, { blacklist: [Grow, NotMoving] });
        if (ne.length !== 0)
            return this.kill();
        for (const [x, y] of [[this.x, this.y - 1], [this.x + 1, this.y], [this.x, this.y + 1], [this.x - 1, this.y]]) {
            // n = this.collisionLayer.get(x + y * WIDTH);
            Grow.trySpawn(x, y);
        }
    }
}
export class Boom extends BaseCell {
    constructor(...[x, y, options]) {
        super(x, y, { ...options });
    }
    dying;
    tick(iteration) {
        if (this.dying <= 0) {
            this.kill();
        }
        else if (this.dying > 0) {
            let c = this.options.color, a = this.dying & 0xFF, r = ((c >> 16) & 0xFF) * a >> 8, g = ((c >> 8) & 0xFF) * a >> 8, b = (c & 0xFF) * a >> 8;
            this.visualLayer.setPixel(this.index, (a << 24) | (r << 16) | (g << 8) | b);
            this.dying -= 10;
        }
        else {
            // if (iteration % 2 !== 0) return;
            const touching = this.touching(false);
            touching.forEach((c) => { if (c && !(c instanceof Boom) && !c.options.unkillable) {
                c.kill();
            } });
            if (touching.length === 4) {
                this.dying = 1;
                return;
            }
            for (const [x, y] of [[this.x, this.y - 1], [this.x + 1, this.y], [this.x, this.y + 1], [this.x - 1, this.y]]) {
                Boom.trySpawn(x, y);
            }
            this.dying = 255;
        }
    }
}
export class Volitile extends BaseCell {
    constructor(...[x, y, options]) {
        super(x, y, { ...options });
    }
    tick(iteration) {
        const touching = this.touching(false);
        for (const c of touching) {
            if (c && !c.options.unkillable && !(c instanceof Boom)) {
                this.kill();
                Boom.trySpawn(this.x, this.y);
                return;
            }
        }
        this.moveRandomly();
    }
}
// export class Water extends BaseCell {
// 	constructor (...a : BaseCellArgs) {
// 		super(a[0], a[1], { ...a[2] });
// 	}
// 	public tick (iteration : number) : void {
// 		const touching = this.touching(false, { whitelist: [Water] });
// 		if (touching.length !== 0) return;
// 		const target = this.getNeighboursInRadius(7, { onlyNearest: true, whitelist: [Water] })[0];
// 		if (!target) return this.moveRandomly();
// 		this.moveTowards(target.x, target.y);
// 	}
// }
export class Water extends BaseCell {
    constructor(...a) {
        super(a[0], a[1], { visualLayer: visualLayers.water, ...a[2] });
    }
    tick(iteration) {
    }
}
export class River extends BaseCell {
    direction;
    constructor(x, y, options) {
        super(x, y, { visualLayer: visualLayers.water, collisionLayer: collisionLayers.water, ...options });
        this.direction = options.direction ?? "S";
    }
}
/* INDEX CHEATSHEET (where [i]ndex = x + y * width)
        :   index   :  x :  y  :
    ↑ N   i - width   x+0 y-1
    → E   i + 1       x+1 y+0
    ↓ S   i + width   x+0 y+1
    ← W   i - 1       x-1 y+0

*/
/*
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
