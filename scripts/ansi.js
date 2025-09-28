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



console.log(`\x1b[0m\x1b[38;2;0;0;0m              \x1b[38;2;248;252;248maaww\x1b[38;2;0;0;0m                                              \x1b[0m
          \x1b[38;2;248;252;248maa\x1b[38;2;0;0;0m  \x1b[38;2;248;252;248mww\x1b[38;2;104;124;72maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m          \x1b[38;2;248;252;248maaww\x1b[38;2;0;0;0m                              \x1b[0m
          \x1b[38;2;152;167;136maa\x1b[38;2;248;252;248mwwaa\x1b[38;2;91;115;61mwwaa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m        \x1b[38;2;248;252;248maa\x1b[38;2;104;128;80mww\x1b[38;2;248;252;248maaww\x1b[38;2;0;0;0m                          \x1b[0m
          \x1b[38;2;248;252;248maa\x1b[38;2;91;115;61mww\x1b[38;2;104;124;72maa\x1b[38;2;248;252;248mww\x1b[38;2;91;115;61maaww\x1b[38;2;248;252;248maa\x1b[38;2;0;0;0m    \x1b[38;2;248;252;248mww\x1b[38;2;91;115;61maaww\x1b[38;2;88;116;64maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m                          \x1b[0m
            \x1b[38;2;248;252;248maa\x1b[38;2;91;115;61mwwaawwaaww\x1b[38;2;248;252;248maa\x1b[38;2;0;0;0m  \x1b[38;2;248;252;248mww\x1b[38;2;91;115;61maawwaa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m                          \x1b[0m
            \x1b[38;2;248;252;248maa\x1b[38;2;91;115;61mwwaawwaawwaa\x1b[38;2;248;252;248mww\x1b[38;2;91;115;61maawwaaww\x1b[38;2;248;252;248maa\x1b[38;2;0;0;0m  \x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m                      \x1b[0m
              \x1b[38;2;248;252;248maa\x1b[38;2;91;115;61mwwaawwaaww\x1b[38;2;248;252;248maa\x1b[38;2;91;115;61mwwaa\x1b[38;2;61;88;29mww\x1b[38;2;91;115;61maa\x1b[38;2;248;252;248mwwaa\x1b[38;2;91;115;61mww\x1b[38;2;248;252;248maaww\x1b[38;2;248;255;248maa\x1b[38;2;0;0;0m                \x1b[0m
              \x1b[38;2;248;252;248mww\x1b[38;2;91;115;61maawwaawwaawwaaww\x1b[38;2;61;88;29maa\x1b[38;2;88;112;64mww\x1b[38;2;248;252;248maa\x1b[38;2;91;115;61mww\x1b[38;2;248;252;248maaww\x1b[38;2;91;115;61maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m                \x1b[0m
                \x1b[38;2;248;252;248maa\x1b[38;2;91;115;61mwwaa\x1b[38;2;61;88;29mww\x1b[38;2;91;115;61maawwaa\x1b[38;2;61;88;29mwwaa\x1b[38;2;91;113;61mww\x1b[38;2;91;115;61maaww\x1b[38;2;248;252;248maa\x1b[38;2;91;115;61mww\x1b[38;2;248;252;248maa\x1b[38;2;0;0;0m                  \x1b[0m
          \x1b[38;2;248;252;248mwwaawwaa\x1b[38;2;88;116;64mww\x1b[38;2;91;115;61maa\x1b[38;2;61;88;29mwwaa\x1b[38;2;91;115;61mwwaa\x1b[38;2;61;88;29mwwaa\x1b[38;2;91;115;61mwwaawwaa\x1b[38;2;248;252;248mww\x1b[38;2;255;255;255maa\x1b[38;2;0;0;0m                  \x1b[0m
        \x1b[38;2;248;252;248mwwaaww\x1b[38;2;91;115;61maawwaaww\x1b[38;2;61;88;29maawwaa\x1b[38;2;64;88;32mww\x1b[38;2;61;88;29maawwaaww\x1b[38;2;91;115;61maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m                      \x1b[0m
        \x1b[38;2;248;252;248maaww\x1b[38;2;91;115;61maawwaa\x1b[38;2;88;116;64mww\x1b[38;2;91;115;61maaww\x1b[38;2;61;88;29maawwaawwaawwaa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m                        \x1b[0m
            \x1b[38;2;248;252;248maawwaa\x1b[38;2;61;88;29mwwaawwaawwaawwaa\x1b[38;2;64;88;32mww\x1b[38;2;248;252;248maawwaawwaaww\x1b[38;2;0;0;0m                \x1b[0m
                    \x1b[38;2;248;252;248maawwaaww\x1b[38;2;187;199;176maa\x1b[38;2;61;88;29mwwaa\x1b[38;2;248;252;248mww\x1b[38;2;205;141;141maa\x1b[38;2;179;73;75mwwaawwaaww\x1b[38;2;248;252;248maaww\x1b[38;2;0;0;0m            \x1b[0m
                  \x1b[38;2;248;252;248maaww\x1b[38;2;179;73;75maawwaa\x1b[38;2;61;88;29mwwaaww\x1b[38;2;179;73;75maaww\x1b[38;2;176;72;72maa\x1b[38;2;131;33;45mwwaa\x1b[38;2;131;35;45mww\x1b[38;2;179;73;75maaww\x1b[38;2;248;248;240maa\x1b[38;2;0;0;0m            \x1b[0m
                \x1b[38;2;248;252;248mww\x1b[38;2;179;73;75maawwaawwaawwaa\x1b[38;2;123;80;53mww\x1b[38;2;179;73;75maaww\x1b[38;2;248;252;248maaww\x1b[38;2;136;36;48maa\x1b[38;2;133;35;48mwwaa\x1b[38;2;176;72;72mww\x1b[38;2;179;73;75maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m          \x1b[0m
              \x1b[38;2;248;252;248maa\x1b[38;2;179;73;75mwwaa\x1b[38;2;133;35;48mwwaawwaaww\x1b[38;2;179;73;75maaww\x1b[38;2;133;36;48maa\x1b[38;2;179;73;75mww\x1b[38;2;248;252;248maaww\x1b[38;2;179;73;75maa\x1b[38;2;136;36;48mwwaaww\x1b[38;2;179;73;75maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m          \x1b[0m
              \x1b[38;2;248;252;248maa\x1b[38;2;179;73;75mww\x1b[38;2;136;36;48maawwaawwaawwaawwaa\x1b[38;2;136;37;48mww\x1b[38;2;179;73;75maa\x1b[38;2;136;36;48mww\x1b[38;2;136;37;48maawwaawwaa\x1b[38;2;176;72;72mww\x1b[38;2;255;255;255maa\x1b[38;2;0;0;0m        \x1b[0m
            \x1b[38;2;248;252;248mww\x1b[38;2;179;73;75maa\x1b[38;2;168;63;64mww\x1b[38;2;136;37;48maa\x1b[38;2;136;36;48mww\x1b[38;2;139;37;48maawwaawwaaww\x1b[38;2;139;37;51maawwaawwaawwaaww\x1b[38;2;141;39;51maa\x1b[38;2;179;73;75mww\x1b[38;2;248;252;248maa\x1b[38;2;0;0;0m        \x1b[0m
            \x1b[38;2;248;252;248mww\x1b[38;2;179;73;75maa\x1b[38;2;139;37;51mwwaawwaa\x1b[38;2;141;39;51mwwaawwaawwaawwaawwaawwaawwaa\x1b[38;2;179;73;75mww\x1b[38;2;249;252;249maa\x1b[38;2;0;0;0m        \x1b[0m
            \x1b[38;2;248;252;248mww\x1b[38;2;179;73;75maa\x1b[38;2;141;39;51mwwaawwaawwaawwaawwaa\x1b[38;2;144;39;51mwwaawwaaww\x1b[38;2;144;39;53maawwaa\x1b[38;2;184;80;80mww\x1b[38;2;0;0;0m          \x1b[0m
              \x1b[38;2;192;111;109maa\x1b[38;2;144;39;53mwwaawwaawwaawwaawwaawwaawwaaww\x1b[38;2;155;45;53maa\x1b[38;2;147;39;53mwwaa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m          \x1b[0m
              \x1b[38;2;248;252;248maa\x1b[38;2;179;73;75mww\x1b[38;2;144;39;53maa\x1b[38;2;147;39;53mwwaawwaa\x1b[38;2;147;40;53mwwaawwaawwaaww\x1b[38;2;176;68;64maa\x1b[38;2;176;67;69mwwaaww\x1b[38;2;179;71;75maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m          \x1b[0m
              \x1b[38;2;248;252;248maa\x1b[38;2;179;73;75mww\x1b[38;2;147;40;53maaww\x1b[38;2;149;40;53maaww\x1b[38;2;176;64;64maa\x1b[38;2;176;68;64mww\x1b[38;2;149;40;53maaww\x1b[38;2;176;67;69maawwaawwaa\x1b[38;2;149;40;53mww\x1b[38;2;176;67;69maaww\x1b[38;2;179;73;75maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m          \x1b[0m
                \x1b[38;2;248;252;248maa\x1b[38;2;160;48;56mww\x1b[38;2;149;41;53maaww\x1b[38;2;179;68;69maa\x1b[38;2;176;68;72mwwaa\x1b[38;2;179;68;69mwwaa\x1b[38;2;176;68;72mww\x1b[38;2;152;40;56maa\x1b[38;2;179;68;69mwwaaww\x1b[38;2;179;69;69maawwaa\x1b[38;2;179;73;75mww\x1b[38;2;0;0;0m            \x1b[0m
                \x1b[38;2;248;252;248maa\x1b[38;2;179;73;75mww\x1b[38;2;152;41;56maa\x1b[38;2;179;69;69mww\x1b[38;2;152;41;56maa\x1b[38;2;179;69;69mwwaawwaawwaa\x1b[38;2;179;69;72mww\x1b[38;2;181;69;72maawwaa\x1b[38;2;181;71;72mww\x1b[38;2;179;73;75maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m            \x1b[0m
                  \x1b[38;2;248;252;248maa\x1b[38;2;179;73;75mww\x1b[38;2;152;40;56maa\x1b[38;2;181;71;72mwwaawwaawwaawwaawwaawwaa\x1b[38;2;179;73;75mww\x1b[38;2;248;252;248maa\x1b[38;2;0;0;0m            \x1b[0m
                    \x1b[38;2;248;252;248mww\x1b[38;2;179;73;75maa\x1b[38;2;181;71;72mwwaawwaawwaawwaawwaaww\x1b[38;2;179;73;75maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m              \x1b[0m
                      \x1b[38;2;248;252;248maa\x1b[38;2;179;73;72mww\x1b[38;2;184;72;72maawwaawwaawwaawwaa\x1b[38;2;179;73;75mww\x1b[38;2;248;252;248maa\x1b[38;2;0;0;0m                \x1b[0m
                        \x1b[38;2;248;252;248mwwaa\x1b[38;2;179;73;75mww\x1b[38;2;184;72;75maa\x1b[38;2;184;73;75mwwaawwaaww\x1b[38;2;179;73;75maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m                  \x1b[0m
                            \x1b[38;2;248;252;248maaww\x1b[38;2;208;140;144maa\x1b[38;2;179;73;75mww\x1b[38;2;184;72;72maaww\x1b[38;2;176;72;72maa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m                    \x1b[0m
                                  \x1b[38;2;248;252;248maawwaa\x1b[38;2;248;252;248mww\x1b[38;2;0;0;0m                      \x1b[0m
`);
