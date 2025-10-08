console.log(document.body);

import * as awa from "__util__";
import chroma from "chroma-js";


// add starfield to page
const starfield = document.createElement("div");
starfield.id = "starfield";
document.body.appendChild(starfield);

const starslIST = [] as SVGSVGElement[];

// CONFIG
const delayBetweenStarRespawn = [500, 1000] as const;
const rotationSpeedRange = [10000, 30000] as const;
const starTypes : [weight: number, { color : string | chroma.Scale, glow : [number, number], size : [number, number], duration : [number, number] }][] = [
	[15, {
		color: "#ffffff",
		glow: [1, 2],
		size: [1, 2.5],
		duration: [2000, 4000],
	}],
	[1, {
		color: "#a8d8ff",
		glow: [2, 4],
		size: [1, 2],
		duration: [2500, 5000],
	}],
	[5, {
		color: "#fff9e6",
		glow: [2, 4],
		size: [1.5, 3],
		duration: [1800, 3500],
	}],
	[5, {
		color: "#cccccc",
		glow: [0.5, 1],
		size: [10, 20],
		duration: [3000, 6000],
	}],
];
const weightedStarTypes = awa.weightedArray(starTypes);





// Generate star elements based on window size
function generateInitialStars () {

	// clear any existing stars
	for (const star of document.querySelectorAll(".star")) { star.remove(); }

	const pixelsPerStar = 5000;
	const pixels = window.innerWidth * window.innerHeight;
	const starCount = Math.min(200, Math.max(10, Math.round(pixels / pixelsPerStar)));

	for (let i = 0; i < starCount; i++) {

		// create star svg
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("class", "star");
		svg.setAttribute("viewBox", "-5 -5 10 10");

		// 4-pointed star shape (diamond with pinched corners)
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("d", "M0,-5 L1,-1 L5,0 L1,1 L0,5 L-1,1 L-5,0 L-1,-1 Z");

		svg.appendChild(path);
		starfield.appendChild(svg);
		starslIST.push(svg);



		// animate star, negative delay for first stars to appear immediately
		svg.addEventListener("animationend", () => animateStar(svg, path));
		animateStar(svg, path, 0 - awa.rf(1000, 4000));

	}
}


function animateStar (svg : SVGSVGElement, path : SVGPathElement, delay ?: number) {

	const { color, glow, size, duration } = randomStarType();
	const rotationSpeed = awa.rf(...rotationSpeedRange);
	if (!delay) { delay = awa.rf(...delayBetweenStarRespawn); }

	svg.setAttribute("width", `${size}`); svg.setAttribute("height", `${size}`);
	svg.style.top = `${awa.rf(0, 100)}%`; svg.style.left = `${awa.rf(0, 100)}%`;
	// svg.style.filter = `drop-shadow(0 0 ${glow}px ${color})`;
	path.setAttribute("fill", color);


	svg.style.animation = "none";
	requestAnimationFrame(() => requestAnimationFrame(() => {
		svg.style.animation = `
			twinkle-${awa.ri(1, 3)} ${duration}ms linear ${delay}ms,
			spin ${rotationSpeed}ms linear -${awa.rf(0, rotationSpeed)}ms infinite ${Math.random() > 0.5 ? "reverse" : "normal"}
		`;
	}));
}


function randomStarType () {
	const { color, glow, size, duration } = awa.arrayRandom(weightedStarTypes);
	return {
		color: typeof color === "string" ? color : color(Math.random()).hex(),
		size: awa.rf(...size),
		glow: awa.rf(...glow),
		duration: awa.rf(...duration),
	};
}







window.addEventListener("resize", generateInitialStars);
generateInitialStars();
