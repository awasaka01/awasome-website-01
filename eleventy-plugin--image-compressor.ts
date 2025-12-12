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


const MAX_WIDTH_WEBP = 32; // Max width for the small min. images 
let MAX_WIDTH_AVIF = 512; // Max width for the full sized .avif images

/** Eleventy Image Plugin - Minimizes images */
export default function () {
	return function (eleventyConfig : Eleventy.EleventyConfig) {

		return; // Disabled for now

		// Copy raw images that don't need to be minified, or all in dev mode
		eleventyConfig.addPassthroughCopy(`source/images/raw/**/*`);
		if (env.MINIFY_IMAGES === "false") eleventyConfig.addPassthroughCopy(`${paths.images}/**`);

		// Create all folders
		const imagesubfolders = glob.sync(`${paths.images}/**/`, { onlyDirectories: true });
		for (const folder of imagesubfolders) {
			if (fs.existsSync(path.join(abs_paths.output, folder.replace("source/", "")))) continue;
			log(`📸 Created folder: ${b(folder.replace("source/", ""))}`);
			fs.mkdirSync(path.join(abs_paths.output, folder.replace("source/", "")), { recursive: true });
		}

		/**
		* Render an image shortcode
		* @param {string} url - Path to the image e.g. `images/miku.png`
		* @param {Object} [options={}]
		* @param {string} [options.alt] - Alt text for the image
		* @param {string[]} [options.classes] - CSS class array
		* @param {"high"|"low"|"auto"} [options.priority] - Loading priority
		* @param {number} [options.maxwidth] - Specificy custom max width for this alone
		* @returns {string} Rendered img tag
		*/
		async function shortcode (url, options) {
			/** @type {import("11ty.ts").EleventyScope} */
			const data = this;


			/* ~~~~~ Option validation and defaults ~~~~~ */
			options = { alt: "", classes: [], priority: "auto", ...options };
			const err = (msg) => config.err(`plugin_11ty_image: ${msg}\n       ${config.colors.grey(`at ${this.page.inputPath}`)}`);
			if (!(["high", "low", "auto"].includes(options.priority))) throw error(`Priority must be high|auto|low, got '${options.priority}'`);
			// - convert options key to an actual html attribute
			options.priority
				= options.priority === "high" ? `fetchpriority="high"`
				: options.priority === "low" ? `fetchpriority="low"`
				: "";
			if (options.maxwidth) MAX_WIDTH_AVIF = options.maxwidth;

			const extraAttr = Object.entries(options.att).map(([k, v]) => `${k}="${v}"`).join(" ");
			if (env.MINIFY_IMAGES === "false") return imgElement(url, options.classes, options);


			/* ~~~~~ Normalize the url ~~~~~ */
			// - Converts most url types to an extension and 'subfolder/name'
			url = url.replace("images/", "");
			try { url = new URL(url).toString(); }
			catch { url = path.posix.join("/", url.replace(/^\/+/, "").replace(/\/+$/, "")); }
			if (url.startsWith("/")) url = url.slice(1);

			const ext = path.extname(url); // ".png"
			const filename = url.slice(0, -ext.length); // "raw/miku" | "miku"
			// if (filename !== "miku") return;


			// More checks
			if (filename.startsWith(`raw`)) {
				// log(`${colors.pink("🖼️  11ty-plugin-image.js")}: ${colors.blue(url)} skipped!`);
				return imgElement(url, options.classes, options, extraAttr);
			}
			if (!existsSync(abs_paths.images + "/" + url)) return `Image '${url}' doesn't exist!`;

			let width, height;

			/* ~~~~~ Create the compressed images ~~~~~ */
			if (!existsSync(`${abs_paths.output}/images/${filename}.avif`)) {

				const img = /** @type {sharp.Sharp} */ (await new sharp(abs_paths.images + "/" + url, {}));
				const metadata = await img.metadata();


				// 1. Create a min.imagename.min.webp - at the lowest quality possible
				await (metadata.width > MAX_WIDTH_WEBP
					? img.clone().resize({ width: MAX_WIDTH_WEBP })
					: img.clone()
				).webp({ force: true, quality: 1, alphaQuality: 100, lossless: true },
				).toFile(`${abs_paths.output}/images/${filename}.min.webp`);

				// 2. Create an imagename.avif - at a balance between size and quality
				await (metadata.width > MAX_WIDTH_AVIF
					? img.clone().resize({ width: MAX_WIDTH_AVIF })
					: img.clone()
				).avif({ force: true, quality: 50, effort: env.MAX_QUALITY === "true" ? 9 : 1 },
				).toFile(`${abs_paths.output}/images/${filename}.avif`);

				width = metadata.width;
				height = metadata.height;


				// - Calculate and log file size
				const [filesize, filesizeAVIF, filesizeWEBP] = (await Promise.all([
					fs.promises.stat(`${abs_paths.images}/${url}`),
					fs.promises.stat(`${abs_paths.output}/images/${filename}.avif`),
					fs.promises.stat(`${abs_paths.output}/images/${filename}.min.webp`),
				])).map((f) => (f.size / 1024 > 99.99 ? `${(f.size / 1024 / 1024).toFixed(2)} mB` : `${(f.size / 1024).toFixed(2)} kB`).padStart(8, " "));

				log(`${colors.pink("📸 Compressed!")} original: ${colors.blue(filesize)} -> avif: ${colors.blue(filesizeAVIF)}, webp: ${colors.blue(filesizeWEBP)} - ${colors.pink(url)}`);
			}
			else {
				const dimensions = await imageSizeFromFile(abs_paths.images + "/" + url);
				width = dimensions.width;
				height = dimensions.height;
				// log(`${colors.pink("🖼️  11ty-plugin-image.js")}: File ${colors.blue(url)} is already compressed!`);
			}

				return (`
<figure class="progressive-image ${options.classes.join(" ")}" aria-label="${options.alt}">
	<img class="min" aria-hidden="true"
		src="images/${filename}.min.webp" 
		width="${width}" height="${height}" ${options.priority} alt="${options.alt}"
	> 
	<img class="full"
		data-src="images/${filename}.avif" ${extraAttr}
		width="${width}" height="${height}" ${options.priority} alt="${options.alt}"
	>
</figure>
			`);
		}

		eleventyConfig.addShortcode("image", shortcode);
	};
}

function imgElement (url, classes, options, extraAttr = "") {
	const { width, height, alt, priority } = options;
	return `
	<figure class="${classes.join(` `)}">
	<img src="${url}" 
		${width ? `width="${width}"` : ``}
		${height ? `height="${height}"` : ``}
		alt="${alt}" 
		${priority}
		${extraAttr}
	></figure>`.replaceAll("\n", "");

}

function createMinAnd (path) {}



const jpegOptions = {
	quality: 1, // minimal quality
	progressive: false, // no progressive scan
	chromaSubsampling: "4:2:0",
	optimiseCoding: true,
	mozjpeg: false,
	trellisQuantisation: false,
	overshootDeringing: false,
	optimiseScans: false,
	quantisationTable: 0,
	force: true,
};

// Minimal PNG options (lowest compression effort, smallest palette)
const pngOptions = {
	compressionLevel: 9, // max compression
	progressive: false,
	adaptiveFiltering: false,
	palette: true, // convert to indexed palette (smaller)
	colors: 2, // minimal colors
	dither: 0, // no dithering
	force: true,
};
