// todo
// random option for characters
// proggressive render it
/*
custom prefix for class
dropdown select for character format, random, cycle, skip space
wrap whole thing in div, with class and output class setting the lineheight,
preview copy???????? no
test upload button for demo image!!!!!!!!!!
*/
import * as util from "__util__";
// import { highlightElement } from "@speed-highlight/core";

const default_options = {
	characters: "aw" as string,
	spaceCharacter: "&nbsp;" as string,
	characterSelection: "skip-space" as "random" | "cycle" | "skip-space",
	minifyHTML: true as boolean,
	charactersPerPixel: 1 as number,
};



// Example usage:
document.addEventListener("DOMContentLoaded", () => {
	const uploader = new util.FileUploader({
		multiple: false,
		accept: "image/*",
		button: document.getElementById("browseButton") as HTMLButtonElement,
	});

	/* ~~~~~ Elements ~~~~~ */
	const copyButton = document.getElementById("copy-button") as HTMLButtonElement;
	const copyNotification = document.getElementById("copy-notification") as HTMLDivElement;

	const currentFile = document.getElementById("currentFile") as HTMLOutputElement;
	const convertButton = document.getElementById("convertButton") as HTMLButtonElement;

	const viewAsHTML = document.getElementById("view-as-html") as HTMLButtonElement;
	const viewAsTEXT = document.getElementById("view-as-text") as HTMLButtonElement;
	const viewAsANSI = document.getElementById("view-as-ansi") as HTMLButtonElement;

	const htmlOutput = document.getElementById("output-html") as HTMLOutputElement;
	const textOutput = document.getElementById("output-text") as HTMLOutputElement;
	const ansiOutput = document.getElementById("output-ansi") as HTMLOutputElement;
	const styleElement = document.getElementById("output-style") as HTMLStyleElement;


	/* ~~~~~ Handle view switching ~~~~~ */
	let selectedView = [viewAsTEXT, textOutput];
	const switchView = ([view, output] : [HTMLButtonElement, HTMLOutputElement]) => {
		if (view === selectedView[0]) return;
		view.classList.add("selected");
		output.classList.add("selected");
		selectedView[0].classList.remove("selected");
		selectedView[1].classList.remove("selected");
		selectedView = [view, output];
	};

	viewAsTEXT.classList.add("selected");
	viewAsANSI.classList.remove("selected");
	viewAsHTML.classList.remove("selected");
	viewAsTEXT.addEventListener("click", () => switchView([viewAsTEXT, textOutput]));
	viewAsANSI.addEventListener("click", () => switchView([viewAsANSI, ansiOutput]));
	viewAsHTML.addEventListener("click", () => switchView([viewAsHTML, htmlOutput]));


	/* ~~~~~ Handle the copy button ~~~~~ */
	copyNotification.classList.add("hidden");
	copyButton.addEventListener("click", async () => {
		copyNotification.classList.remove("hidden");
		setTimeout(() => copyNotification.classList.add("hidden"), 1000);
		if (selectedView[1].innerText) await navigator.clipboard.writeText(selectedView[1].innerText);
	});





	const uploadDemo = document.getElementById("upload-demo") as HTMLButtonElement;
	uploadDemo.addEventListener("click", async () => {
		// fetch the remote/local resource
		const response = await fetch("../images/raw/demo-imagetotext.png");
		const blob = await response.blob();

		// make it look like a user-chosen file
		const file = new File([blob], "image.png", { type: blob.type });

		const dt = new DataTransfer();
		dt.items.add(file);
		uploader.input.files = dt.files;

		// fire change event so listeners react
		uploader.input.dispatchEvent(new Event("change", { bubbles: true }));
	});



	// const canvas = new OffscreenCanvas()

	let pixels : Uint8ClampedArray<ArrayBuffer>;
	let bitmap : ImageBitmap;

	uploader.onFiles = async (files) => {
		const file = files[0];
		if (file.size > 300_000) {
			const res = confirm("This file is pretty large! Converting it could take a while.\nAre you sure you want to upload it?");
			if (!res) return;
		}

		bitmap = await createImageBitmap(file);
		const canvas = document.createElement("canvas");
		canvas.width = bitmap.width; canvas.height = bitmap.height;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(bitmap, 0, 0);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		pixels = imageData.data;

		convertButton.disabled = false;
		currentFile.value = `${file.name} ${bitmap.width}x${bitmap.height} (${file.size} bytes)`;
		console.log("Width:", bitmap.width);
		console.log("Height:", bitmap.height);
		console.log("Pixel data length:", pixels.length);
		console.log("First pixel RGBA:", pixels[0], pixels[1], pixels[2], pixels[3]);
	};



	util.InputTracker.register(["characters", "spaceCharacter", "characterSelection", "minifyHTML", "charactersPerPixel"]);
	// console.log({ ...default_options, ...util.InputTracker.values() });



	type PackedRGBA = number;

	let running = false;
	convertButton.addEventListener("click", () => {
		if (running) return;
		running = true;
		// const pixelsStr = Array.from(pixels).map((v) => v.toString()).join(", ");

		// - 
		const options = { ...default_options, ...util.InputTracker.values() };
		if (options.characters.length === 0) options.characters = default_options.characters;




		const output = {
			text: [],
			ansi: ["\\x1b[0m"],
			html: [],
			htmlmin: [],
		};

		let characterIndex = -1;
		let previousColor : PackedRGBA = null;
		let htmlTagOpened : PackedRGBA | "blank" = null;


		let uniqueColors : Map<PackedRGBA, string> = new Map();

		for (let y = 0; y < bitmap.height; y++) {
			for (let x = 0; x < bitmap.width; x++) {
				const i = (y * bitmap.width + x) * 4;
				const r = pixels[i + 0];
				const g = pixels[i + 1];
				const b = pixels[i + 2];
				const a = pixels[i + 3];
				const rgba = (r << 24) | (g << 16) | (b << 8) | a;

				for (let _ = 0; _ < options.charactersPerPixel; _++) {


					let colorID = uniqueColors.get(rgba);
					if(a !== 0 && colorID === undefined) {
						colorID = uniqueColors.size.toString(36).padStart(3, "0");
						uniqueColors.set(rgba, colorID);
					}

					/* ~~~~~ Handle character selection ~~~~~ */
					if ((a !== 0 && options.characterSelection === "skip-space") || options.characterSelection === "cycle") {
						characterIndex = (characterIndex + 1) % options.characters.length;
					} else if (options.characterSelection === "random") { characterIndex = util.rr(0, options.characters.length - 1); }
					const character = a === 0 ? " " : options.characters[characterIndex];

					/* ~~~~~ ansi ~~~~~ */
					output.ansi.push(
						previousColor === rgba ? `${character}${character}`
						: `\\x1b[38;2;${r};${g};${b}m${character}${character}`,
					);

					/* ~~~~~ html ~~~~~ */
					if (a === 0) output.html.push(`<span class="blank">${options.spaceCharacter}</span>`);
					else output.html.push(`<span class="color-${colorID}">${character}</span>`);

					/* ~~~~~ htmlmin ~~~~~ */
					if (a === 0) {
						if (htmlTagOpened === "blank") { output.htmlmin.push(`${options.spaceCharacter}`); }
						else if (htmlTagOpened === null) { output.htmlmin.push(`<span class="blank">${options.spaceCharacter}`); }
						else { output.htmlmin.push(`</span><span class="blank">${options.spaceCharacter}`); }
						htmlTagOpened = "blank";
					}
					else {
						if (htmlTagOpened === rgba) { output.htmlmin.push(`${character}`); }
						else if (htmlTagOpened === null) { output.htmlmin.push(`<span class="color-${colorID}">${character}`); }
						else { output.htmlmin.push(`</span><span class="color-${colorID}">${character}`); }
						htmlTagOpened = rgba;
					}


					/* ~~~~~ text ~~~~~ */
					if (a === 0) output.text.push(" ");
					else output.text.push(character);

				}
				// - Update previous color
				previousColor = rgba;
			}
			output.text.push("\n");
			output.ansi.push("\\x1b[0m\n");
			output.html.push("\n");
			if (htmlTagOpened !== null) { output.htmlmin.push("</span>\n"); htmlTagOpened = null; }
			else output.htmlmin.push("\n");
		}

		// - 
		// console.log(output.text.join(""));
		// console.log(output.ansi.join(""));
		// console.log(output.html.join(""));
		// console.log(output.htmlmin.join(""));

		// Generate the color style tstuf

		let css = Array.from(uniqueColors.entries()).map(([rgba, colorID]) => {
			const r = (rgba >> 24) & 0xff;
			const g = (rgba >> 16) & 0xff;
			const b = (rgba >> 8) & 0xff;
			const a = rgba & 0xff;
			return `.color-${colorID} { color: rgba(${r}, ${g}, ${b}, ${a / 255}); } `;
		});
		styleElement.innerHTML = css.join("\n");


		console.log(output.ansi.join(""));
		textOutput.innerHTML = output.htmlmin.join("");
		ansiOutput.innerHTML = output.ansi.join("");

		css.unshift(...[
			".text-image {",
			"	white-space: pre;",
			"	line-height: 1ch;",
			"} ",
		]);

		let html = `<div class="text-image">\n${options.minifyHTML ? output.htmlmin.join("") : output.html.join("")}</div>`
		+ "\n<style>\n" + css.join("\n") + "\n</style>";

		htmlOutput.innerText = html;
		// highlightElement(htmlOutput);
		running = false;
	});





	c1223();

});



/* ~~~~~ Handle color list ~~~~~ */
function c1223 () {
	const dropdowns = document.getElementsByClassName("awa-dropdown") as HTMLCollectionOf<HTMLDivElement>;
	Array.from(dropdowns).forEach((dropdown) => {
		const button = dropdown.querySelector("button");
		dropdown.querySelectorAll("li").forEach((li) => li.addEventListener("click", (e) => {
			button.innerText = li.innerText;
			dropdown.setAttribute("data-value", li.getAttribute("data-value"));
			button.setAttribute("data-value", li.getAttribute("data-value"));
			li.blur();
		}));
	});
}

