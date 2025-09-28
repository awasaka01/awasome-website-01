type BaseCell = any;



/*
abstract class BaseLayer {
	protected constructor () {
		//
	}
}



	// Set cell to be at location in grid, add to cells array
	public set(x: number, y: number, cell: BaseCell, force = false) {

		// Safety checks, only overwrite if 'force' true, never go out of bounds
		const xy = `${x} ${y}`;
		const result = this.grid.get(xy);
		if (result === undefined) throw errors.OutOfBounds(xy);
		if (result !== null && force !== true) throw errors.NotEmpty(xy);

		// Set Map coordinate to cell
		try { this.grid.set(xy, cell); } catch (e) { return false; }
		this.cells.push(cell);
	}

	// Remove cell from location in grid, remove from cells array
	public remove(x: number, y: number, force = false) {

		// Safety checks, only overwrite if 'force' true, never go out of bounds
		const xy = `${x} ${y}`;
		const result = this.grid.get(xy);
		if (result === undefined) throw errors.OutOfBounds(xy);
		if (result !== null && force !== true) throw errors.NotEmpty(xy);

		// "Delete" by setting the coordinate to null, deleting would destroy the grid permanently
		try { this.grid.set(xy, null); } catch (e) { return false; }

		// Remove from cells array
		const indexInCellsArray = this.cells.findIndex(cell => cell.x === x && cell.y === y);
		this.cells.splice(indexInCellsArray, 1);
	}

*/
