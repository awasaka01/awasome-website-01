/*

	AWA'S OVERLY COMPLICATED CONFIG FILE!!!

	build steps:
	- src/━ 11ty ━➤ temp/━ Vite ━➤ production

*/

import path from "node:path";
import { mkdirSync, watch } from "node:fs";
import { execSync } from "node:child_process";

//
const FLAG_FULL_BUILD = process.env.FULL_BUILD !== undefined;
const { FOLDER_BUILD, FOLDER_DEV, FOLDER_TEMP } = process.env;

// 11ty and plugins
import eleventy from "11ty.ts"; // For full intellisense and descriptions of eleventyConfig
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { VentoPlugin } from "eleventy-plugin-vento";
import { minify } from "html-minifier-terser";

// Vite and plugins
import * as Vite from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import react from "@vitejs/plugin-react";

//
import customTransforms from "./scripts/custom-transforms.js";

/// <reference types="@11ty/eleventy" />

/**
 * @param {import('@11ty/eleventy/src/UserConfig')} eleventyConfig
 */
export default (eleventyConfig) => {
	eleventyConfig.
eleventyConfig.addExtension("vto", (data, d) => {

});

};


// // msynr performance improv:  use passthrough copies when possibl instead of  templates
// // also i dont think some of these need to evenbe templates rn



// Environment Variables

// Eleventy



// // ANCHOR - User Config
// const options = {
// 	scss: { // https://sass-lang.com/documentation/js-api/interfaces/stringoptions/
// 		loadPaths: ["./src/modules/_styles"], // TODO sourceMap: true,
// 	},
// 	serverOptions11ty: { // https://www.11ty.dev/docs/dev-server/
// 		liveReload: true,
// 		domDiff: true,
// 		port: 8080,
// 		// watch: ["./src/modules/_styles"],
// 	},
// };



// const viteOptions = {
// 	assetsInclude: ["**/*.wasm"],
// 	clearScreen: false,
// 	optimizeDeps: {
// 		exclude: ["wasm_exec.js"],
// 	},
// 	plugins: [
// 		react(),
// 		...(FLAG_FULL_BUILD ? [ViteImageOptimizer({ webp: { lossless: false } })] : []),
// 	],
// 	appType: "mpa",
// 	server: {
// 		middlewareMode: true,
// 	},
// 	css: !FLAG_FULL_BUILD ? undefined : {
// 		transformer: "lightningcss",
// 	},
// 	resolve: {
// 		alias: {
// 			"@util": path.resolve(".", "./awa-util/util.ts"),
// 		},
// 	},
// 	build: {
// 		emptyOutDir: false,
// 		outDir: path.resolve(".", FLAG_FULL_BUILD ? FOLDER_BUILD : FOLDER_DEV), // absolute path to FOLDER_DEV
// 		rollupOptions: {
// 			output: {
// 				...(!FLAG_FULL_BUILD ? {
// 					entryFileNames: "assets/[name].js",
// 					chunkFileNames: "assets/[name].js",
// 					assetFileNames: "assets/[name].[ext]",
// 				} : {}),
// 				compact: FLAG_FULL_BUILD,
// 			},
// 		},
// 		minify: FLAG_FULL_BUILD ? "esbuild" : false,
// 		cssCodeSplit: FLAG_FULL_BUILD,
// 	},
// 	root: FOLDER_TEMP, // is set to FOLDER_DEV if in server mode
// 	treeshake: FLAG_FULL_BUILD,
//     manualChunks: FLAG_FULL_BUILD ? undefined : false,
// };


// // https://www.11ty.dev/docs/config/
// export const config = {
// 	dir: {
// 		input: "src",
// 		output: process.env.ELEVENTY_RUN_MODE === "serve" ? FOLDER_DEV : FOLDER_TEMP,
// 		includes: "modules/_includes",
// 		data: "modules/_data",
// 		layouts: "modules/_layouts",
// 	},

// 	htmlTemplateEngine: "vto",
// 	templateFormats: ["html", "js", "vto", "css", "scss", "jsx", "ts", "tsx", "md", "11ty.js", "11ty.ts", "11ty.cjs", "11ty.mjs"],
// };


// /* ANCHOR - 11ty main configuration function */
// /** @param {import("@11ty/eleventy").UserConfig} eleventyConfig [Intellisense Support] */
// export default async function (eleventyConfig) {
// 	eleventyConfig.addGlobalData("env", process.env); // expose environment variables to templates
// 	eleventyConfig.addGlobalData("nocache", `?nocache=${Date.now().toString(36)}`); // prevent using cache instead of latest files

// 	eleventyConfig.a;

// 	eleventyConfig.addShortcode("default", (value, defaultValue) => value ?? defaultValue);
// 	eleventyConfig.addShortcode("repeat", (i, x) => x.repeat(i));
// 	eleventyConfig.addPlugin(VentoPlugin, {
// 		// An array of Vento plugins to use when compiling
// 		plugins: [],

// 		// Enable/disable Eleventy Shortcodes, Paired Shortcodes,
// 		// and Filters in .vto templates
// 		shortcodes: true,
// 		pairedShortcodes: true,
// 		filters: true,

// 		// Define tags that should be trimmed, or set to true
// 		// to trim the default tags (see section on Auto-trimming)
// 		autotrim: false,

// 		// A Vento configuration object
// 		ventoOptions: { includes: "src/" + config.dir.includes },
// 	});



// 	// Pages to exclude from neocities
// 	if (process.env.BUILD_TARGET === "neocities") {
// 		eleventyConfig.ignores.add("src/pages/awarium/**");
// 	}


// 	eleventyConfig.ignores.add("_*");
// 	eleventyConfig.addPassthroughCopy("src/assets/");
// 	eleventyConfig.addPassthroughCopy({ "src/not_found.html": "not_found.html" });
// 	customTransforms(eleventyConfig);
// 	FLAG_FULL_BUILD ? eleventyConfig.setQuietMode(false) : eleventyConfig.setQuietMode(true);


// 	["js", "ts", "jsx", "tsx", "css"].forEach(addBlankExtensionForPermalinks, eleventyConfig); // eleventyConfig.addExtension that just returns the content, required for permalinks in folder data (like pages.11tydata.js) to work for some reason
// 	eleventyConfig.addExtension("scss", { outputFileExtension: "css", useLayouts: false, compile: compileSCSS }); // SCSS compilation, using sass-embedded

// 	eleventyConfig.addExtension("11tydata", { outputFileExtension: "js", useLayouts: false });

// 	// HTML Minification + Image Conversion
// 	if (FLAG_FULL_BUILD) {
// 		eleventyConfig.addTransform("minifyHTML", minifyHTML);
// 		eleventyConfig.addPlugin(eleventyImageTransformPlugin, { formats: ["webp"], filenameFormat: (id, src, width, format) => `${path.basename(src, path.extname(src))}-${width}w.${format}` });
// 	}


// 	/* Vite, build for production, after 11ty is done, from ____temp (11ty output) to __production (Vite output) */
// 	eleventyConfig.on("eleventy.after", async ({ dir, runMode, outputMode, results }) => {
// 		if (runMode !== "build" || results.length === 0) return;
// 		if (dir.output !== FOLDER_TEMP) throw new Error(`Expected 11ty to output to ${FOLDER_TEMP} but got ${dir.output}`);
// 		viteOptions.build.rollupOptions.input = results
// 			.filter((entry) => Boolean(entry.outputPath)) // filter out `false` serverless routes
// 			.filter((entry) => (entry.outputPath || "").endsWith(".html")) // only html output
// 			.map((entry) => entry.outputPath);
// 		await Vite.build(viteOptions);
// 	});

// 	/* Vite, live development server */
// 	eleventyConfig.setServerOptions({
// 		...options.serverOptions11ty,
// 		setup: async () => { // setup <- mysterious undocumented server option taken from eleventy-plugin-vite
// 			viteOptions.root = path.resolve(".", FOLDER_DEV); // change source folder
// 			const viteDevServer = await Vite.createServer(viteOptions);

// 			process.once("SIGINT", async () => viteDevServer.close());
// 			process.once("SIGTERM", async () => viteDevServer.close());
// 			return { middleware: [viteDevServer.middlewares] };
// 		},
// 	});
// }




// /* ANCHOR - Functions */


// // Minifies HTML, using html-minifier-terser
// async function minifyHTML (content) {
// 	if (!this.page.outputPath.endsWith(".html")) return content;
// 	content = content.replace(/[\r\t]/g, "").split("\n").map((x) => x.trim()).join("\n");
// 	content = await minify(content, { // useful: <!-- htmlmin:ignore --> [https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference]
// 		removeScriptTypeAttributes: true,
// 		collapseBooleanAttributes: true,
// 		removeRedundantAttributes: true,
// 		removeOptionalTags: false,
// 		removeComments: true,
// 		minifyURLs: true,
// 		minifyCSS: false,
// 		minifyJS: false,
// 	});
// 	return content;
// }


// // Compiles SCSS, using sass-embedded
// import * as sass from "sass-embedded";
// import { beforeEach } from "node:test";
// async function compileSCSS (fileContent) { return (data) => {
// 	if (data.page.fileSlug.startsWith("_")) return;

// 	options.scss.loadPaths.push(path.dirname(data.page.inputPath));
// 	return "/* stylelint-disable */\n" + sass.compileString(fileContent, options.scss).css;
// }; }


// // eleventyConfig.addExtension("go", { outputFileExtension: "wasm", useLayouts: false, compile: compileGoWasm });
// async function compileGoWasm (fileContent) { return (data) => {
// 	if (data.page.fileSlug.startsWith("_")) return;
// 	execSync(`tinygo build -o "${data.page.outputPath}" -target wasm "${path.dirname(data.page.inputPath)}"`, { stdio: "inherit" });
// 	return;
// }; }


// // Add "extension" that just returns the content (unless it's 11tydata.js) | Required for permalinks to work
// function addBlankExtensionForPermalinks (ext) { this.addExtension(ext, {
// 	outputFileExtension: ext,
// 	compile: (content) => ({ page }) => page.inputPath.endsWith(".11tydata.js") ? undefined : content,
// }); }
