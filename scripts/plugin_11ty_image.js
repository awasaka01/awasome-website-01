// LINK: (progressive_image_loading.ts)[../src/awa-util/progressive_image_loading.ts]

import { Image } from "@11ty/eleventy-img";
import * as config from "../config.js";
import path from "path";

/**
 * @typedef {Object} PluginOptions
 * @property {(content: string, data: import("11ty.ts").EleventyScope["eleventy"]) => string} [postprocess] - Function to postprocess the compiled CSS however you want.
 * @property {import("sass-embedded").StringOptions} [sassOptions] - Options to be passed to `sass.compileString`.
 */
/**
 * Eleventy Sass plugin - Handles compiling SCSS to CSS, and optionally postprocessing
 * Sourcemaps are included in a base64 encoded data URI (when sassOptions.sourceMap: true)
 * @param {PluginOptions} options
 * @returns {(eleventyConfig: import("11ty.ts").EleventyConfig) => void}
 */
export default function (options) {
	return function (eleventyConfig) {

		/**
		 * @typedef {Object} ImageOptions
		 * @property {string} [alt] - Alt text for the image
		 * @property {string} [className] - CSS class
		 * @property {"high"|"low"|"auto"} [priority] - Loading priority
		 */
		/**
		 * Render an image shortcode
		 * @param {string} url - Image URL
		 * @param {Partial<ImageOptions>} [options={}] - Optional settings
		 * @returns {string} Rendered img tag
		 */
		function shortcode (url, options) {


			options = { alt: "", className: "", priority: "auto", ...options };

			// Option validation
			const err = (msg) => config.err(`plugin_11ty_image: ${msg}\n       ${config.colors.grey(`at ${this.page.inputPath}`)}`);
			if (!(["high", "low", "auto"].includes(options.priority))) throw err(`Priority must be high|auto|low, got '${options.priority}'`);


			// Normalize the url, ensures all urls start with /images/
			url = url.replace("images/", "");
			try { url = new URL(url).toString(); }
			catch { url = path.posix.join("/", url.replace(/^\/+/, "").replace(/\/+$/, "")); }
			url = `/images${url}`;


			// Copy raw images that don't need to be minified, or all in dev mode
			const imgpath = `${config.paths.source}/${config.directories.images}`;
			const passthroughs = {};
			passthroughs[`${imgpath}/raw/**/*`] = `${config.directories.images}/raw/`;
			eleventyConfig.addPassthroughCopy(passthroughs);
			if (!config.env.FULLBUILD) eleventyConfig.addPassthroughCopy(`${imgpath}/**/*`);


			// Ignore images desired to stay raw, or all in dev mode
			if (!config.env.FULLBUILD || url.startsWith(`/${config.directories.images}/raw`)) return imgElement(url, options.alt, options.className, options.priority);

			//

			return url;
		}

		eleventyConfig.addShortcode("image", shortcode);
	};
}
function imgElement (url, alt, className, priority) {
	return `<img src="${url}" alt="${alt}" class="progressive-image ${className}" fetchpriority="${priority}">`;
}

function createMinAnd (path) {}
