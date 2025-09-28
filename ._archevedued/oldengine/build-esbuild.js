// @ts-check

// ──────────────────────────────────────────────────────────────────────────────────────────────────
//
//    Run esbuild for client scripts
//
// ──────────────────────────────────────────────────────────────────────────────────────────────────


// - node modules
import fs from "node:fs";
import esbuild from "esbuild";
import browserslist_esbuild from "browserslist-to-esbuild";
const supported_browsers_esbuild = browserslist_esbuild(config.supported_browsers); // < convert browserslist to esbuild format

// - my config
import * as config from "./config.js";
import chalk from "chalk";
const { log, err, colors, paths, absPaths } = config;



/**
* Start esbuild watcher for client scripts
* @param {string[]} entryPoints - list of entry files
* @param {string} outdir - directory to write bundled scripts
* @param {boolean} [watch] - whether to start watch mode (default: false)
* @returns {Promise<esbuild.BuildContext> | undefined}
*/
export default async function startEsbuildClient (entryPoints, outdir, watch = false) {

	// ✧ process.env is modified by the build script, so correct the types:
	const env = /** @type {NodeJS.ProcessEnv & import('./config.js').env_type} */ (process.env);
	if (env.DRY_RUN === "true") return;

	// - validate entry files
	if (entryPoints.length === 0) err("esbuild: no entry files given");
	const supported_extensions = [".js", ".jsx", ".ts", ".tsx"];
	const unsupported = entryPoints.filter((path) => !supported_extensions.some((ext) => path.endsWith(ext)));
	if (unsupported.length > 0) err(`esbuild: unsupported entry files: [ ${unsupported.join(", ")} ]`);


	// - check output dir exists
	if (!fs.existsSync(outdir)) err(`esbuild: '${outdir}' does not exist`);


	/** @type {esbuild.BuildOptions} */
	const esbuildOptions = {
		entryPoints,
		bundle: true,
		format: "esm",
		outdir,
		sourcemap: env.SOURCE_MAPS === "true" ? "inline" : undefined,
		loader: { ".png": "file", ".jpg": "file", ".svg": "file", ".mp3": "file" },
		minify: env.MINIFY_FILES === "true",
		logLevel: "info",
		target: supported_browsers_esbuild,
		external: ["react", "react-dom", "react-dom/client"],
	};
	if (env.SERVE === "true") {
		// ────────────────────────────────
		// Dev mode with watch
		// ────────────────────────────────
		log(`${chalk.cyan("esbuild")}: starting in ${chalk.green("watch mode")}…`);

		const ctx = await esbuild.context(esbuildOptions);
		await ctx.watch();
		log(`${chalk.cyan("esbuild")}: watching ${entryPoints.length} client scripts…`);
		return ctx;
	}
	else {
		await esbuild.build(esbuildOptions);
		console.log("esbuild: built client scripts");

	}
}
