const AWA = {};

import chroma from "https://unpkg.com/chroma-js@3.0.0/index.js";



// Random number generator between min and max
/**
 * Generates a random integer between min and max, inclusive.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer between min and max.
 */
const rr = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * ? Generates a random element from the array.
 * @returns {unknown} A random element from the array.
 */
Array.prototype.random = function () { return this[Math.floor(Math.random() * this.length)]; };


/**
 * ? Sums all elements in the array.
 * @returns {number} The sum of all elements in the array.
 */
Array.prototype.sum = function () {	return this.reduce((a, c) => a + c, 0); };

/**
 * ? Generates a random color as a hex string.
 * @param {Object} options - Options to generate the color.
 * @param {string} [options.colorspace="oklab"] - The color space of the generated color.
 * @param {Array<number>} [options.l=[0, 100]] - Lightness range.
 * @param {Array<number>} [options.c=[0, 100]] - Chroma range.
 * @param {Array<number>} [options.h=[0, 255]] - Hue range.
 * @param {number} [options.precision=1000] - Precision for random generation.
 * @returns {string} A random color as a hex string.
 */
const randomColor = ({
    colorspace = "oklab",
    l = [0, 100],
    c = [0, 100],
    h = [0, 255],
    precision = 1000,
}
= {}) => {
    l = rr(...l.map((x) => x * precision)) / (precision * 100);
    c = rr(...c.map((x) => (x * 0.4) * precision)) / (precision * 100);
    h = rr(...h.map((x) => x * precision)) / precision;

    return chroma.oklch(l, c, h).hex();
};


/**
 * Pauses execution for a given number of milliseconds.
 * @param {number} [t=1000] - The time to pause in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the given time.
 */
const pause = async (t = 1000) => { await new Promise((resolve) => setTimeout(resolve, t)); };

/**
 * ? Calculate the distance between two coordinates.
 * @param {Array<number>} coordA - The first coordinate [x, y].
 * @param {Array<number>} coordB - The second coordinate [x, y].
 * @returns {number} The distance between the two coordinates.
 */
const getDistance = (coordA, coordB) => Math.sqrt((coordA[0] - coordB[0]) ** 2 + (coordA[1] - coordB[1]) ** 2);

/**
 * ? Remove duplicate objects from an array by ID.
 * @param {string} keyname - The key name to check for duplicates.
 * @param {Array<Object>} array - The array to remove duplicates from.
 * @returns {Array<Object>} A new array with duplicates removed.
 */
const removeDuplicatesByID = (keyname, array) => [...array.reduce((a, c) => { a.set(c[keyname], c); return a; }, new Map()).values()];



// Performance Analyzer
const values = {};

/**
 * Analyzes performance by measuring and logging performance entries.
 */
const perf = () => {
    const marks = performance.getEntriesByType("mark");
    if (marks.length === 0) { return; }

    marks.forEach((mark) => {
        if (mark.name.startsWith("/")) { return; }
        performance.measure(mark.name, mark.name, "/" + mark.name);
    });

    const marksGrouped = Object.groupBy(marks, ({ name }) => name);

    const markNames = Object.keys(marksGrouped).filter((key) => !key.startsWith("/"));

    const pairs = markNames.flatMap((key) => marksGrouped[key].map((x) => [x, marksGrouped["/" + key].shift()]));

    markNames.forEach((key) => {
        if (values[key] === undefined) {
            values[key] = { list: [], avg: 0 };
        }
    });

    console.log("\n\n");
    console.log(pairs);
    console.log(marksGrouped);

    pairs.forEach((pair) => {
        const ref = values[pair[0].name];
        ref.list.push(pair[1].startTime - pair[0].startTime);
        if (ref.list.length > 1000) { ref.list.shift(); }
    });

    markNames.forEach((key) => {
        values[key].avg = values[key].list.sum() / values[key].list.length;
    });
    [].sum();

    console.log(values);

    performance.clearMarks();
    performance.clearMeasures();
};

const obj = { rr, randomColor, pause, getDistance, removeDuplicatesByID, perf };
export default obj;
