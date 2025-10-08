import * as awa from "__util__";
import chroma from "chroma-js";
import { createNoise3D } from "simplex-noise";

function name (scale) {

	const canvas = document.createElement("canvas");
	canvas.className = "starfield";
	const ctx = canvas.getContext("2d");
	canvas.width = 128;

	document.body.appendChild(canvas);



	function updateCanvasHeight () { canvas.height = Math.max(document.body.scrollHeight, window.innerHeight) * (canvas.width / window.innerWidth); }
	document.addEventListener("resize", updateCanvasHeight);
	updateCanvasHeight();

	ctx.imageSmoothingEnabled = false;
	const imageData = ctx.createImageData(canvas.width, canvas.height);
	const data = imageData.data;
	const pixels = data.length / 4;

	const maxFPS = 10;
	let lastFrameTime = 0;

	function setPixel (x, y, r, g, b, a) {
		x = Math.abs(~~x) % canvas.width;
		y = Math.abs(~~y) % canvas.height;
		const index = y * canvas.width + x;
		data[index * 4 + 0] = r;
		data[index * 4 + 1] = g;
		data[index * 4 + 2] = b;
		data[index * 4 + 3] = a;
	}



	const noise = createNoise3D();
	const colorCount = 4;

	const colorEEE = 1 / colorCount;

	data.fill(255);

	const params = {
		octaves: 2, // Number of noise layers stacked; higher = more detail
		bias: 2, // Exponent for reducing amplitude per octave; higher = smoother
		frequency: 0.018, // Base frequency of noise (how zoomed in/out)
		lacunarity: 1.5, // Frequency multiplier per octave; higher = more rapid detail
		persistence: 0.6, // Amplitude multiplier per octave; higher = rougher noise
		scale: 1, // Global scale multiplier for output
		min: 0, // Minimum output value after scaling
		max: 255, // Maximum output value after scaling
		speed: 900,
	};

	let t = 0;
	const loop = () => {
		const now = performance.now();
		if (now - lastFrameTime < 1000 / maxFPS) { requestAnimationFrame(loop); return; }
		lastFrameTime = now;
	// ----------------------------------------------------------------------------

		for (let x = 0; x < canvas.width; x++) {
		for (let y = 0; y < canvas.height; y++) {
			let amplitude = 1;
			let frequency = params.frequency;
			let noiseValue = 0;

			let nx = x;
			let ny = y - (t / 40);


			// fractal noise in-loop
			for (let o = 0; o < params.octaves; o++) {
				noiseValue += noise(nx * frequency, ny * frequency, t / params.speed) * amplitude;
				amplitude *= params.persistence;
				frequency *= params.lacunarity;
			}

			// map -1..1 -> 0..1, apply bias, then scale
			let normalized = Math.pow((noiseValue + 1) / 2, params.bias) * params.scale;

			// clamp 0..1 to avoid overshoot
			normalized = Math.min(Math.max(normalized, 0), 1);

	// normalized is 0..1 noise value
	// x, y are pixel coordinates
	const cx = canvas.width / 2;
	const cy = canvas.height / 2;

	// --- 2x2 Bayer matrix ---
	const bayer2x2 = [
		[0, 2],
	[3, 1],
	];
	const matrixSize = 2;
	const bayerThreshold = bayer2x2[y % matrixSize][x % matrixSize] / 4; // 0..1

	// --- Spiral offset ---
	const dx = x - cx;
	const dy = y - cy;
	const radius = Math.sqrt(dx * dx + dy * dy);
	const angle = Math.atan2(dy, dx); // -π..π
	const spiralFactor = ((radius * 0.05 + angle * 0.2) % 1); // tweak 0.05/0.2 for spacing

	// --- Combine offsets with weights ---
	const bayerWeight = 0.8; // strength of high-frequency Bayer
	const spiralWeight = 1; // strength of spiral
	const combinedOffset = ((bayerThreshold * bayerWeight + spiralFactor * spiralWeight) - 0.5) * 0.2;

	// Apply to normalized noise
	const dithered = Math.min(Math.max(normalized + combinedOffset, 0), 1);



			const stepped = Math.round(dithered / colorEEE) * colorEEE;



			let c = scale(stepped).rgba();
			setPixel(x, y, c[0], c[1], c[2], c[3] * 255);
		} }




	// ----------------------------------------------------------------------------
		t += 1;
		ctx.putImageData(imageData, 0, 0);
		requestAnimationFrame(loop);
	};
	loop();


}










function stars () {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	canvas.className = "stars";
	canvas.width = 256;
	function updateCanvasHeight () { canvas.height = Math.max(document.body.scrollHeight, window.innerHeight) * (canvas.width / window.innerWidth); }
	document.addEventListener("resize", updateCanvasHeight);
	updateCanvasHeight();
	document.body.appendChild(canvas);
	ctx.fillStyle = "#ffffff27";

	for (let i = 0; i < 100; i++) {
		const x = awa.ri(0, canvas.width);
		const y = awa.ri(0, canvas.height);
		ctx.fillRect(x, y, 1, 1);

	}
}






stars();
name(chroma.scale(["#0a091b00", "#e876bc1f"]).mode("rgb"));
