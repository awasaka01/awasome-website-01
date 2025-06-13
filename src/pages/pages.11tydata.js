// Brings all /src/pages/abcde/index.html to just be /src/abcde/index.html during build
// Overwrite by setting dirNameOverride: "new-folder-name"
export default {
	permalink: function ({ title, dirNameOverride }) {
		return `/${dirNameOverride || this.slugify(title)}/index.html`;
	},
};
