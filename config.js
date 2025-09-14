// Some config is seperated into a seperate file so that it's seperate

import chalk from "chalk";
import { fileURLToPath } from "node:url";
import { relative } from "node:path";
import browserslist from "browserslist";



export const colors = {
	red: chalk.hex("#f35252"), yellow: chalk.yellow, grey: chalk.grey,
	pink: chalk.hex("#ff69b4"), blue: chalk.hex("#89c2ff"),
	white: chalk.whiteBright,
};
export const log = (text, color = chalk.whiteBright, tag = "[enid] ") => console.log(`${colors.grey(tag)}${color(text)}`);

// Custom error generator
export function err (msg, trace = false) {
	// const error = new Error(colors.red(`${colors.grey("[enid]")} ❌ ${msg}`));
	// if (error.stack) {
	// 	const lines = error.stack.split("\n");
	// 	error.stack = [lines[0], ...lines.slice(2, 5)].join("\n");
	// }
	// return error;
	const e = new Error();
  const stackLines = e.stack.split("\n");

  // The first line is "Error", second line is the caller
  const callerLine = stackLines[2]?.trim() || "unknown location";
	console.error(colors.red(`${colors.grey("[enid]")} 🛑 ${msg}`));
	// console.error(colors.grey(`at ${callerLine}`));
	console.log("");
	process.exit(1); // stop the program immediately
}


export const env = {
	"FULLBUILD": process.env.FULLBUILD !== undefined, // Enable all unnecessary features like minification
	"NEOCITIES": process.env.NEOCITIES !== undefined, // Disable some features for a neocities build
};


// Resolve relative path to absolute, just ensuring consistency
const abs = (p) => fileURLToPath(new URL(p, import.meta.url)).replace(/\\/g, "/");

export const paths = {
	"source": abs("./src"),
	"output": abs("./__dist"),
	"util": abs("./awa-util/core.ts"),
	"scss": abs("./src/_styles"),
	"includes": abs("./src/_includes"),
};
export const directories = {
	"images": "images",
};




export const port = 8080;


// used by nothing
export const supported_browsers = browserslist(">=0.1%, not dead, not IE 11, not ios <= 14"); // console.log(browserslist);


// sass-embedded [https://sass-lang.com/documentation/js-api/interfaces/options/]
/** @type {import("sass-embedded").StringOptions} */
export const scss = {
	loadPaths: [paths.scss], style: env.FULLBUILD ? "compressed" : "expanded", alertColor: true,
	sourceMap: !env.FULLBUILD, // Enable source maps if not for production
};


// vento [https://vento.js.org/configuration/]
export const vento = { dataVarname: "global", includes: relative(".", paths.includes) };
export const vento_data = { // data to pass to Vento templates, then can be accessd with {{ key }}
	"env": { ...process.env, ...env },
};



export const transforms = {

	"html": (content, data) => {

		// Arbitrary replace functions using regexes in frontmatter .replace object
		if (data.replace) {
			for (const [str, replace] of Object.entries(data.replace)) {
				const lastSlashIndex = str.lastIndexOf("/");
				const regex = new RegExp(str.slice(1, lastSlashIndex), str.slice(lastSlashIndex + 1));
				content = content.replaceAll(regex, replace);
			}
		}

		// Color replacer 𝓒1:┃◺ - more complex than standard replacing so it's seperate
		const colorMatches = data.colorMatches ? [...content.matchAll(/𝓒(\d):(.*?)◺/g)] : [];
		if (colorMatches.length) {
			let result = "", cursor = 0;
			colorMatches.forEach((match) => {
				const [full, colorNum, text] = match;
				const idx = content.indexOf(full, cursor);
				result += content.slice(cursor, idx);
				result += `<span class="boxdraw-color-${colorNum}">${text}</span>`;
				cursor = idx + full.length;
			});
			result += content.slice(cursor); content = result;
		}
		return content;
	},
};


