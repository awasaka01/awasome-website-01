// // /*
// // ███████╗██╗   ██╗███╗   ██╗███╗   ██╗██╗   ██╗███╗   ███╗██╗██╗  ██╗██╗   ██╗        ██╗███████╗
// // ██╔════╝██║   ██║████╗  ██║████╗  ██║╚██╗ ██╔╝████╗ ████║██║██║ ██╔╝██║   ██║        ██║██╔════╝
// // ███████╗██║   ██║██╔██╗ ██║██╔██╗ ██║ ╚████╔╝ ██╔████╔██║██║█████╔╝ ██║   ██║        ██║███████╗
// // ╚════██║██║   ██║██║╚██╗██║██║╚██╗██║  ╚██╔╝  ██║╚██╔╝██║██║██╔═██╗ ██║   ██║   ██   ██║╚════██║
// // ███████║╚██████╔╝██║ ╚████║██║ ╚████║   ██║   ██║ ╚═╝ ██║██║██║  ██╗╚██████╔╝██╗╚█████╔╝███████║
// // ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝   ╚═╝   ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝ ╚════╝ ╚══════╝
// // */
// import chalk from "chalk";
// import Canvas from "canvas";
// import fastbench from "fastbench";

// import readline from "readline";
// /** Escapes all ANSI escape codes, so they can be shown in the terminal */
// export const showANSI = (str) => str.replace(/\x1b(\[[0-9;]+m)/g, "$&\\x1b$1\x1b[0m");
// (async () => {
// 	const img = await Canvas.loadImage("./myimage.png");
// 	if (!img) throw new Error("Image not found");

// 	const canvas = Canvas.createCanvas(img.width, img.height);
// 	const ctx = canvas.getContext("2d");
// 	ctx.drawImage(img, 0, 0);

// 	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// 	const pixels = imageData.data;



// // 	console.log(out);
// // 	// process.stdout.write("▀▄\n▀▀▀"); // red TL
// // 	// process.stdout.write("l▘▖▘▖▘▖▘▖▘▖▘▖▘▖▘▖▘▖"); // green BL in same spot


// 	const terminalWidth = process.stdout.columns ?? 80;
// function task (shine) {

// 	if (img.width > terminalWidth && !(process.argv.includes("--force") || process.argv.includes("-f"))) throw new Error("Image too wide for terminal");



// 	// 0.0 0.1 1.0 1.1
// 	const fg = ([r, g, b]) => `\x1b[38;2;${r};${g};${b}m`;
// 	const bg = ([r, g, b]) => `\x1b[48;2;${r};${g};${b}m`;

// 	let out = [];
// 	let lastWasTransparentBg = false;

// 	// Loop over each row 2 at a time
// 	for (let y = 0; y < img.height; y += 2) {
// 		const row = [];
// 		for (let x = 0; x < img.width; x++) {

// 			const index0 = (y * img.width + x) * 4;
// 			const index1 = ((y + 1) * img.width + x) * 4;


// 			const fgc = pixels[index0 + 3] === 0 ? false
// 			: shine > x + y - 8 && shine < x + y ? [255, 255, 255]
// 			: [pixels[index0], pixels[index0 + 1], pixels[index0 + 2]];
// 			const bgc = pixels[index1 + 3] === 0 || index1 >= pixels.length ? false
// 			: shine > x + y - 8 && shine < x + y ? [255, 255, 255]
// 			: [pixels[index1], pixels[index1 + 1], pixels[index1 + 2]];

// 			if (fgc && bgc) { row.push(fg(fgc) + bg(bgc) + "▀"); lastWasTransparentBg = false; }
// 			else {
// 				if (!lastWasTransparentBg) row.push("\x1b[0m");
// 				lastWasTransparentBg = true;
// 				if (fgc && !bgc) { row.push(fg(fgc) + "▀"); }
// 				else if (!fgc && bgc) { row.push(fg(bgc) + "▄"); }
// 				else { row.push(" "); }
// 			}
// 		}
// 		if (!lastWasTransparentBg) row.push("\x1b[0m");
// 		out.push(row.join(""));
// 	}
// 	return out;



// 	// setInterval(() => process.stdout.write("a"), 100);

// 	// console.log(showANSI(out.join("")));
// }
// // ▄
// // ▀
// const rr = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// let first = true;
// function o (i) {
// 	if (first) { first = false; }
// 	else { process.stdout.moveCursor(0, -7); }
// 	console.log(chalk.hex("#3e2929")("▀".repeat(terminalWidth)));
// 	console.log(`\x1b[0m${task(i).join("\n")}\x1b[0m`);
// 	console.log(chalk.hex("#3e2929")("▀".repeat(terminalWidth)));
// 	return new Promise((resolve) => setTimeout(resolve, 0));
// }

// for (let i = 0; i < img.width + 7; i++) {
// 	await o(i);
// }

// 	// const run = fastbench([task], 700);
// 	// run();


// })();



const _log = console.log;

console.log = () => { _log("a"); };


console.log("object");

const JSCANVAS = true;

let getImageData; // [rgba]

if (JSCANVAS === true) {
	const Canvas = import("canvas");

	getImageData = async (img) => {
		const canvas = await Canvas.createCanvas(img.width, img.height);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
		return canvas;
	};
}

