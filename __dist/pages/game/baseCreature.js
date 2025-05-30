export class BaseCreature extends Base {

}

export class BaseThing {
	constructor ({ x = 0, y = 0, color = "#bae4b0", priority = 0 } = {}) {

		this.x = x;
		this.y = y;

		this.z = 0;
		this.height = 1;

		this.priority = priority;
		this.color = color;
		this.exists = true;

		creatures.push(this);
		this.id = Base.GlobalID++;

		cells[x][y].push(this);
	}

	static creatures = [];
	static GlobalID = 0;
	static sortCreatures () { creatures = creatures.sort((a, b) => { return b.priority - a.priority; }); }
	static getCell (x, y) { return x < 0 || x >= width || y < 0 || y >= height ? null : cells[x][y]; }


	toAbs (x, y) { return { x: this.x + x, y: this.y + y }; } // Convert relative coordinates to absolute
	toRel (x, y) { return { x: x - this.x, y: y - this.y }; } // Convert absolute coordinates to relative


	// Runs every gametick
	update () {
		if (this.behavior !== undefined) { this.behavior(); }
	}
	

	// Move the creature by specified coordinates, colliding with walls or other creatures
	move (x, y) {
		performance.mark("move");
		(() => {

			if (Math.abs(x) > 1 || Math.abs(y) > 1) { return "out of bounds"; }

			// Calculate which cell to move to
			AWA.start;
			let newx = Math.max(0, Math.min(this.x + x, width - 1));
			let newy = Math.max(0, Math.min(this.y + y, height - 1));

			const targetCell = cells[newx][newy];


			if (newx === this.x && newy === this.y) { return "border collision"; }
			else if (targetCell.length === 0) {
				// Add creature to new cell, remove from old cell, update x and y
				cells[newx][newy].push(this) - 1;
				cells[this.x][this.y].splice(cells[this.x][this.y].indexOf(this), 1);
				this.x = newx; this.y = newy;
			}
			else { return "collision"; }
		})();
		performance.mark("/move");
	}


	// Find the nearest creature matching given filter
	nearest (filter = () => { return true; }, array = creatures) {
		return array.filter(filter).sort((a, b) => {
			return AWA.getDistance([this.x, this.y], [a.x, a.y])
                 - AWA.getDistance([this.x, this.y], [b.x, b.y]);
		})[0];
	}


	// Get creature in range
	idk (filter = () => { return true; }, range = 1) {

		const x = { min: Math.max(0, this.x - range), max: Math.min(width - 1, this.x + range) };
		const y = { min: Math.max(0, this.y - range), max: Math.min(height - 1, this.y + range) };

		const touching = [];

		for (let scanX = x.min; scanX <= x.max; scanX++) {
			for (let scanY = y.min; scanY <= y.max; scanY++) {
				if (scanX === this.x && scanY === this.y) { continue; } // Skip self

				const cell = cells[scanX][scanY];
				if (cell === undefined) { console.log("No cell at " + scanX + "," + scanY); continue; }

				touching.push(...cell);
			}
		}

		return touching.filter(filter);
		// return creatures.filter((c) => { return filter(c) && c !== this && AWA.getDistance([this.x, this.y], [c.x, c.y]) <= 1; });
	}


	touching (filter = () => { return true; }, diagonal = false) {
		return [
			[0, 1], [0, -1], [1, 0], [-1, 0],
			...diagonal ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [],
		]
		.flatMap(([x, y]) => { return Base.getCell(...Object.values(this.toAbs(x, y))); })
		.filter(filter);
	}


	// Terminate self
	terminate () {

		// Remove from creatures list
		creatures.splice(creatures.indexOf(this), 1);

		// Remove from current cell
		cells[this.x][this.y].splice(cells[this.x][this.y].indexOf(this), 1);

		// console.log("Creature " + this.id + " terminated");
		this.exists = false;
	}


	// Teleport to specified coordinates
	goTo (x, y) {
		throw new Error("Not implemented yet");
	}
}
