const lexer = require('./../../interpreter/lexer.js');

function Interpret(data, filename){
	let tokens = lexer.Interpret(data, filename);
	let factors = null;

	return factors;
}



module.exports = {
	summary: Interpret
}
