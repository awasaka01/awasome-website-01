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
import type Eleventy from "11ty.ts";
import { imageSizeFromFile } from "image-size/fromFile";

// ✧ my imports:
import * as util from "__util__";
import * as mono from "./monolith.js";
const { log, warn, error, paths, abs_paths, colors } = mono;
const { blue: b, pink: p, white: w } = colors.fg;
const env = process.env as mono.env_arguments_type & Record<string, string>;



// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Unnamed:
// |	- Detailed steps or extra info
// |_____________________________________________________________________________________________________________

const transforms : Record<string, (data : EleventyScope & Record<string, any>, content : string) => string | Promise<string>> = {
	"html": async (data, content) => {

		// Minify HTML [https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference]
		const { minify: minifyHTML } = await import("html-minifier-terser");
		if (env.MINIFY_FILES === "true") {
			content = await minifyHTML(content, { // useful: <!-- htmlmin:ignore --> 
				removeScriptTypeAttributes: true,
				collapseBooleanAttributes: true,
				removeRedundantAttributes: true,
				removeOptionalTags: false,
				removeComments: true,
				minifyURLs: true,
				minifyCSS: false,
				minifyJS: false,
			});
		}
		return content;
	},
};


/** Eleventy plugin that applies custom transforms based on file extension. */
export default function () {
	return function Plugin (eleventyConfig : Eleventy.EleventyConfig) {
		eleventyConfig.addTransform("custom-postprocessors", async function (content) {

			const data = this as Eleventy.EleventyScope;

			const fn = transforms[data.page.outputFileExtension];
			if (!fn) return content;

			const transformed = await fn(data, content);
			if (content !== transformed) log(`🔧 ${colors.pink("11ty-postprocessors.js")}: Transformed ${colors.blue(data.page.inputPath)}`);
			return transformed;
		});
	};
}
