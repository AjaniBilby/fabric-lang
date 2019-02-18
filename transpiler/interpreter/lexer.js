const Interpret = require('./interpreter.js');

const path = require('path');
const fs = require('fs');


let grammer = JSON.parse( fs.readFileSync(path.join(__dirname, './grammer.json'), 'utf8') );
for (let key in grammer.bracket){
	grammer.token[`bracket.${key}.open`]  = grammer.bracket[key][0];
	grammer.token[`bracket.${key}.close`] = grammer.bracket[key][1];
}

function GetPatternsByNames(names){
	let patterns = [];
	for (let pattern of grammer.pattern){
		if (names.indexOf(pattern.name) != -1){
			patterns.push(pattern);
		}
	}

	// Make sure longer patterns are tested first
	patterns = patterns.sort((a, b)=>{
		if (a.match.length < b.match.length){
			return 1;
		}else if (a.match.length > b.match.length){
			return -1;
		}else{
			return 0;
		}
	});

	return patterns;
}


function Tokenize(text){
	var out = [];
	text = text.replace(/\n\r/g, "\n").replace(/\t/g, ' ');

	var col   = 1;
	var line  = 1;
	var i     = 0;

	var lastI   = 0;
	var lastCol = 1;

	function PushNamespace(){
		if (lastI == i){
			return;
		}

		var chunk = text.slice(lastI, i);
		var stack = "";
		var j = 0;

		function PushChunk(){
			if (stack.length > 0){
				let isKeyword = grammer.keyword.indexOf(stack) != -1;

				out.push({
					type: isKeyword ? `keyword.${stack}` : "namespace",
					data: stack,

					col  : lastCol+j-stack.length,
					line : line,
				});

				stack = "";
			}
		}

		for (j=0; j<chunk.length; j++){
			if (chunk[j] == " "){
				if (stack.length > 0){
					PushChunk();
				}

				continue;
			}

			stack += chunk[j];
		}
		PushChunk();
	}

	// Read tokens
	outer: while(i<text.length){
		if (text[i] == "\n"){
			PushNamespace();
			col = 1;
			line++;

			lastI   = i+1;
			lastCol = 1;
			i++;
			continue;
		}

		// Ignore white space before tokens
		if (text[i] == "\t" || text[i] == " "){
			PushNamespace();
			col++;

			lastI   = i;
			lastCol = col;
			i++;
			continue outer;
		}

		// Skip comments
		for (let item of grammer.comment){
			if (text.substr(i, item[0].length) == item[0]){
				PushNamespace();
				let tempStart = i;
				i   += item[0].length;
				col += item[0].length;

				// Move the cursor forward to the end of the comment
				while (i < text.length){
					if (text[i] == "\n"){
						line++;
						col = 1;
					}

					// Put here instead of while to catch any new lines
					if (text.substr(i, item[1].length) == item[1]){
						break;
					}

					i++;
					col++;
				}

				i   += item[1].length;
				col += item[1].length;

				lastI   = i;
				lastCol = col;
				continue outer;
			}
		}

		// Read in string
		for (let item of grammer.string){
			if (text.substr(i, item.match.length) == item.match){
				PushNamespace();

				let member = {
					type : `string.${item.name}`,
					data : "",
					col  : col,
					line : line,
				};

				i   += item.match.length;
				col += item.match.length;

				// Move the cursor forward to the end of the comment
				while (i < text.length){
					if (text[i] == "\n"){
						line++;
						col = 1;
					}

					// Put here instead of while to catch any new lines
					if (text.substr(i, item.match.length) == item.match){
						break;
					}

					if (text[i] == "\\"){  // Handle escaped characters
						i++;

						// Invalid escaping
						if (i >= text.length){
							continue;
						}

						if       (text[i] == "t"){
							member.data += "\t";
						}else if (text[i] == "n"){
							member.data += '\n';
						}else if (text[i] == "r"){
							member.data += '\r';
						}else if (text[i] == "a"){
							member.data += '\a';
						}else if (text[i] == "f"){
							member.data += '\f';
						}else if (text[i] == "b"){
							member.data += '\b';
						}else if (text[i] == "\\"){
							member.data += '\\';
						}else{
							member.data += text[i];
						}
					}else{
						member.data += text[i];
					}

					i++;
					col++;
				}
				i   += item.match.length;
				col += item.match.length;

				out.push(member);

				lastI   = i;
				lastCol = col;
				continue outer;
			}
		}

		// Process tokens
		for (let key in grammer.token){
			if (text.substr(i, grammer.token[key].length) == grammer.token[key]){
				PushNamespace();

				out.push({
					type: `token.${key}`,
					data: grammer.token[key],

					col: col,
					line: line
				});

				i += grammer.token[key].length;
				col += grammer.token[key].length;

				lastI = i;
				lastCol = col;
				continue outer;
			}
		}

		col++;
		i++;
	}
	PushNamespace();

	return out;
}

function Patternize(tokens, patterns, filename = "Unknown"){
	// Get pattern references from names
	patterns = GetPatternsByNames(patterns);

	let out = [];

	outer: for (let i=0; i<tokens.length; i++){
		let best = {
			type: null,
			percent: 0,
			data: [],
			tokens: 0
		};

		lPat: for (let j=0; j<patterns.length; j++){
			let offset = i;
			let progress = 0;
			let match = new Array(patterns[j].match.length);
			let terms = patterns[j].match;
			match.fill(null, 0);

			lMatch: for (let k=0; k<patterns[j].match.length; k++){
				// If there are not enough tokens to complete this pattern
				if (offset >= tokens.length){
					break lMatch;
				}

				if       (patterns[j].match[k].substr(0, 8) == "keyword."){
					if (patterns[j].match[k] == tokens[offset].type){
						match[k] = [tokens[offset]];
						offset++;
						progress++;
						continue lMatch;
					}
				}else if (patterns[j].match[k]              == "namespace"){
					if ("namespace" == tokens[offset].type){
						match[k] = [tokens[offset]];
						offset++;
						progress++;
						continue lMatch;
					}
				}else if (patterns[j].match[k].substr(0, 6) == "token."){
					if (patterns[j].match[k] == tokens[offset].type){
						match[k] = [tokens[offset]] ;
						offset++;
						progress++;
						continue lMatch;
					}
				}else if (patterns[j].match[k].substr(0, 7) == "string."){
					if (patterns[j].match[k] == tokens[offset].type){
						match[k] = [tokens[offset]];
						offset++;
						progress++;
						continue lMatch;
					}
				}else if (patterns[j].match[k].substr(0, 8) == "bracket."){
					let phrase = tokens[offset].type.split('.');
					phrase = phrase.splice(1, 2).join('.'); // Get bracket.{type}

					if (patterns[j].match[k] == phrase){
						let cache = [];
						let depth = 1;
						let op = 'token.'+phrase+'.open';
						let ed = 'token.'+phrase+'.close';

						offset++;
						while (offset < tokens.length){
							if (tokens[offset].type == op){
								depth++;
							}
							if (tokens[offset].type == ed){
								depth--;
							}

							if (depth == 0){
								break;
							}
							cache.push(tokens[offset]);
							offset++;
						}

						// If a closing point was actually found
						if (tokens[offset].type == ed){
							match[k] = cache;
							offset++;
							progress++;
							continue lMatch;
						}
					}
				}else if (patterns[j].match[k] == "*"){
					// If the wild char is the last matching term
					if (k+1 >= patterns[j].match.length){
						match[k] = tokens.slice(offset);
						offset = tokens.length;
						progress++;
						continue lMatch;
					}

					// What is the end point for this wild consumption?
					let end = patterns[j].match[k+1];
					if (end == "*"){
						console.error(`Error: Internal programming error, a wildchar exists after a wildchar in grammer`);
						process.exit(1);
					}

					if (end.substr(0, 7) == "bracket"){
						end += ".open";
					}

					// Otherwise consume until the next token is reached
					let cache = [];
					while (offset < tokens.length){
						if (tokens[offset].type == end){
							break;
						}

						cache.push(tokens[offset]);
						offset++;
					}

					match[k] = cache;
					progress++;
					continue lMatch;
				}

				match[k] = null;
			}

			// Is this match a better match than the existing option?
			progress /= patterns[j].match.length;
			if (best.type == null || progress > best.percent){
				best.data    = match;
				best.percent = progress;
				best.type    = patterns[j].name;
				best.tokens  = offset-i;
				best.terms   = terms;

				// The best pattern has been found,
				// No point checking for any better matches
				if (best.percent == 1){
					// Generate sub patterns
					if (patterns[j].sub){
						for (let k=0; k<patterns[j].sub.length; k++){
							if (patterns[j].sub[k] !== null){
								best.data[k] = Patternize(best.data[k], patterns[j].sub[k], filename);
							}
						}
					}

					break lPat;
				}
			}
		}

		if (best.percent == 1){
			out.push({
				type: best.type,
				data: best.data
			});
			i += best.tokens-1;
			continue outer;
		}else{
			console.error(`Error: Unexpected token ${tokens[i].type}(${tokens[i].data}). Where you trying to make "${best.type}?"`);
			console.error(`  file: ${filename}`);
			console.error(`  line: ${tokens[i].line}`);
			console.error(`  col : ${tokens[i].col}`);
			console.error(`  pattern;`);
			for (let i=0; i<best.data.length; i++){
				console.error(`   ${best.data[i] != null ? "    ": "miss"}  ${best.terms[i]}`);
			}
			process.exit(1);
		}

		out.push({
			type : tokens[i].type,
			col  : tokens[i].col,
			line : tokens[i].line,
			data : tokens[i].data
		});
	}

	return out;
}



function Process(text, filename){
	let out = {
		expose   : [],
		import   : [],
		class    : [],
		directive: []
	};

	let patterns = Patternize(Tokenize(text), grammer.root, filename);
	for (let pattern of patterns){
		if       (pattern.type == "expose"){
			out.expose.push({
				name: pattern.data[1][0].data,
				line: pattern.data[0][0].line
			});
			continue;
		}else if (pattern.type == "import"){
			if (pattern.data.length == 3){
				out.import.push({
					from: pattern.data[1][0].data,
					as: "*",
					line: pattern.data[0][0].line
				});
			}else{
				out.import.push({
					from: pattern.data[1][0].data,
					as  : pattern.data[3][0].data,
					line: pattern.data[0][0].line
				});
			}

			continue;
		}else if (pattern.type == "class"){
			out.class.push    ( Interpret.Class(pattern) );
		}else if (pattern.type == "function"){
			out.directive.push( Interpret.Function(pattern) );
		}
	}

	return out;
}


module.exports = {
	Interpret: Process
};

