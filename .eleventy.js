// ANCHOR - User Config
const options = {
	scss: {
		// https://sass-lang.com/documentation/js-api/interfaces/stringoptions/
		loadPaths: ["./src/modules/_styles"], // TODO sourceMap: true,
	},

	serverOptions11ty: {
		// https://www.11ty.dev/docs/dev-server/
		liveReload: true,
		domDiff: true,
		port: 8080,
	},
};

// https://www.11ty.dev/docs/config/
export const config = {
	dir: {
		input: "src",
		output: "__dist",
		includes: "modules/_includes",
		data: "modules/_data",
		layouts: "modules/_layouts",
	},
	templateFormats: ["html", "js", "css", "scss", "jsx", "ts", "tsx", "njk", "md", "liquid", "11ty.js", "11ty.ts", "11ty.cjs", "11ty.mjs"],
};

/** [Intellisense Support] @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	eleventyConfig.ignores.add("_*");
	eleventyConfig.addGlobalData("nocache", `?nocache=${Date.now().toString(36)}`);
	eleventyConfig.setServerOptions({
		...options.serverOptions11ty,
		onRequest: {
			"/*": function (a) {
				console.log(a);
				return {
					status: 200,
					headers: {
						"Content-Type": "text/html",
					},
					body: "Hello.",
				};
			},
		},
		ready: function (server) {
		setTimeout(() => {
			console.log("Reloading.");
			server.reload();
		}, 5000);
	},
	});
}
