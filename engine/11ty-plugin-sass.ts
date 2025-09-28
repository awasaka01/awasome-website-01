// engine/11ty-plugin-sass.ts

import * as util from "__util__";
import * as config from "./config.js";
const { log, err, colors, paths, absPaths } = config;
const { blue: b, pink: p, white: w } = colors;
const env = process.env as import("./config.js").env_type & NodeJS.ProcessEnv;

import * as sass from "sass-embedded";
import deepmerge from "deepmerge";
import chalk from "chalk";
import { parse } from "node:path";
import type { EleventyConfig, EleventyScope } from "11ty.ts";

const default_options : PluginOptions = {
	sassOptions: {
		sourceMap: true,
	},
};



export interface PluginOptions {
	postprocess ?: (content : string, data : EleventyScope, sourceMap ?: sass.CompileResult["sourceMap"]) => string;
	sassOptions ?: sass.StringOptions<"async">;
}
/** Eleventy Sass compiler plugin    
 * Includes inline source maps when sourceMap: true
 */
export default function (options : PluginOptions) {
	options = deepmerge(default_options, options);

	return function (eleventyConfig : EleventyConfig) {
		eleventyConfig.addTemplateFormats("scss");
		eleventyConfig.addExtension("scss", { // [https://www.11ty.dev/docs/languages/custom/]
			outputFileExtension: "css",
			useLayouts: false,
			compile: async function (inputContent : string, inputPath : string) {
				const { addDependencies } = this;
				return async function (data : EleventyScope) {
					return await compile(options, inputContent, inputPath, data, addDependencies);
				};
			},
		});
	};
}

async function compile (options : PluginOptions, inputContent : string, inputPath : string, data : EleventyScope, addDependencies : Function) {

	const result = await sass.compileStringAsync(inputContent, { ...options.sassOptions });

	addDependencies(inputPath, result.loadedUrls); // [https://www.11ty.dev/docs/languages/custom/#registering-dependencies]

	if (options.postprocess !== undefined) { return options.postprocess(result.css, data, result.sourceMap); }
	else { return result.css + (result.sourceMap ? `\n/*# sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(result.sourceMap)).toString("base64")}*/` : ""); }
}



// data: {
//   sourceMap: false,
//   alertColor: true,
//   loadPaths: [
//     'C:/Users/awa/Documents/coding/awasome-website-01/source/_styles',
//     './source/main.scss'
//   ],
//   style: 'expanded'
// } {
//   eleventy: {
//     version: '3.1.1',
//     generator: 'Eleventy v3.1.1',
//     env: {
//       source: 'cli',
//       runMode: 'build',
//       config: 'C:/Users/awa/Documents/coding/awasome-website-01/__compiled/engine/eleventy.js',
//       root: 'C:/Users/awa/Documents/coding/awasome-website-01/__compiled/engine'
//     },
//     directories: {
//       input: './source/',
//       inputFile: undefined,
//       inputGlob: undefined,
//       data: './source/_data/',
//       includes: './source/source/_templates/',
//       layouts: undefined,
//       output: './^~^ website/'
//     }
//   },
//   pkg: {
//     ...
//   },
//   page: {
//     inputPath: './source/main.scss',
//     fileSlug: 'main',
//     filePathStem: '/main',
//     outputFileExtension: 'css',
//     templateSyntax: 'scss',
//     date: 2025-09-20T14:38:06.789Z,
//     rawInput: '// @use "sass:color";\r\n' +
//       ...
//     url: '/main.css',
//     outputPath: './^~^ website/main.css'
//   },
//   collections: { all: [ [Object], [Object], [Object], [Object] ] }
// }
