// eleventyConfig.addPlugin(criticalCss); import criticalCss from "eleventy-critical-css";

import { minify } from "html-minifier-terser";
import * as sass from "sass-embedded";
import postcss from "postcss";
import postcss_cssnano from "cssnano";
import postcss_preset_env from "postcss-preset-env";
import * as babel from "@babel/core";
import UglifyJS from "uglify-js";

import jsdom from "jsdom"; // Virtual DOM, for easier preprocessing
import printTree from "../print-dist-tree.js";
import { on } from "events";
import * as Vite from "vite";


// ANCHOR - User Config
const options = {
	scss: { // https://sass-lang.com/documentation/js-api/interfaces/stringoptions/
		loadPaths: ["./src/modules/_styles"], // TODO sourceMap: true,
	},
	config11ty: { // https://www.11ty.dev/docs/config/
		dir: {
			input: "src",
			output: "__dist",
			includes: "modules/_includes",
			data: "modules/_data",
			layouts: "modules/_layouts",
		},
		templateFormats: ["html", "js", "css", "scss", "jsx", "ts", "tsx", "njk", "md", "liquid", "11ty.js", "11ty.ts", "11ty.cjs", "11ty.mjs"],
	},
};

/** [Intellisense Support] @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	eleventyConfig.ignores.add("_*");
	eleventyConfig.addGlobalData("nocache", `?nocache=${Date.now().toString(36)}`);
	eleventyConfig.setServerOptions({
		// Default values are shown:

		// Whether the live reload snippet is used
		liveReload: true,

		// Whether DOM diffing updates are applied where possible instead of page reloads
		domDiff: true,

		// The starting port number
		// Will increment up to (configurable) 10 times if a port is already in use.
		port: 8080,

		// Additional files to watch that will trigger server updates
		// Accepts an Array of file paths or globs (passed to `chokidar.watch`).
		// Works great with a separate bundler writing files to your output folder.
		// e.g. `watch: ["_site/**/*.css"]`
		watch: [],

		// Show local network IP addresses for device testing
		showAllHosts: false,

		// Use a local key/certificate to opt-in to local HTTP/2 with https
		https: {
			// key: "./localhost.key",
			// cert: "./localhost.cert",
		},

		// Change the default file encoding for reading/serving files
		encoding: "utf-8",

		// Show the dev server version number on the command line
		showVersion: false,

		// Added in Dev Server 2.0+
		// The default file name to show when a directory is requested.
		indexFileName: "index.html",

		// Added in Dev Server 2.0+
		// An object mapping a URLPattern pathname to a callback function
		// for on-request processing (read more below).
		onRequest: {},
	});

	// eleventyConfig.addExtension that just returns the content, required for permalinks in folder data (pages.11tydata.js) to work for some reason
	["js", "css"].forEach(addBlankExtensionForPermalinks, eleventyConfig);

	// https://www.11ty.dev/docs/environment-vars/#eleventy-supplied
	eleventyConfig.on("eleventy.beforeConfig", async () => {

		// Enable minification and extra formatting only in production mode
		if (process.env.FULL_BUILD?.trim() === "yes") {
			eleventyConfig.addTransform("FULL_BUILD", async function (fileContent) {
				if (!fileContent) return;
				const formatted = await (async () => {
					switch (this.page.outputFileExtension) {
						case "html": return await buildFormatHTML(fileContent, this);
						case "js": return await buildFormatJS(fileContent, this);
						case "css": return await buildFormatCSS(fileContent, this);
						default: return fileContent;
					}
				})();
				if (formatted === fileContent) return fileContent;
				// Log how much space was saved after formatting (very roughly)
				const difference = (Buffer.byteLength(formatted, "utf-8") - Buffer.byteLength(fileContent, "utf-8")) / 1024;
				console.log(`\x1b[90m${this.page.inputPath}\x1b[0m: ${difference > 0 ? "+" : ""}${difference.toFixed(2)}kb`);
				return formatted;
			});
		}
	});


	/* ANCHOR - SCSS compilation, using sass-embedded */
	eleventyConfig.addExtension("scss", { outputFileExtension: "css",
		compile: (fileContent) => { return (data, inputPath) => {
			if (data.page.fileSlug.startsWith("_")) return;
			return "/* stylelint-disable */\n" + sass.compileString(fileContent, options.scss).css;
		}; },
	});


	/* ANCHOR - Preprocessors */
	eleventyConfig.addPreprocessor("fillRemainingSpace", "html", (data, content) => {
		// console.log(data, content);

		if (!data.addFeatures?.includes("fillRemainingSpace")) return;

		const body = content.match(/<body.+>.+<\/body>/gms);
		const dom = new jsdom.JSDOM(body);
		const document = dom.window.document;
		const elements = Array.from(document.getElementsByClassName("fillRemainingSpace"));

		if (elements.length === 0) return;

		const regex = new RegExp("\\?f(.+?)\\/f", "g");
		const filterCodesOut = (str) => str.replace(regex, "").replace(/[0-9]([┏━┓─┃┗┛ ]+)/g, "$1");
		elements.forEach((el) => {
			// Calculate longest line
			const children = Array.from(el.children);
			const longest = children.map((x) => filterCodesOut(x.textContent).length).reduce((a, b) => a > b ? a : b);

			// Loop over each line and grow to match longest
			children.forEach((child) => {
				const length = filterCodesOut(child.textContent).length;
				const diff = Math.abs(length - longest);

				//
				const fillsCountTotal = child.innerHTML.match(regex)?.length;
				if (!fillsCountTotal) return;
				// console.log(child.innerHTML, fillsCountTotal);

				let i = 0;
				child.innerHTML = child.innerHTML.replace(regex, (match, group1) => {

					const fn = i === 0 ? Math.floor : i === fillsCountTotal - 1 ? Math.ceil : Math.round;

					const fillString = Array.from({ length: fn(diff / fillsCountTotal) }, () => group1).join("");

					i += 1;
					return fillString;
				});

				// const fills = child.innerHTML.replace(/\?f(.+?)\/f/g, (match, group1) => {

				// 	return group1;
				// });
				// 	// .filter((x) => x.startsWith("fill:"))
				// 	// .map((x) => (x.split(":")[1].split("")));
				// 	console.log(fills);

				// console.log(lines);
				// child.innerHTML = lines.join("\n");
				// // // Repeat each fill evenly
				// fills.forEach((fill, i) => {
					// const fn = i === 0 ? Math.floor : i === fills.length - 1 ? Math.ceil : Math.round;
					// const fillString = Array.from({ length: fn(diff / (fills.length)) }, (v, i) => fill[i % fill.length]);
					// child.innerHTML = child.innerHTML.replace(`?%?fill:${fill.join("")}?%?`, fillString);

			});
		});
		return content.replace(/<body.+>.+<\/body>/gms, document.body.outerHTML);
	});


/* ANCHOR - Vite */

	// https://www.11ty.dev/docs/events/#eleventy-after
eleventyConfig.on("eleventy.after", async ({ dir, runMode, outputMode, results }) => {
		(async () => {
			await Vite.build({
				// Your Vite build configuration options
				// For example:
				root: "____temp", // Specify the project root
				build: {
					outDir: "____dist", // Output directory
					minify: true, // Minify the code
					rollupOptions: {
						external: (id) => id.startsWith("critical"),
					},
				},
			});
			console.log("Vite build completed!");
		})();
	});




	eleventyConfig.addPreprocessor("uwuwuwu", "html", (data, content) => {
		if (!data.replaceCharacters) return;
		data.replaceCharacters.regexes.forEach(([regex, flags, replacement]) => {
			content = content.replace(new RegExp(regex, flags), replacement);
		});
		return content;
	});
}
export const config = options.config11ty; // A named config export, instead of returning inside the eleventyConfig function, because it's "preferred for order-of-operations reasons"





// ANCHOR - Optimize all files as much as possible, but only in production (some of this probably overlaps with vite but wtvr)

// posthtml - minify
async function buildFormatHTML (content, data) {
	content = await minify(content, { // useful: <!-- htmlmin:ignore --> [https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference]
		removeScriptTypeAttributes: true,
		collapseBooleanAttributes: true,
		removeRedundantAttributes: true,
		removeTagWhitespace: false,
		removeOptionalTags: true,
		removeComments: true,
		minifyURLs: true,
		minifyCSS: true,
		minifyJS: true,
	});

	// Remove empty lines and unnecessary whitespace
	return content.replace(/[\r\t\n]/g, "").split("\n").filter((x) => x.length > 0).map((x) => x.trim()).join("\n").trim();
}
// postcss - minify, backwards compatibility (sass is already compiled to css by now)
async function buildFormatCSS (content, data) {
	return (await postcss([ // https://github.com/postcss/postcss?tab=readme-ov-file#js-api
		postcss_preset_env({ stage: 0 }), // https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env
		postcss_cssnano, // https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-cssnano
	]).process(content, { from: "/", to: "/" })).css;
}

// babel - minify, backwards compatibility, optimization
async function buildFormatJS (content, data) {
	content = await babel.transformAsync(content, {
		filename: data.page.inputPath,
		compact: true, comments: false,
		presets: [["@babel/preset-env", {}], "@babel/preset-react", "@babel/preset-typescript"],
	});
	return UglifyJS.minify(content.code).code;
}


















const page = {
	eleventy: {
		version: "3.1.1",
		generator: "Eleventy v3.1.1",
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
			data: "./src/modules/_data/",
			includes: "./src/modules/_includes/",
			layouts: "./src/modules/_layouts/",
			output: "./__dist/",
		},
	},
	pkg: {
		name: "awasomewebsite",
		version: "1.0.0",
		description: "",
		main: "index.js",
		type: "module",
		scripts: {
			start: "(tsc index.ts) -and (nodemon index.js)",
			build: "rimraf __dist/* -g && eleventy",
		},
		keywords: [],
		author: "",
		license: "ISC",
		packageManager: "pnpm@10.12.1",
		dependencies: {
			"@11ty/eleventy": "^3.1.1",
			"@11ty/eleventy-plugin-vite": "^6.0.0",
			"@types/chroma-js": "^3.1.1",
			"chroma-js": "^3.1.2",
			"eleventy": "^1.0.7",
			"nodemon": "^3.1.10",
			"rimraf": "^6.0.1",
			"stylelint": "^16.19.0",
			"stylelint-config-standard-scss": "^15.0.1",
			"stylelint-define-config": "^16.19.0",
			"ts-node": "^10.9.2",
			"typescript": "^5.8.3",
			"vite": "^6.3.5",
		},
		pnpm: { neverBuiltDependencies: [] },
		devDependencies: { "@types/node": "^24.0.3" },
	},
	page: {
		inputPath: "./src/pages/template/index.js",
		fileSlug: "template",
		filePathStem: "/pages/template/index",
		outputFileExtension: "js",
		templateSyntax: "js",
		// date: 2025-06 - 20T02:03: 10.408Z,
		rawInput: "window.addEventListener(\"DOMContentLoaded\", () => {\r\n"
			+ "\tdocument.body.style.fontFamily = \"monospace\";\r\n"
			+ "\tdocument.body.style.backgroundColor = \"darkslategrey\";\r\n"
			+ "});\r\n",
	},
	collections: {},
};




// const data2 = {
//   context: Context {
//     scopes: [ {} ],
//     registers: {},
//     breakCalled: false,
//     continueCalled: false,
//     sync: false,
//     opts: {
//       root: [Array],
//       layouts: [Array],
//       partials: [Array],
//       relativeReference: true,
//       jekyllInclude: false,
//       keyValueSeparator: ':',
//       cache: undefined,
//       extname: '.liquid',
//       fs: [Object: null prototype],
//       dynamicPartials: true,
//       jsTruthy: false,
//       dateFormat: '%A, %B %-e, %Y at %-l:%M %P %z',
//       locale: 'en-GB',
//       trimTagRight: false,
//       trimTagLeft: false,
//       trimOutputRight: false,
//       trimOutputLeft: false,
//       greedy: true,
//       tagDelimiterLeft: '{%',
//       tagDelimiterRight: '%}',
//       outputDelimiterLeft: '{{',
//       outputDelimiterRight: '}}',
//       preserveTimezones: false,
//       strictFilters: true,
//       strictVariables: false,
//       ownPropertyOnly: true,
//       lenientIf: false,
//       globals: {},
//       keepOutputType: false,
//       operators: [Object],
//       memoryLimit: Infinity,
//       parseLimit: Infinity,
//       renderLimit: Infinity,
//       outputEscape: undefined
//     },
//     globals: {},
//     environments: {
//       data: {},
//       eleventy: [Object],
//       pkg: [Object],
//       permalink: './template/index.html',
//       page: [Object],
//       collections: [Object]
//     },
//     strictVariables: false,
//     ownPropertyOnly: true,
//     memoryLimit: Limiter {
//       base: 0,
//       message: 'memory alloc limit exceeded',
//       limit: Infinity
//     },
//     renderLimit: Limiter {
//       base: 0,
//       message: 'template render limit exceeded',
//       limit: Infinity
//     }
//   },
//   token: FilterToken {
//     kind: 32,
//     input: '<!DOCTYPE html>\r\n' +
//       '<html lang="en">\r\n' +
//       '<head>\r\n' +
//       '\t<meta charset="UTF-8">\r\n' +
//       '\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n' +
//       '\t<title>Document</title>\r\n' +
//       '\t<script src="main.js"></script>\r\n' +
//       `\t<link rel="stylesheet" href="{{ 'main.css' | uwuawa }}">\r\n` +
//       '</head>\r\n' +
//       '<body>\r\n' +
//       '\t<h1>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eligendi quo laboriosam sapiente libero neque commodi recusandae repudiandae, sit ratione placeat debitis atque, porro quos doloribus inventore ipsa officia nostrum officiis.</h1>\r\n' +
//       '</body>\r\n' +
//       '</html>',
//     begin: 247,
//     end: 253,
//     file: './src/pages/template/index.html',
//     name: 'uwuawa',
//     args: []
//   },
//   liquid: <ref *1> Liquid {
//     renderer: Render {},
//     filters: {
//       escape: [Function: escape],
//       xml_escape: [Function: xml_escape],
//       escape_once: [Function: escape_once],
//       newline_to_br: [Function: newline_to_br],
//       strip_html: [Function: strip_html],
//       abs: [Function (anonymous)],
//       at_least: [Function (anonymous)],
//       at_most: [Function (anonymous)],
//       ceil: [Function (anonymous)],
//       divided_by: [Function (anonymous)],
//       floor: [Function (anonymous)],
//       minus: [Function (anonymous)],
//       modulo: [Function (anonymous)],
//       times: [Function (anonymous)],
//       round: [Function: round],
//       plus: [Function: plus],
//       url_decode: [Function: url_decode],
//       url_encode: [Function: url_encode],
//       cgi_escape: [Function: cgi_escape],
//       uri_escape: [Function: uri_escape],
//       slugify: [Function (anonymous)],
//       join: [Function (anonymous)],
//       last: [Function (anonymous)],
//       first: [Function (anonymous)],
//       reverse: [Function (anonymous)],
//       sort: [GeneratorFunction: sort],
//       sort_natural: [Function: sort_natural],
//       size: [Function: size],
//       map: [GeneratorFunction: map],
//       sum: [GeneratorFunction: sum],
//       compact: [Function: compact],
//       concat: [Function: concat],
//       push: [Function: push],
//       unshift: [Function: unshift],
//       pop: [Function: pop],
//       shift: [Function: shift],
//       slice: [Function: slice],
//       where: [GeneratorFunction: where],
//       reject: [GeneratorFunction: reject],
//       where_exp: [GeneratorFunction: where_exp],
//       reject_exp: [GeneratorFunction: reject_exp],
//       group_by: [GeneratorFunction: group_by],
//       group_by_exp: [GeneratorFunction: group_by_exp],
//       has: [GeneratorFunction: has],
//       has_exp: [GeneratorFunction: has_exp],
//       find_index: [GeneratorFunction: find_index],
//       find_index_exp: [GeneratorFunction: find_index_exp],
//       find: [GeneratorFunction: find],
//       find_exp: [GeneratorFunction: find_exp],
//       uniq: [Function: uniq],
//       sample: [Function: sample],
//       date: [Function: date],
//       date_to_xmlschema: [Function: date_to_xmlschema],
//       date_to_rfc822: [Function: date_to_rfc822],
//       date_to_string: [Function: date_to_string],
//       date_to_long_string: [Function: date_to_long_string],
//       append: [Function: append],
//       prepend: [Function: prepend],
//       lstrip: [Function: lstrip],
//       downcase: [Function: downcase],
//       upcase: [Function: upcase],
//       remove: [Function: remove],
//       remove_first: [Function: remove_first],
//       remove_last: [Function: remove_last],
//       rstrip: [Function: rstrip],
//       split: [Function: split],
//       strip: [Function: strip],
//       strip_newlines: [Function: strip_newlines],
//       capitalize: [Function: capitalize],
//       replace: [Function: replace],
//       replace_first: [Function: replace_first],
//       replace_last: [Function: replace_last],
//       truncate: [Function: truncate],
//       truncatewords: [Function: truncatewords],
//       normalize_whitespace: [Function: normalize_whitespace],
//       number_of_words: [Function: number_of_words],
//       array_to_sentence_string: [Function: array_to_sentence_string],
//       default: [Function: defaultFilter],
//       raw: [Object],
//       jsonify: [Function: json],
//       to_integer: [Function: to_integer],
//       json: [Function: json],
//       inspect: [Function: inspect],
//       inputPathToUrl: [Function (anonymous)],
//       slug: [Function (anonymous)],
//       url: [Function (anonymous)],
//       log: [Function (anonymous)],
//       getCollectionItemIndex: [Function (anonymous)],
//       getCollectionItem: [Function (anonymous)],
//       getPreviousCollectionItem: [Function (anonymous)],
//       getNextCollectionItem: [Function (anonymous)],
//       renderTransforms: [Function (anonymous)],
//       uwuawa: [Function (anonymous)]
//     },
//     tags: {
//       assign: [class AssignTag extends Tag],
//       for: [class ForTag extends Tag],
//       capture: [class CaptureTag extends Tag],
//       case: [class CaseTag extends Tag],
//       comment: [class CommentTag extends Tag],
//       include: [class IncludeTag extends Tag],
//       render: [class RenderTag extends Tag],
//       decrement: [class DecrementTag extends Tag],
//       increment: [class IncrementTag extends Tag],
//       cycle: [class CycleTag extends Tag],
//       if: [class IfTag extends Tag],
//       layout: [class LayoutTag extends Tag],
//       block: [class BlockTag extends Tag],
//       raw: [class RawTag extends Tag],
//       tablerow: [class TablerowTag extends Tag],
//       unless: [class UnlessTag extends Tag],
//       break: [class BreakTag extends Tag],
//       continue: [class ContinueTag extends Tag],
//       echo: [class EchoTag extends Tag],
//       liquid: [class LiquidTag extends Tag],
//       '#': [class InlineCommentTag extends Tag],
//       getBundle: [class (anonymous) extends Tag],
//       getBundleFileUrl: [class (anonymous) extends Tag]
//     },
//     options: {
//       root: [Array],
//       layouts: [Array],
//       partials: [Array],
//       relativeReference: true,
//       jekyllInclude: false,
//       keyValueSeparator: ':',
//       cache: undefined,
//       extname: '.liquid',
//       fs: [Object: null prototype],
//       dynamicPartials: true,
//       jsTruthy: false,
//       dateFormat: '%A, %B %-e, %Y at %-l:%M %P %z',
//       locale: 'en-GB',
//       trimTagRight: false,
//       trimTagLeft: false,
//       trimOutputRight: false,
//       trimOutputLeft: false,
//       greedy: true,
//       tagDelimiterLeft: '{%',
//       tagDelimiterRight: '%}',
//       outputDelimiterLeft: '{{',
//       outputDelimiterRight: '}}',
//       preserveTimezones: false,
//       strictFilters: true,
//       strictVariables: false,
//       ownPropertyOnly: true,
//       lenientIf: false,
//       globals: {},
//       keepOutputType: false,
//       operators: [Object],
//       memoryLimit: Infinity,
//       parseLimit: Infinity,
//       renderLimit: Infinity,
//       outputEscape: undefined
//     },
//     parser: Parser {
//       liquid: [Circular *1],
//       cache: undefined,
//       fs: [Object: null prototype],
//       parseFile: [GeneratorFunction: _parseFile],
//       loader: [Loader],
//       parseLimit: [Limiter]
//     }
//   },
//   page: {
//     inputPath: './src/pages/template/index.html',
//     fileSlug: 'template',
//     filePathStem: '/pages/template/index',
//     outputFileExtension: 'html',
//     templateSyntax: 'liquid',
//     date: 2025-06-20T02:02:59.111Z,
//     rawInput: '<!DOCTYPE html>\r\n' +
//       '<html lang="en">\r\n' +
//       '<head>\r\n' +
//       '\t<meta charset="UTF-8">\r\n' +
//       '\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n' +
//       '\t<title>Document</title>\r\n' +
//       '\t<script src="main.js"></script>\r\n' +
//       `\t<link rel="stylesheet" href="{{ 'main.css' | uwuawa }}">\r\n` +
//       '</head>\r\n' +
//       '<body>\r\n' +
//       '\t<h1>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eligendi quo laboriosam sapiente libero neque commodi recusandae repudiandae, sit ratione placeat debitis atque, porro quos doloribus inventore ipsa officia nostrum officiis.</h1>\r\n' +
//       '</body>\r\n' +
//       '</html>',
//     url: '/template/',
//     outputPath: './__dist/template/index.html'
//   },
//   eleventy: {
//     version: '3.1.1',
//     generator: 'Eleventy v3.1.1',
//     env: {
//       source: 'cli',
//       runMode: 'build',
//       config: 'C:/Users/awa/Documents/coding/awasomewebsite/.eleventy.js',
//       root: 'C:/Users/awa/Documents/coding/awasomewebsite'
//     },
//     directories: {
//       input: './src/',
//       inputFile: undefined,
//       inputGlob: undefined,
//       data: './src/modules/_data/',
//       includes: './src/modules/_includes/',
//       layouts: './src/modules/_layouts/',
//       output: './__dist/'
//     }
//   }
// }
