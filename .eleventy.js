
// [https://www.npmjs.com/package/chokidar] [https://www.npmjs.com/package/scss-parser]
import chokidar from "chokidar"; // Because fs is bad
import { parse, stringify } from "scss-parser";
import { readFileSync, writeFileSync } from "node:fs";
import createQueryWrapper from "query-ast";
import chroma from "chroma-js";
import lightningSass from "@11tyrocks/eleventy-plugin-sass-lightningcss";


export default function (eleventyConfig) {


eleventyConfig.on("eleventy.before", async ({ directories, runMode, outputMode }) => {
	console.log(`Running in ${runMode} mode, outputting to ${outputMode}`);

	// Recompile colors once on build, just to be sure
	if (runMode === "build") { await updateColors(); }

	// When live-testing, watch the colors file for any changes and recompile
	else if (runMode === "serve" || runMode === "watch") {


		let debounce = false;
		chokidar.watch("src/helpers/_colors.json").on("change", (event, path) => {
			if (debounce) return;
			debounce = true;
			setTimeout(() => { debounce = false; }, 100);
			updateColors();
		});
	}
});


eleventyConfig.addPassthroughCopy("src/**/!(_)*.{js,json,txt}");
eleventyConfig.addPassthroughCopy("src/media/**");
eleventyConfig.setQuietMode(true);
eleventyConfig.addPlugin(lightningSass);



// eleventyConfig.addTemplateFormats("scss");
// 	eleventyConfig.addExtension("scss", {
// 		compile: async (inputContent) => {
// 			// Replace any instances of cloud with butt
// 			let output = inputContent;
// 			console.log(inputContent);


// 			return (data) => output;
// 		},
// 	});
// [https://github.com/5t3ph/eleventy-plugin-sass-lightningcss?tab=readme-ov-file#usage]
// [https://www.11ty.dev/docs/config-preprocessors/]


//   eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
// 		console.log(data.page);
// 		if (data.page.fileSlug === "_colors") return "  ";
// 	});

// Runs every time before building

// eleventyConfig.on("eleventy.before", async ({ directories, runMode, outputMode }) => {

// 	// Get all files

// 	// Filter for only .scss files
// 	console.log(Object.entries(directories).forEach(([key, dir]) => console.log(`${key}: ${dir}`)));
// 	console.log(`runMode: ${runMode}    outputMode: ${outputMode}`);
// });

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
eleventyConfig.setServerOptions({
	// Default values are shown:

  htmlTemplateEngine: "njk",
	// Whether the live reload snippet is used
	liveReload: true,

	// Whether DOM diffing updates are applied where possible instead of page reloads
	domDiff: false,

	// The starting port number
	// Will increment up to (configurable) 10 times if a port is already in use.
	port: 8080,

	// Additional files to watch that will trigger server updates
	// Accepts an Array of file paths or globs (passed to `chokidar.watch`).
	// Works great with a separate bundler writing files to your output folder.
	// e.g. `watch: ["_site/**/*.css"]`
	watch: ["./__dist/**/*.css"],

	// Show the dev server version number on the command line
	showVersion: false,

	// Added in Dev Server 2.0+
	// An object mapping a URLPattern pathname to a callback function
	// for on-request processing (read more below).
	onRequest: {},
});


async function updateColors () {


	// Get the raw contents of the scss file, then parse it into json
	const fileRaw = readFileSync("src/helpers/_colors.scss", "utf-8");
	const data = parse(fileRaw);


	// Extract the variable name and hex values from the "auto" variables
	const $ = createQueryWrapper(data);
	const bases = $((n) =>
		n.node.type === "declaration"
		&& n.node.value[0].value[0].type === "variable"
		&& n.node.value[0].value[0].value.startsWith("-auto_"),
	).map((n) => { return {
		name: n.node.value[0].value[0].value.substr(6),
		hex: n.node.value[2].value[1].value,
	}; });


	// Configurable ways to expand each base color
	const expandedTypes = [
		// Darken:    (i is inverted; only for a visually better order in the file)
		{ amount: 15, id: (i) => `d${(16 - i).toString(16)}`, f: (i, hex) => colorAdjust(-(16 - i), hex) },
		// Base without auto tag:
		{ amount: 1, id: (i) => "", f: (i, hex) => "  #" + hex },
		// Lighten:
		{ amount: 15, id: (i) => `l${i.toString(16)}`, f: (i, hex) => colorAdjust(i, hex) },
	];
	function colorAdjust (iteration, color) {
		let [l, c, h] = chroma(color).oklch().map((x) => x || 0);

		l += iteration * 0.025;
		c += iteration * 0.003;
		h += iteration * 0.4;

		return chroma.oklch(l, c, h).hex();
	}


	// Generate the expanded colors
	let output = "\n\n";
	bases.forEach((base) => {

		// Generate all the expanded colors for the current base, in scss variable form
		const vars = [];
		expandedTypes.forEach((e) => {
			for (let i = 1; i <= e.amount; i++) {
				vars.push(`$${base.name}${e.id(i)}: ${e.f(i, base.hex)};`);
		} });

		// Merge all expanded variables for the current base into lines
		output += `// Expanded colors for ${base.name}:\n${vars.join("\n")}\n\n`;
	});

	// Update the scss file, replacing all after the identifier 617761
	writeFileSync("src/helpers/_colors.scss", fileRaw.replace(/(?<=REPLACE_AFTER_THIS_LINE \*\/).+/s, output));
}


return {
		dir: {
			input: "src",
			data: "_data",
			includes: "_includes",
			layouts: "_layouts",
			output: "__dist",
		},
	};
}
// eleventyConfig.addPlugin(feedPlugin, {
// 	type: "atom", // or "rss", "json"
// 	outputPath: "/feed.xml",
// 	collection: {
// 		name: "posts", // iterate over `collections.posts`
// 		limit: 10, // 0 means no limit
// 	},
// 	metadata: {
// 		language: "en",
// 		title: "Blog Title",
// 		subtitle: "This is a longer description about your blog.",
// 		base: "https://example.com/",
// 		author: {
// 			name: "Your Name",
// 			email: "", // Optional
// 		},
// 	},
// });
