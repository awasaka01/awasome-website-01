import chalk from "chalk";
import fs from "fs";

import * as config from "../config.js";


// Empty the dist folder
fs.rmSync(config.paths.output, { recursive: true, force: true });
chalk.red(`Emptied Folder: '${chalk.white(`/${config.paths.output}/`)}'`);


// Create all the folders if they don't exist
// const folders = [FOLDER_TEMP, FULL_BUILD !== undefined ? FOLDER_BUILD : FOLDER_DEV];

// for (const folder of folders) {
// 	if (!fs.existsSync(folder)) {
// 		console.log(chalk.blue(`Didn't exist, creating folder  : /${folder}/`));
// 		fs.mkdirSync(folder);
// 	}
// }



// // Empty the folders that are going to be used
// const foldersToEmpty = [FOLDER_TEMP, FULL_BUILD !== undefined ? FOLDER_BUILD : FOLDER_DEV];

// for (const folder of foldersToEmpty) {
// 	if (!fs.existsSync(folder)) continue;
// 	const files = fs.readdirSync(folder, { withFileTypes: true });
// 	if (files.length === 0) continue;
// 	for (const file of files) {
// 		fs.rmSync(`${folder}/${file.name}`, { recursive: true, force: true });
// 	}
// 	console.log(chalk.blue("Emptied Folder: " + chalk.white(`/${folder}/`)));
// }


// //
