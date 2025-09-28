import * as awa from "../source/awa-util/core.js";
import type { MouseTracker } from "../source/awa-util/core.js";
import chroma from "chroma-js";
import BezierEasing from "bezier-easing";
let mouse : awa.MouseTracker;
// <script>
// 	const dropdown = document.getElementById("theme-select");
// 	if (theme) { dropdown.value = theme; }
// 	dropdown.addEventListener("change", () => {
// 		document.documentElement.setAttribute("data-theme", dropdown.value);
// 		localStorage.setItem("theme", dropdown.value);
// 	});
// </script>
document.addEventListener("DOMContentLoaded", () => {
	mouse = awa.trackMouse();
	ShinyStars();
	const runes = "₀₁₂₃₄₅₆₇₈₉ᛁᛄᛇᛈᛉᛋᚱᚳᚷᚸᚹᚻᚾᚠᚢᚣᚦᚩᚪᚫ".split("");
	const out = document.getElementById("runes");
	const length = 66;


});


function SlidingPuzzle () {
	const width = 6, height = 6;
	const element = document.getElementById("slidingpuzzle") as HTMLDivElement;
	const tiles = {} as Record<number, HTMLDivElement>;
	let blankIndex = 0; // 0,0 is the blank tile

	for (let index = 0; index < width * height; index++) {
		const tile = document.createElement("div");
		if (index === 0) tile.classList.add("blank");
		tile.style.order = `${index}`;
		tiles[index] = tile;
		tile.innerText = index.toString();

		tile.addEventListener("click", () => {
			const tile = tiles[index];
			const blank = tiles[blankIndex];
			tiles[index] = blank;
			tiles[blankIndex] = tile;
			[blank.style.order, tile.style.order] = [tile.style.order, blank.style.order];

			blankIndex = index;
		});

		element.appendChild(tile);
	}
}

async function ShinyStars () {
	const easing = BezierEasing(0.76, 0, 0.24, 1);

	const types = [
		{ color: () => "#ffffff", curve: () => Math.random() / 4, weight: 20, size: 1 },
		{ color: () => "#ffffff", curve: () => Math.random() / 4, weight: 10, size: 2 },
		{ color: () => "#ffffff", curve: () => Math.random() / 4, weight: 3, size: 3 },
		{
			color: () => chroma.scale(["#fb4e4e", "#f8b160", "#d7f860", "#63f860", "#60caf8", "#6081f8", "#a860f8", "#f860f8", "#f860ca"])(Math.random()),
			curve: () => Math.random() / 8,
			weight: 1,
			duration: () => awa.rr(10000, 20000),
			get size () { return awa.rr(1, 4); },
		},
	];
	const weightedTypes = awa.weightedRandom(
		types.map((t) => [t.weight, t]),
		true,
	) as { color : () => string; weight : number; size : number; curve : () => number; duration ?: () => number }[];

	const stars = [] as {
		x : number;
		y : number;
		size : number;
		color : string;
		creationTime : number;
		duration : number;
		curve : number; // num between 0 and 1
		angle : number; // radian
		rotationSpeed : number;
		velx : number;
		vely : number;
	}[];

	let desiredStars = 100;

	const { body, documentElement: html } = document;
	const canvas = document.getElementById("stars") as HTMLCanvasElement;
	const ctx = canvas.getContext("2d");

	async function setSize () {

		// Reset size and wait for layout to shift, to avoid canvas size effecting itself
		canvas.width = 0;
		canvas.height = 0;
		await new Promise((resolve) => requestAnimationFrame(resolve));

		canvas.width = Math.ceil(html.clientWidth);
		canvas.height = Math.ceil(Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight));
		draw();
	}



	function draw () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		stars.forEach((star) => {
			let { x, y, size } = star;

			size = size * 2;

			const t = (star.duration - (Date.now() - star.creationTime)) / star.duration;
			const opacity = 4 * t * (1 - t);
			const offset = size * star.curve; // How far to offset the control point, changing the curve steepness

			// Draw a glow around it
			ctx.shadowBlur = 20;
			ctx.shadowColor = star.color;


			ctx.save(); // Save the current canvas settings
			ctx.translate(x, y); // Translate to the shape's center
			ctx.rotate(star.angle);
			ctx.fillStyle = chroma(star.color).alpha(opacity).hex(), star.curve;

			// Start at top star tip,
			ctx.beginPath();
			ctx.moveTo(0, -size);
			ctx.quadraticCurveTo(+offset, -offset, +size, 0);
			ctx.quadraticCurveTo(+offset, +offset, 0, +size);
			ctx.quadraticCurveTo(-offset, +offset, -size, 0);
			ctx.quadraticCurveTo(-offset, -offset, 0, -size);
			ctx.closePath();
			ctx.fill();

			ctx.restore(); // Revert the current canvas settings to what they were before the translate and rotate
		});
	}

	const loop = new awa.GameLoop({ a: { rate: 20, callback: () => {
		performance.mark("loop");
		const now = Date.now();
		//               ^?
		// Kill any stars that have expired
		for (let i = stars.length - 1; i >= 0; i--) {
			const star = stars[i];
			if (Date.now() - star.creationTime > star.duration) stars.splice(i, 1);
		}

		// Create new stars, max determined by desiredStars
		if (stars.length < desiredStars) {
			for (let i = 0; i < Math.min(desiredStars - stars.length, Math.ceil(desiredStars / 33.333)); i++) {
				const type = awa.arrayRandom(weightedTypes);
				stars.push({
					x: awa.rr(0, canvas.width),
					y: awa.rr(0, canvas.height),
					color: type.color(),
					creationTime: Date.now(),
					duration: type.duration ? type.duration() : awa.rr(1000, 10000),
					size: type.size,
					curve: type.curve(),
					angle: Math.random() * 2 * Math.PI,
					rotationSpeed: awa.rr(-100, 100) / 1000,
					velx: 0,
					vely: 0,
				});
			}
		}

		stars.forEach((star) => {

			// update the star's position based on its velocity
			star.x += star.velx;
			star.y += star.vely;
			star.angle += star.rotationSpeed;
		});

		draw();
	},
	},
	});


	await setSize();
	await setSize();
	window.addEventListener("resize", setSize);
	loop.start();
}

// // Define an interface for a Person object
// interface Person {
//   name: stri ng;
//   age: number;
//   isStudent?: boolean; // Optional property
// }

// // Function that takes a Person object as an argument and returns a string
// fun ction gre etPerson(person: Person): string {
//   if (person.isStudent) {
//     return `Hello, ${person.name}! You are a ${person.age}-year-old student.`;
//   } else {
//     return `Hello, ${person.name}! You are ${person.age} years old.`;
//   }
// }

// // Create  instances of the Person interface
// const john: Person =  {
//   name: "John Doe",
//   age: 30,
// };

// const jane: Person = {
//   name: "Jane Smith",
//   age: 22,
//   isStudent: true,
// };

// // Call the function with the Person objects
// console.log(greetPerson(john));
// console.log(greetPerson(jane));

// // Example of type inference
// let message = "This is a string"; // TypeScript infers 'message' as type 'string'
// // message = 123; // This would cause a TypeScript error because 'message' is inferred as a string

// document.body.
// onload = () => {
// 	console.log("Loaded");
// //   document.body.style.color = "darkslateblue";
// };
