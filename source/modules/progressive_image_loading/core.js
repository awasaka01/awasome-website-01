document.addEventListener("DOMContentLoaded", () => {

/** @type {HTMLDivElement[]} */
const images = Array.from(document.getElementsByClassName("progressive-image"));
let loadedCount = 0;

images.forEach((wrapper) => {
	const preview = /** @type {HTMLImageElement} */ (wrapper.firstElementChild);
	const full = /** @type {HTMLImageElement} */ (wrapper.lastElementChild);

	preview.addEventListener("load", loaded);
	if (preview.complete) loaded();
	function loaded () { if (++loadedCount === images.length) loadAllFullSizeImages(); }
});

function loadAllFullSizeImages () {
	// document.body.style.backgroundColor = "red";
	images.forEach((wrapper) => {
		const preview = /** @type {HTMLImageElement} */ (wrapper.firstElementChild);
		const full = /** @type {HTMLImageElement} */ (wrapper.lastElementChild);
		full.src = full.dataset.src;
		full.addEventListener("load", () => {
			full.style.opacity = 1;
			full.addEventListener("transitionend", () => {
				preview.remove();

			}, { once: true });
		});
	});
}

});
