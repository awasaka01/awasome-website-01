import chalk from "chalk";

const log = console.log;

// ANSI 256 Foreground Colors Grid
log(chalk.bold("ANSI 256 Foreground Colors (Grid):"));
const cols = 16;
for (let row = 0; row < 256 / cols; row++) {
  let line = "";
  for (let col = 0; col < cols; col++) {
    const i = row * cols + col;
    line += chalk.ansi256(i)(` ${i.toString().padStart(3, " ")} `);
  }
  log(line);
}

// ANSI 256 Background Colors Grid
log("\n" + chalk.bold("ANSI 256 Background Colors (Grid):"));
for (let row = 0; row < 256 / cols; row++) {
  let line = "";
  for (let col = 0; col < cols; col++) {
    const i = row * cols + col;
    line += chalk.bgAnsi256(i)(` ${i.toString().padStart(3, " ")} `);
  }
  log(line);
}

// Web-safe HEX Foreground Colors
log("\n" + chalk.bold("Web-safe HEX Foreground Colors:"));
for (let r = 0; r <= 255; r += 51) {
  let row = "";
  for (let g = 0; g <= 255; g += 51) {
    for (let b = 0; b <= 255; b += 51) {
      const hex = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      row += chalk.hex(hex)(hex + " ");
    }
  }
  log(row);
}

// Web-safe HEX Background Colors
log("\n" + chalk.bold("Web-safe HEX Background Colors:"));
for (let r = 0; r <= 255; r += 51) {
  let row = "";
  for (let g = 0; g <= 255; g += 51) {
    for (let b = 0; b <= 255; b += 51) {
      const hex = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
      row += chalk.bgHex(hex)(hex + " ");
    }
  }
  log(row);
}

// Chalk named styles showcase
log("\n" + chalk.bold("Chalk Named Styles Showcase:"));
const styles = [
  ["reset", chalk.reset("reset")],
  ["bold", chalk.bold("bold")],
  ["dim", chalk.dim("dim")],
  ["italic", chalk.italic("italic")],
  ["underline", chalk.underline("underline")],
  ["overline", chalk.overline("overline")],
  ["inverse", chalk.inverse("inverse")],
  ["hidden", chalk.hidden("hidden")],
  ["strikethrough", chalk.strikethrough("strikethrough")],
  ["visible", chalk.visible("visible (if color level > 0)")],
];
styles.forEach(([name, sample]) => log(`${name.padEnd(14)}: ${sample}`));

log("\n" + chalk.bold("Chalk Named Colors:"));
const fgColors = [
  "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
  "gray", "grey", "blackBright", "redBright", "greenBright", "yellowBright",
  "blueBright", "magentaBright", "cyanBright", "whiteBright",
];
fgColors.forEach((c) => log(`${c.padEnd(14)}: ${chalk[c]("Sample")}`));

log("\n" + chalk.bold("Chalk Named Background Colors:"));
const bgColors = [
  "bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite",
  "bgGray", "bgGrey", "bgBlackBright", "bgRedBright", "bgGreenBright", "bgYellowBright",
  "bgBlueBright", "bgMagentaBright", "bgCyanBright", "bgWhiteBright",
];
bgColors.forEach((c) => log(`${c.padEnd(18)}: ${chalk[c]("Sample")}`));
