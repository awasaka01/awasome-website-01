// !
// ! Every time this file is saved it will run again, also starting another chokidar watcher,
// ! Please CTRL+SHIFT+C kill the terminal each time you save this file
// !

// [https://www.npmjs.com/package/chokidar] [https://www.npmjs.com/package/scss-parser]


// Color generator imports
import lightningSass from "@11tyrocks/eleventy-plugin-sass-lightningcss";
import { minify } from "html-minifier-terser";
import UglifyJS from "uglify-js";
import { hex } from "ansis";
import JSONminify from "jsonminify";
import Image, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import generateSCSScolors from "./scripts/scssPaletteGenerator.js";



// A named config export, instead of returning inside the eleventyConfig function
// because it's "preferred for order-of-operations reasons" https://www.11ty.dev/docs/config-shapes/#optional-return-object
export const config = {
	dir: {
		input: "src",
		output: "__dist",
		data: "_data",
		includes: "_includes",
		layouts: "_layouts",
	},
};



// ANCHOR: Redrunner Two
// > -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/** [Intellisense Support] @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
	const startBuildTime = Date.now();
	eleventyConfig.addPlugin(lightningSass); // Sass compiler, minifier, and backwards-compatibility-ier
	eleventyConfig.setQuietMode(true);
	eleventyConfig.setServerOptions({
		port: 8080,
		htmlTemplateEngine: "njk", // Allows writing njk in .html files (i think)
		// watch: ["./__dist/**/*.css"],
		showVersion: false, domDiff: false, liveReload: true,
	});

	// https://www.11ty.dev/docs/plugins/image/
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, { formats: ["avif", "webp"] });

	// Directly copy files from src/ to __dist/ with no changes
	eleventyConfig.addPassthroughCopy("src/assets/");
	eleventyConfig.addPassthroughCopy("src/**/!(_)*.{txt,xml}");




	// To add a new formatter; create a function that formats inputted text, add it to the object below along with the filetype
	// If not already in setTemplateFormats, add your file extension there too

	eleventyConfig.setTemplateFormats(["html", "njk", "txt", "js", "css", "xml", "json"/* , "png"*/]);

	const formatters = { "js": minifyJS, "json": minifyJSON/* , "png": compressImage*/ };


	// Register addExtension for each file type specified, that runs the listed function on each file and logs how long it took
	Object.entries(formatters).forEach(([ext, fn]) => { eleventyConfig.addExtension(ext, {
		outputFileExtension: ext,
		compile: (content, inputPath) => (() => runFuncAndTime(fn, content, inputPath)),
	}); });

	// HTML Will work with addExtension, but https://www.11ty.dev/docs/languages/custom/ reccomends using addTransform for whatever reason >:/
	eleventyConfig.addTransform("minify-html", function (content) {
		if (this.page.outputFileExtension !== "html") { return content; }
		return runFuncAndTime(minifyHTML, content, this.page.inputPath);
	});


	// Runs given formatter function, returns the output, and logs how long it took
	async function runFuncAndTime (fn, content, inputPath) {

		// Only minify when in build mode, or if --forcemin is set
		if (process.env.RUN_MODE !== "build" && !process.argv.includes("--forcemin")) { return content; }

		const start = Date.now();
		const output = await fn(content, inputPath);

		console.log(
			hex("#8478ff")`[ ${(Date.now() - start).toString().padStart(4, " ")}ms ] ${hex("#16194bff")`-`} ${
			hex("#e197ff")`Formatted: /__dist${inputPath.slice(5)}`}`);
		return output;
	}




	// Automatically watch autocolors.json and generate autocolors.scss on change
	eleventyConfig.on("eleventy.before", async ({ directories, runMode }) => {

		if (process.env.RUN_MODE !== undefined) return;
		process.env.RUN_MODE = runMode;

		if (runMode === "build") { await generateSCSScolors();	}
	});



	// Print build time
	eleventyConfig.on("eleventy.after", async ({ directories, results, runMode, outputMode }) => {
		if (runMode !== "build") return;
		console.log(hex("#c5ff3d")`\n           ☆  Built in ${((Date.now() - startBuildTime) / 1000)}s?\n`);
	});
}








//
// ANCHOR: File formatter functions
//
async function compressImage (input, inputPath) {
	const stats = await Image(inputPath);
	console.log(stats);

}
function minifyJSON (input) { return JSONminify(input); }
function minifyJS (input) { return UglifyJS.minify(input, { toplevel: true }).code; }
function minifyHTML (input) {
	return minify(input, { // https://www.npmjs.com/package/html-minifier#options-quick-reference <!-- htmlmin:ignore -->?
		removeScriptTypeAttributes: true,
		collapseBooleanAttributes: true,
		removeRedundantAttributes: true,
		conservativeCollapse: true,
		removeTagWhitespace: true,
		collapseWhitespace: true,
		removeOptionalTags: true,
		useShortDoctype: true,
		removeComments: true,
		minifyURLs: true,
		minifyCSS: true,
		minifyJS: true,
	});
}







//
// ANCHOR: autocolors updater
//

// Settings







