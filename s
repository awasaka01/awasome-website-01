below are eslint + eslint-styleistic rules i want them converted into an object of rules,
formatted like this: 
```
const rules = {
	
	// ESLINT RULES:
	// Sub Category Title [https://eslint.org/docs/latest/rules/#possible-problems]
	"rule-name": "off", // rule description
	"rule-name": "off", // rule description
	"rule-name": "off", // rule description
	// Sub Category Title [https://eslint.org/docs/latest/rules/#possible-problems]
	"rule-name": "off", // rule description
	"rule-name": "off", // rule description
	"rule-name": "off", // rule description


	// styleistic RULES:
	// Sub Category Title [https://eslint.style/rules?filter=linkhere]
	"@stylistic/rule-name": "off", // rule description
	"@stylistic/rule-name": "off", // rule description
	"@stylistic/rule-name": "off", // rule description
	// Sub Category Title [https://eslint.style/rules?filter=linkhere]
	"@stylistic/rule-name": "off", // rule description
	"@stylistic/rule-name": "off", // rule description
	"@stylistic/rule-name": "off", // rule description
}
```

so every rule and category should be in it, all set to off, with their descriptions next to it in a comment
(remove all ending punctiuation from descriptions)

eslint rules dont have emojis, so leave that normal, but for the stylisitc rules include the emojis in front of the rule description


for the first response do not fully complete it, just do the first 3 rules of each category so i know how you'll format it








these are the rules extracted from https://eslint.org/docs/latest/rules



Possible Problems

array-callback-return — Enforce return statements in callbacks of array methods
constructor-super — Require super() calls in constructors
for-direction — Enforce for loop update clause moving the counter in the right direction
getter-return — Enforce return statements in getters
no-async-promise-executor — Disallow using an async function as a Promise executor
no-await-in-loop — Disallow await inside of loops
no-class-assign — Disallow reassigning class members
no-compare-neg-zero — Disallow comparing against -0
no-cond-assign — Disallow assignment operators in conditional expressions
no-const-assign — Disallow reassigning const, using, and await using variables
no-constant-binary-expression — Disallow expressions where the operation doesn’t affect the value
no-constant-condition — Disallow constant expressions in conditions
no-constructor-return — Disallow returning value from constructor
no-control-regex — Disallow control characters in regular expressions
no-debugger — Disallow the use of debugger
no-dupe-args — Disallow duplicate arguments in function definitions
no-dupe-class-members — Disallow duplicate class members
no-dupe-else-if — Disallow duplicate conditions in if-else-if chains
no-dupe-keys — Disallow duplicate keys in object literals
no-duplicate-case — Disallow duplicate case labels
no-duplicate-imports — Disallow duplicate module imports
no-empty-character-class — Disallow empty character classes in regular expressions
no-empty-pattern — Disallow empty destructuring patterns
no-ex-assign — Disallow reassigning exceptions in catch clauses
no-fallthrough — Disallow fallthrough of case statements
no-func-assign — Disallow reassigning function declarations
no-import-assign — Disallow assigning to imported bindings
no-inner-declarations — Disallow variable or function declarations in nested blocks
no-invalid-regexp — Disallow invalid regular expression strings in RegExp constructors
no-irregular-whitespace — Disallow irregular whitespace
no-loss-of-precision — Disallow literal numbers that lose precision
no-misleading-character-class — Disallow characters which are made with multiple code points in character class syntax
no-new-native-nonconstructor — Disallow new operators with global non-constructor functions
no-obj-calls — Disallow calling global object properties as functions
no-promise-executor-return — Disallow returning values from Promise executor functions
no-prototype-builtins — Disallow calling some Object.prototype methods directly on objects
no-self-assign — Disallow assignments where both sides are exactly the same
no-self-compare — Disallow comparisons where both sides are exactly the same
no-setter-return — Disallow returning values from setters
no-sparse-arrays — Disallow sparse arrays
no-template-curly-in-string — Disallow template literal placeholder syntax in regular strings
no-this-before-super — Disallow this/super before calling super() in constructors
no-unassigned-vars — Disallow let or var variables that are read but never assigned
no-undef — Disallow the use of undeclared variables unless mentioned in /*global */ comments
no-unexpected-multiline — Disallow confusing multiline expressions
no-unmodified-loop-condition — Disallow unmodified loop conditions
no-unreachable — Disallow unreachable code after return, throw, continue, and break statements
no-unreachable-loop — Disallow loops with a body that allows only one iteration
no-unsafe-finally — Disallow control flow statements in finally blocks
no-unsafe-negation — Disallow negating the left operand of relational operators
no-unsafe-optional-chaining — Disallow use of optional chaining in contexts where the undefined value is not allowed
no-unused-private-class-members — Disallow unused private class members
no-unused-vars — Disallow unused variables
no-use-before-define — Disallow the use of variables before they are defined
no-useless-assignment — Disallow variable assignments when the value is not used
no-useless-backreference — Disallow useless backreferences in regular expressions
require-atomic-updates — Disallow assignments that can lead to race conditions due to usage of await or yield
use-isnan — Require calls to isNaN() when checking for NaN
valid-typeof — Enforce comparing typeof expressions against valid strings

Suggestions

accessor-pairs — Enforce getter and setter pairs in objects and classes
arrow-body-style — Require braces around arrow function bodies
block-scoped-var — Enforce the use of variables within the scope they are defined
camelcase — Enforce camelcase naming convention
capitalized-comments — Enforce or disallow capitalization of the first letter of a comment
class-methods-use-this — Enforce that class methods utilize this
complexity — Enforce a maximum cyclomatic complexity allowed in a program
consistent-return — Require return statements to either always or never specify values
consistent-this — Enforce consistent naming when capturing the current execution context
curly — Enforce consistent brace style for all control statements
default-case — Require default cases in switch statements
default-case-last — Enforce default clauses in switch statements to be last
default-param-last — Enforce default parameters to be last
dot-notation — Enforce dot notation whenever possible
eqeqeq — Require the use of === and !==
func-name-matching — Require function names to match the name of the variable or property to which they are assigned
func-names — Require or disallow named function expressions
func-style — Enforce the consistent use of either function declarations or expressions assigned to variables
grouped-accessor-pairs — Require grouped accessor pairs in object literals and classes
guard-for-in — Require for-in loops to include an if statement
id-denylist — Disallow specified identifiers
id-length — Enforce minimum and maximum identifier lengths
id-match — Require identifiers to match a specified regular expression
init-declarations — Require or disallow initialization in variable declarations
logical-assignment-operators — Require or disallow logical assignment operator shorthand
max-classes-per-file — Enforce a maximum number of classes per file
max-depth — Enforce a maximum depth that blocks can be nested
max-lines — Enforce a maximum number of lines per file
max-lines-per-function — Enforce a maximum number of lines of code in a function
max-nested-callbacks — Enforce a maximum depth that callbacks can be nested
max-params — Enforce a maximum number of parameters in function definitions
max-statements — Enforce a maximum number of statements allowed in function blocks
new-cap — Require constructor names to begin with a capital letter
no-alert — Disallow the use of alert, confirm, and prompt
no-array-constructor — Disallow Array constructors
no-bitwise — Disallow bitwise operators
no-caller — Disallow the use of arguments.caller or arguments.callee
no-case-declarations — Disallow lexical declarations in case clauses
no-console — Disallow the use of console
no-continue — Disallow continue statements
no-delete-var — Disallow deleting variables
no-div-regex — Disallow equal signs explicitly at the beginning of regular expressions
no-else-return — Disallow else blocks after return statements in if statements
no-empty — Disallow empty block statements
no-empty-function — Disallow empty functions
no-empty-static-block — Disallow empty static blocks
no-eq-null — Disallow null comparisons without type-checking operators
no-eval — Disallow the use of eval()
no-extend-native — Disallow extending native types
no-extra-bind — Disallow unnecessary calls to .bind()
no-extra-boolean-cast — Disallow unnecessary boolean casts
no-extra-label — Disallow unnecessary labels
no-global-assign — Disallow assignments to native objects or read-only global variables
no-implicit-coercion — Disallow shorthand type conversions
no-implicit-globals — Disallow declarations in the global scope
no-implied-eval — Disallow the use of eval()-like methods
no-inline-comments — Disallow inline comments after code
no-invalid-this — Disallow use of this in contexts where the value of this is undefined
no-iterator — Disallow the use of the __iterator__ property
no-label-var — Disallow labels that share a name with a variable
no-labels — Disallow labeled statements
no-lone-blocks — Disallow unnecessary nested blocks
no-lonely-if — Disallow if statements as the only statement in else blocks
no-loop-func — Disallow function declarations that contain unsafe references inside loop statements
no-magic-numbers — Disallow magic numbers
no-multi-assign — Disallow use of chained assignment expressions
no-multi-str — Disallow multiline strings
no-negated-condition — Disallow negated conditions
no-nested-ternary — Disallow nested ternary expressions
no-new — Disallow new operators outside of assignments or comparisons
no-new-func — Disallow new operators with the Function object
no-new-wrappers — Disallow new operators with the String, Number, and Boolean objects
no-nonoctal-decimal-escape — Disallow \8 and \9 escape sequences in string literals
no-object-constructor — Disallow calls to the Object constructor without an argument
no-octal — Disallow octal literals
no-octal-escape — Disallow octal escape sequences in string literals
no-param-reassign — Disallow reassigning function parameters
no-plusplus — Disallow the unary operators ++ and --
no-proto — Disallow the use of the __proto__ property
no-redeclare — Disallow variable redeclaration
no-regex-spaces — Disallow multiple spaces in regular expressions
no-restricted-exports — Disallow specified names in exports
no-restricted-globals — Disallow specified global variables
no-restricted-imports — Disallow specified modules when loaded by import
no-restricted-properties — Disallow certain properties on certain objects
no-restricted-syntax — Disallow specified syntax
no-return-assign — Disallow assignment operators in return statements
no-script-url — Disallow javascript: URLs
no-sequences — Disallow comma operators
no-shadow — Disallow variable declarations from shadowing variables declared in the outer scope
no-shadow-restricted-names — Disallow identifiers from shadowing restricted names
no-ternary — Disallow ternary operators
no-throw-literal — Disallow throwing literals as exceptions
no-undef-init — Disallow initializing variables to undefined
no-undefined — Disallow the use of undefined as an identifier
no-underscore-dangle — Disallow dangling underscores in identifiers
no-unneeded-ternary — Disallow ternary operators when simpler alternatives exist
no-unused-expressions — Disallow unused expressions
no-unused-labels — Disallow unused labels
no-useless-call — Disallow unnecessary calls to .call() and .apply()
no-useless-catch — Disallow unnecessary catch clauses
no-useless-computed-key — Disallow unnecessary computed property keys in objects and classes
no-useless-concat — Disallow unnecessary concatenation of literals or template literals
no-useless-constructor — Disallow unnecessary constructors
no-useless-escape — Disallow unnecessary escape characters
no-useless-rename — Disallow renaming import, export, and destructured assignments to the same name
no-useless-return — Disallow redundant return statements
no-var — Require let or const instead of var
no-void — Disallow void operators
no-warning-comments — Disallow specified warning terms in comments
no-with — Disallow with statements
object-shorthand — Require or disallow method and property shorthand syntax for object literals
one-var — Enforce variables to be declared either together or separately in functions
operator-assignment — Require or disallow assignment operator shorthand where possible
prefer-arrow-callback — Require using arrow functions for callbacks
prefer-const — Require const declarations for variables that are never reassigned after declared
prefer-destructuring — Require destructuring from arrays and/or objects
prefer-exponentiation-operator — Disallow the use of Math.pow in favor of the ** operator
prefer-named-capture-group — Enforce using named capture group in regular expression
prefer-numeric-literals — Disallow parseInt() and Number.parseInt() in favor of binary, octal, and hexadecimal literals
prefer-object-has-own — Disallow use of Object.prototype.hasOwnProperty.call() and prefer use of Object.hasOwn()
prefer-object-spread — Disallow using Object.assign with an object literal as the first argument and prefer the use of object spread instead
prefer-promise-reject-errors — Require using Error objects as Promise rejection reasons
prefer-regex-literals — Disallow use of the RegExp constructor in favor of regular expression literals
prefer-rest-params — Require rest parameters instead of arguments
prefer-spread — Require spread operators instead of .apply()
prefer-template — Require template literals instead of string concatenation
preserve-caught-error — Disallow losing originally caught error when re-throwing custom errors
radix — Enforce the consistent use of the radix argument when using parseInt()
require-await — Disallow async functions which have no await expression
require-unicode-regexp — Enforce the use of u or v flag on regular expressions
require-yield — Require generator functions to contain yield
sort-imports — Enforce sorted import declarations within modules
sort-keys — Require object keys to be sorted
sort-vars — Require variables within the same declaration block to be sorted
strict — Require or disallow strict mode directives
symbol-description — Require symbol descriptions
vars-on-top — Require var declarations be placed at the top of their containing scope
yoda — Require or disallow “Yoda” conditions

Layout & Formatting

unicode-bom — Require or disallow Unicode byte order mark (BOM)





these are the rules extracted from https://eslint.style/rules


CATEGORY: Spacing 35 https://eslint.style/rules?filter=spacing

array-bracket-spacing	Enforce consistent spacing inside array brackets	💼	🔧	
arrow-spacing	Enforce consistent spacing before and after the arrow in arrow functions	💼	🔧	
block-spacing	Disallow or enforce spaces inside of blocks after opening block and before closing block	💼	🔧	
comma-spacing	Enforce consistent spacing before and after commas	💼	🔧	
computed-property-spacing	Enforce consistent spacing inside computed property brackets	💼	🔧	
function-call-spacing	Require or disallow spacing between function identifiers and their invocations		🔧	
generator-star-spacing	Enforce consistent spacing around `*` operators in generator functions	💼	🔧	
jsx-child-element-spacing	Enforce or disallow spaces inside of curly braces in JSX attributes and expressions			
jsx-curly-spacing	Enforce or disallow spaces inside of curly braces in JSX attributes and expressions	💼	🔧	
jsx-equals-spacing	Enforce or disallow spaces around equal signs in JSX attributes	💼	🔧	
jsx-props-no-multi-spaces	Disallow multiple spaces between inline JSX props. Deprecated, use `no-multi-spaces` rule instead.		🔧	
jsx-tag-spacing	Enforce whitespace in and around the JSX opening and closing brackets	💼	🔧	
key-spacing	Enforce consistent spacing between property names and type annotations in types and interfaces	💼	🔧	
keyword-spacing	Enforce consistent spacing before and after keywords	💼	🔧	
list-style	Enforce consistent spacing and line break styles inside brackets.		🔧	🧪
no-mixed-spaces-and-tabs	Disallow mixed spaces and tabs for indentation	💼		
no-multi-spaces	Disallow multiple spaces	💼	🔧	
no-trailing-spaces	Disallow trailing whitespace at the end of lines	💼	🔧	
no-whitespace-before-property	Disallow whitespace before properties	💼	🔧	
object-curly-spacing	Enforce consistent spacing inside braces	💼	🔧	
rest-spread-spacing	Enforce spacing between rest and spread operators and their expressions	💼	🔧	
semi-spacing	Enforce consistent spacing before and after semicolons	💼	🔧	
space-before-blocks	Enforce consistent spacing before blocks	💼	🔧	
space-before-function-paren	Enforce consistent spacing before function parenthesis	💼	🔧	
space-in-parens	Enforce consistent spacing inside parentheses	💼	🔧	
space-infix-ops	Require spacing around infix operators	💼	🔧	
space-unary-ops	Enforce consistent spacing before or after unary operators	💼	🔧	
spaced-comment	Enforce consistent spacing after the `//` or `/*` in a comment	💼	🔧	
switch-colon-spacing	Enforce spacing around colons of switch statements		🔧	
template-curly-spacing	Require or disallow spacing around embedded expressions of template strings	💼	🔧	
template-tag-spacing	Require or disallow spacing between template tags and their literals	💼	🔧	
type-annotation-spacing	Require consistent spacing around type annotations	💼	🔧	
type-generic-spacing	Enforces consistent spacing inside TypeScript type generics	💼	🔧	
type-named-tuple-spacing	Expect space before the type declaration in the named tuple	💼	🔧	
yield-star-spacing	Require or disallow spacing around the `*` in `yield*` expressions


CATEGORY: Line breaks 23 https://eslint.style/rules?filter=brackets

array-bracket-newline	Enforce linebreaks after opening and before closing array brackets		🔧	
array-element-newline	Enforce line breaks after each array element		🔧	
curly-newline	Enforce consistent line breaks after opening and before closing braces		🔧	
eol-last	Require or disallow newline at the end of files	💼	🔧	
function-call-argument-newline	Enforce line breaks between arguments of a function call		🔧	
function-paren-newline	Enforce consistent line breaks inside function parentheses		🔧	
implicit-arrow-linebreak	Enforce the location of arrow function bodies		🔧	
jsx-curly-newline	Enforce consistent linebreaks in curly braces in JSX attributes and expressions	💼	🔧	
jsx-first-prop-new-line	Enforce proper position of the first property in JSX	💼	🔧	
jsx-function-call-newline	Enforce line breaks before and after JSX elements when they are used as arguments to a function.	💼	🔧	
jsx-newline	Require or prevent a new line after jsx elements and expressions.		🔧	
jsx-wrap-multilines	Disallow missing parentheses around multiline JSX	💼	🔧	
linebreak-style	Enforce consistent linebreak style		🔧	
lines-around-comment	Require empty lines around comments		🔧	
lines-between-class-members	Require or disallow an empty line between class members	💼	🔧	
list-style	Enforce consistent spacing and line break styles inside brackets.		🔧	🧪
multiline-comment-style	Enforce a particular style for multiline comments		🔧	
multiline-ternary	Enforce newlines between operands of ternary expressions	💼	🔧	
newline-per-chained-call	Require a newline after each call in a method chain		🔧	
object-curly-newline	Enforce consistent line breaks after opening and before closing braces		🔧	
object-property-newline	Enforce placing object properties on separate lines		🔧	
operator-linebreak	Enforce consistent linebreak style for operators	💼	🔧	
padding-line-between-statements	Require or disallow padding lines between statements		🔧


CATEGORY: Brackets 21 https://eslint.style/rules?filter=brackets

array-bracket-newline	Enforce linebreaks after opening and before closing array brackets		🔧	
array-bracket-spacing	Enforce consistent spacing inside array brackets	💼	🔧	
arrow-parens	Require parentheses around arrow function arguments	💼	🔧	
brace-style	Enforce consistent brace style for blocks	💼	🔧	
curly-newline	Enforce consistent line breaks after opening and before closing braces		🔧	
function-paren-newline	Enforce consistent line breaks inside function parentheses		🔧	
jsx-closing-bracket-location	Enforce closing bracket location in JSX	💼	🔧	
jsx-curly-brace-presence	Disallow unnecessary JSX expressions when literals alone are sufficient or enforce JSX expressions on literals in JSX children or attributes	💼	🔧	
jsx-curly-newline	Enforce consistent linebreaks in curly braces in JSX attributes and expressions	💼	🔧	
jsx-curly-spacing	Enforce or disallow spaces inside of curly braces in JSX attributes and expressions	💼	🔧	
jsx-wrap-multilines	Disallow missing parentheses around multiline JSX	💼	🔧	
list-style	Enforce consistent spacing and line break styles inside brackets.		🔧	🧪
new-parens	Enforce or disallow parentheses when invoking a constructor with no arguments	💼	🔧	
no-extra-parens	Disallow unnecessary parentheses	💼	🔧	
object-curly-newline	Enforce consistent line breaks after opening and before closing braces		🔧	
object-curly-spacing	Enforce consistent spacing inside braces	💼	🔧	
space-before-function-paren	Enforce consistent spacing before function parenthesis	💼	🔧	
space-in-parens	Enforce consistent spacing inside parentheses	💼	🔧	
template-curly-spacing	Require or disallow spacing around embedded expressions of template strings	💼	🔧	
wrap-iife	Require parentheses around immediate `function` invocations	💼	🔧	
wrap-regex	Require parenthesis around regex literals		🔧	


CATEGORY: Indent 4 https://eslint.style/rules?filter=indent

indent	Enforce consistent indentation	💼	🔧	
indent-binary-ops	Indentation for binary operators	💼	🔧	
jsx-indent	Enforce JSX indentation. Deprecated, use `indent` rule instead.		🔧	
jsx-indent-props	Enforce props indentation in JSX	💼	🔧


CATEGORY: Quotes 3 https://eslint.style/rules?filter=quotes

jsx-quotes	Enforce the consistent use of either double or single quotes in JSX attributes	💼	🔧	
quote-props	Require quotes around object literal, type literal, interfaces and enums property names	💼	🔧	
quotes	Enforce the consistent use of either backticks, double, or single quotes	💼	🔧	


CATEGORY: Commas 3 https://eslint.style/rules?filter=commas

comma-dangle	Require or disallow trailing commas	💼	🔧	
comma-spacing	Enforce consistent spacing before and after commas	💼	🔧	
comma-style	Enforce consistent comma style	💼	🔧


CATEGORY: Semis 4 https://eslint.style/rules?filter=semis

no-extra-semi	Disallow unnecessary semicolons		🔧	
semi	Require or disallow semicolons instead of ASI	💼	🔧	
semi-spacing	Enforce consistent spacing before and after semicolons	💼	🔧	
semi-style	Enforce location of semicolons		🔧


CATEGORY: Operators 7 https://eslint.style/rules?filter=operators

dot-location	Enforce consistent newlines before and after dots	💼	🔧	
indent-binary-ops	Indentation for binary operators	💼	🔧	
multiline-ternary	Enforce newlines between operands of ternary expressions	💼	🔧	
no-mixed-operators	Disallow mixed binary operators	💼		
operator-linebreak	Enforce consistent linebreak style for operators	💼	🔧	
space-infix-ops	Require spacing around infix operators	💼	🔧	
space-unary-ops	Enforce consistent spacing before or after unary operators	💼	🔧	


CATEGORY: Comments 4 https://eslint.style/rules?filter=comments

line-comment-position	Enforce position of line comments			
lines-around-comment	Require empty lines around comments		🔧	
multiline-comment-style	Enforce a particular style for multiline comments		🔧	
spaced-comment	Enforce consistent spacing after the `//` or `/*` in a comment	💼	🔧	


CATEGORY: JSX 21 https://eslint.style/rules?filter=jsx

jsx-child-element-spacing	Enforce or disallow spaces inside of curly braces in JSX attributes and expressions			
jsx-closing-bracket-location	Enforce closing bracket location in JSX	💼	🔧	
jsx-closing-tag-location	Enforce closing tag location for multiline JSX	💼	🔧	
jsx-curly-brace-presence	Disallow unnecessary JSX expressions when literals alone are sufficient or enforce JSX expressions on literals in JSX children or attributes	💼	🔧	
jsx-curly-newline	Enforce consistent linebreaks in curly braces in JSX attributes and expressions	💼	🔧	
jsx-curly-spacing	Enforce or disallow spaces inside of curly braces in JSX attributes and expressions	💼	🔧	
jsx-equals-spacing	Enforce or disallow spaces around equal signs in JSX attributes	💼	🔧	
jsx-first-prop-new-line	Enforce proper position of the first property in JSX	💼	🔧	
jsx-function-call-newline	Enforce line breaks before and after JSX elements when they are used as arguments to a function.	💼	🔧	
jsx-indent	Enforce JSX indentation. Deprecated, use `indent` rule instead.		🔧	
jsx-indent-props	Enforce props indentation in JSX	💼	🔧	
jsx-max-props-per-line	Enforce maximum of props on a single line in JSX	💼	🔧	
jsx-newline	Require or prevent a new line after jsx elements and expressions.		🔧	
jsx-one-expression-per-line	Require one JSX element per line	💼	🔧	
jsx-pascal-case	Enforce PascalCase for user-defined JSX components			
jsx-props-no-multi-spaces	Disallow multiple spaces between inline JSX props. Deprecated, use `no-multi-spaces` rule instead.		🔧	
jsx-quotes	Enforce the consistent use of either double or single quotes in JSX attributes	💼	🔧	
jsx-self-closing-comp	Disallow extra closing tags for components without children		🔧	
jsx-sort-props	Enforce props alphabetical sorting		🔧	
jsx-tag-spacing	Enforce whitespace in and around the JSX opening and closing brackets	💼	🔧	
jsx-wrap-multilines	Disallow missing parentheses around multiline JSX	💼	🔧	


CATEGORY: Types 3 https://eslint.style/rules?filter=types

type-annotation-spacing	Require consistent spacing around type annotations	💼	🔧	
type-generic-spacing	Enforces consistent spacing inside TypeScript type generics	💼	🔧	
type-named-tuple-spacing	Expect space before the type declaration in the named tuple	💼	🔧


CATEGORY: Disallow 11 https://eslint.style/rules?filter=disallow

no-confusing-arrow	Disallow arrow functions where they could be confused with comparisons		🔧	
no-extra-parens	Disallow unnecessary parentheses	💼	🔧	
no-extra-semi	Disallow unnecessary semicolons		🔧	
no-floating-decimal	Disallow leading or trailing decimal points in numeric literals	💼	🔧	
no-mixed-operators	Disallow mixed binary operators	💼		
no-mixed-spaces-and-tabs	Disallow mixed spaces and tabs for indentation	💼		
no-multi-spaces	Disallow multiple spaces	💼	🔧	
no-multiple-empty-lines	Disallow multiple empty lines	💼	🔧	
no-tabs	Disallow all tabs	💼		
no-trailing-spaces	Disallow trailing whitespace at the end of lines	💼	🔧	
no-whitespace-before-property	Disallow whitespace before properties	💼	🔧


CATEGORY: Experimental 1 https://eslint.style/rules?filter=experimental

list-style	Enforce consistent spacing and line break styles inside brackets.		🔧	🧪


CATEGORY: Misc. 6 https://eslint.style/rules?filter=misc

max-len	Enforce a maximum line length			
max-statements-per-line	Enforce a maximum number of statements allowed per line	💼		
member-delimiter-style	Require a specific member delimiter style for interfaces and type literals	💼	🔧	
nonblock-statement-body-position	Enforce the location of single-line statements		🔧	
one-var-declaration-per-line	Require or disallow newlines around variable declarations		🔧	
padded-blocks	Require or disallow padding within blocks	💼	🔧