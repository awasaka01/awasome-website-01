import chroma from "chroma-js";


// Forward the more complex modules from their individual files
export * from "./matrix.js";
export * from "./inputtracking.js";
export * from "./updateloop.js";


/** Generate a random whole number between min and max */
export const rr = (min : number, max : number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** A promise that resolves after t milliseconds */
export const delay = async (t = 1000) : Promise<void> => new Promise((resolve) => setTimeout(resolve, t));

/** Return the longest element of the given array */
export const longestIn = <T extends { length : number }> (array : T[]) : T => {
	let longest = array[0];
	for (const x of array) { if (longest.length < x.length) longest = x; }
	return longest;
};

/** Strip ANSI escape codes from a string */
export const removeANSI = (str : string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, "");






export function weightedRandom (pairs : [number, any][], returnArray = false) {

	// Create array with n number of each value
	const ar = [];
	for (const [weight, value] of pairs) {
		for (let i = 0; i < weight; i++) {
			ar.push(value);
		}
	}
	if (returnArray) return ar;

	// Pick a random value from the array
	return ar[Math.floor(Math.random() * ar.length)];
}

export function arrayRandom<T> (array : T[]) { return array[Math.floor(Math.random() * array.length)]; }






export function average (arr : number[]) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
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





// Deprecated
// export const getDistance = (coordA : [number, number], coordB : [number, number]) => { return Math.sqrt((coordA[0] - coordB[0]) ** 2 + (coordA[1] - coordB[1]) ** 2); };
