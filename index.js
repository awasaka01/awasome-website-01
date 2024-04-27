const rr = (min, max) => {
 return Math.floor(Math.random() * (max - min + 1)) + min;
};
function init () {
	document.body.className += " loaded";
	const symbols = "".split(" ");
	const randomSymbol = () => { return symbols[Math.floor(Math.random() * symbols.length)]; };

	// Create one of each element
	const fragment = document.createDocumentFragment();

	symbols.forEach((symbol) => {
		const e = document.createElement("p");
		e.className = "heart";
		fragment.appendChild(e);
	});

	const container = document.getElementById("heartcontainer");
	container.appendChild(fragment);


	const randomDrop = (element) => {
		const speed = rr(2000, 4000);
		element.style.left = `${rr(-10, container.clientWidth)}px`;
		element.style.animation = `Fall ${speed}ms ease-in`;
		element.style.backgroundColor = `hsl(${rr(0, 360)}, ${rr(40, 100)}%, ${rr(60, 80)}%)`;
		element.addEventListener("animationend", () => {
			element.style.animation = "none";
			setTimeout(() => {

				randomDrop(element);
			}, 100);
			console.log(element.innerText);
		}, { once: true });
	};
	const items = Array.from(container.children);
	const slowlyStart = () => {
		randomDrop(items.pop());
		if (items.length > 0) { setTimeout(slowlyStart, rr(10, 300)); };
	};
	slowlyStart();
};
