const svgs = [
	// heart:
	"<svg viewBox=\"0 0 512 512\" width=\"512\" height=\"512\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"><path class=\"heartpath\" stroke=\"black\" stroke-width=\"15\" d=\"M0 0 C6.0093449 5.30841043 11.63875209 11.00699965 17.26171875 16.71875 C18.59391491 18.05321953 19.92686248 19.38694135 21.26171875 20.71875 C21.64976685 19.84500732 21.64976685 19.84500732 22.0456543 18.95361328 C33.69604896 -2.4572907 63.62597773 -19.15553787 86.26171875 -26.28125 C96.34301704 -28.95488374 106.82858065 -30.88264173 117.26171875 -31.28125 C118.42574219 -31.34119141 118.42574219 -31.34119141 119.61328125 -31.40234375 C151.06135491 -32.27305589 182.27397235 -17.69980675 205.52734375 2.70703125 C224.51428484 20.75957563 235.91894568 45.96532024 236.609375 72.05078125 C236.66410679 75.12767211 236.68693938 78.20392491 236.69921875 81.28125 C236.70861481 82.38225037 236.70861481 82.38225037 236.71820068 83.50549316 C236.79660957 98.06191945 234.6944178 112.0292291 230.63671875 126.03125 C230.38510986 126.90168945 230.13350098 127.77212891 229.87426758 128.66894531 C226.92034139 138.43617219 222.77775866 147.58669103 218.26171875 156.71875 C217.89143555 157.47172363 217.52115234 158.22469727 217.13964844 159.00048828 C202.64148938 188.16986135 181.05411003 210.96604351 158.26171875 233.84375 C157.52855438 234.58106857 157.52855438 234.58106857 156.78057861 235.33328247 C147.96130446 244.18912263 147.96130446 244.18912263 143.44921875 248.0234375 C137.02644874 253.52890252 131.20638821 259.70899292 125.26171875 265.71875 C110.69520635 280.44474976 110.69520635 280.44474976 104.86132812 285.33789062 C103.07028633 286.88400363 101.41777017 288.52961186 99.76171875 290.21875 C96.81907551 293.20768201 93.73816168 295.96527298 90.5625 298.703125 C87.75398391 301.16355675 85.00726501 303.68867483 82.26171875 306.21875 C78.39876086 309.77200421 74.52217748 313.30230419 70.55078125 316.734375 C68.70136816 318.33762048 66.86618052 319.95404954 65.03515625 321.578125 C58.25912894 327.55868976 51.36146088 333.32928453 44.19921875 338.84375 C43.49740479 339.38789551 42.79559082 339.93204102 42.07250977 340.49267578 C33.70084171 346.85912379 26.77764993 349.52647293 16.26171875 348.71875 C8.3576935 347.37681023 3.1940095 342.82536639 -2.73828125 337.71875 C-4.4650162 336.31990959 -6.1942606 334.92416217 -7.92578125 333.53125 C-18.45529075 324.89585906 -28.65338149 315.86670806 -38.73828125 306.71875 C-40.34222654 305.28100299 -41.94639886 303.84350923 -43.55078125 302.40625 C-48.56196279 297.89697084 -53.51304285 293.32448402 -58.4609375 288.74609375 C-61.47979253 285.95394066 -64.51420806 283.17913162 -67.55078125 280.40625 C-86.99490016 262.58892988 -86.99490016 262.58892988 -96.0234375 253.40234375 C-98.46915079 251.00119927 -101.07305838 248.7990491 -103.671875 246.56640625 C-106.6722571 243.88364494 -109.46780356 241.0129347 -112.26953125 238.125 C-114.30265242 236.14335026 -116.36809891 234.28673691 -118.515625 232.43359375 C-122.79136779 228.72183847 -126.80995538 224.79530085 -130.80078125 220.78125 C-131.46916016 220.11673828 -132.13753906 219.45222656 -132.82617188 218.76757812 C-137.33489796 214.25008872 -141.59377314 209.57127559 -145.73828125 204.71875 C-146.19082275 204.19321533 -146.64336426 203.66768066 -147.10961914 203.1262207 C-175.94993254 169.48948517 -196.23967173 126.43939175 -196.11328125 81.59375 C-196.11273743 80.86641663 -196.1121936 80.13908325 -196.1116333 79.38970947 C-196.01529597 51.34167429 -187.05071478 26.16054575 -167.10888672 6.10839844 C-165.92937286 4.9124966 -164.7851914 3.68193076 -163.6484375 2.4453125 C-119.94050627 -44.31200928 -46.10306228 -38.40825731 0 0 Z \" fill=\"#7F7F7F\" transform=\"translate(235.73828125,114.28125)\"/></svg>",
];





import u from "./helpers/util.js";
import chroma from "chroma-js";


document.addEventListener("DOMContentLoaded", async (event) => {
	// document.body.style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
	// for (let ee = 0; ee < 100; ee++) {
	// 	const color = randomColor({
	// 		l: [80, 80],
	// 		c: [50, 90],
	// 	});
	// 	const el = document.createElement("p");
	// 	el.innerText = color;
	// 	el.style.color = color;
	// 	document.body.appendChild(el);
	// }
	// generatePageList() ;



	unhideRandomElements();
	barcode();

	sort();
}, { once: true });








async function barcode () {

	const barcodeElement = document.getElementById("barcode");

	// Generate bars
	const amount = 80;
	const children = [];
	const bars = Array.from(Array(amount)).map((bar) => {
		const el = document.createElement("div");
		const inner = document.createElement("div");
		el.appendChild(inner);
		barcodeElement.appendChild(el);
		children.push(inner);
		return el;
	});
	barcodeElement.removeChild(barcodeElement.firstElementChild);

	const colors = ["#ff5b81", "#f87094", "#ff2558"];// "#ce3bd640", "#cd39c821"]; // #de6a6a, #daa867, #d5d569, #6cd86c, #6767e0, #a767d4, #da64da]
	// const colors = ["#de6a6a", "#de7a6a", "#dd8869", "#dc9668", "#dba467", "#daaf67", "#d9b968", "#d8c468", "#d6ce69", "#ced569", "#b9d76a", "#a3d76b", "#89d86b", "#6cd86c", "#79be8b", "#7da5a6", "#7a8bbf", "#6d70d8", "#7367de", "#8367db", "#9167d9", "#9f67d6", "#ab67d4", "#b766d6", "#c366d7", "#cf65d9", "#da64da"];


	const options = {

		// [0-100] How often to skip a bar
		skipChance: { v: 0, elementID: "barcode_skipChance", min: 0, max: 100 },

		// [bool] Whether to wrap around or bounce back and forth
		alternate: { v: false, elementID: "barcode_alternate" },

		//
	};




	const values = {
		color: 0,
		width: 0,
		marginLeft: 0,
	};

	while (true) {

		// for (let i = 0; i < children.length * 2; i++) {
		// 	const bar = i < children.length ? children.at(i) : children.at(children.length - i - 1);
		// 	const width = u.rr(0, 100);
		// 	bar.style.width = width + "%";
		// 	bar.style.marginLeft = Math.min(100 - width, u.rr(0, 100)) + "%";
		// 	bar.style.color = colors[Math.floor(Math.random() * colors.length)];
		// 	await u.pause(10);
		// }
		for (let i = 0; i < children.length * 2; i++) {
			if (Math.random() < (100 - options.skipChance.v) / 100) {

				// Either reverse direction when reaching the end or start from the beginning
				const bar = options.alternate.v
				? i < children.length ? children.at(i) : children.at(children.length - i - 1)
				: children.at(i % children.length);

				// Randomly adjust the values
				values.color = (values.color + u.rr(-1, 1)) % colors.length;

				// Set the element style
				// bar.style.width = values.width + "%";
				// bar.style.marginLeft = values.marginLeft + "%";
				const width = u.rr(0, 100);
				bar.style.width = width + "%";
				bar.style.marginLeft = Math.min(100 - width, u.rr(0, 100)) + "%";
				// bar.style.color = colors.at(values.color);
				// bar.parentElement.style.maxWidth = Math.random() < 0.9 ? "100%" : "0%";
				await u.pause(10);
			}
			await u.pause(1);
		}
	}
}

// Unhide random elements
function unhideRandomElements () {
	document.querySelectorAll(".unhideRandom").forEach((e) => {
		const children = Array.from(e.children).filter((c) => c.hidden === true);
		children[Math.floor(Math.random() * children.length)].hidden = false;
	});
}
// Generate list of pages from file://./pages/pages.json
async function generatePageList (params) {

	const pageList = document.getElementById("page-list");
	const pageData = await (await fetch("/pages/pages.json")).json();

	pageList.innerHTML = pageData.filter((page) => page.hidden !== true).map((page) => `
		<div tabindex="0" class="page"><a href="/pages/${page.filename}/" aria-label="${page.title}">
			<p class="title">${page.title}</p>
			<p class="line"></p> 
			<p class="desc">${page.desc}</p> 
		</a></div>
	`).join("\n");
}

async function sort () {

	const barsElement = document.getElementById("sortingBars");
	let bars = [barsElement.firstElementChild];
	const amount = bars[0].style.height.match(/\d+/)[0];
	bars[0].value = amount;

	for (let i = 1; i < amount; i++) {
		const el = document.createElement("div");
		el.style.height = `${i}em`;
		barsElement.appendChild(el);
		el.value = i;
		bars.push(el);
	}

	function displayOrder () { bars.forEach((bar, i) => bar.style.order = i); }
	function randomizeOrder () {
		for (let i = bars.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[bars[i], bars[j]] = [bars[j], bars[i]];
		}
	}
	function checkSorted (array, fn) { return array.sort(fn) === array; }
	// console.log(Array.from(bars[0].style).filter((s) => s !== ""));

	function recolor (element, color) {
		element.style.backgroundColor = color;
		element.style.color = color;
	}

	const loopCountDisplay = document.getElementById("loopCount");
	const timeElapsedDisplay = document.getElementById("timeDisplay");
	let loop = 0;
	let date = Date.now();

	function display () {
		displayOrder();
		timeElapsedDisplay.innerText = ((Date.now() - date) / 1000).toFixed(4);
		loopCountDisplay.innerText = loop < 100000 ? loop.toString().padStart(5, " ") : "  ERR";
	}




	const colors = {
		base: "#ff2558",
		good: "#25ff6e",
		evil: "#5125ff",
		done: "#ffffff",
	};

	const algs = {

		// Iterate over the array and
		bubble: async (array, time) => {
			date = Date.now();
			loop = 0;

			let previous = false;
			for (let j = 0; j < array.length - 1; j++) {
				for (let i = 0; i < array.length - j - 1; i++) {
					if (previous) previous.forEach((item) => recolor(item, colors.base));
					const item1 = array[i];
					const item2 = array[i + 1];
					if (item1.value > item2.value) {
						array[i] = item2;
						array[i + 1] = item1;

					[item1, item2].forEach((item) => recolor(item, colors.good));
					}
					else {

						[item1, item2].forEach((item) => recolor(item, colors.evil));

					}
					previous = [item1, item2];
					loop += 1;

					display();
					bars = array;
					await u.pause(time);
				}
			}
			if (previous) previous.forEach((item) => recolor(item, colors.base));

			// Flash white after done sorting
			for (let i = -array.length; i < array.length; i++) {
				const item = array.at(i);
				recolor(item, i >= 0 ? colors.base : colors.done);
				displayOrder();
				await u.pause(time);

			}

			await u.pause(1000);
			return array;
		},
	};
	async function loop2 () {
		randomizeOrder();
		display();
		await algs.bubble(bars, 8);
		loop2();
	}
	loop2();
}











// code vault :p
// values.width = Math.min(100, Math.max(0, values.width + u.rr(-60, 60)));
// values.marginLeft = Math.min(100, Math.max(0, values.marginLeft + u.rr(-60, 60)));
