const prompt = require('prompt');
const yesno = require('yesno');
const path = require('path');

module.exports = {
  warnIrreversible() {
    return new Promise((resolve) => {
      yesno.ask('Note that use of this module could do irreversible damage to your code base if you are not careful. Do you wish to proceed? (Y/N)', true, (ok) => {
        if (ok) {
          resolve(true);
        } else {
          console.log('Aborted.');
          process.exit();
        }
      });
    });
  },

  backup() {
    return new Promise((resolve) => {
      yesno.ask('Have you backed up your code base, or saved all your current changes into some kind of version control system? (Y/N)', true, (ok) => {
        if (ok) {
          resolve(true);
        } else {
          process.exit();
        }
      });
    });
  },

  pathsToIgnore(pathsFromGitIgnore = []) {
    return new Promise((resolve) => {
      if (pathsFromGitIgnore.length === 0) {
        console.log(' We will not be ignoring any files or folders in your target.');
      } else {
        console.log(`We will be ignoring the following files and/or folders:\n\n${pathsFromGitIgnore.join('\n')}\n`);
      }
      yesno.ask('Should this be the case? (Y/N)', true, (ok) => {
        if (ok) {
          resolve(true);
        } else {
          process.exit();
        }
      });
    });
  },

  finalConfirmation(targetPath) {
    return new Promise((resolve) => {
      console.log('Final confirmation. If you wish to proceed, please type in the name of your target file or folder.');
      prompt.start();
      prompt.get(['name'], (err, result) => {
        const targetedName = path.basename(targetPath);
        if (targetedName !== result.name) {
          console.log(`The name you entered was ${result.name}, but your targeted file or folder was ${targetedName}. Terminating.`);
          process.exit();
        } else {
          resolve(true);
        }
      });
    });
  },
};
