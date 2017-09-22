echo "
ignore
iamnothere.js
" > .gitignore-standin

echo " 
var bluntA = function() {
}

var bluntB = (water) => {
	var x = 4
}

var bluntC = ( fighter, pen  , hurrah)=>{}

var bluntD = water => console.log(water)
" > blunt.js

echo "
// var h = function() {
//}

var sharpA = function( hurrah) {
	console.log('eat')
	require('fs')

}
" > sharp.js

rm -rf deeper
mkdir deeper
echo "
function() {
	


	return 1+1
}

module.exports = (gant) => {
  if (true) {
		return 'yay'
	} else {
		return 'nay'
	}
}
" >> deeper/down.js

rm -rf ignore
mkdir ignore
touch ignore/a.js
touch ignore/b.py

echo "console.log('l')" > iamnothere.js
