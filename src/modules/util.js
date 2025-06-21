//
// AWA'S AWESEOEME UTILS!!!
//

import { promises as fsp } from "fs";
import chroma from "chroma-js";

/**
 * ? Generates a random element from the array.
 * @returns {unknown} A random element from the array.
 */
Array.prototype.random = function () { return this[Math.floor(Math.random() * this.length)]; };

/**
 * ? Sums all elements in the array.
 * @returns {number} The sum of all elements in the array.
 */
Array.prototype.sum = function () {	return this.reduce((a, c) => a + c, 0); };




// Random number generator between min and max
/**
 * Generates a random integer between min and max, inclusive.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer between min and max.
 */
const rr = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


/**
 * ? Generates a random color as a hex string.
 * @param {Object} options - Options to generate the color.
 * @param {string} [options.colorspace="oklab"] - The color space of the generated color.
 * @param {Array<number>} [options.l=[0, 100]] - Lightness range.
 * @param {Array<number>} [options.c=[0, 100]] - Chroma range.
 * @param {Array<number>} [options.h=[0, 255]] - Hue range.
 * @param {number} [options.precision=1000] - Precision for random generation.
 * @returns {string} A random color as a hex string.
 */
const randomColor = ({
    colorspace = "oklab",
    l = [0, 100],
    c = [0, 100],
    h = [0, 255],
    precision = 1000,
}
= {}) => {
    l = rr(...l.map((x) => x * precision)) / (precision * 100);
    c = rr(...c.map((x) => (x * 0.4) * precision)) / (precision * 100);
    h = rr(...h.map((x) => x * precision)) / precision;

    return chroma.oklch(l, c, h).hex();
};

/**
 * Returns a promise that resolves after the given time.
 * @param {number} [t=1000] - The time to pause in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the given time.
 */
const pause = async (t = 1000) => { await new Promise((resolve) => setTimeout(resolve, t)); };

/**
 * ? Calculate the distance between two coordinates.
 * @param {Array<number>} coordA - The first coordinate [x, y].
 * @param {Array<number>} coordB - The second coordinate [x, y].
 * @returns {number} The distance between the two coordinates.
 */
const getDistance = (coordA, coordB) => Math.sqrt((coordA[0] - coordB[0]) ** 2 + (coordA[1] - coordB[1]) ** 2);

/**
 * ? Remove duplicate objects from an array by ID.
 * @param {string} keyname - The key name to check for duplicates.
 * @param {Array<Object>} array - The array to remove duplicates from.
 * @returns {Array<Object>} A new array with duplicates removed.
 */
const removeDuplicatesByID = (keyname, array) => [...array.reduce((a, c) => { a.set(c[keyname], c); return a; }, new Map()).values()];




// Performance Analyzer
const values = {};
/**
 * Analyzes performance by measuring and logging performance entries.
 */

const characters = {
	lower: "abcdefghijklmnopqrstuvwxyz",
	upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	numbers: "0123456789",
	symbols: "`~!@#$%^&*()-_=+{[]}\\|;:'\",<.>/?",
	all: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`~!@#$%^&*()-_=+{[]}\\|;:'\",<.>/?",
	gohuSupported: "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ￿",
};

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



const obj = { rr, randomColor, pause, getDistance, removeDuplicatesByID, formatColumns, characters, scanDirectoryRecursive };
export default obj;
