// ✧ node modules
import fs from "node:fs";
import esbuild from "esbuild";
import browserslist_esbuild from "browserslist-to-esbuild";
const supported_browsers_esbuild = browserslist_esbuild(mono.supported_browsers); // < convert browserslist to an esbuild compatible format
import { transform as lightningcss, browserslistToTargets } from "lightningcss";
const supported_browsers_lightningcss = browserslistToTargets(mono.supported_browsers); // < convert browserslist to a lightningcss compatible format

// ✧ 11ty plugins
import ImagePlugin_11ty from "./11ty-plugin-image.js";
import SassPlugin_11ty from "./11ty-plugin-sass.js";
import preprocessors_11ty from "./11ty-preprocessors.js";
import postprocessors_11ty from "./11ty-postprocessors.js";
import { VentoPlugin } from "eleventy-plugin-vento";

// ✧ my imports:
import * as util from "__util__";
import * as mono from "./monolith.js";
const { log, colors, err, paths, abs_paths } = mono;
const { blue: b, pink: p, white: w } = colors;
const env = process.env as import("./config.js").env_type & NodeJS.ProcessEnv;


// log("—— Eleventy Config started...");



/* ~~~~~ Main Config ~~~~~ */ // [https://www.11ty.dev/docs/config/]
// 1. Eleventy Config object:
const eleventy_config = {
	dir: { input: paths.source, includes: paths.includes, output: paths.output },
	htmlTemplateEngine: "vto",
	pathPrefix: "/",
}; export { eleventy_config as config }; // < to avoid name conflict


// 2. Eleventy Config function, defined using 11ty.ts for type support:
import Eleventy, { defineConfig } from "11ty.ts";
export default defineConfig((eleventyConfig) => {

	// - Ignore files
	eleventyConfig.ignores.add(`${mono.paths.source}/_*{*/_*,*}`); // Ignore files and directories that start with an underscore  (glob to match _'s instead: !(_)*{*/!(_)*,*})
	eleventyConfig.ignores.add("**/critical.js");
	eleventyConfig.ignores.add(`**/*.{js,ts,tsx,jsx}`);

	// - Watch for changes to files that this config file depends on [https://www.11ty.dev/docs/watch-serve/#reset-configuration] 

	// - 
	eleventyConfig.setTemplateFormats(["html", "vto"]);
	eleventyConfig.setDataFileSuffixes([".11ty", ".11tydata"]);
	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.addPassthroughCopy("./source/**/*.{mp3,css}");
	eleventyConfig.addPassthroughCopy("./source/fonts/**/*");
	eleventyConfig.setDataFileBaseName("override");

	eleventyConfig.addShortcode("importmap", () => JSON.stringify(mono.importmap));

	// ~~~~~ Plugins ~~~~~
	// | images: Compress images
	// | preprocessors: Transform content before templates are compiled
	// | postprocessors: Transform content after templates are compiled (data does not contain frontmater!)
	// | Vento.vto template support [https://github.com/noelforte/eleventy-plugin-vento]
	// | Sass.scss support using sass-embedded (+ my plugin), and minify it using lightningcss
	eleventyConfig.addPlugin(ImagePlugin_11ty({}));
	eleventyConfig.addPlugin(preprocessors_11ty);
	eleventyConfig.addPlugin(postprocessors_11ty);
	eleventyConfig.addPlugin(VentoPlugin, { ventoOptions: { ...mono.vento } });
	eleventyConfig.addPlugin(SassPlugin_11ty({
		sassOptions: { ...mono.scss, logger: { debug: (m) => log(m, "sass"), warn: (m) => process.send({ type: "warning", message: m }) } },
		postprocess: env.MINIFY_FILES === "true" ? undefined : (content, data, map) => {
			const result = lightningcss({
				filename: data.page.fileSlug + ".css",
				code: Buffer.from(content, "utf8"),
				targets: supported_browsers_lightningcss,
				minify: true,
				sourceMap: env.SOURCE_MAPS === "true",
				inputSourceMap: env.SOURCE_MAPS === "true" ? JSON.stringify(map) : undefined,
			});
			return result.code + (result.map ? `\n/*# sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(result.map)).toString("base64")}*/` : "");
		},
	}));




	eleventyConfig.setServerOptions({
		port: mono.port,
		domDiff: true,
		liveReload: true,
		useCache: true,
		watch: ["**/*.{js,ts,tsx,jsx}", "images/**/*"],
	});

	log("   Eleventy Config loaded!");
	return undefined;
});
