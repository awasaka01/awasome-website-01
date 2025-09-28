// @ts-check

// ──────────────────────────────────────────────────────────────────────────────────────────────────
//
//  Modify Eleventy's log output
//
// ──────────────────────────────────────────────────────────────────────────────────────────────────

// - node modules
import chroma from "chroma-js";
import chalk from "chalk";

// - my config
import * as config from "./config.js";
const { log, err, colors, paths, absPaths } = config;

// ✧ process.env is modified by the build script, so correct the types:
const env = /** @type {NodeJS.ProcessEnv & import('./config.js').env_type} */ (process.env);


/* ~~~~~ Define custom colors ~~~~~ */
const color_palette = [
	["\x1b[39m", chalk.hex("#66606c")(":").split(":")[0]], // reset
	["\x1b[90m", chalk.hex("#545156")(":").split(":")[0]], // grey
	["\x1b[32m", chalk.hex("#8f7da3")(":").split(":")[0]], // green
];
const fileType_colors = {
	js: chalk.hex("#cbcb41"),
	ts: chalk.hex("#519aba"),
	tsx: chalk.hex("#58dcc4"),
	html: chalk.hex("#cea385"),
	scss: chalk.hex("#e85079"),
};
const prettyTag_11ty = chalk.hex("#8f7da3")(" 11ty ");


/** @param {import("child_process").ChildProcess} eleventy_process */
export default function modifyEleventyLog (eleventy_process) {
	eleventy_process.stdout.on("data", (chunk) => handleChunkStreams(chunk, pretty_eleventy_log));
	eleventy_process.stderr.on("data", (chunk) => handleChunkStreams(chunk, pretty_eleventy_log));
}

/** @param {string} m */
function pretty_eleventy_log (m) {
	// console.log(showANSI(m));
	let channel = "  ";

	// - ignore non-11ty messages (e.g. our own logs)
	if (!m.includes("[11ty]")) return console.log(m);

	// - remove the default tag
	m = m.replace("\x1b[90m[11ty]", "");

	// - replace overall color palette with custom one
	color_palette.forEach(([from, to]) => m = m.replaceAll(from, to));

	// - add colored channel based on file type for all "Writing <file> from..." messages
	const fileType = [...m.matchAll(/from\s+\.\/[^\s]+\/[^\s]+\.(\w+)/g)]?.[0]?.[1];
	if (fileType_colors[fileType]) channel = chalk.dim((fileType_colors[fileType])("▐▌"));

	// - custom overrides for specific messages
	if (m.includes("Server at")) {
		channel = "🚀";
		console.log("");
		m = colors.pink(`Server started at ${colors.blue(`http://localhost:${config.port}`)}`) + ` - [press any key twice to shutdown]\n`;
	}

	// - remove leading spaces, even if they're infront of ansi codes
	m = m.replace(/(?<=^(\x1b\[[0-9;]*m)*)( +)/gm, "");

	// - combine all together
	m = `${chalk.hex("#8f7da3")(" 11ty ")}${config.timestamp()} ${channel} ${m}`;
	console.log(m);
}


/* ~~~~~~ Helper Functions ~~~~~~ */
// - Makes ANSI strings readable in the terminal
function showANSI (string) { return string.replace(/\x1b(\[[0-9;]+m)/g, "$&\\x1b$1\x1b[0m"); }

// - Handle the streams of stdout and stderr
let buffer = "";
/** @argument {(str : string) => void} logger */
function handleChunkStreams (chunk, logger = console.log) {
	// chunk = replace_11ty_colors.reduce((acc, [a, b]) => acc.replaceAll(a, b), chunk.toString());
	let lines = (buffer + chunk.toString()).split(/\r?\n/);
	buffer = lines.pop();
	for (let line of lines) { logger(line);	}
}
