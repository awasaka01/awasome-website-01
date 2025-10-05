document.addEventListener("DOMContentLoaded", () => {

	const marquees = document.getElementsByClassName("marquee") as HTMLCollectionOf<HTMLDivElement>;
	for (const marquee of marquees) {
		const updateChildWidth = () => marquee.style.setProperty("--width-per-child", `${firstChild.offsetWidth}`);

		const firstChild = marquee.querySelector(".marquee-track > *:first-child") as HTMLDivElement;

		new ResizeObserver(updateChildWidth).observe(firstChild);
		updateChildWidth();
	}
});
