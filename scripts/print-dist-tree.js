// Print a colorized, connected tree of the __dist directory using ansis and options object
import { readdirSync, statSync } from "fs";
import { join } from "path";
import ansis, { bg } from "ansis";
import u from "../src/modules/util.js";
import chroma from "chroma-js";


async function printTree (startDir, { colors = {}, symbols = {}, sizeGatherMode = false } = {}) {
	// if (sizeGatherMode) {
	// 	console.log("Gathering sizes...");
	// 	let files = await u.scanDirectoryRecursive(startDir);
	// 	const obj = {};
	// 	files.forEach((file) => obj[file.name] = file.size);
	// 	process.env.PREVIOUS_SIZES = JSON.stringify(obj);
	// 	return;
	// }
	// const previousSizes = process.env.PREVIOUS_SIZES ? await JSON.parse(process.env.PREVIOUS_SIZES) : null;


	const defaultColors = {
		root: (str) => ansis.hex("#f5db58")`${str}/`,
		file: (str) => ansis.hex("#fed1e8")`${str}`,
		folder: (str) => ansis.hex("#0ceaf1")`${str}/`,
		branch: (str) => ansis.hex("#6b616b")`${str}`,
		divider: (str) => ansis.hex("#000000")`${str}`,
		path: (str) => ansis.hex("#a8a3a8")`${str}`,
		bg1: "#322e32",
		bg2: "#282528",
		bg3: "#202020",
		// bg2: (str) => str,
	};
	const defaultSymbols = {
		base: " ├─ ",
		line: " ╎  ",
		last: " ╰─ ",
		none: "    ",
	};
	colors = { ...defaultColors, ...colors };
	symbols = { ...defaultSymbols, ...symbols };
	Object.entries(symbols).forEach(([key, value]) => symbols[key] = colors.branch(value));

	// Get all files in the directory, with sizes
	let files = await u.scanDirectoryRecursive(startDir);

	const maxBytesForColor = files[0].size / 2;
	const formatFileSize = (bytes, darken = 0) => ansis.rgb(...chroma("#45704eff").mix("#b290ed", Math.min(bytes / maxBytesForColor, 1)).darken(darken).rgb())`${(bytes / 1024).toFixed(1)}kB`;
	const removeANSI = (str) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, "");



	let lines = [];

	const abc = (file, parent, prefix = []) => {
		let prefixSelf = [];
		let prefixChildren = [];

		const isLast = parent.children.at(-1) === file;
		const isRoot = file === files[0];

		// Calculate prefix of self and children
		if (isRoot) {}
		else if (isLast) {
			prefixSelf = [...prefix, symbols.last];
			prefixChildren = [...prefix, symbols.none];
		}
		else {
			prefixSelf = [...prefix, symbols.base];
			prefixChildren = [...prefix, symbols.line];
		}


		// Add line
		const fileName = file.name.split("/").pop();
		lines.push([
			`${prefixSelf.join("")}${isRoot ? colors.root(fileName) : file.isDirectory ? colors.folder(fileName) : colors.file(fileName)}`,
			// info.join(" "),
			formatFileSize(file.size),
			// ...(previousSizes ? [
			// 	colors.branch("-") + formatFileSize(previousSizes[file.name] - file.size, 0.7),
			// ] : []),
			colors.path(file.name),
		]);


		// Repeat function on all children
		if (file.isDirectory) { file.children.forEach((child, i) => abc(child, file, prefixChildren)); }
	};
	abc(files[0], files[0]);



	// Format into aligned columns
	let columns = await u.formatColumns(lines, ["left", "right"]);

	// Add alternating background colors
	columns = columns.split("\n").map((line, i) => ansis.bgHex(colors[(["bg1", "bg2", "bg3", "bg2", "bg1"][i % 2])])`${line}`);
	return columns.join("\n");
}

// await printTree("__dist", { sizeGatherMode: true });



export default printTree;
/**/
