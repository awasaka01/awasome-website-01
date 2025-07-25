import jsdom from "jsdom"; // Virtual DOM, for easier preprocessing
import chalk from "chalk";
import { get } from "http";

export default function (eleventyConfig) {
	// Add {{ nocache }} to the end of a url to only use the latest build files, probably irrelevant as Vite renames the files anyway
	eleventyConfig.addGlobalData("nocache", `?nocache=${Date.now().toString(36)}`);

	//
	// eleventyConfig.addPreprocessor("fillRemainingSpace", "html", (data, content) => {
	// 	// console.log(data, content);

	// 	if (!data.addFeatures?.includes("fillRemainingSpace")) return;

	// 	const body = content.match(/<body.+>.+<\/body>/gms);
	// 	const dom = new jsdom.JSDOM(body);
	// 	const document = dom.window.document;
	// 	const elements = Array.from(document.getElementsByClassName("fillRemainingSpace"));

	// 	if (elements.length === 0) return;

	// 	const regex = new RegExp("\\?f(.+?)\\/f", "g");
	// 	const filterCodesOut = (str) => str.replace(regex, "").replace(/[0-9]([┏━┓─┃┗┛ ]+)/g, "$1");
	// 	elements.forEach((el) => {
	// 		// Calculate longest line
	// 		const children = Array.from(el.children);
	// 		const longest = children.map((x) => filterCodesOut(x.textContent).length).reduce((a, b) => (a > b ? a : b));

	// 		// Loop over each line and grow to match longest
	// 		children.forEach((child) => {
	// 			const length = filterCodesOut(child.textContent).length;
	// 			const diff = Math.abs(length - longest);

	// 			//
	// 			const fillsCountTotal = child.innerHTML.match(regex)?.length;
	// 			if (!fillsCountTotal) return;
	// 			// console.log(child.innerHTML, fillsCountTotal);

	// 			let i = 0;
	// 			child.innerHTML = child.innerHTML.replace(regex, (match, group1) => {
	// 				const fn = i === 0 ? Math.floor : i === fillsCountTotal - 1 ? Math.ceil : Math.round;

	// 				const fillString = Array.from({ length: fn(diff / fillsCountTotal) }, () => group1).join("");

	// 				i += 1;
	// 				return fillString;
	// 			});

	// 			// const fills = child.innerHTML.replace(/\?f(.+?)\/f/g, (match, group1) => {

	// 			// 	return group1;
	// 			// });
	// 			// 	// .filter((x) => x.startsWith("fill:"))
	// 			// 	// .map((x) => (x.split(":")[1].split("")));
	// 			// 	console.log(fills);

	// 			// console.log(lines);
	// 			// child.innerHTML = lines.join("\n");
	// 			// // // Repeat each fill evenly
	// 			// fills.forEach((fill, i) => {
	// 			// const fn = i === 0 ? Math.floor : i === fills.length - 1 ? Math.ceil : Math.round;
	// 			// const fillString = Array.from({ length: fn(diff / (fills.length)) }, (v, i) => fill[i % fill.length]);
	// 			// child.innerHTML = child.innerHTML.replace(`?%?fill:${fill.join("")}?%?`, fillString);
	// 		});
	// 	});
	// 	return content.replace(/<body.+>.+<\/body>/gms, document.body.outerHTML);
	// });



	const seperators = {
		block: "<!-- ?f NEW BLOCK /f -->",
		start: "?f", end: "/f",
	};

	eleventyConfig.addPreprocessor("fillRemainingSpace", "html", (data, content) => {

		const getOnlyText = (str) => {

			return str
				.replace(new RegExp(`<(?!${RegExp.escape(seperators.block.slice(1, -1))})[^>]*?>`, "g"), "")
				.replace(/\?f(.+?)\/f/g, "")
				.replace(/[0-9]([┏━┓─┃┗┛ ]+)/g, "$1");
		};
		let blocks = content.split(seperators.block);
		blocks = blocks.map((block, i) => {


			// Get all lines that have fillcodes on them
			let linesWithFillCodes = block.split("\n").filter((l) => l.includes(seperators.start) && l.includes(seperators.end));
			if (linesWithFillCodes.length === 0) return block;

			// Calculate lenghts of all lines with fillcodes
			const lineLengths = {}; linesWithFillCodes.forEach((line) => { lineLengths[line] = getOnlyText(line).trim().length; });
			const longestLength = Object.values(lineLengths).reduce((a, b) => a > b ? a : b, 0);


			const fillcodeIdentifierRegex = new RegExp(`${RegExp.escape(seperators.start)}(.+?)${RegExp.escape(seperators.end)}`, "g");

			const lines = block.split("\n").map((line) => {

				if (!(line.includes(seperators.start) && line.includes(seperators.end))) return line;

				const diffBetweenLongestAndThis = Math.abs(longestLength - lineLengths[line]);
				const fillcodeCount = line.match(fillcodeIdentifierRegex).length;
				let remainingSpace = diffBetweenLongestAndThis;

				// Loop through each fillcode
				let i = 0;
				line = line.replace(fillcodeIdentifierRegex, (match, textToRepeat) => {
					const lengthPerFill = diffBetweenLongestAndThis / fillcodeCount;

					// If whole number, no need to round, just repeat
					if (lengthPerFill % 1 === 0) return `${textToRepeat.repeat(lengthPerFill)}`;


					// uhhh ???? it works so
					i += 1;
					const roundingFunction = i === 1 ? Math.floor : i === fillcodeCount ? Math.ceil : Math.round;
					const a = roundingFunction(lengthPerFill);
					const b = Math.max(Math.min(remainingSpace, a), 0);
					remainingSpace -= a;
					// console.log(lineLengths[line], lengthPerFill, a, longestLength, remainingSpace, diffBetweenLongestAndThis, roundingFunction);
					return `${textToRepeat.repeat(b)}`;
				});
				return line;
			});
			return lines.join("\n");
		});
		return blocks.join(seperators.block);
	});


	eleventyConfig.addPreprocessor("uwuwuwu", "html", (data, content) => {
		if (!data.replaceCharacters) return;
		data.replaceCharacters.regexes.forEach(([regex, flags, replacement]) => {
			content = content.replace(new RegExp(regex, flags), replacement);
		});
		return content;
	});
}

    // if (!data.addFeatures?.includes("fillRemainingSpace")) return;

    // // Find all .fillRemainingSpace sections (assuming they're <section> or <div>)
    // return content.replace(
    //   /<section class="fillRemainingSpace">([\s\S]*?)<\/section>/g,
    //   (sectionMatch, innerHTML) => {
    //     // Find all lines (children, e.g. <p>...</p>)
    //     const lines = Array.from(innerHTML.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)).map((m) => m[1]);
    //     if (!lines.length) return sectionMatch;

    //     // Remove codes and get lengths
    //     const filterCodesOut = (str) =>
    //       str.replace(/\?f(.+?)\/f/g, "").replace(/[0-9]([┏━┓─┃┗┛ ]+)/g, "$1");
    //     const lengths = lines.map(filterCodesOut);
    //     const longest = Math.max(...lengths.map((l) => l.length));

    //     // Replace each line with filled version
    //     const filledLines = lines.map((line, idx) => {
    //       const length = lengths[idx].length;
    //       const diff = Math.abs(length - longest);
    //       let i = 0;
    //       // Replace each ?f.../f with the correct number of fill chars
    //       return line.replace(/\?f(.+?)\/f/g, (match, group1, offset, str) => {
    //         // Count total fills in this line
    //         const fillsCountTotal = (line.match(/\?f(.+?)\/f/g) || []).length;
    //         const fn = i === 0 ? Math.floor : i === fillsCountTotal - 1 ? Math.ceil : Math.round;
    //         const fillString = Array.from({ length: fn(diff / fillsCountTotal) }, () => group1).join("");
    //         i += 1;
    //         return fillString;
    //       });
    //     });

    //     // Rebuild section
    //     let rebuilt = innerHTML;
    //     lines.forEach((old, idx) => {
    //       rebuilt = rebuilt.replace(old, filledLines[idx]);
    //     });
    //     return `<section class="fillRemainingSpace">${rebuilt}</section>`;
    //   },
    // );
