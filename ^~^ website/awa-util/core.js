export * from "./matrix.js";
export * from "./inputtracking.js";
export * from "./updateloop.js";
export const rr = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const delay = async (t = 1e3) => new Promise((resolve) => setTimeout(resolve, t));
export const longestIn = (array) => {
  let longest = array[0];
  for (const x of array) {
    if (longest.length < x.length) longest = x;
  }
  return longest;
};
export const removeANSI = (str) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/gi, "");
export function weightedRandom(pairs, returnArray = false) {
  const ar = [];
  for (const [weight, value] of pairs) {
    for (let i = 0; i < weight; i++) {
      ar.push(value);
    }
  }
  if (returnArray) return ar;
  return ar[Math.floor(Math.random() * ar.length)];
}
export function arrayRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}
export function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
export const isPowerOf2 = (n) => n > 0 && (n & n - 1) === 0;
export const distanceL1 = (...[x1, y1, x2, y2]) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
export const distanceL2 = (...[x1, y1, x2, y2]) => Math.hypot(x1 - x2, y1 - y2);
export const distanceLInf = (...[x1, y1, x2, y2]) => Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
const offsetCaches = { L1: {}, L2: {}, LINF: {} };
export function getOffsets(radius, metric = "L2") {
  const cached = offsetCaches[metric][radius];
  if (cached) return cached;
  let offsets = [];
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x === 0 && y === 0) continue;
      let dist;
      switch (metric) {
        case "L1":
          dist = Math.sqrt(x * x + y * y);
          break;
        case "L2":
          dist = Math.hypot(x, y);
          break;
        case "LINF":
          dist = Math.max(Math.abs(x), Math.abs(y));
          break;
      }
      if (dist <= radius) offsets.push([x, y, dist * 1e4]);
    }
  }
  offsets.sort((a, b) => a[2] - b[2]);
  const result = new Int32Array(offsets.flat());
  offsetCaches[metric][radius] = result;
  return result;
}
