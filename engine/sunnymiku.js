// @ts-check

/* ~~~~~ sunnymiku.js ~~~~~
   - Entrypoint for building the engine and utilities.
   - Press Q or Ctrl+C in the terminal to gracefully stop everything.

   - Command to check all running node processes:
     Get-Process | Where-Object {$_.ProcessName -eq "node"}
   - To kill them:
     taskkill /F /IM node.exe   or   pnpm kill
*/
chalk.level = 3;
process.env.FORCE_COLOR = "1";


// - node modules
import { fork } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "url";

import treeKill from "tree-kill";
import chokidar from "chokidar";
import esbuild from "esbuild";
import { replace as esbuildPluginReplace } from "esbuild-plugin-replace";
import externalizeAllPackagesExcept from "esbuild-plugin-noexternal";
import glob from "fast-glob";
import chroma from "chroma-js";
import chalk from "chalk";


// ! only import config that doesn't depend on env variables
import { paths, absPaths, env_key, log, err, colors, divider } from "./config.js";
import { fail } from "node:assert";
const { blue: b, pink: p, white: w, warn } = colors;




const TIMEOUT = 500; // < time for watcher to wait before restarting
console.log("");


/* - Stores the PID's of all child processes */ /** @type {Set<number>} */
const child_processes = new Set();


/* ~~~~~ Parse CLI Flags used to set Environment Variables ~~~~~ 
- Search for flags defined in 'env_key',
	  for each valid flag, set it and any dependant flags to 'true'
	- Default all unset flags to 'false'
*/
const env = /** @type {import('./config.js').env_type} */ ({}); // < casted, aka: forced type
process.argv.slice(2).forEach((arg) => {
	arg = arg.replace(/^(-)+/, "").toLowerCase();
	const [name, { enable = [] }] = Object.entries(env_key).find(([, { flags }]) => flags?.includes(arg)) ?? [,{}];
	if (name === undefined) return err(`¯\\_('•_•)_/¯ Unknown CLI argument provided: '${arg}' ⁭`);
	env[name] = "true";
	enable.forEach((k) => { if (env[k] === undefined) env[k] = "true"; });
});
for (const k of Object.keys(env_key)) { if (env[k] === undefined) env[k] = "false"; }
process.env = { ...process.env, ...env };

if (env.WATCH === "true") {
	const width = process.stdout.columns || 80;
	console.log(chalk.bgBlack.hex("#78ff60").bold("◢◤".repeat(~~(width / 2))));
	log(`—— Running in watch mode!`);
	log(`—— ${p(`> Press ${b.bold("Q")} to shutdown! or ${b.bold("R")} to restart! <`)}`);
	console.log(chalk.bgBlack.hex("#78ff60").bold("◢◤".repeat(~~(width / 2))));
	console.log("");
}
log(`—— Environment Variables: [ ${Object.entries(env).filter(([, v]) => v === "true").map(([k]) => k).join(", ")} ]`);


/* ~~~~~ Main Function ~~~~~ 
	- Compile all files in engine/ and util/ to JS
	- Run build.js
	- Automatically re-run when files in engine/ change (with --watch)
*/
async function build () {

	/* ~~~~~ 1. Ensure all directories exist ~~~~~ */
	await Promise.all([
		fs.promises.mkdir(absPaths.compiled, { recursive: true }),
		fs.promises.mkdir(absPaths.cache, { recursive: true }),
		fs.promises.mkdir(absPaths.output, { recursive: true }),
	]);


	/* ~~~~~ 2. Compile the other engine files to JS ~~~~~ */
	await compileTS(paths.util, `${paths.compiled}/awa-util`, { minify: true }),
	await compileTS(paths.engine, `${paths.compiled}/${paths.engine}`),



	/* ~~~~~ 3. Run build.js ~~~~~ */
	log(`🟢 Running ${b("build.js")}...`, p);
	console.log(divider());
	const buildProcess = fork("./__compiled/engine/build.js", [], {
		stdio: ["inherit", "inherit", "pipe", "ipc"],
		env: { ...process.env, ...env },
		detached: process.platform !== "win32", // detach only on Unix
	});
	registerChildProcess(buildProcess.pid);

	/* ~~~~~ 4. Accept and register child processes sent up from build.js ~~~~~ */
	buildProcess.on("message", /** @param {Record<string, any>} msg */ (msg) => {
		if (msg.type === "child_process") {
			// console.log(chalk.italic.hex("#47404e")(`⫷ registered child process '${msg.pid}' ⫸`));
			registerChildProcess(msg.pid);
		}
		else { return err(`Why message me? ${msg}`); }
	});

	/* ~~~~~ 5. Handle build.js exit ~~~~~ */
	buildProcess.on("exit", (code, signal) => {
		console.log(divider(true));
		if (code === 0) log(`✅ ${b("build.js")} finished with code ${b.bold(code)}`, p);
		else log(`❌ ${b("build.js")} failed with code ${colors.red.bold(code)}`, p);
		if (env.WATCH === "false") SHUTDOWN();
	});

	buildProcess.on("error", (err) => {
		log(`❌ build.js failed to start: ${err.message}`, colors.red);
	});
	buildProcess.stderr.on("data", (data) => {
		console.log(data.toString());
	});
}


/* ~~~~~ Watch the engine folder for changes ~~~~~ 
    - With a one second timeout feature to avoid restarting too often
    - On change: kill all sub processes, then run build() again
*/
let watcher;
if (env.WATCH === "true") {
	let restartTimeout;
	log("—— Watching engine folder for changes...");
	watcher = chokidar.watch(paths.engine, { ignoreInitial: true });
	watcher.on("all", (eventType, path, stats) => {
		if (!path.endsWith(".ts")) return;
		if (restartTimeout) clearTimeout(restartTimeout);
		restartTimeout = setTimeout(async () => {
			log(`🔧 Restarting ${b("build.js")} due to file changes in ${b(path)}...`, p, "\n");
			RESTART();
		}, TIMEOUT);
	});
}



/* ~~~~~ Restart build.js ~~~~~ */
async function RESTART () {
	await KILLALLCHILDREN();
	build();
}


/* ~~~~~ Properly terminate this process and cleanup ~~~~~ */
let dead = false;
async function SHUTDOWN () {
	if (dead) { return; } dead = true; // < only run once
	log(`🛑 Shutting down all processes...`, w);
	if (watcher?.close) { log(`—— Closing file watcher...`); watcher.close(); }
	await KILLALLCHILDREN();
	process.exit(0); // < bug solfed: DO NOT DO THIS WITHOUT WAIT, KILLS PROCESS BEFORE CHILDREN ARE KILLED

}
process.on("SIGINT", () => SHUTDOWN());
process.on("SIGTERM", () => SHUTDOWN());



/* ~~~~~ Terminate all stored child processes ~~~~~ */
async function KILLALLCHILDREN () {
	const promises = Array.from(child_processes.values()).map((pid) => {
		child_processes.delete(pid);
		// log(`—— Terminated PID:${(pid)}`, w);
		return new Promise((res) => treeKill(pid, "SIGTERM", () => res()));
	});
	return Promise.all(promises);
}


// - Start initial
build();



/* ~~~~~ Shutdown when Q is pressed ~~~~~ */
if (process.stdin.isTTY && !process.env.CI) {
	process.stdin.setEncoding("utf8");
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.on("data", (input) => {
		const key = input.toString().toLowerCase();
		if (key === "q" || key === "\u0003") {
			process.stdin.setRawMode(false);
			process.stdin.pause();
			log(`🛑 ${b.bold(key === "q" ? "Q" : "CTRL+C")} pressed...`, p);
			SHUTDOWN();
		}
		else if (key === "r") {
			log(`🛑 ${b.bold("R")} pressed...`, p);
			log(`🔧 Restarting ${b("build.js")}...`, p, "\n");
			RESTART();
		}
	});
}



/* ~~~~~ Functions ~~~~~ */

/** @param {number} pid */
function registerChildProcess (pid) {
	if (child_processes.has(pid)) err(`Child process already registered: ${pid}`);
	child_processes.add(pid);
}

/**
 * Helper function to quickly compile TS using esbuild
 * @param {string} inputPath 
 * @param {string} outputPath 
 * @param {esbuild.BuildOptions} [options]
 * @returns {Promise<esbuild.BuildResult>}
 */
async function compileTS (inputPath, outputPath, options = {}) {
	// env.CLEAR_CACHE = "true";

	// - Get all the .ts and .js files in the input path
	const files = await glob(`${inputPath}/**/*!(_).{ts,js}`);
	if (files.length === 0) err(`No .ts files found in ${inputPath}`);

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
	log(p(`${chalk.bold.hex("#2f74c0")("TS")} Recompiling ${b(inputPath + "/")}`) + ` because ${reason}...`, w);

	// - Write the new hash and recompile
	await fs.promises.writeFile(cacheFilePath, hash);
	return esbuild.build({
		entryPoints: files,
		outdir: outputPath,
		logLevel: "error",
		sourcemap: false, bundle: false,
		minify: options.minify ?? false,
		format: "esm", platform: "node", target: "node24",
		plugins: [
			// externalizeAllPackagesExcept(["__util__"]),
			esbuildPluginReplace({ "__util__": `../awa-util/core.js` }),
		],
	});
	const MAX_BUNDLE_SIZE = 50 * 1024;
}
