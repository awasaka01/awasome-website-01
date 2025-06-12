// [https://www.npmjs.com/package/chokidar] [https://www.npmjs.com/package/scss-parser]


// import { minify } from "html-minifier-terser";
// import UglifyJS from "uglify-js";
// import { hex } from "ansis";
// import JSONminify from "jsonminify";
// import Image, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import eleventySass from "@11tyrocks/eleventy-plugin-sass-lightningcss";


// A named config export, instead of returning inside the eleventyConfig function
// because it's "preferred for order-of-operations reasons" https://www.11ty.dev/docs/config-shapes/#optional-return-object
export const config = {
	dir: {
		input: "src",
		output: "__dist",
		includes: "_modules/_includes",
		// data: "_data",
		// layouts: "_layouts",
	},
};


/** [Intellisense Support] @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {

	eleventyConfig.addPassthroughCopy("src/assets");
	eleventyConfig.addPassthroughCopy("src/**/*.{js,ts,jsx,tsx,scss,sass}");
	// eleventyConfig.addPassthroughCopy("src/**/*.!(html)");
	eleventyConfig.setTemplateFormats(["html"]);
	eleventyConfig.ignores.add("**/_*");


	// eleventyConfig.addPlugin(eleventySass);
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		tempFolderName: "__temp", // Temporary folder while building

		// Options passed to the Eleventy Dev Server [https://www.11ty.dev/docs/dev-server/#options]
		serverOptions: {
			port: 8080,
			htmlTemplateEngine: "liquid", // Default formatter for template languages
			// watch: ["./__dist/**/*.css"],
			showVersion: true, domDiff: false, liveReload: true,
		},

		// Options passed to Vite [https://vite.dev/config/shared-options/]
		viteOptions: {
			clearScreen: false,
			appType: "mpa",
			publicDir: "public",

			// [https://vite.dev/config/server-options]
			server: {
				middlewareMode: true,
			},
			css: { transformer: "lightningcss" },
			// [https://vite.dev/config/build-options]
			build: {
				emptyOutDir: true,
			},
		},
	});

}
