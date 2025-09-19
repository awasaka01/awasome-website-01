// @ts-nocheck
// ──────────────────────────────────────────────────────────────────────────────────────────────────
//
//    Transform content *after* templates are compiled 
//    (data does not contain the frontmater here, use a preprocessor if you need frontmatter!!)
//
// ──────────────────────────────────────────────────────────────────────────────────────────────────

// - my config
import * as config from "./config.js";
const { log, err, colors, paths, absPaths } = config;
const { blue: b, pink: p, white: w } = colors;
const env = process.env as import("./config.js").env_type & NodeJS.ProcessEnv;



/** @type {Record<string, (data: import("11ty.ts").EleventyScope["eleventy"], content: string) => string>} */
const transforms = {
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


/**
 * Eleventy plugin that applies custom transforms based on file extension.
 * @param {import("11ty.ts").EleventyConfig} eleventyConfig
 */
export default function Plugin (eleventyConfig) {
	eleventyConfig.addTransform("custom-postprocessors", async function (content) {

		const data = this;

		const fn = transforms[data.page.outputFileExtension];
		if (!fn) return content;

		const transformed = await fn(data, content);
		if (content !== transformed) log(`🔧 ${colors.pink("11ty-postprocessors.js")}: Transformed ${colors.blue(data.page.inputPath)}`);
		return transformed;
	});
}
