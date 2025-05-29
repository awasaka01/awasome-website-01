// !
// ! Every time this file is saved it will run again, also starting another chokidar watcher,
// ! Please CTRL+SHIFT+C kill the terminal each time you save this file
// !

// [https://www.npmjs.com/package/chokidar] [https://www.npmjs.com/package/scss-parser]


// Color generator imports
import chokidar from "chokidar"; // Because fs is bad
import { readFileSync, writeFileSync } from "node:fs";
import chroma from "chroma-js";
import { hex } from "ansis";
import { minify } from "html-minifier";
import UglifyJS from "uglify-js";

// Plugins
import lightningSass from "@11tyrocks/eleventy-plugin-sass-lightningcss";




export default function (eleventyConfig) {
	const startBuildTime = Date.now();

	eleventyConfig.setQuietMode(true);
	eleventyConfig.addPassthroughCopy("src/**/!(_)*.{json,txt}");
	eleventyConfig.addPassthroughCopy("src/media/");
	eleventyConfig.addPlugin(lightningSass);
	eleventyConfig.setServerOptions({
		port: 8080,
		htmlTemplateEngine: "njk",
		// watch: ["./__dist/**/*.css"],
		showVersion: false, domDiff: false, liveReload: true,
	});
	console.log(process.argv); // add support to watch with all build features enabled
/*
{
  inputPath: './src/pages/template/index.html',
  outputPath: './__dist/pages/template/index.html',
  url: '/pages/template/',
  page: {
    inputPath: './src/pages/template/index.html',
    fileSlug: 'template',
    filePathStem: '/pages/template/index',
    outputFileExtension: 'html',
    templateSyntax: 'liquid',
    date: 2025-01-28T05:52:52.864Z,
    rawInput: '\r\n' +
      '<!DOCTYPE html><html lang="en">\r\n' +
      '<head>{% include "head.html" %}</head>\r\n' +
      '<body>{% include "navbar.html" %}\r\n' +
      '\r\n' +
      '\r\n' +
      '\t<p>hai :3</p>\r\n' +
      '\r\n' +
      '\r\n' +
      '</body>\r\n' +
      '</html>',
    url: '/pages/template/',
    outputPath: './__dist/pages/template/index.html'
  },
  baseHref: undefined
}
*/

	//
	eleventyConfig.addTransform("minify-html", async function (content) {
		if (process.env.RUN_MODE !== "build") return content;
		if (this.page.outputFileExtension !== "html") return content;
		const start = Date.now();

		// https://www.npmjs.com/package/html-minifier#options-quick-reference
		const output = minify(content, { collapseBooleanAttributes: true, minifyCSS: true, minifyJS: true, removeComments: true, removeOptionalTags: true, removeRedundantAttributes: true, removeScriptTypeAttributes: true, removeTagWhitespace: true, minifyURLs: true, collapseWhitespace: true, conservativeCollapse: true });

		const time = (Date.now() - start).toString().padStart(3, " ");
		console.log(hex("#c83dff")`[${time}ms]  ☆  Minified: ${this.page.filePathStem}.${this.page.outputFileExtension}`);
		return output;
	});

	//
	eleventyConfig.addTemplateFormats("js");
	eleventyConfig.addExtension("js", {
		outputFileExtension: "js",
		compile: async (input, path) => {
			if (process.env.RUN_MODE !== "build") return async () => { return input; };

			const start = Date.now();
			let output = UglifyJS.minify(input, { toplevel: true }).code;

			const time = (Date.now() - start).toString().padStart(3, " ");
			console.log(hex("#c83dff")`[${time}ms]  ☆  Minified: ${path.replace("./src", "")}`);
			return async () => { return output; };
		},
	});



	// Automatically watch autocolors.json and generate autocolors.scss on change
	eleventyConfig.on("eleventy.before", async ({ directories, runMode }) => {

		// Make sure we only ever run once
		if (process.env.RUN_MODE !== undefined) return;
		process.env.RUN_MODE = runMode;
		process.env.START_TIME = Date.now();

		// Recompile colors once on build
		if (runMode === "build") { await updateColors();	}

		// When live-testing, watch the colors file for any changes and recompile
		else if (runMode === "serve" || runMode === "watch") {
			console.log(hex("#3dffef")`☆  Watching for color changes...`);

			let debounce = false;
			chokidar.watch("src/helpers/_autocolors.json").on("change", (event, path) => {
				if (debounce) return;
				debounce = true;
				setTimeout(() => { debounce = false; }, 100);
				updateColors();
			});
		}
	});



	function colorAdjust (iteration, color) {
		let [l, c, h] = chroma(color).oklch().map((x) => x || 0);
		l += iteration * 0.025;
		c += iteration * 0.003;
		h += iteration * 0.2;
		return chroma.oklch(l, c, h).hex();
	}

	async function updateColors () {


		// Extract the variable name and hex values from the json file
		const bases = JSON.parse(readFileSync("src/helpers/_autocolors.json"));

		// Configurable ways to expand each base color
		const expandedTypes = [
			{ amount: 15, id: (i) => `d${(16 - i).toString(16)}`, f: (i, hex) => colorAdjust(-(16 - i), hex) }, // Darken:    (i is inverted; only for a visually better order in the file)
			{ amount: 1, id: (i) => "", f: (i, hex) => "  " + hex }, // Base without auto tag:
			{ amount: 15, id: (i) => `l${i.toString(16)}`, f: (i, hex) => colorAdjust(i, hex) }, // Lighten:
		];


		// Generate the expanded colors
		let output = "/* stylelint-disable */\n\n\n";
		bases.forEach((base) => {

			// Generate all the expanded colors for the current base, in scss variable form
			const vars = [];
			expandedTypes.forEach((e) => {
				for (let i = 1; i <= e.amount; i++) {
					vars.push(`$${base.name}${e.id(i)}: ${e.f(i, base.color)};`);
			} });

			// Merge all expanded variables for the current base into lines
			output += `// Expanded colors for ${base.name}:\n${vars.join("\n")}\n\n`;
		});

		// Update the scss file, replacing all after the identifier 617761
		writeFileSync("src/helpers/_autocolors.scss", output);
	}
	eleventyConfig.on("eleventy.after", async ({ directories, results, runMode, outputMode }) => {
		if (runMode !== "build") return;

		const time = ((Date.now() - startBuildTime) / 1000);
		console.log(hex("#c5ff3d")`\n         ☆  Built in ${time}s!\n`);
	});


	return {
		dir: {
			input: "src",
			data: "_data",
			includes: "_includes",
			layouts: "_layouts",
			output: "__dist",
		},
	};
}
// eleventyConfig.addPlugin(feedPlugin, {
// 	type: "atom", // or "rss", "json"
// 	outputPath: "/feed.xml",
// 	collection: {
// 		name: "posts", // iterate over `collections.posts`
// 		limit: 10, // 0 means no limit
// 	},
// 	metadata: {
// 		language: "en",
// 		title: "Blog Title",
// 		subtitle: "This is a longer description about your blog.",
// 		base: "https://example.com/",
// 		author: {
// 			name: "Your Name",
// 			email: "", // Optional
// 		},
// 	},
// });


/*

{
  eleventy: {
    version: '3.1.0',
    generator: 'Eleventy v3.1.0',
    env: {
      source: 'cli',
      runMode: 'build',
      config: 'C:/Users/awa/Documents/coding/awasomewebsite/.eleventy.js',
      root: 'C:/Users/awa/Documents/coding/awasomewebsite'
    },
    directories: {
      input: './src/',
      inputFile: undefined,
      inputGlob: undefined,
      data: './src/_data/',
      includes: './src/_includes/',
      layouts: './src/_layouts/',
      output: './__dist/'
    }
  },
  pkg: {
    name: 'awasomewebsite',
    description: 'yes',
    version: '1.0.0',
    license: 'https://docs.npmjs.com/cli/v11/configuring-npm/package-json#license',
    keywords: [],
    main: 'index.js',
    type: 'module',
    homepage: 'https://github.com/awasaka01/awasome-website-01#readme',
    repository: {
      type: 'git',
      url: 'git+https://github.com/awasaka01/awasome-website-01.git'
    },
    scripts: {
      watch: 'eleventy --serve --incremental --quiet',
      build: 'rimraf __dist/ && eleventy --quiet',
      findrules: 'stylelint-find-new-rules'
    },
    dependencies: {
      '@11ty/eleventy': '^3.1.0',
      '@11ty/eleventy-plugin-rss': '^2.0.4',
      '@11tyrocks/eleventy-plugin-sass-lightningcss': '^1.3.0',
      ansis: '^4.1.0',
      'chroma-js': '^3.1.2',
      eleventy: '^1.0.7',
      'html-minifier': '^4.0.0',
      'npm-run-all': '^4.1.5',
      postcss: '^8.5.3',
      rimraf: '^6.0.1',
      sass: '^1.89.0',
      'stylelint-config-sass-guidelines': '^12.1.0',
      typescript: '^5.8.3',
      'uglify-js': '^3.19.3'
    },
    devDependencies: {
      '@stylistic/eslint-plugin': '^4.4.0',
      '@stylistic/stylelint-config': '^2.0.0',
      '@types/chroma-js': '^3.1.1',
      chokidar: '^4.0.3',
      gsap: '^3.13.0',
      'postcss-scss': '^4.0.9',
      'query-ast': '^1.0.5',
      'scss-parser': '^1.0.6',
      stylelint: '^16.19.1',
      'stylelint-config-clean-order': '^7.0.0',
      'stylelint-config-recess-order': '^6.0.0',
      'stylelint-config-standard-scss': '^15.0.1',
      'stylelint-define-config': '^16.19.0',
      'stylelint-find-new-rules': '^5.0.0',
      'stylelint-plugin-logical-css': '^1.2.3'
    }
  },
  page: {
    inputPath: './src/pages/template/main.js',
    fileSlug: 'main',
    filePathStem: '/pages/template/main',
    outputFileExtension: 'html',
    templateSyntax: 'js',
    date: 2025-01-28T05:52:52.878Z,
    rawInput: 'import {} from "awa";\r\n' +
      '\r\n' +
      'window.addEventListener("load", () => {\r\n' +
      '\r\n' +
      '\t//\r\n' +
      '\r\n' +
      '});\r\n',
    url: '/pages/template/main/',
    outputPath: './__dist/pages/template/main/index.html'
  },
  collections: {
    all: [
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object]
    ]
  }
}

*/
