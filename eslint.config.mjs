// docs for global config https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file-resolution

//  THIS FILE IS LINKED TO %USERPROFILE%\eslint.config.mjs

//	To hardlink your global eslint config to the current project, to be tracked with git too
//		1. Have a global eslint config, in your user profile
//		2. Run in Command Prompt, with your real path (NOT PowerShell):
// 	  	   mklink /h "C:\CURRENT_PROJECT_PATH_HERE\eslint.config.mjs" "%USERPROFILE%\eslint.config.mjs"
//
//	Note: /h makes it a hard link, pointing to the actual data on disk, instead of a symlink which is a link to the other file pointer

import stylistic from "@stylistic/eslint-plugin";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const globalRules = {
	"for-direction": "error",
	"no-class-assign": "error",
	"no-compare-neg-zero": "error",
	"no-cond-assign": "error",
	"no-const-assign": "error",
	"no-constant-binary-expression": "error",
	"no-constant-condition": "error",
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
	// "arrow-body-style": ["error", ""],
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
	// "@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
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
	"no-control-regex": "off",
};

export default [
	// JavaScript exclusive rules
	{
		files: ["**/*.js", "**/*.jsx"],
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: "module",
		},
		plugins: {
			"@stylistic": stylistic,
		},
		rules: {
			"@stylistic/key-spacing": "error",
			...globalRules,
		},
	},
	// TypeScript exclusive rules
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 2021,
			sourceType: "module",
		},
		plugins: {
			"@typescript-eslint": tseslint,
			"@stylistic": stylistic,
		},
		rules: {
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@stylistic/type-annotation-spacing": ["error", { before: true, after: true, overrides: { arrow: { before: true, after: true } } }],
			"@stylistic/type-generic-spacing": ["error"],
			"@stylistic/type-named-tuple-spacing": ["error"],
			// "@typescript-eslint/adjacent-overload-signatures": ["error"],
			// "@typescript-eslint/array-type": ["error"],
			// "@typescript-eslint/await-thenable": ["error"],
			// "@typescript-eslint/ban-ts-comment": ["error"],
			// "@typescript-eslint/ban-tslint-comment": ["error"],
			// "@typescript-eslint/class-literal-property-style": ["error"],
			// "@typescript-eslint/class-methods-use-this": ["error"],
			// "@typescript-eslint/consistent-generic-constructors": ["error"],
			// "@typescript-eslint/consistent-indexed-object-style": ["error"],
			// "@typescript-eslint/consistent-return": ["error"],
			// "@typescript-eslint/consistent-type-assertions": ["error"],
			// "@typescript-eslint/consistent-type-definitions": ["error"],
			// "@typescript-eslint/consistent-type-exports": ["error"],
			// "@typescript-eslint/consistent-type-imports": ["error"],
			// "@typescript-eslint/default-param-last": ["error"],
			// "@typescript-eslint/dot-notation": ["error"],
			// "@typescript-eslint/explicit-function-return-type": ["error"],
			// "@typescript-eslint/explicit-member-accessibility": ["error"],
			// "@typescript-eslint/explicit-module-boundary-types": ["error"],
			// "@typescript-eslint/init-declarations": ["error"],
			// "@typescript-eslint/max-params": ["error"],
			// "@typescript-eslint/member-ordering": ["error"],
			// "@typescript-eslint/method-signature-style": ["error"],
			// "@typescript-eslint/naming-convention": ["error"],
			// "@typescript-eslint/no-array-constructor": ["error"],
			// "@typescript-eslint/no-array-delete": ["error"],
			// "@typescript-eslint/no-base-to-string": ["error"],
			// "@typescript-eslint/no-confusing-non-null-assertion": ["error"],
			// "@typescript-eslint/no-confusing-void-expression": ["error"],
			// "@typescript-eslint/no-deprecated": ["error"],
			// "@typescript-eslint/no-dupe-class-members": ["error"],
			// "@typescript-eslint/no-duplicate-enum-values": ["error"],
			// "@typescript-eslint/no-duplicate-type-constituents": ["error"],
			// "@typescript-eslint/no-dynamic-delete": ["error"],
			// "@typescript-eslint/no-empty-function": ["error"],
			// "@typescript-eslint/no-empty-object-type": ["error"],
			// "@typescript-eslint/no-explicit-any": ["error"],
			// "@typescript-eslint/no-extra-non-null-assertion": ["error"],
			// "@typescript-eslint/no-extraneous-class": ["error"],
			// "@typescript-eslint/no-floating-promises": ["error"],
			// "@typescript-eslint/no-for-in-array": ["error"],
			// "@typescript-eslint/no-implied-eval": ["error"],
			// "@typescript-eslint/no-import-type-side-effects": ["error"],
			// "@typescript-eslint/no-inferrable-types": ["error"],
			// "@typescript-eslint/no-invalid-this": ["error"],
			// "@typescript-eslint/no-invalid-void-type": ["error"],
			// "@typescript-eslint/no-loop-func": ["error"],
			// "@typescript-eslint/no-loss-of-precision": ["error"],
			// "@typescript-eslint/no-magic-numbers": ["error"],
			// "@typescript-eslint/no-meaningless-void-operator": ["error"],
			// "@typescript-eslint/no-misused-new": ["error"],
			// "@typescript-eslint/no-misused-promises": ["error"],
			// "@typescript-eslint/no-misused-spread": ["error"],
			// "@typescript-eslint/no-mixed-enums": ["error"],
			// "@typescript-eslint/no-namespace": ["error"],
			// "@typescript-eslint/no-non-null-asserted-nullish-coalescing": ["error"],
			// "@typescript-eslint/no-non-null-asserted-optional-chain": ["error"],
			// "@typescript-eslint/no-non-null-assertion": ["error"],
			// "@typescript-eslint/no-redeclare": ["error"],
			// "@typescript-eslint/no-redundant-type-constituents": ["error"],
			// "@typescript-eslint/no-require-imports": ["error"],
			// "@typescript-eslint/no-restricted-imports": ["error"],
			// "@typescript-eslint/no-restricted-types": ["error"],
			// "@typescript-eslint/no-shadow": ["error"],
			// "@typescript-eslint/no-this-alias": ["error"],
			// "@typescript-eslint/no-unnecessary-boolean-literal-compare": ["error"],
			// "@typescript-eslint/no-unnecessary-condition": ["error"],
			// "@typescript-eslint/no-unnecessary-parameter-property-assignment": ["error"],
			// "@typescript-eslint/no-unnecessary-qualifier": ["error"],
			// "@typescript-eslint/no-unnecessary-template-expression": ["error"],
			// "@typescript-eslint/no-unnecessary-type-arguments": ["error"],
			// "@typescript-eslint/no-unnecessary-type-assertion": ["error"],
			// "@typescript-eslint/no-unnecessary-type-constraint": ["error"],
			// "@typescript-eslint/no-unnecessary-type-conversion": ["error"],
			// "@typescript-eslint/no-unnecessary-type-parameters": ["error"],
			// "@typescript-eslint/no-unsafe-argument": ["error"],
			// "@typescript-eslint/no-unsafe-assignment": ["error"],
			// "@typescript-eslint/no-unsafe-call": ["error"],
			// "@typescript-eslint/no-unsafe-declaration-merging": ["error"],
			// "@typescript-eslint/no-unsafe-enum-comparison": ["error"],
			// "@typescript-eslint/no-unsafe-function-type": ["error"],
			// "@typescript-eslint/no-unsafe-member-access": ["error"],
			// "@typescript-eslint/no-unsafe-return": ["error"],
			// "@typescript-eslint/no-unsafe-type-assertion": ["error"],
			// "@typescript-eslint/no-unsafe-unary-minus": ["error"],
			// "@typescript-eslint/no-unused-expressions": ["error"],
			// "@typescript-eslint/no-unused-vars": ["error"],
			// "@typescript-eslint/no-use-before-define": ["error"],
			// "@typescript-eslint/no-useless-constructor": ["error"],
			// "@typescript-eslint/no-useless-empty-export": ["error"],
			// "@typescript-eslint/non-nullable-type-assertion-style": ["error"],
			// "@typescript-eslint/only-throw-error": ["error"],
			// "@typescript-eslint/parameter-properties": ["error"],
			// "@typescript-eslint/prefer-as-const": ["error"],
			// "@typescript-eslint/prefer-destructuring": ["error"],
			// "@typescript-eslint/prefer-enum-initializers": ["error"],
			// "@typescript-eslint/prefer-find": ["error"],
			// "@typescript-eslint/prefer-for-of": ["error"],
			...globalRules,
		},
	},
];

// export default [
// {
// "name": "mewoea eslint-config",
// "plugins": { "@stylistic": stylistic },
// "rules": {

// },
// },
// ];
