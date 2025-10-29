/* ~~~~~ build.ts ~~~~~
   - Runner for eleventy + esbuild
*/




// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Imports, globals, and minor setup:
// |_____________________________________________________________________________________________________________

// ✧ node modules
import { rm, readFile, writeFile, mkdir } from "node:fs/promises";
import { spawn, execSync } from "node:child_process";
import crypto from "node:crypto";
import path from "node:path";
import glob from "fast-glob";
import getFolderSize from "get-folder-size";
import chalk from "chalk";
import treeKill from "tree-kill";

// ✧ my imports:
import * as util from "__util__";
import * as mono from "./monolith.js";
const { log, error, warn, paths, abs_paths, colors } = mono;
const { blue: b, pink: p, white: w } = colors;
const env = process.env as import("./monolith.js").env_arguments_type & NodeJS.ProcessEnv;

// ✧ parts of the build 
// import startEsbuild from "./build-esbuild.js";
import transformEleventyOutput from "./logs-handler.js";

// - send this pid to parent
process.send({ type: "child_pid", pid: process.pid });



// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Clear dist folder:
// |_____________________________________________________________________________________________________________

let deletedFiles = env.CLEAR_DIST === "false" ? 0 : glob.sync(`${abs_paths.output}/**/*`).length;
if (env.CLEAR_DIST === "true") await clearDirectory(abs_paths.output);
if (env.CLEAR_CACHE === "true") await clearDirectory(abs_paths.cache);
if (deletedFiles > 0 && env.VERBOSE_MISC === "true") log(chalk.dim.italic(`   Deleted ${b(deletedFiles)} file${deletedFiles === 1 ? "" : "s"} from ${b(paths.output + "/")}`));



// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Eleventy:
// |    1. Choose which command to use; npx, or local Eleventy
// |    2. Choose which --flags to pass to Eleventy
// |    3. Run the Eleventy command
// |    4. Capture and prettify Eleventy's output
// |_____________________________________________________________________________________________________________

const command = env.USE_NPX === "true" ? "npx eleventy" : "eleventy";

const eleventy_cli_args = [`--config=./${paths.compiled}/${paths.engine}/eleventy.js`];
if (env.DISABLE_INCREMENTAL === "false") eleventy_cli_args.unshift("--incremental");
if (env.SERVE === "true") eleventy_cli_args.unshift("--serve");

log(p(`🏁 Starting Eleventy in ${(env.SERVE === "true" ? "serve" : "build")} mode...`), "enid");
log(`   Running command: ${b(command + " " + eleventy_cli_args.join(" "))}`, "enid");

const eleventy_process = spawn(`${command} ${eleventy_cli_args.join(" ")}`, {
	stdio: ["inherit", "pipe", "pipe"],
	env: { ...env, ...process.env, FORCE_COLOR: "1" },
	shell: true,
});
process.send({ type: "child_pid", pid: eleventy_process.pid });

// - Capture and modify eleventy's output to look better
transformEleventyOutput(eleventy_process);


// // - esbuild
// const esbuild_context = await startEsbuild(glob.sync(`${abs_paths.source}/**/!(_)*.{js,jsx,ts,tsx}`), paths.output);


// // - After build: Log folder size (in kB and mB)
// eleventy_process.on("exit", async (code = 0) => {

// 	if (esbuild_context) esbuild_context.dispose();
// 	if (env.SERVE === "true") return;

// 	const files1 = (await glob(`**/*`, { onlyFiles: true, cwd: abs_paths.source })).length.toString();
// 	const files2 = (await glob(`**/*`, { onlyFiles: true, cwd: abs_paths.output })).length.toString();

// 	console.log("");
// 	log(p(`🎉 Build complete in ${b(`${~~(performance.now())}ms`)}!`));
// 	log(`—— Source folder: ${b(files1)} file${files1 === "1" ? "" : "s"}, ${b(await sizeOfFolder(abs_paths.source))}`);
// 	log(`—— Output folder: ${b(files2)} file${files2 === "1" ? "" : "s"}, ${b(await sizeOfFolder(abs_paths.output))}`);

// 	mono.printWarnings();
// });





// /** Get the size of a folder in mB and kB, depending on the size */
// async function sizeOfFolder (path) {
// 	const bytes = await getFolderSize.loose(path);
// 	const greaterThanOneMB = bytes > 1048576;
// 	const size = `${(bytes / (greaterThanOneMB ? 1048576 : 1024)).toFixed(2)}${greaterThanOneMB ? "m" : "k"}B`;
// 	return size;
// }

/** Recursively delete all files and folders inside a directory */
async function clearDirectory (path : string) {
	return Promise.all((await glob(`**/*`,
		{ cwd: path, absolute: true, onlyFiles: false, markDirectories: true, ignore: ["images/**"] })
	).map((f) => rm(f, { recursive: true })));
}


// log("   runin");
// setTimeout(() => {
// 	log("   runout");
// }, 200);

// setInterval(() => {
// 	log("   timer");
// }, 1000);
