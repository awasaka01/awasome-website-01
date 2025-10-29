import * as mono from "../monolith.js";
import { fork } from "node:child_process";
import chalk from "chalk";

console.log("child1");
// mono.warn("Building...");


const childProcess = fork("./node_modules/@11ty/eleventy/cmd.cjs", ["--dryrun", "--config=./engine/11ty-config.js"], {
	stdio : ["inherit", "inherit", "inherit", "ipc"],
});


// childProcess.stdout.on("data", (data) => process.stdout.write(data));
// childProcess.stderr.on("data", (data) => process.stderr.write(data));



let eleventyError = false;



process.send({ bubble: true, type: "child_process", pid: childProcess.pid });
process.send({ bubble: true, type: "child_process", pid: process.pid });
childProcess.on("message", (msg) => { if (msg.bubble === true) process.send(msg); });

const hexToAnsi = (hex, bg = false) => {
	const rgb = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
	return `\x1b[${bg ? 48 : 38};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

childProcess.on("close", (code, signal) => { setImmediate(() => mono.log(`Build process exited with code ${code} and signal ${signal}`, "enid")); });
console.log(hexToAnsi("#ff99ff") + "hiiewewew");






