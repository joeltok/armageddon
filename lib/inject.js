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
];

function scanAndInject(lines, matchersArr, replacerFunc) {
  return matchersArr.reduce((prevLines, matcher) => {
    let newLines = [];
    prevLines.forEach((line) => {
      const newLine = line.replace(matcher, replacerFunc).split('\n');
      newLines = newLines.concat(newLine);
    });
    return newLines;
  }, lines);
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

    return false;
  };
}

async function readFileLines(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, contents) => {
      if (err) reject(err);
      resolve(contents.split('\n'))
    })
  })
}

async function writeFileLines(file, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, content, (err) => {
      if (err) reject(err);
      console.log(`Written ${file}`);
      resolve(true);
    });
  })
}

module.exports = async (pathToFolder, gitignoreFiles = []) => {
  console.log('ARMAGEDDON!!');
  const ignoreFilter = generateIgnoreFilter(gitignoreFiles, ['.js']);

  const jsFiles = await recursive(pathToFolder, [ignoreFilter]);

  await Promise.all(jsFiles.map(async (file) => {
    const lines = await readFileLines(file)
    const newLines = scanAndInject(lines, matchers, replacer)
    return writeFileLines(file, newLines.join('\n'))
  }))

  console.log('Did you survive?');
};
