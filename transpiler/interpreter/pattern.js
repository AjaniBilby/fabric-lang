const MatchType = {
	0: "exact",   exact: 0,
	1: "white",   white: 1,
	2: "bracket", bracket: 2
};
const WHITESPACE = " \t\n";

class Rule{
	constructor(owner, fact, subpattern){
		this.owner = owner;
		this.sub = subpattern || [];
		this.optional = fact[0] == "?";

		if (this.optional){
			fact = fact.slice(1);
		}
		fact = fact.split(' ');

		// Determine type
		if       (fact[0] == "exact"){
			this.type = MatchType.exact;
		}else if (fact[0] == "white"){
			this.type = MatchType.white;
		}else if (fact[0] == "bracket"){
			this.type = MatchType.bracket;
		}

		fact.splice(0, 1);
		fact = fact.join(' ');
		if       (this.type == MatchType.exact){
			this.phrase = fact;
		}else if (this.type == MatchType.white){
			this.phrase = WHITESPACE;
		}else if (this.type == MatchType.bracket){
			this.phrase = fact;
		}
	}

	match(string){
		if (this.type == MatchType.exact){
			if (string.substr(0, this.phrase.length) == this.phrase){
				return this.phrase;
			}
		}

		if (this.type == MatchType.white){
			let i=0;
			while (WHITESPACE.indexOf(string[i]) != -1){
				i++;
			}

			return string.substr(0, i);
		}

		if (this.type == MatchType.bracket){
			let i = 0;
			if (string[i] == this.phrase[0]){
				if (this.phrase[0] == this.phrase[1]){ // String
					i++;
					while (i < string.length){
						if (string[i] == this.phrase[0]){
							break;
						}
						// Escape the next object
						if (string[i] == "\\"){
							continue;
						}

						i++;
					}

				}else{                               // Normal bracket
					i++;
					let depth = 1;

					while (depth > 0){
						if (string[i] == this.phrase[0]){
							depth++;
						}else if (string[i] == this.phrase[1]){
							depth--;
						}
					}
				}

				// Check the close point was met
				if (string[i] != this.phrase[1]){
					return null;
				}else {
					return string.substr(0, i);
				}
			}
		}

		// If this is optional then it always succeeds to capture at least 0 chars
		if (this.optional){
			return "";
		}
		return null;
	}
}





class Pattern{
	constructor(list, data){
		this.name = data.name;
		this.others = list;

		this.rule = [];
		for (let i=0; i<data.match.length; i++){
			if (!data.subpattern){
				data.subpattern = [];
			}
			this.rule.push(new Rule(this, data.match[i], data.subpattern[i] || null))
		}
	}

	/**
	 * Get a reference to another pattern by name
	 * @param {String} name
	 */
	FindOther(name){
		for (let i=0; i<this.others.length; i++){
			if (this.others[i].name == name){
				return this.others[i];
			}
		}

		return null;
	}
}


module.exports = Pattern;
