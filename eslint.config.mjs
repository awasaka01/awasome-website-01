// @ts-check
/*
	wawa  ESLINT CONFIG  wawa


	This file is (probably) hardlinked to %USERPROFILE%\eslint.config.mjs
	This is just so I can have a global eslint config, and it's still tracked on my github repos it's used on

	To hardlink:
		1. Have a global eslint config file in your user folder [docs for this: https://eslint.org/docs/latest/use/configure/configuration-files#configuration-file-resolution]
		2. Run in powershell:
 	  	   New-Item -Path (Join-Path -Path (Get-Location) -ChildPath "eslint.config.mjs") -ItemType HardLink -Target "$env:USERPROFILE\eslint.config.mjs"
	To check:
		1. Run in powershell:
		   (Get-Item ./eslint.config.mjs).LinkType
		2. Should be 'HardLink', or nothing if not linked

	Note: A hard link is different from a symlink, pointing to the actual data on disk, a symlink is a link to the other file pointer. This allows git to see the content


	🔗 [https://eslint.org/docs/latest/rules]
	🔗   [https://eslint.style/rules#rules]


	Last Edited: 2025/10/18
	Eslint Version: 9.38.9
	Stylistic Version: 5.5.0
*/

import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import stylistic from "@stylistic/eslint-plugin";
import eslint from "eslint";


// | ---------------------------------------------------------------------------
// |  JavaScript exclusive rule overrides:
/** @type { eslint.Linter.RulesRecord } */ const JS_RULES = {
	// not in ts because breaks with ?: optional property
	"@stylistic/key-spacing" : ["error", {
		"singleLine" : { "beforeColon": false, "afterColon": true },
		"multiLine"  : { "beforeColon": true, "afterColon": true, "align": "colon" },
	}], // 💼 🔧 Enforce consistent spacing between property names and type annotations in types and interfaces
};


// | ---------------------------------------------------------------------------
// |  TypeScript exclusive rule overrides:
/** @type { eslint.Linter.RulesRecord } */ const TS_RULES = {
	"@stylistic/key-spacing" : 0,
};


// | ---------------------------------------------------------------------------
// |  Rules that apply to both JS and TS:
/** @type { eslint.Linter.RulesRecord } */ const GLOBAL_RULES = {



	/* -- ESLINT RULES -- */


	// Possible Problems [https://eslint.org/docs/latest/rules/#possible-problems]
	"array-callback-return"           : 0, // Enforce return statements in callbacks of array methods
	"constructor-super"               : 0, // Require super() calls in constructors
	"for-direction"                   : "error", // Enforce for loop update clause moving the counter in the right direction
	"getter-return"                   : 0, // Enforce return statements in getters
	"no-async-promise-executor"       : 0, // Disallow using an async function as a Promise executor
	"no-await-in-loop"                : 0, // Disallow await inside of loops
	"no-class-assign"                 : "error", // Disallow reassigning class members
	"no-compare-neg-zero"             : "error", // Disallow comparing against -0
	"no-cond-assign"                  : "error", // Disallow assignment operators in conditional expressions
	"no-const-assign"                 : "error", // Disallow reassigning const, using, and await using variables
	"no-constant-binary-expression"   : "error", // Disallow expressions where the operation doesn't affect the value
	"no-constant-condition"           : "error", // Disallow constant expressions in conditions
	"no-constructor-return"           : 0, // Disallow returning value from constructor
	"no-control-regex"                : 0, // Disallow control characters in regular expressions
	"no-debugger"                     : "error", // Disallow the use of debugger
	"no-dupe-args"                    : "error", // Disallow duplicate arguments in function definitions
	"no-dupe-class-members"           : "error", // Disallow duplicate class members
	"no-dupe-else-if"                 : "error", // Disallow duplicate conditions in if-else-if chains
	"no-dupe-keys"                    : "error", // Disallow duplicate keys in object literals
	"no-duplicate-case"               : "error", // Disallow duplicate case labels
	"no-duplicate-imports"            : 0, // Disallow duplicate module imports
	"no-empty-character-class"        : "error", // Disallow empty character classes in regular expressions
	"no-empty-pattern"                : "error", // Disallow empty destructuring patterns
	"no-ex-assign"                    : "error", // Disallow reassigning exceptions in catch clauses
	"no-fallthrough"                  : "error", // Disallow fallthrough of case statements
	"no-func-assign"                  : "error", // Disallow reassigning function declarations
	"no-import-assign"                : "error", // Disallow assigning to imported bindings
	"no-inner-declarations"           : 0, // Disallow variable or function declarations in nested blocks
	"no-invalid-regexp"               : "error", // Disallow invalid regular expression strings in RegExp constructors
	"no-irregular-whitespace"         : "error", // Disallow irregular whitespace
	"no-loss-of-precision"            : "error", // Disallow literal numbers that lose precision
	"no-misleading-character-class"   : "error", // Disallow characters which are made with multiple code points in character class syntax
	"no-new-native-nonconstructor"    : "error", // Disallow new operators with global non-constructor functions
	"no-obj-calls"                    : "error", // Disallow calling global object properties as functions
	"no-promise-executor-return"      : 0, // Disallow returning values from Promise executor functions
	"no-prototype-builtins"           : 0, // Disallow calling some Object.prototype methods directly on objects
	"no-self-assign"                  : 0, // Disallow assignments where both sides are exactly the same
	"no-self-compare"                 : "error", // Disallow comparisons where both sides are exactly the same
	"no-setter-return"                : "error", // Disallow returning values from setters
	"no-sparse-arrays"                : 0, // Disallow sparse arrays
	"no-template-curly-in-string"     : "error", // Disallow template literal placeholder syntax in regular strings
	"no-this-before-super"            : "error", // Disallow this/super before calling super() in constructors
	"no-unassigned-vars"              : 0, // Disallow let or var variables that are read but never assigned
	"no-undef"                        : 0, // Disallow the use of undeclared variables unless mentioned in /*global */ comments
	"no-unexpected-multiline"         : "error", // Disallow confusing multiline expressions
	"no-unmodified-loop-condition"    : 0, // Disallow unmodified loop conditions
	"no-unreachable"                  : 0, // Disallow unreachable code after return, throw, continue, and break statements
	"no-unreachable-loop"             : 0, // Disallow loops with a body that allows only one iteration
	"no-unsafe-finally"               : "error", // Disallow control flow statements in finally blocks
	"no-unsafe-negation"              : "error", // Disallow negating the left operand of relational operators
	"no-unsafe-optional-chaining"     : "error", // Disallow use of optional chaining in contexts where the undefined value is not allowed
	"no-unused-private-class-members" : "error", // Disallow unused private class members
	"no-unused-vars"                  : 0, // Disallow unused variables
	"no-use-before-define"            : 0, // Disallow the use of variables before they are defined
	"no-useless-assignment"           : 0, // Disallow variable assignments when the value is not used
	"no-useless-backreference"        : 0, // Disallow useless backreferences in regular expressions
	"require-atomic-updates"          : 0, // Disallow assignments that can lead to race conditions due to usage of await or yield
	"use-isnan"                       : "error", // Require calls to isNaN() when checking for NaN
	"valid-typeof"                    : "error", // Enforce comparing typeof expressions against valid strings


	// Suggestions [https://eslint.org/docs/latest/rules/#suggestions]
	"accessor-pairs"                 : 0, // Enforce getter and setter pairs in objects and classes
	"arrow-body-style"               : 0, // Require braces around arrow function bodies
	"block-scoped-var"               : 0, // Enforce the use of variables within the scope they are defined
	"camelcase"                      : 0, // Enforce camelcase naming convention
	"capitalized-comments"           : 0, // Enforce or disallow capitalization of the first letter of a comment
	"class-methods-use-this"         : 0, // Enforce that class methods utilize this
	"complexity"                     : 0, // Enforce a maximum cyclomatic complexity allowed in a program
	"consistent-return"              : 0, // Require return statements to either always or never specify values
	"consistent-this"                : 0, // Enforce consistent naming when capturing the current execution context
	"curly"                          : 0, // Enforce consistent brace style for all control statements
	"default-case"                   : 0, // Require default cases in switch statements
	"default-case-last"              : 0, // Enforce default clauses in switch statements to be last
	"default-param-last"             : 0, // Enforce default parameters to be last
	"dot-notation"                   : "error", // Enforce dot notation whenever possible
	"eqeqeq"                         : "error", // Require the use of === and !==
	"func-name-matching"             : 0, // Require function names to match the name of the variable or property to which they are assigned
	"func-names"                     : 0, // Require or disallow named function expressions
	"func-style"                     : 0, // Enforce the consistent use of either function declarations or expressions assigned to variables
	"grouped-accessor-pairs"         : 0, // Require grouped accessor pairs in object literals and classes
	"guard-for-in"                   : 0, // Require for-in loops to include an if statement
	"id-denylist"                    : 0, // Disallow specified identifiers
	"id-length"                      : 0, // Enforce minimum and maximum identifier lengths
	"id-match"                       : 0, // Require identifiers to match a specified regular expression
	"init-declarations"              : 0, // Require or disallow initialization in variable declarations
	"logical-assignment-operators"   : "error", // Require or disallow logical assignment operator shorthand
	"max-classes-per-file"           : 0, // Enforce a maximum number of classes per file
	"max-depth"                      : 0, // Enforce a maximum depth that blocks can be nested
	"max-lines"                      : 0, // Enforce a maximum number of lines per file
	"max-lines-per-function"         : 0, // Enforce a maximum number of lines of code in a function
	"max-nested-callbacks"           : 0, // Enforce a maximum depth that callbacks can be nested
	"max-params"                     : 0, // Enforce a maximum number of parameters in function definitions
	"max-statements"                 : 0, // Enforce a maximum number of statements allowed in function blocks
	"new-cap"                        : 0, // Require constructor names to begin with a capital letter
	"no-alert"                       : 0, // Disallow the use of alert, confirm, and prompt
	"no-array-constructor"           : 0, // Disallow Array constructors
	"no-bitwise"                     : 0, // Disallow bitwise operators
	"no-caller"                      : 0, // Disallow the use of arguments.caller or arguments.callee
	"no-case-declarations"           : 0, // Disallow lexical declarations in case clauses
	"no-console"                     : 0, // Disallow the use of console
	"no-continue"                    : 0, // Disallow continue statements
	"no-delete-var"                  : 0, // Disallow deleting variables
	"no-div-regex"                   : 0, // Disallow equal signs explicitly at the beginning of regular expressions
	"no-else-return"                 : 0, // Disallow else blocks after return statements in if statements
	"no-empty"                       : 0, // Disallow empty block statements
	"no-empty-function"              : 0, // Disallow empty functions
	"no-empty-static-block"          : 0, // Disallow empty static blocks
	"no-eq-null"                     : 0, // Disallow null comparisons without type-checking operators
	"no-eval"                        : 0, // Disallow the use of eval()
	"no-extend-native"               : 0, // Disallow extending native types
	"no-extra-bind"                  : 0, // Disallow unnecessary calls to .bind()
	"no-extra-boolean-cast"          : "error", // Disallow unnecessary boolean casts
	"no-extra-label"                 : 0, // Disallow unnecessary labels
	"no-global-assign"               : 0, // Disallow assignments to native objects or read-only global variables
	"no-implicit-coercion"           : ["error", { allow: ["+"] }], // Disallow shorthand type conversions
	"no-implicit-globals"            : 0, // Disallow declarations in the global scope
	"no-implied-eval"                : 0, // Disallow the use of eval()-like methods
	"no-inline-comments"             : 0, // Disallow inline comments after code
	"no-invalid-this"                : 0, // Disallow use of this in contexts where the value of this is undefined
	"no-iterator"                    : 0, // Disallow the use of the __iterator__ property
	"no-label-var"                   : 0, // Disallow labels that share a name with a variable
	"no-labels"                      : 0, // Disallow labeled statements
	"no-lone-blocks"                 : 0, // Disallow unnecessary nested blocks
	"no-lonely-if"                   : 0, // Disallow if statements as the only statement in else blocks
	"no-loop-func"                   : 0, // Disallow function declarations that contain unsafe references inside loop statements
	"no-magic-numbers"               : 0, // Disallow magic numbers
	"no-multi-assign"                : 0, // Disallow use of chained assignment expressions
	"no-multi-str"                   : 0, // Disallow multiline strings
	"no-negated-condition"           : 0, // Disallow negated conditions
	"no-nested-ternary"              : 0, // Disallow nested ternary expressions
	"no-new"                         : 0, // Disallow new operators outside of assignments or comparisons
	"no-new-func"                    : 0, // Disallow new operators with the Function object
	"no-new-wrappers"                : 0, // Disallow new operators with the String, Number, and Boolean objects
	"no-nonoctal-decimal-escape"     : 0, // Disallow \8 and \9 escape sequences in string literals
	"no-object-constructor"          : 0, // Disallow calls to the Object constructor without an argument
	"no-octal"                       : 0, // Disallow octal literals
	"no-octal-escape"                : 0, // Disallow octal escape sequences in string literals
	"no-param-reassign"              : 0, // Disallow reassigning function parameters
	"no-plusplus"                    : 0, // Disallow the unary operators ++ and --
	"no-proto"                       : 0, // Disallow the use of the __proto__ property
	"no-redeclare"                   : "error", // Disallow variable redeclaration
	"no-regex-spaces"                : "error", // Disallow multiple spaces in regular expressions
	"no-restricted-exports"          : 0, // Disallow specified names in exports
	"no-restricted-globals"          : 0, // Disallow specified global variables
	"no-restricted-imports"          : 0, // Disallow specified modules when loaded by import
	"no-restricted-properties"       : 0, // Disallow certain properties on certain objects
	"no-restricted-syntax"           : 0, // Disallow specified syntax
	"no-return-assign"               : 0, // Disallow assignment operators in return statements
	"no-script-url"                  : 0, // Disallow javascript: URLs
	"no-sequences"                   : 0, // Disallow comma operators
	"no-shadow"                      : 0, // Disallow variable declarations from shadowing variables declared in the outer scope
	"no-shadow-restricted-names"     : "error", // Disallow identifiers from shadowing restricted names
	"no-ternary"                     : 0, // Disallow ternary operators
	"no-throw-literal"               : 0, // Disallow throwing literals as exceptions
	"no-undef-init"                  : 0, // Disallow initializing variables to undefined
	"no-undefined"                   : 0, // Disallow the use of undefined as an identifier
	"no-underscore-dangle"           : 0, // Disallow dangling underscores in identifiers
	"no-unneeded-ternary"            : "error", // Disallow ternary operators when simpler alternatives exist
	"no-unused-expressions"          : 0, // Disallow unused expressions
	"no-unused-labels"               : 0, // Disallow unused labels
	"no-useless-call"                : 0, // Disallow unnecessary calls to .call() and .apply()
	"no-useless-catch"               : "error", // Disallow unnecessary catch clauses
	"no-useless-computed-key"        : 0, // Disallow unnecessary computed property keys in objects and classes
	"no-useless-concat"              : 0, // Disallow unnecessary concatenation of literals or template literals
	"no-useless-constructor"         : 0, // Disallow unnecessary constructors
	"no-useless-escape"              : 0, // Disallow unnecessary escape characters
	"no-useless-rename"              : 0, // Disallow renaming import, export, and destructured assignments to the same name
	"no-useless-return"              : 0, // Disallow redundant return statements
	"no-var"                         : 0, // Require let or const instead of var
	"no-void"                        : 0, // Disallow void operators
	"no-warning-comments"            : 0, // Disallow specified warning terms in comments
	"no-with"                        : "error", // Disallow with statements
	"object-shorthand"               : 0, // Require or disallow method and property shorthand syntax for object literals
	"one-var"                        : 0, // Enforce variables to be declared either together or separately in functions
	"operator-assignment"            : 0, // Require or disallow assignment operator shorthand where possible
	"prefer-arrow-callback"          : 0, // Require using arrow functions for callbacks
	"prefer-const"                   : 0, // Require const declarations for variables that are never reassigned after declared
	"prefer-destructuring"           : 0, // Require destructuring from arrays and/or objects
	"prefer-exponentiation-operator" : 0, // Disallow the use of Math.pow in favor of the ** operator
	"prefer-named-capture-group"     : 0, // Enforce using named capture group in regular expression
	"prefer-numeric-literals"        : 0, // Disallow parseInt() and Number.parseInt() in favor of binary, octal, and hexadecimal literals
	"prefer-object-has-own"          : 0, // Disallow use of Object.prototype.hasOwnProperty.call() and prefer use of Object.hasOwn()
	"prefer-object-spread"           : 0, // Disallow using Object.assign with an object literal as the first argument and prefer the use of object spread instead
	"prefer-promise-reject-errors"   : 0, // Require using Error objects as Promise rejection reasons
	"prefer-regex-literals"          : 0, // Disallow use of the RegExp constructor in favor of regular expression literals
	"prefer-rest-params"             : 0, // Require rest parameters instead of arguments
	"prefer-spread"                  : 0, // Require spread operators instead of .apply()
	"prefer-template"                : 0, // Require template literals instead of string concatenation
	"preserve-caught-error"          : 0, // Disallow losing originally caught error when re-throwing custom errors
	"radix"                          : 0, // Enforce the consistent use of the radix argument when using parseInt()
	"require-await"                  : 0, // Disallow async functions which have no await expression
	"require-unicode-regexp"         : 0, // Enforce the use of u or v flag on regular expressions
	"require-yield"                  : 0, // Require generator functions to contain yield
	"sort-imports"                   : 0, // Enforce sorted import declarations within modules
	"sort-keys"                      : 0, // Require object keys to be sorted
	"sort-vars"                      : 0, // Require variables within the same declaration block to be sorted
	"strict"                         : 0, // Require or disallow strict mode directives
	"symbol-description"             : 0, // Require symbol descriptions
	"vars-on-top"                    : 0, // Require var declarations be placed at the top of their containing scope
	"yoda"                           : 0, // Require or disallow "Yoda" conditions


	// Layout & Formatting [https://eslint.org/docs/latest/rules/#layout-formatting]
	"unicode-bom" : 0, // Require or disallow Unicode byte order mark (BOM)








	/* -- STYLISTIC RULES -- (96) */
	// some categories have less rules than the number says, this is because rules overlap between categories, the most specific category is used


	// (35) Spacing [https://eslint.style/rules?filter=spacing]
	"@stylistic/array-bracket-spacing"     : ["error", "never"], // 💼 🔧 Enforce consistent spacing inside array brackets
	"@stylistic/arrow-spacing"             : "error", // 💼 🔧 Enforce consistent spacing before and after the arrow in arrow functions
	"@stylistic/block-spacing"             : "error", // 💼 🔧 Disallow or enforce spaces inside of blocks after opening block and before closing block
	"@stylistic/comma-spacing"             : "error", // 💼 🔧 Enforce consistent spacing before and after commas
	"@stylistic/computed-property-spacing" : "error", // 💼 🔧 Enforce consistent spacing inside computed property brackets
	"@stylistic/function-call-spacing"     : "error", // 🔧 Require or disallow spacing between function identifiers and their invocations
	"@stylistic/generator-star-spacing"    : "error", // 💼 🔧 Enforce consistent spacing around `*` operators in generator functions

	"@stylistic/key-spacing" : ["error", {
		"singleLine" : { "beforeColon": false, "afterColon": true },
	}], // 💼 🔧 Enforce consistent spacing between property names and type annotations in types and interfaces
	"@stylistic/keyword-spacing"          : 0, // 💼 🔧 Enforce consistent spacing before and after keywords
	"@stylistic/no-mixed-spaces-and-tabs" : "error", // 💼 Disallow mixed spaces and tabs for indentation
	"@stylistic/no-multi-spaces"          : ["error", { "ignoreEOLComments" : true, "exceptions"        : {
		"Property"           : true,
		"PropertyDefinition" : true,
	} }],
	"@stylistic/no-trailing-spaces"            : ["error", { "ignoreComments": true }], // 💼 🔧 Disallow trailing whitespace at the end of lines
	"@stylistic/no-whitespace-before-property" : "error", // 💼 🔧 Disallow whitespace before properties
	"@stylistic/object-curly-spacing"          : ["error", "always"], // 💼 🔧 Enforce consistent spacing inside braces
	"@stylistic/rest-spread-spacing"           : "error", // 💼 🔧 Enforce spacing between rest and spread operators and their expressions
	"@stylistic/semi-spacing"                  : 0, // 💼 🔧 Enforce consistent spacing before and after semicolons
	"@stylistic/space-before-blocks"           : "error", // 💼 🔧 Enforce consistent spacing before blocks
	"@stylistic/space-before-function-paren"   : "error", // 💼 🔧 Enforce consistent spacing before function parenthesis
	"@stylistic/space-in-parens"               : "error", // 💼 🔧 Enforce consistent spacing inside parentheses
	"@stylistic/space-infix-ops"               : "error", // 💼 🔧 Require spacing around infix operators
	"@stylistic/space-unary-ops"               : "error", // 💼 🔧 Enforce consistent spacing before or after unary operators
	"@stylistic/switch-colon-spacing"          : 0, // 🔧 Enforce spacing around colons of switch statements
	"@stylistic/template-curly-spacing"        : "error", // 💼 🔧 Require or disallow spacing around embedded expressions of template strings
	"@stylistic/template-tag-spacing"          : 0, // 💼 🔧 Require or disallow spacing between template tags and their literals
	"@stylistic/yield-star-spacing"            : 0, // 🔧 Require or disallow spacing around the `*` in `yield*` expressions


	// (23) Line breaks [https://eslint.style/rules?filter=line-breaks]
	"@stylistic/array-bracket-newline"           : ["error", "consistent"], // 🔧 Enforce linebreaks after opening and before closing array brackets
	"@stylistic/array-element-newline"           : 0, // 🔧 Enforce line breaks after each array element
	"@stylistic/curly-newline"                   : 0, // 🔧 Enforce consistent line breaks after opening and before closing braces
	"@stylistic/eol-last"                        : "error", // 💼 🔧 Require or disallow newline at the end of files
	"@stylistic/function-call-argument-newline"  : 0, // 🔧 Enforce line breaks between arguments of a function call
	"@stylistic/function-paren-newline"          : 0, // 🔧 Enforce consistent line breaks inside function parentheses
	"@stylistic/implicit-arrow-linebreak"        : 0, // 🔧 Enforce the location of arrow function bodies
	"@stylistic/linebreak-style"                 : 0, // 🔧 Enforce consistent linebreak style
	"@stylistic/lines-between-class-members"     : 0, // 💼 🔧 Require or disallow an empty line between class members
	"@stylistic/multiline-ternary"               : 0, // 💼 🔧 Enforce newlines between operands of ternary expressions
	"@stylistic/newline-per-chained-call"        : 0, // 🔧 Require a newline after each call in a method chain
	"@stylistic/object-curly-newline"            : 0, // 🔧 Enforce consistent line breaks after opening and before closing braces
	"@stylistic/object-property-newline"         : 0, // 🔧 Enforce placing object properties on separate lines
	"@stylistic/operator-linebreak"              : ["error", "before"], // 💼 🔧 Enforce consistent linebreak style for operators
	"@stylistic/padding-line-between-statements" : 0, // 🔧 Require or disallow padding lines between statements


	// (21) Brackets [https://eslint.style/rules?filter=brackets]
	"@stylistic/arrow-parens"    : "error", // 💼 🔧 Require parentheses around arrow function arguments
	"@stylistic/brace-style"     : 0, // 💼 🔧 Enforce consistent brace style for blocks
	"@stylistic/new-parens"      : "error", // 💼 🔧 Enforce or disallow parentheses when invoking a constructor with no arguments
	"@stylistic/no-extra-parens" : 0, // 💼 🔧 Disallow unnecessary parentheses
	"@stylistic/wrap-iife"       : "error", // 💼 🔧 Require parentheses around immediate `function` invocations
	"@stylistic/wrap-regex"      : 0, // 🔧 Require parenthesis around regex literals


	// ( 4) Indent [https://eslint.style/rules?filter=indent]
	"@stylistic/indent"            : 0, // 💼 🔧 Enforce consistent indentation
	"@stylistic/indent-binary-ops" : 0, // 💼 🔧 Indentation for binary operators


	// ( 3) Quotes [https://eslint.style/rules?filter=quotes]
	"@stylistic/quote-props" : ["error", "consistent"], // 💼 🔧 Require quotes around object literal, type literal, interfaces and enums property names
	"@stylistic/quotes"      : ["error", "double", { "avoidEscape": true, "allowTemplateLiterals": "always" }], // 💼 🔧 Enforce the consistent use of either backticks, double, or single quotes


	// ( 3) Commas [https://eslint.style/rules?filter=commas]
	"@stylistic/comma-dangle" : ["error", "always-multiline"], // 💼 🔧 Require or disallow trailing commas
	"@stylistic/comma-style"  : "error", // 💼 🔧 Enforce consistent comma style


	// ( 4) Semis [https://eslint.style/rules?filter=semis]
	"@stylistic/no-extra-semi" : "error", // 🔧 Disallow unnecessary semicolons
	"@stylistic/semi"          : "error", // 💼 🔧 Require or disallow semicolons instead of ASI
	"@stylistic/semi-style"    : "error", // 🔧 Enforce location of semicolons


	// ( 7) Operators [https://eslint.style/rules?filter=operators]
	"@stylistic/dot-location"       : 0, // 💼 🔧 Enforce consistent newlines before and after dots
	"@stylistic/no-mixed-operators" : 0, // 💼 Disallow mixed binary operators


	// ( 4) Comments [https://eslint.style/rules?filter=comments]
	"@stylistic/line-comment-position"   : 0, // Enforce position of line comments
	"@stylistic/multiline-comment-style" : 0, // 🔧 Enforce a particular style for multiline comments
	"@stylistic/lines-around-comment"    : 0, // 🔧 Require empty lines around comments
	"@stylistic/spaced-comment"          : "error", // 💼 🔧 Enforce consistent spacing after the `//` or `/*` in a comment


	// (21) JSX [https://eslint.style/rules?filter=jsx]
	"@stylistic/jsx-closing-tag-location"     : 0, // 💼 🔧 Enforce closing tag location for multiline JSX
	"@stylistic/jsx-max-props-per-line"       : 0, // 💼 🔧 Enforce maximum of props on a single line in JSX
	"@stylistic/jsx-one-expression-per-line"  : 0, // 💼 🔧 Require one JSX element per line
	"@stylistic/jsx-pascal-case"              : 0, // Enforce PascalCase for user-defined JSX components
	"@stylistic/jsx-self-closing-comp"        : 0, // 🔧 Disallow extra closing tags for components without children
	"@stylistic/jsx-sort-props"               : 0, // 🔧 Enforce props alphabetical sorting
	"@stylistic/jsx-child-element-spacing"    : 0, // Enforce or disallow spaces inside of curly braces in JSX attributes and expressions
	"@stylistic/jsx-curly-spacing"            : 0, // 💼 🔧 Enforce or disallow spaces inside of curly braces in JSX attributes and expressions
	"@stylistic/jsx-equals-spacing"           : 0, // 💼 🔧 Enforce or disallow spaces around equal signs in JSX attributes
	"@stylistic/jsx-props-no-multi-spaces"    : 0, // 🔧 Disallow multiple spaces between inline JSX props. Deprecated, use `no-multi-spaces` rule instead
	"@stylistic/jsx-tag-spacing"              : 0, // 💼 🔧 Enforce whitespace in and around the JSX opening and closing brackets
	"@stylistic/jsx-curly-newline"            : 0, // 💼 🔧 Enforce consistent linebreaks in curly braces in JSX attributes and expressions
	"@stylistic/jsx-first-prop-new-line"      : 0, // 💼 🔧 Enforce proper position of the first property in JSX
	"@stylistic/jsx-function-call-newline"    : 0, // 💼 🔧 Enforce line breaks before and after JSX elements when they are used as arguments to a function
	"@stylistic/jsx-newline"                  : 0, // 🔧 Require or prevent a new line after jsx elements and expressions
	"@stylistic/jsx-wrap-multilines"          : 0, // 💼 🔧 Disallow missing parentheses around multiline JSX
	"@stylistic/jsx-closing-bracket-location" : 0, // 💼 🔧 Enforce closing bracket location in JSX
	"@stylistic/jsx-curly-brace-presence"     : 0, // 💼 🔧 Disallow unnecessary JSX expressions when literals alone are sufficient or enforce JSX expressions on literals in JSX children or attributes
	"@stylistic/jsx-quotes"                   : 0, // 💼 🔧 Enforce the consistent use of either double or single quotes in JSX attributes
	"@stylistic/jsx-indent"                   : 0, // 🔧 Enforce JSX indentation. Deprecated, use `indent` rule instead
	"@stylistic/jsx-indent-props"             : 0, // 💼 🔧 Enforce props indentation in JSX


	// ( 3) Types [https://eslint.style/rules?filter=type]
	"@stylistic/type-annotation-spacing"  : ["error", { before: true, after: true }], // 💼 🔧 Require consistent spacing around type annotations
	"@stylistic/type-generic-spacing"     : "error", // 💼 🔧 Enforces consistent spacing inside TypeScript type generics
	"@stylistic/type-named-tuple-spacing" : "error", // 💼 🔧 Expect space before the type declaration in the named tuple


	// ( 11) Disallow [https://eslint.style/rules?filter=disallow]
	"@stylistic/no-confusing-arrow"      : 0, // 🔧 Disallow arrow functions where they could be confused with comparisons
	"@stylistic/no-floating-decimal"     : 0, // 💼 🔧 Disallow leading or trailing decimal points in numeric literals
	"@stylistic/no-multiple-empty-lines" : 0, // 💼 🔧 Disallow multiple empty lines
	"@stylistic/no-tabs"                 : 0, // 💼 Disallow all tabs


	// ( 1) Experimental [https://eslint.style/rules?filter=experimental]
	"@stylistic/list-style" : 0, // 🔧 🧪 Enforce consistent spacing and line break styles inside brackets


	// ( 6) Misc. [https://eslint.style/rules?filter=misc]
	"@stylistic/max-len"                          : 0, // Enforce a maximum line length
	"@stylistic/max-statements-per-line"          : 0, // 💼 Enforce a maximum number of statements allowed per line
	"@stylistic/member-delimiter-style"           : 0, // 💼 🔧 Require a specific member delimiter style for interfaces and type literals
	"@stylistic/nonblock-statement-body-position" : 0, // 🔧 Enforce the location of single-line statements
	"@stylistic/one-var-declaration-per-line"     : 0, // 🔧 Require or disallow newlines around variable declarations
	"@stylistic/padded-blocks"                    : 0, // 💼 🔧 Require or disallow padding within blocks








	/* -- typescript-eslint rules -- */ // [https://typescript-eslint.io/rules/]


	"@typescript-eslint/no-empty-object-type": "error",
	"@typescript-eslint/no-extra-non-null-assertion": "error",
	"@typescript-eslint/no-misused-new": "error",
	"@typescript-eslint/no-require-imports": "error",
	"@typescript-eslint/no-wrapper-object-types": "error"

};





// | ---------------------------------------------------------------------------
// |  Export Configs
export default [
	{ // JavaScript eslint config:
		files           : ["**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
		languageOptions : { ecmaVersion: 2023, sourceType: "module" },
		plugins         : { "@stylistic": stylistic },
		rules           : { ...GLOBAL_RULES, ...JS_RULES },
	},
	{ // TypeScript eslint config:
		files           : ["**/*.ts", "**/*.tsx"],
		languageOptions : { ecmaVersion: 2023, sourceType: "module", parser: tsParser },
		plugins         : { "@stylistic": stylistic, "@typescript-eslint": tseslint },
		rules           : { ...GLOBAL_RULES, ...TS_RULES },
	},
];
