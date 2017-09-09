var fs = require('fs')

var recursive = require('recursive-readdir')
var fileExtension = require('file-extension')

var marker = 1

module.exports.shower = function() {
	var parent = process.cwd()
	
	// get all file paths
	// filter out non-js files
	return recursive(parent).then((files) => {
		var jsFiles = []
		files.forEach((file) => {
			if (fileExtension(file) == 'js') {
				jsFiles.push(file)
			}
		})
		return jsFiles
	})
	// search for functions and append a console.log to them
	.then((jsFiles) => {
		return Promise.all(jsFiles.map((file) => {
			return new Promise((resolve, reject) => {
			
				// read file into a string
				fs.readFile(file, 'utf8', function(err, contents) {

					// search for specific pattern marking function definition
					// and add marker with console.log directly at the start
					// of the function.

					// function x( ) { }
					var re1 = /function\s*\w*\s*\(\s*(\w+){0,1}\s*(,\s*\w+\s*)*\)\s*\{/g
					// ( ) => { }
					var re2 = /\(\s*(\w+){0,1}\s*(,\s*\w+\s*)*\)\s*=>\s*\{/g

					function replacer(match) {
						return match+'console.log("ARMA' + marker++ + '");'
					}

					var newContent = contents.replace(re1, replacer)
					var newContent = newContent.replace(re2, replacer)

					resolve({file: file, newContent: newContent})
				})
			})

		}))

	})
	.then((contentObjects) => {
		return Promise.all(contentObjects.map((contentObject) => {
			return new Promise((resolve, reject) => {
				fs.writeFile(contentObject.file, contentObject.newContent, (err) => {
					if (err) throw err;
					console.log('Written ' + contentObject.file)
					resolve(true)
				})
			})
		}))
	})
} 
