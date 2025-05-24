
//  THIS FILE IS LINKED TO %USERPROFILE%\eslint.config.mjs

//	To hardlink your global eslint config to the current project, to be tracked with git too
//		1. Have a global eslint config, in your home directory
//		2. Run in Command Prompt NOT PowerShell:
// 	  	   mklink /h "C:\currentprojectpath\eslint.config.mjs" "%USERPROFILE%\eslint.config.mjs"
//	Note: /h makes it a hard link, pointing to the actual file on disk not a symlink which is a link to the other file pointer



import stylistic from "@stylistic/eslint-plugin";

export default [
{
"name": "mewoea eslint-config",
"plugins": { "@stylistic": stylistic },
"rules": {

	// Possible Problems
	"for-direction": "error",
	"no-class-assign": "error",
	"no-compare-neg-zero": "error",
	"no-cond-assign": "error",
	"no-const-assign": "error",
	"no-constant-binary-expression": "error",
	"no-constant-condition": "error",
	"no-control-regex": "error",
	"no-debugger": "error",
	"no-dupe-args": "error",
	"no-dupe-class-members": "error",
	"no-dupe-else-if": "error",
	"no-dupe-keys": "error",
	"no-duplicate-case": "error",
	"no-duplicate-imports": "error",
	"no-empty-character-class": "error",
	"no-empty-pattern": "error",
	"no-ex-assign": "error",
	"no-fallthrough": "error",
	"no-func-assign": "error",
	"no-import-assign": "error",
	"no-invalid-regexp": "error",
	"no-irregular-whitespace": "error",
	"no-loss-of-precision": "error",
	"no-misleading-character-class": "error",
	"no-new-native-nonconstructor": "error",
	"no-obj-calls": "error",
	"no-self-compare": "error",
	"no-setter-return": "error",
	"no-sparse-arrays": "error",
	"no-template-curly-in-string": "error",
	"no-this-before-super": "error",
	"no-unexpected-multiline": "error",
	"no-unsafe-finally": "error",
	"no-unsafe-negation": "error",
	"no-unsafe-optional-chaining": "error",
	"no-unused-private-class-members": "error",
	"use-isnan": "error",
	"valid-typeof": "error",

	// Suggestions
	"arrow-body-style": ["error", "as-needed"],
	"dot-notation": "error",
	"eqeqeq": "error",
	"logical-assignment-operators": "error",
	"no-extra-boolean-cast": "error",
	"no-implicit-coercion": "error",
	"no-redeclare": "error",
	"no-regex-spaces": "error",
	"no-shadow-restricted-names": "error",
	"no-unneeded-ternary": "error",
	"no-useless-catch": "error",
	"no-with": "error",

	// Spacing
	"@stylistic/array-bracket-newline": ["error", "consistent"],
	"@stylistic/array-bracket-spacing": ["error", "never"],
	"@stylistic/arrow-spacing": "error",
	"@stylistic/block-spacing": "error",
	"@stylistic/computed-property-spacing": "error",
	"@stylistic/function-call-spacing": "error",
	"@stylistic/generator-star-spacing": "error",
	"@stylistic/key-spacing": "error",
	"@stylistic/no-mixed-spaces-and-tabs": "error",
	"@stylistic/no-multi-spaces": "error",
	"@stylistic/no-trailing-spaces": "error",
	"@stylistic/no-whitespace-before-property": "error",
	"@stylistic/object-curly-spacing": ["error", "always"],
	"@stylistic/rest-spread-spacing": "error",
	"@stylistic/space-before-blocks": "error",
	"@stylistic/space-before-function-paren": "error",
	"@stylistic/space-in-parens": "error",
	"@stylistic/space-infix-ops": "error",
	"@stylistic/space-unary-ops": "error",
	"@stylistic/spaced-comment": "error",
	"@stylistic/template-curly-spacing": "error",

	// Line breaks
	"@stylistic/eol-last": "error",
	"@stylistic/operator-linebreak": ["error", "before"],

	// Brackets
	"@stylistic/arrow-parens": "error",
	"@stylistic/brace-style": ["error", "stroustrup", { "allowSingleLine": true }],
	"@stylistic/new-parens": "error",
	"@stylistic/no-extra-parens": "off",
	"@stylistic/wrap-iife": "error",

	// Quotes
	"@stylistic/quotes": ["error", "double"],
	"@stylistic/quote-props": ["error", "consistent"],

	// Commas
	"@stylistic/comma-dangle": ["error", "always-multiline"],
	"@stylistic/comma-spacing": "error",
	"@stylistic/comma-style": "error",

	// Semis
	"@stylistic/no-extra-semi": "error",
	"@stylistic/semi": "error",
	"@stylistic/semi-spacing": "error",
	"@stylistic/semi-style": "error",

	// Variables




	"no-unused-vars": "off",
	"curly": "off",
},
},
];
