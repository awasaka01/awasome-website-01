// ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

// |▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// |  Imports, globals, and minor setup:
// |_____________________________________________________________________________________________________________

// ✧ node modules
import type Eleventy from "11ty.ts";
import hljs from "highlight.js/lib/core";

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



export default function () {
	return function EleventyPlguin (eleventyConfig : Eleventy.EleventyConfig) {
		eleventyConfig.addPairedShortcode("codeBlock", (content : string) => {
			const result = hljs.highlight(content, { language: "xml", ignoreIllegals: true });
			console.log(result);
			return "<p>hi</p>";
		});
	};
}
