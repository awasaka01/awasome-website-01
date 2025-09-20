// engine/config.js
chalk.level = 3;
process.env.FORCE_COLOR = "1";

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
	"cache": "__cache",
	"compiled": "__compiled", // Compiled ts build scripts etc

	"source": "source", // Main source files (HTML, TS, SCSS, pages)
		"util": "source/awa-util", // Utilities
		"scss": "source/_styles", // SCSS files used for imports
		"scripts": "source/scripts", // Global JS/TS scripts (different to /root/scripts)
		"includes": "source/_templates", // Template partials / layouts
		"images": "source/images",
		"fonts": "source/fonts",
	"output": "^~^ website", // Compiled site / build output

};
// - Generate all absolute paths from relative
export const absPath = (p) => path.resolve(process.cwd(), p).replace(/\\/g, "/");
/** @type {Record<keyof typeof paths, string>} */ export const absPaths = Object.fromEntries(Object.entries(paths).map(([x, y]) => [x, absPath(y)]));



/* ~~~~~ Define rules for Environment Variables - which flags enable them, and what other vars they enable ~~~~~ */
export const env_key = {
	NEOCITIES: { flags: ["neo", "neocities"] },
	DRY_RUN: { flags: ["d", "dry", "dryrun", "test"] },
	DISABLE_INCREMENTAL: { flags: ["no-inc", "no-incremental"] },
	USE_NPX: { flags: ["npx"] },
	MAX_QUALITY: { flags: ["quality"] },

	SERVE: { flags: ["s", "serve", "dev"], enable: ["SOURCE_MAPS", "WATCH"] },
		SOURCE_MAPS: { },
		WATCH: { flags: ["w", "watch"] }, // < different to serve! enables auto reloading of config instead of only running once

	PRODUCTION: { flags: ["p", "prod", "production", "full"], enable: ["MINIFY_FILES", "MINIFY_IMAGES"] },
		MINIFY_FILES: { },
		MINIFY_IMAGES: { },

	CLEAN: { flags: ["c", "clean"], enable: ["CLEAR_CACHE", "CLEAR_DIST"] },
		CLEAR_CACHE: { },
		CLEAR_DIST: { flags: ["clear-dist", "cleardist"] },
	// CLEAR_IMAGES: { },
};
/** @typedef {Record<keyof typeof env_key, 'true' | 'false' | undefined>} env_type */


/* ~~~~~ External Dependencies ~~~~~ */
/** Import map to be included in each page's \<script type="importmap"> */
const importmap = { "imports": {
	"chroma-js": "https://unpkg.com/chroma-js@3.1.2/index.js",
	"react": "https://esm.sh/react@18",
	"react-dom/client": "https://esm.sh/react-dom@18/client",
	"react/jsx-runtime": "https://esm.sh/react@18/jsx-runtime",
	"bezier-easing": "https://unpkg.com/bezier-easing@2.1.0/dist/bezier-easing.min.js",
	"pathfinding": "https://cdn.jsdelivr.net/npm/pathfinding@0.0.1/pathfinding.min.js",
	// "use-sound": "https://unpkg.com/use-sound@5.0.0/dist/use-sound.cjs.production.min.js",
} };
/** Imports to ignore whilst bundling source .ts files */
export const external_dependencies = [...Object.keys(importmap.imports)];



/* ~~~~~ Custom Logging, to ensure consistency ~~~~~ */
// - Define reusable colors:
export const colors = {
	"red": chalk.hex("#d73062"), "bgRed": chalk.bgHex("#d73062"), "grey": chalk.grey,
	"pink": chalk.hex("#ff8cc5"), "blue": chalk.hex("#89c2ff"), "white": chalk.whiteBright,
	"tagFG": chalk.hex("#8f7da3"), "tagBG": chalk.bgHex("#3b2f49"), "tag2": chalk.hex("#241a2d"),
	"time": chalk.hex("#47404e"),
	"warn": chalk.hex("#fce643"),
};
// - The main identifier for all logs:
export const tag = chalk.reset(colors.tagBG(colors.tagFG(`${colors.tag2("[")}enid${colors.tag2("]")}`)));
// - Timestamps:
const timestamp_gradient = chroma.scale(["#47404e", "#aba4b3"]);
export const timestamp = () => {
	const now = performance.now();
	// const color = timestamp_gradient(Math.min(1, now / 99999));
	return chalk.hex("#47404e")(" " + (~~now % 99999).toString().padStart(5, "0"));
};
// - Main log function:
export const log = (text, color = chalk.whiteBright, pre = "", returnMessage = false) => {
	text = text.replace("——", chalk.dim("——"));
	const message = `${pre}${tag}${timestamp()} ${color(text)}`;
	if (returnMessage) return message;
	console.log(message);
};
// - Error function:
export function err (msg, traceLength = 1, exit = true) {
	console.log(colors.red(`${tag} ${colors.bgRed.whiteBright("ERROR")} ${chalk.bold(msg)}`));
	if (traceLength !== 0) console.error(colors.grey(`${new Error().stack.split("\n").slice(2, 2 + traceLength).join("\n")}\n`));
	if (exit) process.exit(0x0);
}



/* ~~~~~ General Config ~~~~~ */
export const version = "3.0.0";
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
	"importmap": JSON.stringify(importmap),
};



/* ~~~~~ Esbuild Config ~~~~~ */











// - Sparkles
const gradient = chroma.scale(["#3b2f49", "#bfc3da"]);
const sparkles = ".₊⊹݁⟡✧˖˚°♡⋆˚꩜｡⋆✶⋆.˚⊹✶⋆.˚⋆˚࿔.݁₊⊹.݁⟡݁.⊹₊݁.‧₊˚❀༉‧₊˚..⋆୨ৎ౨ৎ".split("");
const last = [];
function randomSparkle (i) {
	let sparkle = sparkles[Math.floor(Math.random() * sparkles.length)];
	if (last.includes(sparkle)) return randomSparkle(i);
	last.push(sparkle);
	if (last.length > 5) last.shift();
	sparkle = chalk.hex(gradient(i / 80).hex())(sparkle);
	if (Math.random() < 0.25) sparkle = chalk.bold(sparkle);
	if (Math.random() < 0.25) sparkle = chalk.italic(sparkle);
	if (Math.random() < 0.25) sparkle = chalk.dim(sparkle);
	return sparkle;
}
export const divider = () => Array.from({ length: 80 }, (_, i) => randomSparkle(i)).join("");
