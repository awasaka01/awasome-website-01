// Print a colorized, connected tree of the __dist directory using ansis and options object
import { readdirSync, statSync } from "fs";
import { join } from "path";
import ansis, { hex } from "ansis";
import u from "../src/modules/util.js";

let lines = [
	"1hi!    %% uwuwu %% [12]",
	"2hi! %% uwuwu %% [12]",
	"3h4124125ei! %% uw341uwu %% [1341342]",
	"4h2412ei! %% u234241weuwu %% [r12]",
	"5h2412ei! %% u23424123123weuwu %% [r12] %% EXtra",
];
// lines =

console.log(u.formatColumns(lines, ["left", "center", "right"]));




/*
function printTree (startDir, colors = {}, symbols = {}) {
	const defaultColors = {
		root: (str) => hex("#f55858")`${str}`,
		file: (str) => hex("#ffe066")`${str}`,
		folder: (str) => hex("#00b9be")`${str}`,
		branch: (str) => hex("#96a2ad")`${str}`,
		fileSize: (str) => hex("#96a2ad")`${str}`,
		path: (str) => hex("#000000")`${str}`,
	};
	colors = { ...defaultColors, ...colors };
	const defaultSymbols = {
		file: colors.branch(" ├─ "),
		line: colors.branch(" ╎  "),
		last: colors.branch(" ╰─ "),
		none: colors.branch("    "),
	};
	symbols = { ...defaultSymbols, ...symbols };


	function getFolderSize (dir) {
		let total = 0;
		for (const file of readdirSync(dir)) {
			const stats = statSync(join(dir, file));
			if (stats.isDirectory()) {
				total += getFolderSize(join(dir, file));
			} else {
				total += stats.size;
			}
		}
		return total;
	}

	const output = [`${colors.root(`${startDir}/`)}%%${getFolderSize(startDir)}`];

	const scanDirectory = (currentPath, prefix = []) => {
		let files = readdirSync(currentPath);
		// Sort: files first, then directories, both alphabetically
		files = files.sort((a, b) => {
			const aIsDir = statSync(join(currentPath, a)).isDirectory();
			const bIsDir = statSync(join(currentPath, b)).isDirectory();
			if (aIsDir === bIsDir) return a.localeCompare(b);
			return aIsDir ? 1 : -1; // files first
		});

		const folderSize = colors.fileSize(colors.fileSize(` [${(getFolderSize(currentPath) / 1024).toFixed(2)} KB]`));

		files.forEach((file, idx) => {
			const stats = statSync(join(currentPath, file));

			const isLast = idx === files.length - 1;
			const isFolder = stats.isDirectory();
			const fileSize = isFolder ? folderSize : colors.fileSize(`[${(stats.size / (1024)).toFixed(2)} KB]`);

			const displayName = isFolder ? colors.folder(file + "/") : colors.file(file);

			// Decide which prefix to add based on whether it's the last file in the directory
			if (isLast) { prefix.push(symbols.last); }
			else { prefix.push(symbols.file); }

			const line = `${prefix.join("")}${displayName} ${fileSize} ^w^ ${colors.path(join(currentPath, file))}`;
			output.push(line);


			if (isFolder) {
				// For children, replace the last prefix with 'none' if last, or 'line' if not last
				prefix[prefix.length - 1] = isLast ? symbols.none : symbols.line;
				scanDirectory(join(currentPath, file), prefix);
			}
			prefix.pop();
		});
	};

	scanDirectory(startDir);

	const stripColorCodes = (str) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, "");

	// Calculate longest line length
	const longestLine = output.reduce((longest, line) => Math.max(longest, stripColorCodes(line.split("^w^")[0]).length), 0);


	// Add padding to all lines to make them the same length
	output.forEach((line, i) => {
		const split = line.split("^w^");
		const lengthOfFirstPart = stripColorCodes(split[0]).length;
		// const lengthOfSecondPart = stripColorCodes(split[1]).length;
		const padding = " ".repeat(longestLine - lengthOfFirstPart);

		output[i] = line.replace("^w^", padding);
	});




	return output.join("\n");
}
console.log(printTree("__dist"));


/**/
