import jsdom from "jsdom"; // Virtual DOM, for easier preprocessing
import chalk from "chalk";
import { get } from "http";

export default function (eleventyConfig) {

const symbols = {
	"color": /𝓒(\\d):(.*?)◺/g,
	"fill": /𝓕(.*?)◺/g,
	"newblock": "<!-- NEW BLOCK -->",
};

const regex = new RegExp(`${symbols.fill.source}|𝓒\\d:|◺|<[^>]*>|𝓔(.*?)◺`, "g");
const strip = (content) => content.replace(regex, "").trim();



	eleventyConfig.addPreprocessor("uwu", "html", (data, content) => {
		if (!data.uwu) return content;

// let blocks = content.split(symbols.newblock);
// 	blocks = blocks.map((block, i) => {
// 		let lines = block.split("\n");

// 		// Calculate length of every line
// 		let longest = 0;
// 		lines = lines.map((line) => {
// 			const length = strip(line).length;
// 			if (length > longest) longest = length;
// 			return [line, length];
// 		});

// 		lines = lines.map(([raw, len]) => {
// 			const fillTokens = [...raw.matchAll(symbols.fill)];
// 			if (fillTokens.length) {
// 				const diff = longest - len;
// 				const base = Math.floor(diff / fillTokens.length);
// 				let remainder = diff % fillTokens.length;

// 				let result = "";
// 				let cursor = 0;
// 				fillTokens.forEach((match, i) => {
// 					const [full, text] = match;
// 					const idx = raw.indexOf(full, cursor);
// 					// copy before token
// 					result += raw.slice(cursor, idx);
// 					// calculate number of repetitions
// 					let count = base + (remainder > 0 ? 1 : 0);
// 					if (remainder > 0) remainder--;
// 					// append repeated pattern
// 					result += text.repeat(count);
// 					// move cursor forward
// 					cursor = idx + full.length;
// 				});
// 				// tail after last token
// 				result += raw.slice(cursor);
// 				raw = result;
// 			}
// 			return raw;
// 		});

// 		return lines.join("\n");
// 	});
// 	content = blocks.join("").replaceAll(/𝓔(.*?)◺/g, "$1");

	if (data.replace) {
		for (const [match, replace] of Object.entries(data.replace)) {
			content = content.replaceAll(match, replace);
		}
	}
	// content = content.replaceAll("𝓕", `<span class="fillspace"></span>`);

	const colorMatches = [...content.matchAll(/𝓒(\d):(.*?)◺/g)];
	if (colorMatches.length) {
		let result = "";
		let cursor = 0;

		colorMatches.forEach((match) => {
			const [full, colorNum, text] = match;
			const idx = content.indexOf(full, cursor);

			// copy everything before match
			result += content.slice(cursor, idx);

			// wrap colored text
			result += `<span class="boxdraw-color-${colorNum}">${text}</span>`;

			// move cursor
			cursor = idx + full.length;
		});

		// copy remainder
		result += content.slice(cursor);
		content = result;
	}


	return content;
	});


}
