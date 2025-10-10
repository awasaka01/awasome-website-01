
// @

	//
	const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
	const imageData = ctx.createImageData(canvas.width, canvas.height);
	const data = imageData.data;


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



	let t = 0;
	let lastFrameTime = 0;
	const loop = () => {
		const now = performance.now();
		if (now - lastFrameTime < 1000 / MAX_FPS) { requestAnimationFrame(loop); return; }
		lastFrameTime = now;
	// ----------------------------------------------------------------------------


		// center offset up a bit
		const centerX = canvas.width / 2;
		const centerY = window.visualViewport.height * (canvas.width / window.innerWidth) / 2;


		let x = 0;
		let y = 0;
		for (let index = 0; index < data.length; index += 4) {

			// Coordinates for in the noise
			const nx = x;
			const ny = y - (t / 40);

			//
			let amplitude = 1;
			let frequency = params.frequency;
			let noiseValue = 0;
			for (let o = 0; o < params.octaves; o++) {
				noiseValue += noise(nx * frequency, ny * frequency, t / params.speed) * amplitude;
				amplitude *= params.persistence;
				frequency *= params.lacunarity;
			}

			//
			let normalized = Math.pow((noiseValue + 1) / 2, params.bias) * params.scale;

			//
			normalized = Math.min(Math.max(normalized, 0), 1);

			// 
			const bayerThreshold = BAYER4x4[y & 0b11][x & 0b11]; // 0..1

			// --- Spiral offset ---
			const deltaX = x - centerX;
			const deltaY = y - centerY;
			const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			const angle = Math.atan2(deltaY, deltaX); // -π..π
			const spiralFactor = ((radius * 0.05 + angle * 0.2) % 1); // tweak 0.05/0.2 for spacing

			// --- Combine offsets with weights ---
			const bayerWeight = 0.8; // strength of high-frequency Bayer
			const spiralWeight = 1; // strength of spiral
			const combinedOffset = ((bayerThreshold * bayerWeight + spiralFactor * spiralWeight) - 0.5) * 0.2;

			// Apply to normalized noise
			const dithered = Math.min(Math.max(normalized + combinedOffset, 0), 1);


			const stepped = Math.round(dithered / colorEEE) * colorEEE;


			let c = colorScale(stepped).rgba();
			data[index + 0] = c[0];
			data[index + 1] = c[1];
			data[index + 2] = c[2];
			data[index + 3] = c[3] * 255;

			//
			x = (x + 1) % WIDTH;
			if (x === WIDTH - 1) y += 1;
		}




	// ----------------------------------------------------------------------------
		t += 1;
		ctx.putImageData(imageData, 0, 0);
		requestAnimationFrame(loop);
	};
	loop();

