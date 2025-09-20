// - node modules
import fs from "node:fs";
import esbuild from "esbuild";
import externalizeAllPackagesExcept from "esbuild-plugin-noexternal";
import { replace as esbuildPluginReplace } from "esbuild-plugin-replace";
import browserslist_esbuild from "browserslist-to-esbuild";
const supported_browsers_esbuild = browserslist_esbuild(config.supported_browsers); // < convert browserslist to an esbuild compatible format

// - my config
import * as util from "__util__";
import * as config from "./config.js";
const { log, err, colors, paths, absPaths } = config;
const { blue: b, pink: p, white: w } = colors;
const env = process.env as config.env_type & NodeJS.ProcessEnv;




/** Runs esbuild */
export default async function startEsbuildClient (entryPoints : string[], outdir : string, watch = false) {

	if (!fs.existsSync(outdir)) err(`🥣 esbuild: Output directory does not exist: ${outdir}`);

	const supported_extensions = [".js", ".jsx", ".ts", ".tsx"];
	const bad_entryPoints = entryPoints.filter((path) => !supported_extensions.some((ext) => path.endsWith(ext)));
	if (bad_entryPoints.length > 0) err(`🥣 esbuild: unsupported entry files: [ ${bad_entryPoints.join(", ")} ]`);


	const options : esbuild.BuildOptions = {
		loader: { ".png": "file", ".jpg": "file", ".svg": "file", ".mp3": "file" },
		external: config.external_dependencies,
		logLevel: "error",

		format: "esm", platform: "browser",
		target: supported_browsers_esbuild,
		entryPoints: entryPoints, outdir: outdir,
		bundle: true, minify: env.MINIFY_FILES === "true",
		sourcemap: env.SOURCE_MAPS === "true" ? "inline" : undefined,
		plugins: [
			// externalizeAllPackagesExcept(config.bundled_packages),
			esbuildPluginReplace({ "__util__": "/awa-util/core.js" }),
		],
	};

	if (env.SERVE === "false") {
		await esbuild.build(options);
		log(`🥣 esbuild: Built ${b.bold(entryPoints.length)} file${entryPoints.length === 1 ? "" : "s"} to ${b(outdir)}`);
	}
	else {
		const ctx = await esbuild.context(options);
		await ctx.watch();
		log(`🥣 esbuild: Started watching ${b.bold(entryPoints.length)} file${entryPoints.length === 1 ? "" : "s"}`);
		return ctx;
	}

}
