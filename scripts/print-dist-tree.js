// Print a colorized, connected tree of the __dist directory using ansis and options object
import { readdirSync, statSync } from "fs";
import { join } from "path";
import ansis, { hex } from "ansis";

function printTree (startDir, colors = {}, symbols = {}) {
	const defaultColors = {
		root: (str) => hex("#f55858")`${str}`,
		file: (str) => hex("#ffe066")`${str}`,
		folder: (str) => hex("#00b9be")`${str}`,
		branch: (str) => hex("#686868")`${str}`,
		fileSize: (str) => hex("#686868")`${str}`,
	};
	colors = { ...defaultColors, ...colors };
	const defaultSymbols = {
		file: colors.branch("├─ "),
		line: colors.branch("╎  "),
		last: colors.branch("╰─ "),
		none: colors.branch("   "),
	};
	symbols = { ...defaultSymbols, ...symbols };

	let output = colors.root(`${startDir}/`);

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

	const scanDirectory = (currentPath, prefix = []) => {
		const files = readdirSync(currentPath);
		const folderSize = getFolderSize(currentPath);
		output += colors.fileSize(ansis.gray(` [${(folderSize / 1024).toFixed(2)} KB]`));

		files.forEach((file, idx) => {
			const stats = statSync(join(currentPath, file));

			const isLast = idx === files.length - 1;
			const isFolder = stats.isDirectory();
			const fileSize = isFolder ? "" : colors.fileSize(`[${(stats.size / (1024)).toFixed(2)} KB]`);

			const displayName = isFolder ? colors.folder(file + "/") : colors.file(file);

			// Decide which prefix to add based on whether it's the last file in the directory
			if (isLast) { prefix.push(symbols.last); }
			else { prefix.push(symbols.file); }

			output += `\n${prefix.join("")}${displayName} ${fileSize}`;

			if (isFolder) {
				// For children, replace the last prefix with 'none' if last, or 'line' if not last
				prefix[prefix.length - 1] = isLast ? symbols.none : symbols.line;
				scanDirectory(join(currentPath, file), prefix);
			}
			prefix.pop();
		});
	};

	scanDirectory(startDir);
	return output;
}
console.log(printTree("__dist"));
