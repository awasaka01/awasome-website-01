import { longestIn } from "./core.js";
export function generate2DArray(width, height, fn) {
  const arr = [];
  for (let y = 0; y < height; y++) {
    arr.push([]);
    for (let x = 0; x < width; x++) {
      arr[y].push(fn ? fn(x, y) : null);
    }
  }
  return arr;
}
export class Matrix {
  array;
  constructor(arg1, height, mappingFunction = () => null) {
    if (typeof arg1 === "number" && height && mappingFunction) {
      const width = arg1;
      this.array = generate2DArray(width, height, mappingFunction);
    } else if (Array.isArray(arg1)) {
      this.array = arg1;
    }
  }
  // Transpose : Swap rows and columns
  transpose() {
    this.array = Matrix.transpose(this.array);
    return this;
  }
  static transpose(matrix) {
    Matrix.validate(matrix);
    const output = [];
    const longestRowLength = longestIn(matrix).length;
    for (let i = 0; i < matrix.length; i++) {
      for (var j = 0; j < longestRowLength; j++) {
        if (output[j] === void 0) output[j] = [];
        output[j][i] = matrix[i][j] ?? "";
      }
    }
    return output;
  }
  // Get a rectangular section of the matrix
  getRect(x, y, width, height, options) {
    return Matrix.getRect(this.array, x, y, width, height, options);
  }
  static getRect(matrix, x, y, width, height, options) {
    const result = [];
    for (let j = 0; j < height; j++) {
      const row = matrix[y + j];
      if (!row) return result;
      for (let i = 0; i < width; i++) {
        const cell = row[x + i];
        if (cell === void 0) continue;
        if (options?.fill || (j === 0 || j === height - 1 || i === 0 || i === width - 1)) result.push(cell);
      }
    }
    return result;
  }
  reverseRows() {
    this.array = Matrix.reverseRows(this.array);
    return this;
  }
  static reverseRows(matrix) {
    Matrix.validate(matrix);
    for (let i = 0; i < matrix.length; i++) {
      matrix[i].reverse();
    }
    return matrix;
  }
  validate() {
    this.array = Matrix.validate(this.array);
    return this;
  }
  static validate(matrix) {
    if (!Array.isArray(matrix) || matrix.some((row) => !Array.isArray(row))) {
      throw new Error("rotate2DArray: Array must be a 2D array, got " + JSON.stringify(matrix));
    }
    return matrix;
  }
  rotate(angle = 90) {
    this.array = Matrix.rotate(this.array, angle);
    return this;
  }
  static rotate(matrix, angle = 90) {
    Matrix.validate(matrix);
    if (angle % 90 !== 0) throw new Error("rotate2DArray: Angle must be a multiple of 90 degrees, got " + angle);
    angle = (angle < 0 ? 360 + angle : angle) % 360;
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
