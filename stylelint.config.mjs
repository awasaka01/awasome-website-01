// @ts-check
import defineConfig from "stylelint-define-config"; // Adds intelliSense display and auto-completion to the rules


export default defineConfig({
	customSyntax: "postcss-scss",
	extends: [
		"stylelint-config-standard-scss",
		"@stylistic/stylelint-config",
		// "stylelint-config-clean-order",
		"stylelint-config-sass-guidelines",
	],
	rules: {

		// : stylelint-config-standard
		"declaration-block-single-line-max-declarations": null,
		"no-invalid-double-slash-comments": null,
		"declaration-empty-line-before": null,
		"color-function-alias-notation": null,
		"comment-empty-line-before": null,
		"no-descending-specificity": null,
		"at-rule-empty-line-before": null,
		"rule-empty-line-before": null,
		"selector-class-pattern": null,
		"keyframes-name-pattern": null,
		"selector-id-pattern": null,
		"function-name-case": null,

		// : stylelint-config-standard-scss
		"scss/double-slash-comment-empty-line-before": null,
		"scss/load-no-partial-leading-underscore": null,
		"scss/dollar-variable-empty-line-before": null,
		"scss/percent-placeholder-pattern": null,
		"scss/dollar-variable-pattern": null,
		"scss/operator-no-unspaced": null,
		"scss/at-function-pattern": null,
		"scss/at-mixin-pattern": null,
		"scss/comment-no-empty": null,

		// : @stylistic/stylelint-config
		"@stylistic/declaration-block-semicolon-newline-after": null,
		"@stylistic/block-closing-brace-newline-before": null,
		"@stylistic/selector-list-comma-newline-after": null,
		"@stylistic/block-closing-brace-newline-after": null,
		"@stylistic/at-rule-semicolon-newline-after": null,
		"@stylistic/declaration-colon-newline-after": null,
		"@stylistic/declaration-colon-space-after": null,
		"@stylistic/no-empty-first-line": null,
		"@stylistic/no-eol-whitespace": null,
		"@stylistic/max-empty-lines": null,
		"@stylistic/max-line-length": null,
		"@stylistic/indentation": "tab",
		"@stylistic/string-quotes": "double",
		"@stylistic/function-parentheses-newline-inside": null,
		"@stylistic/function-parentheses-space-inside": null,
		"font-family-name-quotes": null,

		// : styelint-config-sass-guidelines
		"selector-max-compound-selectors": null,
		"max-nesting-depth": null,
		"selector-max-id": null,
		"color-named": null,
		"at-rule-allowed-list": null,
		"color-hex-length": null,


		"no-empty-source": null,
		"hue-degree-notation": null,
		"at-rule-disallowed-list": null,
		"declaration-property-value-disallowed-list": null,

		"number-max-precision": null, // why is this even the default
		"shorthand-property-no-redundant-values": null, // (top: 0; left: 0; bottom: 0;	right: 0;) is not redundant
		"font-family-no-missing-generic-family-keyword": null, // [possibly untrue:] the fontface has the defaults anyway???
	},
});


// acutally idrn logical properties...
// "plugin/use-logical-properties-and-values": [true, {
// 	"severity": "error",
// }],
// "plugin/use-logical-units": [true, { "severity": "error" }],
// plugins: ["stylelint-plugin-logical-css"],
