// @ts-check

// - node modules
import fs from "node:fs";
import glob from "fast-glob";
import crypto from "node:crypto";
import { execSync } from "node:child_process";


// - my config
import * as config from "./config.js";
const { log, err, colors, paths, absPaths } = config;
// ✧ process.env is modified by the build script, so correct the types:
const env = /** @type {NodeJS.ProcessEnv & import('./config.js').env_type} */ (process.env);


/* ~~~~~ Compile /src/awa-util/core.ts to /__awa-util/core.js ~~~~~ */
// - To allow using awa-util during build steps
// ? Only if the combined hash of all files in util are different to the ones stored in hash.bin
export default async function compile (hashfilepath) {

	let needsRecompile = false;

	// 1. Fetch the old hash, if it exists
	const oldHash = env.CLEAR_CACHE === "true" ? null : await fs.promises.readFile(hashfilepath).catch(() => null);
	if (oldHash === null) needsRecompile = true;

	// 2. Create a hash of all the awa-util files joined together
	const util_files = await glob(`${paths.util}/*.ts`);
	const util_files_buffer = Buffer.concat(await Promise.all(util_files.map((path) => fs.promises.readFile(path))));
	const hash = crypto.createHash("sha1").update(util_files_buffer).digest();

	// 3. Recompile, if the old and new awa-util hashes are different
	if (!needsRecompile && !hash.equals(oldHash)) needsRecompile = true;
	if (needsRecompile) {
		// - Write the new hash
		await fs.promises.writeFile(hashfilepath, hash);
		log(`🔧 ${colors.pink("awa-util")}: Recompiling awa-util, because the ${env.CLEAR_CACHE === "true" ? "cache was cleared" : !oldHash ? "hash file didn't exist" : "current and old hashes were different"}`);
		// - Compile the typescript
		execSync(`node ./node_modules/typescript/bin/tsc -p ${paths.util}/_tsconfig.json --pretty false --noEmitOnError false`, { stdio: "inherit" });
	}
	// else { log(`🔧 ${colors.pink("awa-util")}: Identical hash, not recompiling`); }

}
