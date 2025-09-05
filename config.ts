import nodepath from "node:path";
import bl from "browserslist";
import { normalizePath } from "vite";

namespace config {

	const path = (path : string) => normalizePath(nodepath.resolve(__dirname, path));

	export const paths = {
		"root": path("./src"),
		"dist": path("./__production"),
		"cache": path("./____cache"),
		"public": path("./public"),

		"copy": [], // vite-plugin-static-copy
		"util": path("./util/main.ts"),

		"scss": [path("./src/_styles")],
		"includes": path("./src/_includes"),
	};
	paths.copy = [{
		src: path("./src/assets/**/*.*"),
		dest: "./assets",
		rename: (fileName : string, fileExtension : string, fullPath : string) => fileName + "." + fileExtension,
	}];
	// console.log("Paths: ", paths);


	export const port = 8080;

	export const browserslist = bl(">=0.1%, not dead, not IE 11, not ios <= 14"); // console.log(browserslist);

	export const globalVentoData = { // Data to pass to Vento templates, then can be accessd wuih {{ key }}
		"typey": "test",
	};
}




export default config;
