// Font converter script: converts all .ttf fonts in src/assets/fonts/ to .woff using fontverter
// - Moves all .ttf fonts to storage/
// - Keeps only .woff fonts in fonts/

import fs from "fs";
import path from "path";
import fontverter from "fontverter";
import ansis from "ansis";
const { convert } = fontverter;

const fontsDir = path.resolve("src/assets/fonts");
const storageDir = path.resolve("scripts/font-converter/storage");

if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

const files = fs.readdirSync(fontsDir).filter((f) => f.endsWith(".ttf") && fs.statSync(path.join(fontsDir, f)).isFile());

if (files.length === 0) {
  console.log(ansis.yellow("No .ttf files found in fonts directory. Nothing to convert."));
  process.exit(0);
}

let totalSaved = 0;
const formatSize = (n) => (n > 1024 ? (n / 1024).toFixed(1) + " KB" : n + " B");

(async () => {
  for (const file of files) {
    const inputPath = path.join(fontsDir, file);
    const base = path.parse(file).name;
    const woffPath = path.join(fontsDir, base + ".woff");
    const storagePath = path.join(storageDir, file);
    try {
      // Move .ttf to storage
      fs.copyFileSync(inputPath, storagePath);
      fs.unlinkSync(inputPath);
      console.log(ansis.cyan(`Moved ${file} to storage.`));
      // Convert to .woff
      const inputBuffer = fs.readFileSync(storagePath);
      const woffBuffer = await convert(inputBuffer, "woff");
      fs.writeFileSync(woffPath, woffBuffer);
      const oldSize = inputBuffer.length;
      const newSize = woffBuffer.length;
      const saved = oldSize - newSize;
      totalSaved += saved;
      const savedMsg = ansis.gray(`[ Saved ${formatSize(saved)} ]`);
      console.log(ansis.green(`Converted ${file} → ${base}.woff`), savedMsg);
    } catch (e) {
      console.error(ansis.red(`Failed to convert ${file}: ${e.message}`));
    }
  }
  console.log(ansis.green.bold("Font conversion complete!"), ansis.gray(`[ Total Saved ${formatSize(totalSaved)} ]`));
})();
