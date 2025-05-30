function init () {
	AWA.init();

	const width = 30;
	const height = 15;

	const table = document.getElementById("table");

	// Create grid - top left is 0,0
	const grid = Array(height).fill("x").map(() => { return Array(width).fill("x"); });
	console.log(grid);

	// Turn grid into table
	table.innerHTML = grid.map((row) => {
		return `<tr>${row.map(() => { return "<td>_</td>"; }).join("")}</tr>`;
	}).join("\n");

	7;
	const keys = {
		..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").reduce((x, y) => { return x[y] = "4x4", x; }, {}),
	};
	console.log(keys);
}
