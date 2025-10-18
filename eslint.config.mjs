// @ts-check
// docs for global config https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file-resolution

//  THIS FILE IS LINKED TO %USERPROFILE%\eslint.config.mjs

//	To hardlink your global eslint config to the current project, to be tracked with git too
//		1. Have a global eslint config, in your user profile
//		2. Run in Command Prompt, with your real path (NOT PowerShell):
// 	  	   mklink /h "C:\CURRENT_PROJECT_PATH_HERE\eslint.config.mjs" "%USERPROFILE%\eslint.config.mjs"
//
//	Note: /h makes it a hard link, pointing to the actual data on disk, instead of a symlink which is a link to the other file pointer
/*
job for claude:
i want my eslint config file to have autocomplete for key names in the config objects,
ideally full type support in the values too but if that's not possible, I can live with that

- this is a .mjs file so jsdoc typing only
- must autocomplete the rules for stylistic too,
*/




import stylistic from "@stylistic/eslint-plugin";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslint from "eslint";

// [https://eslint.style/rules#rules]
// [https://eslint.org/docs/latest/rules]

// | ---------------------------------------------------------------------------
// |  Javascript exclusive rules:
/** @type { eslint.Linter.RulesRecord } */ const JS_RULES = {
	"@stylistic/key-spacing": "error",
};


// | ---------------------------------------------------------------------------
// |  TypeScript exclusive rules:
/** @type { eslint.Linter.RulesRecord } */ const TS_RULES = {
	"@typescript-eslint/explicit-module-boundary-types" : "off",
	"@stylistic/type-annotation-spacing"                : ["error", { before: true, after: true, overrides: { arrow: { before: true, after: true } } }],
	"@stylistic/type-generic-spacing"                   : ["error"],
	"@stylistic/type-named-tuple-spacing"               : ["error"],
};


// | ---------------------------------------------------------------------------
// |  Rules that apply to JS and TS:
/** @type { eslint.Linter.RulesRecord } */ const GLOBAL_RULES = {
// Syntax and parsing correctness
	"no-cond-assign"                : "error",
	"no-constant-binary-expression" : "error",
	"no-constant-condition"         : "error",
	"no-control-regex"              : "off",
	"no-debugger"                   : "error",
	"no-dupe-args"                  : "error",
	"no-dupe-keys"                  : "error",
	"no-empty-character-class"      : "error",
	"no-ex-assign"                  : "error",
	"no-func-assign"                : "error",
	"no-import-assign"              : "error",
	"no-invalid-regexp"             : "error",
	"no-irregular-whitespace"       : "error",
	"no-loss-of-precision"          : "error",
	"no-misleading-character-class" : "error",
	"no-new-native-nonconstructor"  : "error",
	"no-obj-calls"                  : "error",
	"no-setter-return"              : "error",
	"no-this-before-super"          : "error",
	"no-unexpected-multiline"       : "error",
	"no-unsafe-finally"             : "error",
	"no-unsafe-negation"            : "error",
	"no-unsafe-optional-chaining"   : "error",
	"use-isnan"                     : "error",
	"valid-typeof"                  : "error",

	// Logic and control flow correctness
	"for-direction"                   : "error",
	"no-class-assign"                 : "error",
	"no-compare-neg-zero"             : "error",
	"no-const-assign"                 : "error",
	"no-dupe-class-members"           : "error",
	"no-dupe-else-if"                 : "error",
	"no-duplicate-case"               : "error",
	"no-empty-pattern"                : "error",
	"no-redeclare"                    : "error",
	"no-self-compare"                 : "error",
	"no-template-curly-in-string"     : "error",
	"no-unused-private-class-members" : "error",
	"no-fallthrough"                  : "error",

	// Code clarity and logic consistency
	"dot-notation"                 : "error",
	"eqeqeq"                       : "error",
	"no-extra-boolean-cast"        : "error",
	"no-implicit-coercion"         : ["error", { allow: ["+"] }],
	"no-regex-spaces"              : "error",
	"no-shadow-restricted-names"   : "error",
	"no-unneeded-ternary"          : "error",
	"no-useless-catch"             : "error",
	"no-with"                      : "error",
	"logical-assignment-operators" : "error",

	// Off or relaxed rules
	"no-unused-vars" : "off",
	"curly"          : "off",


};

/* rules not to add:
no-unused-vars  curly  no-control-regex @stylistic/no-extra-parens
*/


// | ---------------------------------------------------------------------------
// |  Configs
export default [
	{ // JavaScript eslint config:
		files           : ["**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
		languageOptions : { ecmaVersion: 2023, sourceType: "module" },
		plugins         : { "@stylistic": stylistic },
		rules           : { ...JS_RULES, ...GLOBAL_RULES },
	},
	{ // TypeScript eslint config:
		files           : ["**/*.ts", "**/*.tsx"],
		languageOptions : { ecmaVersion: 2023, sourceType: "module", parser: tsParser },
		plugins         : { "@stylistic": stylistic, "@typescript-eslint": tseslint },
		rules           : { ...TS_RULES, ...GLOBAL_RULES },
	},
];
