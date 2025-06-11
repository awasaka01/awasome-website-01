// https://unicode.org/Public/UNIDATA/UnicodeData.txt
import { readFileSync, writeFileSync } from "node:fs";
import path, { parse } from "node:path";
import c from "canvas";
import http from "http";


const PORT = 3000;


const canvas = c.createCanvas(200, 200);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// Write "Awesome!"
ctx.font = "30px Impact";
ctx.rotate(0.1);
ctx.fillText("Awesome!", 50, 100);

// Draw line under text
var text = ctx.measureText("Awesome!");
ctx.strokeStyle = "rgba(0,0,0,0.5)";
ctx.beginPath();
ctx.lineTo(50, 102);
ctx.lineTo(50 + text.width, 102);
ctx.stroke();
let html;
// Draw cat with lime helmet
c.loadImage("./scripts/awasaka_logo_text.png").then((image) => {
  ctx.drawImage(image, 50, 0, 70, 70);

  html = "<img serc=\"" + canvas.toDataURL() + "\" />";
});

const style = "<style>img { image-rendering: pixelated; }</style><script type=\"text/javascript\" src=\"https://livejs.com/live.js\"></script>";

    http.createServer(function (request, response) {
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(`${html}${style}`);
        response.end();
    }).listen(PORT);
	console.log(`Server running at http://localhost:${PORT}/`);



// const IMAGE_PROPERTIES = {
// 	width: 16,
// 	height: 16,
// 	gap_between: 1,
// 	characters_per_row: 10,
// };

// // https://www.compart.com/en/unicode/block

// // minimized blocks, with useless characters such as formatting symbols are marked with -m
// const BLOCKS = {
// 	"Basic Latin -m": [[0x0020, 0x007E]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+0000
// 	"Latin-1 Supplement": [[0x0080, 0x00FF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+0080
// 	"General Punctuation -m": [[0x2010, 0x2027], [0x2030, 0x205E]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+2000
// 	"Arrows": [[0x2190, 0x21FF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+2190
// 	"Mathematical Operators": [[0x2200, 0x22FF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+2200
// 	"Miscellaneous Technical": [[0x2300, 0x23FF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+2300
// 	"Box Drawing": [[0x2500, 0x257F]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+2500
// 	"Block Elements": [[0x2580, 0x259F]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+2580
// 	"Geometric Shapes": [[0x25A0, 0x25FF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+25A0
// 	"Miscellaneous Symbols": [[0x2600, 0x26FF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+2600
// 	"Supplemental Arrows A": [[0x27F0, 0x27FF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+27F0
// 	"Miscelennous Symbols and Arrows": [[0x2B00, 0x2BFF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+2B00
// 	"Specials": [[0xFFF0, 0XFFFF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+FFF0
// 	"Halfwidth and Fullwidth Forms": [[0xFF00, 0xFFEF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+FF00
// 	"Small Form Variants": [[0xFE50, 0xFE6F]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+FE50
// 	"Chess Symbols -m": [[0x2654, 0x265F]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+2654
// 	"Supplemental Arrows C": [[0x1F800, 0x1F8FF]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+1F800
// 	"Geometric Shapes Extended": [[0x1F780, 0x1F7D8]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+1F780
// 	"Alchemical Symbols": [[0x1F700, 0x1F77F]],
// 	// ↑ https://www.compart.com/en/unicode/block/U+1F700
// };

// // ⧸⎯⧹  ⧹⧸ ⧹⧸  ⧸⎯⧹

// // https://www.compart.com/en/unicode/block/U+2980
// // https://www.compart.com/en/unicode/block/U+2B00
// // https://www.compart.com/en/unicode/block/U+27C0
// // https://www.compart.com/en/unicode/block/U+2A00

// const data = (readFileSync(path.join(import.meta.dirname, "./unicode.txt"), "utf8"))
// .split("\n").map((x) => x.split(";").slice(0, 2));

// let charCount = 0;
// let output = "";
// const list = [];
// Object.entries(blocks).forEach(([name, ranges]) => {
// 	// range = Array.isArray(range[0]) ? range : [range];

// 	let content = "";
// 	ranges.forEach(([start, end]) => {
// 		for (let i = start; i <= end; i++) {
// 			const code = i.toString(16).toUpperCase().padStart(4, "0");
// 			const name = data.find((x) => x[0] === code)[1];
// 			list.push(String.fromCharCode(i));
// 			charCount += 1;
// 			content += `${code}  ${String.fromCharCode(i)}  ${name}\n`;
// 		}
// 	});
// 	output += content;
// });

// console.log(output);
// console.log(charCount);
// console.log(list);

// writeFileSync(path.join(import.meta.dirname, "./unicodeout.txt"), list.join("\", \""), "utf8");

// // for (let i = 1; i <= 0x0030; i++) {

// // 	console.log(`[line ${i}] ${i.toString(16).toUpperCase().padStart(4, "0")}:     ' ${String.fromCharCode(parseInt(i.toString(16), 16))} '`);
// // }
