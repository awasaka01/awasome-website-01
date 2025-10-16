// ✧ env flags that allow color on github:
chalk.level = 3; process.env.FORCE_COLOR = "1";

// ✧ node modules:
import chroma from "chroma-js";
import chalk from "chalk";

// ✧ my imports:
import * as util from "__util__";
import * as mono from "./monolith.js";
const { log, colors, err } = mono;
const { blue: b, pink: p, white: w } = colors;
const env = process.env as import("./config.js").env_type & NodeJS.ProcessEnv;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */



/** Hook into the eleventy process to log its stdout and stderr */
export default function eleventyProcessHook (eleventy_process : import("child_process").ChildProcess) {
	eleventy_process.stdout.on("data", (chunk : Buffer | string) => handleChunkStreams(chunk, eleventyLogHandler));
	eleventy_process.stderr.on("data", (chunk : Buffer | string) => handleChunkStreams(chunk, eleventyLogHandler));
}

const colors_to_replace = [
	["\x1b[39m", chalk.hex(colors.low1)(":").split(":")[0]], // reset
	["\x1b[90m", chalk.hex(colors.low2)(":").split(":")[0]], // grey
	["\x1b[32m", chalk.hex(colors.high1)(":").split(":")[0]], // green
];

/** Parse and format eleventy's messages */
function eleventyLogHandler (message : string) {

	// - ignore non-11ty messages, e.g. our own logs
	if (!message.includes("[11ty]")) return console.log(message);

	// - skip some specific messages
	if (message.includes("Watching…")) return;

	// - remove the default tag
	message = message.replace("\x1b[90m[11ty]", "");

	// - what to put in the 2 wide "channel" for emojis and stuff
	let channel = "  ";

	// - global pallete replacement
	colors_to_replace.forEach(([from, to]) => message = message.replaceAll(from, to));



	/*  --  custom message overrides  --  */

	//  . Writing (x) from (y)
	if (message.includes("Writing") && message.includes("from")) {
		// - colored channels indicating file type from -> to
		const result = [...message.matchAll(/\.(?<to>css|scss|html).+\.(?<from>.+)/g)]?.[0];
		if (!result || !result.groups) return;

		let to = util.removeANSI(result.groups.to).trim();
		let from = util.removeANSI(result.groups.from).trim();

		if (from === "html (vto)") from = "vto";

		const colorFROM = colors["lang" + from.toUpperCase()];
		const colorTO = colors["lang" + to.toUpperCase()];

		if (!colorFROM) err(`No color for file type: lang${from.toUpperCase()}`);
		if (!colorTO) err(`No color for file type: lang${to.toUpperCase()}`);

		channel = chalk.dim(chalk.hex(colors["lang" + from.toUpperCase()])("█") + chalk.hex(colors["lang" + to.toUpperCase()])("█"));

		// - remove top folders:
		message = message.replace("./" + mono.paths.source + "/", "");
		message = message.replace("./" + mono.paths.output + "/", "");
	}


	// - custom overrides for specific messages
	else if (message.includes("Server at")) {
		channel = "🚀";
		console.log("");
		message = p(`Server started at ${b(`http://localhost:${mono.port}`)}\n`);
	}

	// - remove leading spaces, even if they're infront of ansi codes
	message = message.replace(/(?<=^(\x1b\[[0-9;]*m)*)( +)/gm, "");

	log(channel + " " + message, "11ty");
}





// export const sassWarnOnly = () => {
// 	console.log(chalk.hex(mono.colors.warning)("◢◤".repeat(mono.columns / 2)));
// 	console.log(util.padBoth(chalk.hex(mono.colors.warning).bold.underline(`⚠️  ${Object.keys(sassWarnings).length} Warnings:`)));
// 	// console.log("");
// 	for (let warning in sassWarnings) log(chalk.dim("· ") + warning + chalk.hex(colors.low2)(` x${sassWarnings[warning]}`), "sass", false);
// 	console.log("");
// 	console.log(chalk.hex(mono.colors.warning)("◢◤".repeat(mono.columns / 2)));
// };


/*  --  Helper Functions  --  */
let buffer = "";
/** Convert stdout chunks into singular lines */
function handleChunkStreams (chunk : Buffer | string, logger : (str : string) => void) {
	const data = typeof chunk === "string" ? chunk : chunk.toString();
	let lines = (buffer + data).split(/\r?\n/);
	buffer = lines.pop();
	for (let line of lines) { logger(line);	}
}
