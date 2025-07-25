import "dotenv/config";
const { FOLDER_BUILD, FOLDER_DEV, FOLDER_TEMP, FULL_BUILD, FULL_START } = process.env;
import chalk from "chalk";


// Create all the folders if they don't exist
import fs from "fs";
const folders = [FOLDER_BUILD, FOLDER_DEV, FOLDER_TEMP];

for (const folder of folders) {
	if (!fs.existsSync(folder)) {
		console.log(chalk.blue(`Didn't exist, creating folder  : /${folder}/`));
		fs.mkdirSync(folder);
	}
}



// Empty the folders that are going to be used
const foldersToEmpty = [FOLDER_TEMP, FULL_BUILD !== undefined ? FOLDER_BUILD : FOLDER_DEV];

for (const folder of foldersToEmpty) {
	if (!fs.existsSync(folder)) continue;
	const files = fs.readdirSync(folder, { withFileTypes: true });
	if (files.length === 0) continue;
	for (const file of files) {
		fs.rmSync(`${folder}/${file.name}`, { recursive: true, force: true });
	}
	console.log(chalk.blue("Emptied Folder: " + chalk.white(`/${folder}/`)));
}


//
