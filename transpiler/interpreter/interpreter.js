function InterpFunction(pattern){
	let func = {
		name: pattern.data[1][0].data,
		line: pattern.data[0][0].line,
		return: pattern.data[0][0].data,

		argument : [],
		local    : [],

		code: pattern.data[3]
	};

	function GetLocalVars(patterns){
		for (let item of patterns){
			if (item.type == "definition.assign" || item.type == "definition"){
				let attr = {
					name: item.data[1][0].data,
					type: null,

					upgradeable: false,
					pointer    : false,
					public     : false,
					default    : null,

					line: item.data[0][0].line,
					col : item.data[0][0].col
				};

				// Get type and modifiers
				if (item.data[0][0].data[0] == "@"){
					item.data[0][0].data = item.data[0][0].data[0].slice(1);
					attr.pointer = true;
				}
				attr.type = item.data[0][0].data;

				func.local.push(attr);
				continue;
			}

			if (typeof(item.data) == "object"){
				for (let section of item.data){
					GetLocalVars(section)
				}
			}
		}
	}

	for (let item of pattern.data[2]){
		let arg = {
			name: item.data[1][0].data,
			type: null,

			upgradeable: false,
			pointer    : false,
			public     : true,
			default    : null,

			line: item.data[0][0].line,
			col : item.data[0][0].col
		};

		// Get type and modifiers
		if (item.data[0][0].data[0] == "^"){
			item.data[0][0].data[0] = item.data[0][0].data.slice(1);
			arg.upgradeable = true;
		}
		if (item.data[0][0].data[0] == "@"){
			item.data[0][0].data[0] = item.data[0][0].data.slice(1);
			arg.pointer = true;
		}
		arg.type = item.data[0][0].data;

		// Get default value if it has one
		if (item.type == "definition.assign"){
			arg.default = item.data[3][0];
		}

		func.argument.push(arg);
	}

	GetLocalVars(func.code);

	return func;
}

function InterpClass(pattern){
	let inherit = null;
	let inner;
	if (pattern.data.length == 5){
		inherit = pattern.data[3][0].data;
		inner = pattern.data[4];
	}else{
		inner = pattern.data[2];
	}

	let struct = {
		name    : pattern.data[1][0].data,
		extends : inherit,

		attribute: [],

		line: pattern.data[0][0].line,

		behaviour: []
	};

	let isPublic = true;
	for (let item of inner){
		if (item.type == "modifier.public"){
			isPublic = true;
			continue;
		}else if (item.type == "modifier.private"){
			isPublic = false;
			continue;
		}

		if (item.type == "definition.assign" || item.type == "definition"){
			let attr = {
				name: item.data[1][0].data,
				type: null,

				upgradeable: false,
				pointer    : false,
				public     : isPublic,
				default    : null,

				line: item.data[0][0].line,
				col : item.data[0][0].col
			};

			// Get type and modifiers
			if (item.data[0][0].data[0] == "@"){
				item.data[0][0].data = item.data[0][0].data.slice(1);
				attr.pointer = true;
			}
			attr.type = item.data[0][0].data;

			// Get default value if it has one
			if (item.type == "definition.assign"){
				attr.default = item.data[3][0];
			}

			struct.attribute.push(attr);
			continue;
		}

		if (item.type == "function"){
			struct.behaviour.push( InterpFunction(item) );
		}
	}

	return struct;
}


module.exports = {
	Function: InterpFunction,
	Class: InterpClass
};
