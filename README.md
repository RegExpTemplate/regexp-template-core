# RegExpTemplate
A JavaScript library to generate complex regular expressions more easily.

<!-- Badges -->
[![npm version](https://badge.fury.io/js/%40regexp-template%2Fcore.svg)](https://badge.fury.io/js/%40regexp-template%2Fcore)
[![](https://data.jsdelivr.com/v1/package/npm/@regexp-template/core/badge)](https://www.jsdelivr.com/package/npm/@regexp-template/core)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
<!-- End Badges -->


> :warning: **WARNING:** This library still under development and should not be used in production!


## Getting Started

### Add to your project
The library can be used in the browser using the CDN:
```HTML
<script src="https://cdn.jsdelivr.net/npm/@regexp-template/core/dist/regexp-template.min.js"></script>
```

or via _npm_:
```sh
npm i @regexp-template/core
```

Using the script tag the RegExpTemplate class becomes available on the global scope.

On _Node.js_ can be required using:
```JS
const RegExpTemplate = require('@regexp-template/core');
```

### Hello world example
Lets start with a simple example: concatenation of two regular expressions, `/hello/` and `/world/`.

We first create a RegExpTemplate instance with our regular expressions as arguments:
```JS
var hwTemplate = new RegExpTemplate(/hello/, /world/);
```

then we can compile our template to a RegExp:
```JS
var re = hwTemplate.compile();
// outputs /helloworld/
```

The compile method joins the two regular expressions into a new one.

In this case we only passed two regular expressions but you can pass as many [template elements (see below)](#Template-Elements) as you want.



## Template Elements
The template is constructed using pieces called _elements_.
In the hello world example above, `/hello/` and `/world/` are two _elements_ of that template.

Template _elements_ have 4 types:
- RegExp - used to add regular expression segments to the template. Also allow use of [template variables](#Template-Variables).
- string - all characters are interpreted as literal characters (except especials of strings like `\n`).

- RegExpTemplate - this allows templates to be used inside another templates. See the [subtemplates section](#Subtemplates).
- extension - a custom user defined class. See the [template extension section](#Template-Extensions) for more info.

Any other type passed to the template gets converted to a string.



## Template Variables
Template Variables let you introduce new [template elements](#Template-Elements) inside of regular expressions.

### Declaring variables
Template variables can be declared by using the notation `\V{varname}` inside regular expressions, where the `varname` is the name of the variable.


Note that in `\V` the `V` MUST be uppercase. `'\v'` is already used in regular expressions and strings as vertical tab.

In the code below a template is created and a variable called `myVar` is defined.

```JS
new RegExpTemplate(/\V{ myVar }/);
```

> Note: whitespace can be used inside the curly braces.


variables are unique, any reference for `varname` refers to the same variable.
```JS
new RegExpTemplate(
  /\V{ foo } is the/,
  /same as \V{ foo } but not \V{ bar }/
);
```



### Assigning values

Once defined a variable can then be assigned. This is done using the `applyVars` method.

```JS
const myTemplate = new RegExpTemplate(/\V{ myVar }/);

myTemplate.applyVars({
  myVar: "myValue"
});
```
The `applyVars` method expects an object that maps the name of the _template variable_ to its value.

The value can be any [template element](#Template-Elements).

After the method is called then all references of the variables passed are going to be replaced by the corresponding value.

```JS
const myTemplate = 
new RegExpTemplate(
  /\V{ foo } is the/,
  /same as \V{ foo } but not \V{ bar }/
);

myTemplate.applyVars({
  foo: "dog",
  bar: "cat"
});

myTemplate.compile();
// outputs /dog is the same as dog but not cat/
```

You don't need to set variables at once. you can do something like:
```JS
myTemplate.applyVars({foo: "dog"});
myTemplate.applyVars({bar: "cat"});
```
or in chain:
```js
myTemplate
.applyVars({foo: "dog"})
.applyVars({bar: "cat"});
```

keep in mind however that all variables must be assigned before compiling the template:
```JS
const myTemplate = new RegExpTemplate(
  /\V{ myVar } was not assigned/
);

myTemplate.compile();
// throws an error because 'myVar' is not assigned
```

### New variable reference in assign.
If you assign a value that contains new variables, that variables will be defined/referenced once the variable is applied.

```JS
const myTemplate = new RegExpTemplate(
  /\V{ oldVar }/
);

myTemplate
.applyVars({oldVar: /\(\V{ newVar }\)/})
.applyVars({newVar: '2'});
```

In the example above a regular expression defines a variable called `oldVar`.

The first `applyVars` call replaces the `oldVar` by a new Regular Expression that contains a variable reference wrapped in parentesis.

Once added to the template the new variable `newVar` is defined.

Then the second `applyVars` replaces `newVar` with the string `'2'`.

Since all variables (`oldVar` and ´newVar´) defined are assigned, the template can now be compiled.
```JS
myTemplate.compile();
// outputs /(2)/
```



## Subtemplates
Templates can be included inside other templates.

```JS
// this template might be more complex
// but we keep it simple for the example
const numberTemplate = new RegExpTemplate(/\d+\.\d*/);

// parent template using the numberTemplate
const sumTemplate = new RegExpTemplate(
  numberTemplate, ' + ', numberTemplate
);

sumTemplate.compile();
// outputs /\d+\.\d* \+ \d+\.\d*/
```

This allows to split parts of a complex regular expression into smaller ones, making it more easy to read and edit.
It also allows to reuse this smaller parts in different contexts that the part might be common e.q. the number template in the example above might be used in other contexts that not a sum.

The subtemplates are independent. The [template variables](#Template-Variables) assigned to the parent template will not propagate to the _subtemplate_.

When the parent template compile method is called the _subtemplate_ compile method is called as well and used to compute the result of the parent. This means that the _subtemplate_ must be ready to compile when the compile is called on the parent (see [template variables](#Template-Variables)).



## Template Extensions
> This feature is not implemented yet.

The RegExpTemplate provides an API that allow you to make your own [template elements](#Template-Elements).



## Contributing
This project is still in very early stages and its not ready to receive pull requests yet.

However you can still help by playing with the library and try to find possible bugs in it. If you do, please let me know by adding in the issues.

Also, sugestions are welcome :)



## Licence
MIT
