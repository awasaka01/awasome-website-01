const AWA = {};

import chroma from "https://unpkg.com/chroma-js@3.0.0/index.js";



// Random number generator between min and max
export const rr = (min, max) => { return Math.floor(Math.random() * (max - min + 1)) + min; };

Array.prototype.random = function () { return this[Math.floor(Math.random() * this.length)]; };
Array.prototype.sum = function () { return this.reduce((a, c) => { return a + c; }, 0); };



/**
 * Generates a random color as a hex string.
 * @param {Object} options - Options to generate the color.
 * @param {string} [options.colorRange="oklab"] - The color range of the generated color.
 * @returns {string} A random color as a hex string.
 */
export const randomColor = ({
	colorspace = "oklab", // or hsl
	l = [0, 100], // 0.00 - 1.00
	c = [0, 100], // 0.00 - 0.37
	h = [0, 255], // 0 - 255
	precision = 1000,
} = {}) => {
	l = rr(...l.map((x) => { return x * precision; })) / (precision * 100);
	c = rr(...c.map((x) => { return (x * 0.4) * precision; })) / (precision * 100);
	h = rr(...h.map((x) => { return x * precision; })) / precision;

	return chroma.oklch(l, c, h).hex();
};


// Initiliaztion Function for webpage additions
export const init = (options = {}) => {
	// Default Options
	options = Object.assign({ homeButton: 1 }, options);


	// Home Button 0:None 1:FullBar 2:Basic
	if (options.homeButton === 1) {
		const html = "<a href=\"/\" class=\"homebutton\"><div><i class=\"material-icons\">home</i></div></a>";
		document.body.innerHTML += html;
	}
	if (options.homeButton === 2) {
		const html = "<a href=\"/\" class=\"homebutton\"><div><i class=\"material-icons\">home</i></div></a>";
		document.body.innerHTML += html;
	}
};

export const getDistance = (coordA, coordB) => {
	return Math.sqrt((coordA[0] - coordB[0]) ** 2 + (coordA[1] - coordB[1]) ** 2);
};


// Remove duplicate objects from array by ID
export const removeDuplicatesByID = (keyname, array) => {
	return [...array.reduce((a, c) => { a.set(c[keyname], c); return a; }, new Map()).values()];
};




// Performance Analyzer
const values = {};
export const perf = () => {


	//
	const marks = performance.getEntriesByType("mark");
	if (marks.length === 0) { return; }

	marks.forEach((mark) => {
		if (mark.name.startsWith("/")) { return; }
		performance.measure(mark.name, mark.name, "/" + mark.name);
	});

	//
	const marksGrouped = Object.groupBy(marks, ({ name }) => { return name; });

	const markNames = Object.keys(marksGrouped).filter((key) => { return !key.startsWith("/"); });

	const pairs = markNames.flatMap((key) => {
			return marksGrouped[key].map((x) => { return [x, marksGrouped["/" + key].shift()]; });
	});

	markNames.forEach((key) => { if (values[key] === undefined) { values[key] = { list: [], avg: 0 }; } });

	console.log("\n\n");
	console.log(pairs);
	console.log(marksGrouped); // leftover




	pairs
	.forEach((pair) => {
		const ref = values[pair[0].name];
		ref.list.push(pair[1].startTime - pair[0].startTime);
		if (ref.list.length > 1000) { ref.list.shift(); }
	});


	markNames.forEach((key) => {
		values[key].avg = values[key].list.sum() / values[key].list.length;
	});
	[].sum();

	console.log(values);


	// const all = performance.getEntriesByType("measure");
	// all.forEach((measure) => {
	// 	values[measure.name] !== undefined
	// 	? values[measure.name].push(measure.duration)
	// 	: values[measure.name] = [measure.duration];
	// 	if (values[measure.name].length > 1000) { values[measure.name].shift(); }

	// });
	// console.log(values);

	// console.log("\n\n\n\n");
	// console.log([
	// "|	Performance Analyzer:",

	// 	all.map((x) => { return `|	${x.name}: ${x.duration}ms`; }).join("\n"),
	// ].join("\n"));

	performance.clearMarks(); performance.clearMeasures();
};


	// Object.defineProperty(Array.prototype, "random", {
	// 	value: function (compare) { return this; },
	// });



// // Select random item from array
// Array.prototype.sample = () => this[Math.floor(Math.random() * this.length)];


// // Main Util Function
// const Util = {

// 	// Returns a random number between max and min (inclusive)
// 	randrange: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
// };
