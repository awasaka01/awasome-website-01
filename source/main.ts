import chroma from "chroma-js";
import * as util from "./awa-util/core.js";


document.addEventListener("DOMContentLoaded", async () => {
	// slimey();
	// shimmerLogo();


	// good();

dostars();
});










// ================================================================
//  stars:
// ---------------------------------------------------------------- 

type AnimationType = "animation1" | "animation2" | "animation3";
type StarType = {
	symbol: string;
	color: string | chroma.Scale;
	duration?: number;
	animation?: AnimationType;
	easing?: string;
	loopCount?: number;
	distance?: number;
};
type StarTypeGenerator = [weight: number, properties: ()=> StarType ];

function dostars () {

	// mini optimization: one function for all variables
	const starTypes: StarTypeGenerator[] = [
	[50, () => ({
		symbol  : util.arrayRandom(["·", ""]),
		color   : chroma.scale(["#ffffffb1", "#ffffff24"]),
		duration: util.rr(2000, 10000),
		distance: 1,
	})],
	[20, () => ({
		symbol  : util.arrayRandom(["x", "+"]),
		color   : chroma.scale(["#ffffffb1", "#ffffff24"]),
		distance: 1,
	})],
	[10, () => ({
		symbol: util.arrayRandom(["·", "◌", "x", "+", "", "o", "✧"]),
		color : chroma.scale(["#a1acf8a4", "#a486ecd4"]),
	})],
	[10, () => ({
		symbol: util.arrayRandom(["·", "◌", "x", "+", "", "o", "✧"]),
		color : chroma.scale(["#7080e88f", "#a470e88f"]),
	})],
	[1, () => ({
		symbol  : util.arrayRandom(["♥", "♦", "♣", "♠", "◊", "o", "x", "★", "✧"]),
		color   : chroma.scale(["#f19fc9ac", "#e964c7a5"]),
		distance: 200,
	})],
];
	const default_star: StarTypeGenerator[1] = () => ({
		color    : "#ff0000",
		symbol   : "ERROR",
		duration : util.rr(6000, 30000),
		animation: util.arrayRandom(["animation1"]),
		easing   : util.arrayRandom(["ease-in-out"]),
		loopCount: 1,
		distance : 10,
	});
	const startTypesWeighted = util.weightedArray(starTypes);

	const starfield = document.getElementById("stars") as HTMLDivElement;

	let starAmount = Math.min(200, Math.max(10, Math.round(window.innerWidth * window.innerHeight * 0.0001)));


	// Initialize Starfield
	for (let i = 0; i < starAmount; i++) {
		const starElement = document.createElement("p");
		starElement.classList.add("star");
		starElement.addEventListener("animationend", async () => moveStar());


		let timeout: NodeJS.Timeout | false = false;
		moveStar(true);


		async function moveStar (first = false) {
			if (timeout) clearTimeout(timeout);

			const type = util.arrayRandom(startTypesWeighted);
			const star = { ...default_star(), ...type() };

			starElement.innerText = star.symbol;
			starElement.style.left = `${util.rr(0, window.innerWidth)}px`;
			starElement.style.top = `${util.rr(0, window.innerHeight)}px`;
			starElement.style.color = typeof star.color === "string" ? star.color : star.color(Math.random()).hex();
			starElement.style.animation = "none";
			await new Promise((res) => requestAnimationFrame(res));
			await new Promise((res) => requestAnimationFrame(res));


			const tx = Math.random() < 0.5 ? 0 : util.ri(-star.distance, star.distance);
			const ty = Math.random() < 0.5 ? 0 : util.ri(-star.distance, star.distance);

			starElement.style.animation = [
				`${star.duration}ms ${star.easing} ${first ? -util.rr(0, star.duration) + "ms" : ""} ${star.loopCount} both ${star.animation}`,
			].join(", ");
			starElement.animate([
				{ transform: "translate(0px, 0px) rotate(0deg)" },
				{ transform: `translate(${tx}vmin, ${ty}vmin) rotate(${Math.random() > 0.5 ? 360 : -360}deg)` },
			], {
				duration : star.duration,
				easing   : "linear",
				fill     : "both",
				direction: "reverse",
			});
		}
		starfield.appendChild(starElement);
	}
}
















// ----------------------------------------------------------------
//  good
// ---------------------------------------------------------------- 
function good () {
	const good = document.querySelectorAll(".good") as NodeListOf<HTMLLinkElement>;
	const transforms = () => [
		`rotate(${util.rr(0, 360)}deg)`,
		`scale(${util.rr(-1, 1, false)})`,
		`translate(${util.rr(-5, 5, false)}px, ${util.rr(-5, 5, false)}px)`,
		`skew(${util.rr(-10, 10, false)}deg, ${util.rr(-10, 10, false)}deg)`,
	].join(" ");

	good.forEach((el) => {
		el.style.transform = transforms();
	});
}



// ----------------------------------------------------------------
//  Shimmer Logo
// ---------------------------------------------------------------- 
function shimmerLogo () {
	const logo = document.getElementById("logo-text");
	const cooldown = () => util.rr(1000, 5000);
}




// ----------------------------------------------------------------
//  Slime Rancher Scrolling Track
// ----------------------------------------------------------------
async function slimey () {
	type cssTimingFunction = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";

	const types: ((el: HTMLElement)=> { transforms: string[]; duration?: string; timing?: cssTimingFunction; })[] = [
	(el) => {
		// if (Math.random() > 0.5) return null;
		return {
			transforms: [`translateY(-${util.rr(10, 80)}px)`],
			timing    : "ease-out",
			duration  : `${util.rr(250, 400)}ms`,
	}; },
	(el) => {
		const angle = util.rr(1, 20) * (Math.random() > 0.5 ? 1 : -1);
		return {
			transforms: [`rotate(${0 - angle}deg)`, `rotate(${angle * 2}deg)`],
			timing    : "ease-in-out",
			duration  : `${util.rr(100, 400)}ms`,
	}; },
	// (el) => { return {
	// 	transforms : [`rotate(${util.rr(-2, 2) * 360}deg)`],
	// }; },
];



const frameSkip = 8;
const speed = 0.0004 * frameSkip;
const duration = 200;
const safetyMargin = 7; // < elements to keep offscreen on left
const hoverDetect = document.querySelector(".hover-detect");

const track = document.getElementById("slimes");
const elements = track.querySelectorAll(".image-wrapper") as NodeListOf<HTMLElement>;
const total = elements.length;
let animationProgress = 0;

// - Offset initial position
// track.style.transform = `translateX(-${5 * safetyMargin}rem)`;
// track.style.left = `${5 * safetyMargin}rem`;

// - Store each element in a Map
const slimes: Map<HTMLElement, { index: number; animating?: boolean; }> = new Map();

// - Randomize order
const values = Array.from(elements); // make an array of the elements
for (let i = values.length - 1; i > 0; i--) {
	const j = Math.floor(Math.random() * (i + 1));
	[values[i], values[j]] = [values[j], values[i]];
}
values.forEach((el) => { track.appendChild(el); });
values.forEach((el, index) => { slimes.set(el, { index }); });


const imageWidth = elements[4].offsetWidth;

track.style.opacity = "1";
await new Promise((resolve) => track.addEventListener("transitionend", resolve));

function updatePositions (iteration = 0) {
	if (/* hoverDetect.matches(":hover") || */iteration % frameSkip !== 0) return requestAnimationFrame(() => updatePositions(iteration + 1));

	slimes.forEach(({ index }, el) => {
		animate(el);

		const absx = (index + (total * animationProgress)) % total;
		if (absx < 3 || absx > 30) {
			el.style.transitionDuration = "0s";
		}
		else {
			el.style.transitionDuration = `${duration}ms`;
		}

		// - where to be relative to starting position
		let offset = (absx - index);
		el.style.transform = `translateX(${(imageWidth * offset)}px)`;
	});

	animationProgress += speed;
	if (animationProgress > 1) animationProgress = 0;


	requestAnimationFrame(() => updatePositions(iteration + 1));
}
updatePositions();

async function animate (el: HTMLElement) {
	const slime = slimes.get(el);
	if (slime.animating || Math.random() > 0.01) return;
	slime.animating = true;
	const child = el.firstElementChild as HTMLElement;

	const animation = (types[Math.floor(Math.random() * types.length)])(child);
	if (!animation) return slime.animating = false;
	child.style.transitionDuration = animation.duration ?? `1000ms`;
	child.style.transitionTimingFunction = animation.timing ?? "ease-in-out";

	while (animation.transforms.length > 0) {
		child.style.transform = animation.transforms.shift();
		await new Promise((res) => {
			child.addEventListener("transitionend", res, { once: true });
			setTimeout(res, 3000);
		});
	}
	child.style.transform = "";
	setTimeout(() => slime.animating = false, util.rr(400, 700));
}






}
