import chroma from "chroma-js";
import chalk from "chalk";

const nColors = 6;
const chromaValue = 80;
const lightnessMin = 45;
const lightnessMax = 65;

// Evenly spaced hues and staggered lightness
const colors = [];
for (let i = 0; i < nColors; i++) {
  const hue = (i * 360) / nColors;
  const lightness = lightnessMin + (i / (nColors - 1)) * (lightnessMax - lightnessMin);
  colors.push(chroma.hcl(hue, chromaValue, lightness));
}

// Log with chalk
console.log("Visually distinct colors with staggered lightness:");
colors.forEach((c) => console.log(chalk.hex(c.hex())(c.hex())));
