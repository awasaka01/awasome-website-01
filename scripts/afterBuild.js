import "dotenv/config";

// Print the directory structure of the built site
import printTree from "./print-dist-tree.js";

process.argv.includes("-b") // specify -b to use build folder instead of dev
	? console.log(await printTree(process.env.FOLDER_BUILD))
	: console.log(await printTree(process.env.FOLDER_DEV));

