// - node modules
import fs from "node:fs";
import esbuild from "esbuild";
import browserslist_esbuild from "browserslist-to-esbuild";
const supported_browsers_esbuild = browserslist_esbuild(config.supported_browsers); // < convert browserslist to an esbuild compatible format

// - 11ty plugins
import ImagePlugin_11ty from "./11ty-plugin-image.js";
import SassPlugin_11ty from "./11ty-plugin-sass.js";
import preprocessors_11ty from "./11ty-preprocessors.js";
import postprocessors_11ty from "./11ty-postprocessors.js";
import { VentoPlugin } from "eleventy-plugin-vento";

// - my config
import * as config from "./config.js";
const { log, err, colors, paths, absPaths } = config;
const { blue: b, pink: p, white: w } = colors;
const env = process.env as import("./config.js").env_type & NodeJS.ProcessEnv;

log("—— Eleventy Config started...");



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
	eleventyConfig.ignores.add(`${config.paths.source}/_*{*/_*,*}`); // Ignore files and directories that start with an underscore  (glob to match _'s instead: !(_)*{*/!(_)*,*})
	eleventyConfig.ignores.add("**/critical.js");
	eleventyConfig.ignores.add(`**/*.{js,ts,tsx,jsx}`);

	// - Watch for changes to files that this config file depends on [https://www.11ty.dev/docs/watch-serve/#reset-configuration] 

	// - 
	eleventyConfig.setTemplateFormats(["html", "vto"]);
	eleventyConfig.setDataFileSuffixes([".11ty", ".11tydata"]);
	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.addPassthroughCopy("./source/**/*.{mp3,css}");
	eleventyConfig.addPassthroughCopy("./source/fonts/**/*");
	// ~~~~~ Plugins ~~~~~
	// | images: Compress images
	// | preprocessors: Transform content before templates are compiled
	// | postprocessors: Transform content after templates are compiled (data does not contain frontmater!)
	// | Vento.vto template support [https://github.com/noelforte/eleventy-plugin-vento]
	// | Sass.scss support using sass-embedded (+ my plugin), and minify it using esbuild
	eleventyConfig.addPlugin(ImagePlugin_11ty({}));
	eleventyConfig.addPlugin(preprocessors_11ty);
	eleventyConfig.addPlugin(postprocessors_11ty);
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

	eleventyConfig.setServerOptions({
		port: config.port,
		domDiff: true,
		liveReload: true,
		useCache: true,
		watch: ["**/*.{js,ts,tsx,jsx}", "images/**/*"],
	});

	log("—— Eleventy Config done!");
	return undefined;
});
