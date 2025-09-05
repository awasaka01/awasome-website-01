console.log(`Vite Running`);

const ENVIRONMENT = {
	BUILD_MINIMAL: (process.env.F_BUILD_MINIMAL?.trim() ?? "true") === "true",
	BUILD_TARGET: Number(process.env.F_BUILD_TARGET?.trim()) || 0, // 0: anywhere/full features, 1: neocities/limited features
	SOURCE_MAPS: process.env.F_SOURCE_MAPS?.trim() === "true",
};
console.log(`ENVIRONMENT VARIABLES: ${JSON.stringify(ENVIRONMENT)}`);

import fs from "node:fs";
import path from "node:path";

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
import { browserslistToTargets as browserslist_lightningcss } from "lightningcss";
import browserslist_esbuild from "browserslist-to-esbuild";
import { removeConsolePlugin } from "@slaykit/remove-console-plugin";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import FullReload from "vite-plugin-full-reload";
import react from "@vitejs/plugin-react";


export default defineConfig({

	root: config.paths.root,
	cacheDir: config.paths.cache,

	plugins: [
		FullReload(["./src/modules/**/*"]), VentoTemplatePlugin(), react(),
		viteStaticCopy({ targets: config.paths.copy }),

		// Plugins exclusive to production
		...(ENVIRONMENT.BUILD_MINIMAL ? [] : [
			removeConsolePlugin(),
			ViteMinifyPlugin({
				removeScriptTypeAttributes: true, collapseBooleanAttributes: true, removeRedundantAttributes: true,
				removeOptionalTags: false, removeComments: true, minifyURLs: true, minifyCSS: true, minifyJS: true,
			}),
		]),
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
			input: "src/index.html",
			output: {
				entryFileNames: `[name]-[format]-[hash].js`,
				chunkFileNames: `[name]-[format]-[hash].js`,
				// assetFileNames: (assetInfo) => {
				// 	console.log(assetInfo, assetInfo.name);
				// 	return true ? `[name]-[format]-[hash][extname]` : `[name]-[hash][extname]`;
				// },
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



function VentoTemplatePlugin () {
	const env = vento(VentoConfig);

	console.log((env.tags));
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
	};
}

// <!-- htmlmin:ignore -->
