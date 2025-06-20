// ! Require file type to be added as template langauge + addExtension, even if does nothing
// eleventyConfig.addExtension("js", { outputFileExtension: "js", compile: (x) => () => x });
export default {
	eleventyComputed: {
		permalink: function ({ page }) {
			const outputPath = page.filePathStem.split("/").slice(2).join("/") + "." + page.outputFileExtension; // remove /pages/ from path
			console.log(`permalinking: ${page.inputPath} -> ${outputPath}`);
			return outputPath;
		},
	},
};
/*
page: {
    inputPath: './src/pages/blog/layout.html',
    fileSlug: 'layout',
    filePathStem: '/pages/blog/layout',
    outputFileExtension: 'html',
    templateSyntax: 'liquid',
    date: 2025-06-13T13:33:54.371Z,
    rawInput: '\t\r\n' +
      '<!doctype html>\r\n' +
      '<html lang="en">\r\n' +
      '  <head>\r\n' +
      '    <meta charset="utf-8">\r\n' +
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n' +
      '    <title>{{ title }}</title>\r\n' +
      '  </head>\r\n' +
      '  <body>\r\n' +
      '    {{ content | safe }}\r\n' +
      '  </body>\r\n' +
      '</html>'
  },
  collections: {}
*/
