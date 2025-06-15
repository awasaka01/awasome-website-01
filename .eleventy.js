// [https://www.npmjs.com/package/chokidar] [https://www.npmjs.com/package/scss-parser] [https://github.com/5t3ph/eleventy-plugin-sass-lightningcss]

// import { minify } from "html-minifier-terser";
// import UglifyJS from "uglify-js";
// import { hex } from "ansis";
// import JSONminify from "jsonminify";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import markdownIt from "markdown-it";
import path from "path";
import { compile } from "sass";


// 11ty Plugins
import Image, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import eleventySass from "@jgarber/eleventy-plugin-sass";
import dirOutputPlugin from "@11ty/eleventy-plugin-directory-output";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";


// Vite + Vite Plugins
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

const directoriesToMove = {
	"/pages": "/",
};


// A named config export, instead of returning inside the eleventyConfig function
// because it's "preferred for order-of-operations reasons" https://www.11ty.dev/docs/config-shapes/#optional-return-object
export const config = {
	dir: {
		input: "src",
		output: "__dist",
		includes: "modules/_includes",
		data: "modules/_data",
		layouts: "modules/_layouts",
	},
};


// Main configuration functions
/** [Intellisense Support] @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Copy most files straight through for Vite to process
	eleventyConfig.addPassthroughCopy("src/assets");
	// eleventyConfig.addPassthroughCopy("src/**/*.{js,ts,jsx,tsx}"); // src/**/*.!(html)"

	// Files to process with 11ty as templates [https://www.11ty.dev/docs/#step-4-create-some-templates]
	eleventyConfig.addTemplateFormats("html,liquid,css,scss,njk,11ty.js,11ty.ts,11ty.jsx,11ty.tsx,js");

	// eleventyConfig.addPassthroughCopy({ "src/pages/": "/" });

	// Compile SCSS with an 11ty plugin, Vite can do it but this provides easier debugging

	// eleventyConfig.addPlugin(syntaxHighlight);
	// eleventyConfig.addPlugin(dirOutputPlugin);
	// eleventyConfig.addPlugin(eleventyImageTransformPlugin, { formats: ["webp"] });

	function makeExt (fileExtensions = [], { options = {}, compileFn = (x) => () => x, compileOptions = {} }) {
		fileExtensions.forEach((fileExtension) => {
			eleventyConfig.addExtension(fileExtension, {
				...options, outputFileExtension: fileExtension,
				compile: compileFn,
				compileOptions: {
					permalink: function (contents, inputPath) {
						return (data) => {
							// console.log(fileExtension, data.page.outputFileExtension);

							// if (fileExtension !== data.page.outputFileExtension) return false;

							// console.log(data.page);
							const folder = data.page.filePathStem.split("/").slice(0, -2).join("/");
							const move = directoriesToMove[folder];
							const t = `${move}/${data.page.filePathStem.replace(folder, "")}.${fileExtension}`;
							// console.log(inputPath, folder, move, t);
							if (move) return t;
						};
					},
					...compileOptions,
				},
			});
		});
	}
	makeExt(["js", "jsx", "html"], { });
	makeExt(["scss"], { });

	// eleventyConfig.addExtension("js", {
	// 	outputExtension: "js",
	// 	compileOptions: {
	// 		permalink: function (contents, inputPath) {
	// 			return (data) => {

	// 			const folder = data.page.filePathStem.split("/").slice(0, -2).join("/");
	// 			const move = directoriesToMove[folder];
	// 			const t = `${move}/${data.page.filePathStem.replace(folder, "")}.js`;
	// 			console.log(inputPath, folder, move, t);
	// 			if (move) return t;
	// 		};
	// 		},
	// 	},
	// 	compile: (inputContent, inputPath) => {
	// 		return (a, b, c) => inputContent;
	// 	},
	// });


	// if (process.argv.includes("--novite")) return;
	return;
	// Add Vite as middleware for handling of; minification, react, typescript, etc. [https://www.11ty.dev/docs/plugins/#eleventy-plugin-vite]
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		// tempFolderName: `__temp-${Math.random().toString(36).slice(2)}`, // seems to help with EPERM: operation not permitted, rename?
		tempFolderName: "__temp",

		// Options passed to the Eleventy Dev Server [https://www.11ty.dev/docs/dev-server/#options]
		serverOptions: {
			port: 3333,
			liveReload: true,
			showVersion: true,

			htmlTemplateEngine: "liquid", // Default langauge to format .HTML files in (liquid, njk, etc.)
			domDiff: true, // Set to false while updating colors.scss and colorpreview
			watch: [], // Additional directories to watch and cause a reload when changed
		},

		// Options passed to Vite [https://vite.dev/config/shared-options]
		viteOptions: {
			clearScreen: false, // Don't clear the terminal
			appType: "mpa", // 'Multi-Page-App'
			transformer: "lightningcss",
			lightningcss: { targets: browserslistToTargets(browserslist("partially supports css-grid")) },

			// Plguins
			// plugins: [
			// 	ViteImageOptimizer({
			// 		test: /\.(webp|avif)$/i,
			// 		webp: { lossless: false },
			// 		avif: { lossless: false },
			// 	}),
			// ],

			// Options passed to Vite during development server [https://vite.dev/config/server-options]
			server: {
				middlewareMode: true, // Required since we are running Vite inside 11ty
			},

			// Options passed to Vite during build [https://vite.dev/config/build-options]
			build: {
				emptyOutDir: true,
				cssMinify: "lightningcss",

				// Prevent JS imports from being bundled into the JS file itself, use links instead,
				// I think mildly worse performance but significantly smaller file size on the host server, + slightly faster build times
				rollupOptions: { external: (id) => [".js", ".ts", ".cjs", ".mjs"].some((ext) => id.endsWith(ext)) },
			},
		},
	});
}
// eleventyConfig.ignores.add("**/_*");



const data = {
  eleventy: {
    version: "3.1.0",
    generator: "Eleventy v3.1.0",
    env: {
      source: "cli",
      runMode: "build",
      config: "C:/Users/awa/Documents/coding/awasomewebsite/.eleventy.js",
      root: "C:/Users/awa/Documents/coding/awasomewebsite",
    },
    directories: {
      input: "./src/",
      inputFile: undefined,
      inputGlob: undefined,
      data: "./src/_data/",
      includes: "./src/modules/_includes/",
      layouts: "./src/modules/_layouts/",
      output: "./__dist/",
    },
  },
  pkg: {
    name: "awasomewebsite",
    description: "false",
    version: "1.0.0",
    license: "https://docs.npmjs.com/cli/v11/configuring-npm/package-json#license",
    keywords: [],
    main: "index.js",
    type: "module",
    homepage: "https://github.com/awasaka01/awasome-website-01#readme",
    repository: {
      type: "git",
      url: "git+https://github.com/awasaka01/awasome-website-01.git",
    },
    scripts: {
      start: "eleventy --serve --quiet",
      build: "set DEBUG=Eleventy:Benchmark* && eleventy --output=__dist && node scripts/print-dist-tree.js",
      findrules: "stylelint-find-new-rules",
      fontconvert: "node scripts/font-converter/index.js",
    },
    dependencies: {
		"...": 0,
    },
    devDependencies: { sass: "^1.89.0" },
  },
  // permalink: [Function: permalink],
  title: "Awesome!!",
  // date: 2022-01-01T00:00:00.000Z,
  page: {
    inputPath: "./src/pages/blog/firstpost.md",
    fileSlug: "firstpost",
    filePathStem: "/pages/blog/firstpost",
    outputFileExtension: "html",
    templateSyntax: "liquid,md",
    // date: 2022-01-01T00:00:00.000Z,
    rawInput: "\r\n### ewew\r\n",
  },
  collections: {},
};
