import fs from "fs";

export const data = {
	title: "SCSS Color Variables",
	permalink: "/color-preview/index.html",
};

const colorVariableDefaults = {
	hex: undefined, // Will be set by the SCSS file
	l: 0.0015,
	c: 0.0002,
	h: 0.12,
	lmin: -1000000,
	lmax: 1000000,
	cmin: 0,
	cmax: 0.37,
	hmin: -360,
	hmax: 360,
};

export function render (data) {
	// Read the SCSS file
	const scss = fs.readFileSync("./src/modules/_styles/_colors.scss", "utf8");
	// Extract $color-params map from SCSS
	const paramsMapMatch = scss.match(/\$color-params:\s*\(([^;]*?)\);/s);
	let colorParams = {};
	if (paramsMapMatch) {
		const mapBody = paramsMapMatch[1];
		const entryRegex = /(\w+):\s*\(([^)]*)\)/g;
		let entry;
		while ((entry = entryRegex.exec(mapBody)) !== null) {
			const name = entry[1];
			const paramStr = entry[2];
			const params = {};
			paramStr.split(/,\s*/).forEach((pair) => {
				const [k, v] = pair.split(":").map((s) => s && s.trim());
				if (k && v && !isNaN(Number(v))) params[k] = Number(v);
			});
			colorParams[name] = params;
		}
	}
	// Extract only the region between /* start */ and /* end */
	const regionMatch = scss.match(/\/\* start \*\/(.*?)\/\* end \*\//s);
	const region = regionMatch ? regionMatch[1] : "";
	const vars = region
		.split("\n")
		.map((l) => l.trim())
		.filter((l) => l.startsWith("$") && l.includes(":"))
		.map((l) => {
			const [varPart, ...rest] = l.split(":");
			const name = varPart.replace("$", "").trim();
			const valuePart = rest.join(":");
			const value = valuePart.split(";")[0].trim();
			const params = colorParams[name] || {};
			return { name, value, params };
		});

	// Output minimal HTML and a script to generate the preview client-side
	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${data.title}</title>
  <script type="importmap">
    {
      "imports": {
        "chroma-js": "https://unpkg.com/chroma-js@3.1.2/es/index.js"
      }
    }
  </script>
  <style>
    body { background: #181a20; color: #fff; font-family: 'gohufont', monospace, 'Consolas', 'Menlo', 'monospace'; margin: 0; min-height: 100vh; padding: 2rem 0; box-sizing: border-box; }
    .color-section { width: calc(100vw - 2rem); max-width: 100vw; margin: 1rem auto; background: #23242a; box-shadow: inset 0 1px 8px #0008; padding: 0.5rem 0 0.5rem 0; display: grid; grid-template-rows: auto 32px 32px 32px 32px; grid-template-columns: repeat(1000, 1fr); overflow: hidden; }
    .color-title { grid-row: 1; grid-column: 1 / span 1000; font-size: 1.1em; font-weight: bold; padding: 0.3rem 0.5rem 0.2rem 0.5rem; margin: 0 auto; text-align: center; justify-self: center; align-self: center; }
    .color-bar { grid-row: 2; grid-column: 1 / span 1000; width: 100%; height: 32px; background: var(--color-bar, #fff); margin: 0; }
    .color-row { display: contents; }
    .color-swatch { height: 32px; width: 100%; margin: 0; display: block; }
    @media (max-width: 900px) { .color-section { grid-template-rows: auto 20px 20px 20px 20px; } .color-bar, .color-swatch { height: 20px; } .color-title { padding: 0.2rem 0.2rem 0.1rem 0.2rem; } }
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  <div id="color-preview-root"></div>
  <script type="module">
    import chroma from "chroma-js";
    const colorVariableDefaults = ${JSON.stringify(colorVariableDefaults)};
    const vars = ${JSON.stringify(vars)};
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    function cl(colorObject, number) {
      let [l, c, h] = chroma(colorObject.hex).oklch();
      l = clamp((l + ((number - 500) * colorObject.l)), colorObject.lmin, colorObject.lmax);
      c = clamp(c + ((500 - number) * colorObject.c), colorObject.cmin, colorObject.cmax);
      h = clamp(h + ((number - 500) * colorObject.h), colorObject.hmin, colorObject.hmax);
      return chroma.oklch(l, c, h).hex();
    }
    const root = document.getElementById("color-preview-root");
    root.innerHTML = vars.map(({ name, value, params }) => {
      const colorObj = { ...colorVariableDefaults, hex: value, ...params };
      const row100 = Array.from({ length: 10 }, (_, i) => {
        const step = i * 100;
        return \`<div class="color-swatch" style="grid-row: 3; grid-column: \${i * 100 + 1} / span 100; background: \${cl(colorObj, step)}" title="\$\{name\}\${step}"></div>\`;
      }).join("");
      const row10 = Array.from({ length: 100 }, (_, i) => {
        const step = i * 10;
        return \`<div class="color-swatch" style="grid-row: 4; grid-column: \${i * 10 + 1} / span 10; background: \${cl(colorObj, step)}" title="\$\{name\}\${step}"></div>\`;
      }).join("");
      const row1 = Array.from({ length: 1000 }, (_, i) => {
        return \`<div class="color-swatch" style="grid-row: 5; grid-column: \${i + 1} / span 1; background: \${cl(colorObj, i)}" title="\$\{name\}\${i}"></div>\`;
      }).join("");
      return \`<section class="color-section">\` +
        \`<div class="color-title">\$\{name\}</div>\` +
        \`<div class="color-bar" style="--color-bar: \$\{value\}; background: \$\{value\};"></div>\` +
        row100 + row10 + row1 +
        \`</section>\`;
    }).join("");
  </script>
</body>
</html>
`;
}
