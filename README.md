# Armageddon

## Introduction and Disclaimer

This module is for people who want to know what the heck is going on in their ridiculously bloated code base. 

When used, this module will trigger a recursive search for JavaScript files within the current working directory, by using the .js suffix of each file. The module will then inject a console.log('ARMA[marker]') line into every single multi-line function in each of these files.

When the files are then run using node, ARMA[marker]s will then be printed into the logs as you move through the code base. This will allow you to trace the flow through your code base, something especially useful for code bases that are extremely convoluted.

However, because this module changes your code base directly (meaning actual files have their contents changed), be very very careful when using this module. The best thing to do before using this module would be to backup your code base and all its recent changes using some kind of version control system.

Note that only files with a .js suffix are changed.

## Installation

```
npm install -g armageddon
```

## Usage

### Using the module

Start at the directory of js files you want to trace flow through.
```
cd path/to/directory/of/js/files
```
Backup current code base. This uses git, but use whatever version control system you want.
```
git stash
git checkout -b boom
```
Run the armageddon module.
```
armageddon
```
Play with your code base until you understand it. Then revert back to the original code base without the vandalism.
```
git stash save --keep-index
git stash drop
git branch -D boom
```

### Result of using the module

Example of what happens to the code base. 

Original:
```javascript
// example.js

function x(arg1, arg2) {
	var x = 2
	return x + x
}

() => {
	return 'I am an anonymous function'
}
```

New:
```javascript
// example.js

function x(arg1, arg2) {
	
	console.log('ARMA1');

	var x = 2
	return x + x
}

() => {

	console.log('ARMA2');

	return 'I am an anonymous function'
}
```

## Testing

```
cd test
node ../bin/armageddon
```
Check that all functions have console.log("ARMA[marker]") directly at the start of the function.

To reset the test files:

```
./reset.sh
```

