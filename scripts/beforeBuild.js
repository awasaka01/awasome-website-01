import "dotenv/config";
import chalk from "chalk";

// Create all the folders if they don't exist
import fs from "fs";
const folders = [process.env.FOLDER_BUILD, process.env.FOLDER_DEV, process.env.FOLDER_TEMP];

for (const folder of folders) {
	if (!fs.existsSync(folder)) {
		console.log(chalk.blue(`Didn't exist, creating folder  : /${folder}/`));
		fs.mkdirSync(folder);
	}
}


// Clear folders that are going to be used\
const FLAG_FULL_BUILD = process.env.FULL_BUILD !== undefined;
const foldersToClear = [process.env.FOLDER_TEMP, FLAG_FULL_BUILD ? process.env.FOLDER_BUILD : process.env.FOLDER_DEV];

for (const folder of foldersToClear) {
	if (fs.existsSync(folder)) {
		console.log(chalk.red(`Clearing folder  : /${folder}/`));
		fs.rmSync(folder, { recursive: true, force: true });
	}
}
