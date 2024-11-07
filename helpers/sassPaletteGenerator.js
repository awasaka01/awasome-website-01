let basePalette = {
//  "{identifier}, {Title}": {array of colors}
	"bg, Background Colors": ["#1e1c1f", "#9862b1"],
	"fg, Foreground Colors": ["#e2e0db", "#ffc0ff", "#e3439b"],
	"hi, Highlight Colors": ["#a052d8"],
};

const path = "./helpers/_colors.scss";

const chroma = require("chroma-js");
/*
	? This function will be ran 30 times on each main color,
	? creating a new Sass variable for every color returned
	@ input {string} color - The current main color we are adjusting
	@ input {number} iteration - The current iteration of this color, starts: -15, skip: 0s, ends: 15
	@ input {number} previous - The color returned before this
	& output {string} color - The input color adjusted
*/
function adjust (color, iteration) {
	// return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

	let [l, c, h] = chroma(color).oklch().map((x) => x || 0);

	l += iteration * 0.025;
	c += iteration * 0.003;
	h += iteration * 0.4;

	return chroma.oklch(l, c, h).hex();
}

function toSass (value, label) { return `$${label}: ${value} !default;`; };


// Format the base palette into an array of objects instead
basePalette = Object.entries(basePalette).map(([key, colorCodes], i) => {
	const [id, title] = key.split(", ");

	const main = colorCodes.map((colorCode, i) => {
		const label = `${id}-${i + 1}`;
		return { label, sass: toSass(colorCode, label), colorCode };
	});
	return { id, title, main, secondary: [] };
});



// Iterate through each main color and create an array of secondary colors
basePalette.forEach((obj) => {
	obj.main.forEach((mainColor, index) => {
		// console.log(mainColor);

		// Create a list of 30 secondary colors for each main color
		obj.secondary[index] = [...Array(30).keys()].map((i) => i < 15 ? i - 15 : i - 14)
		.map((iteration) => {
			const id = iteration < 0
				? "d" + Math.abs(iteration).toString(16)
				: "l" + iteration.toString(16);

			return toSass(adjust(mainColor.colorCode, iteration), mainColor.label + id);
		});
	});
});


let output = "\n";


// Main varz
output += basePalette.map((obj) => {
	return `\n\n// Primary ${obj.title}:\n`
	+ obj.main.map(({ sass }) => sass).join("\n");
}).join("");


// Secondary varz
basePalette.forEach((obj) => {

	// Create 30 rows, one for each level of variation, map them with the uhgh idk
	const rows = [...Array(30)]
	.map((_, rowID) => obj.secondary.map((arrayOfColors) => arrayOfColors[rowID]).join("  "));

	output += `\n\n\n\n// Secondary ${obj.title}:\n` + rows.join("\n");
});


// Write to file
const fs = require("node:fs");
const data = fs.readFileSync(path, "utf-8");
fs.writeFileSync(path, data.replace(/(?<=617761 \*\/).+/s, output));


null;
