import path from "node:path";

// Environment Variables
import "dotenv/config";
const FLAG_FULL_BUILD = process.env.FULL_BUILD !== undefined;
const { FOLDER_BUILD, FOLDER_DEV, FOLDER_TEMP } = process.env;

// Vite + Plugins

// e
import { minify } from "html-minifier-terser";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

import customTransforms from "./scripts/custom-transforms.js";



// ANCHOR - User Config
const options = {
	scss: { // https://sass-lang.com/documentation/js-api/interfaces/stringoptions/
		loadPaths: ["./src/modules/_styles"], // TODO sourceMap: true,
	},
	serverOptions11ty: { // https://www.11ty.dev/docs/dev-server/
		liveReload: true,
		domDiff: true,
		port: 8080,
	},
};



// Configure Vite, enabling more things when FLAG_FULL_BUILD is true
import * as Vite from "vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

const viteOptions = {
	clearScreen: false,
	plugins: [
		react(),
		...(FLAG_FULL_BUILD ? [ViteImageOptimizer({ webp: { lossless: false } })] : []),
	],
	appType: "mpa",
	server: {
		middlewareMode: true,
	},
	css: !FLAG_FULL_BUILD ? undefined : {
		transformer: "lightningcss",
	},
	build: {
		emptyOutDir: false,
		outDir: path.resolve(".", FLAG_FULL_BUILD ? FOLDER_BUILD : FOLDER_DEV), // absolute path to FOLDER_DEV
		rollupOptions: {
			output: {
				...(!FLAG_FULL_BUILD ? {
					entryFileNames: "assets/[name].js",
					chunkFileNames: "assets/[name].js",
					assetFileNames: "assets/[name].[ext]",
				} : {}),
				compact: FLAG_FULL_BUILD,
			},
		},
		minify: FLAG_FULL_BUILD ? "esbuild" : false,
		cssCodeSplit: FLAG_FULL_BUILD,
	},
	root: FOLDER_TEMP, // is set to FOLDER_DEV if in server mode
	treeshake: FLAG_FULL_BUILD,
    manualChunks: FLAG_FULL_BUILD ? undefined : false,
};


// https://www.11ty.dev/docs/config/
export const config = {
	dir: {
		input: "src",
		output: process.env.ELEVENTY_RUN_MODE === "serve" ? FOLDER_DEV : FOLDER_TEMP,
		includes: "modules/_includes",
		data: "modules/_data",
		layouts: "modules/_layouts",
	},
	templateFormats: ["html", "js", "css", "scss", "jsx", "ts", "tsx", "njk", "md", "liquid", "11ty.js", "11ty.ts", "11ty.cjs", "11ty.mjs"],
};


/* ANCHOR - 11ty main configuration function */
/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig [Intellisense Support] */
export default async function (eleventyConfig) {
	eleventyConfig.ignores.add("_*");
	eleventyConfig.addPassthroughCopy("src/assets/");
	eleventyConfig.setQuietMode(true);

	customTransforms(eleventyConfig);


	["js", "css"].forEach(addBlankExtensionForPermalinks, eleventyConfig); // eleventyConfig.addExtension that just returns the content, required for permalinks in folder data (like pages.11tydata.js) to work for some reason
	eleventyConfig.addExtension("scss", { outputFileExtension: "css", useLayouts: false, compile: compileSCSS }); // SCSS compilation, using sass-embedded


	eleventyConfig.addExtension("11tydata", { outputFileExtension: "js", useLayouts: false });

	// HTML Minification + Image Conversion
	if (FLAG_FULL_BUILD) {
		eleventyConfig.addTransform("minifyHTML", minifyHTML);
		eleventyConfig.addPlugin(eleventyImageTransformPlugin, { formats: ["webp"], filenameFormat: (id, src, width, format) => `${path.basename(src, path.extname(src))}-${width}w.${format}` });
	}


	/* Vite, build for production, after 11ty is done, from ____temp (11ty output) to __production (Vite output) */
	eleventyConfig.on("eleventy.after", async ({ dir, runMode, outputMode, results }) => {
		if (runMode !== "build" || results.length === 0) return;
		if (dir.output !== FOLDER_TEMP) throw new Error(`Expected 11ty to output to ${FOLDER_TEMP} but got ${dir.output}`);
		viteOptions.build.rollupOptions.input = results
			.filter((entry) => Boolean(entry.outputPath)) // filter out `false` serverless routes
			.filter((entry) => (entry.outputPath || "").endsWith(".html")) // only html output
			.map((entry) => entry.outputPath);
		await Vite.build(viteOptions);
	});

	/* Vite, live development server */
	eleventyConfig.setServerOptions({
		...options.serverOptions11ty,
		setup: async () => { // setup <- mysterious undocumented server option taken from eleventy-plugin-vite
			viteOptions.root = path.resolve(".", FOLDER_DEV); // change source folder
			const viteDevServer = await Vite.createServer(viteOptions);

			process.on("SIGINT", async () => await viteDevServer.close());
			return { middleware: [viteDevServer.middlewares] };
		},
	});
}




/* ANCHOR - Functions */


// Minifies HTML, using html-minifier-terser
async function minifyHTML (content) {
	if (!this.page.outputPath.endsWith(".html")) return content;
	content = content.replace(/[\r\t\n]/g, "").split("\n").filter((x) => x.length > 0).map((x) => x.trim()).join("\n").trim();
	content = await minify(content, { // useful: <!-- htmlmin:ignore --> [https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference]
		removeScriptTypeAttributes: true,
		collapseBooleanAttributes: true,
		removeRedundantAttributes: true,
		removeOptionalTags: false,
		removeComments: true,
		minifyURLs: true,
		minifyCSS: true,
		minifyJS: true,
	});
	return content;
}


// Compiles SCSS, using sass-embedded
import * as sass from "sass-embedded";
async function compileSCSS (fileContent) { return (data, inputPath) => {
	if (data.page.fileSlug.startsWith("_")) return;

	options.scss.loadPaths.push(path.dirname(data.page.inputPath));
	return "/* stylelint-disable */\n" + sass.compileString(fileContent, options.scss).css;
}; }


// Add "extension" that just returns the content (unless it's 11tydata.js) | Required for permalinks to work
function addBlankExtensionForPermalinks (ext) { this.addExtension(ext, {
	outputFileExtension: ext,
	compile: (content) => ({ page }) => page.inputPath.endsWith(".11tydata.js") ? undefined : content,
}); }
