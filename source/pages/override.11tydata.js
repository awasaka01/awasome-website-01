

// what directory data files do: [https://www.11ty.dev/docs/data-template-dir/]
// how to change file name: [https://www.11ty.dev/docs/config/#change-base-file-name-for-data-files] 


export default {
	eleventyComputed: {
		permalink: (data) => {
			return data.page.filePathStem.replace("/pages/", "") + "." + data.page.outputFileExtension;
		},
	},
};

// ! Requires file type to be added as template langauge + addExtension, even if does nothing, or they're just skipped from permalinking
// eleventyConfig.addExtension("js", { outputFileExtension: "js", compile: (x) => () => x });

/*
data: {
  eleventyComputed: { permalink: [Function: permalink] },
  collections: {},
  permalink: undefined
  page: {
    inputPath: './source/pages/imagetotext/index.html',
    fileSlug: 'imagetotext',
    filePathStem: '/pages/imagetotext/index',
    outputFileExtension: 'html',
    templateSyntax: 'vto',
    date: 2025-09-20T20:59:07.546Z,
    rawInput: '',
    url: '/pages/imagetotext/',
    outputPath: ''
  },
  eleventy: {
    version: '3.1.1',
    generator: 'Eleventy v3.1.1',
    env: {
      source: 'cli',
      runMode: 'build',
      config: 'C:/Users/awa/Documents/coding/awasome-website-01/__compiled/engine/eleventy.js',
      root: 'C:/Users/awa/Documents/coding/awasome-website-01/__compiled/engine'
    },
    directories: {
      input: './source/',
      inputFile: undefined,
      inputGlob: undefined,
      data: './source/_data/',
      includes: './source/source/_templates/',
      layouts: undefined,
      output: './^~^ website/'
    }
  },
  pkg: {
    name: 'awasomewebsite',
    ...
  },
}
*/
