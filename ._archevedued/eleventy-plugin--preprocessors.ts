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

const transforms : Record<string, (data : EleventyScope & Record<string, any>, content : string) => string> = {
	"html": (data, content) => {
		// Arbitrary replace functions using regexes in frontmatter .replace object
		if (data.replace) {
			for (const [str, replace] of Object.entries(data.replace as Record<string, string>)) {
				const lastSlashIndex = str.lastIndexOf("/");
				const regex = new RegExp(str.slice(0, lastSlashIndex), str.slice(lastSlashIndex + 1));
				content = content.replaceAll(regex, replace);
			}
		}
		if (data.colorMatches === true) {
			// Color replacer 𝓒1:┃◺ - more complex than standard replacing so it's seperate
			const colorMatches = data.colorMatches ? [...content.matchAll(/𝓒(\d):(.*?)◺/g)] : [];
			if (colorMatches.length > 0) {
				let result = "", cursor = 0;
				colorMatches.forEach((match) => {
					const [full, colorNum, text] = match;
					const idx = content.indexOf(full, cursor);
					result += content.slice(cursor, idx);
					result += `<span class="boxdraw-color-${colorNum}">${text}</span>`;
					cursor = idx + full.length;
				});
				result += content.slice(cursor); content = result;
			}
		}
		return content;
	},
};


export default function Plugin (eleventyConfig : Eleventy.EleventyConfig) {
	eleventyConfig.addPreprocessor("custom-preprocessors", Object.keys(transforms), async (data, content) => {
		const transform = transforms[data.page.outputFileExtension];
		if (!transform) return content;
		const transformed = transform(data, content);
		if (content !== transformed) log(`🔧 ${colors.pink("11ty-preprocessors.js")}: Transformed ${colors.blue(data.page.inputPath)}`);
		return transformed;
	});
}
`