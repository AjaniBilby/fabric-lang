const path = require('path');
const fs = require('fs');


let grammer = JSON.parse( fs.readFileSync(path.join(__dirname, './grammer.json'), 'utf8') );
for (let key in grammer.bracket){
	grammer.token[`bracket.${key}.open`]  = grammer.bracket[key][0];
	grammer.token[`bracket.${key}.close`] = grammer.bracket[key][1];
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

function Process(text){
	let out = {
		exports: [],
		import: [],
		class: [],
		directive: []
	};

	let tokens = Tokenize(text);
	console.log(tokens);

	return {};
}


module.exports = Process;

