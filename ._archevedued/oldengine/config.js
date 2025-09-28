// engine/config.js

// ✧ process.env is modified by the build script, so correct the types:
const env = /** @type {NodeJS.ProcessEnv & import('./config.js').env_type} */ (process.env);

/* ~~~~~ Imports ~~~~~ */
import chalk from "chalk";
import path from "node:path";
import chroma from "chroma-js";
import browserslist from "browserslist";


/* ~~~~~ Paths ~~~~~ */
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
	"cache": "__cache",
};
// - Convert all those paths to absolute
export const absPath = (p) => path.resolve(process.cwd(), p).replace(/\\/g, "/");
/** @type {Record<keyof typeof paths, string>} */ export const absPaths = Object.fromEntries(Object.entries(paths).map(([x, y]) => [x, absPath(y)]));



/* ~~~~~ Define Environment Variables - what flags enable them, and what other vars they enable ~~~~~ */
export const env_key = {
	NEOCITIES: { flags: ["n", "neo", "neocities"] },
	DRY_RUN: { flags: ["d", "dry", "dryrun", "test"] },
	DISABLE_INCREMENTAL: { flags: ["no-inc", "no-incremental"] },

	SERVE: { flags: ["s", "serve", "dev"], enable: ["SOURCE_MAPS"] },
		SOURCE_MAPS: { },

	PRODUCTION: { flags: ["p", "prod", "production", "full"], enable: ["MINIFY_FILES", "MINIFY_IMAGES"] },
		MINIFY_FILES: { },
		MINIFY_IMAGES: { },

	CLEAN: { flags: ["c", "clean"], enable: ["CLEAR_CACHE", "CLEAR_DIST"] },
		CLEAR_CACHE: { },
		CLEAR_DIST: { },
};
/** @typedef {Record<keyof typeof env_key, 'true' | 'false' | undefined>} env_type */



/* ~~~~~ Custom Logging, to ensure consistency ~~~~~ */
// - Define reusable colors:
export const colors = {
	"red": chalk.hex("#d73062"), "bgRed": chalk.bgHex("#d73062"), "grey": chalk.grey,
	"pink": chalk.hex("#ff8cc5"), "blue": chalk.hex("#89c2ff"), "white": chalk.whiteBright,
	"tagFG": chalk.hex("#8f7da3"), "tagBG": chalk.bgHex("#3b2f49"), "tag2": chalk.hex("#241a2d"),
	"time": chalk.hex("#47404e"),
};
// - The main identifier for all logs:
export const tag = chalk.reset(colors.tagBG(colors.tagFG(`${colors.tag2("[")}enid${colors.tag2("]")}`)));
// - Timestamps:
const timestamp_gradient = chroma.scale(["#47404e", "#aba4b3"]);
export const timestamp = () => {
	const now = performance.now();
	const color = timestamp_gradient(Math.min(1, now / 99999));
	return chalk.hex(color.hex())(" " + (~~now % 99999).toString().padStart(5, "0"));
};
// - Main log function:
export const log = (text, color = chalk.whiteBright, pre = "") => {
	text = text.replace("——", chalk.dim("——"));
	console.log(`${pre}${tag}${timestamp()} ${color(text)}`);
};
// - Error function:
export function err (msg, traceLength = 1) {
	console.log(colors.red(`\n${tag} ${colors.bgRed.whiteBright("ERROR")} ${chalk.bold(msg)}`));
	if (traceLength !== 0) console.error(colors.grey(`${new Error().stack.split("\n").slice(2, 2 + traceLength).join("\n")}\n`));
	process.exit(9_007_199_254_740_991);
}



/* ~~~~~  ~~~~~ */
export const port = 8080;
export const supported_browsers = browserslist(">=0.1%, not dead, not IE 11, not ios <= 14"); // console.log(browserslist);



/* ~~~~~ SCSS Config ~~~~~ */
/** @type {import("sass-embedded").StringOptions} */
export const scss = {
	alertColor: true,
	loadPaths: [absPaths.scss],
	style: env.MINIFY_FILES === "true" ? "compressed" : "expanded",
	sourceMap: env.SOURCE_MAPS === "true",
};



/* ~~~~~ Vento Config ~~~~~ */
export const vento = { dataVarname: "global", includes: paths.includes };
export const vento_data = { // data to pass to Vento templates, then can be accessd with {{ key }}:
	"env": { ...env },
};



