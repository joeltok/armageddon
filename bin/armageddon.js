#!/usr/bin/env node

var asteroid = require('./../lib/asteroid')
var prompt = require('prompt')
var yesno = require('yesno')
var path = require('path')
var fs = require('fs')

const targetArg = process.argv[2];
if (!targetArg) {
  console.error('Please specify a target file or directory.')
  process.exit()
} else if (!fs.existsSync(targetArg)) {
  console.error(`Target path does not exist: ${targetArg}.`)
  process.exit()
}
const targetPath = path.resolve(targetArg);

new Promise((resolve, reject) => {
	yesno.ask('Are you sure you want to proceed? Use of this module could do irreversible damage to your code base if you are not careful. (Y/N)', true, function(ok) {
		if (ok) {
			resolve(true)
		} else {
			console.log('Please do so first being continuing.')
			process.exit()
		}
	})
})
.then(() => {
	return new Promise((resolve, reject) => {
		yesno.ask('Have you backed up your code base, or saved all your current changes into some kind of version control system? (Y/N)', true, function(ok) {
			if (ok) {
				resolve(true)
			} else {
				process.exit()
			}
		})
	})
})
.then(() => {
	return new Promise((resolve, reject) => {
		console.log('Final confirmation. If you wish to proceed, please type in the name of your target file or folder.')
		prompt.start()
		prompt.get(['name'], function(err, result) {
      const targetedName = path.basename(targetPath);
			if (targetedFolder != result.name) {
        console.log(`The name you entered was ${result.name}, but your targeted file or folder was ${targetedName}. Terminating.`)
				process.exit()
			} else {
				resolve(true)
			}
		})
	})
})
.then(() => {
	console.log('ARMAGEDDON!!')
	return asteroid.shower(targetPath)
})
.then(() => {
	console.log('Did you survive?')
})
