// @ts-check

/* ~~~~~ sunnymiku.js ~~~~~
   - Entrypoint/Bootstrap/CLI for the engine, compiles TS to JS then runs build.js
   - Also handles reloading when engine files change
     Q to stop / R to restart

   - Command to check all running node processes:
     Get-Process | Where-Object {$_.ProcessName -eq "node"}
   - To kill them:
   taskkill /F /IM node.exe   or   pnpm kill
*/

process.env.IS_ROOT_PROCESS = "true";
process.env.FORCE_COLOR = "1";
chalk.level = 3;



// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Parse CLI flags into environment variables:
// |	- flag definitions are in ./monolith.js
// |	- ensure all flag environment variables is set to 'true' or 'false'
// |	- modifies `process.env`
// |_____________________________________________________________________________________________________________

import { log, warn, error, env_arguments_key, colors } from "./monolith.js";
const { blue: b, pink: p, white: w } = colors;

const FLAGS = /** @type {import('./monolith.js').env_arguments_type} */ ({}); // < casted, aka: forced type
process.argv.slice(2).forEach((arg) => {
	arg = arg.replace(/^(-)+/, "").toLowerCase();
	const entry = Object.entries(env_arguments_key).find(([_, { flags = [] }]) => flags.includes(arg));
	if (!entry) return error(`¯\\_('•_•)_/¯ Unknown CLI argument provided: '${b(arg)}', Available flags: \n${Object.entries(env_arguments_key).filter(([k, v]) => v.flags?.length > 0).map(([k, v]) => `                      ${k.padEnd(19)} : ${w(v.flags.join(", "))}`).join("\n")}\n`);
	const [name, { enable = [] }] = entry;
	FLAGS[name] = "true";
	enable.forEach((k1) => Object.keys(env_arguments_key).filter((k2) => k2.startsWith(k1)).forEach((k2) => { if (FLAGS[k2] === undefined) FLAGS[k2] = "true"; }));
});
for (const k of Object.keys(env_arguments_key)) { if (FLAGS[k] === undefined) FLAGS[k] = "false"; }
Object.assign(process.env, FLAGS);

const env = /** @type {import('./monolith.js').env_arguments_type & NodeJS.ProcessEnv} */ (process.env);




// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Modules:
// |_____________________________________________________________________________________________________________

// ✧ node modules
import { execSync, fork } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import treeKill from "tree-kill";
import chokidar from "chokidar";
import esbuild from "esbuild";
import { replace as esbuildPluginReplace } from "esbuild-plugin-replace";
import glob from "fast-glob";
import chalk from "chalk";

// ✧ access monolith.js after env flags are set
import * as mono from "./monolith.js";
const { paths, abs_paths } = mono;




// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Global State:
// |_____________________________________________________________________________________________________________

let registeredKeys = /** @type {Array<[string, () => boolean]>} */ ([]);
let buildLock = true;
let buildProcess = /** @type {import("child_process").ChildProcess | null} */ (null);
let childPIDs = [];
console.log(mono.SUNNYMIKU_BANNER);
if (env.VERBOSE_MISC === "true") log(chalk.dim.italic(`   Environment flags enabled: [${Object.entries(FLAGS).filter(([k, v]) => v === "true").map(([k]) => b(k)).join(", ")}]`), "miku");




// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Utility functions to handle and clean up child processes
// |_____________________________________________________________________________________________________________

/** store child process pid, and log it @param {number} pid */
function registerChildProcess (pid) {
	childPIDs.push(pid);
	if (env.VERBOSE_SHOW_CHILDREN === "true") log(chalk.dim.italic(`   Registered child process: ${b("PID=" + pid)}`), "miku");
}

/** treeKill() all child processes in child_pids */
async function killAllChildProcesses () {
	for (const pid of childPIDs.reverse()) {
		await new Promise((resolve) => treeKill(pid, "SIGKILL", (err) => {
			if (env.VERBOSE_SHOW_CHILDREN === "true") log(chalk.dim.italic(`   Killed child process: ${b("PID=" + pid)}`), "miku");
			resolve();
		}));
	}
	childPIDs = [];
}

// Attempt to clean up child processes on accidental ctrl+c / other forms of exit
process.on("exit", async () => await killAllChildProcesses());
process.on("SIGINT", async () => await killAllChildProcesses());
process.on("SIGTERM", async () => await killAllChildProcesses());




// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Build orchestration:
// |	1. Ensure all directories exist
// |	2. Compile all engine/ and util/ files
// |	3. Fork ./build.ts
// |	 - Handles process messages for: functions that need to be run on the main process, and child process PIDs
// |	 - Handles clean shutdown on exit
// |_____________________________________________________________________________________________________________

async function START () {

	/*  --  1. Ensure all directories exist  --  */
	await Promise.all([
		fs.promises.mkdir(abs_paths.cache, { recursive: true }),
		fs.promises.mkdir(abs_paths.output, { recursive: true }),
		fs.promises.mkdir(abs_paths.compiled, { recursive: true }),
	]);


	/*  --  2. Compile the files in engine/ and util/  --  */
	try {
		await compileTypescript(paths.util, `${paths.util.replace(paths.source, paths.compiled)}/awa-util`);
		await compileTypescript(paths.engine, `${paths.compiled}/${paths.engine}`);
	} catch {
		if (env.WATCH === "false") process.exit(0);
		return;
	}


	const build_start_time = Date.now();
	if (env.VERBOSE_MISC === "true") log(p(`🏁 Starting build process...`), "miku");
	console.log(mono.divider(0));


	/*  --  3. Run build.ts  --  */
	buildProcess = fork(`${paths.compiled}/${paths.engine}/build.js`, [], {
		stdio    : ["inherit", "pipe", "pipe", "ipc"],
		env      : { ...process.env, ...env },
		detached : process.platform !== "win32", // detach only on Unix
	});
	buildProcess.on("error", (err) => error(`   Failed to fork build process: "${err.toString()}"`));

	buildProcess.on("message", (/** @type {{ bubble: boolean, [key: string]: any }} */ message) => {
		if (typeof message !== "object") throw new Error(`Unexpected message from buildProcess: ${message}`);
		else if (message.function_id !== undefined) return mono.handleBubbleMessages(message);
		else if (message.type === "child_pid") registerChildProcess(message.pid);
	});

	buildProcess.on("exit", (code, signal) => {
		if (buildLock === false) {
			console.log(mono.divider(1));
			log(p(`${code === 0 ? "✅" : "⛔"} Build process ${code === 0 ? "finished" : "failed"} with code ${code === 0 ? chalk.bold.hex(colors.success)("0") : chalk.bold.hex(colors.failure)(code)} — took ${b(Date.now() - build_start_time + "ms")} `), "miku");
			killAllChildProcesses();
		}
	});

    buildProcess.stdout.on("data", (data) => { if (buildProcess?.stdout) process.stdout.write(data); });
    buildProcess.stderr.on("data", (data) => { if (buildProcess?.stderr) process.stderr.write(data); });
}

// - Initialize
START().then(() => buildLock = false);




// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Handle keypresses 
// |_____________________________________________________________________________________________________________

function registerKey (key, callback) { registeredKeys.push([key.toLowerCase(), callback]); }

if (process.stdin.isTTY && !process.env.CI) {
	process.stdin.setEncoding("utf8");
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.on("data", (input) => {
		const glyph = input.toString().toLowerCase();
		const callback = registeredKeys.find(([k]) => k === glyph)?.[1];
		if (!callback) return;
		const result = callback();
		if (result === true) {
			process.stdin.setRawMode(false);
			process.stdin.pause();
		}
	});
}

// - Shutdown on Q
registerKey("Q", async () => {
	if (buildLock) return;
	buildLock = true;
	buildProcess?.stderr?.destroy();
	buildProcess?.stdout?.destroy();
	buildProcess = null;

	console.log(mono.divider(3));
	console.log("");
	console.log(mono.padBoth(`Key ${b.bold("Q")} was pressed, shutting down...`) + "\n");

	await killAllChildProcesses();
	process.nextTick(() => process.exit(0x0));
});




// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Auto Restarting when --watch is enabled:
// |  	- Watch engine/ and for changes, then shutdown, recompile, and restart build.ts
// |	- Also when R is pressed
// |_____________________________________________________________________________________________________________

async function RESTART () {
	await killAllChildProcesses();
	await START();
}

if (env.WATCH === "true") {
	let watcher;
	let restartTimeout;
	if (env.VERBOSE_MISC === "true") log(chalk.dim.italic(`   Watching ${b(paths.engine + "/")} for changes...`), "miku");
	log(chalk.dim.italic(`   Press ${b.bold("R")} to restart or ${b.bold("Q")} to quit`), "miku");
	watcher = chokidar.watch(paths.engine, { ignoreInitial: true });
	watcher.on("all", (eventType, path, stats) => {
		if (path.endsWith("sunnymiku.js")) return;
		if (restartTimeout) clearTimeout(restartTimeout);
		restartTimeout = setTimeout(async () => {
			console.log(mono.divider(2));
			console.log("");
			console.log(mono.padBoth(`Restarting ${b("build.js")} due to file changes in ${b(path)}...`));
			console.log("\n");
			await RESTART();
		}, 1000);
	});

	registerKey("R", async () => {
		if (buildLock) return console.log("bee patience buddy!!");
		buildLock = true;

		buildProcess?.stderr?.destroy();
		buildProcess?.stdout?.destroy();
		buildProcess = null;

		console.log(mono.divider(2));
		console.log("");
		console.log(mono.padBoth(`Key ${b.bold("R")} was pressed, restarting...`) + "\n");
		await RESTART();

		setTimeout(() => buildLock = false, 200);
	});
}




// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Helper function to quickly compile a directory of TypeScript files using esbuild
// |_____________________________________________________________________________________________________________

/** @param {string} inputPath  @param {string} outputPath  @param {esbuild.BuildOptions} [options] @returns {Promise<esbuild.BuildResult>} */
async function compileTypescript (inputPath, outputPath, options = {}) {


	// - Get all the .ts and .js files in the input path
	const files = await glob(`${inputPath}/**/*!(_).{ts,js}`);
	if (files.length === 0) error(`No .ts files found in ${inputPath}`);

	// - Path to store the hash file
	const cacheFilePath = `${paths.cache}/hashfile.${inputPath.replaceAll("/", "_")}.bin`;

	// - Create a hash of all the files joined together
	const buffer = Buffer.concat(await Promise.all(files.map((path) => fs.promises.readFile(path))));
	const hash = crypto.createHash("sha1").update(buffer).digest();

	// - Get the old hash for comparison, or null
	const oldHash = env.CLEAR_CACHE === "true" ? null : await fs.promises.readFile(cacheFilePath).catch(() => null);

	// @ Return and don't recompile if the old and new hashes are the same
	if (oldHash !== null && hash.equals(oldHash)) return;

	// - Log the start message
	const reason
		= env.CLEAR_CACHE === "true" ? "the cache was cleared"
		: !oldHash ? `${b(cacheFilePath)} didn't exist`
		: "the files have changed";
	log((`${chalk.bold.hex(colors.langTS)("TS")} Recompiling ${b(inputPath + "/")}`) + ` because ${reason}...`, "miku");

	// - Write the new hash and recompile
	await esbuild.build({
		entryPoints : files,
		outdir      : outputPath,
		logLevel    : "warning",
		sourcemap   : false, bundle      : false,
		minify      : options.minify ?? false,
		format      : "esm", platform    : "node", target      : "node24",
		plugins     : [
			esbuildPluginReplace({ "__util__": `../awa-util/core.js` }),
		],
	}).catch((err) => { log(chalk.bold.hex(colors.langTS)("TS") + " " + chalk.hex(colors.failure).bold.underline(`Failed to compile ${b(inputPath + "/")}`), "miku"); throw null; });
	await fs.promises.writeFile(cacheFilePath, hash);
}
