#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');

var asteroid = require('./../lib/asteroid')
var prompts = require('../lib/prompts')
var ignore = require('../lib/ignore')

const args = minimist(process.argv.slice(2))

const armageddon = async () => {
  const targetArg = args._[0];
  if (!targetArg) {
    console.error('Default target path has been deprecated.')
    console.error('Please specify a target file or directory.')
    process.exit()
  } else if (!fs.existsSync(targetArg)) {
    console.error(`Target path does not exist: ${targetArg}.`)
    process.exit()
  }
  const targetPath = path.resolve(targetArg);

  await prompts.warnIrreversible()
  await prompts.backup()

  const gitignorePath = args['gitignore']
  const pathsFromGitIgnore = await ignore.gitignore(gitignorePath)

  await prompts.pathsToIgnore(pathsFromGitIgnore)
  await prompts.finalConfirmation(targetPath)

  asteroid.shower(targetPath, pathsFromGitIgnore)
}

armageddon()
