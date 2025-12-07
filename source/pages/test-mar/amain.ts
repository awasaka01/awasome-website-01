const marquees = document.getElementsByClassName("marquee") as HTMLCollectionOf<HTMLDivElement>;
for (const marquee of marquees) {
	const direction
		= marquee.classList.contains("N") || marquee.classList.contains("direction-north") ? "N"
		: marquee.classList.contains("S") || marquee.classList.contains("direction-south") ? "S"
		: marquee.classList.contains("E") || marquee.classList.contains("direction-east") || marquee.classList.contains("ltr") ? "E"
		: marquee.classList.contains("W") || marquee.classList.contains("direction-west") || marquee.classList.contains("rtl") ? "W"
		: null;
	if (!direction) {
		console.warn(`No direction specified for marquee: ${marquee}`);
		continue;
	}

	const firstChild = marquee.querySelector(".marquee-track > *:first-child") as HTMLDivElement;
	const updateChildWidth = () => {
		const size = direction === "E" || direction === "W" ? firstChild.offsetWidth : firstChild.offsetHeight;
		return marquee.style.setProperty("--item-size", `${Math.round(size)}`);
	};

	new ResizeObserver(updateChildWidth).observe(firstChild);
	updateChildWidth();
}
