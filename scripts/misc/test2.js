

const content = `

<!DOCTYPE html>
<html lang="en">
<head>
	<!-- Meta -->	
<meta charset="UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="author" content="awasaka01"/>
<meta name="description" content="silly little website">


<!-- Display -->
<title>default title haha</title>
<link rel="icon" href="/assets/images/favicon.ico" type="image/gif"/>



<!-- [?] chroma.js - Color Helper [https://gka.github.io/chroma.js/] -->
<!-- How to use: Add <import chroma from "chroma-js"> to your file-->
<!-- For autocompletion: Install the module's types locally (@types/chroma-js) Add /// <reference types="chroma-js"/> to the top of your file -->
<script type="importmap">{ "imports": {
	
	 "chroma-js": "https://unpkg.com/chroma-js@3.1.2/index.js", 
	"zoom-level": "https://unpkg.com/zoom-level@2.5.0/dist/zoom-level.esm.js"
} }</script>

<!-- Local CSS and JS -->
<script type="module" src="main.js?nocache=mdiaar3h"></script>
<link rel="stylesheet" href="main.css?nocache=mdiaar3h">






<script>
	const theme = localStorage.getItem("theme");
	if (theme) { document.documentElement.setAttribute("data-theme", theme); }
</script>






	<script type="module" src="main.ts"></script>

	<script async src="https://ga.jspm.io/npm:es-module-shims@2.6.1/dist/es-module-shims.js"></script>
</head>
<body style="font-family: monospace;">
	<p>u22w22u</p>
    <div id="root"></div>
	<div id="spacing"></div>
	<main>
	
	<div>
	<label for="theme-select">Theme: </label><select id="theme-select">
	<option value="default">Default</option>
	<option value="wet">wet</option>
</select>
<script>
	const dropdown = document.getElementById("theme-select");
	if (theme) { dropdown.value = theme; }
	dropdown.addEventListener("change", () => {
		document.documentElement.setAttribute("data-theme", dropdown.value);
		localStorage.setItem("theme", dropdown.value);
	});
</script>
</div>
		<br><br><br>

	<!-- -->
	<section class="autoResize">
		
			<p><span class='boxdraw-color-1'>┏━━</span>?f━/f━━┓</p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f hello worm ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃   </span>2?f─/f    <span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃ </span>[ <button>button</button> ] ?f /f <span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f  ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f  ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f  ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f h ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f hh ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f  ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f  ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f  ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f  ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f A ?f /f W ?f /f A ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┃</span>?f /f abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};:'" ~   ?f /f<span class='boxdraw-color-1'>┃</span></p>
			<p><span class='boxdraw-color-1'>┗━━</span>?f━/f━━┛</p>
			

			<!-- ?f NEW BLOCK /f -->

	</section>
	<span id="character">1</span>
	<br><br><br><br><br><br><br><br><br><br><br><br> <br><br><br><br><br><br><br><br><br><br><br><br> <br><br><br><br><br><br><br><br><br><br><br><br> <br><br><br><br><br><br><br><br><br><br><br><br> <br><br><br><br><br><br><br><br><br><br><br><br> <br><br><br><br><br><br><br><br><br><br><br><br> <br><br><br><br><br><br><br><br><br><br><br><br> <br><br><br><br><br><br><br><br><br><br><br><br> <br><br><br><br><br><br><br><br><br><br><br><br>
	<a href="/template/index.html"></a>
	<a href="/color-preview/"></a>
	</main>
	<!-- Inline the scripts that change things that are visible, to prevent flash of unstyled content an external script would show whilst downloading -->
	<script>const onlyText = (str) => str.replace(/\?%\?.+?\?%\?/gm, "");


// Make the font size in .autoResize elements as big as possible to touch edges of the container
async function setWidths (zoomLevel = 1.25) {
	// zoomLevel = 1.25;
	zoomLevel = Math.max(zoomLevel, 1.25);
	console.log(zoomLevel);

	const uh = document.getElementById("spacing").clientWidth;
	const bodywidth = document.body.offsetWidth;
	const singleCharacter = document.getElementById("character").offsetWidth;
	Array.from(document.getElementsByClassName("autoResize")).forEach((el) => {
		const vw = Math.min(uh) * (zoomLevel - 0.25);


		const children = Array.from(el.children);
		const longestLine = children.map((x) => onlyText(x.textContent).length).reduce((a, b) => Math.max(a, b));
		// console.log(children.map((x) => onlyText(x.textContent)))
	});
}

setWidths();
import("https://unpkg.com/zoom-level@2.5.0/dist/zoom-level.esm.js").then(({ zoomLevel }) => {
	setWidths(zoomLevel());
	window.addEventListener("resize", async () => setWidths(zoomLevel()));
});
// document.body.style.backgroundColor = "green";
</script>
</body>
</html>

`;

const seperators = {
	block: "<!-- ?f NEW BLOCK /f -->",
	start: "?f", end: "/f",
};
const getOnlyText = (str) => str.replace(new RegExp(`<(?!${RegExp.escape(seperators.block.slice(1, -1))})[^>]*?>`, "g"), "").replace(/\?f(.+?)\/f/g, "");

let blocks = content.split(seperators.block).filter((b) => b.length > 0);
blocks = blocks.map((block, i) => {

	// Get all lines that have fillcodes on them
	let lines = block.split("\n").filter((l) => l.includes(seperators.start) && l.includes(seperators.end));
	if (lines.length === 0) return block;

	// Calculate lenghts of all lines
	const lineLengths = {}; lines.forEach((line) => { lineLengths[line] = getOnlyText(line).trim().length; });
	const longestLength = Object.values(lineLengths).reduce((a, b) => a > b ? a : b, 0);

	const fillcodeIdentifierRegex = new RegExp(`${RegExp.escape(seperators.start)}(.+?)${RegExp.escape(seperators.end)}`, "g");

	lines = lines.map((line) => {
		const diffBetweenLongestAndThis = Math.abs(longestLength - lineLengths[line]);
		const fillcodeCount = line.match(fillcodeIdentifierRegex).length;

		// Loop through each fillcode
		let i = 0;
		line = line.replace(fillcodeIdentifierRegex, (match, textToRepeat) => {
			const lengthPerFill = diffBetweenLongestAndThis / fillcodeCount;

			// If whole number, no need to round, just repeat
			if (lengthPerFill % 1 === 0) return `${textToRepeat.repeat(lengthPerFill)}`;

			// Else, round based on if it's the last / first / middle fillcode
			i += 1;
			const roundingFunction = i === 1 ? Math.floor : i === fillcodeCount ? Math.ceil : Math.round;
			return `${textToRepeat.repeat(roundingFunction(lengthPerFill))}`;
		});
		return line.trim();
	});
	return lines.join("\n");
});

console.log(getOnlyText(blocks.join("\n\n")));
