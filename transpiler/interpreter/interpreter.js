/**
 * Interprets a variable definition from 'definition' or 'definition.assign' pattern
 * @param {Object} token
 */
function InterpVarDef(token, isPublic = false){
	let out = {
		// Type/referencing
		name : null,
		type : null,

		isSubject: false,
		modifier: [],

		// Meta type
		pointer     : false,
		upgradeable : false,
		public      : isPublic,

		// Debug info
		line : token[0].line || NaN,
		col  : token[0].col  || NaN,

		default: null
	}

	let offset = 0;

	// Get type meta
	if (token.data[0][offset] == "^"){
		out.upgradeable = true;
		offset++;
	}
	if (token.data[0][offset] == "@"){
		out.pointer = true;
		offset++;
	}


	// Get variable type name
	out.type = token.data[0].slice(offset);

	// Strip subject modifier
	//  Also gets variable name
	if (token.type == "definition.subject" || token.type == "definition.subject.assign"){
		out.isSubject = true;

		let len = token.data[2].length;
		for (let i=0; i<token.data[2].length; i++){
			if (token.data[2].data[i].type != "namespace"){
				console.error(`Error: Invalid subject modifier "${token.data[2].data[i].data}".`);
				console.error(`  line : ${token.data[2].data[i].line}`);
				console.error(`  col  : ${token.data[2].data[i].col}`);
				process.exit(1);
			}

			out.modifier.push(token.data[2].data[i].data);

			if (i+1 < len && token.data[2].data[i+1].type != "token.seperator"){
				console.error(`Error: Missing comma after subject modifier.`);
				console.error(`  line : ${token.data[2].data[i].line}`);
				console.error(`  col  : ${token.data[2].data[i].col}`);
				process.exit(1);

				continue;
			}
		}

		// Get variable name
		out.name = token.data[4];
	}else{
		// Get variable name
		out.name = token.data[1];
	}


	// Get variable defaults
	if (token.type == "definition.assign"){
		out.default = data[3];
	}else if (token.type == "definition.subject.assign"){
		out.default = data[6];
	}

	return out;
}





function InterpFunc  (pattern){
	let out = {
		name: pattern[1].data,

		returns: {
			name: "return",
			type: null,

			pointer     : false,
			upgradeable : false,

			line : pattern.data[0].line,
			col  : pattern.data[0].col
		},

		arguments: [],
		local:     [],

		code: pattern.data[3].data[0]
	}


	// Get return type
	if (pattern.data[0][0] == "@"){
		out.returns.type    = data[0].slice(1);
		out.returns.pointer = true;
	}

	// Get argument variables
	for (let arg of pattern.data[2]){
		returns.arguments.push(InterpVarDef(arg));
	}

	// Search code tree for local variable definitions
	function GetLocal(pattern){
		for (let pat of pattern.data){
			if (
				pat.type == "definition" || pat.type == "definition.assign" ||
				pat.type == "definition.subject" || pat.type == "definition.assignment.subject"
			){
				returns.local.push(InterpVarDef(pat));
			}else if (pat.type == "code"){
				GetLocal(pat.data[0]);
			}
		}
	}
	GetLocal(returns.code);

	return out;
}




function InterpClassMod(tokens){
	let modifier = {
		extends   : null,
		primative : null
	}

	// Read modifiers
	for (let item of tokens){
		if (item.name == "class.extend"){
			modifier.extends = {
				name : item.data[1],
				line : item.data[1].line,
				col  : item.data[1].col
			};
		}else if (item.name == "class.primative"){
			modifier.primative = {
				name : item.data[1],
				line : item.data[1].line,
				col  : item.data[1].col
			};
		}
	}
}

function InterpClassComp(patterns){
	let out = {
		attributes : [],
		methods    : []
	};

	let isPublic = false;

	// Interp components
	for (let item of patterns){
		if (item.type == "modifier.public"){
			isPublic = true;
			continue;
		}
		if (item.type == "modifier.private"){
			isPublic = false;
			continue;
		}

		if (
			item.type == "definition" || item.type == "definition.assignment" ||
			item.type == "definition.subject" || item.type == "definition.assignment.subject"
		){
			out.attributes.push(InterpVarDef(item, isPublic));
		}else	if (item.type == "function"){
			out.methods.push(InterpFunc(item));
		}

		console.error(`Error: Invalid pattern type "${item.type}" within class.`);
		console.error(`  line : ${item.line}`);
		console.error(`  col  : ${item.col}`);
		process.exit(1);
	}

	return out;
}

function InterpClass (pattern){
	let out = {
		name       : pattern.data[1],
		modifier   : InterpClassMod(pattern.data[2]),

		referal    : [],

		attributes : [],
		methods    : [],

		line : pattern.data[0].line,
		col  : pattern.data[0].col
	};

	let cache = InterpClassComp(pattern.data[3]);
	out.attributes = cache.attributes;
	out.methods = cache.methods;

	return out;
}
function InterpSub   (pattern){
	let out = {
		name      : pattern.data[1],
		modifier  : InterpClassMod(pattern.data[3]),

		referalMarker : [],

		attributes : [],
		methods    : [],

		line: pattern.data[0].line,
		col : pattern.data[0].col
	};

	// Save referal marker terms, and check for any invalid ones
	for (let item of pattern.data[2]){
		if (item.type == "namespace"){
			referalMarker.push(item.data);
			continue;
		}

		console.error("Error: Invalid subject referal. Referals must be a single word.");
		console.error(`  line : ${item.line}`);
		console.error(`  col  : ${item.col}`);
		process.exit(1);
	}

	let cache = InterpClassComp(pattern.data[4]);
	out.attributes = cache.attributes;
	out.methods = cache.methods;

	return out;
}



module.exports = {
	Function: InterpFunc,
	Class: InterpClass,
	Subject: InterpSub
};
