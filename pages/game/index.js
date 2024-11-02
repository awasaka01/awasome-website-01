const width = 20;
const height = 20;
let creatures = [];
const cells = Array.from({ length: width }).map(() => { return Array.from({ length: height }).map(() => { return []; }); });



window.onload = async () => {
	AWA.init();

	const canvas = document.getElementById("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");


	ctx.imageSmoothingEnabled = false;




	function draw () {
		ctx.clearRect(0, 0, width, height);
		creatures.forEach((creature) => {
			if (!creature.exists) { return; }
			ctx.fillStyle = creature.color;
			ctx.fillRect(creature.y, creature.x, 1, 1);
		});
	}

	function logCells () {
		const pretty = cells.map((row) => {
			return row.map((cell) => {
				return cell.length === 0 ? "." : cell.length;
			}).join("  ");
		}).join("\n");
		console.log(pretty);
		// //console.log(cells.map((row) => {
		// 	return row.map((cell) => {
		// 		return cell.map((creature) => { return creature.id || "."; }).join(" ");
		// 	}).join("  ");
		// }).join("\n"));
	}


//	--------------------------------
//	  Spawn the initial creatures:
//	--------------------------------

	// new Queen(1); new Queen(1); new Queen(5, 8); new Queen(5, 5);

	// for (let i = 0; i < 100; i++) {
	// 	new Drone(Math.round(width / 2), Math.round(height / 2));

	// }


	new Drone({ x: 2, y: 2 }); new Drone({ x: 2, y: 3 }); new Drone({ x: 2, y: 4 });

	new Drone({ x: 3, y: 2 }); new Drone({ x: 3, y: 4 });

	new Drone({ x: 4, y: 2 }); new Drone({ x: 4, y: 3 }); new Drone({ x: 4, y: 4 });
	new Drone({ x: 3, y: 2 });
	// guy1.goTo(0, 4);
	new Queen({ x: 3, y: 3 });

	Base.sortCreatures();
	// console.log(creatures);


//	------------------
//	  Main Gameloop:
//	------------------

	let allticks = [];
	let lasttick = Date.now();

	let gametime = 0; // Amount of ticks since the game has started

	const startTime = Date.now();
	const desiredTps = 20;

	const worker = new Worker("worker.js"); // Create worker for constant setTimeout function

	setInterval(() => {
		AWA.perf();
	}, 1000);

	async function tick () {
		// console.time("Full Cycle");



		// Tick every creature once
		creatures.forEach((creature) => { if (creature.exists) { creature.update(); } });

		// Draw every creature once
		draw();



		// setTimeout(logCells, 100);

		performance.mark("test");
		for (let i = 0; i < 888888888; i++) {
			continue;

		}
		performance.mark("/test");

		// console.timeEnd("Full Cycle");
		// Calculate what time the next tick should be based on the start time and the desired tps
		let nexttick = startTime + ((1 / desiredTps * 1000) * gametime++);

		// Calculate the current tps average
		// allticks.push(Date.now() - lasttick); if (allticks.length > 200) { allticks.shift(); }
		// lasttick = Date.now();
		// console.log((1 / ((allticks.reduce((a, b) => { return a + b; }) / allticks.length) / 1000)).toFixed(2) + " tps");


		// A setTimeout function that works while page is unfocused
		worker.postMessage(nexttick - Date.now());
		// console.clear();
		// worker.onmessage = () => { tick(); };
	}
	tick();
};
