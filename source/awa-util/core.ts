import chroma from "chroma-js";
import chalk from "chalk";


// Forward the more complex modules from their individual files
export * from "./_matrix.js";
export * from "./_inputtracking.js";
export * from "./_updateloop.js";

/** DEPRECATED, use specific random int or float functions */
export const rr = (min : number, max : number, floor = true) => floor ? Math.floor(Math.random() * (max - min + 1)) + min : Math.random() * (max - min + 1) + min;

/** Generate a random whole number between min and max */
export const ri = (min : number, max : number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Generate a random float between min and max */
export const rf = (min : number, max : number) => Math.random() * (max - min) + min;

/** A promise that resolves after t milliseconds */
export const delay = async (t = 1000) : Promise<void> => new Promise((resolve) => setTimeout(resolve, t));
export const sleep = delay;

/** Return the longest element of the given array */
export const longestIn = <T extends { length : number }> (array : T[]) : T => {
	let longest = array[0];
	for (const x of array) { if (longest.length < x.length) longest = x; }
	return longest;
};

/** Removes all ANSI escape codes from a string */
export const removeANSI = (str : string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, "");

/** Escapes all ANSI escape codes, so they can be shown in the terminal */
export const showANSI = (str : string) => str.replace(/\x1b(\[[0-9;]+m)/g, "$&\\x1b$1\x1b[0m");

/** Regex to match all useless RGB escape codes, replace with $<fg>$<bg> */
export const removeDuplicateRGBescapeCodes = /(?<fg>\\x1b\[38;2;(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]);(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]);(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])m){2,}|(?<bg>\\x1b\[48;2;(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]);(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]);(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])m){2,}/g;


/* Generate a weighted array of values, based on an array of [weight, value] pairs, or an object */
export function weightedArray<T> (pairs : [weight: number, value: T][] | { weight : number, value : T }[]) {

	// Convert input to array of objects
	if (Array.isArray(pairs[0])) pairs = pairs.map((pair) => ({ weight : pair[0], value : pair[1] }));
	const pairObjects = pairs as { weight : number, value : T }[];

	// Generate weighted array
	const output = [] as T[];
	for (const obj of pairObjects) { for (let i = 0; i < obj.weight; i++) { output.push(obj.value); } }
	return output;
}


/** Returns a random value from an array of [weight, value] pairs */
export function weightedRandom<T> (pairs : [weight: number, value: T][], returnArray = false) {

	// Create array with n number of each value
	const ar = [];
	for (const [weight, value] of pairs) {
		for (let i = 0; i < weight; i++) {
			ar.push(value);
		}
	}
	if (returnArray) return ar as T[];

	// Pick a random value from the array
	return ar[Math.floor(Math.random() * ar.length)] as T;
}


/** Returns a random value from an array */
export function arrayRandom<T> (array : T[]) { return array[Math.floor(Math.random() * array.length)]; }

/** Returns the average of the given array */
export function average (arr : number[]) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

/** Returns true if the given number is a power of 2 */
export const isPowerOf2 = (n : number) : boolean => n > 0 && (n & (n - 1)) === 0;





export type DistanceMetric = "L1" | "L2" | "LINF";
type Point2 = [number, number, number, number];
// L1 / Manhattan distance (diamond), min amount of grid spaces needed to traverse to reach target
// L2 / Euclidean distance (circle), straight line to target
// L∞ norm / Chebyshev distance (square), maximum of horizontal and vertical distance
export const distanceL1 = (...[x1, y1, x2, y2] : Point2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
export const distanceL2 = (...[x1, y1, x2, y2] : Point2) => Math.hypot(x1 - x2, y1 - y2);
export const distanceLInf = (...[x1, y1, x2, y2] : Point2) => Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));



/* Store already computed coordinate offsets for a given radius + metric (L1, L2, LINF) */
const offsetCaches : Record<DistanceMetric, Record<number, Int32Array>> = { L1: {}, L2: {}, LINF: {} };
/** Precomputes and caches coordinate offsets for a given radius + metric (L1, L2, LINF)
	Returns a flat Int32Array [dx, dy, distance, dx, dy, distance, ...] for fast coordinate lookup */
export function getOffsets (radius : number, metric : DistanceMetric = "L2") : Int32Array {
	const cached = offsetCaches[metric][radius]; if (cached) return cached;

	let offsets : [number, number, number][] = [];
	for (let y = -radius; y <= radius; y++) {
		for (let x = -radius; x <= radius; x++) {
			if (x === 0 && y === 0) continue;
			let dist : number;
			switch (metric) {
				case "L1": dist = Math.sqrt(x * x + y * y); break;
				case "L2": dist = Math.hypot(x, y); break;
				case "LINF": dist = Math.max(Math.abs(x), Math.abs(y)); break;
			}
			if (dist <= radius) offsets.push([x, y, dist * 10000]);
		}
	}
	offsets.sort((a, b) => a[2] - b[2]); // Sort by distance
	const result = new Int32Array(offsets.flat());
	offsetCaches[metric][radius] = result;
	return result;
}


/** Convert a string of html to a DOM element */
export function createElement (html : string) : HTMLElement {
	if (!document) throw new Error("'htmlToElement' can only be run in a browser environment");
	const template = document.createElement("template");
	template.innerHTML = html;
	return template.content.firstChild as HTMLElement;
}




interface FileUploaderOptions {
	multiple ?: boolean; // allow multiple files
	accept ?: string | "image/*" | "audio/*" | "video/*";
	button : string | HTMLButtonElement;
}

/** File uploader class */
export class FileUploader {
	public input : HTMLInputElement;
	public button : HTMLButtonElement;

	public onFiles ?: (files : File[]) => void;

	constructor (options : FileUploaderOptions) {
		if (!document) throw new Error("'FileUploader' can only be run in a browser environment");

		// - Create hidden file <input> element
		if (document.getElementById("FileUploaderInput")) throw new Error("FileUploaderInput already exists, either you're creating it manually or running this class twice?");
		this.input = createElement(
			`<input type="file" id="FileUploaderInput" ${options.multiple ? "multiple" : ""} hidden="true" accept="${options.accept ?? "*/*"}" style="display: none !important;">`,
		) as HTMLInputElement;
		document.body.appendChild(this.input);


		// - Attach button if provided
		if (typeof options.button === "string") {
			this.button = document.getElementById(options.button) as HTMLButtonElement;
			throw new Error(`ID ${options.button} not found`);
		}
		else { this.button = options.button; }



		// - Trigger the file upload when the button is clicked
		this.button.addEventListener("click", () => this.input.click());

		// - Get the files from the input element
		this.input.addEventListener("change", (e) => {
			const target = e.target as HTMLInputElement;
			if (target.files) this.emitFiles(target.files);
		});

		// - Handle paste events
		document.addEventListener("paste", (e) => { if (e.clipboardData?.files.length) { this.emitFiles(e.clipboardData.files);	} });
	}

	private emitFiles (files : FileList | File[]) {
		let arr = Array.from(files);

		// - Limit to 1 file if not multiple
		if (!this.input.multiple) arr = arr.slice(0, 1);

		// - Emit
		if (this.onFiles) this.onFiles(arr);
	}
}

// Deprecated
// export const getDistance = (coordA : [number, number], coordB : [number, number]) => { return Math.sqrt((coordA[0] - coordB[0]) ** 2 + (coordA[1] - coordB[1]) ** 2); };
