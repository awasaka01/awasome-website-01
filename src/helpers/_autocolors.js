
import { readFileSync, writeFile, writeFileSync } from "node:fs";
import chroma from "chroma-js";
import { hex } from "ansis";


const expandedTypes = [
	{ amount: 9, id: (i) => `d${(10 - i).toString(16)}`, f: (i, hex) => colorAdjust(-(9 - i), hex) }, // Darken (i is inverted; only for a visually better order in the file)
	{ amount: 1, id: (i) => "", f: (i, hex) => "  " + hex }, // Base
	{ amount: 9, id: (i) => `l${i.toString(16)}`, f: (i, hex) => colorAdjust(i, hex) }, // Lighten
];


function colorAdjust (iteration, color) {
	let [l, c, h] = chroma(color).oklch().map((x) => x || 0);

	l += iteration * 0.03;
	c += iteration * 0.001;
	h += -iteration * 2;

	return chroma.oklch(l, c, h).hex();
}


// Automatically generate lighter and darker colors from defined base colors to be used in easy palette creation
async function generateSCSScolors () {

	// Extract the variable names and hex values from the json file
	const bases = JSON.parse(readFileSync("src/helpers/_autocolors.json"));

	// Generate the expanded colors
	let output = `\n\n// Updated at ${new Date().toISOString()}\n\n\n`;
	bases.forEach((base) => {

		// Generate all the expanded colors for the current base, in scss variable form
		const vars = [];
		expandedTypes.forEach((e) => {
			for (let i = 1; i <= e.amount; i++) {
				vars.push(`$${base.name}${e.id(i)}: ${e.f(i, base.color)};`);
		} });

		// Merge all expanded variables for the current base into lines
		output += `// Expanded colors for ${base.name}:\n${vars.join("\n")}\n\n`;
	});

	// Update the scss file, only replacing content after the identifier line
	const file = readFileSync("src/helpers/_autocolors.scss", "utf8");
	writeFileSync("src/helpers/_autocolors.scss", file.replace(/(?<=\/\* REPLACE_AFTER_THIS_LINE \*\/).*/s, output));
	console.log(hex("#3dffef")`☆  Updated colors in ./src/helpers/_autocolors.scss`);
}


export default generateSCSScolors;
generateSCSScolors();
