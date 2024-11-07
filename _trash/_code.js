
const startFallAnimation = (e) => {
	e.style.animation = "left 1ms step-start";
	e.style.transition = "none";
	// if (!heartActive) { return; }

	// Set random position
	e.style.left = `${rr(-e.clientWidth, container.clientWidth)}px`;

	// Set random color
	e.firstChild.firstChild.style.fill = randomColor({
		l: [80, 80],
		c: [50, 100],
	});

	// Set random speed
	const speed = rr(1500, 3500);
e.style.transition = "left 4000ms linear";
e.style.animation = `Fall ${speed}ms linear`;

};



const startNextMovement = (element) => {
	// if (!heartActive) { return; }
	const rect = element.getBoundingClientRect();
	const speedX = Math.abs(rect.x - mouse.x) / 10;
	const speedY = Math.abs(rect.y - mouse.y) / 10;

	const direction = {
		x: rect.x < mouse.x ? speedX : -speedX,
		y: rect.y < mouse.y ? speedY : -speedY,
	};
	if (speedX < 10) { direction.x = 0; }
	if (speedY < 10) { direction.y = 0; }



	const left = (parseInt(element.style.left.replace("px", "")) + direction.x) + "px";
	const top = (parseInt(element.style.top.replace("px", "")) + direction.y) + "px";


	element.style.left = left;
	element.style.top = top;

	if (left === element.style.left && top === element.style.top) {
		setTimeout(() => {
			startNextMovement(element);
		}, 100);
		return;
	}

	element.addEventListener("transitionend", (e) => startNextMovement(e.target), { once: true });
};
const direction = {
	x: rect.x < mouse.x ? 50 : -50,
	y: rect.y < mouse.y ? 50 : -50,
};



	// container.innerHTML = Array(amount).fill("<object class=\"heart\" data=\"/images/fallingheartmask.svg\"></object>").join(" ");
	// const randomDrop = (element) => {
	// 	const speed = rr(2000, 4000);
	// 	element.style.left = `${rr(-10, container.clientWidth)}px`;
	// 	element.style.animation = `Fall ${speed}ms ease-in`;
	// 	element.style.fill = "yellow";
	// 	element.addEventListener("animationend", () => {
	// 		element.style.animation = "none";
	// 		setTimeout(() => {

	// 			randomDrop(element);
	// 		}, 100);
	// 		console.log(element.innerText);
	// 	}, { once: true });
	// };
	// const items = Array.from(container.children);
	// const slowlyStart = () => {
	// 	randomDrop(items.pop());
	// 	if (items.length > 0) { setTimeout(slowlyStart, rr(10, 300)); };
	// };
	// slowlyStart();


	// // Load all pages
	// const pages = (await (await fetch("pages/pages.json")).json()).filter((page) => { return !page.hide; });
	// const pagelist = document.getElementById("page-list");
	// // console.log(pages);

	// pages.forEach((page) => {
	// 	if (page.hidden) { return; }
	// 	const html = `
    //     <a href="/pages/${page.id}/" class="page-link">
    //     <div class="page">
    //         <p class="page-title">${page.title}</p>
    //         <p class="page-desc">${page.desc}</p>
    //     </div>
    //     </a>
    //     `;
	// 	pagelist.innerHTML += html;
	// });

	// setInterval(() => {
	// 	elements.forEach((element) => {
	// 		const rect = element.getBoundingClientRect();

	// 		const direction = rect.x < mouse.x ? 50 : -50;

	// 		element.style.left = (parseInt(element.style.left.replace("px", "")) + direction) + "px";
	// 	});
	// }, 100);


	elements.forEach((element) => { startNextMovement(element); });
	elements.forEach((element) => { element.addEventListener("animationend", (e) => { startNextMovement(e.target); }); });




	// Start them in random positions
	elements.forEach((element) => {

		// Set random position
		element.style.left = `${rr(0, container.clientWidth - element.clientWidth)}px`;
		element.style.top = `${rr(0, container.clientHeight - element.clientHeight)}px`;

		// Set random color
		element.firstChild.firstChild.style.fill = randomColor({
			l: [80, 80],
			c: [50, 100],
		});
	});
