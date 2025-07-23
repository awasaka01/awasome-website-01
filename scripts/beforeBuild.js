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
