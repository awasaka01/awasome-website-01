// [https://www.npmjs.com/package/chokidar] [https://www.npmjs.com/package/scss-parser]

// import { minify } from "html-minifier-terser";
// import UglifyJS from "uglify-js";
// import { hex } from "ansis";
// import JSONminify from "jsonminify";
// import Image, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";

import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";

// [https://github.com/5t3ph/eleventy-plugin-sass-lightningcss]
import eleventySass from "@jgarber/eleventy-plugin-sass";
import path from "path";

// A named config export, instead of returning inside the eleventyConfig function
// because it's "preferred for order-of-operations reasons" https://www.11ty.dev/docs/config-shapes/#optional-return-object
export const config = {
	dir: {
		input: "src",
		output: "__dev", // the npm build command overrides this to '__dist'
		includes: "modules/_includes",
		// data: "_data",
		layouts: "modules/_layouts",
	},
};

/** [Intellisense Support] @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {

	// Copy most files straight through for Vite to process
	eleventyConfig.addPassthroughCopy("src/assets");
	eleventyConfig.addPassthroughCopy("src/**/*.{js,ts,jsx,tsx,css}"); // src/**/*.!(html)"

	// Files to process with 11ty as templates [https://www.11ty.dev/docs/#step-4-create-some-templates]
	eleventyConfig.setTemplateFormats(["html, md", "liquid", "njk", "11ty.js", "11ty.ts", "11ty.jsx", "11ty.tsx"]);



	// Compile SCSS with an 11ty plugin, Vite can do it but this provides easier debugging
	eleventyConfig.addPlugin(eleventySass, {
		sassOptions: {
			sourceMap: true,
			loadPaths: ["./src/modules/_styles"], // Directories to search for when using @use/@forward in SCSS, allowing you to just say the file name
		},
	});
	// return; // just for debugging



	// Add Vite as middleware for handling of; minification, react, typescript, etc. [https://www.11ty.dev/docs/plugins/#eleventy-plugin-vite]
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		tempFolderName: "__temp",


		// Options passed to the Eleventy Dev Server [https://www.11ty.dev/docs/dev-server/#options]
		serverOptions: {
			port: 3333,
			liveReload: true,
			showVersion: true,

			htmlTemplateEngine: "liquid", // Default langauge to format .HTML files in (liquid, njk, etc.)
			domDiff: false, // Set to false while updating colors.scss and colorpreview
			watch: [], // Additional directories to watch and cause a reload when changed
		},


		// Options passed to Vite [https://vite.dev/config/shared-options]
		viteOptions: {
			clearScreen: false, // Don't clear the terminal
			appType: "mpa", // 'Multi-Page-App'
			transformer: "lightningcss",
			lightningcss: { targets: browserslistToTargets(browserslist("partially supports css-grid"))	},


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
