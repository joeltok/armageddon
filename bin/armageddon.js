#!/usr/bin/env node

var asteroid = require('./../lib/asteroid')
var prompt = require('prompt')
var yesno = require('yesno')
var path = require('path')

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
		console.log('Final confirmation. If you wish to proceed, please type in the name of your current working directory.')
		prompt.start()
		prompt.get(['name'], function(err, result) {
			if (path.basename(process.cwd()) != result.name) {
				console.log('You did not enter the correct name for your current working directory')
				process.exit()
			} else {
				resolve(true)
			}		
		})
	})
})
.then(() => {
	console.log('ARMAGEDDON!!')
	return asteroid.shower()
})
.then(() => {
	console.log('Did you survive?')
})
