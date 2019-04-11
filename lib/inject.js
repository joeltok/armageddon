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

function matchAndInject(lines, matchersArr, replacerFunc) {
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

function isFile(targetPath) {
  return fs.lstatSync(targetPath).isFile();
}

function isInGitignore(targetPath, gitignoreFiles) {
  return gitignoreFiles.indexOf(targetPath) > -1
}

module.exports = async (targetPath, gitignoreFiles = []) => {
  console.log('ARMAGEDDON!!');

  let jsFiles;
  if (isFile(targetPath)) {
    if (isInGitignore(targetPath, gitignoreFiles)) {
      console.error(`Targeted file ${targetPath} is found in gitignore.`)
      console.error(`Terminating write to be on the safe side.`)
      process.exit()
    } else {
      jsFiles = [targetPath]
    }
  } else {
    const ignoreFilter = generateIgnoreFilter(gitignoreFiles, ['.js']);
    jsFiles = await recursive(targetPath, [ignoreFilter]);
  }

  await Promise.all(jsFiles.map(async (file) => {
    const lines = await readFileLines(file)
    const newLines = matchAndInject(lines, matchers, replacer)
    return writeFileLines(file, newLines.join('\n'))
  }))

  console.log('Did you survive?');
};
