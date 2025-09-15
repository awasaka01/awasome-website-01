import * as config from "./config.js";
const { log, colors } = config;


// Miscellaneous



// Build requirements
import esbuild from "esbuild";
import browserslist_esbuild from "browserslist-to-esbuild";
const supported_browsers_esbuild = browserslist_esbuild(config.supported_browsers); // convert browserslist to esbuild format


// 11ty plugins
import ImagePlugin_11ty from "./11ty-plugin-image.js";
import SassPlugin_11ty from "./11ty-plugin-sass.js";
import CustomTransforms_11ty from "./11ty-custom-transforms.js";
import { VentoPlugin } from "eleventy-plugin-vento";


const eleventy_config = {
    dir: {
		input: config.paths.source,
        includes: config.paths.includes,
		output: config.paths.output,
    },
    htmlTemplateEngine: "vto",
	pathPrefix: "/",
};
export { eleventy_config as config }; // to avoid name conflict


// Define eleventy configuration using 11ty.ts for full intellisense
import { defineConfig } from "11ty.ts";
import { nextTick } from "process";
export default defineConfig((eleventyConfig) => {


	eleventyConfig.ignores.add(`${config.paths.source}/_*{*/_*,*}`); // Ignore files and directories that start with an underscore  (glob to match _'s instead: !(_)*{*/!(_)*,*})
	eleventyConfig.ignores.add("**/critical.js");

	// Watch for changes to files that this config file depends on [https://www.11ty.dev/docs/watch-serve/#reset-configuration] 
	eleventyConfig.addWatchTarget("./config.ts", { resetConfig: true });

	eleventyConfig.setTemplateFormats(["html"]);
	eleventyConfig.setDataFileSuffixes([".11ty", ".11tydata"]);
	eleventyConfig.setUseGitIgnore(false);



	// Copy static files if not in production (we minimize them in production)
	if (!config.env.FULLBUILD) { eleventyConfig.addPassthroughCopy("**/*.{css}"); }

	eleventyConfig.addPlugin(CustomTransforms_11ty());
	eleventyConfig.addPlugin(ImagePlugin_11ty({}));


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
	eleventyConfig.addPlugin(SassPlugin_11ty({
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

