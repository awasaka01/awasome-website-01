import chalk from "chalk";

const log = console.log;

// Combine styled and normal strings
log(chalk.blue("Hello") + " World" + chalk.red("!"));

// Compose multiple styles using the chainable API
log(chalk.blue.bgRed.bold("Hello world!"));

// Pass in multiple arguments
log(chalk.blue("Hello", "World!", "Foo", "bar", "biz", "baz"));

// Nest styles
log(chalk.red("Hello", chalk.underline.bgBlue("world") + "!"));

// Nest styles of the same type even (color, underline, background)
log(chalk.green(
	"I am a green line "
	+ chalk.blue.underline.bold("with a blue substring")
	+ " that becomes green again!",
));

// ES2015 template literal
log(`
CPU: ${chalk.red("90%")}
RAM: ${chalk.green("40%")}
DISK: ${chalk.yellow("70%")}
`);

// Use RGB colors in terminal emulators that support it.
log(chalk.rgb(123, 45, 67).underline("Underlined reddish color"));
log(chalk.hex("#DEADED").bold("Bold gray!"));










// let content = `
// /* stylelint-disable */
// .blink::after {
//   content: "|";
//   animation: blink 1s step-end infinite;
// }

// @keyframes blink {
//   50% {
//     opacity: 0;
//   }
// }
// :root {
//   --font-size: 10px;
// }

// body {
//   font-family: monospace;
//   background-color: var(--bg-500-500);
//   color: var(--fg-500-500);
//   width: 100%;
//   padding: 0;
//   margin: 0;
// }

// html, body {
//   margin: 0;
//   padding: 0;
//   box-sizing: border-box;
// }

// #character {
//   visibility: hidden;
//   font-size: 100px;
//   position: absolute;
//   top: -9999px;
//   left: -9999px;
//   background-color: rgba(95, 95, 255, 0.364);
// }

// .autoResize {
//   font-size: var(--font-size);
// }
// .autoResize > * {
//   max-height: 1.2em;
//   line-height: 1.2em;
//   overflow: hidden;
// }
// .autoResize * {
//   font-size: inherit;
//   white-space: pre;
//   box-sizing: border-box;
//   font-family: inherit;
//   margin: 0;
//   padding: 0;
//   border: none;
//   background-color: transparent;
//   color: inherit;
// }

// button {
//   transform-origin: center center;
//   transform: scale(1.3);
//   cursor: pointer;
// }

// /* Color variables for 'wet' theme, only used ones are compiled */
// [data-theme=wet] {
//   --bg-500-500: lch(26.4234748181% 16.7775181208 271.6474205573deg);
//   --fg-500-500: lch(92.9909501988% 9.3247706961 85.767965458deg);
// }

// /* Color variables for 'default' theme, only used ones are compiled */
// [data-theme=default], html:not([data-theme]) {
//   --bg-500-500: lch(17.1352479152% 12.4042261038 314.565402523deg);
//   --fg-500-500: lch(78.3398319594% 5.420824293 306.0058446742deg);
// }
// :root {
//   --grid-gap: 15px;
// }

// .test-grid {
// 	grid-gap: var(--grid-gap);
// 	grid-template-columns: repeat(2, 1fr);
// }
// ::placeholder {
//   color: gray;
// }

// .image {
//   background-image: url(image@1x.png);
// }
// @media (min-resolution: 2dppx) {
//   .image {
//     background-image: url(image@2x.png);
//   }
// }
// `;
// content = `
// window.addEventListener("load", () => {

// 	// Calculate length of a single character
// 	// https://www.npmjs.com/package/jsdom to preprocess this in future

// 		const setWidths = () => {

// 		const sp = document.getElementById("character");
// 		const width = sp.offsetWidth;
// 		const vw = document.documentElement.clientWidth;

// 		// Calculate how much to scale up the font size for 1 character to be the same width as the page
// 		console.log(\`vw:\${vw} width:\${width} : \${vw / width}\`);

// 		const onlyText = (str) => str.replace(/\?%\?.+?\?%\?/gm, "");
// 		Array.from(document.getElementsByClassName("autoResize")).forEach((el) => {

// 			const children = Array.from(el.children);
// 			const longest = children
// 				.map((x) => onlyText(x.textContent).length)
// 				.reduce((a, b) => a > b ? a : b);

// 			el.style.setProperty("--font-size", \`\${((vw / width) / longest) * 100}px\`);
// 			//}
// 				el.style.fontSize = \`\${((vw / width) / el.textContent.length) * 100}px\`;
// 		});
// 	};
// 	window.addEventListener("resize", setWidths);
// 	setWidths();
// 	document.body.addEventListener("orientationchange", setWidths);
// 	document.documentElement?.style.setProperty("--font-size", \`\${sp.offsetWidth}px\`);

// });
// `;



// import postcss from "postcss";
// import postcss_cssnano from "cssnano";
// import postcss_preset_env from "postcss-preset-env";

// content = await postcss([ // https://github.com/postcss/postcss?tab=readme-ov-file#js-api
// 	postcss_preset_env({ stage: 0 }), // https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env
// 	postcss_cssnano, // https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-cssnano

// ])
// 		.process(content, { from: "/", to: "/" });

// // content = content.css;
// console.log(content);

// console.log(Date.now());
