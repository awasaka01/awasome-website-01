// @ts-check

// ✧ node modules
import { execSync, fork } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import treeKill from "tree-kill";
import chokidar from "chokidar";
import esbuild from "esbuild";
import { replace as esbuildPluginReplace } from "esbuild-plugin-replace";
import glob from "fast-glob";
import chalk from "chalk";

// ✧ my imports:
import * as mono from "../monolith.js";
const { paths, abs_paths, colors } = mono;
const { blue: b, pink: p, white: w } = colors;


export function BubbleMessage ({ type, message }) {

}

export const IsTopLevel = process.send === undefined;

export function HandleMessage (message) {

	if (message.type === "warning") {
		mono.warn(message.message);
	}

	return new BubbleMessage(message);
}
