import chroma from "chroma-js";
import { promises as fsp } from "fs";

const rr = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const delay = async (t = 1000): Promise<void> => new Promise((resolve) => setTimeout(resolve, t));

const getDistance = (coordA: [number, number], coordB: [number, number]) => { return Math.sqrt((coordA[0] - coordB[0]) ** 2 + (coordA[1] - coordB[1]) ** 2); };

const longestIn = <T extends { length: number }> (array: T[]): T => {
	let longest = array[0];
	for (const x of array) { if (longest.length < x.length) longest = x; }
	return longest;
};

const removeANSI = (str: string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, "");



type MatrixType = string[][];
class Matrix {

	constructor (public array: MatrixType) {
		return this;
	}


	transpose () { this.array = Matrix.transpose(this.array); return this; }
	static transpose (matrix: MatrixType) {
		Matrix.validate(matrix);

		const output: MatrixType = [];
		const longestRowLength = longestIn(matrix).length;

		for (let i = 0; i < matrix.length; i++) {
			for (var j = 0; j < longestRowLength; j++) {
				if (output[j] === undefined) output[j] = [];
				output[j][i] = matrix[i][j] ?? "";
			}
		}
		return output;
	}


	reverseRows () { this.array = Matrix.reverseRows(this.array); return this; }
	static reverseRows (matrix: MatrixType) {
		Matrix.validate(matrix);
		for (let i = 0; i < matrix.length; i++) { matrix[i].reverse(); }
		return matrix;
	}

	validate () { this.array = Matrix.validate(this.array); return this; }
	static validate (matrix: MatrixType) { if (!Array.isArray(matrix) || matrix.some((row) => !Array.isArray(row))) { throw new Error("rotate2DArray: Array must be a 2D array, got " + JSON.stringify(matrix)); } return matrix; }


	rotate (angle = 90) { this.array = Matrix.rotate(this.array, angle); return this; }
	static rotate (matrix: MatrixType, angle = 90) {
		Matrix.validate(matrix);

		// Validate Angle
		if (angle % 90 !== 0) throw new Error("rotate2DArray: Angle must be a multiple of 90 degrees, got " + angle);
		angle = (angle < 0 ? 360 + angle : angle) % 360; // Allow negative angles (-90 to 270) and large (720 to 360)

		if (angle === 0 || angle === 360) { return matrix; }
		else if (angle === 90) { return Matrix.reverseRows(Matrix.transpose(matrix)); }
		else if (angle === 180) { return (Matrix.reverseRows(matrix)).reverse(); }
		else if (angle === 270) { return Matrix.transpose(Matrix.reverseRows(matrix)); }
		else { throw new Error("CATASTROPHIC FAILURE with: " + angle); }
	}
}



type FilePath = string;
async function scanDirectoryRecursive (startDir: FilePath) {
	interface FileEntry {
		name: string;
		fileName?: string;
		parents: FileEntry[];
		children: FileEntry[];
		size: number;
		depth: number;
		isDirectory: boolean;
	}

	let filesList: { [key: string]: FileEntry } = {
		[startDir]: { name: startDir, parents: [], size: 0, depth: 1, children: [], isDirectory: true },
	};
	const scanDirectory = async (pathtoScan: FilePath) => {
		return await Promise.all((await fsp.readdir(pathtoScan, { withFileTypes: true })).map(async (file, i) => {


			const object : FileEntry = {
				name: (pathtoScan + "/" + file.name),
				fileName: file.name,
				parents: [filesList[pathtoScan], ...filesList[pathtoScan].parents],
				children: [],
				size: 0,
				depth: 0,
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
	divider = "%%", line = " | ", trim = true, corners = ["╭", "╮", "╰", "╯"], hLine = "─",
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
			throw new Error("Invalid alignment: " + alignment[i]);
		});
	});

	return matrix.rotate(-90).reverseRows().array.map((x) => x.join(line)).join("\n");
}
