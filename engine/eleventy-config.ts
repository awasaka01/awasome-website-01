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

// ✧ 11ty:
import Eleventy, { defineConfig } from "11ty.ts";
import { VentoPlugin } from "eleventy-plugin-vento";

// ✧ my plugins:
// import eleventyPluginImageCompressor from "./eleventy-plugin--image-compressor.js";
import eleventyPluginSassCompiler from "./eleventy-plugin--sass-compiler.js";
import eleventyPluginTransforms from "./eleventy-plugin--transforms.js";
import eleventyPluginCodeblock from "./eleventy-plugin--codeblock.js";



// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Config object:    [https://www.11ty.dev/docs/config/]
// |	- Prefered for "order of operations"
// |_____________________________________________________________________________________________________________

const eleventy_config = {
	dir               : { input: paths.source, includes: paths.includes, output: paths.output },
	htmlTemplateEngine: "vto",
	pathPrefix        : "/",
}; export { eleventy_config as config }; // < to avoid name conflict



// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Config function:    [https://www.11ty.dev/docs/config/]
// |_____________________________________________________________________________________________________________

export default ((eleventyConfig: Eleventy.EleventyConfig) => {

	// - Ignore files
	eleventyConfig.ignores.add(`${mono.paths.source}/_*{*/_*,*}`); // Ignore files and directories that start with an underscore  (glob to match _'s instead: !(_)*{*/!(_)*,*})
	eleventyConfig.ignores.add(`**/*.{js,ts,tsx,jsx}`);

	// - Watch for changes to files that this config file depends on [https://www.11ty.dev/docs/watch-serve/#reset-configuration] 

	// - 
	eleventyConfig.setTemplateFormats(["html", "vto"]);
	eleventyConfig.setDataFileBaseName("override");
	eleventyConfig.setDataFileSuffixes([".11tydata"]);
	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.addPassthroughCopy("./source/**/*.{mp3}");
	eleventyConfig.addPassthroughCopy("./source/fonts/**/*");
	eleventyConfig.addPassthroughCopy("./source/images/**/*");

	eleventyConfig.addShortcode("importmap", () => JSON.stringify(mono.importmap));

	// ~~~~~ Plugins ~~~~~
	// | images: Compress images
	// | preprocessors: Transform content before templates are compiled
	// | postprocessors: Transform content after templates are compiled (data does not contain frontmater!)
	// | Vento.vto template support [https://github.com/noelforte/eleventy-plugin-vento]
	// | Sass.scss support using sass-embedded (+ my plugin), and minify it using lightningcss
	// eleventyConfig.addPlugin(eleventyPluginImageCompressor);
	eleventyConfig.addPlugin(eleventyPluginTransforms);
	eleventyConfig.addPlugin(VentoPlugin, { ventoOptions: { ...mono.vento as any } });
	eleventyConfig.addPlugin(eleventyPluginSassCompiler({
		sassOptions: { ...mono.scss, logger: { debug: (m) => log(m, "sass"), warn: (m) => warn(m, "sass") } },
		postprocess: env.MINIFY_FILES === "true" ? undefined : minifyCSS,
	}));

	/* ~~~~~ Minify .css ~~~~~ */
	eleventyConfig.addTemplateFormats("css");
	eleventyConfig.addExtension("css", { // [https://www.11ty.dev/docs/languages/custom/]
		outputFileExtension: "css",
		useLayouts         : false,
		compile            : (inputContent: string) => (data: Eleventy.EleventyScope) => minifyCSS(inputContent, data),
	});


	eleventyConfig.on("eleventy.after", () => {
		setTimeout(() => mono.sendIPC({ function_id: "print-warnings", args: [] }));
	});


	eleventyConfig.setServerOptions({
		port      : mono.port,
		domDiff   : true,
		liveReload: true,
		useCache  : true,
		watch     : ["**/*.{js,ts,tsx,jsx}", "images/**/*"],
	});


	log(chalk.dim.italic("   Eleventy Config loaded!"), "11ty");

	eleventyConfig.addPlugin(eleventyPluginCodeblock());


});


function minifyCSS (content: string, data: Eleventy.EleventyScope, sourceMap?: import("sass-embedded").CompileResult["sourceMap"]): string {
	const result = lightningcss.transform({
		filename      : data.page.fileSlug + ".css",
		code          : Buffer.from(content, "utf8"),
		targets       : lightningcss.browserslistToTargets(mono.supported_browsers),
		minify        : true,
		sourceMap     : env.SOURCE_MAPS === "true",
		inputSourceMap: env.SOURCE_MAPS === "true" && Boolean(sourceMap) ? JSON.stringify(sourceMap) : undefined,
	});
	return result.code + (result.map ? `\n/*# sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(result.map)).toString("base64")}*/` : "");
}
