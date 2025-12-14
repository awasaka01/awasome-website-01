import * as awa from "__util__";
import chroma from "chroma-js";
import { createNoise3D } from "simplex-noise";
// /////////// TODO: DRAW INSET CHESS BOARD

const WIDTH = 128;
const MAX_FPS = 10;
const DEPTH = 16; // z dimension of 3D stars


const defaultparams = {
	octaves    : 3, // Number of noise layers stacked; higher = more detail
	bias       : 4, // Exponent for reducing amplitude per octave; higher = smoother
	frequency  : 0.017, // Base frequency of noise (how zoomed in/out)
	lacunarity : 10, // Frequency multiplier per octave; higher = more rapid detail
	persistence: 0.03, // Amplitude multiplier per octave; higher = rougher noise
	scale      : 1, // Global scale multiplier for output
	min        : 0, // Minimum output value after scaling
	max        : 255, // Maximum output value after scaling
	yspeed     : 100, // How fast the noise moves vertically
	zspeed     : 300, // How fast the noise moves "depth-wise"
};





// bayer matrices
// use by const threshold = BAYER4x4[y & 3][x & 3]; // same as % 4 but faster
const BAYER2x2 = [
	[0, 2],
	[3, 1],
].map((row) => row.map((v) => v / 4));
const BAYER4x4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
].map((row) => row.map((v) => v / 16));
const BAYER8x8 = [
	[0, 32, 8, 40, 2, 34, 10, 42],
	[48, 16, 56, 24, 50, 18, 58, 26],
	[12, 44, 4, 36, 14, 46, 6, 38],
	[52, 20, 60, 28, 54, 22, 62, 30],
	[3, 35, 11, 43, 1, 33, 9, 41],
	[51, 19, 59, 27, 55, 23, 63, 31],
	[15, 47, 7, 39, 13, 45, 5, 37],
	[49, 17, 57, 25, 53, 21, 61, 29],
].map((row) => row.map((v) => v / 64));


const BAYER_WEIGHT = 0.8;
const SPIRAL_WEIGHT = 1;
const COLOR_AMOUNT = 5;
const STAR_AMOUNT = 128;
const POW = 3;
const STAR_SCALE = chroma.scale(["#ffffffc3", "#bfbfbf16"]).mode("rgb");
const PERSPECTIVE = 1000;

const content = document.querySelector(".content");

function createBackground (colorScale: chroma.Scale, id = "space-background", constoffset = 0, params = {} as Partial<typeof defaultparams>) {

	params = { ...defaultparams, ...params };
	//
	const canvas = document.createElement("canvas");
		canvas.width = WIDTH;
		canvas.id = id;
	// content.appendChild(canvas);


	// 2D array as lookup table, offsetLookup[y][x]
	let offsetLookup: number[][];
	let colorsLookup: [number, number, number, number][];
	let height: number;
	let widthXheight: number;
	let starDistribution: Uint8Array; // 3d flat array index =    x   +   y * WIDTH   +   z * WIDTH * HEIGHT;

	/*  -----  on window resize, update canvas height, and all values that depend on height  -----  */
	updateAllValues();
	window.addEventListener("resize", updateAllValues);
	function updateAllValues () {
		/* --- update canvas height --- */
		height = ~~(content.scrollHeight * (canvas.width / window.innerWidth));
		widthXheight = WIDTH * height;
		canvas.height = height;


		/* --- precompute some values --- */
		offsetLookup = Array.from({ length: height }, () => Array.from({ length: WIDTH }));
		const centerX = canvas.width / 2;
		const centerY = window.visualViewport.height * (canvas.width / window.innerWidth) / 2;
		const centerZ = DEPTH / 2;
		for (let y = 0; y < height; y++) {
		for (let x = 0; x < WIDTH; x++) {

			// spiral
			const deltaX = x - centerX;
			const deltaY = y - centerY;
			const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			const angle = Math.atan2(deltaY, deltaX); // -π..π
			const spiralFactor = ((radius * 0.05 + angle * 0.2) % 1); // tweak 0.05/0.2 for spacing

			// bayer
			const bayerFactor = BAYER4x4[y & 0b11][x & 0b11]; // 0..1

			// combine the offsets with weights
			const combinedOffset = ((bayerFactor * BAYER_WEIGHT + spiralFactor * SPIRAL_WEIGHT) - 0.5) * 0.2;

			// store
			offsetLookup[y][x] = combinedOffset;
		} }

		/* --- colors --- */
		const step = 1 / (COLOR_AMOUNT - 1);
		colorsLookup = Array.from({ length: COLOR_AMOUNT }, (_, i) => colorScale(step * i).rgba());



		/* --- 3D star distribution chance gradient --- */
		// let x = 0, y = 0, z = 0;
		// starDistribution = new Uint8Array(Array.from({ length: WIDTH * height * DEPTH }, (_, index) => {

		// 	const dx = x - centerX;
		// 	const dy = y - centerY;
		// 	const dz = z - centerZ;
		// 	const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
		// 	const maxDist = Math.sqrt(centerX * centerX + centerY * centerY + centerZ * centerZ);
		// 	const val = 1 - (dist / maxDist);

		// 	// Increment coordinates
		// 	x += 1;
		// 	if (x >= WIDTH) { x = 0; y += 1; }
		// 	if (y >= height) { y = 0; z += 1; }
		// 	return ~~(val * 255);
		// }));
	}




	//
	const ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false;
	const imageData = ctx.createImageData(canvas.width, canvas.height);
	const data = imageData.data;

	//
	const noise = createNoise3D();

	let iteration = 0;
	let lastFrameTime = 0;

	//
	const loop = () => {
		/* - loop --------------------------------------- */
		const now = performance.now();
		if (now - lastFrameTime < 1000 / MAX_FPS) { requestAnimationFrame(loop); return; }
		lastFrameTime = now;
		/* ---------------------------------------------- */

		// star updates
		if (iteration % 5 === 0) {

		}


		let index = 0;
		for (let y = 0; y < height; y++) {
		for (let x = 0; x < WIDTH; x++, index += 4) {

			// Coordinates for in the noise
			const nx = x;
			const ny = y - (iteration / params.yspeed);

			//
			let amplitude = 1;
			let frequency = params.frequency;
			let noiseValue = 0;
			for (let o = 0; o < params.octaves; o++) {
				noiseValue += noise(nx * frequency, ny * frequency, (iteration / params.zspeed) + 0) * amplitude;
				amplitude *= params.persistence;
				frequency *= params.lacunarity;
			}
			let normalizedNoiseValue = Math.min(Math.max((noiseValue + 1) / 2, 0), 1); // 0..1
			normalizedNoiseValue = Math.pow(normalizedNoiseValue, POW);

			const offset = offsetLookup[y][x];
			const dithered = Math.min(Math.max(normalizedNoiseValue + offset, 0), 1);

			const color = colorsLookup[~~(dithered * (COLOR_AMOUNT - 1))];
			const alpha = ~~(color[3] * 255);
			if (alpha === 0) {
				data[index + 3] = 0;
			}
			else {
				data[index + 0] = ~~color[0];
				data[index + 1] = ~~color[1];
				data[index + 2] = ~~color[2];
				data[index + 3] = alpha;
			}
		} }





		/* - loop --------------------------------------- */
		iteration++;
		ctx.putImageData(imageData, 0, 0);
		requestAnimationFrame(loop);
		/* ---------------------------------------------- */
	}; loop();
	canvas.style.opacity = "1";


	return canvas;
}





const page = {
	width : window.innerWidth,
	height: content.scrollHeight,
};
const zValues = [0, 100, 200];
[
	createBackground(chroma.scale(["#00000000", "#e2d59a1f"]).mode("lch"), "space-background-0", zValues[0], { frequency: 0.01 }),
	createBackground(chroma.scale(["#00000000", "#e29ab61f"]).mode("lch"), "space-background-1", zValues[1], { frequency: 0.02 }),
	createBackground(chroma.scale(["#00000000", "#946fc313"]).mode("lch"), "space-background-2", zValues[2], { frequency: 0.03 }),
].forEach((canvas, i) => {
	const z = zValues[i];
	const scale = PERSPECTIVE / (PERSPECTIVE - z);
// /-------------------
// / comncept bad,    cant have same sizes, either clip offscreen or
// need somehow clipping, but all methods break parralax
// ---------
	const wrapper = document.createElement("div");
	wrapper.classList.add("space-background-wrapper");
	wrapper.appendChild(canvas);
	wrapper.style.transform = `translateZ(${z}px)`;
	content.appendChild(wrapper);
});




// create initial stars
const pixelsPerUnit = window.innerWidth / WIDTH;
type Star = { x: number; y: number; z: number; el: HTMLElement; };


function moveStar (star: Star) {

	const targetX = awa.rf(0, page.width);
	const targetY = awa.rf(0, page.height);
	const nz = awa.rf(0, DEPTH);

	star.el.style.color = STAR_SCALE(nz / DEPTH).hex();
	star.x = targetX; star.y = targetY; star.z = nz;

	const perspective = 1000;
	const zDepth = star.z * pixelsPerUnit * 10;
	const scale = perspective / (perspective + zDepth);

	// Find center of viewport
	const centerX = window.innerWidth / 2;
	const centerY = window.innerHeight / 2;

	// Adjust position to compensate for perspective pull
	const adjustedX = centerX + (targetX - centerX) / scale;
	const adjustedY = centerY + (targetY - centerY) / scale;

	const rect = star.el.getBoundingClientRect().height;
	if (adjustedY >= content.scrollHeight - rect) return star.el.style.top = `0px`;

	star.el.style.left = `${adjustedX}px`;
	star.el.style.top = `${adjustedY}px`;
	star.el.style.transform = `translateZ(-${zDepth}px)`;
}


// const starfield = document.createElement("div");
	// starfield.id = "starfield";
	// starfield.className = "bg-full";
	const stars: Star[] = Array.from({ length: STAR_AMOUNT }, () => {
		const star = { x: 0, y: 0, z: 0, el: document.createElement("p") };
		moveStar(star);
		star.el.className = "star";
		star.el.innerText = "*";

		content.appendChild(star.el);
		// starfield.appendChild(star.el);
		return star;
	});
	// content.appendChild(starfield);
const contentHeight = content.scrollHeight;
// document.querySelector(".perspective-container").style.height = `${contentHeight}px`;

