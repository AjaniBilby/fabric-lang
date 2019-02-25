let prcedence = [
	"token.add",        "token.subtract",
	"token.multiply",   "token.divide",
	"token.modulo",

	"token.greatEqual", "token.lessEqual",
	"token.greater",    "token.lesser",
	"token.appoxEqual", "token.equalTo",
	"token.notEqual",   "token.notApprox",

	"token.and",        "token.or",
];



function Consume(tokens){
	// Consume brackets into chunks
	for (let i=0; i<tokens.length; i++){
		if (tokens[i].type.substr(0, 8) == "bracket."){
			// Get the opening and closing bracket names
			let down = tokens[i];
			let up = tokens[i].type.split('.').splice(0, 2).join('.') + ".close";

			// Find the corrisponding closing bracket
			let j = i+1;
			let depth = 1;
			let k = j;
			let found = false;
			while (k < tokens.length){
				if (tokens[i].type == up){
					depth--;
				}else if (tokens[i].type == down){
					depth++;
				}

				if (depth == 0){
					found = true;
					break;
				}
			}

			let inner = tokens.slice(j, found ? k-1: k);
			tokens.splice(j, k-j);
			tokens[i] = {
				action: "bracket",
				a: inner,
				b: []
			};
		}
	}

	// Consume nots
	for (let i=0; i<tokens.length; i++){
		if (tokens[i].type == "token.not"){
			tokens[i] = {
				action: "not",
				a: [],
				b: tokens[i+1].action == "bracket" ? tokens[i+1].a : tokens[i+1]
			};
			tokens[i].b = Comsume(tokens[i].b);
		}
	}

	for (let opperation of prcedence){
		let action = opperation.split('.')[1];

		for (let i=0; i<tokens.length; i++){
			if (i == 0){
				continue;
			}

			if (tokens[i] == opperation){
				tokens[i-1] = {
					action: action,
					a: tokens[i-1],
					b: tokens[i+1]
				};
				tokens[i-1].a = Consume(tokens[i-1].a);
				tokens[i-1].b = Consume(tokens[i-1].b);

				tokens.splice(i, 2);
				continue;
			}
		}
	}

	return tokens;
}
