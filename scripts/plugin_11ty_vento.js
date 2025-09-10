// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME
// ❌ NOT FINISHED - WILL MAYBE FINISH SOMETIME


import Vento from "ventojs";
import VentoHelperPlugin from "ventojs-helper";

import autoTrim, { defaultTags } from "ventojs/plugins/auto_trim.js";

// 
/** 
 * @typedef VentoPluginEleventyOptions
 * @property {Object.<string, any>} [globaldata] - Data to be passed to all templates (via env.runString(content, globaldata))
 */

/**
 * Adds Vento template support to 11ty
 * @param {import("11ty.ts").EleventyConfig} eleventyConfig
 * @param {import("ventojs").Options & VentoPluginEleventyOptions} options
 * @returns {void}
 */
export default function VentoPluginEleventy (eleventyConfig, options) {

	// Create the Vento instance
	const venv = Vento({
		includes: options.includes,
		autoDataVarname: options.dataVarname,
		dataVarname: options.dataVarname,
		autoescape: options.autoescape,
	});
	venv.use(autoTrim({ tags: [...defaultTags, "layout", "/layout"] }));

	venv.tags.push((env, token, output, tokens) => {
		console.log("env: ", env);
		console.log("token: ", token);
		console.log("output: ", output);
		console.log("tokens: ", tokens);
		console.log(env[output]);
		return output + "= 'uwu'";
	});

	eleventyConfig.addTemplateFormats("vto");
	eleventyConfig.addExtension("vto", {
		outputFileExtension: "html",
		useLayouts: false,
		compile: async (inputContent, inputPath) => {
			let content = inputContent;

			/** @param {import("11ty.ts").EleventyScope["eleventy"]} data */
			return async (data) => {

				// Run Vento on the template, passing in the eleventy-supplied data, and frontmatter
				const result = await venv.runString(content, { ...options.globaldata, ...data });
				content = result.content;

				return content;
			};
		},
	});
}

/*
(property) Environment.tags: ((env: {
    cache: Map<string, Template | Promise<Template>>;
    options: Options;
    tags: Tag[];
    tokenPreprocessors: TokenPreprocessor[];
    filters: Record<string, Filter>;
    utils: Record<string, unknown>;
    use(plugin: Plugin): void;
    run(file: string, data?: Record<string, unknown>, from?: string, position?: number): Promise<TemplateResult>;
    runString(source: string, data?: Record<string, unknown>, file?: string): Promise<TemplateResult>;
    ... 4 more ...;
    compileFilters(tokens: Token[], output: string, autoescape?: boolean): string;
}, token: [...], output: string, tokens: [...][]) => string | undefined)[]
*/
