const fs = require('fs');

const recursive = require('recursive-readdir');
const getFileExtension = require('file-extension');

let marker = 0;

function replacer(match) {
  marker += 1;
  return `${match}console.log("ARMA${marker}");`;
}

const matchers = [
  // function x( ) { }
  /function\s*\w*\s*\(\s*(\w+){0,1}\s*(,\s*\w+\s*)*\)\s*\{/g,
  // // ( ) => { }
  /\(\s*(\w+){0,1}\s*(,\s*\w+\s*)*\)\s*=>\s*\{/g,
]

function scanAndInject(lines, matchers, replacer) {
  return matchers.reduce((prevLines, matcher) => {
    let newLines = [];
    prevLines.forEach((line) => {
      const newLine = line.replace(matcher, replacer).split('\n');
      newLines = newLines.concat(newLine);
    });
    return newLines;
  }, lines)
}

function generateIgnoreFilter(gitignoreFiles = [], fileExtensions = []) {
  return (file, stats) => {
    if (gitignoreFiles.indexOf(file) !== -1) {
      return true;
    }

    // ignore non-js filess
    if (stats.isFile() && fileExtensions.indexOf(getFileExtension(file)) > -1) {
      return true;
    }

    return false
  }
}

module.exports = function (pathToFolder, gitignoreFiles = []) {
  console.log('ARMAGEDDON!!');
  const ignoreFilter = generateIgnoreFilter(gitignoreFiles, ['.js']);

  return recursive(pathToFolder, [ignoreFilter])
    .then(jsFiles => Promise.all(jsFiles.map(file => new Promise((resolve) => {
    // read file into a string
      fs.readFile(file, 'utf8', (err, contents) => {
        const lines = contents.split('\n');

        if (err) {
          console.log(`${file}:`);
          console.log(err);
        } else {
          const newLines = scanAndInject(lines, matchers, replacer)
          const newContent = newLines.join('\n');
          resolve({ file, newContent });
        }
      });
    }))))
    .then(contentObjects => Promise.all(contentObjects.map(contentObject => new Promise((resolve) => {
      fs.writeFile(contentObject.file, contentObject.newContent, (err) => {
        if (err) throw err;
        console.log(`Written ${contentObject.file}`);
        resolve(true);
      });
    }))))
    .then(() => {
      console.log('Did you survive?');
    });
}
