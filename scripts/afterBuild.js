import "dotenv/config";
const { FOLDER_BUILD, FOLDER_DEV, FOLDER_TEMP, FULL_BUILD, FULL_START, PORT } = process.env;



// Print the directory structure of the built site
import printTree from "./print-dist-tree.js";

FULL_BUILD !== undefined
	? console.log(await printTree(FOLDER_BUILD))
	: console.log(await printTree(FOLDER_DEV));



// If the server is running, print the URL
if (FULL_START !== undefined) console.log(`\Build finished, server at http://localhost:${PORT}\n`);
