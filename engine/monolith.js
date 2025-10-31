import chalk from "chalk";
import path from "node:path";
import browserslist from "browserslist";
import browserslistToEsbuild from "browserslist-to-esbuild";
import * as lightningcss from "lightningcss";

// ✧ when accessed from outside of sunnymiku.js, process.env has extra keys:
const env = /** @type {NodeJS.ProcessEnv & env_arguments_type} */ (process.env);

// ✧ env flags that allow color on github:
chalk.level = 3; process.env.FORCE_COLOR = "1";


/**
 * @typedef {null | boolean | number | string | JsonArray | JsonObject} JsonValue
 * @typedef {JsonValue[]} JsonArray
 * @typedef {{ [key: string]: JsonValue }} JsonObject
 */

/* |____________________________________________________________________| */
/* | ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ | */
//                               > config <
let __temp;

/*  --  General  --  */
export const version = "3.0.0";
export const port = 8080;
export const columns = process.stdout.columns ?? 80;

export const supported_browsers = browserslist(">=0.1%, not dead, not IE 11, not ios <= 14"); // console.log(browserslist);
export const supported_browsers_esbuild = browserslistToEsbuild(supported_browsers);
export const supported_browsers_lightningcss = lightningcss.browserslistToTargets(supported_browsers);


/*  --  Environment Variables  --  */
__temp = deepFreeze({
	NEOCITIES             : { flags: ["neo", "neocities"] },
	DRY_RUN               : { flags: ["d", "dry", "dryrun", "test"] },
	DISABLE_INCREMENTAL   : { flags: ["no-inc", "no-incremental"] },
	USE_NPX               : { flags: ["npx"] },
	MAX_QUALITY           : { flags: ["max-quality"] },
	SOURCE_MAPS           : { flags: ["source-maps", "sourcemaps", "map", "maps", "sourcemap", "source-map"] },
	SERVE                 : { flags: ["s", "serve", "dev"], enable: ["WATCH"] },
		WATCH                 : { flags: ["w", "watch"] }, // < different to serve! enables auto reloading of config instead of only running once
	PRODUCTION            : { flags: ["p", "prod", "production", "full"], enable: ["MINIFY_FILES", "MINIFY_IMAGES"] },
		MINIFY_FILES          : { flags: ["minify", "min"] },
		MINIFY_IMAGES         : { flags: ["minify-images"] },
	CLEAN                 : { flags: ["clean"], enable: ["NO_CACHE", "CLEAR_DIST", "CLEAR_IMAGES"] },
		NO_CACHE              : { flags: ["nc", "no-cache", "nocache"] },
		CLEAR_DIST            : { flags: ["c", "clear-dist", "cleardist"] },
		CLEAR_IMAGES          : { flags: ["clear-images"] },
	VERBOSE               : { flags: ["v", "verbose"], enable: ["VERBOSE_"] },
		VERBOSE_LOG_ALL_FILES : { flags: ["verbose-log-all-files"] },
		VERBOSE_MISC          : { flags: ["verbose-misc"] },
		// VERBOSE_SHOW_CHILDREN : { },
});
export const env_arguments_key = /** @type {Record<keyof typeof __temp, { flags: string[], enable: string[] }>} */ (__temp);
/** @typedef {Record<keyof typeof env_arguments_key | "IS_ROOT_PROCESS", 'true' | 'false'>} env_arguments_type */



/*  --  External Dependencies  --  */
/** Import map to be included in each page's \<script type="importmap"> */
export const importmap = Object.freeze({ "imports" : {
	"chroma-js"     : "https://esm.sh/chroma-js@3.1.2", // esm.sh is the best
	"react"         : "https://esm.sh/react@19",
	"react-dom/"    : "https://esm.sh/react-dom@19/",
	"simplex-noise" : "https://unpkg.com/simplex-noise@4.0.3/dist/esm/simplex-noise.js",
} });
/** Names of imports to ignore whilst bundling source .ts files */
export const external_dependencies = ([...Object.keys(importmap.imports)]);



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
//                      > logging, warnings, errors <

__temp = deepFreeze(/** @type {const} */({
	langJS    : "#f7df1d",
	langTS    : "#2f74c0",
	langCSS   : "#2da8e0",
	langSCSS  : "#cf649a",
	langHTML  : "#f06427",
	langVTO   : "#080884",
	high1     : "#8f7da3",
	low1      : "#66606c",
	low2      : "#423f44",
	low3      : "#272a2d",
	success   : "#5ae674",
	failure   : "#ed4360",
	warning   : "#d3f072",
	timestamp : "#47404e",
	esbuild   : "#ffbd60",
	eleventy  : ["#ffffff", "#222222"],
	enid      : ["#000000", "#af7cd3", "#8352a9"],
	miku      : ["#2d2a30", "#4bdfdf", "#249a9a"],
	blue      : "#89c2ff",
	pink      : "#ff8cc5",
	white     : "#ffffff",
	divider01 : ["#78737c", "#78737c"],
}));

/** Color palette for consistency */
export const colors = Object.freeze({
    ...__temp,
    fg : /** @type {{ [K in keyof typeof __temp]: typeof __temp[K] extends string ? import("chalk").ChalkInstance : import("chalk").ChalkInstance[] }} */
	(Object.freeze(Object.fromEntries(Object.entries(__temp).map(([key, value]) => {
        if (typeof value === "string") return [key, chalk.hex(value)];
        return [key, value.map((c) => chalk.hex(c))];
    })))),
    bg : /** @type {{ [K in keyof typeof __temp]: typeof __temp[K] extends string ? import("chalk").ChalkInstance : import("chalk").ChalkInstance[] }} */
	(Object.freeze(Object.fromEntries(Object.entries(__temp).map(([key, value]) => {
        if (typeof value === "string") return [key, chalk.bgHex(value)];
        return [key, value.map((c) => chalk.bgHex(c))];
    })))),
});

/** 5-digit timestamp that changes every millisecond, wraps at 10,000 */
export const timestamp = () => chalk.hex(colors.timestamp)((~~performance.now() % 99999).toString().padStart(5, "0"));

/** preset tags, inserted before timestamp, clarifying the message source */
const tags = Object.freeze({
	"none"    : "",
	"11ty"    : colors.fg.eleventy[0](colors.bg.eleventy[1](" 11ty ")) + " ",
	"sass"    : colors.fg.langSCSS("") + colors.bg.langSCSS("𝓢𝒶𝓈𝓈") + colors.fg.langSCSS(" "),
	"esbuild" : colors.fg.esbuild(" " + colors.bg.esbuild.black.bold(">>") + "  "),
	"miku"    : colors.fg.miku[0](colors.bg.miku[1](colors.fg.miku[2](colors.bg.miku[1]("▌")) + "miku" + colors.fg.miku[2](colors.bg.miku[1]("▐")))) + " ",
	"enid"    : colors.fg.enid[0](colors.bg.enid[1](colors.fg.enid[2](colors.bg.enid[1]("▌")) + "evil" + colors.fg.enid[2](colors.bg.enid[1]("▐")))) + " ",
});


/* ====    print messages    ==== */
/** log a messagee to the console in a consistent style @param {string} message @param {keyof typeof tags} type */
export function log (message, type = "enid", enable_timestamp = true, prefix = "") {
	const tag = tags[type];
	// message = message.replaceAll("—", chalk.dim("—")); // other line to emdash —
	message = message.replaceAll("—", chalk.hex("#999999")("—"));
	enable_timestamp ? console.log(`${prefix}${tag}${timestamp()} ${message}`) : console.log(`${tag}${message}`);
}
// —— —— 

/* ====    warnings    ==== */
const warnings = /** @type {{ [key: string]: [keyof typeof tags, number] }} */ ({});

/** @param {string} message @param {keyof typeof tags} type */
export function warn (message, type = "enid") {
	if (env.IS_ROOT_PROCESS === "false") return sendIPC({ function_id: "warn", args: [message, type] });
	if (warnings[message]) warnings[message][1] += 1;
	else warnings[message] = [type, 1];
}

export function printWarnings () {
	if (env.IS_ROOT_PROCESS === "false") return sendIPC({ function_id: "print-warnings", args: [] });
	if (Object.keys(warnings).length <= 0) return;
	console.log(chalk.hex(colors.warning)("◢◤".repeat(columns / 2)));
	const warningCount = Object.values(warnings).reduce((a, b) => a + b[1], 0);
	console.log(padBoth(colors.fg.warning("!!        " + chalk.bold.underline(`${warningCount} Warning${warningCount !== 1 ? "s" : ""}:`) + "        !!")));
	Object.entries(warnings).forEach(([message, [type, count]]) => {
		log(chalk.dim("· ") + message + chalk.hex(colors.low2)(` x${count}`), type, false);
	});
	console.log("\n" + chalk.hex(colors.warning)("◢◤".repeat(columns / 2)));
}


/* ====    errors    ==== */
/** @param {string} msg @param {keyof typeof tags} tag @param {boolean} noexit */
export const error = (msg, tag = "miku", noexit = false) => {
	console.log(chalk.hex(colors.failure)(`${tags[tag]}${timestamp()} ${chalk.bgHex(colors.failure).black(" ERROR ")}: ${chalk.bold(msg)}`));
	if (!noexit) process.exit(0x0);
};


/* ====    miscellaneous    ==== */
/** @param {number} id */
export function divider (id) {
	return [
		chalk.dim.hex(colors.divider01[0])((`╤`).repeat(columns)) + "\n" + chalk.dim.hex(colors.divider01[1])((`▀`).repeat(columns)),
		chalk.dim.hex(colors.divider01[1])((`▄`).repeat(columns)) + "\n" + chalk.dim.hex(colors.divider01[0])((`╧`).repeat(columns)),
		chalk.bgHex("#df8831").hex("#1e1928").bold("".padStart(columns, " ┇ ■")),
		chalk.bgHex("#df3152").hex("#1e1928").bold("".padStart(columns, " ┇ ■")),
	][id];
}



/* |____________________________________________________________________| */
/* | ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ | */
//                               > symbol <
export const symbols = {
	ts : colors.fg.langTS.bold("TS"),
};



/* |____________________________________________________________________| */
/* | ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ | */
//                              > fake ipc <


export const IPC_IDENTIFIER = "[IPC]";
export const handleIPCMessage = (string) => {
	const json = JSON.parse(string.slice(IPC_IDENTIFIER.length));
	({
		"warn"           : warn,
		"print-warnings" : printWarnings,
	})[json.function_id](...json.args);
};
export const sendIPC = (object) => console.log(IPC_IDENTIFIER + JSON.stringify(object));


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

export function removeANSI (str) { return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, ""); }
export function padBoth (str, targetLength = process.stdout.columns ?? 80, char = " ") {
	let out = [];
	str.split("\n").forEach((line) => {
		const strLength = removeANSI(line).length;
		if (strLength >= targetLength) return line;
		const left = Math.floor((targetLength - strLength) / 2);
		const right = targetLength - strLength - left;
		out.push("".padStart(left, char) + line + "".padStart(right, char));
	});
	return out.join("\n");
}



/* |____________________________________________________________________| */
/* | ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ | */
//                               > banner <

export const SUNNYMIKU_BANNER = padBoth(`\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▀\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m▄\x1b[39m
\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;255;209;171m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;255;209;171m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;255;209;171m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;255;209;171m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;255;209;171m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;255;209;171m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m 
\x1b[0m\x1b[0m\x1b[38;2;255;209;171m▀\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m▀\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m
\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m▀\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;255;209;171m\x1b[48;2;207;121;87m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;207;121;87m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▄\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m\x1b[48;2;117;57;57m▀\x1b[49m\x1b[39m\x1b[0m\x1b[0m\x1b[38;2;117;57;57m▀\x1b[39m
\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m\x1b[38;2;207;121;87m▀\x1b[39m\x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m \x1b[0m\x1b[0m `);
