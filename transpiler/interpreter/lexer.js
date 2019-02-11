const path = require('path');
const fs = require('fs');

const Pattern = require('./pattern.js');



/*-----------------------------------------------
	Generate the lexer tree
-----------------------------------------------*/
let pattern = [];
let raw = JSON.parse( fs.readFileSync(path.join(__dirname, './structure.json'), "utf8") );
for (let key in raw.pattern){
	raw.pattern[key].name = key;
	pattern.push(new Pattern(pattern, raw.pattern[key]));
}




function Process(text){
	let structure = {};
	text = text.replace(/\n\r/g, '\n');


	return structure;
};



module.exports = Process;
