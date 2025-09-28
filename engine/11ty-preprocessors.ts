
// ──────────────────────────────────────────────────────────────────────────────────────────────────
//
//    Transform content *before* templates are compiled 
//
// ──────────────────────────────────────────────────────────────────────────────────────────────────

// - my config
import * as util from "__util__";
import * as config from "./config.js";
const { log, err, colors, paths, absPaths } = config;
const { blue: b, pink: p, white: w } = colors;
const env = process.env as import("./config.js").env_type & NodeJS.ProcessEnv;



import TS11TY from "11ty.ts";


const transforms : Record<string, (data : TS11TY.EleventyScope & Record<string, any>, content : string) => string> = {
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


export default function Plugin (eleventyConfig) {
	eleventyConfig.addPreprocessor("custom-preprocessors", Object.keys(transforms), async (data, content) => {
		const transform = transforms[data.page.outputFileExtension];
		if (!transform) return content;
		const transformed = transform(data, content);
		if (content !== transformed) log(`🔧 ${colors.pink("11ty-preprocessors.js")}: Transformed ${colors.blue(data.page.inputPath)}`);
		return transformed;
	});
}
