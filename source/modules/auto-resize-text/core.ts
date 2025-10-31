
// Doesn't actually seem to effect anything, at least on my browsers
const presicon = {
	scale: 1,
	characters: 1,
};

/* Create the element used to calculate the width of text */
const referenceCharacter = document.createElement("div");
referenceCharacter.innerText = "x".repeat(presicon.characters);
referenceCharacter.style.fontSize = `${presicon.scale}px`;
referenceCharacter.classList.add("visually-hidden");
document.body.appendChild(referenceCharacter);


// calc how big 1 character would need to be to fit in the container
// Unit rate for font pixel to screen pixel
// 1px font size = this much width on screen
// console.log(ea);


function resize (zoomLevel = 1) {

	const elements = document.querySelectorAll(".auto-resize-text") as NodeListOf<HTMLDivElement>;
	const ea = referenceCharacter.getBoundingClientRect().width; // / presicon.scale / presicon.characters; // gohu11 = 0.5498046875

	for (const container of elements) {
		const styles = getComputedStyle(container);

		const maxWidth = container.clientWidth
			- Math.max(0, parseFloat(styles.paddingLeft))
			- Math.max(0, parseFloat(styles.paddingRight))
			- Math.max(0, parseFloat(styles.borderLeftWidth))
			- Math.max(0, parseFloat(styles.borderRightWidth))
			- Math.max(0, parseFloat(styles.marginLeft))
			- Math.max(0, parseFloat(styles.marginRight));

		/* Get the longest line length */
		const lines = Array.from(container.querySelectorAll(".line-length")) as HTMLDivElement[];
		if (!lines) throw new Error("must set at least one .line-length element inside the .auto-resize-text element");
		const length = lines
			.map((x) => x.innerText.length)
			.reduce((a, b) => Math.max(a, b), 0);

		// font size required for one character to be maxwidth
		const font_size = maxWidth / (length * ea);
		// console.log("font_size", font_size);
		container.style.fontSize = `${font_size}px`;
	}
}




resize();
// @ts-expect-error
import("https://unpkg.com/zoom-level@2.5.0/dist/zoom-level.esm.js").then(({ zoomLevel }) => {
	resize(zoomLevel());
	window.addEventListener("resize", () => resize(zoomLevel()));
});
