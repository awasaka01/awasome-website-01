function onlyText (node) {
  const clone = node.cloneNode(true);
  clone.querySelectorAll(".exclude").forEach((el) => el.remove());
  return clone.textContent;
}


// Make the font size in .autoResize elements as big as possible to touch edges of the container
async function setWidths (zoomLevel = 1.25) {
  zoomLevel = Math.max(zoomLevel, 1.25);

  const uh = document.getElementById("spacing").clientWidth;
  const singleCharacter = document.getElementById("baseline-character-for-size-ref").offsetWidth;

  Array.from(document.getElementsByClassName("autoResize")).forEach((el) => {
    const vw = uh * (zoomLevel - 0.25);

    // direct children only
const children = Array.from(el.querySelectorAll("p"));
    // longest line (excluding .exclude spans)
    const longestLine = children
      .map((x) => onlyText(x).length)
      .reduce((a, b) => Math.max(a, b), 0);

    // set font size
    el.style.setProperty("font-size", `${((vw / singleCharacter) / longestLine) * 100}px`);
  });
}


setWidths();
import("https://unpkg.com/zoom-level@2.5.0/dist/zoom-level.esm.js").then(({ zoomLevel }) => {
	setWidths(zoomLevel());
	window.addEventListener("resize", async () => setWidths(zoomLevel()));
});
// document.body.style.backgroundColor = "green";
