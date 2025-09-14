// scripts/dev.js
import { rm, readdir } from "node:fs/promises";
import { spawn } from "node:child_process";

import * as config from "../config.js";
import { error } from "node:console";
const { log, colors } = config;
import glob from "fast-glob";
// FULLBUILD : Enable all features
// SERVE     : Start as a dev server not a 1 time build
// NEOCITIES : Disable stuff for neocities limits
process.noDeprecation = true;
const env = { };
for (let arg of process.argv) {
	arg = arg.replaceAll("-", "").toLowerCase();
	if (arg === "neocities" || arg === "n") { env.NEOCITIES = "true"; }
	else if (arg === "serve" || arg === "s") { env.SERVE = "true"; }
	else if (arg === "fullbuild" || arg === "f") { env.FULLBUILD = "true"; }
	else if (arg === "cleardist" || arg === "c") { env.CLEARDIST = "true"; }
}

(async () => {

// async function main () {
//   try {
//     // Step 1: Clear __production (ignore if it doesn't exist)

	let files = [];
	if (env.CLEARDIST === "true") {
		files = await glob(`${config.paths.output}/**`, { onlyFiles: true });
		await Promise.all(files.map((f) => rm(f)));
	}

	let args
	= env.SERVE === "true" ? ["--serve", "--incremental"]
	: env.CLEARDIST !== "true" ? ["--incremental"]
	: [];

	console.log("");
	log(`—— Arguments passed to eleventy: ${colors.blue(`[ ${args.join(", ")} ]`)}`);
	log(`—— Environment variables: ${colors.blue(`{ ${Object.entries(env).map(([k, v]) => `${k}: ${v}`).join(", ")} }`)}`);
    log(`—— Cleared ${colors.blue(files.length)} file${files.length === 1 ? "" : "s"} from the output folder`);
	log(`🏁 Starting eleventy in ${colors.blue(env.SERVE ? "serve" : "build")} mode...`, colors.pink);
	console.log("");

	// Run the 'eleventy' command
	const eleventy_process = spawn("eleventy", args, {
		stdio: "inherit",
		shell: true, // important for Windows
		env: { ...process.env, ...env },
	});


    eleventy_process.on("exit", (code) => process.exit(code ?? 0));

})();
