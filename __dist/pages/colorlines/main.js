//
const config = {
	jointSize: 1,
	jointColor: "#ffffff",

	lineWidth: 1,
	lineLength: () => rr(50, 90),

	_line: "#ff445d", // Adjusts the hue of the line each time it's read
	get lineColor () { return this._line = chroma(this._line).set("lch.h", "+2").hex(); },

	pointSize: 1,
	pointColors: ["#ff7575", "#9eff81", "#7ccaff", "#fffa77"],
	displayPoints: true,
};




// Helpers
import chroma from "chroma-js";
import { rr, getDistance } from "awa";
function farthestFromZero (n1, n2) { return Math.abs(n1) > Math.abs(n2) ? n1 : n2; }


window.addEventListener("load", () => {

	// Do some stuff
	const cover = document.getElementById("page-bg-cover");
	const canvas = document.getElementById("page-bg-canvas");
	const canvas2 = document.getElementById("page-bg-points");
	let ctx = canvas.getContext("2d");
	let ctx2 = canvas2.getContext("2d");

	// Calculate the size of the canvas
	const body = document.body; const html = document.documentElement;
	const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	const width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
	canvas.width = width; canvas.height = height; canvas2.width = width; canvas2.height = height;

	ctx.lineWidth = config.lineWidth;
	ctx2.strokeStyle = config.jointColor;
	let requiredDistance = config.lineLength;


	// Track the mouse and previous line location
	let mouse = { x: 0, y: 0, get xy () { return [this.x, this.y]; } };
	let prev = null;
	window.addEventListener("mousemove", (mouseEvent) => {
		mouse.x = mouseEvent.clientX; mouse.y = mouseEvent.clientY;

		// Make the shadow follow the mouse
		cover.style.left = `${mouse.x}px`; cover.style.top = `${mouse.y}px`;

		// Once for the first movement
		if (prev === null) { return prev = { ...mouse }; }


		// Calculate the possible points that the line could be drawn in increments of 45deg
		const points = [
			[prev.x, mouse.y],
			[mouse.x, prev.y],
			[
				prev.x + farthestFromZero(mouse.x - prev.x, mouse.y - prev.y),
				prev.y + farthestFromZero(mouse.x - prev.x, mouse.y - prev.y),
			],
			[
				prev.x - farthestFromZero(-(mouse.x - prev.x), mouse.y - prev.y),
				prev.y + farthestFromZero(-(mouse.x - prev.x), mouse.y - prev.y),
			],
		];



		// Draw the points
		if (config.displayPoints === true) {
			ctx2.clearRect(0, 0, width, height);
			points.forEach((point, i) => {
				ctx2.beginPath();
				ctx2.strokeStyle = config.pointColors[i];
				ctx2.rect(...point, 1, 1);
				ctx2.stroke();
				ctx.closePath();
			});
		}


		// Calculate the closest of the points to the mouse
		const destination = points.sort((a, b) => getDistance([mouse.x, mouse.y], a) - getDistance([mouse.x, mouse.y], b))[0];

		if (getDistance([prev.x, prev.y], destination) < requiredDistance) { return; }
		requiredDistance = config.lineLength();

		// Draw the line
		ctx.beginPath();
		ctx.strokeStyle = config.lineColor;
		ctx.moveTo(prev.x, prev.y);
		ctx.lineTo(...destination);
		ctx.stroke();
		ctx.closePath();

		// Draw a dot at the end of the previous line
		ctx.beginPath();
		ctx.strokeStyle = "#ffffff02";
		ctx.rect(prev.x, prev.y, 1, 1);
		ctx.stroke();
		ctx.closePath();

		prev.x = destination[0]; prev.y = destination[1];
		console.log("\n");

		console.log("mouse", mouse);
		console.log("destination", destination);
		console.log("previous", prev);
	});
});






// Button
