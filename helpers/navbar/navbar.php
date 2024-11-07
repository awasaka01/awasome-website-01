<link rel="stylesheet" href="/helpers/navbar/navbar.css">
<div class="title-bar-container"><header class="title-bar">
	<p><?=$page_title?></p>
	<div class="title-bar-button" id="button-oneko"></div>
	<div class="title-bar-button" id="button-heart"></div>
	<a href="/" class="title-bar-button" id="button-home"></a>
</header></div>

<script defer>

	const buttons = {
		heart: { active: false, el: "button-heart", event: heartToggled },
		oneko: { active: false, el: "button-oneko", event: onekoToggled },
	};

	//
	for (const value of Object.values(buttons)) {
		value.el = document.getElementById(value.el);

		// Add event listeners to toggle button states on click
		value.el.addEventListener("click", (e) => {
			value.active = !value.active;
			value.el.classList.toggle("active", value.active);
			value.event(e);
		});
	}

	// Falling Hearts
	// const symbols = ["./images/fallingheartmask.svg"];
	// const randomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

	// // Create one of each element
	// const amount = Math.ceil(window.screen.width * window.screen.height / 100000 + 5);
	// const container = document.getElementById("heartcontainer");


	// for (let i = 1; i <= amount; i++) {
	// 	const heart = document.createElement("div");
	// 	heart.innerHTML = svgs[0];
	// 	heart.classList.add("heart");
	// 	container.appendChild(heart);
	// }
	function heartToggled (event) {
	};



	// Oneko!! Cat follow mouse!!
	function onekoToggled (event) {

	};


	// Track mouse
	let mouse = { x: 0, y: 0 };
	document.addEventListener("mousemove", (e) => { mouse = { x: e.clientX, y: e.clientY }; });
</script>