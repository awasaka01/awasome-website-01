import type Eleventy from "11ty.ts";

type Transform = {
	type : "pre",
	name : string,
	extensions : string[],
	compile : (content : string, data : Eleventy.EleventyScope) => string | Promise<string>,
} | {
	type : "post",
	name : string,
	extensions : string[],
	compile : (content : string) => string | Promise<string>
};



const transforms : Transform[] = [
	{
		type: "pre",
		name: "HTML Minifier",
		extensions: ["html"],
		compile: async (content, data) => {
			console.log(data);
			return content;
		},
	},

];




export default function () {
	return function EleventyPlguin (eleventyConfig : Eleventy.EleventyConfig) {

		const extensions = transforms.reduce((acc, t) => [...acc, ...t.extensions], [] as string[]);
		const pre = transforms.filter((t) => t.type === "pre");
		const post = transforms.filter((t) => t.type === "post");

		// eleventyConfig.addTransform("post", async function (content) { return content; });
		eleventyConfig.addPreprocessor("pre", extensions, function (data, content) {
			console.log(this, data, content);
			return content;
		});

	};
}
