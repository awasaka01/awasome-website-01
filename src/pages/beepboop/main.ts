import awa from "@util"; const { rr } = awa;
import chroma from "chroma-js";

const notEmpty = new Error("Specified location is not empty");


type Layer = {
	canvas : HTMLCanvasElement;
	ctx : CanvasRenderingContext2D;
	grid : Map<string, (BaseCell | null)>;
	cells : BaseCell[];
};
type CellArguments = [number, number, string, Layer];

let layers : Layer[];

class BaseCell {
	private _x : number;
	private _y : number;
	tick () {}

	constructor (x : number, y : number, public color : string, public layer : Layer) {

		// Don't construct if location is not empty
		if (layer.grid.get(`${x} ${y}`) !== null) throw notEmpty;

		this._x = x;
		this._y = y;
		this.color = color;
		this.layer = layer;

		// Set location in layer grid and add to overall list
		layer.grid.set(`${x} ${y}`, this);
		layer.cells.push(this);

		return this;
	}

	get x () { return this._x; }
	get y () { return this._y; }

	draw () {
		this.layer.ctx.fillStyle = this.color;
		this.layer.ctx.rect(this.x, this.y, 1, 1);
		this.layer.ctx.fillRect(this.x, this.y, 1, 1);
	}

	move (byX : number, byY : number) {
		// console.log(`${this.x} ${this.y} -> ${this.x + byX} ${this.y + byY}`);

		const destination = `${this.x + byX} ${this.y + byY}`;

		// Don't move if location is not empty
		if (this.layer.grid.get(destination) !== null || this.layer.grid.has(destination) === undefined) return false;

		this.layer.grid.set(`${this.x} ${this.y}`, null);
		this.layer.grid.set(destination, this);
		this._x += byX;
		this._y += byY;
		return true;
	}
}


class randommoveer extends BaseCell {
	constructor (...args : CellArguments) {
		super(...args);
	}
	tick () {
		const random = Math.random();
		random < 0.28 ? this.move(0, 1)
		: random < 0.5 ? this.move(0, -1)
		: random < 0.75 ? this.move(1, 0)
		: this.move(-1, 0);
	}
}


type Coordinate = [number, number];


window.addEventListener("DOMContentLoaded", () => {

	// Setup layers
	const layersElement = Array.from(document.getElementById("layers").children) as HTMLCanvasElement[];
	layers = layersElement.map((canvas) : Layer => ({
		canvas, ctx: canvas.getContext("2d"),
		grid: new Map(Array.from({ length: canvas.height * canvas.width }, (_, i) =>
			[`${i % canvas.width} ${Math.trunc(i / canvas.width)}`, null]),
		),
		cells: [],
	}));

	layers.forEach((layer, i2) => {
		const { canvas, ctx } = layer;
		ctx.imageSmoothingEnabled = false;
		for (let i = 0; i < 100; i++) {
			try {
				const cell = new randommoveer(
					rr(0, canvas.width - 1),
					rr(0, canvas.height - 1),
					["#ff727275", "#62ff6289"][i2],
					layer,
				);
				cell.draw();
			} catch (error) { if (error !== notEmpty) console.error(error); }
		}
	});

	const Game = new awa.GameLoop({
		"tick": {
			rate: 40,
			callback: () => {
				layers.forEach((layer) => {
					layer.cells.forEach((cell) => cell.tick());
				});
			},
		},
		"render": {
			rate: 20,
			callback: (a) => {
				layers.forEach((layer) => {
					layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
					layer.cells.forEach((cell) => cell.draw());
				});
			},
		},
	});

	Game.start();
	// setInterval(() => {
	// 	console.log(`Rates: ${Object.entries(Game.getLoopsSinceLastReport()).map(([key, count]) => `${key}: ${count}`).join(", ")}`);
	// }, 1000);

});

