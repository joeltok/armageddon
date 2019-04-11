#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

const prompts = require('../lib/prompts');
const ignore = require('../lib/ignore');
const inject = require('../lib/inject');

const args = minimist(process.argv.slice(2));

const armageddon = async () => {
  const targetArg = args._[0];
  if (!targetArg) {
    console.error('Default target directory has been deprecated.');
    console.error('Please specify a target directory.');
    process.exit();
  } else if (!fs.existsSync(targetArg)) {
    console.error(`Target directory does not exist: ${targetArg}.`);
    process.exit();
  }
  const targetPath = path.resolve(targetArg);

  await prompts.warnIrreversible();
  await prompts.backup();

  const gitignorePath = args.gitignore;
  const pathsFromGitIgnore = await ignore.gitignore(gitignorePath);

  await prompts.pathsToIgnore(pathsFromGitIgnore);
  await prompts.finalConfirmation(targetPath);

  inject(targetPath, pathsFromGitIgnore);
};

armageddon();
