// Some config is seperated into a seperate file so that it's seperate

import { fileURLToPath } from "node:url";
import { relative } from "node:path";
import browserslist from "browserslist";


export const env = {
	"FULLBUILD": process.env.FULLBUILD !== undefined, // Enable all unnecessary features like minification
	"NEOCITIES": process.env.NEOCITIES !== undefined, // Disable some features for a neocities build
};


// Resolve relative path to absolute, just ensuring consistency
const abs = (p) => fileURLToPath(new URL(p, import.meta.url)).replace(/\\/g, "/");

export const paths = {
	"source": abs("./src"),
	"output": abs("./__production"),
	"util": abs("./awa-util/core.ts"),
	"scss": abs("./src/_styles"),
	"includes": abs("./src/_includes"),
};
export const directories = {
	"images": "images",
};
console.log("Paths:", paths);



export const port = 8080;


// used by nothing
export const supported_browsers = browserslist(">=0.1%, not dead, not IE 11, not ios <= 14"); // console.log(browserslist);


// sass-embedded [https://sass-lang.com/documentation/js-api/interfaces/options/]
/** @type {import("sass-embedded").StringOptions} */
export const scss = {
	loadPaths: [paths.scss], style: env.FULLBUILD ? "compressed" : "expanded", alertColor: true,
	sourceMap: !env.FULLBUILD, // Enable source maps if not for production
};


// vento [https://vento.js.org/configuration/]
export const vento = { dataVarname: "global", includes: relative(".", paths.includes) };
export const vento_data = { // data to pass to Vento templates, then can be accessd with {{ key }}
	"env": { ...process.env, ...env },
};




