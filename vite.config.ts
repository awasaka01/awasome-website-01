

const ENVIRONMENT = {
	BUILD_MINIMAL: (process.env.F_BUILD_MINIMAL?.trim() ?? "true") === "true",
	BUILD_TARGET: Number(process.env.F_BUILD_TARGET?.trim()) || 0, // 0: anywhere/full features, 1: neocities/limited features
	SOURCE_MAPS: process.env.F_SOURCE_MAPS?.trim() === "true",
};
console.log(`ENVIRONMENT VARIABLES: ${JSON.stringify(ENVIRONMENT)}`);

import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";

import config from "./config.js";

// Vento Templating
import matter from "gray-matter";
import vento from "ventojs";
import type { Options } from "ventojs";
const VentoConfig : Options = { // [https://vento.js.org/configuration/]
	includes: config.paths.includes,
	autoDataVarname: true,
	dataVarname: "global",
	autoescape: true,
};
const VentoFilters = {
	// [https://vento.js.org/configuration/#filters]
	json: (value : any) => JSON.stringify(value),
};

// Vite + Plugins
import { defineConfig } from "vite";
import type { PluginOption } from "vite";
import { browserslistToTargets as browserslist_lightningcss } from "lightningcss";
import browserslist_esbuild from "browserslist-to-esbuild";
import { removeConsolePlugin } from "@slaykit/remove-console-plugin";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import FullReload from "vite-plugin-full-reload";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";


export default defineConfig({

	root: config.paths.root,
	cacheDir: config.paths.cache,
	publicDir: config.paths.public,

	plugins: [
		FullReload(["./src/modules/**/*"]), VentoTemplatePlugin(), react(),
		viteStaticCopy({ targets: config.paths.copy }), RunAfterBuild(),

		// Plugins exclusive to production
		...(ENVIRONMENT.BUILD_MINIMAL ? [] : [
			removeConsolePlugin(),
			ViteMinifyPlugin({
				removeScriptTypeAttributes: true, collapseBooleanAttributes: true, removeRedundantAttributes: true,
				removeOptionalTags: false, removeComments: true, minifyURLs: true, minifyCSS: true, minifyJS: true,
			}),
		]),
{
  name: "fix-html-paths",
  writeBundle: {
    sequential: true,
    async handler (options, bundle) {
      console.log("\n🔧 Fixing HTML paths after write...");

      const fs = await import("fs/promises");
      const path = await import("path");
      const glob = (await import("fast-glob")).default;

      const outputDir = options.dir;
      console.log("Output directory:", outputDir);

      // Find HTML files that were written to pages/ subdirectories
      const htmlFiles = glob.sync(`${outputDir}/pages/**/index.html`);
      console.log("Found HTML files to move:", htmlFiles);

      for (const htmlFile of htmlFiles) {
        // Calculate new path: remove "pages/" from the path
        const relativePath = path.relative(outputDir, htmlFile);
        const newPath = relativePath.replace("pages/", "");
        const newFullPath = path.join(outputDir, newPath);

        console.log(`📁 Moving: ${relativePath} -> ${newPath}`);

        // Create target directory if needed
        await fs.mkdir(path.dirname(newFullPath), { recursive: true });

        // Move the file
        await fs.rename(htmlFile, newFullPath);
      }

      // Clean up empty pages directory if it exists
      try {
        const pagesDir = path.join(outputDir, "pages");
        const remaining = await fs.readdir(pagesDir);
        if (remaining.length === 0) {
          await fs.rmdir(pagesDir);
          console.log("🗑️ Cleaned up empty pages directory");
        }
      } catch (err) {
        // Directory might not exist or might not be empty, that's fine
      }

      console.log("✅ HTML paths fixed!\n");
    },
  },
},
	],

	resolve: {
		alias: {
			"@util": config.paths.util,
		},
	},

	build: {
		sourcemap: ENVIRONMENT.SOURCE_MAPS ? "inline" : false,
		target: browserslist_esbuild(config.browserslist),
		outDir: config.paths.dist,
		reportCompressedSize: false,
		assetsInlineLimit: 0,
		emptyOutDir: true,
		minify: ENVIRONMENT.BUILD_MINIMAL ? false : "esbuild",
		rollupOptions: {
		input: allIndexesInSrc(),

      output: {
        entryFileNames: (chunkInfo) => {
			console.log(chunkInfo);
          // Map the safe key back to the actual path structure
          const name = chunkInfo.name;
          if (name === "index") {
            return "index.js";
          }
          // Convert back from safe key to path
          const actualPath = name.replace(/-/g, "/");
          return `${actualPath}/index.js`;
        },
      },
    },
	},
	css: {
		devSourcemap: ENVIRONMENT.SOURCE_MAPS,
		transformer: ENVIRONMENT.BUILD_MINIMAL ? undefined : "lightningcss",
		lightningcss: {
			targets: browserslist_lightningcss(config.browserslist),
		},
		preprocessorOptions: { scss: {
				loadPaths: config.paths.scss, // TODO sourceMap: true,
				sourceMapIncludeSources: ENVIRONMENT.SOURCE_MAPS,
		} },
	},
	server: { port: config.port, strictPort: true },
	preview: { port: config.port, strictPort: true },
});




function allIndexesInSrc () {
	// Match all HTML files in src (that don't start with _ or are in a directory that starts with _)
	let f = glob.sync(`${config.paths.root}/!(_)*{*/!(_)*,}.html`) as any;
	f = Object.fromEntries(f.map((f, i) => [i, f]));
	// console.log(f);
	return f;
}


//    <!-- htmlmin:ignore -->
function VentoTemplatePlugin () {
	const env = vento(VentoConfig);
	Object.entries(VentoFilters).forEach(([name, fn]) => (env.filters[name] = fn));
	return {
		name: "vento-transform-html",
		transformIndexHtml: {
			order: "pre" as const,
			async handler (html, ctx) { VentoConfig;
				env.cache.clear();
				// const file = fs.readFileSync(ctx.filename, "utf-8");
				const { content, data } = matter(html);
				const result = await env.runString(content, { ...config.globalVentoData, ...data });
				return result.content;
			},
		},
	} as PluginOption;
}

// Print output tree after build
import printTree from "./awa-util/print-dist-tree.js";
function RunAfterBuild () { return {
	name: "run-after-build",
	apply: "build",
	async closeBundle () {

		// Resort the dist folder
		fs.readdirSync;


		// Print output tree
		console.log(await printTree("./__production"));
	},
} as PluginOption; }
