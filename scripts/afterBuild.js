import "dotenv/config";

import * as config from "../config.js";



// Print the directory structure of the built site
import printTree from "./print-dist-tree.js";

(async () => {
	console.log(await printTree(config.paths.output));
})();

