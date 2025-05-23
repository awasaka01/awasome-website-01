import u from "./helpers/util.js";
// import chroma from "chroma-js";



// ANCHOR - Main event
document.addEventListener("DOMContentLoaded", async (event) => {
	// unhideRandomElements();
	// barcode();
	// sort();
}, { once: true });

document.addEventListener("DOMContentLoaded", function () {
  var container = document.getElementById("main-container-T");
  if (!container) return;
  // Select all elements with visible text nodes
  container.querySelectorAll("*").forEach(function (el) {
    // Only apply to elements with visible text (not empty, not just whitespace)
    var text = el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 ? el.textContent.trim() : "";
    if (text.length > 0 && !el.hasAttribute("data-reflect")) {
      el.setAttribute("data-reflect", text);
    }
  });
});



// SECTION - Functions
// ANCHOR - Barcode Display
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


// ANCHOR - Unhide a random fun message on load
function unhideRandomElements () {
	document.querySelectorAll(".unhideRandom").forEach((e) => {
		const children = Array.from(e.children).filter((c) => c.hidden === true);
		children[Math.floor(Math.random() * children.length)].hidden = false;
	});
}


// ANCHOR - Sorting Algorithm
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

// !SECTION - Functions






// code vault :p

// values.width = Math.min(100, Math.max(0, values.width + u.rr(-60, 60)));
// values.marginLeft = Math.min(100, Math.max(0, values.marginLeft + u.rr(-60, 60)));
// Generate list of pages from file://./pages/pages.json
// async function generatePageList (params) {
// 	const pageList = document.getElementById("page-list");
// 	const pageData = await (await fetch("/pages/pages.json")).json();
// 	pageList.innerHTML = pageData.filter((page) => page.hidden !== true).map((page) => `
// 		<div tabindex="0" class="page"><a href="/pages/${page.filename}/" aria-label="${page.title}">
// 			<p class="title">${page.title}</p>
// 			<p class="line"></p>
// 			<p class="desc">${page.desc}</p>
// 		</a></div>
// 	`).join("\n");
// }
