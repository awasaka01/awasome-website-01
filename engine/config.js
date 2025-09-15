// @ts-check
// Some config is seperated into a seperate file so that it's seperate

const TIMESTAMPS_ENABLED = true;

import chalk from "chalk";
import path from "node:path";
import browserslist from "browserslist";


// Paths, relative to root
export const paths = {
	"engine": "engine", // Build tools and stuff
	"util": "source/awa-util", // Utilities
	"util-js": "__awa-util", // Utilities, compiled to JS for engine use only (if in src you must use the awa-util in src) 

	"source": "source", // Main source files (HTML, TS, SCSS, pages)
	"output": "^~^ website", // Compiled site / build output

	"scss": "source/_styles", // SCSS files used for imports
	"scripts": "source/scripts", // Global JS/TS scripts (different to /root/scripts)
	"includes": "source/_templates", // Template partials / layouts

	"images": "source/images", // Images
	"fonts": "source/fonts", // Fonts
};
// Convert all the relative paths to absolute
export const absPath = (p) => path.resolve(process.cwd(), p).replace(/\\/g, "/");
export const absPaths = Object.fromEntries(Object.entries(paths).map(([x, y]) => [x, absPath(y)]));




const keys = ["NEOCITIES", "DRYRUN", "TIMESTAMPS", "SERVE", "FULLBUILD", "CLEARDIST", "PRODUCTION"];
export const env = Object.fromEntries(keys.map((k) => [k, process.env[k] === "true"]));


export const port = 8080;
export const supported_browsers = browserslist(">=0.1%, not dead, not IE 11, not ios <= 14"); // console.log(browserslist);


// Custom logs and errors for consistent coloring and messages ff69b4
export const colors = {
	red: chalk.hex("#d73062"), bgRed: chalk.bgHex("#d73062"), grey: chalk.grey,
	pink: chalk.hex("#ff8cc5"), blue: chalk.hex("#89c2ff"), white: chalk.whiteBright,
	tagFG: chalk.hex("#8f7da3"), tagBG: chalk.bgHex("#3b2f49"), tag2: chalk.hex("#241a2d"),
	t: chalk.hex("#47404e"),
};
const tag = colors.tagBG(colors.tagFG(`${colors.tag2("[")}enid${colors.tag2("]")}`));
const timestamp = () => TIMESTAMPS_ENABLED ? colors.t(" " + (~~performance.now()).toString().padStart(5, "0")) : "";
export const log = (text, color = chalk.whiteBright) => console.log(`${tag}${timestamp()} ${color(text)}`);
export function err (msg, trace = false) {
	const callerLine = new Error().stack.split("\n")[2]?.trim() || "unknown location";
	console.error(colors.red(`\n${tag} 🛑 ERROR: ${chalk.underline.bold(msg)}`));
	if (trace) console.error(colors.grey(`       at ${callerLine}`));
	console.log("");
	process.exit(1);
}



// sass-embedded [https://sass-lang.com/documentation/js-api/interfaces/options/]
/** @type {import("sass-embedded").StringOptions} */
export const scss = {
	loadPaths: [absPaths.scss], style: env.FULLBUILD ? "compressed" : "expanded", alertColor: true,
	sourceMap: env.FULLBUILD, // Enable source maps if not for production
};


// vento [https://vento.js.org/configuration/]
export const vento = { dataVarname: "global", includes: paths.includes };
export const vento_data = { // data to pass to Vento templates, then can be accessd with {{ key }}
	"env": { ...process.env, ...env },
};





const transforms = {

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


