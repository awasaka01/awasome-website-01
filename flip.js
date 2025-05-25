import chokidar from "chokidar"; // Because fs is bad
import { parse, stringify } from "scss-parser";
import { readFileSync, writeFileSync } from "node:fs";
import createQueryWrapper from "query-ast";
import chroma from "chroma-js";
import lightningSass from "@11tyrocks/eleventy-plugin-sass-lightningcss";

// async function updateColors () {


// 	// Get the raw contents of the scss file, then parse it into json
// 	const fileRaw = readFileSync(path, "utf-8");
// 	const data = parse(fileRaw);


// 	// Extract the variable name and hex values from the "auto" variables
// 	const $ = createQueryWrapper(data);
// 	const bases = $((n) =>
// 		n.node.type === "declaration"
// 		&& n.node.value[0].value[0].type === "variable"
// 		&& n.node.value[0].value[0].value.startsWith("-auto_"),
// 	).map((n) => { return {
// 		name: n.node.value[0].value[0].value.substr(6),
// 		hex: n.node.value[2].value[1].value,
// 	}; });


// 	// Configurable ways to expand each base color
// 	const expandedTypes = [
// 		// Darken:    (i is inverted; only for a visually better order in the file)
// 		{ amount: 15, id: (i) => `d${(16 - i).toString(16)}`, f: (i, hex) => colorAdjust(-(16 - i), hex) },
// 		// Base without auto tag:
// 		{ amount: 1, id: (i) => "", f: (i, hex) => "  #" + hex },
// 		// Lighten:
// 		{ amount: 15, id: (i) => `l${i.toString(16)}`, f: (i, hex) => colorAdjust(i, hex) },
// 	];
// 	function colorAdjust (iteration, color) {
// 		let [l, c, h] = chroma(color).oklch().map((x) => x || 0);

// 		l += iteration * 0.025;
// 		c += iteration * 0.003;
// 		h += iteration * 0.4;

// 		return chroma.oklch(l, c, h).hex();
// 	}


// 	// Generate the expanded colors
// 	let output = "\n\n";
// 	bases.forEach((base) => {

// 		// Generate all the expanded colors for the current base, in scss variable form
// 		const vars = [];
// 		expandedTypes.forEach((e) => {
// 			for (let i = 1; i <= e.amount; i++) {
// 				vars.push(`$${base.name}${e.id(i)}: ${e.f(i, base.hex)};`);
// 		} });

// 		// Merge all expanded variables for the current base into lines
// 		output += `// Expanded colors for ${base.name}:\n${vars.join("\n")}\n\n`;
// 	});

// 	// Update the scss file, replacing all after the identifier 617761
// 	writeFileSync(path, fileRaw.replace(/(?<=REPLACE_AFTER_THIS_LINE \*\/).+/s, output));
// }


const path = "src/helpers/_colors.scss";
async function updateColors () {


	// Get the raw contents of the scss file, then parse it into json
	const fileRaw = readFileSync(path, "utf-8");
	const data = parse(fileRaw);


	// Extract the variable name and hex values from the "auto" variables
	const $ = createQueryWrapper(data);
	const bases = $((n) =>
		n.node.type === "declaration"
		&& n.node.value[0].value[0].type === "variable"
		&& n.node.value[0].value[0].value.startsWith("-auto_"),
	).map((n) => { return {
		name: n.node.value[0].value[0].value.substr(6),
		hex: n.node.value[2].value[1].value,
	}; });


	// Configurable ways to expand each base color
	const expandedTypes = [
		// Darken:    (i is inverted; only for a visually better order in the file)
		{ amount: 15, id: (i) => `d${(16 - i).toString(16)}`, f: (i, hex) => colorAdjust(-(16 - i), hex) },
		// Base without auto tag:
		{ amount: 1, id: (i) => "", f: (i, hex) => "  #" + hex },
		// Lighten:
		{ amount: 15, id: (i) => `l${i.toString(16)}`, f: (i, hex) => colorAdjust(i, hex) },
	];
	function colorAdjust (iteration, color) {
		let [l, c, h] = chroma(color).oklch().map((x) => x || 0);

		l += iteration * 0.025;
		c += iteration * 0.003;
		h += iteration * 0.4;

		return chroma.oklch(l, c, h).hex();
	}


	// Generate the expanded colors
	let output = "\n\n";
	bases.forEach((base) => {

		// Generate all the expanded colors for the current base, in scss variable form
		const vars = [];
		expandedTypes.forEach((e) => {
			for (let i = 1; i <= e.amount; i++) {
				vars.push(`$${base.name}${e.id(i)}: ${e.f(i, base.hex)};`);
		} });

		// Merge all expanded variables for the current base into lines
		output += `// Expanded colors for ${base.name}:\n${vars.join("\n")}\n\n`;
	});

	// Update the scss file, replacing all after the identifier 617761
	writeFileSync(path, fileRaw.replace(/(?<=REPLACE_AFTER_THIS_LINE \*\/).+/s, output));
}

updateColors();


/*
	const s = $((n) => n.node.type === "variable");
	const v = s.nodes.filter((n) => n.node.value.startsWith("-auto_"));
	return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
*/
