/*
	filename
	description
*/
// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Imports, globals, and minor setup:
// |_____________________________________________________________________________________________________________

// ✧ node modules
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import esbuild from "esbuild";
import childProcess from "node:child_process";
import { replace as esbuildPluginReplace } from "esbuild-plugin-replace";
import browserslistToEsbuild from "browserslist-to-esbuild";
import * as lightningcss from "lightningcss";
import chalk from "chalk";
import deepmerge from "deepmerge";
import treeKill from "tree-kill";
import glob from "fast-glob";
import getFolderSize from "get-folder-size";
import sharp from "sharp";
import { imageSizeFromFile } from "image-size/fromFile";

// ✧ my imports:
import * as util from "__util__";
import * as mono from "./monolith.js";
const { log, warn, error, paths, abs_paths, colors } = mono;
const { blue: b, pink: p, white: w } = colors.fg;
const env = process.env as mono.env_arguments_type & Record<string, string>;

// ✧ other build tasks, in seperate files for readibility:
import beautifyEleventyLogs from "./build-task--logs-beautifier.js";



// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Clear dist folder:
// |_____________________________________________________________________________________________________________

let deletedFiles = env.CLEAR_DIST === "false" ? 0 : glob.sync(`${abs_paths.output}/**/*`).length;
if (env.CLEAR_DIST === "true") await clearDirectory(abs_paths.output);
if (env.NO_CACHE === "true") await clearDirectory(abs_paths.cache);
if (deletedFiles > 0 && env.VERBOSE_MISC === "true") log(chalk.dim.italic(`   Deleted ${b(deletedFiles)} file${deletedFiles === 1 ? "" : "s"} from ${b(paths.output + "/")}`));



// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Start Eleventy:
// |    1. Choose which command to use; npx, or local Eleventy
// |    2. Choose which --flags to pass to Eleventy
// |    3. Run the Eleventy command
// |    4. Capture and beautify Eleventy's output
// |_____________________________________________________________________________________________________________

const command = env.USE_NPX === "true" ? "npx eleventy" : "eleventy";
const eleventy_cli_args = [`--config=./${paths.compiled}/${paths.engine}/eleventy-config.js`];
if (env.DISABLE_INCREMENTAL === "false") eleventy_cli_args.unshift("--incremental");
if (env.SERVE === "true") eleventy_cli_args.unshift("--serve");

log(p(`🍇 Running Eleventy in ${(env.SERVE === "true" ? "serve" : "build")} mode...`), "enid");
log(w(`    ${b(command + " " + eleventy_cli_args.join(" "))}`), "enid");
console.log("");

const eleventy_process = childProcess.spawn(`${command} ${eleventy_cli_args.join(" ")}`, {
	stdio: ["inherit", "pipe", "pipe", "ipc"],
	env: { ...env, ...process.env, FORCE_COLOR: "1" },
	shell: true,
});
eleventy_process.on("message", (message : any) => {
	console.log(`message from 11ty:`, message);
});
process.send({ type: "child_pid", pid: eleventy_process.pid });

// - Capture and modify eleventy's output to look better
beautifyEleventyLogs(eleventy_process);



// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Start ESBuild:
// |    1. steps
// |    2. steps
// |_____________________________________________________________________________________________________________

let esbuild_context : esbuild.BuildContext | null = null;
const entryPoints = glob.sync(abs_paths.source + "/**/*.{js,jsx,ts,tsx}");

// - Reformat entryPoints to an object of pairs
const entryPointsIO : { in : string, out : string }[] = entryPoints.map((entry) => {
	const out = entry
		.replace(abs_paths.source, abs_paths.output)
		.replace(".ts", "") // .js is added automatically by esbuild
		.replace(".js", "")
		.replace("pages/", "");
	return { in: entry, out: out };
});
if (env.VERBOSE_LOG_ALL_FILES === "true") {
	entryPointsIO.forEach(({ in: inp, out }) => {
		inp = inp.replace(abs_paths.source + "/", "");
		const ext = inp.split(".").pop() || "";
		out = out.replace(abs_paths.output + "/", "") + ".js";

		const colorFROM = colors.fg["lang" + ext.toUpperCase()].dim;
		const colorTO = colors.fg.langJS.dim;

		log(`${colorFROM("█") + colorTO("█")} ${colors.fg.low1("Writing " + out)} ${colors.fg.low2("from " + inp)}`, "esbuild");
	});
}

// - ESBuild options
const options : esbuild.BuildOptions = {
	loader: { ".png": "file", ".jpg": "file", ".svg": "file", ".mp3": "file" },
	external: mono.external_dependencies,
	logLevel: "error",

	format: "esm", platform: "browser",
	target: mono.supported_browsers_esbuild,
	write: env.DRY_RUN === "false",
	entryPoints: entryPointsIO, outdir: paths.output,
	bundle: true, minify: env.MINIFY_FILES === "true",
	sourcemap: env.SOURCE_MAPS === "true" ? "inline" : undefined,
	plugins: [
		// externalizeAllPackagesExcept(config.bundled_packages),
		esbuildPluginReplace({ "__util__": "/awa-util/core.js" }),
	],
};

// - Run build or start watch mode
if (env.SERVE === "false") {
	await esbuild.build(options);
	log(`${mono.symbols.ts} Compiled ${b.bold(entryPoints.length)} file${entryPoints.length === 1 ? "" : "s"} from ${b(paths.source + "/")} to ${b(paths.output + "/")}`, "esbuild");
} else {
	const ctx = await esbuild.context(options);
	await ctx.watch();
	log(`${mono.symbols.ts} Watching ${b.bold(entryPoints.length)} file${entryPoints.length === 1 ? "" : "s"} in ${b(paths.source + "/")}`, "esbuild");
	esbuild_context = ctx;
}

// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Post-build logging:
// |    - Log folder sizes
// |	- Log warnings
// |_____________________________________________________________________________________________________________

eleventy_process.on("close", async (code = 0) => {

	if (esbuild_context) {
		esbuild_context.cancel();
		esbuild_context.dispose();
		console.log("killed esbuild");
	}
	if (env.SERVE === "true") return;

	const files1 = (await glob(`**/*`, { onlyFiles: true, cwd: abs_paths.source })).length.toString();
	const files2 = (await glob(`**/*`, { onlyFiles: true, cwd: abs_paths.output })).length.toString();

	console.log("");
	log(p(`🎉 Build complete in ${b(`${~~(performance.now())}ms`)}!`));
	log(`—— Source folder: ${b(files1)} file${files1 === "1" ? "" : "s"}, ${b(await getDirectorySize(abs_paths.source))}`);
	log(`—— Output folder: ${b(files2)} file${files2 === "1" ? "" : "s"}, ${b(await getDirectorySize(abs_paths.output))}`);
});



// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Utility functions:
// |_____________________________________________________________________________________________________________

/** Recursively delete all files and folders inside a directory */
async function clearDirectory (path : string) {
    const files = await glob(`**/*`, {
        cwd: path,
        absolute: true,
        onlyFiles: false,
        markDirectories: true,
        ignore: env.CLEAR_IMAGES === "false" ? undefined : ["images/**"],
    });

    await Promise.all(files.map((f) => fs.promises.rm(f, { recursive: true })));
}

/** Get the size of a folder in mB or kB - depending on the size */
async function getDirectorySize (path : string) {
	const bytes = await getFolderSize.loose(path);
	const greaterThanOneMB = bytes > 1048576;
	const size = `${(bytes / (greaterThanOneMB ? 1048576 : 1024)).toFixed(2)}${greaterThanOneMB ? "M" : "K"}iB`;
	return size;
}
