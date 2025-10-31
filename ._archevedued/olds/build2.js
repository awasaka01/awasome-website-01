import * as mono from "../monolith.js";
console.log("child2");
// mono.warn("Building...");


process.send({ bubble: true, type: "child_process", pid: process.pid });
