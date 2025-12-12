


here is my current file structure for my website, just the build steps, site is fine:
```
engine/
	monolith.js
	sunnymiku.js
	11ty-plugin-image.ts
	11ty-plugin-sass.ts
	11ty-postprocessors.ts
	11ty-preprocessors.ts
	build-esbuild.ts
	build.ts
	eleventy.ts
	logs-handler.ts
source/
	...site code
dist/
	...built site
__compiled/
	...compiled engine code
```

sunnymiku is the "bootstrap" for it all, i run it to start the build, then it compiles all of the typescript files in engine, and then runs build.ts via:
```
const buildProcess = fork("./__compiled/engine/build.js", [], {
	stdio: ["inherit", "inherit", "pipe", "ipc"],
	env: { ...process.env, ...env },
	detached: process.platform !== "win32", // detach only on Unix
});
```


build.ts then runs a function exported from build-esbuild, which compiles all typescript of the website source, (seperate to 11ty since 11ty can't ts), then spawns the eleventy command:
```
const command = env.USE_NPX === "true" ? "npx eleventy" : "eleventy";
const eleventy_process = spawn(`${command} ${eleventy_cli_args.join(" ")}`, {
	stdio: ["inherit", "pipe", "pipe"],
	env: { ...env, ...process.env, FORCE_COLOR: "1" },
	shell: true,
});
```
eleventy is a static site builder tool,
and eleventy uses __compiled/engine/eleventy.js as it's config file, it does not spawn any more children from here

logs-handler just intercepts the stdout of npx eleventy and formats it nicer, then console.logs it
monolith is a "config file" accessed by all files in engine it contains lots of stuff like a prettier consolelog, lists of paths, colors, etc

so here's my problems:
1. i need a convient way to share data between all 3 tiers of child processes, because i am making a warn function that collects all warnings and then logs them from within build.ts at the end of itself
	- no file writing, i don't like the idea of that
	- if possible i want all 3 tiers to use the same exact syntax for warnings/send any other data
	- i currently send messages from build.ts up to sunnymiku.js using process.send() but then i can't do that in eleventy.js, or maybe i could but it'd be weird chain sending and fail the criteria above? 
2. this may be fixed by the issue above, i want it to... feel cleaner? all files are kindof, children and it isn't super clear idk? suggest

NO CODE SPAM!!! i want concepts i want ideas, questions if needed...
clarifing:
MUST WORK ON UNIX AND WINDOWS, i run this on github actions and my pc
option 3 sounds okay maybe? but i want it to be clear to me how it works and ensure no hanging processes even during errors and crashes

so
code me a version of option 1 but more generic, not just for warnings, any data, bubble up to sunnymiku's context, and then handle it all at the same level so arrays and stuff stay

then explain option 3 more


no actually, i want everything typescript ive decieded, minimal js

