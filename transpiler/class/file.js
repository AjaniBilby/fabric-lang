const path = require('path');
const fs = require('fs');

const Lexer = require('./../interpreter/lexer.js');

const Directive = require('./directive.js');
const Project = require('./project.js');
const Class = require('./class.js');

class File{
	/**
	 *
	 * @param {Project} owner
	 * @param {String}  filename
	 * @param {Boolean} isRoot
	 * @param {String}  caller - path of the caller
	 */
	constructor(owner, filename, isRoot, importer = "compiler"){
		this.owner  = owner;
		this.path   = filename;
		this.isRoot = isRoot;
		this.error  = false;

		this.shortPath = filename;

		this.directive = [];
		this.class     = [];
		this.library   = [{id: 0, as: "*"}];
		this.expose    = [];

		// Read in data
		let data = {};
		let extension = path.extname(filename);
		if (extension == ".json"){
			console.log('JOSN', filename);
			data = JSON.parse( fs.readFileSync(filename, 'utf8') );
		}else if (extension == ".fab"){
			data = Lexer.Interpret( fs.readFileSync(filename, 'utf8'), filename );
		}else{
			console.error(`Invalid file type ${path.extname(filename)}`);
			console.error(`  importer : ${importer}`);
			console.error(`  filename : ${path.extname(filename)}`);
			process.exit(1);
		}
		if (!data.expose){
			data.expose = [];
		}
		if (!data.class){
			data.class = [];
		}
		if (!data.directive){
			data.directive = [];
		}
		if (!data.import){
			data.import = [];
		}


		for (let item of data.directive){
			this.directive.push(new Directive(this, item));
		}

		for (let item of data.class){
			this.class.push(new Class(this, item));
		}

		for (let item of data.import){
			let loc = path.join(path.dirname(this.path), item.from);
			let id = this.owner.load(loc, this.path);
			this.library.push({id: id, as: item.as, line: item.line || NaN});
		}
		for (let item of data.expose){
			if (item.name.indexOf('.') !== -1){
				console.error(`Invalid exposure of '${item.name}'. You may only expose a class or function from this file`);
				console.error(`  Note: You cannot expose a class' function, instead only the class its self`);
				console.error(`  line: ${item.line}`);
				this.error = true;
				continue;
			}
			if (item.name.indexOf('::') !== -1){
				console.error(`Invalid exposure of '${item.name}'. You cannot expose just a class' function, you must expose the whole class`);
				console.error(`  Note: You cannot expose a class' function, instead only the class its self`);
				console.error(`  line: ${item.line}`);
				this.error = true;
				continue;
			}

			this.expose.push(item.name);
		}
	}

	link(){
		if  (this.owner.rootPath == this.path){
			this.shortPath = path.basename(this.path);
		}else{
			this.shortPath = path.relative(this.owner.rootPath, this.path);
		}

		for (let item of this.directive){
			item.link();
		}
		if (this.error){
			return;
		}

		for (let item of this.class){
			item.link();
		}
		if (this.error){
			return;
		}

		for (let item of this.class){
			item.CircularCheck();
		}
	}
	compile(){
		for (let item of this.directive){
			item.compile();
		}
		for (let item of this.class){
			item.compile();
		}
	}

	GetClassByName(name, history = [], local = true){
		if (history.indexOf(this) != -1){
			return null;
		}
		history.push(this);

		for (let item of this.class){
			if (item.name == name){
				if (false == (local == false && item.exposed == false)){
					return item;
				}
			}
		}

		for (let file of this.owner.files){
			let res = file.GetClassByName(name, history, false);
			if (res !== null){
				return res;
			}
		}

		return null;
	}

	GetFunction(name, sign){
		if ((sign instanceof Signature) == false){
			sign = new Signature(this, sign);
		}
	}

	/**
	 * Get the an object reference by locally defined namespace
	 * @param {String|String[]} name - what is the name of the class/func attempting to be found?
	 * @param {Object} ignore - allows for searching for another object with a name conflict
	 * @param {Array} history - prevents infinite loops by checking if it has already searched here
	 * @param {Bool} local - this is a local name search or is it from another library and requires exposure?
	 */
	get(name, ignore=null, history = [], local=true){
		if (name === null){
			return null;
		}

		// Prevent infinite loops
		if (history.indexOf(this) != -1){
			return null;
		}
		history.push(this);


		if (typeof(name) == "string"){
			name = name.split('.');
		}

		if (name.length == 1){
			name = name[0];

			for (let item of this.directive){
				if (item == ignore){
					continue;
				}
				// This item is hidden form the searcher
				if (item.exposed == false && local == false){
					continue;
				}

				if (item.name == name){
					return item;
				}
			}

			for (let item of this.class){
				if (item == ignore){
					continue;
				}
				// This item is hidden form the searcher
				if (item.exposed == false && local == false){
					continue;
				}

				if (item.name == name){
					return item;
				}
			}

			for (let item of this.library){
				if (item.as == name){
					return this.owner.files[item.id];
				}
				if (item.as == "*"){
					return this.owner.files[item.id].get(name, ignore, history);
				}
			}
		}else{
			for (let item of this.library){
				if (item.as == name[0]){
					return this.owner.files[item.id].get(name.slice(1), ignore, history, false);
				}
			}
		}

		return null;
	}

	getLocal(name){
		for (let item of this.directive){
			if (item.name == name){
				return item;
			}
		}
		for (let item of this.class){
			if (item.name == name){
				return item;
			}
		}

		return null;
	}
}

module.exports = File;
