// engine/11ty-plugin-image.js
// @ts-nocheck

/* ~~~~~ Imports ~~~~~ */
// - my config:
import * as config from "./config.js";
const { log, err, colors, paths, absPaths } = config;
// ✧ process.env is modified by the build script, so correct the types:
const env = /** @type {NodeJS.ProcessEnv & import('./config.js').env_type} */ (process.env);

// - Miscellaneous:
import sharp from "sharp";
import path from "node:path";
import fs, { existsSync } from "node:fs";
import { imageSizeFromFile } from "image-size/fromFile";

// let verbose = true;
env.MINIFY_IMAGES = "true";




const MAX_WIDTH_WEBP = 40; // Max width for the small min. images 
let MAX_WIDTH_AVIF = 512; // Max width for the full sized .avif images

/**
 * Eleventy Image Plugin - Minimizes images
 * @param {{ postprocess?: (content: string, data: import("11ty.ts").EleventyScope) => string, sassOptions?: import("sass-embedded").StringOptions }} options
 * @returns {(eleventyConfig: import("11ty.ts").EleventyConfig) => void}
 */
export default function (options) {
	return function (eleventyConfig) {

		// Copy raw images that don't need to be minified, or all in dev mode
		eleventyConfig.addPassthroughCopy(`source/images/raw/*`);
		if (env.MINIFY_IMAGES === "false") eleventyConfig.addPassthroughCopy(`${paths.images}/**`);



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
			if (!(["high", "low", "auto"].includes(options.priority))) throw err(`Priority must be high|auto|low, got '${options.priority}'`);
			// - convert options key to an actual html attribute
			options.priority
				= options.priority === "high" ? `fetchpriority="high"`
				: options.priority === "low" ? `fetchpriority="low"`
				: "";
			if (options.maxwidth) MAX_WIDTH_AVIF = options.maxwidth;


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
				return imgElement(url, options.classes, options);
			}
			if (!existsSync(absPaths.images + "/" + url)) return `Image '${url}' doesn't exist!`;

			let width, height;

			/* ~~~~~ Create the compressed images ~~~~~ */
			if (!existsSync(`${absPaths.output}/images/${filename}.avif`)) {

				const img = /** @type {sharp.Sharp} */ (await new sharp(absPaths.images + "/" + url, {}));
				const metadata = await img.metadata();


				// 1. Create a min.imagename.webp - at the lowest quality possible
				(metadata.width > MAX_WIDTH_WEBP
					? img.clone().resize({ width: MAX_WIDTH_WEBP })
					: img.clone()
				).webp({ force: true, quality: 1, alphaQuality: 1 },
				).toFile(`${absPaths.output}/images/min.${filename}.webp`);

				// 2. Create an imagename.avif - at a balance between size and quality
				(metadata.width > MAX_WIDTH_AVIF
					? img.clone().resize({ width: MAX_WIDTH_AVIF })
					: img.clone()
				).avif({ force: true, quality: 50, effort: 9 },
				).toFile(`${absPaths.output}/images/${filename}.avif`);

				width = metadata.width;
				height = metadata.height;


				// - Calculate and log file size
				const [filesize, filesizeAVIF, filesizeWEBP] = (await Promise.all([
					fs.promises.stat(`${absPaths.images}/${url}`),
					fs.promises.stat(`${absPaths.output}/images/${filename}.avif`),
					fs.promises.stat(`${absPaths.output}/images/min.${filename}.webp`),
				])).map((f) => (f.size / 1024 > 99.99 ? `${(f.size / 1024 / 1024).toFixed(2)} mB` : `${(f.size / 1024).toFixed(2)} kB`).padStart(8, " "));

				log(`${colors.pink("📸 Compressed!")} original: ${colors.blue(filesize)} -> avif: ${colors.blue(filesizeAVIF)}, webp: ${colors.blue(filesizeWEBP)} - ${colors.pink(url)}`);
			}
			else {
				const dimensions = await imageSizeFromFile(absPaths.images + "/" + url);
				width = dimensions.width;
				height = dimensions.height;
				// log(`${colors.pink("🖼️  11ty-plugin-image.js")}: File ${colors.blue(url)} is already compressed!`);
			}

				return (`
<figure class="progressive-image" aria-label="${options.alt}" class="${options.classes.join(" ")}">
	<img class="min ${options.classes.join(" ")}" aria-hidden="true"
		src="images/min.${filename}.webp" 
		width="${width}" height="${height}" ${options.priority} alt="${options.alt}"
	> 
	<img class="full ${options.classes.join(" ")}"
		data-src="images/${filename}.avif" src="data:image/webp;base64,UklGRlIAAABXRUJQVlA4IC4AAAAwAQCdASoIAAgAAkA4JaQAA3AA/vuUAAA="
		width="${width}" height="${height}" ${options.priority} alt="${options.alt}"
	>
</figure>
			`);
		}

		eleventyConfig.addShortcode("image", shortcode);
	};
}

function imgElement (url, classes, options) {
	const { width, height, alt, priority } = options;
	return `
	<img src="${url}" 
		${width ? `width="${width}"` : ``}
		${height ? `height="${height}"` : ``}
		alt="${alt}" 
		${priority}
		class="${classes.join(` `)}"
	>`.replaceAll("\n", "");
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
