var fs = require('fs')
var path = require('path')

var recursive = require('recursive-readdir')
var fileExtension = require('file-extension')

var marker = 1

if (process.env.NODE_ENV == 'test') {
	var ignore = '.gitignore-standin';
} else {
	var ignore = '.gitignore';
}

module.exports.shower = function() {
	var parent = process.cwd()

	var pathsToIgnore = []
	
	function ignoreGitIgnored(file, stats) {

		// check if in paths to ignore		
		if (pathsToIgnore.indexOf(file) != -1) {
			return true
		}

		// ignore non-js filess
		if (stats.isFile() && fileExtension(file) != 'js') {
			return true
		}
	
	}

	// extract all paths to ignore
	return recursive(parent).then((files) => {

		files.forEach((file) => {
			if (path.basename(file) == ignore) {
				var lines = fs.readFileSync(file, 'utf8')
				lines = lines.split('\n')
				lines = lines.filter((line) => {
					return !!line
				})
				var fullPaths = lines.map((line) => {
					return path.dirname(file) + '/' + line
				})
				pathsToIgnore = pathsToIgnore.concat(fullPaths)
			}
		})

		return true

	})
	.then(() => {	

		return recursive(parent, [ignoreGitIgnored]).then((jsFiles) => {

			return Promise.all(jsFiles.map((file) => {
				return new Promise((resolve, reject) => {
			
					// read file into a string
					fs.readFile(file, 'utf8', function(err, contents) {

						if (err) {
							console.log(file + ':')
							console.log(err)
						} else {

							// search for specific pattern marking function definition
							// and add marker with console.log directly at the start
							// of the function.

							// function x( ) { }
							var re1 = /function\s*\w*\s*\(\s*(\w+){0,1}\s*(,\s*\w+\s*)*\)\s*\{/g
							// ( ) => { }
							var re2 = /\(\s*(\w+){0,1}\s*(,\s*\w+\s*)*\)\s*=>\s*\{/g

							function replacer(match) {
								return match+'\n\nconsole.log("ARMA' + marker++ + '");\n\n'
							}

							var newContent = contents.replace(re1, replacer)
							var newContent = newContent.replace(re2, replacer)

							resolve({file: file, newContent: newContent})
						}
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

	})

} 

