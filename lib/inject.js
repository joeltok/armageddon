const fs = require('fs');

const recursive = require('recursive-readdir');
const fileExtension = require('file-extension');

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

function replaceByMatching(lines, matchers, replacer) {
  return matchers.reduce((prevLines, matcher) => {
    let newLines = [];
    prevLines.forEach((line) => {
      const newLine = line.replace(matcher, replacer).split('\n');
      newLines = newLines.concat(newLine);
    });
    return newLines;
  }, lines)
}

function inject(pathToFolder, pathsToIgnore = []) {
  console.log('ARMAGEDDON!!');

  const parent = pathToFolder;

  function ignoreGitIgnored(file, stats) {
    // check if in paths to ignore
    if (pathsToIgnore.indexOf(file) !== -1) {
      return true;
    }

    // ignore non-js filess
    if (stats.isFile() && fileExtension(file) !== 'js') {
      return true;
    }

    return false;
  }

  return recursive(parent, [ignoreGitIgnored])
    .then(jsFiles => Promise.all(jsFiles.map(file => new Promise((resolve) => {
    // read file into a string
      fs.readFile(file, 'utf8', (err, contents) => {
        const lines = contents.split('\n');

        if (err) {
          console.log(`${file}:`);
          console.log(err);
        } else {
          const newLines = replaceByMatching(lines, matchers, replacer)
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

module.exports = inject;
