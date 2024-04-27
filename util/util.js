const Util = {};

(() => {


	// Mini Functions
	Util.rr = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


	// Initiliaztion Function
	Util.init = (options = {}) => {

		// Default Options
		Util.options = Object.assign({
			homeButton: true,
			defaultCSS: true,
		}, options);


		// Back Button
		if (Util.options.homeButton) {
			const html = "<a href=\"/\" class=\"homebutton\"><div><i class=\"material-icons\">home</i></div></a>";
			document.body.innerHTML += html;
		}

	};
})();



// Util.init = {

// }

// // Select random item from array
// Array.prototype.sample = () => this[Math.floor(Math.random() * this.length)];


// // Main Util Function
// const Util = {

// 	// Returns a random number between max and min (inclusive)
// 	randrange: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
// };