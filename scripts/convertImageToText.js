
let awawaCounter = 0;
const colors = [
	// {
	// 	id: "1",
	// 	original: "#ffffffff",
	// 	color: "#ff005f", // #ffafbcff,
	// 	char: () => { return ["a", "w"][awawaCounter++ % 2]; },
	// },
	// {
	// 	id: "2",
	// 	original: "#adadadff",
	// 	color: "#d70000", // #e8042aff,
	// 	char: () => { return ["a", "w"][awawaCounter++ % 2]; },
	// },
	// {
	// 	id: "3",
	// 	original: "#646464ff",
	// 	color: "#5f0000", // #ff516eff,
	// 	char: () => { return ["a", "w"][awawaCounter++ % 2]; },
	// },
	// {
	// 	id: "4",
	// 	original: "#2a2a2aff",
	// 	color: "#5f005f", // #541c6e6f,
	// 	char: () => { return ["a", "w"][awawaCounter++ % 2]; },
	// },
	// {
	// 	id: "5",
	// 	original: "#171717ff",
	// 	color: "#5f0087", // #ac2ee66f,
	// 	char: () => { return ["a", "w"][awawaCounter++ % 2]; },
	// },



	{
		id: "1",
		original: "#ffffffff",
		color: "#ff305d", // #ffafbcff,
		char: (x, y) => awawa(x, y),
	},
	{
		id: "2",
		original: "#adadadff",
		color: "#fa1a4b", // #e8042aff,
		char: (x, y) => awawa(x, y),
	},
	{
		id: "3",
		original: "#646464ff",
		color: "#d6103b", // #ff516eff,
		char: (x, y) => awawa(x, y),
	},
	{
		id: "4",
		original: "#2a2a2aff",
		color: "#b228b940", // #541c6e6f,
		char: (x, y) => awawa(x, y),
	},
	{
		id: "5",
		original: "#171717ff",
		color: "#b725b221", // #ac2ee66f,
		char: (x, y) => awawa(x, y),
	},
];
function awawa (x, y) { return ["a", "w"][awawaCounter++ % 2]; }


window.addEventListener("load", () => {


	const canvas = document.getElementById("canvas");

	const image = new Image();
	image.src = "./awasaka_logo_text.png";

	image.onload = () => {
		const { width, height } = image;

		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		canvas.width = width; canvas.height = height;

		ctx.drawImage(image, 0, 0);
		const imageData = ctx.getImageData(0, 0, width, height);
		let string = "";

		// The data is returned as a flat array in RGBA format with 4 values per pixel, loop through in chunks of 4
		for (let i = 0; i < imageData.data.length; i += 4) {
			const rgba = Array.from(imageData.data.slice(i, i + 4));
			const hex = `#${rgba.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
			const obj = colors.find((x) => x.original === hex);
			string += obj === undefined ? " " : obj.id;
		}

		// Convert the currently 1d string to a 2d array by splitting it into chunks of {image.width}
		let rows = string.replace(new RegExp(`.{${width}}`, "g"), "$&|").split("|")
		.slice(0, height); // Remove the last empty element




		// No idea
		string = rows.map((row) => {
			return row.match(/(.)\1*/g)
			.map((group) => {
				const obj = colors.find((x) => x.id === group[0]);
				return obj === undefined ? group
				: `<span style="color: ${obj.color}">${[...Array(group.length)].map(() => obj.char()).join("")}</span>`;
			}).join("");
		}).join("<br>");
		// Color the string

		console.log(string);



		// let text = "";
		// for (let i = 0; i < pixels.length; i += 4) {
		// 	const r = pixels[i];
		// 	const g = pixels[i + 1];
		// 	const b = pixels[i + 2];
		// 	const a = pixels[i + 3];
		// 	if (a > 0) {
		// 		text += String.fromCharCode(r);
		// 	}
		// }
		const output = document.getElementById("output");
		output.innerHTML = string;
	};
});
