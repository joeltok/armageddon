var recursive = require('recursive-readdir')
var fileExtension = require('file-extension')

var marker = 0

module.exports.shower = function() {
	var parent = process.cwd()
	
	// get all file paths
	// filter out non-js files
	recursive(parent).then((files) => {
		var checked = []
		files.forEach((file) => {
			if (fileExtension(file) == 'js') {
				checked.push(file)
			}
		})
		return checked
	})
	// search for functions and append a console.log to them
	.then((checked) => {

	})

} 
