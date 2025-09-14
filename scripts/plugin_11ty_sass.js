import * as sass from "sass-embedded";
import deepmerge from "deepmerge";
import chalk from "chalk";
import { parse } from "node:path";

/**
 * @typedef {Object} PluginOptions
 * @property {(content: string, data: import("11ty.ts").EleventyScope["eleventy"]) => string} [postprocess] - Function to postprocess the compiled CSS however you want.
 * @property {import("sass-embedded").StringOptions} [sassOptions] - Options to be passed to `sass.compileString`.
 */


/** @type {PluginOptions} */
const default_options = {
	sassOptions: {
		sourceMap: true,
	},
};



/**
 * Eleventy Sass plugin - Handles compiling SCSS to CSS, and optionally postprocessing  
 * Sourcemaps are included in a base64 encoded data URI (when sourceMap: true)  
 * @param {PluginOptions} options
 * @returns {(eleventyConfig: import("11ty.ts").EleventyConfig) => void}
 */
export default function (options) {

	// Set default options
	options = deepmerge(default_options, options);

	// Return the plugin
	return function (eleventyConfig) {
		eleventyConfig.addTemplateFormats("scss");
		eleventyConfig.addExtension("scss", {
			outputFileExtension: "css",
			useLayouts: false, // opt-out of Eleventy Layouts
			compile: async function (inputContent, inputPath) {
				let content = inputContent;

				// Compile SCSS to CSS
				const result = sass.compileString(content, options.sassOptions);
				content = result.css;

				// Map dependencies for incremental builds [https://www.11ty.dev/docs/dependencies/]
				this.addDependencies(inputPath, result.loadedUrls);

				// Encode the source map into base64 and append it to the output CSS
				if (result.sourceMap) {
					const sourcemap64 = Buffer.from(JSON.stringify(result.sourceMap)).toString("base64");
					content += `\n/*# sourceMappingURL=data:application/json;base64,${sourcemap64}*/`;
				}

				return async (data) => {

					// Run the user’s own postprocess function
					if (options.postprocess) {
						content = options.postprocess(content, data);
						if (!content && content !== "") throw Error(chalk.red("❌ User-supplied postprocess function did not return anything."));
					}

					return content;
				};
			},
		});
	};
}


/*



inputPath:
 ./src/main.scss


data:

{
  eleventy: {
    version: '3.1.2',
    generator: 'Eleventy v3.1.2',
    env: {
      source: 'cli',
      runMode: 'build',
      config: 'C:/Users/awa/Documents/coding/awasomewebsitey/awasome-website-01/.eleventy.js',
      root: 'C:/Users/awa/Documents/coding/awasomewebsitey/awasome-website-01'
    },
    directories: {
      input: 'C:/Users/awa/Documents/coding/awasomewebsitey/awasome-website-01/src/',
      inputFile: undefined,
      inputGlob: undefined,
      data: 'C:/Users/awa/Documents/coding/awasomewebsitey/awasome-website-01/src/_data/',
      includes: 'C:/Users/awa/Documents/coding/awasomewebsitey/awasome-website-01/src/C:/Users/awa/Documents/coding/awasomewebsitey/awasome-website-01/src/_includes/',
      layouts: 'C:/Users/awa/Documents/coding/awasomewebsitey/awasome-website-01/src/modules/_layouts/',
      output: 'C:/Users/awa/Documents/coding/awasomewebsitey/awasome-website-01/__production/'
    }
  },
  pkg: {
    ...
  },
  page: {
    inputPath: './src/main.scss',
    fileSlug: 'main',
    fileSlug: 'main',
    filePathStem: '/src/main',
    outputFileExtension: 'css',
    outputFileExtension: 'css',
    templateSyntax: 'scss',
    templateSyntax: 'scss',
    date: 2025-09-07T11:46:46.543Z,
    rawInput: '@function random-color() {\r\n' +
      '\t@return rgb(\r\n' +
      '\t\trandom(255),\r\n' +
      '\t\trandom(255),\r\n' +
      '\t\trandom(255)\r\n' +
      '\t);\r\n' +
      '}\r\n' +
      '\r\n' +
      '\r\n' +
      '.random-background {\r\n' +
      '\tbackground-color: random-color();\r\n' +
      '}\r\n',
    url: '/main.css',
    outputPath: 'C:/Users/awa/Documents/coding/awasomewebsitey/awasome-website-01/__production/main.css'
  },
  collections: { all: [ [Object], [Object] ] }
}
*/
