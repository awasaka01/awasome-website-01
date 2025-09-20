const str = `
\x1b[38;2;84;81;86m[11ty]\x1b[38;2;102;96;108m Writing ./^~^ website/scripts/progressive_image_loading.js \x1b[38;2;84;81;86mfrom ./source/scripts/progressive_image_loading.ts\x1b[38;2;102;96;108m

\x1b[38;2;84;81;86m[11ty]\x1b[38;2;102;96;108m Writing ./^~^ website/react.js \x1b[38;2;84;81;86mfrom ./source/react.tsx\x1b[38;2;102;96;108m

\x1b[38;2;84;81;86m[11ty]\x1b[38;2;102;96;108m Writing ./^~^ website/index.html \x1b[38;2;84;81;86mfrom ./source/index.html (vto)\x1b[38;2;102;96;108m

\x1b[38;2;143;125;163m\x1b[38;2;84;81;86m[11ty]\x1b[38;2;102;96;108m\x1b[38;2;143;125;163m Copied \x1b[1m2\x1b[22m Wrote \x1b[1m10\x1b[22m files in \x1b[1m1.97\x1b[22m seconds (197.2ms each, v3.1.2)\x1b[38;2;102;96;108m
`;

console.log(showANSI(str));

/** Makes ANSI strings visible in the terminal */
function showANSI (string) { return string.replace(/\x1b(\[[0-9;]+m)/g, "$&\\x1b$1\x1b[0m"); }

