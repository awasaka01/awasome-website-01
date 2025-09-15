import { log, colors } from "./config.js";

/**
 * Map of file extensions to transform functions.
 * Each function receives the file content and Eleventy page data, and must return the transformed content.
 * @type {Record<string, (data: import("11ty.ts").EleventyScope["eleventy"], content: string) => string>}
 */
const transforms = {
	"html": (data, content) => {
		// Arbitrary replace functions using regexes in frontmatter .replace object
		if (data.replace) {
			for (const [str, replace] of Object.entries(data.replace)) {
				const lastSlashIndex = str.lastIndexOf("/");
				const regex = new RegExp(str.slice(1, lastSlashIndex), str.slice(lastSlashIndex + 1));
				content = content.replaceAll(regex, replace);
			}
		}

		// Color replacer 𝓒1:┃◺ - more complex than standard replacing so it's seperate
		const colorMatches = data.colorMatches ? [...content.matchAll(/𝓒(\d):(.*?)◺/g)] : [];
		if (colorMatches.length) {
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
		return content;
	},
};


/**
 * Returns an Eleventy plugin that applies custom transforms based on file extension.
 * @returns {(eleventyConfig: import("11ty.ts").EleventyConfig) => void}
 */
export default () => { return function Plugin (eleventyConfig) {
	eleventyConfig.addPreprocessor("customTransforms", Object.keys(transforms), async (data, content) => {
		const transform = transforms[data.page.outputFileExtension];
		if (!transform) return content;
		const transformed = transform(content);
		if (content !== transformed) log(`🔧 ${colors.pink("11ty-custom-transforms.js")}: Transformed ${colors.blue(data.page.inputPath)}`);
	});
}; };
