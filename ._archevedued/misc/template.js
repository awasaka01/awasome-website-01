export const config = {

	priority: 10, // Higher numbers run first
	critical: true, // Whether or not this transform is critical for page function, if false, will be skipped during dev builds


};

export default (eleventyConfig) => { eleventyConfig.addPreprocessor("fillRemainingSpace", "html", (data, content) => {

	return content;

}); };
