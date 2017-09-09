# Armageddon

## Introduction and Disclaimer

This module is for people who want to know what the heck is going on in their ridiculously bloated code base, this module is for you. 

However, because this module changes your code base directly (meaning actual files have their contents changed), be very very careful when using this module. The best thing to do before using this module would be to backup your code base and all its recent changes using some kind of version control system.

Note that only files with a .js suffix are changed.

## Installation

```
npm install -g armageddon
```

## Usage (with git)

```
cd path/to/directory/of/js/files
git stash
git checkout -b boom
armageddon

git branch -D boom
```

The module will trigger a recursive search for JavaScript files within the current working directory, by using the .js suffix of each file. The module will then inject a console.log('ARMA[marker]') line into every single multi-line function in each of these files.

When the files are then run using node, ARMA[marker]s will then be printed into the logs as you move through the code base. This will allow you to trace movement through your code base, something especially useful for code bases that are extremely convoluted.

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

