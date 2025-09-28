import * as awa from "@util";
import chroma from "chroma-js";
/*
Things that need to be referenced by multiple files that reference eachother, to avoid circular dependencies!
*/
export const WIDTH = 100;
export const HEIGHT = 100;
export const config = {
    // Permanent options
    // User options, can change
    perfanal: false,
    i: 0,
};
export const CELL_COLORS = {
    NotMoving: "#f1f1f1",
    Wall: "#4b4559",
    Food: chroma.scale(["#66664a", "#76af4d"]),
    MoveRandomly: "#eb7171",
    Grow: "#1b620b",
    Boom: "#c24c3f",
    River: chroma.scale(["#6f8bd8", "#ababab"]),
};
// // Simple grid the size of the map, each cell a coordinate pair [x, y]
// export const coordinateGrid = awa.generate2DArray(WIDTH, HEIGHT, (x, y) => [x, y]);
// Track mouse position on canvas
let mouseTracky = { x: 0, y: 0 };
let canvas = { width: 0, height: 0, clientWidth: 0, clientHeight: 0 };
document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("layers").firstChild;
    canvas = el;
    mouseTracky = awa.trackMouse(el);
});
export const mouse = {
    get x() { return Math.round(mouseTracky.x * (canvas.width / canvas.clientWidth)); },
    get y() { return Math.round(mouseTracky.y * (canvas.height / canvas.clientHeight)); },
};
// Function to convert hex colors to a 32-bit rgba value
export function clr(hex, alpha) {
    if (alpha < 0 || alpha > 255)
        throw new Error("Alpha must be between 0 and 255");
    if (hex[0] === "#")
        hex = hex.slice(1);
    if (hex.length === 3)
        hex = hex.split("").map((c) => c + c).join("");
    if (hex.length !== 6)
        throw new Error(`Invalid hex color: ${hex}`);
    return (parseInt(hex.slice(0, 2), 16)
        | parseInt(hex.slice(2, 4), 16) << 8
        | parseInt(hex.slice(4, 6), 16) << 16
        | (alpha !== undefined ? alpha : 255) << 24);
}
export const coordinateGrid = awa.generate2DArray(WIDTH, HEIGHT, (x, y) => [x, y]);
export const symbols = {
    // Errors
    OutOfBounds: Symbol("Out of bounds error"),
    NotEmpty: Symbol("Not empty error"),
    // Codes
    success: Symbol("Success"),
};
export const indexToXY = (index) => [index % WIDTH, Math.floor(index / WIDTH)];
