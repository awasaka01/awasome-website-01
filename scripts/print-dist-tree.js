// Print a colorized, connected tree of the __dist directory using ansis and options object
import { readdirSync, statSync, promises as fsp } from "fs";
import { join } from "path";
import ansis, { bg } from "ansis";
import chroma from "chroma-js";


function longestIn (array) {
	let longest = { length: 0 };
	for (let x of array) if (longest.length < x.length) longest = x;
	return longest;
}



class Matrix {
	constructor (array) {
		this.array = array;
		return this;
	}


	transpose () { this.array = Matrix.transpose(this.array); return this; }
	static transpose (matrix) {
		Matrix.validate(matrix);

		const output = [];
		const longestRowLength = longestIn(matrix).length;

		for(let i = 0; i < matrix.length; i++) {
			for(var j = 0; j < longestRowLength; j++) {
				if (output[j] === undefined) output[j] = [];
				output[j][i] = matrix[i][j] ?? "";
			}
		}
		return output;
	}


	reverseRows () { this.array = Matrix.reverseRows(this.array); return this; }
	static reverseRows (matrix) {
		Matrix.validate(matrix);
		for(let i = 0; i < matrix.length; i++) { matrix[i].reverse(); }
		return matrix;
	}


	// longestRow () { this.array = Matrix.validate(this.array); return this; }
	// static longestRow (matrix) { if (!Array.isArray(matrix) || matrix.some((row) => !Array.isArray(row))) { throw new Error("rotate2DArray: Array must be a 2D array, got " + JSON.stringify(matrix)); } return matrix; }



	validate () { this.array = Matrix.validate(this.array); return this; }
	static validate (matrix) { if (!Array.isArray(matrix) || matrix.some((row) => !Array.isArray(row))) { throw new Error("rotate2DArray: Array must be a 2D array, got " + JSON.stringify(matrix)); } return matrix; }


	rotate () { this.array = Matrix.rotate(this.array); return this; }
	static rotate (matrix, angle = 90) {
		Matrix.validate(matrix);

		// Validate Angle
		if (angle % 90 !== 0) throw new Error("rotate2DArray: Angle must be a multiple of 90 degrees, got " + angle);
		angle = (angle < 0 ? 360 + angle : angle) % 360; // Allow negative angles (-90 to 270) and large (720 to 360)

		if (angle === 0 || angle === 360) return matrix;
		if (angle === 90) return Matrix.reverseRows(Matrix.transpose(matrix));
		if (angle === 180) return (Matrix.reverseRows(matrix)).reverse();
		if (angle === 270) return Matrix.transpose(Matrix.reverseRows(matrix));
	}
}

	/*
	To rotate a 2D matrix (or 2D array) by 90 degrees clockwise, the common approach involves transposing the matrix and then reversing each row. A transposition swaps rows and columns, while reversing each row effectively rotates the matrix.
	*/
	// console.log("\n", Matrix.rotate([["a", "1"], ["b", "2"], ["c", "3"]], 0).map((x) => x.join(" - ")).join("\n"));
	// console.log("\n", Matrix.rotate([["a", "1"], ["b", "2"], ["c", "3"]], 90).map((x) => x.join(" - ")).join("\n"));
	// console.log("\n", Matrix.rotate([["a", "1"], ["b", "2"], ["c", "3"]], 180).map((x) => x.join(" - ")).join("\n"));
	// console.log("\n", Matrix.rotate([["a", "1"], ["b", "2"], ["c", "3"]], -90).map((x) => x.join(" - ")).join("\n"));

	// console.log("\nrow1:");
	// console.log(Matrix.transpose([[11, 12, 13], [14, 15, 16, 19, 12], [99], [99], [99], [99], [99], [99]]));
	// console.log("\nrow2:");
	// console.log(Matrix.transpose(["a", "1"], ["b", "2"], ["c", "3"]));
	// console.log("\nrow3:");
	// const m = new Matrix([[1, 2, 3], [4, 5, 6]]);
	// console.log(m.transpose());

const removeANSI = (str) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, "");





async function scanDirectoryRecursive (startDir) {

	let filesList = { [startDir]: { name: startDir, parents: [], size: 0, depth: 1, children: [], isDirectory: true } };
	const scanDirectory = async (pathtoScan) => {
		return await Promise.all((await fsp.readdir(pathtoScan, { withFileTypes: true })).map(async (file, i) => {
			const object = {
				name: (pathtoScan + "/" + file.name),
				fileName: file.name,
				parents: [filesList[pathtoScan], ...filesList[pathtoScan].parents],
				children: [],
				size: 0,
				isDirectory: file.isDirectory(),
			};
			object.depth = object.parents.length * 10;
					filesList[pathtoScan].children.push(object);

			// If folder, run this function again on each
			if (object.isDirectory) {
				filesList[object.name] = object;
				await scanDirectory((pathtoScan + "/" + file.name));
			}

			// If file, set own filesize and to filesize total on all parent folders
			else {
				object.depth += 1;
				object.size = (await fsp.stat(object.name)).size;
				object.parents.forEach((_, i) => {
					object.parents[i].size += object.size;
				});
				filesList[object.name] = object;
			}
		}));
	};
	await scanDirectory(startDir);
	return Object.values(filesList).sort((a, b) => a.depth - b.depth);
}




function formatColumns (lines, alignment = [], {
	divider = "%%", line = "  ", trim = true, corners = ["╭", "╮", "╰", "╯"], hLine = "─",
} = {}) {

	const matrix = new Matrix(lines.map((l) => l.map((x) => trim ? x.toString().trim() : x))).rotate().reverseRows();
	const maxLengths = matrix.array.map((row) => longestIn(row.map((x) => removeANSI(x))).length);


	matrix.array = matrix.array.map((row, i) => {
		const desiredLength = maxLengths[i];



		return row.map((cell, j) => {
			const length = removeANSI(cell).length;
			const diff = Math.abs(length - cell.length);
			// console.log(`length: ${length}, cell.length: ${cell.length}, desiredLength: ${desiredLength}, cell: '${cell}' diff: ${diff}`);


			if (alignment[i] === "left" || alignment[i] === undefined) return cell.padEnd(desiredLength + diff, " ");
			if (alignment[i] === "right") return cell.padStart(desiredLength + diff, " ");
			if (alignment[i] === "center") return cell.padEnd(Math.round((desiredLength + diff + length) / 2), " ").padStart(desiredLength + diff, " ");
		});
	});



	return matrix.rotate(-90).reverseRows().array.map((x) => x.join(line)).join("\n");
}



async function printTree (startDir, { colors = {}, symbols = {}, sizeGatherMode = false } = {}) {
	// if (sizeGatherMode) {
	// 	console.log("Gathering sizes...");
	// 	let files = await scanDirectoryRecursive(startDir);
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
	let files = await scanDirectoryRecursive(startDir);

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
	let columns = await formatColumns(lines, ["left", "right"]);

	// Add alternating background colors
	columns = columns.split("\n").map((line, i) => ansis.bgHex(colors[(["bg1", "bg2", "bg3", "bg2", "bg1"][i % 2])])`${line}`);
	return columns.join("\n");
}

// await printTree("__dist", { sizeGatherMode: true });



export default printTree;
/**/
