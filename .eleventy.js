import * as config from "./config.js";
const { log, colors } = config;
// log(`🏁 Starting build...\n`, colors.pink);
// maybe override eleventy config auto restarting?

import glob from "fast-glob";

// Miscellaneous



// Build requirements
import esbuild from "esbuild";
import browserslist_esbuild from "browserslist-to-esbuild";
const supported_browsers_esbuild = browserslist_esbuild(config.supported_browsers); // convert browserslist to esbuild format


// 11ty plugins
import ImagePluginEleventy from "./scripts/plugin_11ty_image.js";
import SassPluginEleventy from "./scripts/plugin_11ty_sass.js";
import { VentoPlugin } from "eleventy-plugin-vento";


const eleventy_config = {
    dir: {
		input: config.paths.source,
        includes: config.paths.includes,
		// layouts: undefined,
        // data: undefined,
		output: config.paths.output,
        layouts: "modules/_layouts",
    },
    htmlTemplateEngine: "vto",
	markdownTemplateEngine: "njk",
	pathPrefix: "/",
};
export { eleventy_config as config }; // to avoid name conflict


// Define eleventy configuration using 11ty.ts for full intellisense
import { defineConfig } from "11ty.ts";
import { nextTick } from "process";
export default defineConfig((eleventyConfig) => {

	// Ignore files and directories that start with an underscore  (glob to match _'s instead: !(_)*{*/!(_)*,*})
	eleventyConfig.ignores.add(`${config.paths.source}/_*{*/_*,*}`);

	// Watch for changes to files that this config file depends on [https://www.11ty.dev/docs/watch-serve/#reset-configuration] 
	eleventyConfig.addWatchTarget("./config.ts", { resetConfig: true });

	eleventyConfig.setTemplateFormats(["html"]);
	eleventyConfig.setDataFileSuffixes([".11ty", ".11tydata"]);
	eleventyConfig.setUseGitIgnore(false);

	// Custom transforms specificed in config
	eleventyConfig.addPreprocessor("customTransforms", Object.keys(config.transforms).join(","), async (data, content) => {
		const ext = data.page?.outputFileExtension;
		if (!ext) return content;
		const fn = config.transforms[ext];
		if (fn) { return fn(content, data); }
		return content;
	});


	// Copy static files if not in production (we minimize them in production)
	if (!config.env.FULLBUILD) { eleventyConfig.addPassthroughCopy("**/*.{css}"); }


	eleventyConfig.addPlugin(ImagePluginEleventy({}));


	eleventyConfig.on("eleventy.after", async ({ directories, results, runMode, outputMode }) => {
		if (runMode !== "build") return;
		nextTick(async () => {
			console.log("");
			log(`🎉 Build complete in ${colors.blue(`${~~(performance.now())}ms`)}!`, colors.pink);
		});

	});

	// Add 11ty data file support
	eleventyConfig.addExtension("11tydata", { outputFileExtension: "js", useLayouts: false });

	// Vento.vto template support [https://github.com/noelforte/eleventy-plugin-vento]
	eleventyConfig.addTemplateFormats("vto");
	eleventyConfig.addPlugin(VentoPlugin, { ventoOptions: { ...config.vento } });

	// Sass.scss support using sass-embedded, and minify it using esbuild (when building for production)
	eleventyConfig.addPlugin(SassPluginEleventy({
		sassOptions: config.scss,
		postprocess: !config.env.FULLBUILD ? undefined : (content, data) => {
			return esbuild.transformSync(content, {
				loader: "css", minify: true,
				target: supported_browsers_esbuild,
			}).code;
		},
	}));



	eleventyConfig.addTemplateFormats(["js", "ts", "tsx", "jsx"]);
	eleventyConfig.addExtension("ts", compileWithEsbuild("ts", "js"));
	eleventyConfig.addExtension("js", compileWithEsbuild("js", "js"));
	eleventyConfig.addExtension("tsx", compileWithEsbuild("tsx", "js"));
	eleventyConfig.addExtension("jsx", compileWithEsbuild("jsx", "js"));
});


// Returns an object that can be passed to .addExtension, to easily compile files using esbuild's many loaders
function compileWithEsbuild (inputExtension, outputExtension) { return {
	outputFileExtension: outputExtension,
	compile: async function (inputContent, inputPath) { return async (data) => {
		inputContent = inputContent.replace(`from "@util"`, `from "/awa-util/core.js"`);
		return (await esbuild.transform(inputContent, {
			loader: inputExtension,
			minify: config.env.FULLBUILD,
			target: supported_browsers_esbuild,
		})).code;
	}; },
}; }

