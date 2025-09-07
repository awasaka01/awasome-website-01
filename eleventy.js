// maybe override eleventy config auto restarting

import * as config from "./eleventy.config.js";


const eleventy_config = {
    dir: {
        input: config.dir.source,
        includes: "modules/_includes",
		// layouts: undefined,
        // data: undefined,
		output: config.dir.output,
        layouts: "modules/_layouts",
    },
    htmlTemplateEngine: "vto",
    templateFormats: ["html", "js", "vto", "css", "scss", "jsx", "ts", "tsx", "md", "11ty.js", "11ty.ts", "11ty.cjs", "11ty.mjs"],
}; 
export { eleventy_config as config };



import { defineConfig } from "11ty.ts";
export default defineConfig((eleventyConfig) => {
	eleventyConfig.addWatchTarget("./config.ts");
	config.
});
