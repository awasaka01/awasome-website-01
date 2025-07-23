// const onlyText = (str) => str.replace(/\?%\?.+?\?%\?/gm, "");


// // Make the font size in .autoResize elements as big as possible to touch edges of the container
// async function setWidths (zoomLevel = 1.25) {
// 	// zoomLevel = 1.25;
// 	zoomLevel = Math.max(zoomLevel, 1.25);
// 	console.log(zoomLevel);

// 	const uh = document.getElementById("spacing").clientWidth;
// 	const bodywidth = document.body.offsetWidth;
// 	const singleCharacter = document.getElementById("character").offsetWidth;
// 	Array.from(document.getElementsByClassName("autoResize")).forEach((el) => {
// 		const vw = Math.min(uh) * (zoomLevel - 0.25);


// 		const children = Array.from(el.children);
// 		const longestLine = children.map((x) => onlyText(x.textContent).length).reduce((a, b) => Math.max(a, b));
// 		// console.log(children.map((x) => onlyText(x.textContent)))
// 		el.style.setProperty("font-size", `${((vw / singleCharacter) / longestLine) * 100}px`);
// 	});
// }

// setWidths();
// import("zoom-level").then(({ zoomLevel }) => {
// 	setWidths(zoomLevel());
// 	window.addEventListener("resize", async () => setWidths(zoomLevel()));
// });
document.body.style.backgroundColor = "green";
