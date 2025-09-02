// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({

	root: ".", // Project root directory (default is current working directory)
	srcDir: "src", // Source directory for Astro files
	publicDir: "public", // Static assets directory
	outDir: "dist", // Build output directory
	cacheDir: ".astro-cache", // Directory for cache files

	vite: {
		build: {
			assetsInlineLimit: 0,
		},
	}, // Vite config overrides (empty by default)

	server: {
		host: false, // Listen on all IP addresses (default false = localhost)
		port: 8080, // Dev server port
		open: true, // Open browser on server start
		headers: {}, // Custom headers to serve
	},
	build: {
		format: "directory", // 'directory' or 'file' (file outputs single HTML files, directory outputs folders)
		client: "client", // Client build mode (default: 'client')
		server: "server", // Server build mode (default: 'server')
		assets: "assets", // Assets directory in build output
	},
	compressHTML: false, // Enable HTML compression/minification (default false)
});
