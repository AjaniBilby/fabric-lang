const path = require('path');
const fs = require('fs');


let grammer = JSON.parse( fs.readFileSync(path.join(__dirname, './grammer.json'), 'utf8') );
for (let key in grammer.bracket){
	grammer.token[`bracket.${key}.open`]  = grammer.bracket[key][0];
	grammer.token[`bracket.${key}.close`] = grammer.bracket[key][1];
}
let rootPatterns = [];
for (let item of grammer.pattern){
	if (grammer.root.indexOf(item.name) !== -1){
		rootPatterns.push(item);
	}
}


function Tokenize(text){
	var out = [];
	text = text.replace(/\n\n/g, "\n");

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
				let isKeyword = grammer.keyword.indexOf(stack);

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

				i += key.length;
				col += key.length;

				lastI = i;
				lastCol = col;
				continue outer;
			}
		}

		col++;
		i++;
	}

	return out;
}

function Patternize(tokens, patterns = rootPatterns){
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
			let match = [];

			lMatch: for (let k=0; k<patterns[j].match.length; k++){
				// If there are not enough tokens to complete this pattern
				if (offset >= tokens.length){
					break lMatch;
				}

				if       (patterns[j].match[k].substr(0, 7) == "keyword"){
					if (patterns[j].match[k] == tokens[offset].type){
						match.push( [tokens[offset]] );
						offset++;
						progress++;
						continue lMatch;
					}
				}else if (patterns[j].match[k].substr(0, 5) == "token"){
					if (patterns[j].match[k] == tokens[offset].type){
						match.push( [tokens[offset]] );
						offset++;
						progress++;
						continue lMatch;
					}
				}else if (patterns[j].match[k].substr(0, 6) == "string"){
					if (patterns[j].match[k] == tokens[offset].type){
						match.push( [tokens[offset]] );
						offset++;
						progress++;
						continue lMatch;
					}
				}else if (patterns[j].match[k].substr(0, 7) == "bracket"){
					let phrase = tokens[offset].type.split('.');
					phrase = phrase.splice(0, 2).join('.'); // Get bracket.{type}

					if (patterns[j].match[k] == phrase+".open"){
						let cache = [];
						let depth = 1;
						let op = phrase+'.open';
						let ed = phrase+'.close';

						data.data = [];
						offset++;
						while (offset < patterns.length){
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
							match.push(cache);
							offset++;
							progress++;
							continue lMatch;
						}
					}
				}else if (patterns[j].match[k] == "*"){

				}
			}

			// Is this match a better match than the existing option?
			progress /= patterns[j].match.length;
			if (progress > best.percent || best.type == null){
				best.data    = match;
				best.percent = progress;
				best.type    = patterns[j].name;
				best.tokens    = offset;

				// The best pattern has been found,
				// No point checking for any better matches
				if (best.percent == 1){
					break lPat;
				}
			}
		}

		if (best.percent = 1){
			out.push({
				type: best.type,
				data: best.data
			});
			i += best.tokens-1;
			continue outer;
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

function Process(text){
	let out = {
		exports: [],
		import: [],
		class: [],
		directive: []
	};

	let tokens = Tokenize(text);

	let patterns = Patternize(tokens, rootPatterns);
	console.log('patterns', patterns);

	return {};
}


module.exports = Process;

