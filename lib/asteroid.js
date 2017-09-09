var fs = require('fs')

var recursive = require('recursive-readdir')
var fileExtension = require('file-extension')

var marker = 0

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
		
console.log(jsFiles)

		return Promise.all(jsFiles.map((file) => {
			return new Promise((resolve, reject) => {
			
				// read file into a string
				fs.readFile(file, 'utf8', function(err, contents) {
					console.log(contents)

					// search for specific pattern marking function definition



					// add marker to the spot directly at the start of the function

					// replace file with new string
				
					resolve(true)
				})
			})

		}))

	})

} 
