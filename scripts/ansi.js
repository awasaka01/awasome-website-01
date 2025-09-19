#!/usr/bin/env node
// AI GENERATED CODE!! :[
// AI GENERATED CODE!! :[
// AI GENERATED CODE!! :[


const args = process.argv.slice(2);
const useFg = args.includes("--fg"); // flag to switch to foreground

// --- Extra ANSI sequences ---
const sgrCodes = {
	0: "Reset",
	1: "Bold",
	2: "Dim",
	3: "Italic",
	4: "Underline",
	5: "Blink",
	6: "RapidBlink",
	7: "Reverse",
	8: "Conceal",
	9: "Strike",
	21: "DoublyUnderlined",
};

console.log("Extra ANSI sequences (SGR codes):");
Object.keys(sgrCodes).sort((a, b) => a - b).forEach((code) => {
	const name = sgrCodes[code];
	console.log(`\x1b[${code}m${name.padEnd(20)} Sample Text\x1b[0m`);
});

console.log("\nHow to use colors in this script:");
console.log("Foreground: \\e[38;5;<n>m (where n = 0-255)");
console.log("Background: \\e[48;5;<n>m (where n = 0-255)");
console.log("Example: \\e[38;5;196mRed Text\\e[0m and \\e[48;5;21mBlue Background\\e[0m\n");

// --- Precompute fg for 256 colors ---
const fgColors = new Array(256).fill(37);

// Preset 16 manual mapping
for (let i = 0; i <= 15; i++) {
	if ([0, 1, 2, 4, 5, 6, 8].includes(i)) fgColors[i] = 37;
	else fgColors[i] = 30;
}

// 6x6x6 cube
for (let code = 16; code <= 231; code++) {
	const c = code - 16;
	const r = Math.floor(c / 36);
	const g = Math.floor((c % 36) / 6);
	const b = c % 6;
	const R = Math.floor(r * 255 / 5);
	const G = Math.floor(g * 255 / 5);
	const B = Math.floor(b * 255 / 5);
	const lum = Math.floor((2126 * R + 7152 * G + 722 * B) / 10000);
	fgColors[code] = lum > 127 ? 30 : 37;
}

// Grayscale
for (let code = 232; code <= 255; code++) {
	const lum = (code - 232) * 10 + 8;
	fgColors[code] = lum > 127 ? 30 : 37;
}

// Print function
function printBlock (code) {
	if (useFg) {
		process.stdout.write(`\x1b[38;5;${code}m${code.toString().padStart(4, " ")}\x1b[0m`);
	} else {
		process.stdout.write(`\x1b[48;5;${code}m\x1b[${fgColors[code]}m${code.toString().padStart(4, " ")}\x1b[0m`);
	}
}

console.log("ANSI 256-color chart with maximum contrast numbers\n");

// --- Preset 16 colors ---
for (let i = 0; i <= 15; i++) printBlock(i);
console.log("\n");

// --- Extra SGR codes visually displayed above the cube ---
console.log("Text effects examples:\n");
Object.keys(sgrCodes).sort((a, b) => a - b).forEach((code) => {
	const name = sgrCodes[code];
	console.log(`Code ${code.padStart(3, " ")}: \x1b[${code}m${name} Sample Text\x1b[0m`);
});
console.log("\n");

// --- 6x6x6 cube: 6 rows × 36 columns ---
for (let r = 0; r < 6; r++) {
	for (let g = 0; g < 6; g++) {
		for (let b = 0; b < 6; b++) {
			const code = 16 + 36 * r + 6 * g + b;
			printBlock(code);
		}
	}
	console.log();
}
console.log();

// --- Grayscale ---
for (let i = 232; i <= 255; i++) printBlock(i);
console.log();
