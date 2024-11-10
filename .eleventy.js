module.exports = function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("src/assets/css/style.css");
	eleventyConfig.setBrowserSyncConfig({
		files: "./_site/css/**/*.css",
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
