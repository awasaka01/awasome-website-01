import { Base } from "./baseCreature.js";





export class Drone extends Base {
	constructor (...args) { super(...args); }

	// Run from the queen
	behavior () {
		let directions = [];
		const queen = this.nearest((c) => { return c instanceof Queen; });

		if (queen.x < this.x) { directions.push([1, 0], [1, 1], [1, -1]); }
		if (queen.x > this.x) { directions.push([-1, 0], [-1, 1], [-1, -1]); }
		if (queen.y < this.y) { directions.push([0, 1], [1, 1], [-1, 1]); }
		if (queen.y > this.y) { directions.push([0, -1], [1, -1], [-1, -1]); }
		else { directions.push([AWA.rr(-1, 1), AWA.rr(-1, 1)]); }

		let direction = directions[Math.floor(Math.random() * directions.length)];
		this.move(direction[0], direction[1]);
	}
}



export class Queen extends Base {
	constructor (args) {
		args.color = "#fc7df1";
		args.priority = 1;
		super(args);
	}


	// Just moves randomly slower
	behavior () {
		this.move(...[[0, 1], [0, -1], [1, 0], [-1, 0]].random());

		// Delete all touching Drones
		this.touching((creature) => { return creature instanceof Drone; })
		.forEach((creature) => { creature.terminate(); });
	}
}
