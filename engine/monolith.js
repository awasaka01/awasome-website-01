// @ts-check
import chalk from "chalk";
import path from "node:path";
import chroma from "chroma-js";
import browserslist from "browserslist";

// ✧ when accessed from outside of sunnymiku.js, process.env has extra keys:
const env = /** @type {NodeJS.ProcessEnv & import('./monolith.js').env_arguments_type} */ (process.env);

// ✧ env flags that allow color on github:
chalk.level = 3; process.env.FORCE_COLOR = "1";



/* |____________________________________________________________________| */
/* | ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ | */
//                               > config <

/*  --  General  --  */
export const version = "3.0.0";
export const port = 8080;
export const supported_browsers = browserslist(">=0.1%, not dead, not IE 11, not ios <= 14"); // console.log(browserslist);
export const columns = process.stdout.columns ?? 80;



/*  --  Environment Variables  --  */
var __temp = deepFreeze({
	NEOCITIES           : { flags: ["neo", "neocities"] },
	DRY_RUN             : { flags: ["d", "dry", "dryrun", "test"] },
	DISABLE_INCREMENTAL : { flags: ["no-inc", "no-incremental"] },
	USE_NPX             : { flags: ["npx"] },
	MAX_QUALITY         : { flags: ["max-quality"] },
	SOURCE_MAPS         : { flags: ["source-maps", "sourcemaps", "map", "maps", "sourcemap", "source-map"] },
	SERVE               : { flags: ["s", "serve", "dev"], enable: ["WATCH"] },
		WATCH               : { flags: ["w", "watch"] }, // < different to serve! enables auto reloading of config instead of only running once
	PRODUCTION          : { flags: ["p", "prod", "production", "full"], enable: ["MINIFY_FILES", "MINIFY_IMAGES"] },
		MINIFY_FILES        : { flags: ["minify", "min"] },
		MINIFY_IMAGES       : { },
	CLEAN               : { flags: ["c", "clean"], enable: ["CLEAR_CACHE", "CLEAR_DIST"] },
		CLEAR_CACHE         : { },
		CLEAR_DIST          : { flags: ["clear-dist", "cleardist"] },
});
export const env_arguments_key = /** @type {Record<keyof typeof __temp, { flags: string[], enable: string[] }>} */ (__temp);
/** @typedef {Record<keyof typeof env_arguments_key, 'true' | 'false'>} env_arguments_type */



/*  --  External Dependencies  --  */
/** Import map to be included in each page's \<script type="importmap"> */
export const importmap = Object.freeze({ "imports": {
	"chroma-js"     : "https://esm.sh/chroma-js@3.1.2", // esm.sh is the best
	"react"         : "https://esm.sh/react@19",
	"react-dom/"    : "https://esm.sh/react-dom@19/",
	"simplex-noise" : "https://unpkg.com/simplex-noise@4.0.3/dist/esm/simplex-noise.js",
} });
/** Names of imports to ignore whilst bundling source .ts files */
export const external_dependencies = Object.freeze([...Object.keys(importmap.imports)]);



/*  --  File Paths  --  */
/** Paths to various directories, relative to cwd, use `abs_paths` for absolute */
export const paths = Object.freeze({
	"engine"   : "engine", // build tools and stuff
	"cache"    : "__cache",
	"compiled" : "__compiled", // compiled ts build scripts etc
	"source"   : "source", // main source files (HTML, TS, SCSS, pages)
	"util"     : "source/awa-util", // utilities for any page
	"scss"     : "source/_styles", // SCSS files to scan when @use-ing
	"includes" : "source/_templates", // template partials . layouts for Vento
	"images"   : "source/images",
	"fonts"    : "source/fonts",
	"output"   : "^~^ website", // compiled site . build output
});
/** Absolute version of `paths` */
export const abs_paths = /** @type {Readonly<Record<keyof typeof paths, string>>} */ (Object.freeze(Object.fromEntries(Object.entries(paths).map(([x, y]) => [x, path.resolve(process.cwd(), y).replace(/\\/g, "/")]))));



/*  --  SCSS config, passed to sass-embedded  --  */
/** @type {import("sass-embedded").StringOptions} */
export const scss = {
	alertColor : true,
	loadPaths  : [abs_paths.scss],
	style      : env.MINIFY_FILES === "true" ? "compressed" : "expanded",
	sourceMap  : env.SOURCE_MAPS === "true",
	// in eleventy.ts: ', logger: { debug: sassLogger.debug, warn: sassLogger.warn }'
};



/*  --  Vento config, passed to eleventy-plugin-vento  --  */
/** @type {import("ventojs").Options} */
export const vento = { dataVarname: "global", includes: paths.includes };



/* |____________________________________________________________________| */
/* | ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ | */
//                               > tools <

const fg = /** @param {string} c */ (c) => chalk.hex(c);
const bg = /** @param {string} c */ (c) => chalk.bgHex(c);

export const colors = Object.freeze({
	blue: chalk.hex("#89c2ff"), pink: chalk.hex("#ff8cc5"), white: chalk.hex("#ffffff"),

	langJS   : "#f7df1d", langTS   : "#2f74c0",
	langCSS  : "#2da8e0", langSCSS : "#cf649a",
	langHTML : "#f06427", langVTO  : "#080884",

	high1: "#8f7da3", low1: "#66606c", low2: "#545156", low3: "#272a2d",

	success: "#5ae674", failure: "#f05858", warning: "#eabb6b",

	timestamp : "#47404e",
	divider01 : ["#78737c", "#78737c"],

	esbuild  : "#ffbd60",
	eleventy : [fg("#fff"), bg("#222")],
	enid     : [fg("#2d2a30"), bg("#aa86ce"), (s) => fg("#785a9c")(bg("#aa86ce")(s))],
	miku     : [fg("#373b3e"), bg("#86cecb"), (s) => fg("#528f99")(bg("#86cecb")(s))],
});

/** timestamp */
export const timestamp = () => chalk.hex(colors.timestamp)((~~performance.now() % 99999).toString().padStart(5, "0"));

const tags = Object.freeze({
	"none"    : "",
	"11ty"    : " " + colors.eleventy[0](colors.eleventy[1]("11ty")) + "  ",
	"sass"    : fg(colors.langSCSS)(" Sass  "),
	"esbuild" : fg(colors.esbuild)(" " + bg(colors.esbuild).black.bold(">>") + "  "),
	"miku"    : colors.miku[0](colors.miku[1](colors.miku[2]("▌") + "miku" + colors.miku[2]("▐"))) + " ",
	"enid"    : colors.enid[0](colors.enid[1](colors.enid[2]("▌") + "enid" + colors.enid[2]("▐"))) + " ",
});

/** @param {string} message @param {keyof typeof tags} type */
export function log (message, type = "enid", enable_timestamp = true) {
	const tag = tags[type];

	message = message.replace("——", chalk.dim("——"));
	enable_timestamp ? console.log(`${tag}${timestamp()} ${message}`) : console.log(`${tag}${message}`);
}

export const warnings = /** @type {{ [key: string]: [keyof typeof tags, number] }} */ ({});

/** @param {string} message @param {keyof typeof tags} type */
export function warn (message, type = "enid") {
	if (warnings[message]) warnings[message][1] += 1;
	else warnings[message] = [type, 1];
	console.log(warnings);
}
export function printWarnings () {
	if (Object.keys(warnings).length <= 0) return;

	console.log(chalk.hex(colors.warning)("◢◤".repeat(columns / 2)));
	console.log(padBoth(chalk.hex(colors.warning).bold.underline(`⚠️  ${Object.keys(warnings).length} Warnings:`)));
	Object.entries(warnings).forEach(([message, [type, count]]) => {
		log(chalk.dim("· ") + message + chalk.hex(colors.low2)(` x${count}`), type, false);
	});
	console.log("\n" + chalk.hex(colors.warning)("◢◤".repeat(columns / 2)));
}

/** @param {number} id */
export function divider (id) {
	return [
		chalk.dim.hex(colors.divider01[0])((`╤`).repeat(columns)) + "\n" + chalk.dim.hex(colors.divider01[1])((`▀`).repeat(columns)),
		chalk.dim.hex(colors.divider01[1])((`▄`).repeat(columns)) + "\n" + chalk.dim.hex(colors.divider01[0])((`╧`).repeat(columns)),
	][id];
}


export const err = (msg) => {
	console.log(chalk.red(`${tags.miku} ${chalk.bgRed.whiteBright("ERROR")} ${chalk.bold(msg)}`));
};


/* |____________________________________________________________________| */
/* | ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ | */
//                       > non-exported functions <


/**
 * @template T
 * @typedef {T extends (infer U)[] ? ReadonlyArray<ReadonlyDeep<U>> :
 *           T extends object ? { readonly [K in keyof T]: ReadonlyDeep<T[K]> } :
 *           T} ReadonlyDeep
 */
/**
 * @template T
 * @param {T} obj
 * @returns {ReadonlyDeep<T>}
 */
function deepFreeze (obj) {
	Object.freeze(obj);
	Object.entries(obj).forEach(([key, value]) => {
		if (value !== null && (typeof value === "object" || Array.isArray(value)) && !Object.isFrozen(value)) {
			deepFreeze(value);
		}
	});
	return /** @type {ReadonlyDeep<T>} */ (obj);
}













/*  --  Functions stolen from util folder  --  */

export const removeANSI = (str) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, "");
export function padBoth (str, targetLength = process.stdout.columns ?? 80, char = " ") {
	const strLength = removeANSI(str).length;
	if (strLength >= targetLength) return str;

	const left = Math.floor((targetLength - strLength) / 2);
	const right = targetLength - strLength - left;
	return "".padStart(left, char) + str + "".padStart(right, char);
}
