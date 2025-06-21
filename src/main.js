window.addEventListener("load", () => {

	// Calculate length of a single character
	// https://www.npmjs.com/package/jsdom to preprocess this in future

		const setWidths = () => {

		const sp = document.getElementById("character");
		const width = sp.offsetWidth;
		const vw = document.documentElement.clientWidth;

		// Calculate how much to scale up the font size for 1 character to be the same width as the page
		// console.log(`vw:${vw} width:${width} : ${vw / width}`);

		const onlyText = (str) => str.replace(/\?%\?.+?\?%\?/gm, "");
		Array.from(document.getElementsByClassName("autoResize")).forEach((el) => {

			const children = Array.from(el.children);
			const longest = children
				.map((x) => onlyText(x.textContent).length)
				.reduce((a, b) => a > b ? a : b);

			el.style.setProperty("--font-size", `${((vw / width) / longest) * 100}px`);
			// }
				// el.style.fontSize = `${((vw / width) / el.textContent.length) * 100}px`;
		});
	};
	window.addEventListener("resize", setWidths);
	setWidths();
	// document.body.addEventListener("orientationchange", setWidths);
		// document.documentElement.style.setProperty("--font-size", `${sp.offsetWidth}px`);

});
