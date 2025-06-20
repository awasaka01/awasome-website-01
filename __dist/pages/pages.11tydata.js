export default {
	eleventyComputed: {
		permalink: function (data) {
			return data.page.fileSlug + "/index." + data.page.outputFileExtension;
		},
	},
};
