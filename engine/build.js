// build.js
// @ts-check
/* 
BUILD.JS STEPS
	1. Compile awa-util to dist/awa-util/core.js (preferabley minmized and rolled up to include all 4 files in the 1 core) with NO types
	   And to awa-util/js with d.ts files included (no minimizing)
	   Also shouldn't build if would output same results
	2. Process command line arguments given to this file and generate env variables based on them
	3. Clear dist if desired cmd line arg given
	4. Run 'eleventy' with the correct arguemtns and flags
*/

import { rm, readFile, writeFile, mkdir } from "node:fs/promises";
import { spawn, execSync } from "node:child_process";
import crypto from "node:crypto";

import { existsSync } from "fs";

import glob from "fast-glob";

import * as config from "./config.js";
const { log, colors, paths, absPaths, err } = config;

(async () => { // <- Wrapper to allow await



	/* ~~~~~ Parse CLI Flags ~~~~~ */
	/** @type {Record<'NEOCITIES' | 'DRYRUN' | 'SERVE' | 'TIMESTAMPS' | 'FULLBUILD' | 'CLEARDIST' | 'PRODUCTION', 'true' | 'false'>} */
	const env = { };
	for (let arg of process.argv.slice(2)) {
		arg = arg.replaceAll("-", "").toLowerCase();
		if (arg === "dry") env.DRYRUN = "true";
		else if (arg === "n" || arg === "neocities") env.NEOCITIES = "true";
		else if (arg === "s" || arg === "serve") env.SERVE = "true";
		else if (arg === "f" || arg === "fullbuild") env.FULLBUILD = "true";
		else if (arg === "c" || arg === "cleardist") env.CLEARDIST = "true";
		else if (arg === "p" || arg === "production") env.PRODUCTION = "true";
		// else if (arg === "t" || arg === "timestamps") env.TIMESTAMPS = "true";
		else { err(`Unknown CLI arg provided: '${arg}'`); }
	}
	process.env = { ...process.env, ...env };
	const args = [
		...(env.SERVE === "true" ? ["--incremental", "--serve"] : env.CLEARDIST !== "true" ? ["--incremental"] : []),
		...(env.DRYRUN === "true" ? ["--dryrun"] : []),
		`--config=${paths.engine}/.eleventy.js`,
	];




	/* ~~~~~ Clear the dist folder ~~~~~ */ /** @type {string[]} */
	let files = [];
	if (env.CLEARDIST === "true") {
		files = await glob(`**/*`, { onlyFiles: true, cwd: absPaths.output, absolute: true });
		await Promise.all(files.map((f) => rm(f)));
	}



	/* ~~~~~ Compile /src/awa-util/core.ts to /__awa-util/core.js ~~~~~ */
	// > Only if the combined hash of all files in util are different to the ones stored in hash.bin

	const cachePath = `../${paths["util-js"]}/hash.bin`;
	let needsRecompile = false;

	// Create the folder if it doesn't exist
	await mkdir(cachePath.slice(0, cachePath.lastIndexOf("/")), { recursive: true });

	// Fetch the old hash, or if doesn't exist just recompile
	const oldHash = await readFile(cachePath).catch(() => null);
	if (oldHash === null) needsRecompile = true;

	// Create a hash of all the files joined together
	const util_files = await glob(`${paths.util}/*.ts`);
	const util_files_buffer = Buffer.concat(await Promise.all(util_files.map((path) => readFile(path))));
	const hash = crypto.createHash("sha1").update(util_files_buffer).digest();

	if (!needsRecompile && !hash.equals(oldHash)) needsRecompile = true; // Recompile if old hash and new hash are different
	if (needsRecompile) {
		await writeFile(cachePath, hash); // Write the new hash
		log(`🔧 ${colors.pink("awa-util")}: Recompiling awa-util, because the ${!oldHash ? "hash file didn't exist" : "current and old hashes were different"}`);

		// Compile the typescript
		execSync(`node ./node_modules/typescript/bin/tsc -p ${paths.util}/_tsconfig.json --pretty false --noEmitOnError false`, { stdio: "inherit" });
	}
	else { log(`🔧 ${colors.pink("awa-util")}: Identical hash, not recompiling`); }



	/* ~~~~~ Log the fact that build started, and what arguments were provided / flags set ~~~~~ */
	console.log("");
	log(`🏁 Starting eleventy in ${colors.blue(env.SERVE ? "serve" : "build")} mode...`, colors.pink);
    log(`—— Cleared ${colors.blue(files.length)} file${files.length === 1 ? "" : "s"} from the output folder`);
	log(`—— Environment variables: ${colors.blue(`{ ${Object.entries(env).map(([k, v]) => `${k}: ${v}`).join(", ")} }`)}`);
	log(`—— Running command: ${colors.blue("eleventy " + args.join(" "))}`);
	console.log("");



	/* ~~~~~ Run the 'eleventy' command, providing it with the environment variables set above ~~~~~ */
	const eleventy_process = spawn(`eleventy ${args.join(" ")}`, { stdio: "inherit", shell: true, env: process.env });
	eleventy_process.on("exit", (code) => process.exit(code ?? 0));
})();


/**
 * Checks if two arrays of file paths have different creation dates
 * @param {string[]} files1 - First array of file paths
 * @param {string[]} files2 - Second array of file paths
 * @returns {boolean} - true if they are different or any of files1 not in files2, false if identical
 */
