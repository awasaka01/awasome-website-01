// engine/.eleventy.js
// @ts-nocheck

/* ~~~~~ Imports ~~~~~ */
// - my config:
import * as config from "./config.js";
const { log, err, colors, paths, absPaths } = config;
// ✧ process.env is modified by the build script, so correct the types:
const env = /** @type {NodeJS.ProcessEnv & import('./config.js').env_type} */ (process.env);

// - Miscellaneous:


// - Build requirements:
import esbuild from "esbuild";
import browserslist_esbuild from "browserslist-to-esbuild";
const supported_browsers_esbuild = browserslist_esbuild(config.supported_browsers); // convert browserslist to esbuild format

// - 11ty / Eleventy:
import ImagePlugin_11ty from "./11ty-plugin-image.js";
import SassPlugin_11ty from "./11ty-plugin-sass.js";
import preprocessors_11ty from "./11ty-preprocessors.js";
import postprocessors_11ty from "./11ty-postprocessors.js";
import { VentoPlugin } from "eleventy-plugin-vento";



/* ~~~~~ Main Config ~~~~~ */ // [https://www.11ty.dev/docs/config/]
// 1. Eleventy Config object:
const eleventy_config = {
    dir: { input: paths.source, includes: paths.includes, output: paths.output },
    htmlTemplateEngine: "vto",
	pathPrefix: "/",
}; export { eleventy_config as config }; // < to avoid name conflict


// 2. Eleventy Config function, defined using 11ty.ts for type support:
import { defineConfig } from "11ty.ts";
export default defineConfig((eleventyConfig) => {

	// - Ignore files
	// eleventyConfig.ignores.add(`${config.paths.source}/_*{*/_*,*}`); // Ignore files and directories that start with an underscore  (glob to match _'s instead: !(_)*{*/!(_)*,*})
	// eleventyConfig.ignores.add("**/critical.js");
	// eleventyConfig.ignores.add(`**/*.{js,ts,tsx,jsx}`);

	// - Watch for changes to files that this config file depends on [https://www.11ty.dev/docs/watch-serve/#reset-configuration] 
	// eleventyConfig.addWatchTarget("./**", { resetConfig: true });

	// - 
	eleventyConfig.setTemplateFormats(["html", "vto"]);
	// eleventyConfig.setDataFileSuffixes([".11ty", ".11tydata"]);
	// eleventyConfig.setUseGitIgnore(false);
	// eleventyConfig.addPassthroughCopy("**/*.mp3");

	// ~~~~~ Plugins ~~~~~
	// | images: Compress images
	// | preprocessors: Transform content before templates are compiled
	// | postprocessors: Transform content after templates are compiled (data does not contain frontmater!)
	// | Vento.vto template support [https://github.com/noelforte/eleventy-plugin-vento]
	// | Sass.scss support using sass-embedded (+ my plugin), and minify it using esbuild
	// eleventyConfig.addPlugin(ImagePlugin_11ty({}));
	// eleventyConfig.addPlugin(preprocessors_11ty);
	// eleventyConfig.addPlugin(postprocessors_11ty);
	eleventyConfig.addPlugin(VentoPlugin, { ventoOptions: { ...config.vento } });
	eleventyConfig.addPlugin(SassPlugin_11ty({
		postprocess: env.MINIFY_FILES === "true" ? undefined : (content, data) => {
			return esbuild.transformSync(content, {
				loader: "css", minify: true,
				target: supported_browsers_esbuild,
			}).code;
		},
		sassOptions: config.scss,
	}));


	// // ~~~~~ Compile TS/JS/TSX/JSX files using esbuild ~~~~~
	// // 1. Register all types as Templates and set their Extensions
	// eleventyConfig.addTemplateFormats(["js", "ts", "tsx", "jsx"]);
	// eleventyConfig.addExtension("ts", compileWithEsbuild("ts", "js"));
	// eleventyConfig.addExtension("js", compileWithEsbuild("js", "js"));
	// eleventyConfig.addExtension("tsx", compileWithEsbuild("tsx", "js"));
	// eleventyConfig.addExtension("jsx", compileWithEsbuild("jsx", "js"));

	// // 2. Reusable function to generate an 11ty extension that compiles its content with esbuild
	// // + Resolve '@util' aliases
	// function compileWithEsbuild (inputExtension, outputExtension) { return {
	// 	outputFileExtension: outputExtension,
	// 	compile: async function (inputContent, inputPath) { return async (data) => {
	// 		return (await esbuild.transform(inputContent, {
	// 			loader: inputExtension,
	// 		})).code;
	// 	}; },
	// }; }
	eleventyConfig.setServerOptions({
		port: config.port,
		domDiff: true,
		liveReload: true,
		useCache: true,
		// watch: []
	});
});
