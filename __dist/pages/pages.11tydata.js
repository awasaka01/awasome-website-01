// Brings all /src/pages/abcde/index.html to just be /src/abcde/index.html during build
// Overwrite by setting dirNameOverride: "new-folder-name"
export default {
// 	 eleventyComputed: {
// 		permalink: function (data) {
// 	console.log(data.page.inputPath);
// },
	// console.log(data.page.inputPath);

	// return false;
	// return `/${data.dirNameOverride || this.slugify(data.title)}/index.${data.page.outputFileExtension}`;
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
