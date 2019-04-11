const path = require('path');
const fs = require('fs');

module.exports = {
  gitignore(gitignorePathRelative) {
    let ignorePath = gitignorePathRelative;

    if (!ignorePath) {
      ignorePath = `${process.cwd()}/.gitignore`;
      console.log('No --gitignore-path specified.');
      console.log(`Defaulting to .gitignore in current working directory at ${ignorePath}`);
    }

    ignorePath = path.resolve(ignorePath);
    if (!fs.existsSync(ignorePath)) {
      console.error(`No ignore file found at ${ignorePath}.`);
      console.error('No files will be ignored.');
      return [];
    }

    let lines = fs.readFileSync(ignorePath, 'utf8');
    lines = lines.split('\n');
    lines = lines.filter(line => !!line);
    const fullPaths = lines.map(line => path.resolve(path.dirname(ignorePath), line));

    // ignore the .gitignore itself
    fullPaths.push(ignorePath)

    return fullPaths;
  },
};


// defaulting to current directory .gitignore
