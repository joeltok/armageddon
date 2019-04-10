const fs = require('fs');
const path = require('path');

const recursive = require('recursive-readdir');
const fileExtension = require('file-extension');

let marker = 0;
let ignore;

if (process.env.NODE_ENV === 'test') {
  ignore = '.gitignore-standin';
} else {
  ignore = '.gitignore';
}

function replacer(match) {
  marker += 1;
  return `${match}console.log("ARMA${marker}");`;
}

function shower(pathToFolder) {
  const parent = pathToFolder || process.cwd();
  let pathsToIgnore = [];

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

  // extract all paths to ignore
  return recursive(parent).then((files) => {
    files.forEach((file) => {
      if (path.basename(file) === ignore) {
        let lines = fs.readFileSync(file, 'utf8');
        lines = lines.split('\n');
        lines = lines.filter(line => !!line);
        const fullPaths = lines.map(line => `${path.dirname(file)}/${line}`);
        pathsToIgnore = pathsToIgnore.concat(fullPaths);
      }
    });

    return true;
  })
    .then(() => recursive(parent, [ignoreGitIgnored])
      .then(jsFiles => Promise.all(jsFiles.map(file => new Promise((resolve) => {
      // read file into a string
        fs.readFile(file, 'utf8', (err, contents) => {
          const lines = contents.split('\n');

          if (err) {
            console.log(`${file}:`);
            console.log(err);
          } else {
          // search for specific pattern marking function definition
          // and add marker with console.log directly at the start
          // of the function.

            // function x( ) { }
            const re1 = /function\s*\w*\s*\(\s*(\w+){0,1}\s*(,\s*\w+\s*)*\)\s*\{/g;
            // ( ) => { }
            const re2 = /\(\s*(\w+){0,1}\s*(,\s*\w+\s*)*\)\s*=>\s*\{/g;

            let newLines1 = [];
            lines.forEach((line) => {
              const newLine = line.replace(re1, replacer).split('\n');
              newLines1 = newLines1.concat(newLine);
            });

            let newLines2 = [];
            newLines1.forEach((line) => {
              const newLine = line.replace(re2, replacer).split('\n');
              newLines2 = newLines2.concat(newLine);
            });

            const newContent = newLines2.join('\n');

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
      })))));
}

module.exports.shower = shower;
