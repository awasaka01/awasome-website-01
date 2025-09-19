// scripts/testinghiddenchar.js
const str = `
\x1b[38;2;84;81;86m[11ty]\x1b[38;2;102;96;108m Writing ./^~^ website/scripts/progressive_image_loading.js \x1b[38;2;84;81;86mfrom ./source/scripts/progressive_image_loading.ts\x1b[38;2;102;96;108m

\x1b[38;2;84;81;86m[11ty]\x1b[38;2;102;96;108m Writing ./^~^ website/react.js \x1b[38;2;84;81;86mfrom ./source/react.tsx\x1b[38;2;102;96;108m

\x1b[38;2;84;81;86m[11ty]\x1b[38;2;102;96;108m Writing ./^~^ website/index.html \x1b[38;2;84;81;86mfrom ./source/index.html (vto)\x1b[38;2;102;96;108m

\x1b[38;2;143;125;163m\x1b[38;2;84;81;86m[11ty]\x1b[38;2;102;96;108m\x1b[38;2;143;125;163m Copied \x1b[1m2\x1b[22m Wrote \x1b[1m10\x1b[22m files in \x1b[1m1.97\x1b[22m seconds (197.2ms each, v3.1.2)\x1b[38;2;102;96;108m
`;

console.log(showANSI(str));


function showANSI (string) {
	return string.replace(/\x1b(\[[0-9;]+m)/g, "$&\\x1b$1\x1b[0m");
}

my issue: im intercepting the output of a command im running with spawn() via:
```
...
const eleventy_process = spawn(`eleventy ${eleventy_cli_args.join(" ")}`, { stdio: ["inherit", "pipe", "inherit"], shell: true, env: process.env });
eleventy_process.stdout.on("data", (chunk) => {
...
```
it's been working fine, i recieve every line of output and modify it as i wanted to,
but now ive tested eleventy with the --serve option and it's host message skips me for some reason
logs:
```
\x1b[38;2;143;125;163m\x1b[38;2;84;81;86m[11ty]\x1b[38;2;102;96;108m\x1b[38;2;143;125;163m Copied \x1b[1m2\x1b[22m Wrote \x1b[1m10\x1b[22m files in \x1b[1m1.66\x1b[22m seconds (166.2ms each, v3.1.2)\x1b[38;2;102;96;108m
\x1b[38;2;84;81;86m[11ty]\x1b[38;2;102;96;108m Watching…
[11ty] Server at http://localhost:8080/
```
see the final message I never recieve in any of the stdios (ive tested piping the others)
i know i havent included the full source code needed for you to deduce why this message in particaluar skips me, so please suggest which other files / parts of the code i should send you if needed?

another option would be to somehow intercept ALL messages to the terminal instead of just this process? i dont know how to do that either though :/

// 11ty source code below:

// snippet from eleventy-dev-server/server.js:
  #log(callback, options) {
    let fn = typeof callback === "function" ? callback : () => false;
    let message = fn(Object.assign({
      options: this.options,
      version: pkg.version,
    }, options));

    if(message && typeof this.logger?.info === "function") {
      this.logger.info(message);
    }
  }

  logStartMessage() {
    let hosts = this.getHosts();
    this.#log(this.options.messageOnStart, {
      hosts,
      localhostUrl: this.getServerUrl("localhost"),
      startupTime: Date.now() - this.start,
    });
  }

// snipet, same file
  // Logger (fancier one is injected by Eleventy)
  logger: {
    info: console.log,
    log: console.log,
    error: console.error,
  }
}

// cli.js
export const Logger = {
  info(...args) {
    console.log( "[11ty/eleventy-dev-server]", ...args );
  },

// consolelogger.js
import debugUtil from "debug";
import chalk from "../Adapters/Packages/chalk.js";

const debug = debugUtil("Eleventy:Logger");

/**
 * Logger implementation that logs to STDOUT.
 * @typedef {'error'|'log'|'warn'|'info'} LogType
 */
class ConsoleLogger {
	/** @type {boolean} */
	#isVerbose = true;
	/** @type {boolean} */
	#isChalkEnabled = true;
	/** @type {object|boolean|undefined} */
	#logger;

	constructor() {}

	isLoggingEnabled() {
		if (!this.isVerbose || process.env.DEBUG) {
			return true;
		}
		return this.#logger !== false;
	}

	get isVerbose() {
		return this.#isVerbose;
	}

	set isVerbose(verbose) {
		this.#isVerbose = !!verbose;
	}

	get isChalkEnabled() {
		return this.#isChalkEnabled;
	}

	set isChalkEnabled(enabled) {
		this.#isChalkEnabled = !!enabled;
	}

	overrideLogger(logger) {
		this.#logger = logger;
	}

	get logger() {
		return this.#logger || console;
	}

	/** @param {string} msg */
	log(msg) {
		this.message(msg);
	}

	/**
	 * @typedef LogOptions
	 * @property {string} message
	 * @property {string=} prefix
	 * @property {LogType=} type
	 * @property {string=} color
	 * @property {boolean=} force
	 * @param {LogOptions} options
	 */
	logWithOptions({ message, type, prefix, color, force }) {
		this.message(message, type, color, force, prefix);
	}

	/** @param {string} msg */
	forceLog(msg) {
		this.message(msg, undefined, undefined, true);
	}

	/** @param {string} msg */
	info(msg) {
		this.message(msg, "log", "blue");
	}

	/** @param {string} msg */
	warn(msg) {
		this.message(msg, "warn", "yellow");
	}

	/** @param {string} msg */
	error(msg) {
		this.message(msg, "error", "red");
	}

	/**
	 * Formats the message to log.
	 *
	 * @param {string} message - The raw message to log.
	 * @param {LogType} [type='log'] - The error level to log.
	 * @param {string|undefined} [chalkColor=undefined] - Color name or falsy to disable
	 * @param {boolean} [forceToConsole=false] - Enforce a log on console instead of specified target.
	 */
	message(
		message,
		type = "log",
		chalkColor = undefined,
		forceToConsole = false,
		prefix = "[11ty]",
	) {
		if (!forceToConsole && (!this.isVerbose || process.env.DEBUG)) {
			debug(message);
		} else if (this.#logger !== false) {
			message = `${chalk.gray(prefix)} ${message.split("\n").join(`\n${chalk.gray(prefix)} `)}`;

			if (chalkColor && this.isChalkEnabled) {
				this.logger[type](chalk[chalkColor](message));
			} else {
				this.logger[type](message);
			}
		}
	}
}

export default ConsoleLogger;