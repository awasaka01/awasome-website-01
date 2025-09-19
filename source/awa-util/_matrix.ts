type Array2D = any[][];
type Generate = (x : number, y : number) => any;

import { longestIn } from "./core.js";

export function generate2DArray (width : number, height : number, fn ?: Generate) : Array2D {
	const arr : Array2D = [];
	for (let y = 0; y < height; y++) {
		arr.push([]);
		for (let x = 0; x < width; x++) {
			arr[y].push(fn ? fn(x, y) : null);
		}
	}
	return arr;
}


export class Matrix {
	public array : Array2D;

	// "Overload signatures"
	constructor (array : Array2D);
	constructor (width : number, height : number, fn ?: Generate);

	constructor (arg1 : Array2D | number, height ?: number, mappingFunction : Generate = () => null) {
		// If arg1 is a number, and all other arguments are defined, generate the matrix with that width and height
		if (typeof arg1 === "number" && height && mappingFunction) {
			const width = arg1;
			this.array = generate2DArray(width, height, mappingFunction);
		}
		// If arg1 is an array, use it for the matrix
		else if (Array.isArray(arg1)) {
			this.array = arg1;
		}
	}

	// Transpose : Swap rows and columns
	transpose () {
		this.array = Matrix.transpose(this.array);
		return this;
	}
	static transpose (matrix : Array2D) {
		Matrix.validate(matrix);

		const output : Array2D = [];
		const longestRowLength = longestIn(matrix).length;

		for (let i = 0; i < matrix.length; i++) {
			for (var j = 0; j < longestRowLength; j++) {
				if (output[j] === undefined) output[j] = [];
				output[j][i] = matrix[i][j] ?? "";
			}
		}
		return output;
	}

	// Get a rectangular section of the matrix
	public getRect (x : number, y : number, width : number, height : number, options ?: { fill ?: boolean, }) : any[] { return Matrix.getRect(this.array, x, y, width, height, options);	}
	static getRect (matrix : Array2D, x : number, y : number, width : number, height : number, options ?: { fill ?: boolean }) : any[] {
		const result : any[] = [];
		for (let j = 0; j < height; j++) {
			const row = matrix[y + j];
			if (!row) return result; // hit bottom of matrix, end early

			for (let i = 0; i < width; i++) {
				const cell = row[x + i];
				if (cell === undefined) continue;
				if (options?.fill || (j === 0 || j === height - 1 || i === 0 || i === width - 1)) result.push(cell);
			}
		}

		return result;
	}

	reverseRows () {
		this.array = Matrix.reverseRows(this.array);
		return this;
	}
	static reverseRows (matrix : Array2D) {
		Matrix.validate(matrix);
		for (let i = 0; i < matrix.length; i++) {
			matrix[i].reverse();
		}
		return matrix;
	}

	validate () {
		this.array = Matrix.validate(this.array);
		return this;
	}
	static validate (matrix : Array2D) {
		if (!Array.isArray(matrix) || matrix.some((row) => !Array.isArray(row))) {
			throw new Error("rotate2DArray: Array must be a 2D array, got " + JSON.stringify(matrix));
		}
		return matrix;
	}

	rotate (angle = 90) {
		this.array = Matrix.rotate(this.array, angle);
		return this;
	}
	static rotate (matrix : Array2D, angle = 90) {
		Matrix.validate(matrix);

		// Validate Angle
		if (angle % 90 !== 0) throw new Error("rotate2DArray: Angle must be a multiple of 90 degrees, got " + angle);
		angle = (angle < 0 ? 360 + angle : angle) % 360; // Allow negative angles (-90 to 270) and large (720 to 360)

		if (angle === 0 || angle === 360) {
			return matrix;
		} else if (angle === 90) {
			return Matrix.reverseRows(Matrix.transpose(matrix));
		} else if (angle === 180) {
			return Matrix.reverseRows(matrix).reverse();
		} else if (angle === 270) {
			return Matrix.transpose(Matrix.reverseRows(matrix));
		} else {
			throw new Error("CATASTROPHIC FAILURE with: " + angle);
		}
	}
}
