const { feedPlugin } = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {

eleventyConfig.addPassthroughCopy("src/**/!(_)*.{js,json,txt}");
eleventyConfig.addPassthroughCopy("src/media/**");

eleventyConfig.setQuietMode(true);

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

eleventyConfig.setServerOptions({
	// Default values are shown:

	// Whether the live reload snippet is used
	liveReload: true,

	// Whether DOM diffing updates are applied where possible instead of page reloads
	domDiff: false,

	// The starting port number
	// Will increment up to (configurable) 10 times if a port is already in use.
	port: 8080,

	// Additional files to watch that will trigger server updates
	// Accepts an Array of file paths or globs (passed to `chokidar.watch`).
	// Works great with a separate bundler writing files to your output folder.
	// e.g. `watch: ["_site/**/*.css"]`
	watch: ["./__dist/**/*.css"],

	// Show the dev server version number on the command line
	showVersion: false,

	// Added in Dev Server 2.0+
	// An object mapping a URLPattern pathname to a callback function
	// for on-request processing (read more below).
	onRequest: {},
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
};
