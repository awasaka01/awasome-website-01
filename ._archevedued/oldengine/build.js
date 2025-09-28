// engine/build.js
// @ts-check

/* 
BUILD.JS STEPS ??outdated??
	1. Compile awa-util to dist/awa-util/core.js (preferabley minmized and rolled up to include all 4 files in the 1 core) with NO types
	   And to awa-util/js with d.ts files included (no minimizing)
	   Also shouldn't build if would output same results
	2. Process command line arguments given to this file and generate env variables based on them
	3. Clear dist if desired cmd line arg given
	4. Run 'eleventy' with the correct arguemtns and flags
*/



// - node modules
import { rm, readFile, writeFile, mkdir } from "node:fs/promises";
import { spawn, execSync } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import glob from "fast-glob";
import getFolderSize from "get-folder-size";
import chalk from "chalk";
import treeKill from "tree-kill";


// - my config
import * as config from "./config.js";
const { log, colors, paths, absPaths, err } = config;
const { blue, pink } = colors;

// - Log a random kaomoji at the start
import kaomoji from "../../engine/kaomoji.js";
const kao = kaomoji[~~(kaomoji.length * Math.random())];
log("✨ " + chalk.hex("#ffbd60")(chalk.bold(kao)) + "\n");

// - Larger build steps, extracted to separate files for readability
import compileUtilFiles from "./build-compile-util.js";
import startEsbuildClient from "./build-esbuild.js";
import customLogger from "./build-logger.js";



(async () => { // < wrapper to allow await


	/* ~~~~~ Ensure directories exist ~~~~~ */
	await mkdir(`../${paths["util-js"]}`, { recursive: true });
	await mkdir(`../${paths.cache}`, { recursive: true });
	await mkdir(`../${paths.output}`, { recursive: true });



	/* ~~~~~ Parse CLI Flags used to set Environment Variables ~~~~~ */
	const env = /** @type {import('./config.js').env_type} */ ({}); // < casted, aka: forced type

	// 1. Loop through each argument provided, and find it's corresponding env variable,
	//    then set it and any children to 'true' (if the child is not already set manually)
	process.argv.slice(2).forEach((arg) => {
		arg = arg.replace(/^(-)+/, "").toLowerCase();
		const [name, { enable = [] }] = Object.entries(config.env_key).find(([, { flags }]) => flags?.includes(arg)) ?? [,{}];
		if (name === undefined) return err(`¯\\_('•_•)_/¯ Unknown CLI argument provided: '${arg}' ⁭`);
		env[name] = "true";
		enable.forEach((k) => { if (env[k] === undefined) env[k] = "true"; });
	});

	// 2. Default any unset env variables to 'false'
	for (const k of Object.keys(config.env_key)) { if (env[k] === undefined) env[k] = "false"; }

	// 3. Use those env variables to decide which flags to pass to the 'eleventy' command
	const eleventy_cli_args = [
		env.DISABLE_INCREMENTAL !== "true" && "--incremental",
		env.SERVE === "true" && "--serve",
		`--config=${paths.engine}/.eleventy.js`,
	].filter(Boolean); // < removes any falsy values

	// 4.
	process.env = { ...process.env, ...env };
	if (env.SERVE === "true" && !process.env.BUILD_WRAPPER) err("Run serve.js instead of build.js");






	/* ~~~~~ ---------------------- ~~~~~ */
	// - Clear the output folder (conditionally)
	let files = env.CLEAR_DIST === "false" ? [] : glob.sync(`${absPaths.output}/**/*`);
	if (env.CLEAR_DIST === "true") {
		await Promise.all((await glob(`**/*`,
			{ cwd: absPaths.output, absolute: true, onlyFiles: false, markDirectories: true })
		).map((f) => rm(f, { recursive: true })));
	}
	// - Clear the cache folder (conditionally)
	if (env.CLEAR_CACHE === "true") {
		await Promise.all((await glob(`**/*`,
			{ cwd: absPaths.cache, absolute: true, onlyFiles: false, markDirectories: true })
		).map((f) => rm(f, { recursive: true })));
	}


	/* ~~~~~ Compile /src/awa-util/core.ts to /__awa-util/core.js ~~~~~ */
	// - To allow using awa-util during build steps
	// ? Only if the combined hash of all files in util are different to the ones stored in hash.bin
	compileUtilFiles(`${paths.cache}/awa-util-hash.bin`);



	/* ~~~~~ Log starting message ~~~~~ */
	console.log("");
	log(`🏁 Starting eleventy in ${colors.blue(env.SERVE ? "serve" : "build")} mode...`, colors.pink);
    log(`—— Cleared ${colors.blue(files.length)} file${files.length === 1 ? "" : "s"} from the output folder`);
	log(`—— Environment variables: ${colors.blue(`[ ${Object.keys(env).filter((k) => env[k] === "true").join(", ")} ]`)}`);
	log(`—— Running command: ${colors.blue("eleventy " + eleventy_cli_args.join(" "))}`);
	console.log("");


	/* ~~~~~ esbuild  ~~~~~ */
	const esbuild_context = await startEsbuildClient(glob.sync(`${absPaths.source}/**/!(_)*.{js,jsx,ts,tsx}`), paths.output);
	// process.exit(0);


	/* ~~~~~ Actually run the 'eleventy' command ~~~~~ */
	const eleventy_process = spawn(`eleventy ${eleventy_cli_args.join(" ")}`, {
		stdio: ["inherit", "pipe", "pipe"],
		env: { ...env, ...process.env, FORCE_COLOR: "1" },
		shell: true,
	});
	// - Capture and modify eleventy's output to look better
	customLogger(eleventy_process);

// - on start or any change to engine files:
// 	1. init.js kills absulotley everything
// 	2. init.js recompiles all the engine .ts files to .js 
// 	3. runs complied/build.js 
// 	4. build.js runs eleventy --serve
// 	5. the eleventy process probably runs its own sub process for the dev server?
// 	6. build.js starts esbuild with esbuild.watch


	/* ~~~~~ Post-build stuff ~~~~~ */
	// 1. Log folder size (in kB and mB)
	// 2. Try to kill self and any children
	eleventy_process.on("exit", async (code = 0) => {
		if (env.SERVE === "true") return KILLALL(code);

		const files1 = (await glob(`**/*`, { onlyFiles: true, cwd: absPaths.source })).length.toString();
		const files2 = (await glob(`**/*`, { onlyFiles: true, cwd: absPaths.output })).length.toString();

		console.log("");
		log(`🎉 Build complete in ${blue(`${~~(performance.now())}ms`)}!`, pink);
		log(`—— Source folder: ${blue(files1)} file${files1 === "1" ? "" : "s"}, ${blue(await sizeOfFolder(absPaths.source))}`);
		log(`—— Output folder: ${blue(files2)} file${files2 === "1" ? "" : "s"}, ${blue(await sizeOfFolder(absPaths.output))}`);
		console.log("");
		KILLALL(code);
	});



	/* ~~~~~ Try very hard to kill everything, to prevent secret processes staying alive ~~~~~ */
	process.on("SIGTERM", () => KILLALL(0));
	process.on("SIGINT", () => KILLALL(0));
	eleventy_process.on("SIGTERM", () => KILLALL(0));
	eleventy_process.on("SIGINT", () => KILLALL(0));
	function KILLALL (code) {
		if (!eleventy_process || eleventy_process.killed) return;
		// console.log(chalk.cyan("closed"));
		if (esbuild_context) esbuild_context.dispose();
		treeKill(eleventy_process.pid, "SIGTERM", (err) => { if (err) console.error("Failed to kill eleventy:", err); });
		eleventy_process.kill("SIGTERM");
		process.exit(code);
	}
})();



// - Get the size of a folder in mB or kB
async function sizeOfFolder (path) {
	const bytes = await getFolderSize.loose(path);
	const greaterThanOneMB = bytes > 1048576;
	const size = `${(bytes / (greaterThanOneMB ? 1048576 : 1024)).toFixed(2)}${greaterThanOneMB ? "m" : "k"}B`;
	return size;
}



	/* ~~~~~ Stop the dev server on 2 keypresses ~~~~~ */
	// let doublepress = false;
	// if (env.SERVE === "true") {
	// 	process.stdin.setRawMode(true);
	// 	process.stdin.resume();
	// 	process.stdin.on("data", (chunk) => {
	// 		if (!SERVER_HAS_STARTED) return;
	// 		const str = chunk.toString(); // Ignore non-ASCII characters
	// 		if (!(str.length === 1 && str.charCodeAt(0) >= 32 && str.charCodeAt(0) <= 126)) return;
	// 		if (doublepress) {
	// 			doublepress = true;
	// 			log("👋 Key was pressed! - Shutting down dev server...", colors.pink, "\n");
	// 			KILL(0);
	// 		}
	// 		else { doublepress = true; setTimeout(() => { doublepress = false; }, 700); }
	// 	});
	// }
