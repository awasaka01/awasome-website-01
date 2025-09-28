// engine/11ty-preprocessors.js
// @ts-nocheck

// ──────────────────────────────────────────────────────────────────────────────────────────────────
//  Transform content *before* templates are compiled 
// ──────────────────────────────────────────────────────────────────────────────────────────────────

/* ~~~~~ Imports ~~~~~ */
// - my config:
import * as config from "./config.js";
const { log, err, colors, paths, absPaths } = config;
// ✧ process.env is modified by the build script, so correct the types:
const env = /** @type {NodeJS.ProcessEnv & import('./config.js').env_type} */ (process.env);



/** @type {Record<string, (data: import("11ty.ts").EleventyScope["eleventy"], content: string) => string>} */
const transforms = {
	"html": (data, content) => {
		// Arbitrary replace functions using regexes in frontmatter .replace object
		if (data.replace) {

			for (const [str, replace] of Object.entries(data.replace)) {
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


/**
 * Eleventy plugin that applies custom transforms based on file extension.
 * @param {import("11ty.ts").EleventyConfig} eleventyConfig
 */
export default function Plugin (eleventyConfig) {
	eleventyConfig.addPreprocessor("custom-preprocessors", Object.keys(transforms), async (data, content) => {
		const transform = transforms[data.page.outputFileExtension];
		if (!transform) return content;
		const transformed = transform(data, content);
		if (content !== transformed) log(`🔧 ${colors.pink("11ty-preprocessors.js")}: Transformed ${colors.blue(data.page.inputPath)}`);
		return transformed;
	});
}
