import { readdirSync, statSync, promises as fsp } from "fs";
import { join } from "path";
import chalk from "chalk";
import chroma from "chroma-js";

function longestIn (array) {
  let longest = { length: 0 };
  for (let x of array) if (longest.length < x.length) longest = x;
  return longest;
}

class Matrix {
  constructor (array) { this.array = array; return this; }
  transpose () { this.array = Matrix.transpose(this.array); return this; }
  static transpose (matrix) {
    Matrix.validate(matrix);
    const output = [];
    const longestRowLength = longestIn(matrix).length;
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < longestRowLength; j++) {
        if (!output[j]) output[j] = [];
        output[j][i] = matrix[i][j] ?? "";
      }
    }
    return output;
  }
  reverseRows () { this.array = Matrix.reverseRows(this.array); return this; }
  static reverseRows (matrix) {
    Matrix.validate(matrix);
    for (let row of matrix) row.reverse();
    return matrix;
  }
  validate () { this.array = Matrix.validate(this.array); return this; }
  static validate (matrix) {
    if (!Array.isArray(matrix) || matrix.some((row) => !Array.isArray(row))) throw new Error("Matrix must be a 2D array");
    return matrix;
  }
  rotate (angle = 90) { this.array = Matrix.rotate(this.array, angle); return this; }
  static rotate (matrix, angle = 90) {
    Matrix.validate(matrix);
    angle = (angle < 0 ? 360 + angle : angle) % 360;
    if (angle === 0 || angle === 360) return matrix;
    if (angle === 90) return Matrix.reverseRows(Matrix.transpose(matrix));
    if (angle === 180) return Matrix.reverseRows(matrix).reverse();
    if (angle === 270) return Matrix.transpose(Matrix.reverseRows(matrix));
  }
}

const removeANSI = (str) => str.replace(/\x1b\[[0-9;]*m/g, "");

async function scanDirectoryRecursive (startDir) {
  const filesList = { [startDir]: { name: startDir, parents: [], size: 0, depth: 1, children: [], isDirectory: true } };
  const scanDirectory = async (pathtoScan) => {
    const entries = await fsp.readdir(pathtoScan, { withFileTypes: true });
    return Promise.all(entries.map(async (file) => {
      const object = {
        name: pathtoScan + "/" + file.name,
        fileName: file.name,
        parents: [filesList[pathtoScan], ...filesList[pathtoScan].parents],
        children: [],
        size: 0,
        isDirectory: file.isDirectory(),
      };
      object.depth = object.parents.length * 10;
      filesList[pathtoScan].children.push(object);

      if (object.isDirectory) {
        filesList[object.name] = object;
        await scanDirectory(object.name);
      } else {
        object.depth += 1;
        object.size = (await fsp.stat(object.name)).size;
        object.parents.forEach((_, i) => object.parents[i].size += object.size);
        filesList[object.name] = object;
      }
    }));
  };
  await scanDirectory(startDir);
  return Object.values(filesList).sort((a, b) => a.depth - b.depth);
}

function formatColumns (lines, alignment = [], options = {}) {
  const { divider = "%%", line = "  ", trim = true } = options;
  const matrix = new Matrix(lines.map((l) => l.map((x) => trim ? x.toString().trim() : x))).rotate().reverseRows();
  const maxLengths = matrix.array.map((row) => longestIn(row.map((x) => removeANSI(x))).length);

  matrix.array = matrix.array.map((row, i) => {
    const desiredLength = maxLengths[i];
    return row.map((cell) => {
      const length = removeANSI(cell).length;
      const diff = Math.abs(length - cell.length);
      if (alignment[i] === "right") return cell.padStart(desiredLength + diff, " ");
      if (alignment[i] === "center") return cell.padEnd(Math.round((desiredLength + diff + length) / 2), " ").padStart(desiredLength + diff, " ");
      return cell.padEnd(desiredLength + diff, " ");
    });
  });

  return matrix.rotate(-90).reverseRows().array.map((x) => x.join(line)).join("\n");
}

export async function printTree (startDir, options = {}) {
  let { colors = {}, symbols = {}, sizeGatherMode = false } = options;

  const defaultColors = {
    root: (str) => chalk.hex("#f5db58")(str + "/"),
    file: (str) => chalk.hex("#fed1e8")(str),
    folder: (str) => chalk.hex("#0ceaf1")(str + "/"),
    branch: (str) => chalk.hex("#6b616b")(str),
    path: (str) => chalk.hex("#a8a3a8")(str),
    bg: ["#322e32", "#282528", "#202020", "#282528", "#322e32"],
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

  const files = await scanDirectoryRecursive(startDir);

  const maxBytesForColor = files[0].size / 2;
  const formatFileSize = (bytes, darken = 0) => {
    const rgb = chroma("#45704eff").mix("#b290ed", Math.min(bytes / maxBytesForColor, 1)).darken(darken).rgb();
    return chalk.rgb(...rgb)(`${(bytes / 1024).toFixed(1)}kB`);
  };

  const lines = [];
  const walk = (file, parent, prefix = []) => {
    let prefixSelf = [];
    let prefixChildren = [];

    const isLast = parent.children.at(-1) === file;
    const isRoot = file === files[0];

    if (!isRoot) {
      prefixSelf = [...prefix, isLast ? symbols.last : symbols.base];
      prefixChildren = [...prefix, isLast ? symbols.none : symbols.line];
    }

    const fileName = file.name.split("/").pop();
    lines.push([
      isRoot ? colors.root(fileName) : file.isDirectory ? colors.folder(fileName) : colors.file(fileName),
      formatFileSize(file.size),
      colors.path(file.name),
    ]);

    if (file.isDirectory) file.children.forEach((child) => walk(child, file, prefixChildren));
  };
  walk(files[0], files[0]);

  let output = formatColumns(lines, ["left", "right"]);
  output = output.split("\n").map((line, i) => chalk.bgHex(defaultColors.bg[i % defaultColors.bg.length])(line)).join("\n");

  return output;
}

export default printTree;
