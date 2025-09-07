// Some config is seperated into a seperate file so that it's seperate

import { resolve } from "node:path";
import browserslist from "browserslist";


export const env = {
	"FULLBUILD": process.env.FULLBUILD !== undefined, // Enable all unnecessary features like minification
	"NEOCITIES": process.env.NEOCITIES !== undefined, // Disable some features for a neocities build
};


// Resolve relative path to absolute, just ensuring consistency
const path = (path) => resolve(__dirname, path).replace(/\\/g, "/");

export const paths = {
	"source": path("./src"),
	"output": path("./__production"),
	"util": path("./util/main.ts"),
	"scss": path("./src/_styles"),
	"assets": path("./src/_assets"),
	"includes": path("./src/_includes"),
};
// console.log("Paths: ", paths);


export const port = 8080;


// used by nothing
export const supported_browsers = browserslist(">=0.1%, not dead, not IE 11, not ios <= 14"); // console.log(browserslist);


// sass-embedded [https://sass-lang.com/documentation/js-api/interfaces/options/]
export const scss = { loadPaths: [paths.scss], style: env.FULLBUILD ? "compressed" : "expanded", alertColor: true };


// vento [https://vento.js.org/configuration/]
export const vento = { dataVarname: "global", includes: paths.includes };
export const vento_data = { // data to pass to Vento templates, then can be accessd with {{ key }}
	"env": { ...process.env, ...env },
};




